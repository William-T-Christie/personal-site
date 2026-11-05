# William T. Christie - Personal Website

A portfolio website with two views (Boomer and Hacker), a spinning 3D Rolodex for work history, and interactive sub-projects.

**Live:** https://william-t-christie.github.io/personal-site/

---

## Structure

```
personal-site/
├── index.html              # Main page (both views)
├── boomer.css              # Boomer View styles (Swiss Minimal)
├── rolodex.js              # The spinning Rolodex in Boomer View
├── styles.css              # Hacker View styles and shared base
├── script.js               # View switching, CRT transition, Hacker View
├── headshot-2026.jpg       # Profile photo
├── WilliamChristie-CV.docx
│
├── buzzword-bingo/         # AI meeting analyzer
├── daily-affirmations-billy-joel/  # Billy Joel lyrics app
├── doom-scroller-anonymous/        # Screen time roaster
├── miami-food-roulette/    # Restaurant slot machine
└── LinkSmith/              # Chrome extension
```

---

## Features

### Two Views
- **Boomer View** (default): Swiss Minimal layout. Big type, a one-line intro, the CV at a glance, projects, education and contact.
- **Hacker View**: Bold minimalist header with a projects-only view (walzr.com inspired).
- Static dissolve CRT transition between views.
- Switch with Boomer / Hacker in the Boomer header, or the checkboxes in the Hacker header.

### The Rolodex
Work history lives on a 3D Rolodex built from plain HTML and CSS 3D transforms (no libraries).
- 72 cards on a drum: six job cards with red year tabs, the rest blue A to Z dividers
- Mouse: scroll on it to flip one job per notch, or drag the cards and let go to spin
- Touch: swipe sideways to spin (vertical swipes still scroll the page)
- Keyboard: arrow keys, Home and End when it has focus
- Knobs, a job list, and Give it a spin; a soft paper click as each card passes (can be muted)
- A page scroll that runs into the Rolodex keeps scrolling the page instead of getting stuck
- Respects reduced motion settings
- Job content lives in the `JOBS` list at the top of `rolodex.js`

### URL and Preferences
- `?view=hacker` or `?view=boomer` URL parameter
- The chosen view is remembered via localStorage (the site still works if storage is blocked)

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

No build tools required, just vanilla HTML, CSS, and JavaScript.

1. Clone the repo
2. Open `index.html` in a browser, or run a local server:
   ```bash
   python3 -m http.server 8080
   ```
3. Visit `http://localhost:8080`

---

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- Google Fonts (Geist, Geist Mono, Courier Prime, DM Sans)
- CSS 3D transforms for the Rolodex, Web Audio for its click
- Canvas API for CRT static effect
- LocalStorage for preferences

---

## License

MIT
