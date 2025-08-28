import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { PlantService } from './plant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreatePlantDto,
  UpdatePlantDto,
  ImageUploadResponseDto,
  PlantResponseDto,
  PlantListDto,
  TodayWateringListDto,
} from './dto/plant.dto';
import { DefaultRequest } from '../type/default.type';

@ApiTags('Plants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '식물 이미지 업로드',
    description: 'AWS S3에 식물 이미지를 업로드하고 URL을 반환합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '이미지 업로드 성공',
    type: ImageUploadResponseDto,
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<ImageUploadResponseDto> {
    const imageUrl = await this.plantService.uploadImage(file);
    return { imageUrl };
  }

  @Post()
  @ApiOperation({
    summary: '식물 등록',
    description: '새로운 식물을 등록합니다.',
  })
  @ApiBody({ type: CreatePlantDto })
  @ApiResponse({
    status: 201,
    description: '식물 등록 성공',
    type: PlantResponseDto,
  })
  async createPlant(
    @Request() req: DefaultRequest,
    @Body() createPlantDto: CreatePlantDto,
  ): Promise<PlantResponseDto> {
    return this.plantService.createPlant(req.user.id, createPlantDto);
  }

  @Get()
  @ApiOperation({
    summary: '내 식물 목록 조회',
    description: '인증된 사용자의 모든 식물 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '식물 목록 조회 성공',
    type: PlantListDto,
  })
  async getMyPlants(@Request() req: DefaultRequest): Promise<PlantListDto> {
    return this.plantService.getPlants(req.user.id);
  }

  @Get('watering/today')
  @ApiOperation({
    summary: '오늘 물줘야 하는 식물 조회',
    description:
      '물주기 주기에 따라 오늘 물을 줘야 하는 식물들을 조회합니다. 늦은 식물들도 포함됩니다.',
  })
  @ApiResponse({
    status: 200,
    description: '오늘 물줘야 하는 식물 목록 조회 성공',
    type: TodayWateringListDto,
  })
  async getPlantsNeedingWateringToday(
    @Request() req: DefaultRequest,
  ): Promise<TodayWateringListDto> {
    return this.plantService.getPlantsNeedingWateringToday(req.user.id);
  }

  // 내가 지금까지 다이어리에 올렸던 모든 사진들 가져오기
  @Get('images/all')
  @ApiOperation({
    summary: '내가 올린 모든 식물 사진 조회',
    description: '내가 지금까지 다이어리에 올렸던 모든 식물 사진들의 URL 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '내가 올린 모든 식물 사진 조회 성공',
    type: [String],
  })
  async getAllUploadedImages(@Request() req: DefaultRequest): Promise<string[]> {
    return this.plantService.getAllUploadedImages(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: '특정 식물 조회',
    description: '특정 식물의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '식물 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '식물 조회 성공',
    type: PlantResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '식물을 찾을 수 없음',
  })
  async getPlantById(
    @Request() req: DefaultRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlantResponseDto> {
    return this.plantService.getPlant(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '식물 정보 수정',
    description: '기존 식물의 정보를 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '식물 ID',
    example: 1,
  })
  @ApiBody({ type: UpdatePlantDto })
  @ApiResponse({
    status: 200,
    description: '식물 수정 성공',
    type: PlantResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '식물을 찾을 수 없음',
  })
  @ApiResponse({
    status: 403,
    description: '수정 권한 없음',
  })
  async updatePlant(
    @Request() req: DefaultRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlantDto: UpdatePlantDto,
  ): Promise<PlantResponseDto> {
    return this.plantService.updatePlant(req.user.id, id, updatePlantDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '식물 삭제',
    description: '등록된 식물을 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '식물 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '식물 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '식물을 찾을 수 없음',
  })
  @ApiResponse({
    status: 403,
    description: '삭제 권한 없음',
  })
  async deletePlant(
    @Request() req: DefaultRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.plantService.deletePlant(req.user.id, id);
    return { message: '식물이 성공적으로 삭제되었습니다.' };
  }
}
