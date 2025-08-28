import Link from 'next/link';

export default function PlantManageButtons() {
  return (
    <div className="fixed bottom-[20px] z-10 w-[393px] left-1/2 -translate-x-1/2 px-[24px] pointer-events-none">
      <div className="flex gap-3 ml-auto w-fit pointer-events-auto">
        {/* 식물 추가 버튼 */}
        <Link
          href="/addPlant"
          className="bg-[#42CA71] text-white font-medium py-3 px-5 rounded-full shadow-lg hover:bg-[#369F5C] transition-colors flex items-center gap-1"
        >
          <span>+</span>
          <span>식물 추가</span>
        </Link>
        
        {/* 식물 삭제 버튼 */}
        <button
          onClick={() => {
            // TODO: 식물 삭제 모드 토글 기능 구현
            console.log('식물 삭제 모드 토글');
          }}
          className="bg-[#E74C3C] text-white font-medium py-3 px-5 rounded-full shadow-lg hover:bg-[#C0392B] transition-colors flex items-center gap-1"
        >
          <span>−</span>
          <span>삭제</span>
        </button>
      </div>
    </div>
  );
}
