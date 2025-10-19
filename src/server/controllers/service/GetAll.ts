/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

import { queryValidation, TQueryParams } from '../../shared/schemas/querySchema';
import { validation } from '../../shared/middlewares';
import { Knex } from '../../database/knex';
import { ServiceProvider } from '../../database/providers/Services';

export const getAllValidation = validation((getSchema) => ({
  query: getSchema<TQueryParams>(queryValidation)
}));

const serviceProvider = new ServiceProvider(Knex);

export const getAll = async (req: Request, res: Response) => {
  try {


    const userId = (req as any).user?.id;
    const userType = (req as any).user?.type;

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    if (userType !== 'PROVIDER') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Apenas provedores podem listar seus serviços',
      });
    }

    const {
      category,
      status,
      min_price,
      max_price,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const services = await serviceProvider.findAllWithProvider({
      provider_id: userId as string,
      category: category as any,
      status: status as any,
      min_price: min_price ? Number(min_price) : undefined,
      max_price: max_price ? Number(max_price) : undefined,
      search: search as string,
      limit: Number(limit),
      offset,
    });

    const total = await serviceProvider.count({
      provider_id: userId as string,
      category: category as any,
      status: status as any,
      min_price: min_price ? Number(min_price) : undefined,
      max_price: max_price ? Number(max_price) : undefined,
      search: search as string,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data: services,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('ERROR: ', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao buscar serviços',
    });
  }
};
