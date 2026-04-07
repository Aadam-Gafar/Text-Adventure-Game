# Text Adventure Game

A browser-based interactive fiction framework built on [Ink](https://www.inklestudios.com/ink/) and [inkjs](https://github.com/y-lohse/inkjs). The current story - exploring a Dwemer facility in Skyrim - is a demo to prove out the engine.

## What's here

- **story.ink** - the narrative, written in Ink's scripting language
- **app.js** - loads and drives the Ink story in the browser
- **style.css** - manuscript-style UI with light/dark modes
- **assets/** - audio tracks and UI icons

## Features

- Branching narrative with persistent save state
- Checkpoint / rewind system
- Background music tied to story beats
- Adjustable font size, OpenDyslexic toggle, light/dark theme

## Running it

Serve the project root over HTTP (e.g. `python -m http.server 8000`) and open `index.html`. Direct file access won't work due to browser fetch restrictions.

## Extending it

To swap in a new story, edit `story.ink` with [Ink](https://github.com/inkle/ink/releases) and export it to `story.json`.

## Roadmap

- **Android release** - wrap with [Capacitor](https://capacitorjs.com/) (or similar) to ship as a native APK
- Sound effects alongside background music
- Coloured dialogue per actor
- Actor portraits
- Animated text (e.g. shake effects for screams)
- Inventory system with inventory checks
- Stat system with stat checks (dice roll)
- Expanded story with more branching paths and endings
- More to come