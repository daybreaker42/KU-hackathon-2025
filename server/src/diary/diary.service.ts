/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../external-api/s3.service';
import { GeminiService } from '../external-api/gemini.service';
import {
  CreateDiaryDto,
  UpdateDiaryDto,
  DiaryResponseDto,
  DiaryListDto,
  CreateDiaryCommentDto,
  UpdateDiaryCommentDto,
  DiaryCommentResponseDto,
  DiaryCommentListDto,
  MonthlyDiaryStatusDto,
  PlantCareInfoDto,
  DiaryLastUploadedDto,
} from './dto/diary.dto';

@Injectable()
export class DiaryService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private geminiService: GeminiService,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return await this.s3Service.uploadImage(file, 'diary');
  }

  async getMemories(userId: number): Promise<DiaryResponseDto[]> {
    const importantMemories = await this.prisma.diary.findMany({
      where: {
        user_id: userId,
        memory: {
          not: null,
        },
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
        plant: {
          select: { id: true, name: true, variety: true },
        },
        diary_img: true,
        comment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return importantMemories.map((diary) => ({
      id: diary.id,
      title: diary.title,
      content: diary.content,
      water: diary.water,
      sun: diary.sun,
      emotion: diary.emotion || undefined,
      memory: diary.memory || undefined,
      author: {
        id: diary.user.id,
        name: diary.user.name,
      },
      plant: diary.plant
        ? {
            id: diary.plant.id,
            name: diary.plant.name,
            variety: diary.plant.variety,
          }
        : undefined,
      createdAt: diary.createdAt,
      updatedAt: diary.updatedAt,
      images: diary.diary_img.map((img) => img.img_url),
      comments_count: diary.comment.length,
    }));
  }

  async createDiary(
    userId: number,
    createDiaryDto: CreateDiaryDto,
    images?: string[],
  ): Promise<DiaryResponseDto> {
    const { title, content, emotion, memory, plant_id, date, sun, water } = createDiaryDto;

    const diary = await this.prisma.diary.create({
      data: {
        user_id: userId,
        title,
        content,
        emotion,
        plant_id,
        sun,
        water,
        date,
        createdAt: date ? new Date(date) : new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
        plant: {
          select: { id: true, name: true, variety: true },
        },
      },
    });
    // todo - 메모리 추가

    // 이미지가 있으면 추가
    if (images && images.length > 0) {
      await this.prisma.diaryImg.createMany({
        data: images.map((url) => ({
          diary_id: diary.id,
          img_url: url,
        })),
      });
    }

    // 기억 저장
    if (memory) {
      await this.prisma.memory.create({
        data: {
          user_id: userId,
          diary_id: diary.id,
          content: memory,
        },
      });
    }

    return {
      id: diary.id,
      title: diary.title,
      content: diary.content,
      emotion: diary.emotion || undefined,
      memory: diary.memory || undefined,
      water: diary.water,
      sun: diary.sun,
      author: {
        id: diary.user.id,
        name: diary.user.name,
      },
      plant: diary.plant
        ? {
            id: diary.plant.id,
            name: diary.plant.name,
            variety: diary.plant.variety,
          }
        : undefined,
      createdAt: diary.createdAt,
      updatedAt: diary.updatedAt,
      images: images || [],
      comments_count: 0,
    };
  }

  async getDiary(userId: number, diaryId: number): Promise<DiaryResponseDto> {
    const diary = await this.prisma.diary.findUnique({
      where: { id: diaryId },
      include: {
        user: {
          select: { id: true, name: true },
        },
        plant: {
          select: { id: true, name: true, variety: true },
        },
        diary_img: true,
        comment: true,
      },
    });

    if (!diary) {
      throw new NotFoundException('일기를 찾을 수 없습니다.');
    }

    if (diary.user_id !== userId) {
      throw new ForbiddenException('일기를 조회할 권한이 없습니다.');
    }

    return {
      id: diary.id,
      title: diary.title,
      content: diary.content,
      sun: diary.sun,
      water: diary.water,
      emotion: diary.emotion || undefined,
      memory: diary.memory || undefined,
      author: {
        id: diary.user.id,
        name: diary.user.name,
      },
      plant: diary.plant
        ? {
            id: diary.plant.id,
            name: diary.plant.name,
            variety: diary.plant.variety,
          }
        : undefined,
      createdAt: diary.createdAt,
      updatedAt: diary.updatedAt,
      images: diary.diary_img.map((img) => img.img_url),
      comments_count: diary.comment.length,
    };
  }

  async updateDiary(
    userId: number,
    diaryId: number,
    updateDiaryDto: UpdateDiaryDto,
    images?: string[],
  ): Promise<DiaryResponseDto> {
    const existingDiary = await this.prisma.diary.findUnique({
      where: { id: diaryId },
      include: {
        plant: true,
      },
    });

    if (!existingDiary) {
      throw new NotFoundException('일기를 찾을 수 없습니다.');
    }

    if (existingDiary.user_id !== userId) {
      throw new ForbiddenException('일기를 수정할 권한이 없습니다.');
    }

    const updatedDiary = await this.prisma.diary.update({
      where: { id: diaryId },
      data: updateDiaryDto,
      include: {
        user: {
          select: { id: true, name: true },
        },
        plant: true,
      },
    });

    // 이미지 업데이트
    if (images) {
      await this.prisma.diaryImg.deleteMany({
        where: { diary_id: diaryId },
      });

      if (images.length > 0) {
        await this.prisma.diaryImg.createMany({
          data: images.map((url) => ({
            diary_id: diaryId,
            img_url: url,
          })),
        });
      }
    }

    // 기억 업데이트
    if (updateDiaryDto.memory !== undefined) {
      const existingMemories = await this.prisma.memory.findMany({
        where: { diary_id: diaryId },
      });

      if (existingMemories.length > 0) {
        await this.prisma.memory.update({
          where: { id: existingMemories[0].id },
          data: { content: updateDiaryDto.memory },
        });
      } else if (updateDiaryDto.memory) {
        await this.prisma.memory.create({
          data: {
            user_id: userId,
            diary_id: diaryId,
            content: updateDiaryDto.memory,
          },
        });
      }
    }

    // 기억이 삭제된 경우
    if (updateDiaryDto.memory === null) {
      await this.prisma.memory.deleteMany({
        where: { diary_id: diaryId },
      });
    }

    const commentsCount = await this.prisma.comment.count({
      where: { diary_id: diaryId },
    });

    return {
      id: updatedDiary.id,
      title: updatedDiary.title,
      content: updatedDiary.content,
      water: updatedDiary.water,
      sun: updatedDiary.sun,
      emotion: updatedDiary.emotion || undefined,
      memory: updatedDiary.memory || undefined,
      author: {
        id: updatedDiary.user.id,
        name: updatedDiary.user.name,
      },
      plant: updatedDiary.plant
        ? {
            id: updatedDiary.plant.id,
            name: updatedDiary.plant.name,
            variety: updatedDiary.plant.variety,
          }
        : undefined,
      createdAt: updatedDiary.createdAt,
      updatedAt: updatedDiary.updatedAt,
      images: images || [],
      comments_count: commentsCount,
    };
  }

  async deleteDiary(userId: number, diaryId: number): Promise<{ message: string }> {
    const diary = await this.prisma.diary.findUnique({
      where: { id: diaryId },
    });

    if (!diary) {
      throw new NotFoundException('일기를 찾을 수 없습니다.');
    }

    if (diary.user_id !== userId) {
      throw new ForbiddenException('일기를 삭제할 권한이 없습니다.');
    }

    await this.prisma.diaryImg.deleteMany({
      where: { diary_id: diaryId },
    });

    await this.prisma.comment.deleteMany({
      where: { diary_id: diaryId },
    });

    await this.prisma.diary.delete({
      where: { id: diaryId },
    });

    return { message: '일기가 삭제되었습니다.' };
  }

  async getDiaries(
    userId: number,
    page: number = 1,
    limit: number = 10,
    plantId?: number,
  ): Promise<DiaryListDto> {
    const skip = (page - 1) * limit;
    const where: any = { user_id: userId };

    if (plantId) {
      where.plant_id = plantId;
    }

    const [diaries, total] = await Promise.all([
      this.prisma.diary.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true },
          },
          plant: {
            // select: { id: true, name: true, variety: true },
          },
          diary_img: true,
          comment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.diary.count({ where }),
    ]);

    const diariesData: DiaryResponseDto[] = diaries.map((diary) => ({
      id: diary.id,
      title: diary.title,
      content: diary.content,
      water: diary.water, // Updated to remove || undefined
      sun: diary.sun, // Updated to remove || undefined
      emotion: diary.emotion || undefined,
      memory: diary.memory || undefined,
      author: {
        id: diary.user.id,
        name: diary.user.name,
      },
      plant: diary.plant
        ? {
            id: diary.plant.id,
            name: diary.plant.name,
            variety: diary.plant.variety,
          }
        : undefined,
      createdAt: diary.createdAt,
      updatedAt: diary.updatedAt,
      images: diary.diary_img.map((img) => img.img_url),
      comments_count: diary.comment.length,
    }));

    return {
      diaries: diariesData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllDiaries(page: number = 1, limit: number = 10): Promise<DiaryListDto> {
    const skip = (page - 1) * limit;

    const [diaries, total] = await Promise.all([
      this.prisma.diary.findMany({
        include: {
          user: {
            select: { id: true, name: true },
          },
          plant: {
            select: { id: true, name: true, variety: true },
          },
          diary_img: true,
          comment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.diary.count(),
    ]);

    const diariesData: DiaryResponseDto[] = diaries.map((diary) => ({
      id: diary.id,
      title: diary.title,
      content: diary.content,
      water: diary.water,
      sun: diary.sun,
      emotion: diary.emotion || undefined,
      memory: diary.memory || undefined,
      author: {
        id: diary.user.id,
        name: diary.user.name,
      },
      plant: diary.plant
        ? {
            id: diary.plant.id,
            name: diary.plant.name,
            variety: diary.plant.variety,
          }
        : undefined,
      createdAt: diary.createdAt,
      updatedAt: diary.updatedAt,
      images: diary.diary_img.map((img) => img.img_url),
      comments_count: diary.comment.length,
    }));

    return {
      diaries: diariesData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPlantCareStats(userId: number): Promise<any> {
    const plants = await this.prisma.plant.findMany({
      where: { user_id: userId },
      include: {
        task_log: {
          where: {
            type: 'watering',
            completion_date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 최근 30일
            },
          },
        },
      },
    });

    return plants.map((plant) => ({
      id: plant.id,
      name: plant.name,
      variety: plant.variety,
      img_url: plant.img_url,
      wateringCycle: `${plant.cycle_value}${plant.cycle_unit}`,
      sunlightNeeds: plant.sunlight_needs || '간접광선',
      lastWatered:
        plant.task_log.length > 0
          ? plant.task_log[plant.task_log.length - 1].completion_date
          : null,
      wateringCount: plant.task_log.length,
    }));
  }

  async getComments(
    diaryId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<DiaryCommentListDto> {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          diary_id: diaryId,
          parent_id: null,
        },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({
        where: {
          diary_id: diaryId,
          parent_id: null,
        },
      }),
    ]);

    const commentsWithReplies = await this.prisma.comment.findMany({
      where: {
        diary_id: diaryId,
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

    const commentsData: DiaryCommentResponseDto[] = commentsWithReplies.map((comment) => ({
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.user.id,
        name: comment.user.name,
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt || comment.createdAt,
      parent_id: comment.parent_id || undefined,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        author: {
          id: reply.user.id,
          name: reply.user.name,
        },
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt || reply.createdAt,
        parent_id: reply.parent_id || undefined,
        replies: [],
        likes: 0,
      })),
      likes: 0,
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
    diaryId: number,
    createCommentDto: CreateDiaryCommentDto,
  ): Promise<DiaryCommentResponseDto> {
    const diary = await this.prisma.diary.findUnique({
      where: { id: diaryId },
    });

    if (!diary) {
      throw new NotFoundException('일기를 찾을 수 없습니다.');
    }

    const comment = await this.prisma.comment.create({
      data: {
        user_id: userId,
        diary_id: diaryId,
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
      parent_id: comment.parent_id ?? undefined,
      replies: [],
    };
  }

  async updateComment(
    userId: number,
    commentId: number,
    updateCommentDto: UpdateDiaryCommentDto,
  ): Promise<DiaryCommentResponseDto> {
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
      parent_id: updatedComment.parent_id ?? undefined,
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

  async getMonthlyDiaryStatus(
    userId: number,
    year: number,
    month: number,
  ): Promise<MonthlyDiaryStatusDto> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const diaries = await this.prisma.diary.findMany({
      where: {
        user_id: userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        emotion: true,
      },
    });

    const diaryDates = diaries.map((diary) => diary.createdAt.getDate());
    const emotions = diaries.reduce(
      (acc, diary) => {
        const date = diary.createdAt.getDate().toString();
        acc[date] = diary.emotion || '';
        return acc;
      },
      {} as Record<string, string>,
    );
    return {
      year,
      diaryDates,
      month,
      emotions,
    };
  }

  async getDiariesByDate(userId: number, date: string): Promise<DiaryResponseDto[]> {
    const diaries = await this.prisma.diary.findMany({
      where: {
        user_id: userId,
        date,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
        plant: {
          select: { id: true, name: true, variety: true },
        },
        diary_img: true,
        comment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return diaries.map((diary) => ({
      id: diary.id,
      title: diary.title,
      content: diary.content,
      emotion: diary.emotion || undefined,
      memory: diary.memory || undefined,
      water: diary.water,
      sun: diary.sun,
      author: {
        id: diary.user.id,
        name: diary.user.name,
      },
      plant: diary.plant
        ? {
            id: diary.plant.id,
            name: diary.plant.name,
            variety: diary.plant.variety,
          }
        : undefined,
      createdAt: diary.createdAt,
      updatedAt: diary.updatedAt,
      images: diary.diary_img.map((img) => img.img_url),
      comments_count: diary.comment.length,
    }));
  }

  async getPlantCareInfo(userId: number, plantId: number): Promise<PlantCareInfoDto> {
    const plant = await this.prisma.plant.findFirst({
      where: {
        id: plantId,
        user_id: userId,
      },
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

    if (!plant) {
      throw new NotFoundException('식물을 찾을 수 없습니다.');
    }
    const returnData: PlantCareInfoDto = {
      plant_id: plant.id,
      plant_name: plant.name,
      wateringCycle: `${plant.cycle_value}${plant.cycle_unit}`,
      // todo - 물 준지 얼마나 됐는지
      daysUntilWatering: 0,
      sunlightNeeds: plant.sunlight_needs || '간접광선',
      lastWateringDate: plant.task_log[0]?.completion_date || null,
    };
    return returnData;
  }

  async getLastUploadedDiary(userId: number): Promise<DiaryLastUploadedDto> {
    const lastDiary = await this.prisma.diary.findFirst({
      where: { user_id: userId },
      orderBy: { date: 'desc' },
      include: {
        diary_img: {
          orderBy: { id: 'desc' }, // corrected 'dat' to 'date'
          take: 1,
        },
      },
    });

    return {
      lastUploadedAt: new Date(lastDiary?.date || ''),
      daysSinceLastUpload: lastDiary
        ? Math.floor(
            (new Date().getTime() - new Date(lastDiary.date).getTime()) / (1000 * 60 * 60 * 24),
          )
        : undefined,
    };
  }
}
