import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const instance = axios.create({ baseURL, timeout: 15000 });

// helper to set auth header
instance.setToken = token => {
    if (token) {
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // console.log('[API] Token set:', token.substring(0, 20) + '...');
    }
    else {
        delete instance.defaults.headers.common['Authorization'];
        // console.log('[API] Token cleared');
    }
};

// // Apply token synchronously from localStorage so initial requests include it
// try {
//     const _stored = localStorage.getItem('token');
//     if (_stored) {
//         instance.defaults.headers.common['Authorization'] = `Bearer ${_stored}`;
//         console.log('[API] Token loaded from localStorage:', _stored.substring(0, 20) + '...');
//     } else {
//         console.log('[API] No token in localStorage');
//     }
// } catch (e) {
//     // ignore (e.g. during SSR or restricted env)
//     console.log('[API] Error accessing localStorage:', e.message);
// }

// Ensure every request has Authorization header as a fallback to localStorage
instance.interceptors.request.use(config => {
    try {
        const stored = localStorage.getItem('token');
        if (stored) {
            config.headers = config.headers || {};
            if (!config.headers.Authorization && !config.headers.authorization) {
                config.headers.Authorization = `Bearer ${stored}`;
            }
        }
    } catch (e) {
        // ignore
    }
    return config;
});
// Add request interceptor for debugging
instance.interceptors.request.use(
    config => {
        if (config.url.includes('/products')) {
            console.log('[API] Products request:', {
                url: config.url,
                params: config.params,
                headers: config.headers
            });
        }
        return config;
    }
);
instance.interceptors.response.use(
    response => {
        if (response.config.url === '/products') {
            console.log('[API] Products response:', response.data.data ? response.data.data.length : 0, 'items');
        }
        return response;
    },
    error => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login') && typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        console.error('[API] Error:', error.response?.status, error.response?.data?.message || error.message);
        return Promise.reject(error);
    }
);

export default instance;
