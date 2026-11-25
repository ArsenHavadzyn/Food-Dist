import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: '', name: '', password: '', role: 'Analyst' });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data || []);
        } catch (err) { console.error(err); toast.error('Не вдалось завантажити користувачів'); }
        finally { setLoading(false); }
    };

    const createUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', form);
            toast.success('Користувача створено');
            setForm({ email: '', name: '', password: '', role: 'Analyst' });
            fetchUsers();
        } catch (err) { console.error(err); toast.error(err.response?.data?.message || 'Помилка створення'); }
    };

    const removeUser = async (id) => {
        if (!confirm('Видалити користувача?')) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success('Користувача видалено');
            fetchUsers();
        } catch (err) { console.error(err); toast.error('Помилка видалення'); }
    };

    const updateUser = async (id, payload) => {
        try {
            await api.put(`/users/${id}`, payload);
            toast.success('Користувача оновлено');
            fetchUsers();
        } catch (err) { console.error(err); toast.error('Помилка оновлення'); }
    };

    return (
        <div>
            <h3>Адмін панель</h3>
            <div className="row g-3">
                <div className="col-md-4">
                    <div className="card p-3">
                        <h6>Створити користувача</h6>
                        <form onSubmit={createUser}>
                            <div className="mb-2">
                                <label className="form-label">Email</label>
                                <input className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                            </div>
                            <div className="mb-2">
                                <label className="form-label">Ім'я</label>
                                <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            </div>
                            <div className="mb-2">
                                <label className="form-label">Пароль</label>
                                <input type="password" className="form-control" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                            </div>
                            <div className="mb-2">
                                <label className="form-label">Роль</label>
                                <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                    <option value="Analyst">Аналітик</option>
                                    <option value="Admin">Адмін</option>
                                </select>
                            </div>
                            <button className="btn btn-primary">Створити</button>
                        </form>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card p-3">
                        <h6>Користувачі</h6>
                        <div className="table-responsive">
                            <table className="table table-sm">
                                <thead>
                                    <tr><th>Email</th><th>Ім'я</th><th>Роль</th><th>Дії</th></tr>
                                </thead>
                                <tbody>
                                    {loading ? <tr><td colSpan={4}>Завантаження...</td></tr> : (
                                        users.map(u => (
                                            <tr key={u.id}>
                                                <td>{u.email}</td>
                                                <td>{u.name}</td>
                                                <td>
                                                    <select className="form-select form-select-sm" value={u.role} onChange={e => updateUser(u.id, { role: e.target.value })}>
                                                        <option value="Analyst">Аналітик</option>
                                                        <option value="Admin">Адмін</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-danger" onClick={() => removeUser(u.id)}>Видалити</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
