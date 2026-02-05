# MF DOOM TTS Audio Generation Plan

## Strategy: Audio Segment Stitching

Instead of generating every possible combination, we split templates into segments and stitch them at runtime.

---

## PART 1: TIME PHRASES (Generate These First)

These get inserted into templates dynamically.

### Minutes (1-59)
```
1 minute, 2 minutes, 3 minutes, 5 minutes, 10 minutes,
15 minutes, 20 minutes, 25 minutes, 30 minutes, 35 minutes,
40 minutes, 45 minutes, 50 minutes, 55 minutes
```

### Hours
```
1 hour, 2 hours, 3 hours, 4 hours, 5 hours, 6 hours,
7 hours, 8 hours, 9 hours, 10 hours
```

### Combined (most common)
```
1 hour 15 minutes, 1 hour 30 minutes, 1 hour 45 minutes
2 hours 15 minutes, 2 hours 30 minutes, 2 hours 45 minutes
3 hours 15 minutes, 3 hours 30 minutes, 3 hours 45 minutes
4 hours 30 minutes, 5 hours 30 minutes
```

**Total time phrases: ~35 files**

---

## PART 2: APP NAMES

```
TikTok, Instagram, Twitter, Facebook, Reddit, Snapchat,
YouTube, Netflix, Twitch, Spotify, Tinder, Bumble, Hinge,
Messages, Discord, Safari, Chrome, Mail, Photos, Camera,
Settings, App Store, Amazon, Uber, DoorDash
```

**Total app names: ~25 files**

---

## PART 3: OPENINGS (Split at {totalTime})

### Opening 1
- `opening_1a`: "Ahem, DOOM here to crack the code on your scroll"
- [INSERT TIME]
- `opening_1b`: "deep in that phone, lost your soul in the hole"

### Opening 2
- `opening_2a`: "Peek the metal face, catch a case of the facts"
- [INSERT TIME]
- `opening_2b`: "of your life spent staring at apps, relax, it's only wax"

### Opening 3
- `opening_3a`: "Yo, check the stats, DOOM sees it all from the mask"
- [INSERT TIME]
- `opening_3b`: "on that glass? Son you been had, that's mad"

### Opening 4
- `opening_4a`: "The supervillain emerged from the digital fog"
- [INSERT TIME]
- `opening_4b`: "logged like a hog in a blog, that's your job?"

### Opening 5
- `opening_5a`: "DOOM back from the dead to read you your wrongs"
- [INSERT TIME]
- `opening_5b`: "gone? That's a villain's worth of songs"

### Opening 6
- `opening_6a`: "Step to the mic, spike the data like Doom spiked the punch"
- [INSERT TIME]
- `opening_6b`: "today, more hours than a business lunch"

### Opening 7
- `opening_7a`: "Hmmm, peep the read, proceed to bleed out the feed"
- [INSERT TIME]
- `opening_7b`: "of screen fiend, that's quite the deed indeed"

### Opening 8
- `opening_8a`: "The mask don't lie, fry your alibi, why try to hide?"
- [INSERT TIME]
- `opening_8b`: "on that ride, your thumbs certified fried"

**Total opening segments: 16 files**

---

## PART 4: APP ROASTS (Split at {time} and {app})

### TikTok Roast 1
- `tiktok_1a`: [INSERT TIME]
- `tiktok_1b`: "on the clock for the Tok, doc, brain on the rocks. Forty-five seconds got you locked in a box like a paradox"

### TikTok Roast 2
- `tiktok_2a`: "TikTok fiend,"
- [INSERT TIME]
- `tiktok_2b`: "of the dream cream, so it seem. Swipe up on the scheme, your attention chopped up like cuisine"

### Instagram Roast 1
- `instagram_1a`: "The Gram scam,"
- [INSERT TIME]
- `instagram_1b`: "of the grand sham, fam. Double-tap trap, your self-esteem in the spam can like ham"

### Instagram Roast 2
- `instagram_2a`: [INSERT TIME]
- `instagram_2b`: "grammin' and slammin' through stories, what's the glory? Peepin' lives through a lens while yours stay allegory"

### YouTube Roast 1
- `youtube_1a`: [INSERT TIME]
- `youtube_1b`: "in the Tube, rube, lost in the cube. One more video turns to fifty, your schedule's in a mood"

### YouTube Roast 2
- `youtube_2a`: "YouTube rabbit stew,"
- [INSERT TIME]
- `youtube_2b`: "of the view-through true blue. Algorithm's got you hooked like Krusty's Crew, boo hoo"

### Netflix Roast 1
- `netflix_1a`: "Netflix flex,"
- [INSERT TIME]
- `netflix_1b`: "of the complex perplex. Binge the whole season while your goals become your ex"

### Twitter Roast 1
- `twitter_1a`: [INSERT TIME]
- `twitter_1b`: "on the bird app, absurd rap, heard that? Arguin' with eggs and bots, your brain's a curd trap"

### Reddit Roast 1
- `reddit_1a`: [INSERT TIME]
- `reddit_1b`: "on the Reddit spread, better fed your head. Subreddit rabbit holes got your productivity dead, misled"

### Snapchat Roast 1
- `snapchat_1a`: [INSERT TIME]
- `snapchat_1b`: "on the Snap app, cap after cap, a trap. Ghost mode on your goals while you chase that streak like a sap"

### Generic Roast 1
- `generic_1a`: [INSERT TIME]
- `generic_1b`: "on"
- [INSERT APP]
- `generic_1c`: "the trap that saps your cap. Doom sees the data, now take that and put it in your lap"

### Generic Roast 2
- `generic_2a`: [INSERT APP]
- `generic_2b`: "got your time,"
- [INSERT TIME]
- `generic_2c`: "of the prime crime. Another app snatching minutes while you're stuck in the paradigm"

**Total app roast segments: ~30 files**

---

## PART 5: SEVERITY OUTROS (Split at {totalTime})

### LIGHT
- `light_1a`: "Only"
- [INSERT TIME]
- `light_1b`: "? That's the appetizer plate. DOOM expected more from you, rookie mistake, but wait"

- `light_2a`: [INSERT TIME]
- `light_2b`: "is light, you fight the good fight, alright. But tomorrow the algorithm strikes back in the night"

### MODERATE
- `moderate_1a`: [INSERT TIME]
- `moderate_1b`: "today, decay on display, cliché. Halfway to hooked, your focus got cooked, okay?"

### HEAVY
- `heavy_1a`: [INSERT TIME]
- `heavy_1b`: "? Now we're cooking with gas, crass and brass. Your thumb's got a rash from scrolling so fast, first class"

### EXTREME
- `extreme_1a`: [INSERT TIME]
- `extreme_1b`: "?! Son you broke the machine, obscene. Even DOOM thinks you need a dopamine detox vaccine"

**Total outro segments: ~12 files**

---

## PART 6: CLOSINGS (No variables - generate as-is!)

1. `closing_1`: "DOOM has spoken, the token's been broken and soaked in. Put the phone down and focus, or stay forever smokin'"

2. `closing_2`: "The mask fades back to black, no slack, no take-backs. Your screen time's on wax, now go touch grass, relax"

3. `closing_3`: "This been DOOM, from the room of doom and gloom. Your phone's a tomb, let your real life resume, make room"

4. `closing_4`: "ALL CAPS when you spell it, compel it, and tell it. The verdict's in, you've been scrolling, now shelve it or sell it"

5. `closing_5`: "The supervillain vanish like magic cabbage and lavish. Remember these bars when your thumb starts its average ravage"

6. `closing_6`: "DOOM out, shout it loud, crowd around the cloud. Your data's been read, now go outside, be proud or be cowed"

7. `closing_7`: "Hmmm, that's a wrap like a gift, swift, no rift. The metal face gave you the lift, now get the gist and shift"

8. `closing_8`: "The case closed, prose exposed, nose knows where it goes. DOOM froze your scroll game cold, now compose and decompose"

**Total closings: 8 files**

---

## SUMMARY

| Category | Files Needed |
|----------|-------------|
| Time phrases | ~35 |
| App names | ~25 |
| Opening segments | 16 |
| App roast segments | ~30 |
| Outro segments | ~12 |
| Closings | 8 |
| **TOTAL** | **~126 files** |

---

## FILE NAMING CONVENTION

```
doom-audio/
├── times/
│   ├── 1-minute.mp3
│   ├── 2-minutes.mp3
│   ├── 1-hour.mp3
│   ├── 1-hour-30-minutes.mp3
│   └── ...
├── apps/
│   ├── tiktok.mp3
│   ├── instagram.mp3
│   └── ...
├── openings/
│   ├── opening-1a.mp3
│   ├── opening-1b.mp3
│   └── ...
├── roasts/
│   ├── tiktok-1a.mp3
│   ├── tiktok-1b.mp3
│   └── ...
├── outros/
│   ├── light-1a.mp3
│   ├── light-1b.mp3
│   └── ...
└── closings/
    ├── closing-1.mp3
    ├── closing-2.mp3
    └── ...
```

---

## GENERATION INSTRUCTIONS FOR FAKEYOU

1. Go to https://fakeyou.com/tts/TM:aj02fqmw5mzq (MF DOOM voice)
2. For each line, paste the text and generate
3. Download as WAV/MP3
4. Rename according to naming convention above
5. Ensure consistent audio levels across all files

**Tips for natural sound:**
- Add slight pauses at natural breath points
- Keep energy consistent across segments
- Test stitching a few before generating all
