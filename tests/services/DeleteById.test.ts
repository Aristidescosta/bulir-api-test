import { StatusCodes } from 'http-status-codes';
import { testServer } from '../jest.setup';

describe('Delete Service', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';

  it('deve retornar erro 400 se o id for inválido (não UUID)', async () => {
    const response = await testServer
      .delete('/services/1234') // id inválido
      .send();

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors.params.id).toMatch(/UUID válido/i);
  });

  it('deve retornar erro 400 se o id estiver ausente', async () => {
    // supondo que a rota espera /services/:id
    const response = await testServer
      .delete('/services') // sem :id
      .send();

    // dependendo da tua config, pode ser 404 (rota não encontrada)
    // ou 400 se validação for executada antes da rota
    expect([StatusCodes.BAD_REQUEST, StatusCodes.NOT_FOUND]).toContain(response.status);
  });

  it('deve retornar 500 enquanto a funcionalidade não está implementada', async () => {
    const response = await testServer
      .delete(`/services/${validId}`)
      .send();

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.text).toMatch(/Not implemented/i);
  });
});
