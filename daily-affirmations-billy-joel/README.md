# Daily Affirmations with Billy Joel

Start your day with wisdom from the Piano Man. Random Billy Joel lyrics served as daily affirmations through a vintage reel-to-reel tape player interface.

---

## Features

- **Reel-to-reel player UI** — Realistic TASCAM-inspired tape deck design
- **Song selector** — Choose affirmations from specific albums/songs
- **Archive page** — Browse past affirmations
- **Favorites** — Save your favorite quotes
- **Sharing** — Share affirmations on social media
- **Spotify integration** — Link to songs on Spotify

---

## Structure

```
daily-affirmations-billy-joel/
├── index.html          # Main player page
├── archive.html        # Past affirmations archive
├── css/
│   ├── styles.css      # Main styles (tape deck design)
│   └── archive.css     # Archive page styles
├── js/
│   ├── app.js          # Main controller
│   ├── affirmations.js # Lyrics database (~28KB)
│   ├── player.js       # Reel-to-reel controls
│   ├── archive.js      # Archive functionality
│   ├── favorites.js    # Favorites management
│   ├── share.js        # Social sharing
│   └── spotify.js      # Spotify API integration
└── assets/             # Album art, sounds
```

---

## Tech

- Vanilla JavaScript (no frameworks)
- CSS animations for tape reels
- LocalStorage for favorites/history
- Spotify Web API

---

## License

MIT
