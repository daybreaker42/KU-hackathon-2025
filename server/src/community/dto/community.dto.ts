import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePostDto {
  @ApiProperty({
    description: '게시글 제목',
    example: '몬스테라 키우기 팁',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '몬스테라를 키우면서 알게 된 유용한 팁들을 공유합니다.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: '게시글 카테고리',
    example: '식물관리',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: '관련 식물 이름',
    example: '몬스테라',
    required: false,
  })
  @IsOptional()
  @IsString()
  plant_name?: string;

  @ApiProperty({
    description: '이미지 URL 배열',
    type: [String],
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdatePostDto {
  @ApiProperty({
    description: '게시글 제목',
    example: '몬스테라 키우기 팁 (수정)',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '수정된 내용입니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: '게시글 카테고리',
    example: '식물관리',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: '관련 식물 이름',
    example: '몬스테라',
    required: false,
  })
  @IsOptional()
  @IsString()
  plant_name?: string;

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

export class CreateCommentDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '정말 유용한 정보네요! 감사합니다.',
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

export class UpdateCommentDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '수정된 댓글 내용입니다.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class PostQueryDto {
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

  @ApiProperty({
    description: '카테고리 필터',
    example: '식물관리',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: '식물 이름 필터',
    example: '몬스테라',
    required: false,
  })
  @IsOptional()
  @IsString()
  plant_name?: string;

  @ApiProperty({
    description: '검색 키워드',
    example: '물주기',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class PostResponseDto {
  @ApiProperty({
    description: '게시글 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '게시글 제목',
    example: '몬스테라 키우기 팁',
  })
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '몬스테라를 키우면서 알게 된 유용한 팁들을 공유합니다.',
  })
  content: string;

  @ApiProperty({
    description: '카테고리',
    example: '식물관리',
    nullable: true,
  })
  category?: string;

  @ApiProperty({
    description: '관련 식물 이름',
    example: '몬스테라',
    nullable: true,
  })
  plant_name?: string;

  @ApiProperty({
    description: '좋아요 수',
    example: 15,
  })
  likes_count: number;

  @ApiProperty({
    description: '댓글 수',
    example: 5,
  })
  comments_count: number;

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
    description: '이미지 URL 배열',
    type: [String],
    example: ['https://example.com/image1.jpg'],
  })
  images: string[];

  @ApiProperty({
    description: '현재 사용자의 좋아요 여부',
    example: false,
  })
  isLiked: boolean;
}

export class CommentResponseDto {
  @ApiProperty({
    description: '댓글 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '댓글 내용',
    example: '정말 유용한 정보네요!',
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
  parent_id?: number | null; // 여기 수정

  @ApiProperty({
    description: '대댓글 목록',
    type: [CommentResponseDto],
  })
  replies: CommentResponseDto[];
}

export class PaginatedPostsDto {
  @ApiProperty({
    description: '게시글 목록',
    type: [PostResponseDto],
  })
  posts: PostResponseDto[];

  @ApiProperty({
    description: '전체 게시글 수',
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
    description: '전체 페이지 수',
    example: 10,
  })
  totalPages: number;
}

// 누락된 export 추가
export class PostListDto extends PaginatedPostsDto {}

export class CommentListDto {
  @ApiProperty({
    description: '댓글 목록',
    type: [CommentResponseDto],
  })
  comments: CommentResponseDto[];

  @ApiProperty({
    description: '전체 댓글 수',
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
