# Miami Food Roulette

Can't decide where to eat? Spin the slot machine to discover amazing Miami restaurants.

---

## Features

- **3-reel slot machine** — Cuisine, Neighborhood, Price
- **Google Places API** — Real restaurant data
- **Reel locking** — Lock any reel to filter results
- **Favorites** — Save restaurants for later
- **Sound effects** — Spinning and selection sounds
- **Tropical theme** — Palm trees and wave patterns

---

## Structure

```
miami-food-roulette/
├── index.html          # Main app
├── css/
│   └── styles.css      # Tropical theme styling
├── js/
│   ├── app.js          # Main controller
│   ├── slot-machine.js # Reel spinning logic
│   ├── reel.js         # Individual reel behavior
│   ├── api.js          # Google Places API (17KB)
│   ├── config.js       # Cuisines, neighborhoods, prices
│   ├── storage.js      # Favorites (localStorage)
│   ├── ui.js           # UI components
│   └── audio.js        # Sound effects
└── assets/             # Images, sounds
```

---

## Tech

- Vanilla JavaScript
- Google Places API
- CSS animations for reel spinning
- LocalStorage for preferences/favorites

---

## Setup

Requires a Google Places API key. Add to `js/config.js`:

```javascript
const API_KEY = 'your-api-key-here';
```

---

## License

MIT
