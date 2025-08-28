'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import BackButton from '../component/common/BackButton';
import CloseButton from '../component/common/CloseButton';

interface PlantData {
  name: string;
  nickname: string;
  wateringCycle: number;
  wateringFrequency: number;
  wateringDays: string[];
  purchaseDate?: string;
  purchasePlace?: string;
  memo?: string;
}

const AddPlantPage: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 상태 관리
  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [plantName, setPlantName] = useState('');
  const [nickname, setNickname] = useState('');
  const [wateringCycle, setWateringCycle] = useState<1 | 2 | 3 | 4>(1);
  const [wateringFrequency, setWateringFrequency] = useState(1);
  const [wateringDays, setWateringDays] = useState<Set<string>>(new Set());
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePlace, setPurchasePlace] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // 사진 업로드 핸들러
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setStep(2);
      // API 호출로 식물 이름 추천 받기
      getPlantSuggestions(file);
    }
  };

  // 식물 이름 추천 API 호출 (가정)
  const getPlantSuggestions = async (file: File) => {
    setLoading(true);
    try {
      // 실제 API 호출 코드
      const formData = new FormData();
      formData.append('image', file);
      // const response = await fetch('/api/plant-identify', { method: 'POST', body: formData });
      // const data = await response.json();
      // setSuggestions(data.suggestions);

      // 임시 데이터 - 실제로는 위의 API 호출로 대체
      console.log('식물 사진 분석 중:', file.name);
      setTimeout(() => {
        setSuggestions(['몬스테라', '필로덴드론', '싱고니움', '호야']);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('식물 식별 실패:', error);
      setLoading(false);
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

  // 완료 처리
  const complete = () => {
    const plantData: PlantData = {
      name: plantName,
      nickname,
      wateringCycle,
      wateringFrequency,
      wateringDays: Array.from(wateringDays),
      purchaseDate: purchaseDate || undefined,
      purchasePlace: purchasePlace || undefined,
      memo: memo || undefined,
    };

    // 데이터 저장 로직 (API 호출 등)
    console.log('식물 데이터:', plantData);
    setStep(5);
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
        className="flex items-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <Camera size={20} />
        사진 업로드
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col items-center gap-6">
      {imagePreview && (
        <img src={imagePreview} alt="식물 사진" className="max-w-64 max-h-64 rounded-lg shadow-md" />
      )}
      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#333]">품종</label>
          <input
            type="text"
            value={plantName}
            onChange={(e) => setPlantName(e.target.value)}
            placeholder="식물 품종을 입력하세요"
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#4CAF50]"
          />
        </div>

        {loading && <div className="text-center text-gray-600 italic">식물 이름을 분석하는 중...</div>}

        {!loading && suggestions.length > 0 && (
          <div className="w-full text-center">
            <p className="mb-3 font-bold">추천 품종:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 transition-colors"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#333]">애칭</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="식물의 애칭을 입력하세요"
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#4CAF50]"
          />
        </div>

        <button className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors mt-4" onClick={nextStep}>
          다음으로
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col gap-6">
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
                  ? 'bg-[#FFC107] text-white border-[#FFC107]'
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
      <h2 className="text-xl font-bold text-[#023735]">추가 정보 (선택)</h2>

      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#333]">구매일 (선택)</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#4CAF50]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#333]">구매처 (선택)</label>
          <input
            type="text"
            value={purchasePlace}
            onChange={(e) => setPurchasePlace(e.target.value)}
            placeholder="구매처를 입력하세요"
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#4CAF50]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-[#333]">메모 (선택)</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력하세요"
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#4CAF50] resize-none"
            rows={4}
          />
        </div>

        <button className="px-6 py-3 bg-[#FF9800] text-white rounded-lg hover:bg-[#F57C00] transition-colors mt-4" onClick={complete}>
          완료하기
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        {imagePreview && (
          <img src={imagePreview} alt="완료된 식물" className="max-w-48 max-h-48 rounded-lg shadow-md mx-auto mb-6" />
        )}
        <h1 className="text-3xl font-bold text-[#023735] mb-6">
          {nickname} - {plantName}
        </h1>
        <button className="px-6 py-3 bg-[#FF9800] text-white rounded-lg hover:bg-[#F57C00] transition-colors" onClick={goHome}>
          홈으로
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] overflow-hidden">
      {/* App Bar */}
      <div className="flex items-center justify-between p-4 bg-transparent">
        {step > 1 ? <BackButton onClick={prevStep} /> : <div className="w-6" />}
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
