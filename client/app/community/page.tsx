import MyPlantsList from "@/components/community/MyPlantsList";
import CommunitySection from "@/components/community/CommunitySection";

export default function CommunityPage() {
  return (
    <div className="p-[18px] bg-white h-full min-h-screen">
      <h1 className="pl-[7px] text-[#023735] font-medium text-[20px]">Community Page</h1>

      {/* 내가 기르는 식물 리스트 */}
      <MyPlantsList />

      {/* 커뮤니티 섹션들 */}
      <div className="mt-[30px] space-y-[20px]">
        {/* 질문/토론 섹션 */}
        <CommunitySection
          title="이거 어떻게 키워요?"
          category="question"
        />

        {/* 사진 예시 섹션 */}
        <CommunitySection
          title="사진 예시"
          category="photo"
        />

        {/* 일상 섹션 */}
        <CommunitySection
          title="일상"
          category="daily"
        />

        {/* 자유 주제 섹션 */}
        <CommunitySection
          title="자유 주제"
          category="free"
        />
      </div>
    </div>
  );
}