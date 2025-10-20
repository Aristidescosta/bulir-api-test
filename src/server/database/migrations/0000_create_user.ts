import type { Knex } from 'knex';
import { ETableNames } from '../ETableNames';

export async function up(knex: Knex) {
  return knex.schema
    .createTable(ETableNames.user, (table) => {
      table.string('id', 36).primary();

      table.decimal('balance', 10, 2).notNullable().defaultTo(0);
      table.string('name', 150).notNullable();
      table.string('email', 255).notNullable().unique();
      table.string('nif', 255).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.string('phone', 20).nullable();

      table
        .string('type', 20)
        .notNullable()
        .checkIn(['CUSTOMER', 'PROVIDER']);

      table
        .string('status', 20)
        .notNullable()
        .defaultTo('ACTIVE')
        .checkIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']);

      table
        .timestamp('created_at')
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .timestamp('updated_at')
        .notNullable()
        .defaultTo(knex.fn.now());

      table.index('email', 'idx_users_email');
      table.index('type', 'idx_users_type');
      table.index('status', 'idx_users_status');
      table.index(['type', 'status'], 'idx_users_type_status');
      table.index('created_at', 'idx_users_created_at');
    })
    .then(() => {
      console.log(`# Created table ${ETableNames.user}`);
    });
}

export async function down(knex: Knex) {
  await knex.schema.dropTableIfExists(ETableNames.user);
  console.log(`# Dropped table ${ETableNames.user}`);
}
