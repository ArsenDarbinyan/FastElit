#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

interface ProductData {
  title: string;
  description: string;
  price: number;
  videoPath: string;
  sellerTelegramId: string;
  sellerUsername?: string;
}

class ProductAdder {
  async addProduct(data: ProductData) {
    try {
      console.log('🔍 Поиск пользователя...');
      
      // Находим или создаем пользователя
      let user = await prisma.user.findUnique({
        where: { telegramId: data.sellerTelegramId }
      });

      if (!user) {
        console.log('👤 Создание нового пользователя...');
        user = await prisma.user.create({
          data: {
            telegramId: data.sellerTelegramId,
            username: data.sellerUsername || `user_${data.sellerTelegramId}`,
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }

      console.log('📹 Копирование видео...');
      
      // Копируем видео в папку uploads
      const fileName = `product_${Date.now()}.mp4`;
      const targetPath = `/app/uploads/videos/${fileName}`;
      
      try {
        execSync(`cp "${data.videoPath}" "${targetPath}"`, { stdio: 'pipe' });
        console.log('✅ Видео скопировано в:', targetPath);
      } catch (error) {
        console.error('❌ Ошибка копирования видео:', error);
        throw error;
      }

      console.log('📦 Создание продукта...');
      
      // Создаем продукт
      const product = await prisma.product.create({
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          videoUrl: `/videos/${fileName}`,
          previewUrl: null, // Можно добавить превью позже
          sellerId: user.id,
          createdAt: new Date()
        },
        include: {
          seller: true
        }
      });

      console.log('✅ Продукт успешно создан!');
      console.log('📋 Детали продукта:');
      console.log(`   ID: ${product.id}`);
      console.log(`   Название: ${product.title}`);
      console.log(`   Цена: ${product.price} ₽`);
      console.log(`   Видео: ${product.videoUrl}`);
      console.log(`   Продавец: ${product.seller.username}`);
      
      return product;
    } catch (error) {
      console.error('❌ Ошибка при создании продукта:', error);
      throw error;
    }
  }
}

// Пример использования
async function main() {
  const adder = new ProductAdder();

  // Пример 1: Добавление продукта с видео
  try {
    await adder.addProduct({
      videoPath: '/app/uploads/videos/IMG_0002.mp4', // Путь к видео в контейнере
      title: "iPhone 15 Pro Max - Новый",
      description: "Отличный iPhone 15 Pro Max в идеальном состоянии. Титановый корпус, 256GB, цвет Natural Titanium. Использовался 1 месяц, полный комплект с коробкой и документами.",
      price: 125000,
      sellerTelegramId: "123456789",
      sellerUsername: "tech_seller_pro"
    });
  } catch (error) {
    console.log('⚠️ Пример 1 пропущен (видео файл не найден)');
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('🎉 Все операции завершены!');
      return prisma.$disconnect();
    })
    .catch((e) => {
      console.error('💥 Произошла ошибка:', e);
      prisma.$disconnect();
      process.exit(1);
    });
}

export { ProductAdder, type ProductData };
