export interface Plant {
  id: number;
  name: string;
  imageUrl: string;
}

export interface CommunityPost {
  id: number;
  title: string;
  content: string;
  author: string;
  timeAgo: string;
  likes: number;
  comments: number;
  category: 'question' | 'daily' | 'free' | 'plant'; // 'photo' 제거, 'plant' 추가
  hasImage?: boolean;
  plant?: Plant; // 식물별 카테고리인 경우 식물 정보 추가
}

export interface Comment {
  id: number;
  author: string;
  content: string;
  timeAgo: string;
  avatar?: string;
  parentId?: number; // 대댓글인 경우 부모 댓글 ID
  depth: number; // 댓글 깊이 (0: 일반 댓글, 1: 대댓글, 2: 대댓글의 대댓글)
  replies?: Comment[]; // 대댓글 목록
}