/**
 * Miami Food Roulette - Slot Machine Module
 * Orchestrates the slot machine behavior with three reels
 */

window.FoodRouletteSlotMachine = (function() {
    const CONFIG = window.FoodRouletteConfig;
    const Reel = window.FoodRouletteReel;
    const Audio = window.FoodRouletteAudio;

    // Reel instances
    const reels = {
        cuisine: null,
        neighborhood: null,
        price: null
    };

    // State
    let isSpinning = false;
    let onSpinCompleteCallback = null;

    /**
     * Initialize the slot machine
     * @param {Object} elements - DOM element references
     */
    function init(elements) {
        // Create cuisine reel
        reels.cuisine = new Reel(
            elements.cuisineReel,
            CONFIG.CUISINES.map(c => ({
                id: c.id,
                label: c.label,
                icon: c.icon
            }))
        );

        // Create neighborhood reel
        reels.neighborhood = new Reel(
            elements.neighborhoodReel,
            CONFIG.NEIGHBORHOODS.map(n => ({
                id: n.id,
                label: n.label,
                icon: '📍'
            }))
        );

        // Create price reel
        reels.price = new Reel(
            elements.priceReel,
            CONFIG.PRICE_RANGES.map(p => ({
                id: p.id,
                label: p.label,
                icon: p.icon
            }))
        );

        console.log('Slot Machine: Initialized');
    }

    /**
     * Spin all unlocked reels
     * @returns {Promise<Object>} Final filter values
     */
    async function spin() {
        if (isSpinning) {
            return getFilters();
        }

        isSpinning = true;

        // Play spin sound
        Audio.playSpinStart();

        // Spin each unlocked reel with staggered timing
        const spinPromises = [];
        const reelOrder = ['cuisine', 'neighborhood', 'price'];
        const delay = CONFIG.ANIMATION.REEL_STOP_DELAY;

        for (let i = 0; i < reelOrder.length; i++) {
            const reelName = reelOrder[i];
            const reel = reels[reelName];

            if (!reel.getIsLocked()) {
                // Add delay for sequential stopping
                const spinPromise = new Promise(async (resolve) => {
                    await sleep(i * delay);
                    const result = await reel.spin();
                    resolve({ reel: reelName, result });
                });
                spinPromises.push(spinPromise);
            }
        }

        // Wait for all spins to complete
        await Promise.all(spinPromises);

        isSpinning = false;

        // Stop spin sound and play winner
        Audio.stopAll();
        Audio.playWinnerFanfare();

        // Get final values
        const filters = getFilters();

        // Trigger callback
        if (onSpinCompleteCallback) {
            onSpinCompleteCallback(filters);
        }

        return filters;
    }

    /**
     * Feeling Lucky - unlock all and spin
     * @returns {Promise<Object>} Final filter values
     */
    async function spinFeelingLucky() {
        // Unlock all reels
        Object.values(reels).forEach(reel => reel.unlock());

        // Spin
        return spin();
    }

    /**
     * Get current filter values from all reels
     * @returns {Object} Filter values
     */
    function getFilters() {
        return {
            cuisine: reels.cuisine.getCurrentValue().id,
            neighborhood: reels.neighborhood.getCurrentValue().id,
            price: reels.price.getCurrentValue().id
        };
    }

    /**
     * Get current values with full item details
     * @returns {Object} Full item details for each reel
     */
    function getFilterDetails() {
        return {
            cuisine: reels.cuisine.getCurrentValue(),
            neighborhood: reels.neighborhood.getCurrentValue(),
            price: reels.price.getCurrentValue()
        };
    }

    /**
     * Set reel values programmatically
     * @param {Object} filters - Filter values to set
     */
    function setFilters(filters) {
        if (filters.cuisine && reels.cuisine) {
            reels.cuisine.setById(filters.cuisine);
        }
        if (filters.neighborhood && reels.neighborhood) {
            reels.neighborhood.setById(filters.neighborhood);
        }
        if (filters.price && reels.price) {
            reels.price.setById(filters.price);
        }
    }

    /**
     * Lock a specific reel
     * @param {string} reelName - Name of reel (cuisine, neighborhood, price)
     */
    function lockReel(reelName) {
        if (reels[reelName]) {
            reels[reelName].lock();
        }
    }

    /**
     * Unlock a specific reel
     * @param {string} reelName - Name of reel
     */
    function unlockReel(reelName) {
        if (reels[reelName]) {
            reels[reelName].unlock();
        }
    }

    /**
     * Unlock all reels
     */
    function unlockAll() {
        Object.values(reels).forEach(reel => reel.unlock());
    }

    /**
     * Get lock states for all reels
     * @returns {Object} Lock states
     */
    function getLockStates() {
        return {
            cuisine: reels.cuisine?.getIsLocked() || false,
            neighborhood: reels.neighborhood?.getIsLocked() || false,
            price: reels.price?.getIsLocked() || false
        };
    }

    /**
     * Check if any reel is spinning
     * @returns {boolean}
     */
    function getIsSpinning() {
        return isSpinning;
    }

    /**
     * Register callback for spin completion
     * @param {Function} callback - Function to call with filter results
     */
    function onSpinComplete(callback) {
        onSpinCompleteCallback = callback;
    }

    /**
     * Get a specific reel instance
     * @param {string} reelName - Name of reel
     * @returns {Reel}
     */
    function getReel(reelName) {
        return reels[reelName];
    }

    /**
     * Helper: Sleep for given milliseconds
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ============ EXPORT ============

    return {
        init,
        spin,
        spinFeelingLucky,
        getFilters,
        getFilterDetails,
        setFilters,
        lockReel,
        unlockReel,
        unlockAll,
        getLockStates,
        getIsSpinning,
        onSpinComplete,
        getReel
    };
})();
