
import React, { useState, useEffect } from 'react';
import { Video } from './types';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Heart, Music2, UserPlus, ChevronUp, ChevronDown } from 'lucide-react';
import { proxyThumb } from './thumbProxy';

interface ShortsViewProps {
  videos: Video[];
}

const ShortsView: React.FC<ShortsViewProps> = ({ videos }) => {
  const shorts = videos.filter(v => v.isShort);

  return (
    <div className="flex flex-col items-center w-full h-[calc(100vh-140px)] overflow-hidden bg-black/90">
      <div className="relative w-full max-w-[420px] h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black shadow-2xl">
        {shorts.map((short) => (
          <ShortItem key={short.id} short={short} />
        ))}
      </div>
      
      <div className="hidden lg:flex flex-col gap-4 absolute right-12 top-1/2 -translate-y-1/2 z-30">
        <button className="p-4 bg-zinc-800/80 hover:bg-[#d60000] rounded-full transition-all border border-white/10 group shadow-2xl">
          <ChevronUp size={28} className="group-hover:scale-110 transition-transform" />
        </button>
        <button className="p-4 bg-zinc-800/80 hover:bg-[#d60000] rounded-full transition-all border border-white/10 group shadow-2xl">
          <ChevronDown size={28} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const ShortItem: React.FC<{ short: Video }> = ({ short }) => {
  const storageLikeKey = `xp_like_short_${short.id}`;
  const storageDislikeKey = `xp_dislike_short_${short.id}`;
  
  const [liked, setLiked] = useState(() => localStorage.getItem(storageLikeKey) === 'true');
  const [disliked, setDisliked] = useState(() => localStorage.getItem(storageDislikeKey) === 'true');
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 10);
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageLikeKey, liked.toString());
    localStorage.setItem(storageDislikeKey, disliked.toString());
  }, [liked, disliked, short.id, storageLikeKey, storageDislikeKey]);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setDisliked(false);
      setLikeCount(prev => prev + 1);
    } else {
      setLiked(false);
      setLikeCount(prev => prev - 1);
    }
  };

  const handleDislike = () => {
    if (!disliked) {
      setDisliked(true);
      setLiked(false);
      if (liked) setLikeCount(prev => prev - 1);
    } else {
      setDisliked(false);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!liked) handleLike();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <div 
      className="relative w-full h-full snap-start bg-black group"
      onDoubleClick={handleDoubleClick}
    >
      <iframe 
        src={short.videoUrl} 
        className="w-full h-full object-cover"
        allow="autoplay; fullscreen"
        title={short.title}
        sandbox="allow-scripts allow-same-origin allow-presentation"
      />
      
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <Heart size={140} fill="#d60000" className="text-[#d60000] animate-heart" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end z-20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full border-2 border-[#d60000] overflow-hidden shadow-2xl p-0.5 bg-black">
             <img src={`https://picsum.photos/seed/avatar_${short.channelName}/64/64`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-lg uppercase tracking-tighter text-white drop-shadow-2xl">{short.channelName}</span>
              <button className="bg-[#d60000] hover:bg-white hover:text-black text-white px-3 py-1 rounded-sm text-[10px] font-black uppercase transition-all shadow-xl">
                SUBSCRIBE
              </button>
            </div>
            <span className="text-[10px] text-[#d60000] font-black uppercase tracking-widest mt-1 bg-black/60 px-2 py-0.5 inline-block rounded-sm">VERIFIED CREATOR</span>
          </div>
        </div>
        
        <h3 className="text-white text-xl font-black leading-tight mb-6 line-clamp-2 uppercase tracking-tighter drop-shadow-2xl">
          {short.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-zinc-300 font-bold bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full w-fit border border-white/10">
          <Music2 size={18} className="text-[#d60000] animate-spin [animation-duration:5s]" />
          <div className="overflow-hidden w-44 whitespace-nowrap">
            <div className="animate-[ticker_10s_linear_infinite] inline-block uppercase tracking-widest text-[10px]">
              {short.channelName} Original Audio - High Quality Sound Loop
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-4 bottom-28 flex flex-col gap-8 items-center z-30">
        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={handleLike}
            className={`p-5 ${liked ? 'bg-[#d60000] text-white' : 'bg-black/60 text-white'} backdrop-blur-2xl rounded-full hover:scale-110 active:scale-90 transition-all border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]`}
          >
            <ThumbsUp size={28} fill={liked ? "currentColor" : "none"} className={liked ? 'animate-bounce' : ''} />
          </button>
          <span className="text-xs font-black uppercase tracking-tighter text-white drop-shadow-2xl">{likeCount}K</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button 
            onClick={handleDislike}
            className={`p-5 ${disliked ? 'bg-zinc-800 text-white' : 'bg-black/60 text-white'} backdrop-blur-2xl rounded-full hover:scale-110 active:scale-90 transition-all border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]`}
          >
            <ThumbsDown size={28} fill={disliked ? "currentColor" : "none"} />
          </button>
          <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400">DISLIKE</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button className="p-5 bg-black/60 text-white backdrop-blur-2xl rounded-full hover:scale-110 active:scale-90 transition-all border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <MessageSquare size={28} />
          </button>
          <span className="text-xs font-black uppercase tracking-tighter text-white drop-shadow-2xl">3.8K</span>
        </div>

        <button className="p-5 bg-black/60 text-white backdrop-blur-2xl rounded-full hover:scale-110 active:scale-90 transition-all border border-white/20 shadow-2xl">
          <Share2 size={28} />
        </button>

        <button className="p-5 bg-black/60 text-white backdrop-blur-2xl rounded-full hover:scale-110 active:scale-90 transition-all border border-white/20 shadow-2xl">
          <MoreVertical size={28} />
        </button>

        <div className="mt-4 w-14 h-14 rounded-full bg-gradient-to-tr from-[#d60000] to-zinc-900 p-0.5 shadow-2xl border-2 border-white/30 hover:rotate-180 transition-transform duration-700 cursor-pointer overflow-hidden">
           <img 
             src={proxyThumb(short.thumbnail, short.id)}
             onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = `https://picsum.photos/seed/${short.id}/100/100`; }}
             className="w-full h-full object-cover rounded-full"
             alt="Album"
           />
        </div>
      </div>
    </div>
  );
};

export default ShortsView;
