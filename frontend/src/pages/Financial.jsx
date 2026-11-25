import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Financial() {
    const [form, setForm] = useState({ revenue: 0, profit: 0, assets: 0, currentAssets: 0, currentLiabilities: 0, employees: 1, materialCosts: 0 });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e && e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/financial/compute', form);
            setResult(res.data);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Помилка розрахунку');
        } finally { setLoading(false); }
    };

    // Prepare data for charts
    const chartData = result ? [
        { name: 'Дохід', value: parseFloat(form.revenue) },
        { name: 'Прибуток', value: parseFloat(form.profit) },
        { name: 'Витрати', value: parseFloat(form.revenue - form.profit) }
    ] : [];

    return (
        <div>
            <h3>Фінансовий аналіз</h3>
            <p className="text-muted">Розрахунок ключових фінансових показників.</p>

            <div className="card p-3 mb-3">
                <h6 className="mb-3">Вхідні дані</h6>
                <form onSubmit={submit} className="row g-2">
                    <div className="col-md-3">
                        <label className="form-label">Дохід (₴)</label>
                        <input type="number" className="form-control" placeholder="Введіть дохід" value={form.revenue} onChange={e => setForm(f => ({ ...f, revenue: Number(e.target.value) }))} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Прибуток (₴)</label>
                        <input type="number" className="form-control" placeholder="Введіть прибуток" value={form.profit} onChange={e => setForm(f => ({ ...f, profit: Number(e.target.value) }))} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Активи (₴)</label>
                        <input type="number" className="form-control" placeholder="Введіть активи" value={form.assets} onChange={e => setForm(f => ({ ...f, assets: Number(e.target.value) }))} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Оборотні активи (₴)</label>
                        <input type="number" className="form-control" placeholder="Оборотні активи" value={form.currentAssets} onChange={e => setForm(f => ({ ...f, currentAssets: Number(e.target.value) }))} />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Поточні зобов'язання (₴)</label>
                        <input type="number" className="form-control" placeholder="Зобов'язання" value={form.currentLiabilities} onChange={e => setForm(f => ({ ...f, currentLiabilities: Number(e.target.value) }))} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Кількість працівників</label>
                        <input type="number" className="form-control" placeholder="Працівники" value={form.employees} onChange={e => setForm(f => ({ ...f, employees: Number(e.target.value) }))} />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Матеріальні витрати (₴)</label>
                        <input type="number" className="form-control" placeholder="Матеріальні витрати" value={form.materialCosts} onChange={e => setForm(f => ({ ...f, materialCosts: Number(e.target.value) }))} />
                    </div>

                    <div className="col-md-3 d-flex align-items-end">
                        <button className="btn btn-primary w-100" disabled={loading}>{loading ? 'Розрахунок...' : 'Розрахувати'}</button>
                    </div>
                </form>
            </div>

            {result && (
                <>
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-lg-6">
                            <div className="card p-3">
                                <h6>Фінансова структура</h6>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `₴${value.toFixed(2)}`} />
                                        <Bar dataKey="value" fill="#2dd4bf" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="col-12 col-lg-6">
                            <div className="card p-3">
                                <h6>Основні показники</h6>
                                <div className="row">
                                    <div className="col-6">
                                        <div className="p-2" style={{ background: 'rgba(45, 212, 191, 0.1)', borderRadius: 6 }}>
                                            <small className="text-muted">Рентабельність</small>
                                            <div style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--primary)' }}>
                                                {result.profitability}%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-2" style={{ background: 'rgba(45, 212, 191, 0.1)', borderRadius: 6 }}>
                                            <small className="text-muted">Коеф. ліквідності</small>
                                            <div style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--primary)' }}>
                                                {result.liquidity}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6 mt-2">
                                        <div className="p-2" style={{ background: 'rgba(45, 212, 191, 0.1)', borderRadius: 6 }}>
                                            <small className="text-muted">Фондовіддача</small>
                                            <div style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--primary)' }}>
                                                {result.fundoviddacha}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6 mt-2">
                                        <div className="p-2" style={{ background: 'rgba(45, 212, 191, 0.1)', borderRadius: 6 }}>
                                            <small className="text-muted">Матеріаломісткість</small>
                                            <div style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--primary)' }}>
                                                {result.materialIntensity}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card p-3">
                        <h6>Детальні показники</h6>
                        <div className="table-responsive">
                            <table className="table table-sm">
                                <tbody>
                                    <tr>
                                        <td>Рентабельність (ROI)</td>
                                        <td><strong>{result.profitability}%</strong></td>
                                        <td>Відсоток прибутку від активів</td>
                                    </tr>
                                    <tr>
                                        <td>Коефіцієнт ліквідності</td>
                                        <td><strong>{result.liquidity}</strong></td>
                                        <td>Здатність покривати поточні зобов'язання</td>
                                    </tr>
                                    <tr>
                                        <td>Фондовіддача</td>
                                        <td><strong>{result.fundoviddacha}</strong></td>
                                        <td>Дохід на одиницю активів</td>
                                    </tr>
                                    <tr>
                                        <td>Продуктивність праці</td>
                                        <td><strong>{result.productivity}</strong></td>
                                        <td>Дохід на одного працівника</td>
                                    </tr>
                                    <tr>
                                        <td>Матеріаломісткість</td>
                                        <td><strong>{result.materialIntensity}</strong></td>
                                        <td>Витрати матеріалів на дохід</td>
                                    </tr>
                                    <tr>
                                        <td>Оборотність активів</td>
                                        <td><strong>{result.assetTurnover}</strong></td>
                                        <td>Кількість оборотів активів</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}


