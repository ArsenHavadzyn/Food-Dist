import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import KpiCard from '../components/KpiCard';

export default function Inventory() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({ search: '', category: '', lowThreshold: 50, page: 1, limit: 50 });
    const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0 });
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState({});

    useEffect(() => { fetchCategories(); loadProducts(1); }, []);

    const totalSkus = products.length;
    const totalUnits = products.reduce((s, p) => s + (Number(p.stock) || 0), 0);
    const totalValue = products.reduce((s, p) => s + ((Number(p.stock) || 0) * (Number(p.price) || 0)), 0).toFixed(2);
    const lowCount = products.filter(p => (Number(p.stock) || 0) < filters.lowThreshold).length;
    const reorderList = products.filter(p => (Number(p.stock) || 0) < filters.lowThreshold).slice(0, 8).map(p => ({ id: p.id, name: p.name, stock: p.stock, recommended: Math.max(0, 100 - (Number(p.stock) || 0)) }));

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data || []);
        } catch (err) { console.error(err); }
    };

    const loadProducts = async (page = 1) => {
        setLoading(true);
        try {
            console.log('[Inventory] loadProducts called with page:', page, 'filters:', filters);
            // Don't filter by lowThreshold in API - that's just for display
            const params = { page, limit: filters.limit, search: filters.search, category: filters.category };
            const res = await api.get('/products', { params });
            console.log('[Inventory] API response:', res.data);
            setProducts(res.data.data || []);
            setMeta(res.data.meta || { page, limit: filters.limit, total: 0 });
        } catch (err) {
            console.error('[Inventory] Error loading products:', err);
            toast.error('Помилка завантаження продуктів');
        }
        finally {
            setLoading(false);
        }
    };

    const downloadCSV = (rows, filename = 'запаси_товарів.csv') => {
        if (!rows || !rows.length) { toast.info('Немає даних для експорту'); return; }
        const headers = ['ID', 'Назва', 'Категорія', 'Ціна', 'Собівартість', 'Залишок', 'Одиниця'];
        const keys = ['id', 'name', 'category', 'price', 'cost_price', 'stock', 'unit'];
        const csvRows = [headers.join(',')];
        for (const r of rows) {
            const line = keys.map(k => {
                const v = r[k] === null || r[k] === undefined ? '' : String(r[k]).replace(/"/g, '""');
                return `"${v}"`;
            }).join(',');
            csvRows.push(line);
        }
        const csv = csvRows.join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    };

    const exportCsv = () => {
        const data = products.map(p => ({ id: p.id, name: p.name, category: p.category_name, price: p.price, cost_price: p.cost_price, stock: p.stock, unit: p.unit }));
        downloadCSV(data, 'запаси_товарів.csv');
    };

    const adjustStock = async (productId) => {
        const val = editing[productId];
        const stock = Number(val);
        if (isNaN(stock)) { toast.error('Неправильне значення'); return; }
        try {
            await api.post('/inventory/adjust', { product_id: productId, stock });
            toast.success('Оновлено');
            loadProducts(meta.page);
        } catch (err) { console.error(err); toast.error('Помилка оновлення'); }
    };

    const gotoPage = (p) => { loadProducts(p); };

    return (
        <div>
            <h3>Склад</h3>
            <p className="text-muted">Огляд наявних товарів, залишків та пропозиції до поповнення.</p>

            <div className="mb-3 kpi-grid">
                <KpiCard title="SKU" value={totalSkus} />
                <KpiCard title="Всього одиниць" value={totalUnits} />
                <KpiCard title="Загальна вартість" value={`${totalValue}`} />
                <KpiCard title="Мало на складі" value={lowCount} />
            </div>

            <div className="card p-3 mb-3">
                <div className="row g-2">
                    <div className="col-md-4">
                        <input className="form-control" placeholder="Пошук..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
                    </div>
                    <div className="col-md-3">
                        <select className="form-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                            <option value="">Всі категорії</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <input className="form-control" type="number" value={filters.lowThreshold} onChange={e => setFilters(f => ({ ...f, lowThreshold: Number(e.target.value) }))} />
                    </div>
                    <div className="col-md-3 d-flex gap-2">
                        <button className="btn btn-primary" onClick={() => loadProducts(1)}>Застосувати</button>
                        <button className="btn btn-outline-secondary" onClick={() => { setFilters({ search: '', category: '', lowThreshold: 50, page: 1, limit: 50 }); loadProducts(1); }}>Скинути</button>
                        <button className="btn btn-success" onClick={exportCsv}>Експорт CSV</button>
                    </div>
                </div>
            </div>

            <div className="card p-3">
                <div className="table-responsive">
                    <table className="table table-sm">
                        <thead>
                            <tr><th>ID</th><th>Назва</th><th>Категорія</th><th>Ціна</th><th>Собівартість</th><th>На складі</th><th>Од.</th><th>Дії</th></tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan={8}><Spinner /></td></tr> : (
                                products.length ? products.map(p => (
                                    <tr key={p.id} className={p.stock < filters.lowThreshold ? 'low-stock' : ''}>
                                        <td>{p.id}</td>
                                        <td>{p.name}</td>
                                        <td>{p.category_name}</td>
                                        <td>{p.price}</td>
                                        <td>{p.cost_price}</td>
                                        <td>{p.stock}</td>
                                        <td>{p.unit}</td>
                                        <td>
                                            {user?.role === 'Admin' ? (
                                                <div className="d-flex gap-2">
                                                    <input className="form-control form-control-sm" style={{ width: 110 }} value={editing[p.id] ?? ''} onChange={e => setEditing(s => ({ ...s, [p.id]: e.target.value }))} placeholder="Кількість" />
                                                    <button className="btn btn-sm btn-primary" onClick={() => adjustStock(p.id)}>Зберегти</button>
                                                </div>
                                            ) : <small className="text-muted">(Тільки адміністратор)</small>}
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan={8}>Немає товарів</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                    <div>Всього: {meta.total}</div>
                    <div>
                        <button className="btn btn-sm btn-outline-secondary me-2" disabled={meta.page <= 1} onClick={() => gotoPage(meta.page - 1)}>Назад</button>
                        <span>Сторінка {meta.page}</span>
                        <button className="btn btn-sm btn-outline-secondary ms-2" disabled={meta.page * meta.limit >= meta.total} onClick={() => gotoPage(meta.page + 1)}>Далі</button>
                    </div>
                </div>
            </div>

            <div className="card p-3 mt-3">
                <h6>Пропозиції до поповнення</h6>
                {reorderList.length ? (
                    <ul className="list-group list-group-flush">
                        {reorderList.map(r => (
                            <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>{r.name}</div>
                                <div><small>На складі: {r.stock} — Рекомендовано: {r.recommended}</small></div>
                            </li>
                        ))}
                    </ul>
                ) : <div className="text-muted">Немає пропозицій — запаси в межах норми.</div>}
            </div>
        </div>
    );
}
