import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  PlantStatusDto,
  TodayTasksDto,
  WeeklyDiariesDto,
  DiaryContentDto,
  FriendFeedDto,
} from './dto/home.dto';
import { DefaultRequest } from '../type/default.type';

@ApiTags('Home')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('my-plants')
  @ApiOperation({
    summary: '내 식물 리스트 가져오기',
    description: '인증된 사용자의 모든 식물 목록과 각 식물별 상태를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '식물 목록 조회 성공',
    type: [PlantStatusDto],
  })
  async getMyPlants(@Request() req: DefaultRequest): Promise<PlantStatusDto[]> {
    return this.homeService.getMyPlants(req.user.id);
  }

  @Get('today-tasks')
  @ApiOperation({
    summary: '오늘 할 일 가져오기',
    description: '오늘 물주기, 햇빛 관리 등이 필요한 식물의 수를 집계하여 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '오늘 할 일 조회 성공',
    type: TodayTasksDto,
  })
  async getTodayTasks(@Request() req: DefaultRequest): Promise<TodayTasksDto> {
    return this.homeService.getTodayTasks(req.user.id);
  }

  @Get('weekly-diaries')
  @ApiOperation({
    summary: '주간 일기 작성 현황',
    description: '최근 7일간의 일기 작성 여부를 boolean 배열 형태로 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '주간 일기 현황 조회 성공',
    type: WeeklyDiariesDto,
  })
  async getWeeklyDiaries(@Request() req: DefaultRequest): Promise<WeeklyDiariesDto> {
    return this.homeService.getWeeklyDiaries(req.user.id);
  }

  @Get('diaries/:date')
  @ApiOperation({
    summary: '특정 날짜 일기 내용 가져오기',
    description: '선택한 날짜에 작성된 일기 내용을 조회합니다.',
  })
  @ApiParam({
    name: 'date',
    description: '조회할 날짜 (YYYY-MM-DD 형식)',
    example: '2025-08-28',
  })
  @ApiResponse({
    status: 200,
    description: '특정 날짜 일기 조회 성공',
    type: [DiaryContentDto],
  })
  async getDiaryByDate(
    @Request() req: DefaultRequest,
    @Param('date') date: string,
  ): Promise<DiaryContentDto[]> {
    return this.homeService.getDiaryByDate(req.user.id, date);
  }

  @Get('friend-feeds')
  @ApiOperation({
    summary: '친구 반응 가져오기',
    description: '최근 친구들이 내 일기에 남긴 댓글 3개를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '친구 피드 조회 성공',
    type: [FriendFeedDto],
  })
  async getFriendFeeds(@Request() req: DefaultRequest): Promise<FriendFeedDto[]> {
    return this.homeService.getFriendFeeds(req.user.id);
  }
}
