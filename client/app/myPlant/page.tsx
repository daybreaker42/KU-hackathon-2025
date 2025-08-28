"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import BackButton from "@/app/component/common/BackButton"; // BackButton 컴포넌트 추가
import PlantManageButtons from "@/app/component/myPlant/PlantManageButtons"; // 식물 관리 버튼 컴포넌트 추가

// 식물 데이터 타입 정의
interface Plant {
  id: string;
  name: string; // 애칭
  species: string; // 종류
  image: string;
  lastWatered: number; // 며칠 전 물 줌
  lastSunlight: number; // 며칠 전 햇빛 비춤
  lastActivity: string; // 마지막 활동 타입 ('water' | 'sunlight')
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
    lastActivity: "water"
  },
  {
    id: "2", 
    name: "Snake Plant",
    species: "산세베리아",
    image: "/images/plant-normal.png",
    lastWatered: 3,
    lastSunlight: 1,
    lastActivity: "sunlight"
  },
  {
    id: "3",
    name: "Aloe Vera", 
    species: "알로에",
    image: "/images/plant-happy.png",
    lastWatered: 2,
    lastSunlight: 1,
    lastActivity: "sunlight"
  },
  {
    id: "4",
    name: "ZZ Plant",
    species: "자미오쿨카스",
    image: "/images/plant-normal.png", 
    lastWatered: 5,
    lastSunlight: 3,
    lastActivity: "sunlight"
  },
  {
    id: "5",
    name: "Spider Plant",
    species: "접란",
    image: "/images/plant-sick.png",
    lastWatered: 7,
    lastSunlight: 4,
    lastActivity: "sunlight"
  },
  {
    id: "6",
    name: "Monstera",
    species: "몬스테라",
    image: "/images/plant-happy.png",
    lastWatered: 1,
    lastSunlight: 1,
    lastActivity: "water"
  }
];

// 개별 식물 카드 컴포넌트
function PlantCard({ plant }: { plant: Plant }) {
  // 마지막 활동 텍스트 생성
  const getLastActivityText = (plant: Plant): string => {
    if (plant.lastActivity === 'water') {
      return `마지막 활동: ${plant.lastWatered}일 전`;
    } else {
      return `마지막 활동: ${plant.lastSunlight}일 전`;
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
            src={plant.image}
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

export default function MyPlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    // TODO: 실제 API 호출로 교체
    setPlants(mockPlants);
  }, []);

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
