import React, { useState } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

function formatAIItem(item) {
    if (typeof item === 'string' || typeof item === 'number') return String(item);
    if (item && typeof item === 'object') {
        return Object.values(item)
            .filter(value => typeof value === 'string' || typeof value === 'number')
            .map(String)
            .join(' — ');
    }
    return '';
}

export default function AIAnalyst() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [period, setPeriod] = useState({ startYear: '', endYear: '' });

    const runAnalysis = async () => {
        setLoading(true);
        setResult(null);
        try {
            const body = {};
            if (period.startYear && period.endYear) body.startYear = Number(period.startYear), body.endYear = Number(period.endYear);
            const res = await api.post('/ai/analyze', body, {
                timeout: 300000
            });
            setResult(res.data);
        } catch (e) {
            console.error(e);
            toast.error(e.response?.data?.message || e.message || 'AI error');
        } finally { setLoading(false); }
    };

    return (
        <div>
            <h3>AI-аналітик</h3>
            <p className="text-muted">Інтерпретація наявних фінансових показників системою AI.</p>

            <div className="card p-3 mb-3">
                <div className="row g-2 align-items-end">
                    <div className="col-auto">
                        <label className="form-label">Початковий рік</label>
                        <input className="form-control" value={period.startYear} onChange={e => setPeriod({ ...period, startYear: e.target.value })} />
                    </div>
                    <div className="col-auto">
                        <label className="form-label">Кінцевий рік</label>
                        <input className="form-control" value={period.endYear} onChange={e => setPeriod({ ...period, endYear: e.target.value })} />
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-primary" disabled={loading} onClick={runAnalysis}>{loading ? 'AI аналізує...' : '✨ Виконати AI-аналіз'}</button>
                    </div>
                </div>
            </div>

            {loading && <div className="card p-3 mb-3"><Spinner /></div>}

            {result && (
                <div className="card p-3">
                    <h6>Резюме</h6>
                    <p>{result.result?.summary}</p>

                    <div className="row">
                        <div className="col-md-6">
                            <h6>Позитивні фактори</h6>
                            <ul>{(result.result?.positiveFactors || []).map((f, i) => (<li key={i}>{formatAIItem(f)}</li>))}</ul>
                        </div>
                        <div className="col-md-6">
                            <h6>Негативні фактори</h6>
                            <ul>{(result.result?.negativeFactors || []).map((f, i) => (<li key={i}>{formatAIItem(f)}</li>))}</ul>
                        </div>
                    </div>

                    <h6>Ризики</h6>
                    <ul>{(result.result?.risks || []).map((r, i) => (<li key={i}>{formatAIItem(r)}</li>))}</ul>

                    <h6>Рекомендації</h6>
                    <ul>{(result.result?.recommendations || []).map((r, i) => (<li key={i}>{formatAIItem(r)}</li>))}</ul>

                    <h6>Пояснення факторного аналізу</h6>
                    <p>{result.result?.factorAnalysisExplanation}</p>
                </div>
            )}
        </div>
    );
}
