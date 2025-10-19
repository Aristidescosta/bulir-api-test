/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Knex } from '../../database/knex';
import { validation } from '../../shared/middlewares';
import { IUpdateUser, updateUserSchema } from '../../shared/schemas/user';
import { StatusCodes } from 'http-status-codes';
import { UserProvider } from '../../database/providers/User';
import { paramValidation, TParamProp } from '../../shared/schemas/param';

export const updateByIdValidation = validation((getSchema) => ({
  body: getSchema<IUpdateUser>(updateUserSchema),
  params: getSchema<TParamProp>(paramValidation)
}));

const userProvider = new UserProvider(Knex);

export const updateById = async (
  req: Request<TParamProp, {}, IUpdateUser>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

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
        message: 'Você não tem permissão para atualizar este usuário',
      });
    } */

    const updatedUser = await userProvider.update(id, updateData);

    const { password_hash, ...userWithoutPassword } = updatedUser;

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: userWithoutPassword,
    });

  } catch (error: any) {
    console.error('Error updating user:', error);

    if (error.message?.includes('já está em uso')) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao atualizar usuário',
    });
  }
};