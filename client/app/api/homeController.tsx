import { apiRequest } from "./authController";

export interface ApiPlantData {
  id: number;
  name: string;
  variety: string;
  img_url: string;
  status: string;
  daysUntilWatering: number;
  lastWatered: string;
  wateringCycle: string;
  sunlightNeeds: string;
  recentEmotion: string;
}

// 오늘 할 일 관련 타입 정의
export interface PlantTask {
  type: "watering" | "sunlight";
  plant: {
    id: number;
    name: string;
    variety: string;
  };
}

export interface TodayWateringResponse {
  wateringCount: number;
  sunlightCount: number;
  totalTasks: number;
  tasks: PlantTask[];
}

// 기존 타입은 호환성을 위해 유지
export interface TodayWateringPlant {
  id: number;
  name: string;
  variety: string;
  img_url: string;
  lastWatered: string;
  wateringCycle: string;
  daysOverdue: number;
}

/* HOME - 성준 추가 */
export async function getMyPlants(): Promise<ApiPlantData[]> {
  try {
    const response = await apiRequest(`/home/my-plants`, {
      method: 'GET',
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        return [];
      }
      const data: ApiPlantData[] = await response.json();
      return data;
    } else {
      console.error('Failed to fetch my plants:', response.status, response.statusText);
      const text = await response.text();
      console.error('Error response:', text.substring(0, 200));
      return [];
    }
  } catch (error) {
    console.error('Network error while fetching my plants:', error);
    return [];
  }
}

/* 오늘 할 일 가져오기 */
export async function getTodayWateringPlants(): Promise<TodayWateringResponse> {
  try {
    const response = await apiRequest(`/home/today-tasks`, {
      method: 'GET',
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        return { wateringCount: 0, sunlightCount: 0, totalTasks: 0, tasks: [] };
      }
      const data: TodayWateringResponse = await response.json();
      return data;
    } else {
      console.error('Failed to fetch today tasks:', response.status, response.statusText);
      const text = await response.text();
      console.error('Error response:', text.substring(0, 200));
      return { wateringCount: 0, sunlightCount: 0, totalTasks: 0, tasks: [] };
    }
  } catch (error) {
    console.error('Network error while fetching today tasks:', error);
    return { wateringCount: 0, sunlightCount: 0, totalTasks: 0, tasks: [] };
  }
}

// 일기 데이터 타입 정의
interface DiaryData {
    id: number;
    title: string;
    content: string;
    emotion: string;
    memory: string;
    water: boolean;
    sun: boolean;
    author: {
      id: number;
      name: string;
    };
    plant: object | null;
    createdAt: string;
    updatedAt: string;
    images: string[];
    comments_count: number;
}

// 페이지에서 사용할 간소화된 일기 데이터
export interface SimpleDiaryData {
    id: number;
    title: string;
    content: string;
    emotion: string;
    memory: string;
    water: boolean;
    sun: boolean;
    author: {
      id: number;
      name: string;
    };
    createdAt: string;
    updatedAt: string;
    images: string[];
    comments_count: number;
}

// 월별 일기 데이터 타입 정의
export interface MonthlyDiaryData {
    year: number;
    month: number;
    diaryDates: number[];
    emotions: { [key: string]: string };
}

/* DIARY */
export async function getDayDiary(date: Date): Promise<SimpleDiaryData | null> {
  // console.log(date);
  // 현지 시간대를 기준으로 날짜 문자열 생성 (시간대 변환 문제 해결)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`; // YYYY-MM-DD 형식으로 변환
  try {
    // 실제 서버 API 호출
    // console.log(dateString);
    const response = await apiRequest(`/diaries/date/${dateString}`, {
      method: 'GET',
    });

    if (response.ok) {
      // Content-Type 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        return null;
      }

      try {
        const data: DiaryData[] = await response.json();
        
        // 배열이 비어있거나 일기가 없는 경우
        if (!data || data.length === 0) {
          return null;
        }
        
        // 첫 번째 일기 데이터 사용 (같은 날짜에 여러 일기가 있을 수 있음)
        const diary = data[0];
        
        return {
          id: diary.id,
          title: diary.title,
          content: diary.content,
          emotion: diary.emotion,
          memory: diary.memory,
          water: diary.water || false,
          sun: diary.sun || false,
          author: diary.author,
          createdAt: diary.createdAt,
          updatedAt: diary.updatedAt,
          images: diary.images || [],
          comments_count: diary.comments_count || 0
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return null;
      }
    } else if (response.status === 404) {
      console.log('No diary found for this date (404)');
      // 일기가 없는 경우
      return null;
    } else {
      console.error('Failed to fetch diary:', response.status, response.statusText);
      const text = await response.text();
      console.error('Error response:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('Network error while fetching diary:', error);
  }

  return null;
}

/* MONTHLY DIARY */
export async function getMonthlyDiary(year: number, month: number): Promise<MonthlyDiaryData | null> {
  try {
    // 실제 서버 API 호출
    const response = await apiRequest(`/diaries/monthly/${year}/${month}`, {
      method: 'GET',
    });

    if (response.ok) {
      // Content-Type 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        return null;
      }

      try {
        const data: MonthlyDiaryData = await response.json();
        return data;
      } catch (parseError) {
        console.error('JSON parse error in getMonthlyDiary:', parseError);
        const text = await response.text();
        console.error('Response text:', text.substring(0, 200));
        return null;
      }
    } else {
      console.error('Failed to fetch monthly diary:', response.status, response.statusText);
      const text = await response.text();
      console.error('Error response:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('Network error while fetching monthly diary:', error);
  }
  
  return null;
}

/* WEEKLY DIARY */
export async function getWeeklyDiary(dates: Date[]): Promise<number[]> {
  try {
    // 날짜 배열을 YYYY-MM-DD 형식으로 변환 (현지 시간대 기준)
    const dateStrings = dates.map(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
    
    // 각 날짜에 대해 일기 존재 여부 확인
    const diaryPromises = dateStrings.map(async (dateString) => {
      try {
        const response = await apiRequest(`/diaries/date/${dateString}`, {
          method: 'GET',
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data: DiaryData[] = await response.json();
            return data && data.length > 0;
          }
        }
        return false;
      } catch (error) {
        console.error(`Error checking diary for ${dateString}:`, error);
        return false;
      }
    });

    const results = await Promise.all(diaryPromises);
    
    // 일기가 있는 날짜의 인덱스들을 반환
    return results.map((hasDiary, index) => hasDiary ? index-1 : -1).filter(index => index !== -1);
  } catch (error) {
    console.error('Network error while fetching weekly diary:', error);
  }
  
  // 임시 데이터 반환 (개발용)
  return [0, 2, 4, 6]; // 일, 화, 목, 토에 일기가 있다고 가정
}

/* CONDITION */
export async function getLastUploaded(): Promise<number | null> {
  try {
    // 실제 서버 API 호출
    const response = await apiRequest(`/diaries/lastUploaded`, {
      method: 'GET',
    });

    if (response.ok) {
      // Content-Type 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        return null;
      }

      try {
        const data = await response.json();
        console.log(data);


        // 새로운 응답 구조에 맞춘 처리: {lastUploadedAt: string, daysSinceLastUpload: number}
        if (typeof data.daysSinceLastUpload === 'number') {
          return data.daysSinceLastUpload;
        }
        
        console.error('Unexpected response format:', data);
        return null;
      } catch (parseError) {
        console.error('JSON parse error in getLastUploaded:', parseError);
        const text = await response.text();
        console.error('Response text:', text.substring(0, 200));
        return null;
      }
    } else {
      console.error('Failed to fetch last uploaded days:', response.status, response.statusText);
      const text = await response.text();
      console.error('Error response:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('Network error while fetching last uploaded days:', error);
  }
  return null;
}

// 댓글 데이터 타입 정의
export interface CommentData {
  id: number;
  content: string;
  author: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 일기별 댓글 조회
export async function getDiaryComments(diaryId: number): Promise<CommentData[]> {
  try {
    const response = await apiRequest(`/diaries/${diaryId}/comments?page=1&limit=3`, {
      method: 'GET',
    });

    if (response.ok) {
      const result = await response.json();
      return result.comments;
    } else {
      console.error('Failed to fetch diary comments:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Network error while fetching diary comments:', error);
  }
  return [];
}

// 이번달 최근 3일치 일기의 댓글 조회
export async function getRecentDiaryComments(): Promise<{ day: Date; title: string; list: { user: string; comment: string }[]}[]| null> {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    // 이번달 일기 목록 조회
    const response = await apiRequest(`/diaries/monthly/${currentYear}/${currentMonth}`, {
      method: 'GET',
    });

    if (response.ok) {
      const monthlyData = await response.json();
      
      // 일기가 있는 날짜들을 최신순으로 정렬하고 중복 제거 후 최근 3일만 선택
      const recentDates = monthlyData.diaryDates
        .filter((date: number, index: number, array: number[]) => array.indexOf(date) === index) // 중복 제거
        .sort((a: number, b: number) => b - a)
        .slice(0, 3);

      const reactionData: { day: Date; title: string; list: { user: string; comment: string }[] }[] = [];

      // 각 날짜의 일기와 댓글 조회
      for (const date of recentDates) {
        const diaryDate = new Date(currentYear, currentMonth - 1, date);
        const diary = await getDayDiary(diaryDate);
        
        if (diary) {
          const comments = await getDiaryComments(diary.id);
          
          if (comments.length === 0) continue;
          reactionData.push({
            day: diaryDate,
            title: diary.title,
            list: comments.map(comment => ({
              user: comment.author.name,
              comment: comment.content
            }))
          });
        }
      }
      
      return reactionData;
    }
  } catch (error) {
    console.error('Network error while fetching recent diary comments:', error);
  }
  
  return null;
}


