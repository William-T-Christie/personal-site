/**
 * Daily Affirmations with Billy Joel
 * Main Application Controller
 *
 * The whole discography is one tape, in album order. Picking a song spools the tape to it,
 * then the deck plays that song's stretch while the affirmation is typed onto the card
 * and its Apple Music preview plays. The tape follows the music.
 */

class App {
    constructor() {
        this.data = window.AffirmationData;
        this.deck = new window.Deck();
        this.deck.setTrackCount(this.data.SONGS.length);
        this.deck.onEnd = () => this.syncPlayKey();

        this.music = new window.Music(this.data.SONGS);
        this.deck.levelSource = () => this.music.levels();
        this.audioSource = {
            fraction: () => this.music.fraction,
            running: () => this.music.playing,
            ended: () => this.music.audio.ended,
        };
        // Browsers only let sound start after a tap or key press, so get ready on the first one
        const unlock = () => this.music.unlock();
        ['pointerdown', 'touchend', 'click', 'keydown'].forEach((ev) => document.addEventListener(ev, unlock, { capture: true }));

        this.currentSong = null;
        this.typewriterAnimationId = 0;
        this.history = []; // songs heard this visit, for Back
        this.historyIndex = -1;
        this.loadId = 0;   // ignore an older load that finishes after a newer one
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.songSelector = document.getElementById('song-selector');
        this.lyricDisplay = document.getElementById('lyric-display');
        this.announcer = document.getElementById('announcer');
        this.songTitle = document.getElementById('song-title');
        this.albumInfo = document.getElementById('album-info');
        this.trackNo = document.getElementById('track-no');
        this.cardNote = document.getElementById('card-note');
        this.appleLink = document.getElementById('apple-link');
        this.playBtn = document.getElementById('btn-play');

        this.populateDropdown();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();

        // A shared link plays its song. Older links were encoded twice, so decode once more if needed.
        const songName = new URLSearchParams(window.location.search).get('song');
        if (songName) {
            let title = songName;
            try { if (/%[0-9a-f]{2}/i.test(title)) title = decodeURIComponent(title); } catch (e) { /* keep as is */ }
            const song = this.data.getSongByTitle(title);
            if (song) this.playSong(song);
        }
    }

    populateDropdown() {
        this.data.getAllSongsAlphabetical().forEach((song) => {
            const option = document.createElement('option');
            option.value = song.song;
            option.textContent = `${song.song} (${song.album}, ${song.year})`;
            this.songSelector.appendChild(option);
        });
    }

    setupEventListeners() {
        this.songSelector.addEventListener('change', (e) => {
            const song = e.target.value && this.data.getSongByTitle(e.target.value);
            if (song) this.playSong(song);
        });
        document.getElementById('btn-play').addEventListener('click', () => this.togglePlay());
        document.getElementById('btn-stop').addEventListener('click', () => this.stop());
        document.getElementById('btn-rewind').addEventListener('click', () => this.previous());
        document.getElementById('btn-forward').addEventListener('click', () => this.next());
        document.getElementById('btn-record').addEventListener('click', () => { this.deck.flashRecord(); this.loadRandomSong(); });
        document.getElementById('btn-reset').addEventListener('click', () => this.deck.resetCounter());
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore while typing, while picking a song, and when a modifier is held (Cmd+N and friends)
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                    if (tag === 'BUTTON') return; // a focused key already reacts to Space
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'n':
                case 'arrowright':
                    e.preventDefault();
                    this.next();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    this.previous();
                    break;
            }
        });
    }

    // ---------- choosing songs ----------
    indexOf(song) { return this.data.SONGS.indexOf(song); }

    /** A new random song, never the same one twice in a row */
    loadRandomSong() {
        const songs = this.data.SONGS;
        let song;
        do { song = songs[Math.floor(Math.random() * songs.length)]; }
        while (this.currentSong && song === this.currentSong && songs.length > 1);
        this.playSong(song);
    }

    /** Next: forward through songs already heard, or on to a new random one */
    next() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadSong(this.history[this.historyIndex]);
        } else {
            this.loadRandomSong();
        }
    }

    /** Back: the previous affirmation, or the start of this one if there isn't one */
    previous() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadSong(this.history[this.historyIndex]);
        } else if (this.currentSong) {
            this.loadSong(this.currentSong, { retype: false });
        }
    }

    playSong(song) {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(song);
        this.historyIndex = this.history.length - 1;
        this.loadSong(song);
    }

    /** Spool to the song, then play it and type its affirmation */
    async loadSong(song, { retype = true } = {}) {
        const id = ++this.loadId;
        const changed = song !== this.currentSong;
        this.currentSong = song;
        this.songSelector.value = song.song;

        const url = new URL(window.location.href);
        url.searchParams.set('song', song.song);
        window.history.replaceState({}, '', url);

        if (changed) this.clearCard();
        this.music.pause();
        const loading = this.music.load(song); // starts buffering while the tape spools
        const i = this.indexOf(song);
        const arrived = await this.deck.cue(this.deck.positionOf(i));
        if (id !== this.loadId || arrived === false) return;

        if (changed || retype) this.updateDisplay(song, i);
        const hasMusic = await loading;
        if (id !== this.loadId) return;
        await this.startPlaying(hasMusic, id);
    }

    /** Start the tape, with the music when there is some */
    async startPlaying(hasMusic, id = this.loadId) {
        const i = this.indexOf(this.currentSong);
        const start = this.deck.positionOf(i), end = this.deck.positionOf(i + 1);
        this.setLink(this.currentSong);
        if (!hasMusic) {
            this.setNote(this.music.info.size ? "There's no preview for this one, so enjoy the silence." : "The music couldn't load, so the tape plays silently.");
            this.deck.play(end, { start });
            this.syncPlayKey();
            return;
        }
        const result = await this.music.play();
        if (id !== this.loadId) { this.music.pause(); return; }
        if (result === 'playing') {
            this.setNote('');
            this.deck.play(end, { start, source: this.audioSource });
        } else if (result === 'blocked') {
            this.setNote('Press Play to hear it.');
            this.deck.stop();
        } else {
            this.setNote("This song's preview didn't load, so the tape plays silently.");
            this.deck.play(end, { start });
        }
        this.syncPlayKey();
    }

    // ---------- transport ----------
    async togglePlay() {
        if (!this.currentSong) { this.loadRandomSong(); return; }
        if (this.deck.state === 'playing') { this.deck.stop(); this.music.pause(); this.syncPlayKey(); return; }
        if (this.deck.state === 'spooling') return;
        // At the end of the song, or if Stop left the tape somewhere else, Play cues the song from the top
        const i = this.indexOf(this.currentSong);
        const start = this.deck.positionOf(i), end = this.deck.positionOf(i + 1);
        if (this.deck.p < start - 1e-6 || this.deck.p >= end - 1e-6 || this.music.audio.ended) { this.loadSong(this.currentSong, { retype: false }); return; }
        // Resume where we paused. If the music never loaded (say the lookup was slow), load it now.
        if (this.music.info.size && this.music.audio.dataset.id !== String(this.currentSong.appleId)) { this.loadSong(this.currentSong, { retype: false }); return; }
        const id = ++this.loadId;
        await this.startPlaying(this.music.audio.dataset.id === String(this.currentSong.appleId), id);
    }

    stop() {
        this.loadId++; // cancel a cue in progress
        this.deck.stop();
        this.music.pause();
        this.syncPlayKey();
    }

    syncPlayKey() {
        const playing = this.deck.state === 'playing';
        this.playBtn.classList.toggle('latched', playing);
        this.playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    }

    // ---------- the card ----------
    clearCard() {
        this.typewriterAnimationId++;
        this.lyricDisplay.classList.remove('typing');
        this.lyricDisplay.textContent = '';
        this.songTitle.textContent = 'Finding the track';
        this.albumInfo.textContent = '';
        this.trackNo.textContent = '';
        this.setNote('');
        this.setLink(null);
    }

    setNote(text) { this.cardNote.textContent = text; }

    setLink(song) {
        const link = song && this.music.linkFor(song);
        this.appleLink.hidden = !link;
        if (link) this.appleLink.href = link;
    }

    updateDisplay(song, index) {
        this.songTitle.textContent = song.song;
        this.albumInfo.textContent = `${song.album}, ${song.year}`;
        this.trackNo.textContent = `Track ${index + 1}`;
        document.title = `${song.song} | Daily Affirmations with Billy Joel`;
        if (this.announcer) this.announcer.textContent = `${song.song}, ${song.album}, ${song.year}. ${song.affirmation}`;
        this.typeAffirmation(song.affirmation);
    }

    /** Type the affirmation onto the card, one key at a time */
    typeAffirmation(affirmation) {
        this.typewriterAnimationId++;
        const myId = this.typewriterAnimationId;
        const text = `"${affirmation}"`;

        // Reserve the final height first, so the card doesn't jump as lines fill in
        this.lyricDisplay.style.minHeight = '';
        this.lyricDisplay.textContent = text;
        this.lyricDisplay.style.minHeight = this.lyricDisplay.offsetHeight + 'px';

        if (this.reducedMotion) { this.lyricDisplay.classList.remove('typing'); return; }

        this.lyricDisplay.textContent = '';
        this.lyricDisplay.classList.add('typing');
        let i = 0;
        const typeNext = () => {
            if (myId !== this.typewriterAnimationId) return;
            if (i < text.length) {
                this.lyricDisplay.textContent += text.charAt(i++);
                // A typist pauses a beat after punctuation
                const ch = text.charAt(i - 1);
                setTimeout(typeNext, /[.,!?]/.test(ch) ? 140 : 24 + Math.random() * 22);
            } else {
                this.lyricDisplay.classList.remove('typing');
            }
        };
        typeNext();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
