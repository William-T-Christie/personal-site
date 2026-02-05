/**
 * DOOM SCROLLER ANONYMOUS - Mask Renderer
 * Displays MF DOOM mask image
 */

window.DoomScrollerMask = (function() {
    'use strict';

    let canvas = null;
    let ctx = null;
    let animationFrame = null;
    let isRunning = false;
    let maskImage = null;
    let imageLoaded = false;

    // Mouth state for speech sync (subtle scale effect)
    let mouthOpenness = 0;
    let targetMouthOpenness = 0;

    function init(canvasElement) {
        if (typeof canvasElement === 'string') {
            canvas = document.querySelector(canvasElement);
        } else {
            canvas = canvasElement;
        }

        if (!canvas) {
            console.error('[Mask] Canvas element not found');
            return false;
        }

        ctx = canvas.getContext('2d');

        const size = Math.min(canvas.offsetWidth || 400, canvas.offsetHeight || 400);
        canvas.width = size;
        canvas.height = size;

        // Load the mask image
        loadMaskImage();

        return true;
    }

    function loadMaskImage() {
        maskImage = new Image();
        maskImage.onload = function() {
            imageLoaded = true;
            console.log('[Mask] Image loaded successfully');
            draw();
        };
        maskImage.onerror = function() {
            console.error('[Mask] Failed to load mask image');
            // Draw fallback
            drawFallback();
        };
        maskImage.src = 'assets/images/doom-mask.png';
    }

    function start() {
        if (isRunning) return;
        isRunning = true;
        animationFrame = requestAnimationFrame(render);
    }

    function stop() {
        isRunning = false;
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    function render() {
        if (!isRunning || !ctx) return;
        mouthOpenness += (targetMouthOpenness - mouthOpenness) * 0.2;
        draw();
        animationFrame = requestAnimationFrame(render);
    }

    function draw() {
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        if (imageLoaded && maskImage) {
            // Calculate size to fit canvas while maintaining aspect ratio
            const imgAspect = maskImage.width / maskImage.height;
            let drawWidth, drawHeight;

            if (imgAspect > 1) {
                drawWidth = w * 0.85;
                drawHeight = drawWidth / imgAspect;
            } else {
                drawHeight = h * 0.85;
                drawWidth = drawHeight * imgAspect;
            }

            const x = (w - drawWidth) / 2;
            const y = (h - drawHeight) / 2;

            // Draw mask (no scaling/animation)
            ctx.drawImage(maskImage, x, y, drawWidth, drawHeight);
        } else {
            drawFallback();
        }
    }

    function drawFallback() {
        // Simple fallback if image doesn't load
        const w = canvas.width;
        const h = canvas.height;

        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2, w*0.35, h*0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#c48870';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DOOM MASK', w/2, h/2);
        ctx.fillText('(image not loaded)', w/2, h/2 + 20);
    }

    // Control methods
    function setMouthOpen(isOpen) {
        targetMouthOpenness = isOpen ? 1 : 0;
    }

    function setMouthState(state) {
        targetMouthOpenness = Math.max(0, Math.min(1, state / 3));
    }

    function openMouth() {
        targetMouthOpenness = 1;
    }

    function closeMouth() {
        targetMouthOpenness = 0;
    }

    function setBeatPosition(position) {
        // No-op - static mask
    }

    function renderFrame() {
        if (!canvas || !ctx) return;
        mouthOpenness += (targetMouthOpenness - mouthOpenness) * 0.2;
        draw();
    }

    return Object.freeze({
        init,
        start,
        stop,
        render: renderFrame,
        setMouthState,
        setMouthOpen,
        openMouth,
        closeMouth,
        setBeatPosition,
        getCanvas: () => canvas,
        isRunning: () => isRunning
    });
})();
