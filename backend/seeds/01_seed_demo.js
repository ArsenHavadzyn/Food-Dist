const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');

function linspace(start, end, n) {
    const res = [];
    for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        res.push(start + (end - start) * t);
    }
    return res;
}

exports.seed = async function (knex) {
    // clean tables in dependent order
    await knex('reports').del();
    await knex('inventory').del();
    await knex('sales').del();
    await knex('financial_indicators').del();
    await knex('products').del();
    await knex('categories').del();
    await knex('users').del();

    // Users
    const adminPass = bcrypt.hashSync('Admin123!', 10);
    const analystPass = bcrypt.hashSync('Analyst123!', 10);

    await knex('users').insert([
        { id: 1, email: 'admin@demo.local', password: adminPass, name: 'Адміністратор', role: 'Admin' },
        { id: 2, email: 'analyst@demo.local', password: analystPass, name: 'Аналітик', role: 'Analyst' }
    ]);

    // Categories
    const categories = [
        { id: 1, name: 'Молочні продукти' },
        { id: 2, name: 'Напої' },
        { id: 3, name: 'Випічка' },
        { id: 4, name: 'Закуски' },
        { id: 5, name: "М'ясо" },
        { id: 6, name: 'Заморожені продукти' },
        { id: 7, name: 'Овочі та фрукти' }
    ];
    await knex('categories').insert(categories);

    // Products (ids set so seeds can reference them deterministically)
    const products = [
        { id: 1, name: 'Pringles Original 165g', category_id: 4, price: 2.50, cost_price: 1.50, stock: 400, unit: 'pcs' },
        { id: 2, name: 'Perfetti Mentos Mint 37g', category_id: 4, price: 0.95, cost_price: 0.45, stock: 800, unit: 'pcs' },
        { id: 3, name: "Starbucks Frappuccino Vanilla 250ml", category_id: 2, price: 3.50, cost_price: 2.00, stock: 250, unit: 'pcs' },
        { id: 4, name: "Ahmad Tea English Breakfast 25 bags", category_id: 2, price: 2.80, cost_price: 1.60, stock: 320, unit: 'pcs' },
        { id: 5, name: 'Lindt Lindor Milk 150g', category_id: 4, price: 5.50, cost_price: 3.00, stock: 200, unit: 'pcs' },
        { id: 6, name: 'Pastelia Fruit & Nuts Bar 40g', category_id: 4, price: 1.40, cost_price: 0.70, stock: 420, unit: 'pcs' },
        { id: 7, name: "Щедрик Медові печива 150g", category_id: 4, price: 2.20, cost_price: 1.10, stock: 300, unit: 'pcs' },
        { id: 8, name: 'РябChick Chicken Fillet 1kg', category_id: 5, price: 6.20, cost_price: 4.00, stock: 150, unit: 'kg' },
        { id: 9, name: 'ХО Перекусити Snack Mix 120g', category_id: 4, price: 1.60, cost_price: 0.80, stock: 380, unit: 'pcs' },
        { id: 10, name: 'Bel Gusto Bruschetta 100g', category_id: 4, price: 2.30, cost_price: 1.20, stock: 260, unit: 'pcs' },
        { id: 11, name: 'Dr. Oetker Ristorante Pizza 355g', category_id: 6, price: 4.20, cost_price: 2.40, stock: 210, unit: 'pcs' },
        { id: 12, name: 'Hell Energy Original 250ml', category_id: 2, price: 2.20, cost_price: 1.10, stock: 450, unit: 'pcs' },
        { id: 13, name: 'Intersnack Chio Paprika 100g', category_id: 4, price: 1.70, cost_price: 0.85, stock: 550, unit: 'pcs' },
        { id: 14, name: 'Maretti Grissini 150g', category_id: 3, price: 2.20, cost_price: 1.10, stock: 300, unit: 'pcs' },
        { id: 15, name: 'My Motto Iced Coffee 330ml', category_id: 2, price: 3.20, cost_price: 1.90, stock: 220, unit: 'pcs' },
        { id: 16, name: 'Cavendish & Harvey Fruit Drops 100g', category_id: 4, price: 3.00, cost_price: 1.60, stock: 270, unit: 'pcs' },
        { id: 17, name: 'Pringles Sour Cream & Onion 165g', category_id: 4, price: 2.50, cost_price: 1.50, stock: 350, unit: 'pcs' },
        { id: 18, name: 'Perfetti Chupa Chups Lollipop 20g', category_id: 4, price: 0.75, cost_price: 0.30, stock: 900, unit: 'pcs' },
        { id: 19, name: 'Starbucks Doubleshot Espresso 250ml', category_id: 2, price: 3.30, cost_price: 2.10, stock: 200, unit: 'pcs' },
        { id: 20, name: 'Lindt Excellence 70% 100g', category_id: 4, price: 4.20, cost_price: 2.50, stock: 260, unit: 'pcs' }
    ];

    await knex('products').insert(products);

    // Financial indicators 2016-2026 (linear progression matching demo spec)
    const years = Array.from({ length: 11 }, (_, i) => 2016 + i);
    const revenueSeries = linspace(50000, 95000, years.length);
    const profitSeries = linspace(1250, 4350, years.length);
    const assetsSeries = linspace(30000, 54000, years.length);

    const fiRows = years.map((year, i) => {
        const revenue = +revenueSeries[i].toFixed(2);
        const profit = +profitSeries[i].toFixed(2);
        const assets = +assetsSeries[i].toFixed(2);
        const profitability = +(profit / revenue * 100).toFixed(2); // percent
        const asset_turnover = +(revenue / assets).toFixed(4);
        return { year, revenue, profit, assets, profitability, asset_turnover };
    });

    await knex('financial_indicators').insert(fiRows);

    // Generate sales: monthly entries for each product from 2016-01 to 2026-12
    const salesRows = [];
    for (let y = 2016; y <= 2026; y++) {
        for (let m = 1; m <= 12; m++) {
            const date = dayjs(`${y}-${String(m).padStart(2, '0')}-15`).format('YYYY-MM-DD');
            for (const p of products) {
                // seasonal/popularity multiplier
                const base = Math.max(3, Math.round((Math.sin((m / 12) * Math.PI * 2) + 1) * 10));
                const variability = Math.round(Math.random() * 20);
                const qty = Math.max(1, Math.round(base * (Math.random() * 2 + 0.5)) + variability);
                const unit_price = p.price;
                const total_price = +(qty * unit_price).toFixed(2);
                salesRows.push({ product_id: p.id, quantity: qty, unit_price, total_price, sale_date: date, created_by: 2 });
            }
        }
    }

    // insert sales in chunks
    const chunkSize = 500;
    for (let i = 0; i < salesRows.length; i += chunkSize) {
        const chunk = salesRows.slice(i, i + chunkSize);
        await knex('sales').insert(chunk);
    }

    // Inventory snapshots (current stock)
    const inventoryRows = products.map(p => ({ product_id: p.id, stock: p.stock, recorded_at: dayjs('2026-01-01').format('YYYY-MM-DD') }));
    await knex('inventory').insert(inventoryRows);

    // Sample reports
    await knex('reports').insert([
        { name: 'Річний фінансовий звіт 2026', type: 'pdf', path: '/public/reports/financial_2026.pdf', meta: JSON.stringify({ year: 2026 }) },
        { name: 'Топ товарів 2026', type: 'xlsx', path: '/public/reports/top_products_2026.xlsx', meta: JSON.stringify({ year: 2026 }) }
    ]);
};
