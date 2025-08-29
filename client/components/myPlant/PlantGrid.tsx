import Image from "next/image";
import Link from "next/link";
import PlantCard, { Plant } from "./PlantCard";
import PlantCardSkeleton from "./PlantCardSkeleton";

interface PlantGridProps {
  plants: Plant[];
  loading: boolean;
  isDeleteMode?: boolean;
  selectedPlantIds?: number[];
  onToggleSelect?: (plantId: number) => void;
}

// 식물 그리드 컴포넌트 (빈 상태 포함)
export default function PlantGrid({
  plants,
  loading,
  isDeleteMode = false,
  selectedPlantIds = [],
  onToggleSelect
}: PlantGridProps) {
  // 로딩 상태
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-[16px]">
        {Array.from({ length: 6 }).map((_, index) => (
          <PlantCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // 식물이 없을 때 빈 상태
  if (plants.length === 0) {
    return (
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
    );
  }

  // 식물 목록 그리드
  return (
    <div className="grid grid-cols-2 gap-[16px]">
      {plants.map((plant) => (
        <PlantCard
          key={plant.id}
          plant={plant}
          isDeleteMode={isDeleteMode}
          isSelected={selectedPlantIds.includes(plant.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
