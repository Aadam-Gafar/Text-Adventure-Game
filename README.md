# The Dwemer Facility

An interactive fiction game built with Ink, designed for web-native deployment.

## Quick Start

### 1. Add Your Ink Story

Export your Ink story as JSON:
- In Inky: **File → Export for web...**
- Save as `story.json` in this directory

### 2. Run Locally

You need a local web server to run this (browsers block `fetch()` on `file://` URLs).

**Option A: Python**
```bash
python -m http.server 8000
```
Then visit: `http://localhost:8000`

**Option B: Node.js**
```bash
npx http-server
```

**Option C: VS Code**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

### 3. Deploy to GitHub Pages

1. Create a GitHub repository
2. Push these files to the repo
3. Go to **Settings → Pages**
4. Source: Deploy from `main` branch
5. Your game will be live at: `https://yourusername.github.io/repo-name`

## File Structure

```
dwemer-facility/
├── index.html          # Main HTML structure
├── style.css           # Styling and theme
├── app.js             # Game logic and Ink integration
├── story.json         # Your compiled Ink story (add this)
└── README.md          # This file
```

## Features

- ✅ Full Ink integration with inkjs
- ✅ Auto-save/load functionality (localStorage)
- ✅ Mobile-optimized responsive design
- ✅ Dark theme with smooth scrolling
- ✅ Keyboard shortcuts (Esc for menu, 1-9 for choices)
- ✅ Accessibility features (ARIA labels, focus management)
- ✅ Clean, minimal design

## Keyboard Shortcuts

- `Esc` - Toggle menu
- `1-9` - Select choice by number

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Customization

### Colors
Edit CSS variables in `style.css`:
```css
:root {
    --bg-primary: #1a1a1a;
    --accent-gold: #ffd700;
    /* etc. */
}
```

### Fonts
Change the `font-family` in `style.css`

### Game Title
Edit `<title>` in `index.html` and `<h1>` text

## Known Limitations

- Requires `story.json` to be present
- Uses CDN for inkjs (requires internet on first load)
- localStorage limit (~5-10MB depending on browser)

## Next Steps

- Add inventory system using Ink tags
- Implement stats screen
- Add sound effects and music
- Create desktop builds with Electron
- Package mobile apps with Capacitor

## License

Your choice - add LICENSE file as needed.
