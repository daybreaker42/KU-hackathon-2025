import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDiaryDto {
  @ApiProperty({
    description: '일기 제목',
    example: '몬스테라와 함께한 하루',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: '일기 내용',
    example: '오늘은 몬스테라에게 물을 주었다. 새 잎이 나오고 있어서 기분이 좋다.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: '감정',
    example: '기쁨',
    required: false,
  })
  @IsOptional()
  @IsString()
  emotion?: string;

  @ApiProperty({
    description: '추억/성장일기',
    example: '첫 번째 새 잎이 나온 기념일',
    required: false,
  })
  @IsOptional()
  @IsString()
  memory?: string;

  @ApiProperty({
    description: '관련 식물 ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  plant_id?: number;

  @ApiProperty({
    description: '물을 주었는지 여부',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  water?: boolean;

  @ApiProperty({
    description: '햇빛을 받았는지 여부',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  sun?: boolean;

  @ApiProperty({
    description: '이미지 URL 배열',
    type: [String],
    example: ['https://example.com/diary1.jpg', 'https://example.com/diary2.jpg'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '일기 작성 날짜 (YYYY-MM-DD 형식), 없으면 오늘 날짜',
    example: '2025-08-28',
    required: false,
  })
  date?: string; // YYYY-MM-DD 형식의 날짜, 선택 사항 (없으면 오늘 날짜로 설정)
}

export class UpdateDiaryDto {
  @ApiProperty({
    description: '일기 제목',
    example: '몬스테라와 함께한 하루 (수정)',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: '일기 내용',
    example: '수정된 일기 내용입니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: '감정',
    example: '행복',
    required: false,
  })
  @IsOptional()
  @IsString()
  emotion?: string;

  @ApiProperty({
    description: '추억/성장일기',
    example: '수정된 추억',
    required: false,
  })
  @IsOptional()
  @IsString()
  memory?: string;

  @ApiProperty({
    description: '관련 식물 ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  plant_id?: number;

  @ApiProperty({
    description: '이미지 URL 배열',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class DiaryQueryDto {
  @ApiProperty({
    description: '조회할 년도',
    example: 2025,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(2000)
  @Max(3000)
  year?: number;

  @ApiProperty({
    description: '조회할 월 (1-12)',
    example: 8,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : (value as number)))
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class DiaryResponseDto {
  @ApiProperty({
    description: '일기 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '일기 제목',
    example: '몬스테라와 함께한 하루',
  })
  title: string;

  @ApiProperty({
    description: '일기 내용',
    example: '오늘은 몬스테라에게 물을 주었다.',
  })
  content: string;

  @ApiProperty({
    description: '감정',
    example: '기쁨',
    nullable: true,
  })
  emotion?: string;

  @ApiProperty({
    description: '추억/성장일기',
    example: '첫 번째 새 잎이 나온 기념일',
    nullable: true,
  })
  memory?: string;

  @ApiProperty({
    description: '작성자 정보',
  })
  author: {
    id: number;
    name: string;
  };

  @ApiProperty({
    description: '관련 식물 정보',
    nullable: true,
  })
  plant?: {
    id: number;
    name: string;
    variety: string;
  };

  // sun, water 추가
  @ApiProperty({
    description: '물을 주었는지 여부',
    example: true,
    nullable: true,
  })
  water: boolean;

  @ApiProperty({
    description: '햇빛을 받았는지 여부',
    example: true,
    nullable: true,
  })
  sun: boolean;

  @ApiProperty({
    description: '작성일',
    example: '2025-08-28T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2025-08-28T10:00:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '이미지 URL 배열',
    type: [String],
    example: ['https://example.com/diary1.jpg'],
  })
  images: string[];

  @ApiProperty({
    description: '댓글 수',
    example: 3,
  })
  comments_count: number;
}

export class MonthlyDiaryStatusDto {
  @ApiProperty({
    description: '년도',
    example: 2025,
  })
  year: number;

  @ApiProperty({
    description: '월',
    example: 8,
  })
  month: number;

  @ApiProperty({
    description: '일기 작성 날짜 배열',
    type: [Number],
    example: [1, 5, 10, 15, 20, 25, 28],
  })
  diaryDates: number[];

  @ApiProperty({
    description: '날짜별 감정 매핑',
    example: {
      '1': '기쁨',
      '5': '평온',
      '10': '행복',
      '15': '만족',
      '20': '즐거움',
      '25': '기쁨',
      '28': '행복',
    },
  })
  emotions: Record<string, string>;
  // emotions: Record<string, string>;
}

export class DiaryLastUploadedDto {
  // 마지막으로 올린 날짜
  @ApiProperty({
    description: '마지막으로 일기를 작성한 날짜',
    example: '2025-08-28T10:00:00Z',
    nullable: true,
  })
  lastUploadedAt?: Date;

  // 마지막으로 올린 날짜와 오늘의 간격 비교, 오늘 올렸으면 0
  @ApiProperty({
    description: '마지막 일기 작성일과 오늘의 간격 (일 단위)',
    example: 0,
    nullable: true,
  })
  daysSinceLastUpload?: number;
}

export class PlantCareInfoDto {
  @ApiProperty({
    description: '식물 ID',
    example: 1,
  })
  plant_id: number;

  @ApiProperty({
    description: '식물 이름',
    example: '몬스테라',
  })
  plant_name: string;

  @ApiProperty({
    description: '다음 물주기까지 남은 일수',
    example: 3,
  })
  daysUntilWatering: number;

  @ApiProperty({
    description: '물주기 주기',
    example: '7일',
  })
  wateringCycle: string;

  @ApiProperty({
    description: '햇빛 필요량',
    example: '간접광선',
  })
  sunlightNeeds: string;

  @ApiProperty({
    description: '마지막 물주기 날짜',
    example: '2025-08-25T10:00:00Z',
    nullable: true,
  })
  lastWateringDate?: Date;
}

export class CreateDiaryCommentDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '정말 아름다운 일기네요!',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: '부모 댓글 ID (대댓글인 경우)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  parent_id?: number;
}

export class UpdateDiaryCommentDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '수정된 댓글 내용입니다.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class DiaryCommentResponseDto {
  @ApiProperty({
    description: '댓글 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '댓글 내용',
    example: '정말 아름다운 일기네요!',
  })
  content: string;

  @ApiProperty({
    description: '작성자 정보',
  })
  author: {
    id: number;
    name: string;
  };

  @ApiProperty({
    description: '작성일',
    example: '2025-08-28T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2025-08-28T10:00:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '부모 댓글 ID',
    example: null,
    nullable: true,
  })
  parent_id?: number;

  @ApiProperty({
    description: '대댓글 목록',
    type: [DiaryCommentResponseDto],
    isArray: true,
  })
  replies: DiaryCommentResponseDto[];
}

// 누락된 export 추가
export class DiaryListDto {
  @ApiProperty({
    description: '일기 목록',
    type: [DiaryResponseDto],
  })
  diaries: DiaryResponseDto[];

  @ApiProperty({
    description: '전체 일기 수',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: '현재 페이지',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 5,
  })
  totalPages: number;
}

export class DiaryCommentListDto {
  @ApiProperty({
    description: '댓글 목록',
    type: [DiaryCommentResponseDto],
  })
  comments: DiaryCommentResponseDto[];

  @ApiProperty({
    description: '전체 댓글 수',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: '현재 페이지',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 3,
  })
  totalPages: number;
}
