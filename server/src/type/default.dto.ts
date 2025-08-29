import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: '데이터 목록',
  })
  data: T[];

  @ApiProperty({
    description: '전체 항목 수',
    example: 100,
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
    example: 10,
  })
  totalPages: number;
}

export class SuccessResponseDto {
  @ApiProperty({
    description: '성공 메시지',
    example: '작업이 성공적으로 완료되었습니다.',
  })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: '에러 메시지',
    example: '잘못된 요청입니다.',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: '에러 발생 시간',
    example: '2025-08-28T10:00:00Z',
  })
  timestamp: string;
}

export class MessageResponseDto {
  @ApiProperty({
    description: '응답 메시지',
    example: '요청이 처리되었습니다.',
  })
  message: string;
}

export class AuthorDto {
  @ApiProperty({
    description: '작성자 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '작성자 이름',
    example: '홍길동',
  })
  name: string;

  @ApiProperty({
    description: '작성자 프로필 이미지',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  profile_img?: string;
}

export class PlantInfoDto {
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
}
