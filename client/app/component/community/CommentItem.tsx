'use client';

import { useState } from 'react';
import { Comment } from '@/app/types/community/community';

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: number, content: string) => void;
  isReply?: boolean;
}

export default function CommentItem({ comment, onReply, isReply = false }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const marginLeft = isReply ? 20 : 0; // 대댓글은 20px margin

  return (
    <div className="border-b border-[#E8E3D5] pb-[16px] last:border-b-0" style={{ marginLeft }}>
      {/* 댓글 헤더 */}
      <div className="flex items-start space-x-[12px]">
        {/* 대댓글 표시 기호 */}
        {isReply && (
          <div className="flex-shrink-0 mt-2">
            <span className="text-[#6C757D] text-[14px]">ㄴ</span>
          </div>
        )}

        {/* 프로필 이미지 */}
        <div className="w-[32px] h-[32px] bg-[#EFEAD8] rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-[16px]">👤</span>
        </div>

        {/* 댓글 내용 */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-[8px]">
            <div className="flex items-center space-x-[8px]">
              <span className="text-[#023735] font-medium text-[14px]">
                {comment.author}
              </span>
              <span className="text-[#6C757D] text-[12px]">
                {comment.timeAgo}
              </span>
            </div>
            {!isReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-[#42CA71] text-[12px] hover:underline"
              >
                답글 달기
              </button>
            )}
          </div>
          <p className="text-[#495057] text-[14px] leading-[1.5]">
            {comment.content}
          </p>
        </div>
      </div>

      {/* 대댓글 작성 폼 - 댓글 아래 별도 섹션 */}
      {showReplyForm && (
        <div className="mt-[12px]" style={{ marginLeft: isReply ? 0 : 44 }}>
          <div className="space-y-[8px]">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답글을 입력하세요..."
              className="w-full p-[8px] border border-[#D4CDB8] bg-[#F5F1E7] rounded resize-none h-[60px] text-[12px] focus:outline-none focus:border-[#42CA71] transition-colors"
            />
            <div className="flex justify-end space-x-[8px]">
              <button
                onClick={() => setShowReplyForm(false)}
                className="px-[12px] py-[4px] text-[#6C757D] text-[12px] hover:text-[#42CA71] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={!replyContent.trim()}
                className="px-[12px] py-[4px] bg-[#42CA71] text-white text-[12px] font-medium rounded hover:bg-[#369F5C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                작성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
