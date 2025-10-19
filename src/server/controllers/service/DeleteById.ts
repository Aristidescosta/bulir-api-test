/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

import { validation } from '../../shared/middlewares';
import { paramValidation, TParamProp } from '../../shared/schemas/param';
import { Knex } from '../../database/knex';
import { ServiceProvider } from '../../database/providers/Services';

export const deleteByIdValidation = validation((getSchema) => ({
  params: getSchema<TParamProp>(paramValidation)
}));

const serviceProvider = new ServiceProvider(Knex);

export const deleteById = async (req: Request<TParamProp, {}, {}>, res: Response) => {
  try {
    const { id } = req.params;
    const providerId = (req as any).user?.id;

    const isOwner = await serviceProvider.belongsToProvider(id, providerId);

    if (!isOwner) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Você não tem permissão para deletar este serviço',
      });
    }

    const deletedService = await serviceProvider.delete(id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Serviço desativado com sucesso',
      data: deletedService,
    });
  } catch (error: any) {
    if (error.message === 'Serviço não encontrado') {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao deletar serviço',
    });
  }
};