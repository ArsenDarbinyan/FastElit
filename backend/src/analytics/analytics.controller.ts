import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  async trackVisit(@Body() body: { 
    url: string; 
    referrer?: string; 
    userAgent?: string;
    ref?: string;
  }, @Res() res: Response) {
    try {
      const result = await this.analyticsService.trackVisit(body);
      
      // Добавляем CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return res.json(result);
    } catch (error) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  @Get('visitors')
  async getVisitors(@Query('limit') limit?: string) {
    return this.analyticsService.getVisitors(limit ? parseInt(limit) : undefined);
  }

  @Get('daily-stats')
  async getDailyStats(@Query('days') days?: string) {
    return this.analyticsService.getDailyStats(days ? parseInt(days) :7);
  }
}
