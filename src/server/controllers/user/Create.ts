/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Knex } from '../../database/knex';
import { validation } from '../../shared/middlewares';
import { createUserSchema, ICreateUser } from '../../shared/schemas/user';
import { EUserType } from '../../../types/user';
import { StatusCodes } from 'http-status-codes';
import { ICreateUserDTO, UserProvider } from '../../database/providers/User';

export const createValidation = validation((getSchema) => ({
  body: getSchema<ICreateUser>(createUserSchema)
}));

const userProvider = new UserProvider(Knex);

export const create = async (req: Request<{}, {}, ICreateUser>, res: Response) => {
  try {
    const userData: ICreateUserDTO = {
      name: req.body.name,
      email: req.body.email,
      nif: req.body.nif,
      password: req.body.password,
      phone: req.body.phone,
      type: req.body.type || EUserType.CUSTOMER,
    };
    
    const newUser = await userProvider.create(userData);

    const { password_hash, ...userWithoutPassword } = newUser;

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: userWithoutPassword,
    });
  } catch (error: any) {
    // Tratamento de erros específicos
    if (error.message === 'Email já está em uso' ||
      error.message === 'NIF já está em uso') {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Error creating user:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Erro ao criar usuário',
    });
  }
};