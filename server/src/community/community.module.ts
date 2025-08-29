import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { PrismaService } from '../prisma.service';
import { ExternalApiModule } from '../external-api/external-api.module';

@Module({
  imports: [
    ExternalApiModule,
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        files: 1, // 단일 파일 업로드
      },
    }),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, PrismaService],
  exports: [CommunityService],
})
export class CommunityModule {}
