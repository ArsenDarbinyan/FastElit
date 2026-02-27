import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

interface CreateProductDto {
  title: string;
  description: string;
  price: number;
  videoPath?: string;
  sellerTelegramId: string;
  sellerUsername?: string;
  sellerAvatarUrl?: string;
}

@Controller('seed')
export class SeedController {
  constructor(private prisma: PrismaService) {}

  private ensureDirectories() {
    const uploadsDir = './uploads';
    const videosDir = './uploads/videos';
    
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
    if (!existsSync(videosDir)) {
      mkdirSync(videosDir, { recursive: true });
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
    const targetPath = join('./uploads/videos', fileName);
    
    // Копируем видео в папку uploads
    const fs = require('fs');
    fs.copyFileSync(sourcePath, targetPath);
    
    console.log('📹 Видео скопировано в:', targetPath);
    return `/videos/${fileName}`;
  }

  @Post('add-product')
  async addProduct(@Body() data: CreateProductDto) {
    try {
      console.log('🔍 Поиск пользователя...');
      
      // Находим или создаем пользователя
      let user = await this.prisma.user.findUnique({
        where: { telegramId: data.sellerTelegramId }
      });

      if (!user) {
        console.log('👤 Создание нового пользователя...');
        user = await this.prisma.user.create({
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
      const product = await this.prisma.product.create({
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
      
      return {
        success: true,
        product: product,
        message: 'Продукт успешно создан!'
      };
    } catch (error) {
      console.error('❌ Ошибка при создании продукта:', error);
      return {
        success: false,
        error: error.message,
        message: 'Ошибка при создании продукта'
      };
    }
  }

  @Post('add-test-product')
  async addTestProduct() {
    return this.addProduct({
      title: "iPhone 15 Pro Max - Мое видео",
      description: "Отличный iPhone 15 Pro Max в идеальном состоянии. Это мое реальное видеообзрение устройства. Титановый корпус, 256GB, цвет Natural Titanium. Использовался 2 месяца, полный комплект.",
      price: 120000,
      videoPath: 'C:/Users/User/Downloads/IMG_1763.MP4',
      sellerTelegramId: "123456999789",
      sellerUsername: "real_seller",
      sellerAvatarUrl: "https://example.com/avatars/real.jpg"
    });
  }
}
