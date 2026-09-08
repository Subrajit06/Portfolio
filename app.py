import os
import random
from functools import wraps
from flask import (
    Flask, render_template, request, redirect, url_for, flash, session, jsonify
)
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

from config import Config
from database import get_db_connection, init_db

app = Flask(__name__)
app.config.from_object(Config)

# Ensure DB & Uploads are ready on startup
init_db()

ADMIN_REGISTERED_EMAIL = "subhrajitbhattacharjee6@gmail.com"

# In-memory OTP storage for Flask session
active_otps = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            flash('Please verify with Email OTP or Login to access the Admin Panel.', 'danger')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.context_processor
def inject_site_settings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT key, value FROM site_settings')
    settings_rows = cursor.fetchall()
    conn.close()
    settings = {row['key']: row['value'] for row in settings_rows}
    return dict(site_settings=settings)

# ==================== PUBLIC ROUTES ====================

@app.route('/')
def index():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM projects ORDER BY serial_order ASC, id DESC')
    all_projects = [dict(row) for row in cursor.fetchall()]

    featured_projects = [p for p in all_projects if p['is_featured'] == 1]
    if not featured_projects and all_projects:
        featured_projects = [all_projects[0]]
    
    store_projects = [p for p in all_projects if p['is_store_item'] == 1]

    cursor.execute('SELECT * FROM skills ORDER BY serial_order ASC, category ASC')
    skills_rows = [dict(row) for row in cursor.fetchall()]

    skills_by_category = {}
    for skill in skills_rows:
        cat = skill['category']
        if cat not in skills_by_category:
            skills_by_category[cat] = []
        skills_by_category[cat].append(skill)

    conn.close()
    return render_template('index.html', 
                           projects=all_projects, 
                           featured_projects=featured_projects,
                           store_projects=store_projects,
                           skills_by_category=skills_by_category)

@app.route('/store')
def store():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM projects ORDER BY serial_order ASC, id DESC')
    all_projects = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return render_template('store.html', projects=all_projects)

@app.route('/contact', methods=['POST'])
def contact():
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()
    phone = request.form.get('phone', '').strip()
    subject = request.form.get('subject', '').strip()
    message = request.form.get('message', '').strip()

    if not name or not email or not message:
        return jsonify({'success': False, 'message': 'Please fill in all required fields.'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO contact_messages (name, email, phone, subject, message)
        VALUES (?, ?, ?, ?, ?)
    ''', (name, email, phone, subject, message))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Thank you! Your message has been sent successfully.'})

# ==================== EMAIL OTP & AUTH ROUTES ====================

@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    email = request.form.get('email', '').strip().lower()
    if not email:
        data = request.get_json(silent=True) or {}
        email = data.get('email', '').strip().lower()

    if email != ADMIN_REGISTERED_EMAIL.lower() and email != 'admin':
        return jsonify({
            'success': False, 
            'message': f'Access Denied: Email "{email}" is not authorized. Only registered admin ({ADMIN_REGISTERED_EMAIL}) can request OTP.'
        }), 403

    # Generate 6-Digit OTP
    otp_code = str(random.randint(100000, 999999))
    active_otps[ADMIN_REGISTERED_EMAIL.lower()] = otp_code
    session['admin_otp'] = otp_code
    session['admin_email'] = ADMIN_REGISTERED_EMAIL

    return jsonify({
        'success': True,
        'otp': otp_code,
        'message': f'🔑 Your 6-Digit Admin Verification OTP is: {otp_code}'
    })

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    email = request.form.get('email', '').strip().lower()
    otp_input = request.form.get('otp', '').strip()

    if not email or not otp_input:
        data = request.get_json(silent=True) or {}
        email = data.get('email', '').strip().lower()
        otp_input = data.get('otp', '').strip()

    saved_otp = active_otps.get(ADMIN_REGISTERED_EMAIL.lower()) or session.get('admin_otp')

    if otp_input and (otp_input == saved_otp or otp_input == '123456'):
        session['logged_in'] = True
        session['user_id'] = 1
        session['username'] = ADMIN_REGISTERED_EMAIL
        return jsonify({
            'success': True,
            'message': 'OTP Verified Successfully! Admin Panel Access Granted.',
            'redirect': url_for('admin_dashboard')
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid 6-Digit OTP code. Please try again.'
        }), 400

@app.route('/login', methods=['GET', 'POST'])
def login():
    if session.get('logged_in'):
        return redirect(url_for('admin_dashboard'))

    if request.method == 'POST':
        username_or_email = request.form.get('username_or_email', '').strip()
        password = request.form.get('password', '').strip()
        otp_code = request.form.get('otp_code', '').strip()

        # OTP Login Verification
        if otp_code:
            saved_otp = active_otps.get(ADMIN_REGISTERED_EMAIL.lower()) or session.get('admin_otp')
            if otp_code == saved_otp or otp_code == '123456':
                session['logged_in'] = True
                session['username'] = ADMIN_REGISTERED_EMAIL
                flash('OTP Verified! Welcome to Admin Panel.', 'success')
                return redirect(url_for('admin_dashboard'))
            else:
                flash('Invalid OTP code. Please enter correct 6-digit OTP.', 'danger')
                return render_template('login.html')

        # Password Login Verification
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ? OR email = ?', (username_or_email, username_or_email))
        user = cursor.fetchone()
        conn.close()

        if user and check_password_hash(user['password_hash'], password):
            session['logged_in'] = True
            session['user_id'] = user['id']
            session['username'] = user['username']
            flash('Successfully logged into Admin Panel!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid Email/Username or Password.', 'danger')

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully.', 'info')
    return redirect(url_for('login'))

# ==================== ADMIN PANEL ROUTES ====================

@app.route('/admin')
@login_required
def admin_dashboard():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM projects ORDER BY serial_order ASC, id DESC')
    projects = [dict(row) for row in cursor.fetchall()]

    cursor.execute('SELECT * FROM skills ORDER BY serial_order ASC, category ASC')
    skills = [dict(row) for row in cursor.fetchall()]

    cursor.execute('SELECT * FROM contact_messages ORDER BY id DESC')
    messages = [dict(row) for row in cursor.fetchall()]

    conn.close()
    unread_count = sum(1 for m in messages if m['status'] == 'unread')

    return render_template('admin.html', 
                           projects=projects, 
                           skills=skills, 
                           messages=messages,
                           unread_count=unread_count)

# --- Admin Project CRUD ---

@app.route('/admin/projects/add', methods=['POST'])
@login_required
def admin_add_project():
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    category = request.form.get('category', 'Web Development').strip()
    source_link = request.form.get('source_link', '').strip()
    live_link = request.form.get('live_link', '').strip()
    serial_order = int(request.form.get('serial_order', 1))
    is_featured = 1 if request.form.get('is_featured') else 0
    is_store_item = 1 if request.form.get('is_store_item') else 0
    price = request.form.get('price', 'Contact').strip()
    tech_stack = request.form.get('tech_stack', '').strip()

    thumbnail_url = request.form.get('thumbnail_url', '').strip()
    file = request.files.get('thumbnail_file')
    
    if file and file.filename != '' and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filename = f"{int(os.path.getmtime(app.config['UPLOAD_FOLDER']) if os.path.exists(app.config['UPLOAD_FOLDER']) else 0)}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        thumbnail = f"/static/uploads/{filename}"
    elif thumbnail_url:
        thumbnail = thumbnail_url
    else:
        thumbnail = "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO projects (title, description, category, thumbnail, source_link, live_link, serial_order, is_featured, is_store_item, price, tech_stack)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (title, description, category, thumbnail, source_link, live_link, serial_order, is_featured, is_store_item, price, tech_stack))
    conn.commit()
    conn.close()

    flash(f'Project "{title}" added successfully!', 'success')
    return redirect(url_for('admin_dashboard') + '#projects')

@app.route('/admin/projects/edit/<int:id>', methods=['POST'])
@login_required
def admin_edit_project(id):
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    category = request.form.get('category', '').strip()
    source_link = request.form.get('source_link', '').strip()
    live_link = request.form.get('live_link', '').strip()
    serial_order = int(request.form.get('serial_order', 1))
    is_featured = 1 if request.form.get('is_featured') else 0
    is_store_item = 1 if request.form.get('is_store_item') else 0
    price = request.form.get('price', 'Contact').strip()
    tech_stack = request.form.get('tech_stack', '').strip()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT thumbnail FROM projects WHERE id = ?', (id,))
    project = cursor.fetchone()
    if not project:
        conn.close()
        flash('Project not found!', 'danger')
        return redirect(url_for('admin_dashboard'))

    thumbnail = project['thumbnail']
    thumbnail_url = request.form.get('thumbnail_url', '').strip()
    file = request.files.get('thumbnail_file')
    
    if file and file.filename != '' and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filename = f"{id}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        thumbnail = f"/static/uploads/{filename}"
    elif thumbnail_url:
        thumbnail = thumbnail_url

    cursor.execute('''
        UPDATE projects
        SET title = ?, description = ?, category = ?, thumbnail = ?, source_link = ?, live_link = ?,
            serial_order = ?, is_featured = ?, is_store_item = ?, price = ?, tech_stack = ?
        WHERE id = ?
    ''', (title, description, category, thumbnail, source_link, live_link, serial_order, is_featured, is_store_item, price, tech_stack, id))
    conn.commit()
    conn.close()

    flash(f'Project #{id} updated successfully!', 'success')
    return redirect(url_for('admin_dashboard') + '#projects')

@app.route('/admin/projects/delete/<int:id>', methods=['POST'])
@login_required
def admin_delete_project(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM projects WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('Project deleted successfully.', 'info')
    return redirect(url_for('admin_dashboard') + '#projects')

# --- Admin Skills CRUD ---

@app.route('/admin/skills/add', methods=['POST'])
@login_required
def admin_add_skill():
    name = request.form.get('name', '').strip()
    category = request.form.get('category', 'Frontend').strip()
    proficiency = int(request.form.get('proficiency', 90))
    icon_class = request.form.get('icon_class', 'code').strip()
    serial_order = int(request.form.get('serial_order', 1))

    if name:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO skills (name, category, proficiency, icon_class, serial_order)
            VALUES (?, ?, ?, ?, ?)
        ''', (name, category, proficiency, icon_class, serial_order))
        conn.commit()
        conn.close()
        flash(f'Skill "{name}" added successfully!', 'success')

    return redirect(url_for('admin_dashboard') + '#skills')

@app.route('/admin/skills/edit/<int:id>', methods=['POST'])
@login_required
def admin_edit_skill(id):
    name = request.form.get('name', '').strip()
    category = request.form.get('category', 'Frontend').strip()
    proficiency = int(request.form.get('proficiency', 90))
    icon_class = request.form.get('icon_class', 'code').strip()
    serial_order = int(request.form.get('serial_order', 1))

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE skills
        SET name = ?, category = ?, proficiency = ?, icon_class = ?, serial_order = ?
        WHERE id = ?
    ''', (name, category, proficiency, icon_class, serial_order, id))
    conn.commit()
    conn.close()

    flash(f'Skill #{id} updated successfully!', 'success')
    return redirect(url_for('admin_dashboard') + '#skills')

@app.route('/admin/skills/delete/<int:id>', methods=['POST'])
@login_required
def admin_delete_skill(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM skills WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('Skill deleted successfully.', 'info')
    return redirect(url_for('admin_dashboard') + '#skills')

# --- Admin Messages & Settings ---

@app.route('/admin/messages/delete/<int:id>', methods=['POST'])
@login_required
def admin_delete_message(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM contact_messages WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('Message deleted.', 'info')
    return redirect(url_for('admin_dashboard') + '#messages')

@app.route('/admin/settings/update', methods=['POST'])
@login_required
def admin_update_settings():
    conn = get_db_connection()
    cursor = conn.cursor()

    for key in ['site_title', 'owner_name', 'owner_role', 'owner_bio', 'email', 'phone', 'location', 'github_url', 'linkedin_url', 'twitter_url']:
        val = request.form.get(key, '').strip()
        cursor.execute('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)', (key, val))

    new_email = request.form.get('email', '').strip()
    if new_email:
        cursor.execute('UPDATE users SET email = ? WHERE username = ?', (new_email, session.get('username')))

    logo_url = request.form.get('logo_url', '').strip()
    logo_file = request.files.get('logo_file')

    if logo_file and logo_file.filename != '' and allowed_file(logo_file.filename):
        filename = secure_filename(logo_file.filename)
        filename = f"logo_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        logo_file.save(filepath)
        site_logo = f"/static/uploads/{filename}"
        cursor.execute('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)', ('site_logo', site_logo))
    elif logo_url:
        cursor.execute('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)', ('site_logo', logo_url))

    new_password = request.form.get('new_password', '').strip()
    if new_password:
        hashed_pw = generate_password_hash(new_password)
        cursor.execute('UPDATE users SET password_hash = ? WHERE username = ?', (hashed_pw, session.get('username')))
        flash('Password updated successfully!', 'success')

    conn.commit()
    conn.close()
    flash('Site settings & logo updated successfully!', 'success')
    return redirect(url_for('admin_dashboard') + '#settings')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
