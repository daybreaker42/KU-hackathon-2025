
// 일기 데이터 타입 정의
interface DiaryData {
    id: number;
    title: string;
    content: string;
    emotion: string | null;
    memory: string | null;
    author: object;
    plant: object | null;
    createdAt: string;
    updatedAt: string;
    images: string[];
    comments_count: number;
}

// 페이지에서 사용할 간소화된 일기 데이터
export interface SimpleDiaryData {
    title: string;
    content: string;
    photo: string | null;
}

const header = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJzdWIiOjEsImlhdCI6MTc1NjM4OTY4OCwiZXhwIjoxNzU2NDc2MDg4fQ.hJ9Ki7FYZsErWkwpubq03cxZbw4v9SUt5nJASqTXccU`
};
const url = 'https://0350e7e6e842.ngrok-free.app';

export async function getDayDiary(date: Date): Promise<SimpleDiaryData | null> {
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
  
  try {
    // 실제 서버 API 호출
    const response = await fetch(`${url}/diaries/date/${dateString}`, {
      method: 'GET',
      headers: header,
    });

    if (response.ok) {
      const data: DiaryData[] = await response.json();
      
      // 배열이 비어있거나 일기가 없는 경우
      if (!data || data.length === 0) {
        return null;
      }
      
      // 첫 번째 일기 데이터 사용 (같은 날짜에 여러 일기가 있을 수 있음)
      const diary = data[0];
      
      return {
        title: diary.title,
        content: diary.content,
        photo: diary.images && diary.images.length > 0 ? diary.images[0] : null
      };
    } else if (response.status === 404) {
      // 일기가 없는 경우
      return null;
    } else {
      console.error('Failed to fetch diary:', response.statusText);
    }
  } catch (error) {
    console.error('Network error while fetching diary:', error);
  }
  
  // 서버 호출 실패 시 임시 데이터 또는 null 반환
  const day = date.getDate();
  
  // 수요일(3)에는 일기가 없다고 가정
  if (date.getDay() === 3) return null;
  
  // 임시 데이터 반환
  return {
    title: `${date.getMonth() + 1}월 ${day}일 일기`,
    content: `${date.getDay()}번째 요일입니다. 오늘은 땡땡이 한테 물을 줬다. 오늘은 손자가 왔다 등등 왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등왔다 등일기 작성 내용 등 내용 내용 내용 내`,
    photo: date.getDay() === 2 ? null : `/test/Group 17.png`
  };
}

/* CONDITION */
export async function getLastUploaded(): Promise<number | null> {
  try {
    // 실제 서버 API 호출
    const response = await fetch(`${url}/diary/lastUpload`, {
      method: 'GET',
      headers: header,
    });

    if (response.ok) {
      const data = await response.json();
      
      // 서버에서 일수를 반환받는 경우
      if (typeof data.days === 'number') {
        return data.days;
      }
      
      // 다른 형태로 데이터가 오는 경우 처리
      if (typeof data === 'number') {
        return data;
      }
      
      console.error('Unexpected response format:', data);
      return null;
    } else {
      console.error('Failed to fetch last uploaded days:', response.statusText);
    }
  } catch (error) {
    console.error('Network error while fetching last uploaded days:', error);
  }
  
  // 서버 호출 실패 시 임시 데이터 반환
  // return null;
  return 6;
  // return 1;
  // return 2;
  // return 3;
}


