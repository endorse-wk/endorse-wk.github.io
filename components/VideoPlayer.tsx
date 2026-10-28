
import React, { useEffect, useState, useRef } from 'react';
import { Video } from './types';
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Sparkles, ChevronDown, ChevronUp, Send, Bot, X, Heart } from 'lucide-react';
import { proxyThumb } from './thumbProxy';
import AdBanner from './AdBanner';
import { askVideoAI, isAiAvailable } from '../services/aiService';

interface VideoPlayerProps {
  video: Video;
  onBack: () => void;
  relatedVideos: Video[];
  onVideoSelect: (video: Video) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, relatedVideos, onVideoSelect }) => {
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Persistent Reaction State
  const likeKey = `xp_like_v_${video.id}`;
  const dislikeKey = `xp_dislike_v_${video.id}`;
  
  const [liked, setLiked] = useState(() => localStorage.getItem(likeKey) === 'true');
  const [disliked, setDisliked] = useState(() => localStorage.getItem(dislikeKey) === 'true');
  const [localLikeCount, setLocalLikeCount] = useState(124);
  const [showReactionOverlay, setShowReactionOverlay] = useState<'like' | null>(null);

  useEffect(() => {
    setChatHistory([{ role: 'ai', text: `XP AI here. Analyzing "${video.title}"... Ready for your questions!` }]);
    
    // Reset state for new video
    const currentLiked = localStorage.getItem(`xp_like_v_${video.id}`) === 'true';
    const currentDisliked = localStorage.getItem(`xp_dislike_v_${video.id}`) === 'true';
    setLiked(currentLiked);
    setDisliked(currentDisliked);
    setLocalLikeCount(124 + Math.floor(Math.random() * 20));
    window.scrollTo(0, 0);
  }, [video]);

  useEffect(() => {
    localStorage.setItem(likeKey, liked.toString());
    localStorage.setItem(dislikeKey, disliked.toString());
  }, [liked, disliked, likeKey, dislikeKey]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setDisliked(false);
      setLocalLikeCount(prev => prev + 1);
      setShowReactionOverlay('like');
      setTimeout(() => setShowReactionOverlay(null), 1000);
    } else {
      setLiked(false);
      setLocalLikeCount(prev => prev - 1);
    }
  };

  const handleDislike = () => {
    if (!disliked) {
      setDisliked(true);
      setLiked(false);
      if (liked) setLocalLikeCount(prev => prev - 1);
    } else {
      setDisliked(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);

    try {
      const text = await askVideoAI(video, userMsg);
      setChatHistory(prev => [...prev, { role: 'ai', text }]);
    } catch (err) {
      console.error('XP AI error:', err);
      setChatHistory(prev => [...prev, { role: 'ai', text: "Error connecting to XP AI." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col pt-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto px-4 md:px-0">
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1">
          {/* Cinema Player */}
          <div className="relative aspect-video bg-black shadow-[0_0_60px_rgba(0,0,0,1)] ring-1 ring-white/10 group overflow-hidden">
            <iframe 
              src={video.videoUrl} 
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              title={video.title}
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            />
            {showReactionOverlay === 'like' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                <Heart size={150} fill="#d60000" className="text-[#d60000] animate-[ping_1s_ease-out_infinite] opacity-50" />
              </div>
            )}
          </div>

          <div className="mt-6 border-b border-white/5 pb-6">
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none mb-6 drop-shadow-lg">{video.title}</h1>
            
            <div className="flex flex-wrap items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-sm bg-gradient-to-br from-zinc-700 to-black border border-white/10 overflow-hidden flex-shrink-0 p-0.5">
                  <img src={`https://picsum.photos/seed/c_${video.channelName}/64/64`} alt="channel" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-base uppercase tracking-tight">{video.channelName}</span>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-[#d60000] tracking-widest uppercase bg-[#d60000]/10 px-1">Elite Creator</span>
                     <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">1.2M Subs</span>
                  </div>
                </div>
                <button className="ml-6 bg-[#d60000] text-white px-8 py-3 rounded-sm font-black text-xs uppercase tracking-widest hover:bg-[#ff0000] transition-all shadow-xl shadow-red-900/30 active:scale-95">
                  Subscribe
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#1e1e1e] border border-white/10 rounded-sm p-1">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-6 py-2.5 hover:bg-zinc-800 transition-all rounded-sm ${liked ? 'text-[#d60000] bg-white/5' : 'text-zinc-400'}`}
                  >
                    <ThumbsUp size={20} fill={liked ? "currentColor" : "none"} className={liked ? 'scale-110' : ''} />
                    <span className="text-sm font-black uppercase tracking-widest">{localLikeCount}K</span>
                  </button>
                  <button 
                    onClick={handleDislike}
                    className={`px-6 py-2.5 hover:bg-zinc-800 transition-all rounded-sm ${disliked ? 'text-zinc-200 bg-zinc-800' : 'text-zinc-400'}`}
                  >
                    <ThumbsDown size={20} fill={disliked ? "currentColor" : "none"} />
                  </button>
                </div>
                <button className="flex items-center gap-2 bg-[#1e1e1e] border border-white/10 px-6 py-3 rounded-sm hover:bg-zinc-800 transition-all font-black uppercase text-xs tracking-widest">
                  <Share2 size={18} /> SHARE
                </button>
                {isAiAvailable && (
                  <button onClick={() => setShowAi(!showAi)} className={`flex items-center gap-2 ${showAi ? 'bg-[#d60000] text-white' : 'bg-[#1e1e1e] border border-white/10 text-zinc-400'} px-6 py-3 rounded-sm hover:bg-[#d60000] hover:text-white transition-all font-black uppercase text-xs tracking-widest`}>
                    <Sparkles size={18} /> XP AI
                  </button>
                )}
                <button className="p-3 bg-[#1e1e1e] border border-white/10 rounded-sm hover:bg-zinc-800 text-zinc-500 transition-colors"><MoreHorizontal size={22} /></button>
              </div>
            </div>

            <div className="mt-10 bg-[#121212] p-8 rounded-sm border border-white/5 shadow-2xl relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#d60000]"></div>
              <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-6 pb-4 border-b border-white/5">
                <span className="text-white">{video.views} Views</span>
                <span>{video.uploadDate}</span>
                <span className="text-[#d60000] hover:text-white cursor-pointer transition-colors">#TRENDING</span>
                <span className="text-zinc-400 hover:text-white cursor-pointer transition-colors">#ELITE_XP</span>
              </div>
              
              <div className={`text-base leading-relaxed text-zinc-400 font-medium ${isDescOpen ? '' : 'line-clamp-3'}`}>
                {video.description}
              </div>
              
              <button onClick={() => setIsDescOpen(!isDescOpen)} className="mt-6 text-[10px] font-black uppercase tracking-widest text-[#d60000] hover:text-white transition-colors flex items-center gap-1">
                {isDescOpen ? <><ChevronUp size={14}/> SHOW LESS</> : <><ChevronDown size={14}/> SHOW MORE</>}
              </button>
            </div>

            {/* ExoClick Ad Banner */}
            <AdBanner className="border border-white/5 bg-[#121212] p-4 rounded-sm" />
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="w-full xl:w-[450px] flex flex-col gap-10">
          {showAi && (
            <div className="bg-[#121212] border border-[#d60000]/30 rounded-sm flex flex-col h-[600px] shadow-[0_0_50px_rgba(214,0,0,0.15)] animate-in slide-in-from-right-10 duration-500">
               <div className="p-5 border-b border-white/5 bg-[#1a1a1a] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d60000] to-red-950 flex items-center justify-center text-white shadow-lg">
                      <Bot size={22} />
                    </div>
                    <div>
                      <span className="font-black text-xs uppercase tracking-widest block">XP ELITE AI</span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Active Insight Analysis</span>
                    </div>
                  </div>
                  <button onClick={() => setShowAi(false)} className="text-zinc-600 hover:text-white transition-colors"><X size={22}/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar bg-gradient-to-b from-transparent to-black/20">
                 {chatHistory.map((msg, i) => (
                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[90%] rounded-sm px-5 py-3 text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-[#d60000] text-white shadow-xl' : 'bg-[#1e1e1e] text-zinc-300 border border-white/5 shadow-md'}`}>
                       {msg.text}
                     </div>
                   </div>
                 ))}
                 {isAiLoading && (
                   <div className="flex justify-start">
                     <div className="bg-[#1e1e1e] rounded-sm px-5 py-4 flex gap-2 border border-white/5">
                        <div className="w-2 h-2 bg-[#d60000] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#d60000] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-[#d60000] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                     </div>
                   </div>
                 )}
                 <div ref={chatEndRef} />
               </div>

               <form onSubmit={handleSendMessage} className="p-5 border-t border-white/5 bg-[#0b0b0b] flex gap-3">
                 <input 
                   type="text" 
                   placeholder="Ask XP AI about this video..." 
                   value={chatInput}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)}
                   className="flex-1 bg-[#18181b] border border-white/10 rounded-sm px-5 py-3.5 text-xs font-bold focus:outline-none focus:border-[#d60000] transition-all placeholder:text-zinc-600"
                 />
                 <button type="submit" className="p-4 bg-[#d60000] text-white rounded-sm hover:bg-[#ff0000] transition-all shadow-lg active:scale-95">
                   <Send size={20} />
                 </button>
               </form>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
               <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Up Next: Best for You</h3>
               <div className="text-[10px] font-black text-[#d60000] bg-[#d60000]/10 px-2 py-0.5 rounded-sm animate-pulse uppercase">AUTO-PLAY</div>
            </div>
            {relatedVideos.filter((v: Video) => v.id !== video.id).slice(0, 15).map((v: Video) => (
              <div key={v.id} className="flex gap-4 group cursor-pointer" onClick={() => onVideoSelect(v)}>
                <div className="relative w-48 h-28 flex-shrink-0 bg-black overflow-hidden ring-1 ring-white/10 group-hover:ring-[#d60000]/50 transition-all duration-300">
                  <img src={proxyThumb(v.thumbnail, v.id)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt={v.title} />
                  <div className="absolute bottom-1 right-1 bg-black/90 px-1.5 py-0.5 rounded-sm text-[10px] font-black border border-white/10 tracking-tighter text-white">{v.duration}</div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Heart size={20} className="text-white fill-white" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 py-1 overflow-hidden">
                  <h4 className="text-xs font-black leading-[1.3] line-clamp-2 text-zinc-100 group-hover:text-[#d60000] transition-colors uppercase tracking-tight">{v.title}</h4>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                    <span className="hover:text-white transition-colors">{v.channelName}</span>
                    {Math.random() > 0.5 && <div className="w-1.5 h-1.5 rounded-full bg-[#d60000]"></div>}
                  </div>
                  <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mt-0.5">{v.views} VIEWS</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
