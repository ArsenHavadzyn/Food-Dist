import React from 'react';

export default function KpiCard({ title, value, sub, onExplain }) {
    return (
        <div className="kpi-card">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{title}</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
                </div>
                <div className="text-end">
                    {sub && <div className="text-muted" style={{ fontSize: 12 }}>{sub}</div>}
                    {onExplain && (
                        <button className="btn btn-sm btn-link" onClick={onExplain} title="Пояснити AI">✨ Пояснити AI</button>
                    )}
                </div>
            </div>
        </div>
    );
}
