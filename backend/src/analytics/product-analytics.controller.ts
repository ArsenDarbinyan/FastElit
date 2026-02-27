import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class ProductAnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('product-view')
  async trackProductView(@Body() body: { 
    productId: number;
    url: string; 
    referrer?: string; 
    userAgent?: string;
    ref?: string;
  }) {
    try {
      const result = await this.analyticsService.trackProductView(body);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('product-stats')
  async getProductStats(@Query('productId') productId?: string) {
    try {
      const stats = await this.analyticsService.getProductStats(productId ? parseInt(productId) : undefined);
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('product-views')
  async getProductViews(@Query('productId') productId?: string) {
    try {
      const views = await this.analyticsService.getProductViews(productId ? parseInt(productId) : undefined);
      return { success: true, data: views };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
