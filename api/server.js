import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbPath = path.join(__dirname, '..', 'videos_db.sqlite');

// In ESM, we often use the verbose() wrapper like this:
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// API Endpoints

// Root endpoint to verify server is running
app.get('/', (req, res) => {
    res.send('XP Video API is running. Access data at /api/videos');
});

// Thumbnail proxy — fetches CDN images server-side to bypass hotlink protection
app.get('/api/thumb', (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('Missing url parameter');

    let targetUrl;
    try {
        targetUrl = new URL(decodeURIComponent(url));
    } catch {
        return res.status(400).send('Invalid url');
    }

    // Only allow known thumbnail CDN hostnames for security
    const allowedHosts = ['thumb-cdn77.others-cdn.com', 'thumbs-gcore.others-cdn.com', 'img.xvideos-cdn.com', 'thumb.xvcdn.com', 'cdn77.xvideos-cdn.com'];
    const isAllowed = allowedHosts.some(h => targetUrl.hostname.endsWith(h) || targetUrl.hostname === h);
    // Also allow any *.others-cdn.com or *.xvcdn.com host dynamically
    const isDynamic = targetUrl.hostname.endsWith('.others-cdn.com') || targetUrl.hostname.endsWith('.xvcdn.com') || targetUrl.hostname.endsWith('.xvideos-cdn.com');
    if (!isAllowed && !isDynamic) {
        return res.status(403).send('Host not allowed');
    }

    const protocol = targetUrl.protocol === 'https:' ? https : http;
    const options = {
        hostname: targetUrl.hostname,
        path: targetUrl.pathname + targetUrl.search,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': `https://${targetUrl.hostname}/`,
            'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Encoding': 'identity',
        }
    };

    const proxyReq = protocol.request(options, (proxyRes) => {
        // Follow redirects (up to 3 hops)
        if ((proxyRes.statusCode === 301 || proxyRes.statusCode === 302 || proxyRes.statusCode === 307 || proxyRes.statusCode === 308) && proxyRes.headers.location) {
            const redirectUrl = encodeURIComponent(proxyRes.headers.location);
            return res.redirect(`/api/thumb?url=${redirectUrl}`);
        }

        if (proxyRes.statusCode !== 200) {
            return res.status(proxyRes.statusCode || 500).send('Upstream error');
        }

        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 24 hours
        res.setHeader('Access-Control-Allow-Origin', '*');
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err.message);
        res.status(500).send('Proxy request failed');
    });

    proxyReq.setTimeout(8000, () => {
        proxyReq.destroy();
        res.status(504).send('Proxy timeout');
    });

    proxyReq.end();
});


app.get('/api/videos', (req, res) => {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM videos WHERE 1=1';
    let params = [];
    
    if (category && category !== 'All') {
        query += ' AND category = ? COLLATE NOCASE';
        params.push(category);
    }
    
    if (search) {
        query += ' AND (title LIKE ? OR tags LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get a single video
app.get('/api/videos/:id', (req, res) => {
    const query = 'SELECT * FROM videos WHERE id = ?';
    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

// AI chat — the Gemini key stays on the server and is never sent to the browser
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Simple in-memory rate limit per IP to protect the API key from abuse
const CHAT_LIMIT = 20;
const CHAT_WINDOW_MS = 60 * 1000;
const chatRequests = new Map();

const isRateLimited = (ip) => {
    const now = Date.now();
    const entry = chatRequests.get(ip);
    if (!entry || now > entry.resetAt) {
        chatRequests.set(ip, { count: 1, resetAt: now + CHAT_WINDOW_MS });
        return false;
    }
    entry.count++;
    return entry.count > CHAT_LIMIT;
};

app.post('/api/chat', async (req, res) => {
    if (!ai) return res.status(503).json({ error: 'AI chat is not configured' });
    if (isRateLimited(req.ip)) return res.status(429).json({ error: 'Too many requests, slow down' });

    const { message, videoTitle = '', videoDescription = '' } = req.body || {};
    if (typeof message !== 'string' || !message.trim() || message.length > 1000) {
        return res.status(400).json({ error: 'Message must be 1-1000 characters' });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: message,
            config: {
                systemInstruction: `You are XP AI on the XP Video platform. Video: ${String(videoTitle).slice(0, 300)}. Desc: ${String(videoDescription).slice(0, 1000)}. Be helpful and professional.`
            }
        });
        res.json({ text: response.text || '' });
    } catch (err) {
        console.error('Gemini error:', err.message);
        res.status(502).json({ error: 'AI request failed' });
    }
});

app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
});
