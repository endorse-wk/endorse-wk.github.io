import React from 'react';
import { Video } from './types';
import { Play, MoreVertical } from 'lucide-react';
import { proxyThumb } from './thumbProxy';

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  const isHD = Math.random() > 0.3;

  return (
    <div 
      className="flex flex-col gap-2 group cursor-pointer"
      onClick={() => onClick(video)}
    >
      <div className="relative aspect-video rounded-sm overflow-hidden bg-black shadow-lg">
        <img 
          src={proxyThumb(video.thumbnail, video.id)} 
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = `https://picsum.photos/seed/${video.id}/640/360`; }}
          alt={video.title} 
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <div className="w-14 h-14 rounded-full border-2 border-white/50 flex items-center justify-center backdrop-blur-sm">
              <Play fill="white" className="text-white ml-1" size={24} />
           </div>
        </div>

        {/* Info Badges */}
        <div className="absolute bottom-2 right-2 flex gap-1 items-center">
          {isHD && <div className="bg-[#d60000] text-white text-[9px] font-black px-1 rounded-sm tracking-tighter shadow-sm">4K</div>}
          <div className="bg-black/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm border border-white/10">
            {video.duration}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-0.5 px-0.5">
        <h3 className="text-sm font-bold leading-tight line-clamp-2 text-[#eee] group-hover:text-[#d60000] transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
           <div className="flex flex-col">
             <span className="text-[11px] text-zinc-500 font-bold hover:text-white transition-colors">{video.channelName}</span>
             <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold">
               <span className="text-zinc-400">{video.views} Views</span>
               <span className="text-zinc-800">•</span>
               <span>{video.uploadDate}</span>
             </div>
           </div>
           <button className="text-zinc-700 hover:text-white transition-colors p-1 opacity-0 group-hover:opacity-100">
             <MoreVertical size={14} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;