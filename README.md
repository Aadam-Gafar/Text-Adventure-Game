# Text Adventure Game

A browser-based interactive fiction framework built on [Ink](https://www.inklestudios.com/ink/) and [inkjs](https://github.com/y-lohse/inkjs). The current story - exploring a Dwemer facility in Skyrim - is a demo to prove out the engine.

## What's here

- **story.ink** - the narrative, written in Ink's scripting language
- **app.js** - loads and drives the Ink story in the browser
- **style.css** - manuscript-style UI with light/dark modes
- **assets/** - audio tracks and UI icons

## Features

### Narrative
- Branching narrative with persistent save state (localStorage)
- Checkpoint / rewind system - story can tag checkpoints with `# CHECKPOINT`; the rewind button restores full state including music
- Keyboard shortcuts: press 1–9 to select choices

### Inventory
- Inventory panel driven entirely by Ink variables- any variable prefixed `inv_` is tracked automatically
- Gain/loss notifications appear inline as items are picked up or dropped
- Inventory-gated choices are visually marked so players know an item is required
- Items displayed alphabetically in a collapsible sidebar panel

### Music
- Background music tied to story beats via `# MUSIC: trackname` tags
- Smooth fade in/out on track transitions - no overlapping playback
- Music pauses when the tab loses focus and resumes on return
- Music automatically ducks to a low volume while TTS is speaking, then restores

### Text-to-Speech
- TTS toggle in the header- activates selection mode, showing a mic button on every past player choice
- Click any mic button to begin reading aloud from that point through the rest of the story
- Music ducks while speech plays and returns to normal volume when done
- TTS is cancelled automatically on restart or rewind

### UI
- Light/dark theme toggle, persisted across sessions
- OpenDyslexic font toggle, persisted across sessions
- Adjustable font size (zoom in/out), persisted across sessions- affects story text, choices, and inventory
- Scroll-to-bottom floating button with enter/exit animations
- Restart and rewind confirmation modals to prevent accidental progress loss
- Responsive mobile layout with collapsible header menu

## Ink story tags & conventions

The engine responds to the following tags and variable naming conventions in `story.ink`:

| Tag / Convention | Effect |
|---|---|
| `# MUSIC: trackname` | Fades in `assets/music/trackname.mp3`, fading out the current track first |
| `# CHECKPOINT` | Snapshots story state, history, and current music track for rewind |
| `VAR inv_<name> = false` | Declares an inventory item; setting it to `true`/`false` in the story adds/removes it from the player's inventory and shows a gain/loss notification |

## Running it

Serve the project root over HTTP (e.g. `python -m http.server 8000`) and open `http://localhost:8000/` in your browser (not `index.html` as that will cause the browser to try and dig into your hard drive, causing CORS errors).

## Extending it

To swap in a new story, edit `story.ink` with the [Ink editor](https://github.com/inkle/ink/releases) and export it to `story.json`. Use the tags above to add music and checkpoints.

## Roadmap

- **Android release** - wrap with [Capacitor](https://capacitorjs.com/) (or similar) to ship as a native APK
- Sound effects alongside background music
- Coloured dialogue per actor
- Actor portraits
- Animated text (e.g. shake effects for screams)
- Stat system with stat checks (dice roll)
- Expanded story with more branching paths and endings
- More to come

## Attributions

### Icons
- UI Icons provided by [Iconoir](https://iconoir.com/).

### Music
- `ruin_music.mp3`: [Horror Music Scary Piano Loop](https://pixabay.com/music/crime-scene-horror-music-scary-piano-loop-465628/) by Sonican via Pixabay.
- `dwemer_music.mp3`: [Synthetic Deception - Loopable Epic Cyberpunk Crime Music](https://pixabay.com/music/suspense-synthetic-deception-loopable-epic-cyberpunk-crime-music-157454/) by JoelFazhari via Pixabay.
- `skyrim_music.mp3`: [Slavic Epic Loop](https://pixabay.com/music/main-title-slavic-epic-loop-368859/) by Ebunny via Pixabay.