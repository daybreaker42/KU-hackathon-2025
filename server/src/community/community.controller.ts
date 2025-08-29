import {
  Controller,
  Get,
  Post,
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
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  UpdateCommentDto,
  PostQueryDto,
  PostResponseDto,
  CommentResponseDto,
  PaginatedPostsDto,
} from './dto/community.dto';
import { DefaultRequest } from '../type/default.type';

@ApiTags('Community')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  @ApiOperation({
    summary: '게시글 목록 조회',
    description: '커뮤니티 게시글 목록을 페이지네이션으로 조회합니다.',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수', example: 10 })
  @ApiQuery({
    name: 'category',
    required: false,
    description: '카테고리 필터',
    example: '식물관리',
  })
  @ApiResponse({
    status: 200,
    description: '게시글 목록 조회 성공',
    type: PaginatedPostsDto,
  })
  async getPosts(
    @Request() req: DefaultRequest,
    @Query() query: PostQueryDto,
  ): Promise<PaginatedPostsDto> {
    return this.communityService.getPosts(
      req.user.id,
      query.page || 1,
      query.limit || 10,
      query.category,
      query.plant_name,
      query.search,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: '특정 게시글 조회',
    description: '특정 게시글의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '게시글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '게시글 조회 성공',
    type: PostResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
  })
  async getPostById(
    @Request() req: DefaultRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostResponseDto> {
    return this.communityService.getPost(req.user.id, id);
  }

  @Post('posts')
  @ApiOperation({
    summary: '게시글 작성',
    description: '새로운 게시글을 작성합니다.',
  })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({
    status: 201,
    description: '게시글 작성 성공',
    type: PostResponseDto,
  })
  async createPost(
    @Request() req: DefaultRequest,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostResponseDto> {
    return this.communityService.createPost(req.user.id, createPostDto);
  }

  @Patch('posts/:id')
  @ApiOperation({
    summary: '게시글 수정',
    description: '기존 게시글을 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '게시글 ID',
    example: 1,
  })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({
    status: 200,
    description: '게시글 수정 성공',
    type: PostResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
  })
  @ApiResponse({
    status: 403,
    description: '수정 권한 없음',
  })
  async updatePost(
    @Request() req: DefaultRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    return this.communityService.updatePost(req.user.id, id, updatePostDto);
  }

  @Delete('posts/:id')
  @ApiOperation({
    summary: '게시글 삭제',
    description: '게시글을 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '게시글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '게시글 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
  })
  @ApiResponse({
    status: 403,
    description: '삭제 권한 없음',
  })
  async deletePost(
    @Request() req: DefaultRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.communityService.deletePost(req.user.id, id);
    return { message: '게시글이 성공적으로 삭제되었습니다.' };
  }

  @Post('posts/:id/like')
  @ApiOperation({
    summary: '게시글 좋아요/취소',
    description: '게시글에 좋아요를 추가하거나 취소합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '게시글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '좋아요 처리 성공',
    schema: {
      type: 'object',
      properties: {
        isLiked: {
          type: 'boolean',
          example: true,
        },
        likesCount: {
          type: 'number',
          example: 15,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
  })
  async toggleLike(
    @Request() req: DefaultRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ isLiked: boolean; likesCount: number }> {
    return this.communityService.toggleLike(req.user.id, id);
  }

  @Get('posts/:id/comments')
  @ApiOperation({
    summary: '게시글 댓글 목록 조회',
    description: '특정 게시글의 댓글 목록을 페이지네이션으로 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '게시글 ID',
    example: 1,
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수', example: 10 })
  @ApiResponse({
    status: 200,
    description: '댓글 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        comments: {
          type: 'array',
          items: { $ref: '#/components/schemas/CommentResponseDto' },
        },
        total: { type: 'number', example: 20 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 2 },
      },
    },
  })
  async getComments(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.communityService.getComments(id, page, limit);
  }

  @Post('posts/:id/comments')
  @ApiOperation({
    summary: '댓글 작성',
    description: '게시글에 댓글을 작성합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '게시글 ID',
    example: 1,
  })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 201,
    description: '댓글 작성 성공',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
  })
  async createComment(
    @Request() req: DefaultRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.communityService.createComment(req.user.id, id, createCommentDto);
  }

  @Patch('comments/:id')
  @ApiOperation({
    summary: '댓글 수정',
    description: '기존 댓글을 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '댓글 ID',
    example: 1,
  })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({
    status: 200,
    description: '댓글 수정 성공',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '댓글을 찾을 수 없음',
  })
  @ApiResponse({
    status: 403,
    description: '수정 권한 없음',
  })
  async updateComment(
    @Request() req: DefaultRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.communityService.updateComment(req.user.id, id, updateCommentDto);
  }

  @Delete('comments/:id')
  @ApiOperation({
    summary: '댓글 삭제',
    description: '댓글을 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '댓글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '댓글 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '댓글을 찾을 수 없음',
  })
  @ApiResponse({
    status: 403,
    description: '삭제 권한 없음',
  })
  async deleteComment(
    @Request() req: DefaultRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.communityService.deleteComment(req.user.id, id);
    return { message: '댓글이 성공적으로 삭제되었습니다.' };
  }
}
