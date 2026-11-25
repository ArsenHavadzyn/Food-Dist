import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'react-toastify';

export default function Login() {
    const [email, setEmail] = useState('admin@demo.local');
    const [password, setPassword] = useState('Admin123!');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Успішний вхід');
            nav('/');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message || 'Помилка входу');
        } finally { setLoading(false); }
    };

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
            <div className="card p-4" style={{ width: 360 }}>
                <h4 className="mb-3">Увійти</h4>
                <form onSubmit={submit}>
                    <div className="mb-2">
                        <label className="form-label">Email</label>
                        <input className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Пароль</label>
                        <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button className="btn btn-primary w-100" disabled={loading}>{loading ? 'Зачекайте...' : 'Увійти'}</button>
                </form>
                <hr />
                <small className="text-muted">
                    <div>Демо креденшли:</div>
                    <div><strong>Адміністратор:</strong> admin@demo.local / Admin123!</div>
                    <div><strong>Аналітик:</strong> analyst@demo.local / Analyst123!</div>
                </small>
            </div>
        </div>
    );
}
