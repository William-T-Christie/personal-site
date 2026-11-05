/**
 * Buzzword Bingo: the app.
 * Four games share one results screen: Meeting (upload), Live (microphone), Resume (with detention), Text (paste).
 */
import { analyze, cardFromAnalysis, liveCard, daubCard, plainEnglish, summary, LINES, hash } from './engine.js';
import { Transcriber, Microphone, decodeFile, windows, cleanTranscript, rms, readTextFile } from './audio.js';
import { SAMPLES } from './samples.js';

// ---------------- helpers ----------------
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
};
const fmtTime = (s) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : (many || one + 's'));
const MODE = {
  meeting: { name: 'Meeting', paper: 'var(--yellow)' },
  live: { name: 'Live meeting', paper: 'var(--pink)' },
  resume: { name: 'Resume', paper: 'var(--blue)' },
  text: { name: 'Text', paper: 'var(--mint)' }
};

// ---------------- sound ----------------
let actx = null; let muted = store.get('bb-muted', false);
function audioCtx() { if (muted) return null; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); return actx; } catch (e) { return null; } }
function tone(freq, dur, type = 'square', vol = 0.05, when = 0) { const c = audioCtx(); if (!c) return; const o = c.createOscillator(); const g = c.createGain(); o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(vol, c.currentTime + when); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur); o.connect(g).connect(c.destination); o.start(c.currentTime + when); o.stop(c.currentTime + when + dur + 0.02); }
const sfx = {
  dab: (k = 0) => { tone(180 + (k % 6) * 14, 0.06, 'triangle', 0.08); tone(90, 0.05, 'sine', 0.06); },
  deal: () => { const c = audioCtx(); if (!c) return; const len = 0.12 * c.sampleRate; const b = c.createBuffer(1, len, c.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3) * 0.3; const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1800; s.connect(f).connect(c.destination); s.start(); },
  buzzer: () => { tone(110, 0.55, 'sawtooth', 0.11); tone(104, 0.55, 'sawtooth', 0.11, 0.6); tone(98, 0.9, 'sawtooth', 0.11, 1.2); },
  chime: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.08, i * 0.11)),
  bingo: () => [523, 659, 784, 1046, 784, 1046, 1319].forEach((f, i) => tone(f, 0.16, 'square', 0.06, i * 0.09)),
  chalk: () => { const c = audioCtx(); if (!c) return; const len = 0.25 * c.sampleRate; const b = c.createBuffer(1, len, c.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.25; const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3200; s.connect(f).connect(c.destination); s.start(); },
  stamp: () => { tone(80, 0.15, 'square', 0.14); tone(60, 0.2, 'triangle', 0.14, 0.03); },
  nope: () => tone(160, 0.18, 'square', 0.06)
};
function syncSound() { $('nav-sound').textContent = muted ? 'Sound off' : 'Sound on'; $('nav-sound').setAttribute('aria-pressed', String(muted)); }
$('nav-sound').addEventListener('click', () => { muted = !muted; store.set('bb-muted', muted); syncSound(); if (!muted) sfx.deal(); });
syncSound();

// ---------------- home: little printed cards ----------------
document.querySelectorAll('.pick .mini').forEach((m, j) => {
  m.innerHTML = Array.from({ length: 25 }, (_, i) => '<i class="' + ((i * 7 + j * 3) % 5 === 0 || i === 12 ? 'd' : '') + '"></i>').join('');
});
document.querySelectorAll('.pick').forEach((a) => a.addEventListener('click', () => sfx.deal()));

// ---------------- views + routing ----------------
const VIEWS = ['home', 'meeting', 'live', 'resume', 'text', 'scan', 'results', 'scores'];
let lastMode = 'meeting';
function show(name, navKey) {
  VIEWS.forEach((v) => { $('v-' + v).hidden = v !== name; });
  const key = navKey !== undefined ? navKey : name;
  document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === key));
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
}
function route() {
  const h = location.hash.replace('#', '');
  if (live.running && h !== 'live') stopLive(false);
  if (['meeting', 'live', 'resume', 'text', 'scores'].includes(h)) {
    if (h !== 'scores') lastMode = h;
    if (h === 'scores') renderScores();
    if (h === 'live' && !live.card) newLiveCard();
    if (h === 'meeting') resetMeeting();
    show(h);
  } else show('home', '');
}
window.addEventListener('hashchange', route);
// Clicking a link to the screen's own hash (say, Resume while looking at resume results) still needs to go back to that game.
document.addEventListener('click', (e) => { const a = e.target.closest('a[href^="#"]'); if (a && a.getAttribute('href') === (location.hash || '#')) { e.preventDefault(); route(); } });
$('logo').addEventListener('click', (e) => { e.preventDefault(); if (location.hash) location.hash = ''; route(); });
$('scores-back').addEventListener('click', () => (history.length > 1 ? history.back() : (location.hash = '')));

// ---------------- the printed bingo card ----------------
function lineName(line) {
  const set = line.join(',');
  for (let i = 0; i < 5; i++) { if (set === [0, 1, 2, 3, 4].map((j) => i * 5 + j).join(',')) return 'row ' + (i + 1); if (set === [0, 1, 2, 3, 4].map((j) => j * 5 + i).join(',')) return 'the ' + 'BINGO'[i] + ' column'; }
  return 'a diagonal';
}
function cardStatus(card) {
  if (card.blackout) return 'Blackout';
  if (card.bingo) return card.winning.length > 1 ? card.winning.length + ' bingos' : 'Bingo on ' + lineName(card.winning[0]);
  return card.daubed + ' of 24 daubed';
}
function renderCard(el, card, opts = {}) {
  const win = new Set(card.winning.flat());
  const fresh = new Set(opts.fresh || []);
  const seed = card.no || 1;
  el.className = 'bcard' + (opts.tilt ? ' tilt' : '');
  el.style.setProperty('--paper', opts.paper || 'var(--yellow)');
  el.innerHTML = '<div class="letters" aria-hidden="true"><span>B</span><span>I</span><span>N</span><span>G</span><span>O</span></div>' +
    '<div class="grid" role="grid" aria-label="Bingo card">' + card.cells.map((c, i) => {
      const label = c.free ? 'Free' : c.d.label;
      const longest = c.free ? 0 : Math.max(...label.split(' ').map((w) => w.length));
      const showHit = c.hit && !opts.animate;
      const cls = ['cell', c.free ? 'free' : '', longest >= 13 ? 'xlong' : longest >= 10 ? 'long' : '', showHit ? 'hit' : '', fresh.has(i) ? 'stamp-in' : ''].filter(Boolean).join(' ');
      const dx = (((seed * 31 + i * 17) % 9) - 4) + 'px', dy = (((seed * 13 + i * 29) % 9) - 4) + 'px';
      return '<div class="' + cls + '" role="gridcell" aria-label="' + esc(label) + (c.hit ? ', daubed' : '') + '"><i class="dab" style="--dx:' + dx + ';--dy:' + dy + '"></i><span>' + esc(label) + '</span></div>';
    }).join('') + linesSVG(card, opts) + '</div>' + (card.blackout ? '<div class="blackout' + (opts.animate ? ' later' : '') + '">Blackout</div>' : '') +
    '<div class="cfoot"><span>Card no. ' + String(seed % 10000).padStart(4, '0') + '</span><span class="cstat">' + esc(cardStatus(card)) + '</span></div>';
  if (opts.newLine) setTimeout(() => { const l = el.querySelector('.lines'); if (l) l.classList.add('draw'); }, 40);
  if (opts.animate) {
    const cells = el.querySelectorAll('.cell');
    const order = card.cells.map((c, i) => i).filter((i) => card.cells[i].hit);
    order.forEach((i, k) => setTimeout(() => { cells[i].classList.add('hit', 'stamp-in'); if (!card.cells[i].free) sfx.dab(k); }, reduced ? 0 : 250 + k * 90));
    setTimeout(() => { const l = el.querySelector('.lines'); if (l) l.classList.add('draw'); const b = el.querySelector('.blackout'); if (b) b.classList.remove('later'); }, reduced ? 0 : 250 + order.length * 90 + 150);
  }
}
function linesSVG(card, opts) {
  if (!card.winning.length || card.blackout) return '';
  const pt = (i) => [(i % 5) * 20 + 10, Math.floor(i / 5) * 20 + 10];
  const segs = card.winning.slice(0, 3).map((l) => { const [x1, y1] = pt(l[0]); const [x2, y2] = pt(l[4]); const dx = Math.sign(x2 - x1) * 5, dy = Math.sign(y2 - y1) * 5; return '<line x1="' + (x1 - dx) + '" y1="' + (y1 - dy) + '" x2="' + (x2 + dx) + '" y2="' + (y2 + dy) + '" pathLength="100"/>'; }).join('');
  return '<svg class="lines' + (opts.animate || opts.newLine ? '' : ' draw') + '" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + segs + '</svg>';
}
function highlight(text, hits, from = 0) {
  let out = ''; let p = from;
  for (const h of hits) { if (h.e <= from) continue; out += esc(text.slice(p, h.s)) + '<mark>' + esc(h.t) + '</mark>'; p = h.e; }
  return out + esc(text.slice(p));
}
function dots(el, n, filled) { el.innerHTML = Array.from({ length: n }, (_, i) => '<i class="' + (i < filled ? 'on' : '') + '"></i>').join(''); }

// ---------------- scanning (text, resume, demo) ----------------
const SCAN_LINES = ['Checking for synergy', 'Measuring bandwidth', 'Circling back', 'Looking for low hanging fruit', 'Aligning stakeholders', 'Taking it offline'];
async function scan(a) {
  show('scan', null);
  const n = 15; const seen = a.hits.slice(0, 20).map((h) => h.t);
  for (let k = 1; k <= n; k++) {
    dots($('scan-dots'), n, k);
    $('scan-msg').textContent = SCAN_LINES[Math.floor(((k - 1) / n) * SCAN_LINES.length)];
    $('scan-tick').innerHTML = seen.length ? 'Found <b>' + esc(seen[k % seen.length].toLowerCase()) + '</b>' : 'Nothing yet';
    if (seen.length) sfx.dab(k);
    await sleep(reduced ? 10 : 110);
  }
  await sleep(reduced ? 0 : 280);
}

// ---------------- results ----------------
const R = { a: null, card: null, mode: null, failed: false, served: true, view: 'annot', saved: false, source: null };
function showResults(mode, a, card, extra = {}) {
  Object.assign(R, { a, card, mode, view: 'annot', saved: false, source: extra.source || null });
  R.failed = mode === 'resume' && (card.bingo || a.index >= 45);
  R.served = !R.failed;
  show('results', mode);
  renderCard($('res-card'), card, { animate: true, tilt: true, paper: MODE[mode].paper });
  $('res-mode').textContent = MODE[mode].name + ' results';
  const el = $('res-points'); const t0 = performance.now(); const dur = reduced ? 1 : 1100;
  const tick = (now) => { const p = Math.min(1, (now - t0) / dur); el.textContent = Math.round(a.points * (1 - Math.pow(1 - p, 3))).toLocaleString(); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  $('res-line').textContent = pointsLine(mode, a);
  $('res-rank').textContent = titleCase(a.rank.title);
  $('res-note').textContent = quip(mode, a, card);
  $('res-index').textContent = a.index + ' of 100';
  $('res-meter').style.width = '0%'; setTimeout(() => { $('res-meter').style.width = Math.max(2, a.index) + '%'; }, 60);
  const v = verdict(mode, a); const vEl = $('res-verdict'); vEl.textContent = v.text; vEl.className = 'stamp ' + v.cls;
  const facts = [['Words', a.words.toLocaleString()], ['Unique buzzwords', String(a.unique)], ['Density', (a.density * 100).toFixed(1) + '%']];
  if (a.perMinute != null) facts.push(['Per minute', a.perMinute.toFixed(1)]);
  if (a.worst) facts.push(['Said most', a.worst.first.toLowerCase() + ' ×' + a.worst.count]);
  $('res-stats').innerHTML = facts.map(([k, x]) => '<div><dt>' + esc(k) + '</dt><dd>' + esc(x) + '</dd></div>').join('');
  $('res-breakdown').innerHTML = a.breakdown.length ? a.breakdown.map((b) => '<li class="t' + b.d.tier + '"><span>' + esc(b.d.label) + '<small>means “' + esc(b.d.plain) + '”</small></span><span class="x">×' + b.count + '</span><span class="p">+' + b.count * b.d.points + '</span></li>').join('') : '<li class="none">No buzzwords at all. A person wrote this.</li>';
  renderAnnot();
  $('res-share').textContent = summary(a, mode, card);
  $('res-saved').textContent = ''; $('res-initials').disabled = false; $('res-initials').value = store.get('bb-last-initials', '');
  $('res-sentence').innerHTML = '';
  const settle = reduced ? 50 : 250 + card.cells.filter((c) => c.hit).length * 90 + 400;
  if (R.failed) setTimeout(openSlip, settle + 300);
  else if (card.bingo) setTimeout(() => { sfx.bingo(); confetti(); }, settle);
  else setTimeout(() => sfx.chime(), settle);
}
const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
function pointsLine(mode, a) {
  const from = 'points from ' + plural(a.count, 'buzzword');
  if ((mode === 'meeting' || mode === 'live') && a.durationSec) { const m = Math.max(1, Math.round(a.durationSec / 60)); return from + ' in a ' + m + ' minute ' + (mode === 'live' ? 'call' : 'meeting'); }
  if (mode === 'resume') return from + ' on one resume';
  return from + ' in ' + plural(a.words, 'word');
}
function quip(mode, a, card) {
  if (R.source === 'william') return R.failed ? 'Even William fails. He did become a consultant.' : 'William passes. Consulting has not fully taken him yet.';
  if (mode === 'resume') { if (R.failed && a.index >= 85) return 'This resume has never touched grass. HR has been notified.'; if (R.failed) return 'Too much jargon. Corrective action is required.'; if (a.index >= 25) return 'You passed, but HR is keeping an eye on you.'; if (!a.count) return 'Not one buzzword. A recruiter might actually read this.'; return a.rank.note; }
  if (mode === 'live' && !a.words) return 'Nobody said anything. Either the microphone was muted or it was a perfect meeting.';
  if (card.blackout) return 'Every square on the card. Someone should check on that meeting.';
  return a.rank.note;
}
function verdict(mode, a) {
  if (mode === 'resume') return R.failed ? { text: 'Audit failed', cls: 'bad' } : a.index >= 25 ? { text: 'Passed with a warning', cls: 'warn' } : { text: 'Audit passed', cls: 'good' };
  if (mode === 'text') return a.index >= 45 ? { text: 'Please rewrite', cls: 'bad' } : a.index >= 25 ? { text: 'Trim the jargon', cls: 'warn' } : { text: 'Send it', cls: 'good' };
  return a.index >= 45 ? { text: 'Could have been an email', cls: 'bad' } : a.index >= 25 ? { text: 'Could have been shorter', cls: 'warn' } : { text: 'An actual conversation', cls: 'good' };
}
function renderAnnot() {
  const body = $('res-annot'); const a = R.a;
  const locked = R.failed && !R.served;
  ['v-annot', 'v-plain', 'v-copy'].forEach((id) => { $(id).disabled = locked; });
  $('v-annot').setAttribute('aria-pressed', String(R.view === 'annot')); $('v-plain').setAttribute('aria-pressed', String(R.view === 'plain'));
  const wrap = (inner) => '<div class="transcript">' + inner + '</div>';
  if (locked) { body.innerHTML = wrap('<div class="locked">Locked until you serve detention.</div>'); return; }
  if (!a.text.trim()) { body.innerHTML = wrap('<div class="locked">Nothing was said.</div>'); return; }
  if (!a.hits.length) { body.innerHTML = wrap('<div class="translate">No buzzwords to translate.</div><div class="doc">' + esc(a.text) + '</div>'); return; }
  let html = ''; let p = 0;
  if (R.view === 'annot') {
    a.hits.forEach((h, k) => { html += esc(a.text.slice(p, h.s)) + '<mark tabindex="0" data-k="' + k + '">' + esc(h.t) + '</mark>'; p = h.e; });
    body.innerHTML = wrap('<div class="translate" id="tr" aria-live="polite">Hover or tap a highlighted phrase to translate it.</div><div class="doc">' + html + esc(a.text.slice(p)) + '</div>');
    const tr = $('tr');
    const say = (m) => { const h = a.hits[+m.dataset.k]; tr.innerHTML = '<b>' + esc(h.t) + '</b> means <em>' + esc(h.d.plain) + '</em>, worth ' + plural(h.d.points, 'point'); body.querySelectorAll('mark.on').forEach((x) => x.classList.remove('on')); m.classList.add('on'); };
    body.querySelectorAll('mark').forEach((m) => { m.addEventListener('mouseenter', () => say(m)); m.addEventListener('focus', () => say(m)); m.addEventListener('click', () => say(m)); });
  } else {
    const plain = (h) => { const c = h.t[0]; return c === c.toUpperCase() && c !== c.toLowerCase() ? h.d.plain[0].toUpperCase() + h.d.plain.slice(1) : h.d.plain; };
    a.hits.forEach((h) => { html += esc(a.text.slice(p, h.s)) + '<span class="plain">' + esc(plain(h)) + '</span>'; p = h.e; });
    body.innerHTML = wrap('<div class="translate">Every buzzword swapped for what it means. ' + plural(a.hits.length, 'replacement') + '.</div><div class="doc">' + html + esc(a.text.slice(p)) + '</div>');
  }
}
$('v-annot').addEventListener('click', () => { R.view = 'annot'; renderAnnot(); });
$('v-plain').addEventListener('click', () => { R.view = 'plain'; renderAnnot(); });
async function copyText(text, btn, label) {
  try { await navigator.clipboard.writeText(text); btn.textContent = 'Copied'; } catch (e) { btn.textContent = 'Select it and copy'; }
  setTimeout(() => { btn.textContent = label; }, 1600);
}
$('v-copy').addEventListener('click', () => copyText(plainEnglish(R.a.text, R.a.hits), $('v-copy'), 'Copy'));
$('res-copy-share').addEventListener('click', () => copyText($('res-share').textContent, $('res-copy-share'), 'Copy my score'));
$('res-again').addEventListener('click', () => { if (location.hash.replace('#', '') === lastMode) route(); else location.hash = lastMode; });
$('res-home').addEventListener('click', () => { location.hash = ''; route(); });

// ---------------- hall of shame ----------------
function scores() {
  let list = store.get('bb-scores', null);
  if (!list) {
    const old = store.get('buzzword_bingo_highscores', []);
    list = Array.isArray(old) ? old.map((o) => ({ who: o.name, points: o.score, index: null, mode: 'meeting', rank: '', at: o.date })) : [];
    store.set('bb-scores', list);
  }
  return list;
}
function renderScores(mine) {
  const list = scores();
  $('hs-body').innerHTML = list.length ? list.map((r, i) => '<li class="' + (r.at === mine ? 'me' : '') + '"><span class="n">' + (i + 1) + '</span><span class="who">' + esc(r.who) + '</span><span class="what">' + esc(r.rank ? titleCase(r.rank) : 'Version 1 score') + '<small>' + esc((MODE[r.mode] || MODE.meeting).name) + (r.index != null ? ', index ' + r.index : '') + '</small></span><span class="pts">' + Number(r.points).toLocaleString() + '</span></li>').join('') : '<li class="empty">Nobody has signed it yet. Go find some jargon.</li>';
}
$('res-form').addEventListener('submit', (e) => {
  e.preventDefault(); if (R.saved || !R.a) return;
  const who = $('res-initials').value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
  if (!who) { $('res-saved').textContent = 'Type up to three letters first.'; return; }
  const at = new Date().toISOString();
  const list = scores().concat([{ who, points: R.a.points, index: R.a.index, mode: R.mode, rank: R.a.rank.title, at }]).sort((x, y) => y.points - x.points).slice(0, 10);
  store.set('bb-scores', list); store.set('bb-last-initials', who);
  R.saved = true; $('res-initials').disabled = true;
  const pos = list.findIndex((r) => r.at === at);
  $('res-saved').textContent = pos >= 0 ? 'Signed. You are number ' + (pos + 1) + ' in the Hall of Shame.' : 'Not corporate enough for the top 10. Congratulations?';
  sfx.stamp();
});

// ---------------- detention (resume) ----------------
let linesNeeded = 0, linesDone = 0, appealed = false;
const lineText = () => 'I will not write "' + ((R.a.worst && R.a.worst.first.toLowerCase()) || 'synergy') + '" on my resume.';
const norm = (s) => s.toLowerCase().replace(/[“”"']/g, '"').replace(/\s+/g, ' ').replace(/\.$/, '').trim();
function openSlip() {
  linesNeeded = Math.min(5, 3 + Math.floor(R.a.unique / 10)); linesDone = 0; appealed = false;
  sfx.buzzer();
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const offense = R.card.blackout ? 'Blackout bingo, all 12 lines' : R.card.bingo ? 'Buzzword bingo on ' + lineName(R.card.winning[0]) : 'Excessive jargon';
  $('overlay-root').innerHTML = '<div class="overlay flash"><div class="slipform shake" role="dialog" aria-modal="true" aria-labelledby="slip-h" id="slip">' +
    '<div class="form"><span>Form 404 B, Human Resources</span><span>' + esc(today) + '</span></div><div class="rubber">Terminated</div>' +
    '<h2 id="slip-h">Notice of corporate speak violation</h2><dl>' +
    '<dt>Offense</dt><dd>' + esc(offense) + '</dd><dt>Violations</dt><dd>' + plural(R.a.count, 'buzzword') + ', ' + R.a.unique + ' unique</dd>' +
    '<dt>Worst offense</dt><dd>"' + esc(R.a.worst.first.toLowerCase()) + '" used ' + plural(R.a.worst.count, 'time') + '</dd>' +
    '<dt>Synergy tax</dt><dd>$' + (R.a.count * 250).toLocaleString('en-US') + ' taken from your imaginary bonus</dd></dl>' +
    '<div class="sentence" id="slip-sentence">Your sentence: write this line <b id="slip-n">' + linesNeeded + '</b> times, by hand. No pasting.<br><br><b>' + esc(lineText()) + '</b></div>' +
    '<div class="actions"><button class="accept" type="button" id="accept">Accept my sentence</button><button class="appeal" type="button" id="appeal">Appeal to HR</button></div></div></div>';
  setTimeout(() => { const s = $('slip'); if (s) s.classList.remove('shake'); }, 600);
  $('accept').focus();
  $('accept').addEventListener('click', closeSlip);
  $('appeal').addEventListener('click', () => {
    if (appealed) return; appealed = true; linesNeeded += 2; sfx.stamp(); $('slip-n').textContent = linesNeeded;
    const st = document.createElement('div'); st.className = 'rubber denied'; st.textContent = 'Appeal denied'; $('slip').appendChild(st);
    const p = document.createElement('p'); p.style.cssText = 'margin:10px 0 0;font-weight:700'; p.textContent = 'HR reviewed your appeal and will circle back. Two lines were added for the trouble.';
    $('slip-sentence').after(p); $('appeal').disabled = true; $('accept').focus();
  });
  document.addEventListener('keydown', slipKeys);
}
function slipKeys(e) { if (e.key === 'Escape' && $('slip')) { e.preventDefault(); sfx.nope(); const s = $('slip'); s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake'); } }
function closeSlip() { document.removeEventListener('keydown', slipKeys); $('overlay-root').innerHTML = ''; renderBoard(); const i = $('lines-input'); if (i) { i.focus({ preventScroll: true }); $('res-sentence').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); } }
function renderBoard() {
  const done = Array.from({ length: linesDone }, () => '<div>' + esc(lineText()) + '</div>').join('');
  $('res-sentence').innerHTML = '<div class="chalkboard"><h3>Detention</h3><p class="sub">Write it ' + linesNeeded + ' times. Typos do not count. No pasting.</p><div class="written" id="written">' + done + '</div>' +
    '<div class="line-row"><label for="lines-input" class="sr">Write the line</label><input id="lines-input" type="text" autocomplete="off" spellcheck="false" placeholder="' + esc(lineText()) + '"><button class="chalk-btn" type="button" id="lines-go">Write it</button></div>' +
    '<div class="count" id="lines-progress">Line ' + Math.min(linesDone + 1, linesNeeded) + ' of ' + linesNeeded + '</div><div class="note" id="board-note" aria-live="polite"></div></div>';
  const inp = $('lines-input'), note = $('board-note'), target = norm(lineText());
  inp.addEventListener('paste', (e) => { e.preventDefault(); sfx.nope(); note.textContent = 'Pasting is a shortcut. Shortcuts are how you got here.'; });
  inp.addEventListener('drop', (e) => { e.preventDefault(); note.textContent = 'No dragging either. Type it.'; });
  inp.addEventListener('input', () => { const v = norm(inp.value); inp.classList.toggle('bad', v.length > 0 && !target.startsWith(v) && v !== target); });
  const submit = () => {
    if (norm(inp.value) === target) {
      linesDone++; sfx.chalk(); inp.value = ''; inp.classList.remove('bad');
      const d = document.createElement('div'); d.textContent = lineText(); $('written').appendChild(d);
      if (linesDone >= linesNeeded) { R.served = true; setTimeout(finishBoard, 450); return; }
      $('lines-progress').textContent = 'Line ' + (linesDone + 1) + ' of ' + linesNeeded;
      note.textContent = ['Good. Again.', 'HR is watching.', 'Keep going.', 'Your manager has been cc’d.', 'Almost there. Do not pivot now.', 'Neat handwriting.'][linesDone % 6];
    } else { sfx.nope(); inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); note.textContent = inp.value.trim() ? 'Typo. HR noticed. Try that line again.' : 'Type the line first.'; }
  };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  $('lines-go').addEventListener('click', submit);
}
function finishBoard() {
  sfx.chime(); confetti();
  $('res-sentence').innerHTML = '<div class="chalkboard"><h3>Sentence served</h3><p class="sub" style="margin-bottom:0">You have been rehabilitated. Here is what your resume actually says.</p></div>';
  renderAnnot(); $('res-annot-panel').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

// ---------------- resume + text ----------------
function setupPaste(prefix, mode, samples, first) {
  const ta = $(prefix + '-text'); const box = $('v-' + mode).querySelector('.tags');
  let source = first;
  Object.entries(samples).forEach(([key, s]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tag'; b.dataset.k = key; b.textContent = s.name; box.appendChild(b); b.addEventListener('click', () => load(key)); });
  const mark = (key) => box.querySelectorAll('.tag').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.k === key)));
  function load(key) { ta.value = samples[key].text; source = key; $(prefix + '-loaded').textContent = samples[key].name + (samples[key].fictional ? ', a made up sample' : '') + '. Paste your own over it.'; mark(key); $(prefix + '-error').textContent = ''; }
  ta.addEventListener('input', () => { if (source !== 'own') { source = 'own'; $(prefix + '-loaded').textContent = 'Your text'; mark(null); } });
  load(first);
  const file = $(prefix + '-file');
  if (file) {
    const handle = async (f) => {
      if (!f) return; $(prefix + '-error').textContent = ''; $(prefix + '-loaded').textContent = 'Reading ' + f.name;
      try { const text = (await readTextFile(f)).trim(); if (!text) throw new Error('No text found in that file. If it is a scanned PDF, paste the text instead.'); ta.value = text; source = 'own'; mark(null); $(prefix + '-loaded').textContent = f.name; }
      catch (e) { $(prefix + '-loaded').textContent = ''; $(prefix + '-error').textContent = e.message === 'load' ? 'The file reader could not load. Paste the text instead.' : e.message; }
    };
    file.addEventListener('change', (e) => handle(e.target.files[0]));
    const zone = $('v-' + mode);
    ['dragenter', 'dragover'].forEach((ev) => zone.addEventListener(ev, (e) => e.preventDefault()));
    zone.addEventListener('drop', (e) => { const f = e.dataTransfer && e.dataTransfer.files[0]; if (f) { e.preventDefault(); handle(f); } });
  }
  $(prefix + '-go').addEventListener('click', async () => {
    const text = ta.value.trim();
    if (!text) { $(prefix + '-error').textContent = 'Paste something first. One sentence is enough.'; ta.focus(); return; }
    audioCtx(); const a = analyze(text); const card = cardFromAnalysis(a, mode); card.no = hash(text) % 10000;
    await scan(a); showResults(mode, a, card, { source });
  });
}
setupPaste('r', 'resume', SAMPLES.resume, 'corporate');
setupPaste('t', 'text', SAMPLES.text, 'email');

$('demo-btn').addEventListener('click', async () => {
  audioCtx(); sfx.deal(); lastMode = 'meeting';
  const a = analyze(SAMPLES.demoMeeting, { durationSec: 192 }); const card = cardFromAnalysis(a, 'meeting'); card.no = 4417;
  await scan(a); showResults('meeting', a, card, { source: 'demo' });
});

// ---------------- meeting (upload) ----------------
let transcriber = null;
function getTranscriber() { if (!transcriber) transcriber = new Transcriber(); return transcriber; }
const meet = { cancelled: false, running: false };
function resetMeeting() { if (meet.running) return; $('meeting-pick').hidden = false; $('meeting-run').hidden = true; $('m-error').textContent = ''; }
const mDrop = $('m-drop');
['dragenter', 'dragover'].forEach((ev) => mDrop.addEventListener(ev, (e) => { e.preventDefault(); mDrop.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => mDrop.addEventListener(ev, (e) => { e.preventDefault(); mDrop.classList.remove('over'); }));
mDrop.addEventListener('drop', (e) => { const f = e.dataTransfer && e.dataTransfer.files[0]; if (f) runMeeting(f); });
$('m-file').addEventListener('change', (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) runMeeting(f); });
$('m-cancel').addEventListener('click', () => { meet.cancelled = true; meet.running = false; if (transcriber) { transcriber.terminate(); transcriber = null; } resetMeeting(); });
function stage(title, pct, detail) {
  $('m-stage').textContent = title;
  if (pct != null) { $('m-pct').textContent = Math.round(pct) + '%'; dots($('m-dots'), 25, Math.round((pct / 100) * 25)); }
  if (detail != null) $('m-detail').textContent = detail;
}
async function runMeeting(file) {
  if (meet.running) return;
  audioCtx(); meet.running = true; meet.cancelled = false;
  $('m-error').textContent = ''; $('meeting-pick').hidden = true; $('meeting-run').hidden = false; $('m-stream').innerHTML = ''; $('m-count').textContent = 'No buzzwords yet';
  const size = document.querySelector('input[name="m-size"]:checked').value;
  try {
    stage('Reading the recording', 2, file.name);
    const { audio, duration } = await decodeFile(file);
    if (meet.cancelled) return;
    if (duration > 3 * 3600) throw new Error('That recording is over three hours long. Try a shorter clip.');
    if (duration < 1) throw new Error('That recording is shorter than one second.');
    stage('Loading the speech model', 5, 'First time only. Your browser keeps it after this.');
    const t = getTranscriber();
    let best = 0;
    t.onDownload = (loaded, total) => { best = Math.max(best, loaded / total); if (!meet.cancelled) stage('Downloading the speech model', 5 + 15 * best, Math.round(loaded / 1e6) + ' of ' + Math.round(total / 1e6) + ' MB. First time only.'); };
    const info = await t.load(size);
    if (meet.cancelled) return;
    const where = info.device === 'webgpu' ? 'on your graphics chip' : 'on your processor';
    const wins = windows(audio); let text = ''; let spent = 0; let done = 0;
    stage('Listening to the meeting', 20, fmtTime(duration) + ' of audio, transcribed ' + where + '.');
    for (const w of wins) {
      if (meet.cancelled) return;
      const chunk = audio.slice(w.start, w.end);
      if (rms(chunk) > 0.002) {
        const res = await t.transcribe(chunk);
        if (meet.cancelled) return;
        spent += res.ms;
        const clean = cleanTranscript(res.text);
        if (clean) text += (text ? ' ' : '') + clean;
        const a = analyze(text);
        $('m-stream').innerHTML = highlight(text, a.hits); $('m-stream').scrollTop = $('m-stream').scrollHeight;
        $('m-count').textContent = a.count ? plural(a.count, 'buzzword') + ' so far, ' + plural(a.points, 'point') : 'No buzzwords yet';
        if (a.count) sfx.dab(a.count);
      }
      done++;
      const left = wins.length - done; const avg = spent / Math.max(1, done);
      stage('Listening to the meeting', 20 + 80 * (done / wins.length), fmtTime(w.end / 16000) + ' of ' + fmtTime(duration) + ' done, ' + where + '.' + (left > 0 && done > 1 && left * avg > 2000 ? ' About ' + fmtTime((left * avg) / 1000) + ' left.' : ''));
    }
    const a = analyze(text, { durationSec: duration });
    meet.running = false;
    const card = cardFromAnalysis(a, 'meeting'); card.no = hash(file.name + duration) % 10000;
    showResults('meeting', a, card, { source: 'upload' });
  } catch (e) {
    meet.running = false;
    if (meet.cancelled) return;
    $('meeting-pick').hidden = false; $('meeting-run').hidden = true;
    $('m-error').textContent = e.message || 'Something went wrong with that file. Try another one.';
  } finally { meet.running = false; }
}

// ---------------- live (microphone) ----------------
const live = { card: null, mic: null, running: false, flushing: false, text: '', t0: 0, elapsed: 0, timer: null, pending: null };
const liveSecs = () => live.elapsed + (live.running ? (performance.now() - live.t0) / 1000 : 0);
function newLiveCard() {
  const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
  live.card = liveCard(seed); live.card.no = seed % 10000; live.text = ''; live.elapsed = 0;
  $('l-end').hidden = true; $('l-start').textContent = 'Start listening';
  renderCard($('live-card'), live.card, { paper: MODE.live.paper });
  $('l-points').textContent = '0'; $('l-count').textContent = '0'; $('l-time').textContent = '0:00'; $('l-ticker').innerHTML = '';
}
$('l-new').addEventListener('click', () => { if (!live.running) { newLiveCard(); sfx.deal(); } });
$('l-start').addEventListener('click', () => (live.running ? stopLive(false) : startLive()));
$('l-end').addEventListener('click', () => (live.running ? stopLive(true) : finishLive()));
const liveStatus = (t) => { $('l-status').textContent = t; };
async function startLive() {
  $('l-error').textContent = ''; audioCtx();
  const size = document.querySelector('input[name="l-size"]:checked').value;
  const btn = $('l-start'); btn.disabled = true;
  try {
    liveStatus('Loading the speech model. First time only.');
    const t = getTranscriber();
    t.onDownload = (l, tot) => liveStatus('Downloading the speech model: ' + Math.round(l / 1e6) + ' of ' + Math.round(tot / 1e6) + ' MB. First time only.');
    const info = await t.load(size);
    liveStatus('Asking for the microphone');
    live.mic = new Microphone((lv) => { $('l-level').style.width = Math.round(lv * 100) + '%'; });
    await live.mic.start();
    live.running = true; live.t0 = performance.now();
    btn.disabled = false; btn.classList.add('listening'); btn.innerHTML = '<span class="rec" aria-hidden="true"></span>Pause';
    $('l-end').hidden = false; $('l-new').disabled = true;
    document.querySelectorAll('input[name="l-size"]').forEach((i) => { i.disabled = true; });
    liveStatus('Listening ' + (info.device === 'webgpu' ? 'on your graphics chip' : 'on your processor') + '. Words show up a few seconds after they are said.');
    live.timer = setInterval(() => { $('l-time').textContent = fmtTime(liveSecs()); }, 500);
    sfx.deal();
    liveLoop(t);
  } catch (e) {
    btn.disabled = false; live.running = false;
    if (live.mic) live.mic.stop();
    const msg = e && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? 'Microphone access is blocked. Allow it in the address bar, then press Start listening again.' : e && e.name === 'NotFoundError' ? 'No microphone was found.' : (e && e.message) || 'Listening could not start.';
    $('l-error').textContent = msg; liveStatus('Press start and allow the microphone.');
  }
}
const HALLUCINATIONS = /^(?:thank you\.?|thanks\.?|you\.?|bye\.?|thanks for watching[.!]?|\.+)$/i;
async function liveLoop(t) {
  const gen = (live.gen = (live.gen || 0) + 1);
  while (live.running && live.gen === gen) {
    const chunk = live.mic.take(5, 28);
    if (!chunk) { await sleep(250); continue; }
    if (rms(chunk) < 0.004) continue;
    live.pending = t.transcribe(chunk);
    let res; try { res = await live.pending; } catch (e) { $('l-error').textContent = e.message; continue; } finally { live.pending = null; }
    ingestLive(res.text);
  }
}
function ingestLive(raw) {
  if (!live.card) return;
  const clean = cleanTranscript(raw);
  if (!clean || HALLUCINATIONS.test(clean)) return;
  const before = live.text.length;
  live.text += (live.text ? ' ' : '') + clean;
  const a = analyze(live.text);
  const { fresh, newLines } = daubCard(live.card, a);
  renderCard($('live-card'), live.card, { fresh, paper: MODE.live.paper, newLine: newLines > 0 });
  fresh.forEach((i, k) => setTimeout(() => sfx.dab(k), k * 90));
  $('l-points').textContent = a.points; $('l-count').textContent = a.count;
  const tk = $('l-ticker'); const start = Math.max(0, before - 300);
  tk.innerHTML = (start > 0 ? '… ' : '') + highlight(live.text, a.hits, start); tk.scrollTop = tk.scrollHeight;
  if (newLines > 0) burst(live.card.blackout ? 'Blackout!' : 'Bingo!', live.card.blackout ? 'Every square. This meeting needs an intervention.' : live.card.winning.length > 1 ? live.card.winning.length + ' lines and counting.' : 'Five in a row on ' + lineName(live.card.winning[live.card.winning.length - 1]) + '. Try not to shout it.');
}
function burst(big, sub) { const b = $('l-burst'); b.querySelector('b').textContent = big; $('l-burst-sub').textContent = sub; b.hidden = false; sfx.bingo(); confetti(); if (navigator.vibrate) navigator.vibrate([120, 60, 120]); setTimeout(() => { b.hidden = true; }, 2600); }
$('l-burst').addEventListener('click', () => { $('l-burst').hidden = true; });
async function stopLive(showRes) {
  if (!live.running) return;
  live.elapsed = liveSecs(); live.running = false; live.flushing = true;
  clearInterval(live.timer);
  const btn = $('l-start'); btn.classList.remove('listening'); btn.textContent = 'Keep listening'; btn.disabled = true;
  $('l-level').style.width = '0%';
  const last = live.mic ? live.mic.take(1, 28, true) : null;
  if (live.mic) { live.mic.stop(); live.mic = null; }
  // Let the chunk that's already being transcribed land, then do the last few seconds.
  if (live.pending) { liveStatus('Catching up on the last few seconds'); try { await live.pending; } catch (e) { /* keep what we have */ } }
  if (last && last.length > 16000 && rms(last) >= 0.004 && transcriber) {
    liveStatus('Catching up on the last few seconds');
    try { const res = await transcriber.transcribe(last); ingestLive(res.text); } catch (e) { /* keep what we have */ }
  }
  live.flushing = false; btn.disabled = false; $('l-new').disabled = false;
  document.querySelectorAll('input[name="l-size"]').forEach((i) => { i.disabled = false; });
  $('l-end').hidden = false;
  liveStatus('Paused. Press Keep listening to carry on with this card, or End the meeting to score it.');
  if (showRes) finishLive();
}
function finishLive() {
  if (live.running || live.flushing || !live.card) return;
  const a = analyze(live.text, { durationSec: live.elapsed });
  const card = live.card; live.card = null;
  $('l-end').hidden = true; $('l-start').textContent = 'Start listening';
  liveStatus('Press start and allow the microphone.');
  showResults('live', a, card, { source: 'live' });
}

// ---------------- confetti: paper dots ----------------
function confetti() {
  if (reduced) return;
  const box = document.createElement('div'); box.className = 'confetti';
  const colors = ['#ffe35a', '#ffb3c8', '#a8dcff', '#b9f0c9', '#e0187a'];
  for (let i = 0; i < 60; i++) { const p = document.createElement('i'); p.style.left = Math.random() * 100 + '%'; p.style.background = colors[i % colors.length]; p.style.animationDuration = 1.6 + Math.random() * 1.6 + 's'; p.style.animationDelay = Math.random() * 0.4 + 's'; box.appendChild(p); }
  document.body.appendChild(box); setTimeout(() => box.remove(), 3800);
}

// ---------------- boot ----------------
route();
window.__bb = { analyze, R, live, ingestLive, LINES };
