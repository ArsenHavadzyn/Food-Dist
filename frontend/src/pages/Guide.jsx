import React, { useState } from 'react';

export default function Guide() {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            title: "1. Панель керування",
            description: "Основна сторінка з ключовими показниками",
            points: [
                "Дохід - загальна виручка за період",
                "Прибуток - чистий прибуток після витрат",
                "Витрати - операційні витрати",
                "Рентабельність - відсоток прибутку від доходу",
                "Діаграми показують продажі по місяцях і топ-товари",
                "Червона позначка означає низькі запаси товару"
            ]
        },
        {
            title: "2. Продажі",
            description: "Детальна інформація про продажі",
            points: [
                "Перегляд усіх продажів у хронологічному порядку",
                "Фільтрація по датах, категоріях, імені товару",
                "Експорт даних у CSV для аналізу",
                "Сортування по будь-якій колонці",
                "Таблиця показує кількість, ціну та дату продажу"
            ]
        },
        {
            title: "3. Склад",
            description: "Управління запасами товарів",
            points: [
                "Перегляд поточних залишків товарів",
                "Редагування кількості (тільки для адміністратора)",
                "Пошук товарів за назвою або категорією",
                "Рекомендації щодо поповнення запасів (низькі залишки)",
                "KPI: кількість SKU, вартість запасів, низькі запаси"
            ]
        },
        {
            title: "4. Фінанси",
            description: "Розрахунок ключових фінансових показників",
            points: [
                "Введіть доходи, витрати, активи, працівників",
                "Система розраховує рентабельність, ліквідність та продуктивність",
                "Діаграми показують структуру доходів і витрат",
                "Метрики пояснюють, що вони означають",
                "Допомагає побачити загальний фінансовий стан"
            ]
        },
        {
            title: "5. Факторний аналіз",
            description: "Аналіз впливу основних факторів на дохід",
            points: [
                "Вхідні дані: основні активи, оборотність, витрати",
                "Система показує, як +1% зміна кожного фактора впливає на дохід",
                "Діаграма порівнює вплив різних факторів",
                "Інтерпретація результатів представлена знизу",
                "Допомагає знайти найважливіші точки оптимізації"
            ]
        },
        {
            title: "6. Звіти",
            description: "Генерація та завантаження звітів",
            points: [
                "Створити звіт у форматі PDF або Excel",
                "Ввести назву файлу та заголовок звіту",
                "Кнопка PDF генерує документ для друку",
                "Кнопка Excel експортує дані в таблицю",
                "Завантажені звіти можна переглянути"
            ]
        },
        {
            title: "7. Адмін панель",
            description: "Управління користувачами (тільки для адміністратора)",
            points: [
                "Створити нового користувача — введіть email, ім'я, пароль та роль",
                "Редагувати роль користувача — змініть на Адмін або Аналітик",
                "Видалити користувача — видаліть обліковий запис з системи",
                "Дві ролі: Адмін (повний доступ) і Аналітик (доступ для перегляду)",
                "Демо користувачі: admin@demo.local, analyst@demo.local"
            ]
        },
        {
            title: "8. Часті операції",
            description: "Типові сценарії роботи аналітика",
            points: [
                "Перевірити продажі за період — перейти на сторінку Продажі",
                "Переглянути топ-товари — на Панелі та Продажах",
                "Експортувати звіт — на сторінці Звіти обрати PDF або Excel",
                "Перевірити фінанси — увести дані на сторінці Фінанси",
                "Аналізувати фактори — на сторінці Факторний аналіз"
            ]
        },
        {
            title: "9. Поради",
            description: "Як краще користуватися системою",
            points: [
                "💡 Включіть темну тему у верхньому меню для комфортної роботи",
                "💡 Фільтруйте дані по датах, щоб побачити тренди",
                "💡 Експортуйте CSV з Продажів для подальшого аналізу",
                "💡 Регулярно переглядайте Панель для моніторингу KPI",
                "💡 Користуйтесь пошуком, щоб швидко знайти товар"
            ]
        }
    ];

    return (
        <div>
            <h3>📖 Посібник для аналітика</h3>
            <p className="text-muted">Як користуватися системою Distributor Analytics</p>

            <div className="row g-3">
                {/* Sidebar navigation */}
                <div className="col-lg-3">
                    <div className="card p-0" style={{ position: 'sticky', top: 20 }}>
                        <div className="list-group list-group-flush">
                            {steps.map((step, idx) => (
                                <button
                                    key={idx}
                                    className="list-group-item list-group-item-action text-start"
                                    onClick={() => setActiveStep(idx)}
                                    style={{
                                        backgroundColor: activeStep === idx ? 'rgba(45, 212, 191, 0.12)' : 'transparent',
                                        borderLeftWidth: activeStep === idx ? 4 : 0,
                                        borderLeftColor: activeStep === idx ? 'var(--primary)' : 'transparent',
                                        color: activeStep === idx ? 'var(--primary)' : 'var(--text)',
                                        fontWeight: activeStep === idx ? 600 : 400
                                    }}
                                >
                                    {step.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="col-lg-9">
                    <div className="card p-4">
                        <h5 style={{ color: 'var(--primary)' }}>{steps[activeStep].title}</h5>
                        <p className="text-muted">{steps[activeStep].description}</p>

                        <div className="list-group list-group-flush">
                            {steps[activeStep].points.map((point, idx) => (
                                <div key={idx} className="list-group-item" style={{ borderColor: 'var(--border-color)' }}>
                                    <p className="mb-0">{point}</p>
                                </div>
                            ))}
                        </div>

                        {/* Navigation buttons */}
                        <div className="d-flex gap-2 mt-4">
                            <button
                                className="btn btn-outline-secondary"
                                disabled={activeStep === 0}
                                onClick={() => setActiveStep(activeStep - 1)}
                            >
                                ← Назад
                            </button>
                            <button
                                className="btn btn-outline-secondary ms-auto"
                                disabled={activeStep === steps.length - 1}
                                onClick={() => setActiveStep(activeStep + 1)}
                            >
                                Далі →
                            </button>
                        </div>

                        {/* Progress indicator */}
                        <div className="mt-3 text-center">
                            <small className="text-muted">
                                Крок {activeStep + 1} з {steps.length}
                            </small>
                            <div className="progress mt-2">
                                <div
                                    className="progress-bar"
                                    style={{
                                        width: `${((activeStep + 1) / steps.length) * 100}%`,
                                        backgroundColor: 'var(--primary)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick reference */}
                    <div className="card p-4 mt-4">
                        <h6 style={{ color: 'var(--primary)' }}>🎯 Швидкий старт</h6>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div style={{
                                    padding: '12px',
                                    background: 'rgba(45, 212, 191, 0.08)',
                                    borderRadius: '6px',
                                    borderLeft: '4px solid var(--primary)'
                                }}>
                                    <strong>Перше відвідування:</strong>
                                    <ol className="mb-0 mt-2" style={{ paddingLeft: '20px' }}>
                                        <li>Перегляньте Панель керування для знайомства</li>
                                        <li>Перейдіть на сторінку Продажі, щоб побачити операції</li>
                                        <li>Відвідайте сторінку Посібник для навчання</li>
                                    </ol>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div style={{
                                    padding: '12px',
                                    background: 'rgba(45, 212, 191, 0.08)',
                                    borderRadius: '6px',
                                    borderLeft: '4px solid var(--primary)'
                                }}>
                                    <strong>Щоденна робота:</strong>
                                    <ol className="mb-0 mt-2" style={{ paddingLeft: '20px' }}>
                                        <li>Перевірте KPI на Панелі керування</li>
                                        <li>Проаналізуйте окремі показники</li>
                                        <li>Експортуйте звіти при необхідності</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
