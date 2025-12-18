/**
 * Reel-to-Reel Player UI Controller
 * Handles animations and visual feedback
 */

class ReelPlayer {
    constructor() {
        this.playerEl = document.querySelector('.tascam-player');
        this.reelLeft = document.getElementById('reel-left');
        this.reelRight = document.getElementById('reel-right');
        this.counterDigits = document.getElementById('counter-digits');
        this.needleLeft = document.getElementById('needle-left');
        this.needleRight = document.getElementById('needle-right');
        this.isPlaying = false;
        this.counter = 0;
        this.counterInterval = null;
    }

    /**
     * Set playing state and animate reels
     */
    setPlaying(playing) {
        this.isPlaying = playing;

        if (playing) {
            this.playerEl.classList.add('playing');
            this.playerEl.classList.remove('rewinding', 'fast-forward');
            this.startCounter();
        } else {
            this.playerEl.classList.remove('playing');
            this.stopCounter();
        }
    }

    /**
     * Set rewinding state
     */
    setRewinding(rewinding) {
        if (rewinding) {
            this.playerEl.classList.add('rewinding');
            this.playerEl.classList.remove('playing', 'fast-forward');
            this.rewindCounter();
        } else {
            this.playerEl.classList.remove('rewinding');
        }
    }

    /**
     * Set fast-forward state
     */
    setFastForward(fastForward) {
        if (fastForward) {
            this.playerEl.classList.add('fast-forward');
            this.playerEl.classList.remove('playing', 'rewinding');
            this.fastForwardCounter();
        } else {
            this.playerEl.classList.remove('fast-forward');
        }
    }

    /**
     * Stop all animations
     */
    stop() {
        this.playerEl.classList.remove('playing', 'rewinding', 'fast-forward');
        this.isPlaying = false;
        this.stopCounter();
    }

    /**
     * Reset counter to 00:00
     */
    resetCounter() {
        this.counter = 0;
        this.updateCounterDisplay();
    }

    /**
     * Start counter increment
     */
    startCounter() {
        this.stopCounter();
        this.counterInterval = setInterval(() => {
            this.counter = (this.counter + 1) % 6000; // Max 99:59
            this.updateCounterDisplay();
        }, 1000);
    }

    /**
     * Rewind counter (fast decrement)
     */
    rewindCounter() {
        this.stopCounter();
        this.counterInterval = setInterval(() => {
            this.counter = Math.max(0, this.counter - 5);
            this.updateCounterDisplay();
            if (this.counter === 0) {
                this.setRewinding(false);
            }
        }, 50);
    }

    /**
     * Fast forward counter
     */
    fastForwardCounter() {
        this.stopCounter();
        this.counterInterval = setInterval(() => {
            this.counter = (this.counter + 5) % 6000;
            this.updateCounterDisplay();
        }, 50);
    }

    /**
     * Stop counter interval
     */
    stopCounter() {
        if (this.counterInterval) {
            clearInterval(this.counterInterval);
            this.counterInterval = null;
        }
    }

    /**
     * Update counter display digits (MM:SS.FF format)
     */
    updateCounterDisplay() {
        const minutes = Math.floor(this.counter / 60);
        const seconds = this.counter % 60;
        const frames = Math.floor(Math.random() * 30); // Simulated frames

        const digits = this.counterDigits.querySelectorAll('.led-digit');
        if (digits.length >= 6) {
            digits[0].textContent = Math.floor(minutes / 10);
            digits[1].textContent = minutes % 10;
            digits[2].textContent = Math.floor(seconds / 10);
            digits[3].textContent = seconds % 10;
            digits[4].textContent = Math.floor(frames / 10);
            digits[5].textContent = frames % 10;
        }
    }

    /**
     * Animate eject (new affirmation)
     */
    async animateEject() {
        // Stop any current animation
        this.stop();

        // Add eject animation
        this.playerEl.style.transform = 'scale(0.98)';
        this.playerEl.style.opacity = '0.9';

        await this.delay(150);

        // Reset
        this.playerEl.style.transform = '';
        this.playerEl.style.opacity = '';

        // Reset counter
        this.resetCounter();
    }

    /**
     * Helper delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Update playback progress (called from Spotify)
     */
    onPlaybackUpdate(data) {
        if (data && data.isPaused !== undefined) {
            this.setPlaying(!data.isPaused);
        }
    }
}

// Create global instance (keeping old name for compatibility)
window.CassettePlayer = new ReelPlayer();
window.ReelPlayer = window.CassettePlayer;
