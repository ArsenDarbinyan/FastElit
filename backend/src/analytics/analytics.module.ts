import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AnalyticsMiddleware } from './analytics.middleware';
import { AnalyticsController } from './analytics.controller';
import { ProductAnalyticsController } from './product-analytics.controller';
import { PageAnalyticsController } from './page-analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController, ProductAnalyticsController, PageAnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AnalyticsMiddleware)
      .forRoutes('*'); // Применяем ко всем маршрутам
  }
}
