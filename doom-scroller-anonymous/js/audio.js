/**
 * DOOM SCROLLER ANONYMOUS - Audio Module
 * Lo-fi beat playback, vinyl effects, and audio atmosphere
 * Designed to create that Operation Doomsday sonic aesthetic
 */

window.DoomScrollerAudio = (function() {
    'use strict';

    const Config = window.DoomScrollerConfig;

    // Audio context and nodes
    let audioContext = null;
    let beatBuffer = null;
    let beatSource = null;
    let masterGain = null;
    let beatGain = null;

    // Effect nodes for lo-fi sound
    let lowPassFilter = null;
    let highPassFilter = null;
    let compressor = null;
    let vinylGain = null;
    let vinylSource = null;

    // State
    let isPlaying = false;
    let startTime = 0;
    let volume = 0.6;
    let isMuted = false;
    let isLoaded = false;
    let vinylInterval = null;

    // Mask resonance (DOOM voice effect)
    let maskResonanceOscillators = [];
    let maskResonanceGain = null;
    let isMaskResonanceActive = false;

    // Beat tracking
    const BPM = Config.ANIMATION.BPM;
    const BEAT_DURATION = 60 / BPM;
    const BAR_DURATION = BEAT_DURATION * 4;

    // ==========================================
    // INITIALIZATION
    // ==========================================

    async function init() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain
            masterGain = audioContext.createGain();
            masterGain.gain.value = volume;
            masterGain.connect(audioContext.destination);

            // Create beat gain (separate control)
            beatGain = audioContext.createGain();
            beatGain.gain.value = 0.7;

            // Create lo-fi filter chain
            createLoFiChain();

            // Create compressor for that punchy sound
            compressor = audioContext.createDynamicsCompressor();
            compressor.threshold.value = -24;
            compressor.knee.value = 30;
            compressor.ratio.value = 4;
            compressor.attack.value = 0.003;
            compressor.release.value = 0.25;

            // Connect: beat -> lofi chain -> compressor -> master
            beatGain.connect(lowPassFilter);
            lowPassFilter.connect(highPassFilter);
            highPassFilter.connect(compressor);
            compressor.connect(masterGain);

            // Create vinyl crackle channel
            vinylGain = audioContext.createGain();
            vinylGain.gain.value = 0.08; // Subtle crackle
            vinylGain.connect(masterGain);

            console.log('[Audio] Lo-fi audio engine initialized');
            return true;
        } catch (error) {
            console.error('[Audio] Failed to initialize:', error);
            return false;
        }
    }

    function createLoFiChain() {
        // Low-pass filter - roll off highs for warmth
        lowPassFilter = audioContext.createBiquadFilter();
        lowPassFilter.type = 'lowpass';
        lowPassFilter.frequency.value = 8000; // Cut harsh highs
        lowPassFilter.Q.value = 0.7;

        // High-pass filter - remove rumble, add clarity
        highPassFilter = audioContext.createBiquadFilter();
        highPassFilter.type = 'highpass';
        highPassFilter.frequency.value = 60;
        highPassFilter.Q.value = 0.7;
    }

    // ==========================================
    // VINYL CRACKLE GENERATOR
    // ==========================================

    function createVinylNoise() {
        if (!audioContext) return;

        // Generate vinyl crackle using noise + filtering
        const bufferSize = audioContext.sampleRate * 2; // 2 seconds
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Generate crackling noise pattern
        for (let i = 0; i < bufferSize; i++) {
            // Base noise
            let noise = Math.random() * 2 - 1;

            // Add occasional pops (sparse)
            if (Math.random() < 0.0003) {
                noise = (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4);
            }

            // Add crackle texture
            if (Math.random() < 0.002) {
                noise = (Math.random() - 0.5) * 0.2;
            }

            output[i] = noise * 0.15;
        }

        return noiseBuffer;
    }

    function startVinylCrackle() {
        if (!audioContext || !vinylGain) return;

        const noiseBuffer = createVinylNoise();

        vinylSource = audioContext.createBufferSource();
        vinylSource.buffer = noiseBuffer;
        vinylSource.loop = true;

        // Filter the noise to sound more like vinyl
        const vinylFilter = audioContext.createBiquadFilter();
        vinylFilter.type = 'bandpass';
        vinylFilter.frequency.value = 1500;
        vinylFilter.Q.value = 0.5;

        vinylSource.connect(vinylFilter);
        vinylFilter.connect(vinylGain);
        vinylSource.start();
    }

    function stopVinylCrackle() {
        if (vinylSource) {
            try {
                vinylSource.stop();
                vinylSource.disconnect();
            } catch (e) {}
            vinylSource = null;
        }
    }

    // ==========================================
    // BEAT LOADING
    // ==========================================

    async function loadBeat(url) {
        if (!audioContext) {
            await init();
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch beat: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            beatBuffer = await audioContext.decodeAudioData(arrayBuffer);
            isLoaded = true;

            console.log('[Audio] Beat loaded successfully');
            return true;
        } catch (error) {
            console.error('[Audio] Failed to load beat:', error);
            isLoaded = false;
            return false;
        }
    }

    // ==========================================
    // PLAYBACK CONTROL
    // ==========================================

    function play() {
        if (!audioContext || !beatBuffer) {
            console.warn('[Audio] Cannot play - not initialized or no beat loaded');
            return false;
        }

        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        stop();

        // Create new beat source
        beatSource = audioContext.createBufferSource();
        beatSource.buffer = beatBuffer;
        beatSource.loop = true;
        beatSource.connect(beatGain);

        // Start playback
        startTime = audioContext.currentTime;
        beatSource.start(0);
        isPlaying = true;

        // Start vinyl atmosphere
        startVinylCrackle();

        console.log('[Audio] Playback started with lo-fi processing');
        return true;
    }

    function stop() {
        if (beatSource) {
            try {
                beatSource.stop();
                beatSource.disconnect();
            } catch (e) {}
            beatSource = null;
        }
        stopVinylCrackle();
        isPlaying = false;
    }

    function pause() {
        if (audioContext && isPlaying) {
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

    function setVolume(value) {
        volume = Math.max(0, Math.min(1, value));
        if (masterGain) {
            masterGain.gain.value = isMuted ? 0 : volume;
        }
    }

    function getVolume() {
        return volume;
    }

    function mute() {
        isMuted = true;
        if (masterGain) {
            masterGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.1);
        }
    }

    function unmute() {
        isMuted = false;
        if (masterGain) {
            masterGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1);
        }
    }

    function toggleMute() {
        if (isMuted) {
            unmute();
        } else {
            mute();
        }
        return isMuted;
    }

    // ==========================================
    // BEAT TRACKING
    // ==========================================

    function getBeatPosition() {
        if (!isPlaying || !audioContext) return 0;
        const elapsed = audioContext.currentTime - startTime;
        const beatNumber = elapsed / BEAT_DURATION;
        return beatNumber % 4;
    }

    function getBarNumber() {
        if (!isPlaying || !audioContext) return 0;
        const elapsed = audioContext.currentTime - startTime;
        return Math.floor(elapsed / BAR_DURATION);
    }

    function getElapsedTime() {
        if (!isPlaying || !audioContext) return 0;
        return audioContext.currentTime - startTime;
    }

    function isOnBeat(tolerance = 0.1) {
        const position = getBeatPosition();
        const beatFraction = position % 1;
        return beatFraction < tolerance || beatFraction > (1 - tolerance);
    }

    // ==========================================
    // FADE EFFECTS
    // ==========================================

    function fadeIn(duration = 1) {
        if (!masterGain || !audioContext) return;
        masterGain.gain.setValueAtTime(0, audioContext.currentTime);
        masterGain.gain.linearRampToValueAtTime(
            isMuted ? 0 : volume,
            audioContext.currentTime + duration
        );
    }

    function fadeOut(duration = 1) {
        if (!masterGain || !audioContext) return;
        masterGain.gain.linearRampToValueAtTime(
            0,
            audioContext.currentTime + duration
        );
    }

    // ==========================================
    // LO-FI CONTROL
    // ==========================================

    function setLoFiIntensity(intensity) {
        // intensity: 0 = clean, 1 = very lo-fi
        const freq = 12000 - (intensity * 6000); // 12kHz to 6kHz
        if (lowPassFilter) {
            lowPassFilter.frequency.setTargetAtTime(freq, audioContext.currentTime, 0.1);
        }
        if (vinylGain) {
            vinylGain.gain.setTargetAtTime(0.05 + (intensity * 0.1), audioContext.currentTime, 0.1);
        }
    }

    // ==========================================
    // MASK RESONANCE (DOOM VOICE EFFECT)
    // ==========================================

    /**
     * Start the mask resonance effect - creates metallic undertone
     * Call this when speech starts
     */
    function startMaskResonance() {
        if (!audioContext || !Config.VOICE.MASK_RESONANCE.ENABLED) return;
        if (isMaskResonanceActive) return;

        // Resume audio context if needed
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const resonanceConfig = Config.VOICE.MASK_RESONANCE;

        // Create gain node for resonance
        maskResonanceGain = audioContext.createGain();
        maskResonanceGain.gain.setValueAtTime(0, audioContext.currentTime);
        maskResonanceGain.connect(masterGain);

        // Create oscillators for each harmonic
        maskResonanceOscillators = resonanceConfig.HARMONICS.map((harmonic, i) => {
            const osc = audioContext.createOscillator();
            const oscGain = audioContext.createGain();

            // Use sawtooth for gritty, metallic quality
            osc.type = i === 0 ? 'sawtooth' : 'triangle';
            osc.frequency.value = resonanceConfig.FREQUENCY * harmonic;
            osc.detune.value = resonanceConfig.DETUNE + (i * 50); // Slight spread

            oscGain.gain.value = resonanceConfig.HARMONIC_GAINS[i] || 0.05;

            // Add subtle waveshaper distortion
            const distortion = audioContext.createWaveShaper();
            distortion.curve = makeDistortionCurve(20);
            distortion.oversample = '2x';

            osc.connect(distortion);
            distortion.connect(oscGain);
            oscGain.connect(maskResonanceGain);

            osc.start();
            return { osc, oscGain };
        });

        // Fade in the resonance
        maskResonanceGain.gain.linearRampToValueAtTime(
            isMuted ? 0 : 1,
            audioContext.currentTime + 0.3
        );

        isMaskResonanceActive = true;
        console.log('[Audio] Mask resonance started - DOOM voice active');
    }

    /**
     * Stop the mask resonance effect
     * Call this when speech ends
     */
    function stopMaskResonance() {
        if (!isMaskResonanceActive) return;

        // Fade out
        if (maskResonanceGain && audioContext) {
            maskResonanceGain.gain.linearRampToValueAtTime(
                0,
                audioContext.currentTime + 0.5
            );
        }

        // Stop oscillators after fade
        setTimeout(() => {
            maskResonanceOscillators.forEach(({ osc }) => {
                try {
                    osc.stop();
                    osc.disconnect();
                } catch (e) {}
            });
            maskResonanceOscillators = [];

            if (maskResonanceGain) {
                try {
                    maskResonanceGain.disconnect();
                } catch (e) {}
                maskResonanceGain = null;
            }
        }, 600);

        isMaskResonanceActive = false;
        console.log('[Audio] Mask resonance stopped');
    }

    /**
     * Pulse the resonance on word boundaries for emphasis
     */
    function pulseMaskResonance() {
        if (!isMaskResonanceActive || !maskResonanceGain || !audioContext) return;

        const currentGain = maskResonanceGain.gain.value;
        const pulseGain = Math.min(currentGain * 1.5, 1);

        // Quick pulse up then back down
        maskResonanceGain.gain.setValueAtTime(currentGain, audioContext.currentTime);
        maskResonanceGain.gain.linearRampToValueAtTime(pulseGain, audioContext.currentTime + 0.05);
        maskResonanceGain.gain.linearRampToValueAtTime(currentGain, audioContext.currentTime + 0.15);
    }

    /**
     * Create distortion curve for gritty effect
     */
    function makeDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        return curve;
    }

    // ==========================================
    // RECORDING SUPPORT
    // ==========================================

    function getContext() {
        return audioContext;
    }

    function getDestination() {
        return masterGain || (audioContext && audioContext.destination);
    }

    function createStreamDestination() {
        if (!audioContext) return null;
        return audioContext.createMediaStreamDestination();
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return Object.freeze({
        init,
        loadBeat,
        play,
        stop,
        pause,
        resume,

        setVolume,
        getVolume,
        mute,
        unmute,
        toggleMute,
        isMuted: () => isMuted,

        getBeatPosition,
        getBarNumber,
        getElapsedTime,
        isOnBeat,

        fadeIn,
        fadeOut,
        setLoFiIntensity,

        getContext,
        getDestination,
        createStreamDestination,

        // DOOM voice effects
        startMaskResonance,
        stopMaskResonance,
        pulseMaskResonance,

        isPlaying: () => isPlaying,
        isLoaded: () => isLoaded,

        BPM,
        BEAT_DURATION,
        BAR_DURATION
    });
})();
