/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../external-api/s3.service';
import {
  UserProfileDto,
  UpdateUserNameDto,
  UpdateUserProfileImageDto,
  UserActivityDto,
  UserActivitiesResponseDto,
  DeleteAccountDto,
} from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async getUserProfile(currentUserId: number, targetUserId: number): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        plant: true,
        diary: true,
        post: true,
        friendships: {
          where: { status: 'ACCEPTED' },
        },
        friendOf: {
          where: { status: 'ACCEPTED' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 친구 수 계산 (양방향 관계 고려)
    const friendCount = user.friendships.length + user.friendOf.length;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profile_img: user.profile_img || '',
      createdAt: user.createdAt,
      plantCount: user.plant.length,
      diaryCount: user.diary.length,
      postCount: user.post.length,
      friendCount,
    };
  }

  async getMyActivities(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<UserActivitiesResponseDto> {
    const skip = (page - 1) * limit;

    // 일기, 게시글, 댓글을 모두 가져와서 시간순으로 정렬
    const [diaries, posts, comments] = await Promise.all([
      this.prisma.diary.findMany({
        where: { user_id: userId },
        include: {
          plant: {
            select: { id: true, name: true, variety: true },
          },
          comment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.findMany({
        where: { user_id: userId },
        include: {
          like: true,
          comment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comment.findMany({
        where: { user_id: userId },
        include: {
          diary: {
            select: { id: true, title: true },
          },
          post: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // 모든 활동을 하나의 배열로 합치고 시간순 정렬
    const allActivities: UserActivityDto[] = [
      ...diaries.map((diary) => ({
        type: 'diary' as const,
        id: diary.id,
        title: diary.title,
        content: diary.content.substring(0, 100) + (diary.content.length > 100 ? '...' : ''),
        createdAt: diary.createdAt,
        plant: diary.plant || undefined,
        commentsCount: diary.comment.length,
      })),
      ...posts.map((post) => ({
        type: 'post' as const,
        id: post.id,
        title: post.title,
        content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        createdAt: post.createdAt,
        likesCount: post.like.length,
        commentsCount: post.comment.length,
      })),
      ...comments.map((comment) => ({
        type: 'comment' as const,
        id: comment.id,
        title: comment.diary
          ? `"${comment.diary.title}" 일기에 댓글`
          : `"${comment.post?.title}" 게시글에 댓글`,
        content: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
        createdAt: comment.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = allActivities.length;
    const activities = allActivities.slice(skip, skip + limit);

    return {
      activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserName(userId: number, updateNameDto: UpdateUserNameDto): Promise<UserProfileDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: updateNameDto.name },
      include: {
        plant: true,
        diary: true,
        post: true,
        friendships: {
          where: { status: 'ACCEPTED' },
        },
        friendOf: {
          where: { status: 'ACCEPTED' },
        },
      },
    });

    const friendCount = user.friendships.length + user.friendOf.length;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profile_img: user.profile_img || '',
      createdAt: user.createdAt,
      plantCount: user.plant.length,
      diaryCount: user.diary.length,
      postCount: user.post.length,
      friendCount,
    };
  }

  async updateProfileImage(
    userId: number,
    updateImageDto: UpdateUserProfileImageDto,
  ): Promise<UserProfileDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { profile_img: updateImageDto.profile_img },
      include: {
        plant: true,
        diary: true,
        post: true,
        friendships: {
          where: { status: 'ACCEPTED' },
        },
        friendOf: {
          where: { status: 'ACCEPTED' },
        },
      },
    });

    const friendCount = user.friendships.length + user.friendOf.length;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profile_img: user.profile_img || '',
      createdAt: user.createdAt,
      plantCount: user.plant.length,
      diaryCount: user.diary.length,
      postCount: user.post.length,
      friendCount,
    };
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    return await this.s3Service.uploadImage(file, 'profile');
  }

  async deleteAccount(
    userId: number,
    deleteAccountDto: DeleteAccountDto,
  ): Promise<{ message: string }> {
    // 사용자 확인
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(deleteAccountDto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('비밀번호가 올바르지 않습니다.');
    }

    // 트랜잭션으로 관련 데이터 모두 삭제
    await this.prisma.$transaction(async (prisma) => {
      // 사용자와 관련된 모든 데이터 삭제
      await prisma.memory.deleteMany({ where: { user_id: userId } });
      await prisma.emotion.deleteMany({ where: { user_id: userId } });
      await prisma.taskLog.deleteMany({
        where: {
          plant: {
            user_id: userId,
          },
        },
      });
      await prisma.diaryImg.deleteMany({
        where: {
          diary: {
            user_id: userId,
          },
        },
      });
      await prisma.postImg.deleteMany({
        where: {
          post: {
            user_id: userId,
          },
        },
      });
      await prisma.likes.deleteMany({ where: { user_id: userId } });
      await prisma.comment.deleteMany({ where: { user_id: userId } });
      await prisma.diary.deleteMany({ where: { user_id: userId } });
      await prisma.post.deleteMany({ where: { user_id: userId } });
      await prisma.plant.deleteMany({ where: { user_id: userId } });
      await prisma.friendship.deleteMany({
        where: {
          OR: [{ user_id: userId }, { friend_id: userId }],
        },
      });
      await prisma.user.delete({ where: { id: userId } });
    });

    return { message: '계정이 성공적으로 삭제되었습니다.' };
  }
}
