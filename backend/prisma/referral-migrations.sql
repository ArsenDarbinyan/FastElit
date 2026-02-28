-- Миграция для реферальных ссылок
-- Создается автоматически при сборке Docker

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
    os VARCHAR(100),
    current_url VARCHAR(500)
);

-- Таблица для реферальных ссылок
CREATE TABLE IF NOT EXISTS referral_links (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200),
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    click_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0
);

-- Таблица для отслеживания кликов по реферальным ссылкам
CREATE TABLE IF NOT EXISTS referral_clicks (
    id SERIAL PRIMARY KEY,
    referral_code VARCHAR(50) NOT NULL,
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

-- Таблица для аналитики страниц
CREATE TABLE IF NOT EXISTS page_analytics (
    id SERIAL PRIMARY KEY,
    page_path VARCHAR(200) NOT NULL,
    visitor_id INTEGER REFERENCES visitors(id),
    view_count INTEGER DEFAULT 1,
    first_view TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_view TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(page_path, visitor_id)
);

-- Таблица для аналитики продуктов
CREATE TABLE IF NOT EXISTS product_analytics (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    visitor_id INTEGER REFERENCES visitors(id),
    view_count INTEGER DEFAULT 1,
    first_view TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_view TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, visitor_id)
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_visitors_ip ON visitors(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitors_last_visit ON visitors(last_visit);
CREATE INDEX IF NOT EXISTS idx_referral_links_code ON referral_links(code);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON referral_clicks(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_date ON referral_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_visitor ON referral_clicks(ip_address);
CREATE INDEX IF NOT EXISTS idx_site_stats_date ON site_stats(date);
CREATE INDEX IF NOT EXISTS idx_page_analytics_last_view ON page_analytics(last_view DESC);
CREATE INDEX IF NOT EXISTS idx_page_analytics_page_path ON page_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_page_analytics_visitor_id ON page_analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_last_view ON product_analytics(last_view DESC);
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_visitor_id ON product_analytics(visitor_id);

-- Создаем тестовую реферальную ссылку если ее нет
INSERT INTO referral_links (code, name, description, created_by, created_at)
SELECT 'wetr', 'WETR Реклама', 'Тестовая реферальная ссылка для WETR', 1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM referral_links WHERE code = 'wetr');

-- Создаем тестовую реферальную ссылку если ее нет
INSERT INTO referral_links (code, name, description, created_by, created_at)
SELECT 'test123', 'Test Link', 'Тестовая реферальная ссылка', 1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM referral_links WHERE code = 'test123');
