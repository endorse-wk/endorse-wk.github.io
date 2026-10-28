// Shared by the app (services/videoService.ts, App.tsx) and the build (scripts/prerender.js),
// so page URLs, the sitemap and client-side routing always agree. Plain JS so Node can run it directly.

const NAMED_ENTITIES = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', szlig: 'ß' };
const ACCENT_MARKS = { acute: '́', grave: '̀', circ: '̂', uml: '̈', tilde: '̃', cedil: '̧', ring: '̊' };

/**
 * Decodes HTML entities in scraped titles. The source CSV stores them with "_" in place of ";"
 * (e.g. "A&ntilde_os", "Orihime&#039_s"), so both terminators are accepted.
 * @param {string} title
 * @returns {string}
 */
export const cleanTitle = (title) =>
  (title || '')
    .replace(/&#(\d+)[;_]/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+)[;_]/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-zA-Z])(acute|grave|circ|uml|tilde|cedil|ring)[;_]/g, (_, letter, accent) => (letter + ACCENT_MARKS[accent]).normalize('NFC'))
    .replace(/&([a-z]+)[;_]/g, (match, name) => NAMED_ENTITIES[name] ?? match)
    .trim();

/**
 * @param {{ id: number, title: string }} video
 * @returns {string} e.g. "fiery-brunette-model-gets-fucked-2"
 */
export const videoSlug = (video) => {
  const base = cleanTitle(video.title)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
  return `${base || 'video'}-${video.id}`;
};

/**
 * @param {{ id: number, title: string }} video
 * @returns {string}
 */
export const videoPath = (video) => `/video/${videoSlug(video)}`;

/**
 * Extracts the video id from a path like "/video/some-title-123".
 * @param {string} pathname
 * @returns {number | null}
 */
export const videoIdFromPath = (pathname) => {
  const match = pathname.match(/^\/video\/(?:[^/]*-)?(\d+)\/?$/);
  return match ? Number(match[1]) : null;
};
