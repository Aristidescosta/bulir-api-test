/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Knex } from '../../database/knex';
import { UserProvider } from '../../database/providers/User';
import { validation } from '../../shared/middlewares';
import * as yup from 'yup';
import { StatusCodes } from 'http-status-codes';
import { EUserStatus, EUserType } from '../../../types/user';

interface IGetAllQuery {
  type?: EUserType;
  status?: EUserStatus;
  page?: number;
  limit?: number;
}

const userProvider = new UserProvider(Knex);

export const getAllValidation = validation((getSchema) => ({
  query: getSchema<IGetAllQuery>(
    yup.object({
      type: yup
        .string()
        .oneOf(Object.values(EUserType), 'Tipo inválido')
        .optional(),

      status: yup
        .string()
        .oneOf(Object.values(EUserStatus), 'Status inválido')
        .optional(),

      page: yup
        .number()
        .integer('Página deve ser um número inteiro')
        .positive('Página deve ser maior que zero')
        .default(1)
        .transform((value) => (isNaN(value) ? 1 : value)),

      limit: yup
        .number()
        .integer('Limite deve ser um número inteiro')
        .positive('Limite deve ser maior que zero')
        .max(100, 'Limite máximo é de 100 itens')
        .default(10)
        .transform((value) => (isNaN(value) ? 10 : value)),
    })
  ),
}));

export const getAll = async (
  req: Request<{}, {}, {}, IGetAllQuery>,
  res: Response
) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    // Buscar usuários
    const users = await userProvider.findAll({
      type: type as EUserType | undefined,
      status: status as EUserStatus | undefined,
      limit,
      offset,
    });

    // Contar total
    const total = await userProvider.count({
      type: type as EUserType | undefined,
      status: status as EUserStatus | undefined,
    });

    // Remover senhas
    const usersWithoutPasswords = users.map(({ password_hash, ...user }) => user);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: usersWithoutPasswords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error getting users:', error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao buscar usuários',
    });
  }
};

