'use client';

import { CommunityPost, Plant } from '@/app/types/community/community'; // Plant 타입 import 추가
import { useEffect, useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react'; // lucide-react 아이콘 import 추가

// Mock 식물 데이터 추가
const mockPlants: Plant[] = [
  { id: 1, name: "몬스테라", imageUrl: "/plants/monstera.jpg" },
  { id: 2, name: "산세베리아", imageUrl: "/plants/sansevieria.jpg" },
  { id: 3, name: "스킨답서스", imageUrl: "/plants/pothos.jpg" }
];

// Mock 데이터 수정 - 카테고리 구조 개선
const mockPosts: CommunityPost[] = [
  {
    id: 1,
    title: "이거 어떻게 키워요?",
    content: "제가 여기 처음 오늘데 어떻게 쓰는지를 모르겠네요",
    author: "식물초보",
    timeAgo: "5분전",
    likes: 13,
    comments: 13,
    category: 'question' // 카테고리명 변경
  },
  {
    id: 2,
    title: "몬스테라 잎이 노랗게 변해요",
    content: "몬스테라를 키운지 2개월 정도 됐는데 잎 끝이 노랗게 변하기 시작했어요. 물은 일주일에 한 번 주고 있습니다.",
    author: "식물러버",
    timeAgo: "10분전",
    likes: 8,
    comments: 5,
    category: 'plant', // 식물별 카테고리
    plant: mockPlants[0], // 몬스테라 정보
    hasImage: true
  },
  {
    id: 3,
    title: "오늘의 식물 일기",
    content: "우리집 식물들이 하루하루 자라는 모습을 보니 정말 뿌듯해요",
    author: "일상러버",
    timeAgo: "15분전",
    likes: 13,
    comments: 13,
    category: 'daily'
  },
  {
    id: 4,
    title: "산세베리아 분갈이 후기",
    content: "드디어 산세베리아 분갈이를 완료했습니다! 뿌리가 생각보다 많이 자라있었어요.",
    author: "분갈이마스터",
    timeAgo: "20분전",
    likes: 15,
    comments: 8,
    category: 'plant', // 식물별 카테고리
    plant: mockPlants[1], // 산세베리아 정보
    hasImage: true
  },
  {
    id: 5,
    title: "식물 키우기 꿀팁",
    content: "제가 3년간 식물을 키우면서 터득한 노하우들을 공유해볼게요",
    author: "자유인",
    timeAgo: "25분전",
    likes: 13,
    comments: 13,
    category: 'free'
  }
];

interface CommunitySectionProps {
  title: string;
  category: 'question' | 'daily' | 'free' | 'plant'; // category 타입 수정
  plantId?: number; // 식물별 카테고리인 경우 특정 식물 ID 필터링용
  showMoreButton?: boolean;
}

export default function CommunitySection({ title, category, plantId, showMoreButton = true }: CommunitySectionProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // TODO - 커뮤니티 정보 가져오는 API 호출
        setLoading(true);
        
        // 네트워크 지연 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 카테고리별 필터링 로직 개선
        let filteredPosts = mockPosts.filter(post => post.category === category);

        // 식물별 카테고리인 경우 특정 식물 ID로 추가 필터링
        if (category === 'plant' && plantId) {
          filteredPosts = filteredPosts.filter(post => post.plant?.id === plantId);
        }

        setPosts(filteredPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category, plantId]); // plantId 의존성 추가

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
              <div className="flex-1 mr-[10px]">
                <h3 className="text-[#023735] font-medium text-[16px]">
                  {post.title}
                </h3>
                {/* 식물별 카테고리인 경우 식물 이름 표시 */}
                {post.category === 'plant' && post.plant && (
                  <span className="inline-block bg-[#42CA71] text-white text-[10px] px-[6px] py-[2px] rounded-full mt-[4px]">
                    {post.plant.name}
                  </span>
                )}
              </div>
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
              <div className="flex items-center space-x-[10px]">
                {/* 좋아요 버튼 - lucide-react 아이콘 적용 및 테두리 추가 */}
                <button className="flex items-center space-x-[4px] text-[#6C757D] text-[12px] hover:text-[#42CA71] hover:border-[#42CA71] transition-colors border border-gray-300 rounded-full px-[8px] py-[4px]">
                  <Heart size={12} />
                  <span>{post.likes}</span>
                </button>
                {/* 댓글 버튼 - lucide-react 아이콘 적용 및 테두리 추가 */}
                <button className="flex items-center space-x-[4px] text-[#6C757D] text-[12px] hover:text-[#42CA71] hover:border-[#42CA71] transition-colors border border-gray-300 rounded-full px-[8px] py-[4px]">
                  <MessageCircle size={12} />
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
