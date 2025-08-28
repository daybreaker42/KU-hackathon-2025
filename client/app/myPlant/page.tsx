"use client";

import { useState, useEffect } from "react";
import BackButton from "@/app/component/common/BackButton";
import PlantManageButtons from "@/app/component/myPlant/PlantManageButtons";
import { PlantGrid, Plant } from "@/components/myPlant";
import { getMyPlants, ApiPlantData } from "@/app/api/homeController";

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
          <PlantGrid plants={[]} loading={true} />
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

        {/* 식물 갤러리 그리드 및 빈 상태 */}
        <PlantGrid plants={plants} loading={false} />
      </div>

      {/* 식물 관리 버튼들 (추가/삭제) */}
      <PlantManageButtons />
    </div>
  );
}
