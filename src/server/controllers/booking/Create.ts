/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { ICreateBookingDTO } from '../../../types/booking';
import { Knex } from '../../database/knex';
import { BookingProvider } from '../../database/providers/Booking';
import { validation } from '../../shared/middlewares';
import { createBookingSchema } from '../../shared/schemas/booking';
import { StatusCodes } from 'http-status-codes';

interface IBookingData extends Omit<ICreateBookingDTO, 'customer_id'> { };

export const createValidation = validation((getSchema) => ({
  body: getSchema<IBookingData>(createBookingSchema)
}));

const bookingProvider = new BookingProvider(Knex);

export const create = async (req: Request<{}, {}, IBookingData>, res: Response) => {
  try {
    const customerId = (req as any).user?.id;

    const bookingData = {
      service_id: req.body.service_id,
      customer_id: customerId,
      booking_date: new Date(req.body.booking_date),
      start_time: req.body.start_time,
    };

    const newBooking = await bookingProvider.create(bookingData);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Reserva criada com sucesso',
      data: newBooking,
    });
  } catch (error: any) {
    // Erros específicos
    if (
      error.message.includes('não encontrado') ||
      error.message.includes('não está ativo') ||
      error.message.includes('futuras') ||
      error.message.includes('antecedência') ||
      error.message.includes('Apenas clientes podem fazer reservas') ||
      error.message.includes('disponível')
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao criar reserva',
    });
  }
};