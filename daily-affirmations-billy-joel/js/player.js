/**
 * Reel-to-reel deck
 * Draws the tape transport in SVG and runs it like the real thing:
 *  - One long tape holds the whole discography. Each song sits at its own spot on it,
 *    so cueing a song spools the tape there, forward or back.
 *  - Tape moves from the left reel to the right one. The packs grow and shrink
 *    (their areas add up to a constant), and each reel turns at tape speed divided by its radius,
 *    so a nearly empty reel spins fast and a full one turns slowly.
 *  - The tension arms flex with tape tension, the pinch roller closes on Play,
 *    the VU needles have spring ballistics, and the counter rolls like an odometer.
 */
(() => {
    const NS = 'http://www.w3.org/2000/svg';
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const svgEl = (tag, attrs, parent) => {
        const e = document.createElementNS(NS, tag);
        for (const k in attrs) e.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(e);
        return e;
    };

    // Geometry, in SVG units (the transport is 1000 x 540)
    const G = {
        reels: [{ x: 245, y: 232 }, { x: 755, y: 232 }],
        flange: 206,
        hub: 60,
        pack: 192,
        arms: [{ x: 372, y: 368, rest: 100 }, { x: 628, y: 368, rest: 80 }],
        armLen: 84,
        roller: 15,
        postL: { x: 424, y: 477, r: 7 },
        capstan: { x: 590, y: 477, r: 7 },
        pinch: { x: 590, r: 15, open: 512, closed: 499 },
    };

    // Tape physics
    const SONG_SECONDS = 30;            // how long one song's stretch of tape plays
    const TAKEUP_REV_PER_SEC = 0.6;     // how fast a half full reel turns at play speed
    const MAX_VISIBLE_SPIN = 40;        // rad/s; faster than this the eye only sees a blur
    const COUNTS_PER_TAPE = 9000;

    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    /** Lower outside tangent between two circles the tape runs underneath. */
    function lowerTangent(a, b) {
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
        const phi = Math.atan2(dy, dx) + Math.acos(clamp((a.r - b.r) / d, -1, 1));
        const nx = Math.cos(phi), ny = Math.sin(phi);
        return [a.x + a.r * nx, a.y + a.r * ny, b.x + b.r * nx, b.y + b.r * ny];
    }

    class Deck {
        constructor() {
            this.root = document.querySelector('.deck');
            this.svg = document.getElementById('transport');
            this.odo = document.getElementById('odometer');
            this.tracks = 1;

            this.p = 0;                 // tape position: 0 = all on the left reel, 1 = all on the right
            this.state = 'stopped';     // stopped | playing | spooling
            this.segEnd = 1;
            this.spool = null;
            this.angle = [0, 0];
            this.pinchAngle = 0;
            this.armDip = 0;
            this.counterOffset = 0;
            this.needles = [{ pos: 0, vel: 0 }, { pos: 0, vel: 0 }];
            this.power = 0;             // meter lamps warm up on load
            this.onEnd = null;
            this.levelSource = null;  // () => [left, right] from the real audio, when available
            this.source = null;
            this.segStart = 0;

            const mid = Math.sqrt((G.hub * G.hub + G.pack * G.pack) / 2);
            this.playSpeed = 2 * Math.PI * TAKEUP_REV_PER_SEC * mid; // tape units per second

            this.build();
            this.buildMeters();
            this.buildOdometer();
            this.render(0);
            this.last = performance.now();
            this.running = false;
            this.wake();
        }

        setTrackCount(n) { this.tracks = Math.max(1, n); }

        /** Total tape length, chosen so one song plays for SONG_SECONDS. */
        get tapeLength() { return this.playSpeed * SONG_SECONDS * this.tracks; }

        radii(p) {
            const span = G.pack * G.pack - G.hub * G.hub;
            return [Math.sqrt(G.hub * G.hub + (1 - p) * span), Math.sqrt(G.hub * G.hub + p * span)];
        }

        // ---------- drawing ----------
        build() {
            const s = this.svg;
            const defs = svgEl('defs', {}, s);

            const grad = (id, type, stops, attrs = {}) => {
                const g = svgEl(type, { id, ...attrs }, defs);
                stops.forEach(([o, c, op]) => svgEl('stop', { offset: o, 'stop-color': c, ...(op != null ? { 'stop-opacity': op } : {}) }, g));
                return g;
            };
            grad('g-flange', 'radialGradient', [['0', '#f3f4f5'], ['0.55', '#d3d6da'], ['0.92', '#b4b8bd'], ['1', '#8e9399']]);
            grad('g-gloss', 'linearGradient', [['0', '#ffffff', 0.55], ['0.35', '#ffffff', 0], ['0.62', '#000000', 0], ['1', '#000000', 0.18]], { x1: 0, y1: 0, x2: 1, y2: 1 });
            grad('g-pack', 'radialGradient', [['0', '#1f150e'], ['0.82', '#3b281b'], ['0.97', '#5a3d29'], ['1', '#2a1c12']]);
            grad('g-hub', 'radialGradient', [['0', '#55585d'], ['0.7', '#2c2e31'], ['1', '#1b1c1e']]);
            grad('g-chrome', 'linearGradient', [['0', '#fbfbfc'], ['0.45', '#b9bdc2'], ['0.55', '#8d9298'], ['1', '#e2e4e7']], { x1: 0, y1: 0, x2: 0, y2: 1 });
            grad('g-cover', 'linearGradient', [['0', '#5d6066'], ['0.5', '#3a3c40'], ['1', '#26272a']], { x1: 0, y1: 0, x2: 0, y2: 1 });
            grad('g-rubber', 'radialGradient', [['0', '#3a3a3c'], ['1', '#0f0f10']]);

            // Windows in each flange. The mask turns with the reel while the metal and its
            // reflections stay put, which is how light behaves on a real spinning reel.
            this.windowSets = G.reels.map((c, i) => {
                const m = svgEl('mask', { id: 'win' + i, maskUnits: 'userSpaceOnUse', x: c.x - 220, y: c.y - 220, width: 440, height: 440 }, defs);
                svgEl('circle', { cx: c.x, cy: c.y, r: G.flange, fill: '#fff' }, m);
                const g = svgEl('g', {}, m);
                for (let k = 0; k < 3; k++) {
                    const a1 = (k * 120 - 90 + 21) * Math.PI / 180, a2 = a1 + 78 * Math.PI / 180;
                    const r1 = 84, r2 = 182;
                    const pt = (r, a) => (c.x + r * Math.cos(a)).toFixed(1) + ' ' + (c.y + r * Math.sin(a)).toFixed(1);
                    svgEl('path', {
                        d: 'M' + pt(r2, a1) + ' A' + r2 + ' ' + r2 + ' 0 0 1 ' + pt(r2, a2) + ' L' + pt(r1, a2) + ' A' + r1 + ' ' + r1 + ' 0 0 0 ' + pt(r1, a1) + 'Z',
                        fill: '#000', stroke: '#000', 'stroke-width': 18, 'stroke-linejoin': 'round',
                    }, g);
                }
                return g;
            });

            // Tape packs, seen through the windows
            this.packs = G.reels.map((c) => svgEl('circle', { cx: c.x, cy: c.y, r: G.pack, fill: 'url(#g-pack)' }, s));

            // The tape itself
            this.tape = svgEl('path', { fill: 'none', stroke: '#3a281c', 'stroke-width': 3.4, 'stroke-linejoin': 'round' }, s);

            // Flanges
            G.reels.forEach((c, i) => {
                const f = svgEl('g', { mask: 'url(#win' + i + ')' }, s);
                svgEl('circle', { cx: c.x, cy: c.y, r: G.flange, fill: 'url(#g-flange)' }, f);
                [196, 188, 78, 70].forEach((r, j) => svgEl('circle', { cx: c.x, cy: c.y, r, fill: 'none', stroke: j % 2 ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.16)', 'stroke-width': 1.2 }, f));
                svgEl('circle', { cx: c.x, cy: c.y, r: G.flange, fill: 'url(#g-gloss)' }, f);
                svgEl('circle', { cx: c.x, cy: c.y, r: G.flange - 1, fill: 'none', stroke: '#7d8288', 'stroke-width': 2 }, f);
            });

            // Hubs turn with the reel
            this.hubs = G.reels.map((c) => {
                const h = svgEl('g', {}, s);
                svgEl('circle', { cx: c.x, cy: c.y, r: G.hub, fill: 'url(#g-hub)' }, h);
                for (let k = 0; k < 3; k++) {
                    const a = k * 120;
                    svgEl('rect', { x: c.x - 7, y: c.y - G.hub + 8, width: 14, height: 22, rx: 3, fill: '#151618', transform: 'rotate(' + a + ' ' + c.x + ' ' + c.y + ')' }, h);
                }
                svgEl('circle', { cx: c.x, cy: c.y, r: 24, fill: 'url(#g-chrome)', stroke: '#6f747a', 'stroke-width': 1 }, h);
                for (let k = 0; k < 3; k++) {
                    svgEl('rect', { x: c.x - 4, y: c.y - 33, width: 8, height: 12, rx: 2, fill: 'url(#g-chrome)', stroke: '#6f747a', 'stroke-width': 0.8, transform: 'rotate(' + (k * 120 + 60) + ' ' + c.x + ' ' + c.y + ')' }, h);
                }
                svgEl('circle', { cx: c.x, cy: c.y, r: 6, fill: '#5d6268' }, h);
                return h;
            });

            // Head block
            const hb = svgEl('g', {}, s);
            svgEl('rect', { x: 404, y: 470, width: 200, height: 22, rx: 4, fill: '#2a2b2e' }, hb);
            [456, 492, 528].forEach((x) => svgEl('rect', { x: x - 11, y: 468, width: 22, height: 18, rx: 3, fill: 'url(#g-chrome)', stroke: '#6f747a', 'stroke-width': 0.8 }, hb));
            svgEl('path', { d: 'M436 474 V404 Q436 382 458 382 H526 Q548 382 548 404 V474 Z', fill: 'url(#g-cover)', stroke: '#1a1b1d', 'stroke-width': 1.5 }, hb);
            svgEl('path', { d: 'M442 404 Q442 388 458 388 H526 Q542 388 542 404', fill: 'none', stroke: 'rgba(255,255,255,.22)', 'stroke-width': 1.5 }, hb);
            const label = svgEl('text', { x: 492, y: 438, 'text-anchor': 'middle', class: 'engrave-dark' }, hb);
            label.textContent = 'PIANO MAN';
            [[446, 466], [538, 466]].forEach(([x, y]) => svgEl('circle', { cx: x, cy: y, r: 3, fill: 'url(#g-chrome)' }, hb));

            // Guide post and capstan
            svgEl('circle', { cx: G.postL.x, cy: G.postL.y, r: G.postL.r, fill: 'url(#g-chrome)', stroke: '#5f646a', 'stroke-width': 1 }, s);
            svgEl('circle', { cx: G.capstan.x, cy: G.capstan.y, r: G.capstan.r, fill: 'url(#g-chrome)', stroke: '#5f646a', 'stroke-width': 1 }, s);

            // Pinch roller on its arm
            this.pinchArm = svgEl('line', { x1: 640, y1: 520, x2: G.pinch.x, y2: G.pinch.open, stroke: 'url(#g-chrome)', 'stroke-width': 7, 'stroke-linecap': 'round' }, s);
            this.pinch = svgEl('g', {}, s);
            svgEl('circle', { cx: 0, cy: 0, r: G.pinch.r, fill: 'url(#g-rubber)' }, this.pinch);
            svgEl('circle', { cx: 0, cy: 0, r: 5, fill: 'url(#g-chrome)' }, this.pinch);
            svgEl('circle', { cx: 0, cy: -10, r: 1.8, fill: '#6b6e73' }, this.pinch);
            svgEl('circle', { cx: 640, cy: 520, r: 8, fill: 'url(#g-chrome)', stroke: '#5f646a', 'stroke-width': 1 }, s);

            // Tension arms
            this.arms = G.arms.map((a) => {
                const g = svgEl('g', {}, s);
                const line = svgEl('line', { x1: a.x, y1: a.y, stroke: 'url(#g-chrome)', 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
                svgEl('circle', { cx: a.x, cy: a.y, r: 11, fill: 'url(#g-chrome)', stroke: '#5f646a', 'stroke-width': 1 }, g);
                const roller = svgEl('g', {}, g);
                svgEl('circle', { cx: 0, cy: 0, r: G.roller, fill: 'url(#g-chrome)', stroke: '#5f646a', 'stroke-width': 1 }, roller);
                svgEl('circle', { cx: 0, cy: 0, r: 5, fill: '#5d6268' }, roller);
                return { line, roller };
            });
        }

        buildMeters() {
            const VU = (db) => Math.pow(10, db / 20) / Math.pow(10, 3 / 20); // 0 VU sits at about 71%
            this.vuAngle = (f) => -48 + 96 * clamp(f, -0.04, 1.06);
            this.meters = [...document.querySelectorAll('.vu svg')].map((s) => {
                const defs = svgEl('defs', {}, s);
                const lg = svgEl('radialGradient', { id: 'lamp' + Math.random().toString(36).slice(2, 7), cx: 0.5, cy: 0.85, r: 0.9 }, defs);
                svgEl('stop', { offset: 0, 'stop-color': '#fff1c9' }, lg);
                svgEl('stop', { offset: 0.6, 'stop-color': '#f7d488' }, lg);
                svgEl('stop', { offset: 1, 'stop-color': '#d99a3d' }, lg);
                const face = svgEl('rect', { x: 0, y: 0, width: 220, height: 130, rx: 6, fill: 'url(#' + lg.id + ')' }, s);
                const cx = 110, cy = 160, R = 106;
                const at = (f, r) => { const a = (this.vuAngle(f) - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
                const arc = (f1, f2, r) => { const [x1, y1] = at(f1, r); const [x2, y2] = at(f2, r); return 'M' + x1 + ' ' + y1 + ' A' + r + ' ' + r + ' 0 0 1 ' + x2 + ' ' + y2; };
                svgEl('path', { d: arc(0, VU(0), R), fill: 'none', stroke: '#2b2116', 'stroke-width': 1.4 }, s);
                svgEl('path', { d: arc(VU(0), 1, R), fill: 'none', stroke: '#c0392b', 'stroke-width': 5 }, s);
                [-20, -10, -7, -5, -3, -2, -1, 0, 1, 2, 3].forEach((db) => {
                    const f = VU(db); const [x1, y1] = at(f, R); const [x2, y2] = at(f, R + (db % 5 === 0 || db === -7 || db === -3 || db === 3 ? 10 : 6));
                    svgEl('line', { x1, y1, x2, y2, stroke: db > 0 ? '#c0392b' : '#2b2116', 'stroke-width': 1.4 }, s);
                    if ([-20, -10, -5, -3, 0, 3].includes(db)) {
                        const [tx, ty] = at(f, R + 18);
                        const t = svgEl('text', { x: tx, y: ty + 3, 'text-anchor': 'middle', class: 'vu-num' + (db > 0 ? ' hot' : '') }, s);
                        t.textContent = db > 0 ? '+' + db : String(db);
                    }
                });
                const vu = svgEl('text', { x: 110, y: 104, 'text-anchor': 'middle', class: 'vu-mark' }, s);
                vu.textContent = 'VU';
                const needle = svgEl('line', { x1: cx, y1: cy, x2: cx, y2: cy - R - 8, stroke: '#1c1712', 'stroke-width': 2, 'stroke-linecap': 'round' }, s);
                svgEl('rect', { x: 0, y: 112, width: 220, height: 18, fill: '#1a1714' }, s);
                svgEl('rect', { x: 0, y: 0, width: 220, height: 130, rx: 6, fill: 'none', stroke: 'rgba(0,0,0,.5)', 'stroke-width': 3 }, s);
                svgEl('path', { d: 'M8 8 H140 Q60 40 8 70 Z', fill: '#fff', opacity: 0.16 }, s);
                return { face, needle, cx, cy };
            });
        }

        buildOdometer() {
            this.wheels = [];
            for (let i = 0; i < 4; i++) {
                const w = document.createElement('span');
                w.className = 'wheel';
                const strip = document.createElement('span');
                strip.className = 'strip';
                for (let d = 0; d <= 10; d++) { const n = document.createElement('span'); n.textContent = d % 10; strip.appendChild(n); }
                w.appendChild(strip);
                this.odo.appendChild(w);
                this.wheels.push(strip);
            }
        }

        // ---------- controls ----------
        positionOf(index) { return index / this.tracks; }

        /** Spool the tape to position p. Resolves when it gets there. */
        cue(p) {
            p = clamp(p, 0, 1);
            const dist = Math.abs(p - this.p);
            this.setState('spooling', p > this.p ? 'ff' : 'rew');
            if (REDUCED || dist < 1e-6) { this.p = p; this.setState('stopped'); this.render(0); return Promise.resolve(); }
            const dur = (0.45 + 1.1 * Math.sqrt(dist)) * 1000;
            return new Promise((resolve) => {
                if (this.spool) this.spool.resolve(false);
                this.spool = { from: this.p, to: p, t0: performance.now(), dur, resolve };
                this.wake();
            });
        }

        /**
         * Play until position `until`, then stop and call onEnd.
         * With a `source` ({ fraction, running, ended }), the tape follows the music:
         * it stops when the audio is buffering and lands exactly where the song is.
         */
        play(until, { start = this.p, source = null } = {}) {
            if (this.spool) { this.spool.resolve(false); this.spool = null; }
            this.segStart = clamp(start, 0, 1);
            this.segEnd = clamp(until, 0, 1);
            this.source = source;
            this.setState('playing');
            this.wake();
        }

        stop() {
            if (this.spool) { this.spool.resolve(false); this.spool = null; }
            this.setState('stopped');
            this.wake();
        }

        get atSegmentEnd() { return this.p >= this.segEnd - 1e-6; }

        flashRecord() {
            this.root.classList.add('rec-flash');
            clearTimeout(this.recTimer);
            this.recTimer = setTimeout(() => this.root.classList.remove('rec-flash'), 700);
        }

        resetCounter() { this.counterOffset = this.p * COUNTS_PER_TAPE; this.wake(); }

        setState(state, dir) {
            this.state = state;
            this.root.classList.toggle('is-playing', state === 'playing');
            this.root.classList.toggle('is-ff', state === 'spooling' && dir === 'ff');
            this.root.classList.toggle('is-rew', state === 'spooling' && dir === 'rew');
        }

        // ---------- animation ----------
        wake() {
            if (this.running) return;
            this.running = true;
            this.last = performance.now();
            requestAnimationFrame((t) => this.tick(t));
        }

        tick(now) {
            const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000));
            this.last = now;
            const before = this.p;

            if (this.spool) {
                const t = clamp((now - this.spool.t0) / this.spool.dur, 0, 1);
                this.p = this.spool.from + (this.spool.to - this.spool.from) * ease(t);
                if (t >= 1) { const r = this.spool.resolve; this.spool = null; this.setState('stopped'); r(true); }
            } else if (this.state === 'playing') {
                const rate = this.playSpeed / this.tapeLength;
                let done;
                if (this.source) {
                    const target = this.segStart + this.source.fraction() * (this.segEnd - this.segStart);
                    if (this.source.running()) this.p += dt * rate;
                    this.p += (target - this.p) * Math.min(1, dt * 4);
                    this.p = clamp(this.p, this.segStart, this.segEnd);
                    done = this.source.ended();
                    if (done) this.p = this.segEnd;
                } else {
                    this.p = Math.min(this.segEnd, this.p + dt * rate);
                    done = this.p >= this.segEnd;
                }
                if (done) { this.setState('stopped'); if (this.onEnd) this.onEnd(); }
            }

            const speed = ((this.p - before) / dt) * this.tapeLength; // tape units per second, signed
            const settled = this.render(dt, speed, now / 1000);

            if (!settled || this.spool || this.state === 'playing') requestAnimationFrame((t) => this.tick(t));
            else this.running = false;
        }

        /** Draw one frame. Returns true when nothing is moving any more. */
        render(dt, speed = 0, time = 0) {
            const [rL, rR] = this.radii(this.p);
            const r = [rL, rR];
            let blur = 0;

            // Reels: angular speed is tape speed over pack radius. Forward play turns them anticlockwise.
            r.forEach((rad, i) => {
                const w = speed / rad;
                blur = Math.max(blur, clamp((Math.abs(w) - 12) / 26, 0, 1));
                const seen = Math.sign(w) * Math.min(Math.abs(w), MAX_VISIBLE_SPIN);
                if (!REDUCED) this.angle[i] -= seen * dt * 180 / Math.PI;
                const c = G.reels[i];
                const tr = 'rotate(' + this.angle[i].toFixed(2) + ' ' + c.x + ' ' + c.y + ')';
                this.windowSets[i].setAttribute('transform', tr);
                this.hubs[i].setAttribute('transform', tr);
                this.packs[i].setAttribute('r', rad.toFixed(2));
            });
            // At speed the windows smear into a blur, like they do to the eye
            const shade = Math.round(blur * 150);
            this.windowSets.forEach((g) => { const col = 'rgb(' + shade + ',' + shade + ',' + shade + ')'; for (const p of g.children) { p.setAttribute('fill', col); p.setAttribute('stroke', col); } });

            // Tension arms dip when the tape is spooling hard, and tremble a little in play
            const target = clamp(Math.abs(speed) / 60000, 0, 1) * 9;
            this.armDip += (target - this.armDip) * Math.min(1, dt * 6);
            const wobble = this.state === 'playing' && !REDUCED ? Math.sin(time * 11) * 0.5 + Math.sin(time * 4.3) * 0.4 : 0;
            const rollers = G.arms.map((a, i) => {
                const ang = (a.rest + (i === 0 ? -1 : 1) * (this.armDip + wobble)) * Math.PI / 180;
                const x = a.x + G.armLen * Math.cos(ang), y = a.y + G.armLen * Math.sin(ang);
                this.arms[i].line.setAttribute('x2', x.toFixed(1));
                this.arms[i].line.setAttribute('y2', y.toFixed(1));
                this.arms[i].roller.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + (-this.angle[0] * 3).toFixed(1) + ')');
                return { x, y, r: G.roller };
            });

            // Pinch roller closes on the capstan in Play
            const py = this.state === 'playing' ? G.pinch.closed : G.pinch.open;
            if (!REDUCED) this.pinchAngle += (speed / G.pinch.r) * dt * 180 / Math.PI * (this.state === 'playing' ? 1 : 0);
            this.pinch.setAttribute('transform', 'translate(' + G.pinch.x + ' ' + py + ') rotate(' + this.pinchAngle.toFixed(1) + ')');
            this.pinchArm.setAttribute('y2', py);

            // Tape path: left pack, left arm, guide post, across the heads, capstan, right arm, right pack
            const packL = { ...G.reels[0], r: rL }, packR = { ...G.reels[1], r: rR };
            const s1 = lowerTangent(packL, rollers[0]);
            const s2 = lowerTangent(rollers[0], G.postL);
            const s3 = lowerTangent(G.postL, G.capstan);
            const s4 = lowerTangent(G.capstan, rollers[1]);
            const s5 = lowerTangent(rollers[1], packR);
            const f = (n) => n.toFixed(1);
            this.tape.setAttribute('d', [s1, s2, s3, s4, s5].map((s) => 'M' + f(s[0]) + ' ' + f(s[1]) + ' L' + f(s[2]) + ' ' + f(s[3])).join(' '));

            // VU needles: music while playing, a flicker of tape hiss while spooling, rest otherwise
            this.power = Math.min(1, this.power + dt * 1.6);
            let moving = this.power < 1;
            this.meters.forEach((m, i) => {
                const n = this.needles[i];
                let level = -0.04;
                const real = this.state === 'playing' && this.levelSource ? this.levelSource() : null;
                if (real) {
                    level = real[i];
                } else if (this.state === 'playing') {
                    const beat = (time * 2 + i * 0.03) % 1;
                    level = 0.56 + 0.16 * Math.sin(time * 1.7 + i) * Math.sin(time * 0.6) + 0.1 * Math.sin(time * 5.3 + i * 2) + 0.24 * Math.exp(-beat * 7) + (Math.random() - 0.5) * 0.12;
                } else if (this.state === 'spooling') {
                    level = 0.06 + Math.random() * 0.12;
                }
                if (REDUCED) { n.pos = level; n.vel = 0; } else {
                    n.vel += (90 * (level - n.pos) - 13 * n.vel) * dt;
                    n.pos += n.vel * dt;
                }
                if (Math.abs(n.vel) > 0.002 || Math.abs(level - n.pos) > 0.002) moving = true;
                m.needle.setAttribute('transform', 'rotate(' + this.vuAngle(n.pos).toFixed(2) + ' ' + m.cx + ' ' + m.cy + ')');
                m.face.setAttribute('opacity', (0.35 + 0.65 * this.power).toFixed(2));
            });

            // Odometer counter: each wheel only turns while the one to its right rolls from 9 to 0
            let v = this.p * COUNTS_PER_TAPE - this.counterOffset;
            v = ((v % 10000) + 10000) % 10000;
            for (let k = 0; k < 4; k++) {
                const place = Math.pow(10, k);
                let pos = Math.floor(v / place) % 10;
                const rest = v % place;
                pos += k === 0 ? v - Math.floor(v) : Math.max(0, rest - (place - 1));
                this.wheels[3 - k].style.transform = 'translateY(' + (-pos * 100 / 11).toFixed(3) + '%)';
            }

            return !moving && Math.abs(this.armDip) < 0.01;
        }
    }

    window.Deck = Deck;
})();
