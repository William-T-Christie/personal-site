/**
 * Buzzword Bingo: audio in.
 * decodeFile: any audio or video file the browser can play becomes 16 kHz mono samples (what Whisper wants).
 * Microphone: live capture, resampled to 16 kHz, handed out in chunks cut at quiet moments.
 * Transcriber: a small promise wrapper around the Whisper worker.
 */

export const RATE = 16000;

export function resample(input, from, to) {
  if (from === to) return input;
  const ratio = from / to;
  const out = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const x = i * ratio; const j = Math.floor(x); const f = x - j;
    out[i] = input[j] * (1 - f) + (input[j + 1] !== undefined ? input[j + 1] : input[j]) * f;
  }
  return out;
}

export function rms(a, start = 0, end = a.length) {
  let s = 0; const n = Math.max(1, end - start);
  for (let i = start; i < end; i++) s += a[i] * a[i];
  return Math.sqrt(s / n);
}

/** Decode a recording with the browser's own decoder. No 30MB FFmpeg download needed. */
export async function decodeFile(file) {
  const buf = await file.arrayBuffer();
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) throw new Error('This browser cannot process audio.');
  let ctx;
  try { ctx = new Ctx({ sampleRate: RATE }); } catch (e) { ctx = new Ctx(); }
  let decoded;
  try {
    decoded = await new Promise((res, rej) => { const p = ctx.decodeAudioData(buf, res, rej); if (p && p.then) p.then(res, rej); });
  } catch (e) {
    throw new Error("This browser can't read the audio in that file. Try MP3, M4A, WAV, WebM or MP4, or export just the audio.");
  } finally { if (ctx.close) ctx.close(); }
  const n = decoded.length; const ch = decoded.numberOfChannels;
  let mono = new Float32Array(n);
  for (let c = 0; c < ch; c++) { const d = decoded.getChannelData(c); for (let i = 0; i < n; i++) mono[i] += d[i] / ch; }
  mono = resample(mono, decoded.sampleRate, RATE);
  return { audio: mono, duration: decoded.duration };
}

/** Split long audio into Whisper sized windows (30 seconds), cutting at the quietest moment near each boundary. */
export function windows(audio, maxSec = 29) {
  const out = []; const max = maxSec * RATE; const look = 2 * RATE; const step = RATE / 10;
  let start = 0;
  while (start < audio.length) {
    let end = Math.min(audio.length, start + max);
    if (end < audio.length) {
      let best = end, bestE = Infinity;
      for (let p = end - look; p <= end - step; p += step) { const e = rms(audio, p, p + step); if (e < bestE) { bestE = e; best = p + step / 2; } }
      end = Math.floor(best);
    }
    out.push({ start, end });
    start = end;
  }
  return out;
}

/** Whisper sometimes "hears" things in silence. Strip the usual suspects. */
export function cleanTranscript(t) {
  return t
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\((?:music|applause|laughter|laughs|silence|inaudible|background noise|upbeat music)[^)]*\)/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export class Transcriber {
  constructor(url = new URL('./whisper.worker.js', import.meta.url)) {
    this.worker = new Worker(url, { type: 'module' });
    this.jobs = new Map(); this.seq = 0; this.ready = null; this.device = null;
    this.onDownload = null;
    this.worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'download' && this.onDownload) this.onDownload(m.loaded, m.total);
      else if (m.type === 'ready') { if (m.size === this.size) { this.device = m.device; if (this._ready) this._ready.res(m); } }
      else if (m.type === 'text') { const j = this.jobs.get(m.id); if (j) { this.jobs.delete(m.id); j.res(m); } }
      else if (m.type === 'error') {
        const err = new Error(friendlyModelError(m.message));
        if (m.id != null && this.jobs.has(m.id)) { this.jobs.get(m.id).rej(err); this.jobs.delete(m.id); }
        else if (this._ready) this._ready.rej(err);
      }
    };
    this.worker.onerror = (e) => {
      const err = new Error(friendlyModelError(e.message || 'The speech model could not start.'));
      if (this._ready) this._ready.rej(err);
      this.jobs.forEach((j) => j.rej(err)); this.jobs.clear();
    };
  }
  load(size) {
    if (this.ready && this.size === size) return this.ready;
    this.size = size;
    this.ready = new Promise((res, rej) => { this._ready = { res, rej }; });
    this.ready.catch(() => { this.ready = null; });
    this.worker.postMessage({ type: 'load', size });
    return this.ready;
  }
  transcribe(audio) {
    const id = ++this.seq;
    return new Promise((res, rej) => { this.jobs.set(id, { res, rej }); this.worker.postMessage({ type: 'transcribe', id, audio }, [audio.buffer]); });
  }
  terminate() { this.worker.terminate(); }
}

function friendlyModelError(msg) {
  if (/fetch|network|Failed to load|CORS|404/i.test(msg)) return "Couldn't download the speech model. Check your connection and try again. (It's a big download the first time, then your browser keeps it.)";
  if (/memory|allocation/i.test(msg)) return 'The browser ran out of memory. Try a shorter recording, or close some tabs.';
  return 'The speech model hit a problem: ' + msg;
}

/** Live microphone capture. Call take() whenever you're ready for the next chunk. */
export class Microphone {
  constructor(onLevel) { this.onLevel = onLevel; this.buf = []; this.len = 0; }
  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('This browser does not allow microphone access.');
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
    const Ctx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new Ctx();
    const src = this.ctx.createMediaStreamSource(this.stream);
    const push = (frame) => {
      const s = resample(frame, this.ctx.sampleRate, RATE);
      this.buf.push(s); this.len += s.length;
      if (this.onLevel) this.onLevel(Math.min(1, rms(frame) * 6));
    };
    try {
      const code = 'class P extends AudioWorkletProcessor{process(i){const c=i[0]&&i[0][0];if(c)this.port.postMessage(c.slice(0));return true}}registerProcessor("bb-tap",P)';
      const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
      await this.ctx.audioWorklet.addModule(url);
      this.node = new AudioWorkletNode(this.ctx, 'bb-tap');
      let acc = []; let n = 0;
      this.node.port.onmessage = (e) => { acc.push(e.data); n += e.data.length; if (n >= 2048) { push(concat(acc, n)); acc = []; n = 0; } };
      src.connect(this.node);
    } catch (e) {
      this.node = this.ctx.createScriptProcessor(4096, 1, 1);
      this.node.onaudioprocess = (ev) => push(ev.inputBuffer.getChannelData(0).slice(0));
      src.connect(this.node); this.node.connect(this.ctx.destination);
    }
    this.started = performance.now();
  }
  seconds() { return this.len / RATE; }
  /** Take buffered audio once there's at least minSec, cut at a quiet moment. */
  take(minSec = 5, maxSec = 28, force = false) {
    if (!force && this.len < minSec * RATE) return null;
    if (!this.len) return null;
    const all = concat(this.buf, this.len);
    let end = Math.min(all.length, maxSec * RATE);
    if (!force && end === all.length && all.length > 2 * RATE) {
      const step = RATE / 10; let best = end, bestE = Infinity;
      for (let p = Math.max(0, end - 1.5 * RATE); p <= end - step; p += step) { const e = rms(all, p, p + step); if (e < bestE) { bestE = e; best = p + step; } }
      end = Math.floor(best);
    }
    const chunk = all.slice(0, end); const rest = all.slice(end);
    this.buf = rest.length ? [rest] : []; this.len = rest.length;
    return chunk;
  }
  stop() {
    try { if (this.node) this.node.disconnect(); } catch (e) { /* already gone */ }
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    if (this.ctx && this.ctx.close) this.ctx.close();
  }
}

function concat(parts, n) { const out = new Float32Array(n); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out; }

/** Read text out of .txt, .md, .docx and .pdf files. The two parsers load only when needed. */
const loaded = {};
function loadScript(src) { if (loaded[src]) return loaded[src]; loaded[src] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('load')); document.head.appendChild(s); }); return loaded[src]; }
export async function readTextFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.txt') || name.endsWith('.md') || file.type === 'text/plain') return file.text();
  if (name.endsWith('.docx')) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
    return (await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
  }
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    const lib = window.pdfjsLib;
    lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const pdf = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages = [];
    for (let p = 1; p <= Math.min(pdf.numPages, 10); p++) {
      const tc = await (await pdf.getPage(p)).getTextContent();
      let line = ''; const out = [];
      tc.items.forEach((it) => { line += it.str; if (it.hasEOL) { out.push(line); line = ''; } });
      if (line) out.push(line);
      pages.push(out.join('\n'));
    }
    return pages.join('\n\n');
  }
  if (name.endsWith('.doc')) throw new Error('Old .doc files are not supported. Save it as .docx or .pdf, or paste the text.');
  throw new Error('That file type is not supported. Use .txt, .md, .docx or .pdf, or paste the text.');
}
