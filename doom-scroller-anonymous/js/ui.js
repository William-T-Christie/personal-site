/**
 * DOOM SCROLLER ANONYMOUS - UI Module
 * Screen management, DOM caching, and UI state
 */

window.DoomScrollerUI = (function() {
    'use strict';

    const Config = window.DoomScrollerConfig;

    // ==========================================
    // DOM CACHE
    // ==========================================

    const DOM = {
        // Screens
        screens: null,
        screenLanding: null,
        screenUpload: null,
        screenProcessing: null,
        screenPlayback: null,
        screenShare: null,

        // Buttons
        btnStart: null,
        btnBackToLanding: null,
        btnBackToUpload: null,
        btnPause: null,
        btnReplay: null,
        btnMute: null,
        btnExport: null,
        btnDownload: null,
        btnNewRoast: null,

        // Upload
        uploadZone: null,
        fileInput: null,

        // Processing
        progressFill: null,
        progressText: null,
        processingMessage: null,

        // Playback
        maskMain: null,
        captionBox: null,
        captionText: null,

        // Share
        videoPreview: null,

        // Preview masks
        maskPreview: null,
        maskProcessing: null
    };

    let currentScreen = 'landing';
    let isInitialized = false;

    // ==========================================
    // INITIALIZATION
    // ==========================================

    function init() {
        if (isInitialized) return true;

        // Cache all DOM elements
        DOM.screens = document.querySelectorAll('.screen');

        DOM.screenLanding = document.getElementById('screenLanding');
        DOM.screenUpload = document.getElementById('screenUpload');
        DOM.screenProcessing = document.getElementById('screenProcessing');
        DOM.screenPlayback = document.getElementById('screenPlayback');
        DOM.screenShare = document.getElementById('screenShare');

        DOM.btnStart = document.getElementById('btnStart');
        DOM.btnBackToLanding = document.getElementById('btnBackToLanding');
        DOM.btnBackToUpload = document.getElementById('btnBackToUpload');
        DOM.btnPause = document.getElementById('btnPause');
        DOM.btnReplay = document.getElementById('btnReplay');
        DOM.btnMute = document.getElementById('btnMute');
        DOM.btnExport = document.getElementById('btnExport');
        DOM.btnDownload = document.getElementById('btnDownload');
        DOM.btnNewRoast = document.getElementById('btnNewRoast');

        DOM.uploadZone = document.getElementById('uploadZone');
        DOM.fileInput = document.getElementById('fileInput');

        DOM.progressFill = document.getElementById('progressFill');
        DOM.progressText = document.getElementById('progressText');
        DOM.processingMessage = document.getElementById('processingMessage');

        DOM.maskMain = document.getElementById('maskMain');
        DOM.captionBox = document.getElementById('captionBox');
        DOM.captionText = document.getElementById('captionText');

        DOM.videoPreview = document.getElementById('videoPreview');

        DOM.maskPreview = document.getElementById('maskPreview');
        DOM.maskProcessing = document.getElementById('maskProcessing');

        isInitialized = true;
        return true;
    }

    // ==========================================
    // SCREEN MANAGEMENT
    // ==========================================

    function showScreen(screenName) {
        if (!isInitialized) init();

        const screenMap = {
            'landing': DOM.screenLanding,
            'upload': DOM.screenUpload,
            'processing': DOM.screenProcessing,
            'playback': DOM.screenPlayback,
            'share': DOM.screenShare
        };

        const targetScreen = screenMap[screenName];
        if (!targetScreen) {
            console.error('[UI] Unknown screen:', screenName);
            return;
        }

        // Hide all screens
        DOM.screens.forEach(screen => {
            screen.classList.remove('active', 'entering');
            screen.classList.add('leaving');
        });

        // Show target screen after brief delay
        setTimeout(() => {
            DOM.screens.forEach(screen => {
                screen.classList.remove('leaving');
            });

            targetScreen.classList.add('active', 'entering');
            currentScreen = screenName;

            console.log('[UI] Showing screen:', screenName);
        }, 100);
    }

    function getCurrentScreen() {
        return currentScreen;
    }

    // ==========================================
    // PROGRESS UPDATES
    // ==========================================

    function updateProgress(percent, text) {
        if (DOM.progressFill) {
            DOM.progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
        }
        if (DOM.progressText && text) {
            DOM.progressText.textContent = text;
        }
    }

    function setProcessingMessage(message) {
        if (DOM.processingMessage) {
            DOM.processingMessage.textContent = message;
        }
    }

    function showRandomProcessingMessage() {
        const message = Config.getRandomItem(Config.PROCESSING_MESSAGES);
        setProcessingMessage(message);
    }

    // ==========================================
    // UPLOAD ZONE
    // ==========================================

    function setupUploadZone(onFileSelected) {
        if (!DOM.uploadZone || !DOM.fileInput) return;

        // File input change
        DOM.fileInput.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelected(file);
        });

        // Drag and drop
        DOM.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            DOM.uploadZone.classList.add('dragover');
        });

        DOM.uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            DOM.uploadZone.classList.remove('dragover');
        });

        DOM.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            DOM.uploadZone.classList.remove('dragover');

            const file = e.dataTransfer?.files?.[0];
            if (file && file.type.startsWith('image/')) {
                onFileSelected(file);
            }
        });
    }

    // ==========================================
    // PLAYBACK CONTROLS
    // ==========================================

    function setMuteState(isMuted) {
        if (!DOM.btnMute) return;

        const iconUnmuted = DOM.btnMute.querySelector('.icon-unmuted');
        const iconMuted = DOM.btnMute.querySelector('.icon-muted');

        if (iconUnmuted) iconUnmuted.style.display = isMuted ? 'none' : 'block';
        if (iconMuted) iconMuted.style.display = isMuted ? 'block' : 'none';
    }

    function setPauseState(isPaused) {
        if (!DOM.btnPause) return;

        const iconPause = DOM.btnPause.querySelector('.icon-pause');
        const iconPlay = DOM.btnPause.querySelector('.icon-play');

        if (iconPause) iconPause.style.display = isPaused ? 'none' : 'block';
        if (iconPlay) iconPlay.style.display = isPaused ? 'block' : 'none';

        DOM.btnPause.title = isPaused ? 'Resume' : 'Pause';
    }

    function setExportButtonState(isExporting) {
        if (!DOM.btnExport) return;

        DOM.btnExport.disabled = isExporting;
        const textSpan = DOM.btnExport.querySelector('.btn-text');
        if (textSpan) {
            textSpan.textContent = isExporting ? 'Exporting...' : 'Export Video';
        }
    }

    // ==========================================
    // VIDEO PREVIEW
    // ==========================================

    function setVideoPreview(url) {
        if (DOM.videoPreview) {
            DOM.videoPreview.src = url;
            DOM.videoPreview.load();
        }
    }

    // ==========================================
    // TOAST NOTIFICATIONS
    // ==========================================

    function showToast(message, duration = 3000) {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        // Create toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove after duration
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ==========================================
    // RECORDING INDICATOR
    // ==========================================

    function showRecordingIndicator() {
        let indicator = document.querySelector('.recording-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'recording-indicator';
            indicator.textContent = 'REC';
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'flex';
    }

    function hideRecordingIndicator() {
        const indicator = document.querySelector('.recording-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    // ==========================================
    // BUTTON EVENT BINDING
    // ==========================================

    function bindButton(buttonName, handler) {
        const button = DOM[buttonName];
        console.log('[UI] bindButton:', buttonName, 'element:', button);
        if (button && handler) {
            button.addEventListener('click', handler);
        } else {
            console.warn('[UI] Failed to bind button:', buttonName, 'button:', button, 'handler:', !!handler);
        }
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return Object.freeze({
        init,
        DOM,

        showScreen,
        getCurrentScreen,

        updateProgress,
        setProcessingMessage,
        showRandomProcessingMessage,

        setupUploadZone,

        setMuteState,
        setPauseState,
        setExportButtonState,

        setVideoPreview,

        showToast,
        showRecordingIndicator,
        hideRecordingIndicator,

        bindButton
    });
})();
