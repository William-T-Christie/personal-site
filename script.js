/* ============================================
   William T. Christie - Personal Website
   script.js - view switching and Hacker View

   Boomer View (Swiss Minimal + Rolodex) is in index.html,
   boomer.css and rolodex.js. This file switches between
   the two views and runs Hacker View.
   ============================================ */

// ============================================
// SAFE STORAGE
// localStorage can throw (private windows, blocked
// site data), so every read and write goes through here.
// ============================================

const store = {
    get(key) {
        try { return window.localStorage.getItem(key); } catch (e) { return null; }
    },
    set(key, value) {
        try { window.localStorage.setItem(key, value); } catch (e) { /* not saved, that's fine */ }
    }
};

// ============================================
// HACKER MODE - Project Content
// ============================================

const projectContent = {
    boomer: [
        {
            title: 'Daily Affirmations with Billy Joel',
            description: 'Daily motivational quotes powered by Billy Joel lyrics',
            tech: 'JavaScript · SVG · Apple Music previews'
        },
        {
            title: 'Buzzword Bingo',
            description: 'AI-powered meeting analyzer that detects corporate jargon',
            tech: 'JavaScript · Whisper AI · WebGPU'
        },
        {
            title: 'LinkSmith',
            description: 'Chrome extension for capturing, formatting, and organizing links',
            tech: 'Chrome Extension · Manifest V3'
        },
        {
            title: 'This Website',
            description: 'Personal portfolio with dual-mode design and multiple themes',
            tech: 'HTML · CSS · Indecision'
        },
        {
            title: 'Miami Food Roulette',
            description: 'Restaurant discovery tool using Google Places API (revamping)',
            tech: 'React · Google Places API'
        },
        {
            title: 'Doom Scroller Anonymous',
            description: 'Screen time analyzer with OCR and text-to-speech (revamping)',
            tech: 'JavaScript · Tesseract.js · Web Speech API'
        },
        {
            title: 'Super Secret Pending Project',
            description: 'Coming soon',
            tech: '??? · ??? · ???'
        }
    ],
    hacker: [
        {
            title: 'Daily Affirmations with Billy Joel',
            description: "the Piano Man tells you you're an innocent man",
            tech: 'JavaScript · SVG · Apple Music previews'
        },
        {
            title: 'Buzzword Bingo',
            description: 'AI that scores your meetings for corporate speak',
            tech: 'JavaScript · Whisper AI · WebGPU'
        },
        {
            title: 'LinkSmith',
            description: 'keeps links and citations organized, so future-you doesn\'t panic',
            tech: 'Chrome Extension · Manifest V3'
        },
        {
            title: 'This Website',
            description: "you're looking at it",
            tech: 'HTML · CSS · Indecision'
        },
        {
            title: 'Miami Food Roulette',
            description: 'spin a wheel, get a restaurant (revamping)',
            tech: 'React · Google Places API'
        },
        {
            title: 'Doom Scroller Anonymous',
            description: 'the Villain judges your screen time (revamping)',
            tech: 'JavaScript · Tesseract.js · Web Speech API'
        },
        {
            title: 'Super Secret Pending Project',
            description: 'I bet you wish you knew what this was',
            tech: '??? · ??? · ???'
        }
    ]
};

// ============================================
// MODE TOGGLE
// ============================================

let isHackerMode = false;
let isTransitioning = false;

function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function toggleMode() {
    if (isTransitioning) return;
    const targetMode = isHackerMode ? 'boomer' : 'hacker';
    handleViewToggle(targetMode);
}

// ============================================
// CRT TRANSITION SOUND
// A synthesized channel change that rolls in under the static like a wave:
// soft TV hiss that swells, crests as the new view appears, then washes out,
// with a gentle pitch warp and a low swell underneath.
// Built with Web Audio, so there are no sound files to load.
// ============================================

let crtAudioContext = null;
let crtNoiseBuffer = null;

// Runs inside the click or tap, which is when browsers allow sound to start
function unlockCrtAudio() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        if (!crtAudioContext) crtAudioContext = new AudioCtx();
        if (crtAudioContext.state === 'suspended') crtAudioContext.resume();
        return crtAudioContext;
    } catch (e) {
        return null;
    }
}

// Pink noise: softer and rounder than white noise, closer to surf than to buzz
function getCrtNoiseBuffer(ac) {
    if (crtNoiseBuffer && crtNoiseBuffer.sampleRate === ac.sampleRate) return crtNoiseBuffer;
    const length = Math.floor(ac.sampleRate * 2.6);
    const buffer = ac.createBuffer(1, length, ac.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
    }
    crtNoiseBuffer = buffer;
    return buffer;
}

// A smooth curve sampled from fn(u), u running 0 to 1, for setValueCurveAtTime
function crtCurve(fn, points = 256) {
    const curve = new Float32Array(points);
    for (let i = 0; i < points; i++) curve[i] = fn(i / (points - 1));
    return curve;
}

// The wave shape: eases up to a crest, then recedes with a small second swell
function crtWave(u, crest) {
    if (u <= crest) {
        const s = Math.sin((Math.PI / 2) * (u / crest));
        return s * s;
    }
    const r = (u - crest) / (1 - crest);
    return Math.pow(1 - r, 2.2) * (0.82 + 0.18 * Math.cos(Math.PI * 3 * r));
}

// Plays the sound on an AudioContext (or an OfflineAudioContext, for testing).
// The visual static runs 0.95s and swaps views at 0.45s. The sound crests
// right at the swap, then keeps washing out for about a second afterwards.
function playCrtWarp(ac, delay = 0) {
    if (!ac) return false;
    try {
        const SWAP = 0.45;                         // when the new view appears
        const LENGTH = 2.1;                        // total length of the sound
        const CREST = SWAP / LENGTH;
        const t0 = ac.currentTime + delay + 0.01;
        const wave = (u) => crtWave(u, CREST);

        const master = ac.createGain();
        master.gain.value = 0.6;
        const limiter = ac.createDynamicsCompressor();
        limiter.threshold.value = -16;
        limiter.knee.value = 20;
        limiter.ratio.value = 4;
        master.connect(limiter);
        limiter.connect(ac.destination);

        // The wave rolls across the speakers, left to right
        let out = master;
        if (ac.createStereoPanner) {
            const pan = ac.createStereoPanner();
            pan.pan.setValueCurveAtTime(crtCurve((u) => -0.5 + Math.sin(u * Math.PI / 2)), t0, LENGTH);
            pan.connect(master);
            out = pan;
        }

        // 1. Surf: soft hiss through a low-pass that opens at the crest and closes as it recedes
        const noise = ac.createBufferSource();
        noise.buffer = getCrtNoiseBuffer(ac);
        const surfTone = ac.createBiquadFilter();
        surfTone.type = 'lowpass';
        surfTone.Q.value = 0.5;
        surfTone.frequency.setValueCurveAtTime(crtCurve((u) => 350 + 3800 * wave(u)), t0, LENGTH);
        const rumbleCut = ac.createBiquadFilter();
        rumbleCut.type = 'highpass';
        rumbleCut.frequency.value = 90;
        const surf = ac.createGain();
        surf.gain.setValueCurveAtTime(crtCurve((u) => 0.9 * wave(u)), t0, LENGTH);
        noise.connect(rumbleCut);
        rumbleCut.connect(surfTone);
        surfTone.connect(surf);
        surf.connect(out);

        // 2. Warp: two soft triangle tones that bend down into the crest and float back up
        const warpTone = ac.createBiquadFilter();
        warpTone.type = 'lowpass';
        warpTone.frequency.value = 900;
        const warp = ac.createGain();
        warp.gain.setValueCurveAtTime(crtCurve((u) => 0.09 * wave(u)), t0, LENGTH);
        warpTone.connect(warp);
        warp.connect(out);
        const drift = ac.createOscillator();
        drift.frequency.value = 3.5;
        const driftDepth = ac.createGain();
        driftDepth.gain.value = 6;
        drift.connect(driftDepth);
        const tones = [0, 9].map((cents) => {
            const tone = ac.createOscillator();
            tone.type = 'triangle';
            tone.detune.value = cents;
            tone.frequency.setValueCurveAtTime(crtCurve((u) => {
                if (u <= CREST) return 330 - 200 * Math.sin((Math.PI / 2) * (u / CREST));
                return 130 + 90 * Math.sin((Math.PI / 2) * ((u - CREST) / (1 - CREST)));
            }), t0, LENGTH);
            driftDepth.connect(tone.frequency);
            tone.connect(warpTone);
            return tone;
        });

        // 3. Undertow: a low sine swell that rises into the crest, in place of a hard thump
        const undertow = ac.createOscillator();
        undertow.type = 'sine';
        undertow.frequency.setValueCurveAtTime(crtCurve((u) => 62 - 22 * u), t0, LENGTH);
        const undertowGain = ac.createGain();
        undertowGain.gain.setValueCurveAtTime(crtCurve((u) => 0.35 * wave(u)), t0, LENGTH);
        undertow.connect(undertowGain);
        undertowGain.connect(master);

        const stopAt = t0 + LENGTH + 0.05;
        [noise, drift, undertow, ...tones].forEach((node) => {
            node.start(t0);
            node.stop(stopAt);
        });
        noise.onended = () => {
            try { master.disconnect(); limiter.disconnect(); } catch (e) { /* already gone */ }
        };
        return true;
    } catch (e) {
        return false;
    }
}

function handleViewToggle(mode) {
    // Prevent multiple transitions
    if (isTransitioning) return;

    // Don't transition if already in the target mode
    if ((mode === 'hacker' && isHackerMode) || (mode === 'boomer' && !isHackerMode)) {
        updateViewCheckboxes();
        return;
    }

    isTransitioning = true;

    // Reduced motion: switch straight away, no static
    if (prefersReducedMotion()) {
        isHackerMode = mode === 'hacker';
        completeTransition(mode);
        return;
    }

    // Unlock sound now, while we are still inside the click
    unlockCrtAudio();

    // Hacker View header checkboxes animate their checkmark before the static starts
    const currentCheckmark = isHackerMode
        ? document.querySelector('#hacker-checkbox')?.parentElement?.querySelector('.checkmark')
        : null;

    // Step 1: Animate checkmark out
    if (currentCheckmark) {
        currentCheckmark.classList.add('animating-out');
    }

    // Step 2: After checkmark flies out, update checkbox states
    setTimeout(() => {
        isHackerMode = mode === 'hacker';
        updateViewCheckboxes();

        if (currentCheckmark) {
            currentCheckmark.classList.remove('animating-out');
        }

        // Step 3: Start static dissolve transition effect
        startStaticDissolve(mode);
    }, currentCheckmark ? 400 : 0);
}

function startStaticDissolve(targetMode) {
    // Both views fade, whichever one is showing
    const layers = Array.from(document.querySelectorAll('.layout, .swiss'));
    if (!layers.length) {
        completeTransition(targetMode);
        return;
    }
    const setOpacity = (value) => layers.forEach((layer) => { layer.style.opacity = value; });

    // The channel change sound, in step with the static
    playCrtWarp(crtAudioContext);

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
            setOpacity(1 - intensity);
        } else if (elapsed < dissolveIn + holdTime) {
            // Hold at full static - switch mode here
            intensity = maxIntensity;
            setOpacity(0);
        } else if (elapsed < totalTime) {
            // Dissolving out - decreasing intensity
            const outProgress = (elapsed - dissolveIn - holdTime) / dissolveOut;
            intensity = maxIntensity * (1 - outProgress);
            setOpacity(1 - intensity);
        } else {
            // Done
            cancelAnimationFrame(animationId);
            staticOverlay.remove();
            layers.forEach((layer) => { layer.style.opacity = ''; });
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
        applyMode(targetMode);
    }, dissolveIn + (holdTime / 2));
}

function applyMode(targetMode) {
    if (targetMode === 'hacker') {
        document.body.classList.add('hacker-mode');
        document.documentElement.classList.add('hacker-mode-html');
        store.set('siteMode', 'hacker');
        randomizeHackerHeader();
    } else {
        document.body.classList.remove('hacker-mode');
        document.documentElement.classList.remove('hacker-mode-html');
        store.set('siteMode', 'boomer');
    }

    // Keep ?view= in the address in step with the view, if it was used
    try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('view')) {
            url.searchParams.set('view', targetMode);
            window.history.replaceState(null, '', url.toString());
        }
    } catch (e) { /* older browsers: leave the address alone */ }

    updateProjectContent();
    updateViewCheckboxes();

    window.scrollTo(0, 0);
    document.querySelector('.main')?.scrollTo(0, 0);
}

function completeTransition(targetMode) {
    applyMode(targetMode);
    isTransitioning = false;
}

function updateViewCheckboxes() {
    // Hacker View header checkboxes
    const hackerCheckbox = document.getElementById('hacker-checkbox');
    const boomerCheckbox = document.getElementById('boomer-checkbox');

    if (hackerCheckbox) hackerCheckbox.checked = isHackerMode;
    if (boomerCheckbox) boomerCheckbox.checked = !isHackerMode;
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

function initMode() {
    // The inline script in <head> already picked the view (URL, then saved choice, then Boomer)
    let mode = window.__siteMode;
    if (mode !== 'hacker' && mode !== 'boomer') {
        const viewParam = new URLSearchParams(window.location.search).get('view');
        mode = (viewParam === 'hacker' || viewParam === 'boomer') ? viewParam : (store.get('siteMode') || 'boomer');
    }

    isHackerMode = mode === 'hacker';
    document.body.classList.toggle('hacker-mode', isHackerMode);
    document.documentElement.classList.toggle('hacker-mode-html', isHackerMode);

    updateProjectContent();
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
    // Get last used indices from storage
    const lastColorIndex = parseInt(store.get('lastColorIndex') ?? -1, 10);
    const lastIconIndex = parseInt(store.get('lastIconIndex') ?? -1, 10);

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
    store.set('lastColorIndex', colorIndex);
    store.set('lastIconIndex', iconIndex);

    document.documentElement.style.setProperty('--hacker-header-color', hackerColors[colorIndex]);

    const iconContainer = document.querySelector('.hacker-icon');
    if (iconContainer) {
        iconContainer.innerHTML = hackerIcons[iconIndex];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initMode();
});
