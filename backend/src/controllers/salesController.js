const knex = require('../db/knex');

// Контролер продажів: list, create, topProducts, monthlyRevenue

exports.list = async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(200, Number(req.query.limit) || 50);
        const offset = (page - 1) * limit;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const category = req.query.category;
        const search = req.query.search;

        const sortBy = req.query.sortBy || 'sale_date';
        const sortDir = req.query.sortDir === 'asc' ? 'asc' : 'desc';

        const base = knex('sales')
            .select('sales.*', 'products.name as product_name', 'categories.name as category_name')
            .leftJoin('products', 'sales.product_id', 'products.id')
            .leftJoin('categories', 'products.category_id', 'categories.id');

        if (startDate) base.where('sale_date', '>=', startDate);
        if (endDate) base.where('sale_date', '<=', endDate);
        if (category) base.where('products.category_id', category);
        if (search) base.where('products.name', 'like', `%${search}%`);

        // support limited sorting options
        const orderClause = (qb) => {
            if (sortBy === 'product_name') return qb.orderBy('products.name', sortDir);
            if (sortBy === 'quantity') return qb.orderBy('sales.quantity', sortDir);
            if (sortBy === 'total_price') return qb.orderBy('sales.total_price', sortDir);
            return qb.orderBy('sales.sale_date', sortDir);
        };

        const [rows, [{ count }]] = await Promise.all([
            orderClause(base.clone()).limit(limit).offset(offset),
            base.clone().count('* as count')
        ]);

        res.json({ data: rows, meta: { page, limit, total: Number(count) } });
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    const trx = await knex.transaction();
    try {
        const { product_id, quantity, unit_price } = req.body;
        const created_by = req.user && req.user.id ? req.user.id : null;

        const product = await trx('products').where({ id: product_id }).first();
        if (!product) throw new Error('Product not found');
        if (product.stock < quantity) throw new Error('Insufficient stock');

        const price = unit_price || product.price;
        const total_price = +(price * quantity).toFixed(2);

        await trx('products').where({ id: product_id }).decrement('stock', quantity);

        const [id] = await trx('sales').insert({ product_id, quantity, unit_price: price, total_price, sale_date: new Date(), created_by });

        await trx.commit();
        const sale = await knex('sales').where({ id }).first();
        res.status(201).json(sale);
    } catch (err) {
        await trx.rollback();
        next(err);
    }
};

exports.topProducts = async (req, res, next) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const rows = await knex('sales')
            .select('products.id', 'products.name')
            .sum('sales.total_price as revenue')
            .join('products', 'sales.product_id', 'products.id')
            .groupBy('products.id')
            .orderBy('revenue', 'desc')
            .limit(limit);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.monthlyRevenue = async (req, res, next) => {
    try {
        const start = req.query.start || `${new Date().getFullYear()}-01-01`;
        const rows = await knex.raw(
            `SELECT strftime('%Y-%m', sale_date) as month, SUM(total_price) as revenue FROM sales WHERE sale_date >= ? GROUP BY month ORDER BY month`,
            [start]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
};
