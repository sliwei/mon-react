import { useState } from 'react';
import dayjs from 'dayjs';
import type { DynamicContent } from '../types';
import CommentSection from './CommentSection';
import { MessageSquare } from 'lucide-react';

interface DynamicCardProps {
  dynamic: DynamicContent;
}

const DynamicCard: React.FC<DynamicCardProps> = ({ dynamic }) => {
  const [showComments, setShowComments] = useState(false);
  const formattedTime = dayjs(dynamic.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss');

  return (
    <div className="dynamic-card">
      <div className="dynamic-card-top" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{formattedTime}</span>
        <button onClick={() => setShowComments(!showComments)} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <MessageSquare size={14} style={{ marginRight: 4 }} />
          评论
        </button>
      </div>
      <div className="dynamic-card-body" onClick={() => window.open(dynamic.jumpUrl, '_blank')} style={{ cursor: 'pointer' }}>
        {(dynamic.cover || dynamic.images.length > 0) && (
          <div className="dynamic-images">
            {dynamic.cover ? (
              <img src={dynamic.cover} alt="cover" className="dynamic-img" />
            ) : (
              <img src={dynamic.images[0]} alt="img" className="dynamic-img" />
            )}
            {dynamic.images.length > 1 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                共 {dynamic.images.length} 张图
              </div>
            )}
          </div>
        )}
        <div className="dynamic-content">
          {dynamic.title && <h3 className="dynamic-title">{dynamic.title}</h3>}
          <div className="dynamic-desc">{dynamic.description}</div>
        </div>
      </div>
      {showComments && <CommentSection oid={dynamic.commentOid} type={dynamic.commentType} />}
    </div>
  );
};

export default DynamicCard;
