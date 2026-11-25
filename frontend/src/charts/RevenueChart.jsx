import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function RevenueChart({ data }) {
    // Expect data = [{ month: 'YYYY-MM', revenue: 12345 }, ...]
    const formatted = (data || []).map(r => ({ month: r.month || r.MONTH || r.label, revenue: Number(r.revenue || r.REVENUE || r.value || 0) }));
    return (
        <div style={{ height: 300 }} className="card p-3">
            <h6>Дохід за останні місяці</h6>
            <ResponsiveContainer>
                <LineChart data={formatted}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#0d6efd" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
