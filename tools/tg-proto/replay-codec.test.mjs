import assert from "node:assert/strict";
import { encodeReplay, decodeReplay } from "./replay-codec.mjs";

let s = 12345;
const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
const ri = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

let maxLen = 0, sample = 0;
for (let t = 0; t < 2000; t++) {
  const n = ri(0, 400);
  const ev = [];
  for (let i = 0; i < n; i++) {
    ev.push({ k: ri(0, 12), a: ri(0, 30), b: rnd() < 0.5 ? ri(0, 30) : 0, x: ri(0, 19), y: ri(0, 19), v: rnd() < 0.6 ? ri(-60, 60) : 0 });
  }
  const seed = Math.floor(rnd() * 4294967296);
  const txt = encodeReplay(seed, ev);
  const back = decodeReplay(txt);
  assert.equal(back.seed, seed);
  assert.deepEqual(back.events, ev);
  if (n === 300) sample = txt.length;
  maxLen = Math.max(maxLen, txt.length);
}
// bad input must throw, not hang
assert.throws(() => decodeReplay("AAAA"));
assert.throws(() => encodeReplay(1, [{ k: 1, v: 1.5 }]));
// realistic 300-event fight, measured
const ev = [];
for (let i = 0; i < 300; i++) ev.push({ k: i % 5, a: i % 8, b: (i * 3) % 8, x: (i * 7) % 20, y: (i * 11) % 20, v: i % 3 ? (i % 17) - 4 : 0 });
const len = encodeReplay(99, ev).length;
console.log("ok: 2000 random logs round-trip. longest link", maxLen, "chars. 300-event sample", len, "chars");
assert.ok(len < 1500, "link too long: " + len);
