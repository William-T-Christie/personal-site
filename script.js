/* ============================================
   William T. Christie - Personal Website
   ============================================ */

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
    // Load saved palette preference
    const savedPalette = localStorage.getItem('palette');
    const savedIndex = palettes.findIndex(p => p.id === savedPalette);
    if (savedIndex !== -1) {
        applyPalette(savedIndex);
    } else {
        applyPalette(0);
    }

    // Smooth scrolling for nav links
    const navLinks = document.querySelectorAll('.nav a[href^="#"]');
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
});
