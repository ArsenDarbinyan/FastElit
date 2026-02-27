import { Controller, Get, Post, Body, Res, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Response } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getAdminPage(@Res() res: Response) {
    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FastElit - Админ панель</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        textarea { height: 100px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
        button:hover { background: #0056b3; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; }
        .video-preview { max-width: 200px; max-height: 150px; }
        .actions { margin-top: 10px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛠️ FastElit Админ панель</h1>
        
        <div class="grid">
            <!-- Форма добавления продукта -->
            <div class="card">
                <h2>📦 Добавить продукт</h2>
                <form id="productForm">
                    <div class="form-group">
                        <label>Название продукта:</label>
                        <input type="text" id="title" required>
                    </div>
                    <div class="form-group">
                        <label>Описание:</label>
                        <textarea id="description" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Цена (₽):</label>
                        <input type="number" id="price" required>
                    </div>
                    <div class="form-group">
                        <label>Путь к видео (опционально):</label>
                        <input type="text" id="videoPath" placeholder="C:/path/to/video.mp4">
                    </div>
                    <div class="form-group">
                        <label>Telegram ID продавца:</label>
                        <input type="text" id="telegramId" required>
                    </div>
                    <div class="form-group">
                        <label>Имя продавца:</label>
                        <input type="text" id="username" required>
                    </div>
                    <div class="form-group">
                        <label>URL аватара (опционально):</label>
                        <input type="text" id="avatarUrl" placeholder="https://example.com/avatar.jpg">
                    </div>
                    <button type="submit">➕ Добавить продукт</button>
                </form>
                <div id="result"></div>
            </div>

            <!-- Список продуктов -->
            <div class="card">
                <h2>📋 Текущие продукты</h2>
                <div id="productsList"></div>
            </div>
        </div>
    </div>

    <script>
        // Загрузка продуктов
        async function loadProducts() {
            try {
                const response = await fetch('/api/admin/products');
                const products = await response.json();
                
                let html = '<table><tr><th>ID</th><th>Название</th><th>Цена</th><th>Видео</th><th>Продавец</th><th>Действия</th></tr>';
                
                products.forEach(product => {
                    html += \`<tr>
                        <td>\${product.id}</td>
                        <td>\${product.title}</td>
                        <td>\${product.price} ₽</td>
                        <td>\${product.videoUrl ? '<a href="' + product.videoUrl + '" target="_blank">📹 Видео</a>' : 'Нет'}</td>
                        <td>\${product.seller?.username || 'N/A'}</td>
                        <td>
                            <button onclick="deleteProduct(\${product.id})" style="background: #dc3545;">🗑️ Удалить</button>
                        </td>
                    </tr>\`;
                });
                
                html += '</table>';
                document.getElementById('productsList').innerHTML = html;
            } catch (error) {
                document.getElementById('productsList').innerHTML = '<div class="error">Ошибка загрузки: ' + error.message + '</div>';
            }
        }

        // Добавление продукта
        document.getElementById('productForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const data = {
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                price: parseFloat(document.getElementById('price').value),
                videoPath: document.getElementById('videoPath').value,
                sellerTelegramId: document.getElementById('telegramId').value,
                sellerUsername: document.getElementById('username').value,
                sellerAvatarUrl: document.getElementById('avatarUrl').value
            };

            try {
                const response = await fetch('/api/admin/add-product', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('result').innerHTML = '<div class="success">✅ Продукт успешно добавлен!</div>';
                    document.getElementById('productForm').reset();
                    loadProducts();
                } else {
                    document.getElementById('result').innerHTML = '<div class="error">❌ Ошибка: ' + result.error + '</div>';
                }
            } catch (error) {
                document.getElementById('result').innerHTML = '<div class="error">❌ Ошибка: ' + error.message + '</div>';
            }
        });

        // Удаление продукта
        async function deleteProduct(id) {
            if (confirm('Удалить продукт #' + id + '?')) {
                try {
                    const response = await fetch('/api/admin/delete-product/' + id, { method: 'DELETE' });
                    const result = await response.json();
                    
                    if (result.success) {
                        loadProducts();
                    } else {
                        alert('Ошибка удаления: ' + result.error);
                    }
                } catch (error) {
                    alert('Ошибка: ' + error.message);
                }
            }
        }

        // Загрузка при открытии
        loadProducts();
    </script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('products')
  async getProducts() {
    try {
      const products = await this.prisma.product.findMany({
        include: {
          seller: {
            select: {
              username: true,
              avatarUrl: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        products: products
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('add-product')
  async addProduct(@Body() data: any) {
    try {
      console.log('🔍 Добавление продукта:', data);
      
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
      if (data.videoPath) {
        console.log('📹 Обработка видео...');
        
        // Копируем видео в папку uploads
        const fs = require('fs');
        const path = require('path');
        
        if (fs.existsSync(data.videoPath)) {
          const fileName = path.basename(data.videoPath);
          const targetPath = path.join('./uploads/videos', fileName);
          
          // Создаем папку если нет
          if (!fs.existsSync('./uploads/videos')) {
            fs.mkdirSync('./uploads/videos', { recursive: true });
          }
          
          fs.copyFileSync(data.videoPath, targetPath);
          videoUrl = `/uploads/videos/${fileName}`;
          
          console.log('✅ Видео скопировано:', targetPath);
        }
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

  @Post('delete-product/:id')
  async deleteProduct(@Param('id') id: string) {
    try {
      await this.prisma.product.delete({
        where: { id: parseInt(id) }
      });

      return {
        success: true,
        message: 'Продукт успешно удален!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
