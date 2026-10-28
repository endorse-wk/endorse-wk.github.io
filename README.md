# XP Video

React + Vite front end deployed to GitHub Pages (https://endorse-wk.github.io), with an optional Express + SQLite API.

To use a custom domain, add `public/CNAME` containing the domain and update `SITE_URL` in `scripts/prerender.js`
plus the URLs it lists (index.html, public/robots.txt, components/Layout.tsx).

## Project layout

```
App.tsx, index.tsx, index.html   App entry
components/                      React components and shared types
services/videoService.ts         Video data source (API or bundled JSON)
services/aiService.ts            XP AI chat client (calls the API, never Gemini directly)
data/videos.json                 Bundled video data (generated from xvideos.csv)
api/                             Express API server and CSV -> JSON converter
scripts/                         Python data/SEO scripts (see scripts/README.md)
public/                          Static files copied as-is (CNAME, robots.txt, sitemap.xml)
```

## Run locally

1. `npm install`
2. Copy `.env.example` to `.env.local`. Set `VITE_API_URL=http://localhost:3001` to use the API, or leave it empty to use the bundled data.
3. `npm run dev` (starts the API on port 3001 and Vite)

## Data source

`services/videoService.ts` fetches from `VITE_API_URL` when it is set. When it is unset, or the API request fails,
it searches, filters and paginates `data/videos.json` in the browser, so the static GitHub Pages build works without a server.

To serve the full SQLite catalogue in production, deploy `api/server.js` (with `videos_db.sqlite`) to a Node host
and set `VITE_API_URL` to its URL before running `npm run deploy`.

## XP AI chat

The chat in the video player calls `POST /api/chat` on the API server, which calls Gemini with `GEMINI_API_KEY`
(limited to 20 requests per minute per IP). The key never reaches the browser. The XP AI button only appears
when `VITE_API_URL` is set; set `GEMINI_API_KEY` in the server's environment (or `.env.local` locally) to enable it.

## Deploy

`npm run deploy` builds and publishes `dist/` to GitHub Pages.
