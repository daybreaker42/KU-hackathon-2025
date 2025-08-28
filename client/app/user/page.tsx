import Image from 'next/image';
import Link from 'next/link';
import BackButton from '../component/common/BackButton';
import { ChevronRight } from 'lucide-react';

// Mock data for user's posts
const userPosts = [
  { id: 1, title: '첫 번째 게시물', content: '이것은 첫 번째 게시물의 내용입니다.' },
  { id: 2, title: '두 번째 게시물', content: '이것은 두 번째 게시물의 내용입니다.' },
  { id: 3, title: '세 번째 게시물', content: '이것은 세 번째 게시물의 내용입니다.' },
];

export default function UserProfilePage() {
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
          <section className="flex items-center gap-4 my-8">
            <Image
              src="/plant-happy.png" // Placeholder image
              alt="User profile picture"
              width={80}
              height={80}
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
                    <div key={post.id} className="p-4 bg-white/60 rounded-lg shadow-sm">
                      <h3 className="font-semibold text-md text-[#023735]">{post.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{post.content}</p>
                    </div>
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
