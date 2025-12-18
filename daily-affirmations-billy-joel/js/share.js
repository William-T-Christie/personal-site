/**
 * Social Sharing & Image Generation Module
 * Creates cassette-themed shareable images using Canvas API
 */

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

class ShareModule {
    constructor() {
        this.modal = document.getElementById('share-modal');
        this.modalBackdrop = document.getElementById('modal-backdrop');
        this.modalClose = document.getElementById('modal-close');
        this.sharePreview = document.getElementById('share-preview');
        this.currentAffirmation = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modal events
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.closeModal());
        }
        if (this.modalBackdrop) {
            this.modalBackdrop.addEventListener('click', () => this.closeModal());
        }

        // Share action buttons
        document.getElementById('share-download')?.addEventListener('click', () => {
            this.downloadImage();
        });

        document.getElementById('share-twitter')?.addEventListener('click', () => {
            this.shareToTwitter();
        });

        document.getElementById('share-copy')?.addEventListener('click', () => {
            this.copyLink();
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    /**
     * Generate shareable image canvas
     */
    generateShareImage(affirmation) {
        const canvas = document.createElement('canvas');
        canvas.width = CARD_WIDTH;
        canvas.height = CARD_HEIGHT;
        const ctx = canvas.getContext('2d');

        // Draw background
        this.drawBackground(ctx);

        // Draw cassette body
        this.drawCassetteBody(ctx);

        // Draw lyric text
        this.drawLyricText(ctx, affirmation.lyric);

        // Draw attribution
        this.drawAttribution(ctx, affirmation);

        // Draw branding
        this.drawBranding(ctx);

        return canvas;
    }

    drawBackground(ctx) {
        // Warm vintage gradient
        const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
        gradient.addColorStop(0, '#2c1810');
        gradient.addColorStop(1, '#3d261a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

        // Add subtle noise texture pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * CARD_WIDTH;
            const y = Math.random() * CARD_HEIGHT;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    drawCassetteBody(ctx) {
        const cassetteX = (CARD_WIDTH - 900) / 2;
        const cassetteY = 60;
        const cassetteW = 900;
        const cassetteH = 420;

        // Cassette body shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.roundRect(ctx, cassetteX + 8, cassetteY + 8, cassetteW, cassetteH, 16);
        ctx.fill();

        // Cassette body
        const bodyGradient = ctx.createLinearGradient(cassetteX, cassetteY, cassetteX, cassetteY + cassetteH);
        bodyGradient.addColorStop(0, '#3a302a');
        bodyGradient.addColorStop(0.5, '#1a1512');
        bodyGradient.addColorStop(1, '#0a0806');
        ctx.fillStyle = bodyGradient;
        this.roundRect(ctx, cassetteX, cassetteY, cassetteW, cassetteH, 16);
        ctx.fill();

        // Label area
        ctx.fillStyle = '#f5e6d3';
        this.roundRect(ctx, cassetteX + 40, cassetteY + 30, cassetteW - 80, 80, 8);
        ctx.fill();

        // Label stripe
        const stripeGradient = ctx.createLinearGradient(cassetteX + 40, 0, cassetteX + cassetteW - 40, 0);
        stripeGradient.addColorStop(0, '#b87333');
        stripeGradient.addColorStop(0.5, '#d4a030');
        stripeGradient.addColorStop(1, '#b87333');
        ctx.fillStyle = stripeGradient;
        ctx.fillRect(cassetteX + 40, cassetteY + 100, cassetteW - 80, 6);

        // Label text
        ctx.fillStyle = '#4a3520';
        ctx.font = 'bold 24px "DM Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DAILY AFFIRMATIONS WITH BILLY JOEL', CARD_WIDTH / 2, cassetteY + 70);

        // Tape window
        ctx.fillStyle = '#0d0705';
        this.roundRect(ctx, cassetteX + 80, cassetteY + 130, cassetteW - 160, 120, 6);
        ctx.fill();

        // Reels (simplified circles)
        ctx.fillStyle = '#2a1a10';
        ctx.beginPath();
        ctx.arc(cassetteX + 200, cassetteY + 190, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cassetteX + 700, cassetteY + 190, 45, 0, Math.PI * 2);
        ctx.fill();

        // Reel centers
        ctx.fillStyle = '#d4ccc4';
        ctx.beginPath();
        ctx.arc(cassetteX + 200, cassetteY + 190, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cassetteX + 700, cassetteY + 190, 12, 0, Math.PI * 2);
        ctx.fill();

        // Tape path
        ctx.fillStyle = '#3d2817';
        ctx.fillRect(cassetteX + 250, cassetteY + 188, 400, 4);

        // Screws
        this.drawScrew(ctx, cassetteX + 25, cassetteY + 25);
        this.drawScrew(ctx, cassetteX + cassetteW - 25, cassetteY + 25);
        this.drawScrew(ctx, cassetteX + 25, cassetteY + cassetteH - 25);
        this.drawScrew(ctx, cassetteX + cassetteW - 25, cassetteY + cassetteH - 25);
    }

    drawScrew(ctx, x, y) {
        const gradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, 8);
        gradient.addColorStop(0, '#f0ebe6');
        gradient.addColorStop(0.5, '#b8a898');
        gradient.addColorStop(1, '#8a8278');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Screw slot
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 4, y);
        ctx.lineTo(x + 4, y);
        ctx.moveTo(x, y - 4);
        ctx.lineTo(x, y + 4);
        ctx.stroke();
    }

    drawLyricText(ctx, lyric) {
        const cassetteX = (CARD_WIDTH - 900) / 2;
        const cassetteY = 60;

        // LCD display area
        ctx.fillStyle = '#0a1a0a';
        this.roundRect(ctx, cassetteX + 60, cassetteY + 270, 780, 120, 8);
        ctx.fill();

        // Lyric text
        ctx.fillStyle = '#39ff14';
        ctx.font = '28px "VT323", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Add glow effect
        ctx.shadowColor = 'rgba(57, 255, 20, 0.5)';
        ctx.shadowBlur = 15;

        // Word wrap the lyric
        const maxWidth = 720;
        const lines = this.wrapText(ctx, `"${lyric}"`, maxWidth);
        const lineHeight = 36;
        const startY = cassetteY + 330 - ((lines.length - 1) * lineHeight / 2);

        lines.forEach((line, i) => {
            ctx.fillText(line, CARD_WIDTH / 2, startY + (i * lineHeight));
        });

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }

    drawAttribution(ctx, affirmation) {
        ctx.fillStyle = '#faf3e8';
        ctx.font = '600 22px "DM Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${affirmation.song}`,
            CARD_WIDTH / 2,
            520
        );

        ctx.fillStyle = '#d4ccc4';
        ctx.font = '18px "DM Sans", sans-serif';
        ctx.fillText(
            `${affirmation.album} (${affirmation.year})`,
            CARD_WIDTH / 2,
            548
        );
    }

    drawBranding(ctx) {
        ctx.fillStyle = 'rgba(250, 243, 232, 0.5)';
        ctx.font = '16px "DM Sans", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('dailyaffirmations.billyjoel', CARD_WIDTH - 40, CARD_HEIGHT - 30);
    }

    /**
     * Helper: rounded rectangle
     */
    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    /**
     * Helper: word wrap text
     */
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine.trim());
        return lines;
    }

    /**
     * Open share modal
     */
    openModal(affirmation) {
        this.currentAffirmation = affirmation;

        // Generate preview image
        const canvas = this.generateShareImage(affirmation);

        // Scale down for preview
        const previewCanvas = document.createElement('canvas');
        const scale = 0.4;
        previewCanvas.width = CARD_WIDTH * scale;
        previewCanvas.height = CARD_HEIGHT * scale;
        const previewCtx = previewCanvas.getContext('2d');
        previewCtx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);

        // Show in modal
        this.sharePreview.innerHTML = '';
        this.sharePreview.appendChild(previewCanvas);

        // Show modal
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close share modal
     */
    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Download image as PNG
     */
    downloadImage() {
        if (!this.currentAffirmation) return;

        const canvas = this.generateShareImage(this.currentAffirmation);
        const link = document.createElement('a');
        link.download = `billy-joel-affirmation-${this.currentAffirmation.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    /**
     * Share to Twitter/X
     */
    shareToTwitter() {
        if (!this.currentAffirmation) return;

        const text = `"${this.currentAffirmation.lyric}" - Billy Joel, ${this.currentAffirmation.song}`;
        const url = this.getShareUrl();

        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            '_blank',
            'width=550,height=420'
        );
    }

    /**
     * Copy shareable link
     */
    async copyLink() {
        const url = this.getShareUrl();

        try {
            await navigator.clipboard.writeText(url);

            // Visual feedback
            const btn = document.getElementById('share-copy');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>✓</span> Copied!';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback: select text in prompt
            prompt('Copy this link:', url);
        }
    }

    /**
     * Get shareable URL with affirmation ID
     */
    getShareUrl() {
        if (!this.currentAffirmation) return window.location.href;

        const url = new URL(window.location.href);
        url.searchParams.set('id', this.currentAffirmation.id);
        return url.toString();
    }

    /**
     * Try native share (mobile)
     */
    async tryNativeShare(affirmation) {
        if (!navigator.share || !navigator.canShare) {
            return false;
        }

        const canvas = this.generateShareImage(affirmation);

        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], 'affirmation.png', { type: 'image/png' });

            const shareData = {
                title: 'Daily Affirmation from Billy Joel',
                text: `"${affirmation.lyric}" - ${affirmation.song}`,
                files: [file]
            };

            if (navigator.canShare(shareData)) {
                await navigator.share(shareData);
                return true;
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.log('Native share failed, using modal');
            }
        }

        return false;
    }

    /**
     * Main share function
     */
    async share(affirmation) {
        // Try native share first (mobile)
        const nativeShareWorked = await this.tryNativeShare(affirmation);

        if (!nativeShareWorked) {
            // Fall back to modal
            this.openModal(affirmation);
        }
    }
}

// Create global instance
window.ShareModule = new ShareModule();
