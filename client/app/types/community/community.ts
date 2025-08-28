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
  category: 'question' | 'photo' | 'daily' | 'free';
  hasImage?: boolean;
}