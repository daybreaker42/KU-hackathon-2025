'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Comment } from '@/app/types/community/community';
import CommentItem from './CommentItem';

interface CommentsProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  onAddReply: (parentId: number, content: string) => void;
  onRefresh: () => void;
}

export default function Comments({ comments, onAddComment, onAddReply, onRefresh }: CommentsProps) {
  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div>
      {/* 댓글 작성 섹션 */}
      <div className="mb-[30px]">
        <h3 className="text-[#023735] font-medium text-[16px] mb-[15px]">댓글 작성</h3>
        <div className="space-y-[12px]">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="w-full p-[12px] border border-[#D4CDB8] bg-[#F5F1E7] rounded-lg resize-none h-[80px] text-[14px] focus:outline-none focus:border-[#42CA71] transition-colors"
          />
          <div className="flex justify-end">
            <button
              onClick={handleCommentSubmit}
              disabled={!newComment.trim()}
              className="px-[20px] py-[8px] bg-[#42CA71] text-white text-[14px] font-medium rounded-lg hover:bg-[#369F5C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              작성하기
            </button>
          </div>
        </div>
      </div>

      {/* 댓글 리스트 */}
      <div>
        {/* 댓글 헤더 */}
        <div className="flex justify-between items-center mb-[15px]">
          <h3 className="text-[#023735] font-medium text-[16px]">
            댓글 ({comments.length})
          </h3>
          <button
            onClick={onRefresh}
            className="flex items-center space-x-[4px] text-[#6C757D] text-[14px] hover:text-[#42CA71] transition-colors"
          >
            <RefreshCw size={14} />
            <span>새로고침</span>
          </button>
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-[16px]">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={onAddReply}
              depth={comment.depth}
            />
          ))}
        </div>

        {/* 댓글이 없는 경우 */}
        {comments.length === 0 && (
          <div className="text-center py-[40px]">
            <p className="text-[#6C757D] text-[14px]">아직 댓글이 없습니다.</p>
            <p className="text-[#6C757D] text-[12px] mt-[4px]">첫 번째 댓글을 작성해보세요!</p>
          </div>
        )}

        {/* 페이지네이션 */}
        {comments.length > 0 && (
          <div className="flex justify-center items-center mt-[30px] space-x-[8px]">
            <button className="text-[#6C757D] text-[14px] hover:text-[#42CA71] transition-colors">
              &lt;
            </button>
            <button className="w-[24px] h-[24px] bg-[#42CA71] text-white text-[14px] rounded">
              1
            </button>
            <button className="w-[24px] h-[24px] text-[#6C757D] text-[14px] hover:text-[#42CA71] transition-colors">
              2
            </button>
            <button className="w-[24px] h-[24px] text-[#6C757D] text-[14px] hover:text-[#42CA71] transition-colors">
              3
            </button>
            <button className="text-[#6C757D] text-[14px] hover:text-[#42CA71] transition-colors">
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
