const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('analysis adds exact negative trends omitted by Ollama and ignores unchanged indicators', async () => {
    const databasePath = path.join(os.tmpdir(), `food-dist-analysis-${process.pid}.sqlite3`);
    const ollama = http.createServer((req, res) => {
        req.resume();
        req.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                response: JSON.stringify({
                    summary: 'Перевірка контрольованого періоду.',
                    positiveFactors: [],
                    negativeFactors: [],
                    risks: [],
                    recommendations: [],
                    factorAnalysisExplanation: 'Тестове пояснення.'
                })
            }));
        });
    });

    await new Promise(resolve => ollama.listen(0, '127.0.0.1', resolve));
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'analysis-test-secret';
    process.env.OLLAMA_BASE_URL = `http://127.0.0.1:${ollama.address().port}`;
    process.env.OLLAMA_MODEL = 'test-model';
    process.env.OLLAMA_TIMEOUT_MS = '5000';

    const config = require('../knexfile').development;
    config.connection.filename = databasePath;
    const setupDb = require('knex')(config);
    let setupDestroyed = false;
    let analysisDb;

    try {
        await setupDb.migrate.latest();
        await setupDb('financial_indicators').insert([
            {
                year: 2026,
                revenue: 95000,
                profit: 4350,
                assets: 54000,
                profitability: 4.58,
                liquidity: null,
                asset_turnover: 1.7593
            },
            {
                year: 2027,
                revenue: 90250,
                profit: 4000,
                assets: 54000,
                profitability: 4.58,
                liquidity: null,
                asset_turnover: 1.7593
            }
        ]);
        await setupDb.destroy();
        setupDestroyed = true;

        const { analyzePeriod } = require('../src/services/aiAnalysisService');
        analysisDb = require('../src/db/knex');
        const result = await analyzePeriod(2026, 2027);

        assert.deepEqual(result.input.deltas, {
            revenue: -5,
            profit: -8.05,
            assets: 0,
            profitability: 0,
            liquidity: null,
            asset_turnover: 0
        });
        assert.deepEqual(result.result.negativeFactors, [
            'Зменшення прибутку на 8.05% за аналізований період',
            'Зменшення виручки на 5.00% за аналізований період'
        ]);
    } finally {
        if (analysisDb) await analysisDb.destroy();
        if (!setupDestroyed) await setupDb.destroy();
        await new Promise((resolve, reject) => ollama.close(error => error ? reject(error) : resolve()));
        for (const suffix of ['', '-wal', '-shm']) {
            try {
                fs.unlinkSync(databasePath + suffix);
            } catch (error) {
                if (error.code !== 'ENOENT') throw error;
            }
        }
    }
});
