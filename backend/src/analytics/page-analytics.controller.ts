import { Controller, Post, Body, Get, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class PageAnalyticsController {
  constructor(private analyticsService: AnalyticsService) { }

  @Post('page-view')
  async trackPageView(@Body() body: {
    pagePath: string;
    url: string;
    referrer?: string;
    userAgent?: string;
    ref?: string;
  }, @Req() req: Request) {
    try {
      // Используем реальный IP клиента
      const visitor = await this.createOrUpdateVisitor(body, req);

      if (visitor && visitor.id) {
        // Отслеживаем просмотр страницы
        const result = await this.analyticsService.trackPageView(req, body.pagePath);
        return { success: true, data: result };
      }

      return { success: false, error: 'Failed to create visitor' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('all-page-stats')
  async getAllPageStats() {
    try {
      const stats = await this.analyticsService.getAllPageStats();
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('all-product-stats')
  async getAllProductStats() {
    try {
      const stats = await this.analyticsService.getAllProductStats();
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('page-stats')
  async getPageStats(@Query('pagePath') pagePath?: string) {
    try {
      const stats = await this.analyticsService.getPageStats(pagePath);
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async createOrUpdateVisitor(body: {
    url: string;
    referrer?: string;
    userAgent?: string;
    ref?: string;
  }, req: Request) {
    // Получаем реальный IP клиента
    const ip = req.ip ||
      req.headers['x-forwarded-for'] as string ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    try {
      const result = await this.analyticsService.prismaClient.$queryRaw`
        INSERT INTO visitors (ip_address, user_agent, referer_url, current_url, custom_referral_code)
        VALUES (${ip}, ${body.userAgent}, ${body.referrer}, ${body.url}, ${body.ref})
        ON CONFLICT (ip_address) 
        DO UPDATE SET 
          last_visit = CURRENT_TIMESTAMP,
          current_url = ${body.url},
          visit_count = visitors.visit_count + 1
        RETURNING id
      ` as any[];

      return result[0];
    } catch (error) {
      console.error('Error creating visitor:', error);
      throw error;
    }
  }
}

