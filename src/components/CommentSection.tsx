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
    <div style={{ display: 'flex', marginTop: isSub ? 12 : 16, marginLeft: isSub ? 44 : 0 }}>
      <img src={comment.userFace} alt={comment.userName} style={{ width: isSub ? 24 : 32, height: isSub ? 24 : 32, borderRadius: '50%', marginRight: 12 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: isSub ? '0.8rem' : '0.85rem', fontWeight: 600 }}>{comment.userName}</span>
            {comment.isPinned && (
              <span style={{ 
                fontSize: '0.7rem', 
                color: 'var(--primary-color)', 
                background: 'rgba(251, 114, 153, 0.1)', 
                padding: '1px 4px', 
                borderRadius: '4px',
                border: '1px solid var(--primary-color)'
              }}>置顶</span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {dayjs(comment.timestamp * 1000).format('MM-DD HH:mm')}
          </span>
        </div>
        <div style={{ fontSize: isSub ? '0.85rem' : '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{comment.content}</div>
        
        {subReplies.length > 0 && (
          <div className="sub-replies">
            {subReplies.map(reply => (
              <CommentItem key={reply.id} comment={reply} oid={oid} type={type} isSub={true} />
            ))}
          </div>
        )}

        {!isSub && hasMore && (
          <button 
            onClick={handleLoadMore}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-color)',
              fontSize: '0.8rem',
              padding: '4px 0',
              cursor: 'pointer',
              marginTop: 4,
              opacity: loading ? 0.6 : 1
            }}
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

  if (loading) return <div style={{ padding: 10, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>正在加载评论...</div>;
  if (comments.length === 0) return <div style={{ padding: 10, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>暂无评论</div>;

  return (
    <div className="comment-list" style={{ padding: '0 20px 20px 20px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} oid={oid} type={type} />
      ))}
    </div>
  );
};

export default CommentSection;
