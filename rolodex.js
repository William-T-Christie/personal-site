/* ============================================
   William T. Christie - Personal Website
   rolodex.js - the spinning Rolodex in Boomer View

   A 3D card file built from plain DOM elements.
   72 cards sit on a drum; every 12th card is a job.
   Mouse: drag up or down and let go to spin, or scroll one job per notch.
   Touch: swipe sideways to spin (vertical swipes still scroll the page).
   Keyboard: arrow keys when the Rolodex has focus.
   ============================================ */

(function () {
    'use strict';

    var JOBS = [
        { name: 'Ernst & Young', year: '2026', label: 'Now', title: 'FSO Financial Consulting', place: 'New York, NY', dates: 'Oct 2026 to present', notes: 'Back where I interned, now full time.' },
        { name: 'Shortcut', year: '2026', label: '2026', title: 'Go to Market Intern', place: 'Menlo Park, CA', dates: 'Jun to Aug 2026', notes: 'Enterprise support for hedge fund and finance clients. Stress tested the agent on live workflows.' },
        { name: 'Ernst & Young', year: '2025', label: '2025', title: 'Business Consulting Intern, FSO', place: 'New York, NY', dates: 'Jun to Aug 2025', notes: 'Checked consistency across 10Ks and Call Reports for a top U.S. global bank.' },
        { name: 'Handoffs', year: '2024', label: '2024', title: 'Summer Business Intern', place: 'New York, NY', dates: 'Jun to Jul 2024', notes: 'Market research, competitor analysis, and investor deck edits alongside the CEO.' },
        { name: 'The Miami Native', year: '2023', label: '2023', title: 'Summer Business Intern', place: 'Miami, FL', dates: 'Jun to Aug 2023', notes: 'Cohort analysis of sign ups and deposits, plus the seed round pitch deck.' },
        { name: 'Toy Town', year: '2017', label: '2017', title: 'Lead Sales Associate', place: 'Miami, FL', dates: '2017 to 2023', notes: 'Personally sold over $200k of merchandise. Opened and closed the store.' }
    ];

    var STEP = 12;                     // cards per job
    var N = JOBS.length * STEP;        // cards on the drum
    var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var MODEL_W = 760, MODEL_H = 720;  // the model is built at this size and scaled to fit
    var PX_PER_CARD = 8;               // drag distance that moves one card

    var stage = document.getElementById('rdx-stage');
    if (!stage) return;
    var inner = stage.querySelector('.rdx-inner');
    var scene = stage.querySelector('.rdx-scene');
    var jobsEl = document.getElementById('sw-jobs');
    var nowNum = document.getElementById('sw-now-num');
    var nowName = document.getElementById('sw-now-name');
    var nowMeta = document.getElementById('sw-now-meta');
    var spinBtn = document.getElementById('sw-spin');
    var soundBtn = document.getElementById('sw-sound');

    var reducedQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    function reduced() { return !!(reducedQuery && reducedQuery.matches); }

    function pad(k) { return (k < 10 ? '0' : '') + k; }
    function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
    function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
    function wrapCards(d) { d = ((d % N) + N) % N; return d >= N / 2 ? d - N : d; }

    // Angle of a card, from its distance (in cards) to the front of the drum
    function fan(d) {
        if (d >= 1) return 12 + (d - 1) * 3.2;   // cards behind lean back
        if (d >= 0) return 1 + d * 11;           // the open card
        if (d >= -1) return 1 + d * 91;          // the card being flipped
        return -90 + (d + 1) * 3.2;              // cards already flipped hang forward
    }

    function el(tag, className, text) {
        var e = document.createElement(tag);
        if (className) e.className = className;
        if (text !== undefined) e.textContent = text;
        return e;
    }

    // ---------- Hardware (static) ----------
    function buildHardware() {
        var chrome = 'linear-gradient(90deg,#8E939A,#F2F3F5 40%,#B7BBC1 70%,#80858C)';
        var parts = [];
        parts.push({ s: 'left:-380px;top:98px;width:760px;height:440px;transform:rotateX(90deg);background:radial-gradient(closest-side,rgba(0,0,0,0.16),rgba(0,0,0,0.06) 60%,rgba(0,0,0,0))' });
        [[153, '#9EA3AA'], [147, '#C9CDD3'], [142, '#EEF0F3']].forEach(function (r) {
            parts.push({ s: 'left:-275px;top:' + r[0] + 'px;width:550px;height:330px;box-sizing:border-box;border:14px solid ' + r[1] + ';border-radius:150px;transform:rotateX(90deg)' });
        });
        [-270, 254].forEach(function (x) {
            parts.push({ s: 'left:' + x + 'px;top:0;width:16px;height:312px;border-radius:8px;background:' + chrome });
            parts.push({ s: 'left:' + x + 'px;top:0;width:16px;height:312px;border-radius:8px;background:' + chrome + ';transform:rotateY(90deg)' });
        });
        [-180, 120].forEach(function (x) {
            parts.push({ s: 'left:' + x + 'px;top:292px;width:60px;height:22px;background:#7B7D72;border-radius:5px;transform:translateZ(159px)' });
        });
        [[0, '#151515'], [45, '#1C1C1C'], [90, '#2A2A2A'], [135, '#1C1C1C']].forEach(function (p) {
            parts.push({ s: 'left:-230px;top:-30px;width:460px;height:60px;background:' + p[1] + ';transform:rotateX(' + p[0] + 'deg)' });
        });
        parts.forEach(function (p) {
            var d = el('div');
            d.style.cssText = p.s;
            scene.appendChild(d);
        });
    }

    function buildFrontHardware() {
        [-53, 27].forEach(function (x) {
            var clip = el('div');
            clip.style.cssText = 'left:' + x + 'px;top:-126px;width:26px;height:126px;box-sizing:border-box;border:6px solid #161616;border-radius:13px;transform:translateZ(8px)';
            scene.appendChild(clip);
        });
        [-1, 1].forEach(function (sx) {
            for (var j = 0; j < 12; j++) {
                var outer = j === 11;
                var disc = el('div');
                disc.style.cssText = 'left:-66px;top:-66px;width:132px;height:132px;border-radius:50%;transform:translateX(' + (sx * (234 + j * 3.4)) + 'px) rotateY(90deg);background:' +
                    (outer ? 'radial-gradient(circle at 40% 35%,#3A3A3A,#141414 60%,#0B0B0B)' : (j % 2 ? '#1B1B1B' : '#111111'));
                if (outer) {
                    var ring = el('div');
                    ring.style.cssText = 'position:absolute;inset:22px;border-radius:50%;border:2px solid #2C2C2C';
                    disc.appendChild(ring);
                }
                scene.appendChild(disc);
            }
        });
    }

    // ---------- Cards ----------
    var cards = [];
    function buildCards() {
        for (var i = 0; i < N; i++) {
            var isJob = i % STEP === 0;
            var k = i / STEP;
            var isDivider = !isJob && i % 3 === 1;
            var letterIndex = Math.floor(i / 3) % 26;

            var card = el('div', 'rdx-card');
            var face = el('div', 'rdx-face' + (isJob ? ' rdx-face--front' : ''));
            card.appendChild(face);

            var tab = null, back = null;
            if (isJob || isDivider) {
                tab = el('div', 'rdx-tab ' + (isJob ? 'rdx-tab--year' : 'rdx-tab--letter'), isJob ? JOBS[k].year : LETTERS.charAt(letterIndex));
                tab.style.left = (isJob ? 40 + k * 62 : 24 + (letterIndex % 7) * 58) + 'px';
                face.appendChild(tab);
            }
            if (isJob) {
                var job = JOBS[k];
                var typed = el('div', 'rdx-typed');
                var head = el('div', 'rdx-head');
                head.appendChild(el('b', '', job.name));
                head.appendChild(el('span', '', 'No. ' + pad(k + 1)));
                typed.appendChild(head);
                typed.appendChild(el('div', 'rdx-rule'));
                var lines = el('div', 'rdx-lines');
                lines.appendChild(el('div', '', job.title));
                lines.appendChild(el('div', '', job.place + ' · ' + job.dates));
                lines.appendChild(el('div', 'rdx-notes', job.notes));
                typed.appendChild(lines);
                face.appendChild(typed);
                back = el('div', 'rdx-face rdx-face--back');
                card.appendChild(back);
            }
            scene.appendChild(card);
            cards.push({ card: card, face: face, back: back, tab: tab, isJob: isJob, letter: isJob ? '' : LETTERS.charAt(letterIndex), lastA: null, lastFacing: null });
        }
    }

    // ---------- Job list in the rail ----------
    var jobButtons = [];
    function buildJobList() {
        JOBS.forEach(function (job, j) {
            var b = el('button');
            b.type = 'button';
            b.appendChild(el('span', '', job.name));
            b.appendChild(el('span', '', job.label));
            b.setAttribute('aria-pressed', j === 0 ? 'true' : 'false');
            b.addEventListener('click', function () { goTo(j); });
            jobsEl.appendChild(b);
            jobButtons.push(b);
        });
    }

    buildHardware();
    buildCards();
    buildFrontHardware();
    if (jobsEl) buildJobList();

    // ---------- Fit the fixed-size model into the column ----------
    function fit() {
        var w = stage.clientWidth;
        if (!w) return; // hidden (Hacker View); refit when shown
        var s = Math.min(1, w / MODEL_W);
        inner.style.transform = 'scale(' + s + ')';
        stage.style.height = Math.round(MODEL_H * s) + 'px';
    }
    if (window.ResizeObserver) {
        new ResizeObserver(fit).observe(stage);
    } else {
        window.addEventListener('resize', fit);
    }
    fit();

    // ---------- State ----------
    var pos = 0, v = 0, target = null, raf = 0, dragging = false;
    var tiltX = 0, tiltY = 0, lastCard = 0, lastTick = 0, ac = null, soundOn = true, lastCur = -1;
    var dragStart = 0, dragPos = 0, lastP = 0, lastT = 0, vel = 0, dragAxis = 'y';

    function render() {
        scene.style.transform = 'rotateX(' + (-14 - tiltX).toFixed(2) + 'deg) rotateY(' + (-24 + tiltY).toFixed(2) + 'deg)';
        for (var i = 0; i < N; i++) {
            var c = cards[i];
            var a = fan(wrapCards(i - pos));
            if (c.lastA !== null && Math.abs(c.lastA - a) < 0.01) continue;
            c.lastA = a;
            c.card.style.transform = 'rotateX(' + a.toFixed(2) + 'deg)';
            c.card.style.visibility = (a < -200 || a > 150) ? 'hidden' : 'visible';
            var ar = a * Math.PI / 180;
            var s = Math.min(1, 0.70 + 0.32 * Math.abs(0.5 * Math.sin(ar) + 0.86 * Math.cos(ar)));
            var base = c.isJob ? [253, 251, 245] : [242, 236, 221];
            var col = 'rgb(' + Math.round(base[0] * s) + ',' + Math.round(base[1] * s) + ',' + Math.round(base[2] * s) + ')';
            c.face.style.backgroundColor = col;
            if (c.back) c.back.style.backgroundColor = col;
            if (c.tab && !c.isJob) {
                var facing = a > -90 && a < 90;   // hide letters seen from behind so they never read mirrored
                if (facing !== c.lastFacing) { c.tab.textContent = facing ? c.letter : ''; c.lastFacing = facing; }
            }
        }
        var cur = ((Math.round(pos / STEP) % JOBS.length) + JOBS.length) % JOBS.length;
        if (cur !== lastCur) {
            lastCur = cur;
            var job = JOBS[cur];
            if (nowNum) nowNum.textContent = 'No. ' + pad(cur + 1) + ' / ' + pad(JOBS.length);
            if (nowName) nowName.textContent = job.name;
            if (nowMeta) nowMeta.textContent = job.title + '\n' + job.dates;
            jobButtons.forEach(function (b, j) { b.setAttribute('aria-pressed', j === cur ? 'true' : 'false'); });
        }
    }

    // ---------- Sound: a short paper click as each card passes ----------
    function ensureAudio() {
        if (!soundOn) return;
        try {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!ac && AC) ac = new AC();
            if (ac && ac.state === 'suspended') ac.resume();
        } catch (e) { /* sound is optional */ }
    }

    function click() {
        if (!soundOn || !ac || ac.state !== 'running') return;
        var t = now();
        if (t - lastTick < 24) return;
        lastTick = t;
        try {
            var len = Math.floor(ac.sampleRate * 0.014);
            var buf = ac.createBuffer(1, len, ac.sampleRate);
            var data = buf.getChannelData(0);
            for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 5);
            var src = ac.createBufferSource();
            src.buffer = buf;
            var f = ac.createBiquadFilter();
            f.type = 'bandpass';
            f.frequency.value = 2200 + Math.random() * 900;
            f.Q.value = 1.2;
            var g = ac.createGain();
            g.gain.value = 0.32;
            src.connect(f); f.connect(g); g.connect(ac.destination);
            src.start();
        } catch (e) { /* sound is optional */ }
    }

    function tick() {
        var c = Math.round(pos);
        if (c !== lastCard) { lastCard = c; click(); }
    }

    // ---------- Motion ----------
    // Tuned per 60fps frame, scaled by real elapsed time so a spin
    // takes the same time on a fast laptop or a slow phone.
    function physics(k) {
        if (dragging) return false;
        if (target === null) {
            if (Math.abs(v) > 0.08 && !reduced()) {
                pos += v * k;
                v *= Math.pow(0.955, k);
                tick();
                return true;
            }
            v = 0;
            target = Math.round(pos / STEP) * STEP;
        }
        var diff = target - pos;
        if (reduced() || Math.abs(diff) < 0.005) { pos = target; target = null; tick(); return false; }
        var m = diff * (1 - Math.pow(0.88, k)) + (diff > 0 ? 0.01 : -0.01) * k;
        if (Math.abs(m) > Math.abs(diff)) m = diff;
        pos += m;
        tick();
        return true;
    }

    var lastFrame = 0;
    function run() {
        if (raf) return;
        lastFrame = now();
        var step = function () {
            raf = 0;
            var t = now();
            var k = clamp((t - lastFrame) / (1000 / 60), 0.25, 4);
            lastFrame = t;
            var moving = physics(k);
            render();
            if (moving) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
    }

    function nudge(dir) {
        ensureAudio();
        var base = target !== null ? target : Math.round(pos / STEP) * STEP;
        v = 0;
        target = base + dir * STEP;
        run();
    }

    function goTo(k) {
        ensureAudio();
        var d = wrapCards(k * STEP - pos);
        v = 0;
        target = Math.round(pos + d);
        run();
    }

    function spin() {
        ensureAudio();
        target = null;
        v = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2);
        if (reduced()) v = 0;
        run();
    }

    // ---------- Pointer: drag to spin, hover to tilt ----------
    stage.addEventListener('pointerdown', function (e) {
        if (e.button !== undefined && e.button !== 0) return;
        if (e.target.closest && e.target.closest('button')) return;
        dragAxis = e.pointerType === 'touch' ? 'x' : 'y';
        if (dragAxis === 'y') {
            try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
            e.preventDefault();
        }
        ensureAudio();
        dragging = true;
        target = null;
        v = 0;
        vel = 0;
        dragStart = dragAxis === 'x' ? -e.clientX : e.clientY;
        dragPos = pos;
        lastP = dragStart;
        lastT = now();
        stage.classList.add('is-dragging');
    });

    stage.addEventListener('pointermove', function (e) {
        if (!dragging) {
            if (reduced() || e.pointerType !== 'mouse') return;
            var rc = stage.getBoundingClientRect();
            tiltY = ((e.clientX - rc.left) / Math.max(1, rc.width) - 0.5) * 9;
            tiltX = ((e.clientY - rc.top) / Math.max(1, rc.height) - 0.5) * 5;
            render();
            return;
        }
        var p = dragAxis === 'x' ? -e.clientX : e.clientY;
        var t = now();
        pos = dragPos + (p - dragStart) / PX_PER_CARD;
        var dt = Math.max(1, t - lastT);
        vel = vel * 0.5 + (((p - lastP) / PX_PER_CARD) / dt * 16) * 0.5;
        lastP = p;
        lastT = t;
        tick();
        render();
    });

    function release() {
        if (!dragging) return;
        dragging = false;
        stage.classList.remove('is-dragging');
        v = (now() - lastT > 90) ? 0 : clamp(vel, -5, 5);
        run();
    }
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);
    stage.addEventListener('lostpointercapture', release);
    stage.addEventListener('pointerleave', function (e) {
        if (dragging && dragAxis === 'x') release();
        if (!dragging && (tiltX || tiltY)) { tiltX = 0; tiltY = 0; render(); }
    });

    // ---------- Wheel: one notch, one job ----------
    // A scroll that is already moving the page passes straight through,
    // so the Rolodex never traps someone scrolling down the page.
    var wheelAcc = 0, lastWheel = 0, lastWheelStep = 0, lastPageWheel = -1e9;
    window.addEventListener('wheel', function (e) {
        if (!stage.contains(e.target)) lastPageWheel = now();
    }, { passive: true, capture: true });

    stage.addEventListener('wheel', function (e) {
        var t = now();
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;     // sideways trackpad scroll: leave it alone
        if (t - lastPageWheel < 650) { lastPageWheel = t; return; } // still scrolling the page
        e.preventDefault();
        ensureAudio();
        if (t - lastWheel > 220) wheelAcc = 0;
        lastWheel = t;
        wheelAcc += e.deltaMode === 1 ? e.deltaY * 40 : (e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY);
        if (Math.abs(wheelAcc) >= 40 && t - lastWheelStep > 260) {
            nudge(wheelAcc > 0 ? 1 : -1);
            wheelAcc = 0;
            lastWheelStep = t;
        }
    }, { passive: false });

    // ---------- Keyboard ----------
    stage.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); nudge(1); }
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1); }
        else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
        else if (e.key === 'End') { e.preventDefault(); goTo(JOBS.length - 1); }
    });

    // ---------- Buttons ----------
    var knobBack = stage.querySelector('.rdx-knob--back');
    var knobForward = stage.querySelector('.rdx-knob--forward');
    if (knobBack) knobBack.addEventListener('click', function () { nudge(-1); });
    if (knobForward) knobForward.addEventListener('click', function () { nudge(1); });
    if (spinBtn) spinBtn.addEventListener('click', spin);
    if (soundBtn) {
        soundBtn.addEventListener('click', function () {
            soundOn = !soundOn;
            soundBtn.textContent = 'Sound ' + (soundOn ? 'on' : 'off');
            soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
        });
    }

    render();
})();
