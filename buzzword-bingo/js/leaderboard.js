/**
 * Buzzword Bingo - Leaderboard (local only)
 * High scores live in the browser's localStorage. Nothing is uploaded anywhere.
 */

const LOCAL_STORAGE_KEY = 'buzzword_bingo_highscores';
const MAX_SCORES = 10;

let cachedScores = null;

/**
 * Remote leaderboard is intentionally not used; scores never leave this device.
 */
function isRemoteEnabled() {
    return false;
}

/**
 * Get scores from local storage
 */
function getLocalScores() {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!stored) return [];
        const scores = JSON.parse(stored);
        return Array.isArray(scores) ? scores : [];
    } catch (e) {
        console.error('Error reading local scores:', e);
        return [];
    }
}

/**
 * Save scores to local storage
 */
function saveLocalScores(scores) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scores));
    } catch (e) {
        console.error('Error saving local scores:', e);
    }
}

/**
 * Get all high scores (kept async for a stable public API)
 */
async function getHighScores() {
    cachedScores = getLocalScores();
    return cachedScores;
}

/**
 * Get high scores synchronously (from cache or local)
 */
function getHighScoresSync() {
    if (cachedScores) {
        return cachedScores;
    }
    return getLocalScores();
}

/**
 * Check if a score qualifies for the leaderboard
 */
function isHighScore(score) {
    const scores = getHighScoresSync();
    if (scores.length < MAX_SCORES) return true;
    const lowestScore = scores[scores.length - 1]?.score || 0;
    return score > lowestScore;
}

/**
 * Get the rank position a score would have
 */
function getScoreRank(score) {
    const scores = getHighScoresSync();
    let rank = 1;
    for (const entry of scores) {
        if (score > entry.score) break;
        rank++;
    }
    return rank;
}

/**
 * Add a new high score
 */
async function addHighScore(name, score) {
    const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
    if (cleanName.length !== 3) {
        console.error('Invalid name:', name);
        return -1;
    }

    let scores = getLocalScores();
    scores = Array.isArray(scores) ? [...scores] : [];

    const newEntry = {
        name: cleanName,
        score: score,
        date: new Date().toISOString()
    };

    let inserted = false;
    for (let i = 0; i < scores.length; i++) {
        if (score > scores[i].score) {
            scores.splice(i, 0, newEntry);
            inserted = true;
            break;
        }
    }

    if (!inserted && scores.length < MAX_SCORES) {
        scores.push(newEntry);
        inserted = true;
    }

    while (scores.length > MAX_SCORES) {
        scores.pop();
    }

    saveLocalScores(scores);
    cachedScores = scores;

    const rank = scores.findIndex(s => s === newEntry) + 1;
    return rank > 0 ? rank : -1;
}

/**
 * Clear all high scores (for testing/reset)
 */
async function clearHighScores() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    cachedScores = [];
}

/**
 * Render the leaderboard HTML
 */
async function renderLeaderboard(highlightScore = null) {
    const container = document.getElementById('leaderboard-table');
    if (!container) return;

    const scores = getLocalScores();

    if (!scores || scores.length === 0) {
        container.innerHTML = '<p class="no-scores">NO SCORES YET<br>BE THE FIRST!</p>';
        return;
    }

    let html = `
        <div class="leaderboard-row header">
            <span class="rank">#</span>
            <span class="name">NAME</span>
            <span class="score">SCORE</span>
        </div>
    `;

    scores.forEach((entry, index) => {
        const isHighlight = highlightScore !== null && entry.score === highlightScore;
        html += `
            <div class="leaderboard-row ${isHighlight ? 'highlight' : ''}">
                <span class="rank">${index + 1}.</span>
                <span class="name">${entry.name}</span>
                <span class="score">${entry.score.toLocaleString()}</span>
            </div>
        `;
    });

    html += `<p class="leaderboard-mode">LOCAL LEADERBOARD</p>`;

    container.innerHTML = html;
}

/**
 * Initialize - preload scores
 */
async function initLeaderboard() {
    await getHighScores();
}

// Export for use in other modules
window.Leaderboard = {
    getHighScores,
    getHighScoresSync,
    isHighScore,
    getScoreRank,
    addHighScore,
    clearHighScores,
    renderLeaderboard,
    initLeaderboard,
    isRemoteEnabled
};

// Initialize on load
initLeaderboard();
