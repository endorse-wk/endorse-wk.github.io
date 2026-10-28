# Scripts

All scripts resolve paths relative to the project root, so they can be run from anywhere.

## Build-time (run automatically by `npm run build`)

- **`prerender.js`**: after `vite build`, writes a static page per video to `dist/video/<slug>-<id>.html`
  (per-video title, meta description, Open Graph tags and VideoObject structured data), plus `dist/sitemap.xml`
  listing exactly those pages and a `dist/404.html` SPA fallback. URLs come from `services/videoUrl.js`, the same
  module the app uses for routing, so the sitemap, the pages and in-app links always match.

## Data (Python)

- **`convert_csv_to_json.py`**: `xvideos.csv` -> `data/videos.json` (same as `api/csv_to_json.js`, which the build uses)
- **`import_csv.py`**: `xvideos.csv` -> `videos_db.sqlite` for the API server
- **`check_db.py`**: prints the video count and a sample row from `videos_db.sqlite`

## Adding videos

Add rows to `xvideos.csv` and run `npm run build`. The JSON, video pages and sitemap are regenerated.
Video ids come from row order, and page URLs end in the id, so append new rows rather than reordering
or deleting existing ones, or existing URLs will point to different videos.
