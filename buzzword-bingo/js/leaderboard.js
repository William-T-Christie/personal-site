/**
 * Buzzword Bingo - Global Leaderboard
 * Uses JSONBin.io for shared high scores across all users
 */

// ============================================
// CONFIGURATION - Add your JSONBin credentials here
// ============================================
const JSONBIN_CONFIG = {
    BIN_ID: '', // Add your bin ID here (e.g., '507f1f77bcf86cd799439011')
    API_KEY: '' // Add your API key here (e.g., '$2b$10$...')
};

const JSONBIN_URL = JSONBIN_CONFIG.BIN_ID
    ? `https://api.jsonbin.io/v3/b/${JSONBIN_CONFIG.BIN_ID}`
    : null;

// Local storage fallback
const LOCAL_STORAGE_KEY = 'buzzword_bingo_highscores';
const MAX_SCORES = 10;

// Cache for scores (reduces API calls)
let cachedScores = null;
let lastFetch = 0;
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Check if JSONBin is configured
 */
function isRemoteEnabled() {
    return JSONBIN_CONFIG.BIN_ID && JSONBIN_CONFIG.API_KEY;
}

/**
 * Get high scores from JSONBin
 */
async function fetchRemoteScores() {
    if (!isRemoteEnabled()) {
        return null;
    }

    try {
        const response = await fetch(JSONBIN_URL + '/latest', {
            method: 'GET',
            headers: {
                'X-Access-Key': JSONBIN_CONFIG.API_KEY
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch scores');
        }

        const data = await response.json();
        return data.record?.scores || data.record || [];
    } catch (error) {
        console.error('Error fetching remote scores:', error);
        return null;
    }
}

/**
 * Save high scores to JSONBin
 */
async function saveRemoteScores(scores) {
    if (!isRemoteEnabled()) {
        return false;
    }

    try {
        const response = await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Key': JSONBIN_CONFIG.API_KEY
            },
            body: JSON.stringify({ scores })
        });

        if (!response.ok) {
            throw new Error('Failed to save scores');
        }

        return true;
    } catch (error) {
        console.error('Error saving remote scores:', error);
        return false;
    }
}

/**
 * Get scores from local storage (fallback)
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
 * Save scores to local storage (fallback)
 */
function saveLocalScores(scores) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scores));
    } catch (e) {
        console.error('Error saving local scores:', e);
    }
}

/**
 * Get all high scores (tries remote first, falls back to local)
 */
async function getHighScores(forceRefresh = false) {
    const now = Date.now();

    // Return cached if fresh
    if (!forceRefresh && cachedScores && (now - lastFetch) < CACHE_DURATION) {
        return cachedScores;
    }

    // Try remote first
    if (isRemoteEnabled()) {
        const remoteScores = await fetchRemoteScores();
        if (remoteScores) {
            cachedScores = remoteScores;
            lastFetch = now;
            // Also save to local as backup
            saveLocalScores(remoteScores);
            return remoteScores;
        }
    }

    // Fall back to local
    cachedScores = getLocalScores();
    lastFetch = now;
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
    // Validate name (3 uppercase letters)
    const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
    if (cleanName.length !== 3) {
        console.error('Invalid name:', name);
        return -1;
    }

    // Get current scores
    let scores = await getHighScores(true);
    scores = Array.isArray(scores) ? [...scores] : [];

    // Create new entry
    const newEntry = {
        name: cleanName,
        score: score,
        date: new Date().toISOString()
    };

    // Insert in sorted position
    let inserted = false;
    for (let i = 0; i < scores.length; i++) {
        if (score > scores[i].score) {
            scores.splice(i, 0, newEntry);
            inserted = true;
            break;
        }
    }

    // If not inserted, add to end (if there's room)
    if (!inserted && scores.length < MAX_SCORES) {
        scores.push(newEntry);
        inserted = true;
    }

    // Keep only top MAX_SCORES
    while (scores.length > MAX_SCORES) {
        scores.pop();
    }

    // Save to remote (and local as backup)
    if (isRemoteEnabled()) {
        const saved = await saveRemoteScores(scores);
        if (!saved) {
            console.warn('Failed to save to remote, saving locally');
        }
    }
    saveLocalScores(scores);

    // Update cache
    cachedScores = scores;
    lastFetch = Date.now();

    const rank = scores.findIndex(s => s === newEntry) + 1;
    return rank > 0 ? rank : -1;
}

/**
 * Clear all high scores (for testing/reset)
 */
async function clearHighScores() {
    if (isRemoteEnabled()) {
        await saveRemoteScores([]);
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    cachedScores = [];
}

/**
 * Render the leaderboard HTML
 */
async function renderLeaderboard(highlightScore = null) {
    const container = document.getElementById('leaderboard-table');
    if (!container) return;

    // Show loading state
    container.innerHTML = '<p class="no-scores">LOADING...</p>';

    const scores = await getHighScores(true);

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

    // Show mode indicator
    const modeText = isRemoteEnabled() ? 'GLOBAL' : 'LOCAL';
    html += `<p class="leaderboard-mode">${modeText} LEADERBOARD</p>`;

    container.innerHTML = html;
}

/**
 * Initialize - preload scores
 */
async function initLeaderboard() {
    await getHighScores();
    console.log('Leaderboard initialized. Mode:', isRemoteEnabled() ? 'GLOBAL' : 'LOCAL');
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
