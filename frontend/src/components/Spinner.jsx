import React from 'react';

export default function Spinner({ text = 'Завантаження...' }) {
    return (
        <div className="d-flex align-items-center">
            <div className="spinner-border text-primary me-2" role="status" style={{ width: '1rem', height: '1rem' }}>
                <span className="visually-hidden">{text}</span>
            </div>
            <small>{text}</small>
        </div>
    );
}
