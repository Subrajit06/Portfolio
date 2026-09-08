import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    # Ensure upload directory exists
    if not os.path.exists(Config.UPLOAD_FOLDER):
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
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

    # Projects Table
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

    # Skills Table
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

    # Contact Messages Table
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

    # Site Settings Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS site_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')

    conn.commit()

    # Seed Default Admin User if not exists
    cursor.execute('SELECT * FROM users WHERE username = ? OR email = ?', ('admin', 'subhrajitbhattacharjee@gmail.com'))
    user = cursor.fetchone()
    if not user:
        hashed_pw = generate_password_hash('admin123')
        cursor.execute('''
            INSERT INTO users (username, password_hash, email, phone)
            VALUES (?, ?, ?, ?)
        ''', ('admin', hashed_pw, 'subhrajitbhattacharjee@gmail.com', '6009916591'))
        conn.commit()
    else:
        # Ensure email is set properly
        cursor.execute('UPDATE users SET email = ? WHERE id = ?', ('subhrajitbhattacharjee@gmail.com', user['id']))
        conn.commit()

    # Seed Initial Site Settings if empty
    default_settings = {
        'site_title': 'Subhrajit Bhattacharjee | Full-Stack Developer & Designer',
        'owner_name': 'Subhrajit Bhattacharjee',
        'owner_role': 'Full-Stack Software Engineer & Creative UI Designer',
        'owner_bio': 'Building high-performance web applications, scalable APIs, and sleek digital experiences. Specializing in modern Python, JavaScript, and custom cloud solutions.',
        'email': 'subhrajitbhattacharjee6@gmail.com',
        'phone': '+91 6009916591',
        'location': 'India',
        'site_logo': '',  # Custom Logo Path or URL
        'github_url': 'https://github.com',
        'linkedin_url': 'https://linkedin.com',
        'twitter_url': 'https://twitter.com'
    }
    for key, val in default_settings.items():
        cursor.execute('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)', (key, val))
    conn.commit()

    # Seed Initial Sample Skills if empty
    cursor.execute('SELECT COUNT(*) FROM skills')
    if cursor.fetchone()[0] == 0:
        sample_skills = [
            ('Python / Flask / Django', 'Backend', 95, 'terminal', 1),
            ('JavaScript / React / Node.js', 'Frontend', 90, 'code', 2),
            ('TailwindCSS & Glassmorphism UI', 'Frontend', 92, 'layout', 3),
            ('SQLite / PostgreSQL / MySQL', 'Database & DevOps', 88, 'database', 4),
            ('RESTful APIs & Microservices', 'Backend', 92, 'server', 5),
            ('Git / GitHub & Cloud Deployment', 'Tools & DevOps', 90, 'git-branch', 6)
        ]
        for name, category, proficiency, icon_class, serial_order in sample_skills:
            cursor.execute('''
                INSERT INTO skills (name, category, proficiency, icon_class, serial_order)
                VALUES (?, ?, ?, ?, ?)
            ''', (name, category, proficiency, icon_class, serial_order))
        conn.commit()

    # Seed Initial Sample Projects if empty
    cursor.execute('SELECT COUNT(*) FROM projects')
    if cursor.fetchone()[0] == 0:
        sample_projects = [
            (
                'AI-Powered E-Commerce Store & CMS',
                'An enterprise-grade e-commerce application with smart product recommendations, serial ordering, real-time inventory management, and an interactive admin dashboard.',
                'Full-Stack Web App',
                'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80',
                'https://github.com',
                'https://example.com/demo1',
                1, 1, 1, '$199 / Commercial', 'Python, Flask, SQLite, TailwindCSS'
            ),
            (
                'Next-Gen Analytics & SaaS Dashboard',
                'Real-time data visualization platform built for SaaS analytics with live telemetry tracking, client access management, and dark glassmorphic UI widgets.',
                'SaaS / Dashboard',
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
                'https://github.com',
                'https://example.com/demo2',
                2, 1, 0, 'Custom / Project', 'React, Node.js, Chart.js, Tailwind'
            ),
            (
                'Mobile Cross-Platform Portfolio App',
                'Sleek mobile app built for showcasing creative agency portfolios, client interaction forms, push notifications, and store product digital downloads.',
                'Mobile App',
                'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
                'https://github.com',
                'https://example.com/demo3',
                3, 0, 1, '$49 / Source Code', 'Flutter, Python API, SQLite'
            )
        ]
        for title, desc, cat, thumb, src, live, serial, feat, store, price, stack in sample_projects:
            cursor.execute('''
                INSERT INTO projects (title, description, category, thumbnail, source_link, live_link, serial_order, is_featured, is_store_item, price, tech_stack)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (title, desc, cat, thumb, src, live, serial, feat, store, price, stack))
        conn.commit()

    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database updated & initialized!")
