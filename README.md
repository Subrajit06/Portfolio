# Subhrajit Bhattacharjee - Professional Portfolio & Admin Panel

A full-stack, responsive developer portfolio website featuring a **Secure Admin Control Panel**, serial-wise project management, featured project highlights showcase frame, skills manager, projects store section, and client contact inbox.

---

## 🌟 Key Features

- **Modern Responsive Design**: Glassmorphism dark mode aesthetic, optimized for desktop, tablet, and mobile browsers.
- **Spotlight Featured Showcase Frame**: Highlight flagship projects in a custom hero spotlight frame with live demo & source links.
- **Serial-Wise Project Display**: Order projects (`#1`, `#2`, `#3`...) dynamically from the Admin Panel.
- **Projects Digital Store**: Dedicated store page (`/store`) showcasing ready source code, full-stack templates, and commercial software items.
- **Skills Manager**: Categorized skills (Frontend, Backend, Databases, Tools) with interactive proficiency progress bars.
- **Secure Admin Panel (`/admin`)**:
  - Log in using **Username** (`admin`) or **Email** (`subhrajitbhattacharjee@gmail.com`).
  - Add, edit, and delete projects with thumbnail image upload or URL.
  - Upload & manage website **Custom Logo** dynamically.
  - Manage skills, display flags, and client contact inbox.
- **Client Contact Form**: Interactive client contact form saving messages directly into the Admin Panel.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.14 (Flask)
- **Database**: SQLite3 (Self-contained, zero-configuration)
- **Frontend**: HTML5, TailwindCSS (CDN), Custom Glassmorphism CSS, JavaScript (Lucide Icons)
- **Authentication**: Session Cookies + Werkzeug Password Hashing

---

## 🚀 Quick Setup & Run Instructions

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/Portfolio.git
cd Portfolio

# 2. Install dependencies
pip install -r requirements.txt

# 3. Initialize Database
python database.py

# 4. Start the Application
python app.py
```

Open `http://127.0.0.1:5000` in your web browser.

---

## 🔐 Default Admin Credentials

- **URL**: `http://127.0.0.1:5000/login`
- **Username / Email**: `admin` OR `subhrajitbhattacharjee@gmail.com`
- **Password**: `admin123`
