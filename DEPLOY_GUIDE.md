# Руководство по деплою сайта FastElit

## Что было создано

### 1. Docker файлы
- `frontend/Dockerfile` - для Next.js приложения
- `backend/Dockerfile` - для NestJS приложения
- `.dockerignore` - исключает ненужные файлы из образов

### 2. Docker Compose конфигурация
- `docker-compose.yml` - определяет все сервисы
- `nginx.conf` - конфигурация reverse proxy

### 3. Архитектура
```
Internet → Nginx (Reverse Proxy)
                ├── Frontend (Next.js) :3000
                └── Backend (NestJS) :3001
                        ↓
                PostgreSQL Database :5432
```

## Как это работает

### Reverse Proxy конфигурация
- **Frontend**: `https://syte.com/` → перенаправляется на Next.js
- **Backend**: `https://syte.com/api/` → перенаправляется на NestJS

### Порты
- **80**: Nginx (внешний доступ)
- **3000**: Frontend (внутренний)
- **3001**: Backend (внутренний)
- **5432**: PostgreSQL (внутренний)

## Локальная проверка

### Требования
- Docker и Docker Compose установлены

### Запуск
```bash
# В корневой папке проекта
docker-compose up --build
```

### Проверка работы
1. **Frontend**: http://localhost
2. **Backend API**: http://localhost/api/
3. **Проверка контейнеров**:
```bash
docker-compose ps
```

### Логи
```bash
# Все сервисы
docker-compose logs

# Конкретный сервис
docker-compose logs frontend
docker-compose logs backend
docker-compose logs nginx
```

## Деплой на сервер

### 1. Подготовка сервера
```bash
# Установить Docker и Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установить Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Загрузка кода
```bash
# Копировать файлы на сервер
scp -r . user@server:/path/to/project

# Или использовать Git
git clone <repository-url>
cd FastElit
```

### 3. Настройка переменных окружения
Создать `.env` файл в backend:
```bash
DATABASE_URL=postgresql://user:password@postgres:5432/fastelit
JWT_SECRET=your-secret-key
```

### 4. Запуск в production
```bash
# Production режим
docker-compose -f docker-compose.yml up -d --build

# Проверка статуса
docker-compose ps
```

### 5. Настройка домена
В `nginx.conf` заменить `localhost` на ваш домен:
```nginx
server_name syte.com www.syte.com;
```

## SSL сертификаты (HTTPS)

### Использование Certbot
```bash
# Установить Certbot
sudo apt install certbot python3-certbot-nginx

# Получить сертификат
sudo certbot --nginx -d syte.com -d www.syte.com

# Автопродление
sudo crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Обновленный nginx.conf для HTTPS
```nginx
server {
    listen 80;
    server_name syte.com www.syte.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name syte.com www.syte.com;
    
    ssl_certificate /etc/letsencrypt/live/syte.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/syte.com/privkey.pem;
    
    # ... остальные настройки
}
```

## Полезные команды

### Управление контейнерами
```bash
# Остановить
docker-compose down

# Пересобрать образы
docker-compose build --no-cache

# Обновить контейнеры
docker-compose pull
docker-compose up -d

# Зайти в контейнер
docker-compose exec backend sh
docker-compose exec frontend sh
```

### Мониторинг
```bash
# Использование ресурсов
docker stats

# Диски
docker system df

# Очистка
docker system prune -a
```

## Возможные проблемы

### 1. Проблема с портами
```bash
# Проверить занятые порты
sudo netstat -tulpn | grep :80
```

### 2. Проблема с базой данных
```bash
# Проверить логи PostgreSQL
docker-compose logs postgres

# Подключиться к базе
docker-compose exec postgres psql -U user -d fastelit
```

### 3. Проблема с правами доступа
```bash
# Изменить владельца файлов
sudo chown -R $USER:$USER .
```

## Следующие шаги

1. **CI/CD**: Настроить GitHub Actions для автоматического деплоя
2. **Мониторинг**: Добавить Prometheus + Grafana
3. **Бэкапы**: Настроить регулярные бэкапы базы данных
4. **Масштабирование**: Использовать Docker Swarm или Kubernetes
