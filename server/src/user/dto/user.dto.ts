import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, IsUrl } from 'class-validator';

export class UserProfileDto {
  @ApiProperty({ description: '사용자 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '사용자 이름', example: '김민준' })
  name: string;

  @ApiProperty({ description: '이메일', example: 'minjun@example.com' })
  email: string;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL',
    example: 'https://s3.amazonaws.com/bucket/profile.jpg',
  })
  profile_img?: string;

  @ApiProperty({ description: '가입일', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '내가 키우는 식물 수', example: 5 })
  plantCount: number;

  @ApiProperty({ description: '작성한 일기 수', example: 23 })
  diaryCount: number;

  @ApiProperty({ description: '작성한 커뮤니티 게시글 수', example: 12 })
  postCount: number;

  @ApiProperty({ description: '친구 수', example: 8 })
  friendCount: number;
}

export class UpdateUserNameDto {
  @ApiProperty({ description: '새로운 사용자 이름', example: '김철수' })
  @IsString()
  @MinLength(2, { message: '이름은 최소 2글자 이상이어야 합니다.' })
  name: string;
}

export class UpdateUserProfileImageDto {
  @ApiProperty({
    description: '새로운 프로필 이미지 URL',
    example: 'https://s3.amazonaws.com/bucket/new-profile.jpg',
  })
  @IsString()
  @IsUrl({}, { message: '올바른 URL 형식이어야 합니다.' })
  profile_img: string;
}

export class UserActivityDto {
  @ApiProperty({ description: '활동 유형', example: 'diary' })
  type: 'diary' | 'post' | 'comment';

  @ApiProperty({ description: '활동 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '제목', example: '오늘 몬스테라에게 물을 줬어요' })
  title: string;

  @ApiProperty({ description: '내용 미리보기', example: '오늘 몬스테라가 조금 시들어 보여서...' })
  content: string;

  @ApiProperty({ description: '생성일', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ description: '관련 식물 정보' })
  plant?: {
    id: number;
    name: string;
    variety: string;
  };

  @ApiPropertyOptional({ description: '좋아요 수', example: 5 })
  likesCount?: number;

  @ApiPropertyOptional({ description: '댓글 수', example: 3 })
  commentsCount?: number;
}

export class UserActivitiesResponseDto {
  @ApiProperty({ description: '활동 목록', type: [UserActivityDto] })
  activities: UserActivityDto[];

  @ApiProperty({ description: '전체 개수', example: 50 })
  total: number;

  @ApiProperty({ description: '현재 페이지', example: 1 })
  page: number;

  @ApiProperty({ description: '페이지당 항목 수', example: 10 })
  limit: number;

  @ApiProperty({ description: '전체 페이지 수', example: 5 })
  totalPages: number;
}

export class DeleteAccountDto {
  @ApiProperty({ description: '계정 삭제 확인을 위한 비밀번호', example: 'password123' })
  @IsString()
  @MinLength(6, { message: '비밀번호는 최소 6글자 이상이어야 합니다.' })
  password: string;
}
