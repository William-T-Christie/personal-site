# Doom Scroller Anonymous

Upload your screen time screenshot. Get roasted by MF DOOM. ALL CAPS when you spell the man name.

---

## Features

- **OCR extraction** — Reads screen time data from iOS screenshots using Tesseract.js
- **AI roast generation** — Generates villain-themed roasts based on your usage
- **DOOM voice synthesis** — Text-to-speech with villain character
- **Video export** — Save your roast as a shareable video
- **MF DOOM mask animation** — Canvas-rendered animated mask
- **Multi-screen flow** — Landing → Upload → Results

---

## Structure

```
doom-scroller-anonymous/
├── index.html              # Main app
├── css/
│   ├── styles.css          # Villain theme styling
│   └── animations.css      # CRT effects, particles
├── js/
│   ├── app.js              # Main controller (21KB)
│   ├── config.js           # App configuration
│   ├── ocr.js              # Tesseract.js integration
│   ├── parser.js           # Screen time data parsing
│   ├── roast-generator.js  # AI roast logic
│   ├── doom-voice.js       # Voice synthesis
│   ├── audio.js            # Web Audio API
│   ├── speech.js           # Web Speech API
│   ├── caption.js          # Caption rendering
│   ├── video-export.js     # Video export
│   ├── mask-renderer.js    # Canvas DOOM mask
│   ├── bouncing-bubbles.js # Particle effects
│   ├── ui.js               # Screen transitions
│   └── storage.js          # History storage
├── assets/                 # Images, audio
└── generate-doom-audio.py  # Pre-generate voice audio
```

---

## Tech

- Tesseract.js for OCR
- Web Speech API for voice synthesis
- Canvas API for mask animation
- Web Audio API for sound effects
- All processing runs client-side (privacy-first)

---

## License

MIT
