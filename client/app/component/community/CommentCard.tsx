import { MessageCircle } from 'lucide-react';

interface CommentCardProps {
  comment: {
    id: number;
    title: string;
    content: string;
    timeAgo: string;
  };
  variant?: 'compact' | 'full';
}

export default function CommentCard({ 
  comment, 
  variant = 'full' 
}: CommentCardProps) {
  const isCompact = variant === 'compact';
  
  return (
    <div
      className={`bg-[#F5F1E7] rounded-lg border border-gray-300 ${
        isCompact ? 'p-[12px]' : 'p-[15px]'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* 댓글 아이콘 */}
        <div className={`flex-shrink-0 bg-[#EFEAD8] rounded-full flex items-center justify-center ${
          isCompact ? 'w-8 h-8' : 'w-10 h-10'
        }`}>
          <MessageCircle className={`text-[#4CAF50] ${
            isCompact ? 'w-4 h-4' : 'w-5 h-5'
          }`} />
        </div>

        {/* 댓글 내용 */}
        <div className="flex-1 min-w-0">
          {/* 댓글이 달린 게시글 정보 */}
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-medium text-[#023735] truncate ${
              isCompact ? 'text-[14px]' : 'text-[16px]'
            }`}>
              {comment.title}
            </h3>
            <span className="text-[#6C757D] text-[12px] flex-shrink-0 ml-2">
              {comment.timeAgo}
            </span>
          </div>

          {/* 댓글 내용 */}
          <p className={`text-[#495057] line-clamp-2 leading-[1.4] ${
            isCompact ? 'text-[12px]' : 'text-[14px]'
          }`}>
            {comment.content}
          </p>

          {/* 댓글 라벨 */}
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-[#42CA71] text-white">
              <MessageCircle className="w-3 h-3 mr-1" />
              댓글
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
