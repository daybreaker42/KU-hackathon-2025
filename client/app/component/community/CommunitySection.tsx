'use client';

import { CommunityPost, Plant } from '@/app/types/community/community'; // Plant 타입 import 추가
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Next.js 라우터 import 추가
import PostCard from './PostCard'; // PostCard 컴포넌트 import 추가
import Footer from '../common/footer';

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
  const router = useRouter(); // 라우터 인스턴스 생성

  // 더보기 버튼 클릭 핸들러 추가
  const handleMoreClick = () => {
    // 카테고리별 라우팅 경로 생성
    const basePath = '/community/category';
    if (category === 'plant' && plantId) {
      router.push(`${basePath}/${category}?plantId=${plantId}`);
    } else {
      router.push(`${basePath}/${category}`);
    }
  };

  // 게시글 클릭 핸들러 추가
  const handlePostClick = (postId: number) => {
    router.push(`/community/post/${postId}`);
  };

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
            <div key={item} className="bg-[#F0ECE0] rounded-lg p-[15px] animate-pulse border border-[#E8E3D5]"> {/* 새 배경에 맞게 색상 조정 */}
              <div className="h-[20px] bg-[#E6DFD1] rounded mb-[8px] w-[60%]"></div> {/* 스켈레톤 색상 조정 */}
              <div className="h-[16px] bg-[#E6DFD1] rounded mb-[10px]"></div>
              <div className="flex justify-between items-center">
                <div className="h-[14px] bg-[#E6DFD1] rounded w-[40px]"></div>
                <div className="flex space-x-[10px]">
                  <div className="h-[14px] bg-[#E6DFD1] rounded w-[30px]"></div>
                  <div className="h-[14px] bg-[#E6DFD1] rounded w-[30px]"></div>
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
          <button
            onClick={handleMoreClick} // 더보기 버튼 클릭 이벤트 핸들러
            className="text-[#42CA71] text-[14px] hover:text-[#369F5C] transition-colors"
          >
            더보기
          </button>
        )}
      </div>

      {/* 게시글 리스트 */}
      <div className="space-y-[10px]">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onClick={handlePostClick}
            variant="compact" // 컴팩트 모드로 표시
          />
        ))}
      </div>
    </div>
  );
}

