import {
  Controller,
  Get,
  Patch,
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
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  UserProfileDto,
  UpdateUserNameDto,
  UpdateUserProfileImageDto,
  UserActivitiesResponseDto,
  DeleteAccountDto,
} from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({
    summary: '사용자 프로필 조회',
    description: '사용자 ID로 프로필 정보(이름, 프로필 이미지 등)를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '사용자 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  async getUserProfile(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserProfileDto> {
    return this.userService.getUserProfile(req.user.id, id);
  }

  @Get('me/activities')
  @ApiOperation({
    summary: '내 활동 조회',
    description: '내가 작성한 일기, 게시글, 댓글 등의 활동을 조회합니다.',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수', example: 10 })
  @ApiResponse({
    status: 200,
    description: '활동 조회 성공',
    type: UserActivitiesResponseDto,
  })
  async getMyActivities(
    @Request() req,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<UserActivitiesResponseDto> {
    return this.userService.getMyActivities(req.user.id, page, limit);
  }

  @Patch('me/name')
  @ApiOperation({
    summary: '이름 변경',
    description: '사용자의 이름을 변경합니다.',
  })
  @ApiBody({ type: UpdateUserNameDto })
  @ApiResponse({
    status: 200,
    description: '이름 변경 성공',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  async updateUserName(
    @Request() req,
    @Body() updateNameDto: UpdateUserNameDto,
  ): Promise<UserProfileDto> {
    return this.userService.updateUserName(req.user.id, updateNameDto);
  }

  @Patch('me/profile-image')
  @ApiOperation({
    summary: '프로필 사진 변경',
    description: '사용자의 프로필 이미지를 변경합니다.',
  })
  @ApiBody({ type: UpdateUserProfileImageDto })
  @ApiResponse({
    status: 200,
    description: '프로필 이미지 변경 성공',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 URL 형식',
  })
  async updateProfileImage(
    @Request() req,
    @Body() updateImageDto: UpdateUserProfileImageDto,
  ): Promise<UserProfileDto> {
    return this.userService.updateProfileImage(req.user.id, updateImageDto);
  }

  @Delete('me/account')
  @ApiOperation({
    summary: '회원탈퇴',
    description: '계정을 영구적으로 삭제합니다. 모든 데이터가 삭제되며 복구할 수 없습니다.',
  })
  @ApiBody({ type: DeleteAccountDto })
  @ApiResponse({
    status: 200,
    description: '회원탈퇴 성공',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '계정이 성공적으로 삭제되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '비밀번호가 올바르지 않음',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  async deleteAccount(
    @Request() req,
    @Body() deleteAccountDto: DeleteAccountDto,
  ): Promise<{ message: string }> {
    return this.userService.deleteAccount(req.user.id, deleteAccountDto);
  }
}
