"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import BackButton from "@/app/component/common/BackButton";
import { getPlantById, PlantDetailData } from "@/app/api/plantController";

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

// 식물 기록 데이터 타입 (API에 따라 업데이트 필요)
interface PlantRecord {
  id: string;
  type: "water" | "sunlight" | "fertilizer" | "repot";
  date: string;
  notes?: string;
}

// 메모리 데이터 타입 (API에 따라 업데이트 필요)
interface Memory {
  id: string;
  title: string;
  date: string;
  image?: string;
  content: string;
}

// 갤러리 이미지 타입 (API에 따라 업데이트 필요)
interface GalleryImage {
  id: string;
  url: string;
  date: string;
  caption?: string;
}

export default function PlantDetailPage() {
  const params = useParams();
  const plantId = parseInt(params.id as string, 10); // ID를 숫자로 변환
  
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: API 연동 시 실제 데이터로 교체
  const mockRecords: PlantRecord[] = [
    { id: "1", type: "water", date: "2024-08-27", notes: "토양이 건조해서 물을 줬어요" },
    { id: "2", type: "sunlight", date: "2024-08-26", notes: "창가로 옮겨서 햇빛을 쬐였어요" },
    { id: "3", type: "fertilizer", date: "2024-08-20", notes: "영양제를 주었어요" },
  ];
  
  const mockMemories: Memory[] = [
    {
      id: "1",
      title: "첫 만남",
      date: "2024-01-15",
      image: "/images/plant-happy.png",
      content: "드디어 우리 집에 왔어요! 너무 예뻐요."
    },
    {
      id: "2",
      title: "새 잎이 나왔어요",
      date: "2024-02-10",
      content: "작은 새 잎이 돋아났어요. 정말 신기해요!"
    }
  ];
  
  const mockGallery: GalleryImage[] = [
    { id: "1", url: "/images/plant-happy.png", date: "2024-08-27", caption: "오늘의 모습" },
    { id: "2", url: "/images/plant-normal.png", date: "2024-08-20", caption: "일주일 전" },
    { id: "3", url: "/images/plant-happy.png", date: "2024-08-15", caption: "성장 중" },
    { id: "4", url: "/images/plant-normal.png", date: "2024-08-10", caption: "건강한 모습" },
  ];

  const [records, setRecords] = useState<PlantRecord[]>(mockRecords);
  const [memories, setMemories] = useState<Memory[]>(mockMemories);
  const [gallery, setGallery] = useState<GalleryImage[]>(mockGallery);

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

    fetchPlantDetails();
  }, [plantId]);

  // 다음 급수일 계산
  const getNextWateringDate = (): string => {
    if (!plant) return "";
    // API 응답에 lastWatered가 없으므로, cycle_value와 cycle_unit을 사용하여 계산해야 합니다.
    // 현재는 mock 데이터의 lastWatered를 사용하던 로직이므로, API 연동 후 수정 필요
    // 임시로 purchase_date를 기준으로 계산하거나, 별도의 API가 필요합니다.
    return "정보 없음";
  };

  // 다음 햇빛 쬐기일 계산
  const getNextSunlightDate = (): string => {
    if (!plant) return "";
    // API 응답에 lastSunlight가 없으므로, cycle_value와 cycle_unit을 사용하여 계산해야 합니다.
    // 현재는 mock 데이터의 lastSunlight를 사용하던 로직이므로, API 연동 후 수정 필요
    // 임시로 purchase_date를 기준으로 계산하거나, 별도의 API가 필요합니다.
    return "정보 없음";
  };

  // 기록 타입별 아이콘 및 색상
  const getRecordTypeInfo = (type: string) => {
    switch (type) {
      case "water":
        return { icon: "💧", color: "bg-blue-100 text-blue-700", label: "급수" };
      case "sunlight":
        return { icon: "☀️", color: "bg-yellow-100 text-yellow-700", label: "햇빛" };
      case "fertilizer":
        return { icon: "🌱", color: "bg-green-100 text-green-700", label: "영양제" };
      case "repot":
        return { icon: "🪴", color: "bg-brown-100 text-brown-700", label: "분갈이" };
      default:
        return { icon: "📝", color: "bg-gray-100 text-gray-700", label: "기록" };
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
                      {new Date(plant.purchase_date).toLocaleDateString('ko-KR')}
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

          {/* 식물 기록 섹션 */}
          <div>
            <h3 className="text-[#023735] font-bold text-[18px] mb-[16px]">
              최근 활동 기록
            </h3>
            <div className="space-y-[12px]">
              {records.map((record) => {
                const typeInfo = getRecordTypeInfo(record.type);
                return (
                  <div key={record.id} className="rounded-[16px] p-[16px] border border-[#E5E7EB]">
                    <div className="flex items-start space-x-[12px]">
                      <div className={`w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-[18px] ${typeInfo.color}`}>
                        {typeInfo.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-[4px]">
                          <span className="text-[#023735] font-medium text-[14px]">
                            {typeInfo.label}
                          </span>
                          <span className="text-[#6B7280] text-[12px]">
                            {new Date(record.date).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        {record.notes && (
                          <p className="text-[#4A6741] text-[12px] leading-[1.4]">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Memories 섹션 */}
          <div>
            <h3 className="text-[#023735] font-bold text-[18px] mb-[16px]">
              소중한 추억들
            </h3>
            <div className="space-y-[12px]">
              {memories.map((memory) => (
                <div key={memory.id} className="rounded-[16px] p-[16px] border border-[#E5E7EB]">
                  <div className="flex items-start space-x-[12px]">
                    {memory.image && (
                      <div className="relative w-[60px] h-[60px] rounded-[12px] overflow-hidden flex-shrink-0">
                        <Image
                          src={memory.image}
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
                          {new Date(memory.date).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <p className="text-[#4A6741] text-[12px] leading-[1.4]">
                        {memory.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery 섹션 */}
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
                        alt={image.caption || "식물 사진"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-[8px]">
                      <p className="text-[#6B7280] text-[10px]">
                        {new Date(image.date).toLocaleDateString('ko-KR')}
                      </p>
                      {image.caption && (
                        <p className="text-[#4A6741] text-[11px] mt-[2px] truncate">
                          {image.caption}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

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

              {/* 마지막 활동 정보 */}
              <div className="rounded-[16px] p-[16px] border-2 border-[#E0F2FE] bg-[#F0F9FF]">
                <h4 className="text-[#023735] font-medium text-[14px] mb-[8px]">
                  최근 활동
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#4A6741] text-[12px]">
                      {/* API에 lastWatered가 없으므로, 임시로 표시하지 않거나 다른 방식으로 처리 */}
                      마지막 급수: 정보 없음
                    </p>
                    <p className="text-[#4A6741] text-[12px]">
                      {/* API에 lastSunlight가 없으므로, 임시로 표시하지 않거나 다른 방식으로 처리 */}
                      마지막 햇빛: 정보 없음
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#6B7280] text-[10px]">최근 활동</p>
                    <p className="text-[#023735] text-[12px] font-medium">
                      {/* API에 lastActivity가 없으므로, 임시로 표시하지 않거나 다른 방식으로 처리 */}
                      정보 없음
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
