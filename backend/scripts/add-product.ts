#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, basename, extname } from 'path';
import { execSync } from 'child_process';

// Используем переменную окружения или прямое подключение
const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/fastelit';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

interface ProductData {
  title: string;
  description: string;
  price: number;
  videoPath?: string;
  sellerTelegramId: string;
  sellerUsername?: string;
  sellerAvatarUrl?: string;
}

class ProductUploader {
  private uploadsDir = './uploads';
  private videosDir = './uploads/videos';

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
    if (!existsSync(this.videosDir)) {
      mkdirSync(this.videosDir, { recursive: true });
    }
  }

  private generateThumbnail(videoPath: string): string | null {
    try {
      console.log('🎬 Создание превью для видео...');
      
      const thumbnailPath = videoPath.replace(/\.[^.]+$/, '_thumb.jpg');
      
      // Используем ffmpeg для создания превью из первого кадра
      const command = `ffmpeg -i "${videoPath}" -ss 00:00:01.000 -vframes 1 "${thumbnailPath}" -y`;
      
      try {
        execSync(command, { stdio: 'pipe' });
        console.log('✅ Превью успешно создано:', thumbnailPath);
        return `/videos/${basename(thumbnailPath)}`;
      } catch (error) {
        console.warn('⚠️ Не удалось создать превью (ffmpeg не найден):', error);
        return null;
      }
    } catch (error) {
      console.error('❌ Ошибка при создании превью:', error);
      return null;
    }
  }

  private copyVideoToUploads(sourcePath: string): string {
    const fileName = basename(sourcePath);
    const targetPath = join(this.videosDir, fileName);
    
    // Копируем видео в папку uploads
    const fs = require('fs');
    fs.copyFileSync(sourcePath, targetPath);
    
    console.log('📹 Видео скопировано в:', targetPath);
    return `/videos/${fileName}`;
  }

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
            avatarUrl: data.sellerAvatarUrl || null,
          }
        });
      }

      let videoUrl: string | null = null;
      let previewUrl: string | null = null;

      // Обрабатываем видео если указано
      if (data.videoPath && existsSync(data.videoPath)) {
        console.log('📹 Обработка видео...');
        
        // Копируем видео в папку uploads
        videoUrl = this.copyVideoToUploads(data.videoPath);
        
        // Создаем превью
        previewUrl = this.generateThumbnail(data.videoPath);
      }

      console.log('📦 Создание продукта...');
      
      // Создаем продукт
      const product = await prisma.product.create({
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          videoUrl: videoUrl,
          previewUrl: previewUrl,
          sellerId: user.id,
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
      console.log(`   Видео: ${product.videoUrl || 'Нет видео'}`);
      console.log(`   Превью: ${product.previewUrl || 'Нет превью'}`);
      console.log(`   Продавец: ${product.seller.username}`);
      
      return product;
    } catch (error) {
      console.error('❌ Ошибка при создании продукта:', error);
      throw error;
    }
  }
}

// Примеры использования
async function main() {
  const uploader = new ProductUploader();

  // Пример 1: Продукт с вашим видео файлом
  await uploader.addProduct({
    title: "iPhone 15 Pro Max - Мое видео",
    description: "Отличный iPhone 15 Pro Max в идеальном состоянии. Это мое реальное видеообзрение устройства. Титановый корпус, 256GB, цвет Natural Titanium. Использовался 2 месяца, полный комплект.",
    price: 120000,
    videoPath: 'C:/Users/User/Downloads/IMG_1763.MP4', // Ваше видео
    sellerTelegramId: "123456999789",
    sellerUsername: "real_seller",
    sellerAvatarUrl: "https://example.com/avatars/real.jpg"
  });

}

if (require.main === module) {
  main()
    .then(() => {
      console.log('🎉 Все продукты успешно добавлены!');
      return prisma.$disconnect();
    })
    .catch((e) => {
      console.error('💥 Произошла ошибка:', e);
      prisma.$disconnect();
      process.exit(1);
    });
}

export { ProductUploader, type ProductData };
