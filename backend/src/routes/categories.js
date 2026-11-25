const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoriesController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: List all product categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/', authenticate, ctrl.list);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get a category by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authenticate, ctrl.get);

module.exports = router;
