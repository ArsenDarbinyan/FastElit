import { Controller, Post, Get, Req, Res, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class PageTrackerController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track-page')
  async trackPage(@Req() req: Request, @Res() res: Response) {
    try {
      const { pagePath, pageUrl } = req.body;

      if (!pagePath) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'pagePath обязателен'
        });
      }

      const result = await this.analyticsService.trackPageView(req, pagePath);

      console.log(`[PageTracker] Отслежена страница: ${pagePath}, посетитель: ${result.visitorId}, новый: ${result.isNewVisitor}`);

      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error('[PageTracker] Ошибка отслеживания страницы:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
      });
    }
  }

  @Get('page-statistics')
  async getPageStatistics() {
    try {
      const stats = await this.analyticsService.getPageStatistics();
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('[PageTracker] Ошибка получения статистики:', error);
      return {
        success: false,
        message: 'Ошибка получения статистики'
      };
    }
  }

  @Get('unique-visitors')
  async getUniqueVisitors() {
    try {
      const visitors = await this.analyticsService.getUniqueVisitors();
      return {
        success: true,
        data: visitors
      };
    } catch (error) {
      console.error('[PageTracker] Ошибка получения посетителей:', error);
      return {
        success: false,
        message: 'Ошибка получения посетителей'
      };
    }
  }
}
