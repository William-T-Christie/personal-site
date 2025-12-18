/**
 * Buzzword Bingo - Analyzer
 * Scans transcripts for corporate buzzwords and calculates scores
 */

/**
 * Analyze transcript for buzzwords
 * @param {string} transcript - The transcribed text
 * @returns {object} - Analysis results with score, breakdown, and award
 */
function analyzeTranscript(transcript) {
    if (!transcript || typeof transcript !== 'string') {
        return {
            score: 0,
            breakdown: [],
            award: window.BuzzwordData?.getAward(0) || { title: 'REFRESHINGLY HUMAN' },
            totalBuzzwords: 0,
            wordCount: 0
        };
    }

    // Normalize transcript
    const normalizedText = transcript.toLowerCase();
    const wordCount = countWords(transcript);

    // Get all buzzwords
    const allBuzzwords = window.BuzzwordData?.getAllBuzzwords() || [];

    // Track found buzzwords and their counts
    const foundBuzzwords = new Map(); // base word -> { count, points, tier }

    // Track positions already matched to avoid double-counting
    const matchedPositions = new Set();

    // Search for each buzzword (longer phrases first due to sorting)
    for (const buzzword of allBuzzwords) {
        const matches = findAllOccurrences(normalizedText, buzzword.word, matchedPositions);

        if (matches.length > 0) {
            // Mark positions as matched
            for (const match of matches) {
                for (let i = match.start; i < match.end; i++) {
                    matchedPositions.add(i);
                }
            }

            // Aggregate by base word
            if (foundBuzzwords.has(buzzword.base)) {
                const existing = foundBuzzwords.get(buzzword.base);
                existing.count += matches.length;
            } else {
                foundBuzzwords.set(buzzword.base, {
                    base: buzzword.base,
                    count: matches.length,
                    points: buzzword.points,
                    tier: buzzword.tier
                });
            }
        }
    }

    // Convert to breakdown array
    const breakdown = Array.from(foundBuzzwords.values());

    // Calculate total score
    let totalScore = 0;
    let totalBuzzwords = 0;

    for (const item of breakdown) {
        totalScore += item.count * item.points;
        totalBuzzwords += item.count;
    }

    // Get award based on score
    const award = window.BuzzwordData?.getAward(totalScore) || {
        title: 'REFRESHINGLY HUMAN',
        description: 'Your meeting was remarkably jargon-free!'
    };

    return {
        score: totalScore,
        breakdown,
        award,
        totalBuzzwords,
        wordCount
    };
}

/**
 * Find all occurrences of a phrase in text
 * Uses word boundary matching to avoid partial matches
 */
function findAllOccurrences(text, phrase, matchedPositions) {
    const matches = [];
    const phraseLength = phrase.length;

    // Escape special regex characters in the phrase
    const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create regex with word boundaries
    // Handle phrases that might start/end with special characters
    const regex = new RegExp(`(?:^|[\\s.,!?;:'"()\\[\\]{}])${escapedPhrase}(?:[\\s.,!?;:'"()\\[\\]{}]|$)`, 'gi');

    let match;
    while ((match = regex.exec(text)) !== null) {
        // Adjust start position to account for boundary character
        let start = match.index;
        if (match[0][0].match(/[\s.,!?;:'"()\[\]{}]/)) {
            start += 1;
        }

        const end = start + phraseLength;

        // Check if this position is already matched
        let alreadyMatched = false;
        for (let i = start; i < end; i++) {
            if (matchedPositions.has(i)) {
                alreadyMatched = true;
                break;
            }
        }

        if (!alreadyMatched) {
            matches.push({ start, end });
        }

        // Move regex index to continue searching
        regex.lastIndex = match.index + 1;
    }

    return matches;
}

/**
 * Count words in text
 */
function countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Get statistics about the analysis
 */
function getAnalysisStats(analysis) {
    if (!analysis || !analysis.breakdown) {
        return {
            averagePointsPerBuzzword: 0,
            buzzwordDensity: 0,
            topTier: null,
            mostCommon: null
        };
    }

    // Average points per buzzword
    const avgPoints = analysis.totalBuzzwords > 0
        ? (analysis.score / analysis.totalBuzzwords).toFixed(1)
        : 0;

    // Buzzword density (buzzwords per 100 words)
    const density = analysis.wordCount > 0
        ? ((analysis.totalBuzzwords / analysis.wordCount) * 100).toFixed(1)
        : 0;

    // Find most common buzzword
    let mostCommon = null;
    let maxCount = 0;
    for (const item of analysis.breakdown) {
        if (item.count > maxCount) {
            maxCount = item.count;
            mostCommon = item;
        }
    }

    // Find highest tier used
    let topTier = null;
    const tierOrder = ['tier4', 'tier3', 'tier2', 'tier1'];
    for (const tier of tierOrder) {
        if (analysis.breakdown.some(item => item.tier === tier)) {
            topTier = tier;
            break;
        }
    }

    return {
        averagePointsPerBuzzword: avgPoints,
        buzzwordDensity: density,
        topTier,
        mostCommon
    };
}

/**
 * Generate a shareable summary
 */
function generateSummary(analysis) {
    const stats = getAnalysisStats(analysis);

    let summary = `Buzzword Bingo Score: ${analysis.score}\n`;
    summary += `Rank: ${analysis.award.title}\n`;
    summary += `Total buzzwords detected: ${analysis.totalBuzzwords}\n`;

    if (stats.mostCommon) {
        summary += `Most used: "${stats.mostCommon.base}" (${stats.mostCommon.count}x)\n`;
    }

    summary += `Buzzword density: ${stats.buzzwordDensity}%`;

    return summary;
}

// Export for use in other modules
window.Analyzer = {
    analyzeTranscript,
    getAnalysisStats,
    generateSummary
};
