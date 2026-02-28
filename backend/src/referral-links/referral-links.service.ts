import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralLinksService {
  constructor(private prisma: PrismaService) {}

  async createReferralLink(data: {
    code: string;
    name?: string;
    description?: string;
    createdBy?: number;
  }) {
    return this.prisma.$queryRaw`
      INSERT INTO referral_links (code, name, description, created_by, created_at)
      VALUES (${data.code}, ${data.name || null}, ${data.description || null}, ${data.createdBy || null}, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
  }

  async getAllReferralLinks() {
    return this.prisma.$queryRaw`
      SELECT 
        id, code, name, description, created_by, 
        created_at, click_count, unique_visitors
      FROM referral_links 
      ORDER BY created_at DESC;
    `;
  }

  async getReferralLinkByCode(code: string) {
    const links = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM referral_links 
      WHERE code = ${code};
    `;
    return links[0] || null;
  }

  async updateReferralLink(id: number, data: {
    name?: string;
    description?: string;
  }) {
    // Используем простые условия вместо динамического SQL
    if (data.name !== undefined && data.description !== undefined) {
      return this.prisma.$queryRaw`
        UPDATE referral_links 
        SET name = ${data.name}, 
            description = ${data.description}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *;
      `;
    }
    
    if (data.name !== undefined) {
      return this.prisma.$queryRaw`
        UPDATE referral_links 
        SET name = ${data.name}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *;
      `;
    }
    
    if (data.description !== undefined) {
      return this.prisma.$queryRaw`
        UPDATE referral_links 
        SET description = ${data.description}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *;
      `;
    }

    return null;
  }

  async deleteReferralLink(id: number) {
    return this.prisma.$queryRaw`
      DELETE FROM referral_links WHERE id = ${id} RETURNING *;
    `;
  }

  async trackReferralClick(data: {
    referralCode: string;
    ipAddress: string;
  }) {
    // Проверяем есть ли такая реф ссылка
    const referralLink = await this.getReferralLinkByCode(data.referralCode);
    if (!referralLink) {
      return { success: false, message: 'Реферальная ссылка не найдена' };
    }

    // Проверяем есть ли уже клик от этого IP сегодня
    const existingClick = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM referral_clicks 
      WHERE referral_code = ${data.referralCode}
        AND ip_address = ${data.ipAddress}
        AND DATE(clicked_at) = CURRENT_DATE
      LIMIT 1;
    `;

    const isUnique = existingClick.length === 0;

    // Записываем клик
    await this.prisma.$queryRaw`
      INSERT INTO referral_clicks (referral_code, ip_address, clicked_at, converted)
      VALUES (${data.referralCode}, ${data.ipAddress}, CURRENT_TIMESTAMP, false);
    `;

    // Обновляем статистику ссылки
    if (isUnique) {
      await this.prisma.$queryRaw`
        UPDATE referral_links 
        SET click_count = click_count + 1,
            unique_visitors = unique_visitors + 1
        WHERE code = ${data.referralCode};
      `;
    } else {
      await this.prisma.$queryRaw`
        UPDATE referral_links 
        SET click_count = click_count + 1
        WHERE code = ${data.referralCode};
      `;
    }

    return { success: true, isUnique };
  }

  async getReferralStats(code: string) {
    const stats = await this.prisma.$queryRaw<any[]>`
      SELECT 
        rl.code,
        rl.name,
        rl.click_count,
        rl.unique_visitors,
        COUNT(rc.id) as total_clicks,
        COUNT(DISTINCT rc.visitor_id) as unique_clicks,
        COUNT(DISTINCT DATE(rc.clicked_at)) as active_days
      FROM referral_links rl
      LEFT JOIN referral_clicks rc ON rl.code = rc.referral_code
      WHERE rl.code = ${code}
      GROUP BY rl.id, rl.code, rl.name, rl.click_count, rl.unique_visitors;
    `;
    return stats[0] || null;
  }
}
