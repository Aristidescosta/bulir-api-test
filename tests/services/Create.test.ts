/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import { testServer } from '../jest.setup';

describe('Create Service', () => {
  const validBody = {
    name: 'Corte de Cabelo Masculino',
    description: 'Serviço profissional de corte de cabelo masculino moderno e clássico.',
    category: 'BELEZA',
    duration_minutes: 60,
    price: 2500.50,
    provider_id: '550e8400-e29b-41d4-a716-446655440000',
    status: 'ACTIVE'
  };

  it('deve criar um serviço com sucesso (status 201)', async () => {
    const response = await testServer
      .post('/services')
      .send(validBody);

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Serviço criado com sucesso');
    expect(response.body.data).toMatchObject({
      name: validBody.name,
      description: validBody.description,
      status: 'ATIVO'
    });
  });

  it('deve falhar ao tentar criar sem nome', async () => {
    const { name, ...invalidBody } = validBody;
    const response = await testServer
      .post('/services')
      .send(invalidBody);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors.body.name).toMatch(/Nome do serviço é obrigatório/i);
  });

  it('deve falhar com categoria inválida', async () => {
    const response = await testServer
      .post('/services')
      .send({ ...validBody, category: 'INVALIDA' });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.errors.body.category).toMatch(/Categoria deve ser uma das/i);
  });

  it('deve falhar quando o preço tem mais de 2 casas decimais', async () => {
    const response = await testServer
      .post('/services')
      .send({ ...validBody, price: 12.345 });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.errors.body.price).toMatch(/2 casas decimais/i);
  });

  it('deve falhar quando o provider_id não é um UUID válido', async () => {
    const response = await testServer
      .post('/services')
      .send({ ...validBody, provider_id: '1234' });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.errors.body.provider_id).toMatch(/UUID válido/i);
  });
});
