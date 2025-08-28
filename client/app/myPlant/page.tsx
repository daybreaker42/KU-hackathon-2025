"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import BackButton from "@/app/component/common/BackButton"; // BackButton 컴포넌트 추가
import PlantManageButtons from "@/app/component/myPlant/PlantManageButtons"; // 식물 관리 버튼 컴포넌트 추가
import { getMyPlants, ApiPlantData } from "@/app/api/homeController";

// 식물 데이터 타입 정의
interface Plant {
  id: number;
  name: string; // 애칭
  variety: string; // 종류
  img_url: string;
  daysUntilWatering: number; // 물 주기까지 남은 일수
  recentEmotion: string; // 최근 감정
}

// 개별 식물 카드 컴포넌트
function PlantCard({ plant }: { plant: Plant }) {
  // 마지막 활동 텍스트 생성
  const getLastActivityText = (plant: Plant): string => {
    if (plant.daysUntilWatering === 0) {
      return `오늘 물 주기`;
    } else if (plant.daysUntilWatering > 0) {
      return `물 주기까지 ${plant.daysUntilWatering}일 남음`;
    } else {
      return `물 준지 ${Math.abs(plant.daysUntilWatering)}일 지남`;
    }
  };

  const getEmotionImage = (emotion: string): string => {
    switch (emotion) {
      case '행복':
        return '/images/plant-happy.png';
      case '보통':
        return '/images/plant-normal.png';
      case '슬픔':
        return '/images/plant-sad.png';
      case '아픔':
        return '/images/plant-sick.png';
      default:
        return '/images/plant-normal.png'; // 기본 이미지
    }
  };

  return (
    <Link 
      href={`/myPlant/${plant.id}`} // 경로를 myPlant로 수정
      className="block"
    >
      <div> {/* background, shadow, padding 제거 */}
        {/* 식물 이미지 */}
        <div className="relative w-full aspect-square mb-[12px] overflow-hidden rounded-[16px] bg-transparent">
          <Image
            src={plant.img_url || '/images/plant-happy.png'}
            alt={plant.name}
            fill
            className="object-cover"
          />
        </div>
        
        {/* 식물 정보 */}
        <div className="space-y-[4px]">
          <h3 className="font-bold text-[16px] text-[#023735] truncate">
            {plant.name}
          </h3>
          <p className="text-[#4A6741] text-[12px] truncate">
            {getLastActivityText(plant)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function PlantCardSkeleton() {
  return (
    <div>
      <div className="relative w-full aspect-square mb-[12px] overflow-hidden rounded-[16px] bg-[#E6DFD1] animate-pulse"></div>
      <div className="space-y-[4px]">
        <div className="h-[16px] bg-[#E6DFD1] rounded w-[70%] animate-pulse"></div>
        <div className="h-[12px] bg-[#E6DFD1] rounded w-[50%] animate-pulse"></div>
      </div>
    </div>
  );
}

export default function MyPlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        const apiPlants: ApiPlantData[] = await getMyPlants();
        // console.log(JSON.stringify(apiPlants));
        const mappedPlants: Plant[] = apiPlants.map(apiPlant => ({
          id: apiPlant.id,
          name: apiPlant.name,
          variety: apiPlant.variety,
          img_url: apiPlant.img_url,
          daysUntilWatering: apiPlant.daysUntilWatering,
          recentEmotion: apiPlant.recentEmotion,
        }));
        setPlants(mappedPlants);
      } catch (error) {
        console.error("Failed to fetch plants:", error);
        setPlants([]); // 에러 발생 시 빈 배열로 설정
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-[18px] pb-[20px]">
          {/* 헤더 스켈레톤 */}
          <div className="flex items-center mb-[24px]">
            <div className="w-[24px] h-[24px] bg-[#E6DFD1] rounded-full animate-pulse mr-[12px]"></div>
            <div className="h-[24px] bg-[#E6DFD1] rounded w-[150px] animate-pulse"></div>
          </div>

          {/* 식물 갤러리 스켈레톤 그리드 */}
          <div className="grid grid-cols-2 gap-[16px]">
            {Array.from({ length: 6 }).map((_, index) => (
              <PlantCardSkeleton key={index} />
            ))}
          </div>
        </div>
        <PlantManageButtons />
      </div>
    );
  }

  // console.log(JSON.stringify(plants.length));
  // console.log(JSON.stringify(plants[0]));
  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] overflow-hidden">
      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-[18px] pb-[20px]"> {/* Footer 삭제로 인한 padding 조정 */}
        {/* 헤더 - BackButton과 제목 */}
        <div className="flex items-center mb-[24px]">
          <BackButton className="mr-[12px]" />
          <h1 className="text-[#023735] font-bold text-[24px]">
            My Plants
          </h1>
        </div>

        {/* 식물 갤러리 그리드 */}
        <div className="grid grid-cols-2 gap-[16px]">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>

        {/* 식물이 없을 때 표시할 빈 상태 */}
        {plants.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <Image
              src="/images/plant-sad.png"
              alt="No plants"
              width={120}
              height={120}
              className="mb-[16px] opacity-50"
            />
            <p className="text-[#4A6741] text-[16px] mb-[8px]">
              아직 등록된 식물이 없어요
            </p>
            <p className="text-[#4A6741] text-[14px] opacity-70">
              새로운 식물을 추가해보세요!
            </p>
            <Link 
              href="/addPlant"
              className="mt-[16px] bg-[#4A6741] text-white px-[24px] py-[12px] rounded-[12px] text-[14px] font-medium"
            >
              식물 추가하기
            </Link>
          </div>
        )}
      </div>

      {/* 식물 관리 버튼들 (추가/삭제) */}
      <PlantManageButtons />
    </div>
  );
}
