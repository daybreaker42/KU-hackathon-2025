"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import BackButton from "@/app/component/common/BackButton";
import { getPlantById, getPlantImages } from "@/app/api/plantController"; // getPlantImages 추가
import { getDiaryMemories } from "@/app/api/diaryController"; // 일기 메모리 API 추가

// 식물 데이터 타입 정의 (API 응답과 일치하도록 업데이트)
interface Plant {
  id: number;
  name: string;
  variety: string;
  img_url: string;
  cycle_type: string;
  cycle_value: string;
  cycle_unit: string;
  sunlight_needs: string;
  purchase_date: string;
  memo: string;
  // API에 없는 필드는 제거하거나, 필요시 별도 처리
  // lastWatered, lastSunlight, lastActivity 등은 API에서 직접 제공되지 않으므로,
  // 필요하다면 별도의 계산 로직이나 다른 API를 통해 가져와야 합니다.
  // 여기서는 API 응답에 있는 필드만 사용합니다.
}

// 식물 기록 데이터 타입 (일기 메모리 API 기반으로 수정)
interface PlantRecord {
  id: number;
  title: string;
  content: string;
  water: boolean;
  sun: boolean;
  emotion: string;
  memory: string;
  author: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  images: string[];
  comments_count: number;
}

// 메모리 데이터 타입 (일기 메모리 API 응답과 일치)
interface Memory {
  id: number;
  title: string;
  content: string;
  water: boolean;
  sun: boolean;
  emotion: string;
  memory: string;
  author: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  images: string[];
  comments_count: number;
}

// 갤러리 이미지 타입 (API 응답 기반으로 수정)
interface GalleryImage {
  url: string;
  id: string; // URL 기반으로 생성할 고유 ID
}

export default function PlantDetailPage() {
  const params = useParams();
  const plantId = parseInt(params.id as string, 10); // ID를 숫자로 변환
  
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API 연동 - 실제 데이터 사용
  const [records, setRecords] = useState<PlantRecord[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]); // API에서 갤러리 데이터 로드

  useEffect(() => {
    const fetchPlantDetails = async () => {
      if (isNaN(plantId)) {
        setError("유효하지 않은 식물 ID입니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getPlantById(plantId);
        if (data) {
          setPlant({
            id: data.id,
            name: data.name,
            variety: data.variety,
            img_url: data.img_url,
            cycle_type: data.cycle_type,
            cycle_value: data.cycle_value,
            cycle_unit: data.cycle_unit,
            sunlight_needs: data.sunlight_needs,
            purchase_date: data.purchase_date,
            memo: data.memo,
          });
          setError(null);
        } else {
          setPlant(null);
          setError("식물 정보를 불러오지 못했습니다.");
        }
      } catch (err) {
        console.error("Failed to fetch plant details:", err);
        setError("식물 정보를 불러오는 중 오류가 발생했습니다.");
        setPlant(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchDiaryMemories = async () => {
      try {
        const diaryData = await getDiaryMemories();
        if (diaryData && Array.isArray(diaryData)) {
          // 최근 3개만 기록으로 사용 (활동 기록용)
          setRecords(diaryData.slice(0, 3));
          // 전체를 추억으로 사용 (소중한 추억들용)
          setMemories(diaryData.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch diary memories:", err);
        // 에러가 나도 식물 정보는 표시되도록 함
      }
    };

    const fetchPlantGallery = async () => {
      try {
        const galleryData = await getPlantImages();
        if (galleryData && Array.isArray(galleryData)) {
          // URL 배열을 GalleryImage 객체 배열로 변환
          const galleryImages: GalleryImage[] = galleryData.map((url, index) => ({
            id: `gallery-${index}`, // 인덱스 기반 고유 ID 생성
            url: url
          }));
          setGallery(galleryImages);
        }
      } catch (err) {
        console.error("Failed to fetch plant gallery:", err);
        // 에러가 나도 다른 정보는 표시되도록 함
      }
    };

    fetchPlantDetails();
    fetchDiaryMemories();
    fetchPlantGallery(); // 갤러리 API 호출 추가
  }, [plantId]);

  // 다음 급수일 계산 함수 개선
  const getNextWateringDate = (): string => {
    if (!plant) return "정보 없음";
    
    try {
      // purchase_date를 기준으로 cycle_value만큼 더한 날짜 계산
      const purchaseDate = new Date(plant.purchase_date || '0001-01-01');
      const cycleValue = parseInt(plant.cycle_value);
      
      if (isNaN(cycleValue)) return "정보 없음";
      
      // cycle_unit에 따라 다르게 계산 (일, 주, 월 등)
      const nextWateringDate = new Date(purchaseDate);
      
      if (plant.cycle_unit === "일" || plant.cycle_unit === "days") {
        nextWateringDate.setDate(purchaseDate.getDate() + cycleValue);
      } else if (plant.cycle_unit === "주" || plant.cycle_unit === "weeks") {
        nextWateringDate.setDate(purchaseDate.getDate() + (cycleValue * 7));
      } else if (plant.cycle_unit === "월" || plant.cycle_unit === "months") {
        nextWateringDate.setMonth(purchaseDate.getMonth() + cycleValue);
      } else {
        return "정보 없음";
      }
      
      return nextWateringDate.toLocaleDateString('ko-KR');
    } catch (error) {
      console.error('급수일 계산 오류:', error);
      return "정보 없음";
    }
  };

  // 다음 햇빛 쬐기일 계산 함수 개선
  const getNextSunlightDate = (): string => {
    if (!plant) return "정보 없음";
    
    // 햇빛은 보통 매일 또는 주기적으로 필요하므로, 
    // 급수 주기와 다를 수 있지만 현재 API에서는 별도 정보가 없으므로
    // 임시로 햇빛 요구량에 따라 추천 메시지 반환
    switch (plant.sunlight_needs) {
      case "직사광선":
        return "매일 권장";
      case "간접광선":
        return "2-3일마다 권장";
      case "반그늘":
        return "일주일에 2-3회 권장";
      default:
        return "정보 없음";
    }
  };

  // 날짜 포맷팅 함수 추가 (현재 사용되지 않지만 추후 확장 가능)
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR');
    } catch {
      return "정보 없음";
    }
  };

  // 기록 타입별 아이콘 및 색상 (일기 메모리 API용으로 수정)
  const getRecordTypeInfo = (emotion: string, water: boolean, sun: boolean) => {
    // 물이나 햇빛 활동이 있으면 우선 표시
    if (water) {
      return { icon: "💧", color: "bg-blue-100 text-blue-700", label: "급수 기록" };
    }
    if (sun) {
      return { icon: "☀️", color: "bg-yellow-100 text-yellow-700", label: "햇빛 기록" };
    }

    // 감정에 따른 표시
    switch (emotion) {
      case "happy":
        return { icon: "😊", color: "bg-green-100 text-green-700", label: "기쁜 기록" };
      case "satisfied":
        return { icon: "😌", color: "bg-blue-100 text-blue-700", label: "만족스러운 기록" };
      case "normal":
        return { icon: "😐", color: "bg-gray-100 text-gray-700", label: "일반 기록" };
      default:
        return { icon: "📝", color: "bg-gray-100 text-gray-700", label: "일기 기록" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6EC]">
        <p className="text-[#4A6741] text-[16px]">식물 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6EC]">
        <p className="text-[#4A6741] text-[16px]">{error}</p>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6EC]">
        <p className="text-[#4A6741] text-[16px]">식물을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] overflow-hidden">
      {/* 헤더 - 중앙정렬 */}
      <div className="relative flex items-center justify-center p-[18px] pb-[8px]">
        <BackButton className="absolute left-[18px]" />
        <h1 className="text-[#023735] font-bold text-[20px]">
          {plant.name}
        </h1>
      </div>

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        {/* 식물 프로필 섹션 - 원형 이미지와 세로 배치 */}
        <div className="px-[18px] pb-[24px] flex flex-col items-center">
          {/* 원형 식물 이미지 */}
          <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden mb-[16px] border-4 border-[#E5E7EB]">
            <Image
              src={plant.img_url}
              alt={plant.name}
              fill
              className="object-cover"
            />
          </div>

          {/* 식물 기본 정보 - 세로 배치 */}
          <div className="text-center">
            <h2 className="text-[#023735] font-bold text-[24px] mb-[8px]">
              {plant.name}
            </h2>
            <p className="text-[#4A6741] text-[16px] mb-[12px]">
              {plant.variety}
            </p>
          </div>
        </div>

        {/* 모든 섹션을 수직으로 배열 - 좌측 정렬 */}
        <div className="px-[18px] pb-[20px] space-y-[32px]">

          {/* 식물 정보 섹션 */}
          <div>
            <h3 className="text-[#023735] font-bold text-[18px] mb-[16px]">
              식물 정보
            </h3>
            <div className="space-y-[12px]">
              <div className="rounded-[16px] p-[16px] border border-[#E5E7EB]">
                <div className="space-y-[8px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#4A6741] text-[14px]">입양일</span>
                    <span className="text-[#023735] text-[14px] font-medium">
                      {formatDate(plant.purchase_date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4A6741] text-[14px]">급수 주기</span>
                    <span className="text-[#023735] text-[14px] font-medium">
                      {plant.cycle_value} {plant.cycle_unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4A6741] text-[14px]">햇빛 요구량</span>
                    <span className="text-[#023735] text-[14px] font-medium">
                      {plant.sunlight_needs}
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-[16px] p-[16px] border border-[#E5E7EB]">
                <h4 className="text-[#023735] font-medium text-[14px] mb-[8px]">메모</h4>
                <p className="text-[#4A6741] text-[14px] leading-[1.6]">
                  {plant.memo}
                </p>
              </div>
            </div>
          </div>

          {/* 식물 기록 섹션 - API 연동 대기 중 */}
          {records.length > 0 ? (
            <div>
              <h3 className="text-[#023735] font-bold text-[18px] mb-[16px]">
                최근 활동 기록
              </h3>
              <div className="space-y-[12px]">
                {records.map((record) => {
                  const typeInfo = getRecordTypeInfo(record.emotion, record.water, record.sun);
                  return (
                    <div key={record.id} className="rounded-[16px] p-[16px] border border-[#E5E7EB]">
                      <div className="flex items-start space-x-[12px]">
                        <div className={`w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-[18px] ${typeInfo.color}`}>
                          {typeInfo.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-[4px]">
                            <span className="text-[#023735] font-medium text-[14px]">
                              {record.title}
                            </span>
                            <span className="text-[#6B7280] text-[12px]">
                              {new Date(record.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <p className="text-[#4A6741] text-[12px] leading-[1.4]">
                            {record.content}
                          </p>
                          {record.memory && (
                            <p className="text-[#6B7280] text-[11px] mt-[4px] italic">
                              💫 {record.memory}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-[#023735] font-bold text-[18px] mb-[16px]">
                최근 활동 기록
              </h3>
              <div className="rounded-[16px] p-[16px] border border-[#E5E7EB] text-center">
                <p className="text-[#6B7280] text-[14px]">아직 기록된 활동이 없습니다.</p>
                <p className="text-[#6B7280] text-[12px] mt-[4px]">식물을 돌보고 기록을 남겨보세요!</p>
              </div>
            </div>
          )}

          {/* Memories 섹션 - API 연동 대기 중 */}
          {memories.length > 0 ? (
            <div>
              <h3 className="text-[#023735] font-bold text-[18px] mb-[16px]">
                소중한 추억들
              </h3>
              <div className="space-y-[12px]">
                {memories.map((memory) => (
                  <div key={memory.id} className="rounded-[16px] p-[16px] border border-[#E5E7EB]">
                    <div className="flex items-start space-x-[12px]">
                      {memory.images && memory.images.length > 0 && (
                        <div className="relative w-[60px] h-[60px] rounded-[12px] overflow-hidden flex-shrink-0">
                          <Image
                            src={memory.images[0]}
                            alt={memory.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-[8px]">
                          <h4 className="text-[#023735] font-medium text-[14px]">
                            {memory.title}
                          </h4>
                          <span className="text-[#6B7280] text-[12px]">
                            {new Date(memory.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <p className="text-[#4A6741] text-[12px] leading-[1.4]">
                          {memory.content}
                        </p>
                        {memory.memory && (
                          <p className="text-[#6B7280] text-[11px] mt-[4px] italic">
                            💫 {memory.memory}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-[#023735] font-bold text-[18px] mb-[16px]">
                소중한 추억들
              </h3>
              <div className="rounded-[16px] p-[16px] border border-[#E5E7EB] text-center">
                <p className="text-[#6B7280] text-[14px]">아직 기록된 추억이 없습니다.</p>
                <p className="text-[#6B7280] text-[12px] mt-[4px]">식물과의 특별한 순간을 기록해보세요!</p>
              </div>
            </div>
          )}

          {/* Gallery 섹션 - API 연동 완료 */}
          {gallery.length > 0 ? (
            <div>
              <h3 className="text-[#023735] font-bold text-[18px] mb-[16px]">
                성장 갤러리
              </h3>
              <div className="overflow-x-auto">
                <div className="flex space-x-[12px] pb-[4px]">
                  {gallery.map((image) => (
                    <div key={image.id} className="flex-shrink-0 w-[120px]">
                      <div className="relative w-[120px] h-[120px] rounded-[12px] overflow-hidden border border-[#E5E7EB]">
                        <Image
                          src={image.url}
                          alt="식물 사진"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-[#023735] font-bold text-[18px] mb-[16px]">
                성장 갤러리
              </h3>
              <div className="rounded-[16px] p-[16px] border border-[#E5E7EB] text-center">
                <p className="text-[#6B7280] text-[14px]">아직 업로드된 사진이 없습니다.</p>
                <p className="text-[#6B7280] text-[12px] mt-[4px]">식물의 성장 모습을 기록해보세요!</p>
              </div>
            </div>
          )}

          {/* Upcoming Care 섹션 */}
          <div>
            <h3 className="text-[#023735] font-bold text-[18px] mb-[16px]">
              다가오는 돌봄 일정
            </h3>
            <div className="space-y-[12px]">
              
              {/* 다음 급수일 */}
              <div className="rounded-[16px] p-[16px] border border-[#E5E7EB]">
                <div className="flex items-center space-x-[12px]">
                  <div className="w-[40px] h-[40px] rounded-[12px] bg-blue-100 flex items-center justify-center">
                    <span className="text-[20px]">💧</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#023735] font-medium text-[14px] mb-[4px]">
                      다음 급수일
                    </h4>
                    <p className="text-[#4A6741] text-[12px]">
                      {getNextWateringDate()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#6B7280] text-[10px]">주기</p>
                    <p className="text-[#023735] text-[12px] font-medium">
                      {plant.cycle_value} {plant.cycle_unit}
                    </p>
                  </div>
                </div>
              </div>

              {/* 다음 햇빛 쬐기일 */}
              <div className="rounded-[16px] p-[16px] border border-[#E5E7EB]">
                <div className="flex items-center space-x-[12px]">
                  <div className="w-[40px] h-[40px] rounded-[12px] bg-yellow-100 flex items-center justify-center">
                    <span className="text-[20px]">☀️</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#023735] font-medium text-[14px] mb-[4px]">
                      다음 햇빛 쬐기일
                    </h4>
                    <p className="text-[#4A6741] text-[12px]">
                      {getNextSunlightDate()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#6B7280] text-[10px]">주기</p>
                    <p className="text-[#023735] text-[12px] font-medium">
                      {plant.cycle_value} {plant.cycle_unit}
                    </p>
                  </div>
                </div>
              </div>

              {/* 식물 기본 정보 요약 */}
              <div className="rounded-[16px] p-[16px] border-2 border-[#E0F2FE] bg-[#F0F9FF]">
                <h4 className="text-[#023735] font-medium text-[14px] mb-[8px]">
                  식물 요약 정보
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#4A6741] text-[12px]">
                      등록일: {formatDate(plant.purchase_date)}
                    </p>
                    <p className="text-[#4A6741] text-[12px]">
                      급수 주기: {plant.cycle_value} {plant.cycle_unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#6B7280] text-[10px]">햇빛 요구량</p>
                    <p className="text-[#023735] text-[12px] font-medium">
                      {plant.sunlight_needs}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
