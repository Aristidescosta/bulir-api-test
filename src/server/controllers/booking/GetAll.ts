/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Knex } from '../../database/knex';
import { BookingProvider } from '../../database/providers/Booking';
import { validation } from '../../shared/middlewares';
import { queryValidation, TQueryParams } from '../../shared/schemas/querySchema';
import { StatusCodes } from 'http-status-codes';


const bookingProvider = new BookingProvider(Knex);

export const getAllValidation = validation((getSchema) => ({
  query: getSchema<TQueryParams>(queryValidation)
}));

export const getAll = async (req: Request<{}, TQueryParams, {}>, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userType = (req as any).user?.type;
    const { status, date_from, date_to, page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const filters: any = {
      status: status as any,
      date_from: date_from ? new Date(date_from as string) : undefined,
      date_to: date_to ? new Date(date_to as string) : undefined,
      limit: Number(limit),
      offset,
    };

    // Cliente vê apenas suas reservas
    if (userType === 'CUSTOMER') {
      filters.customer_id = userId;
    }
    // Provedor vê reservas dos seus serviços
    else if (userType === 'PROVIDER') {
      filters.provider_id = userId;
    }

    const bookings = await bookingProvider.findAllWithDetails(filters);
    const total = await bookingProvider.count({
      ...filters,
      limit: undefined,
      offset: undefined,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao buscar reservas',
    });
  }
};