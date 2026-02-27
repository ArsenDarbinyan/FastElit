import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Создаем тестового пользователя
  const user = await prisma.user.upsert({
    where: { telegramId: '123456789' },
    update: {},
    create: {
      telegramId: '123456789',
      username: 'testuser',
      role: 'USER',
    },
  });

  // Создаем тестовые продукты
  await prisma.product.createMany({
    data: [
      {
        title: 'Тестовый продукт 1',
        description: 'Это первый тестовый продукт для проверки работы бэкенда',
        price: 99.99,
        videoUrl: 'https://example.com/video1.mp4',
        previewUrl: 'https://example.com/preview1.jpg',
        sellerId: user.id,
      },
      {
        title: 'Тестовый продукт 2',
        description: 'Это второй тестовый продукт с другой ценой',
        price: 149.99,
        videoUrl: 'https://example.com/video2.mp4',
        previewUrl: 'https://example.com/preview2.jpg',
        sellerId: user.id,
      },
      {
        title: 'Бесплатный продукт',
        description: 'Этот продукт бесплатный для тестирования',
        price: 0.00,
        videoUrl: 'https://example.com/video3.mp4',
        previewUrl: 'https://example.com/preview3.jpg',
        sellerId: user.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Тестовые данные успешно добавлены!');
  console.log(`Пользователь: ${user.username} (ID: ${user.id})`);
  console.log('Добавлено 3 тестовых продукта');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
