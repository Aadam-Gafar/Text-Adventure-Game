// DOM elements
const storyContainer = document.getElementById('story-container');
const restartBtn = document.getElementById('restart-btn');
const rewindBtn = document.getElementById('rewind-btn');
const themeBtn = document.getElementById('theme-btn');
const dyslexicBtn  = document.getElementById('dyslexic-btn');
const zoomInBtns  = document.querySelectorAll('.zoom-in-btn');
const zoomOutBtns = document.querySelectorAll('.zoom-out-btn');
const menuBtn          = document.getElementById('menu-btn');
const inventoryBar     = document.getElementById('inventory-bar');
const inventoryToggle  = document.getElementById('inventory-toggle');

// Mobile menu toggle
menuBtn.addEventListener('click', () => {
    document.querySelector('header').classList.toggle('menu-open');
});

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

    // Disable/Enable ALL zoom-out buttons found
    zoomOutBtns.forEach(btn => {
        btn.disabled = s <= FONT_SIZE_MIN;
    });

    // Disable/Enable ALL zoom-in buttons found
    zoomInBtns.forEach(btn => {
        btn.disabled = s >= FONT_SIZE_MAX;
    });
    
    return s;
}

// Initialize
let currentFontSize = applyFontSize(parseFloat(localStorage.getItem(SIZE_KEY)) || FONT_SIZE_DEFAULT);

// Attach the logic to every "Zoom In" button (Desktop and Mobile)
zoomInBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentFontSize = applyFontSize(Math.round((currentFontSize + FONT_SIZE_STEP) * 10) / 10);
    });
});

// Attach the logic to every "Zoom Out" button (Desktop and Mobile)
zoomOutBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentFontSize = applyFontSize(Math.round((currentFontSize - FONT_SIZE_STEP) * 10) / 10);
    });
});

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
    volumeIcon.src = `assets/icons/${level.icon}.svg`;
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

function fadePause(audio) {
    if (audio._fadeTimer) { clearInterval(audio._fadeTimer); audio._fadeTimer = null; }
    const step = (MUSIC_VOLUME / (FADE_DURATION / FADE_INTERVAL));
    audio._fadeTimer = setInterval(() => {
        if (audio.volume <= step) {
            audio.volume = 0;
            audio.pause();
            clearInterval(audio._fadeTimer);
            audio._fadeTimer = null;
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
    const newAudio = new Audio(`assets/music/${trackName}.mp3`);
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

// Inventory
let invVarNames = [];
let invGatedChoiceTexts = new Set();

inventoryToggle.addEventListener('click', () => {
    const open = inventoryBar.getAttribute('aria-expanded') === 'true';
    const next = open ? 'false' : 'true';
    inventoryBar.setAttribute('aria-expanded', next);
    inventoryToggle.setAttribute('aria-expanded', next);
});

function buildInvGatedChoiceTexts(storyJSON) {
    const texts = new Set();

    // Find the object at the end of an array that holds choice bodies (c-0, c-1, …)
    function getChoiceBodies(arr) {
        for (let i = arr.length - 1; i >= 0; i--) {
            const item = arr[i];
            if (item && typeof item === 'object' && !Array.isArray(item) &&
                Object.keys(item).some(k => /^c-\d+$/.test(k))) {
                return item;
            }
        }
        return null;
    }

    // Returns true if the body array sets any of the given inv_ vars to false
    // Pattern in compiled JSON: "ev", false, "/ev", {"VAR=": "inv_xxx", "re": true}
    function bodyDropsInvVar(body, invVarsChecked) {
        for (let i = 3; i < body.length; i++) {
            const token = body[i];
            if (token && typeof token === 'object' && 'VAR=' in token &&
                invVarsChecked.has(token['VAR=']) &&
                body[i - 3] === 'ev' && body[i - 2] === false && body[i - 1] === '/ev') {
                return true;
            }
        }
        return false;
    }

    function scanArray(arr) {
        const bodies = getChoiceBodies(arr);

        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (item && typeof item === 'object' && '*' in item) {
                // Scan backward through condition tokens to find positively-checked inv_ vars
                // (vars that require inv_ = true, i.e. NOT immediately followed by "!" in forward order)
                let j = i - 1;
                if (arr[j] === '/ev') j--;          // skip /ev

                const invVarsChecked = new Set();
                let nextIsNegated = false;
                let choiceText = null;

                while (j >= 0 && arr[j] !== '/str') {
                    const t = arr[j];
                    if (t === '!') {
                        // In backward order, "!" precedes the VAR? it negates in forward order
                        nextIsNegated = true;
                    } else if (t && typeof t === 'object' && 'VAR?' in t && t['VAR?'].startsWith('inv_')) {
                        if (!nextIsNegated) invVarsChecked.add(t['VAR?']);
                        nextIsNegated = false;
                    } else {
                        nextIsNegated = false;
                    }
                    j--;
                }

                // arr[j] is now '/str'; text is at j-1
                if (invVarsChecked.size > 0 && j >= 1) {
                    const raw = arr[j - 1];
                    if (typeof raw === 'string' && raw.startsWith('^')) {
                        choiceText = raw.slice(1);
                    }
                }

                // Only style if the body doesn't drop (set to false) one of the checked inv_ vars
                // — that would make it a "put down" rather than a "use"
                if (choiceText && bodies) {
                    const pathMatch = /c-(\d+)$/.exec(item['*']);
                    if (pathMatch) {
                        const body = bodies['c-' + pathMatch[1]];
                        if (body && !bodyDropsInvVar(body, invVarsChecked)) {
                            texts.add(choiceText);
                        }
                    }
                }
            }
            if (Array.isArray(item)) {
                scanArray(item);
            } else if (item && typeof item === 'object') {
                for (const val of Object.values(item)) {
                    if (Array.isArray(val)) scanArray(val);
                }
            }
        }
    }
    scanArray(storyJSON.root);
    return texts;
}

function getInvVariableNames(storyJSON) {
    const names = [];
    for (const item of storyJSON.root) {
        if (item && typeof item === 'object' && 'global decl' in item) {
            for (const token of item['global decl']) {
                if (token && typeof token === 'object' && 'VAR=' in token) {
                    const name = token['VAR='];
                    if (name.startsWith('inv_')) names.push(name);
                }
            }
            break;
        }
    }
    return names;
}

function formatInvName(varName) {
    return varName
        .replace(/^inv_/, '')
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function updateInventory() {
    if (!story || invVarNames.length === 0) return;
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';
    const held = invVarNames.filter(name => story.variablesState[name] === true)
                            .sort((a, b) => formatInvName(a).localeCompare(formatInvName(b)));
    if (held.length === 0) {
        const li = document.createElement('li');
        li.className = 'inventory-empty';
        li.textContent = 'Empty';
        list.appendChild(li);
    } else {
        held.forEach(name => {
            const li = document.createElement('li');
            li.textContent = formatInvName(name);
            list.appendChild(li);
        });
    }
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
        invVarNames = getInvVariableNames(storyJSON);
        invGatedChoiceTexts = buildInvGatedChoiceTexts(storyJSON);
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
        rewindBtn.addEventListener('click', () => {
            document.getElementById('rewind-modal').removeAttribute('hidden');
            document.getElementById('rewind-modal-cancel-btn').focus();
        });
        document.getElementById('rewind-modal-cancel-btn').addEventListener('click', () => {
            document.getElementById('rewind-modal').setAttribute('hidden', '');
        });
        document.getElementById('rewind-modal-confirm-btn').addEventListener('click', () => {
            document.getElementById('rewind-modal').setAttribute('hidden', '');
            handleRewind();
        });
        document.getElementById('rewind-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) e.currentTarget.setAttribute('hidden', '');
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') document.getElementById('rewind-modal').setAttribute('hidden', '');
        });

        // Pause music when the tab/window loses focus, resume when it returns
        document.addEventListener('visibilitychange', () => {
            if (!currentAudio) return;
            if (document.hidden) {
                fadePause(currentAudio);
            } else {
                fadeIn(currentAudio);
            }
        });
        window.addEventListener('blur', () => {
            if (currentAudio) fadePause(currentAudio);
        });
        window.addEventListener('focus', () => {
            if (currentAudio) fadeIn(currentAudio);
        });

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
            } else if (item.isCheckpoint) {
                addCheckpointNotification(false);
            } else if (item.isItemChange) {
                addItemChange(item.text.slice(2), item.gained, false);
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

        // Jump to the bottom so the player lands at the current point in the story
        storyContainer.scrollTop = storyContainer.scrollHeight;
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
function continueStory(trackChanges = false) {
    // Remove any existing choice buttons
    const existingChoices = storyContainer.querySelector('.choices');
    if (existingChoices) {
        existingChoices.remove();
    }

    // Snapshot inv_ state before the story runs (variables change during Continue())
    const prevInv = trackChanges ? Object.fromEntries(invVarNames.map(n => [n, story.variablesState[n]])) : null;

    // Collect all text segments first — variables finish changing before we render anything
    const segments = [];
    while (story.canContinue) {
        const text = story.Continue().trim();
        for (const tag of story.currentTags) {
            const musicMatch = tag.match(/^MUSIC:\s*(\S+)$/);
            if (musicMatch) playMusic(musicMatch[1]);
            if (tag === 'CHECKPOINT') {
                checkpointInkState = story.state.ToJson();
                checkpointHistoryLength = storyHistory.length;
                checkpointTrack = currentTrack;
                segments.push({ isCheckpoint: true });
            }
        }
        if (text) segments.push(text);
    }

    // Render inventory changes before the story text
    if (prevInv) {
        for (const name of invVarNames) {
            if (prevInv[name] !== story.variablesState[name]) {
                addItemChange(name, story.variablesState[name] === true);
            }
        }
    }

    // Now render the collected story text
    for (const segment of segments) {
        if (segment && segment.isCheckpoint) {
            addCheckpointNotification();
        } else {
            addStoryText(segment, true);
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
    updateInventory();
    updateScrollBtn();
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
 * Add an inventory gain/loss line to the container
 */
function addItemChange(varName, gained, addToHistory = true) {
    const label = formatInvName(varName);
    const text = `${gained ? '+' : '−'} ${label}`;
    const p = document.createElement('p');
    p.className = `item-change ${gained ? 'gain' : 'loss'}`;
    p.textContent = text;
    storyContainer.appendChild(p);
    if (addToHistory) {
        storyHistory.push({ text, isChoice: false, isItemChange: true, gained });
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
        const isInvGated = invGatedChoiceTexts.has(choice.text);
        button.className = isInvGated ? 'choice-btn inv-gated' : 'choice-btn';
        button.textContent = choice.text;
        button.setAttribute('aria-label', `Choice: ${choice.text}`);

        button.addEventListener('click', () => handleChoiceClick(choice, index));

        choicesDiv.appendChild(button);
    });

    storyContainer.appendChild(choicesDiv);
}

/**
 * Scroll an element to the top of the story container
 */
function scrollToTop(el) {
    if (!el) return;
    const top = el.getBoundingClientRect().top - storyContainer.getBoundingClientRect().top + storyContainer.scrollTop;
    storyContainer.scrollTo({ top, behavior: 'smooth' });
}

/**
 * Handle choice button click
 */
function handleChoiceClick(choice, index) {
    // Record the choice visually
    addPlayerChoice(choice.text);
    storyHistory.push({ text: choice.text, isChoice: true });

    // Mark the player choice element — this is what we scroll to
    const scrollAnchor = storyContainer.lastElementChild;

    // Make the choice in the story
    story.ChooseChoiceIndex(index);

    // Continue the story (track inv_ changes to show gain/loss lines)
    continueStory(true);

    // Scroll so the player choice sits at the top of the viewport
    scrollToTop(scrollAnchor);
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

    // Mark the last restored element so we can find the first new element after continueStory
    const scrollAnchor = storyContainer.lastElementChild;

    // Advance to the next choice point from the restored state
    continueStory();

    // Scroll so the first new element sits at the top of the viewport
    scrollToTop(scrollAnchor ? scrollAnchor.nextElementSibling : storyContainer.firstElementChild);
}

/**
 * Add a checkpoint notification line to the container
 */
function addCheckpointNotification(addToHistory = true) {
    const p = document.createElement('p');
    p.className = 'item-change checkpoint';
    p.textContent = 'Checkpoint saved';
    storyContainer.appendChild(p);
    if (addToHistory) {
        storyHistory.push({ isCheckpoint: true });
    }
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
 * Scroll-to-bottom button
 */
const scrollBottomBtn = document.getElementById('scroll-bottom-btn');

function showScrollBtn() {
    scrollBottomBtn.classList.remove('is-hiding');
    scrollBottomBtn.removeAttribute('hidden');
    scrollBottomBtn.style.animationName = 'none';
    scrollBottomBtn.offsetHeight; // force reflow to re-trigger entrance animation
    scrollBottomBtn.style.animationName = '';
}

function hideScrollBtn() {
    if (scrollBottomBtn.hasAttribute('hidden')) return;
    scrollBottomBtn.classList.add('is-hiding');
    scrollBottomBtn.addEventListener('animationend', () => {
        scrollBottomBtn.classList.remove('is-hiding');
        scrollBottomBtn.setAttribute('hidden', '');
    }, { once: true });
}

function updateScrollBtn() {
    const distanceFromBottom = storyContainer.scrollHeight - storyContainer.scrollTop - storyContainer.clientHeight;
    if (distanceFromBottom > 80) {
        if (scrollBottomBtn.hasAttribute('hidden')) showScrollBtn();
    } else {
        hideScrollBtn();
    }
}

storyContainer.addEventListener('scroll', updateScrollBtn);

scrollBottomBtn.addEventListener('click', () => {
    storyContainer.scrollTo({ top: storyContainer.scrollHeight, behavior: 'smooth' });
});

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
