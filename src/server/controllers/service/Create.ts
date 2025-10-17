/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

import { bodyValidation, IService } from '../../shared/schemas/service';
import { validation } from '../../shared/middlewares';


export const createValidation = validation((getSchema) => ({
  body: getSchema<IService>(bodyValidation),

}));

export const create = async (req: Request<{}, {}, IService>, res: Response) => {
  try {
    const { name, description } = req.body;

    const newService = {
      id: 'uuid-generated',
      name,
      description,
      status: 'ATIVO',
      created_at: new Date().toISOString(),
    };

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Serviço criado com sucesso',
      data: newService,
    });
  } catch (error) {
    console.error('Error creating service:', error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro interno ao criar serviço',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};