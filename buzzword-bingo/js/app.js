/**
 * Buzzword Bingo - Main Application
 * Orchestrates the entire flow from upload to results
 */

// Application state
let currentScore = 0;
let currentAnalysis = null;
let isProcessing = false;
let isDemoMode = false;
let isCancelled = false;

// Sample transcript for demo mode - packed with buzzwords!
const DEMO_TRANSCRIPT = `
Alright team, let's circle back on this and make sure we're all aligned. At the end of the day,
we need to leverage our core competencies to move the needle on Q4 deliverables.

I think we should take this offline and do a deep dive into the low-hanging fruit. We've got
some quick wins here if we can just synergize our efforts across verticals. Let's think outside
the box and ideate on how to disrupt the market.

Going forward, I want everyone to be proactive about touching base with stakeholders. We need
to close the loop on action items and make sure we're driving value-add for the ecosystem.
It's about creating synergy and being agile.

The new normal requires us to pivot quickly. Let's not boil the ocean here - we need to
optimize our bandwidth and focus on scalable solutions. I'll ping the tiger team to
level set on our north star metrics.

We should socialize this with the thought leaders and get buy-in from the C-suite.
Remember, at the end of the day, it is what it is. We need to drink the Kool-Aid
and operationalize our learnings. Let's take it to the next level and be rock stars!

Quick wins: circle back with stakeholders, deep dive into analytics, leverage synergies.
Don't forget to loop in the product team and touch base before our hard stop.
We'll paradigm shift our approach and move forward with best practices.
`;

/**
 * Initialize the application
 */
function init() {
    // Check browser support
    const support = window.Transcriber?.checkBrowserSupport();
    if (support && !support.supported) {
        console.warn('Browser support issues:', support.issues);
    }

    // Set up event listeners
    setupFileUpload();
    setupButtons();
    setupKeyboardControls();

    // Show landing screen
    window.UI?.showScreen('landing');

    console.log('Buzzword Bingo initialized!');
}

/**
 * Set up file upload handling
 */
function setupFileUpload() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');

    if (!uploadZone || !fileInput) return;

    // Click to open file picker
    uploadZone.addEventListener('click', () => {
        if (!isProcessing) {
            fileInput.click();
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
        // Reset input so same file can be selected again
        fileInput.value = '';
    });

    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isProcessing) {
            uploadZone.classList.add('dragover');
        }
    });

    uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.remove('dragover');

        if (!isProcessing) {
            const file = e.dataTransfer?.files?.[0];
            if (file) {
                handleFileUpload(file);
            }
        }
    });
}

/**
 * Set up privacy disclaimer toggle
 */
function setupPrivacyToggle() {
    const privacyToggle = document.getElementById('privacy-toggle');
    const disclaimer = document.getElementById('disclaimer');
    const landingContent = document.querySelector('.landing-content');

    if (privacyToggle && disclaimer) {
        privacyToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpening = !disclaimer.classList.contains('active');

            privacyToggle.classList.toggle('active');
            disclaimer.classList.toggle('active');

            // If opening, scroll to show the disclaimer with the toggle button visible
            if (isOpening) {
                setTimeout(() => {
                    // Scroll the privacy toggle into view so user can click to collapse
                    privacyToggle.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else {
                // If closing, scroll back to top
                setTimeout(() => {
                    if (landingContent) {
                        landingContent.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }, 100);
            }
        });
    }
}

/**
 * Set up button event listeners
 */
function setupButtons() {
    // Privacy toggle
    setupPrivacyToggle();

    // Play Again button
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            window.UI?.showScreen('landing');
        });
    }

    // View High Scores button
    const viewScoresBtn = document.getElementById('view-scores-btn');
    if (viewScoresBtn) {
        viewScoresBtn.addEventListener('click', () => {
            window.Leaderboard?.renderLeaderboard();
            window.UI?.showScreen('leaderboard');
        });
    }

    // Back button (from leaderboard)
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (currentAnalysis) {
                window.UI?.showScreen('results');
            } else {
                window.UI?.showScreen('landing');
            }
        });
    }

    // Submit Score button
    const submitScoreBtn = document.getElementById('submit-score-btn');
    if (submitScoreBtn) {
        submitScoreBtn.addEventListener('click', handleScoreSubmit);
    }

    // Demo button
    const demoBtn = document.getElementById('demo-btn');
    if (demoBtn) {
        demoBtn.addEventListener('click', runDemo);
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', handleCancel);
    }
}

/**
 * Handle cancel button click
 */
function handleCancel() {
    if (!isProcessing) return;

    isCancelled = true;
    isProcessing = false;
    window.UI?.stopLoadingMessages();
    window.UI?.showScreen('landing');
}

/**
 * Set up keyboard controls for name entry
 */
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        if (window.UI?.currentScreen !== 'highscore-entry') return;

        // Could add arrow key support here for arcade authenticity
    });
}

/**
 * Handle file upload
 */
async function handleFileUpload(file) {
    if (isProcessing) return;
    isDemoMode = false;
    isCancelled = false;

    // Validate file type
    const mediaType = window.AudioExtractor?.getMediaType(file);
    if (mediaType === 'unknown') {
        window.UI?.showError('Unsupported file type. Please use MP4, WebM, MOV, MP3, WAV, or M4A.');
        return;
    }

    // Check file size (warn for very large files)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
        window.UI?.showError('File is very large. Processing may take a while or fail. Consider using a shorter clip.');
        return;
    }

    isProcessing = true;

    // Show processing screen
    window.UI?.showScreen('processing');
    window.UI?.startLoadingMessages();
    window.UI?.updateProgress(0, 'Preparing...', window.BuzzwordData?.getRandomLoadingMessage());

    try {
        // Step 1: Extract audio
        window.UI?.updateProgress(5, 'Extracting audio...', window.BuzzwordData?.getRandomLoadingMessage());

        const audioBuffer = await window.AudioExtractor?.extractAudio(file, (percent, text) => {
            const adjustedPercent = 5 + (percent * 0.25); // 5-30%
            window.UI?.updateProgress(adjustedPercent, text);
        });

        if (!audioBuffer) {
            throw new Error('Failed to extract audio from file.');
        }

        if (isCancelled) return;

        // Step 2: Load transcription model (if needed)
        window.UI?.updateProgress(30, 'Loading AI model...', window.BuzzwordData?.getRandomLoadingMessage());

        await window.Transcriber?.loadModel((percent, text) => {
            const adjustedPercent = 30 + (percent * 0.2); // 30-50%
            window.UI?.updateProgress(adjustedPercent, text);
        });

        // Hide first-time note after model loads successfully
        window.UI?.hideFirstTimeNote();

        if (isCancelled) return;

        // Step 3: Transcribe
        window.UI?.updateProgress(50, 'Transcribing audio...', window.BuzzwordData?.getRandomLoadingMessage());

        const transcript = await window.Transcriber?.transcribe(audioBuffer, (percent, text) => {
            const adjustedPercent = 50 + (percent * 0.35); // 50-85%
            window.UI?.updateProgress(adjustedPercent, text, window.BuzzwordData?.getRandomLoadingMessage());
        });

        if (!transcript) {
            throw new Error('Failed to transcribe audio. The file may not contain recognizable speech.');
        }

        if (isCancelled) return;

        console.log('Transcript:', transcript.substring(0, 500) + '...');

        // Step 4: Analyze
        window.UI?.updateProgress(90, 'Detecting buzzwords...', window.BuzzwordData?.getRandomLoadingMessage());

        const analysis = window.Analyzer?.analyzeTranscript(transcript);

        if (!analysis) {
            throw new Error('Failed to analyze transcript.');
        }

        console.log('Analysis:', analysis);

        // Store results
        currentScore = analysis.score;
        currentAnalysis = analysis;

        window.UI?.updateProgress(100, 'Analysis complete!');
        window.UI?.stopLoadingMessages();

        // Small delay before showing results
        await new Promise(r => setTimeout(r, 500));

        // Check if high score
        if (window.Leaderboard?.isHighScore(currentScore)) {
            // Show high score entry
            window.UI?.showHighScoreEntry(currentScore);
        } else {
            // Show results directly
            await window.UI?.displayResults(currentScore, analysis.award, analysis.breakdown);
        }

    } catch (error) {
        console.error('Processing error:', error);
        window.UI?.stopLoadingMessages();
        window.UI?.showError(error.message || 'An error occurred while processing your file. Please try again.');
        window.UI?.showScreen('landing');

    } finally {
        isProcessing = false;
    }
}

/**
 * Handle high score submission
 */
async function handleScoreSubmit() {
    const initials = window.UI?.getInitials();

    if (!initials || initials.length !== 3) {
        return;
    }

    // Only add to leaderboard if not in demo mode
    if (!isDemoMode) {
        const rank = await window.Leaderboard?.addHighScore(initials, currentScore);
    }

    // Show results with the score highlighted
    await window.UI?.displayResults(currentScore, currentAnalysis.award, currentAnalysis.breakdown);
}

/**
 * Run demo mode with sample transcript
 */
async function runDemo() {
    if (isProcessing) return;
    isProcessing = true;
    isDemoMode = true;

    // Show processing screen
    window.UI?.showScreen('processing');
    window.UI?.startLoadingMessages();

    // Simulate processing steps
    const steps = [
        { percent: 10, text: 'Loading demo transcript...' },
        { percent: 30, text: 'Skipping audio extraction...' },
        { percent: 50, text: 'Skipping transcription...' },
        { percent: 70, text: 'Analyzing corporate speak...' },
        { percent: 90, text: 'Detecting buzzwords...' },
        { percent: 100, text: 'Analysis complete!' }
    ];

    for (const step of steps) {
        window.UI?.updateProgress(step.percent, step.text, window.BuzzwordData?.getRandomLoadingMessage());
        await new Promise(r => setTimeout(r, 400));
    }

    // Analyze the demo transcript
    const analysis = window.Analyzer?.analyzeTranscript(DEMO_TRANSCRIPT);

    if (!analysis) {
        window.UI?.showError('Demo failed. Please refresh and try again.');
        window.UI?.showScreen('landing');
        isProcessing = false;
        return;
    }

    console.log('Demo Analysis:', analysis);

    // Store results
    currentScore = analysis.score;
    currentAnalysis = analysis;

    window.UI?.stopLoadingMessages();

    // Small delay before showing results
    await new Promise(r => setTimeout(r, 300));

    // Check if high score
    if (window.Leaderboard?.isHighScore(currentScore)) {
        window.UI?.showHighScoreEntry(currentScore);
    } else {
        await window.UI?.displayResults(currentScore, analysis.award, analysis.breakdown);
    }

    isProcessing = false;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for debugging
window.BuzzwordBingo = {
    get score() { return currentScore; },
    get analysis() { return currentAnalysis; },
    get isProcessing() { return isProcessing; },
    reset: () => {
        currentScore = 0;
        currentAnalysis = null;
        isProcessing = false;
        isDemoMode = false;
        window.UI?.showScreen('landing');
    }
};

/**
 * Mega Blast Arcade Cabinet - Random Bomb Drops
 */
function initMegaBlast() {
    const megaBlastScreen = document.querySelector('.megablast');
    if (!megaBlastScreen) return;

    const bombs = megaBlastScreen.querySelectorAll('.bomb');
    const explosions = megaBlastScreen.querySelectorAll('.explosion');

    // Remove CSS animations - we'll handle them with JS
    bombs.forEach(bomb => {
        bomb.style.animation = 'none';
        bomb.style.opacity = '0';
    });
    explosions.forEach(exp => {
        exp.style.animation = 'none';
        exp.style.opacity = '0';
    });

    // Track active animations
    const bombPool = Array.from(bombs);
    const explosionPool = Array.from(explosions);
    let bombIndex = 0;
    let explosionIndex = 0;

    function getRandomX() {
        // Random position between 15% and 85% of screen width
        return 15 + Math.random() * 70;
    }

    function dropBomb() {
        const bomb = bombPool[bombIndex % bombPool.length];
        const explosion = explosionPool[explosionIndex % explosionPool.length];
        bombIndex++;
        explosionIndex++;

        // Random drop position
        const startX = getRandomX();
        const endX = startX + (Math.random() * 20 - 10); // Slight drift
        const endY = 60 + Math.random() * 10; // Land between 60-70% from top

        // Reset bomb
        bomb.style.transition = 'none';
        bomb.style.top = '12%';
        bomb.style.left = startX + '%';
        bomb.style.opacity = '1';

        // Force reflow
        bomb.offsetHeight;

        // Animate bomb falling
        bomb.style.transition = 'top 1.5s ease-in, left 1.5s ease-out, opacity 0.2s';
        bomb.style.top = endY + '%';
        bomb.style.left = endX + '%';

        // Trigger explosion when bomb lands
        setTimeout(() => {
            bomb.style.opacity = '0';
            triggerExplosion(explosion, endX, 100 - endY);
        }, 1400);
    }

    function triggerExplosion(explosion, x, bottomPercent) {
        explosion.style.left = x + '%';
        explosion.style.bottom = bottomPercent + '%';
        explosion.style.opacity = '1';
        explosion.style.transform = 'scale(0.2)';
        explosion.style.background = 'radial-gradient(circle, #fff 0%, #ff0 30%, #f80 60%, #f00 100%)';
        explosion.style.boxShadow = '0 0 10px #ff0, 0 0 20px #f80, 0 0 30px #f00';

        // Force reflow
        explosion.offsetHeight;

        // Animate explosion
        explosion.style.transition = 'transform 0.15s ease-out, opacity 0.8s ease-out';
        explosion.style.transform = 'scale(1.8)';

        // Fade out
        setTimeout(() => {
            explosion.style.opacity = '0';
            explosion.style.transform = 'scale(0.5)';
        }, 200);
    }

    // Drop bombs at random intervals
    function scheduleBomb() {
        const delay = 1500 + Math.random() * 2000; // 1.5-3.5 seconds
        setTimeout(() => {
            dropBomb();
            scheduleBomb();
        }, delay);
    }

    // Start with staggered initial bombs
    setTimeout(() => dropBomb(), 500);
    setTimeout(() => dropBomb(), 1500);
    setTimeout(() => scheduleBomb(), 2500);
    setTimeout(() => scheduleBomb(), 3500);
}

// Initialize Mega Blast when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMegaBlast);
} else {
    initMegaBlast();
}
