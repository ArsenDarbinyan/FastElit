const { execSync } = require('child_process');

// Массив продуктов для добавления
const products = [
    {
        title: 'CG Item - Premium Account',
        description: 'Легендарный аккаунт с редкими предметами. Полностью прокачанный персонаж.',
        price: '25000',
        videoFile: 'IMG_0001.MP4',
        sellerTelegramId: '123456999789'
    },
    {
        title: 'Diamond Rank Account',
        description: 'Аккаунт с алмазным рангом. Множество достижений и наград.',
        price: '18000',
        videoFile: 'IMG_0002.MP4',
        sellerTelegramId: '123456999789'
    },
    {
        title: 'VIP Gaming Account',
        description: 'VIP аккаунт с эксклюзивными скинами и предметами.',
        price: '35000',
        videoFile: 'IMG_0003.MP4',
        sellerTelegramId: '123456999789'
    },
    {
        title: 'Pro Player Account',
        description: 'Аккаунт профессионального игрока. Статистика на высшем уровне.',
        price: '42000',
        videoFile: 'IMG_0004.MP4',
        sellerTelegramId: '123456999789'
    },
    {
        title: 'Collector\'s Edition',
        description: 'Коллекционный аккаунт с уникальными предметами. Раритетный набор.',
        price: '55000',
        videoFile: 'IMG_0005.MP4',
        sellerTelegramId: '123456999789'
    }
];

function addProduct(product) {
    console.log(`🎮 Добавляем продукт: ${product.title}`);
    
    try {
        execSync(`docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "
            INSERT INTO products (title, description, price, videourl, previewurl, sellerid, createdat) 
            VALUES (
                '${product.title}',
                '${product.description}',
                ${product.price},
                '/videos/${product.videoFile}',
                '/videos/${product.videoFile.replace('.MP4', '_thumb.jpg')}',
                (SELECT id FROM users WHERE telegramid = '${product.sellerTelegramId}'),
                NOW()
            );
        "`, { stdio: 'inherit' });
        
        console.log(`✅ Продукт "${product.title}" успешно добавлен!`);
        console.log(`💰 Цена: ${product.price} ₽`);
        console.log(`📹 Видео: ${product.videoFile}`);
        console.log('---');
        
    } catch (error) {
        console.error(`❌ Ошибка при добавлении продукта "${product.title}":`, error.message);
    }
}

function main() {
    console.log('🔥 НАЧИНАЕМ ДОБАВЛЕНИЕ ПРОДУКТОВ...');
    console.log('='.repeat(50));
    
    // Проверяем, что Docker контейнер запущен
    try {
        execSync('docker ps | grep fastelit-postgres-1', { stdio: 'pipe' });
        console.log('✅ PostgreSQL контейнер запущен');
    } catch (error) {
        console.error('❌ PostgreSQL контейнер не найден. Запустите Docker контейнеры!');
        return;
    }
    
    // Добавляем все продукты
    products.forEach((product, index) => {
        console.log(`\n📦 Продукт ${index + 1}/${products.length}`);
        addProduct(product);
    });
    
    console.log('\n🎉 ВСЕ ПРОДУКТЫ УСПЕШНО ДОБАВЛЕНЫ!');
    console.log('🌐 Обновите страницу http://localhost чтобы увидеть изменения');
}

// Запуск
if (require.main === module) {
    main();
}

module.exports = { addProduct, products };



docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "
  INSERT INTO products (title, description, price, videourl, previewurl, sellerid, createdat) 
  VALUES (
    'Defolt ',
    'description missing',
    1000,
    '/videos/IMG_0002.mp4',
    '/videos/IMG_0002_thumb.jpg',
    (SELECT id FROM users WHERE telegramid = '123456789'),
    NOW()
  );
"

// docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "
//   DELETE FROM products WHERE id = 5;
// "



// docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "
//   UPDATE products 
//   SET videourl = '/uploads/videos/IMG_0005.MP4', previewurl = '/uploads/videos/IMG_0005_thumb.jpg'
//   WHERE id = 9;"


// docker cp "C:/Users/User/Downloads/IMG_1763.MP4" fastelit-backend-1:/app/uploads/videos/

// docker cp "C:/Users/User/Downloads/IMG_1763.MP4" fastelit-backend-1:/app/uploads/videos/IMG_1763.MP4
// docker cp "C:/Users/User/Downloads/IMG_1763.MP4" fastelit-backend-1:/app/uploads/videos/IMG_1763.MP4


// docker cp "C:/Users/User/Downloads/IMG_0001.MP4" fastelit-backend-1:/app/uploads/videos/IMG_0001.MP4


// docker cp "C:/Users/User/Downloads/IMG_0002.MP4" fastelit-backend-1:/app/uploads/videos/IMG_0002.MP4

// docker cp "C:/Users/User/Downloads/IMG_0003.MP4" fastelit-backend-1:/app/uploads/videos/IMG_0003.MP4

// docker cp "C:/Users/User/Downloads/IMG_0004.MP4" fastelit-backend-1:/app/uploads/videos/IMG_0004.MP4

// docker cp "C:/Users/User/Downloads/IMG_0005.MP4" fastelit-backend-1:/app/uploads/videos/IMG_0005.MP4

// docker cp "C:/Users/User/Downloads/IMG_0006.MP4" fastelit-backend-1:/app/uploads/videos/IMG_0006.MP4


// docker-compose up -d --build frontend

// docker ps


//  docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "
//  INSERT INTO referral_links (code, name, description) VALUES
//  ('KTkTO', 'Karen toktok ', 'void'),
//  ('KKnl','Karen Kanal ', 'void'),
//  ('Enr0','im 0  ', 'void'),
//  ('Enr1','im 1  ', 'void'),
//  ('Enr2','im 2  ', 'void');
//  "

//   docker exec -it fastelit-postgres-1 psql -U user -dfastelit -c "SELECT COUNT(*) as total_visitors FROM visitors;"

//     Например, список таблиц:
//    docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "\dt"


//    Посмотреть структуру таблицы (колонки, типы)
//    docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "\d имя_таблицы"

//    Посмотреть данные таблицы    
//    docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM имя_таблицы;"







docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM products;"


// docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM _prisma_migrations;"

// docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM referral_clicks;"

// docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM referral_links;"

// docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM site_stats;"

// docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM users;"


// docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM visitors;"


// docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM direct_visits;"

//   docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM page_analytics;"



// for view visitors 

//  docker exec fastelit-postgres-1 psql -U user -d fastelit -c "SELECT page_path, COUNT(DISTINCT visitor_id) as unique_v, SUM(view_count) as total_v FROM page_analytics GROUP BY page_path;"






// http://localhost?ref=Enr0

// public | _prisma_migrations | table | user
//  public | products           | table | user
//  public | referral_clicks    | table | user
//  public | referral_links     | table | user
//  public | site_stats         | table | user
//  public | users              | table | user
//  public | visitors           | table | user


//  docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "DELETE FROM products WHERE id IN (4);"

 
//  docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "DELETE FROM referral_links WHERE id IN (1,2,3,4,5,6,7);"



// docker exec fastelit-postgres-1 psql -U user -d fastelit -c "SELECT page_path, COUNT(DISTINCT visitor_id) as unique_v, SUM(view_count) as total_v FROM page_analytics GROUP BY page_path;"

//  docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM page_analytics;"

// add user
// docker exec fastelit-postgres-1 psql -U user -d fastelit -c "INSERT INTO users (telegramid, username, role) VALUES ('123456789', 'testuser', 'USER');"

// docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM products;"

// add products

docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "
  INSERT INTO products (title, description, price, videourl, previewurl, sellerid, createdat) 
  VALUES (
    'Defolt ',
    'description missing',
    1000,
    '/videos/IMG_0002.mp4',
    '/videos/IMG_0002_thumb.jpg',
    (SELECT id FROM users WHERE telegramid = '123456789'),
    NOW()
  );
"

// add video
// docker cp "C:\Users\User\Downloads\IMG_0002.MP4" fastelit-backend-1:/app/uploads/videos/IMG_0002.mp4

// docker cp "C:/Users/User/Downloads/IMG_0006.MP4" fastelit-backend-1:/app/uploads/videos/IMG_0006.MP4
// GET http://localhost/videos/test_video.mp4 404 (Not Found)

// page_statistics   unique_visitors

// 
//  docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM visitors;"

//  docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM page_statistics;"

//  docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "SELECT * FROM referral_links;"

//delet link
//  docker exec -it fastelit-postgres-1 psql -U user -d fastelit -c "DELETE FROM referral_links  WHERE id = 3;"
// add link 
//  docker exec fastelit-postgres-1 psql -U user -d fastelit -c "INSERT INTO referral_links (code, name, description, created_by, created_at) VALUES ('new20', 'New4', 'Н', 1, CURRENT_TIMESTAMP);"


// стать протеже опытному  фрилансеру

// найти агентство которое регестрируется в рамкх  фриланс работ


