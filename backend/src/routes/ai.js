const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/aiController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * POST /api/ai/analyze
 * Body: { startYear, endYear }
 */
router.post('/analyze', authenticate, authorize(['Admin', 'Analyst']), ctrl.analyze);

/**
 * POST /api/ai/explain-kpi
 * Body: { kpi, year }
 */
router.post('/explain-kpi', authenticate, authorize(['Admin', 'Analyst']), ctrl.explainKpi);

module.exports = router;
