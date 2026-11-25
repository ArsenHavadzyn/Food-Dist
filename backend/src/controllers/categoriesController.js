const knex = require('../db/knex');

exports.list = async (req, res, next) => {
    try {
        const rows = await knex('categories').orderBy('name', 'asc');
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.get = async (req, res, next) => {
    try {
        const id = req.params.id;
        const row = await knex('categories').where({ id }).first();
        if (!row) return res.status(404).json({ message: 'Category not found' });
        res.json(row);
    } catch (err) {
        next(err);
    }
};
