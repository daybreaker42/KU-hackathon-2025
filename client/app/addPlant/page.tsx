'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // next/image import
import { Camera } from 'lucide-react';
import BackButton from '@/app/component/common/BackButton';
import CloseButton from '@/app/component/common/CloseButton';
import { uploadPlantImage, createPlant, CreatePlantData, identifyPlant } from '@/app/api/communityController'; // identifyPlant API 추가

const AddPlantPage: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 상태 관리
  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // 업로드된 이미지 URL 저장
  const [plantName, setPlantName] = useState('');
  const [nickname, setNickname] = useState('');
  const [wateringCycle, setWateringCycle] = useState<1 | 2 | 3 | 4>(1);
  const [wateringFrequency, setWateringFrequency] = useState(1);
  const [wateringDays, setWateringDays] = useState<Set<string>>(new Set());
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePlace, setPurchasePlace] = useState('');
  const [memo, setMemo] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false); // 이미지 업로드 로딩 상태
  const [identificationLoading, setIdentificationLoading] = useState(false); // 식물 식별 로딩 상태
  const [loading, setLoading] = useState(false); // 기타 로딩 상태 (식물 등록 등)
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // 사진 업로드 핸들러 - 실제 API 연동
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setStep(2);
      setUploadLoading(true); // 이미지 업로드 로딩 시작

      try {
        // 실제 이미지 업로드 API 호출
        const uploadResult = await uploadPlantImage(file);
        setUploadedImageUrl(uploadResult.imageUrl);
        console.log('이미지 업로드 성공:', uploadResult.imageUrl);
        setUploadLoading(false); // 이미지 업로드 완료

        // Plant.ID API를 통한 식물 식별 (업로드된 이미지 URL 사용)
        await getPlantSuggestions(uploadResult.imageUrl);
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
        setStep(1);
        setImagePreview(null);
        setUploadLoading(false); // 오류 발생 시 업로드 로딩 해제
      }
    }
  };

  // 식물 이름 추천 API 호출 - Plant.ID API를 통한 실제 식물 식별
  const getPlantSuggestions = async (imageUrl: string) => {
    setIdentificationLoading(true); // 식물 식별 로딩 시작
    
    try {
      console.log('Plant.ID API를 통한 식물 식별 시작:', imageUrl);

      // Plant.ID API 호출
      const identificationResult = await identifyPlant(imageUrl);

      // 한글 이름에서 앞뒤 공백/개행 문자 제거
      const koreanName = identificationResult.koreanName.trim();

      console.log('식물 식별 결과:', {
        original: identificationResult.name,
        korean: koreanName,
        probability: identificationResult.probability
      });

      // 한글 이름을 추천 목록에 추가 (확률이 높은 경우만)
      if (identificationResult.probability > 0.3) {
        setSuggestions([koreanName]);
        // 첫 번째 추천을 자동으로 선택
        setPlantName(koreanName);
      } else {
        setSuggestions([]);
        console.log('식별 확률이 낮아 추천하지 않습니다.');
      }
    } catch (error) {
      console.error('Plant.ID 식물 식별 실패:', error);
      // 오류 발생 시 빈 추천 목록 설정
      setSuggestions([]);
    } finally {
      // 식물 식별 완료 후 로딩 상태 해제
      setIdentificationLoading(false);
    }
  };

  // 추천 이름 선택
  const selectSuggestion = (suggestion: string) => {
    setPlantName(suggestion);
  };

  // 급수 요일 토글
  const toggleWateringDay = (day: string) => {
    const newDays = new Set(wateringDays);
    if (newDays.has(day)) {
      newDays.delete(day);
    } else {
      newDays.add(day);
    }
    setWateringDays(newDays);
    // 선택된 요일 수에 따라 주 n회 급수 자동 계산
    setWateringFrequency(newDays.size);
  };

  // 다음 단계로 이동
  const nextStep = () => {
    if (step === 2 && (!plantName || !nickname)) {
      alert('품종과 애칭을 입력해주세요.');
      return;
    }
    setStep(step + 1);
  };

  // 이전 단계로 이동
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // 완료 처리 - 실제 식물 등록 API 호출
  const complete = async () => {
    if (!uploadedImageUrl) {
      alert('이미지가 업로드되지 않았습니다.');
      return;
    }

    setLoading(true);

    try {
      // API 요청 데이터 구성
      const plantApiData: CreatePlantData = {
        name: nickname, // API에서는 name이 사용자가 지정한 애칭
        variety: plantName, // variety가 실제 식물 품종
        img_url: uploadedImageUrl,
        cycle_type: 'WEEKLY', // 주 단위 고정
        cycle_value: wateringCycle.toString(),
        cycle_unit: '일',
        sunlight_needs: '간접광선', // 기본값 설정
        purchase_date: purchaseDate ? new Date(purchaseDate).toISOString() : undefined,
        purchase_location: purchasePlace || undefined,
        memo: memo || undefined,
      };

      // console.log(plantApiData.img_url);

      // 실제 식물 등록 API 호출
      const result = await createPlant(plantApiData);
      console.log('식물 등록 성공:', result);

      setStep(5);
    } catch (error) {
      console.error('식물 등록 실패:', error);
      alert('식물 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 홈으로 이동
  const goHome = () => {
    router.push('/');
  };

  // 단계별 렌더링
  const renderStep1 = () => (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold text-center text-[#023735]">추가할 식물의 사진을 업로드하세요</h1>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      <button
        className="w-24 h-24 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors flex items-center justify-center"
        onClick={() => fileInputRef.current?.click()}
      >
        <Camera size={32} />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col items-center gap-6">
      {imagePreview && (
        <div className="relative">
          <Image
            src={imagePreview}
            alt="식물 사진"
            width={256}
            height={256}
            className="max-w-64 max-h-64 rounded-lg shadow-md border-4 border-[#4CAF50] object-cover"
          />
          {(uploadLoading || identificationLoading) && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-sm">
                {uploadLoading ? '이미지 업로드 중...' : '식물 식별 중...'}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#333]">품종</label>
          <input
            type="text"
            value={plantName}
            onChange={(e) => setPlantName(e.target.value)}
            placeholder="식물 품종을 입력하세요"
            className="px-4 py-3 border-2 border-[#4CAF50] rounded-lg focus:outline-none focus:border-[#4CAF50]"
            disabled={uploadLoading || identificationLoading} // 업로드나 식별 중일 때 비활성화
          />
        </div>

        {identificationLoading && <div className="text-center text-gray-600 italic">🔍 Plant.ID를 통해 식물을 식별하는 중...</div>}

        {!identificationLoading && suggestions.length > 0 && (
          <div className="w-full text-center">
            <p className="mb-3 font-bold text-[#4CAF50]">🌿 식별된 식물:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 border rounded-full transition-colors ${plantName === suggestion
                      ? 'bg-[#4CAF50] text-white border-[#4CAF50]'
                      : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                    }`}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {!identificationLoading && suggestions.length === 0 && plantName === '' && (
          <div className="w-full text-center">
            <p className="text-gray-500 italic">식물을 식별할 수 없었습니다. 직접 입력해주세요.</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#333]">애칭</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="식물의 애칭을 입력하세요"
            className="px-4 py-3 border-2 border-[#4CAF50] rounded-lg focus:outline-none focus:border-[#4CAF50]"
            disabled={uploadLoading || identificationLoading} // 업로드나 식별 중일 때 비활성화
          />
        </div>

        <button
          className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={nextStep}
          disabled={uploadLoading || identificationLoading} // 업로드나 식별 중일 때 비활성화
        >
          다음으로
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col gap-6">
      {imagePreview && (
        // Image Component로 변경, layout="responsive"를 통해 반응형으로 설정, width, height 지정
        <Image src={imagePreview} alt="식물 사진" width={80} height={80} className="rounded-lg border-4 border-[#4CAF50] object-cover mx-auto" />
      )}
      <h2 className="text-xl font-bold text-[#023735]">급수 주기 설정</h2>

      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className='flex justify-between'>
            <label className="font-bold text-[#333]">급수 주기</label>
            <label className="font-bold text-[#333]">주 {wateringFrequency}회 급수</label>
          </div>

          <div className="flex gap-3">
            {[1, 2, 3, 4].map((cycle) => (
              <button
                key={cycle}
                className={`px-4 py-2 border-2 rounded-lg transition-all ${wateringCycle === cycle
                  ? 'bg-[#4CAF50] text-white border-[#4CAF50]'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                onClick={() => setWateringCycle(cycle as 1 | 2 | 3 | 4)}
              >
                {cycle}주
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#333]">급수 요일</label>
          <div className="flex gap-2">
            {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
              <button
                key={day}
                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${wateringDays.has(day)
                  ? 'bg-[#4CAF50] text-white border-[#4CAF50]'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                onClick={() => toggleWateringDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            선택된 요일: {['월', '화', '수', '목', '금', '토', '일'].filter(day => wateringDays.has(day)).join(', ')}
          </p>
        </div>

        <button className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors mt-4" onClick={nextStep}>
          다음으로
        </button>
      </div>
    </div>
  );
  const renderStep4 = () => (
    <div className="flex flex-col items-center gap-6">
      {imagePreview && (
        // Image Component로 변경, layout="responsive"를 통해 반응형으로 설정, width, height 지정
        <Image src={imagePreview} alt="식물 사진" width={80} height={80} className="rounded-lg border-4 border-[#4CAF50] object-cover mx-auto" />
      )}
      <h2 className="text-xl font-bold text-[#023735]">추가 정보 (선택)</h2>

      <div className="w-full max-w-md flex flex-col gap-4">
      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#333]">구매일 (선택)</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
              className="px-4 py-3 border-2 border-[#4CAF50] rounded-lg focus:outline-none focus:border-[#4CAF50]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#333]">구매처 (선택)</label>
          <input
            type="text"
            value={purchasePlace}
            onChange={(e) => setPurchasePlace(e.target.value)}
            placeholder="구매처를 입력하세요"
              className="px-4 py-3 border-2 border-[#4CAF50] rounded-lg focus:outline-none focus:border-[#4CAF50]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#333]">메모 (선택)</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력하세요"
              className="px-4 py-3 border-2 border-[#4CAF50] rounded-lg focus:outline-none focus:border-[#4CAF50] resize-none"
            rows={4}
          />
        </div>

          <button
            className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={complete}
            disabled={loading}
          >
            {loading ? '등록 중...' : '완료하기'}
          </button>
      </div>
    </div>
    </div>
  );
  const renderStep5 = () => (
    <div className="text-center">
      {imagePreview && (
        // Image Component로 변경, layout="responsive"를 통해 반응형으로 설정, width, height 지정
        <Image src={imagePreview} alt="완료된 식물" width={192} height={192} className="rounded-lg shadow-md mx-auto mb-6 border-4 border-[#4CAF50]" />
        )}
        <h1 className="text-3xl font-bold text-[#023735] mb-6">
          {nickname} - {plantName}
        </h1>
      <button className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors" onClick={goHome}>
          홈으로
        </button>
      {/* </div> */}
    </div>
  );

  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] overflow-hidden">
      {/* App Bar */}
      <div className="flex items-center justify-between p-4 bg-transparent">
        {step > 1 && step < 5 ? <BackButton onClick={prevStep} /> : <div className="w-6" />}
        <h1 className="text-[#023735] font-bold text-lg">식물 추가</h1>
        <CloseButton />
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-[18px] pb-[100px]">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </div>
    </div>
  );
};

export default AddPlantPage;
