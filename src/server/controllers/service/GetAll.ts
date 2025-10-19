/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

import { queryValidation, TQueryParams } from '../../shared/schemas/querySchema';
import { validation } from '../../shared/middlewares';
import { IService } from '../../../types/service';

export const getAllValidation = validation((getSchema) => ({
  query: getSchema<TQueryParams>(queryValidation)
}));

export const getAll = async (req: Request<{}, {}, IService>, res: Response) => {
  try {
    console.log(req.query);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Not implemented');
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro interno ao listar os serviços',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};