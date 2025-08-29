import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { S3Service } from './s3.service';
import { PlantIdService } from './plant-id.service';
import { GeminiService } from './gemini.service';
import { IsString } from 'class-validator';

class TranslateDto {
  @IsString()
  englishText: string;
}

class PlantCareDto {
  @IsString()
  plantName: string;
}

class ImageUrlDto {
  @IsString()
  imageUrl: string;
}

class DeleteImageDto {
  @IsString()
  imageUrl: string;
}

@ApiTags('External API')
@Controller('external-api')
export class ExternalApiController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly plantIdService: PlantIdService,
    private readonly geminiService: GeminiService,
  ) {}

  @Post('upload-image')
  @ApiOperation({ summary: '이미지를 S3에 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          description: '업로드할 폴더명 (기본값: plants)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ): Promise<{ imageUrl: string }> {
    if (!file) {
      throw new BadRequestException('파일이 제공되지 않았습니다.');
    }

    const imageUrl = await this.s3Service.uploadImage(file, folder || 'plants');
    return { imageUrl };
  }

  @Delete('delete-image')
  @ApiOperation({ summary: 'S3에서 이미지 삭제' })
  async deleteImage(@Body() deleteImageDto: DeleteImageDto): Promise<{ message: string }> {
    await this.s3Service.deleteImage(deleteImageDto.imageUrl);
    return { message: '이미지가 성공적으로 삭제되었습니다.' };
  }

  @Post('identify-plant')
  @ApiOperation({ summary: 'Plant.ID API를 사용하여 식물 식별' })
  async identifyPlant(@Body() imageUrlDto: ImageUrlDto) {
    const result = await this.plantIdService.identifyPlant(imageUrlDto.imageUrl);
    return result;
  }

  @Post('translate-to-korean')
  @ApiOperation({ summary: 'Gemini API를 사용하여 영어를 한국어로 번역' })
  async translateToKorean(@Body() translateDto: TranslateDto): Promise<{ koreanText: string }> {
    const koreanText = await this.geminiService.generateTextWithSystemPrompt(
      translateDto.englishText,
    );
    return { koreanText };
  }

  @Post('analyze-plant-care')
  @ApiOperation({ summary: 'Gemini API를 사용하여 식물 관리 정보 분석' })
  async analyzePlantCare(@Body() plantCareDto: PlantCareDto) {
    const careInfo = await this.geminiService.analyzePlantCare(plantCareDto.plantName);
    return careInfo;
  }

  @Post('complete-plant-identification')
  @ApiOperation({
    summary: '식물 식별 + 한국어 번역 + 관리 정보 분석을 한번에 수행',
    description: 'Plant.ID로 식물을 식별하고, Gemini로 한국어 번역 및 관리 정보를 가져옵니다.',
  })
  async completePlantIdentification(@Body() imageUrlDto: ImageUrlDto) {
    // 1. 식물 식별
    const identification = await this.plantIdService.identifyPlant(imageUrlDto.imageUrl);

    // 2. 한국어 번역
    const koreanName = await this.geminiService.generateTextWithSystemPrompt(identification.name);

    // 3. 관리 정보 분석
    const careInfo = await this.geminiService.analyzePlantCare(identification.name);

    return {
      ...identification,
      koreanName,
      careInfo,
    };
  }
}
