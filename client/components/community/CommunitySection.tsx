'use client';

import { useEffect, useState } from 'react';

// 게시글 데이터 타입 정의
interface CommunityPost {
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

// Mock 데이터
const mockPosts: CommunityPost[] = [
  {
    id: 1,
    title: "이거 어떻게 키워요?",
    content: "제가 여기 처음 오늘데 어떻게 쓰는지를 모르겠네요",
    author: "식물초보",
    timeAgo: "5분전",
    likes: 13,
    comments: 13,
    category: 'question'
  },
  {
    id: 2,
    title: "사진 예시",
    content: "두줄 초과 글 예시두줄 초과 글 예시두줄 초과 글 예시두줄 초과 글 예시두줄 초과 글 예시",
    author: "식물사진가",
    timeAgo: "5분전",
    likes: 13,
    comments: 13,
    category: 'photo',
    hasImage: true
  },
  {
    id: 3,
    title: "이거 어떻게 키워요?",
    content: "제가 여기 처음 오늘데 어떻게 쓰는지를 모르겠네요",
    author: "일상러버",
    timeAgo: "5분전",
    likes: 13,
    comments: 13,
    category: 'daily'
  },
  {
    id: 4,
    title: "사진 예시",
    content: "두줄 초과 글 예시두줄 초과 글 예시두줄 초과 글 예시",
    author: "자세하기",
    timeAgo: "5분전",
    likes: 13,
    comments: 13,
    category: 'daily',
    hasImage: true
  },
  {
    id: 5,
    title: "이거 어떻게 키워요?",
    content: "제가 여기 처음 오늘데 어떻게 쓰는지를 모르겠네요",
    author: "자유인",
    timeAgo: "5분전",
    likes: 13,
    comments: 13,
    category: 'free'
  }
];

interface CommunitySectionProps {
  title: string;
  category: 'question' | 'photo' | 'daily' | 'free';
  showMoreButton?: boolean;
}

export default function CommunitySection({ title, category, showMoreButton = true }: CommunitySectionProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // 네트워크 지연 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 카테고리별 필터링
        const filteredPosts = mockPosts.filter(post => post.category === category);
        setPosts(filteredPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category]);

  if (loading) {
    return (
      <div className="mt-[20px]">
        <div className="flex justify-between items-center mb-[15px]">
          <h2 className="text-[#023735] font-medium text-[18px]">{title}</h2>
          {showMoreButton && (
            <button className="text-[#42CA71] text-[14px]">더보기</button>
          )}
        </div>
        <div className="space-y-[10px]">
          {[1, 2].map((item) => (
            <div key={item} className="bg-gray-100 rounded-lg p-[15px] animate-pulse">
              <div className="h-[20px] bg-gray-300 rounded mb-[8px] w-[60%]"></div>
              <div className="h-[16px] bg-gray-300 rounded mb-[10px]"></div>
              <div className="flex justify-between items-center">
                <div className="h-[14px] bg-gray-300 rounded w-[40px]"></div>
                <div className="flex space-x-[10px]">
                  <div className="h-[14px] bg-gray-300 rounded w-[30px]"></div>
                  <div className="h-[14px] bg-gray-300 rounded w-[30px]"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[20px]">
      {/* 섹션 헤더 */}
      <div className="flex justify-between items-center mb-[15px]">
        <h2 className="text-[#023735] font-medium text-[18px]">{title}</h2>
        {showMoreButton && (
          <button className="text-[#42CA71] text-[14px] hover:text-[#369F5C] transition-colors">
            더보기
          </button>
        )}
      </div>

      {/* 게시글 리스트 */}
      <div className="space-y-[10px]">
        {posts.map((post) => (
          <div key={post.id} className="bg-[#F8F9FA] rounded-lg p-[15px] border border-gray-100">
            {/* 게시글 헤더 */}
            <div className="flex justify-between items-start mb-[8px]">
              <h3 className="text-[#023735] font-medium text-[16px] flex-1 mr-[10px]">
                {post.title}
              </h3>
              <span className="text-[#6C757D] text-[12px] whitespace-nowrap">
                {post.timeAgo}
              </span>
            </div>

            {/* 게시글 내용 */}
            <div className="flex items-start space-x-[10px]">
              <div className="flex-1">
                <p className="text-[#495057] text-[14px] leading-[1.4] line-clamp-2">
                  {post.content}
                </p>
              </div>
              
              {/* 이미지 썸네일 (사진이 있는 경우) */}
              {post.hasImage && (
                <div className="w-[50px] h-[50px] bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[20px]">🌱</span>
                </div>
              )}
            </div>

            {/* 게시글 푸터 (좋아요, 댓글) */}
            <div className="flex justify-between items-center mt-[12px]">
              <span className="text-[#6C757D] text-[12px]">
                {post.author}
              </span>
              <div className="flex items-center space-x-[15px]">
                <button className="flex items-center space-x-[4px] text-[#6C757D] text-[12px] hover:text-[#42CA71] transition-colors">
                  <span>❤️</span>
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-[4px] text-[#6C757D] text-[12px] hover:text-[#42CA71] transition-colors">
                  <span>💬</span>
                  <span>{post.comments}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
