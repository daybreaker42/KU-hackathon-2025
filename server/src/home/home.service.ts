import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  PlantStatusDto,
  TodayTasksDto,
  WeeklyDiariesDto,
  DiaryContentDto,
  FriendFeedDto,
} from './dto/home.dto';

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  async getMyPlants(userId: number): Promise<PlantStatusDto[]> {
    const plants = await this.prisma.plant.findMany({
      where: { user_id: userId },
      include: {
        task_log: {
          where: {
            type: 'watering',
          },
          orderBy: {
            completion_date: 'desc',
          },
          take: 1,
        },
      },
    });

    return plants.map((plant) => {
      const lastWatered = plant.task_log[0]?.completion_date;
      const cycleInDays =
        plant.cycle_unit === 'days' ? Number(plant.cycle_value) : Number(plant.cycle_value) * 7;

      let daysUntilNextWatering = 0;
      let status = 'good';

      if (lastWatered) {
        const daysSinceLastWatering = Math.floor(
          (Date.now() - lastWatered.getTime()) / (1000 * 60 * 60 * 24),
        );
        daysUntilNextWatering = Math.max(0, cycleInDays - daysSinceLastWatering);

        if (daysUntilNextWatering === 0) {
          status = 'needs_water';
        } else if (daysUntilNextWatering <= 2) {
          status = 'warning';
        }
      } else {
        status = 'needs_water';
      }

      return {
        id: plant.id,
        name: plant.name,
        variety: plant.variety,
        img_url: plant.img_url || '',
        status,
        daysUntilWatering: daysUntilNextWatering,
        lastWatered,
        wateringCycle: `${plant.cycle_value}${plant.cycle_unit}`,
        sunlightNeeds: plant.sunlight_needs || '간접광선',
      };
    });
  }

  async getTodayTasks(userId: number): Promise<TodayTasksDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const plants = await this.prisma.plant.findMany({
      where: { user_id: userId },
      include: {
        task_log: {
          where: {
            type: 'watering',
          },
          orderBy: {
            completion_date: 'desc',
          },
          take: 1,
        },
      },
    });

    let wateringCount = 0;
    let sunlightCount = 0;
    const tasksToday: any[] = [];

    plants.forEach((plant) => {
      const lastWatered = plant.task_log[0]?.completion_date;
      const cycleInDays =
        plant.cycle_unit === 'days' ? Number(plant.cycle_value) : Number(plant.cycle_value) * 7;

      let needsWatering = false;

      if (lastWatered) {
        const daysSinceLastWatering = Math.floor(
          (Date.now() - lastWatered.getTime()) / (1000 * 60 * 60 * 24),
        );
        needsWatering = daysSinceLastWatering >= cycleInDays;
      } else {
        needsWatering = true;
      }

      if (needsWatering) {
        wateringCount++;
        tasksToday.push({
          type: 'watering',
          plant: {
            id: plant.id,
            name: plant.name,
            variety: plant.variety,
          },
        });
      }

      // 모든 식물은 매일 햇빛 체크가 필요하다고 가정
      sunlightCount++;
      tasksToday.push({
        type: 'sunlight',
        plant: {
          id: plant.id,
          name: plant.name,
          variety: plant.variety,
        },
      });
    });

    return {
      wateringCount,
      sunlightCount,
      totalTasks: wateringCount + sunlightCount,
      tasks: tasksToday,
    };
  }

  async getWeeklyDiaries(userId: number): Promise<WeeklyDiariesDto> {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 6);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const diaries = await this.prisma.diary.findMany({
      where: {
        user_id: userId,
        createdAt: {
          gte: oneWeekAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(oneWeekAgo);
      date.setDate(date.getDate() + i);

      const hasDiary = diaries.some((diary) => {
        const diaryDate = new Date(diary.createdAt);
        return (
          diaryDate.getDate() === date.getDate() &&
          diaryDate.getMonth() === date.getMonth() &&
          diaryDate.getFullYear() === date.getFullYear()
        );
      });

      return {
        date: date.toISOString().split('T')[0],
        hasDiary,
      };
    });

    return {
      weekDays,
      totalDiaries: diaries.length,
      streak: this.calculateStreak(weekDays),
    };
  }

  async getDiaryByDate(userId: number, date: string): Promise<DiaryContentDto[]> {
    const diaries = await this.prisma.diary.findMany({
      where: {
        user_id: userId,
        date,
      },
      include: {
        plant: {
          select: { id: true, name: true, variety: true },
        },
        diary_img: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return diaries.map((diary) => ({
      id: diary.id,
      title: diary.title,
      content: diary.content,
      emotion: diary.emotion ?? undefined,
      memory: diary.memory ?? undefined,
      plant: diary.plant
        ? {
            id: diary.plant.id,
            name: diary.plant.name,
            variety: diary.plant.variety,
          }
        : undefined,
      images: diary.diary_img.map((img) => img.img_url),
      createdAt: diary.createdAt,
    }));
  }

  async getFriendFeeds(userId: number): Promise<FriendFeedDto[]> {
    // 친구 목록 가져오기
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { user_id: userId, status: 'ACCEPTED' },
          { friend_id: userId, status: 'ACCEPTED' },
        ],
      },
    });

    const friendIds = friendships.map((friendship) => {
      return friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
    });

    if (friendIds.length === 0) {
      return [];
    }

    // 내 일기에 달린 친구들의 최근 댓글 3개 조회
    const myDiaryIds = await this.prisma.diary.findMany({
      where: { user_id: userId },
      select: { id: true },
    });

    const recentComments = await this.prisma.comment.findMany({
      where: {
        diary_id: { in: myDiaryIds.map((d) => d.id) },
        user_id: { in: friendIds },
      },
      include: {
        user: {
          select: { id: true, name: true, profile_img: true },
        },
        diary: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    const returnData: FriendFeedDto[] = recentComments.map((comment) => ({
      id: comment.id,
      type: 'comment',
      content: comment.content,
      friend: {
        id: comment.user.id,
        name: comment.user.name,
        profile_img: comment.user.profile_img || undefined,
      },
      diary: comment.diary
        ? {
            id: comment.diary.id,
            title: comment.diary.title,
          }
        : {
            id: 0,
            title: '삭제된 일기',
          },
      createdAt: comment.createdAt,
    }));

    return returnData;
  }

  private calculateStreak(weekDays: { date: string; hasDiary: boolean }[]): number {
    let streak = 0;
    for (let i = weekDays.length - 1; i >= 0; i--) {
      if (weekDays[i].hasDiary) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  async getWeeklyProgress(userId: number) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const diaries = await this.prisma.diary.findMany({
      where: {
        user_id: userId,
        createdAt: { gte: oneWeekAgo },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const dailyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayDiaries = diaries.filter(
        (diary) => diary.createdAt.toDateString() === date.toDateString(),
      );

      return {
        date: date.toISOString().split('T')[0],
        diaryCount: dayDiaries.length,
        hasActivity: dayDiaries.length > 0,
      };
    });

    return {
      weeklyProgress: dailyProgress,
      totalThisWeek: diaries.length,
      streakDays: this.calculateStreak(
        dailyProgress.map((p) => ({ date: p.date, hasDiary: p.hasActivity })),
      ),
    };
  }
}
