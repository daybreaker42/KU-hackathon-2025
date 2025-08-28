'use client';

import { useEffect, useState } from 'react';
import MyPlantsList from "@/app/component/community/MyPlantsList";
import CommunitySection from "@/app/component/community/CommunitySection";
import Footer from "@/app/component/common/footer";
import WritePostButton from "@/app/component/community/WritePostButton";
// Auth 및 Community API 컨트롤러 import
import { signup, logout, isAuthenticated, autoLogin } from '@/app/api/authController';
import { getCommunityPosts, type CommunityResponse } from '@/app/api/communityController';

export default function CommunityPage() {
  // 커뮤니티 데이터 상태 관리
  const [communityData, setCommunityData] = useState<CommunityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 API 테스트 실행
  useEffect(() => {
    testAPIs();
  }, []);

  // API 테스트 함수
  const testAPIs = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('=== API 테스트 시작 ===');

      // 1. 개발용 자동 로그인 (하드코딩된 토큰 사용)
      console.log('1. 자동 로그인 시작...');
      autoLogin(); // 하드코딩된 토큰으로 즉시 로그인
      console.log('자동 로그인 완료');

      // 2. 인증 상태 확인
      console.log('2. 인증 상태 확인:', isAuthenticated());

      // 3. 커뮤니티 게시글 조회 테스트
      console.log('3. 커뮤니티 게시글 조회 시작...');
      const posts = await getCommunityPosts({
        page: 1,
        limit: 10,
        category: '식물관리'
      });
      console.log('커뮤니티 게시글 조회 성공:', posts);
      setCommunityData(posts);
    } catch (error) {
      console.error('API 테스트 중 오류:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 테스트 함수
  const testSignup = async () => {
    try {
      console.log('회원가입 테스트 시작...');
      const signupResult = await signup({
        name: '김민준',
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('회원가입 성공:', signupResult);
    } catch (error) {
      console.error('회원가입 테스트 오류:', error);
    }
  };

  // 로그아웃 테스트 함수
  const testLogout = async () => {
    try {
      console.log('로그아웃 테스트 시작...');
      await logout();
      console.log('로그아웃 성공');
      setCommunityData(null); // 로그아웃 후 데이터 초기화
    } catch (error) {
      console.error('로그아웃 테스트 오류:', error);
    }
  };
  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] overflow-hidden"> {/* 배경색을 #FAF6EC로 변경 */}
      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-[18px] pb-[100px]"> {/* Footer 공간 확보를 위한 bottom padding */}
        <h1 className="pl-[7px] text-[#023735] font-bold text-[24px]">Community Page</h1>

        {/* API 테스트 섹션 */}
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-bold mb-3">API 테스트</h2>

          {/* 로딩 상태 표시 */}
          {loading && (
            <div className="text-blue-600 mb-2">API 요청 중...</div>
          )}

          {/* 오류 상태 표시 */}
          {error && (
            <div className="text-red-600 mb-2 p-2 bg-red-50 rounded">
              오류: {error}
            </div>
          )}

          {/* 커뮤니티 데이터 표시 */}
          {communityData && (
            <div className="mb-4 p-3 bg-green-50 rounded">
              <h3 className="font-bold text-green-700">커뮤니티 데이터 조회 성공!</h3>
              <p>총 게시글: {communityData.total}개</p>
              <p>현재 페이지: {communityData.page}/{communityData.totalPages}</p>
              <p>불러온 게시글: {communityData.posts.length}개</p>
              {communityData.posts.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-semibold">첫 번째 게시글:</h4>
                  <p>제목: {communityData.posts[0].title}</p>
                  <p>카테고리: {communityData.posts[0].category}</p>
                  <p>좋아요: {communityData.posts[0].likes_count}개</p>
                </div>
              )}
            </div>
          )}

          {/* 테스트 버튼들 */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={testAPIs}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              disabled={loading}
            >
              API 재테스트
            </button>
            <button
              onClick={testSignup}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              disabled={loading}
            >
              회원가입 테스트
            </button>
            <button
              onClick={testLogout}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              disabled={loading}
            >
              로그아웃 테스트
            </button>
          </div>

          {/* 인증 상태 표시 */}
          <div className="mt-2 text-sm">
            인증 상태: {isAuthenticated() ? '로그인됨' : '로그아웃됨'}
          </div>
        </div>

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