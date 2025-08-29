import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { DiaryService } from './diary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateDiaryDto,
  UpdateDiaryDto,
  DiaryResponseDto,
  MonthlyDiaryStatusDto,
  PlantCareInfoDto,
  CreateDiaryCommentDto,
  UpdateDiaryCommentDto,
  DiaryCommentResponseDto,
  DiaryLastUploadedDto,
} from './dto/diary.dto';
import { DefaultRequest } from 'src/type/default.type';

@ApiTags('Diary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('diaries')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Get('lastUploaded')
  @ApiOperation({
    summary: '마지막 업로드된 일기 이미지 조회',
    description: '사용자가 마지막으로 업로드한 일기를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '마지막 업로드된 일기 이미지 조회 성공',
    type: DiaryLastUploadedDto,
  })
  async getLastUploadedImage(@Request() req: DefaultRequest): Promise<DiaryLastUploadedDto> {
    return await this.diaryService.getLastUploadedDiary(req.user.id);
  }

  @Get('/memory')
  @ApiOperation({
    summary: '중요한 성장일기 조회',
    description: '사용자가 작성했던 중요한 성장일기(메모리)들을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '중요한 성장일기 조회 성공',
    type: [DiaryResponseDto],
  })
  async getMemories(@Request() req: DefaultRequest): Promise<DiaryResponseDto[]> {
    return this.diaryService.getMemories(req.user.id);
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '일기 이미지 업로드',
    description: 'AWS S3에 일기 이미지를 업로드하고 URL을 반환합니다.',
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
    schema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          example: 'https://s3.amazonaws.com/bucket/diary/image.jpg',
        },
      },
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<{ imageUrl: string }> {
    const imageUrl = await this.diaryService.uploadImage(file);
    return { imageUrl };
  }

  @Post()
  @ApiOperation({
    summary: '일기 작성',
    description:
      '새로운 일기를 작성합니다. 성장일기(memory)가 있으면 자동으로 memories 테이블에 등록됩니다.',
  })
  @ApiBody({ type: CreateDiaryDto })
  @ApiResponse({
    status: 201,
    description: '일기 작성 성공',
    type: DiaryResponseDto,
  })
  async createDiary(
    @Request() req: DefaultRequest,
    @Body() createDiaryDto: CreateDiaryDto,
  ): Promise<DiaryResponseDto> {
    return this.diaryService.createDiary(req.user.id, createDiaryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: '특정 일기 조회',
    description: '특정 일기의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '일기 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '일기 조회 성공',
    type: DiaryResponseDto,
  })
  async getDiaryById(
    @Request() req: DefaultRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DiaryResponseDto> {
    return this.diaryService.getDiary(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '일기 수정',
    description: '기존 일기를 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '일기 ID',
    example: 1,
  })
  @ApiBody({ type: UpdateDiaryDto })
  @ApiResponse({
    status: 200,
    description: '일기 수정 성공',
    type: DiaryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '일기를 찾을 수 없음',
  })
  @ApiResponse({
    status: 403,
    description: '수정 권한 없음',
  })
  async updateDiary(
    @Request() req: DefaultRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDiaryDto: UpdateDiaryDto,
  ): Promise<DiaryResponseDto> {
    return this.diaryService.updateDiary(req.user.id, id, updateDiaryDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '일기 삭제',
    description: '일기를 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '일기 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '일기 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '일기를 찾을 수 없음',
  })
  @ApiResponse({
    status: 403,
    description: '삭제 권한 없음',
  })
  async deleteDiary(
    @Request() req: DefaultRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.diaryService.deleteDiary(req.user.id, id);
    return { message: '일기가 성공적으로 삭제되었습니다.' };
  }

  @Get('monthly/:year/:month')
  @ApiOperation({
    summary: '월별 일기 작성 현황 조회',
    description: '특정 월의 일기 작성 날짜와 감정 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'year',
    description: '년도',
    example: 2025,
  })
  @ApiParam({
    name: 'month',
    description: '월 (1-12)',
    example: 8,
  })
  @ApiResponse({
    status: 200,
    description: '월별 일기 현황 조회 성공',
    type: MonthlyDiaryStatusDto,
  })
  async getMonthlyDiaryStatus(
    @Request() req: DefaultRequest,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ): Promise<MonthlyDiaryStatusDto> {
    const result = await this.diaryService.getMonthlyDiaryStatus(req.user.id, year, month);
    return {
      year: result.year,
      month: result.month,
      diaryDates: result.diaryDates,
      emotions: result.emotions,
    };
  }

  @Get('date/:date')
  @ApiOperation({
    summary: '특정 날짜 일기 조회',
    description: '특정 날짜에 작성된 모든 일기를 조회합니다.',
  })
  @ApiParam({
    name: 'date',
    description: '조회할 날짜 (YYYY-MM-DD 형식)',
    example: '2025-08-28',
  })
  @ApiResponse({
    status: 200,
    description: '특정 날짜 일기 조회 성공',
    type: [DiaryResponseDto],
  })
  async getDiariesByDate(
    @Request() req: DefaultRequest,
    @Param('date') date: string,
  ): Promise<DiaryResponseDto[]> {
    return this.diaryService.getDiariesByDate(req.user.id, date);
  }

  @Get('plants/:plantId/care-info')
  @ApiOperation({
    summary: '식물 관리 정보 조회',
    description: '일기 작성 시 필요한 식물의 물주기, 햇빛 관리 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'plantId',
    description: '식물 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '식물 관리 정보 조회 성공',
    type: PlantCareInfoDto,
  })
  @ApiResponse({
    status: 404,
    description: '식물을 찾을 수 없음',
  })
  async getPlantCareInfo(
    @Request() req: DefaultRequest,
    @Param('plantId', ParseIntPipe) plantId: number,
  ): Promise<PlantCareInfoDto> {
    return this.diaryService.getPlantCareInfo(req.user.id, plantId);
  }

  @Get(':id/comments')
  @ApiOperation({
    summary: '일기 댓글 목록 조회',
    description: '특정 일기의 댓글 목록을 페이지네이션으로 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '일기 ID',
    example: 1,
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수', example: 10 })
  @ApiResponse({
    status: 200,
    description: '댓글 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        comments: {
          type: 'array',
          items: { $ref: '#/components/schemas/DiaryCommentResponseDto' },
        },
        total: { type: 'number', example: 15 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 2 },
      },
    },
  })
  async getDiaryComments(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.diaryService.getComments(id, page, limit);
  }

  @Post(':id/comments')
  @ApiOperation({
    summary: '일기 댓글 작성',
    description: '일기에 댓글을 작성합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '일기 ID',
    example: 1,
  })
  @ApiBody({ type: CreateDiaryCommentDto })
  @ApiResponse({
    status: 201,
    description: '댓글 작성 성공',
    type: DiaryCommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '일기를 찾을 수 없음',
  })
  async createDiaryComment(
    @Request() req: DefaultRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateDiaryCommentDto,
  ): Promise<DiaryCommentResponseDto> {
    return this.diaryService.createComment(req.user.id, id, createCommentDto);
  }

  @Patch('comments/:commentId')
  @ApiOperation({
    summary: '일기 댓글 수정',
    description: '기존 일기 댓글을 수정합니다.',
  })
  @ApiParam({
    name: 'commentId',
    description: '댓글 ID',
    example: 1,
  })
  @ApiBody({ type: UpdateDiaryCommentDto })
  @ApiResponse({
    status: 200,
    description: '댓글 수정 성공',
    type: DiaryCommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '댓글을 찾을 수 없음',
  })
  @ApiResponse({
    status: 403,
    description: '수정 권한 없음',
  })
  async updateDiaryComment(
    @Request() req: DefaultRequest,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateDiaryCommentDto,
  ): Promise<DiaryCommentResponseDto> {
    return this.diaryService.updateComment(req.user.id, commentId, updateCommentDto);
  }

  @Delete('comments/:commentId')
  @ApiOperation({
    summary: '일기 댓글 삭제',
    description: '일기 댓글을 삭제합니다.',
  })
  @ApiParam({
    name: 'commentId',
    description: '댓글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '댓글 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '댓글을 찾을 수 없음',
  })
  @ApiResponse({
    status: 403,
    description: '삭제 권한 없음',
  })
  async deleteDiaryComment(
    @Request() req: DefaultRequest,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<{ message: string }> {
    await this.diaryService.deleteComment(req.user.id, commentId);
    return { message: '댓글이 성공적으로 삭제되었습니다.' };
  }
}
