/**
 * Buzzword Bingo: speech to text worker.
 * Runs Whisper with Transformers.js off the main thread, so the page never freezes.
 *
 * Model choices, measured in a real browser (Transformers.js 3.8.1):
 *   Quick:          whisper-tiny.en, WebAssembly, 8 bit. About 43MB. Roughly 1.5s per 30s of audio on a recent laptop.
 *   More accurate:  whisper-base.en. On WebGPU: full precision encoder plus 4 bit decoder, about 210MB, roughly 1s per 30s.
 *                   Without WebGPU: WebAssembly, 8 bit, about 80MB, roughly 3s per 30s.
 * Don't use the 8 bit decoder on WebGPU: it loads fine and then transcribes gibberish.
 *
 * Messages in:  { type: 'load', size: 'tiny' | 'base' }
 *               { type: 'transcribe', id, audio: Float32Array (16 kHz mono) }
 * Messages out: { type: 'download', loaded, total }
 *               { type: 'ready', device, model }
 *               { type: 'text', id, text, ms }
 *               { type: 'error', id?, message }
 */
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODELS = { tiny: 'Xenova/whisper-tiny.en', base: 'Xenova/whisper-base.en' };
const WASM = { device: 'wasm', dtype: 'q8' };
const GPU = { device: 'webgpu', dtype: { encoder_model: 'fp32', decoder_model_merged: 'q4' } };

let asr = null;
let current = null;

async function hasWebGPU() {
  try { return !!(self.navigator && navigator.gpu && (await navigator.gpu.requestAdapter())); } catch (e) { return false; }
}

async function drop() {
  const old = asr; asr = null; current = null;
  if (old && old.dispose) { try { await old.dispose(); } catch (e) { /* already gone */ } }
}

async function load(size, forceWasm = false) {
  const model = MODELS[size] || MODELS.tiny;
  if (asr && current && current.model === model && !(forceWasm && current.device !== 'wasm')) { self.postMessage({ type: 'ready', ...current }); return; }
  await drop();
  const files = new Map();
  const progress_callback = (p) => {
    if (p.status !== 'progress' || !p.total) return;
    files.set(p.file, { loaded: p.loaded, total: p.total });
    let loaded = 0, total = 0;
    files.forEach((f) => { loaded += f.loaded; total += f.total; });
    self.postMessage({ type: 'download', loaded, total });
  };
  if (size === 'base' && !forceWasm && (await hasWebGPU())) {
    try {
      asr = await pipeline('automatic-speech-recognition', model, { ...GPU, progress_callback });
      current = { device: 'webgpu', model, size };
    } catch (e) { await drop(); }
  }
  if (!asr) {
    files.clear();
    asr = await pipeline('automatic-speech-recognition', model, { ...WASM, progress_callback });
    current = { device: 'wasm', model, size };
  }
  self.postMessage({ type: 'ready', ...current });
}

async function transcribe(msg) {
  if (!asr) await load('tiny');
  const t0 = performance.now();
  let out;
  try { out = await asr(msg.audio); } catch (e) {
    // A graphics chip can drop out mid meeting (sleep, driver reset). Carry on with WebAssembly.
    if (!current || current.device !== 'webgpu') throw e;
    await load(current.size, true);
    out = await asr(msg.audio);
  }
  const text = Array.isArray(out) ? out.map((o) => o.text).join(' ') : (out && out.text) || '';
  self.postMessage({ type: 'text', id: msg.id, text, ms: Math.round(performance.now() - t0) });
}

// One job at a time. Running the same model twice at once can fail, and a transcribe that arrives
// while the model is still loading has to wait for it rather than start a second download.
let queue = Promise.resolve();
self.onmessage = (e) => {
  const msg = e.data;
  queue = queue.then(async () => {
    try {
      if (msg.type === 'load') await load(msg.size);
      else if (msg.type === 'transcribe') await transcribe(msg);
    } catch (err) {
      self.postMessage({ type: 'error', id: msg.id, message: (err && err.message) || String(err) });
    }
  });
};
