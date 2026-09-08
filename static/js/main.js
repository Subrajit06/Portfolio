// Client Frontend & Data Store JavaScript logic

const DEFAULT_SETTINGS = {
    owner_name: 'Subhrajit Bhattacharjee',
    owner_role: 'Full-Stack Software Engineer & Creative UI Designer',
    owner_bio: 'Building high-performance web applications, scalable APIs, and sleek digital experiences. Specializing in modern Python, JavaScript, and custom cloud solutions.',
    email: 'subhrajitbhattacharjee6@gmail.com',
    phone: '+91 6009916591',
    site_logo: ''
};

const DEFAULT_PROJECTS = [
    {
        id: 1,
        title: 'AI-Powered E-Commerce Store & CMS',
        description: 'An enterprise-grade e-commerce application with smart product recommendations, serial ordering, real-time inventory management, and an interactive admin dashboard.',
        category: 'Full-Stack Web App',
        thumbnail: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80',
        source_link: 'https://github.com/Subrajit06',
        live_link: 'https://example.com/demo1',
        serial_order: 1,
        is_featured: 1,
        is_store_item: 1,
        price: '$199 / Commercial',
        tech_stack: 'Python, Flask, SQLite, TailwindCSS'
    },
    {
        id: 2,
        title: 'Next-Gen Analytics & SaaS Dashboard',
        description: 'Real-time data visualization platform built for SaaS analytics with live telemetry tracking, client access management, and dark glassmorphic UI widgets.',
        category: 'SaaS / Dashboard',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        source_link: 'https://github.com/Subrajit06',
        live_link: 'https://example.com/demo2',
        serial_order: 2,
        is_featured: 1,
        is_store_item: 0,
        price: 'Custom / Project',
        tech_stack: 'React, Node.js, Chart.js, Tailwind'
    },
    {
        id: 3,
        title: 'Mobile Cross-Platform Portfolio App',
        description: 'Sleek mobile app built for showcasing creative agency portfolios, client interaction forms, push notifications, and store product digital downloads.',
        category: 'Mobile App',
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
        source_link: 'https://github.com/Subrajit06',
        live_link: 'https://example.com/demo3',
        serial_order: 3,
        is_featured: 0,
        is_store_item: 1,
        price: '$49 / Source Code',
        tech_stack: 'Flutter, Python API, SQLite'
    }
];

const DEFAULT_SKILLS = [
    { id: 1, name: 'Python / Flask / Django', category: 'Backend', proficiency: 95, icon_class: 'terminal', serial_order: 1 },
    { id: 2, name: 'JavaScript / React / Node.js', category: 'Frontend', proficiency: 90, icon_class: 'code', serial_order: 2 },
    { id: 3, name: 'TailwindCSS & Glassmorphism UI', category: 'Frontend', proficiency: 92, icon_class: 'layout', serial_order: 3 },
    { id: 4, name: 'SQLite / PostgreSQL / MySQL', category: 'Database & DevOps', proficiency: 88, icon_class: 'database', serial_order: 4 },
    { id: 5, name: 'RESTful APIs & Microservices', category: 'Backend', proficiency: 92, icon_class: 'server', serial_order: 5 },
    { id: 6, name: 'Git / GitHub & Cloud Deployment', category: 'Tools & DevOps', proficiency: 90, icon_class: 'git-branch', serial_order: 6 }
];

function getStoredData(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        return fallback;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Load Data from LocalStorage
    const settings = getStoredData('site_settings', DEFAULT_SETTINGS);
    const projects = getStoredData('site_projects', DEFAULT_PROJECTS);
    const skills = getStoredData('site_skills', DEFAULT_SKILLS);

    // Force update email if old email was present
    if (settings.email === 'subhrajitbhattacharjee@gmail.com') {
        settings.email = 'subhrajitbhattacharjee6@gmail.com';
        localStorage.setItem('site_settings', JSON.stringify(settings));
    }

    if (window.lucide) lucide.createIcons();

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    }

    renderSettings(settings);
    renderFeaturedFrame(projects);
    renderSkills(skills);
    renderProjects(projects);
    renderStore(projects);

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const msgObj = {
                id: Date.now(),
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                created_at: new Date().toLocaleString()
            };

            const existingMsgs = getStoredData('site_messages', []);
            existingMsgs.unshift(msgObj);
            localStorage.setItem('site_messages', JSON.stringify(existingMsgs));

            const alertBox = document.getElementById('contact-alert');
            if (alertBox) {
                alertBox.className = 'p-4 rounded-xl border bg-green-500/10 border-green-500/20 text-green-400 text-sm';
                alertBox.textContent = 'Thank you! Your message has been sent successfully. Subhrajit will get back to you soon.';
                alertBox.classList.remove('hidden');
            }
            contactForm.reset();
        });
    }
});

function renderSettings(s) {
    const ownerElems = ['header-owner-name', 'hero-name', 'footer-owner-name'];
    ownerElems.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = s.owner_name;
    });

    const roleEl = document.getElementById('hero-role');
    if (roleEl) roleEl.textContent = s.owner_role;

    const bioEl = document.getElementById('hero-bio');
    if (bioEl) bioEl.textContent = s.owner_bio;

    const footerBio = document.getElementById('footer-owner-bio');
    if (footerBio) footerBio.textContent = s.owner_bio;

    const emailElems = ['hero-email', 'contact-card-email', 'footer-email'];
    emailElems.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = s.email;
            if (el.tagName === 'A') el.href = `mailto:${s.email}`;
        }
    });

    const phoneElems = ['hero-phone', 'contact-card-phone', 'footer-phone'];
    phoneElems.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = s.phone;
            if (el.tagName === 'A') el.href = `tel:${s.phone}`;
        }
    });

    if (s.site_logo) {
        const logoContainers = ['site-logo-container', 'footer-logo-container'];
        logoContainers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `<img src="${s.site_logo}" alt="Logo" class="h-10 w-auto max-w-[150px] object-contain rounded-xl border border-slate-700">`;
            }
        });
    }
}

function renderFeaturedFrame(projects) {
    const container = document.getElementById('featured-frame-container');
    const thumbContainer = document.getElementById('featured-thumbnails-container');
    if (!container) return;

    const featuredList = projects.filter(p => Number(p.is_featured) === 1);
    const activeFeat = featuredList.length > 0 ? featuredList[0] : (projects[0] || null);

    if (!activeFeat) {
        container.innerHTML = `<div class="text-center py-12 glass-panel rounded-2xl border border-slate-800 text-slate-500">No featured projects found.</div>`;
        return;
    }

    container.innerHTML = `
        <div class="featured-frame p-6 sm:p-10 mb-4">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div class="lg:col-span-7 relative group rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60">
                    <img id="feat-img" src="${activeFeat.thumbnail}" alt="${activeFeat.title}" class="w-full h-72 sm:h-96 object-cover transition-transform duration-500 group-hover:scale-105">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-transparent to-transparent opacity-80"></div>
                    <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <span id="feat-category" class="px-3 py-1 text-xs font-bold rounded-xl bg-blue-600 text-white shadow">${activeFeat.category}</span>
                        <span class="px-3 py-1 text-xs font-mono font-bold rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300">Featured Highlight</span>
                    </div>
                </div>
                <div class="lg:col-span-5 space-y-6">
                    <div>
                        <div class="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider mb-2">Project Showcase</div>
                        <h3 id="feat-title" class="text-2xl sm:text-3xl font-extrabold text-white leading-tight">${activeFeat.title}</h3>
                    </div>
                    <p id="feat-desc" class="text-slate-300 text-sm leading-relaxed">${activeFeat.description}</p>
                    <div>
                        <div class="text-xs font-semibold text-slate-400 mb-2">Technologies Used:</div>
                        <div id="feat-stack" class="flex flex-wrap gap-2">
                            ${(activeFeat.tech_stack || '').split(',').map(tag => `<span class="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">${tag.trim()}</span>`).join('')}
                        </div>
                    </div>
                    <div class="pt-4 border-t border-slate-800 flex items-center space-x-4">
                        <a id="feat-live" href="${activeFeat.live_link || '#'}" target="_blank" class="px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white flex items-center space-x-2">
                            <i data-lucide="external-link" class="w-4 h-4"></i>
                            <span>Live Demo</span>
                        </a>
                        <a id="feat-source" href="${activeFeat.source_link || '#'}" target="_blank" class="px-5 py-2.5 text-xs font-bold rounded-xl glass-card text-slate-300 border border-slate-700 flex items-center space-x-2">
                            <i data-lucide="code" class="w-4 h-4"></i>
                            <span>Source Code</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (thumbContainer && featuredList.length > 1) {
        thumbContainer.innerHTML = featuredList.map((feat, idx) => `
            <button class="feat-thumb-btn flex-shrink-0 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500 transition-all ${idx === 0 ? 'ring-2 ring-blue-500' : ''}"
                    onclick="switchFeatured(${idx})">
                <img src="${feat.thumbnail}" alt="" class="w-20 h-14 object-cover rounded-xl">
            </button>
        `).join('');
    }

    if (window.lucide) lucide.createIcons();
}

function renderSkills(skills) {
    const grid = document.getElementById('skills-grid');
    if (!grid) return;

    const grouped = {};
    skills.forEach(s => {
        if (!grouped[s.category]) grouped[s.category] = [];
        grouped[s.category].push(s);
    });

    grid.innerHTML = Object.keys(grouped).map(catName => `
        <div class="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
            <div class="flex items-center space-x-3 border-b border-slate-800 pb-4">
                <div class="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <i data-lucide="layers" class="w-5 h-5"></i>
                </div>
                <h3 class="font-bold text-lg text-white">${catName}</h3>
            </div>
            <div class="space-y-4">
                ${grouped[catName].map(skill => `
                    <div class="space-y-1.5">
                        <div class="flex items-center justify-between text-xs">
                            <span class="font-semibold text-slate-200 flex items-center space-x-2">
                                <i data-lucide="${skill.icon_class || 'code'}" class="w-3.5 h-3.5 text-blue-400"></i>
                                <span>${skill.name}</span>
                            </span>
                            <span class="font-mono text-purple-400 font-bold">${skill.proficiency}%</span>
                        </div>
                        <div class="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style="width: ${skill.proficiency}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    const filterBox = document.getElementById('projects-filter-container');
    if (!grid) return;

    const sorted = [...projects].sort((a, b) => Number(a.serial_order) - Number(b.serial_order));

    const pCount = document.getElementById('stat-project-count');
    if (pCount) pCount.textContent = `${sorted.length} Projects Listed`;

    if (filterBox) {
        filterBox.innerHTML = `
            <button class="filter-btn px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white shadow" onclick="filterProjects('all', this)">All Projects</button>
            <button class="filter-btn px-4 py-2 text-xs font-bold rounded-xl bg-slate-800/80 text-slate-400" onclick="filterProjects('Full-Stack Web App', this)">Web Apps</button>
            <button class="filter-btn px-4 py-2 text-xs font-bold rounded-xl bg-slate-800/80 text-slate-400" onclick="filterProjects('Mobile App', this)">Mobile Apps</button>
            <button class="filter-btn px-4 py-2 text-xs font-bold rounded-xl bg-slate-800/80 text-slate-400" onclick="filterProjects('SaaS / Dashboard', this)">SaaS & Dashboards</button>
        `;
    }

    grid.innerHTML = sorted.map(p => `
        <div class="project-card glass-card rounded-3xl overflow-hidden flex flex-col justify-between" data-category="${p.category}">
            <div>
                <div class="relative h-56 overflow-hidden group">
                    <img src="${p.thumbnail}" alt="${p.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-transparent to-transparent opacity-60"></div>
                    <div class="absolute top-4 left-4 flex items-center space-x-2">
                        <span class="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-blue-600 text-white shadow">#${p.serial_order}</span>
                        <span class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300">${p.category}</span>
                    </div>
                    ${Number(p.is_featured) === 1 ? `<span class="absolute top-4 right-4 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-purple-500/80 text-white shadow">★ Featured</span>` : ''}
                </div>
                <div class="p-6 space-y-4">
                    <h3 class="text-xl font-bold text-white hover:text-blue-400 transition-colors line-clamp-1">${p.title}</h3>
                    <p class="text-slate-400 text-xs sm:text-sm line-clamp-3 leading-relaxed">${p.description}</p>
                    <div class="flex flex-wrap gap-1.5 pt-2">
                        ${(p.tech_stack || '').split(',').map(tag => `<span class="px-2.5 py-0.5 text-[11px] font-mono rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">${tag.trim()}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="p-6 pt-0 flex items-center justify-between border-t border-slate-800/60 mt-4 pt-4">
                <a href="${p.live_link || '#'}" target="_blank" class="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                    <span>Live Demo</span>
                    <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                </a>
                <a href="${p.source_link || '#'}" target="_blank" class="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center space-x-1.5">
                    <i data-lucide="github" class="w-3.5 h-3.5"></i>
                    <span>Source</span>
                </a>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function renderStore(projects) {
    const grid = document.getElementById('store-grid');
    if (!grid) return;

    const storeItems = projects.filter(p => Number(p.is_store_item) === 1);
    const sCount = document.getElementById('stat-store-count');
    if (sCount) sCount.textContent = `${storeItems.length} Ready Source Items`;

    grid.innerHTML = storeItems.map(item => `
        <div class="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
                <div class="relative h-44 rounded-2xl overflow-hidden mb-4">
                    <img src="${item.thumbnail}" alt="${item.title}" class="w-full h-full object-cover">
                    <span class="absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-xl bg-emerald-600 text-white shadow">${item.price || 'Contact'}</span>
                </div>
                <h3 class="font-bold text-lg text-white mb-2">${item.title}</h3>
                <p class="text-slate-400 text-xs line-clamp-2 leading-relaxed">${item.description}</p>
            </div>
            <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span class="text-xs text-slate-500 font-mono">Serial #${item.serial_order}</span>
                <a href="index.html#contact" class="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all flex items-center space-x-1.5">
                    <i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i>
                    <span>Inquire / Get Code</span>
                </a>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function filterProjects(cat, btn) {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(b => b.className = 'filter-btn px-4 py-2 text-xs font-bold rounded-xl bg-slate-800/80 text-slate-400');
    btn.className = 'filter-btn px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white shadow';

    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}
