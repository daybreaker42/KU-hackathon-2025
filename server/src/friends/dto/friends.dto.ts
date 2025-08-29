import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class SendFriendRequestDto {
  @ApiProperty({
    description: '친구 요청을 보낼 사용자 ID',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  friend_id: number;
}

export class FriendSearchDto {
  @ApiProperty({
    description: '검색할 사용자 이름 또는 ID',
    example: '김민준',
  })
  @IsNotEmpty()
  @IsString()
  search: string;
}

export class UserDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  name: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  profile_img?: string;
}

export class FriendResponseDto {
  @ApiProperty({
    description: '친구 ID',
    example: 2,
  })
  id: number;

  @ApiProperty({
    description: '친구 이름',
    example: '김민준',
  })
  name: string;

  @ApiProperty({
    description: '친구 프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  profile_img?: string;

  @ApiProperty({
    description: '친구가 된 날짜',
    example: '2025-08-28T10:00:00Z',
  })
  friendship_date: Date;
}

export class FriendRequestResponseDto {
  @ApiProperty({
    description: '친구 요청 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '요청자 정보',
    type: UserDto,
  })
  requester: UserDto;

  @ApiProperty({
    description: '수신자 정보',
    type: UserDto,
  })
  recipient: UserDto;

  @ApiProperty({
    description: '요청 상태',
    example: 'PENDING',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
  })
  status: string;

  @ApiProperty({
    description: '요청 생성일',
    example: '2025-08-28T10:00:00Z',
  })
  createdAt: Date;
}

export class FriendListDto {
  @ApiProperty({
    description: '친구 목록',
    type: [FriendResponseDto],
  })
  friends: FriendResponseDto[];

  @ApiProperty({
    description: '전체 친구 수',
    example: 15,
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
    example: 2,
  })
  totalPages: number;
}

export class FriendRequestListDto {
  @ApiProperty({
    description: '받은 친구 요청 목록',
    type: [FriendRequestResponseDto],
  })
  received: FriendRequestResponseDto[];

  @ApiProperty({
    description: '보낸 친구 요청 목록',
    type: [FriendRequestResponseDto],
  })
  sent: FriendRequestResponseDto[];

  @ApiProperty({
    description: '받은 요청 수',
    example: 3,
  })
  totalReceived: number;

  @ApiProperty({
    description: '보낸 요청 수',
    example: 2,
  })
  totalSent: number;
}

export class UserSearchResultDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 3,
  })
  id: number;

  @ApiProperty({
    description: '사용자 이름',
    example: '이영희',
  })
  name: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  profile_img?: string;
}

export class UserSearchListDto {
  @ApiProperty({
    description: '검색된 사용자 목록',
    type: [UserSearchResultDto],
  })
  users: UserSearchResultDto[];

  @ApiProperty({
    description: '전체 검색 결과 수',
    example: 15,
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
    example: 2,
  })
  totalPages: number;
}

export class FriendActivityDto {
  @ApiProperty({
    description: '활동 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '활동 타입',
    example: 'diary',
    enum: ['diary', 'post'],
  })
  type: string;

  @ApiProperty({
    description: '활동 제목',
    example: '새로운 일기를 작성했습니다',
  })
  title: string;

  @ApiProperty({
    description: '활동 내용',
    example: '오늘은 정말 좋은 하루였습니다...',
  })
  content: string;

  @ApiProperty({
    description: '작성자 정보',
    type: UserDto,
  })
  author: UserDto;

  @ApiProperty({
    description: '작성일',
    example: '2025-08-28T10:00:00Z',
  })
  createdAt: Date;
}
