'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

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
  };

  // 다음 단계로 이동
  const nextStep = () => {
    if (step === 2 && (!plantName || !nickname)) {
      alert('품종과 애칭을 입력해주세요.');
      return;
    }
    setStep(step + 1);
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
    <div className={styles.step}>
      <h1 className={styles.title}>추가할 식물의 사진을 업로드하세요</h1>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      <button
        className={styles.uploadButton}
        onClick={() => fileInputRef.current?.click()}
      >
        사진 업로드
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.step}>
      {imagePreview && (
        <img src={imagePreview} alt="식물 사진" className={styles.previewImage} />
      )}
      <div className={styles.inputGroup}>
        <label>품종</label>
        <input
          type="text"
          value={plantName}
          onChange={(e) => setPlantName(e.target.value)}
          placeholder="식물 품종을 입력하세요"
        />
      </div>

      {loading && <div className={styles.loading}>식물 이름을 분석하는 중...</div>}

      {!loading && suggestions.length > 0 && (
        <div className={styles.suggestions}>
          <p>추천 품종:</p>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className={styles.suggestionButton}
              onClick={() => selectSuggestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className={styles.inputGroup}>
        <label>애칭</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="식물의 애칭을 입력하세요"
        />
      </div>

      <button className={styles.nextButton} onClick={nextStep}>
        다음으로
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className={styles.step}>
      <h2>급수 주기 설정</h2>

      <div className={styles.inputGroup}>
        <label>급수 주기</label>
        <div className={styles.toggleGroup}>
          {[1, 2, 3, 4].map((cycle) => (
            <button
              key={cycle}
              className={`${styles.toggleButton} ${
                wateringCycle === cycle ? styles.active : ''
              }`}
              onClick={() => setWateringCycle(cycle as 1 | 2 | 3 | 4)}
            >
              {cycle}주
            </button>
          ))}
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>주 {wateringFrequency}회 급수</label>
        <input
          type="number"
          min="1"
          max="7"
          value={wateringFrequency}
          onChange={(e) => setWateringFrequency(Number(e.target.value))}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>급수 요일</label>
        <div className={styles.dayButtons}>
          {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
            <button
              key={day}
              className={`${styles.dayButton} ${
                wateringDays.has(day) ? styles.selected : ''
              }`}
              onClick={() => toggleWateringDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
        <p>선택된 요일: {Array.from(wateringDays).join(', ')}</p>
      </div>

      <button className={styles.nextButton} onClick={nextStep}>
        다음으로
      </button>
    </div>
  );

  const renderStep4 = () => (
    <div className={styles.step}>
      <h2>추가 정보 (선택)</h2>

      <div className={styles.inputGroup}>
        <label>구매일 (선택)</label>
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>구매처 (선택)</label>
        <input
          type="text"
          value={purchasePlace}
          onChange={(e) => setPurchasePlace(e.target.value)}
          placeholder="구매처를 입력하세요"
        />
      </div>

      <div className={styles.inputGroup}>
        <label>메모 (선택)</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="메모를 입력하세요"
        />
      </div>

      <button className={styles.completeButton} onClick={complete}>
        완료하기
      </button>
    </div>
  );

  const renderStep5 = () => (
    <div className={styles.step}>
      <div className={styles.completeContainer}>
        {imagePreview && (
          <img src={imagePreview} alt="완료된 식물" className={styles.completeImage} />
        )}
        <h1 className={styles.completeTitle}>
          {nickname} - {plantName}
        </h1>
        <button className={styles.homeButton} onClick={goHome}>
          홈으로
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
    </div>
  );
};

export default AddPlantPage;
