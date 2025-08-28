'use client';

import { Heart, MessageCircle } from 'lucide-react';
import { CommunityPost } from '@/app/types/community/community';

interface PostCardProps {
  post: CommunityPost;
  onClick: (postId: number) => void; // 게시글 클릭 핸들러
  variant?: 'compact' | 'full'; // 표시 방식 (컴팩트/풀 사이즈)
  imagePosition?: 'left' | 'right';
  showAuthor?: boolean;
}

export default function PostCard({ post, onClick, variant = 'compact', imagePosition = 'right', showAuthor = true }: PostCardProps) {
  const isCompact = variant === 'compact';

  const imageThumbnail = (post.images && post.images.length > 0) && (
    <div className={`bg-[#EFEAD8] rounded-lg flex items-center justify-center flex-shrink-0 ${
      isCompact ? 'w-[50px] h-[50px]' : 'w-[60px] h-[60px]'
      }`}> {/* 이미지 배경을 새 배경에 맞게 조정 */}
      <span className={isCompact ? 'text-[20px]' : 'text-[24px]'}>🌱</span>
    </div>
  );
  
  return (
    <button
      onClick={() => onClick(post.id)}
      className="w-full bg-[#F5F1E7] rounded-lg p-[15px] border border-gray-300 hover:border-[#42CA71] hover:bg-[#F0ECE0] transition-all text-left" // 새 배경에 맞게 색상 조정
    >
      {/* 게시글 헤더 */}
      <div className="flex justify-between items-start mb-[8px]">
        <div className="flex-1 mr-[10px]">
          <h3 className="text-[#023735] font-medium text-[16px]">
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
      <div className="flex items-start space-x-[10px]">
        {imagePosition === 'left' && imageThumbnail}
        <div className="flex-1">
          <p className={`text-[#495057] text-[14px] leading-[1.4] ${isCompact ? 'line-clamp-2' : 'line-clamp-3'}`}>
            {post.content}
          </p>
        </div>
        {imagePosition === 'right' && imageThumbnail}
      </div>

      {/* 게시글 푸터 (좋아요, 댓글) */}
      <div className="flex justify-between items-center mt-[12px]">
        {showAuthor ? (
          <span className="text-[#6C757D] text-[12px]">
            {post.author}
          </span>
        ) : (
          <div /> // Omit author but keep space for alignment
        )}
        <div className="flex items-center space-x-[10px]">
          {/* 좋아요 버튼 */}
          <div className="flex items-center space-x-[4px] text-[#6C757D] text-[12px] border border-[#D4CDB8] bg-[#F0ECE0] rounded-full px-[8px] py-[4px]"> {/* 새 배경에 맞게 색상 조정 */}
            <Heart size={12} />
            <span>{post.likes}</span>
          </div>
          {/* 댓글 버튼 */}
          <div className="flex items-center space-x-[4px] text-[#6C757D] text-[12px] border border-[#D4CDB8] bg-[#F0ECE0] rounded-full px-[8px] py-[4px]"> {/* 새 배경에 맞게 색상 조정 */}
            <MessageCircle size={12} />
            <span>{post.comments}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
