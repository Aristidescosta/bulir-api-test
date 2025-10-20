/* eslint-disable @typescript-eslint/no-explicit-any */
import * as yup from 'yup';
import { validation } from '../../shared/middlewares';
import { Request, Response } from 'express';
import { ETransactionType, WalletProvider } from '../../database/providers/Wallet';
import { Knex } from '../../database/knex';
import { StatusCodes } from 'http-status-codes';

interface IGetTransactionsQuery {
  type?: ETransactionType;
  page?: number;
  limit?: number;
}

const walletProvider = new WalletProvider(Knex);

export const getTransactionsValidation = validation((getSchema) => ({
  query: getSchema<IGetTransactionsQuery>(
    yup.object({
      type: yup
        .string()
        .oneOf(Object.values(ETransactionType), 'Tipo de transação inválido')
        .optional(),

      page: yup
        .number()
        .integer()
        .positive()
        .default(1)
        .transform((value) => (isNaN(value) ? 1 : value)),

      limit: yup
        .number()
        .integer()
        .positive()
        .max(100)
        .default(20)
        .transform((value) => (isNaN(value) ? 20 : value)),
    })
  ),
}));

export const getTransactions = async (
  req: Request<{}, {}, {}, IGetTransactionsQuery>,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const { type, page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const transactions = await walletProvider.getTransactions(userId, {
      type: type as ETransactionType,
      limit,
      offset,
    });

    const total = await walletProvider.countTransactions(
      userId,
      type as ETransactionType
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting transactions:', error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao buscar transações',
    });
  }
};