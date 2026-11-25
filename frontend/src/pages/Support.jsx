import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function Support() {
    const [form, setForm] = useState({ name: '', email: '', category: 'general', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulate sending to support
            await new Promise(r => setTimeout(r, 1000));
            toast.success('Ваше звернення отримано! Ми відповімо найскоріше.');
            setSubmitted(true);
            setForm({ name: '', email: '', category: 'general', subject: '', message: '' });
            setTimeout(() => setSubmitted(false), 3000);
        } catch (err) {
            toast.error('Помилка при відправці');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3>Технічна підтримка</h3>
            <p className="text-muted">Перш за все подивіться на часті питання нижче. Якщо у вас не знайшлася відповідь, заповніть форму.</p>

            <div className="row g-3 mb-4">
                <div className="col-12 col-lg-8">
                    <div className="card p-3 mb-3">
                        <h6>Форма звернення</h6>
                        {submitted ? (
                            <div className="alert alert-success">
                                ✓ Спасибі! Ваше звернення успішно надіслано. Очікуйте відповіді протягом 24 годин.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Ваше ім'я</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Введіть ім'я"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="your@email.com"
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Категорія питання</label>
                                    <select
                                        className="form-select"
                                        value={form.category}
                                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    >
                                        <option value="general">Загальне питання</option>
                                        <option value="technical">Технічна проблема</option>
                                        <option value="feature">Запит нової функції</option>
                                        <option value="bug">Звіт про помилку</option>
                                        <option value="account">Проблема з обліковим записом</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Тема</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Коротко опишіть суть"
                                        value={form.subject}
                                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Повідомлення</label>
                                    <textarea
                                        className="form-control"
                                        rows="5"
                                        placeholder="Детально опишіть вашу проблему або питання..."
                                        value={form.message}
                                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                        required
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Відправлення...' : 'Відправити звернення'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="card p-3">
                        <h6 className="mb-3">Час роботи підтримки</h6>
                        <div className="mb-3">
                            <strong style={{ color: 'var(--primary)' }}>Понеділок - П'ятниця</strong>
                            <div>09:00 - 18:00 GMT+2</div>
                        </div>
                        <div className="mb-3">
                            <strong style={{ color: 'var(--primary)' }}>Субота</strong>
                            <div>10:00 - 16:00 GMT+2</div>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--primary)' }}>Неділя</strong>
                            <div>Вихідний день</div>
                        </div>
                    </div>

                    <div className="card p-3 mt-3">
                        <h6 className="mb-3">Способи зв'язку</h6>
                        <div className="mb-2">
                            <small className="text-muted">Email:</small>
                            <div><strong>support@distributor.local</strong></div>
                        </div>
                        <div className="mb-2">
                            <small className="text-muted">Телефон:</small>
                            <div><strong>+380 44 123-45-67</strong></div>
                        </div>
                        <div>
                            <small className="text-muted">Адреса:</small>
                            <div><strong>Івано-Франциско, вул. Гетьмана Марцинківа 228</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
