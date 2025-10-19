import * as create from './Create';
import * as getById from './GetById';
import * as getByEmail from './GetByEmail';
import * as getAll from './GetAll';
import * as updateById from './UpdateById';
import * as deleteById from './DeleteById';

export const UserController = {
  ...create,
  ...getById,
  ...getByEmail,
  ...getAll,
  ...updateById,
  ...deleteById,
};