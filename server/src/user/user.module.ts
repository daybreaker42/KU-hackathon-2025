import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';
import { S3Service } from 'src/external-api/s3.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, S3Service],
  exports: [UserService],
})
export class UserModule {}
