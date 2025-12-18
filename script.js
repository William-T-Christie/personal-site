/* ============================================
   William T. Christie - Personal Website
   ============================================ */

// ============================================
// HACKER MODE - Project Content
// ============================================

const projectContent = {
    boomer: [
        {
            title: 'Daily Affirmations with Billy Joel',
            description: "Every morning the Piano Man tells you you're an innocent man",
            tech: 'AI · Existential Comfort'
        },
        {
            title: 'Buzzword Bingo',
            description: 'AI that listens to your meetings and scores them for corporate speak',
            tech: 'JavaScript · Whisper AI'
        },
        {
            title: 'Miami Food Roulette',
            description: "Can't decide where to eat? Spin the wheel, get a restaurant",
            tech: 'React · Google Places API'
        },
        {
            title: 'Doom Scroller Anonymous',
            description: 'Tracks your screen time, roasts your choices',
            tech: 'Swift · Screen Time API'
        },
        {
            title: 'Super Secret Pending Project',
            description: 'I bet you wish you knew what this was',
            tech: '??? · ??? · ???'
        },
        {
            title: 'This Website',
            description: "You're looking at it. Seven color palettes because I couldn't pick one",
            tech: 'HTML · CSS'
        }
    ],
    hacker: [
        {
            title: 'Daily Affirmations with Billy Joel',
            description: "Every morning the Piano Man tells you you're an innocent man",
            tech: 'AI · Existential Comfort'
        },
        {
            title: 'Buzzword Bingo',
            description: 'AI that listens to your meetings and scores them for corporate speak',
            tech: 'JavaScript · Whisper AI'
        },
        {
            title: 'Miami Food Roulette',
            description: "Can't decide where to eat? Spin the wheel, get a restaurant",
            tech: 'React · Google Places API'
        },
        {
            title: 'Doom Scroller Anonymous',
            description: 'Tracks your screen time, roasts your choices',
            tech: 'Swift · Screen Time API'
        },
        {
            title: 'Super Secret Pending Project',
            description: 'I bet you wish you knew what this was',
            tech: '??? · ??? · ???'
        },
        {
            title: 'This Website',
            description: "You're looking at it. Seven color palettes because I couldn't pick one",
            tech: 'HTML · CSS'
        }
    ]
};

// ============================================
// FART SOUND
// ============================================

function playFartSound() {
    const fart = new Audio('fart.mp3');
    fart.volume = 1.0;
    fart.play();
}

// ============================================
// MODE TOGGLE
// ============================================

let isHackerMode = false;
let isTransitioning = false;

function toggleMode() {
    if (isTransitioning) return;
    const targetMode = isHackerMode ? 'boomer' : 'hacker';
    handleViewToggle(targetMode);
}

function handleViewToggle(mode) {
    // Prevent multiple transitions
    if (isTransitioning) return;

    // Don't transition if already in the target mode
    if ((mode === 'hacker' && isHackerMode) || (mode === 'boomer' && !isHackerMode)) {
        return;
    }

    isTransitioning = true;

    // Get the relevant checkboxes based on current view
    const currentCheckmark = isHackerMode
        ? document.querySelector('#hacker-checkbox')?.parentElement?.querySelector('.checkmark')
        : document.querySelector('#boomer-checkbox-sidebar')?.parentElement?.querySelector('.checkmark');

    const targetCheckmark = isHackerMode
        ? document.querySelector('#boomer-checkbox')?.parentElement?.querySelector('.checkmark')
        : document.querySelector('#hacker-checkbox-sidebar')?.parentElement?.querySelector('.checkmark');

    // Get the clicked checkbox for ripple origin
    const clickedCheckbox = mode === 'hacker'
        ? (document.querySelector('#hacker-checkbox-sidebar')?.parentElement?.querySelector('.checkmark') ||
           document.querySelector('#hacker-checkbox')?.parentElement?.querySelector('.checkmark'))
        : (document.querySelector('#boomer-checkbox')?.parentElement?.querySelector('.checkmark') ||
           document.querySelector('#boomer-checkbox-sidebar')?.parentElement?.querySelector('.checkmark'));

    // Step 1: Animate checkmark out
    if (currentCheckmark) {
        currentCheckmark.classList.add('animating-out');
    }

    // Step 2: After checkmark flies out, update checkbox states and animate in
    setTimeout(() => {
        // Update the actual checkbox states
        if (mode === 'hacker') {
            isHackerMode = true;
        } else {
            isHackerMode = false;
        }
        updateViewCheckboxes();

        // Remove animating-out class
        if (currentCheckmark) {
            currentCheckmark.classList.remove('animating-out');
        }

        // Animate checkmark into new position
        const newCheckmark = mode === 'hacker'
            ? document.querySelector('#hacker-checkbox-sidebar')?.parentElement?.querySelector('.checkmark')
            : document.querySelector('#boomer-checkbox-sidebar')?.parentElement?.querySelector('.checkmark');

        if (newCheckmark) {
            newCheckmark.classList.add('animating-in');
            setTimeout(() => {
                newCheckmark.classList.remove('animating-in');
            }, 400);
        }

        // Step 3: Start static dissolve transition effect
        startStaticDissolve(clickedCheckbox, mode);

    }, 400); // Wait for checkmark fly-out animation
}

function startStaticDissolve(originElement, targetMode) {
    // Play fart sound when entering hacker mode
    if (targetMode === 'hacker') {
        playFartSound();
    }

    const layout = document.querySelector('.layout');
    if (!layout) {
        completeTransition(targetMode);
        return;
    }

    // Create static noise overlay
    const staticOverlay = document.createElement('div');
    staticOverlay.className = 'static-overlay';

    // Create canvas for noise
    const canvas = document.createElement('canvas');
    canvas.className = 'static-canvas';
    staticOverlay.appendChild(canvas);

    document.body.appendChild(staticOverlay);

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    let animationId;
    let intensity = 0;
    const maxIntensity = 1;
    const dissolveIn = 350; // ms to full static (slower fade in)
    const holdTime = 200; // ms at full static (longer hold)
    const dissolveOut = 400; // ms to reveal new content (slower fade out)
    const totalTime = dissolveIn + holdTime + dissolveOut;
    const startTime = performance.now();

    // CRT-style noise generation with scan lines
    function drawNoise(alpha) {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        const time = performance.now();

        // Rolling scan line position
        const scanLineY = (time * 0.3) % canvas.height;
        const scanLineHeight = 60;

        for (let y = 0; y < canvas.height; y++) {
            // Horizontal sync distortion - slight offset per line
            const hSync = Math.sin(y * 0.1 + time * 0.01) * 2;

            // Scan line brightness boost
            const distToScanLine = Math.abs(y - scanLineY);
            const scanLineBrightness = distToScanLine < scanLineHeight
                ? 1 + (1 - distToScanLine / scanLineHeight) * 0.3
                : 1;

            // Interlace effect - every other line slightly dimmer
            const interlace = y % 2 === 0 ? 1 : 0.85;

            for (let x = 0; x < canvas.width; x++) {
                const i = (y * canvas.width + x) * 4;

                // Base noise value
                let value = Math.random() * 255;

                // Apply CRT effects
                value *= scanLineBrightness * interlace;

                // Slight phosphor glow (warmer tint)
                data[i] = Math.min(255, value * 1.02);     // R slightly boosted
                data[i + 1] = value;                        // G
                data[i + 2] = value * 0.95;                 // B slightly reduced
                data[i + 3] = alpha * 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Add scan line overlay
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.1})`;
        for (let y = 0; y < canvas.height; y += 4) {
            ctx.fillRect(0, y, canvas.width, 2);
        }
    }

    // Animation loop
    function animate() {
        const elapsed = performance.now() - startTime;

        if (elapsed < dissolveIn) {
            // Dissolving in - increasing intensity
            intensity = (elapsed / dissolveIn) * maxIntensity;
            layout.style.opacity = 1 - intensity;
        } else if (elapsed < dissolveIn + holdTime) {
            // Hold at full static - switch mode here
            intensity = maxIntensity;
            layout.style.opacity = 0;
        } else if (elapsed < totalTime) {
            // Dissolving out - decreasing intensity
            const outProgress = (elapsed - dissolveIn - holdTime) / dissolveOut;
            intensity = maxIntensity * (1 - outProgress);
            layout.style.opacity = 1 - intensity;
        } else {
            // Done
            cancelAnimationFrame(animationId);
            staticOverlay.remove();
            layout.style.opacity = 1;
            isTransitioning = false;
            return;
        }

        drawNoise(intensity);
        animationId = requestAnimationFrame(animate);
    }

    // Start animation
    animationId = requestAnimationFrame(animate);

    // Switch mode at the midpoint (when fully covered by static)
    setTimeout(() => {
        if (targetMode === 'hacker') {
            document.body.classList.add('hacker-mode');
            document.documentElement.classList.add('hacker-mode-html');
            localStorage.setItem('siteMode', 'hacker');
            randomizeHackerHeader();
        } else {
            document.body.classList.remove('hacker-mode');
            document.documentElement.classList.remove('hacker-mode-html');
            localStorage.setItem('siteMode', 'boomer');
        }

        void document.body.offsetHeight;

        updateProjectContent();
        updateWelcomeContent();
        updateModeToggleTooltip();
        updateViewCheckboxes();

        window.scrollTo(0, 0);
        document.querySelector('.main')?.scrollTo(0, 0);
    }, dissolveIn + (holdTime / 2));
}

function completeTransition(targetMode) {
    if (targetMode === 'hacker') {
        document.body.classList.add('hacker-mode');
        document.documentElement.classList.add('hacker-mode-html');
        localStorage.setItem('siteMode', 'hacker');
        randomizeHackerHeader();
    } else {
        document.body.classList.remove('hacker-mode');
        document.documentElement.classList.remove('hacker-mode-html');
        localStorage.setItem('siteMode', 'boomer');
    }

    updateProjectContent();
    updateWelcomeContent();
    updateModeToggleTooltip();
    updateViewCheckboxes();

    window.scrollTo(0, 0);
    document.querySelector('.main')?.scrollTo(0, 0);

    isTransitioning = false;
}

function updateViewCheckboxes() {
    // Hacker header checkboxes
    const hackerCheckbox = document.getElementById('hacker-checkbox');
    const boomerCheckbox = document.getElementById('boomer-checkbox');
    // Boomer sidebar checkboxes
    const hackerCheckboxSidebar = document.getElementById('hacker-checkbox-sidebar');
    const boomerCheckboxSidebar = document.getElementById('boomer-checkbox-sidebar');

    if (hackerCheckbox) hackerCheckbox.checked = isHackerMode;
    if (boomerCheckbox) boomerCheckbox.checked = !isHackerMode;
    if (hackerCheckboxSidebar) hackerCheckboxSidebar.checked = isHackerMode;
    if (boomerCheckboxSidebar) boomerCheckboxSidebar.checked = !isHackerMode;
}

function updateModeToggleTooltip() {
    const btn = document.querySelector('.mode-toggle');
    if (btn) {
        btn.title = isHackerMode ? 'Switch to Boomer Mode' : 'Switch to Hacker Mode';
    }
}

function updateProjectContent() {
    const projects = document.querySelectorAll('.project-card');
    const content = isHackerMode ? projectContent.hacker : projectContent.boomer;

    projects.forEach((card, index) => {
        if (content[index]) {
            const titleEl = card.querySelector('h3');
            const descEl = card.querySelector('p');
            const techEl = card.querySelector('.tech');

            if (titleEl) titleEl.textContent = content[index].title;
            if (descEl) descEl.textContent = content[index].description;
            if (techEl) techEl.textContent = content[index].tech;
        }
    });

    // Update section subtitle
    const subtitle = document.querySelector('#projects .section-subtitle');
    if (subtitle) {
        subtitle.textContent = isHackerMode ? '// DEPLOYED EXPLOITS' : 'Things I\'ve built';
    }
}

function updateWelcomeContent() {
    const heading = document.querySelector('.welcome-heading');
    const text = document.querySelector('.welcome-text');
    const subtext = document.querySelector('.welcome-subtext');

    if (isHackerMode) {
        heading.textContent = 'WELCOME_USER';
        heading.setAttribute('data-text', 'WELCOME_USER');
        text.textContent = 'William Christie // Finance & Code // Miami. I build tools that solve problems and break down complexity. Currently studying at University of Miami, interning at Ernst & Young. Side projects always in progress.';
        subtext.textContent = '> status: online // open to connect';
    } else {
        heading.textContent = "Hey, I'm William!";
        heading.setAttribute('data-text', "Hey, I'm William!");
        text.textContent = "I'm a finance student at the University of Miami who loves tackling complex problems and building things that help businesses run smarter. When I'm not crunching numbers, writing code, or building pitch decks, you'll find me volunteering in my community or exploring Miami's food scene.";
        subtext.textContent = 'Always learning. Always building. Always happy to connect!';
    }
}

function initMode() {
    // Restore saved mode from localStorage
    const savedMode = localStorage.getItem('siteMode');
    if (savedMode === 'hacker') {
        isHackerMode = true;
        document.body.classList.add('hacker-mode');
        document.documentElement.classList.add('hacker-mode-html');
    } else {
        isHackerMode = false;
        document.body.classList.remove('hacker-mode');
        document.documentElement.classList.remove('hacker-mode-html');
    }

    // Update all content to match the mode
    updateProjectContent();
    updateWelcomeContent();
    updateModeToggleTooltip();
    updateViewCheckboxes();

    // Randomize hacker mode header color
    if (isHackerMode) {
        randomizeHackerHeader();
    }
}

// Hacker mode header colors and icons (like walzr.com)
const hackerColors = [
    '#ff1493', // hot pink
    '#00bfff', // deep sky blue
    '#32cd32', // lime green
    '#ff6347', // tomato
    '#9370db', // medium purple
    '#ffa500', // orange
    '#00ced1', // dark turquoise
    '#ff69b4', // hot pink lighter
];

const hackerIcons = [
    // Laughing face
    `<svg viewBox="0 0 100 100"><path d="M30 35 Q35 25, 45 30" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M55 30 Q65 25, 70 35" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M25 55 Q50 85, 75 55" stroke="currentColor" stroke-width="4" fill="currentColor"/><circle cx="30" cy="45" r="3" fill="currentColor"/><circle cx="70" cy="45" r="3" fill="currentColor"/></svg>`,
    // Winking face
    `<svg viewBox="0 0 100 100"><circle cx="30" cy="40" r="5" fill="currentColor"/><path d="M55 40 L70 40" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M25 60 Q50 80, 75 60" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    // Cool sunglasses
    `<svg viewBox="0 0 100 100"><rect x="15" y="35" width="25" height="18" rx="3" fill="currentColor"/><rect x="60" y="35" width="25" height="18" rx="3" fill="currentColor"/><path d="M40 44 L60 44" stroke="currentColor" stroke-width="3"/><path d="M30 65 Q50 80, 70 65" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    // Surprised face
    `<svg viewBox="0 0 100 100"><circle cx="30" cy="40" r="6" fill="currentColor"/><circle cx="70" cy="40" r="6" fill="currentColor"/><circle cx="50" cy="70" r="12" stroke="currentColor" stroke-width="4" fill="none"/></svg>`,
    // Smirk
    `<svg viewBox="0 0 100 100"><circle cx="30" cy="40" r="5" fill="currentColor"/><circle cx="70" cy="40" r="5" fill="currentColor"/><path d="M35 65 Q55 75, 75 60" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
];

function randomizeHackerHeader() {
    // Get last used indices from localStorage
    const lastColorIndex = parseInt(localStorage.getItem('lastColorIndex') ?? -1);
    const lastIconIndex = parseInt(localStorage.getItem('lastIconIndex') ?? -1);

    // Pick a different color
    let colorIndex;
    do {
        colorIndex = Math.floor(Math.random() * hackerColors.length);
    } while (colorIndex === lastColorIndex && hackerColors.length > 1);

    // Pick a different icon
    let iconIndex;
    do {
        iconIndex = Math.floor(Math.random() * hackerIcons.length);
    } while (iconIndex === lastIconIndex && hackerIcons.length > 1);

    // Save current indices
    localStorage.setItem('lastColorIndex', colorIndex);
    localStorage.setItem('lastIconIndex', iconIndex);

    document.documentElement.style.setProperty('--hacker-header-color', hackerColors[colorIndex]);

    const iconContainer = document.querySelector('.hacker-icon');
    if (iconContainer) {
        iconContainer.innerHTML = hackerIcons[iconIndex];
    }
}

// ============================================
// COLLAPSIBLE SECTIONS
// ============================================

function initCollapsibles() {
    const collapsibles = document.querySelectorAll('.section.collapsible');

    collapsibles.forEach(section => {
        const header = section.querySelector('h2');
        if (header) {
            header.addEventListener('click', () => {
                // Only toggle if in hacker mode
                if (document.body.classList.contains('hacker-mode')) {
                    section.classList.toggle('expanded');
                }
            });
        }
    });
}

// ============================================
// COLOR PALETTES
// ============================================

// Color Palettes with SVG icons
const palettes = [
    {
        id: 'sand',
        name: 'Sand',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 17c2-2 4-3 6-3s4 1 6 3 4 3 6 3"/><path d="M2 12c2-2 4-3 6-3s4 1 6 3 4 3 6 3"/></svg>',
        bg: '#fdfbf7',
        text: '#33302b',
        textSecondary: '#5f5a52',
        textMuted: '#8f887d',
        border: '#e8e2d9',
        accent: '#a69685'
    },
    {
        id: 'sienna',
        name: 'Sienna',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
        bg: '#faf6f3',
        text: '#2a2220',
        textSecondary: '#554946',
        textMuted: '#857570',
        border: '#e2d8d2',
        accent: '#a0522d'
    },
    {
        id: 'coral',
        name: 'Coral',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21c-3-3-7-5-7-10a7 7 0 1 1 14 0c0 5-4 7-7 10z"/></svg>',
        bg: '#fefaf6',
        text: '#2d2d2d',
        textSecondary: '#5c5c5c',
        textMuted: '#8a8a8a',
        border: '#e8e0d5',
        accent: '#e07a5f'
    },
    {
        id: 'dusk',
        name: 'Dusk',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
        bg: '#f9f6f5',
        text: '#282428',
        textSecondary: '#544f54',
        textMuted: '#847d84',
        border: '#e0d8d8',
        accent: '#b56576'
    },
    {
        id: 'mocha',
        name: 'Mocha',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8zM6 2v4M10 2v4M14 2v4"/></svg>',
        bg: '#faf7f4',
        text: '#352a24',
        textSecondary: '#5e4d42',
        textMuted: '#8a7768',
        border: '#e3d9cf',
        accent: '#6f4e37'
    },
    {
        id: 'terracotta',
        name: 'Terracotta',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 17v4M7 4h10l-1 8H8L7 4zM6 12c-1 0-2 1-2 3s2 2 2 2h12s2 0 2-2-1-3-2-3"/></svg>',
        bg: '#faf7f4',
        text: '#2e2522',
        textSecondary: '#5c4f48',
        textMuted: '#8a7b72',
        border: '#e5dbd4',
        accent: '#c4654a'
    },
    {
        id: 'stone',
        name: 'Stone',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
        bg: '#f5f4f2',
        text: '#2d2d2a',
        textSecondary: '#58574f',
        textMuted: '#85847a',
        border: '#d9d7d2',
        accent: '#78756d'
    }
];

let currentPaletteIndex = 0;

function applyPalette(index) {
    const palette = palettes[index];
    const root = document.documentElement;

    root.style.setProperty('--color-bg', palette.bg);
    root.style.setProperty('--color-text', palette.text);
    root.style.setProperty('--color-text-secondary', palette.textSecondary);
    root.style.setProperty('--color-text-muted', palette.textMuted);
    root.style.setProperty('--color-border', palette.border);
    root.style.setProperty('--color-accent', palette.accent);

    // Update button to show current palette icon
    const btn = document.querySelector('.palette-toggle');
    if (btn) {
        btn.innerHTML = palette.icon;
        btn.title = palette.name;
    }

    // Save preference
    localStorage.setItem('palette', palette.id);
    currentPaletteIndex = index;
}

function togglePalette() {
    const nextIndex = (currentPaletteIndex + 1) % palettes.length;
    applyPalette(nextIndex);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize hacker mode
    initMode();
    initCollapsibles();

    // Load saved palette preference
    const savedPalette = localStorage.getItem('palette');
    const savedIndex = palettes.findIndex(p => p.id === savedPalette);
    if (savedIndex !== -1) {
        applyPalette(savedIndex);
    } else {
        applyPalette(0);
    }

    // Smooth scrolling for nav links (both sidebar and hacker nav)
    const navLinks = document.querySelectorAll('.nav a[href^="#"], .hacker-nav a[href^="#"]');
    const main = document.querySelector('.main');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target && main) {
                    const targetPosition = target.offsetTop - 48;
                    main.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Active nav state on scroll
    if (main) {
        const sections = document.querySelectorAll('.section[id]');

        main.addEventListener('scroll', () => {
            if (document.body.classList.contains('hacker-mode')) return;

            let currentSection = '';
            const scrollPos = main.scrollTop + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    currentSection = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        });
    }
});
