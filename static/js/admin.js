// Admin Dashboard JavaScript Logic

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    // Admin Sidebar / Tab Navigation
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    function switchTab(targetId) {
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${targetId}`) {
                link.classList.add('bg-blue-600/20', 'text-blue-400', 'border-blue-500/30');
                link.classList.remove('text-slate-400', 'hover:bg-slate-800');
            } else {
                link.classList.remove('bg-blue-600/20', 'text-blue-400', 'border-blue-500/30');
                link.classList.add('text-slate-400', 'hover:bg-slate-800');
            }
        });

        tabContents.forEach(content => {
            if (content.id === `tab-${targetId}`) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').replace('#', '');
            window.location.hash = targetId;
            switchTab(targetId);
        });
    });

    // Check URL Hash on load
    const currentHash = window.location.hash.replace('#', '') || 'projects';
    switchTab(currentHash);

    // --- Helper for Modal Backdrop & ESC key closing ---
    const allModals = document.querySelectorAll('.modal-overlay');
    allModals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            allModals.forEach(m => m.classList.add('hidden'));
        }
    });

    // --- Add Project Modal ---
    const addProjectModal = document.getElementById('add-project-modal');
    const openAddProjectBtn = document.getElementById('open-add-project-btn');
    const closeAddProjectBtn = document.getElementById('close-add-project-btn');

    if (openAddProjectBtn && addProjectModal) {
        openAddProjectBtn.addEventListener('click', () => {
            addProjectModal.classList.remove('hidden');
            if (window.lucide) lucide.createIcons();
        });
    }
    if (closeAddProjectBtn && addProjectModal) {
        closeAddProjectBtn.addEventListener('click', () => addProjectModal.classList.add('hidden'));
    }

    // --- Edit Project Modal ---
    const editProjectModal = document.getElementById('edit-project-modal');
    const editProjectForm = document.getElementById('edit-project-form');
    const closeEditProjectBtn = document.getElementById('close-edit-project-btn');
    const editProjectBtns = document.querySelectorAll('.edit-project-btn');

    if (editProjectBtns.length > 0 && editProjectModal) {
        editProjectBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const data = btn.dataset;
                editProjectForm.action = `/admin/projects/edit/${data.id}`;
                document.getElementById('edit-proj-title').value = data.title;
                document.getElementById('edit-proj-desc').value = data.desc;
                document.getElementById('edit-proj-category').value = data.category;
                document.getElementById('edit-proj-serial').value = data.serial;
                document.getElementById('edit-proj-price').value = data.price;
                document.getElementById('edit-proj-live').value = data.live;
                document.getElementById('edit-proj-source').value = data.source;
                document.getElementById('edit-proj-stack').value = data.stack;
                document.getElementById('edit-proj-thumb-url').value = data.thumb;
                
                document.getElementById('edit-proj-featured').checked = (data.featured === '1');
                document.getElementById('edit-proj-store').checked = (data.store === '1');

                editProjectModal.classList.remove('hidden');
                if (window.lucide) lucide.createIcons();
            });
        });
    }

    if (closeEditProjectBtn && editProjectModal) {
        closeEditProjectBtn.addEventListener('click', () => editProjectModal.classList.add('hidden'));
    }

    // --- Add Skill Modal ---
    const addSkillModal = document.getElementById('add-skill-modal');
    const openAddSkillBtn = document.getElementById('open-add-skill-btn');
    const closeAddSkillBtn = document.getElementById('close-add-skill-btn');

    if (openAddSkillBtn && addSkillModal) {
        openAddSkillBtn.addEventListener('click', () => {
            addSkillModal.classList.remove('hidden');
            if (window.lucide) lucide.createIcons();
        });
    }
    if (closeAddSkillBtn && addSkillModal) {
        closeAddSkillBtn.addEventListener('click', () => addSkillModal.classList.add('hidden'));
    }

    // --- Edit Skill Modal ---
    const editSkillModal = document.getElementById('edit-skill-modal');
    const editSkillForm = document.getElementById('edit-skill-form');
    const closeEditSkillBtn = document.getElementById('close-edit-skill-btn');
    const editSkillBtns = document.querySelectorAll('.edit-skill-btn');

    if (editSkillBtns.length > 0 && editSkillModal) {
        editSkillBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const data = btn.dataset;
                editSkillForm.action = `/admin/skills/edit/${data.id}`;
                document.getElementById('edit-skill-name').value = data.name;
                document.getElementById('edit-skill-category').value = data.category;
                document.getElementById('edit-skill-proficiency').value = data.proficiency;
                document.getElementById('edit-skill-icon').value = data.icon;
                document.getElementById('edit-skill-serial').value = data.serial;

                editSkillModal.classList.remove('hidden');
                if (window.lucide) lucide.createIcons();
            });
        });
    }

    if (closeEditSkillBtn && editSkillModal) {
        closeEditSkillBtn.addEventListener('click', () => editSkillModal.classList.add('hidden'));
    }
});
