import { Controller, Get, Post, Body, Param, UseGuards, Request, Logger } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('products')
export class ProductsController {
    private readonly logger = new Logger(ProductsController.name);

    constructor(private productsService: ProductsService) { }

    @Get()
    findAll() {
        this.logger.log('GET /products - запрос получен');
        return this.productsService.findAll();
    }

    @Get('public')
    findPublic() {
        this.logger.log('GET /products/public - публичный запрос получен');
        const result = this.productsService.findPublic();
        this.logger.log(`GET /products/public - возвращаем ${JSON.stringify(result).length} символов`);
        return result;
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        this.logger.log(`GET /products/${id} - запрос продукта с ID: ${id}`);
        return this.productsService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createProductDto: any, @Request() req) {
        this.logger.log('POST /products - создание нового продукта');
        return this.productsService.create({
            ...createProductDto,
            seller: { connect: { id: req.user.payload.sub } },
        });
    }
}
