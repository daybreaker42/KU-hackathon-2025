'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from './PostCard';
// API 및 타입 import
import { autoLogin, isAuthenticated } from '@/app/api/authController';
import { getCommunityPostsByCategory, type CommunityPost as ApiCommunityPost } from '@/app/api/communityController';
import { CommunityPost } from '@/app/types/community/community'; // UI 컴포넌트용 타입

// 서버 데이터를 UI 컴포넌트 형태로 변환하는 함수
const mapApiPostToUiPost = (apiPost: ApiCommunityPost): CommunityPost => {
  // 시간 차이 계산 함수
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
  };

  return {
    id: apiPost.id,
    title: apiPost.title,
    content: apiPost.content,
    author: apiPost.author.name, // author 객체에서 name 추출
    timeAgo: getTimeAgo(apiPost.createdAt), // 생성일을 상대시간으로 변환
    likes: apiPost.likes_count, // likes_count를 likes로 매핑
    comments: apiPost.comments_count, // comments_count를 comments로 매핑
    category: apiPost.category as 'question' | 'daily' | 'free' | 'plant', // 타입 캐스팅
    hasImage: apiPost.images && apiPost.images.length > 0, // 이미지 여부 확인
    plant: apiPost.plant_name ? { // plant_name이 있으면 Plant 객체 생성
      id: 0, // 임시 ID (추후 서버에서 plant 객체 전체를 반환하면 수정)
      name: apiPost.plant_name,
      imageUrl: '/plant-normal.png' // 기본 이미지
    } : undefined
  };
};

/*
=======================================
=== 개발용 Mock 데이터 (주석 처리) ===
=======================================

실제 서버 연동 후 제거 예정인 Mock 데이터입니다.

// Mock 식물 데이터 추가
const mockPlants: Plant[] = [
  { id: 1, name: "몬스테라", imageUrl: "/plants/monstera.jpg" },
  { id: 2, name: "산세베리아", imageUrl: "/plants/sansevieria.jpg" },
  { id: 3, name: "스킨답서스", imageUrl: "/plants/pothos.jpg" }
];

// Mock 데이터 수정 - 카테고리 구조 개선
const mockPosts: CommunityPost[] = [
  // ... Mock 데이터 ...
];
*/

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
    // 실제 서버에서 커뮤니티 게시글을 가져오는 함수
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // 인증 확인 및 자동 로그인 (개발용)
        if (!isAuthenticated()) {
          autoLogin(); // 개발용 자동 로그인
        }
        
        // 실제 API 호출 - 각 카테고리에서 최신 3개씩 가져오기
        const postsData = await getCommunityPostsByCategory(category, 1, 3);

        // 서버 데이터를 UI 컴포넌트 형태로 변환
        const uiPosts = postsData.posts.map(mapApiPostToUiPost);
        setPosts(uiPosts);

      } catch (error) {
        console.error('커뮤니티 게시글 조회 중 오류:', error);

        /*
        ===================================
        === 개발용 Fallback (주석 처리) ===
        ===================================
        
        실제 서버 연결 실패 시 빈 배열로 설정
        프로덕션에서는 에러 UI 표시 예정
        
        // 서버 연결 실패 시 빈 배열로 설정
        setPosts([]);
        */

        setPosts([]); // 에러 발생 시 빈 배열로 설정
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category, plantId]); // plantId 의존성 유지 (추후 식물별 필터링용)

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

