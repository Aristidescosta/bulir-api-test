import { StatusCodes } from 'http-status-codes';
import { testServer } from '../jest.setup';

describe('Services - getById', () => {

  it('deve retornar 400 se o id não for um UUID válido', async () => {
    const response = await testServer.get('/services/123');

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors.params).toHaveProperty('id');
    expect(response.body.errors.params.id).toMatch(/UUID válido/i);
  });

  it('deve retornar 500 e mensagem "Not implemented" se o id for válido', async () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';

    const response = await testServer.get(`/services/${validUUID}`);

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.text).toBe('Not implemented');
  });
});
