import React, { useEffect, useState } from 'react';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
import RevenueChart from '../charts/RevenueChart';
import Spinner from '../components/Spinner';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [explaining, setExplaining] = useState(false);
    const [explainResult, setExplainResult] = useState(null);

    useEffect(() => {
        let mounted = true;
        api.get('/analytics/dashboard').then(res => {
            if (!mounted) return;
            setData(res.data);
        }).catch(err => {
            console.error(err);
        }).finally(() => mounted && setLoading(false));
        return () => mounted = false;
    }, []);

    const handleExplain = async (kpiKey) => {
        setExplaining(true);
        setExplainResult(null);
        try {
            const res = await api.post('/ai/explain-kpi', { kpi: kpiKey }, {
                timeout: 120000
            });
            setExplainResult(res.data.result || res.data);
        } catch (e) {
            console.error(e);
            setExplainResult({ error: e.response?.data?.message || e.message });
        } finally { setExplaining(false); }
    };

    if (loading) return <div style={{ padding: 20 }}><Spinner /></div>;

    const k = data?.kpis || {};
    const COLORS = ['#2dd4bf', '#06b6d4', '#0891b2', '#0e7490', '#164e63'];

    // Transform top products for pie chart
    const topProductsChart = (data?.topProducts || []).slice(0, 5).map(p => ({
        name: p.name.substring(0, 15),
        value: parseFloat(p.revenue) || 0
    }));

    return (
        <div>
            <h3>Панель керування</h3>
            <p className="text-muted">Огляд основних операційних показників.</p>

            <div className="card p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>AI-аналітик</strong>
                        <div className="text-muted" style={{ fontSize: 13 }}>Система може автоматично проаналізувати поточні економічні показники.</div>
                    </div>
                    <div>
                        <button className="btn btn-outline-primary" onClick={() => window.location.href = '/ai'}>✨ Виконати AI-аналіз</button>
                    </div>
                </div>
            </div>

            <div className="mb-3 kpi-grid">
                <KpiCard title="Дохід" value={`${k.revenue || 0}`} />
                <KpiCard title="Прибуток" value={`${k.profit || 0}`} />
                <KpiCard title="Витрати" value={`${k.expenses || 0}`} />
                <KpiCard title="Рентабельність" value={`${k.profitability || 0}%`} onExplain={() => handleExplain('profitability')} />
                <KpiCard title="Кількість продажів" value={`${k.salesCount || 0}`} />
                <KpiCard title="Товарообіг" value={`${k.turnover || 0}`} />
                <KpiCard title="Залишки товарів" value={`${k.stockTotal || 0}`} />
            </div>

            {explaining && <div className="my-2">AI пояснює...</div>}
            {explainResult && (
                <div className="card p-3 mb-3">
                    {explainResult.error ? (
                        <div className="text-danger">Помилка: {explainResult.error}</div>
                    ) : (
                        <>
                            <h6>Пояснення KPI</h6>
                            <pre style={{ whiteSpace: 'pre-wrap' }}>{typeof explainResult === 'string' ? explainResult : JSON.stringify(explainResult, null, 2)}</pre>
                        </>
                    )}
                </div>
            )}

            <div className="row g-3 mb-3">
                <div className="col-12 col-lg-8">
                    <div className="card p-3">
                        <h6>Дохід по місяцях</h6>
                        <RevenueChart data={data?.monthly || []} />
                    </div>
                </div>
                <div className="col-12 col-lg-4">
                    <div className="card p-3">
                        <h6>Топ товарів за доходом</h6>
                        {topProductsChart.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={topProductsChart}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {topProductsChart.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₴${value.toFixed(2)}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-muted">Немає даних</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-12 col-lg-8">
                    <div className="card p-3">
                        <h6>Топ товарів за кількістю продажів</h6>
                        <ul className="list-group list-group-flush">
                            {(data?.topProducts || []).map((p, idx) => (
                                <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <span style={{ marginRight: 10, fontWeight: 'bold', color: 'var(--primary)' }}>{idx + 1}.</span>
                                        {p.name}
                                    </div>
                                    <div className="text-end">
                                        <small>Дохід: <strong>₴{p.revenue}</strong></small>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="col-12 col-lg-4">
                    <div className="card p-3">
                        <h6 className="mb-3">Низький запас товарів</h6>
                        {(!(data?.lowStock || []).length) ? (
                            <div className="text-muted">✓ Все нормально. Запаси в межах норми.</div>
                        ) : (
                            <ul className="list-group list-group-flush">
                                {(data?.lowStock || []).map(i => (
                                    <li key={i.id} className="list-group-item d-flex justify-content-between align-items-center" style={{ background: 'rgba(255, 107, 107, 0.1)' }}>
                                        <div>{i.name}</div>
                                        <div className="text-end"><small style={{ color: '#ff6b6b' }}>{i.stock} {i.unit}</small></div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
