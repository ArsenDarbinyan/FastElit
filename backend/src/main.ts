import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Включаем CORS для всех доменов
  app.enableCors({
    origin: ['http://localhost', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Обслуживаем статические файлы из uploads
  app.useStaticAssets('/app/uploads', {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log('🚀 Backend запущен на порту:', process.env.PORT ?? 3001);
  console.log('📁 Статические файлы из:', '/app/uploads');
  console.log('🔗 Префикс статических файлов: /uploads/');
}
bootstrap();
