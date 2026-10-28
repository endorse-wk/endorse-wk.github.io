export type AppView = 'home' | 'shorts' | 'history' | 'library';

export interface Video {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  uploadDate: string;
  channelName: string;
  videoUrl: string;
  category?: string;
  tags?: string;
  isShort?: boolean;
  description?: string;
}