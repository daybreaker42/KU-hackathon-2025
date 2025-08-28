// 식물 관련 타입 정의
export interface Plant {
  id: number;
  name: string; // 애칭
  variety: string; // 종류
  img_url: string;
  daysUntilWatering: number; // 물 주기까지 남은 일수
  recentEmotion: string; // 최근 감정
}

// 식물 감정 상태
export type PlantEmotion = '행복' | '보통' | '슬픔' | '아픔';


// 물 주기 텍스트 생성 유틸리티 함수
export const getLastActivityText = (plant: Plant): string => {
  if (plant.daysUntilWatering === 0) {
    return `오늘 물 주기`;
  } else if (plant.daysUntilWatering > 0) {
    return `물 주기까지 ${plant.daysUntilWatering}일 남음`;
  } else {
    return `물 준지 ${Math.abs(plant.daysUntilWatering)}일 지남`;
  }
};
