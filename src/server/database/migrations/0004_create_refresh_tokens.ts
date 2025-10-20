// migrations/XXXXXX_create_refresh_tokens.ts
import type { Knex } from 'knex';
import { ETableNames } from '../ETableNames';

export async function up(knex: Knex) {
  return knex
    .schema
    .createTable(ETableNames.refresh_tokens, (table) => {
      table.string('id', 36).primary();

      table
        .string('user_id', 36)
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.text('token').notNullable();
      table.timestamp('expires_at').notNullable();
      table.boolean('revoked').notNullable().defaultTo(false);
      table.timestamp('revoked_at').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

      table.index('user_id', 'idx_refresh_tokens_user');
      table.index('token', 'idx_refresh_tokens_token');
      table.index('expires_at', 'idx_refresh_tokens_expires');
      table.index(['user_id', 'revoked'], 'idx_refresh_tokens_user_revoked');
    })
    .then(() => {
      console.log(`# Created table ${ETableNames.refresh_tokens}`);
    });
}

export async function down(knex: Knex) {
  return knex
    .schema
    .dropTableIfExists(ETableNames.refresh_tokens)
    .then(() => {
      console.log(`# Dropped table ${ETableNames.refresh_tokens}`);
    });
}