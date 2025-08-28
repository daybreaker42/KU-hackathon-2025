import Image from "next/image";
import Link from "next/link";
import { Plant, getLastActivityText } from "@/types/myPlant";

// 개별 식물 카드 컴포넌트
export default function PlantCard({ plant }: { plant: Plant }) {
  return (
    <Link 
      href={`/myPlant/${plant.id}`}
      className="block"
    >
      <div>
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

// 타입도 export (다른 컴포넌트에서 사용 가능)
export type { Plant } from "@/types/myPlant";
