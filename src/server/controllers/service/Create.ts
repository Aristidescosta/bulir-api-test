import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IService } from '../../../types/service';



export const create = (req: Request<{}, {}, IService>, res: Response) => {
  console.log('Creating a new service with data:', req.body);
  return res.status(StatusCodes.CREATED).send('Service created successfully');
};