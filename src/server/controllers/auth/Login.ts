/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Knex } from '../../database/knex';
import { AuthProvider } from '../../database/providers/Auth';
import { validation } from '../../shared/middlewares';
import * as yup from 'yup';
import { StatusCodes } from 'http-status-codes';

const authProvider = new AuthProvider(Knex);

interface ILoginBody {
  email: string;
  password: string;
}

export const loginValidation = validation((getSchema) => ({
  body: getSchema<ILoginBody>(
    yup.object({
      email: yup
        .string()
        .required('Email é obrigatório')
        .email('Email inválido')
        .lowercase()
        .trim(),
      password: yup
        .string()
        .required('Senha é obrigatória'),
    })
  ),
}));

export const login = async (
  req: Request<{}, {}, ILoginBody>,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const authResponse = await authProvider.login({ email, password });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: authResponse,
    });
  } catch (error: any) {
    console.error('Error in login:', error);

    if (error.message?.includes('incorretos') ||
      error.message?.includes('inativa') ||
      error.message?.includes('suspensa')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao fazer login',
    });
  }
};