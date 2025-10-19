/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

import { validation } from '../../shared/middlewares';
import { paramValidation, TParamProp } from '../../shared/schemas/param';
import { Knex } from '../../database/knex';
import { UserProvider } from '../../database/providers/User';
import { EUserStatus } from '../../../types/user';

export const deleteByIdValidation = validation((getSchema) => ({
  params: getSchema<TParamProp>(paramValidation)
}));

const userProvider = new UserProvider(Knex);

export const deleteById = async (
  req: Request<TParamProp>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const userExists = await userProvider.findById(id);
    if (!userExists) {
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
        message: 'Você não tem permissão para deletar este usuário',
      });
    } */

    const deactivatedUser = await userProvider.updateStatus(id, EUserStatus.INACTIVE);


    const { password_hash, ...userWithoutPassword } = deactivatedUser;

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Usuário desativado com sucesso',
      data: userWithoutPassword,
    });

  } catch (error) {
    console.error('Error deleting user:', error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao desativar usuário',
    });
  }
};