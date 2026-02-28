import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ReferralLinksService } from '../referral-links/referral-links.service';

@Injectable()
export class ReferralMiddleware implements NestMiddleware {
  constructor(private readonly referralLinksService: ReferralLinksService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { rf } = req.query;

    console.log(`[ReferralMiddleware] Запрос на URL: ${req.url}`);
    console.log(`[ReferralMiddleware] Query параметры:`, req.query);
    console.log(`[ReferralMiddleware] IP клиента:`, req.ip || req.socket?.remoteAddress || '127.0.0.1');

    if (rf && typeof rf === 'string') {
      console.log(`[ReferralMiddleware] Найден реф код: ${rf}`);
      
      try {
        const ipAddress = req.ip || req.socket?.remoteAddress || '127.0.0.1';
        
        console.log(`[ReferralMiddleware] Начинаю отслеживание для кода: ${rf}, IP: ${ipAddress}`);
        
        const result = await this.referralLinksService.trackReferralClick({
          referralCode: rf,
          ipAddress: ipAddress
        });

        console.log(`[ReferralMiddleware] Успешно отслежен переход:`, result);
      } catch (error) {
        console.error(`[ReferralMiddleware] Ошибка отслеживания реф ссылки ${rf}:`, error);
        console.error(`[ReferralMiddleware] Stack trace:`, error.stack);
      }
    } else {
      console.log(`[ReferralMiddleware] Реф код не найден в запросе`);
    }

    next();
  }
}
