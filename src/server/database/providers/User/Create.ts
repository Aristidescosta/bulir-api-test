/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Knex } from 'knex';
import bcrypt from 'bcrypt';
import { ETableNames } from '../../ETableNames';
import { EUserStatus, EUserType, IUser } from '../../../../types/user';
import { randomUUID } from 'crypto';

export interface ICreateUserDTO {
  name: string;
  email: string;
  nif: string;
  password: string;
  phone?: string | null | undefined;
  type: EUserType;
}

export class UserProvider {
  constructor(private readonly knex: Knex) { }

  /**
   * Verifica se email já está em uso
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await this.knex(ETableNames.user)
      .where({ email })
      .first();

    return !!user;
  }

  /**
   * Verifica se NIF já está em uso
   */
  async nifExists(nif: string): Promise<boolean> {
    const user = await this.knex(ETableNames.user)
      .where({ nif })
      .first();

    return !!user;
  }

  /**
   * Cria um novo usuário
   */
  async create(data: ICreateUserDTO): Promise<IUser> {
    try {
      const emailInUse = await this.emailExists(data.email);
      if (emailInUse) {
        throw new Error('Email já está em uso');
      }

      const nifInUse = await this.nifExists(data.nif);
      if (nifInUse) {
        throw new Error('NIF já está em uso');
      }

      const saltRounds = 10;
      const password = await bcrypt.hash(data.password, saltRounds);

      const userData = {
        id: randomUUID(),
        name: data.name,
        email: data.email.toLowerCase().trim(),
        nif: data.nif,
        password_hash: password,
        phone: data.phone || null,
        type: data.type,
        status: EUserStatus.ACTIVE,
      };

      const [insertedUser] = await this.knex(ETableNames.user)
        .insert(userData)
        .returning('*');

      const { id, password_hash, ...rest } = insertedUser;

      return rest as IUser;
    } catch (error) {
      console.error('Error in UserProvider.create:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por ID
   */
  async findById(userId: string): Promise<Omit<IUser, 'id'> | null> {
    try {
      const user = await this.knex(ETableNames.user)
        .where('id', userId)
        .first();
      /* const { id, ...currentUser  } = user;  */

      return user || null;
    } catch (error) {
      console.error('Error in UserProvider.findById:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await this.knex(ETableNames.user)
        .where({ email: email.toLowerCase().trim() })
        .first();

      return user || null;
    } catch (error) {
      console.error('Error in UserProvider.findByEmail:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por NIF
   */
  async findByNif(nif: string): Promise<IUser | null> {
    try {
      const user = await this.knex(ETableNames.user)
        .where({ nif })
        .first();

      return user || null;
    } catch (error) {
      console.error('Error in UserProvider.findByNif:', error);
      throw error;
    }
  }

  /**
   * Lista todos os usuários com filtros opcionais
   */
  async findAll(filters?: {
    type?: EUserType;
    status?: EUserStatus;
    limit?: number;
    offset?: number;
  }): Promise<IUser[]> {
    try {
      let query = this.knex(ETableNames.user).select('*');

      if (filters?.type) {
        query = query.where({ type: filters.type });
      }

      if (filters?.status) {
        query = query.where({ status: filters.status });
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.offset(filters.offset);
      }

      query = query.orderBy('created_at', 'desc');

      const users = await query;
      return users as IUser[];
    } catch (error) {
      console.error('Error in UserProvider.findAll:', error);
      throw error;
    }
  }

  /**
   * Atualiza dados do usuário
   */
  async update(id: string, data: Partial<ICreateUserDTO>): Promise<IUser> {
    try {
      const updateData: any = {
        updated_at: this.knex.fn.now(),
      };

      if (data.name) updateData.name = data.name;
      if (data.email) {
        // Verificar se email já existe (exceto para o próprio usuário)
        const emailInUse = await this.knex(ETableNames.user)
          .where({ email: data.email })
          .whereNot({ id })
          .first();

        if (emailInUse) {
          throw new Error('Email já está em uso por outro usuário');
        }
        updateData.email = data.email.toLowerCase().trim();
      }
      if (data.nif) {
        // Verificar se NIF já existe (exceto para o próprio usuário)
        const nifInUse = await this.knex(ETableNames.user)
          .where({ nif: data.nif })
          .whereNot({ id })
          .first();

        if (nifInUse) {
          throw new Error('NIF já está em uso por outro usuário');
        }
        updateData.nif = data.nif;
      }
      if (data.phone !== undefined) updateData.phone = data.phone || null;
      if (data.password) {
        updateData.password_hash = await bcrypt.hash(data.password, 10);
      }
      if (data.type) updateData.type = data.type;

      const [updatedUser] = await this.knex(ETableNames.user)
        .where({ id })
        .update(updateData)
        .returning('*');

      if (!updatedUser) {
        throw new Error('Usuário não encontrado');
      }

      return updatedUser as IUser;
    } catch (error) {
      console.error('Error in UserProvider.update:', error);
      throw error;
    }
  }

  /**
   * Atualiza status do usuário
   */
  async updateStatus(id: string, status: EUserStatus): Promise<IUser> {
    try {
      const [updatedUser] = await this.knex(ETableNames.user)
        .where({ id })
        .update({
          status,
          updated_at: this.knex.fn.now(),
        })
        .returning('*');

      if (!updatedUser) {
        throw new Error('Usuário não encontrado');
      }

      return updatedUser as IUser;
    } catch (error) {
      console.error('Error in UserProvider.updateStatus:', error);
      throw error;
    }
  }

  /**
   * Valida senha do usuário
   */
  async validatePassword(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.findByEmail(email);

      if (!user) {
        return false;
      }

      return await bcrypt.compare(password, user.password_hash);
    } catch (error) {
      console.error('Error in UserProvider.validatePassword:', error);
      throw error;
    }
  }

  /**
   * Conta total de usuários com filtros opcionais
   */
  async count(filters?: {
    type?: EUserType;
    status?: EUserStatus;
  }): Promise<number> {
    try {
      let query = this.knex(ETableNames.user).count('* as total');

      if (filters?.type) {
        query = query.where({ type: filters.type });
      }

      if (filters?.status) {
        query = query.where({ status: filters.status });
      }

      const [result] = await query;
      // result can be an object like { total: '42' } or a string (depends on DB/driver)
      const total = typeof result === 'string'
        ? Number(result)
        : Number((result as any).total);
      return total;
    } catch (error) {
      console.error('Error in UserProvider.count:', error);
      throw error;
    }
  }
}