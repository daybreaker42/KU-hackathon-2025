import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { PlantIdService } from './plant-id.service';
import { GeminiService } from './gemini.service';
import { ExternalApiController } from './external-api.controller';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        files: 1, // 단일 파일 업로드
      },
    }),
  ],
  controllers: [ExternalApiController],
  providers: [S3Service, PlantIdService, GeminiService],
  exports: [S3Service, PlantIdService, GeminiService],
})
export class ExternalApiModule {}
