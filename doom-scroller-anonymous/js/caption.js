/**
 * DOOM SCROLLER ANONYMOUS - Caption Module
 * Synchronized captions with karaoke-style highlighting
 */

window.DoomScrollerCaption = (function() {
    'use strict';

    // DOM element
    let captionElement = null;

    // Caption state
    let currentText = '';
    let currentLines = [];
    let currentLineIndex = 0;
    let currentWordIndex = 0;
    let isActive = false;

    // ==========================================
    // INITIALIZATION
    // ==========================================

    function init(element) {
        if (typeof element === 'string') {
            captionElement = document.querySelector(element);
        } else {
            captionElement = element;
        }

        if (!captionElement) {
            console.error('[Caption] Element not found');
            return false;
        }

        return true;
    }

    // ==========================================
    // TEXT MANAGEMENT
    // ==========================================

    function setText(text) {
        currentText = text;
        currentLines = text.split('\n').filter(line => line.trim());
        currentLineIndex = 0;
        currentWordIndex = 0;
        isActive = true;

        // Show first line
        renderCurrentLine();
    }

    function clear() {
        currentText = '';
        currentLines = [];
        currentLineIndex = 0;
        currentWordIndex = 0;
        isActive = false;

        if (captionElement) {
            captionElement.innerHTML = '';
        }
    }

    // ==========================================
    // RENDERING
    // ==========================================

    function renderCurrentLine() {
        if (!captionElement || currentLineIndex >= currentLines.length) {
            return;
        }

        const line = currentLines[currentLineIndex];
        const words = line.split(/\s+/);

        // Build HTML with word spans
        let html = '';
        for (let i = 0; i < words.length; i++) {
            const isHighlighted = i < currentWordIndex;
            const isCurrent = i === currentWordIndex;
            const className = isCurrent ? 'word-current' : (isHighlighted ? 'word-spoken' : 'word-pending');
            html += `<span class="${className}">${escapeHtml(words[i])}</span> `;
        }

        captionElement.innerHTML = html.trim();
    }

    function highlightWord(wordIndex) {
        if (!captionElement || !isActive) return;

        currentWordIndex = wordIndex;

        // Get all word spans
        const spans = captionElement.querySelectorAll('span');
        spans.forEach((span, index) => {
            span.classList.remove('word-current', 'word-spoken', 'word-pending');

            if (index < currentWordIndex) {
                span.classList.add('word-spoken');
            } else if (index === currentWordIndex) {
                span.classList.add('word-current');
            } else {
                span.classList.add('word-pending');
            }
        });
    }

    function advanceWord() {
        const line = currentLines[currentLineIndex];
        if (!line) return;

        const wordCount = line.split(/\s+/).length;

        currentWordIndex++;

        if (currentWordIndex >= wordCount) {
            // Move to next line
            advanceLine();
        } else {
            highlightWord(currentWordIndex);
        }
    }

    function advanceLine() {
        currentLineIndex++;
        currentWordIndex = 0;

        if (currentLineIndex < currentLines.length) {
            renderCurrentLine();
        } else {
            // End of captions
            isActive = false;
        }
    }

    // ==========================================
    // SPEECH SYNC HANDLER
    // ==========================================

    /**
     * Called when speech boundary event fires
     * @param {number} charIndex - Character index in text
     * @param {string} word - Current word being spoken
     */
    function onSpeechWord(charIndex, word) {
        if (!isActive) return;

        // Find which line and word we're on based on character index
        let charCount = 0;
        for (let lineIdx = 0; lineIdx < currentLines.length; lineIdx++) {
            const line = currentLines[lineIdx];
            const lineEnd = charCount + line.length;

            if (charIndex >= charCount && charIndex < lineEnd) {
                // We're on this line
                if (lineIdx !== currentLineIndex) {
                    currentLineIndex = lineIdx;
                    currentWordIndex = 0;
                    renderCurrentLine();
                }

                // Find word position within line
                const posInLine = charIndex - charCount;
                const words = line.split(/\s+/);
                let wordCharCount = 0;

                for (let wordIdx = 0; wordIdx < words.length; wordIdx++) {
                    const wordEnd = wordCharCount + words[wordIdx].length;
                    if (posInLine >= wordCharCount && posInLine < wordEnd + 1) {
                        currentWordIndex = wordIdx;
                        highlightWord(currentWordIndex);
                        break;
                    }
                    wordCharCount = wordEnd + 1; // +1 for space
                }

                break;
            }

            charCount = lineEnd + 1; // +1 for newline
        }
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getCurrentText() {
        if (currentLineIndex < currentLines.length) {
            return currentLines[currentLineIndex];
        }
        return '';
    }

    function getFullText() {
        return currentText;
    }

    // ==========================================
    // CSS INJECTION (for caption styling)
    // ==========================================

    function injectStyles() {
        if (document.getElementById('doom-caption-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'doom-caption-styles';
        styles.textContent = `
            .word-pending {
                color: var(--color-gray-light, #7a7a7a);
                transition: color 0.1s ease;
            }
            .word-spoken {
                color: var(--color-green-crt, #00ff00);
                text-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
                transition: color 0.1s ease;
            }
            .word-current {
                color: var(--color-gold-bright, #ffd700);
                text-shadow: 0 0 12px rgba(255, 215, 0, 0.7);
                font-weight: bold;
                animation: word-pulse 0.3s ease;
            }
            @keyframes word-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(styles);
    }

    // Inject styles on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
        injectStyles();
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return Object.freeze({
        init,
        setText,
        clear,
        highlightWord,
        advanceWord,
        advanceLine,
        onSpeechWord,
        getCurrentText,
        getFullText,
        isActive: () => isActive,
        getCurrentLine: () => currentLineIndex,
        getElement: () => captionElement
    });
})();
