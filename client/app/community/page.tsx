import MyPlantsList from "@/components/MyPlantsList";

export default function CommunityPage() {
  return (
    <div className="p-[18px] bg-white h-full">
      <h1 className="pl-[7px] text-[#023735] font-medium text-[20px]">Community Page</h1>
      {/* 내가 기르는 식물 리스트 */}
      <MyPlantsList />
    </div>
  );
}