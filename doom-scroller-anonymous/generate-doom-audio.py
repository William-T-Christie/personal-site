#!/usr/bin/env python3
"""
MF DOOM Voice Generator
Generates all audio files for the DOOM Scroller Anonymous app using FakeYou API
"""

import fakeyou
import os
import time
import sys

# MF DOOM voice model ID on FakeYou
DOOM_VOICE_ID = "TM:aj02fqmw5mzq"

# Base output directory
OUTPUT_DIR = "assets/doom-audio"

# All audio files to generate
AUDIO_FILES = {
    "times": {
        "1-minute.wav": "one minute",
        "2-minutes.wav": "two minutes",
        "3-minutes.wav": "three minutes",
        "5-minutes.wav": "five minutes",
        "10-minutes.wav": "ten minutes",
        "15-minutes.wav": "fifteen minutes",
        "20-minutes.wav": "twenty minutes",
        "25-minutes.wav": "twenty five minutes",
        "30-minutes.wav": "thirty minutes",
        "35-minutes.wav": "thirty five minutes",
        "40-minutes.wav": "forty minutes",
        "45-minutes.wav": "forty five minutes",
        "50-minutes.wav": "fifty minutes",
        "55-minutes.wav": "fifty five minutes",
        "1-hour.wav": "one hour",
        "2-hours.wav": "two hours",
        "3-hours.wav": "three hours",
        "4-hours.wav": "four hours",
        "5-hours.wav": "five hours",
        "6-hours.wav": "six hours",
        "7-hours.wav": "seven hours",
        "8-hours.wav": "eight hours",
        "9-hours.wav": "nine hours",
        "10-hours.wav": "ten hours",
        "1-hour-15-minutes.wav": "one hour fifteen minutes",
        "1-hour-30-minutes.wav": "one hour thirty minutes",
        "1-hour-45-minutes.wav": "one hour forty five minutes",
        "2-hours-15-minutes.wav": "two hours fifteen minutes",
        "2-hours-30-minutes.wav": "two hours thirty minutes",
        "2-hours-45-minutes.wav": "two hours forty five minutes",
        "3-hours-15-minutes.wav": "three hours fifteen minutes",
        "3-hours-30-minutes.wav": "three hours thirty minutes",
        "3-hours-45-minutes.wav": "three hours forty five minutes",
        "4-hours-30-minutes.wav": "four hours thirty minutes",
        "5-hours-30-minutes.wav": "five hours thirty minutes",
    },
    "apps": {
        "tiktok.wav": "TikTok",
        "instagram.wav": "Instagram",
        "twitter.wav": "Twitter",
        "facebook.wav": "Facebook",
        "reddit.wav": "Reddit",
        "snapchat.wav": "Snapchat",
        "youtube.wav": "YouTube",
        "netflix.wav": "Netflix",
        "twitch.wav": "Twitch",
        "spotify.wav": "Spotify",
        "tinder.wav": "Tinder",
        "bumble.wav": "Bumble",
        "hinge.wav": "Hinge",
        "messages.wav": "Messages",
        "discord.wav": "Discord",
        "safari.wav": "Safari",
        "chrome.wav": "Chrome",
        "mail.wav": "Mail",
        "photos.wav": "Photos",
        "amazon.wav": "Amazon",
        "uber.wav": "Uber",
        "doordash.wav": "DoorDash",
    },
    "openings": {
        "opening-1a.wav": "Ahem. DOOM here to crack the code on your scroll.",
        "opening-1b.wav": "deep in that phone, lost your soul in the hole.",
        "opening-2a.wav": "Peek the metal face, catch a case of the facts.",
        "opening-2b.wav": "of your life spent staring at apps. Relax, it's only wax.",
        "opening-3a.wav": "Yo, check the stats. DOOM sees it all from the mask.",
        "opening-3b.wav": "on that glass? Son, you been had. That's mad.",
        "opening-4a.wav": "The supervillain emerged from the digital fog.",
        "opening-4b.wav": "logged like a hog in a blog. That's your job?",
        "opening-5a.wav": "DOOM back from the dead to read you your wrongs.",
        "opening-5b.wav": "gone? That's a villain's worth of songs.",
        "opening-6a.wav": "Step to the mic, spike the data like Doom spiked the punch.",
        "opening-6b.wav": "today. More hours than a business lunch.",
        "opening-7a.wav": "Hmmm. Peep the read. Proceed to bleed out the feed.",
        "opening-7b.wav": "of screen fiend. That's quite the deed indeed.",
        "opening-8a.wav": "The mask don't lie. Fry your alibi. Why try to hide?",
        "opening-8b.wav": "on that ride. Your thumbs certified fried.",
    },
    "roasts": {
        "tiktok-1b.wav": "on the clock for the Tok, doc. Brain on the rocks. Forty five seconds got you locked in a box like a paradox.",
        "tiktok-2a.wav": "TikTok fiend.",
        "tiktok-2b.wav": "of the dream cream, so it seem. Swipe up on the scheme. Your attention chopped up like cuisine.",
        "instagram-1a.wav": "The Gram scam.",
        "instagram-1b.wav": "of the grand sham, fam. Double tap trap. Your self esteem in the spam can like ham.",
        "instagram-2b.wav": "grammin and slammin through stories. What's the glory? Peepin lives through a lens while yours stay allegory.",
        "youtube-1b.wav": "in the Tube, rube. Lost in the cube. One more video turns to fifty. Your schedule's in a mood.",
        "youtube-2a.wav": "YouTube rabbit stew.",
        "youtube-2b.wav": "of the view through, true blue. Algorithm's got you hooked like Krusty's Crew. Boo hoo.",
        "netflix-1a.wav": "Netflix flex.",
        "netflix-1b.wav": "of the complex perplex. Binge the whole season while your goals become your ex.",
        "twitter-1b.wav": "on the bird app. Absurd rap. Heard that? Arguin with eggs and bots. Your brain's a curd trap.",
        "reddit-1b.wav": "on the Reddit spread. Better fed your head. Subreddit rabbit holes got your productivity dead. Misled.",
        "snapchat-1b.wav": "on the Snap app. Cap after cap. A trap. Ghost mode on your goals while you chase that streak like a sap.",
        "facebook-1b.wav": "on the book of face. A disgrace to the space race. Minion memes and your aunt's schemes. Boomer base case.",
        "discord-1b.wav": "on the Discord cord. Bored, floored, and ignored. Server hopping while your real relationships get stored.",
        "spotify-1b.wav": "on the Spot. Hot. That's all you got? Not. At least you got taste. DOOM will give you that prop. Don't stop.",
        "generic-1b.wav": "on",
        "generic-1c.wav": "The trap that saps your cap. Doom sees the data. Now take that and put it in your lap.",
    },
    "outros": {
        "light-1a.wav": "Only",
        "light-1b.wav": "That's the appetizer plate. DOOM expected more from you. Rookie mistake. But wait.",
        "light-2b.wav": "is light. You fight the good fight. Alright. But tomorrow the algorithm strikes back in the night.",
        "moderate-1b.wav": "today. Decay on display. Cliche. Halfway to hooked. Your focus got cooked. Okay?",
        "heavy-1b.wav": "Now we're cooking with gas. Crass and brass. Your thumb's got a rash from scrolling so fast. First class.",
        "extreme-1b.wav": "Son, you broke the machine. Obscene. Even DOOM thinks you need a dopamine detox vaccine.",
    },
    "closings": {
        "closing-1.wav": "DOOM has spoken. The token's been broken and soaked in. Put the phone down and focus. Or stay forever smokin.",
        "closing-2.wav": "The mask fades back to black. No slack. No take backs. Your screen time's on wax. Now go touch grass. Relax.",
        "closing-3.wav": "This been DOOM, from the room of doom and gloom. Your phone's a tomb. Let your real life resume. Make room.",
        "closing-4.wav": "ALL CAPS when you spell it, compel it, and tell it. The verdict's in. You've been scrolling. Now shelve it or sell it.",
        "closing-5.wav": "The supervillain vanish like magic cabbage and lavish. Remember these bars when your thumb starts its average ravage.",
        "closing-6.wav": "DOOM out. Shout it loud. Crowd around the cloud. Your data's been read. Now go outside. Be proud or be cowed.",
        "closing-7.wav": "Hmmm. That's a wrap like a gift. Swift. No rift. The metal face gave you the lift. Now get the gist and shift.",
        "closing-8.wav": "The case closed. Prose exposed. Nose knows where it goes. DOOM froze your scroll game cold. Now compose and decompose.",
    },
}


def generate_audio(fy, text, output_path):
    """Generate a single audio file using FakeYou"""
    print(f"  Generating: {os.path.basename(output_path)}")
    print(f"  Text: {text[:50]}{'...' if len(text) > 50 else ''}")

    try:
        # Request TTS generation
        job = fy.say(text, DOOM_VOICE_ID)

        # Poll for completion
        while True:
            status = job.status
            if status == "complete_success":
                break
            elif status == "complete_failure":
                print(f"  ERROR: Generation failed for {output_path}")
                return False
            elif status == "dead":
                print(f"  ERROR: Job died for {output_path}")
                return False

            print(f"  Status: {status}... waiting")
            time.sleep(5)

        # Download the audio
        job.save(output_path)
        print(f"  SUCCESS: Saved to {output_path}")
        return True

    except Exception as e:
        print(f"  ERROR: {str(e)}")
        return False


def main():
    print("=" * 60)
    print("MF DOOM Voice Generator")
    print("=" * 60)
    print()

    # Initialize FakeYou client
    print("Connecting to FakeYou...")
    fy = fakeyou.FakeYou()
    print("Connected!")
    print()

    # Count total files
    total_files = sum(len(files) for files in AUDIO_FILES.values())
    generated = 0
    failed = 0
    skipped = 0

    print(f"Total files to generate: {total_files}")
    print()

    # Generate each category
    for category, files in AUDIO_FILES.items():
        print(f"\n{'=' * 40}")
        print(f"Category: {category.upper()}")
        print(f"{'=' * 40}")

        # Create output directory
        category_dir = os.path.join(OUTPUT_DIR, category)
        os.makedirs(category_dir, exist_ok=True)

        for filename, text in files.items():
            output_path = os.path.join(category_dir, filename)

            # Skip if already exists
            if os.path.exists(output_path):
                print(f"  SKIPPED (exists): {filename}")
                skipped += 1
                continue

            # Generate audio
            success = generate_audio(fy, text, output_path)

            if success:
                generated += 1
            else:
                failed += 1

            # Rate limiting - wait between requests
            print("  Waiting 10 seconds (rate limit)...")
            time.sleep(10)

    # Summary
    print()
    print("=" * 60)
    print("GENERATION COMPLETE")
    print("=" * 60)
    print(f"Generated: {generated}")
    print(f"Skipped (already existed): {skipped}")
    print(f"Failed: {failed}")
    print()

    if failed > 0:
        print("Some files failed. Run the script again to retry.")
    else:
        print("All files generated successfully!")


if __name__ == "__main__":
    main()
