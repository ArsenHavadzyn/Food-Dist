const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/financialController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/financial:
 *   get:
 *     tags:
 *       - Financial
 *     summary: List financial indicators for all years
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial indicators
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FinancialIndicator'
 */
router.get('/', authenticate, ctrl.list);

/**
 * @swagger
 * /api/financial/{year}:
 *   get:
 *     tags:
 *       - Financial
 *     summary: Get financial indicator details for a specific year
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Financial indicator details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 year:
 *                   type: integer
 *                 revenue:
 *                   type: number
 *                 profit:
 *                   type: number
 *                 assets:
 *                   type: number
 *                 profitability:
 *                   type: number
 *                 liquidity:
 *                   type: number
 *                 asset_turnover:
 *                   type: number
 *                 computed:
 *                   type: object
 *       404:
 *         description: Year not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:year', authenticate, ctrl.get);

/**
 * @swagger
 * /api/financial/compute:
 *   post:
 *     tags:
 *       - Financial
 *     summary: Compute financial metrics from raw data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               revenue:
 *                 type: number
 *               profit:
 *                 type: number
 *               assets:
 *                 type: number
 *               currentAssets:
 *                 type: number
 *               currentLiabilities:
 *                 type: number
 *               employees:
 *                 type: integer
 *               materialCosts:
 *                 type: number
 *             required:
 *               - revenue
 *               - profit
 *               - assets
 *               - currentAssets
 *               - currentLiabilities
 *     responses:
 *       200:
 *         description: Computed financial metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/compute', authenticate, ctrl.compute);

module.exports = router;
