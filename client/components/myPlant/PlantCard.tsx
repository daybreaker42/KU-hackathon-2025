import Image from "next/image";
import Link from "next/link";
import { Plant, getLastActivityText } from "@/types/myPlant";

interface PlantCardProps {
  plant: Plant;
  isDeleteMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (plantId: number) => void;
}

export default function PlantCard({
  plant,
  isDeleteMode = false,
  isSelected = false,
  onToggleSelect
}: PlantCardProps) {

  const cardContent = (
    <div className="relative">
      {/* 선택 표시 오버레이 - 삭제 모드일 때만 표시 */}
      {isDeleteMode && (
        <div className={`absolute inset-0 z-10 rounded-[16px] border-4 transition-all duration-200 ${isSelected
            ? 'border-red-500 bg-red-500 bg-opacity-20'
            : 'border-gray-300 border-opacity-50 hover:border-red-300'
          }`}>
          {/* 선택 체크박스 */}
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center">
            {isSelected ? (
              <span className="text-red-500 text-sm font-bold">✓</span>
            ) : (
              <span className="text-gray-400 text-xs">○</span>
            )}
          </div>
        </div>
      )}

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
        <h3 className={`font-bold text-[16px] truncate ${isDeleteMode && isSelected ? 'text-red-600' : 'text-[#023735]'
          }`}>
          {plant.name}
        </h3>
        <p className={`text-[12px] truncate ${isDeleteMode && isSelected ? 'text-red-400' : 'text-[#4A6741]'
          }`}>
          {getLastActivityText(plant)}
        </p>
      </div>
    </div>
  );

  // 삭제 모드일 때는 클릭 가능한 div, 아닐 때는 Link
  if (isDeleteMode) {
    return (
      <div
        onClick={() => onToggleSelect?.(plant.id)}
        className={`block cursor-pointer transition-all duration-200 ${isSelected
            ? 'transform scale-95 ring-4 ring-red-400 ring-opacity-75'
            : 'hover:transform hover:scale-105'
          }`}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/myPlant/${plant.id}`}
      className="block hover:transform hover:scale-105 transition-transform duration-200"
    >
      {cardContent}
    </Link>
  );
}

// 타입도 export (다른 컴포넌트에서 사용 가능)
export type { Plant } from "@/types/myPlant";
