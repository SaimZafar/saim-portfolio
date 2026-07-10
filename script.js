/* ============================================================
   Saim Zafar | DevHQ - script.js
   UI interactivity: preloader, cursor, nav, typing, counters,
   timeline progress, card effects, contact form, resume modal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Touch device detection (disables custom cursor) ---------- */
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) document.body.classList.add('touch-device');

    /* ---------- Preloader ---------- */
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => preloader.classList.add('hidden'), 400);
        });
        // Safety fallback in case 'load' already fired or hangs
        setTimeout(() => preloader.classList.add('hidden'), 3500);
    }

    /* ---------- About card scroll reveal ---------- */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle('expanded', entry.isIntersecting);
        });
    }, { root: null, rootMargin: '0px', threshold: 0.3 });

    document.querySelectorAll('.about-section .scroll-reveal').forEach(el => observer.observe(el));

    /* ---------- Typing animation ---------- */
    const typingText = document.getElementById('typing-text');
    const words = ["FULL-STACK DEV", "ML ENGINEER", "PROBLEM SOLVER", "SYSTEM BUILDER", "CODER"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 100;
    const deleteSpeed = 55;
    const wordPause = 1500;

    function type() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let speed = isDeleting ? deleteSpeed : typeSpeed;

        if (!isDeleting && charIndex === currentWord.length) {
            speed = wordPause;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            speed = 500;
        }

        setTimeout(type, speed);
    }

    if (typingText) type();

    /* ---------- Custom cursor ---------- */
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');

    if (!isTouch && cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            cursorOutline.animate(
                { left: `${posX}px`, top: `${posY}px` },
                { duration: 450, fill: "forwards" }
            );
        }, { passive: true });

        document.querySelectorAll('a, button, .floating-icon, .skill-card').forEach(el => {
            el.addEventListener('mouseenter', () => cursorOutline.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hovered'));
        });
    }

    /* ---------- Navbar: mobile toggle + scrolled state ---------- */
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinksWrap = document.getElementById('navLinks');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navLinksWrap) {
        navToggle.addEventListener('click', () => navLinksWrap.classList.toggle('open'));
        navLinks.forEach(link => link.addEventListener('click', () => navLinksWrap.classList.remove('open')));
    }

    /* ---------- Unified scroll handler (rAF-throttled) ---------- */
    const scrollProgress = document.getElementById('scrollProgress');
    const backToTopBtn = document.getElementById('backToTop');
    const sections = Array.from(document.querySelectorAll('section[id], main[id]'));
    const timelineSection = document.querySelector('.timeline');
    const timelineProgress = timelineSection ? timelineSection.querySelector('.timeline-progress') : null;
    const timelineDots = timelineSection ? timelineSection.querySelectorAll('.timeline-dot') : [];

    let ticking = false;

    function onScroll() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        // 1) Top scroll progress bar
        if (scrollProgress && docHeight > 0) {
            scrollProgress.style.width = `${(scrollY / docHeight) * 100}%`;
        }

        // 2) Navbar background on scroll
        if (navbar) navbar.classList.toggle('scrolled', scrollY > 40);

        // 3) Active nav link highlighting
        let currentId = 'home';
        sections.forEach(sec => {
            if (scrollY >= sec.offsetTop - 140) currentId = sec.id;
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
        });

        // 4) Timeline progress + dots
        if (timelineProgress) {
            const rect = timelineSection.getBoundingClientRect();
            const startOffset = window.innerHeight / 2;
            let progressPercentage = ((startOffset - rect.top) / rect.height) * 100;
            progressPercentage = Math.max(0, Math.min(100, progressPercentage));
            timelineProgress.style.height = `${progressPercentage}%`;

            const lineBottom = timelineProgress.getBoundingClientRect().bottom;
            timelineDots.forEach(dot => {
                dot.classList.toggle('active', lineBottom > dot.getBoundingClientRect().top);
            });
        }

        // 5) Back-to-top bounce near page end
        if (backToTopBtn) {
            const nearBottom = (window.innerHeight + scrollY) >= document.documentElement.scrollHeight - 50;
            backToTopBtn.classList.toggle('bounce', nearBottom);
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });

    onScroll();

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------- Animated stat counters ---------- */
    const statNumbers = document.querySelectorAll('.stat-number');

    function animateCounter(el) {
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1600;
        const startTime = performance.now();

        function tick(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = (target * eased).toFixed(decimals) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    if (statNumbers.length) {
        const statObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });

        statNumbers.forEach(el => statObserver.observe(el));
    }

    /* ---------- Project card spotlight ---------- */
    document.querySelectorAll('.experience-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    /* ---------- About card 3D tilt ---------- */
    const aboutCard = document.querySelector('.glass-card.scroll-reveal');
    if (aboutCard && !isTouch) {
        aboutCard.addEventListener('mousemove', (e) => {
            if (!aboutCard.classList.contains('expanded')) return;

            const rect = aboutCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            const title = aboutCard.querySelector('h2');
            const para = aboutCard.querySelector('p');
            if (title) title.style.transform = 'translateZ(40px)';
            if (para) para.style.transform = 'translateZ(20px)';

            aboutCard.style.transition = 'transform 0.1s ease-out';
            aboutCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        aboutCard.addEventListener('mouseleave', () => {
            if (!aboutCard.classList.contains('expanded')) return;

            aboutCard.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
            aboutCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';

            const title = aboutCard.querySelector('h2');
            const para = aboutCard.querySelector('p');
            if (title) title.style.transform = 'translateZ(0)';
            if (para) para.style.transform = 'translateZ(0)';

            setTimeout(() => { aboutCard.style.transition = ''; }, 600);
        });
    }

    /* ---------- Contact form (Web3Forms) ----------
       Get a free access key at https://web3forms.com and
       paste it below to make the form deliver to your email. */
    const WEB3FORMS_ACCESS_KEY = "YOUR_WEB3FORMS_ACCESS_KEY";

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;

            btn.innerHTML = '<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none';

            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            object.access_key = WEB3FORMS_ACCESS_KEY;
            object.subject = `Portfolio message from ${object.name || 'visitor'}`;

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(object)
            })
                .then(async (response) => {
                    await response.json();
                    if (response.status === 200) {
                        btn.innerHTML = '<span>Message Delivered!</span> <i class="fa-solid fa-check"></i>';
                        btn.style.background = 'linear-gradient(90deg, #22c55e, #16a34a, #22c55e)';
                        btn.style.borderColor = '#4ade80';
                        contactForm.reset();
                    } else {
                        btn.innerHTML = '<span>Error, Please Retry!</span> <i class="fa-solid fa-triangle-exclamation"></i>';
                        btn.style.background = 'linear-gradient(90deg, #ef4444, #dc2626, #ef4444)';
                    }
                })
                .catch(() => {
                    btn.innerHTML = '<span>Error!</span> <i class="fa-solid fa-triangle-exclamation"></i>';
                    btn.style.background = 'linear-gradient(90deg, #ef4444, #dc2626, #ef4444)';
                })
                .finally(() => {
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.background = '';
                        btn.style.borderColor = '';
                        btn.style.opacity = '1';
                        btn.style.pointerEvents = 'all';
                    }, 3000);
                });
        });
    }

    /* ---------- Resume modal ---------- */
    const resumeModal = document.getElementById('resumeModal');
    const openResumeBtn = document.getElementById('openResumeBtn');
    const closeResumeBtn = document.getElementById('closeResumeBtn');

    if (resumeModal && closeResumeBtn) {
        const openModal = (e) => {
            if (e) e.preventDefault();
            // Lazy-load the PDF only when the modal is first opened
            const frame = document.getElementById('resumeFrame');
            if (frame && !frame.src) frame.src = frame.dataset.src;
            resumeModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        };

        const closeModal = () => {
            resumeModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        };

        if (openResumeBtn) openResumeBtn.addEventListener('click', openModal);
        closeResumeBtn.addEventListener('click', closeModal);

        resumeModal.addEventListener('click', (e) => {
            if (e.target === resumeModal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && resumeModal.classList.contains('show')) closeModal();
        });
    }

});
