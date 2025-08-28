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
  category: 'question' | 'daily' | 'free' | 'plant';
  images?: string[]; // 이미지 URL 배열 추가
  plant?: Plant; // 식물별 카테고리인 경우 식물 정보 추가
}

export interface Comment {
  id: number;
  author: string;
  content: string;
  timeAgo: string;
  avatar?: string;
  parentId?: number; // 대댓글인 경우 부모 댓글 ID (없으면 일반 댓글)
  createdAt: string; // 정렬을 위한 생성 시간
}

export type CommunityCategory = 'question' | 'daily' | 'free' | 'plant';