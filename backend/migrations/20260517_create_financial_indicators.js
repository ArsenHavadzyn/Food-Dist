exports.up = function (knex) {
    return knex.schema.createTable('financial_indicators', function (table) {
        table.increments('id').primary();
        table.integer('year').notNullable().unique();
        table.decimal('revenue', 14, 2).defaultTo(0);
        table.decimal('profit', 14, 2).defaultTo(0);
        table.decimal('assets', 14, 2).defaultTo(0);
        table.decimal('profitability', 8, 4).defaultTo(0);
        table.decimal('liquidity', 8, 4).nullable();
        table.decimal('asset_turnover', 8, 4).nullable();
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('financial_indicators');
};
