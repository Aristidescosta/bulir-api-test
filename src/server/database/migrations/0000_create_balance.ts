import { Knex } from 'knex';
import { ETableNames } from '../ETableNames';

export async function up(knex: Knex) {
  return knex
    .schema
    .createTable(ETableNames.transaction, (table) => {
      table.string('id', 36).primary();

      table
        .string('user_id', 36)
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table
        .string('booking_id', 36)
        .nullable()
        .references('id')
        .inTable('bookings')
        .onDelete('SET NULL')
        .onUpdate('CASCADE');

      table.string('type', 20).notNullable()
        .checkIn(['DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'RECEIVED', 'REFUND']);

      table.decimal('amount', 10, 2).notNullable();
      table.decimal('balance_before', 10, 2).notNullable();
      table.decimal('balance_after', 10, 2).notNullable();
      table.text('description').notNullable();

      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

      // Índices
      table.index('user_id', 'idx_transactions_user');
      table.index('booking_id', 'idx_transactions_booking');
      table.index('type', 'idx_transactions_type');
      table.index('created_at', 'idx_transactions_created');
    }).then(() => {
      console.log(`# Created table ${ETableNames.user}`);
    });
}

export async function down(knex: Knex) {
  await knex.schema.dropTableIfExists(ETableNames.transaction);
  await knex.schema.table(ETableNames.user, (table) => {
    table.dropColumn('balance');
  });
}