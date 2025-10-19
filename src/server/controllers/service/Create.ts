/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

import { validation } from '../../shared/middlewares';
import { Knex } from '../../database/knex';
import { ServiceProvider } from '../../database/providers/Services';
import { EServiceCategory, IService } from '../../../types/service';
import { createServiceSchema } from '../../shared/schemas/service';


export const createValidation = validation((getSchema) => ({
  body: getSchema<Omit<IService, 'id' | 'provider_id' | 'status' | 'created_at' | 'updated_at'>>(createServiceSchema),
}));

const serviceProvider = new ServiceProvider(Knex);

export const create = async (req: Request<{}, {}, IService>, res: Response) => {
  try {
    const providerId = (req as any).user?.id;

    const serviceData = {
      provider_id: providerId as string,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category as EServiceCategory,
      duration: req.body.duration,
      price: req.body.price,
    };

    const newService = await serviceProvider.create(serviceData);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Serviço criado com sucesso',
      data: newService,
    });
  } catch (error: any) {
    if (error.message.includes('PROVIDER') ||
      error.message.includes('não encontrado')) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao criar serviço',
    });
  }
};