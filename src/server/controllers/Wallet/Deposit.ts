/* eslint-disable @typescript-eslint/no-explicit-any */
import * as yup from 'yup';
import { validation } from '../../shared/middlewares';
import { Request, Response } from 'express';
import { WalletProvider } from '../../database/providers/Wallet';
import { Knex } from '../../database/knex';
import { StatusCodes } from 'http-status-codes';

interface IDepositBody {
  amount: number;
  description?: string;
}

const walletProvider = new WalletProvider(Knex);

export const depositValidation = validation((getSchema) => ({
  body: getSchema<IDepositBody>(
    yup.object({
      amount: yup
        .number()
        .required('Valor é obrigatório')
        .positive('Valor deve ser positivo')
        .max(10000, 'Valor máximo por depósito é 10.000')
        .test(
          'decimal-places',
          'Valor deve ter no máximo 2 casas decimais',
          (value) => {
            if (value === undefined || value === null) return true;
            return /^\d+(\.\d{1,2})?$/.test(value.toString());
          }
        ),

      description: yup
        .string()
        .max(500, 'Descrição deve ter no máximo 500 caracteres')
        .default('Depósito na carteira'),
    })
  ),
}));

export const deposit = async (
  req: Request<{}, {}, IDepositBody>,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const { amount, description = 'Depósito na carteira' } = req.body;

    const transaction = await walletProvider.deposit(userId, amount, description);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Depósito realizado com sucesso',
      data: transaction,
    });
  } catch (error: any) {
    console.error('Error depositing:', error);

    if (error.message === 'Usuário não encontrado') {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao realizar depósito',
    });
  }
};