'use client';

import Image from 'next/image';
import Link from 'next/link';
import BackButton from '@/app/component/common/BackButton';
import { ChevronRight } from 'lucide-react';
import PostCard from '@/app/component/community/PostCard';
import { CommunityPost } from '@/app/types/community/community';
import { useRouter } from 'next/navigation';
import { removeAuthToken, removeCurrentUser } from '@/app/api/authController';

// Mock data for user's posts
const userPosts: CommunityPost[] = [
  {
    id: 1,
    title: '첫 번째 게시물',
    content: '이것은 첫 번째 게시물의 내용입니다. 사진이 있는 게시물입니다.',
    author: '@myuserid',
    timeAgo: '1일전',
    likes: 5,
    comments: 2,
    category: 'daily',
    images: ['/images/plant-happy.png'], // hasImage 대신 images 배열 사용
  },
  {
    id: 2,
    title: '두 번째 게시물',
    content: '이것은 두 번째 게시물의 내용입니다. 사진이 없는 게시물입니다.',
    author: '@myuserid',
    timeAgo: '2일전',
    likes: 10,
    comments: 4,
    category: 'daily',
    images: [], // 빈 배열로 이미지 없음을 표현
  },
  {
    id: 3,
    title: '세 번째 게시물',
    content: '이것은 세 번째 게시물의 내용입니다. 이것도 사진이 있습니다.',
    author: '@myuserid',
    timeAgo: '3일전',
    likes: 15,
    comments: 8,
    category: 'daily',
    images: ['/images/plant-normal.png'], // hasImage 대신 images 배열 사용
  },
];

export default function UserProfilePage() {
  const router = useRouter();

  const handlePostClick = (postId: number) => {
    router.push(`/community/post/${postId}`);
  };

  const handleLogout = () => {
    // 쿠키에서 토큰 삭제
    removeAuthToken();
    
    // 로컬 스토리지에서 사용자 정보 삭제
    removeCurrentUser();
    
    // 로그인 페이지로 리다이렉트
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <div className="flex-1 overflow-y-auto p-[18px]">
        <header className="relative flex items-center justify-center mb-4">
          <div className="absolute left-0">
            <BackButton />
          </div>
          <h1 className="text-[#023735] font-bold text-[24px]">사용자 프로필</h1>
        </header>

        <main className='bg-transparent bg-none'>
          <section className="flex flex-col items-center gap-4 my-8 p-6 rounded-lg shadow-sm">
            {/* TODO: API 연동: 사용자 프로필 이미지 */}
            <Image
              src="/plant-happy.png" // Placeholder image
              alt="User profile picture"
              width={120}
              height={120}
              className="rounded-full object-cover border-2 border-[#4A6741]"
            />
            <div className="flex flex-col items-center">
              {/* TODO: API 연동: 사용자 이름 */}
              <span className="font-bold text-xl text-[#023735]">사용자 이름</span>
              {/* TODO: API 연동: 사용자 ID (이메일 또는 고유 ID) */}
              <span className="text-md text-gray-500">@myuserid</span>
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
                  {/* TODO: API 연동: 프로필 사진 업로드 (PATCH /users/me/profile-image) */}
                  <li className="cursor-pointer hover:font-semibold">프로필 사진 업로드하기</li>
                  {/* TODO: API 연동: 사용자 이름 변경 (PATCH /users/me/name) */}
                  <li className="cursor-pointer hover:font-semibold">사용자 이름 바꾸기</li>
                </ul>
              </li>

              <li className="py-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg text-[#023735]">내가 작성한 글</h2>
                  {/* TODO: API 연동: 내가 작성한 글 목록 (GET /users/me/activities 또는 GET /community?authorId=me) */}
                  <button className="text-[#42CA71] text-[14px] hover:text-[#369F5C] transition-colors">더보기</button>
                </div>
                <div className="space-y-3">
                  {userPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={handlePostClick}
                      variant="compact"
                      imagePosition="left"
                      showAuthor={false}
                    />
                  ))}
                </div>
              </li>

              <li className="py-5">
                                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg text-[#023735]">내가 작성한 글</h2>
                  <button className="text-[#42CA71] text-[14px] hover:text-[#369F5C] transition-colors">더보기</button>
                </div>
                <div className="space-y-3">
                  {userPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={handlePostClick}
                      variant="compact"
                      imagePosition="left"
                      showAuthor={false}
                    />
                  ))}
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
