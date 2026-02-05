/**
 * DOOM SCROLLER ANONYMOUS - OCR Module
 * Tesseract.js wrapper for screen time screenshot parsing
 */

window.DoomScrollerOCR = (function() {
    'use strict';

    let worker = null;
    let isInitialized = false;
    let isInitializing = false;

    // ==========================================
    // INITIALIZATION
    // ==========================================

    async function init(onProgress) {
        if (isInitialized) return true;
        if (isInitializing) {
            // Wait for existing initialization
            while (isInitializing) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return isInitialized;
        }

        isInitializing = true;

        try {
            if (onProgress) onProgress(0, 'Loading OCR engine...');

            // Check if Tesseract is available
            if (typeof Tesseract === 'undefined') {
                throw new Error('Tesseract.js not loaded');
            }

            // Create worker with English language
            worker = await Tesseract.createWorker('eng', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text' && onProgress) {
                        onProgress(m.progress * 100, 'Recognizing text...');
                    }
                }
            });

            // Set parameters for better screen time parsing
            await worker.setParameters({
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:hHmMsS ',
                preserve_interword_spaces: '1'
            });

            isInitialized = true;
            isInitializing = false;

            if (onProgress) onProgress(100, 'OCR engine ready');
            return true;

        } catch (error) {
            console.error('[OCR] Initialization failed:', error);
            isInitializing = false;
            throw error;
        }
    }

    // ==========================================
    // IMAGE PREPROCESSING
    // ==========================================

    async function preprocessImage(imageFile) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                // Set canvas size
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw original image
                ctx.drawImage(img, 0, 0);

                // Get image data for processing
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Increase contrast and convert to grayscale for better OCR
                for (let i = 0; i < data.length; i += 4) {
                    // Convert to grayscale
                    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

                    // Increase contrast
                    const contrast = 1.5;
                    const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
                    const newGray = Math.min(255, Math.max(0, factor * (gray - 128) + 128));

                    data[i] = newGray;
                    data[i + 1] = newGray;
                    data[i + 2] = newGray;
                }

                ctx.putImageData(imageData, 0, 0);

                // Convert to blob
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png');
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            // Load image from file
            if (imageFile instanceof Blob) {
                img.src = URL.createObjectURL(imageFile);
            } else if (typeof imageFile === 'string') {
                img.src = imageFile;
            } else {
                reject(new Error('Invalid image input'));
            }
        });
    }

    // ==========================================
    // RECOGNITION
    // ==========================================

    async function recognize(imageFile, onProgress) {
        if (!isInitialized) {
            await init(onProgress);
        }

        try {
            if (onProgress) onProgress(10, 'Preprocessing image...');

            // Preprocess image for better OCR
            const processedImage = await preprocessImage(imageFile);

            if (onProgress) onProgress(20, 'Analyzing screenshot...');

            // Perform OCR
            const result = await worker.recognize(processedImage);

            if (onProgress) onProgress(100, 'Analysis complete');

            return {
                text: result.data.text,
                confidence: result.data.confidence,
                words: result.data.words || [],
                lines: result.data.lines || []
            };

        } catch (error) {
            console.error('[OCR] Recognition failed:', error);
            throw error;
        }
    }

    // ==========================================
    // CLEANUP
    // ==========================================

    async function terminate() {
        if (worker) {
            await worker.terminate();
            worker = null;
            isInitialized = false;
        }
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return Object.freeze({
        init,
        recognize,
        terminate,
        isReady: () => isInitialized
    });
})();
