const { Client } = require('pg');

async function analyzeDatabase() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'fastelit',
        user: 'user',
        password: 'password'
    });

    try {
        await client.connect();
        console.log('🔍 АНАЛИЗ БАЗЫ ДАННЫХ FASTELIT');
        console.log('='.repeat(60));

        // 1. Таблицы
        console.log('\n📋 ТАБЛИЦЫ В БАЗЕ:');
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.table(tables.rows);

        // 2. Структура users
        console.log('\n👤 СТРУКТУРА ТАБЛИЦЫ USERS:');
        const usersStruct = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `);
        console.table(usersStruct.rows);

        // 3. Структура products
        console.log('\n📦 СТРУКТУРА ТАБЛИЦЫ PRODUCTS:');
        const productsStruct = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'products' 
            ORDER BY ordinal_position
        `);
        console.table(productsStruct.rows);

        // 4. Данные users
        console.log('\n👤 ДАННЫЕ В ТАБЛИЦЕ USERS:');
        const usersData = await client.query('SELECT id, telegramid, username, role, createdat FROM users ORDER BY id');
        console.table(usersData.rows);

        // 5. Данные products
        console.log('\n📦 ДАННЫЕ В ТАБЛИЦЕ PRODUCTS:');
        const productsData = await client.query(`
            SELECT p.id, p.title, p.price, p.videourl, p.previewurl, p.sellerid, u.username as seller_username 
            FROM products p 
            LEFT JOIN users u ON p.sellerid = u.id 
            ORDER BY p.id
        `);
        console.table(productsData.rows);

        // 6. Статистика
        console.log('\n📈 СТАТИСТИКА:');
        const userCount = await client.query('SELECT COUNT(*) as count FROM users');
        const productCount = await client.query('SELECT COUNT(*) as count FROM products');
        const priceStats = await client.query('SELECT AVG(price) as avg_price, MIN(price) as min_price, MAX(price) as max_price FROM products');
        
        console.log(`Пользователей: ${userCount.rows[0].count}`);
        console.log(`Продуктов: ${productCount.rows[0].count}`);
        console.log(`Средняя цена: ${priceStats.rows[0].avg_price} ₽`);
        console.log(`Мин. цена: ${priceStats.rows[0].min_price} ₽`);
        console.log(`Макс. цена: ${priceStats.rows[0].max_price} ₽`);

        // 7. Связи
        console.log('\n🔗 СВЯЗИ МЕЖДУ ТАБЛИЦАМИ:');
        const relations = await client.query(`
            SELECT u.username, u.telegramid, COUNT(p.id) as product_count
            FROM users u
            LEFT JOIN products p ON u.id = p.sellerid
            GROUP BY u.id, u.username, u.telegramid
            ORDER BY product_count DESC
        `);
        console.table(relations.rows);

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await client.end();
    }
}

analyzeDatabase();
