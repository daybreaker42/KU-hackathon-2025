// Community 관련 API 컨트롤러
import { apiRequest } from './authController';

// Plant API 타입 정의
export interface Plant {
  id: number;
  name: string;
  variety: string;
  img_url: string;
  cycle_type: string;
  cycle_value: string;
  cycle_unit: string;
  sunlight_needs: string;
  purchase_date: string;
  purchase_location: string;
  memo: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PlantsResponse {
  plants: Plant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PlantsQueryParams {
  page?: number;
  limit?: number;
}

// Community API 타입 정의
export interface CommunityPost {
  id: number;
  title: string;
  content: string;
  category: string;
  plant_name: string;
  likes_count: number;
  comments_count: number;
  author: {
    id?: number;
    name?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
  images: string[];
  isLiked: boolean;
}

// 댓글 타입 정의
export interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  parent_id: number | null;
  replies: Comment[];
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CommentsQueryParams {
  page?: number;
  limit?: number;
}

export interface CommunityResponse {
  posts: CommunityPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CommunityQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  plant_name?: string;
  search?: string;
}

/**
 * === Community API 함수들 ===
 */

// 커뮤니티 게시글 목록 가져오기 API
export const getCommunityPosts = async (
  params: CommunityQueryParams = {}
): Promise<CommunityResponse> => {
  try {
    // Query parameters를 URL에 추가
    const queryParams = new URLSearchParams();
    
    // 기본값 설정
    const {
      page = 1,
      limit = 10,
      category,
      plant_name,
      search
    } = params;

    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (category) queryParams.append('category', category);
    if (plant_name) queryParams.append('plant_name', plant_name);
    if (search) queryParams.append('search', search);

    const endpoint = `/community?${queryParams.toString()}`;
    
    const response = await apiRequest(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`커뮤니티 게시글 조회 실패: ${response.status}`);
    }

    const data: CommunityResponse = await response.json();
    return data;
  } catch (error) {
    console.error('커뮤니티 게시글 조회 중 오류 발생:', error);
    throw error;
  }
};

// 초기 피드 데이터 로드 함수 - question, daily, free 카테고리에서 각각 최신 3개씩
export const getInitialFeedData = async (): Promise<{
  question: CommunityPost[];
  daily: CommunityPost[];
  free: CommunityPost[];
}> => {
  try {
    // 병렬로 3개 카테고리 데이터 요청
    const [questionData, dailyData, freeData] = await Promise.all([
      getCommunityPosts({ category: 'question', page: 1, limit: 3 }),
      getCommunityPosts({ category: 'daily', page: 1, limit: 3 }),
      getCommunityPosts({ category: 'free', page: 1, limit: 3 })
    ]);

    return {
      question: questionData.posts,
      daily: dailyData.posts,
      free: freeData.posts
    };
  } catch (error) {
    console.error('초기 피드 데이터 로드 중 오류 발생:', error);
    throw error;
  }
};

// 특정 카테고리의 게시글 가져오기
export const getCommunityPostsByCategory = async (
  category: string,
  page: number = 1,
  limit: number = 10
): Promise<CommunityResponse> => {
  return getCommunityPosts({ category, page, limit });
};

// 특정 식물 이름으로 게시글 검색
export const getCommunityPostsByPlant = async (
  plant_name: string,
  page: number = 1,
  limit: number = 10
): Promise<CommunityResponse> => {
  return getCommunityPosts({ plant_name, page, limit });
};

// 키워드로 게시글 검색
export const searchCommunityPosts = async (
  search: string,
  page: number = 1,
  limit: number = 10
): Promise<CommunityResponse> => {
  return getCommunityPosts({ search, page, limit });
};

// 커뮤니티 게시글 생성 API
export interface CreateCommunityPostData {
  title: string;
  content: string;
  category: string;
  plant_name?: string;
  images?: string[];
}

export const createCommunityPost = async (
  postData: CreateCommunityPostData
): Promise<CommunityPost> => {
  try {
    const endpoint = '/community/posts';
    
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(postData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`게시글 생성 실패: ${errorData.message || response.status}`);
    }

    const data: CommunityPost = await response.json();
    return data;
  } catch (error) {
    console.error('게시글 생성 중 오류 발생:', error);
    throw error;
  }
};

// 커뮤니티 게시글 상세 정보 가져오기 API
export const getCommunityPostById = async (
  id: string | number
): Promise<CommunityPost> => {
  try {
    const endpoint = `/community/${id}`;
    
    const response = await apiRequest(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`게시글 상세 정보 조회 실패: ${response.status}`);
    }

    const data: CommunityPost = await response.json();
    return data;
  } catch (error) {
    console.error('게시글 상세 정보 조회 중 오류 발생:', error);
    throw error;
  }
};

// 게시글 댓글 목록 가져오기 API
export const getCommunityPostComments = async (
  postId: string | number,
  params: CommentsQueryParams = {}
): Promise<CommentsResponse> => {
  try {
    // Query parameters를 URL에 추가
    const queryParams = new URLSearchParams();
    
    // 기본값 설정
    const {
      page = 1,
      limit = 10
    } = params;

    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const endpoint = `/community/posts/${postId}/comments?${queryParams.toString()}`;
    
    const response = await apiRequest(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`댓글 조회 실패: ${response.status}`);
    }

    const data: CommentsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('댓글 조회 중 오류 발생:', error);
    throw error;
  }
};

// 댓글 작성 API
export interface CreateCommentData {
  content: string;
  parent_id?: number;
}

export const createCommunityComment = async (
  postId: string | number,
  commentData: CreateCommentData
): Promise<Comment> => {
  try {
    const endpoint = `/community/posts/${postId}/comments`;

    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(commentData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`댓글 작성 실패: ${errorData.message || response.status}`);
    }

    const data: Comment = await response.json();
    return data;
  } catch (error) {
    console.error('댓글 작성 중 오류 발생:', error);
    throw error;
  }
};

// 댓글 수정 API
export interface UpdateCommentData {
  content: string;
}

export const updateCommunityComment = async (
  commentId: string | number,
  commentData: UpdateCommentData
): Promise<Comment> => {
  try {
    const endpoint = `/community/comments/${commentId}`;

    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(commentData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`댓글 수정 실패: ${errorData.message || response.status}`);
    }

    const data: Comment = await response.json();
    return data;
  } catch (error) {
    console.error('댓글 수정 중 오류 발생:', error);
    throw error;
  }
};

// 댓글 삭제 API
export const deleteCommunityComment = async (
  commentId: string | number
): Promise<void> => {
  try {
    const endpoint = `/community/comments/${commentId}`;

    const response = await apiRequest(endpoint, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('댓글 삭제 권한이 없습니다.');
      } else if (response.status === 404) {
        throw new Error('댓글을 찾을 수 없습니다.');
      } else {
        throw new Error(`댓글 삭제 실패: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('댓글 삭제 중 오류 발생:', error);
    throw error;
  }
};

// 게시글 좋아요 토글 API
export interface LikeResponse {
  isLiked: boolean;
  likesCount: number;
}

export const toggleCommunityPostLike = async (
  postId: string | number
): Promise<LikeResponse> => {
  try {
    const endpoint = `/community/posts/${postId}/like`;

    const response = await apiRequest(endpoint, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`좋아요 토글 실패: ${response.status}`);
    }

    const data: LikeResponse = await response.json();
    return data;
  } catch (error) {
    console.error('좋아요 토글 중 오류 발생:', error);
    throw error;
  }
};

// 이미지 여러장 업로드 API
export const uploadImages = async (
  files: File[]
): Promise<{ imageUrls: string[] }> => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const endpoint = '/image/upload/multiple?folder=plants';
    
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: formData,
    }, true, true);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`이미지 업로드 실패: ${errorData.message || response.status}`);
    }

    const data: { imageUrls: string[] } = await response.json();
    return data;
  } catch (error) {
    console.error('이미지 업로드 중 오류 발생:', error);
    throw error;
  }
};


/**
 * === Plants API 함수들 ===
 */

// 식물 이미지 업로드 API (단일 파일)
export const uploadPlantImage = async (
  file: File
): Promise<{ imageUrl: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file); // API 문서에 따르면 key는 'file'

    const endpoint = '/plants/image';

    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: formData,
    }, true, true); // requireAuth = true, isFormData = true

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`식물 이미지 업로드 실패: ${errorData.message || response.status}`);
    }

    const data: { imageUrl: string } = await response.json();
    return data;
  } catch (error) {
    console.error('식물 이미지 업로드 중 오류 발생:', error);
    throw error;
  }
};

// Plant.ID를 통한 식물 식별 API 타입 정의
export interface PlantIdentificationData {
  name: string;
  koreanName: string;
  probability: number;
  careInfo: {
    wateringCycle: string;
    sunlightNeeds: string;
    careInstructions: string;
  };
}

// Plant.ID를 통한 식물 식별 API
export const identifyPlant = async (
  imageUrl: string
): Promise<PlantIdentificationData> => {
  try {
    const endpoint = '/external-api/complete-plant-identification';

    const response = await apiRequest(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    }, true); // requireAuth = true

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`식물 식별 실패: ${errorData.message || response.status}`);
    }

    const data: PlantIdentificationData = await response.json();
    return data;
  } catch (error) {
    console.error('식물 식별 중 오류 발생:', error);
    throw error;
  }
};

// 식물 등록 API
export interface CreatePlantData {
  name: string;
  variety: string;
  img_url: string;
  cycle_type: string;
  cycle_value: string;
  cycle_unit: string;
  sunlight_needs?: string;
  purchase_date?: string;
  purchase_location?: string;
  memo?: string;
}

export const createPlant = async (
  plantData: CreatePlantData
): Promise<Plant> => {
  try {
    const endpoint = '/plants';

    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(plantData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`식물 등록 실패: ${errorData.message || response.status}`);
    }

    const data: Plant = await response.json();
    return data;
  } catch (error) {
    console.error('식물 등록 중 오류 발생:', error);
    throw error;
  }
};

// 내가 키우는 식물 목록 가져오기 API
export const getMyPlants = async (): Promise<{ id: number; name: string; variety: string; img_url: string; createdAt: string; }[]> => {
  try {
    const endpoint = '/plants';

    const response = await apiRequest(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`식물 목록 조회 실패: ${response.status}`);
    }

    const data: { plants: Plant[] } = await response.json();
    return data.plants.map(plant => ({
      id: plant.id,
      name: plant.name,
      variety: plant.variety,
      img_url: plant.img_url,
      createdAt: plant.createdAt,
    }));
  } catch (error) {
    console.error('식물 목록 조회 중 오류 발생:', error);
    throw error;
  }
};

/**
 * === Community Post 수정/삭제 API 함수들 ===
 */

// 게시글 수정 API
export interface UpdateCommunityPostData {
  title?: string;
  content?: string;
  category?: string;
  plant_name?: string;
  images?: string[];
}

export const updateCommunityPost = async (
  postId: string | number,
  postData: UpdateCommunityPostData
): Promise<CommunityPost> => {
  try {
    const endpoint = `/community/posts/${postId}`;

    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(postData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('게시글 수정 권한이 없습니다.');
      } else if (response.status === 404) {
        throw new Error('게시글을 찾을 수 없습니다.');
      } else {
        const errorData = await response.json();
        throw new Error(`게시글 수정 실패: ${errorData.message || response.status}`);
      }
    }

    const data: CommunityPost = await response.json();
    return data;
  } catch (error) {
    console.error('게시글 수정 중 오류 발생:', error);
    throw error;
  }
};

// 게시글 삭제 API
export const deleteCommunityPost = async (
  postId: string | number
): Promise<void> => {
  try {
    const endpoint = `/community/posts/${postId}`;

    const response = await apiRequest(endpoint, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('게시글 삭제 권한이 없습니다.');
      } else if (response.status === 404) {
        throw new Error('게시글을 찾을 수 없습니다.');
      } else {
        throw new Error(`게시글 삭제 실패: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('게시글 삭제 중 오류 발생:', error);
    throw error;
  }
};