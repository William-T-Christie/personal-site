/**
 * Buzzword Bingo: the jargon dictionary.
 *
 * Each entry: [card label, regex pattern, plain English, flags]
 *   card label     short text for the bingo card and the breakdown
 *   regex pattern  matched case insensitively on word boundaries; use [\s-]? for "deep dive" / "deep-dive"
 *   plain English  what it actually means
 *   flags          'm' = good for a live meeting card, 'r' = resume flavored
 *
 * Tiers set the points: 1, 2, 3 and 5.
 * Plain words that show up in normal speech (solution, scale, pipeline, milestone, same page) are left out on purpose.
 */

const S = '[\\s-]?'; // space or hyphen or nothing

export const TIERS = {
  1: { points: 1, name: 'Common corporate' },
  2: { points: 2, name: 'Meeting phrase' },
  3: { points: 3, name: 'Peak corporate' },
  4: { points: 5, name: 'Legendary cringe' }
};

const RAW = {
  1: [
    ['Synergy', 'synerg(?:y|ies|ize|ized|izes|izing|istic)', 'working together', 'm'],
    ['Leverage', 'leverag(?:e|ed|es|ing)', 'use', 'm'],
    ['Bandwidth', 'bandwidth', 'time', 'm'],
    ['Stakeholders', '(?:key\\s+)?stakeholders?', 'people who care', 'm'],
    ['Deliverables', 'deliverables?', 'work', 'm'],
    ['Actionable', 'actionable(?:\\s+insights?)?', 'useful', 'm'],
    ['Scalable', 'scal(?:able|ability)', 'able to grow', 'm'],
    ['Ecosystem', 'ecosystems?', 'setup', 'm'],
    ['Alignment', 'alignment|(?:get|getting|got|stay|be|are|is|all|we\'re)\\s+aligned', 'agreement', 'm'],
    ['Streamline', 'streamlin(?:e|ed|es|ing)', 'simplify', 'm'],
    ['Optimize', 'optimi[sz](?:e|ed|es|ing|ation)', 'improve', 'm'],
    ['Robust', 'robust', 'solid', 'm'],
    ['Holistic', 'holistic(?:ally)?', 'whole', 'm'],
    ['Proactive', 'proactive(?:ly)?', 'early', 'm'],
    ['Seamless', 'seamless(?:ly)?', 'smooth', 'm'],
    ['Granular', 'granular(?:ity)?', 'detailed', 'm'],
    ['Verticals', 'verticals', 'departments', 'm'],
    ['Roadmap', 'roadmaps?', 'plan', 'm'],
    ['Cadence', 'cadence', 'schedule', 'm'],
    ['Touchpoint', 'touch' + S + 'points?', 'meeting', 'm'],
    ['Going forward', '(?:going|moving)\\s+forward', 'from now on', 'm'],
    ['Visibility', 'visibility\\s+(?:into|on)', 'a look at', 'm'],
    ['Agile', 'agile', 'flexible', 'm'],
    ['Empower', 'empower(?:ed|ing|s|ment)?', 'let', 'm'],
    ['Impactful', 'impactful', 'useful', 'm'],
    ['Innovative', 'innovat(?:ive|ion|ions)', 'new', 'm'],
    ['Dynamic', 'dynamic', 'busy', ''],
    ['Passionate', 'passionate(?:ly)?', 'into', 'r'],
    ['Detail oriented', 'detail' + S + 'oriented', 'careful', 'r'],
    ['Team player', 'team' + S + 'player', 'gets along with people', 'r'],
    ['Self starter', 'self' + S + 'starter', 'does things without being asked', 'r'],
    ['Results driven', 'results' + S + '(?:driven|oriented)', 'likes it when things work', 'r'],
    ['Utilize', 'utili[sz](?:e|ed|es|ing|ation)', 'use', ''],
    ['Facilitate', 'facilitat(?:e|ed|es|ing)', 'run', ''],
    ['Spearhead', 'spearhead(?:ed|ing|s)?', 'lead', 'r'],
    ['Champion', 'champion(?:ed|ing)', 'push for', 'r'],
    ['Frontline', 'front' + S + 'line', 'first in line', 'r'],
    ['Stress tested', 'stress' + S + 'test(?:ed|ing)', 'tried to break', 'r'],
    ['Surfacing', 'surfac(?:ed|ing)', 'finding', 'r'],
    ['Ensured', 'ensur(?:ed|ing)', 'made sure of', 'r'],
    ['Iterations', 'iterations', 'versions', 'r'],
    ['Efficiency', 'business\\s+efficienc(?:y|ies)|drive\\s+efficienc(?:y|ies)', 'speed', 'r'],
    ['Data driven', 'data' + S + 'driven', 'used numbers', 'r'],
    ['End to end', 'end' + S + 'to' + S + 'end', 'whole', 'm'],
    ['KPIs', 'kpis?', 'numbers', 'm'],
    ['Transformation', 'transformation(?:al|s)?', 'change', 'r']
  ],
  2: [
    ['Circle back', 'circl(?:e|ed|es|ing)\\s+back', 'follow up', 'm'],
    ['Loop in', 'loop(?:ed|ing)?\\s+(?:you\\s+|them\\s+|him\\s+|her\\s+|me\\s+)?in', 'include', 'm'],
    ['Touch base', 'touch(?:ed|ing)?\\s+base', 'talk', 'm'],
    ['Take it offline', 'tak(?:e|ing)\\s+(?:this|that|it)?\\s*offline', 'talk later', 'm'],
    ['Move the needle', 'mov(?:e|ed|es|ing)\\s+the\\s+needle', 'make a difference', 'm'],
    ['Low hanging fruit', 'low' + S + 'hanging\\s+fruit', 'easy wins', 'm'],
    ['Deep dive', 'deep' + S + 'dives?', 'a close look', 'm'],
    ['Best practices', 'best\\s+practices?', 'the usual way', 'm'],
    ['Value add', 'value' + S + 'add(?:ed)?', 'useful', 'm'],
    ['Win win', 'win' + S + 'win', 'good for both', 'm'],
    ['Game changer', 'game' + S + 'chang(?:er|ers|ing)', 'big deal', 'm'],
    ['Outside the box', 'outside\\s+(?:of\\s+)?the\\s+box', 'creatively', 'm'],
    ['Same page', 'on\\s+the\\s+same\\s+page', 'agreeing', 'm'],
    ['Up the flagpole', 'up\\s+the\\s+flagpole', 'ask the boss', 'm'],
    ['Drill down', 'drill(?:ing|ed)?\\s+down', 'look closer', 'm'],
    ['Flesh out', 'flesh(?:ing)?\\s+(?:this\\s+|that\\s+|it\\s+)?out', 'finish', 'm'],
    ['Close the loop', 'clos(?:e|ing)\\s+the\\s+loop', 'finish up', 'm'],
    ['Core competencies', 'core\\s+competenc(?:y|ies)', 'skills', 'm'],
    ['Learnings', '(?:key\\s+)?learnings', 'lessons', 'm'],
    ['Net net', 'net' + S + 'net', 'in short', 'm'],
    ['Level set', 'level' + S + 'set(?:ting)?', 'get on the same page', 'm'],
    ['Double click', 'double' + S + 'click(?:ing)?\\s+(?:on|into)', 'look closer at', 'm'],
    ['Peel the onion', 'peel(?:ing)?\\s+back\\s+the\\s+onion', 'look closer', 'm'],
    ['Ducks in a row', 'ducks\\s+in\\s+a\\s+row', 'organized', 'm'],
    ['Hard stop', 'hard\\s+stop', 'I have to leave', 'm'],
    ['Parking lot', 'parking\\s+lot', 'later', 'm'],
    ['Action items', 'action\\s+items?', 'to dos', 'm'],
    ['Quick wins', 'quick\\s+wins?', 'easy things', 'm'],
    ['Thought partner', 'thought\\s+partners?', 'coworker', 'm'],
    ['Wheelhouse', 'wheelhouse', 'comfort zone', 'm'],
    ['Proven track record', 'proven\\s+track\\s+record', 'history', 'r'],
    ['Cross functional', 'cross' + S + 'functional(?:ly)?', 'with other teams', 'm'],
    ['Mission critical', 'mission' + S + 'critical', 'important', 'm'],
    ['Hit the ground running', 'hit\\s+the\\s+ground\\s+running', 'start fast', 'r'],
    ['Many hats', '(?:wear|wore|wearing)\\s+(?:many|a\\s+lot\\s+of)\\s+hats', 'did several jobs', 'r'],
    ['Customer centric', 'customer' + S + 'centric', 'cares about customers', 'm'],
    ['Growth mindset', 'growth\\s+mindset', 'willingness to learn', 'm'],
    ['Fast paced', 'fast' + S + 'paced(?:\\s+environment)?', 'busy', 'r'],
    ['Communication skills', '(?:excellent|strong)\\s+communication\\s+skills', 'can write emails', 'r'],
    ['Take ownership', '(?:took|take|taking)\\s+ownership', 'do it', 'm'],
    ['Drive results', '(?:driv(?:e|es|ing)|drove)\\s+(?:growth|results|alignment|impact|value)', 'help', 'm']
  ],
  3: [
    ['Boil the ocean', 'boil(?:ing)?\\s+the\\s+ocean', 'do too much', 'm'],
    ['Paradigm shift', 'paradigm(?:\\s+shifts?)?|shift\\s+the\\s+paradigm', 'change', 'm'],
    ['Thought leader', 'thought\\s+leader(?:s|ship)?', 'person who posts on LinkedIn', 'm'],
    ['Disrupt', 'disrupt(?:ive|ion|ing|or|ors)?', 'shake up', 'm'],
    ['Ideate', 'ideat(?:e|ed|es|ion|ing)', 'brainstorm', 'm'],
    ['Pivot', 'pivot(?:ed|ing)?', 'change plans', 'm'],
    ['Bleeding edge', '(?:bleeding|cutting)' + S + 'edge', 'new', 'm'],
    ['North star', 'north' + S + 'star', 'goal', 'm'],
    ['Tiger team', 'tiger\\s+team', 'small group', 'm'],
    ['Blue sky', 'blue' + S + 'sky(?:\\s+thinking)?', 'dreaming', 'm'],
    ['Dogfooding', 'dog' + S + 'food(?:ing)?|eat\\s+our\\s+own\\s+dog\\s+food', 'using our own product', 'm'],
    ['Put a pin in it', 'put\\s+a\\s+pin\\s+in\\s+(?:it|that|this)', 'later', 'm'],
    ['Unpack', '(?:let\'s\\s+)?unpack(?:ing)?\\s+(?:that|this|it)', 'explain', 'm'],
    ['Socialize', 'sociali[sz](?:e|ed|ing)\\s+(?:this|that|it|the)', 'share', 'm'],
    ['Operationalize', 'operationali[sz](?:e|ed|ing)', 'actually do', 'm'],
    ['Productize', 'productiz(?:e|ed|ing)', 'sell', 'm'],
    ['Rightsize', 'right' + S + 'siz(?:e|ed|ing)', 'cut', 'm'],
    ['Solutioning', 'solutioning', 'figuring it out', 'm'],
    ['Greenfield', 'greenfield', 'brand new', 'm'],
    ['White space', 'white' + S + 'space\\s+(?:opportunit(?:y|ies)|in\\s+the\\s+market)', 'a gap', 'm'],
    ['Best in class', 'best' + S + 'in' + S + 'class', 'good', 'm'],
    ['World class', 'world' + S + 'class', 'good', 'm']
  ],
  4: [
    ['End of the day', 'at\\s+the\\s+end\\s+of\\s+the\\s+day', 'in the end', 'm'],
    ['New normal', '(?:the\\s+)?new\\s+normal', 'how things are now', 'm'],
    ['Kool Aid', '(?:drink|drank|drinking)\\s+the\\s+kool' + S + 'aid', 'believe it blindly', 'm'],
    ['It is what it is', 'it\\s+is\\s+what\\s+it\\s+is', 'oh well', 'm'],
    ['Reinvent the wheel', 'reinvent(?:ing)?\\s+the\\s+wheel', 'start over', 'm'],
    ['Next level', 'to\\s+the\\s+next\\s+level', 'better', 'm'],
    ['Rock star', 'rock' + S + 'stars?', 'good employee', 'm'],
    ['Ninja', 'ninjas?', 'expert', 'r'],
    ['Guru', 'gurus?', 'expert', 'r'],
    ['Secret sauce', 'secret\\s+sauce', 'what we do differently', 'm'],
    ['Move the goalposts', 'mov(?:e|ed|ing)\\s+the\\s+goal' + S + 'posts', 'change the rules', 'm'],
    ['Under the bus', '(?:throw|threw|thrown|throwing)\\s+(?:\\w+\\s+)?under\\s+the\\s+bus', 'blame', 'm'],
    ['Swim lane', 'swim' + S + 'lanes?|stay\\s+in\\s+your\\s+lane', 'your job', 'm'],
    ['Helicopter view', 'helicopter\\s+view|(?:30|thirty)' + S + '(?:,000|thousand)' + S + 'foot\\s+view', 'the big picture', 'm'],
    ['Ping me', 'ping\\s+(?:me|you|them|him|her)|(?:I\'ll|i\\s+will)\\s+ping', 'message', 'm'],
    ['Brain dump', 'brain' + S + 'dump', 'notes', 'm'],
    ['Sync up', 'sync(?:ing)?\\s+up|let\'s\\s+sync', 'meet', 'm'],
    ['Open the kimono', 'open(?:ing)?\\s+the\\s+kimono', 'share everything', 'm']
  ]
};

export const DICT = [];
for (const [tier, rows] of Object.entries(RAW)) {
  for (const [label, pattern, plain, flags] of rows) {
    DICT.push({
      id: DICT.length,
      label,
      tier: Number(tier),
      points: TIERS[tier].points,
      plain,
      meeting: flags.includes('m'),
      resume: flags.includes('r'),
      re: new RegExp('\\b(?:' + pattern + ')\\b', 'gi')
    });
  }
}

/** Ranks by Corporate Speak Index (0 to 100). Titles carry over from version 1. */
export const RANKS = [
  { min: 0, title: 'REFRESHINGLY HUMAN', note: 'Remarkably jargon free. A person could read this.' },
  { min: 10, title: 'CORPORATE CURIOUS', note: 'Just dipping a toe in the buzzword pool.' },
  { min: 25, title: 'MIDDLE MANAGER MATERIAL', note: 'Fluent in quarterly review.' },
  { min: 45, title: 'SYNERGY SPECIALIST', note: 'Saying nothing, eloquently.' },
  { min: 65, title: 'CHIEF BUZZWORD OFFICER', note: 'Peak corporate communication achieved.' },
  { min: 85, title: 'LEGENDARY JARGON JUNKIE', note: 'This could have been an email. A short one.' }
];

export const LOADING_LINES = [
  'Detecting synergies', 'Measuring bandwidth', 'Calculating paradigm shifts', 'Identifying low hanging fruit',
  'Circling back', 'Taking this offline', 'Double clicking on the data', 'Moving the needle',
  'Drilling down', 'Getting ducks in a row', 'Aligning stakeholders', 'Operationalizing the learnings'
];
