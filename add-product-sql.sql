-- SQL для добавления нового продукта с видео
-- Замените значения в секции VALUES

INSERT INTO products (
    title, 
    description, 
    price, 
    videourl, 
    previewurl, 
    sellerid, 
    createdat
) VALUES (
    'iPhone 15 Pro Max - Новый',  -- Название продукта
    'Отличный iPhone 15 Pro Max в идеальном состоянии. Титановый корпус, 256GB, цвет Natural Titanium. Использовался 1 месяц, полный комплект с коробкой и документами.',  -- Описание
    125000,  -- Цена в рублях
    '/videos/IMG_0002.mp4',  -- Путь к видео (файл должен быть в /app/uploads/videos/)
    NULL,  -- Превью (можно добавить позже)
    (SELECT id FROM users WHERE telegramid = '123456789'),  -- ID продавца
    CURRENT_TIMESTAMP  -- Время создания
);

-- Проверка созданного продукта
SELECT id, title, videourl, price, sellerid FROM products ORDER BY id DESC LIMIT 1;
