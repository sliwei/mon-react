import type { FC } from 'react';

import type { Comment as BiliComment } from '../types';
import dayjs from 'dayjs';
import { CheckCircle } from 'lucide-react';

interface CommentSectionProps {
  oid: string;
  type: number;
  comments?: BiliComment[];
  upName?: string;
  onMarkRead?: (id: string, isDynamic?: boolean) => void;
  onlyShowUP?: boolean;
}

const CommentItem: FC<{ 
  comment: BiliComment; 
  isSub?: boolean;
  upName?: string;
  onMarkRead?: (id: string, isDynamic?: boolean) => void;
  onlyShowUP?: boolean;
}> = ({ comment, isSub, upName, onMarkRead, onlyShowUP }) => {
  // We rely on pre-fetched replies. 
  // If we want to support "Load More" essentially we need the polling service to fetch deeper,
  // or we treat "Load More" as an exception. 
  // Given the strict "UI does not call API" rule, we will only show what is in `comment.replies`.
  // The polling service attempts to fetch sub-replies.
  
  const allSubReplies = comment.replies || [];
  const subReplies = onlyShowUP 
    ? allSubReplies.filter(r => upName && r.userName === upName)
    : allSubReplies;
  const isUp = upName && comment.userName === upName;
  const isUnread = isUp && !comment.isRead;

  return (
    <div className={`flex ${isSub ? 'mt-2' : 'mt-3'} ${isUnread ? 'bg-primary/5 p-2 rounded-lg border border-primary/20' : ''}`}>
      <img src={comment.userFace} alt={comment.userName} className={`${isSub ? 'w-5 h-5' : 'w-7 h-7'} rounded-full mr-2.5 shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-0.5 items-start">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`font-semibold ${isSub ? 'text-[0.75rem]' : 'text-[0.8rem]'}`}>{comment.userName}</span>
            {comment.isPinned && (
              <span className="text-[0.65rem] text-primary bg-primary/10 px-1 py-0.5 rounded border border-primary shrink-0">置顶</span>
            )}
            {isUp && (
              <span className="text-[0.65rem] text-white bg-primary px-1 py-0.5 rounded shrink-0">UP</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] text-text-secondary! whitespace-nowrap">
              {dayjs(comment.timestamp * 1000).format('MM-DD HH:mm:ss')}
            </span>
            {isUnread && onMarkRead && (
                <button 
                  onClick={() => onMarkRead(comment.id, false)}
                  className="flex items-center text-[0.65rem] hover:text-primary! hover:bg-primary/10 px-1.5 py-0.5 rounded border border-primary transition-colors cursor-pointer"
                  title="标记为已读"
                >
                  <CheckCircle size={12} className="mr-1" />
                  <span>已读</span>
                </button>
            )}
          </div>
        </div>
        <div className={`text-text-primary leading-snug ${isSub ? 'text-[0.8rem]' : 'text-[0.85rem]'}`}>{comment.content}</div>
        
        {subReplies.length > 0 && (
          <div className="mt-1.5">
            {subReplies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                isSub={true} 
                upName={upName}
                onMarkRead={onMarkRead}
                onlyShowUP={onlyShowUP}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentSection: FC<CommentSectionProps> = ({ comments, upName, onMarkRead, onlyShowUP }) => {
  if (!comments || comments.length === 0) return <div className="p-2 text-[0.75rem] text-text-secondary">暂无评论或数据未更新</div>;
  
  // 过滤评论：只看UP时，只显示UP主的评论或包含UP主回复的评论
  const filteredComments = onlyShowUP 
    ? comments.filter(c => {
        const isUp = upName && c.userName === upName;
        const hasUpReply = c.replies?.some(r => upName && r.userName === upName);
        return isUp || hasUpReply;
      })
    : comments;

  if (onlyShowUP && filteredComments.length === 0) {
    return <div className="p-2 text-[0.75rem] text-text-secondary">该动态下暂无UP主的评论</div>;
  }

  return (
    <div className="px-4 pb-4 border-t border-border bg-black/5 dark:bg-black/10">
      {filteredComments.map(comment => (
        <CommentItem 
            key={comment.id} 
            comment={comment} 
            upName={upName}
            onMarkRead={onMarkRead}
            onlyShowUP={onlyShowUP}
        />
      ))}
    </div>
  );
};

export default CommentSection;
