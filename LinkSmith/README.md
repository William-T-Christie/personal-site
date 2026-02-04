# LinkSmith

**Version 1.0.0** | A local-only Chrome extension for capturing and formatting links.

---

## Overview

LinkSmith makes copying and saving links fast and intentional. Click the extension icon to capture the current page, format it how you want, and save it to your personal library.

**Key Principles:**
- 100% local — no accounts, no cloud, no tracking
- Clean, Mac-native UI with light/dark mode support
- Fast keyboard shortcuts for power users

---

## Features

### Link Capture
- Auto-cleans page titles (removes trailing brand names)
- Editable title with persistent overrides
- Optional notes for context
- Favicon display

### 4 Output Formats
| Key | Format | Output | Best For |
|-----|--------|--------|----------|
| `1` | Markdown | `[Title](URL)` | Notion, Obsidian, GitHub |
| `2` | Title — URL | `Title — URL` | Emails, plain text |
| `3` | URL Only | `URL` | Quick sharing |
| `4` | Citation | `"Title." domain, accessed date. URL` | Research, papers |

### Library Management
- **Total History** — All saved links from everywhere, most recent first (keeps last 50)
- **Folders** — Create custom folders with emoji labels
- **Pinned** — Star your favorites for quick access
- **Search** — Filter by title, domain, URL, or note
- **Export** — Copy any view as formatted Markdown

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `1` `2` `3` `4` | Select format + Copy + Save |
| `/` | Focus search |
| `Enter` | Save (when in note field) |
| `Esc` | Close modal |

---

## Installation

1. Download or clone this repository
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Select the `LinkSmith` folder
6. Pin the extension to your toolbar for easy access

---

## File Structure

```
LinkSmith/
├── manifest.json      # Chrome extension config (Manifest V3)
├── background.js      # Service worker — initializes default state
├── popup.html         # Main UI structure
├── popup.css          # Styles (light/dark mode, animations)
├── popup.js           # Application logic
├── icons/             # Extension icons (16, 32, 48, 128px)
└── README.md          # This file
```

---

## Data Storage

All data is stored locally in `chrome.storage.local` under the key `linksmith_state_v1`:

```javascript
{
  format: 'md',                    // Selected format: md | pretty | url | cite
  captureDestination: 'total',     // Save target: 'total' or folder ID
  viewMode: 'total',               // Library view: total | folder | pinned
  selectedFolderId: null,          // Currently viewed folder
  searchQuery: '',                 // Current search filter
  totalHistory: [],                // Saved items (max 50)
  folders: {},                     // Folder objects by ID
  folderOrder: [],                 // Folder display order
  pinnedIds: [],                   // IDs of pinned items
  titleOverrides: {}               // Custom titles by URL
}
```

### Item Structure
```javascript
{
  id: 'abc123',
  url: 'https://example.com',
  domain: 'example.com',
  title: 'Page Title',
  note: 'Optional note',
  savedAt: 1706500000000,
  faviconUrl: 'https://...'
}
```

### Folder Structure
```javascript
{
  id: 'folder123',
  name: 'Research',
  emoji: '📚',
  createdAt: 1706500000000,
  updatedAt: 1706500000000,
  items: []
}
```

---

## Privacy

**LinkSmith is 100% local.**

- All data stored in your browser only
- No external servers or API calls
- No accounts or authentication
- No analytics or tracking
- Data persists until you clear browser storage or uninstall

---

## Development

This extension uses vanilla HTML, CSS, and JavaScript with no build tools or dependencies.

To modify:
1. Edit the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on LinkSmith
4. Reopen the popup to see changes

---

## License

MIT License — free for personal and commercial use.
