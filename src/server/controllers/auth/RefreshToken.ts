/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Knex } from '../../database/knex';
import { AuthProvider } from '../../database/providers/Auth';
import { validation } from '../../shared/middlewares';
import * as yup from 'yup';
import { StatusCodes } from 'http-status-codes';

interface IRefreshBody {
  refreshToken: string;
}

const authProvider = new AuthProvider(Knex);

export const refreshValidation = validation((getSchema) => ({
  body: getSchema<IRefreshBody>(
    yup.object({
      refreshToken: yup.string().required('Refresh token é obrigatório'),
    })
  ),
}));

export const refresh = async (
  req: Request<{}, {}, IRefreshBody>,
  res: Response
) => {
  try {
    const { refreshToken } = req.body;

    const authResponse = await authProvider.refreshAccessToken({ refreshToken });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Token renovado com sucesso',
      data: authResponse,
    });
  } catch (error: any) {
    console.error('Error in refresh:', error);

    if (error.message?.includes('inválido') ||
      error.message?.includes('expirado') ||
      error.message?.includes('não está ativa')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao renovar token',
    });
  }
};