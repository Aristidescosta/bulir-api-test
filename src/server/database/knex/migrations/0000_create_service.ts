import type { Knex } from 'knex';
import { ETableNames } from '../../ETableNames';

export async function up(knex: Knex) {
  return knex
  .schema
  .createTable(ETableNames.service, (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table
      .uuid('provedor_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.string('name', 100).notNullable();
    table.text('description').notNullable();
    table.string('category', 50).notNullable();

    table.integer('duration').notNullable();
    table.decimal('price', 10, 2).notNullable();

    table
      .enum('status', ['ATIVO', 'INATIVO'], {
        useNative: true,
        enumName: 'service_status_enum',
      })
      .notNullable()
      .defaultTo('ATIVO');

    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    table.index('provider_id', 'idx_services_provedor');
    table.index('status', 'idx_services_status');
    table.index('category', 'idx_services_categoria');
    table.index(['status', 'categoria'], 'idx_services_status_categoria');
    table.index('created_at', 'idx_services_created_at');
  })
  .then(() => {
    console.log(`# Created table ${ETableNames.service}`);
  });
}

export async function down(knex: Knex) {
  return knex
  .schema
  .dropTableIfExists(ETableNames.service)
  .then(() => {
    console.log(`# Droped table ${ETableNames.service}`);
  });;
  //await knex.raw('DROP TYPE IF EXISTS service_status_enum');
}