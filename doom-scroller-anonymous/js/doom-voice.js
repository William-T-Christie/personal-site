/**
 * DOOM SCROLLER ANONYMOUS - DOOM Voice Module
 * Pre-generated audio stitching system for authentic MF DOOM TTS
 */

window.DoomScrollerVoice = (function() {
    'use strict';

    const Config = window.DoomScrollerConfig;

    // Audio context for stitching
    let audioContext = null;
    let masterGain = null;

    // Audio cache
    const audioCache = new Map();
    const loadingPromises = new Map();

    // State
    let isPlaying = false;
    let isMuted = false;
    let currentSource = null;
    let playbackQueue = [];

    // Callbacks
    let onEndCallback = null;
    let onStartCallback = null;

    // Base path for audio files
    const AUDIO_BASE = 'assets/doom-audio';

    // ==========================================
    // INITIALIZATION
    // ==========================================

    function init() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);
        masterGain.gain.value = 1.0;

        console.log('[DoomVoice] Initialized');
        return true;
    }

    // ==========================================
    // AUDIO LOADING
    // ==========================================

    async function loadAudio(filename) {
        const path = `${AUDIO_BASE}/${filename}`;

        // Return cached audio if available
        if (audioCache.has(path)) {
            return audioCache.get(path);
        }

        // Return existing loading promise if in progress
        if (loadingPromises.has(path)) {
            return loadingPromises.get(path);
        }

        // Start loading
        const loadPromise = (async () => {
            try {
                const response = await fetch(path);
                if (!response.ok) {
                    console.warn(`[DoomVoice] Audio not found: ${path}`);
                    return null;
                }
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                audioCache.set(path, audioBuffer);
                return audioBuffer;
            } catch (error) {
                console.error(`[DoomVoice] Error loading ${path}:`, error);
                return null;
            } finally {
                loadingPromises.delete(path);
            }
        })();

        loadingPromises.set(path, loadPromise);
        return loadPromise;
    }

    async function preloadAudio(filenames) {
        const promises = filenames.map(f => loadAudio(f));
        return Promise.all(promises);
    }

    // ==========================================
    // TIME FORMATTING
    // ==========================================

    function getTimeFilename(minutes) {
        if (minutes < 60) {
            return `times/${minutes}-minute${minutes !== 1 ? 's' : ''}.mp3`;
        }

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (mins === 0) {
            return `times/${hours}-hour${hours !== 1 ? 's' : ''}.mp3`;
        }

        // Round to nearest 15 minutes for combined files
        const roundedMins = Math.round(mins / 15) * 15;
        if (roundedMins === 0) {
            return `times/${hours}-hour${hours !== 1 ? 's' : ''}.mp3`;
        }
        if (roundedMins === 60) {
            return `times/${hours + 1}-hour${hours + 1 !== 1 ? 's' : ''}.mp3`;
        }

        return `times/${hours}-hour${hours !== 1 ? 's' : ''}-${roundedMins}-minutes.mp3`;
    }

    function getAppFilename(appName) {
        const normalized = appName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `apps/${normalized}.mp3`;
    }

    // ==========================================
    // ROAST GENERATION
    // ==========================================

    /**
     * Build audio sequence for a complete roast
     * @param {Object} roastData - Contains opening, appRoasts, outro, closing
     * @param {number} totalMinutes - Total screen time in minutes
     * @param {Array} appData - Array of {app, minutes} objects
     */
    function buildRoastSequence(roastData, totalMinutes, appData) {
        const sequence = [];

        // Opening
        if (roastData.openingIndex !== undefined) {
            const idx = roastData.openingIndex + 1;
            sequence.push(`openings/opening-${idx}a.mp3`);
            sequence.push(getTimeFilename(totalMinutes));
            sequence.push(`openings/opening-${idx}b.mp3`);
        }

        // App roasts
        if (roastData.appRoasts && appData) {
            for (let i = 0; i < roastData.appRoasts.length && i < appData.length; i++) {
                const app = appData[i];
                const roastInfo = roastData.appRoasts[i];

                if (roastInfo.isGeneric) {
                    // Generic roast with app name insertion
                    sequence.push(getTimeFilename(app.minutes));
                    sequence.push(`roasts/generic-1b.mp3`);
                    sequence.push(getAppFilename(app.app));
                    sequence.push(`roasts/generic-1c.mp3`);
                } else {
                    // App-specific roast
                    const appKey = app.app.toLowerCase().replace(/[^a-z]/g, '');
                    sequence.push(`roasts/${appKey}-${roastInfo.variant}a.mp3`);
                    sequence.push(getTimeFilename(app.minutes));
                    sequence.push(`roasts/${appKey}-${roastInfo.variant}b.mp3`);
                }
            }
        }

        // Severity outro
        if (roastData.severity && roastData.outroVariant !== undefined) {
            const severity = roastData.severity.toLowerCase();
            sequence.push(`outros/${severity}-${roastData.outroVariant}a.mp3`);
            sequence.push(getTimeFilename(totalMinutes));
            sequence.push(`outros/${severity}-${roastData.outroVariant}b.mp3`);
        }

        // Closing
        if (roastData.closingIndex !== undefined) {
            sequence.push(`closings/closing-${roastData.closingIndex + 1}.mp3`);
        }

        return sequence;
    }

    // ==========================================
    // PLAYBACK
    // ==========================================

    async function playSequence(audioFiles, onWord, onEnd, onStart) {
        if (!audioContext) init();

        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        onEndCallback = onEnd;
        onStartCallback = onStart;

        // Load all audio files
        console.log('[DoomVoice] Loading audio sequence:', audioFiles);
        const buffers = await Promise.all(audioFiles.map(f => loadAudio(f)));

        // Filter out any failed loads
        const validBuffers = buffers.filter(b => b !== null);

        if (validBuffers.length === 0) {
            console.error('[DoomVoice] No valid audio files loaded');
            if (onEnd) onEnd();
            return false;
        }

        isPlaying = true;
        if (onStartCallback) onStartCallback();

        // Play buffers in sequence
        let currentTime = audioContext.currentTime;

        for (let i = 0; i < validBuffers.length; i++) {
            const buffer = validBuffers[i];
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(masterGain);

            // Schedule playback
            source.start(currentTime);
            currentTime += buffer.duration;

            // Small gap between segments for natural feel
            currentTime += 0.05;

            // Track the last source for stopping
            if (i === validBuffers.length - 1) {
                currentSource = source;
                source.onended = () => {
                    isPlaying = false;
                    console.log('[DoomVoice] Playback complete');
                    if (onEndCallback) onEndCallback();
                };
            }
        }

        // Trigger word callbacks at intervals for visual sync
        if (onWord) {
            let elapsed = 0;
            for (const buffer of validBuffers) {
                // Estimate words based on duration (roughly 2 words per second)
                const wordCount = Math.ceil(buffer.duration * 2);
                const wordInterval = buffer.duration / wordCount;

                for (let w = 0; w < wordCount; w++) {
                    const wordTime = elapsed + (w * wordInterval);
                    setTimeout(() => {
                        if (isPlaying) onWord(w, '', null);
                    }, wordTime * 1000);
                }
                elapsed += buffer.duration + 0.05;
            }
        }

        return true;
    }

    /**
     * Simple speak function - plays a single audio file or sequence
     */
    async function speak(text, onWord, onEnd, onStart) {
        // This is a fallback - ideally use playRoast() instead
        console.warn('[DoomVoice] speak() called - use playRoast() for full roast playback');

        // Try to find a matching closing or play nothing
        const closingIndex = Math.floor(Math.random() * 8) + 1;
        return playSequence([`closings/closing-${closingIndex}.mp3`], onWord, onEnd, onStart);
    }

    /**
     * Play a complete roast with all segments
     */
    async function playRoast(roastText, totalMinutes, appData, onWord, onEnd, onStart) {
        // Parse the roast to determine which audio files to play
        // For now, use a simplified approach - generate sequence based on structure

        const sequence = [];

        // Random opening
        const openingIdx = Math.floor(Math.random() * 8) + 1;
        sequence.push(`openings/opening-${openingIdx}a.mp3`);
        sequence.push(getTimeFilename(totalMinutes));
        sequence.push(`openings/opening-${openingIdx}b.mp3`);

        // App roasts (top 3 apps)
        const topApps = appData.slice(0, 3);
        for (const app of topApps) {
            const appKey = app.app.toLowerCase().replace(/[^a-z]/g, '');
            // Try app-specific first, fall back to generic
            sequence.push(`roasts/${appKey}-1a.mp3`);
            sequence.push(getTimeFilename(app.minutes));
            sequence.push(`roasts/${appKey}-1b.mp3`);
        }

        // Severity outro
        const severity = Config.getSeverityLevel(totalMinutes).toLowerCase();
        sequence.push(`outros/${severity}-1a.mp3`);
        sequence.push(getTimeFilename(totalMinutes));
        sequence.push(`outros/${severity}-1b.mp3`);

        // Random closing
        const closingIdx = Math.floor(Math.random() * 8) + 1;
        sequence.push(`closings/closing-${closingIdx}.mp3`);

        return playSequence(sequence, onWord, onEnd, onStart);
    }

    function cancel() {
        if (currentSource) {
            try {
                currentSource.stop();
            } catch (e) {}
            currentSource = null;
        }
        isPlaying = false;
        playbackQueue = [];
    }

    function pause() {
        if (audioContext && audioContext.state === 'running') {
            audioContext.suspend();
        }
    }

    function resume() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    // ==========================================
    // VOLUME CONTROL
    // ==========================================

    function mute() {
        isMuted = true;
        if (masterGain) masterGain.gain.value = 0;
    }

    function unmute() {
        isMuted = false;
        if (masterGain) masterGain.gain.value = 1;
    }

    function toggleMute() {
        if (isMuted) {
            unmute();
        } else {
            mute();
        }
        return isMuted;
    }

    function setVolume(value) {
        if (masterGain) {
            masterGain.gain.value = Math.max(0, Math.min(1, value));
        }
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return Object.freeze({
        init,
        loadAudio,
        preloadAudio,

        speak,
        playRoast,
        playSequence,
        buildRoastSequence,

        cancel,
        pause,
        resume,

        mute,
        unmute,
        toggleMute,
        setVolume,
        isMuted: () => isMuted,

        isSupported: () => true,
        isSpeaking: () => isPlaying,
        isPaused: () => audioContext && audioContext.state === 'suspended',

        // For compatibility with existing speech module
        estimateDuration: (text) => text.split(/\s+/).length / 2.5,
        getVoices: () => [{ name: 'MF DOOM', lang: 'en-US' }],
        setVoice: () => {},
        getSelectedVoice: () => ({ name: 'MF DOOM', lang: 'en-US' }),
        setPitch: () => {},
        setRate: () => {},
        getPitch: () => 1,
        getRate: () => 1
    });
})();
