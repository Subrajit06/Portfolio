// Client Frontend JavaScript logic

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons if available
    if (window.lucide) {
        lucide.createIcons();
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Featured Showcase Frame Switcher
    const featThumbnails = document.querySelectorAll('.feat-thumb-btn');
    const featTitle = document.getElementById('feat-title');
    const featDesc = document.getElementById('feat-desc');
    const featImg = document.getElementById('feat-img');
    const featCategory = document.getElementById('feat-category');
    const featStack = document.getElementById('feat-stack');
    const featLive = document.getElementById('feat-live');
    const featSource = document.getElementById('feat-source');

    if (featThumbnails.length > 0) {
        featThumbnails.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active borders
                featThumbnails.forEach(b => b.classList.remove('ring-2', 'ring-blue-500'));
                btn.classList.add('ring-2', 'ring-blue-500');

                // Read dataset
                const data = btn.dataset;
                if (featTitle) featTitle.textContent = data.title;
                if (featDesc) featDesc.textContent = data.desc;
                if (featImg) featImg.src = data.img;
                if (featCategory) featCategory.textContent = data.category;
                if (featLive) featLive.href = data.live || '#';
                if (featSource) featSource.href = data.source || '#';

                // Tech stack tags
                if (featStack && data.stack) {
                    featStack.innerHTML = '';
                    data.stack.split(',').forEach(tag => {
                        const span = document.createElement('span');
                        span.className = 'px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20';
                        span.textContent = tag.trim();
                        featStack.appendChild(span);
                    });
                }
            });
        });
    }

    // Project Category Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;

                filterBtns.forEach(b => b.classList.remove('bg-blue-600', 'text-white'));
                filterBtns.forEach(b => b.classList.add('bg-slate-800/80', 'text-slate-400'));
                btn.classList.remove('bg-slate-800/80', 'text-slate-400');
                btn.classList.add('bg-blue-600', 'text-white');

                projectCards.forEach(card => {
                    if (category === 'all' || card.dataset.category === category) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Contact Form AJAX Submission
    const contactForm = document.getElementById('contact-form');
    const contactAlert = document.getElementById('contact-alert');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="animate-spin inline-block mr-2">⏳</span> Sending...';

            try {
                const formData = new FormData(contactForm);
                const response = await fetch('/contact', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (contactAlert) {
                    contactAlert.classList.remove('hidden', 'bg-red-500/10', 'border-red-500/20', 'text-red-400', 'bg-green-500/10', 'border-green-500/20', 'text-green-400');
                    if (result.success) {
                        contactAlert.classList.add('bg-green-500/10', 'border-green-500/20', 'text-green-400', 'p-4', 'rounded-xl', 'border');
                        contactAlert.textContent = result.message;
                        contactForm.reset();
                    } else {
                        contactAlert.classList.add('bg-red-500/10', 'border-red-500/20', 'text-red-400', 'p-4', 'rounded-xl', 'border');
                        contactAlert.textContent = result.message || 'An error occurred. Please try again.';
                    }
                }
            } catch (err) {
                if (contactAlert) {
                    contactAlert.classList.remove('hidden');
                    contactAlert.className = 'p-4 rounded-xl border bg-red-500/10 border-red-500/20 text-red-400';
                    contactAlert.textContent = 'Failed to submit form. Please check network connection.';
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                if (window.lucide) lucide.createIcons();
            }
        });
    }
});
