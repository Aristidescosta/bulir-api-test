/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Knex } from '../../database/knex';
import { UserProvider } from '../../database/providers/User';
import { validation } from '../../shared/middlewares';
import * as yup from 'yup';
import { StatusCodes } from 'http-status-codes';

export const getByEmailValidation = validation((getSchema) => ({
  params: getSchema<{ email: string }>(
    yup.object({
      email: yup.string().email('Email inválido').required('Email é obrigatório'),
    })
  ),
}));

const userProvider = new UserProvider(Knex);

export const getByEmail = async (
  req: Request<{ email: string }>,
  res: Response
) => {
  try {
    const { email } = req.params;

    const user = await userProvider.findByEmail(email);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    const { password_hash, ...userWithoutPassword } = user;

    return res.status(StatusCodes.OK).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error in getByEmail:', error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao buscar usuário por email',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};
