/**
 * Daily Affirmations with Billy Joel
 * Complete Song Database with Lyric-Based Silly Affirmations
 * appleId is the Apple Music track ID of the original album version, used for the 30 second preview
 */

// Complete Billy Joel discography with funny lyric-referencing affirmations
const BILLY_JOEL_SONGS = [
    // === COLD SPRING HARBOR (1971) ===
    { song: "She's Got a Way", album: "Cold Spring Harbor", year: 1971, appleId: 259213379, affirmation: "You've got a way about you, I don't know what it is, but I also don't know what it isn't, so let's call it magic." },
    { song: "You Can Make Me Free", album: "Cold Spring Harbor", year: 1971, appleId: 259213386, affirmation: "You can make yourself free! Unless you're in an escape room. Then you need teamwork." },
    { song: "Everybody Loves You Now", album: "Cold Spring Harbor", year: 1971, appleId: 259213394, affirmation: "Everybody loves you now, but where were they when you were microwaving fish in the office?" },
    { song: "Why Judy Why", album: "Cold Spring Harbor", year: 1971, appleId: 259213409, affirmation: "Why, Judy, why? Because she wanted to, that's why. Stop asking so many questions." },
    { song: "Falling of the Rain", album: "Cold Spring Harbor", year: 1971, appleId: 259213419, affirmation: "Like the falling of the rain, your problems are temporary, and equally annoying when you forget an umbrella." },
    { song: "Turn Around", album: "Cold Spring Harbor", year: 1971, appleId: 259213433, affirmation: "Turn around! No wait, turn back. Actually, just spin in circles until you're happy." },
    { song: "You Look So Good to Me", album: "Cold Spring Harbor", year: 1971, appleId: 259213448, affirmation: "You look so good to me, but I also think pizza looks good at 2am, so take that as you will." },
    { song: "Tomorrow Is Today", album: "Cold Spring Harbor", year: 1971, appleId: 259213465, affirmation: "Tomorrow is today! Wait, no. Today is today. Tomorrow is tomorrow. Time is confusing. You're doing great." },
    { song: "Nocturne", album: "Cold Spring Harbor", year: 1971, appleId: 259213517, affirmation: "This instrumental says more without words than your last three Zoom meetings said with them." },
    { song: "Got to Begin Again", album: "Cold Spring Harbor", year: 1971, appleId: 259213680, affirmation: "Got to begin again? That's just a fancy way of saying 'Ctrl+Z your life.' Totally valid." },

    // === PIANO MAN (1973) ===
    { song: "Travelin' Prayer", album: "Piano Man", year: 1973, appleId: 158617303, affirmation: "Say a travelin' prayer for yourself, may your flights be on time and your middle seat neighbors be sleepy." },
    { song: "Piano Man", album: "Piano Man", year: 1973, appleId: 158617575, affirmation: "Sing us a song, you're the piano man! Or don't. Humming counts. Existing counts. You're doing amazing." },
    { song: "Ain't No Crime", album: "Piano Man", year: 1973, appleId: 158617579, affirmation: "It ain't no crime to eat cereal for dinner. Billy said so. (He didn't, but he would.)" },
    { song: "You're My Home", album: "Piano Man", year: 1973, appleId: 158617580, affirmation: "Home is wherever I'm with you, unless you're with someone who chews loudly. Then home is somewhere else." },
    { song: "The Ballad of Billy the Kid", album: "Piano Man", year: 1973, appleId: 158617583, affirmation: "From a town known as Wheeling, West Virginny, rode a boy... You're not an outlaw, but you ARE legendary." },
    { song: "Worse Comes to Worst", album: "Piano Man", year: 1973, appleId: 158617588, affirmation: "Worse comes to worst, I'll get along, because Plan B is just the alphabet showing off." },
    { song: "Stop in Nevada", album: "Piano Man", year: 1973, appleId: 158617589, affirmation: "Stop in Nevada? Fine, but what happens in Vegas stays in Vegas. Especially that buffet incident." },
    { song: "If I Only Had the Words", album: "Piano Man", year: 1973, appleId: 158617593, affirmation: "If I only had the words to tell you... but emojis exist now, so 🎹💪✨" },
    { song: "Somewhere Along the Line", album: "Piano Man", year: 1973, appleId: 158617595, affirmation: "Somewhere along the line you became awesome. Can't remember when exactly, but definitely happened." },
    { song: "Captain Jack", album: "Piano Man", year: 1973, appleId: 158617598, affirmation: "Captain Jack will get you high tonight, on LIFE. And maybe caffeine. Responsibly." },

    // === STREETLIFE SERENADE (1974) ===
    { song: "Streetlife Serenader", album: "Streetlife Serenade", year: 1974, appleId: 259213391, affirmation: "You're a streetlife serenader, even if your street is just the hallway to the bathroom at 3am." },
    { song: "Los Angelenos", album: "Streetlife Serenade", year: 1974, appleId: 259213411, affirmation: "Los Angelenos know how to live, stuck in traffic, but make it ✨aesthetic✨" },
    { song: "The Great Suburban Showdown", album: "Streetlife Serenade", year: 1974, appleId: 259213429, affirmation: "The great suburban showdown: you vs. the neighbor's leaf blower at 7am on Saturday. You've got this." },
    { song: "Root Beer Rag", album: "Streetlife Serenade", year: 1974, appleId: 259213441, affirmation: "No lyrics needed, your energy today is pure instrumental chaos, like this ragtime banger." },
    { song: "Roberta", album: "Streetlife Serenade", year: 1974, appleId: 259213461, affirmation: "Roberta, Roberta... if you're not Roberta, just pretend someone's singing YOUR name this passionately." },
    { song: "The Entertainer", album: "Streetlife Serenade", year: 1974, appleId: 259213519, affirmation: "I am the entertainer and I know just where I stand, in the kitchen, eating shredded cheese at midnight." },
    { song: "Last of the Big Time Spenders", album: "Streetlife Serenade", year: 1974, appleId: 259213699, affirmation: "You're the last of the big time spenders! (Your credit card company would like a word.)" },
    { song: "Weekend Song", album: "Streetlife Serenade", year: 1974, appleId: 259213828, affirmation: "It's a weekend song! Unless it's Tuesday. Then it's a 'pretend it's the weekend' song." },
    { song: "Souvenir", album: "Streetlife Serenade", year: 1974, appleId: 259213873, affirmation: "A picture postcard, a souvenir, your fridge magnet collection is basically a museum of memories." },
    { song: "The Mexican Connection", album: "Streetlife Serenade", year: 1974, appleId: 259213892, affirmation: "This instrumental is telling you to book that trip. The Mexican connection awaits. Tacos too." },

    // === TURNSTILES (1976) ===
    { song: "Say Goodbye to Hollywood", album: "Turnstiles", year: 1976, appleId: 259213450, affirmation: "Say goodbye to Hollywood! Say goodbye to drama! Say hello to sweatpants and peace!" },
    { song: "Summer, Highland Falls", album: "Turnstiles", year: 1976, appleId: 259213506, affirmation: "They say that these are not the best of times, but they're not the worst either, so let's call it a draw." },
    { song: "All You Wanna Do Is Dance", album: "Turnstiles", year: 1976, appleId: 259213518, affirmation: "All you wanna do is dance? VALID. Nobody needs a reason to bust a move." },
    { song: "New York State of Mind", album: "Turnstiles", year: 1976, appleId: 259213690, affirmation: "I'm in a New York state of mind, which means I'm walking fast, looking annoyed, and craving a bagel." },
    { song: "James", album: "Turnstiles", year: 1976, appleId: 259213820, affirmation: "Do what's good for you, or you're not good for anybody, including your houseplants. Water them." },
    { song: "Prelude/Angry Young Man", album: "Turnstiles", year: 1976, appleId: 259213837, affirmation: "There's a place in the world for the angry young man, and also for the mildly irritated middle-aged person." },
    { song: "I've Loved These Days", album: "Turnstiles", year: 1976, appleId: 259213934, affirmation: "I've loved these days! Even the weird ones. Especially the weird ones. They build character." },
    { song: "Miami 2017 (Seen the Lights Go Out on Broadway)", album: "Turnstiles", year: 1976, appleId: 259214012, affirmation: "They say the lights went out on Broadway, but YOUR light is still on. Keep shining, you absolute legend." },

    // === THE STRANGER (1977) ===
    { song: "Movin' Out (Anthony's Song)", album: "The Stranger", year: 1977, appleId: 158617967, affirmation: "Anthony works in the grocery store, but YOU don't have to work yourself to death for a Cadillac-ack-ack-ack-ack." },
    { song: "The Stranger", album: "The Stranger", year: 1977, appleId: 158618060, affirmation: "We all have a face that we hide away forever, yours is the one that eats ice cream straight from the container." },
    { song: "Just the Way You Are", album: "The Stranger", year: 1977, appleId: 158618063, affirmation: "Don't go changing to try and please me, I love you just the way you are. Weird hobbies and all." },
    { song: "Scenes from an Italian Restaurant", album: "The Stranger", year: 1977, appleId: 158618066, affirmation: "A bottle of white, a bottle of red, or whatever's on sale, honestly. Brenda and Eddie would understand." },
    { song: "Vienna", album: "The Stranger", year: 1977, appleId: 158618071, affirmation: "Slow down, you crazy child, Vienna waits for you! So does your bed. And snacks. No rush." },
    { song: "Only the Good Die Young", album: "The Stranger", year: 1977, appleId: 158618076, affirmation: "Only the good die young, so by that logic, your bad decisions might be adding years. Silver lining!" },
    { song: "She's Always a Woman", album: "The Stranger", year: 1977, appleId: 158618080, affirmation: "She can kill with a smile, she can wound with her eyes, she's also probably tired. Be kind to her." },
    { song: "Get It Right the First Time", album: "The Stranger", year: 1977, appleId: 158618085, affirmation: "Get it right the first time, that's the main thing. But also, second chances exist. And third. We're flexible." },
    { song: "Everybody Has a Dream", album: "The Stranger", year: 1977, appleId: 158618090, affirmation: "Everybody has a dream, even if yours is just a really long nap. Dreams are dreams." },

    // === 52ND STREET (1978) ===
    { song: "Big Shot", album: "52nd Street", year: 1978, appleId: 259573393, affirmation: "You had to be a BIG SHOT, didn't you? Well, today you're allowed to be a medium shot. Rest up." },
    { song: "Honesty", album: "52nd Street", year: 1978, appleId: 259573440, affirmation: "Honesty is such a lonely word, but so is 'moist' and we don't write songs about that. Be honest anyway." },
    { song: "My Life", album: "52nd Street", year: 1978, appleId: 259573453, affirmation: "Go ahead with your own life, leave me alone! In a good way. Boundaries are healthy." },
    { song: "Zanzibar", album: "52nd Street", year: 1978, appleId: 259573481, affirmation: "Ali dances and the audience applauds, you don't need to be a champion, just do a little shimmy. Life's good." },
    { song: "Stiletto", album: "52nd Street", year: 1978, appleId: 259573551, affirmation: "She cuts you once, she cuts you twice, maybe stop dating people who are described with knife metaphors?" },
    { song: "Rosalinda's Eyes", album: "52nd Street", year: 1978, appleId: 259573586, affirmation: "Señorita, don't you know, your eyes tell a story. Mostly that you need more sleep. Same." },
    { song: "Half a Mile Away", album: "52nd Street", year: 1978, appleId: 259573608, affirmation: "Half a mile away from home, that's like 2,640 feet! Or one really long walk when you forgot your keys." },
    { song: "Until the Night", album: "52nd Street", year: 1978, appleId: 259573652, affirmation: "I'll wait until the night, because mornings are hard and nights have snacks." },
    { song: "52nd Street", album: "52nd Street", year: 1978, appleId: 259573701, affirmation: "They say hot jazz is what we do best, you do you best. Whatever that is. It's probably great." },

    // === GLASS HOUSES (1980) ===
    { song: "You May Be Right", album: "Glass Houses", year: 1980, appleId: 158618443, affirmation: "You may be right, I may be crazy, but it just may be a lunatic you're looking for! Embrace the chaos." },
    { song: "Sometimes a Fantasy", album: "Glass Houses", year: 1980, appleId: 158618556, affirmation: "Sometimes a fantasy is all you need, especially when reality includes doing laundry." },
    { song: "Don't Ask Me Why", album: "Glass Houses", year: 1980, appleId: 158618560, affirmation: "Don't ask me why! I don't have to explain my snack choices to anyone." },
    { song: "It's Still Rock and Roll to Me", album: "Glass Houses", year: 1980, appleId: 158618562, affirmation: "What's the matter with the clothes I'm wearing? NOTHING. You look fantastic. Billy would approve." },
    { song: "All for Leyna", album: "Glass Houses", year: 1980, appleId: 158618564, affirmation: "She stood on the tracks, waving her arms, that's dramatic. Maybe just text back instead?" },
    { song: "I Don't Want to Be Alone", album: "Glass Houses", year: 1980, appleId: 158618566, affirmation: "I don't want to be alone anymore, that's what group chats are for. Digital togetherness counts." },
    { song: "Sleeping with the Television On", album: "Glass Houses", year: 1980, appleId: 158618570, affirmation: "You're sleeping with the television on, and the phone, and the laptop. Modern lullabies." },
    { song: "C'etait Toi (You Were the One)", album: "Glass Houses", year: 1980, appleId: 158618574, affirmation: "C'etait toi, that's French for 'it was you.' Fancy! You're internationally significant." },
    { song: "Close to the Borderline", album: "Glass Houses", year: 1980, appleId: 158618578, affirmation: "Close to the borderline, but still on the right side. That's called balance, baby." },
    { song: "Through the Long Night", album: "Glass Houses", year: 1980, appleId: 158618591, affirmation: "Through the long night with you, Netflix counts as company. You're never truly alone." },

    // === THE NYLON CURTAIN (1982) ===
    { song: "Allentown", album: "The Nylon Curtain", year: 1982, appleId: 157506257, affirmation: "Well we're living here in Allentown, or wherever you are. Same economic anxiety, different ZIP code." },
    { song: "Laura", album: "The Nylon Curtain", year: 1982, appleId: 157506271, affirmation: "Laura calls me in the middle of the night, healthy boundaries, Laura! But also, you can text me anytime." },
    { song: "Pressure", album: "The Nylon Curtain", year: 1982, appleId: 157506273, affirmation: "Pressure! Pressing down on me, pressing down on you, wait, that's Queen. But Billy gets it too. Deep breaths." },
    { song: "Goodnight Saigon", album: "The Nylon Curtain", year: 1982, appleId: 157506277, affirmation: "We said we'd all go down together, and by that I mean group projects. Team effort. Always." },
    { song: "She's Right on Time", album: "The Nylon Curtain", year: 1982, appleId: 157506283, affirmation: "She's right on time, unlike your Amazon packages. Trust the universe's shipping schedule." },
    { song: "A Room of Our Own", album: "The Nylon Curtain", year: 1982, appleId: 157506286, affirmation: "A room of our own, with WiFi and snacks. Virginia Woolf would be so proud." },
    { song: "Surprises", album: "The Nylon Curtain", year: 1982, appleId: 157506288, affirmation: "Nothing's what I thought it would be, SURPRISES! Life's just a weird party you didn't RSVP to." },
    { song: "Scandinavian Skies", album: "The Nylon Curtain", year: 1982, appleId: 157506296, affirmation: "Scandinavian skies, cold but beautiful, like that ice cream you're about to eat." },
    { song: "Where's the Orchestra?", album: "The Nylon Curtain", year: 1982, appleId: 157506312, affirmation: "Where's the orchestra? This was supposed to be a SHOW! Life promised background music. Play your own." },

    // === AN INNOCENT MAN (1983) ===
    { song: "Easy Money", album: "An Innocent Man", year: 1983, appleId: 259814642, affirmation: "Easy money! Not really though. Money is rarely easy. But you'll figure it out." },
    { song: "An Innocent Man", album: "An Innocent Man", year: 1983, appleId: 259814645, affirmation: "I AM an innocent man! (Said while clearly guilty of eating the last cookie.)" },
    { song: "The Longest Time", album: "An Innocent Man", year: 1983, appleId: 259814647, affirmation: "Whoa-oh-oh, for the longest time, you've been amazing. Since forever. Doo-wop confirmed." },
    { song: "This Night", album: "An Innocent Man", year: 1983, appleId: 259814670, affirmation: "This night is MINE, it's my night to do absolutely nothing and feel great about it. Beethoven approves." },
    { song: "Tell Her About It", album: "An Innocent Man", year: 1983, appleId: 259814737, affirmation: "Tell her about it! Communication is key. Unless it's passive-aggressive notes. Don't do those." },
    { song: "Uptown Girl", album: "An Innocent Man", year: 1983, appleId: 259814810, affirmation: "Uptown girl, she's been living in her uptown world, and YOU are downtown royalty. Both valid." },
    { song: "Careless Talk", album: "An Innocent Man", year: 1983, appleId: 259814842, affirmation: "Careless talk, maybe think before you tweet. Billy was warning us about social media in 1983." },
    { song: "Christie Lee", album: "An Innocent Man", year: 1983, appleId: 259814849, affirmation: "Christie Lee, she never cared about the saxophone, but you should care about YOUR passions, unlike Christie." },
    { song: "Leave a Tender Moment Alone", album: "An Innocent Man", year: 1983, appleId: 259814858, affirmation: "Leave a tender moment alone, don't ruin it by checking your phone. Just... be present. Radical concept." },
    { song: "Keeping the Faith", album: "An Innocent Man", year: 1983, appleId: 259814879, affirmation: "You can get just so much from a good thing, and faith is free, so stock up." },

    // === THE BRIDGE (1986) ===
    { song: "Running on Ice", album: "The Bridge", year: 1986, appleId: 192816248, affirmation: "Running on ice, which is a terrible idea, please walk carefully. Metaphorically too." },
    { song: "This Is the Time", album: "The Bridge", year: 1986, appleId: 192816302, affirmation: "This is the time to remember, and also to make new memories. Don't get stuck in nostalgia mode." },
    { song: "A Matter of Trust", album: "The Bridge", year: 1986, appleId: 192816581, affirmation: "It's a matter of trust, like when you order food online and hope it looks like the picture. Leap of faith." },
    { song: "Modern Woman", album: "The Bridge", year: 1986, appleId: 192816629, affirmation: "She's a modern woman! She's got PayPal and a podcast and imposter syndrome. Queen." },
    { song: "Baby Grand", album: "The Bridge", year: 1986, appleId: 192816690, affirmation: "Ever since I found you, baby grand, you've been a grand companion. Ray Charles AND Billy approve of your choices." },
    { song: "Big Man on Mulberry Street", album: "The Bridge", year: 1986, appleId: 192816699, affirmation: "Big man on Mulberry Street, jazz hands optional but encouraged in your daily life." },
    { song: "Temptation", album: "The Bridge", year: 1986, appleId: 192816711, affirmation: "Temptation! That second donut is calling. Billy understands. Life is short." },
    { song: "Code of Silence", album: "The Bridge", year: 1986, appleId: 192816735, affirmation: "There's a code of silence we don't dare speak, unless you're at brunch. Then spill the tea." },
    { song: "Getting Closer", album: "The Bridge", year: 1986, appleId: 192816783, affirmation: "Getting closer! To your goals, to the weekend, to the fridge. Progress is progress." },

    // === STORM FRONT (1989) ===
    { song: "That's Not Her Style", album: "Storm Front", year: 1989, appleId: 158619000, affirmation: "That's not her style, and YOUR style is uniquely yours. Don't let anyone dim your sparkle." },
    { song: "We Didn't Start the Fire", album: "Storm Front", year: 1989, appleId: 158619054, affirmation: "We didn't start the fire! It was always burning since the world's been turning. (Not our fault, basically.)" },
    { song: "The Downeaster 'Alexa'", album: "Storm Front", year: 1989, appleId: 158619060, affirmation: "I'm a Bayman like my father was before, honoring tradition while adapting to change. You got this, captain." },
    { song: "I Go to Extremes", album: "Storm Front", year: 1989, appleId: 158619065, affirmation: "Darling, I don't know why I go to extremes, maybe try the middle sometime? It's cozy there." },
    { song: "Shameless", album: "Storm Front", year: 1989, appleId: 158619070, affirmation: "I'm shameless! And so should you be. Own your weirdness. It's your superpower." },
    { song: "Storm Front", album: "Storm Front", year: 1989, appleId: 158619075, affirmation: "There's a storm front coming, so stock up on snacks and charge your devices. Be prepared." },
    { song: "Leningrad", album: "Storm Front", year: 1989, appleId: 158619082, affirmation: "Viktor was born in the spring of '44, proving you can be friends with anyone. Borders schmorders." },
    { song: "State of Grace", album: "Storm Front", year: 1989, appleId: 158619116, affirmation: "State of grace? State of chaos? Same thing some days. You're doing beautifully." },
    { song: "When in Rome", album: "Storm Front", year: 1989, appleId: 158619133, affirmation: "When in Rome, do as the Romans do, which apparently means eating pasta and gesturing wildly. Approved." },
    { song: "And So It Goes", album: "Storm Front", year: 1989, appleId: 158619138, affirmation: "And so it goes, and so it goes, life keeps moving, and so do you. That's literally all we can do." },

    // === RIVER OF DREAMS (1993) ===
    { song: "No Man's Land", album: "River of Dreams", year: 1993, appleId: 158619591, affirmation: "Out in no man's land, where the strip malls and the subdivisions roam. Find your space." },
    { song: "The Great Wall of China", album: "River of Dreams", year: 1993, appleId: 158619871, affirmation: "The Great Wall of China, built one brick at a time. Your progress counts, even if it's small." },
    { song: "Blonde Over Blue", album: "River of Dreams", year: 1993, appleId: 158619878, affirmation: "She loves the sea, she loves the sand, and you love whatever you love. It's all valid." },
    { song: "A Minor Variation", album: "River of Dreams", year: 1993, appleId: 158619879, affirmation: "A minor variation in the script, also known as 'improvising through life.' Oscar-worthy performance." },
    { song: "Shades of Grey", album: "River of Dreams", year: 1993, appleId: 158619881, affirmation: "Shades of grey wherever I go, adulting is just realizing nothing is black and white. Except penguins." },
    { song: "All About Soul", album: "River of Dreams", year: 1993, appleId: 158619887, affirmation: "It's all about soul, and also snacks, and rest, and being kind to yourself. Soulful AND practical." },
    { song: "Lullabye (Goodnight, My Angel)", album: "River of Dreams", year: 1993, appleId: 158619889, affirmation: "Goodnight my angel, time to close your eyes, I'll be crying in 3... 2... 1... This song DESTROYS me. 😭" },
    { song: "The River of Dreams", album: "River of Dreams", year: 1993, appleId: 158619898, affirmation: "In the middle of the night, I go walking in my sleep, probably to the fridge. The river of dreams has cheese." },
    { song: "Two Thousand Years", album: "River of Dreams", year: 1993, appleId: 158619901, affirmation: "In two thousand years, we'll still be here, okay we WON'T, but the vibes will live on." },
    { song: "Famous Last Words", album: "River of Dreams", year: 1993, appleId: 158619956, affirmation: "These are the last words I have to say, before I end this album. Graceful exit. You too will know when to bow out." }
];

// Sort songs alphabetically for the dropdown
const SONGS_ALPHABETICAL = [...BILLY_JOEL_SONGS].sort((a, b) =>
    a.song.localeCompare(b.song)
);

// Album metadata
const ALBUMS = {
    "Cold Spring Harbor": { year: 1971, color: "#8fa5bf" },
    "Piano Man": { year: 1973, color: "#c9a87c" },
    "Streetlife Serenade": { year: 1974, color: "#e6c88c" },
    "Turnstiles": { year: 1976, color: "#7a9e7a" },
    "The Stranger": { year: 1977, color: "#4a5568" },
    "52nd Street": { year: 1978, color: "#d4a44c" },
    "Glass Houses": { year: 1980, color: "#9ca3af" },
    "The Nylon Curtain": { year: 1982, color: "#5b7b8f" },
    "An Innocent Man": { year: 1983, color: "#e57373" },
    "The Bridge": { year: 1986, color: "#7986cb" },
    "Storm Front": { year: 1989, color: "#4a5d6a" },
    "River of Dreams": { year: 1993, color: "#5c9e8a" }
};

// Utility functions
function getAllSongsAlphabetical() {
    return SONGS_ALPHABETICAL;
}

function getSongByTitle(title) {
    return BILLY_JOEL_SONGS.find(s => s.song.toLowerCase() === title.toLowerCase());
}

function getRandomSong() {
    return BILLY_JOEL_SONGS[Math.floor(Math.random() * BILLY_JOEL_SONGS.length)];
}

function getSongsByAlbum(album) {
    return BILLY_JOEL_SONGS.filter(s => s.album === album);
}

function getAllAlbums() {
    return Object.keys(ALBUMS);
}

// Export for use in other modules
window.AffirmationData = {
    SONGS: BILLY_JOEL_SONGS,
    SONGS_ALPHABETICAL,
    ALBUMS,
    getAllSongsAlphabetical,
    getSongByTitle,
    getRandomSong,
    getSongsByAlbum,
    getAllAlbums,
    // Legacy compatibility
    getRandomAffirmation: getRandomSong,
    getAffirmationById: (id) => BILLY_JOEL_SONGS.find(s => s.song === id)
};
