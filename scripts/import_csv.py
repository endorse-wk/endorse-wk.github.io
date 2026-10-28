import csv
import sqlite3
import os
import re

# Configuration
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_FILE = os.path.join(ROOT_DIR, 'xvideos.csv')
DB_FILE = os.path.join(ROOT_DIR, 'videos_db.sqlite')
CHUNK_SIZE = 5000

def setup_database():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('DROP TABLE IF EXISTS videos') # Clear old data for a fresh start
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        videoUrl TEXT,
        thumbnailUrl TEXT,
        duration TEXT,
        tags TEXT,
        category TEXT,
        views TEXT DEFAULT '0',
        uploadDate TEXT
    )
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_tags ON videos(tags)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_title ON videos(title)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_category ON videos(category)')
    conn.commit()
    return conn

def extract_src(iframe_tag):
    # Regex to find the URL inside src="..."
    match = re.search(r'src="([^"]+)"', iframe_tag)
    return match.group(1) if match else iframe_tag

def import_data():
    if not os.path.exists(CSV_FILE):
        print(f"Error: {CSV_FILE} not found.")
        return

    conn = setup_database()
    cursor = conn.cursor()
    
    print(f"Starting import from {CSV_FILE}...")
    
    with open(CSV_FILE, mode='r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f, delimiter=';')
        
        batch = []
        count = 0
        
        for row in reader:
            if len(row) < 9: continue
            
            try:
                # Based on your sample:
                # 0: Page URL, 1: Title, 2: Duration, 3: Thumb, 4: Iframe, 5: Tags, 8: Category, 12: Date, 14: Views
                title = row[1]
                duration = row[2]
                thumb_url = row[3]
                embed_url = extract_src(row[4])
                tags = row[5]
                category = row[8] if row[8] else 'General'
                upload_date = row[12] if len(row) > 12 else '2024-06-20'
                views = row[14] if len(row) > 14 else '0'
                
                batch.append((title, embed_url, thumb_url, duration, tags, category, views, upload_date))
                count += 1
                
                if len(batch) >= CHUNK_SIZE:
                    cursor.executemany('INSERT INTO videos (title, videoUrl, thumbnailUrl, duration, tags, category, views, uploadDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', batch)
                    conn.commit()
                    batch = []
                    print(f"Imported {count} videos...")
                    
            except Exception as e:
                continue

        if batch:
            cursor.executemany('INSERT INTO videos (title, videoUrl, thumbnailUrl, duration, tags, category, views, uploadDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', batch)
            conn.commit()

    conn.close()
    print(f"DONE! Total videos imported: {count}")

if __name__ == "__main__":
    import_data()
