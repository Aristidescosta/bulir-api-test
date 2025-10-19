import { StatusCodes } from 'http-status-codes';
import { testServer } from '../jest.setup';
import { Knex } from '../../src/server/database/knex';
describe('Users - Create', () => {
  beforeEach(async () => {
    await Knex('users').del();
  });

  it('should create a new customer user', async () => {
    const response = await testServer
      .post('/api/users')
      .send({
        name: 'João Silva',
        email: 'joao@example.com',
        nif: '006431196LA048',
        password: 'Senha123',
        phone: '+244912345678',
        type: 'CUSTOMER',
      });

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Usuário criado com sucesso');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('name', 'João Silva');
    expect(response.body.data).toHaveProperty('email', 'joao@example.com');
    expect(response.body.data).toHaveProperty('type', 'CUSTOMER');
    expect(response.body.data).not.toHaveProperty('password_hash');
  });

  it('should create a new provider user', async () => {
    const response = await testServer
      .post('/api/users')
      .send({
        name: 'Maria Santos',
        email: 'maria@example.com',
        nif: '006431196LA048',
        password: 'Senha123',
        type: 'PROVIDER',
      });

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body.data).toHaveProperty('type', 'PROVIDER');
  });

  it('should fail to create user without required fields', async () => {
    const response = await testServer
      .post('/api/users')
      .send({
        name: 'João',
        email: 'joao@example.com',
      });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).not.toHaveProperty('success');
    expect(response.body.errors.body).toHaveProperty('nif', 'NIF é obrigatório');
    expect(response.body.errors.body).toHaveProperty('password', 'Senha é obrigatória');
    expect(response.body.errors.body).toHaveProperty('type', 'Tipo de usuário é obrigatório');
  });

  it('should fail to create user with invalid email', async () => {
    const response = await testServer
      .post('/api/users')
      .send({
        name: 'João Silva',
        email: 'invalid-email',
        nif: '006431196LA048',
        password: 'Senha123',
        type: 'CUSTOMER',
      });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should fail to create user with invalid NIF', async () => {
    const response = await testServer
      .post('/api/users')
      .send({
        name: 'João Silva',
        email: 'joao@example.com',
        nif: '12345',
        password: 'Senha123',
        type: 'CUSTOMER',
      });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should fail to create user with weak password', async () => {
    const response = await testServer
      .post('/api/users')
      .send({
        name: 'João Silva',
        email: 'joao@example.com',
        nif: '006431196LA048',
        password: 'senha',
        type: 'CUSTOMER',
      });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should fail to create user with duplicate email', async () => {
    await testServer.post('/api/users').send({
      name: 'João Silva',
      email: 'joao@example.com',
      nif: '006431196LA041',
      password: 'Senha123',
      type: 'CUSTOMER',
    });

    const response = await testServer.post('/api/users').send({
      name: 'Maria Santos',
      email: 'joao@example.com',
      nif: '006431196LA048',
      password: 'Senha123',
      type: 'CUSTOMER',
    });

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body).toHaveProperty('message', 'Email já está em uso');
  });

  it('should fail to create user with duplicate NIF', async () => {
    await testServer.post('/api/users').send({
      name: 'João Silva',
      email: 'joao@example.com',
      nif: '006431196LA048',
      password: 'Senha123',
      type: 'CUSTOMER',
    });

    const response = await testServer.post('/api/users').send({
      name: 'Maria Santos',
      email: 'maria@example.com',
      nif: '006431196LA048',
      password: 'Senha123',
      type: 'CUSTOMER',
    });

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body).toHaveProperty('message', 'NIF já está em uso');
  });

  it('should fail to create user with invalid type', async () => {
    const response = await testServer
      .post('/api/users')
      .send({
        name: 'João Silva',
        email: 'joao@example.com',
        nif: '006431196LA048',
        password: 'Senha123',
        type: 'INVALID_TYPE',
      });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
}); 