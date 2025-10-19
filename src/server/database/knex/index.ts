import knex from 'knex';
import development, { test } from './Enviroment';

const getEnvironment = () => {
  switch (process.env.NODE_ENV) {
    case 'test': return test;

    default: return development;
  }
};

/* console.log('📂 Usando banco de dados em:', (getEnvironment().connection as any).filename);
 */
export const Knex = knex(getEnvironment());