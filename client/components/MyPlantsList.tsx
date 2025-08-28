'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// 식물 데이터 타입 정의
interface Plant {
  id: number;
  name: string;
  imageUrl: string;
}

// Mock 데이터
const mockPlants: Plant[] = [
  {
    id: 1,
    name: '몬스테라',
    imageUrl: '/plant-happy.png'
  },
  {
    id: 2,
    name: '고무나무',
    imageUrl: '/plant-normal.png'
  },
  {
    id: 3,
    name: '스킨답서스',
    imageUrl: '/plant-sick.png'
  }
];

export default function MyPlantsList() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // API에서 내 식물 리스트를 가져오는 함수
    const fetchMyPlants = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출 대신 mock 데이터 사용
        // const response = await fetch('/api/my-plants');
        // const data = await response.json();
        
        // 네트워크 지연 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock 데이터 설정
        setPlants(mockPlants);
        setError(null);
      } catch (err) {
        setError('식물 리스트를 불러오는데 실패했습니다.');
        console.error('Error fetching plants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPlants();
  }, []);

  // 로딩 상태
  if (loading) {
    return (
      <div className="mt-[10px]">
        <h2 className="pl-[7px] text-[#023735] font-medium text-[18px] mb-[15px]">
          내가 기르는 식물
        </h2>
        <div className="flex gap-[15px] overflow-x-auto">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex flex-col w-[100px] animate-pulse">
              <div className="w-[100px] h-[100px] bg-gray-300 rounded"></div>
              <div className="mt-[10px] h-[20px] bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="mt-[10px]">
        <h2 className="pl-[7px] text-[#023735] font-medium text-[18px] mb-[15px]">
          내가 기르는 식물
        </h2>
        <div className="text-red-500 text-center py-[20px]">
          {error}
        </div>
      </div>
    );
  }

  // 식물이 없는 경우
  if (plants.length === 0) {
    return (
      <div className="mt-[10px]">
        <h2 className="pl-[7px] text-[#023735] font-medium text-[18px] mb-[15px]">
          내가 키우는 식물들
        </h2>
        <div className="text-gray-500 text-center py-[40px]">
          <p>아직 등록된 식물이 없습니다.</p>
          <p className="text-sm mt-[5px]">첫 번째 식물을 추가해보세요!</p>
        </div>
      </div>
    );
  }


  return (
    <div className="mt-[10px]">
      <h2 className="pl-[7px] text-[#023735] font-medium text-[18px] mb-[15px]">
        내가 키우는 식물들
      </h2>
      <div className="flex gap-[15px] overflow-x-auto pb-[10px]">
        {plants.map((plant) => (
          <div key={plant.id} className="flex flex-col w-[100px] flex-shrink-0">
            <div className="relative">
              <Image 
                src={plant.imageUrl} 
                alt={plant.name}
                width={100}
                height={100}
                className="w-[100px] h-[100px] object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  // 이미지 로드 실패 시 기본 이미지 표시
                  const target = e.target as HTMLImageElement;
                  target.src = '/plant-normal.png';
                }}
              />
            </div>
            <div className="mt-[10px] text-center">
              <p className="text-[14px] font-medium text-[#023735] truncate">
                {plant.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
