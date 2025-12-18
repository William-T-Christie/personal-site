/**
 * Miami Food Roulette - UI Module
 * Handles all UI updates, modals, cards, and toasts
 */

window.FoodRouletteUI = (function() {
    const CONFIG = window.FoodRouletteConfig;
    const Storage = window.FoodRouletteStorage;

    // DOM Element cache
    let elements = {};

    /**
     * Initialize UI module with DOM references
     */
    function init() {
        elements = {
            // Result area
            resultArea: document.getElementById('resultArea'),
            resultLoading: document.getElementById('resultLoading'),
            resultError: document.getElementById('resultError'),
            resultEmpty: document.getElementById('resultEmpty'),
            restaurantCard: document.getElementById('restaurantCard'),

            // Restaurant card elements
            restaurantImage: document.querySelector('.restaurant-card__image'),
            restaurantName: document.getElementById('restaurantName'),
            restaurantStars: document.getElementById('restaurantStars'),
            restaurantReviews: document.getElementById('restaurantReviews'),
            restaurantPrice: document.getElementById('restaurantPrice'),
            restaurantCuisine: document.getElementById('restaurantCuisine'),
            restaurantAddress: document.getElementById('restaurantAddress'),
            openBadge: document.getElementById('openBadge'),
            btnFavorite: document.getElementById('btnFavorite'),
            btnDirections: document.getElementById('btnDirections'),
            btnYelp: document.getElementById('btnYelp'),

            // Panels
            favoritesList: document.getElementById('favoritesList'),
            favoritesCount: document.getElementById('favoritesCount'),
            historyList: document.getElementById('historyList'),

            // Mobile panel modal
            mobilePanelModal: document.getElementById('mobilePanelModal'),
            mobilePanelTitle: document.getElementById('mobilePanelTitle'),
            mobilePanelBody: document.getElementById('mobilePanelBody'),

            // Toast
            toastContainer: document.getElementById('toastContainer'),

            // Loading text
            loadingText: document.querySelector('.loading-text'),
            errorText: document.querySelector('.error-text')
        };

        console.log('UI: Initialized');
    }

    // ============ RESULT STATES ============

    /**
     * Show loading state
     */
    function showLoading() {
        hideAllResultStates();
        elements.resultLoading.hidden = false;

        // Show random loading message
        if (elements.loadingText) {
            elements.loadingText.textContent = CONFIG.getRandomLoadingMessage();
        }
    }

    /**
     * Hide loading state
     */
    function hideLoading() {
        elements.resultLoading.hidden = true;
    }

    /**
     * Show error state
     * @param {string} message - Error message to display
     */
    function showError(message) {
        hideAllResultStates();
        elements.resultError.hidden = false;

        if (elements.errorText) {
            elements.errorText.textContent = message || CONFIG.MESSAGES.API_ERROR;
        }
    }

    /**
     * Show empty/initial state
     */
    function showEmpty() {
        hideAllResultStates();
        elements.resultEmpty.hidden = false;
    }

    /**
     * Hide all result states
     */
    function hideAllResultStates() {
        elements.resultLoading.hidden = true;
        elements.resultError.hidden = true;
        elements.resultEmpty.hidden = true;
        elements.restaurantCard.hidden = true;
    }

    // ============ RESTAURANT CARD ============

    /**
     * Show restaurant result card
     * @param {Object} restaurant - Restaurant data
     */
    function showResultCard(restaurant) {
        hideAllResultStates();

        // Populate card data
        if (elements.restaurantImage) {
            elements.restaurantImage.src = restaurant.image || '';
            elements.restaurantImage.alt = restaurant.name;
        }

        if (elements.restaurantName) {
            elements.restaurantName.textContent = restaurant.name;
        }

        if (elements.restaurantStars) {
            elements.restaurantStars.innerHTML = createStarRating(restaurant.rating);
        }

        if (elements.restaurantReviews) {
            elements.restaurantReviews.textContent = `(${formatNumber(restaurant.reviewCount)} reviews)`;
        }

        if (elements.restaurantPrice) {
            elements.restaurantPrice.textContent = restaurant.price || '$$';
        }

        if (elements.restaurantCuisine) {
            const cuisines = restaurant.categories?.slice(0, 3).join(', ') || '';
            elements.restaurantCuisine.textContent = cuisines;
        }

        if (elements.restaurantAddress) {
            elements.restaurantAddress.textContent = restaurant.address || '';
        }

        // Open/Closed badge
        if (elements.openBadge) {
            const isOpen = restaurant.isOpenNow !== false;
            elements.openBadge.textContent = isOpen ? 'Open Now' : 'Closed';
            elements.openBadge.classList.toggle('closed', !isOpen);
        }

        // Favorite button state
        updateFavoriteButton(restaurant.id);

        // Set action button URLs
        if (elements.btnDirections && restaurant.coordinates) {
            const { latitude, longitude } = restaurant.coordinates;
            elements.btnDirections.href = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        }

        if (elements.btnYelp) {
            elements.btnYelp.href = restaurant.yelpUrl || '#';
        }

        // Store current restaurant ID for favorite toggle
        elements.restaurantCard.dataset.restaurantId = restaurant.id;

        // Show the card
        elements.restaurantCard.hidden = false;
    }

    /**
     * Hide restaurant card
     */
    function hideResultCard() {
        elements.restaurantCard.hidden = true;
    }

    /**
     * Update favorite button state
     * @param {string} restaurantId - Restaurant ID
     */
    function updateFavoriteButton(restaurantId) {
        if (!elements.btnFavorite) return;

        const isFav = Storage.isFavorite(restaurantId);
        elements.btnFavorite.classList.toggle('favorited', isFav);
        elements.btnFavorite.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');
    }

    /**
     * Create star rating HTML
     * @param {number} rating - Rating value (0-5)
     * @returns {string} HTML string
     */
    function createStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let html = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            html += '<svg class="star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        }

        // Half star
        if (hasHalfStar) {
            html += '<svg class="star star--half" viewBox="0 0 24 24"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="#E5D6C3"/></linearGradient></defs><path fill="url(#half)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            html += '<svg class="star star--empty" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        }

        return html;
    }

    // ============ PANELS ============

    /**
     * Render favorites list
     */
    function renderFavoritesList() {
        const favorites = Storage.getFavorites();

        // Update count
        if (elements.favoritesCount) {
            elements.favoritesCount.textContent = favorites.length;
        }

        // Render list
        if (elements.favoritesList) {
            if (favorites.length === 0) {
                elements.favoritesList.innerHTML = '<li class="list-item list-item--empty">No favorites yet. Spin to find some!</li>';
            } else {
                elements.favoritesList.innerHTML = favorites.map(fav => createListItemHTML(fav, 'favorite')).join('');
            }
        }
    }

    /**
     * Render history list
     */
    function renderHistoryList() {
        const history = Storage.getHistory();

        if (elements.historyList) {
            if (history.length === 0) {
                elements.historyList.innerHTML = '<li class="list-item list-item--empty">No spin history yet.</li>';
            } else {
                elements.historyList.innerHTML = history.map(entry => createListItemHTML(entry.restaurant, 'history', entry.timestamp)).join('');
            }
        }
    }

    /**
     * Create list item HTML
     * @param {Object} restaurant - Restaurant data
     * @param {string} type - 'favorite' or 'history'
     * @param {string} timestamp - ISO timestamp (optional)
     * @returns {string} HTML string
     */
    function createListItemHTML(restaurant, type, timestamp) {
        const timeAgo = timestamp ? formatTimeAgo(new Date(timestamp)) : '';

        return `
            <li class="list-item" data-id="${restaurant.id}" data-type="${type}">
                <img class="list-item__image" src="${restaurant.image}" alt="${restaurant.name}" loading="lazy">
                <div class="list-item__info">
                    <span class="list-item__name">${restaurant.name}</span>
                    <span class="list-item__meta">${restaurant.price || '$$'} ${timeAgo ? '• ' + timeAgo : ''}</span>
                </div>
                ${type === 'favorite' ? `
                    <button class="list-item__remove" data-action="remove-favorite" data-id="${restaurant.id}" aria-label="Remove from favorites">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                ` : ''}
            </li>
        `;
    }

    /**
     * Update both panels
     */
    function updatePanels() {
        renderFavoritesList();
        renderHistoryList();
    }

    // ============ MOBILE PANEL MODAL ============

    /**
     * Show mobile panel modal
     * @param {string} type - 'favorites' or 'history'
     */
    function showMobilePanel(type) {
        if (!elements.mobilePanelModal) return;

        const title = type === 'favorites' ? 'Favorites' : 'Recent Spins';
        const content = type === 'favorites'
            ? elements.favoritesList?.innerHTML || ''
            : elements.historyList?.innerHTML || '';

        elements.mobilePanelTitle.textContent = title;
        elements.mobilePanelBody.innerHTML = `<ul class="panel__list">${content}</ul>`;

        elements.mobilePanelModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hide mobile panel modal
     */
    function hideMobilePanel() {
        if (!elements.mobilePanelModal) return;

        elements.mobilePanelModal.hidden = true;
        document.body.style.overflow = '';
    }

    // ============ TOASTS ============

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - 'success', 'error', or 'info'
     * @param {number} duration - Duration in ms (default 3000)
     */
    function showToast(message, type = 'info', duration = 3000) {
        if (!elements.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;

        elements.toastContainer.appendChild(toast);

        // Auto-remove
        setTimeout(() => {
            toast.classList.add('toast--exiting');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }

    // ============ HELPERS ============

    /**
     * Format number with commas
     * @param {number} num
     * @returns {string}
     */
    function formatNumber(num) {
        if (!num) return '0';
        return num.toLocaleString();
    }

    /**
     * Format time ago string
     * @param {Date} date
     * @returns {string}
     */
    function formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    }

    /**
     * Format price level
     * @param {string|number} price
     * @returns {string}
     */
    function formatPriceLevel(price) {
        if (typeof price === 'number') {
            return '$'.repeat(price);
        }
        return price || '$$';
    }

    // ============ EXPORT ============

    return {
        init,

        // Result states
        showLoading,
        hideLoading,
        showError,
        showEmpty,
        hideAllResultStates,

        // Restaurant card
        showResultCard,
        hideResultCard,
        updateFavoriteButton,
        createStarRating,

        // Panels
        renderFavoritesList,
        renderHistoryList,
        updatePanels,

        // Mobile modal
        showMobilePanel,
        hideMobilePanel,

        // Toast
        showToast,

        // Helpers
        formatNumber,
        formatTimeAgo,
        formatPriceLevel
    };
})();
