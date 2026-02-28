import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Req, Query } from '@nestjs/common';
import { ReferralLinksService } from './referral-links.service';

interface Request {
  ip?: string;
  connection?: {
    remoteAddress?: string;
  };
}

@Controller('referral-links')
export class ReferralLinksController {
  constructor(private readonly referralLinksService: ReferralLinksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createReferralLink(@Body() data: {
    code: string;
    name?: string;
    description?: string;
    createdBy?: number;
  }) {
    try {
      const result = await this.referralLinksService.createReferralLink(data);
      return {
        success: true,
        data: result,
        message: 'Реферальная ссылка успешно создана'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Ошибка при создании реферальной ссылки'
      };
    }
  }

  @Get()
  async getAllReferralLinks() {
    try {
      const links = await this.referralLinksService.getAllReferralLinks();
      return {
        success: true,
        data: links,
        message: 'Список реферальных ссылок получен'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Ошибка при получении списка реферальных ссылок'
      };
    }
  }

  @Get('stats/:code')
  async getReferralStats(@Param('code') code: string) {
    try {
      const stats = await this.referralLinksService.getReferralStats(code);
      if (!stats) {
        return {
          success: false,
          message: 'Реферальная ссылка не найдена'
        };
      }
      return {
        success: true,
        data: stats,
        message: 'Статистика реферальной ссылки получена'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Ошибка при получении статистики'
      };
    }
  }

  @Get('code/:code')
  async getReferralLinkByCode(@Param('code') code: string) {
    try {
      const link = await this.referralLinksService.getReferralLinkByCode(code);
      if (!link) {
        return {
          success: false,
          message: 'Реферальная ссылка не найдена'
        };
      }
      return {
        success: true,
        data: link,
        message: 'Реферальная ссылка найдена'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Ошибка при поиске реферальной ссылки'
      };
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateReferralLink(
    @Param('id') id: string,
    @Body() data: {
      name?: string;
      description?: string;
    }
  ) {
    try {
      const result = await this.referralLinksService.updateReferralLink(Number(id), data);
      if (!result) {
        return {
          success: false,
          message: 'Реферальная ссылка не найдена'
        };
      }
      return {
        success: true,
        data: result,
        message: 'Реферальная ссылка обновлена'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Ошибка при обновлении реферальной ссылки'
      };
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteReferralLink(@Param('id') id: string) {
    try {
      const result = await this.referralLinksService.deleteReferralLink(Number(id));
      if (!result) {
        return {
          success: false,
          message: 'Реферальная ссылка не найдена'
        };
      }
      return {
        success: true,
        data: result,
        message: 'Реферальная ссылка удалена'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Ошибка при удалении реферальной ссылки'
      };
    }
  }

  @Post('track')
  @HttpCode(HttpStatus.OK)
  async trackReferralClick(@Body() data: {
    referralCode: string;
    ipAddress: string;
  }) {
    try {
      const result = await this.referralLinksService.trackReferralClick(data);
      return {
        success: true,
        data: result,
        message: 'Переход по реферальной ссылке отслежен'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Ошибка при отслеживании перехода'
      };
    }
  }

  @Get('track')
  @HttpCode(HttpStatus.OK)
  async trackReferralLink(@Query('rf') rf: string, @Req() req: any) {
    try {
      if (!rf) {
        return {
          success: false,
          message: 'Реферальный код не указан'
        };
      }

      const ipAddress = req.ip || req.socket?.remoteAddress || '127.0.0.1';
      
      console.log(`[ReferralController] Отслеживание реф кода: ${rf}, IP: ${ipAddress}`);
      
      const result = await this.referralLinksService.trackReferralClick({
        referralCode: rf,
        ipAddress: ipAddress
      });
      
      return {
        success: true,
        data: result,
        message: `Реферальная ссылка ${rf} отслежена`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Ошибка при отслеживании ссылки'
      };
    }
  }

  @Get('track/:code')
  @HttpCode(HttpStatus.OK)
  async trackReferralByCode(
    @Param('code') code: string,
    @Req() req: any
  ) {
    try {
      const ipAddress = req.ip || req.socket?.remoteAddress || '127.0.0.1';
      const result = await this.referralLinksService.trackReferralClick({
        referralCode: code,
        ipAddress: ipAddress
      });
      
      return {
        success: true,
        data: result,
        message: `Реферальная ссылка ${code} отслежена`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Ошибка при отслеживании ссылки'
      };
    }
  }
}
