/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';

type TProperty = 'body' | 'header' | 'params' | 'query';
type TGetSchema = <T extends yup.Maybe<yup.AnyObject>>(schema: yup.ObjectSchema<T>) => yup.ObjectSchema<T>;

type TAllSchemas = Record<TProperty, yup.ObjectSchema<any>>;
type TGetAllSchemas = (getSchema: TGetSchema) => Partial<TAllSchemas>;

type TValidation = (getAllSchemas: TGetAllSchemas) => RequestHandler;

export const validation: TValidation = (getAllSchemas) => async (req, res, next) => {

  const schemas = getAllSchemas((schema) => schema);
  const errorsResult: Record<string, Record<string, string>> = {};

  Object.entries(schemas).forEach(([key, schema]) => {
    try {
      schema.validateSync(req[key as TProperty], { abortEarly: false });
    } catch (error) {
      const yupError = error as yup.ValidationError;
      const errors: Record<string, string> = {};

      yupError.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });

      errorsResult[key] = errors;
    }
  });
  if (Object.entries(errorsResult).length === 0)
    return next();
  return res.status(StatusCodes.BAD_REQUEST).json({ errors: errorsResult });
};