'use client';

import { useParams } from 'next/navigation'; // useRouter 제거
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react'; // ChevronLeft 제거 (BackButton에서 사용)
import { CommunityPost, Comment } from '@/app/types/community/community';
import BackButton from '@/app/component/common/BackButton'; // BackButton 컴포넌트 import 추가
import Comments from '@/app/component/community/Comments'; // Comments 컴포넌트 import 추가

// Mock 데이터
const mockPost: CommunityPost = {
  id: 1,
  title: "이거 어떻게 키워요?",
  content: "제가 식물을 처음 기르는데 여기서 어떻게 이걸 해야할지 모르겠어요. 고수님들 어떻게 해야 하는지 알려주세요 이 귀여운 금전수가 불쌍하지 않으신가요?",
  author: "성준 한",
  timeAgo: "5월 28일",
  likes: 13,
  comments: 25,
  category: 'question',
  hasImage: true
};

const mockComments: Comment[] = [
  {
    id: 1,
    author: "성준 한",
    content: "아 그거 그렇게 하는거 아님데;",
    timeAgo: "5분전",
    createdAt: "2025-01-28T10:00:00Z"
  },
  {
    id: 2,
    author: "성준 한",
    content: "감사합니다^^",
    timeAgo: "5분전",
    createdAt: "2025-01-28T10:05:00Z"
  }
];

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string; // router 제거
  
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false); // 좋아요 상태
  const [likesCount, setLikesCount] = useState(0); // 좋아요 수
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        
        // 네트워크 지연 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // TODO - 실제 API 호출로 대체
        setPost(mockPost);
        setComments(mockComments);
        setLikesCount(mockPost.likes);
        
      } catch (error) {
        console.error('Error fetching post detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [postId]);

  // 좋아요 토글 핸들러
  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  // 대댓글 작성 핸들러
  const handleReplySubmit = (parentId: number, content: string) => {
    const newReply: Comment = {
      id: Date.now(), // 간단한 ID 생성
      author: "현재 사용자", // TODO - 실제 사용자 정보로 대체
      content,
      timeAgo: "방금 전",
      parentId,
      createdAt: new Date().toISOString()
    };

    setComments(prevComments => [...prevComments, newReply]);
  };

  // 댓글 새로고침 핸들러
  const handleCommentsRefresh = () => {
    // TODO - 댓글 새로고침 API 호출
    console.log('댓글 새로고침');
  };

  if (loading) {
    return (
      <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] w-[393px] mx-auto"> {/* 배경색을 #FAF6EC로 변경 */}
        <div className="flex-1 overflow-y-auto p-[18px]">
          {/* 헤더 스켈레톤 */}
          <div className="flex items-center mb-[20px]">
            <div className="w-[24px] h-[24px] bg-[#E6DFD1] rounded-full animate-pulse mr-[12px]"></div> {/* 스켈레톤 색상을 새 배경에 맞게 조정 */}
            <div className="h-[24px] bg-[#E6DFD1] rounded w-[150px] animate-pulse"></div>
          </div>
          
          {/* 작성자 정보 스켈레톤 */}
          <div className="flex items-center mb-[20px]">
            <div className="w-[40px] h-[40px] bg-[#E6DFD1] rounded-full animate-pulse mr-[12px]"></div> {/* 스켈레톤 색상을 새 배경에 맞게 조정 */}
            <div>
              <div className="h-[16px] bg-[#E6DFD1] rounded w-[80px] animate-pulse mb-[4px]"></div>
              <div className="h-[14px] bg-[#E6DFD1] rounded w-[60px] animate-pulse"></div>
            </div>
          </div>
          
          {/* 내용 스켈레톤 */}
          <div className="space-y-[8px] mb-[20px]">
            <div className="h-[16px] bg-[#E6DFD1] rounded animate-pulse"></div>
            <div className="h-[16px] bg-[#E6DFD1] rounded w-[80%] animate-pulse"></div>
            <div className="h-[16px] bg-[#E6DFD1] rounded w-[60%] animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    // post가 없는 경우
    return (
      <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] w-[393px] mx-auto"> {/* 배경색을 #FAF6EC로 변경 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-[16px]">게시글을 찾을 수 없습니다.</p>
            <BackButton
              className="mx-auto"
              onClick={() => { }} // 빈 함수로 기본 router.back() 동작 사용
            />
            <p className="text-[#42CA71] mt-[8px] text-[14px]">목록으로 돌아가기</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] w-[393px] mx-auto"> {/* 배경색을 #FAF6EC로 변경 */}
      <div className="flex-1 overflow-y-auto p-[18px] pb-[100px]">
        {/* 헤더 */}
        <div className="flex items-center mb-[20px]">
          <BackButton className="mr-[12px]" /> {/* BackButton 컴포넌트 사용 */}
          <h1 className="text-[#023735] font-medium text-[18px]">
            {post.title}
          </h1>
        </div>

        {/* 작성자 정보 */}
        <div className="flex items-center mb-[20px]">
          <div className="w-[40px] h-[40px] bg-[#EFEAD8] rounded-full flex items-center justify-center mr-[12px]"> {/* 프로필 배경을 새 배경에 맞게 조정 */}
            <span className="text-[20px]">👤</span>
          </div>
          <div>
            <p className="text-[#023735] font-medium text-[16px]">{post.author}</p>
            <p className="text-[#6C757D] text-[14px]">{post.timeAgo}</p>
          </div>
        </div>

        {/* 게시글 내용 */}
        <div className="mb-[20px]">
          <p className="text-[#495057] text-[16px] leading-[1.6]">
            {post.content}
          </p>
        </div>

        {/* 이미지 섹션 */}
        {post.hasImage && (
          <div className="flex gap-[8px] mb-[20px] overflow-x-auto">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="w-[120px] h-[120px] bg-[#EFEAD8] rounded-lg flex-shrink-0 flex items-center justify-center" // 이미지 배경을 새 배경에 맞게 조정
              >
                <span className="text-[#8B7355] text-[12px]">이미지 {index}</span> {/* 텍스트 색상도 조정 */}
              </div>
            ))}
          </div>
        )}

        {/* 좋아요 섹션 */}
        <div className="mb-[30px]">
          <button 
            onClick={handleLikeToggle}
            className={`flex items-center space-x-[8px] p-[8px] rounded-lg transition-colors ${
              isLiked ? 'text-red-500 bg-red-50' : 'text-[#6C757D] hover:bg-[#F0ECE0]' // hover 색상을 새 배경에 맞게 조정
            }`}
          >
            <Heart 
              size={20} 
              className={isLiked ? 'fill-current' : ''} 
            />
            <span className="font-medium">{likesCount}</span>
          </button>
        </div>

        {/* 댓글 섹션 */}
        <Comments
          comments={comments}
          onAddComment={(content) => {
            const comment: Comment = {
              id: comments.length + 1,
              author: "현재 사용자",
              content,
              timeAgo: "방금 전",
              createdAt: new Date().toISOString()
            };
            setComments([...comments, comment]);
          }}
          onAddReply={handleReplySubmit}
          onRefresh={handleCommentsRefresh}
        />
      </div>
    </div>
  );
}
