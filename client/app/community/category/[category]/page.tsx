'use client';

import { CommunityPost, Plant } from '@/app/types/community/community';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Heart, MessageCircle, ArrowLeft, Filter } from 'lucide-react';

// Mock 데이터 (실제로는 API에서 가져올 데이터)
const mockPlants: Plant[] = [
  { id: 1, name: "몬스테라", imageUrl: "/plants/monstera.jpg" },
  { id: 2, name: "산세베리아", imageUrl: "/plants/sansevieria.jpg" },
  { id: 3, name: "스킨답서스", imageUrl: "/plants/pothos.jpg" }
];

const mockPosts: CommunityPost[] = [
  {
    id: 1,
    title: "이거 어떻게 키워요?",
    content: "제가 여기 처음 오늘데 어떻게 쓰는지를 모르겠네요. 물은 언제 주면 되나요?",
    author: "식물초보",
    timeAgo: "5분전",
    likes: 13,
    comments: 13,
    category: 'question'
  },
  {
    id: 2,
    title: "몬스테라 잎이 노랗게 변해요",
    content: "몬스테라를 키운지 2개월 정도 됐는데 잎 끝이 노랗게 변하기 시작했어요. 물은 일주일에 한 번 주고 있습니다.",
    author: "식물러버",
    timeAgo: "10분전",
    likes: 8,
    comments: 5,
    category: 'plant',
    plant: mockPlants[0],
    hasImage: true
  },
  {
    id: 3,
    title: "오늘의 식물 일기",
    content: "우리집 식물들이 하루하루 자라는 모습을 보니 정말 뿌듯해요. 특히 몬스테라가 새 잎을 내고 있어요!",
    author: "일상러버",
    timeAgo: "15분전",
    likes: 24,
    comments: 8,
    category: 'daily'
  },
  {
    id: 4,
    title: "초보자도 키우기 쉬운 식물 추천",
    content: "식물을 처음 키워보려고 하는데 어떤 것부터 시작하면 좋을까요?",
    author: "새싹이",
    timeAgo: "30분전",
    likes: 19,
    comments: 12,
    category: 'question'
  },
  {
    id: 5,
    title: "식물 키우기 3년차 후기",
    content: "처음에는 물만 주면 되는 줄 알았는데, 이제는 햇빛, 습도, 통풍까지 신경써야 한다는 걸 깨달았어요.",
    author: "베테랑",
    timeAgo: "1시간전",
    likes: 45,
    comments: 23,
    category: 'free'
  }
];

// 카테고리명 매핑
const categoryNames = {
  question: '이거 어떻게 키워요?',
  daily: '일상',
  free: '자유 주제',
  plant: '식물별 카테고리'
};

// 정렬 옵션
const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'comments', label: '댓글순' }
];

export default function CategoryPostsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const category = params.category as 'question' | 'daily' | 'free' | 'plant';
  const plantId = searchParams.get('plantId');
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest'); // 정렬 기준 상태 추가
  const [showFilters, setShowFilters] = useState(false); // 필터 표시 상태 추가

  // 게시글 데이터 로딩
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // 네트워크 지연 시뮬레이션 (실제로는 API 호출)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 카테고리별 필터링
        let filteredPosts = mockPosts.filter(post => post.category === category);
        
        // 식물별 카테고리인 경우 특정 식물 ID로 추가 필터링
        if (category === 'plant' && plantId) {
          filteredPosts = filteredPosts.filter(post => post.plant?.id === Number(plantId));
        }
        
        // 정렬 적용
        const sortedPosts = sortPosts(filteredPosts, sortBy);
        setPosts(sortedPosts);
        
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category, plantId, sortBy]); // sortBy 의존성 추가

  // 정렬 함수
  const sortPosts = (posts: CommunityPost[], sortType: string) => {
    const sorted = [...posts];
    switch (sortType) {
      case 'popular':
        return sorted.sort((a, b) => b.likes - a.likes);
      case 'comments':
        return sorted.sort((a, b) => b.comments - a.comments);
      case 'latest':
      default:
        return sorted.sort((a, b) => a.id - b.id); // 최신순 (실제로는 timestamp 사용)
    }
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    router.back();
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="p-[18px] bg-white min-h-screen">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center mb-[20px]">
          <div className="w-[24px] h-[24px] bg-gray-300 rounded animate-pulse mr-[12px]"></div>
          <div className="h-[24px] bg-gray-300 rounded w-[150px] animate-pulse"></div>
        </div>
        
        {/* 필터 스켈레톤 */}
        <div className="flex justify-between items-center mb-[20px]">
          <div className="h-[16px] bg-gray-300 rounded w-[80px] animate-pulse"></div>
          <div className="h-[32px] bg-gray-300 rounded w-[100px] animate-pulse"></div>
        </div>
        
        {/* 게시글 리스트 스켈레톤 */}
        <div className="space-y-[15px]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-[15px] animate-pulse">
              <div className="h-[20px] bg-gray-300 rounded mb-[8px] w-[70%]"></div>
              <div className="h-[16px] bg-gray-300 rounded mb-[10px]"></div>
              <div className="h-[16px] bg-gray-300 rounded mb-[12px] w-[90%]"></div>
              <div className="flex justify-between items-center">
                <div className="h-[14px] bg-gray-300 rounded w-[60px]"></div>
                <div className="flex space-x-[10px]">
                  <div className="h-[28px] bg-gray-300 rounded-full w-[50px]"></div>
                  <div className="h-[28px] bg-gray-300 rounded-full w-[50px]"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-[18px] bg-white min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-[20px]">
        <div className="flex items-center">
          {/* 뒤로가기 버튼 */}
          <button 
            onClick={handleBack}
            className="mr-[12px] p-[4px] hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-[#023735]" />
          </button>
          
          {/* 페이지 제목 */}
          <h1 className="text-[#023735] font-medium text-[20px]">
            {categoryNames[category]}
            {category === 'plant' && plantId && (
              <span className="text-[16px] text-[#6C757D] ml-[8px]">
                · {mockPlants.find(p => p.id === Number(plantId))?.name}
              </span>
            )}
          </h1>
        </div>
        
        {/* 필터 토글 버튼 */}
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-[4px] text-[#42CA71] text-[14px] hover:text-[#369F5C] transition-colors"
        >
          <Filter size={16} />
          <span>필터</span>
        </button>
      </div>

      {/* 필터 및 정렬 옵션 */}
      {showFilters && (
        <div className="bg-[#F8F9FA] rounded-lg p-[15px] mb-[20px] border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-[#023735] font-medium text-[14px]">정렬</span>
            <div className="flex space-x-[8px]">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-[12px] py-[6px] rounded-full text-[12px] transition-colors ${
                    sortBy === option.value
                      ? 'bg-[#42CA71] text-white'
                      : 'bg-white text-[#6C757D] hover:bg-[#E9ECEF]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 게시글 수 정보 */}
      <div className="mb-[20px]">
        <span className="text-[#6C757D] text-[14px]">
          총 {posts.length}개의 게시글
        </span>
      </div>

      {/* 게시글 리스트 */}
      <div className="space-y-[15px]">
        {posts.length === 0 ? (
          // 빈 상태
          <div className="text-center py-[60px]">
            <div className="text-[48px] mb-[16px]">🌱</div>
            <h3 className="text-[#023735] font-medium text-[18px] mb-[8px]">
              아직 게시글이 없어요
            </h3>
            <p className="text-[#6C757D] text-[14px]">
              첫 번째 게시글을 작성해보세요!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-[#F8F9FA] rounded-lg p-[15px] border border-gray-100 hover:shadow-sm transition-shadow cursor-pointer">
              {/* 게시글 헤더 */}
              <div className="flex justify-between items-start mb-[8px]">
                <div className="flex-1 mr-[10px]">
                  <h3 className="text-[#023735] font-medium text-[16px] hover:text-[#42CA71] transition-colors">
                    {post.title}
                  </h3>
                  {/* 식물별 카테고리인 경우 식물 이름 표시 */}
                  {post.category === 'plant' && post.plant && (
                    <span className="inline-block bg-[#42CA71] text-white text-[10px] px-[6px] py-[2px] rounded-full mt-[4px]">
                      {post.plant.name}
                    </span>
                  )}
                </div>
                <span className="text-[#6C757D] text-[12px] whitespace-nowrap">
                  {post.timeAgo}
                </span>
              </div>

              {/* 게시글 내용 */}
              <div className="flex items-start space-x-[10px] mb-[12px]">
                <div className="flex-1">
                  <p className="text-[#495057] text-[14px] leading-[1.5] line-clamp-3">
                    {post.content}
                  </p>
                </div>
                
                {/* 이미지 썸네일 */}
                {post.hasImage && (
                  <div className="w-[60px] h-[60px] bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[24px]">🌱</span>
                  </div>
                )}
              </div>

              {/* 게시글 푸터 */}
              <div className="flex justify-between items-center">
                <span className="text-[#6C757D] text-[12px]">
                  {post.author}
                </span>
                <div className="flex items-center space-x-[10px]">
                  {/* 좋아요 버튼 */}
                  <button className="flex items-center space-x-[4px] text-[#6C757D] text-[12px] hover:text-[#42CA71] hover:border-[#42CA71] transition-colors border border-gray-300 rounded-full px-[8px] py-[4px]">
                    <Heart size={12} />
                    <span>{post.likes}</span>
                  </button>
                  {/* 댓글 버튼 */}
                  <button className="flex items-center space-x-[4px] text-[#6C757D] text-[12px] hover:text-[#42CA71] hover:border-[#42CA71] transition-colors border border-gray-300 rounded-full px-[8px] py-[4px]">
                    <MessageCircle size={12} />
                    <span>{post.comments}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 무한 스크롤 또는 페이지네이션 영역 (추후 구현) */}
      {posts.length > 0 && (
        <div className="mt-[40px] text-center">
          <button className="text-[#42CA71] text-[14px] hover:text-[#369F5C] transition-colors">
            더 많은 게시글 보기
          </button>
        </div>
      )}
    </div>
  );
}
