#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

const prisma = new PrismaClient();

interface VideoUploadData {
  videoPath: string;
  title: string;
  description: string;
  price: number;
  sellerTelegramId: string;
  sellerUsername?: string;
  sellerAvatarUrl?: string;
}

class VideoUploader {
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
        return thumbnailPath;
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

  async uploadProductWithVideo(data: VideoUploadData) {
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

      console.log('📹 Обработка видео...');
      
      // Копируем видео в папку uploads
      const videoUrl = this.copyVideoToUploads(data.videoPath);
      
      // Создаем превью
      const previewUrl = this.generateThumbnail(data.videoPath);
      const previewUrlPath = previewUrl ? `/videos/${basename(previewUrl)}` : null;

      console.log('📦 Создание продукта...');
      
      // Создаем продукт
      const product = await prisma.product.create({
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          videoUrl: videoUrl,
          previewUrl: previewUrlPath,
          sellerId: user.id,
        },
        include: {
          seller: true
        }
      });

      console.log('✅ Продукт с видео успешно создан!');
      console.log('📋 Детали продукта:');
      console.log(`   ID: ${product.id}`);
      console.log(`   Название: ${product.title}`);
      console.log(`   Цена: ${product.price} ₽`);
      console.log(`   Видео: ${product.videoUrl}`);
      console.log(`   Превью: ${product.previewUrl || 'Нет превью'}`);
      console.log(`   Продавец: ${product.seller.username}`);
      
      return product;
    } catch (error) {
      console.error('❌ Ошибка при создании продукта с видео:', error);
      throw error;
    }
  }
}

// Пример использования
async function main() {
  const uploader = new VideoUploader();

  // Пример 1: Продукт с видео (укажите реальный путь к видео)
  try {
    await uploader.uploadProductWithVideo({
      videoPath: './sample-videos/iphone_demo.mp4', // Укажите путь к вашему видео
      title: "iPhone 15 Pro Max - Видеообзор",
      description: "Отличный iPhone 15 Pro Max в идеальном состоянии. Видеоревью показывает все функции устройства. Титановый корпус, 256GB, цвет Natural Titanium. Использовался 2 месяца, полный комплект.",
      price: 120000,
      sellerTelegramId: "123456789",
      sellerUsername: "tech_seller_pro",
      sellerAvatarUrl: "https://example.com/avatars/tech_pro.jpg"
    });
  } catch (error) {
    console.log('⚠️ Пример 1 пропущен (видео файл не найден)');
  }

  // Пример 2: Создаем тестовое видео программно
  console.log('🎬 Создание тестового видео...');
  
  // Создаем простое тестовое видео с помощью ffmpeg
  try {
    const testVideoPath = './uploads/videos/test_product.mp4';
    const ffmpegCommand = `ffmpeg -f lavfi -i testsrc=duration=10:size=320x240:rate=1 -f lavfi -i anullsrc=channel_layout=mono:sample_rate=44100 -c:v libx264 -preset ultrafast -crf 23 -c:a aac -t 10 "${testVideoPath}" -y`;
    
    try {
      execSync(ffmpegCommand, { stdio: 'pipe' });
      console.log('✅ Тестовое видео создано:', testVideoPath);
      
      await uploader.uploadProductWithVideo({
        videoPath: testVideoPath,
        title: "Тестовый продукт с видео",
        description: "Это тестовый продукт с программно созданным видео. Видео показывает тестовый паттерн для проверки работы плеера. Вы можете видеть как работает видеоплеер на сайте.",
        price: 1000,
        sellerTelegramId: "999999999",
        sellerUsername: "video_tester"
      });
    } catch (ffmpegError) {
      console.log('⚠️ ffmpeg не найден, создаем продукт без видео');
      
      // Если ffmpeg нет, создаем продукт без видео
      await uploader.uploadProductWithVideo({
        videoPath: '', // Пустой путь
        title: "Продукт без видео",
        description: "Это тестовый продукт без видео. Вы можете добавить видео позже через систему загрузки.",
        price: 500,
        sellerTelegramId: "888888888",
        sellerUsername: "no_video_seller"
      });
    }
  } catch (error) {
    console.error('❌ Ошибка при создании тестового видео:', error);
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

export { VideoUploader, type VideoUploadData };
