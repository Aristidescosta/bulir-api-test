/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Knex } from 'knex';
import path from 'path';

export const develoment: Knex.Config = {
  client: 'sqlite3',
  useNullAsDefault: false,
  connection: {
    filename: path.resolve('..', '..', '..', '..', 'database.sqlite')
  },
  migrations: {
    directory: path.resolve(__dirname, '..', 'migrations'),
  },
  seeds: {
    directory: path.resolve(__dirname, '..', 'seeds'),
  },
  pool: {
    afterCreate: (connection: any, done: Function) => {
      connection.run('PRAGMA foreign_keys  = ON');
      done();
    }
  }
};

export const test: Knex.Config = {
  ...develoment,
  connection: ':memory:'
};