/**
 * Daily Affirmations with Billy Joel
 * Complete Song Database with Lyric-Based Silly Affirmations
 */

// Complete Billy Joel discography with funny lyric-referencing affirmations
const BILLY_JOEL_SONGS = [
    // === COLD SPRING HARBOR (1971) ===
    { song: "She's Got a Way", album: "Cold Spring Harbor", year: 1971, spotifyTrackId: "6dBKlQ5HdZKt0lNrLLQSPj", affirmation: "You've got a way about you — I don't know what it is, but I also don't know what it isn't, so let's call it magic." },
    { song: "You Can Make Me Free", album: "Cold Spring Harbor", year: 1971, spotifyTrackId: "3Gy0tQwZvHBYCJdNvZx5xS", affirmation: "You can make yourself free! Unless you're in an escape room. Then you need teamwork." },
    { song: "Everybody Loves You Now", album: "Cold Spring Harbor", year: 1971, spotifyTrackId: "1WnNjbMRQK3Y5nDKjmB4GC", affirmation: "Everybody loves you now, but where were they when you were microwaving fish in the office?" },
    { song: "Why Judy Why", album: "Cold Spring Harbor", year: 1971, spotifyTrackId: "6FBPOJLxUZELc2GkPAyLvz", affirmation: "Why, Judy, why? Because she wanted to, that's why. Stop asking so many questions." },
    { song: "Falling of the Rain", album: "Cold Spring Harbor", year: 1971, spotifyTrackId: "5VRfGCLMJTpQjGxv3dLXvS", affirmation: "Like the falling of the rain, your problems are temporary — and equally annoying when you forget an umbrella." },
    { song: "Turn Around", album: "Cold Spring Harbor", year: 1971, spotifyTrackId: "0qoQH5S0tJE3kRkkRBvXEi", affirmation: "Turn around! No wait, turn back. Actually, just spin in circles until you're happy." },
    { song: "You Look So Good to Me", album: "Cold Spring Harbor", year: 1971, spotifyTrackId: "4X4FqW4KGl1QF8kqPJD3wS", affirmation: "You look so good to me — but I also think pizza looks good at 2am, so take that as you will." },
    { song: "Tomorrow Is Today", album: "Cold Spring Harbor", year: 1971, spotifyTrackId: "5QXLYU5x5YPnM5p5V5yjlQ", affirmation: "Tomorrow is today! Wait, no. Today is today. Tomorrow is tomorrow. Time is confusing. You're doing great." },
    { song: "Nocturne", album: "Cold Spring Harbor", year: 1971, spotifyTrackId: "2sXBPCKnRNZgKPf8bR5zVS", affirmation: "This instrumental says more without words than your last three Zoom meetings said with them." },
    { song: "Got to Begin Again", album: "Cold Spring Harbor", year: 1971, spotifyTrackId: "0vTLBePGYLFkrPvxW5VLkS", affirmation: "Got to begin again? That's just a fancy way of saying 'Ctrl+Z your life.' Totally valid." },

    // === PIANO MAN (1973) ===
    { song: "Travelin' Prayer", album: "Piano Man", year: 1973, spotifyTrackId: "5QqzMFUV8VCxQf9J9fCe5j", affirmation: "Say a travelin' prayer for yourself — may your flights be on time and your middle seat neighbors be sleepy." },
    { song: "Piano Man", album: "Piano Man", year: 1973, spotifyTrackId: "70XHSOnNrWGZ91tX9soAFF", affirmation: "Sing us a song, you're the piano man! Or don't. Humming counts. Existing counts. You're doing amazing." },
    { song: "Ain't No Crime", album: "Piano Man", year: 1973, spotifyTrackId: "6lYP0wDnGsXcKRNvFmKbcW", affirmation: "It ain't no crime to eat cereal for dinner. Billy said so. (He didn't, but he would.)" },
    { song: "You're My Home", album: "Piano Man", year: 1973, spotifyTrackId: "4TdIqXFqVbfAQSqLphdvYK", affirmation: "Home is wherever I'm with you — unless you're with someone who chews loudly. Then home is somewhere else." },
    { song: "The Ballad of Billy the Kid", album: "Piano Man", year: 1973, spotifyTrackId: "2N4b5qVN7b4fCxQmRF3rU4", affirmation: "From a town known as Wheeling, West Virginny, rode a boy... You're not an outlaw, but you ARE legendary." },
    { song: "Worse Comes to Worst", album: "Piano Man", year: 1973, spotifyTrackId: "3vKplLTQNkZVK0AvL4xPqW", affirmation: "Worse comes to worst, I'll get along — because Plan B is just the alphabet showing off." },
    { song: "Stop in Nevada", album: "Piano Man", year: 1973, spotifyTrackId: "1VRfGCLMJTpQjGxv3dLXvW", affirmation: "Stop in Nevada? Fine, but what happens in Vegas stays in Vegas. Especially that buffet incident." },
    { song: "If I Only Had the Words", album: "Piano Man", year: 1973, spotifyTrackId: "4JmyTvyUmjP5ZYXvKWK8bz", affirmation: "If I only had the words to tell you... but emojis exist now, so 🎹💪✨" },
    { song: "Somewhere Along the Line", album: "Piano Man", year: 1973, spotifyTrackId: "1jQXMGyaXrcfWPLNy7dUmQ", affirmation: "Somewhere along the line you became awesome. Can't remember when exactly, but definitely happened." },
    { song: "Captain Jack", album: "Piano Man", year: 1973, spotifyTrackId: "4JmyTvyUmjP5ZYXvKWK8ay", affirmation: "Captain Jack will get you high tonight — on LIFE. And maybe caffeine. Responsibly." },

    // === STREETLIFE SERENADE (1974) ===
    { song: "Streetlife Serenader", album: "Streetlife Serenade", year: 1974, spotifyTrackId: "2cjcMVXFWJVxqDQMBJHfRW", affirmation: "You're a streetlife serenader — even if your street is just the hallway to the bathroom at 3am." },
    { song: "Los Angelenos", album: "Streetlife Serenade", year: 1974, spotifyTrackId: "3Gy0tQwZvHBYCJdNvZx5xW", affirmation: "Los Angelenos know how to live — stuck in traffic, but make it ✨aesthetic✨" },
    { song: "The Great Suburban Showdown", album: "Streetlife Serenade", year: 1974, spotifyTrackId: "4TdIqXFqVbfAQSqLphdvYW", affirmation: "The great suburban showdown: you vs. the neighbor's leaf blower at 7am on Saturday. You've got this." },
    { song: "Root Beer Rag", album: "Streetlife Serenade", year: 1974, spotifyTrackId: "5QqzMFUV8VCxQf9J9fCe5k", affirmation: "No lyrics needed — your energy today is pure instrumental chaos, like this ragtime banger." },
    { song: "Roberta", album: "Streetlife Serenade", year: 1974, spotifyTrackId: "6lYP0wDnGsXcKRNvFmKbcX", affirmation: "Roberta, Roberta... if you're not Roberta, just pretend someone's singing YOUR name this passionately." },
    { song: "The Entertainer", album: "Streetlife Serenade", year: 1974, spotifyTrackId: "1cjcMVXFWJVxqDQMBJHfRZ", affirmation: "I am the entertainer and I know just where I stand — in the kitchen, eating shredded cheese at midnight." },
    { song: "Last of the Big Time Spenders", album: "Streetlife Serenade", year: 1974, spotifyTrackId: "2N4b5qVN7b4fCxQmRF3rU5", affirmation: "You're the last of the big time spenders! (Your credit card company would like a word.)" },
    { song: "Weekend Song", album: "Streetlife Serenade", year: 1974, spotifyTrackId: "3vKplLTQNkZVK0AvL4xPqX", affirmation: "It's a weekend song! Unless it's Tuesday. Then it's a 'pretend it's the weekend' song." },
    { song: "Souvenir", album: "Streetlife Serenade", year: 1974, spotifyTrackId: "1VRfGCLMJTpQjGxv3dLXvX", affirmation: "A picture postcard, a souvenir — your fridge magnet collection is basically a museum of memories." },
    { song: "The Mexican Connection", album: "Streetlife Serenade", year: 1974, spotifyTrackId: "0qoQH5S0tJE3kRkkRBvXEj", affirmation: "This instrumental is telling you to book that trip. The Mexican connection awaits. Tacos too." },

    // === TURNSTILES (1976) ===
    { song: "Say Goodbye to Hollywood", album: "Turnstiles", year: 1976, spotifyTrackId: "3eXzGJGp5s6v6v5Y5YPvYk", affirmation: "Say goodbye to Hollywood! Say goodbye to drama! Say hello to sweatpants and peace!" },
    { song: "Summer, Highland Falls", album: "Turnstiles", year: 1976, spotifyTrackId: "0pAFi1UHfjEEBKmQNv0Vt7", affirmation: "They say that these are not the best of times — but they're not the worst either, so let's call it a draw." },
    { song: "All You Wanna Do Is Dance", album: "Turnstiles", year: 1976, spotifyTrackId: "4pZVYTXdaAC1xbLj8vHNB5", affirmation: "All you wanna do is dance? VALID. Nobody needs a reason to bust a move." },
    { song: "New York State of Mind", album: "Turnstiles", year: 1976, spotifyTrackId: "1Hg2WPttqczCNjnTZCp5pp", affirmation: "I'm in a New York state of mind — which means I'm walking fast, looking annoyed, and craving a bagel." },
    { song: "James", album: "Turnstiles", year: 1976, spotifyTrackId: "2fV4MvxP8IwX9TBNeDdFhW", affirmation: "Do what's good for you, or you're not good for anybody — including your houseplants. Water them." },
    { song: "Prelude/Angry Young Man", album: "Turnstiles", year: 1976, spotifyTrackId: "5OqnX8w6x3fQx2FiAzk8Ff", affirmation: "There's a place in the world for the angry young man — and also for the mildly irritated middle-aged person." },
    { song: "I've Loved These Days", album: "Turnstiles", year: 1976, spotifyTrackId: "4pZVYTXdaAC1xbLj8vHNB4", affirmation: "I've loved these days! Even the weird ones. Especially the weird ones. They build character." },
    { song: "Miami 2017 (Seen the Lights Go Out on Broadway)", album: "Turnstiles", year: 1976, spotifyTrackId: "2fV4MvxP8IwX9TBNeDdFhv", affirmation: "They say the lights went out on Broadway — but YOUR light is still on. Keep shining, you absolute legend." },

    // === THE STRANGER (1977) ===
    { song: "Movin' Out (Anthony's Song)", album: "The Stranger", year: 1977, spotifyTrackId: "5P9X9V8VaJYjQrFpqXfmns", affirmation: "Anthony works in the grocery store — but YOU don't have to work yourself to death for a Cadillac-ack-ack-ack-ack." },
    { song: "The Stranger", album: "The Stranger", year: 1977, spotifyTrackId: "4LT7Z0mxeUHBaJCPGJnL8W", affirmation: "We all have a face that we hide away forever — yours is the one that eats ice cream straight from the container." },
    { song: "Just the Way You Are", album: "The Stranger", year: 1977, spotifyTrackId: "55qBVYSaBFctaGPVkl6C1R", affirmation: "Don't go changing to try and please me — I love you just the way you are. Weird hobbies and all." },
    { song: "Scenes from an Italian Restaurant", album: "The Stranger", year: 1977, spotifyTrackId: "5cJdCqJk1x2iaGzDPLvqTu", affirmation: "A bottle of white, a bottle of red — or whatever's on sale, honestly. Brenda and Eddie would understand." },
    { song: "Vienna", album: "The Stranger", year: 1977, spotifyTrackId: "4U45aEWtQhrm8A5mxPaFZ7", affirmation: "Slow down, you crazy child — Vienna waits for you! So does your bed. And snacks. No rush." },
    { song: "Only the Good Die Young", album: "The Stranger", year: 1977, spotifyTrackId: "6rxCuYzGPmObEwQqI4aSjX", affirmation: "Only the good die young — so by that logic, your bad decisions might be adding years. Silver lining!" },
    { song: "She's Always a Woman", album: "The Stranger", year: 1977, spotifyTrackId: "6sHqLjI7tqnVE4eNcY9lmO", affirmation: "She can kill with a smile, she can wound with her eyes — she's also probably tired. Be kind to her." },
    { song: "Get It Right the First Time", album: "The Stranger", year: 1977, spotifyTrackId: "3tVhKlJnWxZBGheCEMPKK8", affirmation: "Get it right the first time — that's the main thing. But also, second chances exist. And third. We're flexible." },
    { song: "Everybody Has a Dream", album: "The Stranger", year: 1977, spotifyTrackId: "5Rw8TGMSRSxIkYwPpMHBu9", affirmation: "Everybody has a dream — even if yours is just a really long nap. Dreams are dreams." },

    // === 52ND STREET (1978) ===
    { song: "Big Shot", album: "52nd Street", year: 1978, spotifyTrackId: "3xbDhddvqFnjtOE3rFHlgC", affirmation: "You had to be a BIG SHOT, didn't you? Well, today you're allowed to be a medium shot. Rest up." },
    { song: "Honesty", album: "52nd Street", year: 1978, spotifyTrackId: "7bD2iXJD9LvP6PvXyxdqfI", affirmation: "Honesty is such a lonely word — but so is 'moist' and we don't write songs about that. Be honest anyway." },
    { song: "My Life", album: "52nd Street", year: 1978, spotifyTrackId: "07GvNcU1WdyZJq1XjKQgSP", affirmation: "Go ahead with your own life, leave me alone! In a good way. Boundaries are healthy." },
    { song: "Zanzibar", album: "52nd Street", year: 1978, spotifyTrackId: "4T0dNaLDqq5r6cfdZlZzns", affirmation: "Ali dances and the audience applauds — you don't need to be a champion, just do a little shimmy. Life's good." },
    { song: "Stiletto", album: "52nd Street", year: 1978, spotifyTrackId: "3FWMWoqzPKQNJBfwmIp0C9", affirmation: "She cuts you once, she cuts you twice — maybe stop dating people who are described with knife metaphors?" },
    { song: "Rosalinda's Eyes", album: "52nd Street", year: 1978, spotifyTrackId: "3EpqYDxGKmZxZG7qYGt1EF", affirmation: "Señorita, don't you know — your eyes tell a story. Mostly that you need more sleep. Same." },
    { song: "Half a Mile Away", album: "52nd Street", year: 1978, spotifyTrackId: "6mj0T7HrfGCLW5J8u4MqBW", affirmation: "Half a mile away from home — that's like 2,640 feet! Or one really long walk when you forgot your keys." },
    { song: "Until the Night", album: "52nd Street", year: 1978, spotifyTrackId: "6mj0T7HrfGCLW5J8u4MqBM", affirmation: "I'll wait until the night — because mornings are hard and nights have snacks." },
    { song: "52nd Street", album: "52nd Street", year: 1978, spotifyTrackId: "5nqvmKxWLuQW5zF6eT3GCT", affirmation: "They say hot jazz is what we do best — you do you best. Whatever that is. It's probably great." },

    // === GLASS HOUSES (1980) ===
    { song: "You May Be Right", album: "Glass Houses", year: 1980, spotifyTrackId: "2CfLewLtHs6nDGDsLupuYU", affirmation: "You may be right, I may be crazy — but it just may be a lunatic you're looking for! Embrace the chaos." },
    { song: "Sometimes a Fantasy", album: "Glass Houses", year: 1980, spotifyTrackId: "0fO1KemWL2uCCQmM22iKlj", affirmation: "Sometimes a fantasy is all you need — especially when reality includes doing laundry." },
    { song: "Don't Ask Me Why", album: "Glass Houses", year: 1980, spotifyTrackId: "5yZgS5qCfCpP7XpBbLMHbl", affirmation: "Don't ask me why! I don't have to explain my snack choices to anyone." },
    { song: "It's Still Rock and Roll to Me", album: "Glass Houses", year: 1980, spotifyTrackId: "7pKfPomDEeI4TPT6EOYjn9", affirmation: "What's the matter with the clothes I'm wearing? NOTHING. You look fantastic. Billy would approve." },
    { song: "All for Leyna", album: "Glass Houses", year: 1980, spotifyTrackId: "6YhvKd4aRkqvIaSZlLqKUz", affirmation: "She stood on the tracks, waving her arms — that's dramatic. Maybe just text back instead?" },
    { song: "I Don't Want to Be Alone", album: "Glass Houses", year: 1980, spotifyTrackId: "3aY0cBvqx15xf7xDPaKqKW", affirmation: "I don't want to be alone anymore — that's what group chats are for. Digital togetherness counts." },
    { song: "Sleeping with the Television On", album: "Glass Houses", year: 1980, spotifyTrackId: "6P3A9BnPKljFr4cE3kfG5u", affirmation: "You're sleeping with the television on — and the phone, and the laptop. Modern lullabies." },
    { song: "C'etait Toi (You Were the One)", album: "Glass Houses", year: 1980, spotifyTrackId: "1xJQdCZhW5KvZVU4A5jEr8", affirmation: "C'etait toi — that's French for 'it was you.' Fancy! You're internationally significant." },
    { song: "Close to the Borderline", album: "Glass Houses", year: 1980, spotifyTrackId: "6nTiIhLmQ3FKAZ4VnZWC5D", affirmation: "Close to the borderline — but still on the right side. That's called balance, baby." },
    { song: "Through the Long Night", album: "Glass Houses", year: 1980, spotifyTrackId: "3aY0cBvqx15xf7xDPaKqKD", affirmation: "Through the long night with you — Netflix counts as company. You're never truly alone." },

    // === THE NYLON CURTAIN (1982) ===
    { song: "Allentown", album: "The Nylon Curtain", year: 1982, spotifyTrackId: "4gCNyTk14TzR5VuDAYxzZh", affirmation: "Well we're living here in Allentown — or wherever you are. Same economic anxiety, different ZIP code." },
    { song: "Laura", album: "The Nylon Curtain", year: 1982, spotifyTrackId: "5TN2vhX4bXjmVPxd5kKdAQ", affirmation: "Laura calls me in the middle of the night — healthy boundaries, Laura! But also, you can text me anytime." },
    { song: "Pressure", album: "The Nylon Curtain", year: 1982, spotifyTrackId: "5x7J34KmnOYWj0fLP9JAQI", affirmation: "Pressure! Pressing down on me, pressing down on you — wait, that's Queen. But Billy gets it too. Deep breaths." },
    { song: "Goodnight Saigon", album: "The Nylon Curtain", year: 1982, spotifyTrackId: "5xB8eGBDHq2orJpPMwZjAT", affirmation: "We said we'd all go down together — and by that I mean group projects. Team effort. Always." },
    { song: "She's Right on Time", album: "The Nylon Curtain", year: 1982, spotifyTrackId: "1GR6sIv0OfXqWJxPcMZ0qW", affirmation: "She's right on time — unlike your Amazon packages. Trust the universe's shipping schedule." },
    { song: "A Room of Our Own", album: "The Nylon Curtain", year: 1982, spotifyTrackId: "3tE3xwwTi8WqJ0N3f6O8qW", affirmation: "A room of our own — with WiFi and snacks. Virginia Woolf would be so proud." },
    { song: "Surprises", album: "The Nylon Curtain", year: 1982, spotifyTrackId: "4YKGM8xMzNV9JNdN7HXLOz", affirmation: "Nothing's what I thought it would be — SURPRISES! Life's just a weird party you didn't RSVP to." },
    { song: "Scandinavian Skies", album: "The Nylon Curtain", year: 1982, spotifyTrackId: "3x5gK7kkqnYS3xB8S5V5qZ", affirmation: "Scandinavian skies — cold but beautiful, like that ice cream you're about to eat." },
    { song: "Where's the Orchestra?", album: "The Nylon Curtain", year: 1982, spotifyTrackId: "1GR6sIv0OfXqWJxPcMZ0qv", affirmation: "Where's the orchestra? This was supposed to be a SHOW! Life promised background music. Play your own." },

    // === AN INNOCENT MAN (1983) ===
    { song: "Easy Money", album: "An Innocent Man", year: 1983, spotifyTrackId: "6ecSvj7fhMz2KoxDj23zKW", affirmation: "Easy money! Not really though. Money is rarely easy. But you'll figure it out." },
    { song: "An Innocent Man", album: "An Innocent Man", year: 1983, spotifyTrackId: "6ecSvj7fhMz2KoxDj23zKx", affirmation: "I AM an innocent man! (Said while clearly guilty of eating the last cookie.)" },
    { song: "The Longest Time", album: "An Innocent Man", year: 1983, spotifyTrackId: "2qP4NafJoWrFnljnqJzk3P", affirmation: "Whoa-oh-oh, for the longest time — you've been amazing. Since forever. Doo-wop confirmed." },
    { song: "This Night", album: "An Innocent Man", year: 1983, spotifyTrackId: "1i7QWHHGe9RjI7vVSvVzNd", affirmation: "This night is MINE — it's my night to do absolutely nothing and feel great about it. Beethoven approves." },
    { song: "Tell Her About It", album: "An Innocent Man", year: 1983, spotifyTrackId: "2o46L6fRawm9AtpnbBL4JV", affirmation: "Tell her about it! Communication is key. Unless it's passive-aggressive notes. Don't do those." },
    { song: "Uptown Girl", album: "An Innocent Man", year: 1983, spotifyTrackId: "5zA8vzDGqPl2AzZkEYQGKh", affirmation: "Uptown girl, she's been living in her uptown world — and YOU are downtown royalty. Both valid." },
    { song: "Careless Talk", album: "An Innocent Man", year: 1983, spotifyTrackId: "0lHfxuT1qlg1L6n8RZhrzW", affirmation: "Careless talk — maybe think before you tweet. Billy was warning us about social media in 1983." },
    { song: "Christie Lee", album: "An Innocent Man", year: 1983, spotifyTrackId: "3K7XxuYSQALbxJoJfb9bxW", affirmation: "Christie Lee, she never cared about the saxophone — but you should care about YOUR passions, unlike Christie." },
    { song: "Leave a Tender Moment Alone", album: "An Innocent Man", year: 1983, spotifyTrackId: "2qP4NafJoWrFnljnqJzk3W", affirmation: "Leave a tender moment alone — don't ruin it by checking your phone. Just... be present. Radical concept." },
    { song: "Keeping the Faith", album: "An Innocent Man", year: 1983, spotifyTrackId: "0lHfxuT1qlg1L6n8RZhrzH", affirmation: "You can get just so much from a good thing — and faith is free, so stock up." },

    // === THE BRIDGE (1986) ===
    { song: "Running on Ice", album: "The Bridge", year: 1986, spotifyTrackId: "3K7XxuYSQALbxJoJfb9bxv", affirmation: "Running on ice — which is a terrible idea, please walk carefully. Metaphorically too." },
    { song: "This Is the Time", album: "The Bridge", year: 1986, spotifyTrackId: "3K7XxuYSQALbxJoJfb9bxW", affirmation: "This is the time to remember — and also to make new memories. Don't get stuck in nostalgia mode." },
    { song: "A Matter of Trust", album: "The Bridge", year: 1986, spotifyTrackId: "7oyhXNpf7D4p8B9n7aYi3c", affirmation: "It's a matter of trust — like when you order food online and hope it looks like the picture. Leap of faith." },
    { song: "Modern Woman", album: "The Bridge", year: 1986, spotifyTrackId: "3tE3xwwTi8WqJ0N3f6O8qS", affirmation: "She's a modern woman! She's got PayPal and a podcast and imposter syndrome. Queen." },
    { song: "Baby Grand", album: "The Bridge", year: 1986, spotifyTrackId: "4YKGM8xMzNV9JNdN7HXLOW", affirmation: "Ever since I found you, baby grand — you've been a grand companion. Ray Charles AND Billy approve of your choices." },
    { song: "Big Man on Mulberry Street", album: "The Bridge", year: 1986, spotifyTrackId: "1GR6sIv0OfXqWJxPcMZ0qX", affirmation: "Big man on Mulberry Street — jazz hands optional but encouraged in your daily life." },
    { song: "Temptation", album: "The Bridge", year: 1986, spotifyTrackId: "3x5gK7kkqnYS3xB8S5V5qW", affirmation: "Temptation! That second donut is calling. Billy understands. Life is short." },
    { song: "Code of Silence", album: "The Bridge", year: 1986, spotifyTrackId: "5TN2vhX4bXjmVPxd5kKdAW", affirmation: "There's a code of silence we don't dare speak — unless you're at brunch. Then spill the tea." },
    { song: "Getting Closer", album: "The Bridge", year: 1986, spotifyTrackId: "4gCNyTk14TzR5VuDAYxzZW", affirmation: "Getting closer! To your goals, to the weekend, to the fridge. Progress is progress." },

    // === STORM FRONT (1989) ===
    { song: "That's Not Her Style", album: "Storm Front", year: 1989, spotifyTrackId: "3kMvAhPRgfVVVHbKj4pGnW", affirmation: "That's not her style — and YOUR style is uniquely yours. Don't let anyone dim your sparkle." },
    { song: "We Didn't Start the Fire", album: "Storm Front", year: 1989, spotifyTrackId: "3cIvFz6oGpyp8WS4QzGEoP", affirmation: "We didn't start the fire! It was always burning since the world's been turning. (Not our fault, basically.)" },
    { song: "The Downeaster 'Alexa'", album: "Storm Front", year: 1989, spotifyTrackId: "45qauKvY4X1KqKFUyJZb8W", affirmation: "I'm a Bayman like my father was before — honoring tradition while adapting to change. You got this, captain." },
    { song: "I Go to Extremes", album: "Storm Front", year: 1989, spotifyTrackId: "3kMvAhPRgfVVVHbKj4pGnX", affirmation: "Darling, I don't know why I go to extremes — maybe try the middle sometime? It's cozy there." },
    { song: "Shameless", album: "Storm Front", year: 1989, spotifyTrackId: "45qauKvY4X1KqKFUyJZb8F", affirmation: "I'm shameless! And so should you be. Own your weirdness. It's your superpower." },
    { song: "Storm Front", album: "Storm Front", year: 1989, spotifyTrackId: "3kMvAhPRgfVVVHbKj4pGnA", affirmation: "There's a storm front coming — so stock up on snacks and charge your devices. Be prepared." },
    { song: "Leningrad", album: "Storm Front", year: 1989, spotifyTrackId: "3cIvFz6oGpyp8WS4QzGEoW", affirmation: "Viktor was born in the spring of '44 — proving you can be friends with anyone. Borders schmorders." },
    { song: "State of Grace", album: "Storm Front", year: 1989, spotifyTrackId: "0pYVIJXmCW5FfnrTSCxQiW", affirmation: "State of grace? State of chaos? Same thing some days. You're doing beautifully." },
    { song: "When in Rome", album: "Storm Front", year: 1989, spotifyTrackId: "45qauKvY4X1KqKFUyJZb8X", affirmation: "When in Rome, do as the Romans do — which apparently means eating pasta and gesturing wildly. Approved." },
    { song: "And So It Goes", album: "Storm Front", year: 1989, spotifyTrackId: "0pYVIJXmCW5FfnrTSCxQis", affirmation: "And so it goes, and so it goes — life keeps moving, and so do you. That's literally all we can do." },

    // === RIVER OF DREAMS (1993) ===
    { song: "No Man's Land", album: "River of Dreams", year: 1993, spotifyTrackId: "1eFfwFvQ8VQPGZ8j5VaSAW", affirmation: "Out in no man's land — where the strip malls and the subdivisions roam. Find your space." },
    { song: "The Great Wall of China", album: "River of Dreams", year: 1993, spotifyTrackId: "4LT7Z0mxeUHBaJCPGJnL8X", affirmation: "The Great Wall of China — built one brick at a time. Your progress counts, even if it's small." },
    { song: "Blonde Over Blue", album: "River of Dreams", year: 1993, spotifyTrackId: "4YKGM8xMzNV9JNdN7HXLOX", affirmation: "She loves the sea, she loves the sand — and you love whatever you love. It's all valid." },
    { song: "A Minor Variation", album: "River of Dreams", year: 1993, spotifyTrackId: "1GR6sIv0OfXqWJxPcMZ0qY", affirmation: "A minor variation in the script — also known as 'improvising through life.' Oscar-worthy performance." },
    { song: "Shades of Grey", album: "River of Dreams", year: 1993, spotifyTrackId: "3x5gK7kkqnYS3xB8S5V5qX", affirmation: "Shades of grey wherever I go — adulting is just realizing nothing is black and white. Except penguins." },
    { song: "All About Soul", album: "River of Dreams", year: 1993, spotifyTrackId: "5TN2vhX4bXjmVPxd5kKdAX", affirmation: "It's all about soul — and also snacks, and rest, and being kind to yourself. Soulful AND practical." },
    { song: "Lullabye (Goodnight, My Angel)", album: "River of Dreams", year: 1993, spotifyTrackId: "4LT7Z0mxeUHBaJCPGJnL8k", affirmation: "Goodnight my angel, time to close your eyes — I'll be crying in 3... 2... 1... This song DESTROYS me. 😭" },
    { song: "The River of Dreams", album: "River of Dreams", year: 1993, spotifyTrackId: "1eFfwFvQ8VQPGZ8j5VaSAH", affirmation: "In the middle of the night, I go walking in my sleep — probably to the fridge. The river of dreams has cheese." },
    { song: "Two Thousand Years", album: "River of Dreams", year: 1993, spotifyTrackId: "4YKGM8xMzNV9JNdN7HXLOY", affirmation: "In two thousand years, we'll still be here — okay we WON'T, but the vibes will live on." },
    { song: "Famous Last Words", album: "River of Dreams", year: 1993, spotifyTrackId: "4YKGM8xMzNV9JNdN7HXLOZ", affirmation: "These are the last words I have to say — before I end this album. Graceful exit. You too will know when to bow out." }
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
