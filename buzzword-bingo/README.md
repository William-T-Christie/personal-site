# Buzzword Bingo (version 2)

Score meetings, resumes and messages for corporate jargon. Everything runs in the browser and nothing is uploaded.

Four games share one results screen. The home screen is a hand of four printed cards, one per game.

| Game | What happens |
| --- | --- |
| **Meeting** | Upload a recording. Whisper transcribes it on your device, and you watch the transcript and score fill in as it goes. |
| **Live** | Leave it listening during a call. A random bingo card daubs itself as people say the words, and BINGO goes off when you get a line. |
| **Resume** | Paste or upload a resume (.txt, .md, .docx, .pdf). If it fails the audit, HR hands you a pink slip and detention: type the line you were given a few times, with no pasting, before you can see what your resume actually says. |
| **Text** | Paste an email, a Slack message or a LinkedIn post. |

The results screen shows:
- **Score:** arcade points, the Corporate Speak Index from 0 to 100, a rank, and a verdict stamp.
- **Bingo card:** daubed with the buzzwords that were found.
- **Breakdown:** every buzzword with its points.
- **Transcript:** highlighted, with a hover translation for each buzzword, a Plain English rewrite, and a copy button.
- **Score summary:** a line you can copy and share.
- **Hall of Shame:** a local high score table.

## Run it

It uses ES modules and a Web Worker, so serve the folder over http. Opening the file directly won't work.

```sh
cd buzzword-bingo
python3 -m http.server 8000
# open http://localhost:8000
```

The microphone needs `localhost` or `https`. GitHub Pages is https.

Hash links go straight to a game: `#meeting`, `#live`, `#resume`, `#text`, `#scores`. For example, the project list can link to `buzzword-bingo/index.html#resume`.

## On the site

This folder is served at `personal-site/buzzword-bingo/`, and the project list on the main page links to it. High scores from version 1 move over automatically the first time the page loads.

## Files

| File | What it is |
| --- | --- |
| `index.html` | All screens |
| `css/styles.css` | The Bingo Hall look: green felt, printed cards, ink daubers |
| `js/main.js` | App flow: routing, the four games, results, detention, Hall of Shame, sounds |
| `js/engine.js` | Scoring with no DOM: matching, points, index, ranks, bingo cards, Plain English |
| `js/dictionary.js` | The jargon list: label, pattern, plain English meaning, tier |
| `js/audio.js` | File decoding, splitting into 30 second windows, microphone capture, the worker client, and reading resume files |
| `js/whisper.worker.js` | Runs Whisper (Transformers.js 3.8.1) off the main thread |
| `js/samples.js` | Demo meeting, sample resumes and sample texts |

## How scoring works

- **Points:** tier 1 words are worth 1 point, tier 2 phrases 2, tier 3 3, and tier 4 5. This is the arcade score and the Hall of Shame sorts by it.
- **Corporate Speak Index:** weighted points per 100 words, times 4, capped at 100. Because it accounts for length, a long meeting doesn't automatically rank badly. The rank comes from the index:
  - 0: Refreshingly Human
  - 10: Corporate Curious
  - 25: Middle Manager Material
  - 45: Synergy Specialist
  - 65: Chief Buzzword Officer
  - 85: Legendary Jargon Junkie
- **Resume fail:** any bingo line, or an index of 45 or more.
- **Matching:** case insensitive, on word boundaries. Hyphen and space variants both count, and when two matches overlap, the longer phrase wins. Plain words like solution, scale, pipeline, milestone and "same page" on its own are left out on purpose.

To add a buzzword, add a row to the right tier in `js/dictionary.js`: `['Card label', 'regex', 'plain English', 'm']`. The `m` flag puts it in the pool for live cards, and `r` marks it as resume flavored.

## Speech model

- **Quick:** `Xenova/whisper-tiny.en`, 8 bit, on WebAssembly. About 43MB.
- **More accurate:** `Xenova/whisper-base.en`. With WebGPU it uses a full precision encoder and a 4 bit decoder, about 210MB. Without WebGPU it uses the 8 bit model on WebAssembly, about 80MB. If the graphics chip drops out mid meeting, it switches to WebAssembly and carries on.
- **Caching:** models load from Hugging Face the first time and the browser keeps them after that.
- **Speed, measured on a Mac:** about 1.5 seconds per 30 seconds of audio for Quick, and about 1 second (WebGPU) or 3 seconds (WebAssembly) for More accurate. An hour long meeting takes a few minutes.
- **Don't** use the 8 bit decoder on WebGPU. It loads fine and then transcribes gibberish.
- **Decoding:** files are decoded by the browser itself (MP3, M4A, WAV, WebM, MP4 and MOV in Chrome and Safari), so there is no 30MB FFmpeg download. Audio is processed in 30 second windows cut at quiet moments, which gives real progress and lets the transcript stream in.
- **Live mode:** listens in chunks of about 5 seconds, each cut at a pause, and skips silence. That cuts down Whisper's habit of hearing "Thank you." in silence.

## What changed from version 1

- **Design:** a bingo hall instead of an arcade. The games sit on a green felt table and each one is a printed card in its own color (yellow, pink, blue and mint). Buzzwords get daubed with ink and a bingo line gets a red marker stroke. Bungee is used for the signs and Hanken Grotesk for everything you read. Results come before the initials entry.
- **New games:** Live, Resume and Text are new.
- **Speed:** transcription moved to a Web Worker, so the page no longer freezes, and WebGPU actually works now. In version 1 the WebGPU setting was a Transformers.js v3 option passed to v2, so it never ran.
- **Progress:** the progress bar is real.
- **Smaller download:** no FFmpeg.
- **Fairer scoring:** fewer false positives, a duplicate removed, and an index that accounts for length.
- **Bug fix:** the privacy toggle in version 1 opened and closed on the same click.

## Tested

- **Real Whisper, in a real browser on a Mac:** both models downloaded from Hugging Face and transcribed speech correctly through the actual worker, on WebAssembly and on WebGPU, including switching between models and two jobs sent at once.
- **File formats:** WAV, FLAC, WebM (Opus) and MP4 or M4A (AAC) all decoded and transcribed.
- **Live capture:** speech played into a 48 kHz audio stream went through the same capture and resampling code as the microphone and came out word perfect.
- **The whole app:** every screen was clicked through in Chromium at desktop and phone widths, with the meeting and live games run end to end against a stand-in model, including pausing and resuming a live game.
- **Not tested:** a real microphone in a real call, and Safari.
