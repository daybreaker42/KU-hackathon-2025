// 식물 카드 로딩 스켈레톤 컴포넌트
export default function PlantCardSkeleton() {
  return (
    <div>
      <div className="relative w-full aspect-square mb-[12px] overflow-hidden rounded-[16px] bg-[#E6DFD1] animate-pulse"></div>
      <div className="space-y-[4px]">
        <div className="h-[16px] bg-[#E6DFD1] rounded w-[70%] animate-pulse"></div>
        <div className="h-[12px] bg-[#E6DFD1] rounded w-[50%] animate-pulse"></div>
      </div>
    </div>
  );
}
