import knex from 'knex';
import { test } from './Enviroment';

const getEnvironment = () => {
  switch (process.env.NODE_EN) {
    case 'test': return test;
    default: return test;
  }
};

export const Knex = knex(getEnvironment());