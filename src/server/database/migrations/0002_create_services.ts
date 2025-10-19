// migrations/XXXXXX_create_services.ts
import type { Knex } from 'knex';
import { ETableNames } from '../ETableNames';

export async function up(knex: Knex) {
  return knex
    .schema
    .createTable(ETableNames.service, (table) => {
      table.string('id', 36).primary();

      table
        .string('provider_id', 36)
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.string('name', 100).notNullable();
      table.text('description').notNullable();

      table.string('category', 50).notNullable()
        .checkIn([
          'BEAUTY', 'HEALTH', 'EDUCATION', 'TECHNOLOGY',
          'CONSULTING', 'MAINTENANCE', 'EVENTS', 'OTHER'
        ]);

      table.integer('duration').notNullable();
      table.decimal('price', 10, 2).notNullable();

      table.string('status', 20).notNullable().defaultTo('ACTIVE')
        .checkIn(['ACTIVE', 'INACTIVE']);

      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

      table.index('provider_id', 'idx_services_provider');
      table.index('category', 'idx_services_category');
      table.index('status', 'idx_services_status');
      table.index('price', 'idx_services_price');
      table.index(['status', 'category'], 'idx_services_status_category');
    }).then(() => {
      console.log(`# Created table ${ETableNames.service}`);
    });
}

export async function down(knex: Knex) {
  return knex
    .schema
    .dropTableIfExists(ETableNames.service)
    .then(() => {
      console.log(`# Droped table ${ETableNames.service}`);
    });
}