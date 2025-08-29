import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../external-api/s3.service';
import {
  CreatePostDto,
  UpdatePostDto,
  PostResponseDto,
  PaginatedPostsDto,
  CreateCommentDto,
  UpdateCommentDto,
  CommentResponseDto,
  PostListDto,
  CommentListDto,
} from './dto/community.dto';

@Injectable()
export class CommunityService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async createPost(userId: number, createPostDto: CreatePostDto): Promise<PostResponseDto> {
    const { title, content, category, plant_name, images } = createPostDto;

    const post = await this.prisma.post.create({
      data: {
        user_id: userId,
        title,
        content,
        category,
        plant_name,
        likes: 0,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
        like: true,
        comment: true,
        post_img: true,
      },
    });

    // 이미지가 있으면 추가
    if (images && images.length > 0) {
      await this.prisma.postImg.createMany({
        data: images.map((url) => ({
          post_id: post.id,
          img_url: url,
        })),
      });
    }

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category || undefined,
      plant_name: post.plant_name || undefined,
      likes_count: post.like.length,
      comments_count: post.comment.length,
      author: {
        id: post.user.id,
        name: post.user.name,
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      images: images || post.post_img.map((img) => img.img_url),
      isLiked: post.like.some((like) => like.user_id === userId),
    };
  }

  async getPosts(
    userId: number,
    page: number = 1,
    limit: number = 10,
    category?: string,
    plant_name?: string,
    search?: string,
  ): Promise<PostListDto> {
    const skip = (page - 1) * limit;

    const where = {
      ...(category ? { category: { contains: category } } : {}),
      ...(plant_name ? { plant_name: { contains: plant_name } } : {}),
      ...(search ? { title: { contains: search } } : {}),
    };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true },
          },
          like: true,
          comment: true,
          post_img: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    const postsData: PostResponseDto[] = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category || undefined,
      plant_name: post.plant_name || undefined,
      likes_count: post.like.length,
      comments_count: post.comment.length,
      author: {
        id: post.user.id,
        name: post.user.name,
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      images: post.post_img.map((img) => img.img_url),
      isLiked: post.like.some((like) => like.user_id === userId),
    }));

    return {
      posts: postsData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPost(userId: number, postId: number): Promise<PostResponseDto> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: { id: true, name: true },
        },
        like: true,
        comment: true,
        post_img: true,
      },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category || undefined,
      plant_name: post.plant_name || undefined,
      likes_count: post.like.length,
      comments_count: post.comment.length,
      author: {
        id: post.user.id,
        name: post.user.name,
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      images: post.post_img.map((img) => img.img_url),
      isLiked: post.like.some((like) => like.user_id === userId),
    };
  }

  async updatePost(
    userId: number,
    postId: number,
    updatePostDto: UpdatePostDto,
    images?: string[],
  ): Promise<PostResponseDto> {
    const existingPost = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (existingPost.user_id !== userId) {
      throw new ForbiddenException('게시글을 수정할 권한이 없습니다.');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: updatePostDto,
      include: {
        user: {
          select: { id: true, name: true },
        },
        like: true,
        comment: true,
        post_img: true,
      },
    });

    // 이미지 업데이트
    if (images) {
      await this.prisma.postImg.deleteMany({
        where: { post_id: postId },
      });

      if (images.length > 0) {
        await this.prisma.postImg.createMany({
          data: images.map((url) => ({
            post_id: postId,
            img_url: url,
          })),
        });
      }
    }

    return {
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content,
      category: updatedPost.category || undefined,
      plant_name: updatedPost.plant_name || undefined,
      likes_count: updatedPost.like.length,
      comments_count: updatedPost.comment.length,
      author: {
        id: updatedPost.user.id,
        name: updatedPost.user.name,
      },
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
      images: images || updatedPost.post_img.map((img) => img.img_url),
      isLiked: updatedPost.like.some((like) => like.user_id === userId),
    };
  }

  async deletePost(userId: number, postId: number): Promise<{ message: string }> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.user_id !== userId) {
      throw new ForbiddenException('게시글을 삭제할 권한이 없습니다.');
    }

    await this.prisma.postImg.deleteMany({
      where: { post_id: postId },
    });

    await this.prisma.comment.deleteMany({
      where: { post_id: postId },
    });

    await this.prisma.likes.deleteMany({
      where: { post_id: postId },
    });

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: '게시글이 삭제되었습니다.' };
  }

  async toggleLike(
    userId: number,
    postId: number,
  ): Promise<{ isLiked: boolean; likesCount: number }> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const existingLike = await this.prisma.likes.findFirst({
      where: {
        user_id: userId,
        post_id: postId,
      },
    });

    if (existingLike) {
      // 좋아요 취소
      await this.prisma.likes.delete({
        where: { id: existingLike.id },
      });
    } else {
      // 좋아요 추가
      await this.prisma.likes.create({
        data: {
          user_id: userId,
          post_id: postId,
        },
      });
    }

    const likesCount = await this.prisma.likes.count({
      where: { post_id: postId },
    });

    return {
      isLiked: !existingLike,
      likesCount,
    };
  }

  async getComments(postId: number, page: number = 1, limit: number = 10): Promise<CommentListDto> {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          post_id: postId,
          parent_id: null, // 최상위 댓글만
        },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({
        where: {
          post_id: postId,
          parent_id: null,
        },
      }),
    ]);

    const commentsWithReplies = await this.prisma.comment.findMany({
      where: {
        post_id: postId,
        parent_id: null,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const commentsData: CommentResponseDto[] = commentsWithReplies.map((comment) => ({
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.user.id,
        name: comment.user.name,
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt || comment.createdAt,
      parent_id: comment.parent_id,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        author: {
          id: reply.user.id,
          name: reply.user.name,
        },
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt || reply.createdAt,
        parent_id: reply.parent_id,
        replies: [],
      })),
    }));

    return {
      comments: commentsData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createComment(
    userId: number,
    postId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const comment = await this.prisma.comment.create({
      data: {
        user_id: userId,
        post_id: postId,
        content: createCommentDto.content,
        parent_id: createCommentDto.parent_id,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.user.id,
        name: comment.user.name,
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt || comment.createdAt,
      parent_id: comment.parent_id,
      replies: [],
    };
  }

  async updateComment(
    userId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('댓글을 수정할 권한이 없습니다.');
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content: updateCommentDto.content },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      id: updatedComment.id,
      content: updatedComment.content,
      author: {
        id: updatedComment.user.id,
        name: updatedComment.user.name,
      },
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt || updatedComment.createdAt,
      parent_id: updatedComment.parent_id,
      replies: [],
    };
  }

  async deleteComment(userId: number, commentId: number): Promise<{ message: string }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('댓글을 삭제할 권한이 없습니다.');
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return { message: '댓글이 삭제되었습니다.' };
  }
}
