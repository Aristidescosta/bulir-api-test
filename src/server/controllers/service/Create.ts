import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

import { bodyValidation, IService } from '../../shared/schemas/service';
import { validation } from '../../shared/middlewares';


export const createValidation = validation((getSchema) => ({
  body: getSchema<IService>(bodyValidation),

}));


export const create = async (req: Request<{}, {}, IService>, res: Response) => {
  return res.status(StatusCodes.CREATED).send('Service created successfully');
};