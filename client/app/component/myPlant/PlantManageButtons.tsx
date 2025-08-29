import Link from 'next/link';

interface PlantManageButtonsProps {
  isDeleteMode: boolean;
  selectedPlantIds: number[];
  onToggleDeleteMode: () => void;
  onConfirmDelete: () => void;
  isDeleting?: boolean;
}

export default function PlantManageButtons({
  isDeleteMode,
  selectedPlantIds,
  onToggleDeleteMode,
  onConfirmDelete,
  isDeleting = false
}: PlantManageButtonsProps) {
  return (
    <div className="fixed bottom-[20px] z-10 w-[393px] left-1/2 -translate-x-1/2 px-[24px] pointer-events-none">
      <div className="flex gap-3 ml-auto w-fit pointer-events-auto">
        {/* 삭제 모드가 아닐 때 - 식물 추가 버튼 */}
        {!isDeleteMode && (
          <Link
            href="/addPlant"
            className="bg-[#42CA71] text-white font-medium py-3 px-5 rounded-full shadow-lg hover:bg-[#369F5C] transition-colors flex items-center gap-1"
          >
            <span>+</span>
            <span>식물 추가</span>
          </Link>
        )}

        {/* 삭제 모드 토글 버튼 */}
        {/* <button
          onClick={onToggleDeleteMode}
          className={`text-white font-medium py-3 px-5 rounded-full shadow-lg transition-colors flex items-center gap-1 ${isDeleteMode
              ? 'bg-gray-500 hover:bg-gray-600'
              : 'bg-[#E74C3C] hover:bg-[#C0392B]'
            }`}
        >
          <span>{isDeleteMode ? '✕' : '−'}</span>
          <span>{isDeleteMode ? '취소' : '삭제'}</span>
        </button> */}

        {/* 삭제 확인 버튼 - 식물이 선택되었을 때만 표시 */}
        {/* {isDeleteMode && selectedPlantIds.length > 0 && (
          <button
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className={`text-white font-medium py-3 px-5 rounded-full shadow-lg transition-colors flex items-center gap-1 ${isDeleting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#DC2626] hover:bg-[#B91C1C] animate-pulse'
              }`}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>삭제 중...</span>
              </>
            ) : (
              <>
                <span>🗑️</span>
                <span>{selectedPlantIds.length}개 삭제</span>
              </>
            )}
          </button>
        )} */}
      </div>
    </div>
  );
}
