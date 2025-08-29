import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../external-api/s3.service';
import { PlantIdService } from '../external-api/plant-id.service';
import {
  CreatePlantDto,
  UpdatePlantDto,
  PlantResponseDto,
  PlantListDto,
  PlantCareLogDto,
  PlantCareLogResponseDto,
  TodayWateringListDto,
  PlantNeedsWateringDto,
} from './dto/plant.dto';

@Injectable()
export class PlantService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private plantIdService: PlantIdService,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return await this.s3Service.uploadImage(file, 'plant');
  }

  async createPlant(userId: number, createPlantDto: CreatePlantDto): Promise<PlantResponseDto> {
    const plant = await this.prisma.plant.create({
      data: {
        user_id: userId,
        name: createPlantDto.name,
        variety: createPlantDto.variety,
        img_url: createPlantDto.img_url,
        cycle_type: createPlantDto.cycle_type,
        cycle_value: createPlantDto.cycle_value,
        cycle_unit: createPlantDto.cycle_unit,
        sunlight_needs: createPlantDto.sunlight_needs,
        purchase_date: createPlantDto.purchase_date,
        purchase_location: createPlantDto.purchase_location,
        memo: createPlantDto.memo,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      id: plant.id,
      name: plant.name,
      variety: plant.variety,
      img_url: plant.img_url || '',
      cycle_type: plant.cycle_type,
      cycle_value: plant.cycle_value,
      cycle_unit: plant.cycle_unit || '',
      sunlight_needs: plant.sunlight_needs || undefined,
      purchase_date: plant.purchase_date || undefined,
      purchase_location: plant.purchase_location || undefined,
      memo: plant.memo || undefined,
      author: {
        id: plant.user.id,
        name: plant.user.name,
      },
      createdAt: plant.createdAt,
      updatedAt: plant.updatedAt,
    };
  }

  async updatePlant(
    userId: number,
    plantId: number,
    updatePlantDto: UpdatePlantDto,
  ): Promise<PlantResponseDto> {
    const existingPlant = await this.prisma.plant.findUnique({
      where: { id: plantId },
    });

    if (!existingPlant) {
      throw new NotFoundException('식물을 찾을 수 없습니다.');
    }

    if (existingPlant.user_id !== userId) {
      throw new ForbiddenException('식물을 수정할 권한이 없습니다.');
    }

    const updatedPlant = await this.prisma.plant.update({
      where: { id: plantId },
      data: updatePlantDto,
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      id: updatedPlant.id,
      name: updatedPlant.name,
      variety: updatedPlant.variety,
      img_url: updatedPlant.img_url || '',
      cycle_type: updatedPlant.cycle_type,
      cycle_value: updatedPlant.cycle_value,
      cycle_unit: updatedPlant.cycle_unit || '',
      sunlight_needs: updatedPlant.sunlight_needs || undefined,
      purchase_date: updatedPlant.purchase_date || undefined,
      purchase_location: updatedPlant.purchase_location || undefined,
      memo: updatedPlant.memo || undefined,
      author: {
        id: updatedPlant.user.id,
        name: updatedPlant.user.name,
      },
      createdAt: updatedPlant.createdAt,
      updatedAt: updatedPlant.updatedAt,
    };
  }

  async deletePlant(userId: number, plantId: number): Promise<{ message: string }> {
    const plant = await this.prisma.plant.findUnique({
      where: { id: plantId },
    });

    if (!plant) {
      throw new NotFoundException('식물을 찾을 수 없습니다.');
    }

    if (plant.user_id !== userId) {
      throw new ForbiddenException('식물을 삭제할 권한이 없습니다.');
    }

    await this.prisma.plant.delete({
      where: { id: plantId },
    });

    return { message: '식물이 삭제되었습니다.' };
  }

  async getPlant(userId: number, plantId: number): Promise<PlantResponseDto> {
    const plant = await this.prisma.plant.findUnique({
      where: { id: plantId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    if (!plant) {
      throw new NotFoundException('식물을 찾을 수 없습니다.');
    }

    if (plant.user_id !== userId) {
      throw new ForbiddenException('식물을 조회할 권한이 없습니다.');
    }

    return {
      id: plant.id,
      name: plant.name,
      variety: plant.variety,
      img_url: plant.img_url || '',
      cycle_type: plant.cycle_type,
      cycle_value: plant.cycle_value,
      cycle_unit: plant.cycle_unit || '',
      sunlight_needs: plant.sunlight_needs || undefined,
      purchase_date: plant.purchase_date || undefined,
      purchase_location: plant.purchase_location || undefined,
      memo: plant.memo || undefined,
      author: {
        id: plant.user.id,
        name: plant.user.name,
      },
      createdAt: plant.createdAt,
      updatedAt: plant.updatedAt,
    };
  }

  async getPlants(userId: number, page: number = 1, limit: number = 10): Promise<PlantListDto> {
    const skip = (page - 1) * limit;

    const [plants, total] = await Promise.all([
      this.prisma.plant.findMany({
        where: { user_id: userId },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.plant.count({
        where: { user_id: userId },
      }),
    ]);

    const plantsData: PlantResponseDto[] = plants.map((plant) => ({
      id: plant.id,
      name: plant.name,
      variety: plant.variety,
      img_url: plant.img_url || '',
      cycle_type: plant.cycle_type,
      cycle_value: plant.cycle_value,
      cycle_unit: plant.cycle_unit || '',
      sunlight_needs: plant.sunlight_needs || undefined,
      purchase_date: plant.purchase_date || undefined,
      purchase_location: plant.purchase_location || undefined,
      memo: plant.memo || undefined,
      author: {
        id: plant.user.id,
        name: plant.user.name,
      },
      createdAt: plant.createdAt,
      updatedAt: plant.updatedAt,
    }));

    return {
      plants: plantsData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllPlants(page: number = 1, limit: number = 10): Promise<PlantListDto> {
    const skip = (page - 1) * limit;

    const [plants, total] = await Promise.all([
      this.prisma.plant.findMany({
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.plant.count(),
    ]);

    const plantsData: PlantResponseDto[] = plants.map((plant) => ({
      id: plant.id,
      name: plant.name,
      variety: plant.variety,
      img_url: plant.img_url || '',
      cycle_type: plant.cycle_type,
      cycle_value: plant.cycle_value,
      cycle_unit: plant.cycle_unit || '',
      sunlight_needs: plant.sunlight_needs || undefined,
      purchase_date: plant.purchase_date || undefined,
      purchase_location: plant.purchase_location || undefined,
      memo: plant.memo || undefined,
      author: {
        id: plant.user.id,
        name: plant.user.name,
      },
      createdAt: plant.createdAt,
      updatedAt: plant.updatedAt,
    }));

    return {
      plants: plantsData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async logCareActivity(
    userId: number,
    plantId: number,
    careLogDto: PlantCareLogDto,
  ): Promise<PlantCareLogResponseDto> {
    const plant = await this.prisma.plant.findUnique({
      where: { id: plantId },
    });

    if (!plant) {
      throw new NotFoundException('식물을 찾을 수 없습니다.');
    }

    if (plant.user_id !== userId) {
      throw new ForbiddenException('식물 관리 기록을 추가할 권한이 없습니다.');
    }

    const careLog = await this.prisma.taskLog.create({
      data: {
        plant_id: plantId,
        type: careLogDto.type,
        completion_date: careLogDto.completion_date || new Date(),
      },
      include: {
        plant: {
          select: { id: true, name: true, variety: true },
        },
      },
    });

    return {
      id: careLog.id,
      type: careLog.type,
      completion_date: careLog.completion_date,
      plant: {
        id: careLog.plant.id,
        name: careLog.plant.name,
        variety: careLog.plant.variety,
      },
      createdAt: careLog.createdAt,
    };
  }

  async getCareHistory(
    userId: number,
    plantId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const plant = await this.prisma.plant.findUnique({
      where: { id: plantId },
    });

    if (!plant) {
      throw new NotFoundException('식물을 찾을 수 없습니다.');
    }

    if (plant.user_id !== userId) {
      throw new ForbiddenException('식물 관리 기록을 조회할 권한이 없습니다.');
    }

    const skip = (page - 1) * limit;

    const [careLogs, total] = await Promise.all([
      this.prisma.taskLog.findMany({
        where: { plant_id: plantId },
        include: {
          plant: {
            select: { id: true, name: true, variety: true },
          },
        },
        orderBy: { completion_date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.taskLog.count({
        where: { plant_id: plantId },
      }),
    ]);

    const careLogsData: PlantCareLogResponseDto[] = careLogs.map((log) => ({
      id: log.id,
      type: log.type,
      completion_date: log.completion_date,
      plant: {
        id: log.plant.id,
        name: log.plant.name,
        variety: log.plant.variety,
      },
      createdAt: log.createdAt,
    }));

    return {
      careLogs: careLogsData,
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
            completion_date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 최근 30일
            },
          },
        },
      },
    });

    return plants.map((plant) => {
      const now = new Date();
      const cycleInDays = this.getCycleInDays(plant.cycle_type, parseInt(plant.cycle_value));
      const lastWatering = plant.task_log
        .filter((log) => log.type === 'watering')
        .sort((a, b) => b.completion_date.getTime() - a.completion_date.getTime())[0];

      const daysSinceLastWatering = lastWatering
        ? Math.floor(
            (now.getTime() - lastWatering.completion_date.getTime()) / (1000 * 60 * 60 * 24),
          )
        : null;

      const daysUntilWatering =
        lastWatering && daysSinceLastWatering !== null
          ? Math.max(0, cycleInDays - daysSinceLastWatering)
          : 0;

      return {
        id: plant.id,
        name: plant.name,
        variety: plant.variety,
        img_url: plant.img_url,
        daysUntilWatering,
        lastWatered: lastWatering?.completion_date || null,
        wateringCycle: `${plant.cycle_value}${plant.cycle_unit || ''}`,
        sunlightNeeds: plant.sunlight_needs || '간접광선',
        careCount: plant.task_log.length,
      };
    });
  }

  async getPlantsNeedingWateringToday(userId: number): Promise<TodayWateringListDto> {
    // 오늘 요일 가져오기
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    const todayDate = today.getDate(); //

    // 요일을 한국어로 변환

    // 매주 줘야하는 것들 중 오늘이 요일에 맞는 것들
    // 매달 줘야하는 것들 중 오늘이 날짜에 맞는 것들
    const plants = await this.prisma.plant.findMany({
      where: {
        user_id: userId,
        OR: [
          {
            cycle_type: 'WEEKLY',
            cycle_value: dayOfWeek.toString(),
            cycle_unit: 'days',
          },
          {
            cycle_type: 'MONTHLY',
            cycle_value: todayDate.toString(),
            cycle_unit: 'days',
          },
        ],
      },
    });

    const plantsData: PlantNeedsWateringDto[] = plants.map((plant) => ({
      id: plant.id,
      name: plant.name,
      variety: plant.variety,
      img_url: plant.img_url || '',
      wateringCycle: `${plant.cycle_value}${plant.cycle_unit || ''}`,
      daysOverdue: 0, // 기본값, 실제 계산 필요
    }));

    const returnData: TodayWateringListDto = {
      totalCount: plants.length,
      plants: plantsData,
    };

    return returnData;
  }

  async getAllUploadedImages(userId: number): Promise<string[]> {
    const images = await this.prisma.diaryImg.findMany({
      where: { diary: { user_id: userId } },
      orderBy: { id: 'desc' },
    });
    return images.map((image) => image.img_url);
  }

  private getCycleInDays(cycleType: any, cycleValue: number): number {
    switch (cycleType) {
      case 'WEEKLY':
        return 7 * cycleValue;
      case 'BIWEEKLY':
        return 14 * cycleValue;
      case 'TRIWEEKLY':
        return 21 * cycleValue;
      case 'MONTHLY':
        return 30 * cycleValue;
      default:
        return 7; // 기본값
    }
  }
}
