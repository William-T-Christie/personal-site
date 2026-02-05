/**
 * DOOM SCROLLER ANONYMOUS - Speech Module
 * Web Speech API wrapper for villain voice synthesis
 */

window.DoomScrollerSpeech = (function() {
    'use strict';

    const Config = window.DoomScrollerConfig;

    // Speech synthesis
    const synth = window.speechSynthesis;
    let currentUtterance = null;
    let selectedVoice = null;
    let isSupported = false;
    let isSpeaking = false;

    // Callbacks
    let onWordCallback = null;
    let onEndCallback = null;
    let onStartCallback = null;

    // Settings
    let pitch = Config.VOICE.PITCH;
    let rate = Config.VOICE.RATE;
    let isMuted = false;

    // ==========================================
    // TEXT PREPROCESSING FOR TTS
    // ==========================================

    function preprocessText(text) {
        return text
            // Fix DOOM interjections
            .replace(/\bMm+\b\.?/gi, 'Hmmm')
            .replace(/\bMmm+\b\.?/gi, 'Hmmm')
            // Fix common abbreviations
            .replace(/\bhr\b/gi, 'hour')
            .replace(/\bhrs\b/gi, 'hours')
            .replace(/\bmin\b/gi, 'minute')
            .replace(/\bmins\b/gi, 'minutes')
            // Fix app names that might be read wrong
            .replace(/\bTikTok\b/gi, 'Tick Tock')
            .replace(/\bYouTube\b/gi, 'You Tube')
            // Fix ALL CAPS words (except DOOM) to prevent spelling out
            .replace(/\b([A-Z]{2,})\b/g, (match) => {
                if (match === 'DOOM') return 'DOOM';
                // Convert to title case for natural reading
                return match.charAt(0) + match.slice(1).toLowerCase();
            });
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    function init() {
        isSupported = 'speechSynthesis' in window;

        if (!isSupported) {
            console.warn('[Speech] Speech synthesis not supported');
            return false;
        }

        // Load voices (may need to wait for them)
        loadVoices();

        // Some browsers need this event to load voices
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        }

        console.log('[Speech] Initialized with pitch:', pitch, 'rate:', rate);
        return true;
    }

    function loadVoices() {
        const voices = synth.getVoices();

        if (voices.length === 0) {
            console.log('[Speech] No voices available yet');
            return;
        }

        // Find preferred voice (deep male voice)
        selectedVoice = findBestVoice(voices);

        console.log('[Speech] Selected voice:', selectedVoice?.name || 'default');
    }

    function findBestVoice(voices) {
        // Priority list of preferred voices
        const preferences = Config.VOICE.PREFERRED_VOICES;

        // Try each preference
        for (const pref of preferences) {
            const voice = voices.find(v =>
                v.name.toLowerCase().includes(pref.toLowerCase()) ||
                v.lang.toLowerCase().includes(pref.toLowerCase())
            );
            if (voice) return voice;
        }

        // Fallback: find any English male voice
        const englishVoice = voices.find(v =>
            v.lang.startsWith('en') &&
            (v.name.toLowerCase().includes('male') ||
             v.name.toLowerCase().includes('david') ||
             v.name.toLowerCase().includes('daniel') ||
             v.name.toLowerCase().includes('james'))
        );
        if (englishVoice) return englishVoice;

        // Last resort: first English voice
        return voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    // ==========================================
    // SPEECH CONTROL
    // ==========================================

    function speak(text, onWord, onEnd, onStart) {
        if (!isSupported) {
            console.warn('[Speech] Not supported');
            if (onEnd) onEnd();
            return false;
        }

        // Cancel any existing speech
        cancel();

        // Store callbacks
        onWordCallback = onWord;
        onEndCallback = onEnd;
        onStartCallback = onStart;

        // Preprocess text for better TTS pronunciation
        const processedText = preprocessText(text);

        // Create utterance
        currentUtterance = new SpeechSynthesisUtterance(processedText);

        // Set voice and parameters
        if (selectedVoice) {
            currentUtterance.voice = selectedVoice;
        }
        currentUtterance.pitch = pitch;
        currentUtterance.rate = rate;
        currentUtterance.volume = isMuted ? 0 : 1;

        // Event handlers
        currentUtterance.onstart = () => {
            isSpeaking = true;
            console.log('[Speech] Started speaking');
            if (onStartCallback) onStartCallback();
        };

        currentUtterance.onend = () => {
            isSpeaking = false;
            console.log('[Speech] Finished speaking');
            if (onEndCallback) onEndCallback();
        };

        currentUtterance.onerror = (event) => {
            isSpeaking = false;
            console.error('[Speech] Error:', event.error);
            if (onEndCallback) onEndCallback();
        };

        // Word boundary event (for mouth sync and captions)
        currentUtterance.onboundary = (event) => {
            if (event.name === 'word' && onWordCallback) {
                const word = text.substring(event.charIndex).split(/\s/)[0];
                onWordCallback(event.charIndex, word, event);
            }
        };

        // Start speaking
        synth.speak(currentUtterance);
        return true;
    }

    function cancel() {
        synth.cancel();
        isSpeaking = false;
        currentUtterance = null;
    }

    function pause() {
        if (synth.speaking) {
            synth.pause();
        }
    }

    function resume() {
        if (synth.paused) {
            synth.resume();
        }
    }

    // ==========================================
    // SETTINGS
    // ==========================================

    function setPitch(value) {
        pitch = Math.max(0.1, Math.min(2, value));
    }

    function setRate(value) {
        rate = Math.max(0.1, Math.min(2, value));
    }

    function getPitch() {
        return pitch;
    }

    function getRate() {
        return rate;
    }

    function getVoices() {
        return synth.getVoices();
    }

    function setVoice(voiceName) {
        const voices = synth.getVoices();
        selectedVoice = voices.find(v => v.name === voiceName) || selectedVoice;
    }

    function mute() {
        isMuted = true;
    }

    function unmute() {
        isMuted = false;
    }

    function toggleMute() {
        isMuted = !isMuted;
        return isMuted;
    }

    // ==========================================
    // ESTIMATION
    // ==========================================

    function estimateDuration(text) {
        const words = text.split(/\s+/).length;
        const wordsPerMinute = 150 * rate;
        const minutes = words / wordsPerMinute;
        return minutes * 60;
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return Object.freeze({
        init,
        speak,
        cancel,
        pause,
        resume,

        setPitch,
        setRate,
        getPitch,
        getRate,

        getVoices,
        setVoice,
        getSelectedVoice: () => selectedVoice,

        mute,
        unmute,
        toggleMute,
        isMuted: () => isMuted,

        estimateDuration,

        isSupported: () => isSupported,
        isSpeaking: () => isSpeaking,
        isPaused: () => synth.paused
    });
})();
