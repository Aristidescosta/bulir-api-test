import { Knex, knex } from 'knex';
import { test } from '../src/server/database/knex/Enviroment';

const getEnvironment = () => {
  switch (process.env.NODE_EN) {
    case 'test': return test;
    default: return test;
  }
};

(async () => {
  const db: Knex = knex(getEnvironment());
  const tables = await db.raw('SELECT name FROM sqlite_master WHERE type=\'table\'');
  console.log(tables);
  await db.destroy();
})();
