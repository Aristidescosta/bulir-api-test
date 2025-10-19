/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { testServer } from '../jest.setup';
import { Knex } from '../../src/server/database/knex';

describe('Auth - Login', () => {
  let testUser: any;

  beforeEach(async () => {
    await Knex('refresh_tokens').del();
    await Knex('users').del();

    const response = await testServer.post('/api/users').send({
      name: 'João Silva',
      email: 'joao@example.com',
      nif: '006431196LA048',
      password: 'Senha123',
      phone: '+244912345678',
      type: 'CUSTOMER',
    });

    testUser = response.body.data;
  });

  it('should login with valid credentials', async () => {
    const response = await testServer
      .post('/api/auth/login')
      .send({
        email: 'joao@example.com',
        password: 'Senha123',
      });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Login realizado com sucesso');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('refreshToken');
    expect(response.body.data.user).not.toHaveProperty('password_hash');
    expect(response.body.data.user.email).toBe('joao@example.com');
  });

  it('should fail login with incorrect email', async () => {
    const response = await testServer
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'Senha123',
      });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toContain('incorretos');
  });

  it('should fail login with incorrect password', async () => {
    const response = await testServer
      .post('/api/auth/login')
      .send({
        email: 'joao@example.com',
        password: 'WrongPassword123',
      });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toContain('incorretos');
  });

  it('should fail login without email', async () => {
    const response = await testServer
      .post('/api/auth/login')
      .send({
        password: 'Senha123',
      });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).not.toHaveProperty('success', false);
    expect(response.body.errors.body).toHaveProperty('email', 'Email é obrigatório');
  });

  it('should fail login without password', async () => {
    const response = await testServer
      .post('/api/auth/login')
      .send({
        email: 'joao@example.com',
      });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).not.toHaveProperty('success', false);
    expect(response.body.errors.body).toHaveProperty('password', 'Senha é obrigatória');
  });

  it('should fail login with invalid email format', async () => {
    const response = await testServer
      .post('/api/auth/login')
      .send({
        email: 'invalid-email',
        password: 'Senha123',
      });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should login with email in different case', async () => {
    const response = await testServer
      .post('/api/auth/login')
      .send({
        email: 'JOAO@EXAMPLE.COM',
        password: 'Senha123',
      });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.data.user.email).toBe('joao@example.com');
  });

  it('should create refresh token in database on login', async () => {
    const response = await testServer
      .post('/api/auth/login')
      .send({
        email: 'joao@example.com',
        password: 'Senha123',
      });

    console.log('Response: ', response.body, testUser);

    // Verificar se refresh token foi salvo
    const tokens = await Knex('refresh_tokens')
      .where({ user_id: testUser.id })
      .select('*');

    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[0]).toHaveProperty('token');
    expect(tokens[0]).toHaveProperty('revoked', 0);
  });
});

describe('Auth - Refresh Token', () => {
  let testUser: any;
  let authTokens: any;

  beforeEach(async () => {
    await Knex('refresh_tokens').del();
    await Knex('users').del();

    const userResponse = await testServer.post('/api/users').send({
      name: 'João Silva',
      email: 'joao@example.com',
      nif: '006431196LA048',
      password: 'Senha123',
      type: 'CUSTOMER',
    });
    testUser = userResponse.body.data;

    const loginResponse = await testServer.post('/api/auth/login').send({
      email: 'joao@example.com',
      password: 'Senha123',
    });

    authTokens = loginResponse.body.data;
  });

  /* it('should refresh access token with valid refresh token', async () => {

    console.log('REFRESH TOKEN: ', authTokens.refreshToken);


    const response = await testServer
      .post('/api/auth/refresh')
      .send({
        refreshToken: authTokens.refreshToken,
      });

    console.log('RESPONSE: ', response.body);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('refreshToken');
    expect(response.body.data.token).not.toBe(authTokens.token);
    expect(response.body.data.refreshToken).not.toBe(authTokens.refreshToken);
  }); */

  it('should fail refresh with invalid token', async () => {
    const response = await testServer
      .post('/api/auth/refresh')
      .send({
        refreshToken: 'invalid-token',
      });

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toHaveProperty('success', false);
  });

  it('should fail refresh without token', async () => {
    const response = await testServer
      .post('/api/auth/refresh')
      .send({});

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  /* it('should revoke old refresh token after refresh', async () => {
    await testServer.post('/api/auth/refresh').send({
      refreshToken: authTokens.refreshToken,
    });

    const oldToken = await Knex('refresh_tokens')
      .where({ token: authTokens.refreshToken })
      .first();

    expect(oldToken).toHaveProperty('revoked', true);
    expect(oldToken.revoked_at).not.toBeNull();
  }); */

  /* it('should not allow refresh with revoked token', async () => {
    
    await testServer.post('/api/auth/refresh').send({
      refreshToken: authTokens.refreshToken,
    });

    const response = await testServer
      .post('/api/auth/refresh')
      .send({
        refreshToken: authTokens.refreshToken,
      });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  }); */

  it('should fail refresh with inactive user', async () => {
    // Desativar usuário
    await testServer.delete(`/api/users/${testUser.id}`);

    const response = await testServer
      .post('/api/auth/refresh')
      .send({
        refreshToken: authTokens.refreshToken,
      });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });
});

describe('Auth - Logout', () => {
  let testUser: any;
  let authTokens: any;

  beforeEach(async () => {
    await Knex('refresh_tokens').del();
    await Knex('users').del();

    // Criar usuário e fazer login
    await testServer.post('/api/users').send({
      name: 'João Silva',
      email: 'joao@example.com',
      nif: '006431196LA048',
      password: 'Senha123',
      type: 'CUSTOMER',
    });

    const loginResponse = await testServer.post('/api/auth/login').send({
      email: 'joao@example.com',
      password: 'Senha123',
    });

    testUser = loginResponse.body.data.user;
    authTokens = loginResponse.body.data;
  });

  it('should logout successfully', async () => {
    const response = await testServer
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${authTokens.token}`)
      .send({
        refreshToken: authTokens.refreshToken,
      });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.message).toContain('Logout realizado com sucesso');
  });

  it('should revoke refresh token on logout', async () => {
    await testServer
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${authTokens.token}`)
      .send({
        refreshToken: authTokens.refreshToken,
      });

    // Verificar que token foi revogado
    const token = await Knex('refresh_tokens')
      .where({ token: authTokens.refreshToken })
      .first();

    expect(token).toHaveProperty('revoked', 1);
  });

  it('should fail logout without authentication', async () => {
    const response = await testServer
      .post('/api/auth/logout')
      .send({
        refreshToken: authTokens.refreshToken,
      });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should fail logout without refresh token', async () => {
    const response = await testServer
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${authTokens.token}`)
      .send({});

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should not allow refresh after logout', async () => {
    // Fazer logout
    await testServer
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${authTokens.token}`)
      .send({
        refreshToken: authTokens.refreshToken,
      });

    // Tentar fazer refresh
    const response = await testServer
      .post('/api/auth/refresh')
      .send({
        refreshToken: authTokens.refreshToken,
      });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });
});

describe('Auth - Me (Current User)', () => {
  let testUser: any;
  let authTokens: any;

  beforeEach(async () => {
    await Knex('refresh_tokens').del();
    await Knex('users').del();

    // Criar usuário e fazer login
    await testServer.post('/api/users').send({
      name: 'João Silva',
      email: 'joao@example.com',
      nif: '006431196LA048',
      password: 'Senha123',
      type: 'CUSTOMER',
    });

    const loginResponse = await testServer.post('/api/auth/login').send({
      email: 'joao@example.com',
      password: 'Senha123',
    });

    testUser = loginResponse.body.data.user;
    authTokens = loginResponse.body.data;
  });

  it('should get current user data', async () => {
    const response = await testServer
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authTokens.token}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('id', testUser.id);
    expect(response.body.data).toHaveProperty('email', 'joao@example.com');
  });

  it('should fail without authentication', async () => {
    const response = await testServer.get('/api/auth/me');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should fail with invalid token', async () => {
    const response = await testServer
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should fail with malformed authorization header', async () => {
    const response = await testServer
      .get('/api/auth/me')
      .set('Authorization', authTokens.token); // Sem "Bearer "

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
  });
});

/* describe('Auth - Integration Flow', () => {
  beforeEach(async () => {
    await Knex('refresh_tokens').del();
    await Knex('users').del();
  });

  it('should complete full auth flow', async () => {
    // 1. Criar usuário
    const createResponse = await testServer.post('/api/users').send({
      name: 'João Silva',
      email: 'joao@example.com',
      nif: '006431196LA048',
      password: 'Senha123',
      type: 'CUSTOMER',
    });
    expect(createResponse.status).toBe(StatusCodes.CREATED);

    // 2. Fazer login
    const loginResponse = await testServer.post('/api/auth/login').send({
      email: 'joao@example.com',
      password: 'Senha123',
    });
    expect(loginResponse.status).toBe(StatusCodes.OK);
    const { token, refreshToken } = loginResponse.body.data;

    const meResponse = await testServer
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meResponse.status).toBe(StatusCodes.OK);

    const refreshResponse = await testServer
      .post('/api/auth/refresh')
      .send({ refreshToken });
    expect(refreshResponse.status).toBe(StatusCodes.OK);
    const newToken = refreshResponse.body.data.token;
    const newRefreshToken = refreshResponse.body.data.refreshToken;

    const meResponse2 = await testServer
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${newToken}`);
    expect(meResponse2.status).toBe(StatusCodes.OK);

    const logoutResponse = await testServer
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${newToken}`)
      .send({ refreshToken: newRefreshToken });
    expect(logoutResponse.status).toBe(StatusCodes.OK);

    const meResponse3 = await testServer
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${newToken}`);
    expect(meResponse3.status).toBe(StatusCodes.OK);

   const refreshResponse2 = await testServer
      .post('/api/auth/refresh')
      .send({ refreshToken: newRefreshToken });
    expect(refreshResponse2.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should handle multiple simultaneous logins', async () => {
    // Criar usuário
    await testServer.post('/api/users').send({
      name: 'João Silva',
      email: 'joao@example.com',
      nif: '123456789',
      password: 'Senha123',
      type: 'CUSTOMER',
    });

    // Login 1 (dispositivo 1)
    const login1 = await testServer.post('/api/auth/login').send({
      email: 'joao@example.com',
      password: 'Senha123',
    });

    // Login 2 (dispositivo 2)
    const login2 = await testServer.post('/api/auth/login').send({
      email: 'joao@example.com',
      password: 'Senha123',
    });

    // Ambos devem funcionar
    expect(login1.status).toBe(StatusCodes.OK);
    expect(login2.status).toBe(StatusCodes.OK);

    // Verificar múltiplos refresh tokens no banco
    const userId = login1.body.data.user.id;
    const tokens = await Knex('refresh_tokens')
      .where({ user_id: userId, revoked: false });

    expect(tokens.length).toBe(2);
  });

  it('should maintain security after password change', async () => {
    // Criar usuário e fazer login
    const createResponse = await testServer.post('/api/users').send({
      name: 'João Silva',
      email: 'joao@example.com',
      nif: '123456789',
      password: 'Senha123',
      type: 'CUSTOMER',
    });
    const userId = createResponse.body.data.id;

    const loginResponse = await testServer.post('/api/auth/login').send({
      email: 'joao@example.com',
      password: 'Senha123',
    });
    const { token } = loginResponse.body.data;

    // Alterar senha
    await testServer
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: 'NovaSenha456',
      });

    // Login com senha antiga deve falhar
    const oldPasswordLogin = await testServer.post('/api/auth/login').send({
      email: 'joao@example.com',
      password: 'Senha123',
    });
    expect(oldPasswordLogin.status).toBe(StatusCodes.UNAUTHORIZED);

    // Login com nova senha deve funcionar
    const newPasswordLogin = await testServer.post('/api/auth/login').send({
      email: 'joao@example.com',
      password: 'NovaSenha456',
    });
    expect(newPasswordLogin.status).toBe(StatusCodes.OK);
  });
}); */