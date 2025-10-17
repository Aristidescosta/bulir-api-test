import { StatusCodes } from 'http-status-codes';
import { testServer } from '../jest.setup';

describe('Get All Services', () => {
  it('deve retornar erro 400 se o parâmetro page for inválido', async () => {
    const response = await testServer
      .get('/services')
      .query({ page: 'abc' }); // page inválido (não é número)

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors.query.page).toMatch(/Página deve ser um número/i);
  });

  it('deve retornar erro 400 se o parâmetro limit for negativo', async () => {
    const response = await testServer
      .get('/services')
      .query({ limit: -5 }); // limit negativo

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.errors.query.limit).toMatch(/maior que zero/i);
  });

  it('deve retornar erro 400 se o filtro for muito longo', async () => {
    const longFilter = 'a'.repeat(101);
    const response = await testServer
      .get('/services')
      .query({ filter: longFilter });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.errors.query.filter).toMatch(/máximo 100 caracteres/i);
  });

  it('deve retornar 500 enquanto a funcionalidade não está implementada', async () => {
    const response = await testServer
      .get('/services')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.text).toMatch(/Not implemented/i);
  });
});
