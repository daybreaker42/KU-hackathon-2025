'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import BackButton from '@/app/component/common/BackButton';
import CloseButton from '@/app/component/common/CloseButton';
import { uploadPlantImage, createPlant, CreatePlantData, identifyPlant } from '@/app/api/communityController';
import styles from './page.module.css';

const AddPlantPage: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 상태 관리
  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [plantName, setPlantName] = useState('');
  const [nickname, setNickname] = useState('');
  const [wateringCycle, setWateringCycle] = useState<1 | 2 | 3 | 4>(1);
  const [customWeeks, setCustomWeeks] = useState<number>(4);
  const [wateringFrequency, setWateringFrequency] = useState(1);
  const [wateringDays, setWateringDays] = useState<Set<string>>(new Set());
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePlace, setPurchasePlace] = useState('');
  const [memo, setMemo] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [identificationLoading, setIdentificationLoading] = useState(false);
  const [identificationSuccess, setIdentificationSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // 사진 업로드 핸들러
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSuggestions([]);
      setPlantName('');
      setUploadedImageUrl(null);
      setUploadSuccess(false);
      setIdentificationSuccess(false);

      setStep(2);
      setUploadLoading(true);

      try {
        const uploadResponse = await uploadPlantImage(file);
        setUploadedImageUrl(uploadResponse.imageUrl);
        setImagePreview(uploadResponse.imageUrl);
        setUploadLoading(false);
        setUploadSuccess(true);

        setTimeout(() => {
          setUploadSuccess(false);
          setIdentificationLoading(true);
        }, 1500);

        setTimeout(async () => {
          try {
            const identificationResponse = await identifyPlant(uploadResponse.imageUrl);
            if (identificationResponse) {
              // API가 단일 식물 정보를 반환하므로 배열로 변환
              setSuggestions([identificationResponse.name, identificationResponse.koreanName].filter(Boolean));
              setPlantName(identificationResponse.koreanName || identificationResponse.name);
            }
            setIdentificationLoading(false);
            setIdentificationSuccess(true);

            setTimeout(() => {
              setIdentificationSuccess(false);
            }, 1500);
          } catch (identificationError) {
            console.error('식물 식별 실패:', identificationError);
            setIdentificationLoading(false);
          }
        }, 3000);
      } catch (uploadError) {
        console.error('이미지 업로드 실패:', uploadError);
        setUploadLoading(false);
        alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 기타 핸들러들
  const handleImageReselect = () => {
    fileInputRef.current?.click();
  };

  const selectSuggestion = (suggestion: string) => {
    setPlantName(suggestion);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const toggleWateringDay = (day: string) => {
    const newDays = new Set(wateringDays);
    if (newDays.has(day)) {
      newDays.delete(day);
    } else {
      newDays.add(day);
    }
    setWateringDays(newDays);
  };

  const complete = async () => {
    setLoading(true);
    try {
      const plantData: CreatePlantData = {
        name: plantName,
        variety: nickname,
        img_url: uploadedImageUrl || '',
        cycle_type: 'weekly',
        cycle_value: (wateringCycle === 4 ? customWeeks : wateringCycle).toString(),
        cycle_unit: 'weeks',
        sunlight_needs: 'medium',
        purchase_date: purchaseDate || undefined,
        purchase_location: purchasePlace || undefined,
        memo: memo || undefined,
      };

      await createPlant(plantData);
      setStep(6);
    } catch (error) {
      console.error('식물 등록 실패:', error);
      alert('식물 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    router.push('/');
  };

  // 단계별 렌더링
  const renderStep1 = () => (
    <div className={styles.stepContainer}>
      <h1 className={styles.head}>추가할 식물의 사진을 업로드하세요</h1>
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
        <Camera size={32} />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.stepContainer}>
      {uploadLoading && (
        <div className={styles.imageContainer}>
          <div className={styles.imageBox}>
            <div className={styles.textCenter}>
              <div className={styles.loadingSpinner}></div>
              <div className={styles.loadingText}>이미지 업로드 중...</div>
            </div>
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div className={styles.imageContainer}>
          <div className={`${styles.imageBox} ${styles.imageBoxSuccess}`}>
            <div className={styles.textCenter}>
              <div className={styles.successIcon}>✅</div>
              <div className={styles.successText}>이미지 업로드 성공!</div>
            </div>
          </div>
        </div>
      )}

      {imagePreview && !uploadLoading && !uploadSuccess && (
        <div style={{position: 'relative'}}>
          <Image
            src={imagePreview}
            alt="식물 사진"
            width={256}
            height={256}
            className={styles.imagePreview}
            onClick={() => !uploadLoading && !identificationLoading && handleImageReselect()}
          />
          {!uploadLoading && !identificationLoading && !uploadSuccess && !identificationSuccess && (
            <div className={styles.imageLabel}>
              클릭하여 재선택
            </div>
          )}
        </div>
      )}

      {identificationLoading && (
        <div className={styles.textCenter}>
          <div className={`${styles.loadingSpinner} ${styles.loadingSpinnerSmall}`}></div>
          <div className={styles.identificationText}>🔍 식물 식별 중...</div>
        </div>
      )}

      {identificationSuccess && (
        <div className={styles.textCenter}>
          <div className={styles.celebrationIcon}>🎉</div>
          <div className={styles.successText}>식물 식별 성공!</div>
        </div>
      )}

      {!uploadLoading && !uploadSuccess && (
        <div className={styles.formContainer}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>품종</label>
            <input
              type="text"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              placeholder="식물 품종을 입력하세요"
              className={styles.input}
              disabled={uploadLoading || identificationLoading}
            />
          </div>

          {identificationLoading && <div className={styles.identificationText}>식물을 찾아보는 중...</div>}

          {!identificationLoading && suggestions.length > 0 && (
            <div className={styles.inputGroup}>
              <p className={styles.successText}>혹시 이 식물인가요?</p>
              <div className={styles.suggestionsList}>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className={styles.suggestionItem}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!identificationLoading && suggestions.length === 0 && plantName === '' && (
            <div className={styles.textCenter}>
              <p className={styles.identificationText}>식물을 식별할 수 없었습니다. 직접 입력해주세요.</p>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>애칭</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="식물의 애칭을 입력하세요"
              className={styles.input}
              disabled={uploadLoading || identificationLoading}
            />
          </div>

          <button
            className={`${styles.button} ${styles.buttonPrimary} ${(uploadLoading || identificationLoading) ? styles.buttonDisabled : ''}`}
            onClick={nextStep}
            disabled={uploadLoading || identificationLoading}
          >
            다음으로
          </button>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className={styles.stepContainer}>
      {imagePreview && (
        <Image 
          src={imagePreview} 
          alt="식물 사진" 
          width={80} 
          height={80} 
          className={styles.imagePreview} 
          style={{width: '80px', height: '80px'}} 
        />
      )}
      
      <h2 className={styles.head}>급수 주기를 설정하세요</h2>
      
      <div className={styles.cycleButtons}>
        {[1, 2, 3, 4].map((weeks) => (
          <button
            key={weeks}
            className={`${styles.cycleButton} ${wateringCycle === weeks ? styles.cycleButtonActive : ''}`}
            onClick={() => setWateringCycle(weeks as 1 | 2 | 3 | 4)}
          >
            {weeks === 4 ? '4주+' : `${weeks}주`}
          </button>
        ))}
      </div>

      {wateringCycle === 4 && (
        <div className={styles.inputGroup}>
          <label className={styles.label}>몇 주마다 물을 주시나요?</label>
          <input
            type="number"
            min="4"
            max="52"
            value={customWeeks}
            onChange={(e) => setCustomWeeks(Math.max(4, Math.min(52, parseInt(e.target.value) || 4)))}
            className={styles.customWeeksInput}
          />
          <div className={styles.textCenter}>
            <span className={styles.successText}>{customWeeks}주마다 물주기</span>
          </div>
        </div>
      )}

      <div className={styles.navigationButtons}>
        <button
          className={`${styles.button} ${styles.buttonSecondary}`}
          onClick={prevStep}
        >
          이전으로
        </button>
        <button
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={nextStep}
        >
          다음으로
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className={styles.stepContainer}>
      {imagePreview && (
        <Image 
          src={imagePreview} 
          alt="식물 사진" 
          width={80} 
          height={80} 
          className={styles.imagePreview} 
          style={{width: '80px', height: '80px'}} 
        />
      )}
      
      <h2 className={styles.head}>급수 요일을 선택하세요</h2>
      <p className={styles.identificationText}>
        {wateringCycle === 4 ? `${customWeeks}주` : `${wateringCycle}주`}마다 물을 주는 요일을 선택해주세요 (여러 선택 가능)
      </p>
      
      <div className={styles.dayButtons}>
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <button
            key={day}
            className={`${styles.dayButton} ${wateringDays.has(day) ? styles.dayButtonActive : ''}`}
            onClick={() => toggleWateringDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      <div className={styles.navigationButtons}>
        <button
          className={`${styles.button} ${styles.buttonSecondary}`}
          onClick={prevStep}
        >
          이전으로
        </button>
        <button
          className={`${styles.button} ${styles.buttonPrimary} ${wateringDays.size === 0 ? styles.buttonDisabled : ''}`}
          onClick={nextStep}
          disabled={wateringDays.size === 0}
        >
          다음으로
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className={styles.stepContainer}>
      {imagePreview && (
        <Image 
          src={imagePreview} 
          alt="식물 사진" 
          width={80} 
          height={80} 
          className={styles.imagePreview} 
          style={{width: '80px', height: '80px'}} 
        />
      )}
      
      <h2 className={styles.head}>추가 정보를 입력하세요</h2>
      
      <div className={styles.formContainer}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>구매일</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>구매처</label>
          <input
            type="text"
            value={purchasePlace}
            onChange={(e) => setPurchasePlace(e.target.value)}
            placeholder="구매처를 입력하세요"
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력하세요"
            className={styles.textarea}
          />
        </div>

        <div className={styles.navigationButtons}>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={prevStep}
          >
            이전으로
          </button>
          <button
            className={`${styles.button} ${styles.buttonPrimary} ${loading ? styles.buttonDisabled : ''}`}
            onClick={complete}
            disabled={loading}
          >
            {loading ? '등록 중...' : '완료하기'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className={styles.stepContainer}>
      {imagePreview && (
        <Image 
          src={imagePreview} 
          alt="완료된 식물" 
          width={192} 
          height={192} 
          className={styles.imagePreview} 
          style={{width: '192px', height: '192px'}} 
        />
      )}
      <h2 className={styles.head}>식물 등록이 완료되었습니다!</h2>
      <p className={styles.successText}>
        {nickname} - {plantName}
      </p>
      <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={goHome}>
        홈으로 가기
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackButton />
        <h1 className={styles.title}>식물 추가</h1>
        <CloseButton />
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
      {step === 6 && renderStep6()}
    </div>
  );
};

export default AddPlantPage;
