'use client';

import Image from 'next/image';
import Link from 'next/link';
import BackButton from '@/app/component/common/BackButton';
import { ChevronRight } from 'lucide-react';
import PostCard from '@/app/component/community/PostCard';
import CommentCard from '@/app/component/community/CommentCard';
import { CommunityPost } from '@/app/types/community/community';
import { useRouter } from 'next/navigation';
import { removeAuthToken, removeCurrentUser, getCurrentUser, apiRequest } from '@/app/api/authController';
import { useState, useEffect } from 'react';

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

export default function UserProfilePage() {
  const router = useRouter();

  // 실제 사용자 정보를 localStorage에서 가져와서 상태 관리
  const [profileImageSrc] = useState('/plant-happy.png'); // 기본 이미지, localStorage에서 사용자 프로필 이미지 URL 설정
  const [currentUsername, setCurrentUsername] = useState('사용자 이름'); // 기본값, localStorage에서 실제 사용자 이름 설정  
  const [userEmail, setUserEmail] = useState('user@example.com'); // 기본값, localStorage에서 실제 사용자 이메일 설정
  const [isLoading, setIsLoading] = useState(true);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]); // 실제 API에서 가져온 사용자 활동 데이터
  const [activitiesLoading, setActivitiesLoading] = useState(false); // 활동 데이터 로딩 상태

  // 컴포넌트 마운트 시 실제 사용자 정보 로드
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUsername(user.name);
      setUserEmail(user.email);
      // 현재 user 타입에는 profile_img가 없으므로 기본 이미지 사용
      // 향후 API 확장 시 프로필 이미지 지원 예정
    }
    setIsLoading(false);
  }, []);

  // 사용자 활동 데이터 로드 (최근 3개)
  useEffect(() => {
    const fetchUserActivities = async () => {
      setActivitiesLoading(true);
      try {
        const response = await apiRequest('/users/me/activities?page=1&limit=3', {
          method: 'GET',
        });
        
        if (response.ok) {
          const data: UserActivitiesResponse = await response.json();
          setUserActivities(data.activities);
        }
      } catch (error) {
        console.error('사용자 활동 데이터 로드 실패:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchUserActivities();
  }, []);

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

  const handleLogout = () => {
    // 쿠키에서 토큰 삭제
    removeAuthToken();
    
    // 로컬 스토리지에서 사용자 정보 삭제
    removeCurrentUser();
    
    // 로그인 페이지로 리다이렉트
    router.push('/login');
  }

  // 로딩 중일 때 표시할 내용
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF6EC] items-center justify-center" style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
        <div className="animate-spin w-8 h-8 border-4 border-[#4CAF50] border-t-transparent rounded-full"></div>
        <p className="mt-4 text-[#023735]">사용자 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]" style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
      <div className="flex-1 overflow-y-auto p-[18px]" style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
        <header className="relative flex items-center justify-center mb-4">
          <div className="absolute left-0">
            <BackButton />
          </div>
          <h1 className="text-[#023735] font-bold text-[24px]">사용자 프로필</h1>
        </header>

        <main className='bg-[#FAF6EC]' style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
          <section className="flex flex-col items-center gap-4 my-8 p-6 rounded-lg">
            {/* 프로필 사진 - localStorage에서 실제 사용자 프로필 이미지 표시 */}
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-[#4A6741]">
              <Image
                src={profileImageSrc}
                alt="User profile picture"
                width={120}
                height={120}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center' }}
              />
            </div>

            <div className="flex flex-col items-center">
              {/* 사용자 이름 - localStorage에서 실제 사용자 정보 표시 */}
              <span className="font-bold text-xl text-[#023735]">{currentUsername}</span>
              {/* 사용자 이메일 - localStorage에서 실제 사용자 이메일 표시 */}
              <span className="text-md text-gray-500">{userEmail}</span>
            </div>
          </section>

          <nav>
            <ul className="divide-y divide-gray-300/70">
              <li className="py-5">
                <Link href="/myPlant" className="flex items-center justify-between text-lg transition-colors hover:text-gray-500">
                  <span className="font-bold text-lg text-[#023735]">내 식물들</span>
                  <ChevronRight className="text-gray-400" />
                </Link>
              </li>

              <li className="py-5">
                <h2 className="font-bold text-lg text-[#023735] mb-4">설정</h2>
                <ul className="space-y-4 text-gray-800">
                  {/* 프로필 사진 업로드 페이지로 이동 */}
                  <li>
                    <Link href="/user/profile-image" className="cursor-pointer hover:font-semibold flex items-center justify-between">
                      <span>프로필 사진 업로드하기</span>
                      <ChevronRight className="text-gray-400" size={20} />
                    </Link>
                  </li>
                  {/* 사용자 이름 변경 페이지로 이동 */}
                  <li>
                    <Link href="/user/username" className="cursor-pointer hover:font-semibold flex items-center justify-between">
                      <span>사용자 이름 바꾸기</span>
                      <ChevronRight className="text-gray-400" size={20} />
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="py-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg text-[#023735]">나의 활동</h2>
                  {/* 더보기 버튼 - activities 페이지로 이동 */}
                  <Link href="/user/activities" className="text-[#42CA71] text-[14px] hover:text-[#369F5C] transition-colors">
                    더보기
                  </Link>
                </div>
                <div className="space-y-3">
                  {activitiesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-[#4CAF50] border-t-transparent rounded-full"></div>
                    </div>
                  ) : userActivities.length > 0 ? (
                    userActivities.map((activity) => (
                      <div key={activity.id}>
                        {activity.type === 'post' ? (
                          <PostCard
                            post={convertActivityToPost(activity)}
                            onClick={handlePostClick}
                            variant="compact"
                            imagePosition="left"
                            showAuthor={false}
                          />
                        ) : activity.type === 'comment' ? (
                          <CommentCard
                            comment={convertActivityToComment(activity)}
                            variant="compact"
                          />
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      아직 작성한 글이 없습니다.
                    </div>
                  )}
                </div>
              </li>

              <li className="py-5">
                <Link href="/friends" className="flex items-center justify-between text-lg transition-colors hover:text-gray-500">
                  <span className="font-bold text-lg text-[#023735]">친구 관리하기</span>
                  <ChevronRight className="text-gray-400" />
                </Link>
              </li>

              <li> 
                <button onClick={handleLogout}>로그 아웃</button>
              </li>
            </ul>
          </nav>
        </main>
      </div>
    </div>
  );
}
