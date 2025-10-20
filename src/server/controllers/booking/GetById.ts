/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { validation } from '../../shared/middlewares';
import { paramValidation, TParamProp } from '../../shared/schemas/param';
import { Knex } from '../../database/knex';
import { BookingProvider } from '../../database/providers/Booking';
import { StatusCodes } from 'http-status-codes';

export const getByIdValidation = validation((getSchema) => ({
  params: getSchema<TParamProp>(paramValidation)
}));

const bookingProvider = new BookingProvider(Knex);

export const getById = async (req: Request<TParamProp, {}, {}>, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const booking = await bookingProvider.findByIdWithDetails(id);

    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Reserva não encontrada',
      });
    }

    // Verificar permissão
    if (booking.customer.id !== userId && booking.provider.id !== userId) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Você não tem permissão para visualizar esta reserva',
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao buscar reserva',
    });
  }
};