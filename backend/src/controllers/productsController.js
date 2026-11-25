const knex = require('../db/knex');

// Контролер продуктів: list/get/create/update/delete

exports.list = async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Number(req.query.limit) || 20);
        const offset = (page - 1) * limit;
        const search = req.query.search;
        const category = req.query.category;
        const sortBy = req.query.sortBy || 'products.id';
        const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';
        const lowThreshold = Number(req.query.lowThreshold || 0);

        const base = knex('products')
            .select('products.*', 'categories.name as category_name')
            .leftJoin('categories', 'products.category_id', 'categories.id');

        if (search) {
            base.where(function () {
                this.where('products.name', 'like', `%${search}%`).orWhere('products.barcode', 'like', `%${search}%`);
            });
        }

        if (category) base.where('products.category_id', category);
        if (lowThreshold > 0) base.where('products.stock', '<', lowThreshold);

        const [rows, [{ count }]] = await Promise.all([
            base.clone().orderBy(sortBy, sortDir).limit(limit).offset(offset),
            base.clone().count('* as count')
        ]);

        res.json({ data: rows, meta: { page, limit, total: Number(count) } });
    } catch (err) {
        next(err);
    }
};

exports.get = async (req, res, next) => {
    try {
        const id = req.params.id;
        const item = await knex('products').where({ id }).first();
        if (!item) return res.status(404).json({ message: 'Product not found' });
        res.json(item);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const payload = req.body;
        const [id] = await knex('products').insert(payload);
        const product = await knex('products').where({ id }).first();
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        const payload = req.body;
        await knex('products').where({ id }).update(payload);
        const product = await knex('products').where({ id }).first();
        res.json(product);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const id = req.params.id;
        await knex('products').where({ id }).del();
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};
