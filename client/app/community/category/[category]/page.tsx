'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import PostCard from '@/app/component/community/PostCard';
import Footer from '@/app/component/common/footer';
import CloseButton from '@/app/component/common/CloseButton';
import WritePostButton from '@/app/component/community/WritePostButton';
// API 및 타입 import
import { autoLogin, isAuthenticated } from '@/app/api/authController';
import { getCommunityPosts, type CommunityPost as ApiCommunityPost } from '@/app/api/communityController';
import { CommunityPost } from '@/app/types/community/community';

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
    author: apiPost.author.name || '',
    timeAgo: getTimeAgo(apiPost.createdAt),
    likes: apiPost.likes_count,
    comments: apiPost.comments_count,
    category: apiPost.category as 'question' | 'daily' | 'free' | 'plant',
    hasImage: apiPost.images && apiPost.images.length > 0,
    plant: apiPost.plant_name ? {
      id: 0,
      name: apiPost.plant_name,
      imageUrl: '/plant-normal.png'
    } : undefined
  };
};

// 카테고리명 매핑
const categoryNames = {
  question: '이거 어떻게 키워요?',
  daily: '일상',
  free: '자유 주제',
  plant: '식물별 카테고리'
};

export default function CategoryPostsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const category = params.category as 'question' | 'daily' | 'free' | 'plant';
  const plantId = searchParams.get('plantId');
  const variety = searchParams.get('variety');
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const itemsPerPage = 10; // 한 페이지당 표시되는 게시글 수 (10개 고정)


  console.log(`category - ${category} / plantId - ${plantId} / variety - ${variety}`);
  // 페이지 변경 핸들러 (스크롤 상단 이동 포함)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 게시글 클릭 핸들러
  const handlePostClick = (postId: number) => {
    router.push(`/community/post/${postId}`);
  };

  // 게시글 데이터 로딩
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // 인증 확인 및 자동 로그인 (개발용)
        if (!isAuthenticated()) {
          autoLogin();
        }
        
        // 실제 API 호출 - pagination 적용
        // page: 현재 페이지 번호 (1부터 시작)
        // limit: 한 페이지당 가져올 게시글 수 (10개)
        // plant_name: 실제 식물 품종명으로 필터링 (category가 'plant'일 때만)
        const postsData = await getCommunityPosts({
          category: category,
          page: currentPage,
          limit: itemsPerPage,
          plant_name: category === 'plant' && variety ? variety : undefined
        });
        
        // 서버 데이터를 UI 컴포넌트 형태로 변환
        const uiPosts = postsData.posts.map(mapApiPostToUiPost);
        
        setPosts(uiPosts);
        setTotalPages(postsData.totalPages);
        setTotalPosts(postsData.total);
        
      } catch (error) {
        console.error('카테고리 게시글 조회 중 오류:', error);
        setPosts([]);
        setTotalPages(1);
        setTotalPosts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category, plantId, currentPage, variety]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="p-[18px] bg-[#FAF6EC] min-h-screen w-[393px] mx-auto">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center mb-[20px]">
          <div className="w-[24px] h-[24px] bg-[#E6DFD1] rounded animate-pulse mr-[12px]"></div>
          <div className="h-[24px] bg-[#E6DFD1] rounded w-[150px] animate-pulse"></div>
        </div>
        
        {/* 게시글 리스트 스켈레톤 */}
        <div className="space-y-[15px]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-[#F0ECE0] rounded-lg p-[15px] animate-pulse border border-[#E8E3D5]">
              <div className="h-[20px] bg-[#E6DFD1] rounded mb-[8px] w-[70%]"></div>
              <div className="h-[16px] bg-[#E6DFD1] rounded mb-[10px]"></div>
              <div className="h-[16px] bg-[#E6DFD1] rounded mb-[12px] w-[90%]"></div>
              <div className="flex justify-between items-center">
                <div className="h-[14px] bg-[#E6DFD1] rounded w-[60px]"></div>
                <div className="flex space-x-[10px]">
                  <div className="h-[28px] bg-[#E6DFD1] rounded-full w-[50px]"></div>
                  <div className="h-[28px] bg-[#E6DFD1] rounded-full w-[50px]"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-[18px] pb-[80px] bg-[#FAF6EC] min-h-screen w-[393px] mx-auto">
      {/* 헤더 */}
      <div className="flex flex-col mb-[20px]">
        <div className='flex items-center justify-between'>
          <div className="flex items-center">
            <h1 className="text-[#023735] font-medium text-[20px]">
              {categoryNames[category]}
              {category === 'plant' && variety && (
                <span className="text-[16px] text-[#6C757D] ml-[8px]">
                  · {variety}
                </span>
              )}
            </h1>
          </div>
          <CloseButton />
        </div>
      </div>

      {/* 게시글 수 정보 - 총 개수와 현재 페이지 표시 */}
      <div className="mb-[20px]">
        <span className="text-[#6C757D] text-[14px]">
          총 {totalPosts}개의 게시글 (페이지 {currentPage}/{totalPages})
          {/* 한 페이지당 최대 {itemsPerPage}개씩 표시 */}
        </span>
      </div>

      {/* 게시글 리스트 */}
      <div className="space-y-[15px]">
        {posts.length === 0 ? (
          // 빈 상태
          <div className="text-center py-[60px]">
            <div className="text-[48px] mb-[16px]">🌱</div>
            <h3 className="text-[#023735] font-medium text-[18px] mb-[8px]">
              아직 게시글이 없어요
            </h3>
            <p className="text-[#6C757D] text-[14px]">
              첫 번째 게시글을 작성해보세요!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={handlePostClick}
              variant="full"
            />
          ))
        )}
      </div>

      {/* 페이지네이션 - 총 페이지가 2개 이상일 때만 표시 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-[40px] space-x-[8px]">
          {/* 
            Pagination 표시 조건:
            - totalPages > 1: 총 페이지가 2개 이상일 때만 표시
            - 한 페이지에 10개의 게시글이 표시됨 (itemsPerPage = 10)
            - 예: 총 게시글 25개 → 3페이지 (10개 + 10개 + 5개)
          */}
          {/* 이전 페이지 버튼 */}
          <button 
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`text-[14px] px-[8px] py-[4px] transition-colors ${
              currentPage === 1 
                ? 'text-[#CCCCCC] cursor-not-allowed' 
                : 'text-[#6C757D] hover:text-[#42CA71]'
            }`}
          >
            &lt;
          </button>
          
          {/* 페이지 번호 버튼들 */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = index + 1;
            } else if (currentPage <= 3) {
              pageNum = index + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + index;
            } else {
              pageNum = currentPage - 2 + index;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-[24px] h-[24px] text-[14px] rounded transition-colors ${
                  currentPage === pageNum
                    ? 'bg-[#42CA71] text-white'
                    : 'text-[#6C757D] hover:text-[#42CA71] hover:bg-[#F0F0F0]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          {/* 다음 페이지 버튼 */}
          <button 
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`text-[14px] px-[8px] py-[4px] transition-colors ${
              currentPage === totalPages 
                ? 'text-[#CCCCCC] cursor-not-allowed' 
                : 'text-[#6C757D] hover:text-[#42CA71]'
            }`}
          >
            &gt;
          </button>
        </div>
      )}
      
      <Footer url='community' />
      <WritePostButton />
    </div>
  );
}
