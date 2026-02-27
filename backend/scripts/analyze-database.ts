#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeDatabase() {
    console.log('🔍 АНАЛИЗ БАЗЫ ДАННЫХ FASTELIT');
    console.log('='.repeat(60));
    
    try {
        // 1. Структура таблиц
        console.log('\n📋 СТРУКТУРА ТАБЛИЦ:');
        console.log('-'.repeat(40));
        
        // Таблица users
        console.log('\n👤 ТАБЛИЦА USERS:');
        const usersStructure = await prisma.$queryRaw`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `;
        console.table(usersStructure);
        
        // Таблица products
        console.log('\n📦 ТАБЛИЦА PRODUCTS:');
        const productsStructure = await prisma.$queryRaw`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'products' 
            ORDER BY ordinal_position
        `;
        console.table(productsStructure);
        
        // 2. Связи между таблицами
        console.log('\n🔗 СВЯЗИ МЕЖДУ ТАБЛИЦАМИ:');
        console.log('-'.repeat(40));
        const foreignKeys = await prisma.$queryRaw`
            SELECT 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_schema = 'public'
        `;
        console.table(foreignKeys);
        
        // 3. Данные в таблицах
        console.log('\n📊 ДАННЫЕ В ТАБЛИЦАХ:');
        console.log('-'.repeat(40));
        
        // Пользователи
        console.log('\n👤 ПОЛЬЗОВАТЕЛИ:');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                telegramId: true,
                username: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { products: true }
                }
            }
        });
        console.table(users);
        console.log(`Всего пользователей: ${users.length}`);
        
        // Продукты
        console.log('\n📦 ПРОДУКТЫ:');
        const products = await prisma.product.findMany({
            select: {
                id: true,
                title: true,
                price: true,
                videoUrl: true,
                previewUrl: true,
                sellerId: true,
                createdAt: true,
                seller: {
                    select: {
                        username: true,
                        telegramId: true
                    }
                }
            }
        });
        console.table(products);
        console.log(`Всего продуктов: ${products.length}`);
        
        // 4. Статистика
        console.log('\n📈 СТАТИСТИКА:');
        console.log('-'.repeat(40));
        
        const userStats = await prisma.user.groupBy({
            by: ['role'],
            _count: {
                id: true
            }
        });
        console.log('Пользователи по ролям:');
        console.table(userStats);
        
        const productStats = await prisma.product.aggregate({
            _count: { id: true },
            _avg: { price: true },
            _min: { price: true },
            _max: { price: true }
        });
        console.log('\nСтатистика продуктов:');
        console.log(`Всего продуктов: ${productStats._count.id}`);
        console.log(`Средняя цена: ${productStats._avg.price} ₽`);
        console.log(`Минимальная цена: ${productStats._min.price} ₽`);
        console.log(`Максимальная цена: ${productStats._max.price} ₽`);
        
        // 5. Примеры SQL запросов
        console.log('\n💡 ПРИМЕРЫ SQL ЗАПРОСОВ:');
        console.log('-'.repeat(40));
        
        console.log('\n1. Все пользователи с их продуктами:');
        const usersWithProducts = await prisma.$queryRaw`
            SELECT 
                u.id,
                u.username,
                u.telegramid,
                u.role,
                COUNT(p.id) as product_count
            FROM users u
            LEFT JOIN products p ON u.id = p.sellerid
            GROUP BY u.id, u.username, u.telegramid, u.role
            ORDER BY product_count DESC
        `;
        console.table(usersWithProducts);
        
        console.log('\n2. Продукты с информацией о продавцах:');
        const productsWithSellers = await prisma.$queryRaw`
            SELECT 
                p.id,
                p.title,
                p.price,
                p.videourl,
                p.previewurl,
                p.createdat,
                u.username as seller_username,
                u.telegramid as seller_telegramid
            FROM products p
            JOIN users u ON p.sellerid = u.id
            ORDER BY p.createdat DESC
        `;
        console.table(productsWithSellers);
        
        console.log('\n3. Самые активные продавцы:');
        const topSellers = await prisma.$queryRaw`
            SELECT 
                u.username,
                u.telegramid,
                COUNT(p.id) as products_count,
                AVG(p.price) as avg_price,
                MIN(p.price) as min_price,
                MAX(p.price) as max_price
            FROM users u
            JOIN products p ON u.id = p.sellerid
            GROUP BY u.id, u.username, u.telegramid
            HAVING COUNT(p.id) > 0
            ORDER BY products_count DESC
        `;
        console.table(topSellers);
        
        // 6. Индексы
        console.log('\n🔍 ИНДЕКСЫ В ТАБЛИЦАХ:');
        console.log('-'.repeat(40));
        const indexes = await prisma.$queryRaw`
            SELECT 
                schemaname,
                tablename,
                indexname,
                indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname
        `;
        console.table(indexes);
        
        console.log('\n✅ Анализ завершен!');
        
    } catch (error) {
        console.error('❌ Ошибка при анализе базы данных:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Запуск анализа
if (require.main === module) {
    analyzeDatabase().catch(console.error);
}

export { analyzeDatabase };
