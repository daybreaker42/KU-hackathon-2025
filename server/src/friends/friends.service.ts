/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  SendFriendRequestDto,
  FriendResponseDto,
  FriendListDto,
  FriendRequestResponseDto,
  FriendRequestListDto,
} from './dto/friends.dto';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async sendFriendRequest(
    userId: number,
    sendRequestDto: SendFriendRequestDto,
  ): Promise<FriendRequestResponseDto> {
    const { friend_id } = sendRequestDto;

    if (userId === friend_id) {
      throw new ConflictException('자기 자신에게는 친구 요청을 보낼 수 없습니다.');
    }

    // 대상 사용자 존재 확인
    const targetUser = await this.prisma.user.findUnique({
      where: { id: friend_id },
    });

    if (!targetUser) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 이미 친구 관계인지 확인
    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { user_id: userId, friend_id: friend_id },
          { user_id: friend_id, friend_id: userId },
        ],
      },
    });

    if (existingFriendship) {
      throw new ConflictException('이미 친구이거나 친구 요청이 진행 중입니다.');
    }

    const friendRequest = await this.prisma.friendship.create({
      data: {
        user_id: userId,
        friend_id: friend_id,
        status: 'PENDING',
      },
      include: {
        friend: {
          select: { id: true, name: true, profile_img: true },
        },
        user: {
          select: { id: true, name: true, profile_img: true },
        },
      },
    });

    return {
      id: friendRequest.id,
      requester: {
        id: friendRequest.user.id,
        name: friendRequest.user.name,
        profile_img: friendRequest.user.profile_img ?? undefined,
      },
      recipient: {
        id: friendRequest.friend.id,
        name: friendRequest.friend.name,
        profile_img: friendRequest.friend.profile_img ?? undefined,
      },
      status: friendRequest.status,
      createdAt: friendRequest.createdAt,
    };
  }

  async acceptFriendRequest(userId: number, requestId: number): Promise<FriendRequestResponseDto> {
    const friendRequest = await this.prisma.friendship.findUnique({
      where: { id: requestId },
      include: {
        friend: {
          select: { id: true, name: true, profile_img: true },
        },
        user: {
          select: { id: true, name: true, profile_img: true },
        },
      },
    });

    if (!friendRequest) {
      throw new NotFoundException('친구 요청을 찾을 수 없습니다.');
    }

    if (friendRequest.friend_id !== userId) {
      throw new ForbiddenException('친구 요청을 수락할 권한이 없습니다.');
    }

    if (friendRequest.status !== 'PENDING') {
      throw new ConflictException('이미 처리된 친구 요청입니다.');
    }

    const updatedRequest = await this.prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
      include: {
        friend: {
          select: { id: true, name: true, profile_img: true },
        },
        user: {
          select: { id: true, name: true, profile_img: true },
        },
      },
    });

    return {
      id: updatedRequest.id,
      requester: {
        id: updatedRequest.user.id,
        name: updatedRequest.user.name,
        profile_img: updatedRequest.user.profile_img ?? undefined,
      },
      recipient: {
        id: updatedRequest.friend.id,
        name: updatedRequest.friend.name,
        profile_img: updatedRequest.friend.profile_img ?? undefined,
      },
      status: updatedRequest.status,
      createdAt: updatedRequest.createdAt,
    };
  }

  async rejectFriendRequest(userId: number, requestId: number): Promise<{ message: string }> {
    const friendRequest = await this.prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      throw new NotFoundException('친구 요청을 찾을 수 없습니다.');
    }

    if (friendRequest.friend_id !== userId) {
      throw new ForbiddenException('친구 요청을 거절할 권한이 없습니다.');
    }

    if (friendRequest.status !== 'PENDING') {
      throw new ConflictException('이미 처리된 친구 요청입니다.');
    }

    await this.prisma.friendship.delete({
      where: { id: requestId },
    });

    return { message: '친구 요청이 거절되었습니다.' };
  }

  async getFriends(userId: number, page: number = 1, limit: number = 10): Promise<FriendListDto> {
    const skip = (page - 1) * limit;

    const [friendships, total] = await Promise.all([
      this.prisma.friendship.findMany({
        where: {
          OR: [
            { user_id: userId, status: 'ACCEPTED' },
            { friend_id: userId, status: 'ACCEPTED' },
          ],
        },
        include: {
          user: {
            select: { id: true, name: true, profile_img: true },
          },
          friend: {
            select: { id: true, name: true, profile_img: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.friendship.count({
        where: {
          OR: [
            { user_id: userId, status: 'ACCEPTED' },
            { friend_id: userId, status: 'ACCEPTED' },
          ],
        },
      }),
    ]);

    const friends: FriendResponseDto[] = friendships.map((friendship) => {
      const friend = friendship.user_id === userId ? friendship.friend : friendship.user;
      return {
        id: friend.id,
        name: friend.name,
        profile_img: friend.profile_img ?? undefined,
        friendship_date: friendship.createdAt,
      };
    });

    return {
      friends,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getFriendRequests(userId: number): Promise<FriendRequestListDto> {
    const [receivedRequests, sentRequests] = await Promise.all([
      this.prisma.friendship.findMany({
        where: {
          friend_id: userId,
          status: 'PENDING',
        },
        include: {
          user: {
            select: { id: true, name: true, profile_img: true },
          },
          friend: {
            select: { id: true, name: true, profile_img: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.friendship.findMany({
        where: {
          user_id: userId,
          status: 'PENDING',
        },
        include: {
          user: {
            select: { id: true, name: true, profile_img: true },
          },
          friend: {
            select: { id: true, name: true, profile_img: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const receivedRequestsData: FriendRequestResponseDto[] = receivedRequests.map((request) => ({
      id: request.id,
      requester: {
        id: request.user.id,
        name: request.user.name,
        profile_img: request.user.profile_img ?? undefined,
      },
      recipient: {
        id: request.friend.id,
        name: request.friend.name,
        profile_img: request.friend.profile_img ?? undefined,
      },
      status: request.status,
      createdAt: request.createdAt,
    }));

    const sentRequestsData: FriendRequestResponseDto[] = sentRequests.map((request) => ({
      id: request.id,
      requester: {
        id: request.user.id,
        name: request.user.name,
        profile_img: request.user.profile_img ?? undefined,
      },
      recipient: {
        id: request.friend.id,
        name: request.friend.name,
        profile_img: request.friend.profile_img ?? undefined,
      },
      status: request.status,
      createdAt: request.createdAt,
    }));

    return {
      received: receivedRequestsData,
      sent: sentRequestsData,
      totalReceived: receivedRequestsData.length,
      totalSent: sentRequestsData.length,
    };
  }

  async removeFriend(userId: number, friendId: number): Promise<{ message: string }> {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { user_id: userId, friend_id: friendId, status: 'ACCEPTED' },
          { user_id: friendId, friend_id: userId, status: 'ACCEPTED' },
        ],
      },
    });

    if (!friendship) {
      throw new NotFoundException('친구 관계를 찾을 수 없습니다.');
    }

    await this.prisma.friendship.delete({
      where: { id: friendship.id },
    });

    return { message: '친구가 삭제되었습니다.' };
  }

  async searchUsers(
    userId: number,
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const searching = await this.prisma.user.findMany({
      where: {
        OR: [{ name: { contains: query } }, { email: { contains: query } }],
      },
      select: {
        id: true,
        name: true,
        email: true,
        profile_img: true,
        friendships: {
          where: {
            OR: [{ user_id: userId }, { friend_id: userId }],
          },
          select: { user_id: true, friend_id: true, status: true },
        },
      },
      skip,
      take: limit,
    });
    const total = await this.prisma.user.count({
      where: {
        OR: [{ name: { contains: query } }, { email: { contains: query } }],
      },
    });

    const users = searching.map((user) => {
      const isFriend = user.friendships.some(
        (f) => (f.user_id === userId || f.friend_id === userId) && f.status === 'ACCEPTED',
      );
      const hasPendingRequest = user.friendships.some(
        (f) => (f.user_id === userId || f.friend_id === userId) && f.status === 'PENDING',
      );
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_img: user.profile_img ?? undefined,
        isFriend,
        hasPendingRequest,
      };
    });
    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async cancelFriendRequest(userId: number, requestId: number): Promise<{ message: string }> {
    const friendRequest = await this.prisma.friendship.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      throw new NotFoundException('친구 요청을 찾을 수 없습니다.');
    }

    if (friendRequest.user_id !== userId) {
      throw new ForbiddenException('친구 요청을 취소할 권한이 없습니다.');
    }

    if (friendRequest.status !== 'PENDING') {
      throw new ConflictException('이미 처리된 친구 요청입니다.');
    }

    await this.prisma.friendship.delete({
      where: { id: requestId },
    });

    return { message: '친구 요청이 취소되었습니다.' };
  }

  async getFriendsList(userId: number): Promise<FriendListDto> {
    return this.getFriends(userId);
  }

  async getFriendsActivities(userId: number): Promise<any[]> {
    // 친구 목록 가져오기
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { user_id: userId, status: 'ACCEPTED' },
          { friend_id: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        user: {
          select: { id: true, name: true, profile_img: true },
        },
        friend: {
          select: { id: true, name: true, profile_img: true },
        },
      },
    });

    const friendIds = friendships.map((friendship) => {
      return friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
    });

    if (friendIds.length === 0) {
      return [];
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // 친구들의 최근 활동 조회
    const [diaries, posts] = await Promise.all([
      this.prisma.diary.findMany({
        where: {
          user_id: { in: friendIds },
          createdAt: { gte: oneWeekAgo },
        },
        include: {
          user: {
            select: { id: true, name: true, profile_img: true },
          },
          plant: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.post.findMany({
        where: {
          user_id: { in: friendIds },
          createdAt: { gte: oneWeekAgo },
        },
        include: {
          user: {
            select: { id: true, name: true, profile_img: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    // 활동 데이터 통합 및 정렬
    const activities = [
      ...diaries.map((diary) => ({
        id: diary.id,
        type: 'diary' as const,
        title: `${diary.plant?.name}의 일기`,
        content: diary.content?.substring(0, 100) + '...',
        author: diary.user,
        createdAt: diary.createdAt,
      })),
      ...posts.map((post) => ({
        id: post.id,
        type: 'post' as const,
        title: post.title,
        content: post.content?.substring(0, 100) + '...',
        author: post.user,
        createdAt: post.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return activities.slice(0, 10);
  }
}
