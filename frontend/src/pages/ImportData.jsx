import React, { useRef, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const TYPES = {
    products: {
        label: 'Товари',
        columns: 'name, price, stock',
        optional: 'cost_price, category_id або category, unit, barcode',
        example: 'name,price,cost_price,stock,unit,barcode,category'
    },
    sales: {
        label: 'Продажі',
        columns: 'product_id або product, quantity, unit_price, sale_date',
        optional: 'category (для пошуку товару за назвою)',
        example: 'sale_date,product,category,quantity,unit_price'
    },
    financial: {
        label: 'Фінансові показники',
        columns: 'year, revenue, profit, assets',
        optional: 'profitability, liquidity, asset_turnover',
        example: 'year,revenue,profit,assets,profitability,liquidity,asset_turnover'
    }
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const PREVIEW_LIMIT = 100;

export default function ImportData() {
    const [type, setType] = useState('products');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);
    const fileInput = useRef(null);

    const selectFile = event => {
        const selected = event.target.files?.[0] || null;
        setPreview(null);
        setResult(null);
        setFile(null);
        if (!selected) return;
        if (!/\.(csv|xlsx)$/i.test(selected.name)) {
            toast.error('Підтримуються лише файли CSV та XLSX.');
            event.target.value = '';
            return;
        }
        if (selected.size > MAX_FILE_SIZE) {
            toast.error('Максимальний розмір файлу — 10 МБ.');
            event.target.value = '';
            return;
        }
        setFile(selected);
    };

    const loadPreview = async () => {
        if (!file) {
            toast.error('Спочатку оберіть файл для імпорту.');
            return;
        }
        setLoadingPreview(true);
        setResult(null);
        try {
            const response = await api.post('/imports/preview', file, {
                params: { type, filename: file.name },
                headers: { 'Content-Type': 'application/octet-stream' },
                timeout: 60000
            });
            setPreview(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Не вдалося перевірити файл.');
            setPreview(null);
        } finally {
            setLoadingPreview(false);
        }
    };

    const confirmImport = async () => {
        if (!file || !preview?.validCount) return;
        if (!window.confirm(`Імпортувати ${preview.validCount} коректних записів?`)) return;

        setImporting(true);
        try {
            const response = await api.post('/imports/confirm', file, {
                params: { type, filename: file.name },
                headers: { 'Content-Type': 'application/octet-stream' },
                timeout: 60000
            });
            setResult(response.data);
            if (response.data.errors?.length) {
                toast.warning(`Імпортовано ${response.data.imported} записів. Є рядки з помилками.`);
            } else {
                toast.success(`Успішно імпортовано ${response.data.imported} записів.`);
            }
            setPreview(null);
            setFile(null);
            if (fileInput.current) fileInput.current.value = '';
        } catch (error) {
            toast.error(error.response?.data?.message || 'Не вдалося зберегти дані.');
        } finally {
            setImporting(false);
        }
    };

    const typeDetails = TYPES[type];

    return (
        <div className="import-page">
            <h3>Імпорт даних</h3>
            <p className="text-muted">Завантажте CSV або XLSX, перевірте записи та підтвердьте їх збереження.</p>

            <div className="card p-3 mb-3">
                <h6 className="mb-3">1. Налаштування імпорту</h6>
                <div className="row g-3 align-items-end">
                    <div className="col-12 col-md-4">
                        <label className="form-label" htmlFor="import-type">Тип даних</label>
                        <select
                            id="import-type"
                            className="form-select"
                            value={type}
                            disabled={loadingPreview || importing}
                            onChange={event => {
                                setType(event.target.value);
                                setPreview(null);
                                setResult(null);
                            }}
                        >
                            {Object.entries(TYPES).map(([value, option]) => (
                                <option key={value} value={value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 col-md-5">
                        <label className="form-label" htmlFor="import-file">Файл CSV або XLSX (до 10 МБ)</label>
                        <input
                            ref={fileInput}
                            id="import-file"
                            className="form-control"
                            type="file"
                            accept=".csv,.xlsx"
                            disabled={loadingPreview || importing}
                            onChange={selectFile}
                        />
                    </div>
                    <div className="col-12 col-md-3">
                        <button
                            type="button"
                            className="btn btn-primary w-100"
                            disabled={!file || loadingPreview || importing}
                            onClick={loadPreview}
                        >
                            {loadingPreview ? 'Перевірка…' : 'Перевірити файл'}
                        </button>
                    </div>
                </div>
                <div className="mt-3 small">
                    <div><strong>Обов’язкові стовпці:</strong> <code>{typeDetails.columns}</code></div>
                    {typeDetails.optional && <div><strong>Додаткові стовпці:</strong> <code>{typeDetails.optional}</code></div>}
                    <div className="text-muted mt-1">Зразок заголовка: <code>{typeDetails.example}</code>. Дата продажу — YYYY-MM-DD.</div>
                </div>
            </div>

            {preview && (
                <section className="card p-3 mb-3" aria-live="polite">
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
                        <div>
                            <h6 className="mb-1">2. Попередній перегляд</h6>
                            <span className="text-muted small">{file?.name}</span>
                        </div>
                        <div className="d-flex flex-wrap gap-2 align-items-start">
                            <span className="badge text-bg-success">Коректно: {preview.validCount}</span>
                            <span className="badge text-bg-danger">Проблеми: {preview.invalidCount}</span>
                        </div>
                    </div>

                    {preview.rows.length > PREVIEW_LIMIT && (
                        <p className="small text-muted">Показано перші {PREVIEW_LIMIT} з {preview.rows.length} рядків.</p>
                    )}
                    <div className="table-responsive import-preview-table">
                        <table className="table table-sm table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Рядок</th>
                                    {preview.columns.map(column => <th key={column}>{column}</th>)}
                                    <th>Перевірка</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.rows.slice(0, PREVIEW_LIMIT).map(row => (
                                    <tr key={row.rowNumber}>
                                        <td>{row.rowNumber}</td>
                                        {preview.columns.map(column => (
                                            <td key={column}>{row.values[column] == null ? '—' : String(row.values[column])}</td>
                                        ))}
                                        <td className={row.errors.length ? 'text-danger' : 'text-success'}>
                                            {row.errors.length ? row.errors.join(' ') : 'Готово'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {preview.invalidCount > 0 && (
                        <details className="mt-2">
                            <summary>Усі проблемні рядки ({preview.invalidCount})</summary>
                            <ul className="import-error-list mt-2 mb-0">
                                {preview.rows.filter(row => row.errors.length > 0).map(row => (
                                    <li key={row.rowNumber}>Рядок {row.rowNumber}: {row.errors.join(' ')}</li>
                                ))}
                            </ul>
                        </details>
                    )}
                    {preview.validCount > 0 ? (
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mt-2">
                            <span className="small text-muted">До бази буде додано лише коректні рядки.</span>
                            <button type="button" className="btn btn-primary" disabled={importing} onClick={confirmImport}>
                                {importing ? 'Імпорт…' : `Підтвердити імпорт (${preview.validCount})`}
                            </button>
                        </div>
                    ) : (
                        <div className="alert alert-warning mb-0">Немає коректних рядків для імпорту. Виправте помилки у файлі та завантажте його знову.</div>
                    )}
                </section>
            )}

            {result && (
                <div className={`alert ${result.errors?.length ? 'alert-warning' : 'alert-success'}`} role="status">
                    <strong>Імпорт завершено.</strong> Збережено записів: {result.imported}.
                    {result.errors?.length > 0 && (
                        <div className="mt-2">
                            <div>Не збережено рядків: {result.errors.length}.</div>
                            <ul className="mb-0 mt-1">
                                {result.errors.slice(0, 50).map(error => (
                                    <li key={error.rowNumber}>Рядок {error.rowNumber}: {error.errors.join(' ')}</li>
                                ))}
                            </ul>
                            {result.errors.length > 50 && <div className="mt-1">Показано перші 50 помилок.</div>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
