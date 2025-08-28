'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { getCommunityPostById, CommunityPost } from '@/app/api/communityController'; // API import
import BackButton from '@/app/component/common/BackButton';
import Comments from '@/app/component/community/Comments';

// Comment 타입을 페이지 내에서 정의합니다.
// TODO: API 응답에 맞게 수정하거나, 전역 타입으로 이동해야 할 수 있습니다.
export interface Comment {
  id: number;
  author: string;
  content: string;
  timeAgo: string;
  createdAt: string;
  parentId?: number;
}

// Mock 데이터 - 댓글은 아직 API가 없으므로 유지합니다.
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
  const postId = params.id as string;
  
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]); // 댓글은 아직 mock 사용
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        const postData = await getCommunityPostById(postId);
        setPost(postData);
        setLikesCount(postData.likes_count);
        setIsLiked(postData.isLiked);
        
        // TODO: 댓글 API가 구현되면 아래 줄을 교체해야 합니다.
        setComments(mockComments);

      } catch (error) {
        console.error('Error fetching post detail:', error);
        setPost(null); // 에러 발생 시 post를 null로 설정
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [postId]);

  // 좋아요 토글 핸들러
  const handleLikeToggle = () => {
    // TODO: 좋아요 API 연동 필요
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  // 대댓글 작성 핸들러
  const handleReplySubmit = (parentId: number, content: string) => {
    // TODO: 댓글 생성 API 연동 필요
    const newReply: Comment = {
      id: Date.now(),
      author: "현재 사용자",
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
      <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] w-[393px] mx-auto">
        <div className="flex-1 overflow-y-auto p-[18px]">
          {/* 스켈레톤 UI */}
          <div className="flex items-center mb-[20px]">
            <div className="w-[24px] h-[24px] bg-[#E6DFD1] rounded-full animate-pulse mr-[12px]"></div>
            <div className="h-[24px] bg-[#E6DFD1] rounded w-[150px] animate-pulse"></div>
          </div>
          <div className="flex items-center mb-[20px]">
            <div className="w-[40px] h-[40px] bg-[#E6DFD1] rounded-full animate-pulse mr-[12px]"></div>
            <div>
              <div className="h-[16px] bg-[#E6DFD1] rounded w-[80px] animate-pulse mb-[4px]"></div>
              <div className="h-[14px] bg-[#E6DFD1] rounded w-[60px] animate-pulse"></div>
            </div>
          </div>
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
    return (
      <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] w-[393px] mx-auto">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-[16px]">게시글을 불러오는 데 실패했거나 찾을 수 없습니다.</p>
            <BackButton
              className="mx-auto"
              onClick={() => {}}
            />
            <p className="text-[#42CA71] mt-[8px] text-[14px]">목록으로 돌아가기</p>
          </div>
        </div>
      </div>
    );
  }

  // createdAt을 "X월 X일" 형식으로 변환하는 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-[#FAF6EC] w-[393px] mx-auto">
      <div className="flex-1 overflow-y-auto p-[18px] pb-[100px]">
        {/* 헤더 */}
        <div className="flex items-center mb-[20px]">
          <BackButton className="mr-[12px]" />
          <h1 className="text-[#023735] font-medium text-[18px] truncate">
            {post.title}
          </h1>
        </div>

        {/* 작성자 정보 */}
        <div className="flex items-center mb-[20px]">
          <div className="w-[40px] h-[40px] bg-[#EFEAD8] rounded-full flex items-center justify-center mr-[12px]">
            <span className="text-[20px]">👤</span>
          </div>
          <div>
            <p className="text-[#023735] font-medium text-[16px]">{post.author?.name || 'Anonymous'}</p>
            <p className="text-[#6C757D] text-[14px]">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {/* 게시글 내용 */}
        <div className="mb-[20px]">
          <p className="text-[#495057] text-[16px] leading-[1.6]">
            {post.content}
          </p>
        </div>

        {/* 이미지 섹션 */}
        {post.images && post.images.length > 0 && (
          <div className="flex gap-[8px] mb-[20px] overflow-x-auto">
            {post.images.map((imageUrl, index) => (
              <div
                key={index}
                className="w-[120px] h-[120px] bg-[#EFEAD8] rounded-lg flex-shrink-0"
              >
                <img src={imageUrl} alt={`post image ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* 좋아요 섹션 */}
        <div className="mb-[30px]">
          <button 
            onClick={handleLikeToggle}
            className={`flex items-center space-x-[8px] p-[8px] rounded-lg transition-colors ${
              isLiked ? 'text-red-500 bg-red-50' : 'text-[#6C757D] hover:bg-[#F0ECE0]'
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