exports.up = function (knex) {
    return knex.schema.createTable('products', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
        table.decimal('price', 14, 2).notNullable().defaultTo(0);
        table.decimal('cost_price', 14, 2).notNullable().defaultTo(0);
        table.integer('stock').notNullable().defaultTo(0);
        table.string('unit').defaultTo('pcs');
        table.string('barcode');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('products');
};
