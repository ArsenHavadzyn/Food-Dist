exports.up = function (knex) {
    return knex.schema.createTable('reports', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('type');
        table.string('path');
        table.text('meta');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('reports');
};
