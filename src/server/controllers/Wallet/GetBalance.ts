/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { WalletProvider } from '../../database/providers/Wallet';
import { Knex } from '../../database/knex';

const walletProvider = new WalletProvider(Knex);

export const getBalance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const balance = await walletProvider.getBalance(userId);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user_id: userId,
        balance: balance,
      },
    });
  } catch (error: any) {
    console.error('Error getting balance:', error);

    if (error.message === 'Usuário não encontrado') {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao buscar saldo',
    });
  }
};