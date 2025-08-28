import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  // 한국 시간대 설정
  process.env.TZ = 'Asia/Seoul';

  const app = await NestFactory.create(AppModule);

  // JSON 요청 크기 제한 설정 (50MB)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 전역 ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('연리지 API 문서')
    .setDescription('연리지 API 설명')
    .setVersion('1.0')
    .addTag('PLANTS')
    .addBearerAuth()
    .build();

  app.enableCors(false);

  // JSON, urlencoded 요청 크기 제한 (예: 50MB)
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/documentation', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
