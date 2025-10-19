/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

import { validation } from '../../shared/middlewares';
import { paramValidation, TParamProp } from '../../shared/schemas/param';
import { IService } from '../../../types/service';
import { IUpdateService, updateServiceSchema } from '../../shared/schemas/service';


export const updateByIdValidation = validation((getSchema) => ({
  body: getSchema<IUpdateService>(updateServiceSchema),
  params: getSchema<TParamProp>(paramValidation)
}));

export const updateById = async (req: Request<TParamProp, {}, IService>, res: Response) => {
  try {
    console.log(req.body);
    console.log(req.params);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Not implemented');
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro interno ao actualizar serviço',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};