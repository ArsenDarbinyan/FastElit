import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
    this.logger.log('PrismaService инициализирован');
  }

  async onModuleInit() {
    this.logger.log('Подключение к базе данных...');
    try {
      await this.$connect();
      this.logger.log('Успешное подключение к базе данных');
    } catch (error) {
      this.logger.error('Ошибка подключения к базе данных:', error);
      throw error;
    }
  }
}
