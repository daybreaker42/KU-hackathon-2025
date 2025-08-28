
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
  'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJzdWIiOjEsImlhdCI6MTc1NjM4OTY4OCwiZXhwIjoxNzU2NDc2MDg4fQ.hJ9Ki7FYZsErWkwpubq03cxZbw4v9SUt5nJASqTXccU`,
  'ngrok-skip-browser-warning': 'true', // ngrok 브라우저 경고 스킵
};
const url = 'https://0350e7e6e842.ngrok-free.app';

/* DIARY */
export async function getDayDiary(date: Date): Promise<SimpleDiaryData | null> {
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
  try {
    // 실제 서버 API 호출
    const response = await fetch(`${url}/diaries/date/${dateString}`, {
      method: 'GET',
      headers: header,
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
        
        console.log(data);
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
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        const text = await response.text();
        console.error('Response text:', text.substring(0, 200));
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
    const response = await fetch(`${url}/diaries/lastUploaded`, {
      method: 'GET',
      headers: header,
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
        
        // 이전 구조 지원: {days: number}
        if (typeof data.days === 'number') {
          return data.days;
        }
        
        // 숫자만 직접 반환하는 경우
        if (typeof data === 'number') {
          return data;
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
  
  // 서버 호출 실패 시 임시 데이터 반환
  // return null;
  return 6;
  // return 1;
  // return 2;
  // return 3;
}


