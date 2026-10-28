import csv
import json
import os
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_FILE = os.path.join(ROOT_DIR, 'xvideos.csv')
JSON_FILE = os.path.join(ROOT_DIR, 'data', 'videos.json')

def extract_src(iframe_tag):
    match = re.search(r'src="([^"]+)"', iframe_tag)
    return match.group(1) if match else iframe_tag

def convert():
    if not os.path.exists(CSV_FILE):
        print(f"Error: {CSV_FILE} not found.")
        return

    print(f"Reading {CSV_FILE}...")
    videos = []
    
    with open(CSV_FILE, mode='r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f, delimiter=';')
        
        count = 0
        for row in reader:
            if len(row) < 9:
                continue
            
            try:
                # 0: Page URL, 1: Title, 2: Duration, 3: Thumb, 4: Iframe, 5: Tags, 8: Category, 12: Date, 14: Views
                title = row[1]
                duration = row[2]
                thumb_url = row[3]
                embed_url = extract_src(row[4])
                tags = row[5]
                category = row[8] if row[8] else 'General'
                upload_date = row[12] if len(row) > 12 else '2024-06-20'
                views = row[14] if len(row) > 14 else '0'
                
                count += 1
                videos.append({
                    "id": count,
                    "title": title,
                    "videoUrl": embed_url,
                    "thumbnailUrl": thumb_url,
                    "duration": duration,
                    "tags": tags,
                    "category": category,
                    "views": views,
                    "uploadDate": upload_date
                })
            except Exception as e:
                continue

    print(f"Writing {len(videos)} videos to {JSON_FILE}...")
    with open(JSON_FILE, 'w', encoding='utf-8') as out_f:
        json.dump(videos, out_f, indent=4, ensure_ascii=False)
        
    print("Done converting!")

if __name__ == "__main__":
    convert()
