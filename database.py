import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    if not os.path.exists(Config.UPLOAD_FOLDER):
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            thumbnail TEXT NOT NULL,
            source_link TEXT,
            live_link TEXT,
            serial_order INTEGER DEFAULT 0,
            is_featured INTEGER DEFAULT 0,
            is_store_item INTEGER DEFAULT 0,
            price TEXT DEFAULT 'Contact',
            tech_stack TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            proficiency INTEGER DEFAULT 90,
            icon_class TEXT DEFAULT 'code',
            serial_order INTEGER DEFAULT 0
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            subject TEXT,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'unread',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS site_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')

    conn.commit()

    # Seed/Update Admin User with correct email
    cursor.execute('SELECT * FROM users WHERE username = ? OR email = ?', ('admin', 'subhrajitbhattacharjee6@gmail.com'))
    user = cursor.fetchone()
    if not user:
        hashed_pw = generate_password_hash('admin123')
        cursor.execute('''
            INSERT INTO users (username, password_hash, email, phone)
            VALUES (?, ?, ?, ?)
        ''', ('admin', hashed_pw, 'subhrajitbhattacharjee6@gmail.com', '6009916591'))
        conn.commit()
    else:
        cursor.execute('UPDATE users SET email = ? WHERE id = ?', ('subhrajitbhattacharjee6@gmail.com', user['id']))
        conn.commit()

    # Seed/Update Site Settings
    default_settings = {
        'site_title': 'Subhrajit Bhattacharjee | Full-Stack Developer & Designer',
        'owner_name': 'Subhrajit Bhattacharjee',
        'owner_role': 'Full-Stack Software Engineer & Creative UI Designer',
        'owner_bio': 'Building high-performance web applications, scalable APIs, and sleek digital experiences. Specializing in modern Python, JavaScript, and custom cloud solutions.',
        'email': 'subhrajitbhattacharjee6@gmail.com',
        'phone': '+91 6009916591',
        'location': 'India',
        'site_logo': '',
        'github_url': 'https://github.com/Subrajit06',
        'linkedin_url': 'https://linkedin.com',
        'twitter_url': 'https://twitter.com'
    }
    for key, val in default_settings.items():
        cursor.execute('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)', (key, val))
    conn.commit()

    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database updated with correct admin email!")
