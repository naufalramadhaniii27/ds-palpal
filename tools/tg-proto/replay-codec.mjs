// Replay codec: seed + event log -> short base64url text, and back.
// Format: [ver=1][seed u32][count varint] then per event: [kind][mask][zigzag varints for set fields a,b,x,y,v]
// Whole buffer is gzip-compressed (same gzip works with browser CompressionStream and Node zlib).
import { gzipSync, gunzipSync } from "node:zlib";

const FIELDS = ["a", "b", "x", "y", "v"];

function putVar(out, n) {
  let u = n >>> 0 === n ? n : Math.abs(n);
  while (u >= 0x80) { out.push((u % 0x80) | 0x80); u = Math.floor(u / 0x80); }
  out.push(u);
}
const zig = (n) => (n < 0 ? -2 * n - 1 : 2 * n);
const unzig = (u) => (u % 2 ? -(u + 1) / 2 : u / 2);
function getVar(buf, pos) {
  let r = 0, mul = 1, b;
  do {
    if (pos.i >= buf.length) throw new Error("replay: truncated");
    b = buf[pos.i++];
    r += (b & 0x7f) * mul; mul *= 0x80;
  } while (b & 0x80);
  return r;
}

export function encodeReplay(seed, events) {
  const out = [1, seed >>> 24 & 255, seed >>> 16 & 255, seed >>> 8 & 255, seed & 255];
  putVar(out, events.length);
  for (const e of events) {
    if (!Number.isInteger(e.k) || e.k < 0 || e.k > 255) throw new Error("replay: bad kind");
    let mask = 0;
    FIELDS.forEach((f, i) => { if (e[f]) mask |= 1 << i; });
    out.push(e.k, mask);
    FIELDS.forEach((f, i) => {
      if (mask & (1 << i)) {
        if (!Number.isInteger(e[f])) throw new Error("replay: non-integer " + f);
        putVar(out, zig(e[f]));
      }
    });
  }
  return gzipSync(Buffer.from(out), { level: 9 }).toString("base64url");
}

export function decodeReplay(text) {
  const buf = gunzipSync(Buffer.from(text, "base64url"));
  if (buf[0] !== 1) throw new Error("replay: unknown version");
  const seed = ((buf[1] << 24) | (buf[2] << 16) | (buf[3] << 8) | buf[4]) >>> 0;
  const pos = { i: 5 };
  const n = getVar(buf, pos);
  const events = [];
  for (let j = 0; j < n; j++) {
    const k = buf[pos.i++], mask = buf[pos.i++];
    const e = { k };
    FIELDS.forEach((f, i) => { e[f] = mask & (1 << i) ? unzig(getVar(buf, pos)) : 0; });
    events.push(e);
  }
  if (pos.i !== buf.length) throw new Error("replay: trailing bytes");
  return { seed, events };
}
