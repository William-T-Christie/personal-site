/**
 * DOOM SCROLLER ANONYMOUS - Main Application
 * Orchestrates all modules and handles the user flow
 */

window.DoomScrollerApp = (function() {
    'use strict';

    // Module references
    const Config = window.DoomScrollerConfig;
    const Storage = window.DoomScrollerStorage;
    const OCR = window.DoomScrollerOCR;
    const Parser = window.DoomScrollerParser;
    const RoastGenerator = window.DoomScrollerRoastGenerator;
    const Speech = window.DoomScrollerSpeech;
    const DoomVoice = window.DoomScrollerVoice;
    const Audio = window.DoomScrollerAudio;
    const Mask = window.DoomScrollerMask;
    const Caption = window.DoomScrollerCaption;
    const Export = window.DoomScrollerExport;
    const UI = window.DoomScrollerUI;

    // Flag to track if DOOM voice audio files are available
    let useDoomVoice = false;

    // Application state
    let currentRoast = null;
    let currentScreenTimeData = null;
    let isPlaying = false;
    let exportUrl = null;
    let isMuted = false;
    let isPaused = false;
    let mutedCaptionInterval = null;

    // Beat path - MF DOOM Rap Snitches instrumental
    const BEAT_URL = 'assets/sounds/MF Doom - Rapp Snitch Knishes [Instrumental].mp3';

    // ==========================================
    // DOOM VOICE DETECTION
    // ==========================================

    async function checkDoomVoiceAvailable() {
        // Check if a sample DOOM voice file exists
        try {
            const response = await fetch('assets/doom-audio/closings/closing-1.mp3', { method: 'HEAD' });
            return response.ok;
        } catch (e) {
            return false;
        }
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    async function init() {
        console.log('[App] Initializing Doom Scroller Anonymous...');

        // Initialize UI first
        UI.init();

        // Check if DOOM voice audio files are available
        useDoomVoice = await checkDoomVoiceAvailable();
        if (useDoomVoice) {
            console.log('[App] DOOM voice audio files detected - using pre-generated audio');
            DoomVoice.init();
        } else {
            console.log('[App] DOOM voice audio not found - using browser TTS fallback');
        }

        // Initialize modules
        Speech.init();
        Export.init();

        // Initialize audio (will load beat later)
        await Audio.init();

        // Try to load beat (non-blocking)
        Audio.loadBeat(BEAT_URL).catch(err => {
            console.warn('[App] Beat not loaded, continuing without music:', err.message);
        });

        // Initialize masks
        initializeMasks();

        // Bind event handlers
        bindEvents();

        // Show landing screen
        UI.showScreen('landing');

        console.log('[App] Initialization complete');
    }

    function initializeMasks() {
        // Initialize preview mask on landing
        const maskPreview = UI.DOM.maskPreview;
        if (maskPreview) {
            Mask.init(maskPreview);
            Mask.start();
        }
    }

    // ==========================================
    // EVENT BINDING
    // ==========================================

    function bindEvents() {
        // Landing -> Upload (with record spin animation)
        const btnStart = document.getElementById('btnStart');
        let isSpinning = false;

        if (btnStart) {
            btnStart.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (isSpinning) return; // Prevent double-clicks
                isSpinning = true;

                const maskHero = document.querySelector('.mask-hero');
                if (maskHero) {
                    console.log('[App] Starting record spin animation');
                    btnStart.disabled = true;
                    maskHero.classList.add('spinning');

                    // Wait for spin animation to complete, then transition
                    setTimeout(function() {
                        maskHero.classList.remove('spinning');
                        btnStart.disabled = false;
                        isSpinning = false;
                        UI.showScreen('upload');
                    }, 2000);
                } else {
                    isSpinning = false;
                    UI.showScreen('upload');
                }
            };
        }

        // Upload -> Landing
        UI.bindButton('btnBackToLanding', () => {
            document.body.classList.remove('screen-not-landing');
            UI.showScreen('landing');
        });

        // File upload
        UI.setupUploadZone(handleFileUpload);

        // Playback controls
        UI.bindButton('btnBackToUpload', handleBackToUpload);
        UI.bindButton('btnPause', handlePause);
        UI.bindButton('btnReplay', handleReplay);
        UI.bindButton('btnMute', handleMute);
        UI.bindButton('btnExport', handleExport);

        // Debug: verify pause button exists
        console.log('[App] btnPause element:', document.getElementById('btnPause'));

        // Share controls
        UI.bindButton('btnDownload', handleDownload);
        UI.bindButton('btnNewRoast', handleNewRoast);
    }

    // ==========================================
    // FILE UPLOAD FLOW
    // ==========================================

    async function handleFileUpload(file) {
        console.log('[App] File uploaded:', file.name);

        // Stop Rap Snitches intro audio immediately
        // First clear the fade interval from the inline script
        if (window.rapSnitchesFadeInterval) {
            clearInterval(window.rapSnitchesFadeInterval);
            window.rapSnitchesFadeInterval = null;
        }
        const rapSnitchesAudio = document.getElementById('rapSnitchesAudio');
        if (rapSnitchesAudio && !rapSnitchesAudio.paused) {
            rapSnitchesAudio.pause();
            console.log('[App] Rap Snitches audio stopped');
        }

        // Show processing screen
        UI.showScreen('processing');
        UI.updateProgress(0, 'Initializing...');

        // Initialize processing mask
        const maskProcessing = UI.DOM.maskProcessing;
        if (maskProcessing) {
            Mask.init(maskProcessing);
            Mask.start();
        }

        // Start random message cycling
        const messageInterval = setInterval(() => {
            UI.showRandomProcessingMessage();
        }, 2000);

        try {
            // Step 1: OCR
            UI.updateProgress(10, 'The Villain examines your evidence...');

            const ocrResult = await OCR.recognize(file, (progress, status) => {
                UI.updateProgress(10 + progress * 0.4, status);
            });

            // Step 2: Parse screen time data
            UI.updateProgress(55, 'Analyzing your digital crimes...');

            const screenTimeData = Parser.parse(ocrResult.text);
            const validation = Parser.validate(screenTimeData);

            if (!validation.isValid) {
                // Use mock data if parsing failed
                console.warn('[App] OCR parsing incomplete, using demo mode');
                currentScreenTimeData = Parser.generateMockData();
                UI.showToast('Using demo data - try a clearer screenshot');
            } else {
                currentScreenTimeData = screenTimeData;
            }

            // Step 3: Generate roast
            UI.updateProgress(70, 'The Villain composes your judgment...');

            currentRoast = RoastGenerator.generate(currentScreenTimeData);

            // Step 4: Prepare playback
            UI.updateProgress(85, 'Preparing your public humiliation...');

            // Save to history
            Storage.addToHistory({
                totalMinutes: currentScreenTimeData.totalMinutes,
                topApps: currentScreenTimeData.topApps,
                roastText: currentRoast.text,
                severity: currentRoast.severity
            });

            Storage.saveLastRoast({
                screenTimeData: currentScreenTimeData,
                roast: currentRoast
            });

            UI.updateProgress(100, 'Judgment is ready.');

            // Clear message interval
            clearInterval(messageInterval);

            // Short delay before showing playback
            await new Promise(resolve => setTimeout(resolve, 500));

            // Start playback
            startPlayback();

        } catch (error) {
            console.error('[App] Processing failed:', error);
            clearInterval(messageInterval);
            UI.showToast('Processing failed. Please try again.');
            UI.showScreen('upload');
        }
    }

    // ==========================================
    // PLAYBACK
    // ==========================================

    async function startPlayback() {
        if (!currentRoast) {
            console.error('[App] No roast to play');
            return;
        }

        console.log('[App] Starting playback');

        // Show playback screen
        UI.showScreen('playback');

        // Initialize main mask
        const maskMain = UI.DOM.maskMain;
        if (maskMain) {
            Mask.init(maskMain);
            Mask.start();
        }

        // Initialize captions
        Caption.init(UI.DOM.captionText || '#captionText');
        Caption.setText(currentRoast.text);

        // Start beat (if loaded)
        if (Audio.isLoaded()) {
            Audio.fadeIn(0.5);
            Audio.play();
        }

        isPlaying = true;

        // Add speaking class for intensified head bob
        const performerArea = document.querySelector('.performer-area');
        if (performerArea) {
            performerArea.classList.add('speaking');
        }

        // Callbacks for speech
        const onWord = (charIndex, word) => {
            Mask.setMouthOpen(true);
            Caption.onSpeechWord(charIndex, word);

            // Close mouth after short delay
            setTimeout(() => {
                Mask.setMouthOpen(false);
            }, Config.ANIMATION.MOUTH_OPEN_DURATION);
        };

        const onEnd = () => {
            console.log('[App] Speech finished');
            Mask.closeMouth();
            isPlaying = false;

            // Remove speaking class
            const performerArea = document.querySelector('.performer-area');
            if (performerArea) {
                performerArea.classList.remove('speaking');
            }

            // Fade out beat
            if (Audio.isPlaying()) {
                Audio.fadeOut(1);
                setTimeout(() => Audio.stop(), 1000);
            }

            UI.showToast('DOOM has spoken.');
        };

        const onStart = () => {
            console.log('[App] Speech started');
        };

        // Use DOOM voice if available, otherwise fall back to browser TTS
        if (useDoomVoice && currentScreenTimeData) {
            console.log('[App] Using pre-generated DOOM voice');
            const totalMinutes = currentScreenTimeData.totalMinutes || 60;
            const appData = currentScreenTimeData.apps || [];
            DoomVoice.playRoast(currentRoast.text, totalMinutes, appData, onWord, onEnd, onStart);
        } else {
            console.log('[App] Using browser TTS');
            Speech.speak(currentRoast.text, onWord, onEnd, onStart);
        }
    }

    function handleReplay() {
        if (!currentRoast) return;

        console.log('[App] Replaying roast');

        // Stop current playback
        Speech.cancel();
        Audio.stop();
        Mask.closeMouth();

        // Clear muted caption interval if running
        if (mutedCaptionInterval) {
            clearInterval(mutedCaptionInterval);
            mutedCaptionInterval = null;
        }

        // Reset mute and pause state
        isMuted = false;
        isPaused = false;
        Audio.unmute();
        UI.setMuteState(false);
        UI.setPauseState(false);

        // Reset captions
        Caption.clear();

        // Restart
        setTimeout(startPlayback, 300);
    }

    function handlePause() {
        console.log('[App] Pause clicked, isPaused:', isPaused, 'isMuted:', isMuted);

        if (isPaused) {
            // Resume
            isPaused = false;
            if (isMuted) {
                // Resume muted caption timer
                if (Caption.isActive() && !mutedCaptionInterval) {
                    mutedCaptionInterval = setInterval(() => {
                        if (Caption.isActive()) {
                            Caption.advanceWord();
                            Mask.setMouthOpen(true);
                            setTimeout(() => Mask.setMouthOpen(false), 100);
                        } else {
                            clearInterval(mutedCaptionInterval);
                            mutedCaptionInterval = null;
                            isPlaying = false;
                            UI.showToast('DOOM has spoken.');
                        }
                    }, 300);
                }
            } else {
                // Resume speech
                Speech.resume();
                Audio.resume();
            }
            UI.setPauseState(false);
        } else {
            // Pause
            isPaused = true;
            if (isMuted) {
                // Pause muted caption timer
                if (mutedCaptionInterval) {
                    clearInterval(mutedCaptionInterval);
                    mutedCaptionInterval = null;
                }
            } else {
                // Pause speech
                Speech.pause();
                Audio.pause();
            }
            Mask.closeMouth();
            UI.setPauseState(true);
        }
    }

    function handleBackToUpload() {
        // Stop everything
        Speech.cancel();
        Audio.stop();
        Mask.closeMouth();
        Caption.clear();

        // Clear muted caption interval
        if (mutedCaptionInterval) {
            clearInterval(mutedCaptionInterval);
            mutedCaptionInterval = null;
        }

        // Reset speaking animation
        const performerArea = document.querySelector('.performer-area');
        if (performerArea) {
            performerArea.classList.remove('speaking');
        }

        // Reset all state
        isMuted = false;
        isPaused = false;
        UI.setPauseState(false);
        UI.setMuteState(false);

        // Go back to upload
        UI.showScreen('upload');
    }

    function handleMute() {
        isMuted = !isMuted;
        isPaused = false; // Reset pause state when toggling mute

        if (isMuted) {
            // Mute: Cancel speech but continue captions on a timer
            Speech.cancel();
            Audio.mute();
            Mask.closeMouth();
            UI.setPauseState(false);

            // Start timer to advance captions (approx 300ms per word)
            if (Caption.isActive()) {
                mutedCaptionInterval = setInterval(() => {
                    if (Caption.isActive()) {
                        Caption.advanceWord();
                        // Brief mouth animation
                        Mask.setMouthOpen(true);
                        setTimeout(() => Mask.setMouthOpen(false), 100);
                    } else {
                        // Captions done
                        clearInterval(mutedCaptionInterval);
                        mutedCaptionInterval = null;
                        isPlaying = false;
                        UI.showToast('DOOM has spoken.');
                    }
                }, 300);
            }
        } else {
            // Unmute: Stop caption timer, user can replay for audio
            if (mutedCaptionInterval) {
                clearInterval(mutedCaptionInterval);
                mutedCaptionInterval = null;
            }
            Audio.unmute();
            UI.showToast('Unmuted - tap replay for audio');
        }

        UI.setMuteState(isMuted);
    }

    // ==========================================
    // EXPORT
    // ==========================================

    async function handleExport() {
        if (!currentRoast) {
            UI.showToast('Nothing to export');
            return;
        }

        console.log('[App] Starting export');
        UI.setExportButtonState(true);
        UI.showRecordingIndicator();

        try {
            // Stop current playback
            Speech.cancel();
            Audio.stop();

            // Initialize export
            const maskMain = UI.DOM.maskMain;
            await Export.startRecording(maskMain, Audio.getContext());

            // Replay with recording
            isPlaying = true;
            Caption.setText(currentRoast.text);

            // Start beat
            if (Audio.isLoaded()) {
                Audio.play();
            }

            // Animation loop for export
            let frameCount = 0;
            const renderExportFrame = () => {
                if (!isPlaying) return;

                // Render to export canvas
                Export.renderFrame(
                    maskMain,
                    Caption.getCurrentText(),
                    { showCaptions: true, showWatermark: true }
                );

                frameCount++;
                requestAnimationFrame(renderExportFrame);
            };

            // Start speech for export
            Speech.speak(
                currentRoast.text,
                (charIndex, word) => {
                    Mask.setMouthOpen(true);
                    Caption.onSpeechWord(charIndex, word);
                    setTimeout(() => Mask.setMouthOpen(false), Config.ANIMATION.MOUTH_OPEN_DURATION);
                },
                async () => {
                    // Speech ended, stop recording
                    isPlaying = false;
                    Audio.stop();
                    Mask.closeMouth();

                    console.log('[App] Export recording complete, frames:', frameCount);

                    try {
                        const result = await Export.stopRecording();
                        exportUrl = result.url;

                        UI.hideRecordingIndicator();
                        UI.setExportButtonState(false);

                        // Show share screen
                        UI.setVideoPreview(exportUrl);
                        UI.showScreen('share');

                    } catch (err) {
                        console.error('[App] Export finalization failed:', err);
                        UI.showToast('Export failed');
                        UI.hideRecordingIndicator();
                        UI.setExportButtonState(false);
                    }
                }
            );

            // Start render loop
            renderExportFrame();

        } catch (error) {
            console.error('[App] Export failed:', error);
            UI.showToast('Export failed. Please try again.');
            UI.hideRecordingIndicator();
            UI.setExportButtonState(false);
        }
    }

    function handleDownload() {
        if (exportUrl) {
            const timestamp = new Date().toISOString().slice(0, 10);
            Export.downloadVideo(exportUrl, `doom-scroller-roast-${timestamp}.webm`);
            UI.showToast('Downloading video...');
        } else {
            UI.showToast('No video to download');
        }
    }

    function handleNewRoast() {
        // Clean up
        if (exportUrl) {
            Export.revokeUrl(exportUrl);
            exportUrl = null;
        }

        currentRoast = null;
        currentScreenTimeData = null;

        // Reset captions
        Caption.clear();

        // Go back to upload
        UI.showScreen('upload');
    }

    // ==========================================
    // DEMO MODE (for testing without OCR)
    // ==========================================

    function runDemo() {
        console.log('[App] Running demo mode');

        currentScreenTimeData = Parser.generateMockData();
        currentRoast = RoastGenerator.generate(currentScreenTimeData);

        startPlayback();
    }

    // ==========================================
    // CLEANUP
    // ==========================================

    function cleanup() {
        Speech.cancel();
        Audio.stop();
        Mask.stop();
        OCR.terminate();

        if (exportUrl) {
            Export.revokeUrl(exportUrl);
        }
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);

    // ==========================================
    // PUBLIC API
    // ==========================================

    return Object.freeze({
        init,
        runDemo,
        cleanup,
        getCurrentRoast: () => currentRoast,
        isPlaying: () => isPlaying
    });
})();

// ==========================================
// AUTO-INITIALIZE ON DOM READY
// ==========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.DoomScrollerApp.init();
    });
} else {
    window.DoomScrollerApp.init();
}
