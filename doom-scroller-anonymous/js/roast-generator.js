/**
 * DOOM SCROLLER ANONYMOUS - Roast Generator
 * Assembles MF DOOM-style roast bars from templates and user data
 *
 * Includes DOOM-style ad-libs and flow breaks:
 * - "Mm" interjections
 * - Pauses via punctuation
 * - Conversational transitions
 */

window.DoomScrollerRoastGenerator = (function() {
    'use strict';

    const Config = window.DoomScrollerConfig;

    // DOOM-style ad-libs and transitions
    const AD_LIBS = [
        "Mm.",
        "Mm, mm.",
        "Ahem.",
        "Check it.",
        "Yo.",
        "Listen.",
        "Peep this.",
        "Word."
    ];

    const TRANSITIONS = [
        "Now,",
        "Next up,",
        "Moving on,",
        "And then,",
        "Speaking of which,",
        "But wait,",
        "Here's another one,"
    ];

    // ==========================================
    // TEMPLATE PROCESSING
    // ==========================================

    function fillTemplate(template, data) {
        let result = template;

        result = result.replace(/\{totalTime\}/g, data.totalTime || '0m');
        result = result.replace(/\{time\}/g, data.time || '0m');
        result = result.replace(/\{app\}/g, data.app || 'App');
        result = result.replace(/\{pickups\}/g, data.pickups || '0');
        result = result.replace(/\{notifications\}/g, data.notifications || '0');

        return result;
    }

    function getRandomTemplate(templates) {
        return templates[Math.floor(Math.random() * templates.length)];
    }

    function getRandomAdLib() {
        return AD_LIBS[Math.floor(Math.random() * AD_LIBS.length)];
    }

    function getRandomTransition() {
        return TRANSITIONS[Math.floor(Math.random() * TRANSITIONS.length)];
    }

    function getAppRoast(appName, appTime) {
        const appRoasts = Config.APP_ROASTS[appName];

        if (appRoasts && appRoasts.length > 0) {
            const template = getRandomTemplate(appRoasts);
            return fillTemplate(template, {
                app: appName,
                time: appTime
            });
        }

        const category = Config.getAppCategory(appName);
        const categoryRoasts = Config.APP_ROASTS[category];

        if (categoryRoasts && categoryRoasts.length > 0) {
            const template = getRandomTemplate(categoryRoasts);
            return fillTemplate(template, {
                app: appName,
                time: appTime
            });
        }

        const genericTemplate = getRandomTemplate(Config.APP_ROASTS.GENERIC);
        return fillTemplate(genericTemplate, {
            app: appName,
            time: appTime
        });
    }

    // ==========================================
    // ROAST ASSEMBLY
    // ==========================================

    function generate(screenTimeData) {
        const bars = [];
        const totalTime = Config.formatTime(screenTimeData.totalMinutes);
        const severity = screenTimeData.severity || Config.getSeverityLevel(screenTimeData.totalMinutes);

        const usedOpenings = new Set();
        const usedClosings = new Set();

        // ========== 1. OPENING (with ad-lib intro) ==========
        // Add an opening ad-lib for that DOOM feel
        const introAdLib = Math.random() > 0.3 ? getRandomAdLib() + "\n" : "";

        let openingTemplate;
        do {
            openingTemplate = getRandomTemplate(Config.OPENINGS);
        } while (usedOpenings.has(openingTemplate) && usedOpenings.size < Config.OPENINGS.length);
        usedOpenings.add(openingTemplate);

        const opening = introAdLib + fillTemplate(openingTemplate, { totalTime });
        bars.push(opening);

        // ========== 2. APP ROASTS (with transitions) ==========
        const topApps = screenTimeData.topApps || screenTimeData.apps?.slice(0, 3) || [];

        for (let i = 0; i < Math.min(topApps.length, 3); i++) {
            const app = topApps[i];
            const appTime = Config.formatTime(app.minutes);

            // Add transition or ad-lib before some app roasts
            let prefix = "";
            if (i === 0 && Math.random() > 0.5) {
                prefix = getRandomAdLib() + "\n";
            } else if (i > 0 && Math.random() > 0.4) {
                prefix = getRandomTransition() + "\n";
            }

            const appRoast = prefix + getAppRoast(app.name, appTime);
            bars.push(appRoast);
        }

        // If no apps detected
        if (topApps.length === 0) {
            bars.push(
                "Mm. No apps detected but DOOM still knows\n" +
                "You been doom-scrollin' in secret, that's how it goes"
            );
        }

        // ========== 3. SEVERITY OUTRO ==========
        // Maybe add an ad-lib before the outro
        const outroIntro = Math.random() > 0.6 ? getRandomAdLib() + "\n" : "";

        const severityOutros = Config.SEVERITY_OUTROS[severity] || Config.SEVERITY_OUTROS.MODERATE;
        const outroTemplate = getRandomTemplate(severityOutros);
        const outro = outroIntro + fillTemplate(outroTemplate, { totalTime });
        bars.push(outro);

        // ========== 4. CLOSING ==========
        let closingTemplate;
        do {
            closingTemplate = getRandomTemplate(Config.CLOSINGS);
        } while (usedClosings.has(closingTemplate) && usedClosings.size < Config.CLOSINGS.length);
        usedClosings.add(closingTemplate);

        const closing = fillTemplate(closingTemplate, { totalTime });
        bars.push(closing);

        // ========== COMBINE ALL BARS ==========
        // Add breathing room between sections
        const fullRoast = bars.join('\n\n');

        // Post-process for better TTS delivery
        const processedRoast = processForSpeech(fullRoast);

        const lineCount = processedRoast.split('\n').filter(line => line.trim()).length;

        return {
            text: processedRoast,
            bars: bars,
            lineCount,
            severity,
            totalTime,
            topApps: topApps.map(a => a.name),
            estimatedDuration: calculateDuration(processedRoast)
        };
    }

    /**
     * Process text for better TTS delivery
     * Add pauses and emphasis markers
     */
    function processForSpeech(text) {
        let processed = text;

        // Add slight pauses after commas by ensuring space
        processed = processed.replace(/,(?!\s)/g, ', ');

        // Add pause after certain words DOOM emphasizes
        const emphasisWords = ['DOOM', 'mask', 'scroll', 'time', 'screen'];
        for (const word of emphasisWords) {
            // Add comma after these words if not already punctuated
            const regex = new RegExp(`\\b(${word})(?=[a-z])`, 'gi');
            processed = processed.replace(regex, '$1,');
        }

        return processed;
    }

    function calculateDuration(text) {
        // DOOM's delivery is slower, more deliberate
        // ~100-110 words per minute
        const words = text.split(/\s+/).length;
        const wordsPerSecond = 1.8;
        return Math.ceil(words / wordsPerSecond);
    }

    function splitForCaptions(roastText) {
        const lines = roastText.split('\n').filter(line => line.trim());
        const segments = [];

        for (const line of lines) {
            const words = line.split(/\s+/).length;
            // Slower timing for DOOM's delivery
            const duration = Math.max(2500, words * 450);

            segments.push({
                text: line,
                words: line.split(/\s+/),
                duration,
                wordDuration: duration / words
            });
        }

        return segments;
    }

    function getWordTimings(roastText) {
        const segments = splitForCaptions(roastText);
        const timings = [];
        let currentTime = 0;

        for (const segment of segments) {
            for (let i = 0; i < segment.words.length; i++) {
                timings.push({
                    word: segment.words[i],
                    startTime: currentTime,
                    duration: segment.wordDuration,
                    isLineStart: i === 0,
                    isLineEnd: i === segment.words.length - 1,
                    lineText: segment.text
                });
                currentTime += segment.wordDuration;
            }

            // Pause between lines (DOOM leaves space)
            currentTime += 400;
        }

        return timings;
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return Object.freeze({
        generate,
        splitForCaptions,
        getWordTimings,
        calculateDuration,
        fillTemplate,
        getAppRoast
    });
})();
