import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AnalyticsMiddleware.name);

  constructor(private prisma: PrismaService) { }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = this.getClientIP(req);
      const userAgent = req.headers['user-agent'] as string || '';
      const referer = req.headers.referer as string || req.headers.referrer as string || '';

      // Получаем полный URL текущей страницы
      const currentUrl = `${req.protocol}://${req.headers.host}${req.originalUrl}`;

      // Парсим UTM параметры из URL
      const url = new URL(req.originalUrl, `http://${req.headers.host}`);
      const utmSource = url.searchParams.get('utm_source');
      const utmMedium = url.searchParams.get('utm_medium');
      const utmCampaign = url.searchParams.get('utm_campaign');

      // Проверяем реферальный код
      const referralCode = (url.searchParams.get('ref') || url.searchParams.get('referral')) as string;

      // ФИЛЬТРУЕМ: отслеживаем только основные страницы, а не файлы и API
      const shouldTrack = this.shouldTrackRequest(req.originalUrl);

      if (!shouldTrack) {
        return next();
      }

      console.log('📊 Analytics middleware: Tracking page:', req.originalUrl);

      // Создаем или обновляем посетителя
      const visitor = await this.createOrUpdateVisitor(
        ip,
        userAgent,
        referer,
        currentUrl,
        referralCode || undefined,
        utmSource || undefined,
        utmMedium || undefined,
        utmCampaign || undefined
      );

      // Отслеживаем просмотр страницы
      if (visitor && visitor.id) {
        await this.trackPageView(req.originalUrl, visitor.id);
      }

      next();
    } catch (error) {
      this.logger.error('Analytics middleware error:', error);
      next();
    }
  }

  private getClientIP(req: Request): string {
    return req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection as any)?.socket?.remoteAddress ||
      '127.0.0.1';
  }

  private shouldTrackRequest(url: string): boolean {
    // НЕ отслеживаем:
    // - API запросы
    // - Статические файлы (видео, изображения)
    // - Фавикон
    // - Health checks

    const skipPatterns = [
      '/api/',
      '/uploads/',
      '/videos/',
      '/favicon.ico',
      '/_next/',
      '/health',
      '/analytics/',
      '.js',
      '.css',
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.svg',
      '.ico',
      '.mp4',
      '.webm',
      '.mov'
    ];

    return !skipPatterns.some(pattern => url.includes(pattern));
  }

  private async createOrUpdateVisitor(
    ip: string,
    userAgent: string,
    referer: string,
    currentUrl: string,
    referralCode?: string,
    utmSource?: string,
    utmMedium?: string,
    utmCampaign?: string
  ) {
    try {
      const result = await this.prisma.$queryRaw`
        INSERT INTO visitors (ip_address, user_agent, referer_url, current_url, custom_referral_code)
        VALUES (${ip}, ${userAgent}, ${referer}, ${currentUrl}, ${referralCode})
        ON CONFLICT (ip_address) 
        DO UPDATE SET 
          last_visit = CURRENT_TIMESTAMP,
          current_url = ${currentUrl},
          visit_count = visitors.visit_count + 1
        RETURNING id
      ` as any[];

      return result[0];
    } catch (error) {
      this.logger.error('Error creating visitor:', error);
      throw error;
    }
  }

  private async trackPageView(pagePath: string, visitorId: number) {
    try {
      console.log('🔍 DEBUG: trackPageView called with:', { pagePath, visitorId });

      await this.prisma.$queryRaw`
        INSERT INTO page_analytics (page_path, visitor_id, view_count, first_view, last_view)
        VALUES (${pagePath}, ${visitorId}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (page_path, visitor_id) 
        DO UPDATE SET 
          view_count = page_analytics.view_count + 1,
          last_view = CURRENT_TIMESTAMP
      `;

      console.log('✅ Page view tracked:', pagePath, 'for visitor:', visitorId);
    } catch (error) {
      console.error('❌ Error tracking page view details:', {
        pagePath,
        visitorId,
        error: error.message,
        code: error.code,
        meta: error.meta
      });
      this.logger.error('Error tracking page view:', error);
    }
  }
}
