import { useEffect } from "react";

export default function CommunityPage() {

  useEffect(() => {
    // 1. 내 식물 리스트 가져오기

  }, []);
  return (
    <div className="p-[18px] bg-white h-full">
      <h1 className="pl-[7px] text-[#023735] font-medium text-[20px]">Community Page</h1>
      {/* 내가 기르는 식물 리스트 */}
      <div className="mt-[10px]">
        <div className="flex flex-col w-[100px]">
          <img src="" alt="" className="w-[100px] h-[100px] object-cover" />
          <span className="mt-[10px] text-center">dd</span>
        </div>
      </div>
    </div>
  );
}