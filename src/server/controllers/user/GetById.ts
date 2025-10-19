/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Knex } from '../../database/knex';
import { UserProvider } from '../../database/providers/User';
import { validation } from '../../shared/middlewares';
import { paramValidation, TParamProp } from '../../shared/schemas/param';
import { StatusCodes } from 'http-status-codes';

export const getByIdValidation = validation((getSchema) => ({
  params: getSchema<TParamProp>(paramValidation)
}));

const userProvider = new UserProvider(Knex);

export const getById = async (
  req: Request<TParamProp>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const user = await userProvider.findById(id);

    // Verificar se usuário existe
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    /* const authenticatedUserId = (req as any).user?.id;
    const isAdmin = (req as any).user?.isAdmin;

    if (!isAdmin && authenticatedUserId !== id) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Você não tem permissão para acessar este usuário',
      });
    } */

    const { password_hash, ...userWithoutPassword } = user;

    return res.status(StatusCodes.OK).json({
      success: true,
      data: userWithoutPassword,
    });

  } catch (error) {
    console.error('Error in getById:', error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};