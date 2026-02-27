import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { SeedController } from './seed/seed.controller';
import { AdminController } from './admin/admin.controller';
import { AnalyticsModule } from './analytics/analytics.module';
import { CorsMiddleware } from './cors.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    FilesModule,
    ProductsModule,
    PrismaModule,
    AnalyticsModule,
  ],
  controllers: [AppController, SeedController, AdminController],
  providers: [AppService],
})
export class AppModule { }
