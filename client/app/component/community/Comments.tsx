'use client';

import { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Comment } from '@/app/types/community/community';
import CommentItem from './CommentItem';
import styles from './comment.module.css';

// 로컬 Comment 타입 (authorId 포함)
interface LocalComment extends Comment {
  authorId: number;
}

interface CommentsProps {
  comments: LocalComment[];
  onAddComment: (content: string) => void;
  onAddReply: (parentId: number, content: string) => void;
  onRefresh: () => void;
  onEditComment?: (commentId: number, content: string) => void;
  onDeleteComment?: (commentId: number) => void;
  currentUserId?: number;
}

export default function Comments({ comments, onAddComment, onAddReply, onRefresh, onEditComment, onDeleteComment, currentUserId }: CommentsProps) {
  const [newComment, setNewComment] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // textarea 높이를 자동으로 조정하는 함수
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      
      // 최소 높이 (1줄)와 최대 높이 (2줄) 계산
      const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
      const padding = 24; // top + bottom padding
      const minHeight = lineHeight + padding;
      const maxHeight = lineHeight * 2 + padding;
      
      const scrollHeight = textarea.scrollHeight;
      
      if (scrollHeight <= maxHeight) {
        textarea.style.height = Math.max(minHeight, scrollHeight) + 'px';
      } else {
        textarea.style.height = maxHeight + 'px';
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    adjustTextareaHeight();
  };

  // 컴포넌트 마운트 시 초기 높이 설정
  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
      // 댓글 제출 후 높이 초기화
      setTimeout(() => adjustTextareaHeight(), 0);
    }
  };

  // 댓글을 그룹화하는 함수
  const groupComments = (comments: Comment[]) => {
    const groups: { parent: Comment; replies: Comment[] }[] = [];

    // 일반 댓글 찾기 (parentId가 없는 댓글들)
    const parentComments = comments.filter(comment => !comment.parentId);

    // 각 부모 댓글에 대해 대댓글 그룹 생성
    parentComments.forEach(parent => {
      const replies = comments.filter(comment => comment.parentId === parent.id);
      // 시간 순서대로 정렬 (오래된 순으로)
      replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      groups.push({
        parent,
        replies
      });
    });

    // 부모 댓글도 시간 순서대로 정렬 (오래된 순으로)
    groups.sort((a, b) => new Date(a.parent.createdAt).getTime() - new Date(b.parent.createdAt).getTime());

    return groups;
  };

  const commentGroups = groupComments(comments);

  return (
    <div>
      {/* 댓글 작성 섹션 */}
      <div className={styles.commentInputContainer}>
        <textarea
          ref={textareaRef}
          value={newComment}
          onChange={handleTextareaChange}
          placeholder="댓글 입력"
          className={styles.commentInput}
          rows={1}
        />
        <button
          onClick={handleCommentSubmit}
          disabled={!newComment.trim()}
          className={styles.commentButton}
        >
          작성하기
        </button>
      </div>


      {/* 댓글 리스트 */}
      <div>
        {/* 댓글 헤더 */}
        <div className="flex justify-between items-center mb-[15px]">
          <h3 className="text-[#023735] font-medium text-[16px]">
            댓글 {comments.length}
          </h3>
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-[16px]">
          {commentGroups.map((group) => (
            <div key={group.parent.id} className="space-y-[8px]">
              {/* 부모 댓글 */}
              <CommentItem
                comment={group.parent as LocalComment}
                onReply={onAddReply}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
                currentUserId={currentUserId}
                isReply={false}
              />

              {/* 대댓글 목록 */}
              {group.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply as LocalComment}
                  onReply={onAddReply}
                  onEdit={onEditComment}
                  onDelete={onDeleteComment}
                  currentUserId={currentUserId}
                  isReply={true}
                />
              ))}
            </div>
          ))}
        </div>

        {/* 댓글이 없는 경우 */}
        {comments.length === 0 && (
          <div className="text-center py-[40px]">
            <p className="text-[#6C757D] text-[medium]">아직 댓글이 없습니다.</p>
            <p className="text-[#6C757D] text-[small] mt-[4px]">첫 번째 댓글을 작성해보세요!</p>
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
