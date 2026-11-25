const reportsService = require('../services/reportsService');
const knex = require('../db/knex');
const fs = require('fs');
const path = require('path');
const reportsDir = path.resolve(__dirname, '..', '..', 'public', 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

exports.list = async (req, res, next) => {
    try {
        const rows = await knex('reports').orderBy('created_at', 'desc').limit(50);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.generatePdf = async (req, res, next) => {
    try {
        const { name, title } = req.body;
        // For demo, generate a report from top products
        const rows = await knex('sales')
            .select('products.name as product', knex.raw('SUM(sales.total_price) as revenue'))
            .join('products', 'sales.product_id', 'products.id')
            .groupBy('products.id')
            .orderBy('revenue', 'desc')
            .limit(50);

        const result = await reportsService.generatePdf(name || 'top_products', title || 'Top Products', rows);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.generateExcel = async (req, res, next) => {
    try {
        const { name, title } = req.body;
        const rows = await knex('products').select('*').limit(200);
        const result = await reportsService.generateExcel(name || 'products_export', title || 'Products Export', rows);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.exportSalesCsv = async (req, res, next) => {
    try {
        const { startDate, endDate, category, search } = req.body || {};
        const q = knex('sales')
            .select('sales.id', 'sale_date', 'products.name as product', 'categories.name as category', 'sales.quantity', 'sales.unit_price', 'sales.total_price')
            .leftJoin('products', 'sales.product_id', 'products.id')
            .leftJoin('categories', 'products.category_id', 'categories.id');

        if (startDate) q.where('sale_date', '>=', startDate);
        if (endDate) q.where('sale_date', '<=', endDate);
        if (category) q.where('products.category_id', category);
        if (search) q.where('products.name', 'like', `%${search}%`);

        const rows = await q.orderBy('sale_date', 'desc').limit(10000);

        const keys = ['id', 'sale_date', 'product', 'category', 'quantity', 'unit_price', 'total_price'];
        const csvRows = [keys.join(',')];
        for (const r of rows) {
            const line = keys.map(k => `"${String(r[k] === undefined || r[k] === null ? '' : r[k]).replace(/"/g, '""')}"`).join(',');
            csvRows.push(line);
        }
        const csv = csvRows.join('\n');
        const fileName = `${Date.now()}_sales_export.csv`;
        const filePath = path.join(reportsDir, fileName);
        fs.writeFileSync(filePath, csv);

        const [id] = await knex('reports').insert({ name: 'sales_export', type: 'csv', path: `/public/reports/${fileName}`, meta: JSON.stringify({ rows: rows.length }) });
        res.json({ id, path: `/public/reports/${fileName}` });
    } catch (err) {
        next(err);
    }
};

exports.exportInventoryExcel = async (req, res, next) => {
    try {
        const rows = await knex('products').select('products.*', 'categories.name as category_name').leftJoin('categories', 'products.category_id', 'categories.id');
        const result = await reportsService.generateExcel('inventory_export', 'Inventory Export', rows);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
