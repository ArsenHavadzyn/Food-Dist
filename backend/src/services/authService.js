const knex = require('../db/knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';
const TOKEN_EXP = '8h';

// Auth service: register/login and token generation

async function findByEmail(email) {
    return await knex('users').where({ email }).first();
}

async function findById(id) {
    const user = await knex('users').where({ id }).first();
    if (!user) return null;
    delete user.password;
    return user;
}

async function register({ email, password, name, role = 'Analyst' }) {
    // Basic validation
    if (!email || !password) throw new Error('Email and password are required');

    const existing = await findByEmail(email);
    if (existing) throw new Error('Email already exists');

    const hashed = bcrypt.hashSync(password, 10);
    const [id] = await knex('users').insert({ email, password: hashed, name, role });
    const user = await knex('users').where({ id }).first();
    delete user.password;
    return user;
}

function generateToken(user) {
    const payload = { id: user.id, email: user.email, role: user.role };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXP });
}

async function login(email, password) {
    if (!email || !password) throw new Error('Email and password are required');
    const user = await findByEmail(email);
    if (!user) throw new Error('Invalid credentials');
    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) throw new Error('Invalid credentials');
    const token = generateToken(user);
    delete user.password;
    return { token, user };
}

module.exports = { register, login, generateToken, findById };
