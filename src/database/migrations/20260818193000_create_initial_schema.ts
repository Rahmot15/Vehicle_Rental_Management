import type { Knex } from 'knex';

function addTimestamps(table: Knex.CreateTableBuilder, knex: Knex): void {
  table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
}

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('staff', (table) => {
    table.increments('id');
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('name', 255).notNullable();
    addTimestamps(table, knex);
  });

  await knex.schema.createTable('vehicles', (table) => {
    table.increments('id');
    table.string('name', 255).notNullable();
    table.string('plate_number', 100).notNullable().unique();
    table.string('category', 100).notNullable();
    table.decimal('daily_rate', 12, 2).notNullable();
    table.string('photo_path', 500).nullable();
    table.timestamp('deleted_at', { useTz: true }).nullable();
    addTimestamps(table, knex);

    table.check('daily_rate > 0', [], 'vehicles_daily_rate_positive');
    table.index(['category', 'deleted_at'], 'vehicles_category_deleted_at_index');
  });

  await knex.schema.createTable('rentals', (table) => {
    table.increments('id');
    table
      .integer('vehicle_id')
      .notNullable()
      .references('id')
      .inTable('vehicles')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    table.string('customer_name', 255).notNullable();
    table.string('customer_phone', 50).notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.decimal('total_amount', 12, 2).notNullable();
    table.string('status', 20).notNullable().defaultTo('booked');
    addTimestamps(table, knex);

    table.check('end_date >= start_date', [], 'rentals_valid_date_range');
    table.check('total_amount >= 0', [], 'rentals_total_amount_non_negative');
    table.check(
      "status IN ('booked', 'ongoing', 'completed', 'cancelled')",
      [],
      'rentals_status_valid',
    );
    table.index(['vehicle_id', 'status', 'start_date', 'end_date'], 'rentals_availability_index');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('rentals');
  await knex.schema.dropTableIfExists('vehicles');
  await knex.schema.dropTableIfExists('staff');
}
