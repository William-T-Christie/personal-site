/**
 * Miami Food Roulette - Storage Module
 * Handles localStorage for favorites, history, and preferences
 */

window.FoodRouletteStorage = (function() {
    const CONFIG = window.FoodRouletteConfig;
    const KEYS = CONFIG.STORAGE_KEYS;

    /**
     * Safely get item from localStorage
     */
    function getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Storage: Error reading from localStorage', e);
            return defaultValue;
        }
    }

    /**
     * Safely set item in localStorage
     */
    function setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('Storage: Error writing to localStorage', e);
            return false;
        }
    }

    // ============ FAVORITES ============

    /**
     * Get all favorites
     * @returns {Array} Array of favorite restaurant objects
     */
    function getFavorites() {
        return getItem(KEYS.FAVORITES, []);
    }

    /**
     * Add a restaurant to favorites
     * @param {Object} restaurant - Restaurant object from API
     * @returns {boolean} Success status
     */
    function addFavorite(restaurant) {
        const favorites = getFavorites();

        // Check if already exists
        if (favorites.some(f => f.id === restaurant.id)) {
            return false;
        }

        // Add with timestamp
        favorites.unshift({
            id: restaurant.id,
            name: restaurant.name,
            image: restaurant.image,
            rating: restaurant.rating,
            price: restaurant.price,
            address: restaurant.address,
            categories: restaurant.categories,
            yelpUrl: restaurant.yelpUrl,
            savedAt: new Date().toISOString()
        });

        return setItem(KEYS.FAVORITES, favorites);
    }

    /**
     * Remove a restaurant from favorites
     * @param {string} restaurantId - Yelp business ID
     * @returns {boolean} Success status
     */
    function removeFavorite(restaurantId) {
        const favorites = getFavorites();
        const filtered = favorites.filter(f => f.id !== restaurantId);
        return setItem(KEYS.FAVORITES, filtered);
    }

    /**
     * Check if a restaurant is favorited
     * @param {string} restaurantId - Yelp business ID
     * @returns {boolean}
     */
    function isFavorite(restaurantId) {
        const favorites = getFavorites();
        return favorites.some(f => f.id === restaurantId);
    }

    /**
     * Get favorites count
     * @returns {number}
     */
    function getFavoritesCount() {
        return getFavorites().length;
    }

    /**
     * Clear all favorites
     * @returns {boolean} Success status
     */
    function clearFavorites() {
        return setItem(KEYS.FAVORITES, []);
    }

    // ============ HISTORY ============

    /**
     * Get spin history
     * @returns {Array} Array of history entries
     */
    function getHistory() {
        return getItem(KEYS.HISTORY, []);
    }

    /**
     * Add a spin to history
     * @param {Object} restaurant - Restaurant object from API
     * @param {Object} filters - The filters used for this spin
     * @returns {boolean} Success status
     */
    function addToHistory(restaurant, filters) {
        const history = getHistory();

        // Add new entry at the beginning
        history.unshift({
            restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                image: restaurant.image,
                rating: restaurant.rating,
                price: restaurant.price,
                categories: restaurant.categories
            },
            filters: {
                cuisine: filters.cuisine,
                neighborhood: filters.neighborhood,
                price: filters.price
            },
            timestamp: new Date().toISOString()
        });

        // Limit history size
        if (history.length > CONFIG.LIMITS.MAX_HISTORY) {
            history.pop();
        }

        return setItem(KEYS.HISTORY, history);
    }

    /**
     * Get history count
     * @returns {number}
     */
    function getHistoryCount() {
        return getHistory().length;
    }

    /**
     * Clear all history
     * @returns {boolean} Success status
     */
    function clearHistory() {
        return setItem(KEYS.HISTORY, []);
    }

    // ============ PREFERENCES ============

    /**
     * Get user preferences
     * @returns {Object} Preferences object
     */
    function getPreferences() {
        return getItem(KEYS.PREFERENCES, {
            soundEnabled: CONFIG.DEFAULTS.SOUND_ENABLED,
            volume: CONFIG.DEFAULTS.VOLUME,
            lastFilters: null
        });
    }

    /**
     * Save user preferences
     * @param {Object} prefs - Preferences to save (partial or full)
     * @returns {boolean} Success status
     */
    function savePreferences(prefs) {
        const current = getPreferences();
        return setItem(KEYS.PREFERENCES, { ...current, ...prefs });
    }

    /**
     * Save the last used filters
     * @param {Object} filters - Filter values
     * @returns {boolean} Success status
     */
    function saveLastFilters(filters) {
        return savePreferences({ lastFilters: filters });
    }

    /**
     * Get the last used filters
     * @returns {Object|null}
     */
    function getLastFilters() {
        const prefs = getPreferences();
        return prefs.lastFilters;
    }

    // ============ SOUND ============

    /**
     * Check if sound is enabled
     * @returns {boolean}
     */
    function isSoundEnabled() {
        const prefs = getPreferences();
        return prefs.soundEnabled !== false;
    }

    /**
     * Set sound enabled/disabled
     * @param {boolean} enabled
     * @returns {boolean} Success status
     */
    function setSoundEnabled(enabled) {
        return savePreferences({ soundEnabled: enabled });
    }

    /**
     * Get volume level
     * @returns {number} Volume between 0 and 1
     */
    function getVolume() {
        const prefs = getPreferences();
        return prefs.volume ?? CONFIG.DEFAULTS.VOLUME;
    }

    /**
     * Set volume level
     * @param {number} volume - Volume between 0 and 1
     * @returns {boolean} Success status
     */
    function setVolume(volume) {
        return savePreferences({ volume: Math.max(0, Math.min(1, volume)) });
    }

    // ============ EXPORT ============

    return {
        // Favorites
        getFavorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        getFavoritesCount,
        clearFavorites,

        // History
        getHistory,
        addToHistory,
        getHistoryCount,
        clearHistory,

        // Preferences
        getPreferences,
        savePreferences,
        saveLastFilters,
        getLastFilters,

        // Sound
        isSoundEnabled,
        setSoundEnabled,
        getVolume,
        setVolume
    };
})();
