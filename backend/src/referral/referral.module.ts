import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ReferralLinksModule } from '../referral-links/referral-links.module';
import { ReferralMiddleware } from './referral.middleware';

@Module({
  imports: [ReferralLinksModule],
})
export class ReferralModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(ReferralMiddleware)
    //   .forRoutes('*'); // Отключаем middleware чтобы избежать двойного отслеживания
  }
}
