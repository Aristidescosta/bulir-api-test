/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Knex } from '../../database/knex';
import { StatusCodes } from 'http-status-codes';
import { BookingProvider } from '../../database/providers/Booking';
import { validation } from '../../shared/middlewares';
import { paramValidation, TParamProp } from '../../shared/schemas/param';


const bookingProvider = new BookingProvider(Knex);

export const completeValidation = validation((getSchema) => ({
  params: getSchema<TParamProp>(paramValidation)
}));

export const complete = async (req: Request<TParamProp, {}, {}>, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userType = (req as any).user?.type;

    if (userType !== 'PROVIDER') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Apenas provedores podem completar reservas',
      });
    }

    const isOwner = await bookingProvider.belongsToProvider(id, userId);

    if (!isOwner) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Você não tem permissão para completar esta reserva',
      });
    }

    const completedBooking = await bookingProvider.complete(id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Reserva completada com sucesso',
      data: completedBooking,
    });
  } catch (error: any) {
    if (
      error.message.includes('não encontrada') ||
      error.message.includes('confirmadas')
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao completar reserva',
    });
  }
};