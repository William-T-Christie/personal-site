/**
 * DOOM SCROLLER ANONYMOUS - Configuration
 * Constants, thresholds, and MF DOOM-style roast templates
 *
 * Style notes from the supervillain himself:
 * - 43% rhyme density (highest of any rapper)
 * - Dense internal rhymes, rarely simple end rhymes
 * - Alliteration clusters
 * - Food references woven throughout
 * - Comic book / cartoon / sci-fi references
 * - Third person self-reference as "DOOM" (ALL CAPS)
 * - Dark humor with actual wit
 * - "Triple word score" - multiple meanings layered
 */

window.DoomScrollerConfig = (function() {
    'use strict';

    // ==========================================
    // SEVERITY THRESHOLDS (in minutes)
    // ==========================================
    const SEVERITY = Object.freeze({
        LIGHT: 120,      // < 2 hours - amateur
        MODERATE: 240,   // 2-4 hours - concerning
        HEAVY: 360,      // 4-6 hours - problematic
        EXTREME: 480     // 6+ hours - certified fiend
    });

    // ==========================================
    // APP CATEGORIES
    // ==========================================
    const APP_CATEGORIES = Object.freeze({
        SOCIAL: ['Instagram', 'TikTok', 'Twitter', 'X', 'Facebook', 'Snapchat', 'Reddit', 'Threads', 'BeReal'],
        STREAMING: ['YouTube', 'Netflix', 'Hulu', 'Disney+', 'HBO Max', 'Twitch', 'Prime Video', 'Spotify'],
        DATING: ['Tinder', 'Bumble', 'Hinge', 'Grindr', 'OkCupid', 'Match'],
        GAMES: ['Candy Crush', 'Pokemon', 'Clash', 'Roblox', 'Fortnite', 'Among Us', 'Wordle'],
        MESSAGING: ['Messages', 'WhatsApp', 'Telegram', 'Discord', 'Slack', 'iMessage'],
        PRODUCTIVITY: ['Mail', 'Gmail', 'Outlook', 'Notion', 'Notes', 'Calendar'],
        SHOPPING: ['Amazon', 'eBay', 'Etsy', 'Uber Eats', 'DoorDash', 'Instacart']
    });

    // ==========================================
    // OCR CORRECTIONS
    // ==========================================
    const OCR_CORRECTIONS = Object.freeze({
        '1nstagram': 'Instagram',
        'lnstagram': 'Instagram',
        'T1kTok': 'TikTok',
        'Tw1tter': 'Twitter',
        'YouIube': 'YouTube',
        'Youtub3': 'YouTube',
        'Netfl1x': 'Netflix',
        'Spotlfy': 'Spotify',
        'Amaz0n': 'Amazon',
        'Fac3book': 'Facebook',
        'Sn4pchat': 'Snapchat',
        'R3ddit': 'Reddit',
        'D1scord': 'Discord',
        'Wh4tsApp': 'WhatsApp'
    });

    // ==========================================
    // SPEECH SETTINGS
    // ==========================================
    const VOICE = Object.freeze({
        PITCH: 0.8,         // Slightly deep
        RATE: 0.9,          // Slightly slow, deliberate
        PREFERRED_VOICES: [
            'Daniel',
            'Alex',
            'Google UK English Male',
            'Microsoft David',
            'en-GB',
            'en-US'
        ]
    });

    // ==========================================
    // ANIMATION SETTINGS
    // ==========================================
    const ANIMATION = Object.freeze({
        BPM: 90,
        BAR_DURATION: 2666,
        BEAT_DURATION: 666,
        MOUTH_OPEN_DURATION: 100,
        HEAD_BOB_AMPLITUDE: 3,
        EYE_GLOW_MIN: 0.3,
        EYE_GLOW_MAX: 1.0
    });

    // ==========================================
    // PROCESSING MESSAGES
    // ==========================================
    const PROCESSING_MESSAGES = Object.freeze([
        "ALL CAPS when you spell the man name...",
        "DOOM reads your data like a rhyme book...",
        "Scanning screen crimes, won't take long...",
        "The metal face reviews the evidence...",
        "Peeping your digital rap sheet...",
        "Calculating the depths of your doom scroll...",
        "Just remember, DOOM sees everything...",
        "The supervillain studies your stats...",
        "Mm, food for thought in this data...",
        "Assembling bars from your digital scars..."
    ]);

    // ==========================================
    // ROAST TEMPLATES - MF DOOM STYLE
    // ==========================================

    /**
     * OPENING BARS
     * Set the scene, establish {totalTime} as the crime
     * Heavy internal rhymes, alliteration
     */
    const OPENINGS = Object.freeze([
        "Ahem, DOOM here to crack the code on your scroll\n{totalTime} deep in that phone, lost your soul in the hole",

        "Peek the metal face, catch a case of the facts\n{totalTime} of your life spent staring at apps, relax, it's only wax",

        "Yo, check the stats, DOOM sees it all from the mask\n{totalTime} on that glass? Son you been had, that's mad",

        "The supervillain emerged from the digital fog\n{totalTime} logged like a hog in a blog, that's your job?",

        "DOOM back from the dead to read you your wrongs\n{totalTime} gone? That's a villain's worth of songs",

        "Step to the mic, spike the data like Doom spiked the punch\n{totalTime} today, more hours than a business lunch",

        "Mmm, peep the read, proceed to bleed out the feed\n{totalTime} of screen fiend, that's quite the deed indeed",

        "The mask don't lie, fry your alibi, why try to hide?\n{totalTime} on that ride, your thumbs certified fried"
    ]);

    /**
     * APP-SPECIFIC ROASTS
     * Each gets tailored bars with DOOM-style references
     * Internal rhymes, food refs, pop culture, wit
     */
    const APP_ROASTS = Object.freeze({
        // === SOCIAL MEDIA ===
        'TikTok': [
            "{time} on the clock for the Tok, doc, brain on the rocks\nForty-five seconds got you locked in a box like a paradox",

            "TikTok fiend, {time} of the dream cream, so it seem\nSwipe up on the scheme, your attention chopped up like cuisine",

            "{time} of the clock Tok rot, thought you were hot?\nScroll scroll scroll, sold your whole focus for a thot"
        ],

        'Instagram': [
            "The 'Gram scam, {time} of the grand sham, fam\nDouble-tap trap, your self-esteem in the spam can like ham",

            "{time} grammin' and slammin' through stories, what's the glory?\nPeepin' lives through a lens while yours stay allegory",

            "Instagram gotcha for {time}, paradigm of grime\nFiltered faces, fake places, chasin' likes like dimes"
        ],

        'Twitter': [
            "{time} on the bird app, absurd rap, heard that?\nArguin' with eggs and bots, your brain's a curd trap",

            "X marks the rot, {time} of hot takes forgot\nDoom-scrollin' through the lot while your real thoughts go to pot",

            "Twitter fingers for {time}, bitter singers in the mire\nType type type, all hype, meanwhile your dreams expire"
        ],

        'Facebook': [
            "{time} on the book of face, a disgrace to the space race\nMinion memes and your aunt's schemes, boomer base case",

            "Facebook fiend, {time} of the scene unseen\nZuck got your data while you're posting where you've been, unclean"
        ],

        'Reddit': [
            "{time} on the Reddit spread, better fed your head\nSubreddit rabbit holes got your productivity dead, misled",

            "The front page of your cage, {time} engaged in the rage\nUpvotes like dope notes, sold your focus for the upstage"
        ],

        'Snapchat': [
            "{time} on the Snap app, cap after cap, a trap\nGhost mode on your goals while you chase that streak like a sap",

            "Snap trap, {time} of the map, clap clap\nDisappearing pics while your ambitions take a nap, no cap"
        ],

        // === STREAMING ===
        'YouTube': [
            "{time} in the Tube, rube, lost in the cube of lube\nOne more video turns to fifty, your schedule's in a mood",

            "YouTube rabbit stew, {time} of the view-through true blue\nAlgorithm's got you hooked like Krusty's Crew, boo hoo",

            "{time} watching how-tos you'll never do, too true\nDIY dreams while your real life's overdue, unglued"
        ],

        'Netflix': [
            "Netflix flex, {time} of the complex perplex\nBinge the whole season while your goals become your ex",

            "'Are you still watching?' Yes, confess, {time} of distress\nChill got you still while your potential decompressed, I guess",

            "{time} of the flix, mix of tricks for your fix\nLiving through the screen, your own story's in the sticks"
        ],

        'Twitch': [
            "{time} on the Twitch switch, which is which, rich?\nWatching others game while you're sitting in the ditch, snitch",

            "Twitch glitch, {time} of the pitch, scratch that itch\nDonating to millionaires while you can't afford the rent hitch"
        ],

        'Spotify': [
            "{time} on the Spot, hot, that's all you got? Not\nAt least you got taste, DOOM will give you that prop, don't stop"
        ],

        // === DATING ===
        'Tinder': [
            "{time} on the Tinder cinder, remember when you had dinner?\nSwipe right all night, still dining alone, beginner",

            "Tinder splinter, {time} of the winter, no winner\nMatching with bots while your love life gets thinner and thinner"
        ],

        'Bumble': [
            "{time} on the Bumble fumble, humble mumble\nWaiting for a message while your confidence crumble and tumble"
        ],

        'Hinge': [
            "Hinge cringe, {time} of the fringe binge\nDesigned to be deleted but you're still on the hinge, unhinged"
        ],

        // === GAMES ===
        'Games': [
            "{time} on the games, claims of fame in flames\nHigh scores galore but your real life remains the same, what a shame",

            "Mobile game frame, {time} of the lame brain drain\nCandy crushed your ambitions, now your progress is plain"
        ],

        // === MESSAGING ===
        'Messages': [
            "{time} in the text, vexed and perplexed, what's next?\nAt least you're talkin' to humans, DOOM gives that respect"
        ],

        'Discord': [
            "{time} on the Discord cord, bored, floored, and ignored\nServer hopping while your real relationships get stored"
        ],

        // === GENERIC FALLBACK ===
        'GENERIC': [
            "{time} on {app}, the trap that saps your cap\nDoom sees the data, now take that and put it in your lap",

            "{app} got your time, {time} of the prime crime\nAnother app snatching minutes while you're stuck in the paradigm",

            "{time} of your life to {app}, the graph don't lie\nDOOM watches from the mask as your hours wave bye-bye"
        ]
    });

    /**
     * SEVERITY OUTROS
     * Based on total time, escalating intensity
     */
    const SEVERITY_OUTROS = Object.freeze({
        LIGHT: [
            "Only {totalTime}? That's the appetizer plate\nDOOM expected more from you, rookie mistake, but wait",

            "{totalTime} is light, you fight the good fight, alright\nBut tomorrow the algorithm strikes back in the night",

            "Just {totalTime}? Amateur hour at the tower\nCome back when you got some real doom-scroll power"
        ],

        MODERATE: [
            "{totalTime} today, decay on display, cliché\nHalfway to hooked, your focus got cooked, okay?",

            "Four hours in the digital din, the spin begins again\nDOOM's seen this before, you're teetering on the thin",

            "{totalTime} of the grind, mind left behind, you'll find\nThe algorithm got you signed, sealed, and defined"
        ],

        HEAVY: [
            "{totalTime}? Now we're cooking with gas, crass and brass\nYour thumb's got a rash from scrolling so fast, first class",

            "Heavy on the screen time, {totalTime} of the crime time\nDOOM's impressed and distressed by your prime slime climb",

            "{totalTime} deep, you don't sleep, just creep and peep\nDigital sheep in the keep, that's a villain's heap"
        ],

        EXTREME: [
            "{totalTime}?! Son you broke the machine, obscene\nEven DOOM thinks you need a dopamine detox vaccine",

            "The meter's maxed, your brain's been taxed and waxed\nDOOM crowns you King of the Scroll, facts on facts",

            "{totalTime} of the grind, you've lost your mind, resigned\nThe supervillain salutes your commitment, redlined"
        ]
    });

    /**
     * CLOSING BARS
     * The send-off, the lasting impression
     */
    const CLOSINGS = Object.freeze([
        "DOOM has spoken, the token's been broken and soaked in\nPut the phone down and focus, or stay forever smokin'",

        "The mask fades back to black, no slack, no take-backs\nYour screen time's on wax, now go touch grass, relax",

        "This been DOOM, from the room of doom and gloom\nYour phone's a tomb, let your real life resume, make room",

        "ALL CAPS when you spell it, compel it, and tell it\nThe verdict's in, you've been scrolling, now shelve it or sell it",

        "The supervillain vanish like magic cabbage and lavish\nRemember these bars when your thumb starts its average ravage",

        "DOOM out, shout it loud, crowd around the cloud\nYour data's been read, now go outside, be proud or be cowed",

        "Mm, that's a wrap like a gift, swift, no rift\nThe metal face gave you the lift, now get the gist and shift",

        "The case closed, prose exposed, nose knows where it goes\nDOOM froze your scroll game cold, now compose and decompose"
    ]);

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    function getSeverityLevel(totalMinutes) {
        if (totalMinutes >= SEVERITY.EXTREME) return 'EXTREME';
        if (totalMinutes >= SEVERITY.HEAVY) return 'HEAVY';
        if (totalMinutes >= SEVERITY.MODERATE) return 'MODERATE';
        return 'LIGHT';
    }

    function formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''}`;
        }
        return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
    }

    function getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function getAppCategory(appName) {
        const normalizedName = appName.toLowerCase();
        for (const [category, apps] of Object.entries(APP_CATEGORIES)) {
            if (apps.some(app => normalizedName.includes(app.toLowerCase()))) {
                return category;
            }
        }
        return 'OTHER';
    }

    // ==========================================
    // PUBLIC API
    // ==========================================
    return Object.freeze({
        SEVERITY,
        APP_CATEGORIES,
        OCR_CORRECTIONS,
        VOICE,
        ANIMATION,
        PROCESSING_MESSAGES,
        OPENINGS,
        APP_ROASTS,
        SEVERITY_OUTROS,
        CLOSINGS,
        getSeverityLevel,
        formatTime,
        getRandomItem,
        getAppCategory
    });
})();
