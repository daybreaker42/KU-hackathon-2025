'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getMyPlants } from '@/app/api/communityController'; // API 함수 import

// 식물 데이터 타입 정의 (API 응답에 맞게 수정)
interface MyPlant {
  id: number;
  name: string;
  variety: string;
  img_url: string;
  createdAt: string;
}

// 기본 이미지 경로 상수
const DEFAULT_PLANT_IMAGE = '/images/plant-normal.png';

export default function MyPlantsList() {
  const [plants, setPlants] = useState<MyPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // 라우터 인스턴스 생성

  // 식물 클릭 핸들러 추가
  const handlePlantClick = (plantId: number) => {
    // 식물별 커뮤니티 페이지로 이동
    router.push(`/community/category/plant?plantId=${plantId}`);
  };

  // 이미지 URL 검증 및 기본 이미지 반환 함수
  const getValidImageUrl = (imageUrl: string | null | undefined): string => {
    // 이미지 URL이 없거나 빈 문자열인 경우 기본 이미지 반환
    if (!imageUrl || imageUrl.trim() === '') {
      return DEFAULT_PLANT_IMAGE;
    }

    // 상대 경로인 경우 그대로 사용
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }

    // HTTP/HTTPS URL인 경우 그대로 사용
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // 기타 경우 기본 이미지 반환
    return DEFAULT_PLANT_IMAGE;
  };

  useEffect(() => {
    // API에서 내 식물 리스트를 가져오는 함수
    const fetchMyPlants = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출
        const plantsData = await getMyPlants();
        setPlants(plantsData);
        setError(null);

        console.log('내 식물 리스트 조회 성공:', plantsData);
      } catch (err) {
        setError('식물 리스트를 불러오는데 실패했습니다.');
        console.error('Error fetching plants:', err);

        // API 실패 시 빈 배열로 설정 (mock 데이터 대신)
        setPlants([]);
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
              <div className="w-[100px] h-[100px] bg-[#F0ECE0] rounded-lg border border-[#E8E3D5]"></div> {/* 새 배경에 맞게 색상 조정 */}
              <div className="mt-[10px] h-[20px] bg-[#E6DFD1] rounded w-[80%] mx-auto"></div> {/* 더 세밀한 스켈레톤 디자인 */}
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
          <button
            key={plant.id}
            onClick={() => handlePlantClick(plant.id)} // 클릭 이벤트 핸들러 연결
            className="flex flex-col w-[100px] flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <Image 
                src={getValidImageUrl(plant.img_url)} // 검증된 이미지 URL 사용
                alt={plant.name}
                width={100}
                height={100}
                className="w-[100px] h-[100px] object-cover rounded-lg"
                onError={(e) => {
                  // 이미지 로드 실패 시 기본 이미지 표시
                  const target = e.target as HTMLImageElement;
                  target.src = DEFAULT_PLANT_IMAGE;
                }}
              />
            </div>
            <div className="mt-[10px] text-center">
              <p className="text-[14px] font-medium text-[#023735] truncate">
                {plant.name}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
