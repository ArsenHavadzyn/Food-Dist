const knex = require('../db/knex');
const calc = require('../services/calculations');

exports.list = async (req, res, next) => {
    try {
        const rows = await knex('financial_indicators').orderBy('year', 'asc');
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.get = async (req, res, next) => {
    try {
        const year = Number(req.params.year);
        const row = await knex('financial_indicators').where({ year }).first();
        if (!row) return res.status(404).json({ message: 'Year not found' });

        // Add computed metrics
        const liquidity = row.liquidity || null;
        const fundoviddacha = row.asset_turnover || calc.calcAssetTurnover(row.revenue, row.assets);
        const productivity = null; // product-based, requires employee data

        res.json({ ...row, computed: { liquidity, fundoviddacha, productivity } });
    } catch (err) {
        next(err);
    }
};

// Endpoint to compute metrics from provided payload
exports.compute = async (req, res, next) => {
    try {
        const { revenue, profit, assets, currentAssets, currentLiabilities, employees, materialCosts } = req.body;
        const profitability = calc.calcProfitability(Number(profit), Number(revenue));
        const liquidity = calc.calcLiquidity(Number(currentAssets), Number(currentLiabilities));
        const fundoviddacha = calc.calcFundoviddacha(Number(revenue), Number(assets));
        const productivity = calc.calcProductivity(Number(revenue), Number(employees));
        const materialIntensity = calc.calcMaterialIntensity(Number(materialCosts), Number(revenue));
        const assetTurnover = calc.calcAssetTurnover(Number(revenue), Number(assets));

        res.json({ profitability, liquidity, fundoviddacha, productivity, materialIntensity, assetTurnover });
    } catch (err) {
        next(err);
    }
};
