import * as create from './Create';
import * as getAll from './GetAll';
import * as getById from './GetById';
import * as complete from './Complete';

export const BookingController = {
  ...create,
  ...getAll,
  ...getById,
  ...complete,
};