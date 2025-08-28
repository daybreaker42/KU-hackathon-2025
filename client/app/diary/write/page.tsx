'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import { postDiary, getPlant } from '@/app/api/diaryController';

export default function DiaryWritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // URL에서 날짜 파라미터 읽기
  const getDateFromParams = () => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        return {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        };
      }
    }
    // 기본값은 오늘 날짜
    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
  };
  
  // 식물 정보 타입 정의
  interface PlantInfo {
    id: number;
    name: string;
    variety: string;
    img_url: string;
    cycle_type: string;
    cycle_value: string;
    cycle_unit: string;
    sunlight_needs: string;
    purchase_date: string;
    purchase_location: string;
    memo: string;
    author: any;
    createdAt: string;
    updatedAt: string;
    // 다이어리 작성용 로컬 상태
    growthNote?: string;
    isWatered?: boolean;  // 급수 여부 (토글)
    isSunlightAdjusted?: boolean;  // 햇빛 조절 여부 (토글)
  }

  // API 응답 타입 정의
  interface PlantApiResponse {
    plants: PlantInfo[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  // 상태 관리
  const [selectedDate] = useState(() => getDateFromParams());
  
  const [title, setTitle] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('😊');
  const [isLoading, setIsLoading] = useState(false);
  
  // 사용자의 식물 목록 (API에서 가져올 데이터)
  const [userPlants, setUserPlants] = useState<PlantInfo[]>([]);

  // 선택된 식물 상태 추가
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);

  // 컴포넌트 마운트 시 식물 데이터 가져오기
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setIsLoading(true);
        const response = await getPlant() as unknown as PlantApiResponse;
        if (response.plants) {
          // API 응답 데이터에 로컬 상태 필드 추가
          const plantsWithLocalState = response.plants.map((plant: PlantInfo) => ({
            ...plant,
            growthNote: '',
            isWatered: false,
            isSunlightAdjusted: false
          }));
          setUserPlants(plantsWithLocalState);
        }
      } catch (error) {
        console.error('식물 목록을 가져오는데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlants();
  }, []);

  // 감정 옵션들
  const moodOptions = [
    { emoji: '😊', label: '기쁨' },
    { emoji: '😢', label: '슬픔' },
    { emoji: '😡', label: '화남' },
    { emoji: '😰', label: '걱정' },
    { emoji: '😤', label: '짜증' },
    { emoji: '😪', label: '피곤' }
  ];

  // 감정 이모지를 텍스트로 변환하는 함수
  const getEmotionText = (emoji: string) => {
    const moodOption = moodOptions.find(option => option.emoji === emoji);
    return moodOption ? moodOption.label : '기쁨';
  };

  // 식물별 성장일기 업데이트
  const updatePlantGrowthNote = (plantId: number, note: string) => {
    setUserPlants(prev => 
      prev.map(plant => 
        plant.id === plantId ? { ...plant, growthNote: note } : plant
      )
    );
  };

  // 식물별 급수 토글
  const togglePlantWatering = (plantId: number) => {
    setUserPlants(prev => 
      prev.map(plant => 
        plant.id === plantId ? { ...plant, isWatered: !plant.isWatered } : plant
      )
    );
  };

  // 식물별 햇빛 조절 토글
  const togglePlantSunlight = (plantId: number) => {
    setUserPlants(prev => 
      prev.map(plant => 
        plant.id === plantId ? { ...plant, isSunlightAdjusted: !plant.isSunlightAdjusted } : plant
      )
    );
  };

  // 식물 카드 선택
  const handlePlantSelect = (plantId: number) => {
    setSelectedPlantId(selectedPlantId === plantId ? null : plantId);
  };

  // 선택된 식물 정보 가져오기
  const selectedPlant = userPlants.find(plant => plant.id === selectedPlantId);

  // 이미지 선택 핸들러
  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 3 - selectedImages.length); // 최대 3개까지만
      const newFileUrls: string[] = [];
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newFileUrls.push(event.target.result as string);
            if (newFileUrls.length === newFiles.length) {
              setSelectedImages(prev => [...prev, ...newFiles]);
              setImagePreviewUrls(prev => [...prev, ...newFileUrls]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // 이미지 제거
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // 감정 선택
  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };

  // 일기 저장
  const handleSave = async () => {
    // 제목과 내용 유효성 검사
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 선택된 식물들의 ID 수집
      const selectedPlants = userPlants.filter(plant => plant.growthNote && plant.growthNote.trim() !== '');
      const plant_id = selectedPlants.map(plant => plant.id);
      
      // 물을 준 식물들의 ID 수집 (isWatered가 true인 것들)
      const water = userPlants.filter(plant => plant.isWatered).map(plant => plant.id);
      
      // 햇빛 조절한 식물들의 ID 수집 (isSunlightAdjusted가 true인 것들)
      const sun = userPlants.filter(plant => plant.isSunlightAdjusted).map(plant => plant.id);
      
      // 메모리 데이터 생성 (성장일기가 있는 식물들)
      const memory = selectedPlants.filter(plant => plant.growthNote !== '').map(plant => ({
        id: plant.id,
        memo: plant.growthNote!
      }));

      const diaryData = {
        title,
        content,
        emotion: getEmotionText(selectedMood),
        memory,
        plant_id,
        water,
        sun,
        images: selectedImages
      };
      
      const res = await postDiary(diaryData) as unknown as { success: boolean };
      
      router.push('/diary');
    } catch (error) {
      console.error('일기 저장 실패:', error);
      alert('일기 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    
  }, []);

  return (
    <main>
      <div className={styles.container}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h1 className={styles.title}>일기 작성</h1>
          <button
            onClick={() => router.push('/diary')}
            className={styles.closeButton}
          >
            ✕
          </button>
        </div>

        {/* 날짜 */}
        <div className={styles.dateSection}>
          <h2 className={styles.date}>{selectedDate.year}년 {selectedDate.month}월 {selectedDate.day}일</h2>
        </div>

        {/* 제목 */}
        <div className={styles.inputContainer}>
          <label htmlFor="title" className={styles.label}>
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            placeholder="제목 입력"
            required
          />
        </div>

        {/* 이미지 섹션 */}
        <div className={styles.imageSection}>
          <div className={styles.imageContainer}>
            {imagePreviewUrls.map((imageUrl, index) => (
              <div key={index} className={styles.imageWrapper}>
                <Image
                  src={imageUrl}
                  alt={`선택된 이미지 ${index + 1}`}
                  width={100}
                  height={100}
                  className={styles.selectedImage}
                />
                <button
                  onClick={() => removeImage(index)}
                  className={styles.removeImageButton}
                >
                  ✕
                </button>
              </div>
            ))}
            
            {/* 이미지 추가 버튼 */}
            {selectedImages.length < 3 && (
              <button
                onClick={handleImageSelect}
                className={styles.addImageButton}
              >
                +
              </button>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
        </div>

        {/* 일기 내용 */}
        <div className={styles.inputContainer}>
          <label htmlFor="content" className={styles.label}>
            내용
          </label>
          <textarea
            id={"content"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 작성하세요"
            className={styles.contentTextarea}
          />
        </div>

        {/* 감정 상태 */}
        <div className={styles.inputContainer}>
          <label htmlFor="mood" className={styles.label}>
            감정상태
          </label>
          <div id="mood" className={styles.moodOptions}>
            {moodOptions.map((mood) => (
              <button
                key={mood.emoji}
                onClick={() => handleMoodSelect(mood.emoji)}
                className={`${styles.moodButton} ${
                  selectedMood === mood.emoji ? styles.selected : ''
                }`}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 식물 카드 섹션 */}
        <div className={styles.plantCardsSection}>
          <label className={styles.label}>식물 선택</label>
          <div className={styles.plantCardsContainer}>
            {isLoading ? (
              <div className={styles.loadingMessage}>식물 목록을 불러오는 중...</div>
            ) : userPlants.length === 0 ? (
              <div className={styles.emptyMessage}>등록된 식물이 없습니다.</div>
            ) : (
              userPlants.map((plant) => (
                <div
                  key={plant.id}
                  onClick={() => handlePlantSelect(plant.id)}
                  className={`${styles.plantCard} ${
                    selectedPlantId === plant.id ? styles.selectedCard : ''
                  }`}
                >
                  <div className={styles.plantImageContainer}>
                    <Image
                      src={plant.img_url || '/plant-normal.png'}
                      alt={plant.name}
                      width={80}
                      height={80}
                      className={styles.plantCardImage}
                    />
                  </div>
                  <h4 className={styles.plantCardName}>{plant.name}</h4>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 선택된 식물의 관리 영역 */}
        {selectedPlant && (
          <div>
            {/* 성장일기 */}
            <div className={styles.inputContainer}>
              <label className={styles.label}>성장일기</label>
              <input
                type="text"
                value={selectedPlant.growthNote}
                onChange={(e) => updatePlantGrowthNote(selectedPlant.id, e.target.value)}
                placeholder="새싹 출현 / 꽃망울 수 / 식물의 키"
                className={styles.input}
              />
            </div>

            {/* 급수 관리 */}
            <div className={styles.plantContainer}>
              <label className={styles.plantLabel}>급수 관리</label>
              <button
                type="button"
                onClick={() => togglePlantWatering(selectedPlant.id)}
                className={`${styles.toggleButton} ${selectedPlant.isWatered ? styles.active : ''}`}
              >
                급수
              </button>
            </div>

            {/* 햇빛 관리 */}
            <div className={styles.plantContainer}>
              <label className={styles.plantLabel}>햇빛 관리</label>
              <button
                type="button"
                onClick={() => togglePlantSunlight(selectedPlant.id)}
                className={`${styles.toggleButton} ${selectedPlant.isSunlightAdjusted ? styles.active : ''}`}
              >
                햇빛 조절
              </button>
            </div>
          </div>
        )}

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={isLoading || !title.trim() || !content.trim()}
          className={styles.saveButton}
        >
          {isLoading ? '저장 중...' : '작성완료'}
        </button>
      </div>
    </main>
  );
}
