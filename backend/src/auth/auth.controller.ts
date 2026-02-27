import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('telegram')
    async telegramLogin(@Body() data: any) {
        if (!data.hash) {
            throw new UnauthorizedException('Hash missing');
        }
        return this.authService.validateTelegramUser(data);
    }
}
