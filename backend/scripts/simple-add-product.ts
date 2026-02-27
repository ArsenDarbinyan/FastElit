#!/usr/bin/env ts-node

import { execSync } from 'child_process';

// Простое добавление продукта через SQL
async function addProductViaSQL() {
  try {
    console.log('🔍 Добавляем пользователя...');
    
    // Добавляем пользователя
    execSync(`docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "
      INSERT INTO users (telegramid, username, avatarurl, role, createdat, updatedat) 
      VALUES ('123456999789', 'real_seller', 'https://example.com/avatars/real.jpg', 'USER', NOW(), NOW()) 
      ON CONFLICT (telegramid) DO NOTHING;
    "`, { stdio: 'inherit' });

    console.log('📦 Добавляем продукт...');
    
    // Добавляем продукт с видео
    execSync(`docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "
      INSERT INTO products (title, description, price, videourl, previewurl, sellerid, createdat) 
      VALUES (
        'cgitem inch grem '
        'opisania chka '
        '20000'
        '/videos/IMG_0001.MP4',
        '/videos/IMG_0001_thumb.jpg',
        (SELECT id FROM users WHERE telegramid = '123456999789'),
        NOW()
      );
    "`, { stdio: 'inherit' });

    console.log('✅ Продукт успешно добавлен!');
    
    // Проверяем что добавилось
    console.log('📋 Проверяем продукты:');
    execSync(`docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "
      SELECT p.id, p.title, p.price, p.videourl, u.username 
      FROM products p 
      JOIN users u ON p.sellerid = u.id 
      ORDER BY p.id DESC LIMIT 3;
    "`, { stdio: 'inherit' });

  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

addProductViaSQL();
