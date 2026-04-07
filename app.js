// DOM elements
const storyContainer = document.getElementById('story-container');
const menuOverlay = document.getElementById('menu-overlay');
const menuBtn = document.getElementById('menu-btn');
const newGameBtn = document.getElementById('new-game-btn');
const continueBtn = document.getElementById('continue-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');

// Storage key
const SAVE_KEY = 'dwemer_facility_save';

// State
let story;
let storyHistory = [];

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

        // Check for existing save
        updateContinueButton();

        // Wire up event listeners
        menuBtn.addEventListener('click', openMenu);
        newGameBtn.addEventListener('click', handleNewGame);
        continueBtn.addEventListener('click', handleContinueGame);
        closeMenuBtn.addEventListener('click', closeMenu);

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
    storyContainer.innerHTML = '';
    
    // Reset story to beginning
    story.ResetState();
    
    // Update UI
    updateContinueButton();
    
    // Start playing
    continueStory();
}

/**
 * Handle new game button click
 */
function handleNewGame() {
    // If there's existing progress, could add confirmation here
    startNewGame();
    closeMenu();
}

/**
 * Handle continue button click
 */
function handleContinueGame() {
    loadGame();
    closeMenu();
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
        
        // Restore history
        storyHistory = saveData.history || [];
        storyHistory.forEach(item => {
            if (item.isChoice) {
                addPlayerChoice(item.text);
            } else {
                addStoryText(item.text, false);
            }
        });
        
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
            timestamp: Date.now()
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        updateContinueButton();
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
    
    // Make the choice in the story
    story.ChooseChoiceIndex(index);
    
    // Continue the story
    continueStory();
}

/**
 * Open menu overlay
 */
function openMenu() {
    menuOverlay.classList.remove('hidden');
    closeMenuBtn.focus(); // Accessibility: focus the close button
}

/**
 * Close menu overlay
 */
function closeMenu() {
    menuOverlay.classList.add('hidden');
    menuBtn.focus(); // Return focus to menu button
}

/**
 * Check if save data exists
 */
function hasSaveData() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Update continue button state
 */
function updateContinueButton() {
    const hasSave = hasSaveData();
    continueBtn.disabled = !hasSave;
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
    // Escape to toggle menu
    if (e.key === 'Escape') {
        if (menuOverlay.classList.contains('hidden')) {
            openMenu();
        } else {
            closeMenu();
        }
    }
    
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