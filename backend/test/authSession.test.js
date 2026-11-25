const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const jwt = require('jsonwebtoken');

test('authenticated session endpoint returns the current user and rejects expired tokens', async () => {
    const databasePath = path.join(os.tmpdir(), `food-dist-auth-${process.pid}.sqlite3`);
    const secret = 'auth-session-test-secret';
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = secret;

    const config = require('../knexfile').development;
    config.connection.filename = databasePath;
    const setupDb = require('knex')(config);
    let setupDestroyed = false;
    let server;
    let appDb;

    try {
        await setupDb.migrate.latest();
        await setupDb('users').insert({
            id: 1,
            email: 'admin@example.test',
            password: 'not-returned',
            name: 'Admin',
            role: 'Admin'
        });
        await setupDb.destroy();
        setupDestroyed = true;

        const app = require('../src/app');
        appDb = require('../src/db/knex');
        server = app.listen(0);
        await new Promise(resolve => server.once('listening', resolve));
        const url = `http://127.0.0.1:${server.address().port}/api/auth/me`;
        const claims = { id: 1, email: 'admin@example.test', role: 'Admin' };

        const validResponse = await fetch(url, {
            headers: { Authorization: `Bearer ${jwt.sign(claims, secret, { expiresIn: '1h' })}` }
        });
        const user = await validResponse.json();
        assert.equal(validResponse.status, 200);
        assert.equal(user.email, claims.email);
        assert.equal(user.role, claims.role);
        assert.equal(Object.prototype.hasOwnProperty.call(user, 'password'), false);

        const expiredResponse = await fetch(url, {
            headers: { Authorization: `Bearer ${jwt.sign(claims, secret, { expiresIn: '-1s' })}` }
        });
        assert.equal(expiredResponse.status, 401);
    } finally {
        if (server) await new Promise(resolve => server.close(resolve));
        if (appDb) await appDb.destroy();
        if (!setupDestroyed) await setupDb.destroy();
        for (const suffix of ['', '-wal', '-shm']) {
            try {
                fs.unlinkSync(databasePath + suffix);
            } catch (error) {
                if (error.code !== 'ENOENT') throw error;
            }
        }
    }
});
