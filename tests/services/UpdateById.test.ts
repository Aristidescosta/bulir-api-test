import { StatusCodes } from 'http-status-codes';
import { testServer } from '../jest.setup';

describe('Services - updateById', () => {
  const validBody = {
    name: 'Serviço Atualizado',
    description: 'Descrição de teste para atualização',
    category: 'BELEZA',
    duration_minutes: 45,
    price: 1500.25,
    provider_id: '550e8400-e29b-41d4-a716-446655440000',
    status: 'ACTIVE'
  };

  it('deve retornar 400 se o id for inválido', async () => {
    const response = await testServer.put('/services/1234').send({
      name: 'Serviço válido',
      description: 'Descrição válida',
      category: 'BELEZA',
      duration_minutes: 60,
      price: 100,
      provider_id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'ACTIVE',
    });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors.params).toMatchObject({
      id: expect.stringMatching(/UUID válido/i),
    });
  });


  it('deve retornar 500 com mensagem "Not implemented" se id e body forem válidos', async () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';

    const response = await testServer
      .put(`/services/${validUUID}`)
      .send(validBody);

    // Espera que a validação passe e o controller execute:
    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.text).toBe('Not implemented');
  });

});
