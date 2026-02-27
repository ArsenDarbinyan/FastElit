-- Таблица для отслеживания посетителей
CREATE TABLE IF NOT EXISTS visitors (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    referer_url VARCHAR(500),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    custom_referral_code VARCHAR(50),
    visit_count INTEGER DEFAULT 1,
    first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100)
);

-- Таблица для реферальных ссылок
CREATE TABLE IF NOT EXISTS referral_links (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200),
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    click_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0
);

-- Таблица для отслеживания кликов по реферальным ссылкам
CREATE TABLE IF NOT EXISTS referral_clicks (
    id SERIAL PRIMARY KEY,
    referral_code VARCHAR(50) NOT NULL,
    visitor_id INTEGER REFERENCES visitors(id),
    ip_address VARCHAR(45) NOT NULL,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    converted BOOLEAN DEFAULT FALSE
);

-- Таблица для общей статистики
CREATE TABLE IF NOT EXISTS site_stats (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    total_visits INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    new_visitors INTEGER DEFAULT 0,
    returning_visitors INTEGER DEFAULT 0,
    referral_visits INTEGER DEFAULT 0,
    direct_visits INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_visitors_ip ON visitors(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitors_last_visit ON visitors(last_visit);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON referral_clicks(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_date ON referral_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_site_stats_date ON site_stats(date);
