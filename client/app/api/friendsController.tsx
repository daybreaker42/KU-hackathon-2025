// app/api/friendsController.tsx
import { apiRequest } from './authController';

export interface Friend {
  id: number;
  name: string;
  profile_img?: string; // Assuming friends might have a profile image
  email?: string; // Assuming email might be part of friend info
}

export const getFriendsList = async (): Promise<Friend[]> => {
  try {
    const endpoint = '/friends';
    const response = await apiRequest(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`친구 목록 조회 실패: ${response.status}`);
    }

    const responseData: {
      friends: Friend[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    } = await response.json();
    return responseData.friends;
  } catch (error) {
    console.error('친구 목록 조회 중 오류 발생:', error);
    throw error;
  }
};