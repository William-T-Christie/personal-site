/**
 * Buzzword Bingo: scoring engine.
 * Pure functions, no DOM. Everything here can run in Node for tests.
 */
import { DICT, RANKS } from './dictionary.js';

/** How hard the Corporate Speak Index climbs per weighted point per 100 words. */
const INDEX_SCALE = 4;

export const countWords = (text) => (text.match(/[A-Za-z0-9$][\w$'’.,+-]*/g) || []).length;

/** Find every buzzword, longest match wins when two overlap. */
export function findHits(text) {
  const found = [];
  for (const d of DICT) {
    d.re.lastIndex = 0;
    let m;
    while ((m = d.re.exec(text))) {
      if (!m[0]) { d.re.lastIndex++; continue; }
      found.push({ s: m.index, e: m.index + m[0].length, d, t: m[0] });
    }
  }
  found.sort((a, b) => a.s - b.s || (b.e - b.s) - (a.e - a.s) || b.d.points - a.d.points);
  const hits = [];
  let end = -1;
  for (const f of found) if (f.s >= end) { hits.push(f); end = f.e; }
  return hits;
}

export function rankFor(index) {
  let r = RANKS[0];
  for (const x of RANKS) if (index >= x.min) r = x;
  return r;
}

/**
 * Analyze a block of text.
 * @param {string} text
 * @param {{ durationSec?: number }} opts
 */
export function analyze(text, opts = {}) {
  const hits = findHits(text);
  const words = countWords(text);
  const byEntry = new Map();
  let points = 0;
  for (const h of hits) {
    points += h.d.points;
    const row = byEntry.get(h.d.id) || { d: h.d, count: 0, first: h.t };
    row.count++;
    byEntry.set(h.d.id, row);
  }
  const breakdown = [...byEntry.values()].sort((a, b) => b.count * b.d.points - a.count * a.d.points || b.count - a.count);
  const worst = [...byEntry.values()].sort((a, b) => b.count - a.count || b.d.points - a.d.points)[0] || null;
  const per100 = words ? (points / words) * 100 : 0;
  const index = Math.min(100, Math.round(per100 * INDEX_SCALE));
  const minutes = opts.durationSec ? opts.durationSec / 60 : 0;
  return {
    text,
    hits,
    words,
    points,
    count: hits.length,
    unique: byEntry.size,
    density: words ? hits.length / words : 0,
    index,
    rank: rankFor(index),
    breakdown,
    worst,
    perMinute: minutes > 0.2 ? hits.length / minutes : null,
    durationSec: opts.durationSec || null
  };
}

/** Rewrite text with every buzzword swapped for its plain English meaning. */
export function plainEnglish(text, hits) {
  let out = '';
  let p = 0;
  for (const h of hits) {
    const rep = h.d.plain;
    const first = h.t[0];
    const cap = first && first === first.toUpperCase() && first !== first.toLowerCase();
    out += text.slice(p, h.s) + (cap ? rep[0].toUpperCase() + rep.slice(1) : rep);
    p = h.e;
  }
  return out + text.slice(p);
}

// ---------- bingo cards ----------
export function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function rng(seed) { let a = seed || 1; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function shuffle(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

export const LINES = (() => {
  const L = [];
  for (let i = 0; i < 5; i++) { L.push([0, 1, 2, 3, 4].map((j) => i * 5 + j)); L.push([0, 1, 2, 3, 4].map((j) => j * 5 + i)); }
  L.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
  return L;
})();

/** A card for text you already have: found buzzwords go on first, the rest is filler. Seeded so the same text gives the same card. */
export function cardFromAnalysis(a, mode) {
  const r = rng(hash(a.text) ^ (mode === 'resume' ? 7 : 3));
  const foundIds = new Set(a.breakdown.map((b) => b.d.id));
  const found = shuffle(a.breakdown.map((b) => b.d), r).slice(0, 24);
  const pool = DICT.filter((d) => !foundIds.has(d.id) && (mode === 'resume' ? (d.resume || d.meeting) : d.meeting));
  const fill = shuffle(pool, r).slice(0, 24 - found.length);
  const cells = shuffle(found.concat(fill), r).map((d) => ({ d, hit: foundIds.has(d.id) }));
  cells.splice(12, 0, { free: true, hit: true });
  return withLines(cells);
}

/** A classic card for a live meeting: 24 random meeting phrases, weighted toward the ones people actually say. */
export function liveCard(seed) {
  const r = rng(seed);
  const pool = DICT.filter((d) => d.meeting);
  const common = shuffle(pool.filter((d) => d.tier <= 2), r).slice(0, 17);
  const spicy = shuffle(pool.filter((d) => d.tier >= 3), r).slice(0, 7);
  const cells = shuffle(common.concat(spicy), r).map((d) => ({ d, hit: false }));
  cells.splice(12, 0, { free: true, hit: true });
  return withLines(cells);
}

export function withLines(cells) {
  const winning = LINES.filter((l) => l.every((k) => cells[k].hit));
  return { cells, winning, bingo: winning.length > 0, blackout: cells.every((c) => c.hit), daubed: cells.filter((c) => c.hit && !c.free).length };
}

/** Mark cells hit by a fresh analysis (live mode). Returns indexes that just got daubed. */
export function daubCard(card, analysis) {
  const ids = new Set(analysis.breakdown.map((b) => b.d.id));
  const fresh = [];
  card.cells.forEach((c, i) => { if (!c.free && !c.hit && ids.has(c.d.id)) { c.hit = true; fresh.push(i); } });
  const before = card.winning.length;
  Object.assign(card, withLines(card.cells));
  return { fresh, newLines: card.winning.length - before };
}

/** A shareable one paragraph summary. */
export function summary(a, mode, card) {
  const label = { meeting: 'meeting', live: 'live meeting', resume: 'resume', text: 'text' }[mode] || 'text';
  const top = a.worst ? ` Most used: "${a.worst.first.toLowerCase()}" ×${a.worst.count}.` : '';
  return `I scored ${a.points} points on Buzzword Bingo with my ${label}. Corporate Speak Index ${a.index}/100: ${a.rank.title}. ${a.count} buzzwords in ${a.words} words.${top}${card && card.bingo ? ' BINGO.' : ''}`;
}
