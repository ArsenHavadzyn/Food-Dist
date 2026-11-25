import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const [themeDark, setThemeDark] = useState(() => {
        try {
            return localStorage.getItem('theme') === 'dark';
        } catch (e) { return false; }
    });

    useEffect(() => {
        if (themeDark) document.body.classList.add('dark');
        else document.body.classList.remove('dark');
        try { localStorage.setItem('theme', themeDark ? 'dark' : 'light'); } catch (e) { }
    }, [themeDark]);

    const toggleTheme = () => setThemeDark(t => !t);

    const roleNames = { Admin: 'Адмін', Analyst: 'Аналітик' };
    const location = useLocation();

    // Ensure active nav link has inline styles to override Bootstrap defaults
    useEffect(() => {
        const all = document.querySelectorAll('.sidebar .nav-link');
        all.forEach(el => {
            el.style.backgroundColor = '';
            el.style.color = '';
            el.style.fontWeight = '';
        });
        const active = document.querySelectorAll('.sidebar .nav-link.active');
        active.forEach(el => {
            try {
                el.style.backgroundColor = 'rgba(var(--primary-rgb), 0.16)';
                el.style.color = 'var(--primary)';
                el.style.fontWeight = '600';
            } catch (e) { }
        });
    }, [location.pathname]);

    return (
        <div className="app-shell">
            <aside className="sidebar d-flex flex-column p-3">
                <Link to="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none">
                    <span className="fs-4">Аналітика дистриб'ютора</span>
                </Link>
                <hr />
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item">
                        <NavLink to="/" className="nav-link" style={({ isActive }) => isActive ? { backgroundColor: 'rgba(var(--primary-rgb), 0.16)', color: 'var(--primary)', fontWeight: 600 } : undefined}>Панель</NavLink>
                    </li>
                    <li>
                        <NavLink to="/sales" className="nav-link" style={({ isActive }) => isActive ? { backgroundColor: 'rgba(var(--primary-rgb), 0.16)', color: 'var(--primary)', fontWeight: 600 } : undefined}>Продажі</NavLink>
                    </li>
                    <li>
                        <NavLink to="/financial" className="nav-link" style={({ isActive }) => isActive ? { backgroundColor: 'rgba(var(--primary-rgb), 0.16)', color: 'var(--primary)', fontWeight: 600 } : undefined}>Фінанси</NavLink>
                    </li>
                    <li>
                        <NavLink to="/factor" className="nav-link" style={({ isActive }) => isActive ? { backgroundColor: 'rgba(var(--primary-rgb), 0.16)', color: 'var(--primary)', fontWeight: 600 } : undefined}>Факторний аналіз</NavLink>
                    </li>
                    <li>
                        <NavLink to="/inventory" className="nav-link" style={({ isActive }) => isActive ? { backgroundColor: 'rgba(var(--primary-rgb), 0.16)', color: 'var(--primary)', fontWeight: 600 } : undefined}>Склад</NavLink>
                    </li>
                    {user?.role === 'Admin' && <li><NavLink to="/import" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Імпорт даних</NavLink></li>}
                    <li>
                        <NavLink to="/reports" className="nav-link" style={({ isActive }) => isActive ? { backgroundColor: 'rgba(var(--primary-rgb), 0.16)', color: 'var(--primary)', fontWeight: 600 } : undefined}>Звіти</NavLink>
                    </li>
                    {user?.role === 'Admin' && <li><NavLink to="/admin" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Адмін</NavLink></li>}
                </ul>
                <hr />
                <ul className="nav nav-pills flex-column mb-auto">
                    <li>
                        <NavLink to="/guide" className="nav-link" style={({ isActive }) => isActive ? { backgroundColor: 'rgba(var(--primary-rgb), 0.16)', color: 'var(--primary)', fontWeight: 600 } : undefined}>📖 Посібник</NavLink>
                    </li>
                    <li>
                        <NavLink to="/support" className="nav-link" style={({ isActive }) => isActive ? { backgroundColor: 'rgba(var(--primary-rgb), 0.16)', color: 'var(--primary)', fontWeight: 600 } : undefined}>Підтримка</NavLink>
                    </li>
                    <li>
                        <NavLink to="/contact" className="nav-link" style={({ isActive }) => isActive ? { backgroundColor: 'rgba(var(--primary-rgb), 0.16)', color: 'var(--primary)', fontWeight: 600 } : undefined}>Контакти</NavLink>
                    </li>
                </ul>
                <hr />
                <div className="mt-auto">
                    <div className="mb-2">{user?.name} <small className="text-muted">({roleNames[user?.role] || user?.role})</small></div>
                    <div className="d-flex gap-2">
                        <button className={`btn btn-sm ${themeDark ? 'btn-light' : 'btn-primary'}`} onClick={toggleTheme} aria-pressed={themeDark}>
                            {themeDark ? 'Темна' : 'Світла'}
                        </button>
                        <button className="btn btn-outline-danger btn-sm" onClick={logout}>Вихід</button>
                    </div>
                </div>
            </aside>
            <main className="content">
                {children}
            </main>
        </div>
    );
}
