// Простой анализ базы данных через psql
const { spawn } = require('child_process');

function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args);
        let output = '';
        
        process.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        process.stderr.on('data', (data) => {
            console.error('Error:', data.toString());
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });
    });
}

async function analyzeDatabase() {
    console.log('🔍 АНАЛИЗ БАЗЫ ДАННЫХ FASTELIT');
    console.log('='.repeat(60));
    
    try {
        // 1. Таблицы
        console.log('\n📋 ТАБЛИЦЫ В БАЗЕ:');
        const tables = await runCommand('psql', [
            '-h', 'localhost',
            '-p', '5432', 
            '-U', 'user',
            '-d', 'fastelit',
            '-c', `\\dt`
        ]);
        console.log(tables);
        
        // 2. Структура users
        console.log('\n👤 СТРУКТУРА ТАБЛИЦЫ USERS:');
        const usersStruct = await runCommand('psql', [
            '-h', 'localhost',
            '-p', '5432',
            '-U', 'user', 
            '-d', 'fastelit',
            '-c', `\\d users`
        ]);
        console.log(usersStruct);
        
        // 3. Структура products
        console.log('\n📦 СТРУКТУРА ТАБЛИЦЫ PRODUCTS:');
        const productsStruct = await runCommand('psql', [
            '-h', 'localhost',
            '-p', '5432',
            '-U', 'user',
            '-d', 'fastelit', 
            '-c', `\\d products`
        ]);
        console.log(productsStruct);
        
        // 4. Данные users
        console.log('\n👤 ДАННЫЕ В ТАБЛИЦЕ USERS:');
        const usersData = await runCommand('psql', [
            '-h', 'localhost',
            '-p', '5432',
            '-U', 'user',
            '-d', 'fastelit',
            '-c', `SELECT id, telegramid, username, role, createdat FROM users ORDER BY id;`
        ]);
        console.log(usersData);
        
        // 5. Данные products
        console.log('\n📦 ДАННЫЕ В ТАБЛИЦЕ PRODUCTS:');
        const productsData = await runCommand('psql', [
            '-h', 'localhost',
            '-p', '5432', 
            '-U', 'user',
            '-d', 'fastelit',
            '-c', `SELECT id, title, price, sellerid, createdat FROM products ORDER BY id;`
        ]);
        console.log(productsData);
        
        // 6. Статистика
        console.log('\n📈 СТАТИСТИКА:');
        const stats = await runCommand('psql', [
            '-h', 'localhost',
            '-p', '5432',
            '-U', 'user',
            '-d', 'fastelit',
            '-c', `
                SELECT 
                    'Users' as metric,
                    COUNT(*) as count
                FROM users
                UNION ALL
                SELECT 
                    'Products' as metric, 
                    COUNT(*) as count 
                FROM products
                UNION ALL
                SELECT 
                    'Avg Price' as metric,
                    ROUND(AVG(price), 2) as count
                FROM products
            `
        ]);
        console.log(stats);
        
        // 7. Связи между таблицами
        console.log('\n🔗 СВЯЗИ МЕЖДУ ТАБЛИЦАМИ:');
        const relations = await runCommand('psql', [
            '-h', 'localhost',
            '-p', '5432',
            '-U', 'user',
            '-d', 'fastelit',
            '-c', `
                SELECT 
                    u.username,
                    u.telegramid,
                    COUNT(p.id) as product_count
                FROM users u
                LEFT JOIN products p ON u.id = p.sellerid
                GROUP BY u.id, u.username, u.telegramid
                ORDER BY product_count DESC
            `
        ]);
        console.log(relations);
        
        console.log('\n✅ Анализ завершен!');
        console.log('\n💡 Для полного SQL анализа откройте файл: analyze-database.sql');
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

analyzeDatabase();
