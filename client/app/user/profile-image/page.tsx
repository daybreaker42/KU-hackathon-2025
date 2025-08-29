'use client';

import BackButton from '@/app/component/common/BackButton';
import ProfileImageUploader from '@/app/component/user/ProfileImageUploader';
import { useState } from 'react'; // Needed for local state in this page

export default function ProfileImagePage() {
  const [profileImageSrc, setProfileImageSrc] = useState('/plant-happy.png'); // Initial placeholder or fetch actual user image

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]" style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
      <div className="flex-1 overflow-y-auto p-[18px]" style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
        <header className="relative flex items-center justify-center mb-8">
          <div className="absolute left-0">
            <BackButton />
          </div>
          <h1 className="text-[#023735] font-bold text-[24px]">프로필 사진 변경</h1>
        </header>

        <main className='bg-[#FAF6EC]' style={{ background: '#FAF6EC', backgroundImage: 'none' }}>
          <div className="flex flex-col items-center gap-6 my-12">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-[#023735] mb-2">현재 프로필 사진</h2>
              <p className="text-gray-600">사진을 클릭하여 새로운 이미지를 업로드하세요</p>
            </div>

            <ProfileImageUploader
              currentImageSrc={profileImageSrc}
              onImageUploadSuccess={setProfileImageSrc}
            />

            <div className="mt-8 p-4 bg-gray-50 rounded-lg max-w-sm">
              <h3 className="font-medium text-[#023735] mb-2">사진 업로드 가이드</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 권장 크기: 500x500px 이상</li>
                <li>• 지원 형식: JPG, PNG, GIF</li>
                <li>• 최대 파일 크기: 10MB</li>
                <li>• 정사각형 비율 권장</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}