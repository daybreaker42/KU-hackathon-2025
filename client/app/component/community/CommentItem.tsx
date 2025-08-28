'use client';

import { useState } from 'react';
import { Comment } from '@/app/types/community/community';

// 로컬 Comment 타입 (authorId 포함)
interface LocalComment extends Comment {
  authorId: number;
}

interface CommentItemProps {
  comment: LocalComment;
  onReply: (parentId: number, content: string) => void;
  onEdit?: (commentId: number, content: string) => void;
  onDelete?: (commentId: number) => void;
  currentUserId?: number;
  isReply?: boolean;
}

export default function CommentItem({ comment, onReply, onEdit, onDelete, currentUserId, isReply = false }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const handleEditSubmit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('댓글을 삭제하시겠습니까?')) {
      onDelete(comment.id);
    }
  };

  // 현재 사용자가 댓글 작성자인지 확인
  const isCurrentUser = currentUserId ? comment.authorId === currentUserId : false;

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
            <div className="flex items-center space-x-[8px]">
              {!isReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-[#42CA71] text-[12px] hover:underline"
                >
                  답글 달기
                </button>
              )}
              {isCurrentUser && (
                <>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-[#6C757D] text-[12px] hover:text-[#42CA71] transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-[#6C757D] text-[12px] hover:text-red-500 transition-colors"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
          {isEditing ? (
            <div className="space-y-[8px]">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-[8px] border border-[#D4CDB8] bg-[#F5F1E7] rounded resize-none h-[60px] text-[12px] focus:outline-none focus:border-[#42CA71] transition-colors"
              />
              <div className="flex justify-end space-x-[8px]">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-[12px] py-[4px] text-[#6C757D] text-[12px] hover:text-[#42CA71] transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={!editContent.trim()}
                  className="px-[12px] py-[4px] bg-[#42CA71] text-white text-[12px] font-medium rounded hover:bg-[#369F5C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  수정
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[#495057] text-[14px] leading-[1.5]">
              {comment.content}
            </p>
          )}
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
