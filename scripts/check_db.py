import sqlite3
import os

db_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'videos_db.sqlite')

if not os.path.exists(db_file):
    print(f"Database file {db_file} not found.")
else:
    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='videos';")
        if not cursor.fetchone():
            print("Table 'videos' does not exist.")
        else:
            cursor.execute("SELECT COUNT(*) FROM videos")
            count = cursor.fetchone()[0]
            print(f"Total videos in database: {count}")
            
            if count > 0:
                cursor.execute("SELECT * FROM videos LIMIT 1")
                row = cursor.fetchone()
                print(f"Sample row: {row}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
