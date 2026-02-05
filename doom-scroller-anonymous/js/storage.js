/**
 * DOOM SCROLLER ANONYMOUS - Storage Module
 * LocalStorage wrapper for roast history and settings
 */

window.DoomScrollerStorage = (function() {
    'use strict';

    const STORAGE_KEYS = {
        HISTORY: 'doomscroller_history',
        SETTINGS: 'doomscroller_settings',
        LAST_ROAST: 'doomscroller_last_roast'
    };

    const MAX_HISTORY_ITEMS = 10;

    // ==========================================
    // PRIVATE HELPERS
    // ==========================================

    function isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    function getItem(key, defaultValue = null) {
        if (!isStorageAvailable()) return defaultValue;
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn(`[Storage] Failed to get ${key}:`, e);
            return defaultValue;
        }
    }

    function setItem(key, value) {
        if (!isStorageAvailable()) return false;
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn(`[Storage] Failed to set ${key}:`, e);
            return false;
        }
    }

    function removeItem(key) {
        if (!isStorageAvailable()) return false;
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn(`[Storage] Failed to remove ${key}:`, e);
            return false;
        }
    }

    // ==========================================
    // HISTORY MANAGEMENT
    // ==========================================

    function getHistory() {
        return getItem(STORAGE_KEYS.HISTORY, []);
    }

    function addToHistory(roastData) {
        const history = getHistory();

        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            totalMinutes: roastData.totalMinutes,
            topApps: roastData.topApps || [],
            roastText: roastData.roastText,
            severity: roastData.severity
        };

        // Add to beginning, limit to max items
        history.unshift(entry);
        if (history.length > MAX_HISTORY_ITEMS) {
            history.pop();
        }

        setItem(STORAGE_KEYS.HISTORY, history);
        return entry;
    }

    function clearHistory() {
        return removeItem(STORAGE_KEYS.HISTORY);
    }

    function getHistoryItem(id) {
        const history = getHistory();
        return history.find(item => item.id === id) || null;
    }

    // ==========================================
    // LAST ROAST (for replay)
    // ==========================================

    function saveLastRoast(roastData) {
        return setItem(STORAGE_KEYS.LAST_ROAST, {
            ...roastData,
            savedAt: new Date().toISOString()
        });
    }

    function getLastRoast() {
        return getItem(STORAGE_KEYS.LAST_ROAST, null);
    }

    function clearLastRoast() {
        return removeItem(STORAGE_KEYS.LAST_ROAST);
    }

    // ==========================================
    // SETTINGS
    // ==========================================

    const DEFAULT_SETTINGS = {
        volume: 0.7,
        speechEnabled: true,
        beatEnabled: true,
        voicePitch: 0.7,
        voiceRate: 0.85
    };

    function getSettings() {
        return {
            ...DEFAULT_SETTINGS,
            ...getItem(STORAGE_KEYS.SETTINGS, {})
        };
    }

    function updateSettings(updates) {
        const current = getSettings();
        const newSettings = { ...current, ...updates };
        return setItem(STORAGE_KEYS.SETTINGS, newSettings);
    }

    function resetSettings() {
        return setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return Object.freeze({
        // Storage check
        isAvailable: isStorageAvailable,

        // History
        getHistory,
        addToHistory,
        clearHistory,
        getHistoryItem,

        // Last roast
        saveLastRoast,
        getLastRoast,
        clearLastRoast,

        // Settings
        getSettings,
        updateSettings,
        resetSettings,

        // Constants
        MAX_HISTORY_ITEMS
    });
})();
