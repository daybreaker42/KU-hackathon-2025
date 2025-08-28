
// 일기 데이터 타입 정의
interface DiaryData {
    title: string;
    content: string;
    photo: string | null;
}

export async function getDayDiary(date: Date): Promise<DiaryData | null> {
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
  
  try {
    // 실제 서버 API 호출
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/diary/${dateString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`, // 인증 토큰이 있다면
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      // 서버에서 일기가 없다고 응답한 경우
      if (data.message && data.message.includes('No diary found')) {
        return null;
      }
      
      return {
        title: data.title,
        content: data.content,
        photo: data.photo ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/images/${data.photo}` : null
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

