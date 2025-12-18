/**
 * Miami Food Roulette - Reel Module
 * Handles individual slot machine reel logic and animation
 */

window.FoodRouletteReel = (function() {
    const CONFIG = window.FoodRouletteConfig;
    const Audio = window.FoodRouletteAudio;

    /**
     * Reel Class
     * Represents a single slot machine reel
     */
    class Reel {
        /**
         * Create a new Reel
         * @param {HTMLElement} element - The reel container element
         * @param {Array} items - Array of items {id, label, icon}
         * @param {Object} options - Configuration options
         */
        constructor(element, items, options = {}) {
            this.element = element;
            this.items = items;
            this.options = {
                itemHeight: options.itemHeight || 70,
                spinDuration: options.spinDuration || CONFIG.ANIMATION.SPIN_DURATION,
                fullRotations: options.fullRotations || CONFIG.ANIMATION.FULL_ROTATIONS,
                ...options
            };

            // State
            this.currentIndex = 0;
            this.isLocked = false;
            this.isSpinning = false;

            // DOM references
            this.strip = element.querySelector('.reel__strip');
            this.lockBtn = element.querySelector('.reel__lock-btn');
            this.window = element.querySelector('.reel__window');

            // Initialize
            this.render();
            this.setupEventListeners();
        }

        /**
         * Render the reel strip with items
         */
        render() {
            // Clear existing content
            this.strip.innerHTML = '';

            // Calculate item height from CSS variable or default
            const computedStyle = getComputedStyle(this.window);
            this.options.itemHeight = parseInt(computedStyle.getPropertyValue('--reel-item-height')) || this.options.itemHeight;

            // Create enough items for smooth animation
            // We need original items + copies for seamless looping
            const itemsToRender = [...this.items, ...this.items, ...this.items];

            itemsToRender.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'reel__item';
                itemEl.dataset.index = index % this.items.length;
                itemEl.dataset.id = item.id;

                itemEl.innerHTML = `
                    <span class="reel__item-icon">${item.icon}</span>
                    <span class="reel__item-label">${item.label}</span>
                `;

                this.strip.appendChild(itemEl);
            });

            // Set initial position to show first item in center
            this.setPosition(this.items.length);
        }

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            if (this.lockBtn) {
                this.lockBtn.addEventListener('click', () => {
                    this.toggleLock();
                });
            }
        }

        /**
         * Set the strip position
         * @param {number} index - Item index to show
         */
        setPosition(index) {
            const offset = index * this.options.itemHeight;
            this.strip.style.transform = `translateY(-${offset}px)`;
        }

        /**
         * Spin the reel to a random target
         * @param {number} targetIndex - Index to land on (optional)
         * @returns {Promise} Resolves when spin is complete
         */
        spin(targetIndex = null) {
            return new Promise((resolve) => {
                if (this.isSpinning || this.isLocked) {
                    resolve(this.getCurrentValue());
                    return;
                }

                this.isSpinning = true;
                this.element.classList.add('reel--spinning');

                // Determine target index
                if (targetIndex === null) {
                    targetIndex = Math.floor(Math.random() * this.items.length);
                }

                // Calculate the animation
                const currentPos = this.items.length; // Start from middle set
                const rotations = this.options.fullRotations;
                const totalItems = this.items.length;

                // Target position: several full rotations + final position
                const targetPos = currentPos + (rotations * totalItems) + targetIndex;
                const targetOffset = targetPos * this.options.itemHeight;

                // Remove transition for reset, then add for spin
                this.strip.style.transition = 'none';
                this.setPosition(currentPos);

                // Force reflow
                this.strip.offsetHeight;

                // Apply spin animation
                this.strip.style.transition = `transform ${this.options.spinDuration}ms ${CONFIG.ANIMATION.EASE_FUNCTION}`;
                this.strip.style.transform = `translateY(-${targetOffset}px)`;

                // Handle animation end
                const onEnd = () => {
                    this.strip.removeEventListener('transitionend', onEnd);
                    this.isSpinning = false;
                    this.element.classList.remove('reel--spinning');

                    // Update current index
                    this.currentIndex = targetIndex;

                    // Reset position to middle set (for seamless future spins)
                    this.strip.style.transition = 'none';
                    this.setPosition(this.items.length + targetIndex);

                    // Play stop sound
                    Audio.playReelStop();

                    resolve(this.getCurrentValue());
                };

                this.strip.addEventListener('transitionend', onEnd);

                // Fallback timeout in case transitionend doesn't fire
                setTimeout(() => {
                    if (this.isSpinning) {
                        onEnd();
                    }
                }, this.options.spinDuration + 100);
            });
        }

        /**
         * Stop the reel at current position
         */
        stop() {
            if (!this.isSpinning) return;

            // Get current transform value
            const style = getComputedStyle(this.strip);
            const matrix = new DOMMatrixReadOnly(style.transform);
            const currentY = Math.abs(matrix.m42);

            // Calculate nearest item
            const nearestIndex = Math.round(currentY / this.options.itemHeight);
            this.currentIndex = nearestIndex % this.items.length;

            // Stop animation
            this.strip.style.transition = 'none';
            this.setPosition(nearestIndex);

            this.isSpinning = false;
            this.element.classList.remove('reel--spinning');
        }

        /**
         * Lock the reel at current position
         */
        lock() {
            if (this.isSpinning) return;

            this.isLocked = true;
            this.element.classList.add('reel--locked');
            if (this.lockBtn) {
                this.lockBtn.classList.add('locked');
            }

            Audio.playLockToggle();
        }

        /**
         * Unlock the reel
         */
        unlock() {
            this.isLocked = false;
            this.element.classList.remove('reel--locked');
            if (this.lockBtn) {
                this.lockBtn.classList.remove('locked');
            }

            Audio.playLockToggle();
        }

        /**
         * Toggle lock state
         */
        toggleLock() {
            if (this.isSpinning) return;

            if (this.isLocked) {
                this.unlock();
            } else {
                this.lock();
            }
        }

        /**
         * Get the current value
         * @returns {Object} Current item object
         */
        getCurrentValue() {
            return this.items[this.currentIndex];
        }

        /**
         * Get current index
         * @returns {number}
         */
        getCurrentIndex() {
            return this.currentIndex;
        }

        /**
         * Check if reel is locked
         * @returns {boolean}
         */
        getIsLocked() {
            return this.isLocked;
        }

        /**
         * Check if reel is spinning
         * @returns {boolean}
         */
        getIsSpinning() {
            return this.isSpinning;
        }

        /**
         * Set the reel to a specific item
         * @param {number} index - Item index
         */
        setIndex(index) {
            if (this.isSpinning) return;

            this.currentIndex = index;
            this.strip.style.transition = 'transform 0.3s ease';
            this.setPosition(this.items.length + index);
        }

        /**
         * Set by item ID
         * @param {string} id - Item ID
         */
        setById(id) {
            const index = this.items.findIndex(item => item.id === id);
            if (index !== -1) {
                this.setIndex(index);
            }
        }

        /**
         * Get all items
         * @returns {Array}
         */
        getItems() {
            return this.items;
        }

        /**
         * Update items and re-render
         * @param {Array} newItems - New items array
         */
        setItems(newItems) {
            this.items = newItems;
            this.currentIndex = 0;
            this.render();
        }
    }

    // ============ EXPORT ============

    return Reel;
})();
