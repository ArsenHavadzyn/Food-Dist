exports.up = function (knex) {
    return knex.schema.createTable('inventory', function (table) {
        table.increments('id').primary();
        table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE');
        table.integer('stock').notNullable();
        table.date('recorded_at').notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('inventory');
};
