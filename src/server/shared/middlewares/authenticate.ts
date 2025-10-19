/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Knex } from '../../database/knex';
import { AuthProvider } from '../../database/providers/Auth';

const authProvider = new AuthProvider(Knex);

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Token não fornecido',
      });
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Token mal formatado',
      });
    }

    const decoded = authProvider.verifyToken(token);
    (req as any).user = decoded;

    next();
  } catch (error: any) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: error.message || 'Token inválido',
    });
  }
};