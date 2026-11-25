import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();
const SESSION_EXPIRED_EVENT = 'auth:unauthorized';

function readToken() {
    try {
        return localStorage.getItem('token');
    } catch (e) {
        return null;
    }
}

function readUser() {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(readToken);
    const [user, setUser] = useState(() => readToken() ? readUser() : null);
    const [loading, setLoading] = useState(true);
    const expirationNotified = useRef(false);

    const clearSession = useCallback(() => {
        setToken(null);
        setUser(null);
        setLoading(false);
        api.setToken(null);
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } catch (e) {
            console.error('Unable to clear the saved session:', e);
        }
    }, []);

    useEffect(() => {
        let active = true;
        const handleUnauthorized = () => {
            clearSession();
            if (!expirationNotified.current) {
                expirationNotified.current = true;
                toast.info('Сеанс завершився. Увійдіть знову.');
            }
        };
        window.addEventListener(SESSION_EXPIRED_EVENT, handleUnauthorized);
        api.setToken(token);

        if (!token) {
            setUser(null);
            setLoading(false);
            return () => {
                active = false;
                window.removeEventListener(SESSION_EXPIRED_EVENT, handleUnauthorized);
            };
        }

        setLoading(true);
        api.get('/auth/me')
            .then(response => {
                if (!active) return;
                setUser(response.data);
                try {
                    localStorage.setItem('user', JSON.stringify(response.data));
                } catch (e) {
                    console.error('Unable to save the user profile:', e);
                }
            })
            .catch(error => {
                if (!active) return;
                if (error.response?.status === 401) {
                    clearSession();
                } else {
                    setUser(current => current || readUser());
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            window.removeEventListener(SESSION_EXPIRED_EVENT, handleUnauthorized);
        };
    }, [token, clearSession]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const data = res.data;
        expirationNotified.current = false;
        api.setToken(data.token);
        setToken(data.token);
        setUser(data.user);
        try {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        } catch (e) {
            console.error('Unable to persist the authenticated session:', e);
        }
        return data;
    };

    const logout = () => clearSession();

    return (
        <AuthContext.Provider value={{ token, user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
