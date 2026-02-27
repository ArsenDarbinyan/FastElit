import { Module, OnModuleInit } from '@nestjs/common';
import { FilesController } from './files.controller';
import * as fs from 'fs';
import * as path from 'path';

@Module({
    controllers: [FilesController],
})
export class FilesModule implements OnModuleInit {
    onModuleInit() {
        const uploadDir = './uploads/videos';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
    }
}
