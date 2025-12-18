/**
 * Buzzword Bingo - Interactive Arcade Controls
 * Makes joysticks draggable and buttons clickable for visual feedback
 */

(function() {
    // Joystick configuration - max tilt angle in degrees
    const JOYSTICK_MAX_ANGLE = 20;
    const BG_JOYSTICK_MAX_ANGLE = 15;
    // Sensitivity - how many pixels of mouse movement equals max tilt
    const SENSITIVITY = 30;

    let activeHandle = null;
    let mouseStartPos = { x: 0, y: 0 };

    /**
     * Initialize all interactive controls
     */
    function init() {
        setupJoysticks();
        setupButtons();
    }

    /**
     * Set up draggable joystick handles
     */
    function setupJoysticks() {
        // Target the handle elements, not the base
        const handles = document.querySelectorAll('.joystick-handle');

        handles.forEach(handle => {
            handle.addEventListener('mousedown', startDrag);
            handle.addEventListener('touchstart', startDrag, { passive: false });
        });

        // Global mouse/touch move and up handlers
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('touchmove', onDrag, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    /**
     * Start dragging a joystick handle
     */
    function startDrag(e) {
        e.preventDefault();

        activeHandle = e.currentTarget;
        activeHandle.classList.add('dragging');

        const pos = getEventPosition(e);
        mouseStartPos = { x: pos.x, y: pos.y };
    }

    /**
     * Handle joystick dragging - tilt like a real joystick
     * The handle pivots from its base, so we rotate it
     */
    function onDrag(e) {
        if (!activeHandle) return;

        e.preventDefault();

        const pos = getEventPosition(e);
        const deltaX = pos.x - mouseStartPos.x;
        const deltaY = pos.y - mouseStartPos.y;

        // Determine max angle based on parent joystick type
        const isBackgroundJoystick = activeHandle.parentElement.classList.contains('bg-joystick');
        const maxAngle = isBackgroundJoystick ? BG_JOYSTICK_MAX_ANGLE : JOYSTICK_MAX_ANGLE;

        // Convert mouse movement to tilt angle
        // Positive deltaX (move right) = tilt right = positive rotation
        // Positive deltaY (move down) = tilt forward = shown as slight rotation in 2D
        let tiltX = (deltaX / SENSITIVITY) * maxAngle;
        let tiltY = (deltaY / SENSITIVITY) * maxAngle;

        // Clamp to circular limit
        const magnitude = Math.sqrt(tiltX * tiltX + tiltY * tiltY);
        if (magnitude > maxAngle) {
            const scale = maxAngle / magnitude;
            tiltX *= scale;
            tiltY *= scale;
        }

        // Apply rotation only - pivot stays fixed at base center
        // rotateZ: tilt based on combined X and Y movement direction
        // Calculate angle towards the drag direction
        const angle = Math.atan2(tiltX, -tiltY) * (180 / Math.PI);
        const magnitude = Math.min(Math.sqrt(tiltX * tiltX + tiltY * tiltY), maxAngle);

        // Rotate in the direction of the drag
        activeHandle.style.transform = `rotate(${tiltX}deg)`;
    }

    /**
     * End joystick drag - spring back to center
     */
    function endDrag() {
        if (!activeHandle) return;

        // Animate back to center
        activeHandle.style.transition = 'transform 0.15s ease-out';
        activeHandle.style.transform = 'rotate(0deg)';
        activeHandle.classList.remove('dragging');

        // Remove transition after animation
        const handle = activeHandle;
        setTimeout(() => {
            handle.style.transition = 'none';
        }, 150);

        activeHandle = null;
    }

    /**
     * Set up clickable buttons
     */
    function setupButtons() {
        const buttons = document.querySelectorAll('.arcade-button, .bg-btn');

        buttons.forEach(button => {
            // Mouse events
            button.addEventListener('mousedown', pressButton);
            button.addEventListener('mouseup', releaseButton);
            button.addEventListener('mouseleave', releaseButton);

            // Touch events
            button.addEventListener('touchstart', pressButton, { passive: true });
            button.addEventListener('touchend', releaseButton);
            button.addEventListener('touchcancel', releaseButton);
        });
    }

    /**
     * Press button down
     */
    function pressButton(e) {
        e.currentTarget.classList.add('pressed');
    }

    /**
     * Release button
     */
    function releaseButton(e) {
        e.currentTarget.classList.remove('pressed');
    }

    /**
     * Get position from mouse or touch event
     */
    function getEventPosition(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
