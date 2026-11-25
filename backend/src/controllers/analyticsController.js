const knex = require('../db/knex');

// Controller for Dashboard analytics

exports.dashboard = async (req, res, next) => {
    try {
        // Latest financial indicators (by year)
        const fi = await knex('financial_indicators').orderBy('year', 'desc').first();

        const revenue = fi ? Number(fi.revenue) : 0;
        const profit = fi ? Number(fi.profit) : 0;
        const expenses = +(revenue - profit).toFixed(2);
        const profitability = fi ? Number(fi.profitability) : (revenue ? +(profit / revenue * 100).toFixed(2) : 0);

        // Number of sales (total count)
        const salesCountRow = await knex('sales').count('id as cnt').first();
        const salesCount = salesCountRow ? Number(salesCountRow.cnt) : 0;

        // Turnover (sum of total_price)
        const turnoverRow = await knex('sales').sum('total_price as sum').first();
        const turnover = turnoverRow && turnoverRow.sum ? Number(turnoverRow.sum) : 0;

        // Inventory totals
        const stockRow = await knex('products').sum('stock as stock').first();
        const stockTotal = stockRow && stockRow.stock ? Number(stockRow.stock) : 0;

        // Monthly revenue for last 12 months
        const months = await knex.raw(
            `SELECT strftime('%Y-%m', sale_date) as month, SUM(total_price) as revenue FROM sales WHERE sale_date >= date('now','-12 months') GROUP BY month ORDER BY month`);
        const monthly = months && months.length ? months : [];

        // Top products by revenue
        const topProducts = await knex('sales')
            .select('products.id', 'products.name')
            .sum('sales.total_price as revenue')
            .join('products', 'sales.product_id', 'products.id')
            .groupBy('products.id')
            .orderBy('revenue', 'desc')
            .limit(10);

        // Low stock warnings (threshold param)
        const threshold = Number(req.query.lowThreshold || 50);
        const lowStock = await knex('products').select('id', 'name', 'stock', 'unit').where('stock', '<', threshold).orderBy('stock', 'asc');

        res.json({
            kpis: { revenue, profit, expenses, profitability, salesCount, turnover, stockTotal },
            monthly, topProducts, lowStock
        });
    } catch (err) {
        next(err);
    }
};
