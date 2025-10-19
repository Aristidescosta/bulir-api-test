/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

import { validation } from '../../shared/middlewares';
import { paramValidation, TParamProp } from '../../shared/schemas/param';
import { IService } from '../../../types/service';
import { IUpdateService, updateServiceSchema } from '../../shared/schemas/service';
import { Knex } from '../../database/knex';
import { ServiceProvider } from '../../database/providers/Services';


export const updateByIdValidation = validation((getSchema) => ({
  body: getSchema<IUpdateService>(updateServiceSchema),
  params: getSchema<TParamProp>(paramValidation)
}));

const serviceProvider = new ServiceProvider(Knex);

export const updateById = async (req: Request<TParamProp, {}, IService>, res: Response) => {
  try {
    const { id } = req.params;
    const providerId = (req as any).user?.id;

    // Verificar ownership
    const isOwner = await serviceProvider.belongsToProvider(id, providerId);

    if (!isOwner) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Você não tem permissão para atualizar este serviço',
      });
    }

    const updatedService = await serviceProvider.update(id, req.body);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Serviço atualizado com sucesso',
      data: updatedService,
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
      message: 'Erro ao atualizar serviço',
    });
  }
};