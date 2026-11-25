import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Financial from './pages/Financial';
import Factor from './pages/Factor';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import AIAnalyst from './pages/AIAnalyst';
import Support from './pages/Support';
import Contact from './pages/Contact';
import Guide from './pages/Guide';
import ImportData from './pages/ImportData';
import Layout from './components/Layout';
import { useAuth } from './auth/AuthProvider';
import { ToastContainer } from 'react-toastify';
import Spinner from './components/Spinner';

function PrivateRoute({ children, roles }) {
    const { user, loading } = useAuth();
    if (loading) return <Spinner text="Перевірка сесії..." />;
    if (!user) return <Navigate to="/login" />;
    if (roles && roles.length && !roles.includes(user.role)) return <Navigate to="/login" />;
    return children;
}

const App = () => {
    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
                <Route path="/sales" element={<PrivateRoute><Layout><Sales /></Layout></PrivateRoute>} />
                <Route path="/financial" element={<PrivateRoute><Layout><Financial /></Layout></PrivateRoute>} />
                <Route path="/factor" element={<PrivateRoute><Layout><Factor /></Layout></PrivateRoute>} />
                <Route path="/ai" element={<PrivateRoute><Layout><AIAnalyst /></Layout></PrivateRoute>} />
                <Route path="/inventory" element={<PrivateRoute><Layout><Inventory /></Layout></PrivateRoute>} />
                <Route path="/import" element={<PrivateRoute roles={["Admin"]}><Layout><ImportData /></Layout></PrivateRoute>} />
                <Route path="/reports" element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute roles={["Admin"]}><Layout><Admin /></Layout></PrivateRoute>} />
                <Route path="/guide" element={<PrivateRoute><Layout><Guide /></Layout></PrivateRoute>} />
                <Route path="/support" element={<PrivateRoute><Layout><Support /></Layout></PrivateRoute>} />
                <Route path="/contact" element={<PrivateRoute><Layout><Contact /></Layout></PrivateRoute>} />
            </Routes>
            <ToastContainer position="top-right" />
        </>
    );
};

export default App;
