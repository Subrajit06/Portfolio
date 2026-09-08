// Admin Management Logic - Clean Simple Password Protection & Working Modals

const ADMIN_EMAIL = "subhrajitbhattacharjee6@gmail.com";

// Modal Helper Functions (Globally Accessible)
window.openAddProjectModal = function() {
    const modal = document.getElementById('add-project-modal');
    if (modal) {
        modal.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    }
};

window.closeAddProjectModal = function() {
    const modal = document.getElementById('add-project-modal');
    if (modal) modal.classList.add('hidden');
};

window.openAddSkillModal = function() {
    const modal = document.getElementById('add-skill-modal');
    if (modal) {
        modal.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    }
};

window.closeAddSkillModal = function() {
    const modal = document.getElementById('add-skill-modal');
    if (modal) modal.classList.add('hidden');
};

function getLoginUrl() {
    const isStaticFile = window.location.protocol === 'file:' || window.location.pathname.endsWith('.html');
    return isStaticFile ? 'login.html' : '/login';
}

function checkAdminSecurity() {
    const isFlaskServer = window.location.port === '5000' || window.location.pathname === '/admin';
    if (isFlaskServer) {
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_auth_user', ADMIN_EMAIL);
        return true;
    }

    const isAuth = localStorage.getItem('admin_auth') === 'true';
    if (isAuth) {
        return true;
    }

    // Inline Auth Guard for unauthenticated static visitors
    const container = document.querySelector('main') || document.body;
    container.innerHTML = `
        <div class="min-h-[70vh] flex items-center justify-center p-6 text-center">
            <div class="glass-card p-8 sm:p-10 rounded-3xl max-w-md w-full border border-slate-800 space-y-6">
                <div class="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mx-auto flex items-center justify-center text-3xl">
                    🔒
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-white">Admin Password Required</h2>
                    <p class="text-slate-400 text-xs mt-2">Log in with your admin password to access the control panel.</p>
                </div>
                <a href="${getLoginUrl()}" class="inline-block w-full py-3.5 text-sm font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/25 hover:scale-[1.02] transition-all">
                    Go to Admin Password Login
                </a>
            </div>
        </div>
    `;
    return false;
}

function logoutAdmin() {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_auth_user');
    const isFlaskServer = window.location.port === '5000' || window.location.pathname === '/admin';
    window.location.href = isFlaskServer ? '/logout' : getLoginUrl();
}

function switchAdminTab(targetId, evt) {
    if (evt) evt.preventDefault();

    const navLinks = document.querySelectorAll('.admin-nav-link');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.includes(targetId)) {
            link.className = 'admin-nav-link active-tab px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center space-x-2';
        } else {
            link.className = 'admin-nav-link px-5 py-2.5 text-xs font-bold rounded-xl text-slate-400 hover:bg-slate-800 flex items-center space-x-2';
        }
    });

    tabContents.forEach(content => {
        if (content.id === `tab-${targetId}`) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });

    if (window.lucide) lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminSecurity()) return;

    if (window.lucide) lucide.createIcons();

    renderAdminProjects();
    renderAdminSkills();
    renderAdminMessages();
    fillAdminSettings();

    // Attach Event Listeners to Open Buttons
    const openAddProjBtn = document.getElementById('open-add-project-btn');
    if (openAddProjBtn) {
        openAddProjBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.openAddProjectModal();
        });
    }

    const closeAddProjBtn = document.getElementById('close-add-project-btn');
    if (closeAddProjBtn) {
        closeAddProjBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.closeAddProjectModal();
        });
    }

    const openAddSkillBtn = document.getElementById('open-add-skill-btn');
    if (openAddSkillBtn) {
        openAddSkillBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.openAddSkillModal();
        });
    }

    const closeAddSkillBtn = document.getElementById('close-add-skill-btn');
    if (closeAddSkillBtn) {
        closeAddSkillBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.closeAddSkillModal();
        });
    }

    // Modal Backdrop Clicks
    const allModals = document.querySelectorAll('.modal-overlay');
    allModals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    });

    // Navigation Tabs Click Listeners
    const navLinks = document.querySelectorAll('.admin-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href') || '';
            const targetId = href.replace('#', '');
            if (targetId) switchAdminTab(targetId, e);
        });
    });

    // Check hash on load
    const hash = window.location.hash.replace('#', '');
    if (hash) switchAdminTab(hash);

    // Static Add Project Form Handler
    const addProjForm = document.getElementById('static-add-project-form');
    if (addProjForm) {
        addProjForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addProjForm);
            const projects = getStoredData('site_projects', DEFAULT_PROJECTS);

            const newProj = {
                id: Date.now(),
                title: formData.get('title'),
                category: formData.get('category'),
                description: formData.get('description'),
                serial_order: Number(formData.get('serial_order') || 1),
                price: formData.get('price') || 'Contact',
                thumbnail: formData.get('thumbnail') || 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80',
                live_link: formData.get('live_link') || '',
                source_link: formData.get('source_link') || '',
                tech_stack: formData.get('tech_stack') || '',
                is_featured: formData.get('is_featured') ? 1 : 0,
                is_store_item: formData.get('is_store_item') ? 1 : 0
            };

            projects.push(newProj);
            localStorage.setItem('site_projects', JSON.stringify(projects));
            window.closeAddProjectModal();
            addProjForm.reset();
            renderAdminProjects();
        });
    }

    // Static Add Skill Form Handler
    const addSkillForm = document.getElementById('static-add-skill-form');
    if (addSkillForm) {
        addSkillForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addSkillForm);
            const skills = getStoredData('site_skills', DEFAULT_SKILLS);

            const newSkill = {
                id: Date.now(),
                name: formData.get('name'),
                category: formData.get('category'),
                proficiency: Number(formData.get('proficiency') || 90),
                serial_order: Number(formData.get('serial_order') || 1),
                icon_class: formData.get('icon_class') || 'code'
            };

            skills.push(newSkill);
            localStorage.setItem('site_skills', JSON.stringify(skills));
            window.closeAddSkillModal();
            addSkillForm.reset();
            renderAdminSkills();
        });
    }

    // Static Settings Form Handler
    const settingsForm = document.getElementById('admin-settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const settings = getStoredData('site_settings', DEFAULT_SETTINGS);

            settings.owner_name = document.getElementById('setting-owner-name').value;
            settings.owner_role = document.getElementById('setting-owner-role').value;
            settings.owner_bio = document.getElementById('setting-owner-bio').value;
            settings.email = document.getElementById('setting-email').value;
            settings.phone = document.getElementById('setting-phone').value;
            settings.site_logo = document.getElementById('setting-logo-url').value;

            // Password change option
            const newPass = document.getElementById('setting-new-pass')?.value;
            if (newPass) {
                localStorage.setItem('admin_custom_password', newPass);
            }

            localStorage.setItem('site_settings', JSON.stringify(settings));
            alert('Settings, Password & Logo saved successfully!');
        });
    }
});

function renderAdminProjects() {
    const tbody = document.getElementById('admin-projects-table-body');
    if (!tbody) return;

    const projects = getStoredData('site_projects', DEFAULT_PROJECTS);
    const sorted = [...projects].sort((a, b) => Number(a.serial_order) - Number(b.serial_order));

    tbody.innerHTML = sorted.map(p => `
        <tr class="hover:bg-slate-900/40 transition-colors">
            <td class="px-6 py-4 font-mono font-bold text-blue-400">#${p.serial_order}</td>
            <td class="px-6 py-4"><img src="${p.thumbnail}" class="w-16 h-12 object-cover rounded-xl border border-slate-700"></td>
            <td class="px-6 py-4">
                <div class="font-bold text-white">${p.title}</div>
                <div class="text-xs text-slate-400 line-clamp-1">${p.description}</div>
            </td>
            <td class="px-6 py-4 text-xs font-semibold text-slate-300">${p.category}</td>
            <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1.5">
                    ${Number(p.is_featured) === 1 ? `<span class="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300">★ Highlight</span>` : ''}
                    ${Number(p.is_store_item) === 1 ? `<span class="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300">Store (${p.price})</span>` : ''}
                </div>
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="deleteProject(${p.id})" class="p-2 rounded-xl bg-slate-800 hover:bg-red-900/40 text-red-400">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </td>
        </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function deleteProject(id) {
    if (!confirm('Delete this project?')) return;
    let projects = getStoredData('site_projects', DEFAULT_PROJECTS);
    projects = projects.filter(p => p.id !== id);
    localStorage.setItem('site_projects', JSON.stringify(projects));
    renderAdminProjects();
}

function renderAdminSkills() {
    const tbody = document.getElementById('admin-skills-table-body');
    if (!tbody) return;

    const skills = getStoredData('site_skills', DEFAULT_SKILLS);
    const sorted = [...skills].sort((a, b) => Number(a.serial_order) - Number(b.serial_order));

    tbody.innerHTML = sorted.map(s => `
        <tr class="hover:bg-slate-900/40 transition-colors">
            <td class="px-6 py-4 font-mono font-bold text-purple-400">#${s.serial_order}</td>
            <td class="px-6 py-4 font-bold text-white flex items-center space-x-2">
                <i data-lucide="${s.icon_class || 'code'}" class="w-4 h-4 text-blue-400"></i>
                <span>${s.name}</span>
            </td>
            <td class="px-6 py-4 text-xs font-semibold text-slate-300">${s.category}</td>
            <td class="px-6 py-4 font-mono text-purple-400 font-bold">${s.proficiency}%</td>
            <td class="px-6 py-4 font-mono text-xs text-slate-400">${s.icon_class}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="deleteSkill(${s.id})" class="p-2 rounded-xl bg-slate-800 hover:bg-red-900/40 text-red-400">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </td>
        </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function deleteSkill(id) {
    if (!confirm('Delete this skill?')) return;
    let skills = getStoredData('site_skills', DEFAULT_SKILLS);
    skills = skills.filter(s => s.id !== id);
    localStorage.setItem('site_skills', JSON.stringify(skills));
    renderAdminSkills();
}

function renderAdminMessages() {
    const container = document.getElementById('admin-messages-container');
    if (!container) return;

    const messages = getStoredData('site_messages', []);
    if (messages.length === 0) {
        container.innerHTML = `<div class="text-center py-12 glass-card rounded-2xl text-slate-500">Inbox is empty. Client inquiries will appear here.</div>`;
        return;
    }

    container.innerHTML = messages.map(msg => `
        <div class="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                    <div class="font-bold text-white">${msg.name} <span class="text-xs text-slate-400">(${msg.email})</span></div>
                    <div class="text-xs text-blue-400 font-mono">Phone: ${msg.phone || 'N/A'} | Subject: ${msg.subject || 'Inquiry'}</div>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="text-xs text-slate-500 font-mono">${msg.created_at}</span>
                    <button onclick="deleteMessage(${msg.id})" class="p-1.5 rounded-lg bg-slate-800 text-red-400">
                        <i data-lucide="trash" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
            <p class="text-slate-300 text-sm whitespace-pre-line">${msg.message}</p>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function deleteMessage(id) {
    let messages = getStoredData('site_messages', []);
    messages = messages.filter(m => m.id !== id);
    localStorage.setItem('site_messages', JSON.stringify(messages));
    renderAdminMessages();
}

function fillAdminSettings() {
    const settings = getStoredData('site_settings', DEFAULT_SETTINGS);

    const nameEl = document.getElementById('setting-owner-name');
    if (nameEl) nameEl.value = settings.owner_name;

    const roleEl = document.getElementById('setting-owner-role');
    if (roleEl) roleEl.value = settings.owner_role;

    const bioEl = document.getElementById('setting-owner-bio');
    if (bioEl) bioEl.value = settings.owner_bio;

    const emailEl = document.getElementById('setting-email');
    if (emailEl) emailEl.value = settings.email;

    const phoneEl = document.getElementById('setting-phone');
    if (phoneEl) phoneEl.value = settings.phone;

    const logoEl = document.getElementById('setting-logo-url');
    if (logoEl) logoEl.value = settings.site_logo || '';
}
