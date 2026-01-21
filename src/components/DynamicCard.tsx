import React, { useState } from 'react';
import type { DynamicContent } from '../types';
import dayjs from 'dayjs';
import { MessageSquare } from 'lucide-react';
import CommentSection from './CommentSection';
import ImagePreview from './ImagePreview';

interface DynamicCardProps {
  dynamic: DynamicContent;
}

const DynamicCard: React.FC<DynamicCardProps> = ({ dynamic }) => {
  const [showComments, setShowComments] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images = dynamic.cover ? [dynamic.cover, ...dynamic.images] : dynamic.images;
  const formattedTime = dayjs(dynamic.timestamp * 1000).format('YYYY年MM月DD日 HH时mm分ss秒');

  const openPreview = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentImgIndex(index);
    setIsPreviewOpen(true);
  };

  return (
    <div className="bg-card border border-border rounded-xl mb-4 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/30 shadow-sm">
      <div className="px-4 py-2 border-b border-border text-[0.75rem] text-text-secondary flex justify-between bg-black/5 dark:bg-black/10">
        <span className="">{formattedTime}</span>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center text-text-secondary hover:text-primary transition-colors">
          <MessageSquare size={12} className="mr-1" />
          评论
        </button>
      </div>
      <div className="flex p-4">
        {images.length > 0 && (
          <div className="w-36 mr-4 shrink-0">
            <div 
              className="relative group cursor-zoom-in aspect-video rounded-md overflow-hidden bg-black/5 dark:bg-black/20"
              onClick={(e) => openPreview(e, 0)}
            >
              <img 
                src={images[0]} 
                alt="preview" 
                className="w-full h-full object-cover transition-opacity group-hover:opacity-80" 
              />
              {images.length > 1 && (
                <div className="absolute right-1 bottom-1 px-1 py-0.5 bg-black/60 text-white text-[0.6rem] rounded backdrop-blur-sm">
                  {images.length}张
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 
            className="text-base font-semibold mb-2 text-text-primary line-clamp-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => window.open(dynamic.jumpUrl, '_blank')}
          >
            {dynamic.title || dynamic.description}
          </h3>
        </div>
      </div>
      {showComments && <CommentSection oid={dynamic.commentOid} type={dynamic.commentType} comments={dynamic.comments} />}

      <ImagePreview 
        images={images} 
        isOpen={isPreviewOpen} 
        initialIndex={currentImgIndex}
        onClose={() => setIsPreviewOpen(false)} 
      />
    </div>
  );
};

export default DynamicCard;
