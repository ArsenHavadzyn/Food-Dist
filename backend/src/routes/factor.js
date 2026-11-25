const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/factorController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/factor/analyze:
 *   post:
 *     tags:
 *       - Factor Analysis
 *     summary: Analyze financial factor metrics from provided values
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FactorAnalysisRequest'
 *     responses:
 *       200:
 *         description: Factor analysis result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FactorAnalysisResult'
 */
router.post('/analyze', authenticate, ctrl.analyze);

module.exports = router;
