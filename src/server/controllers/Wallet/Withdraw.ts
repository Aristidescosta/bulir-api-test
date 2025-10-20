/* eslint-disable @typescript-eslint/no-explicit-any */
import * as yup from 'yup';
import { validation } from '../../shared/middlewares';
import { Request, Response } from 'express';
import { WalletProvider } from '../../database/providers/Wallet';
import { Knex } from '../../database/knex';
import { StatusCodes } from 'http-status-codes';

interface IWithdrawBody {
  amount: number;
  description?: string;
}

const walletProvider = new WalletProvider(Knex);

export const withdrawValidation = validation((getSchema) => ({
  body: getSchema<IWithdrawBody>(
    yup.object({
      amount: yup
        .number()
        .required('Valor é obrigatório')
        .positive('Valor deve ser positivo')
        .max(10000, 'Valor máximo por saque é 10.000')
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
        .default('Saque da carteira'),
    })
  ),
}));

export const withdraw = async (
  req: Request<{}, {}, IWithdrawBody>,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const userType = (req as any).user?.type;
    const { amount, description = 'Saque da carteira' } = req.body;

    if (userType !== 'PROVIDER') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Apenas provedores podem realizar saques',
      });
    }

    const transaction = await walletProvider.withdraw(userId, amount, description);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Saque realizado com sucesso',
      data: transaction,
    });
  } catch (error: any) {
    console.error('Error withdrawing:', error);

    if (error.message === 'Usuário não encontrado') {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === 'Saldo insuficiente') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao realizar saque',
    });
  }
};