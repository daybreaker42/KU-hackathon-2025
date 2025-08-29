'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image'; // Image 컴포넌트 import
import Link from 'next/link'; // Link import 추가
// API 및 타입 import
// import { autoLogin, isAuthenticated } from '@/app/api/authController';
import { getMyPlants } from '@/app/api/communityController';

/*
=======================================
=== 개발용 Mock 데이터 (주석 처리) ===
=======================================

아래는 개발 단계에서 사용했던 Mock 데이터입니다.
실제 서버 연동 후 제거 예정입니다.

// Mock Plant 타입 (기존)
interface MockPlant {
  id: number;
  name: string;
  imageUrl: string;
}

// Mock 데이터
const mockPlants: MockPlant[] = [
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
*/

// API로부터 받아오는 식물 데이터 타입 정의
interface Plant {
  id: number;
  name: string;
  variety: string;
  img_url: string;
  createdAt: string;
}

// 기본 이미지 경로 상수
const DEFAULT_PLANT_IMAGE = '/images/plant-normal.png';

// 이미지 URL 검증 및 기본 이미지 반환 함수
const getValidImageUrl = (imageUrl: string | null | undefined): string => {
  // console.log('🖼️ 이미지 URL 검증 시작:', imageUrl);
  
  // 이미지 URL이 없거나 빈 문자열인 경우 기본 이미지 반환
  if (!imageUrl || imageUrl.trim() === '') {
    // console.log('❌ 이미지 URL이 없어 기본 이미지 사용:', DEFAULT_PLANT_IMAGE);
    return DEFAULT_PLANT_IMAGE;
  }

  // 상대 경로인 경우 그대로 사용
  if (imageUrl.startsWith('/')) {
    // console.log('✅ 상대 경로 이미지 URL 사용:', imageUrl);
    return imageUrl;
  }

  // HTTP/HTTPS URL인 경우 그대로 사용
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // console.log('✅ 외부 URL 이미지 사용:', imageUrl);
    return imageUrl;
  }

  // 기타 경우 기본 이미지 반환
  // console.log('❌ 유효하지 않은 이미지 URL, 기본 이미지 사용:', imageUrl, '→', DEFAULT_PLANT_IMAGE);
  return DEFAULT_PLANT_IMAGE;
};

export default function MyPlantsList() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set()); // 이미지 에러 추적

  // 이미지 에러 핸들러
  const handleImageError = (plantId: number,) => {
    // console.log('❌ 이미지 로드 실패 처리:', { plantId, originalUrl });
    setImageErrors(prev => new Set(prev).add(plantId));
  };

  // 이미지 로드 성공 핸들러  
  const handleImageLoad = (plantId: number) => {
    // console.log('✅ 이미지 로드 성공:', { plantId, url });
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(plantId);
      return newSet;
    });
  };

  useEffect(() => {
    // 실제 서버에서 내 식물 리스트를 가져오는 함수
    const fetchMyPlants = async () => {
      try {
        setLoading(true);
        setError(null);

        // 인증 확인 및 자동 로그인 (개발용)
        // if (!isAuthenticated()) {
        //   autoLogin(); // 개발용 자동 로그인
        // }

        // 실제 API 호출
        const plantsData = await getMyPlants();
        // console.log('🌱 API에서 받아온 전체 응답:', plantsData);
        // console.log('🌱 식물 개수:', plantsData.length);
        // plantsData.forEach((plant, index) => {
        //   console.log(`🌱 식물 ${index + 1}:`, {
        //     id: plant.id,
        //     name: plant.name,
        //     variety: plant.variety,
        //     img_url: plant.img_url,
        //     img_url_type: typeof plant.img_url,
        //     img_url_length: plant.img_url?.length || 0,
        //     valid_url: getValidImageUrl(plant.img_url)
        //   });
        // });
        setPlants(plantsData);
      } catch (err) {
        console.error('식물 리스트 조회 중 오류:', err);
        setError('식물 리스트를 불러오는데 실패했습니다.');

        /*
        ===================================
        === 개발용 Fallback (주석 처리) ===
        ===================================
        
        실제 서버 연결 실패 시 Mock 데이터 사용하는 부분입니다.
        프로덕션에서는 제거 예정입니다.
        
        // 서버 연결 실패 시 Mock 데이터로 fallback
        // console.log('Mock 데이터로 fallback');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPlants(mockPlants.map(mock => ({
          id: mock.id,
          name: mock.name,
          variety: mock.name,
          img_url: mock.imageUrl,
          cycle_type: 'WEEKLY',
          cycle_value: '7',
          cycle_unit: '일',
          sunlight_needs: '간접광선',
          purchase_date: new Date().toISOString(),
          purchase_location: '화원',
          memo: '',
          author: { id: 1, name: '사용자', email: 'user@example.com' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })));
        setError(null);
        */

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
          <Link
            key={plant.id}
            href={`/community/category/plant?variety=${plant.variety}`} // 동적 URL 생성
            className="flex flex-col w-[100px] flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              {/* 이미지 에러가 발생한 경우 기본 이미지 표시 */}
              <Image
                src={imageErrors.has(plant.id) ? DEFAULT_PLANT_IMAGE : getValidImageUrl(plant.img_url)}
                alt={plant.name}
                width={100}
                height={100}
                className="w-[100px] h-[100px] object-cover rounded-lg"
                onError={() => handleImageError(plant.id)}
                onLoadingComplete={() => handleImageLoad(plant.id)} // onLoad 대신 onLoadingComplete 사용
              />
            </div>
            <div className="mt-[10px] text-center">
              <p className="text-[14px] font-medium text-[#023735] truncate">
                {plant.name || plant.variety}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
