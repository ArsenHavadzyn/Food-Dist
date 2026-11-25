const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     tags:
 *       - Inventory
 *     summary: List inventory records with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *         description: Search by product name
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter inventory by recorded date
 *     responses:
 *       200:
 *         description: Inventory records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', authenticate, ctrl.list);

/**
 * @swagger
 * /api/inventory/adjust:
 *   post:
 *     tags:
 *       - Inventory
 *     summary: Adjust product stock and store inventory snapshot
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *               stock:
 *                 type: integer
 *             required:
 *               - product_id
 *               - stock
 *     responses:
 *       200:
 *         description: Updated product stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/adjust', authenticate, authorize('Admin'), ctrl.adjust);

module.exports = router;
