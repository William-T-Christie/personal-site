/**
 * Daily Affirmations with Billy Joel
 * Main Application Controller
 */

class App {
    constructor() {
        this.currentSong = null;
        this.isPlaying = false;
        this.typewriterAnimationId = 0; // Track animation to cancel on new quote

        // DOM elements
        this.songSelector = document.getElementById('song-selector');
        this.lyricDisplay = document.getElementById('lyric-display');
        this.songTitle = document.getElementById('song-title');
        this.albumInfo = document.getElementById('album-info');
        this.trackInfo = document.getElementById('track-info');
        this.playBtn = document.getElementById('btn-play');
        this.playIcon = document.getElementById('play-icon');
        this.favoriteBtn = document.getElementById('btn-favorite');
        this.favoriteIcon = document.getElementById('favorite-icon');

        this.init();
    }

    async init() {
        // Populate the dropdown
        this.populateDropdown();

        // Initialize Spotify if available
        if (window.SpotifyPlayer) {
            await window.SpotifyPlayer.init();
        }

        // Check URL for specific song
        const urlParams = new URLSearchParams(window.location.search);
        const songName = urlParams.get('song');

        if (songName) {
            const song = window.AffirmationData.getSongByTitle(decodeURIComponent(songName));
            if (song) {
                this.songSelector.value = song.song;
                this.loadSong(song);
            }
        }

        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    /**
     * Populate the dropdown with all songs alphabetically
     */
    populateDropdown() {
        const songs = window.AffirmationData.getAllSongsAlphabetical();

        songs.forEach(song => {
            const option = document.createElement('option');
            option.value = song.song;
            option.textContent = `${song.song} (${song.album}, ${song.year})`;
            this.songSelector.appendChild(option);
        });
    }

    setupEventListeners() {
        // Song selector change
        this.songSelector?.addEventListener('change', (e) => {
            const songTitle = e.target.value;
            if (songTitle) {
                const song = window.AffirmationData.getSongByTitle(songTitle);
                if (song) {
                    this.loadSong(song);
                }
            }
        });

        // Transport controls
        document.getElementById('btn-play')?.addEventListener('click', () => {
            this.togglePlay();
        });

        document.getElementById('btn-stop')?.addEventListener('click', () => {
            this.stop();
        });

        document.getElementById('btn-forward')?.addEventListener('click', () => {
            this.loadRandomSong();
        });

        document.getElementById('btn-rewind')?.addEventListener('click', () => {
            this.loadRandomSong();
        });

        document.getElementById('btn-record')?.addEventListener('click', () => {
            this.loadRandomSong();
        });

        // Action buttons
        document.getElementById('btn-favorite')?.addEventListener('click', () => {
            this.toggleFavorite();
        });

        document.getElementById('btn-share')?.addEventListener('click', () => {
            this.share();
        });

        // Listen for favorites changes
        window.addEventListener('favoritesChanged', () => {
            this.updateFavoriteButton();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input or select
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }

            switch (e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'f':
                    e.preventDefault();
                    this.toggleFavorite();
                    break;
                case 's':
                    e.preventDefault();
                    this.share();
                    break;
                case 'n':
                case 'arrowright':
                    e.preventDefault();
                    this.loadRandomSong();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    break;
            }
        });
    }

    /**
     * Load a random song
     */
    loadRandomSong() {
        const song = window.AffirmationData.getRandomSong();
        this.songSelector.value = song.song;
        this.loadSong(song);
    }

    /**
     * Load specific song
     */
    async loadSong(song) {
        this.currentSong = song;

        // Update URL without reload
        const url = new URL(window.location.href);
        url.searchParams.set('song', encodeURIComponent(song.song));
        window.history.replaceState({}, '', url);

        // Animate reel player
        await window.CassettePlayer.animateEject();

        // Update display
        this.updateDisplay(song);

        // Start playing animation
        this.isPlaying = true;
        window.CassettePlayer.setPlaying(true);
        this.playIcon.textContent = '⏸';
        this.playBtn.setAttribute('aria-pressed', 'true');

        // Load Spotify track if available
        if (window.SpotifyPlayer && song.spotifyTrackId) {
            await window.SpotifyPlayer.loadTrack(song.spotifyTrackId, 0);
        }

        // Update favorite button
        this.updateFavoriteButton();
    }

    /**
     * Update all display elements
     */
    updateDisplay(song) {
        // Animate affirmation text appearing
        this.animateAffirmationText(song.affirmation);

        // Song info
        this.songTitle.textContent = song.song.toUpperCase();
        this.albumInfo.textContent = `${song.album} (${song.year})`;

        // Track info bar
        const songNameEl = this.trackInfo?.querySelector('.song-name');
        const albumYearEl = this.trackInfo?.querySelector('.album-year');
        if (songNameEl) songNameEl.textContent = song.song;
        if (albumYearEl) albumYearEl.textContent = `${song.album} · ${song.year}`;
    }

    /**
     * Animate affirmation text appearing with typewriter effect
     */
    animateAffirmationText(affirmation) {
        // Cancel any previous animation by incrementing the ID
        this.typewriterAnimationId++;
        const currentAnimationId = this.typewriterAnimationId;

        const displayText = `"${affirmation}"`;
        this.lyricDisplay.textContent = '';
        this.lyricDisplay.classList.add('typing');

        let i = 0;
        const speed = 25; // ms per character

        const typeWriter = () => {
            // Stop if a newer animation has started
            if (currentAnimationId !== this.typewriterAnimationId) {
                return;
            }
            if (i < displayText.length) {
                this.lyricDisplay.textContent += displayText.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                this.lyricDisplay.classList.remove('typing');
            }
        };

        typeWriter();
    }

    /**
     * Toggle play/pause
     */
    togglePlay() {
        if (!this.currentSong) {
            this.loadRandomSong();
            return;
        }

        // Scroll to Spotify player and highlight it
        const spotifyContainer = document.getElementById('spotify-container');
        if (spotifyContainer) {
            spotifyContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            spotifyContainer.classList.add('highlight');
            setTimeout(() => spotifyContainer.classList.remove('highlight'), 2000);
        }

        // Toggle reel animation
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            window.CassettePlayer.setPlaying(true);
            this.playIcon.textContent = '⏸';
            this.playBtn.setAttribute('aria-pressed', 'true');
        } else {
            window.CassettePlayer.setPlaying(false);
            this.playIcon.textContent = '▶';
            this.playBtn.setAttribute('aria-pressed', 'false');
        }
    }

    /**
     * Stop playback animation
     */
    stop() {
        this.isPlaying = false;
        window.CassettePlayer.stop();
        this.playIcon.textContent = '▶';
        this.playBtn.setAttribute('aria-pressed', 'false');
    }

    /**
     * Toggle favorite status
     */
    toggleFavorite() {
        if (!this.currentSong || !window.Favorites) return;

        window.Favorites.toggle(this.currentSong.song);
        this.updateFavoriteButton();

        // Visual feedback
        this.favoriteBtn.classList.add('pulse');
        setTimeout(() => {
            this.favoriteBtn.classList.remove('pulse');
        }, 300);
    }

    /**
     * Update favorite button state
     */
    updateFavoriteButton() {
        if (!this.currentSong || !window.Favorites) return;

        const isFavorited = window.Favorites.isFavorite(this.currentSong.song);

        this.favoriteIcon.textContent = isFavorited ? '♥' : '♡';
        this.favoriteBtn.setAttribute('aria-pressed', isFavorited.toString());

        if (isFavorited) {
            this.favoriteBtn.classList.add('active');
        } else {
            this.favoriteBtn.classList.remove('active');
        }
    }

    /**
     * Share current affirmation
     */
    share() {
        if (!this.currentSong) return;

        if (window.ShareModule) {
            // Create compatible object for share module
            const shareData = {
                id: this.currentSong.song,
                lyric: this.currentSong.affirmation,
                song: this.currentSong.song,
                album: this.currentSong.album,
                year: this.currentSong.year
            };
            window.ShareModule.share(shareData);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
