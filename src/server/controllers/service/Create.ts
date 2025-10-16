import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { bodyValidation, IService } from '../../shared/schemas/service';
import * as yup from 'yup';


export const create = async (req: Request<{}, {}, IService>, res: Response) => {
  let validatedData: IService | undefined = undefined;
  try {
    validatedData = await bodyValidation.validate(req.body, { abortEarly: false });
  } catch (error) {
    const yupError = error as yup.ValidationError;
    const validationErrors: Record<string, string> = {};

    yupError.inner.forEach((err) => {
      if (err.path) {
        validationErrors[err.path] = err.message;
      }
    });

    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: validationErrors
    });
  }
  console.log('Creating a new service with data:', validatedData);

  return res.status(StatusCodes.CREATED).send('Service created successfully');
};