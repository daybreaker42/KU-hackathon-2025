"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import BackButton from "@/app/component/common/BackButton";

// 식물 데이터 타입 정의
interface Plant {
  id: string;
  name: string; // 애칭
  species: string; // 종류
  image: string;
  lastWatered: number; // 며칠 전 물 줌
  lastSunlight: number; // 며칠 전 햇빛 비춤
  lastActivity: string; // 마지막 활동 타입 ('water' | 'sunlight')
  wateringInterval: number; // 급수 주기 (일)
  sunlightInterval: number; // 햇빛 주기 (일)
  adoptionDate: string; // 입양일
  description: string; // 식물 설명
}

// 식물 기록 데이터 타입
interface PlantRecord {
  id: string;
  type: "water" | "sunlight" | "fertilizer" | "repot";
  date: string;
  notes?: string;
}

// 메모리 데이터 타입
interface Memory {
  id: string;
  title: string;
  date: string;
  image?: string;
  content: string;
}

// 갤러리 이미지 타입
interface GalleryImage {
  id: string;
  url: string;
  date: string;
  caption?: string;
}

// TODO: API 연동 시 실제 데이터로 교체
const mockPlants: Plant[] = [
  {
    id: "1",
    name: "Peace Lily",
    species: "스파티필럼",
    image: "/images/plant-happy.png",
    lastWatered: 1,
    lastSunlight: 2,
    lastActivity: "water",
    wateringInterval: 7,
    sunlightInterval: 3,
    adoptionDate: "2024-01-15",
    description: "평화로운 아이예요. 물을 좋아하고 간접광을 선호합니다."
  },
  {
    id: "2", 
    name: "Snake Plant",
    species: "산세베리아",
    image: "/images/plant-normal.png",
    lastWatered: 3,
    lastSunlight: 1,
    lastActivity: "sunlight",
    wateringInterval: 14,
    sunlightInterval: 7,
    adoptionDate: "2024-02-20",
    description: "매우 강한 생명력을 가진 아이예요. 물을 자주 주지 않아도 괜찮습니다."
  },
  {
    id: "3",
    name: "Aloe Vera", 
    species: "알로에",
    image: "/images/plant-happy.png",
    lastWatered: 2,
    lastSunlight: 1,
    lastActivity: "sunlight",
    wateringInterval: 10,
    sunlightInterval: 2,
    adoptionDate: "2024-03-10",
    description: "치유의 힘을 가진 아이예요. 햇빛을 좋아하고 건조한 환경을 선호합니다."
  }
];

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

export default function PlantDetailPage() {
  const params = useParams();
  const plantId = params.id as string;
  
  const [plant, setPlant] = useState<Plant | null>(null);
  const [records, setRecords] = useState<PlantRecord[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  useEffect(() => {
    // TODO: 실제 API 호출로 교체
    const foundPlant = mockPlants.find(p => p.id === plantId);
    setPlant(foundPlant || null);
    setRecords(mockRecords);
    setMemories(mockMemories);
    setGallery(mockGallery);
  }, [plantId]);

  // 다음 급수일 계산
  const getNextWateringDate = (): string => {
    if (!plant) return "";
    const lastWatered = new Date();
    lastWatered.setDate(lastWatered.getDate() - plant.lastWatered);
    const nextWatering = new Date(lastWatered);
    nextWatering.setDate(nextWatering.getDate() + plant.wateringInterval);
    return nextWatering.toLocaleDateString('ko-KR');
  };

  // 다음 햇빛 쬐기일 계산
  const getNextSunlightDate = (): string => {
    if (!plant) return "";
    const lastSunlight = new Date();
    lastSunlight.setDate(lastSunlight.getDate() - plant.lastSunlight);
    const nextSunlight = new Date(lastSunlight);
    nextSunlight.setDate(nextSunlight.getDate() + plant.sunlightInterval);
    return nextSunlight.toLocaleDateString('ko-KR');
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
              src={plant.image}
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
              {plant.species}
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
                      {new Date(plant.adoptionDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4A6741] text-[14px]">급수 주기</span>
                    <span className="text-[#023735] text-[14px] font-medium">
                      {plant.wateringInterval}일마다
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#4A6741] text-[14px]">햇빛 주기</span>
                    <span className="text-[#023735] text-[14px] font-medium">
                      {plant.sunlightInterval}일마다
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-[16px] p-[16px] border border-[#E5E7EB]">
                <h4 className="text-[#023735] font-medium text-[14px] mb-[8px]">설명</h4>
                <p className="text-[#4A6741] text-[14px] leading-[1.6]">
                  {plant.description}
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
                      {plant.wateringInterval}일
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
                      {plant.sunlightInterval}일
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
                      마지막 급수: {plant.lastWatered}일 전
                    </p>
                    <p className="text-[#4A6741] text-[12px]">
                      마지막 햇빛: {plant.lastSunlight}일 전
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#6B7280] text-[10px]">최근 활동</p>
                    <p className="text-[#023735] text-[12px] font-medium">
                      {plant.lastActivity === 'water' ? '급수' : '햇빛'}
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
