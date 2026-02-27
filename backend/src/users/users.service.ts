import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async validateUser(userData: any) {
        const { id: telegramId, first_name, username, photo_url } = userData;

        // Convert telegramId to string or BigInt if needed, but Prisma usually stores as String or Int
        // Assuming schema uses String for telegramId to be safe
        const tid = String(telegramId);

        let user = await this.prisma.user.findUnique({
            where: { telegramId: tid },
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    telegramId: tid,
                    username: username || first_name,
                    avatarUrl: photo_url,
                    role: 'USER', // Default role
                },
            });
        }

        return user;
    }

    async findOne(id: number) {
        return this.prisma.user.findUnique({ where: { id } });
    }
}
