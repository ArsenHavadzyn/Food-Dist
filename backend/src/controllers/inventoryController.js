const knex = require('../db/knex');

// Inventory controller: snapshots and adjustments

exports.list = async (req, res, next) => {
    try {
        const q = knex('inventory')
            .select('inventory.*', 'products.name as product_name', 'products.unit')
            .leftJoin('products', 'inventory.product_id', 'products.id');

        if (req.query.product) q.where('products.name', 'like', `%${req.query.product}%`);
        if (req.query.date) q.where('inventory.recorded_at', req.query.date);

        const rows = await q.orderBy('recorded_at', 'desc').limit(200);

        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.adjust = async (req, res, next) => {
    try {
        // Admin adjusts stock manually
        const { product_id, stock } = req.body;
        if (typeof stock !== 'number') return res.status(400).json({ message: 'stock must be number' });

        await knex('products').where({ id: product_id }).update({ stock });
        await knex('inventory').insert({ product_id, stock, recorded_at: new Date() });
        const product = await knex('products').where({ id: product_id }).first();
        res.json(product);
    } catch (err) {
        next(err);
    }
};
