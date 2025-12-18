/**
 * Miami Food Roulette - Audio Module
 * Handles sound effects for the slot machine
 */

window.FoodRouletteAudio = (function() {
    const CONFIG = window.FoodRouletteConfig;
    const Storage = window.FoodRouletteStorage;

    // Audio elements cache
    const sounds = {
        spin: null,
        stop: null,
        winner: null,
        click: null,
        lock: null
    };

    // State
    let isInitialized = false;
    let isEnabled = true;
    let volume = 0.5;

    /**
     * Initialize audio module
     * Must be called after user interaction (browser autoplay policy)
     */
    function init() {
        if (isInitialized) return;

        // Load preferences
        isEnabled = Storage.isSoundEnabled();
        volume = Storage.getVolume();

        // Create audio elements
        Object.keys(sounds).forEach(key => {
            sounds[key] = createAudioElement(CONFIG.SOUNDS[key.toUpperCase()]);
        });

        isInitialized = true;
        console.log('Audio: Initialized');
    }

    /**
     * Create an audio element with fallback
     */
    function createAudioElement(src) {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = volume;

        // Try to load the audio file
        audio.src = src;

        // Handle load errors gracefully
        audio.addEventListener('error', () => {
            console.warn(`Audio: Failed to load ${src}`);
        });

        return audio;
    }

    /**
     * Play a sound by name
     * @param {string} soundName - Name of sound (spin, stop, winner, click, lock)
     */
    function play(soundName) {
        if (!isEnabled || !isInitialized) return;

        const audio = sounds[soundName];
        if (!audio) {
            console.warn(`Audio: Unknown sound "${soundName}"`);
            return;
        }

        try {
            // Reset to beginning if already playing
            audio.currentTime = 0;
            audio.volume = volume;

            // Play with promise handling
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Ignore autoplay errors - common in browsers
                    if (error.name !== 'NotAllowedError') {
                        console.warn(`Audio: Playback failed for ${soundName}`, error);
                    }
                });
            }
        } catch (error) {
            console.warn(`Audio: Error playing ${soundName}`, error);
        }
    }

    /**
     * Stop a specific sound
     */
    function stop(soundName) {
        const audio = sounds[soundName];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    /**
     * Stop all sounds
     */
    function stopAll() {
        Object.values(sounds).forEach(audio => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }

    /**
     * Play spin start sound
     */
    function playSpinStart() {
        play('spin');
    }

    /**
     * Play reel stop sound
     */
    function playReelStop() {
        play('stop');
    }

    /**
     * Play winner fanfare
     */
    function playWinnerFanfare() {
        stop('spin'); // Stop spinning sound
        play('winner');
    }

    /**
     * Play button click sound
     */
    function playButtonClick() {
        play('click');
    }

    /**
     * Play lock toggle sound
     */
    function playLockToggle() {
        play('lock');
    }

    /**
     * Set volume for all sounds
     * @param {number} level - Volume level 0-1
     */
    function setVolume(level) {
        volume = Math.max(0, Math.min(1, level));
        Storage.setVolume(volume);

        Object.values(sounds).forEach(audio => {
            if (audio) {
                audio.volume = volume;
            }
        });
    }

    /**
     * Get current volume
     * @returns {number}
     */
    function getVolume() {
        return volume;
    }

    /**
     * Enable or disable all sounds
     * @param {boolean} enabled
     */
    function setEnabled(enabled) {
        isEnabled = enabled;
        Storage.setSoundEnabled(enabled);

        if (!enabled) {
            stopAll();
        }
    }

    /**
     * Check if sounds are enabled
     * @returns {boolean}
     */
    function isAudioEnabled() {
        return isEnabled;
    }

    /**
     * Toggle sound on/off
     * @returns {boolean} New enabled state
     */
    function toggle() {
        setEnabled(!isEnabled);
        return isEnabled;
    }

    /**
     * Preload all sounds (call on first user interaction)
     */
    function preload() {
        if (!isInitialized) {
            init();
        }

        // Touch all audio elements to trigger loading
        Object.values(sounds).forEach(audio => {
            if (audio) {
                audio.load();
            }
        });
    }

    // ============ EXPORT ============

    return {
        init,
        preload,
        play,
        stop,
        stopAll,
        playSpinStart,
        playReelStop,
        playWinnerFanfare,
        playButtonClick,
        playLockToggle,
        setVolume,
        getVolume,
        setEnabled,
        isEnabled: isAudioEnabled,
        toggle
    };
})();
