exports.up = function (knex) {
    return knex.schema.createTable('sales', function (table) {
        table.increments('id').primary();
        table.integer('product_id').unsigned().references('id').inTable('products').onDelete('SET NULL');
        table.integer('quantity').notNullable();
        table.decimal('unit_price', 14, 2).notNullable().defaultTo(0);
        table.decimal('total_price', 14, 2).notNullable().defaultTo(0);
        table.date('sale_date').notNullable();
        table.integer('created_by').unsigned().references('id').inTable('users').onDelete('SET NULL');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('sales');
};
