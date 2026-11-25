import React from 'react';

export default function Contact() {
    return (
        <div>
            <h3>Контакти</h3>
            <p className="text-muted">Наші офіси, телефони та способи зв'язку.</p>

            <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                    <div className="card p-3">
                        <h6 style={{ color: 'var(--primary)' }}>📍 Головний офіс</h6>
                        <div className="mt-2">
                            <strong>Distributor Analytics</strong>
                            <p>вул. Гетьмана Марцинківа, 228<br />м. Івано-Франциско, 02000<br />Україна</p>
                        </div>
                        <div>
                            <small className="text-muted">Телефон:</small>
                            <div>
                                <strong>+380 44 123-45-67</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="card p-3">
                        <h6 style={{ color: 'var(--primary)' }}>📞 Гарячу лінія</h6>
                        <div className="mt-2">
                            <strong>Для замовлень:</strong>
                            <div>+380 44 234-56-78</div>
                        </div>
                        <div className="mt-2">
                            <strong>Для підтримки:</strong>
                            <div>+380 44 345-67-89</div>
                        </div>
                        <div className="mt-2">
                            <small className="text-muted">Доступно Пн-Пт 09:00-18:00</small>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="card p-3">
                        <h6 style={{ color: 'var(--primary)' }}>✉️ Email</h6>
                        <div className="mt-2">
                            <strong>Основна пошта:</strong>
                            <div>
                                <a href="mailto:info@distributor.local" style={{ color: 'var(--primary)' }}>
                                    info@distributor.local
                                </a>
                            </div>
                        </div>
                        <div className="mt-2">
                            <strong>Підтримка:</strong>
                            <div>
                                <a href="mailto:support@distributor.local" style={{ color: 'var(--primary)' }}>
                                    support@distributor.local
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map section */}
            <div className="card p-3 mb-3">
                <h6 className="mb-3">📍 Місцезнаходження на карті</h6>
                <iframe
                    width="100%"
                    height={400}
                    style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--card-bg)'
                    }}
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.970318405356!2d30.523400!3d50.450127!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4cefb5f1234%3A0x12345678900!2sOnishka%20Str%2C%20228%2C%20Kyiv!5e0!3m2!1sen!2sua!4v1234567890"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
                <p className="text-muted small mt-2">
                    Центр Києва, вул. Гетьмана Марцинківа 228, біля метро
                </p>
            </div>

            <div className="row g-3">
                <div className="col-12 col-lg-8">
                    <div className="card p-3 mb-3">
                        <h6>Про компанію</h6>
                        <p>
                            Distributor Analytics - це комплексна система для аналізу та управління розподільчою мережею.
                            Ми надаємо інструменти для:
                        </p>
                        <ul>
                            <li>Аналізу продажів та дохідності</li>
                            <li>Управління запасами товарів</li>
                            <li>Фінансового планування</li>
                            <li>Факторного аналізу продуктивності</li>
                            <li>Генерування детальних звітів</li>
                        </ul>
                        <p>
                            Наша система допомагає розподільчим компаніям приймати дані рішення на основі актуальної інформації
                            та оптимізувати їхні операції.
                        </p>
                    </div>

                    <div className="card p-3">
                        <h6>Соціальні мережі</h6>
                        <div className="mt-3">
                            <a href="#" className="btn btn-outline-primary btn-sm me-2">📱 Facebook</a>
                            <a href="#" className="btn btn-outline-primary btn-sm me-2">🐦 Twitter</a>
                            <a href="#" className="btn btn-outline-primary btn-sm me-2">💼 LinkedIn</a>
                            <a href="#" className="btn btn-outline-primary btn-sm">📧 Telegram</a>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="card p-3">
                        <h6 className="mb-3">Час роботи</h6>
                        <div className="mb-2">
                            <small className="text-muted">Понеділок - П'ятниця</small>
                            <div><strong>09:00 - 18:00</strong></div>
                        </div>
                        <div className="mb-2">
                            <small className="text-muted">Субота</small>
                            <div><strong>10:00 - 16:00</strong></div>
                        </div>
                        <div>
                            <small className="text-muted">Неділя</small>
                            <div><strong>Вихідний</strong></div>
                        </div>
                    </div>

                    <div className="card p-3 mt-3">
                        <h6 className="mb-3">Дякуємо!</h6>
                        <p className="text-muted" style={{ fontSize: '0.9em' }}>
                            Ми цінуємо вашу довіру та готові допомогти вам 24/7 через наші контакти.
                        </p>
                        <div style={{
                            background: 'rgba(45, 212, 191, 0.1)',
                            padding: 12,
                            borderRadius: 6,
                            textAlign: 'center',
                            fontSize: '2em'
                        }}>
                            🙏
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
