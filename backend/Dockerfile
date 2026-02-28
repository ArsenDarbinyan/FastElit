# Stage 1: Install dependencies
FROM node:20 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# Stage 3: Production image
FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Копируем миграции Prisma
COPY --from=builder /app/prisma/migrations ./prisma/migrations

USER nestjs

EXPOSE 3001

# Запускаем Prisma миграции при старте контейнера
CMD ["sh", "-c", "if [ \"$DATABASE_URL\" != \"\" ]; then echo 'Applying Prisma migrations...' && npx prisma migrate deploy || echo 'Migrations may have been applied already'; fi && node dist/src/main"]
