import type { FC } from 'react';

import type { Comment as BiliComment } from '../types';
import dayjs from 'dayjs';

interface CommentSectionProps {
  oid: string;
  type: number;
  comments?: BiliComment[];
}

const CommentItem: FC<{ 
  comment: BiliComment; 
  isSub?: boolean;
}> = ({ comment, isSub }) => {
  // We rely on pre-fetched replies. 
  // If we want to support "Load More" essentially we need the polling service to fetch deeper,
  // or we treat "Load More" as an exception. 
  // Given the strict "UI does not call API" rule, we will only show what is in `comment.replies`.
  // The polling service attempts to fetch sub-replies.
  
  const subReplies = comment.replies || [];
  const hasMore = comment.replyCount ? subReplies.length < comment.replyCount : false;

  return (
    <div className={`flex ${isSub ? 'mt-2 ml-9' : 'mt-3'}`}>
      <img src={comment.userFace} alt={comment.userName} className={`${isSub ? 'w-5 h-5' : 'w-7 h-7'} rounded-full mr-2.5`} />
      <div className="flex-1">
        <div className="flex justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <span className={`font-semibold ${isSub ? 'text-[0.75rem]' : 'text-[0.8rem]'}`}>{comment.userName}</span>
            {comment.isPinned && (
              <span className="text-[0.65rem] text-primary bg-primary/10 px-1 py-0.5 rounded border border-primary">置顶</span>
            )}
          </div>
          <span className="text-[0.7rem] text-text-secondary">
            {dayjs(comment.timestamp * 1000).format('MM-DD HH:mm')}
          </span>
        </div>
        <div className={`text-text-primary leading-snug ${isSub ? 'text-[0.8rem]' : 'text-[0.85rem]'}`}>{comment.content}</div>
        
        {subReplies.length > 0 && (
          <div className="mt-1.5">
            {subReplies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isSub={true} />
            ))}
          </div>
        )}

        {!isSub && hasMore && (
           <div className="text-[0.75rem] text-text-secondary mt-1">
             (还有 {comment.replyCount! - subReplies.length} 条回复，请等待轮询更新或调整设置)
           </div>
        )}
      </div>
    </div>
  );
};

const CommentSection: FC<CommentSectionProps> = ({ comments }) => {
  if (!comments || comments.length === 0) return <div className="p-2 text-[0.75rem] text-text-secondary">暂无评论或数据未更新</div>;

  return (
    <div className="px-4 pb-4 border-t border-border bg-black/5 dark:bg-black/10">
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentSection;
