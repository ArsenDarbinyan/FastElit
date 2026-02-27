import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateTelegramUser(data: any) {
        const { hash, ...userData } = data;

        // Validate hash
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN not configured');

        const secretKey = crypto.createHash('sha256').update(botToken).digest();

        // Create check string
        const checkString = Object.keys(userData)
            .sort()
            .map(key => `${key}=${userData[key]}`)
            .join('\n');

        const hmac = crypto.createHmac('sha256', secretKey)
            .update(checkString)
            .digest('hex');

        if (hmac !== hash) {
            throw new UnauthorizedException('Invalid Telegram hash');
        }

        // Check data staleness (optional but recommended)
        if (Date.now() / 1000 - userData.auth_date > 86400) {
            throw new UnauthorizedException('Data is outdated');
        }

        // Find or Create user
        const user = await this.usersService.validateUser(userData);
        return this.login(user);
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
}
