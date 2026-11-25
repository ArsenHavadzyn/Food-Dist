const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportsController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/reports:
 *   get:
 *     tags:
 *       - Reports
 *     summary: List generated reports and exports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 */
router.get('/', authenticate, ctrl.list);

/**
 * @swagger
 * /api/reports/generate/pdf:
 *   post:
 *     tags:
 *       - Reports
 *     summary: Generate a PDF report from top products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Generated PDF report metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 */
router.post('/generate/pdf', authenticate, authorize(['Admin', 'Analyst']), ctrl.generatePdf);

/**
 * @swagger
 * /api/reports/generate/excel:
 *   post:
 *     tags:
 *       - Reports
 *     summary: Generate an Excel export of products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Generated Excel report metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 */
router.post('/generate/excel', authenticate, authorize(['Admin', 'Analyst']), ctrl.generateExcel);

/**
 * @swagger
 * /api/reports/export/sales-csv:
 *   post:
 *     tags:
 *       - Reports
 *     summary: Export sales data to CSV and save report record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               category:
 *                 type: integer
 *               search:
 *                 type: string
 *     responses:
 *       200:
 *         description: CSV export resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 path:
 *                   type: string
 */
router.post('/export/sales-csv', authenticate, authorize(['Admin', 'Analyst']), ctrl.exportSalesCsv);

/**
 * @swagger
 * /api/reports/export/inventory-excel:
 *   post:
 *     tags:
 *       - Reports
 *     summary: Export inventory data to Excel
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory export metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 */
router.post('/export/inventory-excel', authenticate, authorize(['Admin', 'Analyst']), ctrl.exportInventoryExcel);

module.exports = router;
