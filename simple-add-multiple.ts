const { execSync } = require('child_process');

// Продукт 1
execSync(`docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "
  INSERT INTO products (title, description, price, videourl, previewurl, sellerid, createdat) 
  VALUES (
    'CG Item - Premium Account',
    'Легендарный аккаунт с редкими предметами. Полностью прокачанный персонаж.',
    25000,
    '/videos/IMG_0001.MP4',
    '/videos/IMG_0001_thumb.jpg',
    (SELECT id FROM users WHERE telegramid = '123456999789'),
    NOW()
  );
"`, { stdio: 'inherit' });

console.log('✅ Продукт 1 добавлен: CG Item - Premium Account');

// Продукт 2
execSync(`docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "
  INSERT INTO products (title, description, price, videourl, previewurl, sellerid, createdat) 
  VALUES (
    'Diamond Rank Account',
    'Аккаунт с алмазным рангом. Множество достижений и наград.',
    18000,
    '/videos/IMG_0002.MP4',
    '/videos/IMG_0002_thumb.jpg',
    (SELECT id FROM users WHERE telegramid = '123456999789'),
    NOW()
  );
"`, { stdio: 'inherit' });

console.log('✅ Продукт 2 добавлен: Diamond Rank Account');

// Продукт 3
execSync(`docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "
  INSERT INTO products (title, description, price, videourl, previewurl, sellerid, createdat) 
  VALUES (
    'VIP Gaming Account',
    'VIP аккаунт с эксклюзивными скинами и предметами.',
    35000,
    '/videos/IMG_0003.MP4',
    '/videos/IMG_0003_thumb.jpg',
    (SELECT id FROM users WHERE telegramid = '123456999789'),
    NOW()
  );
"`, { stdio: 'inherit' });

console.log('✅ Продукт 3 добавлен: VIP Gaming Account');

// Продукт 4
execSync(`docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "
  INSERT INTO products (title, description, price, videourl, previewurl, sellerid, createdat) 
  VALUES (
    'Pro Player Account',
    'Аккаунт профессионального игрока. Статистика на высшем уровне.',
    42000,
    '/videos/IMG_0004.MP4',
    '/videos/IMG_0004_thumb.jpg',
    (SELECT id FROM users WHERE telegramid = '123456999789'),
    NOW()
  );
"`, { stdio: 'inherit' });

console.log('✅ Продукт 4 добавлен: Pro Player Account');

// Продукт 5
execSync(`docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "
  INSERT INTO products (title, description, price, videourl, previewurl, sellerid, createdat) 
  VALUES (
    'Collector\'s Edition',
    'Коллекционный аккаунт с уникальными предметами. Раритетный набор.',
    55000,
    '/videos/IMG_0005.MP4',
    '/videos/IMG_0005_thumb.jpg',
    (SELECT id FROM users WHERE telegramid = '123456999789'),
    NOW()
  );
"`, { stdio: 'inherit' });

console.log('✅ Продукт 5 добавлен: Collector\'s Edition');

console.log('\n🎉 ВСЕ 5 ПРОДУКТОВ УСПЕШНО ДОБАВЛЕНЫ!');
console.log('🌐 Обновите страницу http://localhost чтобы увидеть изменения');
