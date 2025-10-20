import type { Knex } from 'knex';
import { ETableNames } from '../ETableNames';

export async function up(knex: Knex) {
  return knex.schema.createTable(ETableNames.bookings, (table) => {
    table.string('id', 36).primary();

    table
      .string('service_id', 36)
      .notNullable()
      .references('id')
      .inTable('service')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table
      .string('customer_id', 36)
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table
      .string('provider_id', 36)
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.date('booking_date').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();

    table.string('status', 20).notNullable().defaultTo('CONFIRMED')
      .checkIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']);

    table.decimal('total_price', 10, 2).notNullable();

    table.text('cancellation_reason').nullable();
    table.string('cancelled_by', 20).nullable()
      .checkIn(['CUSTOMER', 'PROVIDER', 'SYSTEM']);

    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('cancelled_at').nullable();

    // Índices
    table.index('customer_id', 'idx_bookings_customer');
    table.index('provider_id', 'idx_bookings_provider');
    table.index('service_id', 'idx_bookings_service');
    table.index('booking_date', 'idx_bookings_date');
    table.index('status', 'idx_bookings_status');
    table.index(['provider_id', 'booking_date'], 'idx_bookings_provider_date');
    table.index(['customer_id', 'status'], 'idx_bookings_customer_status');
  }).then(() => {
    console.log(`# Created table ${ETableNames.bookings}`);
  });
}

export async function down(knex: Knex) {
  return knex
    .schema
    .dropTableIfExists(ETableNames.bookings)
    .then(() => {
      console.log(`# Droped table ${ETableNames.bookings}`);
    });
}