'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import BackButton from '@/app/component/common/BackButton';
import { uploadPlantImage, identifyPlant, PlantIdentificationData } from '@/app/api/communityController';

export default function PlantDictionaryPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 상태 관리
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [identificationLoading, setIdentificationLoading] = useState(false);
  const [identificationSuccess, setIdentificationSuccess] = useState(false);
  const [plantInfo, setPlantInfo] = useState<PlantIdentificationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 파일 선택 핸들러
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPlantInfo(null);
      setError(null);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // 자동으로 식물 식별 시작
      handleIdentifyPlant(file);
    }
  };

  // 식물 식별 함수 - addPlant와 동일한 방식
  const handleIdentifyPlant = async (file: File) => {
    setUploadLoading(true);
    setError(null);

    try {
      // 1. 이미지 업로드
      const uploadResult = await uploadPlantImage(file);
      console.log('이미지 업로드 성공:', uploadResult.imageUrl);
      
      setUploadLoading(false);
      setUploadSuccess(true);
      
      // 잠시 성공 메시지 표시 후 식별 시작
      setTimeout(() => {
        setUploadSuccess(false);
        identifyPlantWithUrl(uploadResult.imageUrl);
      }, 1000);
      
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      setError('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      setUploadLoading(false);
      setUploadSuccess(false);
    }
  };

  // Plant.ID API를 통한 식물 식별
  const identifyPlantWithUrl = async (imageUrl: string) => {
    setIdentificationLoading(true);
    
    try {
      const identificationResult = await identifyPlant(imageUrl);
      
      // 한글 이름에서 앞뒤 공백/개행 문자 제거
      const cleanedResult = {
        ...identificationResult,
        koreanName: identificationResult.koreanName.trim()
      };
      
      setPlantInfo(cleanedResult);
      setIdentificationSuccess(true);
      
      setTimeout(() => {
        setIdentificationSuccess(false);
      }, 1500);
      
    } catch (error) {
      console.error('Plant.ID 식물 식별 실패:', error);
      setError('식물 식별에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIdentificationLoading(false);
    }
  };

  // 새로운 이미지 선택
  const handleNewImageSelect = () => {
    setImagePreview(null);
    setPlantInfo(null);
    setError(null);
    setUploadLoading(false);
    setUploadSuccess(false);
    setIdentificationLoading(false);
    setIdentificationSuccess(false);
    
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] overflow-hidden">
      {/* App Bar */}
      <div className="flex items-center justify-between p-4 bg-transparent">
        <BackButton onClick={() => window.history.back()} />
        <h1 className="text-[#023735] font-bold text-lg">식물 사전</h1>
        <div className="w-[54px]"></div>
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-[18px] pb-[100px]">
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-xl font-bold text-center text-[#023735] mb-4">
            식물 사진을 업로드하여 정보를 확인하세요
          </h2>

          {/* 파일 입력 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {/* 이미지가 없을 때 업로드 버튼 */}
          {!imagePreview && !uploadLoading && (
            <button
              className="w-32 h-32 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors flex items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <Camera size={40} className="mx-auto mb-2" />
                <div className="text-sm">사진 선택</div>
              </div>
            </button>
          )}

          {/* 업로드 중일 때 로딩 화면 */}
          {uploadLoading && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-64 h-64 bg-gray-200 rounded-lg border-4 border-[#4CAF50] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-[#4CAF50] border-t-transparent rounded-full mx-auto mb-2"></div>
                  <div className="text-gray-600 font-medium">📤 이미지 업로드 중...</div>
                </div>
              </div>
            </div>
          )}

          {/* 업로드 성공 시 성공 메시지 */}
          {uploadSuccess && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-64 h-64 bg-green-100 rounded-lg border-4 border-[#4CAF50] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <div className="text-[#4CAF50] font-bold">이미지 업로드 성공!</div>
                </div>
              </div>
            </div>
          )}

          {/* 이미지 표시 */}
          {imagePreview && !uploadLoading && !uploadSuccess && (
            <div className="relative">
              <Image
                src={imagePreview}
                alt="식물 사진"
                width={256}
                height={256}
                className="max-w-64 max-h-64 rounded-lg shadow-md border-4 border-[#4CAF50] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleNewImageSelect}
              />
              {/* 재선택 힌트 */}
              {!identificationLoading && !identificationSuccess && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">
                  클릭하여 재선택
                </div>
              )}
            </div>
          )}

          {/* 식별 상태 메시지 */}
          {identificationLoading && (
            <div className="text-center">
              <div className="animate-spin w-6 h-6 border-4 border-[#4CAF50] border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-gray-600 italic">🔍 식물 식별 중...</div>
            </div>
          )}

          {identificationSuccess && (
            <div className="text-center">
              <div className="text-2xl mb-2">🎉</div>
              <div className="text-[#4CAF50] font-bold">식물 식별 성공!</div>
            </div>
          )}

          {/* 오류 메시지 */}
          {error && (
            <div className="w-full max-w-md bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 식물 정보 표시 */}
          {plantInfo && !identificationLoading && !identificationSuccess && (
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 border-2 border-[#4CAF50]">
              <h3 className="text-xl font-bold text-[#023735] mb-4 text-center">🌿 식별 결과</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="font-bold text-[#333]">한국어 이름:</span>
                  <span className="ml-2 text-[#4CAF50] font-medium">{plantInfo.koreanName}</span>
                </div>
                
                <div>
                  <span className="font-bold text-[#333]">학명:</span>
                  <span className="ml-2 text-gray-600 italic">{plantInfo.name}</span>
                </div>
                
                <div>
                  <span className="font-bold text-[#333]">식별 확률:</span>
                  <span className="ml-2 text-[#4CAF50] font-medium">
                    {(plantInfo.probability * 100).toFixed(1)}%
                  </span>
                </div>
                
                <hr className="my-4 border-gray-200" />
                
                <h4 className="font-bold text-[#333] mb-2">🌱 관리 정보</h4>
                
                <div className="space-y-2 bg-[#F8F9FA] p-3 rounded-lg">
                  <div>
                    <span className="font-medium text-[#333]">물 주기:</span>
                    <span className="ml-2">{plantInfo.careInfo.wateringCycle}일마다</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-[#333]">햇빛:</span>
                    <span className="ml-2">{plantInfo.careInfo.sunlightNeeds}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-[#333]">관리 팁:</span>
                    <div className="ml-2 mt-1 text-sm text-gray-600">
                      {plantInfo.careInfo.careInstructions}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}