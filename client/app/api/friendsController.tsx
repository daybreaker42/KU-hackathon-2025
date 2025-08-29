// app/api/friendsController.tsx
import { apiRequest } from './authController';

export interface Friend {
  id: number;
  name: string;
  profile_img?: string; // Assuming friends might have a profile image
  email?: string; // Assuming email might be part of friend info
  isFriend?: boolean; // 이미 친구인지 여부 (검색 결과에서 사용)
  hasPendingRequest?: boolean; // 대기 중인 친구 요청이 있는지 여부 (검색 결과에서 사용)
}

// New interfaces for Friend Requests
export interface FriendRequestUser {
  id: number;
  name: string;
  profile_img?: string;
}

export interface FriendRequest {
  id: number;
  requester: FriendRequestUser;
  recipient: FriendRequestUser;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export interface FriendRequestListResponse {
  received: FriendRequest[];
  sent: FriendRequest[];
  totalReceived: number;
  totalSent: number;
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

// New function for searching users
export const searchUsers = async (query: string): Promise<Friend[]> => {
  try {
    const endpoint = `/friends/search?search=${encodeURIComponent(query)}`;
    const response = await apiRequest(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`사용자 검색 실패: ${response.status}`);
    }

    const responseData: {
      users: Friend[]; // API returns 'users' for search
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    } = await response.json();
    return responseData.users; // Return the 'users' array
  } catch (error) {
    console.error('사용자 검색 중 오류 발생:', error);
    throw error;
  }
};

// New function for sending friend request
export const sendFriendRequest = async (friendId: number): Promise<{ message: string }> => {
  try {
    const endpoint = '/friends/request';
    const response = await apiRequest(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ friend_id: friendId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `친구 요청 실패: ${response.status}`);
    }

    const data: { message: string } = await response.json();
    return data;
  } catch (error) {
    console.error('친구 요청 중 오류 발생:', error);
    throw error;
  }
};

// New function for getting friend requests
export const getFriendRequests = async (): Promise<FriendRequestListResponse> => {
  try {
    const endpoint = '/friends/requests';
    const response = await apiRequest(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`친구 요청 목록 조회 실패: ${response.status}`);
    }

    const data: FriendRequestListResponse = await response.json();
    return data;
  } catch (error) {
    console.error('친구 요청 목록 조회 중 오류 발생:', error);
    throw error;
  }
};

// New function for accepting friend request
export const acceptFriendRequest = async (requestId: number): Promise<{ message: string }> => {
  try {
    const endpoint = `/friends/requests/${requestId}/accept`;
    const response = await apiRequest(endpoint, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `친구 요청 수락 실패: ${response.status}`);
    }

    const data: { message: string } = await response.json();
    return data;
  } catch (error) {
    console.error('친구 요청 수락 중 오류 발생:', error);
    throw error;
  }
};

// New function for rejecting friend request
export const rejectFriendRequest = async (requestId: number): Promise<{ message: string }> => {
  try {
    const endpoint = `/friends/requests/${requestId}/reject`;
    const response = await apiRequest(endpoint, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `친구 요청 거절 실패: ${response.status}`);
    }

    const data: { message: string } = await response.json();
    return data;
  } catch (error) {
    console.error('친구 요청 거절 중 오류 발생:', error);
    throw error;
  }
};

// New function for canceling friend request
export const cancelFriendRequest = async (requestId: number): Promise<{ message: string }> => {
  try {
    const endpoint = `/friends/requests/${requestId}/cancel`;
    const response = await apiRequest(endpoint, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `친구 요청 취소 실패: ${response.status}`);
    }

    const data: { message: string } = await response.json();
    return data;
  } catch (error) {
    console.error('친구 요청 취소 중 오류 발생:', error);
    throw error;
  }
};