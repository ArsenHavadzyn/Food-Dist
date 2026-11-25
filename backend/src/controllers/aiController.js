const aiService = require('../services/aiAnalysisService');

exports.analyze = async (req, res, next) => {
    try {
        const { startYear, endYear } = req.body;
        // default: use last two years if not provided
        let s = Number(startYear) || null;
        let e = Number(endYear) || null;
        if (!s || !e) {
            // load latest two years
            const rows = await require('../db/knex')('financial_indicators').orderBy('year', 'desc').limit(2);
            if (!rows || rows.length < 2) return res.status(400).json({ message: 'Not enough data for analysis' });
            e = rows[0].year;
            s = rows[1].year;
        }

        const result = await aiService.analyzePeriod(s, e);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.explainKpi = async (req, res, next) => {
    try {
        const { kpi, year } = req.body;
        if (!kpi) return res.status(400).json({ message: 'kpi is required' });
        let y = year;
        if (!y) {
            // get latest year
            const rows = await require('../db/knex')('financial_indicators').orderBy('year', 'desc').limit(1);
            if (!rows || !rows.length) return res.status(400).json({ message: 'No data available' });
            y = rows[0].year;
        }
        const result = await aiService.explainKpi(kpi, y);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
