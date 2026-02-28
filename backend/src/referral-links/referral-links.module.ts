import { Module } from '@nestjs/common';
import { ReferralLinksController } from './referral-links.controller';
import { ReferralLinksService } from './referral-links.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReferralLinksController],
  providers: [ReferralLinksService],
  exports: [ReferralLinksService],
})
export class ReferralLinksModule {}
