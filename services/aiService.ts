import { API_URL } from './videoService';
import { Video } from '../components/types';

// AI chat goes through api/server.js, which holds the Gemini key. Without an API there is no AI.
export const isAiAvailable = Boolean(API_URL);

export const askVideoAI = async (video: Video, message: string): Promise<string> => {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, videoTitle: video.title, videoDescription: video.description })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `AI request failed (${response.status})`);
  return data.text || 'Connection glitch. Try again.';
};
