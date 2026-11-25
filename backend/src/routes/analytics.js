const express = require('express');
const router = express.Router();
const controller = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get dashboard KPI summary, top products and low stock warnings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lowThreshold
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Low stock threshold for warning list
 *     responses:
 *       200:
 *         description: Dashboard summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 kpis:
 *                   type: object
 *                 monthly:
 *                   type: array
 *                   items:
 *                     type: object
 *                 topProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                 lowStock:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/dashboard', authenticate, controller.dashboard);

module.exports = router;
