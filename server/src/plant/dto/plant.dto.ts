import { ApiProperty } from '@nestjs/swagger';
import { CycleType } from '@prisma/client';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreatePlantDto {
  @ApiProperty({
    description: '식물 이름',
    example: '몬스테라',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: '식물 품종',
    example: '몬스테라 델리시오사',
  })
  @IsNotEmpty()
  @IsString()
  variety: string;

  @ApiProperty({
    description: '식물 이미지 URL',
    example: 'https://example.com/plant1.jpg',
  })
  @IsNotEmpty()
  @IsString()
  img_url: string;

  @ApiProperty({
    description: '물주기 타입',
    example: 'WEEKLY',
    enum: ['DAILY', 'WEEKLY', 'BIWEEKLY', 'TRIWEEKLY', 'MONTHLY'],
  })
  @IsNotEmpty()
  @IsString()
  cycle_type: CycleType;

  @ApiProperty({
    description: '물주기 주기 (일)',
    example: '7',
  })
  @IsNotEmpty()
  @IsString()
  cycle_value: string;

  @ApiProperty({
    description: '물주기 단위',
    example: '일',
  })
  @IsNotEmpty()
  @IsString()
  cycle_unit: string;

  @ApiProperty({
    description: '햇빛 필요량',
    example: '간접광선',
    required: false,
  })
  @IsOptional()
  @IsString()
  sunlight_needs?: string;

  @ApiProperty({
    description: '구매일',
    example: '2025-08-20T00:00:00Z',
    required: false,
  })
  @IsOptional()
  purchase_date?: Date;

  @ApiProperty({
    description: '구매 장소',
    example: '화원',
    required: false,
  })
  @IsOptional()
  @IsString()
  purchase_location?: string;

  @ApiProperty({
    description: '메모',
    example: '첫 번째 식물',
    required: false,
  })
  @IsOptional()
  @IsString()
  memo?: string;
}

export class UpdatePlantDto {
  @ApiProperty({
    description: '식물 이름',
    example: '몬스테라',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: '식물 품종',
    example: '몬스테라 델리시오사',
    required: false,
  })
  @IsOptional()
  @IsString()
  variety?: string;

  @ApiProperty({
    description: '식물 이미지 URL',
    example: 'https://example.com/plant1.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  img_url?: string;

  @ApiProperty({
    description: '물주기 주기 (일)',
    example: '7',
    required: false,
  })
  @IsOptional()
  @IsString()
  cycle_value?: string;

  @ApiProperty({
    description: '물주기 단위',
    example: '일',
    required: false,
  })
  @IsOptional()
  @IsString()
  cycle_unit?: string;

  @ApiProperty({
    description: '햇빛 필요량',
    example: '간접광선',
    required: false,
  })
  @IsOptional()
  @IsString()
  sunlight_needs?: string;
}

export class PlantIdentificationDto {
  @ApiProperty({
    description: '식물 이름 (영어)',
    example: 'Monstera deliciosa',
  })
  name: string;

  @ApiProperty({
    description: '식물 이름 (한국어)',
    example: '몬스테라 델리시오사',
  })
  koreanName: string;

  @ApiProperty({
    description: '식별 확률',
    example: 0.95,
  })
  probability: number;

  @ApiProperty({
    description: '추천 관리 정보',
  })
  careInfo: {
    wateringCycle: string;
    sunlightNeeds: string;
    careInstructions: string;
  };
}

export class ImageUploadResponseDto {
  @ApiProperty({
    description: '업로드된 이미지 URL',
    example: 'https://s3.amazonaws.com/bucket/plants/uuid-filename.jpg',
  })
  imageUrl: string;
}

export class PlantResponseDto {
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
    description: '물주기 타입',
    example: 'WEEKLY',
  })
  cycle_type: string;

  @ApiProperty({
    description: '물주기 주기',
    example: '7',
  })
  cycle_value: string;

  @ApiProperty({
    description: '물주기 단위',
    example: '일',
  })
  cycle_unit: string;

  @ApiProperty({
    description: '햇빛 필요량',
    example: '간접광선',
    nullable: true,
  })
  sunlight_needs?: string;

  @ApiProperty({
    description: '구매일',
    example: '2025-08-20T00:00:00Z',
    nullable: true,
  })
  purchase_date?: Date;

  @ApiProperty({
    description: '구매 장소',
    example: '화원',
    nullable: true,
  })
  purchase_location?: string;

  @ApiProperty({
    description: '메모',
    example: '첫 번째 식물',
    nullable: true,
  })
  memo?: string;

  @ApiProperty({
    description: '작성자 정보',
  })
  author: {
    id: number;
    name: string;
  };

  @ApiProperty({
    description: '등록일',
    example: '2025-08-28T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2025-08-28T10:00:00Z',
  })
  updatedAt: Date;
}

// 누락된 export 추가
export class PlantListDto {
  @ApiProperty({
    description: '식물 목록',
    type: [PlantResponseDto],
  })
  plants: PlantResponseDto[];

  @ApiProperty({
    description: '전체 식물 수',
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

export class PlantCareLogDto {
  @ApiProperty({
    description: '관리 타입',
    example: 'watering',
    enum: ['watering', 'fertilizing', 'pruning', 'repotting'],
  })
  type: string;

  @ApiProperty({
    description: '완료 날짜',
    example: '2025-08-28T10:00:00Z',
    required: false,
  })
  @IsOptional()
  completion_date?: Date;
}

export class PlantCareLogResponseDto {
  @ApiProperty({
    description: '관리 기록 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '관리 타입',
    example: 'watering',
  })
  type: string;

  @ApiProperty({
    description: '완료 날짜',
    example: '2025-08-28T10:00:00Z',
  })
  completion_date: Date;

  @ApiProperty({
    description: '관련 식물 정보',
  })
  plant: {
    id: number;
    name: string;
    variety: string;
  };

  @ApiProperty({
    description: '기록 생성일',
    example: '2025-08-28T10:00:00Z',
  })
  createdAt: Date;
}

export class PlantCareHistoryDto {
  @ApiProperty({
    description: '관리 기록 목록',
    type: [PlantCareLogResponseDto],
  })
  careLogs: PlantCareLogResponseDto[];

  @ApiProperty({
    description: '전체 기록 수',
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
    description: '총 페이지 수',
    example: 5,
  })
  totalPages: number;
}

export class PlantCareStatsDto {
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
    example: '7일',
  })
  wateringCycle: string;

  @ApiProperty({
    description: '햇빛 필요량',
    example: '간접광선',
  })
  sunlightNeeds: string;

  @ApiProperty({
    description: '총 관리 횟수',
    example: 25,
  })
  careCount: number;
}

export class PlantNeedsWateringDto {
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
    description: '마지막 물준 날짜',
    example: '2025-08-22T10:00:00Z',
    nullable: true,
  })
  lastWatered?: Date;

  @ApiProperty({
    description: '물주기 주기',
    example: '7일',
  })
  wateringCycle: string;

  @ApiProperty({
    description: '예정일로부터 지난 일수 (0이면 오늘, 양수면 늦음)',
    example: 0,
  })
  daysOverdue?: number;
}

export class TodayWateringListDto {
  @ApiProperty({
    description: '오늘 물줘야 하는 식물 목록',
    type: [PlantNeedsWateringDto],
  })
  plants: PlantNeedsWateringDto[];

  @ApiProperty({
    description: '오늘 물줘야 하는 식물 수',
    example: 3,
  })
  totalCount: number;
}
