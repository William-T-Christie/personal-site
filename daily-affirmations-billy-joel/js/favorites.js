/**
 * Favorites System - localStorage persistence
 * Stores user's favorite affirmations
 */

const STORAGE_KEY = 'billy-joel-favorites';
const STORAGE_VERSION = 1;

/**
 * Load favorites from localStorage
 */
function loadFavorites() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return { version: STORAGE_VERSION, ids: [] };
        }

        const data = JSON.parse(stored);

        // Handle version migrations if needed
        if (!data.version || data.version < STORAGE_VERSION) {
            return migrateData(data);
        }

        return data;
    } catch (e) {
        console.error('Failed to load favorites:', e);
        return { version: STORAGE_VERSION, ids: [] };
    }
}

/**
 * Save favorites to localStorage
 */
function saveFavorites(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Failed to save favorites:', e);
        return false;
    }
}

/**
 * Migration helper for future schema changes
 */
function migrateData(oldData) {
    // Handle legacy formats (in case we stored just an array before)
    if (Array.isArray(oldData)) {
        return { version: STORAGE_VERSION, ids: oldData };
    }
    return { version: STORAGE_VERSION, ids: oldData.ids || [] };
}

/**
 * Check if an affirmation is favorited
 */
function isFavorite(id) {
    const data = loadFavorites();
    return data.ids.includes(id);
}

/**
 * Add an affirmation to favorites
 */
function addFavorite(id) {
    const data = loadFavorites();
    if (!data.ids.includes(id)) {
        data.ids.push(id);
        saveFavorites(data);
        dispatchFavoriteEvent('add', id);
        return true;
    }
    return false;
}

/**
 * Remove an affirmation from favorites
 */
function removeFavorite(id) {
    const data = loadFavorites();
    const index = data.ids.indexOf(id);
    if (index > -1) {
        data.ids.splice(index, 1);
        saveFavorites(data);
        dispatchFavoriteEvent('remove', id);
        return true;
    }
    return false;
}

/**
 * Toggle favorite status
 * @returns {boolean} New favorite state (true = now favorited)
 */
function toggleFavorite(id) {
    if (isFavorite(id)) {
        removeFavorite(id);
        return false;
    } else {
        addFavorite(id);
        return true;
    }
}

/**
 * Get all favorite IDs
 */
function getAllFavorites() {
    const data = loadFavorites();
    return data.ids;
}

/**
 * Get favorite affirmations with full data
 */
function getFavoriteAffirmations() {
    const ids = getAllFavorites();
    if (!window.AffirmationData) {
        console.warn('AffirmationData not loaded');
        return [];
    }
    return ids
        .map(id => window.AffirmationData.getAffirmationById(id))
        .filter(Boolean);
}

/**
 * Get count of favorites
 */
function getFavoritesCount() {
    return getAllFavorites().length;
}

/**
 * Clear all favorites
 */
function clearAllFavorites() {
    saveFavorites({ version: STORAGE_VERSION, ids: [] });
    dispatchFavoriteEvent('clear', null);
}

/**
 * Dispatch custom event for favorite changes
 */
function dispatchFavoriteEvent(action, id) {
    const event = new CustomEvent('favoritesChanged', {
        detail: { action, id, count: getFavoritesCount() }
    });
    window.dispatchEvent(event);
}

// Export to window
window.Favorites = {
    isFavorite,
    add: addFavorite,
    remove: removeFavorite,
    toggle: toggleFavorite,
    getAll: getAllFavorites,
    getAffirmations: getFavoriteAffirmations,
    getCount: getFavoritesCount,
    clear: clearAllFavorites
};
