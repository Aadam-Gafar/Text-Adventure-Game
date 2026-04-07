// DOM elements
const storyContainer = document.getElementById('story-container');
const restartBtn = document.getElementById('restart-btn');
const rewindBtn = document.getElementById('rewind-btn');
const themeBtn = document.getElementById('theme-btn');

// Storage key
const SAVE_KEY = 'dwemer_facility_save';
const THEME_KEY = 'dwemer_theme';

// Theme
function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : '');
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
}

(function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    applyTheme(saved === 'dark');
})();

themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(!isDark);
});

// State
let story;
let storyHistory = [];

// Checkpoint snapshot
let checkpointInkState = null;
let checkpointHistoryLength = 0;

// Music
let currentAudio = null;
let currentTrack = null;

function playMusic(trackName) {
    console.log('[playMusic] requested:', trackName, '| current:', currentTrack);
    if (currentTrack === trackName) return;
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    currentTrack = trackName;
    currentAudio = new Audio(`assets/${trackName}.mp3`);
    currentAudio.loop = true;
    currentAudio.volume = 0.5;
    currentAudio.play().then(() => {
        console.log('[playMusic] playing:', trackName);
    }).catch(err => {
        console.error('[playMusic] failed:', trackName, err);
    });
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
        restartBtn.addEventListener('click', startNewGame);
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
    storyContainer.innerHTML = '';

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
        const wasCheckpointed = story.variablesState['cp_power_restored'];
        const text = story.Continue().trim();
        for (const tag of story.currentTags) {
            const musicMatch = tag.match(/^MUSIC:\s*(\S+)$/);
            if (musicMatch) playMusic(musicMatch[1]);
        }
        if (text) {
            addStoryText(text, true);
        }
        // Capture snapshot the moment the checkpoint fires
        if (!wasCheckpointed && story.variablesState['cp_power_restored']) {
            checkpointInkState = story.state.ToJson();
            checkpointHistoryLength = storyHistory.length;
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
    choicesDiv.className = 'choices';
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

    // Trim history and DOM back to checkpoint
    storyHistory = storyHistory.slice(0, checkpointHistoryLength);
    const existingChoices = storyContainer.querySelector('.choices');
    if (existingChoices) existingChoices.remove();
    while (storyContainer.children.length > checkpointHistoryLength) {
        storyContainer.removeChild(storyContainer.lastChild);
    }

    // Show the choices that were available at the checkpoint
    displayChoices();
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
