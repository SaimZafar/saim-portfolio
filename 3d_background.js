/* ============================================================
   Saim Zafar | DevHQ - 3d_background.js
   Three.js starfield + GSAP scroll animations
   ============================================================ */

const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const starsGeometry = new THREE.BufferGeometry();
const starsCount = 3200;
const posArray = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

function createStarTexture() {
    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;

    const ctx = c.getContext('2d');
    const center = 16;
    const radius = 14;

    const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(216, 180, 254, 0.8)');
    gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    return new THREE.CanvasTexture(c);
}

const starsMaterial = new THREE.PointsMaterial({
    size: 0.15,
    map: createStarTexture(),
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    depthWrite: false
});

const starMesh = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starMesh);

// Accent star layers: indigo + pink tints to match the palette
function createAccentStars(count, colorHex, size) {
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
        arr[i] = (Math.random() - 0.5) * 100;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const mat = new THREE.PointsMaterial({
        size: size,
        map: createStarTexture(),
        color: colorHex,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
        depthWrite: false
    });
    return new THREE.Points(geo, mat);
}

const indigoStars = createAccentStars(400, 0x6366f1, 0.18);
const pinkStars = createAccentStars(400, 0xec4899, 0.18);
scene.add(indigoStars);
scene.add(pinkStars);

camera.position.z = 20;

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.0001;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.0001;
}, { passive: true });

function animate() {
    starMesh.rotation.y += 0.0001;
    starMesh.rotation.x += 0.00005;

    starMesh.rotation.y += mouseX * 0.5;
    starMesh.rotation.x += mouseY * 0.5;

    // Accent layers drift at slightly different speeds for depth
    indigoStars.rotation.y -= 0.00008 - mouseX * 0.35;
    indigoStars.rotation.x += 0.00004 + mouseY * 0.35;
    pinkStars.rotation.y += 0.00012 + mouseX * 0.45;
    pinkStars.rotation.x -= 0.00006 - mouseY * 0.45;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ============================================================
   GSAP animations
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);

// Hero intro sequence
const hero = document.querySelector('.hero');
if (hero) {
    const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 1 }, delay: 0.4 });

    tl.fromTo(".sub-title",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0 }
    )
        .fromTo(".year",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0 },
            "-=0.5"
        )
        .fromTo(".main-title",
            { opacity: 0, scale: 0.9, y: 20 },
            { opacity: 1, scale: 1, y: 0 },
            "-=0.5"
        )
        .fromTo(".hero-buttons .btn-resume:first-child",
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0 },
            "-=0.5"
        )
        .fromTo(".hero-buttons .btn-resume:last-child",
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0 },
            "<"
        )
        .fromTo(".navbar",
            { opacity: 0, y: -30 },
            { opacity: 1, y: 0, duration: 0.7 },
            "-=0.6"
        );
}

// Section titles
document.querySelectorAll('.section-title').forEach(title => {
    gsap.fromTo(title,
        { opacity: 0, y: 40 },
        {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
                trigger: title,
                start: "top 88%",
                toggleActions: "play none none reverse"
            }
        }
    );
});

// Achievements timeline - alternating slides
document.querySelectorAll('.timeline-item').forEach((item) => {
    const isLeft = item.classList.contains('left');
    gsap.fromTo(item,
        { opacity: 0, x: isLeft ? -80 : 80 },
        {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        }
    );
});

// Project cards - staggered pop
const projectCards = document.querySelectorAll('.experience-card');
if (projectCards.length) {
    gsap.fromTo(projectCards,
        { opacity: 0, y: 60, scale: 0.95 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "back.out(1.4)",
            stagger: 0.12,
            scrollTrigger: {
                trigger: '.experience-grid',
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        }
    );
}

// Skill cards - quick stagger
const skillCards = document.querySelectorAll('.skill-grid .skill-card');
if (skillCards.length) {
    gsap.fromTo(skillCards,
        { opacity: 0, y: 40, scale: 0.9 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
            stagger: { each: 0.05, from: "start" },
            scrollTrigger: {
                trigger: '.skill-grid',
                start: "top 82%",
                toggleActions: "play none none reverse"
            }
        }
    );
}

// Profile cards
const profileCards = document.querySelectorAll('.profile-card');
if (profileCards.length) {
    gsap.fromTo(profileCards,
        { opacity: 0, y: 40 },
        {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.1,
            scrollTrigger: {
                trigger: '.profiles-grid',
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        }
    );
}

// Contact - blur-in
const contactContainer = document.querySelector('.contact-container');
if (contactContainer) {
    gsap.fromTo(contactContainer,
        { opacity: 0, scale: 0.92, filter: "blur(8px)" },
        {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: contactContainer,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        }
    );
}
