
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import VideoCard from './components/VideoCard';
import VideoPlayer from './components/VideoPlayer';
import HistoryView from './components/HistoryView';
import ShortsView from './components/ShortsView';
import { fetchVideos, fetchVideoById, formatCategory, localVideos } from './services/videoService';
import { videoIdFromPath, videoPath } from './services/videoUrl.js';
import { Video, AppView } from './components/types';
import { Sparkles, X, Search, Zap, Trophy, Play } from 'lucide-react';
import { proxyThumb } from './components/thumbProxy';
import AdBanner from './components/AdBanner';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 font-sans">
          <div className="max-w-lg text-center border border-red-900/50 bg-red-950/10 p-8 rounded-lg">
            <h1 className="text-3xl font-black text-[#d60000] mb-4 uppercase tracking-tighter">System Error</h1>
            <p className="mb-4 text-zinc-400">The application encountered a critical error.</p>
            <pre className="bg-black p-4 rounded text-left text-xs text-red-400 overflow-auto mb-6 border border-white/10 max-h-60">
              {this.state.error?.toString()}
            </pre>
            <button onClick={() => window.location.reload()} className="bg-white text-black px-6 py-3 rounded-sm font-black uppercase tracking-widest hover:bg-[#d60000] hover:text-white transition-all">
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [history, setHistory] = useState<Video[]>([]);
  const [searchSuggestion, setSearchSuggestion] = useState<string | null>(null);
  // Incremented per request so responses for an outdated search/category are ignored
  const requestId = useRef(0);

  const allVideos = useMemo(() => {
    // Combine fetched videos with local data for recommendations
    const fetchedIds = new Set(videos.map(v => v.id));
    return [...videos, ...localVideos.filter(v => !fetchedIds.has(v.id))];
  }, [videos]);

  const loadVideos = async (p: number, search: string, cat: string, reset: boolean) => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const result = await fetchVideos({ page: p, search, category: cat });
      if (id !== requestId.current) return;
      setVideos(prev => reset ? result.videos : [...prev, ...result.videos]);
      setHasMore(result.hasMore);
      setPage(p);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos(1, searchQuery, activeCategory, true);
  }, [searchQuery, activeCategory]);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  };

  // Open the video named in the URL (/video/<slug>-<id>) on load and on back/forward
  useEffect(() => {
    const syncFromLocation = async () => {
      const id = videoIdFromPath(window.location.pathname);
      if (id === null) {
        setSelectedVideo(null);
        return;
      }
      const video = await fetchVideoById(id);
      if (video) {
        setSelectedVideo(video);
      } else {
        window.history.replaceState(null, '', '/');
        setSelectedVideo(null);
      }
    };
    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, []);

  useEffect(() => {
    document.title = selectedVideo
      ? `${selectedVideo.title} | XP Videos`
      : `XP Videos | Best ${activeCategory === 'All' ? 'Home' : formatCategory(activeCategory)} Videos - High Quality Streaming`;
  }, [selectedVideo, activeCategory]);

  const handleLoadMore = () => {
    if (loading) return;
    loadVideos(page + 1, searchQuery, activeCategory, false);
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('xp_video_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('xp_video_history', JSON.stringify(history));
  }, [history]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView('home');
    setSearchSuggestion(null);
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    navigate(videoPath(video));
    setHistory(prev => {
      const filtered = prev.filter(v => v.id !== video.id);
      return [video, ...filtered].slice(0, 100);
    });
  };

  const handleViewChange = (view: AppView) => {
    setCurrentView(view);
    setSelectedVideo(null);
    navigate('/');
    if (view === 'home') {
      setActiveCategory('All');
      setSearchQuery('');
    }
  };

  const renderContent = () => {
    if (selectedVideo) {
      return (
        <VideoPlayer 
          video={selectedVideo} 
          onBack={() => { setSelectedVideo(null); navigate('/'); }}
          relatedVideos={allVideos}
          onVideoSelect={handleVideoClick}
        />
      );
    }

    switch (currentView) {
      case 'history':
        return <HistoryView videos={history} onVideoSelect={handleVideoClick} onClearHistory={() => setHistory([])} />;
      case 'shorts':
        return <ShortsView videos={videos} />;
      case 'library':
        return (
          <div className="py-20 text-center opacity-30 flex flex-col items-center">
            <Trophy size={64} className="mb-4 text-[#d60000]" />
            <h2 className="text-3xl font-black uppercase tracking-tighter">Your Collections</h2>
            <p className="mt-2 text-zinc-500 font-bold uppercase text-xs tracking-widest">Login to sync your library across devices</p>
          </div>
        );
      default:
        return (
          <div className="space-y-8 mt-6">
            {searchQuery && (
               <div className="bg-[#1e1e1e] border-l-4 border-[#d60000] p-5 flex items-center justify-between animate-in slide-in-from-left duration-300">
                 <div className="flex flex-col">
                   <div className="flex items-center gap-2 text-[#d60000] font-black uppercase text-xs tracking-widest">
                      <Search size={16} />
                      <span>Smart Search Results</span>
                   </div>
                   <p className="text-zinc-400 text-sm mt-1">
                     Showing Elite results for "<span className="text-white font-bold italic">{searchQuery}</span>"
                   </p>
                 </div>
                 <button onClick={() => { setSearchQuery(''); }} className="p-2 hover:bg-zinc-800 rounded-sm">
                   <X size={20} />
                 </button>
               </div>
            )}

            {!searchQuery && activeCategory === 'All' && videos.length > 0 && (
                <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden group cursor-pointer shadow-2xl rounded-sm border border-white/5" onClick={() => handleVideoClick(videos[0])}>
                   <img 
                    src={proxyThumb(videos[0]?.thumbnail, videos[0]?.id)} 
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" 
                    alt="Featured"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-transparent to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 p-8 md:p-14 flex flex-col justify-end">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="bg-[#d60000] px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest text-white shadow-xl">XP FEATURED</div>
                        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest text-white border border-white/10">PREMIUM HQ</div>
                     </div>
                     <h2 className="text-4xl md:text-7xl font-black max-w-5xl leading-[0.85] tracking-tighter uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                       {videos[0]?.title}
                     </h2>
                     <div className="flex items-center gap-8 mt-6 text-sm font-black text-zinc-400 uppercase tracking-tight">
                        <span className="flex items-center gap-2 text-[#d60000]"><div className="w-2 h-2 rounded-full bg-[#d60000] animate-pulse"></div> TRENDING NOW</span>
                        <span className="hover:text-white transition-colors">{videos[0]?.channelName}</span>
                        <span>{videos[0]?.views} Views</span>
                        <button className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-sm text-xs font-black hover:bg-[#d60000] hover:text-white transition-all ml-auto">
                          <Play size={14} fill="currentColor" /> WATCH NOW
                        </button>
                     </div>
                  </div>
               </div>
            )}

            <div className="flex flex-col gap-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                     {searchQuery ? 'Search Results' : activeCategory === 'All' ? 'Recent High-Performers' : `Directory: ${formatCategory(activeCategory)}`}
                     <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-[#d60000]">({videos.length} videos)</span>
                  </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-12">
                {videos.map(video => (
                  <VideoCard key={video.id} video={video} onClick={handleVideoClick} />
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center mt-12">
                   <button 
                     onClick={handleLoadMore}
                     disabled={loading}
                     className="px-8 py-3 bg-white text-black font-black uppercase text-xs hover:bg-[#d60000] hover:text-white transition-all"
                   >
                     {loading ? 'Loading More...' : 'Load More Videos'}
                   </button>
                </div>
              )}
            </div>

            {/* Footer Ad Banner */}
            <AdBanner className="border border-white/5 bg-[#121212] p-4 rounded-sm mt-12" />
          </div>
        );
    }
  };

  return (
    <Layout 
      onSearch={handleSearch} 
      activeCategory={activeCategory} 
      onCategoryChange={setActiveCategory}
      currentView={currentView}
      onViewChange={handleViewChange}
    >
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
