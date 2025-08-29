import {
  Controller,
  Post,
  Delete,
  Body,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ImageService } from './image.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MultipleImageUploadResponseDto, ImageDeleteRequestDto } from './dto/image.dto';
import { ImageUploadResponseDto } from 'src/plant/dto/plant.dto';

@ApiTags('Image')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload/single')
  @ApiOperation({ summary: '단일 이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '이미지 업로드 성공',
    type: ImageUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (파일 형식, 크기 등)',
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    description: '업로드할 폴더명 (기본값: plants)',
    example: 'plants',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary', // Swagger에서 "파일 선택" 버튼 나오게 함
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageUploadResponseDto> {
    const imageUrl = await this.imageService.uploadSingleImage(file, 'plants');
    return { imageUrl };
  }

  @Post('upload/multiple')
  @ApiOperation({ summary: '다중 이미지 업로드 (최대 10개)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '이미지 업로드 성공',
    type: MultipleImageUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (파일 형식, 크기, 개수 등)',
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    description: '업로드할 폴더명 (기본값: plants)',
    example: 'plants',
  })
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ): Promise<MultipleImageUploadResponseDto> {
    const imageUrls = await this.imageService.uploadMultipleImages(files, folder);
    return { imageUrls };
  }

  @Delete('delete')
  @ApiOperation({ summary: '이미지 삭제' })
  @ApiResponse({
    status: 200,
    description: '이미지 삭제 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (URL 형식 등)',
  })
  async deleteImage(@Body() deleteImageDto: ImageDeleteRequestDto): Promise<{ message: string }> {
    await this.imageService.deleteImage(deleteImageDto.imageUrl);
    return { message: '이미지가 성공적으로 삭제되었습니다.' };
  }
}
