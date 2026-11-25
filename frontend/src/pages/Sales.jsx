import React, { useEffect, useState } from 'react';
import api from '../services/api';
import RevenueChart from '../charts/RevenueChart';
import KpiCard from '../components/KpiCard';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

export default function Sales() {
    const [sales, setSales] = useState([]);
    const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0 });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({ search: '', category: '', startDate: '', endDate: '', sortBy: 'sale_date', sortDir: 'desc' });
    const [monthly, setMonthly] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    useEffect(() => {
        fetchCategories();
        loadSales(1);
        loadMonthly();
        loadTopProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const loadSales = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: meta.limit, search: filters.search, category: filters.category, startDate: filters.startDate, endDate: filters.endDate, sortBy: filters.sortBy, sortDir: filters.sortDir };
            const res = await api.get('/sales', { params });
            setSales(res.data.data || []);
            setMeta(res.data.meta || { page, limit: meta.limit, total: 0 });
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Помилка завантаження продажів');
        } finally {
            setLoading(false);
        }
    };

    const loadMonthly = async () => {
        try {
            const res = await api.get('/sales/monthly', { params: { start: filters.startDate || '2016-01-01' } });
            const data = Array.isArray(res.data) ? res.data : (res.data && res.data.rows) ? res.data.rows : [];
            setMonthly(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadTopProducts = async () => {
        try {
            const res = await api.get('/sales/top');
            setTopProducts(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const applyFilters = () => {
        loadSales(1);
        loadMonthly();
    };

    const serverBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\\api$/, '');
    const exportSalesServer = async () => {
        try {
            toast.info('Генерується експорт...');
            const res = await api.post('/reports/export/sales-csv', { startDate: filters.startDate, endDate: filters.endDate, category: filters.category, search: filters.search });
            const url = serverBase + res.data.path;
            window.open(url, '_blank');
            toast.success('Експорт готовий');
        } catch (err) {
            console.error(err);
            toast.error('Не вдалось експортувати');
        }
    };

    const changeSort = (field) => {
        setFilters(f => {
            const dir = f.sortBy === field ? (f.sortDir === 'desc' ? 'asc' : 'desc') : 'desc';
            const next = { ...f, sortBy: field, sortDir: dir };
            return next;
        });
        setTimeout(() => loadSales(1), 0);
    };

    const gotoPage = (p) => { loadSales(p); };

    const totalRevenue = monthly.reduce((s, m) => s + (m.revenue || 0), 0);
    const totalQuantity = sales.reduce((s, it) => s + (it.quantity || 0), 0);

    return (
        <div>
            <h3>Аналіз продажів</h3>
            <p className="text-muted">Огляд продажів, трендів і найпопулярніших товарів.</p>

            <div className="mb-3 kpi-grid">
                <KpiCard title="Дохід (за період)" value={`${totalRevenue.toFixed(2)}`} />
                <KpiCard title="Продано одиниць" value={`${totalQuantity}`} />
                <KpiCard title="Місяців у звіті" value={`${monthly.length}`} />
            </div>

            <div className="card p-3 mb-3">
                <div className="row g-2">
                    <div className="row g-2 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label">Пошук</label>
                            <input className="form-control" placeholder="Пошук товару..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Категорія</label>
                            <select className="form-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                                <option value="">Всі категорії</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Від</label>
                            <input className="form-control" type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">До</label>
                            <input className="form-control" type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
                        </div>
                        <div className="col-md-3 d-flex gap-2">
                            <button className="btn btn-primary" onClick={applyFilters}>Застосувати</button>
                            <button className="btn btn-outline-secondary" onClick={() => { setFilters({ search: '', category: '', startDate: '', endDate: '', sortBy: 'sale_date', sortDir: 'desc' }); setTimeout(() => loadSales(1), 0); }}>Скинути</button>
                            <button className="btn btn-outline-success ms-auto" onClick={exportSalesServer}>Експорт CSV (сервер)</button>
                        </div>
                    </div>
                </div>

                <div className="row g-3">
                    <div className="col-12 col-lg-8">
                        <div className="card p-3 mb-3">
                            <h6>Продажі</h6>
                            <div className="table-responsive">
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th onClick={() => changeSort('sale_date')} style={{ cursor: 'pointer' }}>Дата</th>
                                            <th onClick={() => changeSort('product_name')} style={{ cursor: 'pointer' }}>Товар</th>
                                            <th>Категорія</th>
                                            <th onClick={() => changeSort('quantity')} style={{ cursor: 'pointer' }}>К-ть</th>
                                            <th>Ціна</th>
                                            <th onClick={() => changeSort('total_price')} style={{ cursor: 'pointer' }}>Сума</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={6}><Spinner /></td></tr>
                                        ) : (
                                            sales.length ? sales.map(s => (
                                                <tr key={s.id}>
                                                    <td>{s.sale_date}</td>
                                                    <td>{s.product_name}</td>
                                                    <td>{s.category_name}</td>
                                                    <td>{s.quantity}</td>
                                                    <td>{s.unit_price}</td>
                                                    <td>{s.total_price}</td>
                                                </tr>
                                            )) : <tr><td colSpan={6}>Немає записів</td></tr>
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
                    </div>

                    <div className="col-12 col-lg-4">
                        <div className="card p-3 mb-3">
                            <h6>Дохід за місяці</h6>
                            <RevenueChart data={monthly} />
                        </div>

                        <div className="card p-3">
                            <h6>Топ товарів</h6>
                            <ul className="list-group list-group-flush">
                                {topProducts.map(p => (
                                    <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>{p.name}</div>
                                        <div><small>{p.revenue}</small></div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
