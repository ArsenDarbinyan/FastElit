import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // Публичный доступ к prisma для других контроллеров
  // Получение статистики по всем страницам
  async getAllPageStats() {
    try {
      const stats = await this.prisma.$queryRaw`
        SELECT 
          page_path,
          COUNT(DISTINCT visitor_id) as unique_visitors,
          SUM(view_count) as total_visits,
          SUM(view_count) - COUNT(DISTINCT visitor_id) as repeat_visits,
          MAX(last_view) as last_visit
        FROM page_analytics
        GROUP BY page_path
        ORDER BY total_visits DESC
      ` as any[];
      
      return stats;
    } catch (error) {
      console.error('Error getting all page stats:', error);
      throw error;
    }
  }

  // Получение статистики по продуктам
  async getAllProductStats() {
    try {
      const stats = await this.prisma.$queryRaw`
        SELECT 
          pa.product_id,
          p.title as product_title,
          COUNT(DISTINCT pa.visitor_id) as unique_visitors,
          SUM(pa.view_count) as total_views,
          SUM(pa.view_count) - COUNT(DISTINCT pa.visitor_id) as repeat_views,
          MAX(pa.last_view) as last_view
        FROM product_analytics pa
        LEFT JOIN products p ON pa.product_id = p.id
        GROUP BY pa.product_id, p.title
        ORDER BY total_views DESC
      ` as any[];
      
      return stats;
    } catch (error) {
      console.error('Error getting all product stats:', error);
      throw error;
    }
  }

  get prismaClient() {
    return this.prisma;
  }

  async getVisitorStats() {
    const stats = await this.prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_visitors,
        COUNT(DISTINCT ip_address) as unique_visitors,
        AVG(visit_count) as avg_visits_per_visitor,
        MAX(visit_count) as max_visits_by_one_visitor
      FROM visitors
    ` as any[];
    
    return stats[0];
  }

  async getDailyStats(days: number = 30) {
    const stats = await this.prisma.$queryRaw`
      SELECT 
        date,
        total_visits,
        unique_visitors,
        new_visitors,
        returning_visitors,
        referral_visits,
        direct_visits
      FROM site_stats 
      WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY date DESC
    ` as any[];
    
    return stats;
  }

  async getTopReferrals(limit: number = 10) {
    const referrals = await this.prisma.$queryRaw`
      SELECT 
        rl.code,
        rl.name,
        rl.click_count,
        rl.unique_visitors,
        rc.clicked_at,
        COUNT(DISTINCT rc.ip_address) as unique_clicks_today
      FROM referral_links rl
      LEFT JOIN referral_clicks rc ON rl.code = rc.referral_code 
        AND rc.clicked_at >= CURRENT_DATE
      WHERE rl.is_active = true
      GROUP BY rl.id, rl.code, rl.name, rl.click_count, rl.unique_visitors, rc.clicked_at
      ORDER BY rl.click_count DESC
      LIMIT ${limit}
    ` as any[];
    
    return referrals;
  }

  async trackPageView(pagePath: string, visitorId: number) {
    try {
      const result = await this.prisma.$queryRaw`
        INSERT INTO page_analytics (page_path, visitor_id, view_count, first_view, last_view)
        VALUES (${pagePath}, ${visitorId}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (page_path, visitor_id) 
        DO UPDATE SET 
          view_count = page_analytics.view_count + 1,
          last_view = CURRENT_TIMESTAMP
        RETURNING *
      ` as any[];
      
      return result[0];
    } catch (error) {
      console.error('Error tracking page view:', error);
      throw error;
    }
  }

  async getPageStats(pagePath?: string) {
    if (pagePath) {
      const stats = await this.prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_views,
          COUNT(DISTINCT visitor_id) as unique_visitors,
          MAX(view_count) as max_views_by_user,
          AVG(view_count) as avg_views_per_user,
          MIN(first_view) as first_view_ever,
          MAX(last_view) as last_view_ever
        FROM page_analytics
        WHERE page_path = ${pagePath}
      ` as any[];
      return stats[0] || {};
    } else {
      const allStats = await this.prisma.$queryRaw`
        SELECT 
          page_path,
          COUNT(*) as total_views,
          COUNT(DISTINCT visitor_id) as unique_visitors,
          MAX(last_view) as last_view
        FROM page_analytics
        GROUP BY page_path
        ORDER BY total_views DESC
      ` as any[];
      return allStats;
    }
  }

  async trackProductView(body: { 
    productId: number;
    url: string; 
    referrer?: string; 
    userAgent?: string;
    ref?: string;
  }) {
    const ip = '127.0.0.1'; // В реальном приложении получить IP из request
    
    try {
      // Сначала создаем/обновляем посетителя
      const visitorResult = await this.prisma.$queryRaw`
        INSERT INTO visitors (ip_address, user_agent, referer_url, current_url, custom_referral_code)
        VALUES (${ip}, ${body.userAgent}, ${body.referrer}, ${body.url}, ${body.ref})
        ON CONFLICT (ip_address) 
        DO UPDATE SET 
          visitors.visit_count = visitors.visit_count + 1,
          visitors.last_visit = CURRENT_TIMESTAMP,
          visitors.current_url = ${body.url},
          visitors.custom_referral_code = ${body.ref}
        RETURNING id
      ` as any[];
      
      const visitorId = visitorResult[0]?.id;

      if (visitorId) {
        // Затем отслеживаем просмотр продукта
        const viewResult = await this.prisma.$queryRaw`
          INSERT INTO product_analytics (product_id, visitor_id, first_view, last_view)
          VALUES (${body.productId}, ${visitorId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (product_id, visitor_id) 
          DO UPDATE SET 
            view_count = view_count + 1,
            last_view = CURRENT_TIMESTAMP
          RETURNING *
        ` as any[];
        
        return viewResult[0];
      }
    } catch (error) {
      console.error('Error tracking product view:', error);
      throw error;
    }
  }

  async getProductViews(productId?: number): Promise<any[]> {
    if (productId) {
      const views = await this.prisma.$queryRaw`
        SELECT 
          pa.product_id,
          pa.view_count,
          pa.first_view,
          pa.last_view,
          p.title as product_title,
          p.price as product_price,
          COUNT(DISTINCT pa.visitor_id) as unique_viewers
        FROM product_analytics pa
        LEFT JOIN products p ON pa.product_id = p.id
        WHERE pa.product_id = ${productId}
        GROUP BY pa.product_id, pa.view_count, pa.first_view, pa.last_view, p.title, p.price
        ORDER BY pa.last_view DESC
      ` as any[];
      return views || [];
    } else {
      const allViews = await this.prisma.$queryRaw`
        SELECT 
          pa.product_id,
          pa.view_count,
          pa.first_view,
          pa.last_view,
          p.title as product_title,
          p.price as product_price,
          COUNT(DISTINCT pa.visitor_id) as unique_viewers
        FROM product_analytics pa
        LEFT JOIN products p ON pa.product_id = p.id
        GROUP BY pa.product_id, pa.view_count, pa.first_view, pa.last_view, p.title, p.price
        ORDER BY pa.last_view DESC
      ` as any[];
      return allViews || [];
    }
  }

  async getProductStats(productId?: number): Promise<any> {
    if (productId) {
      const stats = await this.prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_views,
          COUNT(DISTINCT visitor_id) as unique_viewers,
          MAX(view_count) as max_views_by_user,
          AVG(view_count) as avg_views_per_user,
          MIN(first_view) as first_view_ever,
          MAX(last_view) as last_view_ever
        FROM product_analytics
        WHERE product_id = ${productId}
      ` as any[];
      return stats[0] || {};
    } else {
      const allStats = await this.prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_product_views,
          COUNT(DISTINCT product_id) as products_viewed,
          COUNT(DISTINCT visitor_id) as unique_viewers,
          AVG(view_count) as avg_views_per_product
        FROM product_analytics
      ` as any[];
      return allStats[0] || {};
    }
  }

  async getVisitors(limit?: number) {
    const stats = await this.prisma.$queryRaw`
      SELECT 
        ip_address,
        visit_count,
        first_visit_time,
        last_visit_time,
        country,
        city,
        device_type,
        browser,
        os,
        referer_url,
        custom_referral_code,
        current_url
      FROM visitors 
      ORDER BY last_visit_time DESC
      LIMIT ${limit || 50}
    `;
    
    return stats;
  }

  async createReferralLink(code: string, name: string, description?: string, createdBy?: number) {
    try {
      const result = await this.prisma.$queryRaw`
        INSERT INTO referral_links (code, name, description, created_by)
        VALUES (${code}, ${name}, ${description}, ${createdBy})
        RETURNING *
      ` as any[];
      
      return result[0];
    } catch (error) {
      throw new Error(`Referral code ${code} already exists`);
    }
  }

  async getReferralStats(code: string) {
    const stats = await this.prisma.$queryRaw`
      SELECT 
        rl.*,
        COUNT(rc.id) as total_clicks,
        COUNT(DISTINCT rc.ip_address) as unique_visitors,
        MAX(rc.clicked_at) as last_click
      FROM referral_links rl
      LEFT JOIN referral_clicks rc ON rl.code = rc.referral_code
      WHERE rl.code = ${code}
      GROUP BY rl.id, rl.code, rl.name, rl.description, rl.created_by, rl.created_at, rl.is_active, rl.click_count, rl.unique_visitors
    ` as any[];
    
    return stats[0] || null;
  }

  async getVisitorByIP(ip: string) {
    const visitor = await this.prisma.$queryRaw`
      SELECT * FROM visitors 
      WHERE ip_address = ${ip} 
      ORDER BY last_visit DESC 
      LIMIT 1
    ` as any[];
    
    return visitor[0] || null;
  }

  async getTopPages() {
    // Эта функция может быть расширена для отслеживания популярных страниц
    return [];
  }

  async trackVisit(data: { 
    url: string; 
    referrer?: string; 
    userAgent?: string;
    ref?: string;
  }) {
    try {
      const ip = '127.0.0.1'; // В реальном приложении здесь будет IP клиента
      const userAgent = data.userAgent || '';
      const referer = data.referrer || '';
      
      // Парсим URL
      const url = new URL(data.url, 'http://localhost');
      const utmSource = url.searchParams.get('utm_source');
      const utmMedium = url.searchParams.get('utm_medium');
      const utmCampaign = url.searchParams.get('utm_campaign');
      const referralCode = data.ref || url.searchParams.get('ref') || url.searchParams.get('referral');
      
      // Проверяем существующего посетителя
      const existingVisitor = await this.prisma.$queryRaw`
        SELECT * FROM visitors 
        WHERE ip_address = ${ip} 
        ORDER BY last_visit DESC 
        LIMIT 1
      ` as any[];
      
      const isNewVisitor = existingVisitor.length === 0;
      const now = new Date();
      
      if (isNewVisitor) {
        // Создаем нового посетителя
        await this.prisma.$queryRaw`
          INSERT INTO visitors (
            ip_address, user_agent, referer_url, current_url, utm_source, utm_medium, 
            utm_campaign, custom_referral_code, visit_count, first_visit, 
            last_visit, country, city, device_type, browser, os
          ) VALUES (
            ${ip}, ${userAgent}, ${referer}, ${data.url}, ${utmSource}, ${utmMedium}, 
            ${utmCampaign}, ${referralCode}, 1, ${now}, ${now}, 'Unknown', 'Unknown', 
            'desktop', 'unknown', 'unknown'
          )
        `;
      } else {
        // Обновляем существующего посетителя
        await this.prisma.$queryRaw`
          UPDATE visitors 
          SET visit_count = visit_count + 1,
              last_visit = ${now},
              user_agent = ${userAgent},
              referer_url = ${referer},
              current_url = ${data.url},
              utm_source = COALESCE(${utmSource}, utm_source),
              utm_medium = COALESCE(${utmMedium}, utm_medium),
              utm_campaign = COALESCE(${utmCampaign}, utm_campaign),
              custom_referral_code = COALESCE(${referralCode}, custom_referral_code)
          WHERE ip_address = ${ip}
        `;
      }
      
      // Отслеживаем реферальный клик
      if (referralCode) {
        await this.trackReferralClick(referralCode, ip);
      }
      
      // Обновляем дневную статистику
      await this.updateDailyStats(isNewVisitor, !!referralCode, !!referer);
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking visit:', error);
      return { success: false, error: error.message };
    }
  }

  private async trackReferralClick(referralCode: string, ip: string) {
    try {
      // Проверяем существующий клик от этого IP за сегодня
      const existingClick = await this.prisma.$queryRaw`
        SELECT id FROM referral_clicks 
        WHERE referral_code = ${referralCode} 
        AND ip_address = ${ip}
        AND DATE(clicked_at) = CURRENT_DATE
        LIMIT 1
      ` as any[];
      
      if (existingClick.length === 0) {
        // Создаем новый клик
        await this.prisma.$queryRaw`
          INSERT INTO referral_clicks (referral_code, ip_address)
          VALUES (${referralCode}, ${ip})
        `;
        
        // Обновляем счетчик кликов реферальной ссылки
        await this.prisma.$queryRaw`
          UPDATE referral_links 
          SET click_count = click_count + 1
          WHERE code = ${referralCode}
        `;
        
        // Считаем уникальных посетителей
        const uniqueCount = await this.prisma.$queryRaw`
          SELECT COUNT(DISTINCT ip_address) as unique_count 
          FROM referral_clicks 
          WHERE referral_code = ${referralCode}
        ` as any[];
        
        await this.prisma.$queryRaw`
          UPDATE referral_links 
          SET unique_visitors = ${uniqueCount[0].unique_count}
          WHERE code = ${referralCode}
        `;
      }
    } catch (error) {
      console.error('Error tracking referral click:', error);
    }
  }

  private async updateDailyStats(isNewVisitor: boolean, isReferralVisit: boolean, hasReferer: boolean) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      await this.prisma.$queryRaw`
        INSERT INTO site_stats (date, total_visits, unique_visitors, new_visitors, returning_visitors, referral_visits, direct_visits)
        VALUES (${today}::date, 1, ${isNewVisitor ? 1 : 0}, ${isNewVisitor ? 1 : 0}, ${!isNewVisitor ? 1 : 0}, ${isReferralVisit ? 1 : 0}, ${hasReferer && !isReferralVisit ? 1 : 0})
        ON CONFLICT (date) 
        DO UPDATE SET
          total_visits = site_stats.total_visits + 1,
          unique_visitors = site_stats.unique_visitors + ${isNewVisitor ? 1 : 0},
          new_visitors = site_stats.new_visitors + ${isNewVisitor ? 1 : 0},
          returning_visitors = site_stats.returning_visitors + ${!isNewVisitor ? 1 : 0},
          referral_visits = site_stats.referral_visits + ${isReferralVisit ? 1 : 0},
          direct_visits = site_stats.direct_visits + ${hasReferer && !isReferralVisit ? 1 : 0},
          updated_at = CURRENT_TIMESTAMP
      `;
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  }
}
