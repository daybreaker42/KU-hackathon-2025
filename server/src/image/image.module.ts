import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { S3Service } from '../external-api/s3.service';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        files: 10, // 최대 파일 개수
      },
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService, S3Service],
  exports: [ImageService],
})
export class ImageModule {}
