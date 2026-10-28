
import React, { useState } from 'react';
import { Search, Menu, X, User, Bell, Upload, Video, Home, PlayCircle, Clock, ThumbsUp, Zap, Library, TrendingUp, Star, Award, ChevronRight } from 'lucide-react';
import { AppView } from './types';
import { categories as videoCategories, formatCategory } from '../services/videoService';

interface LayoutProps {
  children: React.ReactNode;
  onSearch: (q: string) => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onSearch, activeCategory, onCategoryChange, currentView, onViewChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  // Derived from the categories actually present in data/videos.json
  const categories = ['All', ...videoCategories];

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0b0b] text-[#eee]">
      {/* JSON-LD Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VideoGallery",
          "name": "XP Videos",
          "description": "Premium high-definition video portal with daily updates.",
          "provider": {
            "@type": "Organization",
            "name": "XP Video",
            "url": "https://endorse-wk.github.io/"
          }
        })}
      </script>

      {/* Premium Banner Ticker */}
      <div className="bg-[#d60000] py-1 shadow-lg z-[60] relative">
        <div className="max-w-[1400px] mx-auto flex justify-center overflow-hidden whitespace-nowrap">
           <div className="inline-block animate-[ticker_40s_linear_infinite] px-4 text-[11px] font-black tracking-tighter uppercase text-white">
             XP VIDEO ELITE: 4K STREAMING NOW AVAILABLE FOR ALL USERS • TRENDING: GLOBAL AI SUMMIT 2025 • NEW FEATURE: XP AI ASSISTANT IN PLAYER • BEST OF THE WEEK: SPACE EXPLORATION SERIES • JOIN THE XP CREATOR PROGRAM TODAY • 
           </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-[#121212] px-4 py-3 flex items-center justify-between border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 md:gap-6">
          <button className="lg:hidden text-zinc-400 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onViewChange('home')}>
            <div className="hidden sm:block bg-[#d60000] p-1.5 rounded-sm transform group-hover:rotate-12 transition-transform">
              <PlayCircle size={28} className="text-white fill-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-white">XP<span className="text-[#d60000]">VIDEOS</span></span>
          </div>

          <nav className="hidden xl:flex items-center gap-6 text-sm font-bold text-zinc-400 uppercase tracking-tight">
            <button onClick={() => onViewChange('home')} className="hover:text-[#d60000] transition-colors">Videos</button>
            <button onClick={() => onViewChange('shorts')} className="hover:text-[#d60000] transition-colors">Shorts</button>
            <button className="hover:text-[#d60000] transition-colors">Live</button>
            <button className="hover:text-[#d60000] transition-colors">Premium</button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="hidden lg:flex flex-1 max-w-xl mx-8">
          <div className="flex w-full relative group">
            <input
              type="text"
              placeholder="Search for videos, channels, or tags..."
              className="w-full bg-[#1e1e1e] border border-white/10 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-[#d60000] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-0 top-0 bottom-0 px-4 bg-[#2a2a2a] hover:bg-[#d60000] transition-colors rounded-r-sm">
              <Search size={18} />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3 md:gap-5">
          <button className="lg:hidden p-1.5 text-zinc-400 hover:text-white transition-colors" onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}>
            <Search size={20} />
          </button>
          <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#d60000]/10 border border-[#d60000]/20 rounded-sm text-xs font-bold text-[#d60000] hover:bg-[#d60000] hover:text-white transition-all">
            <Upload size={16} />
            UPLOAD
          </button>
          <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>
          <button className="hidden sm:block p-1.5 text-zinc-400 hover:text-white transition-colors"><Bell size={20} /></button>
          <div className="flex items-center gap-2 bg-[#1e1e1e] pl-1 pr-3 py-1 rounded-sm border border-white/5 cursor-pointer hover:bg-[#2a2a2a] transition-colors">
            <div className="w-7 h-7 bg-zinc-700 rounded-sm flex items-center justify-center overflow-hidden">
               <User size={16} className="text-zinc-400" />
            </div>
            <span className="text-xs font-bold hidden md:block uppercase">Sign In</span>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar */}
      {isMobileSearchOpen && (
        <div className="lg:hidden bg-[#1a1a1a] p-3 border-b border-white/10 relative z-40">
           <form onSubmit={(e) => { handleSubmit(e); setIsMobileSearchOpen(false); }} className="flex w-full relative">
              <input
                 type="text"
                 placeholder="Search videos..."
                 className="w-full bg-[#2a2a2a] border border-white/10 rounded-sm px-4 py-2 pr-10 text-sm focus:outline-none focus:border-[#d60000] text-white"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 autoFocus
              />
              <button type="submit" className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-zinc-400 hover:text-white">
                <Search size={18} />
              </button>
           </form>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] lg:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-[#121212] border-r border-white/10 flex flex-col overflow-y-auto" onClick={e => e.stopPropagation()}>
             <div className="p-4 flex items-center justify-between border-b border-white/10">
               <div className="flex items-center gap-2">
                 <span className="text-xl font-black tracking-tighter text-white">XP<span className="text-[#d60000]">VIDEOS</span></span>
               </div>
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-400 hover:text-white"><X size={24} /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
                <DirectoryItem icon={<Home size={18} />} label="Main Page" active={currentView === 'home'} onClick={() => { onViewChange('home'); setIsMobileMenuOpen(false); }} />
                <DirectoryItem icon={<TrendingUp size={18} />} label="Trending Now" />
                <DirectoryItem icon={<Zap size={18} />} label="Short Clips" active={currentView === 'shorts'} onClick={() => { onViewChange('shorts'); setIsMobileMenuOpen(false); }} />
                <DirectoryItem icon={<Clock size={18} />} label="Watch History" active={currentView === 'history'} onClick={() => { onViewChange('history'); setIsMobileMenuOpen(false); }} />
                
                <div className="my-4 px-3">
                   <div className="h-px bg-white/5"></div>
                </div>

                <div className="px-3 mb-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Directory</div>
                {categories.slice(1).map(cat => (
                  <button
                    key={cat}
                    onClick={() => { onCategoryChange(cat); onViewChange('home'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-sm text-xs font-bold transition-all ${activeCategory === cat ? 'bg-[#d60000] text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-1 rounded-full ${activeCategory === cat ? 'bg-white' : 'bg-[#d60000]'}`}></div>
                      <span>{formatCategory(cat)}</span>
                    </div>
                    <ChevronRight size={12} className="opacity-30" />
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Elite Directory Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 bg-[#121212] border-r border-white/5 overflow-y-auto no-scrollbar py-4 px-2 gap-1">
          <DirectoryItem icon={<Home size={18} />} label="Main Page" active={currentView === 'home'} onClick={() => onViewChange('home')} />
          <DirectoryItem icon={<TrendingUp size={18} />} label="Trending Now" />
          <DirectoryItem icon={<Star size={18} />} label="Top Rated" />
          <DirectoryItem icon={<Award size={18} />} label="Verified" />
          
          <div className="my-4 px-3">
             <div className="h-px bg-white/5"></div>
          </div>

          <div className="px-3 mb-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Navigation</div>
          <DirectoryItem icon={<Zap size={18} />} label="Short Clips" active={currentView === 'shorts'} onClick={() => onViewChange('shorts')} />
          <DirectoryItem icon={<Clock size={18} />} label="Watch History" active={currentView === 'history'} onClick={() => onViewChange('history')} />
          <DirectoryItem icon={<Library size={18} />} label="Library" active={currentView === 'library'} onClick={() => onViewChange('library')} />
          <DirectoryItem icon={<ThumbsUp size={18} />} label="Favorites" />

          <div className="my-4 px-3">
             <div className="h-px bg-white/5"></div>
          </div>

          <div className="px-3 mb-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Directory</div>
          {categories.slice(1).map(cat => (
             <button
                key={cat}
                onClick={() => { onCategoryChange(cat); onViewChange('home'); }}
                className={`flex items-center justify-between px-3 py-2 rounded-sm text-xs font-bold transition-all ${activeCategory === cat ? 'bg-[#d60000] text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
             >
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-1 rounded-full ${activeCategory === cat ? 'bg-white' : 'bg-[#d60000]'}`}></div>
                  <span>{formatCategory(cat)}</span>
                </div>
                <ChevronRight size={12} className="opacity-30" />
             </button>
          ))}
          
          <div className="mt-auto pt-6 px-3">
             <div className="p-3 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-sm border border-white/5">
                <div className="text-[10px] font-black text-[#d60000] mb-1">XP PREMIUM</div>
                <p className="text-[9px] text-zinc-500 leading-tight">Join for exclusive 8K content and ad-free experience.</p>
             </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#0b0b0b]">
          {currentView === 'home' && (
            <div className="flex items-center gap-2 py-4 px-6 md:px-10 overflow-x-auto no-scrollbar bg-[#121212]/50 border-b border-white/5">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-4">Tags:</span>
              {['New', 'Most Viewed', 'Top Rated', 'Recommended', 'Popular'].map(tag => (
                <button 
                  key={tag}
                  className="whitespace-nowrap px-3 py-1 bg-[#222] hover:bg-[#d60000] text-white text-[10px] font-black rounded-sm uppercase tracking-tighter transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
          <div className="px-6 md:px-10 pb-20">
            {children}
          </div>
        </main>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(50%); }
          100% { transform: translateX(-150%); }
        }
      `}</style>
    </div>
  );
};

const DirectoryItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all text-sm ${active ? 'bg-[#d60000] text-white font-bold' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
  >
    <span className={active ? 'text-white' : 'text-[#d60000]'}>{icon}</span>
    <span className="tracking-tight">{label}</span>
  </button>
);

export default Layout;
