/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const me = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error in me:', error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao buscar dados do usuário',
    });
  }
};