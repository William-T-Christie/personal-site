/**
 * Buzzword Bingo - Corporate Jargon Database
 * Weighted scoring system for maximum satirical effect
 */

const BUZZWORDS = {
    // Tier 1: Common Corporate Speak (1 point each)
    tier1: {
        points: 1,
        words: [
            // Basic corporate vocabulary
            { base: 'synergy', variations: ['synergy', 'synergies', 'synergize', 'synergistic', 'synergizing'] },
            { base: 'leverage', variations: ['leverage', 'leveraging', 'leveraged'] },
            { base: 'bandwidth', variations: ['bandwidth'] },
            { base: 'stakeholder', variations: ['stakeholder', 'stakeholders'] },
            { base: 'deliverable', variations: ['deliverable', 'deliverables'] },
            { base: 'actionable', variations: ['actionable'] },
            { base: 'scalable', variations: ['scalable', 'scalability', 'scale'] },
            { base: 'ecosystem', variations: ['ecosystem', 'ecosystems'] },
            { base: 'alignment', variations: ['alignment', 'aligned', 'aligning'] },
            { base: 'streamline', variations: ['streamline', 'streamlined', 'streamlining'] },
            { base: 'optimize', variations: ['optimize', 'optimized', 'optimizing', 'optimization'] },
            { base: 'robust', variations: ['robust'] },
            { base: 'agile', variations: ['agile'] },
            { base: 'visibility', variations: ['visibility'] },
            { base: 'bandwidth', variations: ['bandwidth'] },
            { base: 'holistic', variations: ['holistic', 'holistically'] },
            { base: 'proactive', variations: ['proactive', 'proactively'] },
            { base: 'seamless', variations: ['seamless', 'seamlessly'] },
            { base: 'granular', variations: ['granular', 'granularity'] },
            { base: 'vertical', variations: ['vertical', 'verticals'] },
            { base: 'horizontal', variations: ['horizontal'] },
            { base: 'pipeline', variations: ['pipeline', 'pipelines'] },
            { base: 'roadmap', variations: ['roadmap', 'roadmaps'] },
            { base: 'milestone', variations: ['milestone', 'milestones'] },
            { base: 'onboard', variations: ['onboard', 'onboarding', 'onboarded'] },
            { base: 'offboard', variations: ['offboard', 'offboarding'] },
            { base: 'cadence', variations: ['cadence'] },
            { base: 'touchpoint', variations: ['touchpoint', 'touchpoints', 'touch point', 'touch points'] },
            { base: 'baseline', variations: ['baseline', 'baselines'] },
        ]
    },

    // Tier 2: Extra Corporate Phrases (2 points each)
    tier2: {
        points: 2,
        words: [
            { base: 'circle back', variations: ['circle back', 'circling back'] },
            { base: 'loop in', variations: ['loop in', 'loop you in', 'looping in', 'looped in'] },
            { base: 'touch base', variations: ['touch base', 'touching base'] },
            { base: 'take offline', variations: ['take offline', 'take this offline', 'take that offline', 'taking offline'] },
            { base: 'move the needle', variations: ['move the needle', 'moving the needle', 'moves the needle'] },
            { base: 'low-hanging fruit', variations: ['low-hanging fruit', 'low hanging fruit'] },
            { base: 'deep dive', variations: ['deep dive', 'deep-dive', 'deepdive'] },
            { base: 'best practices', variations: ['best practices', 'best practice'] },
            { base: 'value-add', variations: ['value-add', 'value add', 'added value'] },
            { base: 'win-win', variations: ['win-win', 'win win'] },
            { base: 'game changer', variations: ['game changer', 'game-changer', 'gamechanging', 'game changing'] },
            { base: 'think outside the box', variations: ['think outside the box', 'thinking outside the box', 'outside the box'] },
            { base: 'move forward', variations: ['move forward', 'moving forward', 'going forward'] },
            { base: 'on the same page', variations: ['on the same page', 'same page'] },
            { base: 'run it up the flagpole', variations: ['run it up the flagpole', 'up the flagpole'] },
            { base: 'table this', variations: ['table this', 'table that', 'let\'s table'] },
            { base: 'drill down', variations: ['drill down', 'drilling down'] },
            { base: 'flesh out', variations: ['flesh out', 'flesh this out', 'fleshing out'] },
            { base: 'close the loop', variations: ['close the loop', 'closing the loop'] },
            { base: 'core competency', variations: ['core competency', 'core competencies'] },
            { base: 'learnings', variations: ['learnings', 'key learnings'] },
            { base: 'net-net', variations: ['net-net', 'net net'] },
            { base: 'level set', variations: ['level set', 'level-set', 'level setting'] },
            { base: 'double click', variations: ['double click', 'double-click', 'double clicking'] },
            { base: 'peel back the onion', variations: ['peel back the onion', 'peeling back'] },
            { base: 'get our ducks in a row', variations: ['ducks in a row', 'get our ducks'] },
            { base: 'hard stop', variations: ['hard stop'] },
            { base: 'parking lot', variations: ['parking lot', 'put in the parking lot'] },
            { base: 'action item', variations: ['action item', 'action items'] },
            { base: 'quick win', variations: ['quick win', 'quick wins'] },
        ]
    },

    // Tier 3: Peak Corporate Speak (3 points each)
    tier3: {
        points: 3,
        words: [
            { base: 'boil the ocean', variations: ['boil the ocean', 'boiling the ocean'] },
            { base: 'paradigm shift', variations: ['paradigm shift', 'paradigm-shift', 'shift the paradigm'] },
            { base: 'thought leader', variations: ['thought leader', 'thought leadership', 'thought leaders'] },
            { base: 'disrupt', variations: ['disrupt', 'disruption', 'disruptive', 'disrupting', 'disruptor'] },
            { base: 'ideate', variations: ['ideate', 'ideation', 'ideating'] },
            { base: 'pivot', variations: ['pivot', 'pivoting', 'pivoted'] },
            { base: 'bleeding edge', variations: ['bleeding edge', 'bleeding-edge'] },
            { base: 'north star', variations: ['north star', 'north-star'] },
            { base: 'tiger team', variations: ['tiger team'] },
            { base: 'blue sky', variations: ['blue sky', 'blue-sky', 'blue sky thinking'] },
            { base: 'move fast and break things', variations: ['move fast and break things', 'move fast'] },
            { base: 'eat our own dog food', variations: ['eat our own dog food', 'dog food', 'dogfooding'] },
            { base: 'drink our own champagne', variations: ['drink our own champagne'] },
            { base: 'sharpen the saw', variations: ['sharpen the saw'] },
            { base: 'iron in the fire', variations: ['iron in the fire', 'irons in the fire'] },
            { base: 'put a pin in it', variations: ['put a pin in it', 'put a pin'] },
            { base: 'unpack', variations: ['unpack', 'unpacking', 'let\'s unpack'] },
            { base: 'socialize', variations: ['socialize', 'socializing', 'socialized'] },
            { base: 'operationalize', variations: ['operationalize', 'operationalizing', 'operationalized'] },
            { base: 'productize', variations: ['productize', 'productizing', 'productized'] },
            { base: 'rightsize', variations: ['rightsize', 'rightsizing', 'rightsized'] },
            { base: 'solutioning', variations: ['solutioning', 'solution'] },
            { base: 'resourcing', variations: ['resourcing', 'resourced'] },
            { base: 'greenfield', variations: ['greenfield', 'green field'] },
            { base: 'whitespace', variations: ['whitespace', 'white space'] },
        ]
    },

    // Tier 4: Legendary Corporate Cringe (5 points each)
    tier4: {
        points: 5,
        words: [
            { base: 'at the end of the day', variations: ['at the end of the day'] },
            { base: 'new normal', variations: ['new normal', 'the new normal'] },
            { base: 'open the kimono', variations: ['open the kimono', 'opening the kimono'] },
            { base: 'drink the kool-aid', variations: ['drink the kool-aid', 'drinking the kool-aid', 'kool-aid', 'drank the kool-aid'] },
            { base: 'it is what it is', variations: ['it is what it is'] },
            { base: 'let\'s not reinvent the wheel', variations: ['reinvent the wheel', 'reinventing the wheel'] },
            { base: 'take it to the next level', variations: ['take it to the next level', 'next level', 'next-level'] },
            { base: 'rock star', variations: ['rock star', 'rockstar', 'rock stars'] },
            { base: 'ninja', variations: ['ninja', 'ninjas'] },
            { base: 'guru', variations: ['guru', 'gurus'] },
            { base: 'secret sauce', variations: ['secret sauce'] },
            { base: 'move the goalposts', variations: ['move the goalposts', 'moving the goalposts'] },
            { base: 'throw under the bus', variations: ['throw under the bus', 'thrown under the bus', 'throwing under the bus'] },
            { base: 'swim lane', variations: ['swim lane', 'swim lanes', 'swimlane', 'stay in your lane'] },
            { base: 'bandwidth constrained', variations: ['bandwidth constrained', 'don\'t have the bandwidth'] },
            { base: 'circle of trust', variations: ['circle of trust'] },
            { base: 'helicopter view', variations: ['helicopter view', '30,000 foot view', 'ten thousand foot'] },
            { base: 'ping', variations: ['ping me', 'i\'ll ping', 'pinged'] },
            { base: 'brain dump', variations: ['brain dump', 'braindump'] },
            { base: 'sync up', variations: ['sync up', 'let\'s sync', 'syncing up'] },
        ]
    }
};

// Award titles based on score ranges
const AWARDS = [
    { minScore: 0, maxScore: 10, title: 'REFRESHINGLY HUMAN', description: 'Your meeting was remarkably jargon-free!' },
    { minScore: 11, maxScore: 25, title: 'CORPORATE CURIOUS', description: 'Just dipping your toes in the buzzword pool.' },
    { minScore: 26, maxScore: 50, title: 'MIDDLE MANAGER MATERIAL', description: 'You\'re speaking the language of quarterly reviews.' },
    { minScore: 51, maxScore: 100, title: 'SYNERGY SPECIALIST', description: 'You\'ve mastered the art of saying nothing eloquently.' },
    { minScore: 101, maxScore: 200, title: 'CHIEF BUZZWORD OFFICER', description: 'Peak corporate communication achieved.' },
    { minScore: 201, maxScore: Infinity, title: 'LEGENDARY JARGON JUNKIE', description: 'This meeting could have been an email full of buzzwords.' }
];

// Fun loading messages
const LOADING_MESSAGES = [
    'Detecting synergies...',
    'Measuring bandwidth consumption...',
    'Calculating paradigm shifts...',
    'Analyzing thought leadership...',
    'Identifying low-hanging fruit...',
    'Circling back on analysis...',
    'Taking this offline for processing...',
    'Unpacking corporate speak...',
    'Double-clicking on buzzwords...',
    'Moving the needle on detection...',
    'Leveraging AI capabilities...',
    'Drilling down into data...',
    'Finding quick wins...',
    'Closing the loop...',
    'Peeling back the onion...',
    'Getting ducks in a row...',
    'Aligning on objectives...',
    'Socializing the results...',
    'Operationalizing the analysis...',
    'Blue sky thinking in progress...'
];

/**
 * Get all buzzwords flattened with their point values
 */
function getAllBuzzwords() {
    const allWords = [];

    for (const [tierName, tierData] of Object.entries(BUZZWORDS)) {
        for (const wordData of tierData.words) {
            for (const variation of wordData.variations) {
                allWords.push({
                    word: variation.toLowerCase(),
                    base: wordData.base,
                    points: tierData.points,
                    tier: tierName
                });
            }
        }
    }

    // Sort by length descending to match longer phrases first
    allWords.sort((a, b) => b.word.length - a.word.length);

    return allWords;
}

/**
 * Get award based on score
 */
function getAward(score) {
    for (const award of AWARDS) {
        if (score >= award.minScore && score <= award.maxScore) {
            return award;
        }
    }
    return AWARDS[AWARDS.length - 1];
}

/**
 * Get a random loading message
 */
function getRandomLoadingMessage() {
    return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
}

// Export for use in other modules
window.BuzzwordData = {
    BUZZWORDS,
    AWARDS,
    LOADING_MESSAGES,
    getAllBuzzwords,
    getAward,
    getRandomLoadingMessage
};
