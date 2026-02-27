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
        execSync('docker ps | findstr fastelit-postgres-1', { stdio: 'pipe' });
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
main();
