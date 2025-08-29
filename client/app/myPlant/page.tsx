"use client";

import { useState, useEffect } from "react";
import BackButton from "@/app/component/common/BackButton";
import PlantManageButtons from "@/app/component/myPlant/PlantManageButtons";
import { PlantGrid, Plant } from "@/components/myPlant";
import { getMyPlants, ApiPlantData } from "@/app/api/homeController";
import { deletePlants } from "@/app/api/plantController";

export default function MyPlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  // 삭제 모드 관련 상태
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedPlantIds, setSelectedPlantIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // 삭제 모드 토글
  const handleToggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedPlantIds([]); // 삭제 모드 변경시 선택 초기화
  };

  // 식물 선택/선택 해제
  const handleToggleSelect = (plantId: number) => {
    setSelectedPlantIds(prev =>
      prev.includes(plantId)
        ? prev.filter(id => id !== plantId) // 선택 해제
        : [...prev, plantId] // 선택 추가
    );
  };

  // 삭제 확인 및 실행
  const handleConfirmDelete = async () => {
    if (selectedPlantIds.length === 0) return;

    const selectedPlantNames = plants
      .filter(plant => selectedPlantIds.includes(plant.id))
      .map(plant => plant.name)
      .join(', ');

    // 첫 번째 확인: 삭제할 식물 목록 표시
    const firstConfirm = window.confirm(
      `다음 식물을 삭제하시겠습니까?\n\n${selectedPlantNames}\n\n총 ${selectedPlantIds.length}개의 식물이 영구적으로 삭제됩니다.`
    );

    if (!firstConfirm) return;

    // 두 번째 확인: 최종 확인
    const finalConfirm = window.confirm(
      `정말로 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다. 식물과 관련된 모든 데이터가 삭제됩니다.`
    );

    if (!finalConfirm) return;

    try {
      setIsDeleting(true);

      // 삭제 실행
      const result = await deletePlants(selectedPlantIds);

      if (result.success.length > 0) {
        // 성공적으로 삭제된 식물들을 UI에서 제거
        setPlants(prev => prev.filter(plant => !result.success.includes(plant.id)));

        // 성공 메시지
        const successMessage = result.failed.length === 0
          ? `${result.success.length}개의 식물이 성공적으로 삭제되었습니다.`
          : `${result.success.length}개의 식물이 삭제되었습니다. ${result.failed.length}개는 삭제에 실패했습니다.`;

        alert(successMessage);
      }

      if (result.failed.length > 0 && result.success.length === 0) {
        // 모든 삭제가 실패한 경우
        alert('식물 삭제에 실패했습니다. 다시 시도해주세요.');
      }

      // 삭제 모드 초기화
      setSelectedPlantIds([]);
      setIsDeleteMode(false);

    } catch (error) {
      console.error('Delete operation failed:', error);
      alert('식물 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsDeleting(false);
    }
  };

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
        <PlantManageButtons
          isDeleteMode={false}
          selectedPlantIds={[]}
          onToggleDeleteMode={() => { }}
          onConfirmDelete={() => { }}
          isDeleting={false}
        />
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
          {/* 삭제 모드 표시 */}
          {isDeleteMode && (
            <span className="ml-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
              삭제 모드
            </span>
          )}
        </div>

        {/* 식물 갤러리 그리드 및 빈 상태 */}
        <PlantGrid
          plants={plants}
          loading={false}
          isDeleteMode={isDeleteMode}
          selectedPlantIds={selectedPlantIds}
          onToggleSelect={handleToggleSelect}
        />
      </div>

      {/* 식물 관리 버튼들 (추가/삭제) */}
      <PlantManageButtons
        isDeleteMode={isDeleteMode}
        selectedPlantIds={selectedPlantIds}
        onToggleDeleteMode={handleToggleDeleteMode}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
