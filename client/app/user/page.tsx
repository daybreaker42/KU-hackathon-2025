'use client';

import Image from 'next/image';
import Link from 'next/link';
import BackButton from '@/app/component/common/BackButton';
import { ChevronRight } from 'lucide-react';
import PostCard from '@/app/component/community/PostCard';
import { CommunityPost } from '@/app/types/community/community';
import { useRouter } from 'next/navigation';
import { removeAuthToken, removeCurrentUser } from '@/app/api/authController';
import { useState, useRef } from 'react';

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

  // State for profile image and username
  const [profileImageSrc, setProfileImageSrc] = useState('/plant-happy.png'); // 초기 플레이스홀더
  const [currentUsername, setCurrentUsername] = useState('사용자 이름'); // 초기 플레이스홀더
  const [newUsername, setNewUsername] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [updatingName, setUpdatingName] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Profile Image Upload Handler
  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. Upload image to /image/upload/single
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/image/upload/single', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('이미지 업로드 실패');
      }
      const uploadData = await uploadResponse.json();
      const uploadedImageUrl = uploadData.imageUrl;

      // 2. Update user profile with new image URL
      const updateProfileResponse = await fetch('/users/me/profile-image', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_img: uploadedImageUrl }),
      });

      if (!updateProfileResponse.ok) {
        throw new Error('프로필 이미지 업데이트 실패');
      }

      setProfileImageSrc(uploadedImageUrl);
      setSuccessMessage('프로필 사진이 성공적으로 변경되었습니다.');

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '프로필 사진 변경 중 오류가 발생했습니다.';
      console.error('프로필 사진 변경 오류:', err);
      setError(errorMessage);
    } finally {
      setUploadingImage(false);
      // Clear success message after a few seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Username Update Handler
  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) {
      setError('새 사용자 이름을 입력해주세요.');
      return;
    }

    setUpdatingName(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/users/me/name', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newUsername }),
      });

      if (!response.ok) {
        throw new Error('사용자 이름 업데이트 실패');
      }

      setCurrentUsername(newUsername);
      setSuccessMessage('사용자 이름이 성공적으로 변경되었습니다.');
      setIsEditingName(false); // Exit edit mode
      setNewUsername(''); // Clear input

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '사용자 이름 변경 중 오류가 발생했습니다.';
      console.error('사용자 이름 변경 오류:', err);
      setError(errorMessage);
    } finally {
      setUpdatingName(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

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
            {/* 프로필 사진 - 정확히 원형으로 크롭 */}
            <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
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
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfileImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />

            <div className="flex flex-col items-center">
              {/* 사용자 이름 */}
              <span className="font-bold text-xl text-[#023735]">{currentUsername}</span>
              {/* TODO: API 연동: 사용자 ID (이메일 또는 고유 ID) */}
              <span className="text-md text-gray-500">@myuserid</span>
            </div>
          </section>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

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
                  {/* 프로필 사진 업로드 */}
                  <li className="cursor-pointer hover:font-semibold" onClick={() => fileInputRef.current?.click()}>
                    프로필 사진 업로드하기
                  </li>
                  {/* 사용자 이름 변경 */}
                  <li className="cursor-pointer hover:font-semibold" onClick={() => setIsEditingName(!isEditingName)}>
                    사용자 이름 바꾸기
                  </li>
                  {isEditingName && (
                    <li className="mt-2 flex flex-col gap-2">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="새 사용자 이름"
                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                      />
                      <button
                        onClick={handleUsernameUpdate}
                        disabled={updatingName}
                        className="p-2 bg-[#4CAF50] text-white rounded-md hover:bg-[#45a049] disabled:opacity-50"
                      >
                        {updatingName ? '변경 중...' : '저장'}
                      </button>
                    </li>
                  )}
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
