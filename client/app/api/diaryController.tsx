import { apiRequest } from "./authController";

// 일기 메모리 조회 - 중요한 성장일기들
export async function getDiaryMemories() {
  try {
    const response = await apiRequest("/diaries/memory", {
      method: "GET"
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching diary memories:", errorData);
      throw new Error(errorData.message || "Unknown error");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching diary memories:", error);
    throw error;
  }
}

export async function getPlant() {
  try {
    const response = await apiRequest("/plants", {
      method: "GET"
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching plant list:", errorData);
      throw new Error(errorData.message || "Unknown error");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching plant list:", error);
    throw error;
  }
}

export async function postDiary(data: {
  title: string;
  content: string;
  emotion: string;
  memory: string;
  plant_id: number;
  water: boolean;
  sun: boolean;
  images: File[];
  date: string;
}) {
  try {


    const req:{
      title: string;
      content: string;
      emotion: string;
      memory: string;
      plant_id: number;
      water: boolean;
      sun: boolean;
      images: string[];
    } = {
      title: data.title,
      content: data.content,
      emotion: data.emotion,
      memory: data.memory,
      plant_id: data.plant_id,
      water: data.water,
      sun: data.sun,
      images: []
    };
    let res;
    // 이미지가 있으면 먼저 이미지 업로드
    const images: string[] = [];
    if (data.images && data.images.length > 0) {
      // FormData를 사용하여 이미지 업로드
      const formData = new FormData();
      data.images.forEach((file) => {
        formData.append(`file`, file);
      });

      res = await apiRequest("/diaries/image", {
        method: "POST",
        body: formData
      }, true, true); // FormData 사용을 위해 isFormData=true 전달

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error uploading images:", errorData);
        throw new Error(errorData.message || "Unknown error");
      }

      const result = await res.json();
      images.push(result.imageUrl);
    }

    req.images = images;
    // 다이어리 데이터 전송
    const response = await apiRequest("/diaries", {
      method: "POST",
      body: JSON.stringify(req)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error posting diary:", errorData);
      throw new Error(errorData.message || "Unknown error");
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("Error posting diary:", error);
    throw error;
  }
}

export async function deleteDiary(diaryId: number) {
  try {
    const response = await apiRequest(`/diaries/${diaryId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error deleting diary:", errorData);
      throw new Error(errorData.message || "Unknown error");
    }

    return true;
  } catch (error) {
    console.error("Error deleting diary:", error);
    throw error;
  }
}

// 일기 댓글 관련 타입 정의
export interface DiaryComment {
  id: number;
  content: string;
  author: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  parent_id?: number;
  replies?: DiaryComment[];
}

export interface CreateDiaryCommentData {
  content: string;
  parent_id?: number;
}

export interface UpdateDiaryCommentData {
  content: string;
}

// 일기 댓글 조회
export async function getDiaryComments(diaryId: number): Promise<DiaryComment[]> {
  try {
    const response = await apiRequest(`/diaries/${diaryId}/comments?page=1&limit=10`, {
      method: "GET"
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching diary comments:", errorData);
      throw new Error(errorData.message || "Unknown error");
    }

    const data = await response.json();
    return data.comments || [];
  } catch (error) {
    console.error("Error fetching diary comments:", error);
    throw error;
  }
}

// 일기 댓글 작성
export async function createDiaryComment(diaryId: number, commentData: CreateDiaryCommentData): Promise<DiaryComment> {
  try {
    const response = await apiRequest(`/diaries/${diaryId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error creating diary comment:", errorData);
      throw new Error(errorData.message || "Unknown error");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating diary comment:", error);
    throw error;
  }
}

// 일기 댓글 수정
export async function updateDiaryComment(commentId: number, commentData: UpdateDiaryCommentData): Promise<DiaryComment> {
  try {
    const response = await apiRequest(`/diaries/comments/${commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error updating diary comment:", errorData);
      throw new Error(errorData.message || "Unknown error");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating diary comment:", error);
    throw error;
  }
}

// 일기 댓글 삭제
export async function deleteDiaryComment(commentId: number): Promise<void> {
  try {
    const response = await apiRequest(`/diaries/comments/${commentId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error deleting diary comment:", errorData);
      throw new Error(errorData.message || "Unknown error");
    }

    return;
  } catch (error) {
    console.error("Error deleting diary comment:", error);
    throw error;
  }
}