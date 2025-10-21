import { Knex } from 'knex';
import { ETableNames } from '../ETableNames';

export async function seed(knex: Knex): Promise<void> {
  console.log('🗑️  Limpando dados existentes...');

  await knex.raw('PRAGMA foreign_keys = OFF;');

  await knex(ETableNames.transaction).del();
  await knex(ETableNames.bookings).del();
  await knex(ETableNames.refresh_tokens).del();
  await knex(ETableNames.service).del();
  await knex(ETableNames.user).del();


  await knex.raw('PRAGMA foreign_keys = ON;');

  console.log('✅ Dados limpos com sucesso!');
}