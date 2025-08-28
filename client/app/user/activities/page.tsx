'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/app/component/common/BackButton';
import PostCard from '@/app/component/community/PostCard';
import CommentCard from '@/app/component/community/CommentCard';
import { CommunityPost } from '@/app/types/community/community';
import { apiRequest, getCurrentUser } from '@/app/api/authController';

// API 응답 타입 정의 - 내 활동 조회 API response 타입
interface UserActivity {
  type: string;
  id: number;
  title: string;
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

interface UserActivitiesResponse {
  activities: UserActivity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UserActivitiesPage() {
  const router = useRouter();
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [currentUsername, setCurrentUsername] = useState('사용자');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // 컴포넌트 마운트 시 사용자 정보 로드
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUsername(user.name);
    }
  }, []);

  // 사용자 활동 데이터 로드
  useEffect(() => {
    const fetchUserActivities = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest(`/users/me/activities?page=${currentPage}&limit=${limit}`, {
          method: 'GET',
        });
        
        if (response.ok) {
          const data: UserActivitiesResponse = await response.json();
          setUserActivities(data.activities);
          setTotalPages(data.totalPages);
          setTotal(data.total);
        }
      } catch (error) {
        console.error('사용자 활동 데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserActivities();
  }, [currentPage]);

  const handlePostClick = (postId: number) => {
    router.push(`/community/post/${postId}`);
  };

  // UserActivity를 CommunityPost 형태로 변환하는 함수
  const convertActivityToPost = (activity: UserActivity): CommunityPost => {
    return {
      id: activity.id,
      title: activity.title,
      content: activity.content,
      author: currentUsername, // 현재 사용자이므로 현재 사용자 이름 사용
      timeAgo: formatTimeAgo(activity.createdAt), // 시간 포맷 변환
      likes: activity.likesCount,
      comments: activity.commentsCount,
      category: 'daily', // 기본 카테고리
      images: [], // API에서 이미지 정보가 없으므로 빈 배열
    };
  };

  // UserActivity를 CommentCard 형태로 변환하는 함수  
  const convertActivityToComment = (activity: UserActivity) => {
    return {
      id: activity.id,
      title: activity.title,
      content: activity.content,
      timeAgo: formatTimeAgo(activity.createdAt),
    };
  };

  // 시간을 "n일전" 형태로 변환하는 함수
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes}분전`;
      }
      return `${diffInHours}시간전`;
    }
    return `${diffInDays}일전`;
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 로딩 중일 때 표시할 내용
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF6EC] items-center justify-center" style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
        <div className="animate-spin w-8 h-8 border-4 border-[#4CAF50] border-t-transparent rounded-full"></div>
        <p className="mt-4 text-[#023735]">내 활동을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]" style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
      <div className="flex-1 overflow-y-auto p-[18px]" style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
        <header className="relative flex items-center justify-center mb-6">
          <div className="absolute left-0">
            <BackButton />
          </div>
          <h1 className="text-[#023735] font-bold text-[24px]">나의 활동</h1>
        </header>

        <main className='bg-[#FAF6EC]' style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
          {/* 활동 통계 정보 */}
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <span className="text-[#023735] font-semibold">
                  총 {total}개의 활동
                </span>
                <span className="text-gray-500 text-sm">
                  (글: {userActivities.filter(a => a.type === 'post').length}개,
                  댓글: {userActivities.filter(a => a.type === 'comment').length}개)
                </span>
              </div>
              <span className="text-gray-500 text-sm">페이지 {currentPage} / {totalPages}</span>
            </div>
          </div>

          {/* 활동 목록 */}
          <div className="space-y-4">
            {userActivities.length > 0 ? (
              userActivities.map((activity) => (
                <div key={activity.id}>
                  {activity.type === 'post' ? (
                    <PostCard
                      post={convertActivityToPost(activity)}
                      onClick={handlePostClick}
                      variant="full"
                      imagePosition="right"
                      showAuthor={false}
                    />
                  ) : activity.type === 'comment' ? (
                    <CommentCard
                      comment={convertActivityToComment(activity)}
                      variant="full"
                    />
                  ) : null}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <p className="text-gray-500 text-lg mb-2">아직 작성한 글이 없습니다</p>
                <p className="text-gray-400 text-sm">첫 번째 글을 작성해보세요!</p>
                <button
                  onClick={() => router.push('/community/write')}
                  className="mt-4 px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors"
                >
                  글 작성하기
                </button>
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8 mb-6">
              {/* 이전 페이지 버튼 */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-[#023735] hover:bg-[#4CAF50] hover:text-white border'
                } transition-colors`}
              >
                이전
              </button>

              {/* 페이지 번호 버튼들 */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-2 rounded ${
                      currentPage === pageNumber
                        ? 'bg-[#4CAF50] text-white'
                        : 'bg-white text-[#023735] hover:bg-[#4CAF50] hover:text-white border'
                    } transition-colors`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {/* 다음 페이지 버튼 */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-[#023735] hover:bg-[#4CAF50] hover:text-white border'
                } transition-colors`}
              >
                다음
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
