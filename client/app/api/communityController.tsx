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
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  images: string[];
  isLiked: boolean;
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

/**
 * === Plants API 함수들 ===
 */

// 내가 키우는 식물 목록 가져오기 API
/**
 * === Plants API 함수들 ===
 */

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