const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/salesController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/sales:
 *   get:
 *     tags:
 *       - Sales
 *     summary: List sales with filtering and paging
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortDir
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *     responses:
 *       200:
 *         description: Paginated sales list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticate, ctrl.list);

/**
 * @swagger
 * /api/sales:
 *   post:
 *     tags:
 *       - Sales
 *     summary: Create a sale record and update product stock
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
 *               quantity:
 *                 type: integer
 *               unit_price:
 *                 type: number
 *             required:
 *               - product_id
 *               - quantity
 *     responses:
 *       201:
 *         description: Created sale
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticate, authorize(['Admin', 'Analyst']), ctrl.create);

/**
 * @swagger
 * /api/sales/top:
 *   get:
 *     tags:
 *       - Sales
 *     summary: Get top selling products by revenue
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top products revenue data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/top', authenticate, ctrl.topProducts);

/**
 * @swagger
 * /api/sales/monthly:
 *   get:
 *     tags:
 *       - Sales
 *     summary: Get monthly revenue series
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for monthly revenue series
 *     responses:
 *       200:
 *         description: Monthly revenue data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/monthly', authenticate, ctrl.monthlyRevenue);

module.exports = router;
