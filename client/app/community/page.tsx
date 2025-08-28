import MyPlantsList from "@/app/component/community/MyPlantsList";
import CommunitySection from "@/app/component/community/CommunitySection";
import Footer from "@/app/component/common/footer";
import WritePostButton from "@/app/component/community/WritePostButton";
// Auth 및 Community API 컨트롤러 import
import { signup, logout, isAuthenticated, autoLogin } from '@/app/api/authController';
import { getCommunityPosts, type CommunityResponse } from '@/app/api/communityController';

export default function CommunityPage() {


  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] overflow-hidden"> {/* 배경색을 #FAF6EC로 변경 */}
      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-[18px] pb-[100px]"> {/* Footer 공간 확보를 위한 bottom padding */}
        <h1 className="pl-[7px] text-[#023735] font-bold text-[24px]">Community Page</h1>

        {/* 내가 기르는 식물 리스트 */}
        <MyPlantsList />

        {/* 커뮤니티 섹션들 */}
        <div className="mt-[30px] space-y-[20px]">
          {/* 질문/토론 섹션 */}
          <CommunitySection
            title="이거 어떻게 키워요?"
            category="question"
          />

          {/* 식물별 카테고리 섹션 */}
          {/* <CommunitySection
            title="식물별 카테고리"
            category="plant"
          /> */}

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

      <WritePostButton />

      {/* Footer는 고정 위치 */}
      <Footer url="community" />
    </div>
  );
}