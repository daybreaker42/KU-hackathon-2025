'use client';

import Image from 'next/image';
import Link from 'next/link';
import BackButton from '../component/common/BackButton';
import { ChevronRight } from 'lucide-react';
import PostCard from '../component/community/PostCard';
import { CommunityPost } from '../types/community/community';
import { useRouter } from 'next/navigation';

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
    hasImage: true,
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
    hasImage: false,
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
    hasImage: true,
  },
];

export default function UserProfilePage() {
  const router = useRouter();

  const handlePostClick = (postId: number) => {
    router.push(`/community/post/${postId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <div className="flex-1 overflow-y-auto p-[18px]">
        <header className="relative flex items-center justify-center mb-4">
          <div className="absolute left-0">
            <BackButton />
          </div>
          <h1 className="text-[#023735] font-bold text-[24px]">사용자 프로필</h1>
        </header>

        <main>
          <section className="flex flex-col items-center gap-4 my-8">
            <Image
              src="/plant-happy.png" // Placeholder image
              alt="User profile picture"
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
            <span className="font-bold text-lg text-[#023735]">@myuserid</span>
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
                  <li className="cursor-pointer hover:font-semibold">프로필 사진 업로드하기</li>
                  <li className="cursor-pointer hover:font-semibold">사용자 이름 바꾸기</li>
                </ul>
              </li>

              <li className="py-5">
                <h2 className="font-bold text-lg text-[#023735] mb-4">내가 작성한 글</h2>
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
            </ul>
          </nav>
        </main>
      </div>
    </div>
  );
}
