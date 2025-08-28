'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { apiRequest } from '@/app/api/authController'; // authController 사용

interface ProfileImageUploaderProps {
  currentImageSrc: string;
  onImageUploadSuccess: (newImageUrl: string) => void;
}

export default function ProfileImageUploader({ currentImageSrc, onImageUploadSuccess }: ProfileImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. 이미지를 S3에 업로드 (식물 폴더에 업로드)
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await apiRequest('/image/upload/single?folder=plants', {
        method: 'POST',
        body: formData,
      }, true, true); // 인증 필요, FormData 사용

      if (!uploadResponse.ok) {
        throw new Error('이미지 업로드 실패');
      }
      const uploadData = await uploadResponse.json();
      const uploadedImageUrl = uploadData.imageUrl;

      // 2. 업로드된 이미지 URL로 사용자 프로필 이미지 업데이트
      const updateProfileResponse = await apiRequest('/users/me/profile-image', {
        method: 'PATCH',
        body: JSON.stringify({ profile_img: uploadedImageUrl }),
      }, true); // 인증 필요

      if (!updateProfileResponse.ok) {
        throw new Error('프로필 이미지 업데이트 실패');
      }

      onImageUploadSuccess(uploadedImageUrl); // 부모 컴포넌트에 성공 알림
      setSuccessMessage('프로필 사진이 성공적으로 변경되었습니다.');

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '프로필 사진 변경 중 오류가 발생했습니다.';
      console.error('프로필 사진 변경 오류:', err);
      setError(errorMessage);
    } finally {
      setUploadingImage(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <>
      <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-[#4A6741]">
          <Image
            src={currentImageSrc}
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
      {error && <p className="text-red-500 text-center text-sm mt-2">{error}</p>}
      {successMessage && <p className="text-green-500 text-center text-sm mt-2">{successMessage}</p>}
    </>
  );
}