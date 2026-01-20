import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { fetchComments, fetchSubReplies } from '../lib/api';
import type { Comment as BiliComment } from '../types';
import dayjs from 'dayjs';
import { getSettings } from '../lib/storage';

interface CommentSectionProps {
  oid: string;
  type: number;
}

const CommentItem: FC<{ 
  comment: BiliComment; 
  oid: string; 
  type: number; 
  isSub?: boolean;
}> = ({ comment, oid, type, isSub }) => {
  const [subReplies, setSubReplies] = useState<BiliComment[]>(comment.replies || []);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const { cookie } = getSettings();

  const handleLoadMore = async () => {
    setLoading(true);
    // If it's the first load of more replies, we might want to skip the ones already pre-fetched
    // Bilibili API usually returns the first 3 sub-replies in the main response.
    // However, calling /reply/reply with pn=1 returns the first few.
    // For simplicity, we'll just fetch next page if we have a lot, or just fetch all if it's small.
    const nextPage = page + 1;
    const data = await fetchSubReplies(oid, type, comment.rootId || comment.id, cookie, 10, page);
    
    // Filter out duplicates if any (by id)
    const newReplies = data.filter(r => !subReplies.find(sr => sr.id === r.id));
    setSubReplies([...subReplies, ...newReplies]);
    setPage(nextPage);
    setLoading(false);
  };

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
              <CommentItem key={reply.id} comment={reply} oid={oid} type={type} isSub={true} />
            ))}
          </div>
        )}

        {!isSub && hasMore && (
          <button 
            onClick={handleLoadMore}
            disabled={loading}
            className="text-primary text-[0.75rem] py-0.5 mt-0.5 hover:opacity-80 disabled:opacity-60"
          >
            {loading ? '正在加载...' : `共 ${comment.replyCount} 条回复，点击查看更多`}
          </button>
        )}
      </div>
    </div>
  );
};

const CommentSection: FC<CommentSectionProps> = ({ oid, type }) => {
  const [comments, setComments] = useState<BiliComment[]>([]);
  const [loading, setLoading] = useState(false);
  const { cookie } = getSettings();

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      const data = await fetchComments(oid, type, cookie);
      setComments(data);
      setLoading(false);
    };
    loadComments();
  }, [oid, type, cookie]);

  if (loading) return <div className="p-2 text-[0.75rem] text-text-secondary">正在加载评论...</div>;
  if (comments.length === 0) return <div className="p-2 text-[0.75rem] text-text-secondary">暂无评论</div>;

  return (
    <div className="px-4 pb-4 border-t border-border bg-black/5 dark:bg-black/10">
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} oid={oid} type={type} />
      ))}
    </div>
  );
};

export default CommentSection;
