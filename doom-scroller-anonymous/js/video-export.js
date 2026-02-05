/**
 * DOOM SCROLLER ANONYMOUS - Video Export Module
 * Records playback canvas + audio for shareable video
 * Operation Doomsday / Madvillainy style
 */

window.DoomScrollerExport = (function() {
    'use strict';

    let mediaRecorder = null;
    let recordedChunks = [];
    let isRecording = false;
    let exportCanvas = null;
    let exportCtx = null;

    const FRAME_RATE = 30;
    const VIDEO_WIDTH = 720;
    const VIDEO_HEIGHT = 720;

    // DOOM mask illustration colors
    const COLORS = {
        bgPurple: '#2a2057',
        bgDark: '#1a1440',
        copperLight: '#f4d4c4',
        copperMid: '#d4a088',
        copperBase: '#c48870',
        copperDark: '#8b5a4a',
        purpleHighlight: '#9080b0',
        gemRed: '#c41030',
        white: '#ffffff',
        gray: '#6a5a8a'
    };

    // ==========================================
    // INITIALIZATION
    // ==========================================

    function init() {
        exportCanvas = document.getElementById('exportCanvas');

        if (!exportCanvas) {
            exportCanvas = document.createElement('canvas');
            exportCanvas.id = 'exportCanvas';
            exportCanvas.width = VIDEO_WIDTH;
            exportCanvas.height = VIDEO_HEIGHT;
            exportCanvas.style.display = 'none';
            document.body.appendChild(exportCanvas);
        }

        exportCanvas.width = VIDEO_WIDTH;
        exportCanvas.height = VIDEO_HEIGHT;
        exportCtx = exportCanvas.getContext('2d');

        return checkSupport();
    }

    function checkSupport() {
        if (typeof MediaRecorder === 'undefined') {
            console.warn('[Export] MediaRecorder not supported');
            return false;
        }
        return true;
    }

    function getSupportedMimeType() {
        const types = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm',
            'video/mp4'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return 'video/webm';
    }

    // ==========================================
    // RECORDING
    // ==========================================

    async function startRecording(maskCanvas, audioContext) {
        if (isRecording) {
            console.warn('[Export] Already recording');
            return false;
        }

        try {
            recordedChunks = [];

            const canvasStream = exportCanvas.captureStream(FRAME_RATE);
            let combinedStream = canvasStream;

            if (audioContext) {
                try {
                    const audioDestination = audioContext.createMediaStreamDestination();

                    if (audioDestination.stream.getAudioTracks().length > 0) {
                        combinedStream = new MediaStream([
                            ...canvasStream.getVideoTracks(),
                            ...audioDestination.stream.getAudioTracks()
                        ]);
                    }
                } catch (audioError) {
                    console.warn('[Export] Audio capture failed:', audioError);
                }
            }

            const mimeType = getSupportedMimeType();
            mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType,
                videoBitsPerSecond: 2500000
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.start(100);
            isRecording = true;

            console.log('[Export] Recording started');
            return true;

        } catch (error) {
            console.error('[Export] Failed to start recording:', error);
            return false;
        }
    }

    function stopRecording() {
        return new Promise((resolve, reject) => {
            if (!mediaRecorder || !isRecording) {
                reject(new Error('Not recording'));
                return;
            }

            mediaRecorder.onstop = () => {
                isRecording = false;

                const mimeType = getSupportedMimeType();
                const blob = new Blob(recordedChunks, { type: mimeType });
                const url = URL.createObjectURL(blob);

                console.log('[Export] Recording stopped, size:', blob.size);

                resolve({
                    blob,
                    url,
                    mimeType,
                    size: blob.size
                });
            };

            mediaRecorder.onerror = (error) => {
                isRecording = false;
                reject(error);
            };

            mediaRecorder.stop();
        });
    }

    // ==========================================
    // FRAME RENDERING - Operation Doomsday Style
    // ==========================================

    function renderFrame(maskCanvas, captionText, options = {}) {
        if (!exportCtx) return;

        const {
            showCaptions = true,
            showWatermark = true
        } = options;

        // Deep purple background gradient
        const bgGrad = exportCtx.createRadialGradient(
            VIDEO_WIDTH/2, VIDEO_HEIGHT/2, 0,
            VIDEO_WIDTH/2, VIDEO_HEIGHT/2, VIDEO_WIDTH * 0.7
        );
        bgGrad.addColorStop(0, COLORS.bgPurple);
        bgGrad.addColorStop(1, COLORS.bgDark);
        exportCtx.fillStyle = bgGrad;
        exportCtx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

        // Copper radial glow behind mask
        drawBackgroundGlow();

        // Draw mask
        if (maskCanvas) {
            const maskSize = Math.min(VIDEO_WIDTH, VIDEO_HEIGHT) * 0.7;
            const maskX = (VIDEO_WIDTH - maskSize) / 2;
            const maskY = 30;

            exportCtx.imageSmoothingEnabled = false;
            exportCtx.drawImage(maskCanvas, maskX, maskY, maskSize, maskSize);
        }

        // Draw captions
        if (showCaptions && captionText) {
            drawCaptions(captionText);
        }

        // Draw watermark
        if (showWatermark) {
            drawWatermark();
        }

        // Add grain
        drawGrain();
    }

    function drawBackgroundGlow() {
        const gradient = exportCtx.createRadialGradient(
            VIDEO_WIDTH / 2, VIDEO_HEIGHT / 2 - 50, 0,
            VIDEO_WIDTH / 2, VIDEO_HEIGHT / 2 - 50, VIDEO_WIDTH * 0.4
        );
        gradient.addColorStop(0, 'rgba(196, 136, 112, 0.2)');
        gradient.addColorStop(0.5, 'rgba(196, 136, 112, 0.05)');
        gradient.addColorStop(1, 'transparent');

        exportCtx.fillStyle = gradient;
        exportCtx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    }

    function drawCaptions(text) {
        const captionY = VIDEO_HEIGHT - 100;
        const maxWidth = VIDEO_WIDTH - 80;

        // Caption background bar
        const bgGradient = exportCtx.createLinearGradient(0, captionY - 40, 0, captionY + 50);
        bgGradient.addColorStop(0, 'transparent');
        bgGradient.addColorStop(0.2, 'rgba(26, 20, 64, 0.9)');
        bgGradient.addColorStop(0.8, 'rgba(26, 20, 64, 0.9)');
        bgGradient.addColorStop(1, 'transparent');

        exportCtx.fillStyle = bgGradient;
        exportCtx.fillRect(0, captionY - 40, VIDEO_WIDTH, 90);

        // Copper accent line
        exportCtx.fillStyle = COLORS.copperMid;
        exportCtx.fillRect(40, captionY - 40, 4, 90);

        // Caption text
        exportCtx.font = 'bold 28px "VT323", monospace';
        exportCtx.fillStyle = COLORS.copperLight;
        exportCtx.textAlign = 'center';
        exportCtx.textBaseline = 'middle';

        // Word wrap
        const words = text.split(' ');
        let line = '';
        let lines = [];

        for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word;
            const metrics = exportCtx.measureText(testLine);

            if (metrics.width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        const lineHeight = 32;
        const startY = captionY + (lines.length === 1 ? 5 : -10);

        lines.forEach((l, i) => {
            // Subtle glow
            exportCtx.shadowColor = COLORS.copperMid;
            exportCtx.shadowBlur = 10;
            exportCtx.fillText(l.toUpperCase(), VIDEO_WIDTH / 2, startY + i * lineHeight);
            exportCtx.shadowBlur = 0;
        });
    }

    function drawWatermark() {
        exportCtx.font = '16px "Space Mono", monospace';
        exportCtx.fillStyle = COLORS.copperMid;
        exportCtx.globalAlpha = 0.6;
        exportCtx.textAlign = 'right';
        exportCtx.textBaseline = 'bottom';
        exportCtx.fillText('DOOM SCROLLER ANONYMOUS', VIDEO_WIDTH - 20, VIDEO_HEIGHT - 15);
        exportCtx.globalAlpha = 1;
    }

    function drawGrain() {
        exportCtx.globalAlpha = 0.06;
        for (let i = 0; i < 100; i++) {
            exportCtx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
            exportCtx.fillRect(
                Math.random() * VIDEO_WIDTH,
                Math.random() * VIDEO_HEIGHT,
                1, 1
            );
        }
        exportCtx.globalAlpha = 1;
    }

    // ==========================================
    // DOWNLOAD
    // ==========================================

    function downloadVideo(url, filename = 'doom-scroller-roast.webm') {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function revokeUrl(url) {
        URL.revokeObjectURL(url);
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return Object.freeze({
        init,
        checkSupport,
        getSupportedMimeType,

        startRecording,
        stopRecording,
        isRecording: () => isRecording,

        renderFrame,
        downloadVideo,
        revokeUrl,

        getCanvas: () => exportCanvas,
        getContext: () => exportCtx,

        VIDEO_WIDTH,
        VIDEO_HEIGHT,
        FRAME_RATE
    });
})();
