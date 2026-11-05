/**
 * The music: 30 second Apple Music previews of each song's original album version.
 * One lookup fetches every preview link when the page opens. The audio runs through
 * an analyser so the VU meters read the real left and right levels.
 */
(() => {
    // A tiny silent clip. Playing it during the first tap lets the page start music later
    // on phones, where audio has to begin inside a tap.
    const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    const LEVEL_GAIN = 5.5; // measured on the previews: loud passages push into the red, quiet ones sit around -5

    class Music {
        constructor(songs) {
            this.info = new Map();   // appleId -> { preview, link }
            this.unlocked = false;
            this.analysable = true;  // false if the browser won't let us read the audio
            this.ctx = null;
            this.analysers = null;
            this.buffers = null;
            this.current = null;
            this.makeAudio(true);
            this.ready = this.fetchAll(songs.map((s) => s.appleId).filter(Boolean));
        }

        makeAudio(crossOrigin) {
            if (this.audio) { this.audio.pause(); this.audio.removeAttribute('src'); }
            this.audio = new Audio();
            this.audio.preload = 'auto';
            if (crossOrigin) this.audio.crossOrigin = 'anonymous';
            this.analysable = crossOrigin;
            this.source = null;
        }

        async fetchAll(ids) {
            // The lookup takes up to 200 IDs at a time
            for (let i = 0; i < ids.length; i += 150) {
                const chunk = ids.slice(i, i + 150);
                const res = await fetch('https://itunes.apple.com/lookup?country=us&id=' + chunk.join(','));
                if (!res.ok) throw new Error('lookup ' + res.status);
                const data = await res.json();
                data.results.forEach((r) => { if (r.previewUrl) this.info.set(r.trackId, { preview: r.previewUrl, link: r.trackViewUrl }); });
            }
            return this.info;
        }

        linkFor(song) { const i = this.info.get(song.appleId); return i ? i.link : null; }

        /** Call from a click or key press, before anything async happens */
        unlock() {
            if (!this.ctx && this.analysable) {
                try {
                    const Ctx = window.AudioContext || window.webkitAudioContext;
                    if (Ctx) this.ctx = new Ctx();
                } catch (e) { this.ctx = null; }
            }
            if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
            if (!this.unlocked) {
                this.unlocked = true;
                if (!this.audio.src) {
                    this.audio.src = SILENT;
                    this.audio.play().then(() => this.audio.pause()).catch(() => {});
                }
            }
        }

        connectAnalyser() {
            if (!this.ctx || this.source || !this.analysable) return;
            try {
                this.source = this.ctx.createMediaElementSource(this.audio);
                const split = this.ctx.createChannelSplitter(2);
                this.analysers = [0, 1].map(() => { const a = this.ctx.createAnalyser(); a.fftSize = 1024; return a; });
                this.buffers = this.analysers.map((a) => new Float32Array(a.fftSize));
                this.source.connect(split);
                split.connect(this.analysers[0], 0);
                split.connect(this.analysers[1], 1);
                this.source.connect(this.ctx.destination);
            } catch (e) { this.analysers = null; }
        }

        /** Load a song's preview. Resolves true if there's music for it. */
        async load(song) {
            this.current = song;
            try { await this.ready; } catch (e) { return false; }
            const info = this.info.get(song.appleId);
            if (!info || this.current !== song) return false;
            if (this.audio.dataset.id !== String(song.appleId)) {
                this.audio.pause();
                this.audio.src = info.preview;
                this.audio.dataset.id = String(song.appleId);
            } else {
                this.audio.currentTime = 0;
            }
            return true;
        }

        /** Start or resume. Resolves 'playing', 'blocked' (needs a tap first) or 'failed'. */
        async play() {
            if (!this.audio.dataset.id) return 'failed';
            this.connectAnalyser();
            if (this.ctx && this.ctx.state === 'suspended') { try { await this.ctx.resume(); } catch (e) { /* stays silent */ } }
            try {
                await this.audio.play();
                return 'playing';
            } catch (e) {
                if (e && e.name === 'NotAllowedError') return 'blocked';
                // Some browsers refuse to read the audio for the meters. Play it plainly instead.
                if (this.analysable && this.audio.error) {
                    const id = this.audio.dataset.id, src = this.audio.src, t = this.audio.currentTime;
                    this.makeAudio(false);
                    this.audio.src = src; this.audio.dataset.id = id; this.audio.currentTime = t;
                    try { await this.audio.play(); return 'playing'; } catch (e2) { return e2 && e2.name === 'NotAllowedError' ? 'blocked' : 'failed'; }
                }
                return 'failed';
            }
        }

        pause() { this.audio.pause(); }

        get playing() { return !this.audio.paused && !this.audio.ended; }

        /** How far through the preview we are, 0 to 1 */
        get fraction() {
            const d = this.audio.duration;
            if (!d || !isFinite(d)) return 0;
            return this.audio.ended ? 1 : Math.min(1, this.audio.currentTime / d);
        }

        /** Left and right levels for the VU meters, or null when we can't read them */
        levels() {
            if (!this.analysers || !this.ctx || this.ctx.state !== 'running') return null;
            return this.analysers.map((a, i) => {
                const b = this.buffers[i];
                a.getFloatTimeDomainData(b);
                let s = 0;
                for (let k = 0; k < b.length; k++) s += b[k] * b[k];
                return Math.sqrt(s / b.length) * LEVEL_GAIN / Math.SQRT2;
            });
        }
    }

    window.Music = Music;
})();
