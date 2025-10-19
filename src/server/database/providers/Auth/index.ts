/* eslint-disable @typescript-eslint/no-unused-vars */
import { Knex } from 'knex';
import { EUserStatus, IUser } from '../../../../types/user';
import { UserProvider } from '../User';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: Omit<IUser, 'password_hash'>;
  token: string;
  refreshToken: string;
}

export interface IJWTPayload {
  id: string;
  email: string;
  type: string;
  status: string;
}

export interface IRefreshTokenDTO {
  refreshToken: string;
}

export class AuthProvider {
  private readonly userProvider: UserProvider;
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly JWT_REFRESH_EXPIRES_IN: string;

  constructor(private readonly knex: Knex) {
    this.userProvider = new UserProvider(knex);

    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
    this.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
  * Gera um access token JWT
  */
  private generateToken(user: IUser): string {
    const payload: IJWTPayload = {
      id: user.id,
      email: user.email,
      type: user.type,
      status: user.status,
    };

    const options: SignOptions = {
      expiresIn: this.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    };

    return jwt.sign(payload, this.JWT_SECRET as jwt.Secret, options);
  };

  /**
   * Gera um refresh token JWT
   */
  private generateRefreshToken(user: IUser): string {
    const payload: IJWTPayload = {
      id: user.id,
      email: user.email,
      type: user.type,
      status: user.status,
    };

    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  };

  /**
   * Salva refresh token no banco de dados
   */
  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

      await this.knex('refresh_tokens').insert({
        id: this.generateUUID(),
        user_id: userId,
        token: refreshToken,
        expires_at: expiresAt,
        created_at: new Date(),
      });
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  /**
   * Valida se refresh token existe e é válido
   */
  private async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    try {
      const token = await this.knex('refresh_tokens')
        .where({
          user_id: userId,
          token: refreshToken,
          revoked: false,
        })
        .where('expires_at', '>', new Date())
        .first();

      return !!token;
    } catch (error) {
      console.error('Error validating refresh token:', error);
      return false;
    }
  }

  /**
   * Atualiza refresh token (revoga o antigo e cria novo)
   */
  private async updateRefreshToken(
    userId: string,
    oldToken: string,
    newToken: string
  ): Promise<void> {
    try {
      // Revogar token antigo
      await this.knex('refresh_tokens')
        .where({
          user_id: userId,
          token: oldToken,
        })
        .update({
          revoked: true,
          revoked_at: new Date(),
        });

      // Salvar novo token
      await this.saveRefreshToken(userId, newToken);
    } catch (error) {
      console.error('Error updating refresh token:', error);
      throw error;
    }
  }

  /**
   * Gera um novo access token a partir do refresh token
   */
  async refreshAccessToken(data: IRefreshTokenDTO): Promise<IAuthResponse> {
    try {
      const { refreshToken } = data;

      const decoded = jwt.verify(
        refreshToken,
        this.JWT_REFRESH_SECRET
      ) as IJWTPayload;

      const isValid = await this.validateRefreshToken(decoded.id, refreshToken);

      if (!isValid) {
        throw new Error('Refresh token inválido ou expirado');
      }

      const user = await this.userProvider.findById(decoded.id);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      if (user.status !== EUserStatus.ACTIVE) {
        throw new Error('Conta não está ativa');
      }

      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Atualizar refresh token no banco
      await this.updateRefreshToken(user.id, refreshToken, newRefreshToken);

      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error('Error in AuthProvider.refreshAccessToken:', error);
      throw error;
    }
  }

  /**
   * Revoga (invalida) um refresh token
   */
  private async revokeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      await this.knex('refresh_tokens')
        .where({
          user_id: userId,
          token: refreshToken,
        })
        .update({
          revoked: true,
          revoked_at: new Date(),
        });
    } catch (error) {
      console.error('Error revoking refresh token:', error);
      throw error;
    }
  }

  /**
   * Remove todos os refresh tokens expirados
   */
  async cleanExpiredTokens(): Promise<number> {
    try {
      const deleted = await this.knex('refresh_tokens')
        .where('expires_at', '<', new Date())
        .orWhere('revoked', true)
        .delete();

      return deleted;
    } catch (error) {
      console.error('Error cleaning expired tokens:', error);
      throw error;
    }
  }

  /**
   * Revoga todos os tokens de um usuário (útil para logout de todos dispositivos)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      await this.knex('refresh_tokens')
        .where({ user_id: userId })
        .update({
          revoked: true,
          revoked_at: new Date(),
        });
    } catch (error) {
      console.error('Error revoking all user tokens:', error);
      throw error;
    }
  }

  /**
   * Gera UUID (compatível com SQLite)
   */
  private generateUUID(): string {
    return uuidv4();
  }

  /**
   * Verifica se o access token é válido
   */
  verifyToken(token: string): IJWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as IJWTPayload;
      return decoded;
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  /**
   * Faz login do usuário
   */
  async login(data: ILoginDTO): Promise<IAuthResponse> {
    try {
      const { email, password } = data;

      const user = await this.userProvider.findByEmail(email);

      if (!user) {
        throw new Error('Email ou senha incorretos');
      }

      if (user.status === EUserStatus.INACTIVE) {
        throw new Error('Conta inativa. Entre em contato com o suporte');
      }

      if (user.status === EUserStatus.SUSPENDED) {
        throw new Error('Conta suspensa. Entre em contato com o suporte');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        throw new Error('Email ou senha incorretos');
      }

      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      await this.saveRefreshToken(user.id, refreshToken);

      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
        refreshToken,
      };
    } catch (error) {
      console.error('Error in AuthProvider.login:', error);
      throw error;
    }
  };

  /**
   * Faz logout do usuário (invalida refresh token)
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    try {
      await this.revokeRefreshToken(userId, refreshToken);
    } catch (error) {
      console.error('Error in AuthProvider.logout:', error);
      throw error;
    }
  }
}