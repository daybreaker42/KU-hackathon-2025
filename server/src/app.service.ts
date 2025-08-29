import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  getHello(): string {
    return '연리지 - 세상과 나를 잇는 식물';
  }

  async seedMockupData(): Promise<string> {
    try {
      // 1. Plant 데이터 시딩
      const plants = await this.prismaService.plant.createMany({
        data: [
          {
            user_id: 1,
            variety: '몬스테라',
            name: '몬이',
            cycle_type: 'WEEKLY',
            cycle_value: '7',
            cycle_unit: 'days',
            sunlight_needs: '간접광',
            purchase_date: new Date('2024-01-15'),
            purchase_location: '홈플러스',
            memo: '첫 번째 식물, 잘 자라고 있어요',
            img_url: '/images/monstera.jpg',
          },
          {
            user_id: 1,
            variety: '산세베리아',
            name: '세베',
            cycle_type: 'BIWEEKLY',
            cycle_value: '14',
            cycle_unit: 'days',
            sunlight_needs: '직사광선',
            purchase_date: new Date('2024-02-20'),
            purchase_location: '꽃집',
            memo: '공기정화 식물',
            img_url: '/images/sansevieria.jpg',
          },
          {
            user_id: 1,
            variety: '스킨답서스',
            name: '스킨이',
            cycle_type: 'WEEKLY',
            cycle_value: '5',
            cycle_unit: 'days',
            sunlight_needs: '반음지',
            purchase_date: new Date('2024-03-10'),
            purchase_location: '온라인몰',
            memo: '덩굴식물로 예뻐요',
            img_url: '/images/scindapsus.jpg',
          },
        ],
      });

      // 2. TaskLog 데이터 시딩 (식물 ID 1, 2, 3에 대해)
      await this.prismaService.taskLog.createMany({
        data: [
          {
            plant_id: 1,
            completion_date: new Date('2024-08-20'),
            type: '물주기',
          },
          {
            plant_id: 1,
            completion_date: new Date('2024-08-25'),
            type: '비료주기',
          },
          {
            plant_id: 2,
            completion_date: new Date('2024-08-22'),
            type: '물주기',
          },
          {
            plant_id: 3,
            completion_date: new Date('2024-08-24'),
            type: '물주기',
          },
          {
            plant_id: 3,
            completion_date: new Date('2024-08-26'),
            type: '가지치기',
          },
        ],
      });

      // 3. Diary 데이터 시딩
      const diaries = await this.prismaService.diary.createMany({
        data: [
          {
            user_id: 1,
            title: '몬이의 첫 새잎',
            content:
              '오늘 몬이에게 새로운 잎이 나왔어요! 정말 신기하고 기뻐요. 매일 물을 주고 관찰한 보람이 있네요.',
            emotion: 'happy',
            memory: '첫 새잎의 감동',
          },
          {
            user_id: 1,
            title: '세베의 성장 기록',
            content:
              '산세베리아 세베가 한층 더 커진 것 같아요. 잎이 더 두꺼워지고 색깔도 진해졌어요.',
            emotion: 'satisfied',
            memory: '꾸준한 성장의 기쁨',
          },
          {
            user_id: 1,
            title: '스킨이 물주기',
            content:
              '스킨답서스는 물을 좋아하는 것 같아요. 며칠 전에 물을 줬는데 벌써 흙이 말랐네요.',
            emotion: 'normal',
            memory: '물주기 패턴 파악',
          },
          {
            user_id: 1,
            title: '오늘의 식물 관찰',
            content:
              '모든 식물들이 건강해 보여요. 특히 몬이는 잎이 더 커진 것 같고, 세베는 새로운 촉이 나올 것 같아요.',
            emotion: 'happy',
            memory: '전체적인 건강 체크',
          },
        ],
      });

      // 4. DiaryImg 데이터 시딩
      await this.prismaService.diaryImg.createMany({
        data: [
          {
            diary_id: 1,
            img_url: '/images/diary/monstera_newleaf.jpg',
          },
          {
            diary_id: 2,
            img_url: '/images/diary/sansevieria_growth.jpg',
          },
          {
            diary_id: 3,
            img_url: '/images/diary/scindapsus_watering.jpg',
          },
          {
            diary_id: 4,
            img_url: '/images/diary/all_plants.jpg',
          },
        ],
      });

      // 5. Emotion 데이터 시딩
      await this.prismaService.emotion.createMany({
        data: [
          {
            user_id: 1,
            type: 'happy',
            created_at: new Date('2024-08-25'),
          },
          {
            user_id: 1,
            type: 'satisfied',
            created_at: new Date('2024-08-24'),
          },
          {
            user_id: 1,
            type: 'excited',
            created_at: new Date('2024-08-23'),
          },
          {
            user_id: 1,
            type: 'calm',
            created_at: new Date('2024-08-22'),
          },
        ],
      });

      // 6. Post 데이터 시딩
      await this.prismaService.post.createMany({
        data: [
          {
            user_id: 1,
            title: '몬스테라 키우기 팁',
            content:
              '몬스테라를 키우면서 알게 된 팁들을 공유해요. 첫째, 물주기는 흙이 완전히 마르면 주세요. 둘째, 간접광이 좋아요.',
            category: '식물키우기',
            plant_name: '몬스테라',
            likes: 15,
          },
          {
            user_id: 1,
            title: '초보자도 쉬운 식물 추천',
            content:
              '식물 키우기 초보자분들께 산세베리아를 추천드려요. 물을 자주 안 줘도 되고 공기정화 효과도 좋아요.',
            category: '추천',
            plant_name: '산세베리아',
            likes: 8,
          },
          {
            user_id: 1,
            title: '우리집 식물 가족들',
            content:
              '현재 키우고 있는 식물들을 소개해요. 몬스테라, 산세베리아, 스킨답서스 총 3개의 식물을 키우고 있어요.',
            category: '일상',
            plant_name: '여러종',
            likes: 22,
          },
        ],
      });

      // 7. PostImg 데이터 시딩
      await this.prismaService.postImg.createMany({
        data: [
          {
            post_id: 1,
            img_url: '/images/posts/monstera_tips.jpg',
          },
          {
            post_id: 2,
            img_url: '/images/posts/sansevieria_recommend.jpg',
          },
          {
            post_id: 3,
            img_url: '/images/posts/plant_family1.jpg',
          },
          {
            post_id: 3,
            img_url: '/images/posts/plant_family2.jpg',
          },
        ],
      });

      // 8. Comment 데이터 시딩
      await this.prismaService.comment.createMany({
        data: [
          {
            post_id: 1,
            user_id: 1,
            content: '몬스테라 정말 예쁘게 키우시네요!',
          },
          {
            post_id: 1,
            user_id: 1,
            content: '저도 몬스테라 키우고 싶어졌어요',
          },
          {
            post_id: 2,
            user_id: 1,
            content: '산세베리아 정말 키우기 쉬워요',
          },
          {
            diary_id: 1,
            user_id: 1,
            content: '새잎 나온 거 축하드려요!',
          },
          {
            diary_id: 2,
            user_id: 1,
            content: '세베가 정말 건강해 보이네요',
          },
        ],
      });

      // 9. Likes 데이터 시딩
      await this.prismaService.likes.createMany({
        data: [
          {
            user_id: 1,
            post_id: 1,
          },
          {
            user_id: 1,
            post_id: 2,
          },
          {
            user_id: 1,
            post_id: 3,
          },
        ],
      });

      // 10. Memory 데이터 시딩
      await this.prismaService.memory.createMany({
        data: [
          {
            user_id: 1,
            diary_id: 1,
            content: '몬이의 첫 새잎이 나온 순간을 기억하고 싶어요',
          },
          {
            user_id: 1,
            diary_id: 2,
            content: '세베가 얼마나 많이 자랐는지 기록해두고 싶어요',
          },
          {
            user_id: 1,
            diary_id: 3,
            content: '스킨이의 물주기 패턴을 파악한 날',
          },
        ],
      });

      return '모든 mockup 데이터가 성공적으로 시딩되었습니다!';
    } catch (error) {
      console.error('시딩 중 오류 발생:', error);
      throw new Error('시딩 실패: ' + error.message);
    }
  }
}
