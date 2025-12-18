/**
 * Miami Food Roulette - Main Application
 * Initializes all modules and handles user interactions
 */

window.FoodRouletteApp = (function() {
    const CONFIG = window.FoodRouletteConfig;
    const Storage = window.FoodRouletteStorage;
    const API = window.FoodRouletteAPI;
    const Audio = window.FoodRouletteAudio;
    const SlotMachine = window.FoodRouletteSlotMachine;
    const UI = window.FoodRouletteUI;

    // State
    let isInitialized = false;
    let currentRestaurant = null;
    let currentFilters = null;

    // DOM Elements
    let elements = {};

    /**
     * Initialize the application
     */
    function init() {
        if (isInitialized) return;

        console.log('Miami Food Roulette: Initializing...');

        // Cache DOM elements
        cacheElements();

        // Initialize modules
        UI.init();
        Audio.init();
        SlotMachine.init({
            cuisineReel: document.getElementById('reelCuisine'),
            neighborhoodReel: document.getElementById('reelNeighborhood'),
            priceReel: document.getElementById('reelPrice')
        });

        // Setup event listeners
        setupEventListeners();

        // Load initial UI state
        loadInitialState();

        // Update panels
        UI.updatePanels();

        isInitialized = true;
        console.log('Miami Food Roulette: Ready!');

        // Show mock data notice if applicable
        if (API.USE_MOCK_DATA) {
            console.log('Note: Using mock data. Connect Vercel backend for live Yelp data.');
        }
    }

    /**
     * Cache DOM element references
     */
    function cacheElements() {
        elements = {
            btnSpin: document.getElementById('btnSpin'),
            btnLucky: document.getElementById('btnLucky'),
            btnSpinAgain: document.getElementById('btnSpinAgain'),
            btnRetry: document.getElementById('btnRetry'),
            btnFavorite: document.getElementById('btnFavorite'),
            btnClearHistory: document.getElementById('btnClearHistory'),
            btnClosePanel: document.getElementById('btnClosePanel'),
            soundToggle: document.getElementById('soundToggle'),
            tabFavorites: document.getElementById('tabFavorites'),
            tabHistory: document.getElementById('tabHistory'),
            restaurantCard: document.getElementById('restaurantCard'),
            mobilePanelModal: document.getElementById('mobilePanelModal'),
            favoritesList: document.getElementById('favoritesList'),
            historyList: document.getElementById('historyList')
        };
    }

    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Spin button
        if (elements.btnSpin) {
            elements.btnSpin.addEventListener('click', handleSpin);
        }

        // Feeling Lucky button
        if (elements.btnLucky) {
            elements.btnLucky.addEventListener('click', handleFeelingLucky);
        }

        // Spin Again button
        if (elements.btnSpinAgain) {
            elements.btnSpinAgain.addEventListener('click', handleSpin);
        }

        // Retry button
        if (elements.btnRetry) {
            elements.btnRetry.addEventListener('click', handleSpin);
        }

        // Favorite button
        if (elements.btnFavorite) {
            elements.btnFavorite.addEventListener('click', handleFavoriteToggle);
        }

        // Clear history button
        if (elements.btnClearHistory) {
            elements.btnClearHistory.addEventListener('click', handleClearHistory);
        }

        // Sound toggle
        if (elements.soundToggle) {
            elements.soundToggle.addEventListener('click', handleSoundToggle);
        }

        // Mobile tabs
        if (elements.tabFavorites) {
            elements.tabFavorites.addEventListener('click', () => UI.showMobilePanel('favorites'));
        }

        if (elements.tabHistory) {
            elements.tabHistory.addEventListener('click', () => UI.showMobilePanel('history'));
        }

        // Close mobile panel
        if (elements.btnClosePanel) {
            elements.btnClosePanel.addEventListener('click', UI.hideMobilePanel);
        }

        // Mobile panel backdrop click
        if (elements.mobilePanelModal) {
            elements.mobilePanelModal.querySelector('.mobile-panel-modal__backdrop')?.addEventListener('click', UI.hideMobilePanel);
        }

        // List item clicks (delegated)
        if (elements.favoritesList) {
            elements.favoritesList.addEventListener('click', handleListItemClick);
        }

        if (elements.historyList) {
            elements.historyList.addEventListener('click', handleListItemClick);
        }

        // Mobile panel list clicks (delegated)
        const mobilePanelBody = document.getElementById('mobilePanelBody');
        if (mobilePanelBody) {
            mobilePanelBody.addEventListener('click', handleListItemClick);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);

        // First interaction - preload audio
        document.addEventListener('click', handleFirstInteraction, { once: true });
        document.addEventListener('keydown', handleFirstInteraction, { once: true });
    }

    /**
     * Load initial UI state from storage
     */
    function loadInitialState() {
        // Sound state
        const soundEnabled = Storage.isSoundEnabled();
        if (elements.soundToggle) {
            elements.soundToggle.classList.toggle('muted', !soundEnabled);
        }

        // Restore last filters if available
        const lastFilters = Storage.getLastFilters();
        if (lastFilters) {
            SlotMachine.setFilters(lastFilters);
        }

        // Show empty state
        UI.showEmpty();
    }

    /**
     * Handle first user interaction - preload audio
     */
    function handleFirstInteraction() {
        Audio.preload();
    }

    /**
     * Handle spin button click
     */
    async function handleSpin() {
        if (SlotMachine.getIsSpinning()) return;

        // Disable buttons
        setButtonsDisabled(true);

        // Show loading
        UI.showLoading();

        // Play click sound
        Audio.playButtonClick();

        try {
            // Spin the reels
            const filters = await SlotMachine.spin();

            // Save filters
            currentFilters = filters;
            Storage.saveLastFilters(filters);

            // Fetch restaurant
            const result = await API.spinForRestaurant(filters);

            if (result.restaurant) {
                currentRestaurant = result.restaurant;

                // Show result
                UI.showResultCard(currentRestaurant);

                // Add to history
                Storage.addToHistory(currentRestaurant, filters);
                UI.updatePanels();
            } else {
                UI.showError(CONFIG.MESSAGES.NO_RESULTS);
            }

        } catch (error) {
            console.error('Spin error:', error);
            UI.showError(CONFIG.MESSAGES.API_ERROR);
        } finally {
            setButtonsDisabled(false);
        }
    }

    /**
     * Handle Feeling Lucky button click
     */
    async function handleFeelingLucky() {
        if (SlotMachine.getIsSpinning()) return;

        // Disable buttons
        setButtonsDisabled(true);

        // Show loading
        UI.showLoading();

        // Play click sound
        Audio.playButtonClick();

        try {
            // Spin with all reels unlocked
            const filters = await SlotMachine.spinFeelingLucky();

            // Save filters
            currentFilters = filters;
            Storage.saveLastFilters(filters);

            // Fetch restaurant
            const result = await API.spinForRestaurant(filters);

            if (result.restaurant) {
                currentRestaurant = result.restaurant;

                // Show result
                UI.showResultCard(currentRestaurant);

                // Add to history
                Storage.addToHistory(currentRestaurant, filters);
                UI.updatePanels();
            } else {
                UI.showError(CONFIG.MESSAGES.NO_RESULTS);
            }

        } catch (error) {
            console.error('Feeling Lucky error:', error);
            UI.showError(CONFIG.MESSAGES.API_ERROR);
        } finally {
            setButtonsDisabled(false);
        }
    }

    /**
     * Handle favorite toggle
     */
    function handleFavoriteToggle() {
        if (!currentRestaurant) return;

        Audio.playButtonClick();

        const isFav = Storage.isFavorite(currentRestaurant.id);

        if (isFav) {
            Storage.removeFavorite(currentRestaurant.id);
            UI.showToast(CONFIG.MESSAGES.REMOVED_FROM_FAVORITES, 'info');
        } else {
            Storage.addFavorite(currentRestaurant);
            UI.showToast(CONFIG.MESSAGES.ADDED_TO_FAVORITES, 'success');
        }

        // Update UI
        UI.updateFavoriteButton(currentRestaurant.id);
        UI.updatePanels();
    }

    /**
     * Handle clear history
     */
    function handleClearHistory() {
        Audio.playButtonClick();
        Storage.clearHistory();
        UI.updatePanels();
        UI.showToast(CONFIG.MESSAGES.HISTORY_CLEARED, 'info');
    }

    /**
     * Handle sound toggle
     */
    function handleSoundToggle() {
        const newState = Audio.toggle();
        elements.soundToggle.classList.toggle('muted', !newState);
    }

    /**
     * Handle list item click (delegated)
     */
    function handleListItemClick(event) {
        const listItem = event.target.closest('.list-item');
        const removeBtn = event.target.closest('[data-action="remove-favorite"]');

        if (removeBtn) {
            // Handle remove button
            event.stopPropagation();
            const id = removeBtn.dataset.id;
            Storage.removeFavorite(id);
            UI.updatePanels();
            UI.showToast(CONFIG.MESSAGES.REMOVED_FROM_FAVORITES, 'info');

            // Also update mobile panel if open
            const mobilePanelBody = document.getElementById('mobilePanelBody');
            if (mobilePanelBody && !elements.mobilePanelModal.hidden) {
                UI.showMobilePanel('favorites');
            }
            return;
        }

        if (listItem && !listItem.classList.contains('list-item--empty')) {
            // Handle item click - could open details or set as current
            Audio.playButtonClick();
            const id = listItem.dataset.id;

            // Find restaurant in favorites or history
            const favorites = Storage.getFavorites();
            const history = Storage.getHistory();

            let restaurant = favorites.find(f => f.id === id);
            if (!restaurant) {
                const historyEntry = history.find(h => h.restaurant.id === id);
                restaurant = historyEntry?.restaurant;
            }

            if (restaurant) {
                currentRestaurant = restaurant;
                UI.showResultCard(restaurant);
                UI.hideMobilePanel();
            }
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboard(event) {
        // Space to spin (when not in input)
        if (event.code === 'Space' && !isInputFocused()) {
            event.preventDefault();
            handleSpin();
        }

        // Escape to close mobile panel
        if (event.code === 'Escape') {
            UI.hideMobilePanel();
        }

        // L to toggle lucky mode
        if (event.code === 'KeyL' && !isInputFocused()) {
            handleFeelingLucky();
        }

        // M to toggle sound
        if (event.code === 'KeyM' && !isInputFocused()) {
            handleSoundToggle();
        }
    }

    /**
     * Check if an input element is focused
     */
    function isInputFocused() {
        const active = document.activeElement;
        return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
    }

    /**
     * Set buttons disabled state
     */
    function setButtonsDisabled(disabled) {
        if (elements.btnSpin) elements.btnSpin.disabled = disabled;
        if (elements.btnLucky) elements.btnLucky.disabled = disabled;
        if (elements.btnSpinAgain) elements.btnSpinAgain.disabled = disabled;
    }

    /**
     * Get current restaurant
     */
    function getCurrentRestaurant() {
        return currentRestaurant;
    }

    /**
     * Get current filters
     */
    function getCurrentFilters() {
        return currentFilters;
    }

    // ============ EXPORT ============

    return {
        init,
        getCurrentRestaurant,
        getCurrentFilters,
        handleSpin,
        handleFeelingLucky
    };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.FoodRouletteApp.init);
} else {
    window.FoodRouletteApp.init();
}
