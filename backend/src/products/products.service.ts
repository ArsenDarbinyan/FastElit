import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.ProductCreateInput) {
        this.logger.log(`Создание продукта: ${JSON.stringify(data)}`);
        return this.prisma.product.create({ data });
    }

    async findAll() {
        this.logger.log('Получение всех продуктов из базы');
        const products = await this.prisma.product.findMany({
            include: { seller: { select: { username: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' },
        });
        this.logger.log(`Найдено продуктов: ${products.length}`);
        return products;
    }

    async findPublic() {
        this.logger.log('Получение публичных продуктов из базы');
        try {
            const products = await this.prisma.product.findMany({
                include: { 
                    seller: { 
                        select: { 
                            username: true, 
                            avatarUrl: true,
                            telegramId: false
                        } 
                    } 
                },
                orderBy: { createdAt: 'desc' },
            });
            this.logger.log(`Найдено публичных продуктов: ${products.length}`);
            products.forEach((product, index) => {
                this.logger.log(`Продукт ${index + 1}: ${product.title} - ${product.price} - продавец: ${product.seller?.username || 'неизвестен'}`);
            });
            return products;
        } catch (error) {
            this.logger.error('Ошибка при получении продуктов:', error);
            throw error;
        }
    }

    async findOne(id: number) {
        this.logger.log(`Поиск продукта с ID: ${id}`);
        return this.prisma.product.findUnique({
            where: { id },
            include: { seller: { select: { username: true, avatarUrl: true } } },
        });
    }
}
