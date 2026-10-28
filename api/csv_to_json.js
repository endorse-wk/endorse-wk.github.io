import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_FILE = path.join(__dirname, '..', 'xvideos.csv');
const JSON_FILE = path.join(__dirname, '..', 'data', 'videos.json');

function extractSrc(iframeTag) {
    const match = iframeTag.match(/src="([^"]+)"/);
    return match ? match[1] : iframeTag;
}

function convert() {
    if (!fs.existsSync(CSV_FILE)) {
        console.error(`Error: ${CSV_FILE} not found.`);
        return;
    }

    console.log(`Node: Reading ${CSV_FILE}...`);
    const content = fs.readFileSync(CSV_FILE, 'utf-8');
    
    // Split by lines, handles \r\n and \n
    const lines = content.split(/\r?\n/);
    const videos = [];
    let count = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV row with simple semi-colon split (since values are semi-colon separated)
        const row = line.split(';');
        if (row.length < 9) continue;

        try {
            const title = row[1];
            const duration = row[2];
            const thumbUrl = row[3];
            const embedUrl = extractSrc(row[4]);
            const tags = row[5];
            const category = row[8] ? row[8] : 'General';
            const uploadDate = row[12] ? row[12] : '2024-06-20';
            const views = row[14] ? row[14] : '0';

            count++;
            videos.push({
                id: count,
                title: title,
                videoUrl: embedUrl,
                thumbnailUrl: thumbUrl,
                duration: duration,
                tags: tags,
                category: category,
                views: views,
                uploadDate: uploadDate
            });

            if (videos.length >= 2000) {
                break;
            }
        } catch (e) {
            continue;
        }
    }

    console.log(`Node: Writing ${videos.length} videos to ${JSON_FILE}...`);
    fs.writeFileSync(JSON_FILE, JSON.stringify(videos, null, 4), 'utf-8');
    console.log("Node: Done converting!");
}

convert();
