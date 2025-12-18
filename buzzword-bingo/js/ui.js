/**
 * Buzzword Bingo - UI Management
 * Screen transitions, animations, and arcade-style effects
 */

// Current screen state
let currentScreen = 'landing';

// Name entry state
let currentInitials = ['A', 'A', 'A'];

/**
 * Show a specific screen
 */
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.getElementById(`${screenId}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenId;
    }
}

/**
 * Update progress bar and text
 */
function updateProgress(percent, text, funMessage = null) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const funMessageEl = document.getElementById('fun-message');

    if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }

    if (progressText && text) {
        progressText.textContent = text;
    }

    if (funMessageEl && funMessage) {
        funMessageEl.textContent = funMessage;
    }
}

/**
 * Animate score counting up
 */
function animateScore(targetScore, duration = 2000) {
    return new Promise(resolve => {
        const scoreEl = document.getElementById('score-value');
        if (!scoreEl) {
            resolve();
            return;
        }

        const startTime = Date.now();
        const startScore = 0;

        function updateScore() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentScore = Math.floor(startScore + (targetScore - startScore) * easeOut);

            scoreEl.textContent = currentScore.toLocaleString();
            scoreEl.classList.add('counting');

            if (progress < 1) {
                requestAnimationFrame(updateScore);
            } else {
                scoreEl.textContent = targetScore.toLocaleString();
                scoreEl.classList.remove('counting');
                resolve();
            }
        }

        requestAnimationFrame(updateScore);
    });
}

/**
 * Display results on the results screen
 */
async function displayResults(score, award, breakdown) {
    // Set award title
    const awardTitle = document.getElementById('award-title');
    if (awardTitle) {
        awardTitle.textContent = award.title;
    }

    // Render buzzword breakdown
    renderBuzzwordBreakdown(breakdown);

    // Show results screen
    showScreen('results');

    // Animate score after a small delay
    await new Promise(r => setTimeout(r, 300));
    await animateScore(score);
}

/**
 * Render the buzzword breakdown list
 */
function renderBuzzwordBreakdown(breakdown) {
    const container = document.getElementById('buzzword-breakdown');
    if (!container) return;

    if (!breakdown || breakdown.length === 0) {
        container.innerHTML = '<p class="no-scores" style="padding: 20px;">No buzzwords detected! Impressive.</p>';
        return;
    }

    // Sort by points contribution (count * points)
    const sorted = [...breakdown].sort((a, b) => (b.count * b.points) - (a.count * a.points));

    let html = '';
    for (const item of sorted) {
        const totalPoints = item.count * item.points;
        html += `
            <div class="buzzword-item">
                <span class="word">${escapeHtml(item.base)}</span>
                <span class="count">x${item.count}</span>
                <span class="points">+${totalPoints}</span>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Initialize name entry controls
 */
function initNameEntry() {
    currentInitials = ['A', 'A', 'A'];

    const slots = document.querySelectorAll('.initial-slot');
    slots.forEach((slot, index) => {
        const letterEl = slot.querySelector('.letter');
        const upBtn = slot.querySelector('.arrow.up');
        const downBtn = slot.querySelector('.arrow.down');

        if (letterEl) {
            letterEl.textContent = currentInitials[index];
        }

        if (upBtn) {
            upBtn.onclick = () => changeInitial(index, 1);
        }

        if (downBtn) {
            downBtn.onclick = () => changeInitial(index, -1);
        }
    });
}

/**
 * Change an initial letter
 */
function changeInitial(index, direction) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const currentIndex = letters.indexOf(currentInitials[index]);
    let newIndex = currentIndex + direction;

    // Wrap around
    if (newIndex < 0) newIndex = letters.length - 1;
    if (newIndex >= letters.length) newIndex = 0;

    currentInitials[index] = letters[newIndex];

    // Update display
    const slots = document.querySelectorAll('.initial-slot');
    const letterEl = slots[index]?.querySelector('.letter');
    if (letterEl) {
        letterEl.textContent = currentInitials[index];
    }
}

/**
 * Get current initials
 */
function getInitials() {
    return currentInitials.join('');
}

/**
 * Show high score entry screen
 */
function showHighScoreEntry(score) {
    const entryScore = document.getElementById('entry-score');
    if (entryScore) {
        entryScore.textContent = score.toLocaleString();
    }

    initNameEntry();
    showScreen('highscore-entry');
}

/**
 * Start rotating fun messages
 */
let messageInterval = null;

function startLoadingMessages() {
    if (messageInterval) clearInterval(messageInterval);

    const funMessage = document.getElementById('fun-message');
    if (!funMessage) return;

    // Initial message
    funMessage.textContent = window.BuzzwordData?.getRandomLoadingMessage() || 'Processing...';

    // Rotate messages every 2 seconds
    messageInterval = setInterval(() => {
        funMessage.textContent = window.BuzzwordData?.getRandomLoadingMessage() || 'Processing...';
    }, 2000);
}

function stopLoadingMessages() {
    if (messageInterval) {
        clearInterval(messageInterval);
        messageInterval = null;
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show error message in arcade-style modal
 */
function showError(message) {
    const modal = document.getElementById('error-modal');
    const messageEl = document.getElementById('error-message');
    const closeBtn = document.getElementById('error-close-btn');

    if (!modal || !messageEl) {
        // Fallback to alert if modal not found
        alert(message);
        return;
    }

    messageEl.textContent = message;
    modal.classList.add('active');

    // Close on button click
    const closeHandler = () => {
        modal.classList.remove('active');
        closeBtn.removeEventListener('click', closeHandler);
    };
    closeBtn.addEventListener('click', closeHandler);

    // Close on Escape key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            modal.classList.remove('active');
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

/**
 * Hide the first-time note (after model is loaded)
 */
function hideFirstTimeNote() {
    const note = document.getElementById('first-time-note');
    if (note) {
        note.classList.add('hidden');
    }
}

/**
 * Handle keyboard input for initials entry
 */
function handleInitialsKeyboard(e) {
    if (currentScreen !== 'highscore-entry') return;

    const key = e.key.toUpperCase();

    // Handle A-Z keys - type into focused slot
    if (/^[A-Z]$/.test(key)) {
        // Find which slot should receive the letter (first non-filled or cycle through)
        const slots = document.querySelectorAll('.initial-slot');
        let targetIndex = 0;

        // Set letter in first slot, then move focus concept
        currentInitials[targetIndex] = key;
        const letterEl = slots[targetIndex]?.querySelector('.letter');
        if (letterEl) {
            letterEl.textContent = key;
        }

        // Shift initials left for "typing" effect
        if (currentInitials.every(l => l !== 'A' || key === 'A')) {
            // Just update first slot on each keypress
            currentInitials.unshift(key);
            currentInitials.pop();
            slots.forEach((slot, i) => {
                const el = slot.querySelector('.letter');
                if (el) el.textContent = currentInitials[i];
            });
        }
    }

    // Arrow keys for first slot
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        changeInitial(0, 1);
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        changeInitial(0, -1);
    }

    // Enter to submit
    if (e.key === 'Enter') {
        const submitBtn = document.getElementById('submit-score-btn');
        if (submitBtn) submitBtn.click();
    }
}

// Add keyboard listener
document.addEventListener('keydown', handleInitialsKeyboard);

// Export for use in other modules
window.UI = {
    showScreen,
    updateProgress,
    animateScore,
    displayResults,
    renderBuzzwordBreakdown,
    initNameEntry,
    getInitials,
    showHighScoreEntry,
    startLoadingMessages,
    stopLoadingMessages,
    showError,
    hideFirstTimeNote,
    get currentScreen() { return currentScreen; }
};
