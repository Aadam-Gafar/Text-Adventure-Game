// DOM elements
const storyContainer = document.getElementById('story-container');
const restartBtn = document.getElementById('restart-btn');
const rewindBtn = document.getElementById('rewind-btn');
const themeBtn = document.getElementById('theme-btn');
const dyslexicBtn  = document.getElementById('dyslexic-btn');
const zoomInBtn    = document.getElementById('zoom-in-btn');
const zoomOutBtn   = document.getElementById('zoom-out-btn');

// Storage key
const SAVE_KEY = 'dwemer_facility_save';
const THEME_KEY = 'dwemer_theme';
const FONT_KEY  = 'dwemer_font';
const SIZE_KEY  = 'dwemer_font_size';

// Theme
function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : '');
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
}

(function initTheme() {
    applyTheme(localStorage.getItem(THEME_KEY) === 'dark');
})();

themeBtn.addEventListener('click', () => {
    applyTheme(document.documentElement.getAttribute('data-theme') !== 'dark');
});

// Dyslexic font
function applyFont(dyslexic) {
    document.documentElement.setAttribute('data-font', dyslexic ? 'dyslexic' : '');
    localStorage.setItem(FONT_KEY, dyslexic ? 'dyslexic' : 'default');
}

(function initFont() {
    applyFont(localStorage.getItem(FONT_KEY) === 'dyslexic');
})();

dyslexicBtn.addEventListener('click', () => {
    applyFont(document.documentElement.getAttribute('data-font') !== 'dyslexic');
});

// Font size
const FONT_SIZE_MIN     = 0.8;
const FONT_SIZE_MAX     = 1.8;
const FONT_SIZE_STEP    = 0.1;
const FONT_SIZE_DEFAULT = 1.1;

function applyFontSize(size) {
    const s = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, size));
    const root = document.documentElement;
    root.style.setProperty('--font-size-story',  s + 'rem');
    root.style.setProperty('--font-size-choice', (s - 0.1) + 'rem');
    root.style.setProperty('--font-size-player', (s - 0.05) + 'rem');
    localStorage.setItem(SIZE_KEY, s);
    zoomOutBtn.disabled = s <= FONT_SIZE_MIN;
    zoomInBtn.disabled  = s >= FONT_SIZE_MAX;
    return s;
}

let currentFontSize = applyFontSize(parseFloat(localStorage.getItem(SIZE_KEY)) || FONT_SIZE_DEFAULT);

zoomInBtn.addEventListener('click',  () => { currentFontSize = applyFontSize(Math.round((currentFontSize + FONT_SIZE_STEP) * 10) / 10); });
zoomOutBtn.addEventListener('click', () => { currentFontSize = applyFontSize(Math.round((currentFontSize - FONT_SIZE_STEP) * 10) / 10); });

// Music (declared early so volume controls can reference them)
let currentAudio = null;
let currentTrack = null;

const MUSIC_VOLUME  = 0.5;
const FADE_DURATION = 1500; // ms
const FADE_INTERVAL = 50;   // ms between steps

// Volume
const VOLUME_KEY = 'dwemer_volume';
const volumeBtn  = document.getElementById('volume-btn');
const volumeIcon = document.getElementById('volume-icon');

const VOLUME_LEVELS = [
    { label: 'High',   value: 1.00, icon: 'sound-high' },
    { label: 'Low',    value: 0.66, icon: 'sound-low'  },
    { label: 'Min',    value: 0.33, icon: 'sound-min'  },
    { label: 'Off',    value: 0.00, icon: 'sound-off'  },
];

let volumeIndex = 0;

function applyVolume(index) {
    volumeIndex = index;
    const level = VOLUME_LEVELS[index];
    localStorage.setItem(VOLUME_KEY, index);
    volumeIcon.src = `assets/${level.icon}.svg`;
    volumeBtn.setAttribute('aria-label', `Volume: ${level.label}`);
    if (currentAudio) currentAudio.volume = level.value * MUSIC_VOLUME;
}

(function initVolume() {
    const saved = parseInt(localStorage.getItem(VOLUME_KEY), 10);
    applyVolume((saved >= 0 && saved < VOLUME_LEVELS.length) ? saved : 0);
})();

volumeBtn.addEventListener('click', () => {
    applyVolume((volumeIndex + 1) % VOLUME_LEVELS.length);
});

// State
let story;
let storyHistory = [];

// Checkpoint snapshot
let checkpointInkState = null;
let checkpointHistoryLength = 0;
let checkpointTrack = null;

function fadeOut(audio, onDone) {
    if (audio._fadeTimer) { clearInterval(audio._fadeTimer); audio._fadeTimer = null; }
    const step = (MUSIC_VOLUME / (FADE_DURATION / FADE_INTERVAL));
    audio._fadeTimer = setInterval(() => {
        if (audio.volume <= step) {
            audio.volume = 0;
            audio.pause();
            audio.currentTime = 0;
            clearInterval(audio._fadeTimer);
            audio._fadeTimer = null;
            if (onDone) onDone();
        } else {
            audio.volume -= step;
        }
    }, FADE_INTERVAL);
}

function fadeIn(audio) {
    if (audio._fadeTimer) { clearInterval(audio._fadeTimer); audio._fadeTimer = null; }
    const target = MUSIC_VOLUME * VOLUME_LEVELS[volumeIndex].value;
    audio.volume = 0;
    audio.play().catch(err => console.error('[playMusic] failed:', err));
    if (target === 0) return;
    const step = (MUSIC_VOLUME / (FADE_DURATION / FADE_INTERVAL));
    audio._fadeTimer = setInterval(() => {
        if (audio.volume + step >= target) {
            audio.volume = target;
            clearInterval(audio._fadeTimer);
            audio._fadeTimer = null;
        } else {
            audio.volume += step;
        }
    }, FADE_INTERVAL);
}

function playMusic(trackName) {
    if (currentTrack === trackName) return;
    // Stop the outgoing track immediately (cancels any in-progress fade)
    if (currentAudio) {
        const outgoing = currentAudio;
        currentAudio = null;
        fadeOut(outgoing);
    }
    currentTrack = trackName;
    const newAudio = new Audio(`assets/${trackName}.mp3`);
    newAudio.loop = true;
    currentAudio = newAudio;
    fadeIn(newAudio);
}

function stopMusic() {
    if (currentAudio) {
        fadeOut(currentAudio);
        currentAudio = null;
    }
    currentTrack = null;
}

/**
 * Initialize the application
 */
async function init() {
    try {
        // Wait for inkjs to load
        if (typeof inkjs === 'undefined') {
            throw new Error('inkjs library failed to load');
        }

        // Load story JSON
        const response = await fetch('story.json');
        if (!response.ok) {
            throw new Error('Failed to load story.json');
        }
        const storyJSON = await response.json();
        story = new inkjs.Story(storyJSON);

        // Wire up event listeners
        restartBtn.addEventListener('click', () => {
            document.getElementById('restart-modal').removeAttribute('hidden');
            document.getElementById('modal-cancel-btn').focus();
        });
        document.getElementById('modal-cancel-btn').addEventListener('click', () => {
            document.getElementById('restart-modal').setAttribute('hidden', '');
        });
        document.getElementById('modal-confirm-btn').addEventListener('click', () => {
            document.getElementById('restart-modal').setAttribute('hidden', '');
            startNewGame();
        });
        document.getElementById('restart-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) e.currentTarget.setAttribute('hidden', '');
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') document.getElementById('restart-modal').setAttribute('hidden', '');
        });
        rewindBtn.addEventListener('click', handleRewind);

        // Auto-start appropriate game state
        if (hasSaveData()) {
            loadGame();
        } else {
            startNewGame();
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to load the game. Please ensure story.json is in the same directory.');
    }
}

/**
 * Start a new game
 */
function startNewGame() {
    // Clear save and history
    localStorage.removeItem(SAVE_KEY);
    storyHistory = [];
    checkpointInkState = null;
    checkpointHistoryLength = 0;
    checkpointTrack = null;
    storyContainer.innerHTML = '';

    // Stop music
    stopMusic();

    // Reset story to beginning
    story.ResetState();

    // Update UI
    updateRewindButton();

    // Start playing
    continueStory();
}

/**
 * Load saved game
 */
function loadGame() {
    try {
        const saveData = JSON.parse(localStorage.getItem(SAVE_KEY));

        if (!saveData) {
            console.warn('No save data found, starting new game');
            startNewGame();
            return;
        }

        // Restore Ink state
        story.state.LoadJson(saveData.inkState);

        // Clear container
        storyContainer.innerHTML = '';

        // Restore checkpoint snapshot
        checkpointInkState = saveData.checkpointInkState || null;
        checkpointHistoryLength = saveData.checkpointHistoryLength || 0;
        checkpointTrack = saveData.checkpointTrack || null;

        // Restore history
        storyHistory = saveData.history || [];
        storyHistory.forEach(item => {
            if (item.isChoice) {
                addPlayerChoice(item.text);
            } else {
                addStoryText(item.text, false);
            }
        });

        // Update UI
        updateRewindButton();

        // Restore music — defer until first user interaction to satisfy browser autoplay policy
        if (saveData.currentTrack) {
            currentTrack = saveData.currentTrack;
            document.addEventListener('click', () => {
                if (currentAudio === null && currentTrack) {
                    const track = currentTrack;
                    currentTrack = null; // reset so playMusic won't skip it
                    playMusic(track);
                }
            }, { once: true });
        }

        // Show current choices
        continueStory();
    } catch (error) {
        console.error('Failed to load game:', error);
        showError('Failed to load saved game. Starting new game.');
        startNewGame();
    }
}

/**
 * Save current game state
 */
function saveGame() {
    try {
        const saveData = {
            inkState: story.state.ToJson(),
            history: storyHistory,
            checkpointInkState: checkpointInkState,
            checkpointHistoryLength: checkpointHistoryLength,
            checkpointTrack: checkpointTrack,
            currentTrack: currentTrack,
            timestamp: Date.now()
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        updateRewindButton();
    } catch (error) {
        console.error('Failed to save game:', error);
    }
}

/**
 * Continue the story - read all available content and show choices
 */
function continueStory() {
    // Remove any existing choice buttons
    const existingChoices = storyContainer.querySelector('.choices');
    if (existingChoices) {
        existingChoices.remove();
    }

    // Read all available story content
    while (story.canContinue) {
        const text = story.Continue().trim();
        for (const tag of story.currentTags) {
            const musicMatch = tag.match(/^MUSIC:\s*(\S+)$/);
            if (musicMatch) playMusic(musicMatch[1]);
            if (tag === 'CHECKPOINT') {
                checkpointInkState = story.state.ToJson();
                checkpointHistoryLength = storyHistory.length;
                checkpointTrack = currentTrack;
            }
        }
        if (text) {
            addStoryText(text, true);
        }
    }

    // Display choices or show ending
    if (story.currentChoices.length > 0) {
        displayChoices();
    } else {
        addStoryText('\n(The End)', true);
    }

    // Save progress
    saveGame();
}

/**
 * Add story text to the container
 */
function addStoryText(text, addToHistory = true) {

    const p = document.createElement('p');
    p.className = 'story-text';
    p.textContent = text;
    storyContainer.appendChild(p);

    if (addToHistory) {
        storyHistory.push({ text, isChoice: false });
    }
}

/**
 * Add player choice text to the container
 */
function addPlayerChoice(text) {
    const p = document.createElement('p');
    p.className = 'player-choice';
    p.textContent = text;
    storyContainer.appendChild(p);
}

/**
 * Display choice buttons
 */
function displayChoices() {
    const choicesDiv = document.createElement('div');
    const isFirstChoices = !storyContainer.querySelector('.player-choice');
    choicesDiv.className = isFirstChoices ? 'choices first-choices' : 'choices';
    choicesDiv.setAttribute('role', 'group');
    choicesDiv.setAttribute('aria-label', 'Story choices');

    story.currentChoices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice.text;
        button.setAttribute('aria-label', `Choice: ${choice.text}`);

        button.addEventListener('click', () => handleChoiceClick(choice, index));

        choicesDiv.appendChild(button);
    });

    storyContainer.appendChild(choicesDiv);
}

/**
 * Handle choice button click
 */
function handleChoiceClick(choice, index) {
    // Record the choice visually
    addPlayerChoice(choice.text);
    storyHistory.push({ text: choice.text, isChoice: true });

    // Mark where new content will begin (the player choice just added)
    const scrollAnchor = storyContainer.lastElementChild;

    // Make the choice in the story
    story.ChooseChoiceIndex(index);

    // Continue the story
    continueStory();

    // Scroll so the player choice sits at the top of the viewport
    scrollAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Handle rewind button — strip everything after the checkpoint and restore choices
 */
function handleRewind() {
    if (!checkpointInkState) return;

    // Restore ink state to checkpoint moment
    story.state.LoadJson(checkpointInkState);

    // Restore music track to checkpoint moment
    if (checkpointTrack) {
        currentTrack = null; // force playMusic to not skip it
        playMusic(checkpointTrack);
    } else {
        stopMusic();
    }

    // Trim history and DOM back to checkpoint
    storyHistory = storyHistory.slice(0, checkpointHistoryLength);
    const existingChoices = storyContainer.querySelector('.choices');
    if (existingChoices) existingChoices.remove();
    while (storyContainer.children.length > checkpointHistoryLength) {
        storyContainer.removeChild(storyContainer.lastChild);
    }

    // Advance to the next choice point from the restored state
    continueStory();
}

/**
 * Update rewind button state based on whether a checkpoint snapshot exists
 */
function updateRewindButton() {
    rewindBtn.disabled = !checkpointInkState;
}

/**
 * Check if save data exists
 */
function hasSaveData() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Show error message
 */
function showError(message) {
    storyContainer.innerHTML = `
        <div class="loading" style="color: #ff6b6b;">
            <p>${message}</p>
        </div>
    `;
}

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Number keys for choices (1-9)
    if (e.key >= '1' && e.key <= '9') {
        const choiceIndex = parseInt(e.key) - 1;
        const choices = storyContainer.querySelectorAll('.choice-btn');
        if (choices[choiceIndex]) {
            choices[choiceIndex].click();
        }
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
