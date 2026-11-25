const factorService = require('../services/factorService');

exports.analyze = async (req, res, next) => {
    try {
        const { fixedAssets, assetTurnover } = req.body;
        const result = factorService.analyze(fixedAssets, assetTurnover);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
