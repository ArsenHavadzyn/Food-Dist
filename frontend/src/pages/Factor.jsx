import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function Factor() {
    const [fixedAssets, setFixedAssets] = useState(30000);
    const [assetTurnover, setAssetTurnover] = useState(1.5);
    const [materialCosts, setMaterialCosts] = useState(5000);
    const [laborCosts, setLaborCosts] = useState(3000);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const analyze = async () => {
        setLoading(true);
        try {
            const res = await api.post('/factor/analyze', { fixedAssets, assetTurnover, materialCosts, laborCosts });
            setResult(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Помилка');
        } finally { setLoading(false); }
    };

    // Enhanced chart data showing different scenarios
    const baseRevenue = fixedAssets * assetTurnover;
    const scenarioData = result ? [
        { scenario: 'Базова', revenue: baseRevenue, expenses: materialCosts + laborCosts },
        { scenario: '+1% засоби', revenue: baseRevenue * 1.01, expenses: materialCosts + laborCosts },
        { scenario: '+1% оборот', revenue: baseRevenue + (fixedAssets * (assetTurnover * 0.01)), expenses: materialCosts + laborCosts },
        { scenario: '-1% витрати', revenue: baseRevenue, expenses: (materialCosts + laborCosts) * 0.99 },
    ] : [];

    // Impact comparison data
    const impactData = result ? [
        { name: 'Основні засоби', impact: Math.abs(parseFloat(result.impactFixed)) || 0, color: '#ff6b6b' },
        { name: 'Фондовіддача', impact: Math.abs(parseFloat(result.impactTurn)) || 0, color: '#2dd4bf' },
        { name: 'Матеріали', impact: Math.abs(materialCosts * 0.01), color: '#ffd43b' },
        { name: 'Праця', impact: Math.abs(laborCosts * 0.01), color: '#a78bfa' },
    ] : [];

    return (
        <div>
            <h3>🔍 Факторний аналіз</h3>
            <p className="text-muted">Детальний аналіз впливу факторів на дохід і прибуток. Допомагає розуміти які лева втиснення дадуть максимальний результат.</p>

            <div className="row g-3 mb-3">
                <div className="col-12 col-lg-5">
                    <div className="card p-3">
                        <h6 className="mb-3">Вхідні параметри</h6>
                        <div className="mb-3">
                            <label className="form-label">Основні засоби (₴)</label>
                            <input className="form-control" type="number" placeholder="30000" value={fixedAssets} onChange={e => setFixedAssets(Number(e.target.value))} />
                            <small className="text-muted">Вартість обладнання, будинків, машин</small>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Фондовіддача (коефіцієнт)</label>
                            <input className="form-control" type="number" step="0.01" placeholder="1.5" value={assetTurnover} onChange={e => setAssetTurnover(Number(e.target.value))} />
                            <small className="text-muted">Дохід на 1₴ основних засобів</small>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Матеріальні витрати (₴)</label>
                            <input className="form-control" type="number" placeholder="5000" value={materialCosts} onChange={e => setMaterialCosts(Number(e.target.value))} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Трудові витрати (₴)</label>
                            <input className="form-control" type="number" placeholder="3000" value={laborCosts} onChange={e => setLaborCosts(Number(e.target.value))} />
                        </div>
                        <button className="btn btn-primary w-100" onClick={analyze} disabled={loading}>
                            {loading ? 'Розрахунок...' : '📊 Проаналізувати'}
                        </button>
                    </div>
                </div>

                {result && (
                    <div className="col-12 col-lg-7">
                        <div className="row g-2">
                            <div className="col-6">
                                <div className="card p-3" style={{ background: 'rgba(45, 212, 191, 0.1)', borderLeft: '4px solid var(--primary)' }}>
                                    <small className="text-muted">Базовий дохід</small>
                                    <div style={{ fontSize: 22, fontWeight: 'bold', color: 'var(--primary)' }}>
                                        ₴{baseRevenue.toFixed(0)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="card p-3" style={{ background: 'rgba(255, 107, 107, 0.1)', borderLeft: '4px solid #ff6b6b' }}>
                                    <small className="text-muted">Загальні витрати</small>
                                    <div style={{ fontSize: 22, fontWeight: 'bold', color: '#ff6b6b' }}>
                                        ₴{(materialCosts + laborCosts).toFixed(0)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="card p-3" style={{ background: 'rgba(61, 145, 64, 0.1)', borderLeft: '4px solid #3d9140' }}>
                                    <small className="text-muted">Чистий прибуток</small>
                                    <div style={{ fontSize: 22, fontWeight: 'bold', color: '#3d9140' }}>
                                        ₴{(baseRevenue - materialCosts - laborCosts).toFixed(0)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="card p-3" style={{ background: 'rgba(168, 139, 250, 0.1)', borderLeft: '4px solid #a78bfa' }}>
                                    <small className="text-muted">Рентабельність</small>
                                    <div style={{ fontSize: 22, fontWeight: 'bold', color: '#a78bfa' }}>
                                        {((baseRevenue - materialCosts - laborCosts) / baseRevenue * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {result && (
                <>
                    {/* Impact comparison chart */}
                    <div className="card p-3 mb-3">
                        <h6>📊 Порівняння впливу факторів (при зміні на 1%)</h6>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={impactData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `₴${value.toFixed(2)}`} />
                                <Bar dataKey="impact" fill="#2dd4bf">
                                    {impactData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <p className="text-muted small mt-2">
                            ℹ️ Чим вищий стовпець, тим більший вплив фактора на дохід. Більший вплив = більший потенціал оптимізації.
                        </p>
                    </div>

                    {/* Scenario analysis */}
                    <div className="card p-3 mb-3">
                        <h6>📈 Сценарний аналіз: Дохід vs Витрати</h6>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={scenarioData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="scenario" />
                                <YAxis />
                                <Tooltip formatter={(value) => `₴${value.toFixed(0)}`} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" name="Дохід" strokeWidth={2} />
                                <Line type="monotone" dataKey="expenses" stroke="#ff6b6b" name="Витрати" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                        <p className="text-muted small mt-2">
                            ℹ️ Показує як змінюються дохід і витрати при різних сценаріях оптимізації.
                        </p>
                    </div>

                    {/* Detailed metrics table */}
                    <div className="card p-3 mb-3">
                        <h6>📋 Деталізована таблиця впливу</h6>
                        <div className="table-responsive">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Фактор</th>
                                        <th>Поточне значення</th>
                                        <th>При +1% зміні</th>
                                        <th>Дельта (₴)</th>
                                        <th>Вплив (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="highlight-red">
                                        <td>🏭 Основні засоби</td>
                                        <td>₴{fixedAssets.toFixed(0)}</td>
                                        <td>₴{(fixedAssets * 1.01).toFixed(0)}</td>
                                        <td><strong>₴{(baseRevenue * 0.01).toFixed(2)}</strong></td>
                                        <td>{((baseRevenue * 0.01) / baseRevenue * 100).toFixed(2)}%</td>
                                    </tr>
                                    <tr className="highlight-teal">
                                        <td>🔄 Фондовіддача</td>
                                        <td>{assetTurnover.toFixed(2)}</td>
                                        <td>{(assetTurnover * 1.01).toFixed(2)}</td>
                                        <td><strong>₴{(fixedAssets * (assetTurnover * 0.01)).toFixed(2)}</strong></td>
                                        <td>{((fixedAssets * (assetTurnover * 0.01)) / baseRevenue * 100).toFixed(2)}%</td>
                                    </tr>
                                    <tr className="highlight-yellow">
                                        <td>📦 Матеріали</td>
                                        <td>₴{materialCosts.toFixed(0)}</td>
                                        <td>₴{(materialCosts * 1.01).toFixed(0)}</td>
                                        <td><strong>-₴{(materialCosts * 0.01).toFixed(2)}</strong></td>
                                        <td>{((materialCosts * 0.01) / baseRevenue * 100).toFixed(2)}%</td>
                                    </tr>
                                    <tr className="highlight-purple">
                                        <td>👥 Праця</td>
                                        <td>₴{laborCosts.toFixed(0)}</td>
                                        <td>₴{(laborCosts * 1.01).toFixed(0)}</td>
                                        <td><strong>-₴{(laborCosts * 0.01).toFixed(2)}</strong></td>
                                        <td>{((laborCosts * 0.01) / baseRevenue * 100).toFixed(2)}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="card p-3">
                        <h6>💡 Рекомендації</h6>
                        <div className="alert alert-info" style={{ borderLeftWidth: 4, borderLeftColor: 'var(--primary)' }}>
                            <strong>Висновок:</strong> {result.explanation ||
                                'Факторний аналіз показує, що найбільший вплив на дохід мають основні засоби та їхня оборотність. ' +
                                'Рекомендується сфокусуватися на: 1) Більш ефективному використанні існуючих засобів, ' +
                                '2) Оптимізації витрат на матеріали та працю.'}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
