import * as create from './Create';
import * as getAll from './GetAll';
import * as getById from './GetById';
import * as complete from './Complete';
import * as cancel from './Cancel';

export const BookingController = {
  ...create,
  ...getAll,
  ...getById,
  ...cancel,
  ...complete,
};