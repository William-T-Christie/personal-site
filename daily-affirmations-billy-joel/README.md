# Daily Affirmations with Billy Joel

Start your day with wisdom from the Piano Man. Random Billy Joel lyrics served as daily affirmations through a vintage reel-to-reel tape player interface.

---

## Features

- **A working reel-to-reel**: a late 70s hi-fi deck with a brushed aluminum face, walnut cheeks and amber VU meters, after the Akai GX-747, TASCAM BR-20 and Technics RS-1500
- **One tape, the whole discography**: every song sits at its own spot on the tape, in album order. Picking a song spools the tape there, forward or back
- **Real tape motion**: the packs move from one reel to the other, each reel turns at tape speed over its radius, the windows blur at speed, the tension arms flex and the pinch roller closes on Play
- **VU meters and counter**: needles with spring ballistics, and a rolling odometer counter with a reset button
- **The music**: each song plays its 30 second Apple Music preview from the original album, and the tape follows it. The VU meters read the real left and right levels
- **Typed tape box card**: each affirmation is typed onto an index card, with a link to the song on Apple Music
- **Song selector**: choose any of the 114 songs
- **Transport keys**: Back goes to the last affirmation, Next serves a new one, Shuffle picks one at random. Play latches down while the tape runs
- **Keyboard shortcuts**: Space for play or pause, N or → for next, ← for back
- **Reduced motion**: with reduced motion turned on, the tape jumps to the song and the card appears at once

---

## Structure

```
daily-affirmations-billy-joel/
├── index.html          # Main player page
├── css/
│   └── styles.css      # Main styles (tape deck design)
├── js/
│   ├── app.js          # Songs, history and the typed card
│   ├── affirmations.js # Lyrics database
│   ├── player.js       # The deck: SVG transport, tape physics, meters, counter
│   └── music.js        # Apple Music previews and the level meters
```

---

## Tech

- Vanilla JavaScript (no frameworks)
- SVG and requestAnimationFrame for the deck
- URL parameters for sharing specific songs (`?song=Piano Man`)
- Album covers in the background load from studiodiscography.com
- Previews come from the iTunes Search API (one lookup by track ID when the page opens). If a link opens with no tap first, the browser blocks sound until you press Play

---

## License

MIT
