/**
 * Spotify Integration Module
 * Uses standard iframe embed for reliable playback
 */

class SpotifyPlayer {
    constructor() {
        this.currentTrackId = null;
        this.container = document.getElementById('spotify-container');
        this.isReady = true; // Always ready with simple iframe approach
    }

    /**
     * Initialize - no async setup needed with simple iframe
     */
    init() {
        return Promise.resolve(true);
    }

    /**
     * Load and create embed for a track using simple iframe
     */
    async loadTrack(trackId, startTime = 0) {
        this.currentTrackId = trackId;

        // Clear existing embed
        this.container.innerHTML = '';

        // Create iframe embed directly
        const iframe = document.createElement('iframe');
        iframe.style.borderRadius = '12px';
        iframe.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
        iframe.width = '100%';
        iframe.height = '152';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        iframe.loading = 'lazy';

        this.container.appendChild(iframe);

        // Start cassette animation when user might be playing
        // (We can't detect actual playback with simple iframe)

        console.log('Spotify embed loaded for track:', trackId);
        return true;
    }

    /**
     * These methods don't work with simple iframe embed
     * but we keep them for interface compatibility
     */
    play() {
        console.log('Play: Click the Spotify player directly');
    }

    pause() {
        console.log('Pause: Click the Spotify player directly');
    }

    togglePlay() {
        console.log('Toggle: Click the Spotify player directly');
    }

    seek(seconds) {
        console.log('Seek not available with embed');
    }

    getCurrentTrackId() {
        return this.currentTrackId;
    }

    getIsReady() {
        return this.isReady;
    }
}

// Create global instance
window.SpotifyPlayer = new SpotifyPlayer();
