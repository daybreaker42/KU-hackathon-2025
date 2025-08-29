import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { PlantModule } from './plant/plant.module';
import { CommunityModule } from './community/community.module';
import { DiaryModule } from './diary/diary.module';
import { FriendsModule } from './friends/friends.module';
import { UserModule } from './user/user.module';
import { ImageModule } from './image/image.module';
import { ExternalApiModule } from './external-api/external-api.module';

@Module({
  imports: [
    AuthModule,
    HomeModule,
    PlantModule,
    CommunityModule,
    DiaryModule,
    FriendsModule,
    UserModule,
    ImageModule,
    ExternalApiModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
