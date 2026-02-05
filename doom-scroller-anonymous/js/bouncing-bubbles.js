/**
 * DOOM SCROLLER ANONYMOUS - Bouncing Bubbles
 * DVD screensaver style bouncing animation
 */

(function() {
    'use strict';

    const bubbles = [];
    const SPEED_MIN = 0.66;
    const SPEED_MAX = 1.65;

    function init() {
        const bubbleElements = document.querySelectorAll('.bouncing-bubble');

        bubbleElements.forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
            const angle = Math.random() * Math.PI * 2;

            bubbles.push({
                el: el,
                x: Math.random() * (window.innerWidth - rect.width),
                y: Math.random() * (window.innerHeight - rect.height),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                width: rect.width,
                height: rect.height
            });

            // Set initial position
            el.style.left = bubbles[i].x + 'px';
            el.style.top = bubbles[i].y + 'px';
        });

        // Start animation
        requestAnimationFrame(animate);
    }

    function animate() {
        bubbles.forEach(bubble => {
            // Update position
            bubble.x += bubble.vx;
            bubble.y += bubble.vy;

            // Bounce off walls
            if (bubble.x <= 0) {
                bubble.x = 0;
                bubble.vx *= -1;
            } else if (bubble.x + bubble.width >= window.innerWidth) {
                bubble.x = window.innerWidth - bubble.width;
                bubble.vx *= -1;
            }

            if (bubble.y <= 0) {
                bubble.y = 0;
                bubble.vy *= -1;
            } else if (bubble.y + bubble.height >= window.innerHeight) {
                bubble.y = window.innerHeight - bubble.height;
                bubble.vy *= -1;
            }

            // Apply position
            bubble.el.style.left = bubble.x + 'px';
            bubble.el.style.top = bubble.y + 'px';
        });

        requestAnimationFrame(animate);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        bubbles.forEach(bubble => {
            // Keep bubbles in bounds after resize
            if (bubble.x + bubble.width > window.innerWidth) {
                bubble.x = window.innerWidth - bubble.width;
            }
            if (bubble.y + bubble.height > window.innerHeight) {
                bubble.y = window.innerHeight - bubble.height;
            }
        });
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
