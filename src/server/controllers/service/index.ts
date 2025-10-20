import * as create from './Create';
import * as getAll from './GetAll';
import * as getAllByProvider from './GetAllByProvider';
import * as getById from './GetById';
import * as updateById from './UpdateById';
import * as deleteById from './DeleteById';

export const ServicesController = {
  ...create,
  ...getAllByProvider,
  ...getAll,
  ...getById,
  ...updateById,
  ...deleteById,
};