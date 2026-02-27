-- ========================================
-- ПОЛНЫЙ АНАЛИЗ БАЗЫ ДАННЫХ FASTELIT
-- ========================================

-- 1. Общая информация о базе
SELECT 
    current_database() as database_name,
    current_user() as current_user,
    version() as postgres_version;

-- 2. Все таблицы в базе
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. Структура таблицы users
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Структура таблицы products
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Первичные ключи
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.constraint_type = 'PRIMARY KEY';

-- 6. Внешние ключи
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public';

-- 7. Индексы
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 8. Данные из таблицы users
SELECT 
    id,
    telegramid,
    username,
    avatarurl,
    role,
    createdat,
    updatedat
FROM users
ORDER BY id;

-- 9. Данные из таблицы products
SELECT 
    id,
    title,
    description,
    price,
    videourl,
    previewurl,
    sellerid,
    createdat
FROM products
ORDER BY id;

-- 10. Продукты с информацией о продавцах
SELECT 
    p.id as product_id,
    p.title,
    p.description,
    p.price,
    p.videourl,
    p.previewurl,
    p.createdat as product_created,
    u.id as seller_id,
    u.username as seller_username,
    u.telegramid as seller_telegramid,
    u.role as seller_role
FROM products p
JOIN users u ON p.sellerid = u.id
ORDER BY p.id;

-- 11. Пользователи и количество их продуктов
SELECT 
    u.id,
    u.username,
    u.telegramid,
    u.role,
    u.createdat as user_created,
    COUNT(p.id) as product_count,
    COALESCE(AVG(p.price), 0) as avg_product_price,
    COALESCE(MIN(p.price), 0) as min_product_price,
    COALESCE(MAX(p.price), 0) as max_product_price
FROM users u
LEFT JOIN products p ON u.id = p.sellerid
GROUP BY u.id, u.username, u.telegramid, u.role, u.createdat
ORDER BY product_count DESC, u.id;

-- 12. Статистика по ролям пользователей
SELECT 
    role,
    COUNT(*) as user_count,
    COUNT(CASE WHEN EXISTS(SELECT 1 FROM products WHERE sellerid = users.id) THEN 1 END) as sellers_with_products
FROM users
GROUP BY role
ORDER BY user_count DESC;

-- 13. Статистика по продуктам
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN videourl IS NOT NULL THEN 1 END) as products_with_video,
    COUNT(CASE WHEN previewurl IS NOT NULL THEN 1 END) as products_with_preview,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price,
    COUNT(DISTINCT sellerid) as unique_sellers
FROM products;

-- 14. Продукты по ценовым категориям
SELECT 
    CASE 
        WHEN price < 1000 THEN 'До 1000 ₽'
        WHEN price < 5000 THEN '1000-5000 ₽'
        WHEN price < 10000 THEN '5000-10000 ₽'
        WHEN price < 50000 THEN '10000-50000 ₽'
        ELSE 'Более 50000 ₽'
    END as price_category,
    COUNT(*) as product_count,
    AVG(price) as avg_price_in_category
FROM products
GROUP BY 
    CASE 
        WHEN price < 1000 THEN 'До 1000 ₽'
        WHEN price < 5000 THEN '1000-5000 ₽'
        WHEN price < 10000 THEN '5000-10000 ₽'
        WHEN price < 50000 THEN '10000-50000 ₽'
        ELSE 'Более 50000 ₽'
    END
ORDER BY MIN(price);

-- 15. Активность по времени
SELECT 
    DATE_TRUNC('day', createdat) as date,
    COUNT(*) as products_created
FROM products
WHERE createdat >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', createdat)
ORDER BY date DESC;

-- 16. Пользователи зарегистрированные по времени
SELECT 
    DATE_TRUNC('day', createdat) as date,
    COUNT(*) as users_registered
FROM users
WHERE createdat >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', createdat)
ORDER BY date DESC;

-- 17. Проверка целостности данных
SELECT 
    'products without seller' as issue_type,
    COUNT(*) as count
FROM products p
LEFT JOIN users u ON p.sellerid = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
    'users with telegramid duplicates' as issue_type,
    COUNT(*) as count
FROM (
    SELECT telegramid, COUNT(*) as cnt
    FROM users
    GROUP BY telegramid
    HAVING COUNT(*) > 1
) dup

UNION ALL

SELECT 
    'products with empty title' as issue_type,
    COUNT(*) as count
FROM products
WHERE title IS NULL OR title = ''

UNION ALL

SELECT 
    'products with negative price' as issue_type,
    COUNT(*) as count
FROM products
WHERE price < 0;
