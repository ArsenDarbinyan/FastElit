import { Controller, Post, UseInterceptors, UploadedFile, Get, Param, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import * as fs from 'fs';

@Controller('files')
export class FilesController {
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/videos',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(mp4|mov|avi)$/)) {
                return cb(new BadRequestException('Only video files are allowed!'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 100 * 1024 * 1024, // 100 MB limit
        },
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        return {
            url: `/files/${file.filename}`,
        };
    }

    @Get(':filename')
    serveFile(@Param('filename') filename: string, @Res() res: Response) {
        const path = `./uploads/videos/${filename}`;
        if (fs.existsSync(path)) {
            res.sendFile(filename, { root: './uploads/videos' });
        } else {
            res.status(404).send('File not found');
        }
    }
}
