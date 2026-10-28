// Runs after `vite build`. Writes one static HTML page per video (dist/video/<slug>.html) with
// per-video title, meta tags and VideoObject structured data, plus a sitemap.xml that lists exactly
// those pages and a 404.html SPA fallback. GitHub Pages serves /video/<slug> from <slug>.html.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cleanTitle, videoPath } from '../services/videoUrl.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
// Keep in sync with the canonical/og:url in index.html, robots.txt and the JSON-LD in components/Layout.tsx
const SITE_URL = 'https://endorse-wk.github.io';

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const formatCategory = (c) => c.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
const durationSeconds = (d) => parseInt(d, 10) || 0;

// Replace a value in the built index.html, failing loudly if index.html no longer has the tag
const replaceOrFail = (html, pattern, replacement) => {
    if (!pattern.test(html)) throw new Error(`prerender: index.html is missing ${pattern}`);
    return html.replace(pattern, (_, before, after) => before + replacement + after);
};

const setMeta = (html, attr, key, value) =>
    replaceOrFail(html, new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), escapeHtml(value));

const renderVideoPage = (template, video) => {
    const title = cleanTitle(video.title);
    const url = SITE_URL + videoPath(video);
    const hasCategory = video.category && video.category !== 'Unknown';
    const seconds = durationSeconds(video.duration);
    const minutes = Math.max(1, Math.round(seconds / 60));
    const kind = hasCategory ? `${formatCategory(video.category)} video` : 'Video';
    const description = `Watch ${title}. ${kind}, ${minutes} min. Stream free on XP Videos.`;

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: title,
        description,
        thumbnailUrl: [video.thumbnailUrl],
        uploadDate: video.uploadDate,
        duration: `PT${seconds}S`,
        embedUrl: video.videoUrl,
        url
    };

    let html = template;
    html = replaceOrFail(html, /(<title>)[^<]*(<\/title>)/, escapeHtml(`${title} | XP Videos`));
    html = replaceOrFail(html, /(<link rel="canonical" href=")[^"]*(")/, escapeHtml(url));
    html = setMeta(html, 'name', 'description', description);
    html = setMeta(html, 'property', 'og:type', 'video.other');
    html = setMeta(html, 'property', 'og:url', url);
    html = setMeta(html, 'property', 'og:title', title);
    html = setMeta(html, 'property', 'og:description', description);
    html = setMeta(html, 'property', 'twitter:url', url);
    html = setMeta(html, 'property', 'twitter:title', title);
    html = setMeta(html, 'property', 'twitter:description', description);
    html = html.replace('</head>', [
        `    <meta property="og:image" content="${escapeHtml(video.thumbnailUrl)}">`,
        `    <meta property="twitter:image" content="${escapeHtml(video.thumbnailUrl)}">`,
        `    <script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>`,
        '  </head>'
    ].join('\n'));
    // Visible content for crawlers that don't run JavaScript; React replaces it on load
    html = html.replace('<div id="root"></div>', `<div id="root"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>`);
    return html;
};

const renderSitemap = (videos) => {
    const entries = videos.map((video) => {
        const title = escapeHtml(cleanTitle(video.title));
        return `  <url>
    <loc>${escapeHtml(SITE_URL + videoPath(video))}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeHtml(video.thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${title}</video:title>
      <video:description>Watch ${title} on XP Videos.</video:description>
      <video:player_loc>${escapeHtml(video.videoUrl)}</video:player_loc>
      <video:duration>${durationSeconds(video.duration)}</video:duration>
    </video:video>
  </url>`;
    });
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>${SITE_URL}/</loc>
  </url>
${entries.join('\n')}
</urlset>
`;
};

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');
const videos = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'videos.json'), 'utf-8'));

fs.mkdirSync(path.join(DIST, 'video'), { recursive: true });
for (const video of videos) {
    fs.writeFileSync(path.join(DIST, `${videoPath(video).slice(1)}.html`), renderVideoPage(template, video), 'utf-8');
}
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), renderSitemap(videos), 'utf-8');
fs.writeFileSync(path.join(DIST, '404.html'), template.replace('</head>', '    <meta name="robots" content="noindex">\n  </head>'), 'utf-8');

console.log(`prerender: wrote ${videos.length} video pages, sitemap.xml and 404.html`);
