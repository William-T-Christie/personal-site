/**
 * DOOM SCROLLER ANONYMOUS - Parser Module
 * Extracts structured screen time data from OCR text
 */

window.DoomScrollerParser = (function() {
    'use strict';

    const Config = window.DoomScrollerConfig;

    // ==========================================
    // REGEX PATTERNS
    // ==========================================

    const PATTERNS = {
        // Match time formats: "2h 30m", "2h30m", "45m", "1h", "2 hr 30 min"
        TIME: /(\d{1,2})\s*h(?:r|our)?s?\s*(?:(\d{1,2})\s*m(?:in)?)?|(\d{1,2})\s*m(?:in)?/gi,

        // Match app name followed by time (iOS Screen Time format)
        APP_LINE: /^(.+?)\s+(\d{1,2}\s*h(?:r)?(?:\s*\d{1,2}\s*m)?|\d{1,2}\s*m(?:in)?)\s*$/gim,

        // Match daily average or total
        DAILY_TOTAL: /(?:daily\s*average|screen\s*time|total)[:\s]*(\d{1,2}\s*h(?:r)?(?:\s*\d{1,2}\s*m)?|\d{1,2}\s*m)/gi,

        // Match pickups count
        PICKUPS: /(\d+)\s*pickups?/gi,

        // Match notifications count
        NOTIFICATIONS: /(\d+)\s*notifications?/gi
    };

    // Common app name patterns for better matching
    const KNOWN_APPS = [
        'Instagram', 'TikTok', 'Twitter', 'X', 'Facebook', 'Snapchat',
        'Reddit', 'YouTube', 'Netflix', 'Hulu', 'Disney', 'Twitch',
        'Spotify', 'Safari', 'Chrome', 'Messages', 'Mail', 'Gmail',
        'WhatsApp', 'Telegram', 'Discord', 'Slack', 'Tinder', 'Bumble',
        'Amazon', 'eBay', 'Uber', 'Lyft', 'DoorDash', 'Photos',
        'Camera', 'Settings', 'App Store', 'Music', 'Podcasts',
        'Maps', 'Weather', 'News', 'Stocks', 'Notes', 'Calendar',
        'Reminders', 'Clock', 'Health', 'Fitness', 'Wallet'
    ];

    // ==========================================
    // PARSING FUNCTIONS
    // ==========================================

    /**
     * Parse time string to minutes
     */
    function parseTimeToMinutes(timeStr) {
        if (!timeStr) return 0;

        let totalMinutes = 0;
        const str = timeStr.toLowerCase().trim();

        // Match hours
        const hoursMatch = str.match(/(\d{1,2})\s*h/);
        if (hoursMatch) {
            totalMinutes += parseInt(hoursMatch[1], 10) * 60;
        }

        // Match minutes
        const minsMatch = str.match(/(\d{1,2})\s*m/);
        if (minsMatch) {
            totalMinutes += parseInt(minsMatch[1], 10);
        }

        return totalMinutes;
    }

    /**
     * Apply OCR corrections to text
     */
    function applyCorrections(text) {
        let corrected = text;
        for (const [wrong, right] of Object.entries(Config.OCR_CORRECTIONS)) {
            corrected = corrected.replace(new RegExp(wrong, 'gi'), right);
        }
        return corrected;
    }

    /**
     * Find best matching known app name
     */
    function findKnownApp(appName) {
        const normalized = appName.toLowerCase().trim();

        // Direct match
        for (const known of KNOWN_APPS) {
            if (normalized.includes(known.toLowerCase())) {
                return known;
            }
        }

        // Fuzzy match (for OCR errors)
        for (const known of KNOWN_APPS) {
            const knownLower = known.toLowerCase();
            // Check if at least 70% of characters match
            let matches = 0;
            for (let i = 0; i < Math.min(normalized.length, knownLower.length); i++) {
                if (normalized[i] === knownLower[i]) matches++;
            }
            if (matches / knownLower.length > 0.7) {
                return known;
            }
        }

        // Return cleaned original if no match
        return appName.trim();
    }

    /**
     * Extract apps and times from OCR text
     */
    function extractApps(text) {
        const apps = [];
        const lines = text.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.length < 3) continue;

            // Try to match app name + time pattern
            const timeMatch = trimmedLine.match(/(\d{1,2}\s*h(?:r)?(?:\s*\d{1,2}\s*m)?|\d{1,2}\s*m(?:in)?)\s*$/i);

            if (timeMatch) {
                const timeStr = timeMatch[1];
                const appName = trimmedLine.slice(0, timeMatch.index).trim();

                if (appName && appName.length > 1) {
                    const minutes = parseTimeToMinutes(timeStr);
                    if (minutes > 0) {
                        apps.push({
                            name: findKnownApp(appName),
                            rawName: appName,
                            minutes: minutes,
                            timeString: timeStr.trim()
                        });
                    }
                }
            }
        }

        // Sort by minutes (descending)
        apps.sort((a, b) => b.minutes - a.minutes);

        // Remove duplicates (keep highest time)
        const seen = new Set();
        return apps.filter(app => {
            const key = app.name.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    /**
     * Extract total/daily average time
     */
    function extractTotalTime(text) {
        const matches = text.match(PATTERNS.DAILY_TOTAL);
        if (matches && matches.length > 0) {
            // Get the first match and parse it
            const timeMatch = matches[0].match(/(\d{1,2}\s*h(?:r)?(?:\s*\d{1,2}\s*m)?|\d{1,2}\s*m)/i);
            if (timeMatch) {
                return parseTimeToMinutes(timeMatch[1]);
            }
        }
        return 0;
    }

    /**
     * Extract pickups count
     */
    function extractPickups(text) {
        const match = text.match(PATTERNS.PICKUPS);
        if (match) {
            const numMatch = match[0].match(/(\d+)/);
            return numMatch ? parseInt(numMatch[1], 10) : 0;
        }
        return 0;
    }

    /**
     * Extract notifications count
     */
    function extractNotifications(text) {
        const match = text.match(PATTERNS.NOTIFICATIONS);
        if (match) {
            const numMatch = match[0].match(/(\d+)/);
            return numMatch ? parseInt(numMatch[1], 10) : 0;
        }
        return 0;
    }

    /**
     * Main parse function
     */
    function parse(rawText) {
        // Apply OCR corrections
        const text = applyCorrections(rawText);

        // Extract all data
        const apps = extractApps(text);

        // Calculate total from apps if not found in text
        let totalMinutes = extractTotalTime(text);
        if (totalMinutes === 0 && apps.length > 0) {
            totalMinutes = apps.reduce((sum, app) => sum + app.minutes, 0);
        }

        // Get severity level
        const severity = Config.getSeverityLevel(totalMinutes);

        return {
            totalMinutes,
            totalTimeFormatted: Config.formatTime(totalMinutes),
            apps,
            topApps: apps.slice(0, 5),
            pickups: extractPickups(text),
            notifications: extractNotifications(text),
            severity,
            rawText: text,
            appCount: apps.length
        };
    }

    /**
     * Validate parsed data has enough info for a roast
     */
    function validate(parsedData) {
        const errors = [];

        if (parsedData.apps.length === 0) {
            errors.push('No apps detected in screenshot');
        }

        if (parsedData.totalMinutes === 0) {
            errors.push('Could not detect screen time');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Generate mock data for testing/demo
     */
    function generateMockData() {
        return {
            totalMinutes: 347,
            totalTimeFormatted: '5h 47m',
            apps: [
                { name: 'TikTok', minutes: 127, timeString: '2h 7m' },
                { name: 'Instagram', minutes: 89, timeString: '1h 29m' },
                { name: 'YouTube', minutes: 52, timeString: '52m' },
                { name: 'Twitter', minutes: 41, timeString: '41m' },
                { name: 'Reddit', minutes: 38, timeString: '38m' }
            ],
            topApps: [
                { name: 'TikTok', minutes: 127, timeString: '2h 7m' },
                { name: 'Instagram', minutes: 89, timeString: '1h 29m' },
                { name: 'YouTube', minutes: 52, timeString: '52m' }
            ],
            pickups: 87,
            notifications: 234,
            severity: 'HEAVY',
            appCount: 5
        };
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return Object.freeze({
        parse,
        validate,
        parseTimeToMinutes,
        generateMockData
    });
})();
