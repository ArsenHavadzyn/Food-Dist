import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [name, setName] = useState('Звіт');
    const [title, setTitle] = useState('Згенерований звіт');
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchReports(); }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get('/reports');
            setReports(res.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const serverBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');

    const generatePdf = async () => {
        setLoading(true);
        try {
            const res = await api.post('/reports/generate/pdf', { name, title });
            toast.success('PDF згенеровано');
            fetchReports();
            const url = serverBase + res.data.path;
            window.open(encodeURI(url), '_blank');
        } catch (err) {
            console.error(err);
            toast.error('Помилка генерації PDF');
        } finally { setLoading(false); }
    };

    const generateExcel = async () => {
        setLoading(true);
        try {
            const res = await api.post('/reports/generate/excel', { name, title });
            toast.success('Excel згенеровано');
            fetchReports();
            const url = serverBase + res.data.path;
            window.open(encodeURI(url), '_blank');
        } catch (err) {
            console.error(err);
            toast.error('Помилка генерації Excel');
        } finally { setLoading(false); }
    };

    return (
        <div>
            <h3>Звіти</h3>
            <p className="text-muted">Генерація PDF / Excel звітів та перегляд наявних файлів.</p>

            <div className="card p-3 mb-3">
                <div className="row g-2 align-items-end">
                    <div className="col-md-4">
                        <label className="form-label">Назва файлу</label>
                        <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Заголовок звіту</label>
                        <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="col-md-2 d-flex gap-2">
                        <button className="btn btn-primary" onClick={generatePdf} disabled={loading}>PDF</button>
                        <button className="btn btn-outline-secondary" onClick={generateExcel} disabled={loading}>Excel</button>
                    </div>
                </div>
            </div>

            <div className="card p-3">
                <h6>Наявні звіти</h6>
                {loading && !reports.length ? <Spinner /> : (
                    <ul className="list-group list-group-flush">
                        {reports.map(r => (
                            <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <div>{r.name} <small className="text-muted">({r.type})</small></div>
                                    <div className="text-muted" style={{ fontSize: 12 }}>{new Date(r.created_at).toLocaleString()}</div>
                                </div>
                                <div>
                                    <a className="btn btn-sm btn-outline-primary" href={encodeURI(serverBase + r.path)} target="_blank" rel="noreferrer">Відкрити</a>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
