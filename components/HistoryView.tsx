
import React from 'react';
import { Video } from './types';
import { Trash2, History as HistoryIcon } from 'lucide-react';
import VideoCard from './VideoCard';

interface HistoryViewProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
  onClearHistory: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ videos, onVideoSelect, onClearHistory }) => {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
        <HistoryIcon size={64} className="mb-4 opacity-20" />
        <h2 className="text-2xl font-bold text-white mb-2">Keep track of what you watch</h2>
        <p className="text-zinc-400">Watch history isn't available when you're signed out.</p>
        <p className="text-zinc-500 text-sm mt-1">Start watching some videos to populate your history!</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8 px-2">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <HistoryIcon className="text-red-500" />
          Watch History
        </h1>
        <button 
          onClick={onClearHistory}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all border border-zinc-800"
        >
          <Trash2 size={16} />
          Clear history
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10">
        {videos.map((video, idx) => (
          <VideoCard 
            key={`${video.id}-${idx}`} 
            video={video} 
            onClick={onVideoSelect} 
          />
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
