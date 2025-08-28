import { ApiProperty } from '@nestjs/swagger';

export class PlantStatusDto {
  @ApiProperty({
    description: '식물 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '식물 이름',
    example: '몬스테라',
  })
  name: string;

  @ApiProperty({
    description: '식물 품종',
    example: '몬스테라 델리시오사',
  })
  variety: string;

  @ApiProperty({
    description: '식물 이미지 URL',
    example: 'https://example.com/plant1.jpg',
  })
  img_url: string;

  @ApiProperty({
    description: '식물 상태',
    example: 'good',
    enum: ['good', 'warning', 'needs_water'],
  })
  status: string;

  @ApiProperty({
    description: '다음 물주기까지 남은 일수',
    example: 3,
  })
  daysUntilWatering: number;

  @ApiProperty({
    description: '마지막 물준 날짜',
    example: '2025-08-25T10:00:00Z',
    nullable: true,
  })
  lastWatered?: Date;

  @ApiProperty({
    description: '물주기 주기',
    example: '7days',
  })
  wateringCycle: string;

  @ApiProperty({
    description: '햇빛 필요량',
    example: '간접광선',
  })
  sunlightNeeds: string;

  @ApiProperty({
    description: '최근 일기 감정',
    example: '행복',
    nullable: true,
  })
  recentEmotion?: string;
}

export class TaskDto {
  @ApiProperty({
    description: '작업 유형',
    example: 'watering',
    enum: ['watering', 'sunlight'],
  })
  type: string;

  @ApiProperty({
    description: '식물 정보',
  })
  plant: {
    id: number;
    name: string;
    variety?: string;
  };
}

export class TodayTasksDto {
  @ApiProperty({
    description: '오늘 물주기가 필요한 식물 수',
    example: 2,
  })
  wateringCount: number;

  @ApiProperty({
    description: '오늘 햇빛 관리가 필요한 식물 수',
    example: 1,
  })
  sunlightCount: number;

  @ApiProperty({
    description: '총 관리가 필요한 식물 수',
    example: 3,
  })
  totalTasks: number;

  @ApiProperty({
    description: '오늘 해야할 작업 목록',
    type: [TaskDto],
  })
  tasks: TaskDto[];
}

export class WeekDayDto {
  @ApiProperty({
    description: '날짜 (YYYY-MM-DD)',
    example: '2025-08-28',
  })
  date: string;

  @ApiProperty({
    description: '해당 날짜에 일기 작성 여부',
    example: true,
  })
  hasDiary: boolean;
}

export class WeeklyDiariesDto {
  @ApiProperty({
    description: '주간 일기 작성 현황',
    type: [WeekDayDto],
  })
  weekDays: WeekDayDto[];

  @ApiProperty({
    description: '총 일기 개수',
    example: 5,
  })
  totalDiaries: number;

  @ApiProperty({
    description: '연속 작성 일수',
    example: 3,
  })
  streak: number;
}

export class DiaryContentDto {
  @ApiProperty({
    description: '일기 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '일기 제목',
    example: '기분 좋은 아침',
  })
  title: string;

  @ApiProperty({
    description: '일기 내용',
    example: '오늘은 날씨가 맑아서 기분이 좋았다.',
  })
  content: string;

  @ApiProperty({
    description: '감정',
    example: '기쁨',
    nullable: true,
  })
  emotion?: string;

  @ApiProperty({
    description: '추억',
    example: '행복했던 기억',
    nullable: true,
  })
  memory?: string;

  @ApiProperty({
    description: '식물 정보',
    nullable: true,
  })
  plant?: {
    id: number;
    name: string;
    variety: string;
  };

  @ApiProperty({
    description: '일기 이미지들',
    type: [String],
    example: ['https://example.com/diary1.jpg'],
  })
  images: string[];

  @ApiProperty({
    description: '작성일',
    example: '2025-08-28T10:00:00Z',
  })
  createdAt: Date;
}

export class FriendDto {
  @ApiProperty({
    description: '친구 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '친구 이름',
    example: '홍길동',
  })
  name: string;

  @ApiProperty({
    description: '친구 프로필 이미지',
    example: 'https://example.com/profile1.jpg',
    nullable: true,
  })
  profile_img?: string;
}

export class FriendFeedDto {
  @ApiProperty({
    description: '피드 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '피드 타입',
    example: 'comment',
  })
  type: string;

  @ApiProperty({
    description: '피드 내용',
    example: '정말 멋진 식물이네요!',
  })
  content: string;

  @ApiProperty({
    description: '친구 정보',
    type: FriendDto,
  })
  friend: FriendDto;

  @ApiProperty({
    description: '일기 정보',
  })
  diary: {
    id: number;
    title: string;
  };

  @ApiProperty({
    description: '작성일',
    example: '2025-08-28T10:00:00Z',
  })
  createdAt: Date;
}
