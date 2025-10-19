/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Knex } from '../../database/knex';
import { AuthProvider } from '../../database/providers/Auth';
import { validation } from '../../shared/middlewares';
import * as yup from 'yup';
import { StatusCodes } from 'http-status-codes';

const authProvider = new AuthProvider(Knex);

interface ILogoutBody {
  refreshToken: string;
}

export const logoutValidation = validation((getSchema) => ({
  body: getSchema<ILogoutBody>(
    yup.object({
      refreshToken: yup.string().required('Refresh token é obrigatório'),
    })
  ),
}));

export const logout = async (
  req: Request<{}, {}, ILogoutBody>,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const { refreshToken } = req.body;

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    await authProvider.logout(userId, refreshToken);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    console.error('Error in logout:', error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao fazer logout',
    });
  }
};