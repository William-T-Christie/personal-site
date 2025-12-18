# Buzzword Bingo

A satirical web app that analyzes meeting recordings for corporate buzzwords and jargon. Upload a video or audio file, and watch as AI detects every "synergy," "circle back," and "at the end of the day."

**100% Privacy-Focused** - All processing happens in your browser. Your files never leave your device.

![Arcade Cabinet Screenshot](assets/screenshot.png)

## Features

- **Browser-Based AI Transcription** - Uses OpenAI's Whisper model running entirely in your browser via [Transformers.js](https://github.com/xenova/transformers.js)
- **Client-Side Audio Extraction** - Extracts audio from video files using [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)
- **Weighted Scoring System** - Different buzzwords earn different points based on how egregious they are
- **Retro Arcade Aesthetic** - Styled like an 80s arcade cabinet with CRT effects and animations
- **High Score Leaderboard** - Compete for the top spot (local storage)
- **Demo Mode** - Try it without uploading a file

## Scoring System

| Tier | Points | Examples |
|------|--------|----------|
| 1 | 1 pt | synergy, leverage, bandwidth, stakeholder, deliverable |
| 2 | 2 pts | circle back, loop in, touch base, low-hanging fruit |
| 3 | 3 pts | boil the ocean, paradigm shift, thought leader, disrupt |
| 4 | 5 pts | "at the end of the day", "new normal", "drink the Kool-Aid" |

## Award Titles

| Score | Title |
|-------|-------|
| 0-10 | Refreshingly Human |
| 11-25 | Corporate Curious |
| 26-50 | Middle Manager Material |
| 51-100 | Synergy Specialist |
| 101-200 | Chief Buzzword Officer |
| 201+ | Legendary Jargon Junkie |

## How It Works

1. **Upload** - Drag & drop or select a video/audio file (MP4, WebM, MOV, MP3, WAV)
2. **Process** - The app extracts audio and transcribes it using Whisper AI
3. **Analyze** - Buzzwords are detected and scored
4. **Results** - See your score, rank, and buzzword breakdown

## Privacy

- All video/audio processing happens **entirely in your browser**
- Files are **never uploaded** to any server
- No analytics, cookies, or tracking
- Only high scores (3-letter initials + score) are stored in localStorage
- Close the tab and your data is gone

## Tech Stack

- **Vanilla JavaScript** - No frameworks, just clean JS
- **Transformers.js** - Run Whisper AI model in the browser
- **FFmpeg.wasm** - Client-side audio extraction
- **CSS3** - Retro arcade styling with animations

## File Structure

```
buzzword-bingo/
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # Arcade cabinet styling
├── js/
│   ├── app.js          # Main application controller
│   ├── audio.js        # FFmpeg audio extraction
│   ├── transcribe.js   # Whisper transcription
│   ├── analyzer.js     # Buzzword detection & scoring
│   ├── buzzwords.js    # Buzzword database & tiers
│   ├── leaderboard.js  # High score management
│   └── ui.js           # Screen transitions & animations
├── assets/             # Images and sounds
└── data/               # Data files
```

## Browser Support

- Chrome 89+
- Firefox 90+
- Safari 16.4+
- Edge 89+

Requires WebAssembly support. First load downloads the Whisper model (~75MB), which is cached for future use.

## Running Locally

Just open `index.html` in a browser, or serve with any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

Then visit `http://localhost:8000`

## License

MIT License - Feel free to use, modify, and distribute.

## Acknowledgments

- [Transformers.js](https://github.com/xenova/transformers.js) by Xenova for browser-based ML
- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) for client-side video processing
- Inspired by corporate meetings everywhere
