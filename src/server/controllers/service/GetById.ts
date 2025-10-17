/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

import { IService } from '../../shared/schemas/service';
import { validation } from '../../shared/middlewares';
import { paramValidation, TParamProp } from '../../shared/schemas/param';

export const getByIdValidation = validation((getSchema) => ({
  params: getSchema<TParamProp>(paramValidation)
}));

export const getById = async (req: Request<{}, {}, IService>, res: Response) => {
  try {
    console.log(req.params);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Not implemented');
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro interno ao listar o serviço por ID',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};