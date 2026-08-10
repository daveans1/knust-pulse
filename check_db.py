import psycopg2

try:
    conn = psycopg2.connect(
        dbname="knust_pulse",
        user="knust",
        password="knust123",
        host="localhost",
        port="5435"
    )
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) FROM posts;")
    posts_count = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM comments;")
    comments_count = cur.fetchone()[0]
    
    print(f"Posts in DB: {posts_count}")
    print(f"Comments in DB: {comments_count}")
    
    cur.execute("SELECT id, post_id, content FROM comments LIMIT 5;")
    for row in cur.fetchall():
        print(f"Comment {row[0]} on post {row[1]}: {row[2]}")
        
    cur.execute("SELECT id, content FROM posts ORDER BY id LIMIT 5;")
    for row in cur.fetchall():
        print(f"Post {row[0]}: {row[1][:50]}...")
        
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
