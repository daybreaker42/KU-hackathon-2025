import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  SendFriendRequestDto,
  FriendSearchDto,
  FriendResponseDto,
  FriendRequestResponseDto,
  UserSearchResultDto,
  FriendListDto,
  FriendRequestListDto,
  FriendActivityDto,
} from './dto/friends.dto';
import { DefaultRequest } from '../type/default.type';

@ApiTags('Friends')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('search')
  @ApiOperation({
    summary: '사용자 검색',
    description: '이름이나 이메일로 사용자를 검색합니다.',
  })
  @ApiQuery({
    name: 'search',
    description: '검색할 사용자 이름 또는 이메일',
    example: 'john',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 검색 성공',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              email: { type: 'string' },
              profile_img: { type: 'string', nullable: true },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async searchUsers(@Request() req: DefaultRequest, @Query('search') search: string) {
    return this.friendsService.searchUsers(req.user.id, search);
  }

  @Post('request')
  @ApiOperation({
    summary: '친구 요청 보내기',
    description: '다른 사용자에게 친구 요청을 보냅니다.',
  })
  @ApiBody({ type: SendFriendRequestDto })
  @ApiResponse({
    status: 201,
    description: '친구 요청 전송 성공',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '친구 요청을 보냈습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (자기 자신에게 요청, 이미 친구, 중복 요청 등)',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  async sendFriendRequest(
    @Request() req: DefaultRequest,
    @Body() sendRequestDto: SendFriendRequestDto,
  ): Promise<FriendRequestResponseDto> {
    return await this.friendsService.sendFriendRequest(req.user.id, sendRequestDto);
  }

  @Get('requests')
  @ApiOperation({
    summary: '친구 요청 목록 조회',
    description: '받은 친구 요청과 보낸 친구 요청 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '친구 요청 목록 조회 성공',
    type: FriendRequestListDto,
  })
  async getFriendRequests(@Request() req: DefaultRequest): Promise<FriendRequestListDto> {
    return this.friendsService.getFriendRequests(req.user.id);
  }

  @Post('requests/:requestId/accept')
  @ApiOperation({
    summary: '친구 요청 수락',
    description: '받은 친구 요청을 수락합니다.',
  })
  @ApiParam({
    name: 'requestId',
    description: '친구 요청 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '친구 요청 수락 성공',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '친구 요청을 수락했습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '수락할 권한이 없거나 이미 처리된 요청',
  })
  @ApiResponse({
    status: 404,
    description: '친구 요청을 찾을 수 없음',
  })
  async acceptFriendRequest(
    @Request() req: DefaultRequest,
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<FriendRequestResponseDto> {
    return await this.friendsService.acceptFriendRequest(req.user.id, requestId);
  }

  @Delete('requests/:requestId/reject')
  @ApiOperation({
    summary: '친구 요청 거절',
    description: '받은 친구 요청을 거절합니다.',
  })
  @ApiParam({
    name: 'requestId',
    description: '친구 요청 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '친구 요청 거절 성공',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '친구 요청을 거절했습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '거절할 권한이 없거나 이미 처리된 요청',
  })
  @ApiResponse({
    status: 404,
    description: '친구 요청을 찾을 수 없음',
  })
  async rejectFriendRequest(
    @Request() req: DefaultRequest,
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<{ message: string }> {
    return this.friendsService.rejectFriendRequest(req.user.id, requestId);
  }

  @Delete('requests/:requestId/cancel')
  @ApiOperation({
    summary: '친구 요청 취소',
    description: '보낸 친구 요청을 취소합니다.',
  })
  @ApiParam({
    name: 'requestId',
    description: '친구 요청 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '친구 요청 취소 성공',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '친구 요청을 취소했습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '취소할 권한이 없거나 이미 처리된 요청',
  })
  @ApiResponse({
    status: 404,
    description: '친구 요청을 찾을 수 없음',
  })
  async cancelFriendRequest(
    @Request() req: DefaultRequest,
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<{ message: string }> {
    return this.friendsService.cancelFriendRequest(req.user.id, requestId);
  }

  @Get()
  @ApiOperation({
    summary: '친구 목록 조회',
    description: '현재 사용자의 친구 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '친구 목록 조회 성공',
    type: FriendListDto,
  })
  async getFriendsList(@Request() req: DefaultRequest): Promise<FriendListDto> {
    return this.friendsService.getFriendsList(req.user.id);
  }

  @Delete(':friendId')
  @ApiOperation({
    summary: '친구 삭제',
    description: '친구 관계를 삭제합니다.',
  })
  @ApiParam({
    name: 'friendId',
    description: '친구 사용자 ID',
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: '친구 삭제 성공',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '친구를 삭제했습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '친구 관계를 찾을 수 없음',
  })
  async removeFriend(
    @Request() req: DefaultRequest,
    @Param('friendId', ParseIntPipe) friendId: number,
  ): Promise<{ message: string }> {
    return this.friendsService.removeFriend(req.user.id, friendId);
  }

  @Get('activities')
  @ApiOperation({
    summary: '친구들의 최근 활동 조회',
    description: '친구들의 최근 7일간 활동(일기 작성, 게시글 작성 등)을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '친구 활동 조회 성공',
    type: [FriendActivityDto],
  })
  async getFriendsActivities(@Request() req: DefaultRequest): Promise<FriendActivityDto[]> {
    return this.friendsService.getFriendsActivities(req.user.id);
  }
}
