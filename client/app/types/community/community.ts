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