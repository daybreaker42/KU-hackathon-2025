'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { getCommunityPostById, CommunityPost, getCommunityPostComments, Comment as APIComment, CommentsResponse, createCommunityComment, CreateCommentData, updateCommunityComment, UpdateCommentData, deleteCommunityComment } from '@/app/api/communityController'; // API import
import BackButton from '@/app/component/common/BackButton';
import Comments from '@/app/component/community/Comments';

// Comment 타입을 페이지 내에서 정의합니다.
// TODO: API 응답에 맞게 수정하거나, 전역 타입으로 이동해야 할 수 있습니다.
export interface Comment {
  id: number;
  author: string;
  authorId: number; // 삭제 권한 확인용
  content: string;
  timeAgo: string;
  createdAt: string;
  parentId?: number;
}

// API Comment를 로컬 Comment로 변환하는 함수
const convertAPICommentToLocal = (apiComment: APIComment): Comment => {
  // timeAgo 계산
  const now = new Date();
  const createdAt = new Date(apiComment.createdAt);
  const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));

  let timeAgo: string;
  if (diffInMinutes < 1) {
    timeAgo = "방금 전";
  } else if (diffInMinutes < 60) {
    timeAgo = `${diffInMinutes}분 전`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    timeAgo = `${hours}시간 전`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    timeAgo = `${days}일 전`;
  }

  return {
    id: apiComment.id,
    author: apiComment.author.name,
    authorId: apiComment.author.id,
    content: apiComment.content,
    timeAgo,
    createdAt: apiComment.createdAt,
    parentId: apiComment.parent_id || undefined
  };
};

// API 댓글 데이터를 로컬 형식으로 변환하는 함수
const convertAPICommentsToLocal = (apiComments: APIComment[]): Comment[] => {
  const result: Comment[] = [];

  // 부모 댓글과 대댓글을 모두 평탄화
  apiComments.forEach(comment => {
    // 부모 댓글 추가
    result.push(convertAPICommentToLocal(comment));

    // 대댓글 추가
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.forEach(reply => {
        result.push(convertAPICommentToLocal(reply));
      });
    }
  });

  return result;
};

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]); // 댓글은 아직 mock 사용
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 현재 사용자 정보 (TODO: 실제 사용자 정보 API로 교체)
  const currentUser = {
    id: 1, // mock 사용자 ID
    name: "현재 사용자"
  };

  useEffect(() => {
    if (!postId) return;

    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        const postData = await getCommunityPostById(postId);
        setPost(postData);
        setLikesCount(postData.likes_count);
        setIsLiked(postData.isLiked);
        
        // 댓글 API 호출
        const commentsResponse = await getCommunityPostComments(postId);
        const localComments = convertAPICommentsToLocal(commentsResponse.comments);
        setComments(localComments);

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

  // 댓글 새로고침 핸들러
  const handleCommentsRefresh = async () => {
    try {
      const commentsResponse = await getCommunityPostComments(postId);
      const localComments = convertAPICommentsToLocal(commentsResponse.comments);
      setComments(localComments);
    } catch (error) {
      console.error('댓글 새로고침 중 오류 발생:', error);
    }
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
          onAddComment={async (content) => {
            try {
              // API 호출
              const commentData: CreateCommentData = { content };
              const newComment = await createCommunityComment(postId, commentData);

              // 로컬 상태 업데이트
              const localComment = convertAPICommentToLocal(newComment);
              setComments(prevComments => [...prevComments, localComment]);
            } catch (error) {
              console.error('댓글 작성 실패:', error);
              // API 실패 시 로컬에서 처리
              const comment: Comment = {
                id: comments.length + 1,
                author: currentUser.name,
                authorId: currentUser.id,
                content,
                timeAgo: "방금 전",
                createdAt: new Date().toISOString()
              };
              setComments([...comments, comment]);
            }
          }}
          onAddReply={async (parentId: number, content: string) => {
            try {
              // API 호출
              const commentData: CreateCommentData = { content, parent_id: parentId };
              const newReply = await createCommunityComment(postId, commentData);

              // 로컬 상태 업데이트
              const localReply = convertAPICommentToLocal(newReply);
              setComments(prevComments => [...prevComments, localReply]);
            } catch (error) {
              console.error('대댓글 작성 실패:', error);
              // API 실패 시 로컬에서 처리
              const newReply: Comment = {
                id: Date.now(),
                author: currentUser.name,
                authorId: currentUser.id,
                content,
                timeAgo: "방금 전",
                parentId,
                createdAt: new Date().toISOString()
              };
              setComments(prevComments => [...prevComments, newReply]);
            }
          }}
          onRefresh={handleCommentsRefresh}
          onEditComment={async (commentId: number, content: string) => {
            try {
              // API 호출
              const commentData: UpdateCommentData = { content };
              const updatedComment = await updateCommunityComment(commentId.toString(), commentData);

              // 로컬 상태 업데이트
              const localComment = convertAPICommentToLocal(updatedComment);
              setComments(prevComments =>
                prevComments.map(comment =>
                  comment.id === commentId ? localComment : comment
                )
              );
            } catch (error) {
              console.error('댓글 수정 실패:', error);
              // 로컬에서 직접 수정
              setComments(prevComments =>
                prevComments.map(comment =>
                  comment.id === commentId
                    ? { ...comment, content, timeAgo: "방금 전" }
                    : comment
                )
              );
            }
          }}
          onDeleteComment={async (commentId: number) => {
            try {
              // API 호출
              await deleteCommunityComment(commentId.toString());

              // 로컬 상태 업데이트
              setComments(prevComments =>
                prevComments.filter(comment => comment.id !== commentId)
              );
            } catch (error) {
              console.error('댓글 삭제 실패:', error);
              // 로컬에서 직접 삭제
              setComments(prevComments =>
                prevComments.filter(comment => comment.id !== commentId)
              );
            }
          }}
          currentUserId={currentUser.id}
        />
      </div>
    </div>
  );
}