# William T. Christie - Personal Website

A portfolio website with dual-mode design (Boomer/Hacker views), multiple color palettes, and interactive sub-projects.

---

## Live Site

Hosted on Vercel.

---

## Structure

```
personal-site/
├── index.html              # Main portfolio page
├── styles.css              # Main styles (7 color palettes, dual-mode)
├── script.js               # Mode toggle, transitions, palettes
├── headshot.jpg            # Profile photo
├── William_Christie_Resume.docx
│
├── buzzword-bingo/         # AI meeting analyzer
├── daily-affirmations-billy-joel/  # Billy Joel lyrics app
├── doom-scroller-anonymous/        # Screen time roaster
├── miami-food-roulette/    # Restaurant slot machine
├── LinkSmith/              # Chrome extension
│
└── _dev/                   # Development/preview files
    ├── color-palettes-preview.html
    ├── font-preview.html
    └── welcome-box-comparison.html
```

---

## Features

### Dual-Mode Design
- **Boomer Mode**: Traditional sidebar layout with full resume sections
- **Hacker Mode**: Bold minimalist header with projects-only view (walzr.com inspired)
- Static dissolve CRT transition effect between modes
- Checkbox toggle with animated checkmarks

### 7 Color Palettes
Sand, Sienna, Coral, Dusk, Mocha, Terracotta, Stone — all accessible via palette toggle button.

### Keyboard/URL Shortcuts
- `?view=hacker` or `?view=boomer` URL parameter
- Preferences persist via localStorage

---

## Sub-Projects

| Project | Description | Tech |
|---------|-------------|------|
| **Buzzword Bingo** | AI that scores meetings for corporate speak | Whisper AI, FFmpeg.wasm |
| **Daily Affirmations** | Billy Joel lyrics as daily wisdom | Vanilla JS, CSS animations |
| **Doom Scroller Anonymous** | MF DOOM roasts your screen time | Tesseract.js, Web Speech API |
| **Miami Food Roulette** | Slot machine for Miami restaurants | Google Places API |
| **LinkSmith** | Chrome extension for link formatting | Manifest V3 |

---

## Development

No build tools required — vanilla HTML, CSS, JavaScript.

1. Clone the repo
2. Open `index.html` in a browser, or run a local server:
   ```bash
   python3 -m http.server 8080
   ```
3. Visit `http://localhost:8080`

---

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- Google Fonts (DM Sans, JetBrains Mono, Caveat)
- CSS custom properties for theming
- Canvas API for CRT static effect
- LocalStorage for preferences

---

## License

MIT
