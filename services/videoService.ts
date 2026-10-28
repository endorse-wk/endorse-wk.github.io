import videosData from '../data/videos.json';
import { Video } from '../components/types';
import { cleanTitle } from './videoUrl.js';

// Set VITE_API_URL (e.g. https://api.xxpvideos.com) to serve videos from api/server.js.
// When it is unset, or the API is unreachable, the bundled data/videos.json is queried in the browser.
export const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

export const PAGE_SIZE = 20;

interface RawVideo {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  tags?: string;
  category?: string;
  views?: string;
  uploadDate?: string;
  description?: string;
}

export const formatCategory = (category: string) =>
  category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const toVideo = (v: RawVideo): Video => ({
  id: v.id,
  title: cleanTitle(v.title),
  thumbnail: v.thumbnailUrl,
  duration: v.duration,
  views: v.views || '0',
  uploadDate: v.uploadDate || '2024-06-20',
  channelName: v.category ? `${formatCategory(v.category)} TV` : 'XP Channel',
  videoUrl: v.videoUrl,
  category: v.category || 'All',
  tags: v.tags,
  isShort: false,
  description: cleanTitle(v.description || v.title)
});

// Newest first, matching the API's ORDER BY id DESC
export const localVideos: Video[] = (videosData as RawVideo[]).map(toVideo).sort((a, b) => b.id - a.id);

// Most common categories in the bundled data, used for the sidebar directory
export const categories: string[] = (() => {
  const counts = new Map<string, number>();
  for (const v of localVideos) {
    if (v.category && v.category !== 'Unknown') counts.set(v.category, (counts.get(v.category) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([cat]) => cat);
})();

interface VideoQuery {
  page: number;
  search: string;
  category: string;
}

export interface VideoPage {
  videos: Video[];
  hasMore: boolean;
}

const queryLocal = ({ page, search, category }: VideoQuery): VideoPage => {
  const term = search.trim().toLowerCase();
  const cat = category.toLowerCase();
  const matches = localVideos.filter(v =>
    (cat === 'all' || v.category?.toLowerCase() === cat) &&
    (!term || v.title.toLowerCase().includes(term) || v.tags?.toLowerCase().includes(term))
  );
  const start = (page - 1) * PAGE_SIZE;
  return { videos: matches.slice(start, start + PAGE_SIZE), hasMore: start + PAGE_SIZE < matches.length };
};

export const fetchVideos = async (query: VideoQuery): Promise<VideoPage> => {
  if (API_URL) {
    try {
      const params = new URLSearchParams({
        page: String(query.page),
        limit: String(PAGE_SIZE),
        search: query.search,
        category: query.category
      });
      const response = await fetch(`${API_URL}/api/videos?${params}`);
      if (!response.ok) throw new Error(`API responded with ${response.status}`);
      const data = await response.json();
      const rows: RawVideo[] = Array.isArray(data) ? data : (data.videos || []);
      return { videos: rows.map(toVideo), hasMore: rows.length === PAGE_SIZE };
    } catch (error) {
      console.error('Video API unavailable, falling back to bundled data', error);
    }
  }
  return queryLocal(query);
};

export const fetchVideoById = async (id: number): Promise<Video | null> => {
  if (API_URL) {
    try {
      const response = await fetch(`${API_URL}/api/videos/${id}`);
      if (!response.ok) throw new Error(`API responded with ${response.status}`);
      const row: RawVideo | null = await response.json();
      if (row) return toVideo(row);
    } catch (error) {
      console.error('Video API unavailable, falling back to bundled data', error);
    }
  }
  return localVideos.find(v => v.id === id) || null;
};
