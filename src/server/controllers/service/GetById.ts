/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

import { validation } from '../../shared/middlewares';
import { paramValidation, TParamProp } from '../../shared/schemas/param';
import { Knex } from '../../database/knex';
import { ServiceProvider } from '../../database/providers/Services';

export const getByIdValidation = validation((getSchema) => ({
  params: getSchema<TParamProp>(paramValidation)
}));

const serviceProvider = new ServiceProvider(Knex);

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await serviceProvider.findByIdWithProvider(id);

    if (!service) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Serviço não encontrado',
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data: service,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao buscar serviço',
    });
  }
};