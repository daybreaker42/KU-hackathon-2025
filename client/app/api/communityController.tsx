// Community 관련 API 컨트롤러
import { apiRequest } from './authController';

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
