/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Knex } from '../../database/knex';
import { BookingProvider } from '../../database/providers/Booking';
import { validation } from '../../shared/middlewares';
import { paramValidation, TParamProp } from '../../shared/schemas/param';
import { StatusCodes } from 'http-status-codes';
import { ECancelledBy } from '../../../types/booking';
import * as yup from 'yup';

interface ICancelData {
  cancellation_reason: string;
}

export const cancelValidation = validation((getSchema) => ({
  params: getSchema<TParamProp>(paramValidation),
  body: getSchema<ICancelData>(yup.object({
    cancellation_reason: yup.string().required('Motivo do cancelamento é obrigatório')
  }))
}));

const bookingProvider = new BookingProvider(Knex);

export const cancel = async (req: Request<TParamProp, {}, ICancelData>, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    const isCustomer = await bookingProvider.belongsToCustomer(id, userId);
    const isProvider = await bookingProvider.belongsToProvider(id, userId);

    if (!isCustomer && !isProvider) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Você não tem permissão para cancelar esta reserva',
      });
    }

    const cancelData = {
      cancelled_by: isCustomer ? ECancelledBy.CUSTOMER : ECancelledBy.PROVIDER,
      cancellation_reason: req.body.cancellation_reason,
    };

    const cancelledBooking = await bookingProvider.cancel(id, cancelData);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Reserva cancelada com sucesso',
      data: cancelledBooking,
    });
  } catch (error: any) {
    if (
      error.message.includes('não encontrada') ||
      error.message.includes('podem ser canceladas') ||
      error.message.includes('antecedência')
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao cancelar reserva',
    });
  }
};
