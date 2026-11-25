const knex = require('../db/knex');
const authService = require('../services/authService');

exports.list = async (req, res, next) => {
    try {
        const rows = await knex('users').select('id', 'email', 'name', 'role', 'created_at');
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.get = async (req, res, next) => {
    try {
        const id = req.params.id;
        const u = await knex('users').where({ id }).first().select('id', 'email', 'name', 'role', 'created_at');
        if (!u) return res.status(404).json({ message: 'Not found' });
        res.json(u);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const payload = req.body;
        const user = await authService.register(payload);
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        const payload = req.body;
        await knex('users').where({ id }).update(payload);
        const user = await knex('users').where({ id }).first().select('id', 'email', 'name', 'role', 'created_at');
        res.json(user);
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const id = req.params.id;
        await knex('users').where({ id }).del();
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};
