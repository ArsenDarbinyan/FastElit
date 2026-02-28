import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AnalyticsMiddleware } from './analytics.middleware';
import { AnalyticsController } from './analytics.controller';
import { ProductAnalyticsController } from './product-analytics.controller';
import { PageAnalyticsController } from './page-analytics.controller';
import { PageTrackerController } from './page-tracker.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController, ProductAnalyticsController, PageAnalyticsController, PageTrackerController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Отключаем старый middleware чтобы избежать конфликтов
    // consumer
    //   .apply(AnalyticsMiddleware)
    //   .forRoutes('*'); 
  }
}
