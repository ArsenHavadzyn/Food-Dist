const knex = require('../db/knex');
const { prepareImport } = require('../services/importService');

function getFile(req) {
    const filename = req.query.filename;
    if (!filename || !/\.(csv|xlsx)$/i.test(filename)) {
        const error = new Error('Оберіть файл CSV або XLSX.');
        error.status = 400;
        throw error;
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        const error = new Error('Файл порожній або не переданий.');
        error.status = 400;
        throw error;
    }
    return filename;
}

function respondError(err, res, next) {
    if (err.status === 400) return res.status(400).json({ message: err.message });
    if (err.status === 413 || err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Максимальний розмір файлу — 10 МБ.' });
    }
    return next(err);
}

exports.preview = async (req, res, next) => {
    try {
        const filename = getFile(req);
        const result = await prepareImport(req.query.type, req.body, filename, knex);
        res.json(result);
    } catch (err) {
        respondError(err, res, next);
    }
};

exports.commit = async (req, res, next) => {
    let trx;
    try {
        const filename = getFile(req);
        trx = await knex.transaction();
        const preview = await prepareImport(req.query.type, req.body, filename, trx);
        const validRows = preview.rows.filter(row => row.errors.length === 0);
        const errors = preview.rows
            .filter(row => row.errors.length > 0)
            .map(({ rowNumber, errors: rowErrors }) => ({ rowNumber, errors: rowErrors }));
        const { type } = req.query;

        if (type === 'products' && validRows.length) {
            for (let i = 0; i < validRows.length; i += 100) {
                await trx('products').insert(validRows.slice(i, i + 100).map(row => row.values));
            }
        } else if (type === 'sales' && validRows.length) {
            const stockByProduct = new Map();
            validRows.forEach(row => {
                const { product_id, quantity } = row.values;
                stockByProduct.set(product_id, (stockByProduct.get(product_id) || 0) + quantity);
            });
            for (const [productId, quantity] of stockByProduct) {
                await trx('products').where({ id: productId }).decrement('stock', quantity);
            }

            const createdBy = req.user && req.user.id ? req.user.id : null;
            const sales = validRows.map(row => {
                const { product_id, quantity, unit_price, sale_date } = row.values;
                return {
                    product_id,
                    quantity,
                    unit_price,
                    total_price: Number((quantity * unit_price).toFixed(2)),
                    sale_date,
                    created_by: createdBy
                };
            });
            for (let i = 0; i < sales.length; i += 100) {
                await trx('sales').insert(sales.slice(i, i + 100));
            }
        } else if (type === 'financial' && validRows.length) {
            const indicators = validRows.map(row => {
                const { year, revenue, profit, assets, profitability, asset_turnover } = row.values;
                const indicator = {
                    year,
                    revenue,
                    profit,
                    assets,
                    profitability: profitability ?? (revenue === 0 ? 0 : Number((profit / revenue * 100).toFixed(2))),
                    asset_turnover: asset_turnover ?? (assets === 0 ? 0 : Number((revenue / assets).toFixed(4)))
                };
                if (Object.prototype.hasOwnProperty.call(row.values, 'liquidity')) {
                    indicator.liquidity = row.values.liquidity;
                }
                return indicator;
            });
            for (const indicator of indicators) {
                const mergeColumns = ['revenue', 'profit', 'assets', 'profitability', 'asset_turnover', 'updated_at'];
                if (Object.prototype.hasOwnProperty.call(indicator, 'liquidity')) mergeColumns.push('liquidity');
                await trx('financial_indicators')
                    .insert(indicator)
                    .onConflict('year')
                    .merge(mergeColumns);
            }
        }

        await trx.commit();
        res.json({ imported: validRows.length, errors });
    } catch (err) {
        if (trx) await trx.rollback();
        respondError(err, res, next);
    }
};
