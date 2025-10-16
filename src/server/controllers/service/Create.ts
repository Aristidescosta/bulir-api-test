import { Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { bodyValidation, IService } from '../../shared/schemas/service';
import * as yup from 'yup';

export const createBodyValidator: RequestHandler = async (req, res, next) => {
  try {
    await bodyValidation.validate(req.body, { abortEarly: false });
    return next();
  } catch (error) {
    const yupError = error as yup.ValidationError;
    const errors: Record<string, string> = {};

    yupError.inner.forEach((err) => {
      if (err.path) {
        errors[err.path] = err.message;
      }
    });

    return res.status(StatusCodes.BAD_REQUEST).json({ errors });
  }
};

export const create = async (req: Request<{}, {}, IService>, res: Response) => {
  console.log('TESTE: ', req.body);
  return res.status(StatusCodes.CREATED).send('Service created successfully');
};