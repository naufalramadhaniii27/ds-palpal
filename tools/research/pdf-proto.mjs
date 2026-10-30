// Research prototype N80 (2026-10-30): vector PDF writer, text stays text. No library. Not wired into the app.
// Usage: node pdf-proto.mjs dump.json out.pdf   (dump.json = {c: sheet object, d: derive() output}, see tools/research/dump.py in the notes)
// Fonts: PDF base-14 Helvetica and Helvetica-Bold (no embedding). Widths come from the standard metrics (helv-widths.json).
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const W = JSON.parse(fs.readFileSync(path.join(here, "helv-widths.json"), "utf8"));
const width = (s, size, bold) => { const t = W[bold ? "Helvetica-Bold" : "Helvetica"]; let w = 0; for (const ch of s) { const c = ch.charCodeAt(0); w += (c >= 32 && c < 127 ? t[c - 32] : 556); } return w * size / 1000; };
const clean = (s) => String(s ?? "").replace(/\[\[([^\]]*)\]\]/g, "$1").replace(/\*\*/g, "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/[^\x20-\x7e]/g, "?");
const esc = (s) => clean(s).replace(/[\\()]/g, (m) => "\\" + m);

class Page {
  constructor() { this.ops = []; }
  text(x, y, s, size = 10, bold = false, gray = 0) { this.ops.push(`${gray} g BT /F${bold ? 2 : 1} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${esc(s)}) Tj ET`); }
  rect(x, y, w, h, lw = 0.8) { this.ops.push(`${lw} w ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`); }
  line(x1, y1, x2, y2, lw = 0.5) { this.ops.push(`${lw} w ${x1} ${y1} m ${x2} ${y2} l S`); }
  wrap(x, y, maxW, s, size = 9, bold = false, lead = 11.5) { const words = clean(s).split(/\s+/); let line = ""; let n = 0;
    for (const w of words) { const t = line ? line + " " + w : w; if (width(t, size, bold) > maxW && line) { this.text(x, y - n * lead, line, size, bold); n++; line = w; } else line = t; }
    if (line) { this.text(x, y - n * lead, line, size, bold); n++; } return n; }
}
function build(pages) {
  const objs = []; const add = (s) => { objs.push(s); return objs.length; };
  add("<< /Type /Catalog /Pages 2 0 R >>"); add(""); // 2 filled later
  const f1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const f2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const kids = [];
  for (const p of pages) {
    const data = zlib.deflateSync(Buffer.from(p.ops.join("\n"), "latin1"));
    const cid = add({ stream: data, dict: "/Filter /FlateDecode" });
    const pid = add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${cid} 0 R >>`);
    kids.push(pid + " 0 R");
  }
  objs[1] = `<< /Type /Pages /Count ${kids.length} /Kids [${kids.join(" ")}] >>`;
  const out = [Buffer.from("%PDF-1.4\n")]; const off = []; let pos = out[0].length;
  objs.forEach((o, i) => { off.push(pos);
    const head = Buffer.from(`${i + 1} 0 obj\n`);
    const body = typeof o === "string" ? Buffer.from(o + "\n") : Buffer.concat([Buffer.from(`<< /Length ${o.stream.length} ${o.dict} >>\nstream\n`), o.stream, Buffer.from("\nendstream\n")]);
    const tail = Buffer.from("endobj\n"); const b = Buffer.concat([head, body, tail]); out.push(b); pos += b.length; });
  const xref = off.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("");
  out.push(Buffer.from(`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${xref}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${pos}\n%%EOF\n`));
  return Buffer.concat(out);
}
export function sheetPdf({ c, d }) {
  const p1 = new Page(); const M = 40; let y = 800;
  p1.text(M, y, c.name || "Unnamed", 22, true); y -= 18;
  p1.text(M, y, [c.species, c.cls, c.sub].filter(Boolean).join(" / ") + "   Level " + d.level, 11, false, 0.3); y -= 14;
  p1.line(M, y, 555, y, 1); y -= 34;
  const stats = [["AC", d.ac], ["HP max", d.hpmax], ["Initiative", (d.init >= 0 ? "+" : "") + d.init], ["Speed", d.speed + " ft"], ["Prof. bonus", "+" + d.pb]];
  stats.forEach(([k, v], i) => { const x = M + i * 103; p1.rect(x, y - 6, 94, 40); p1.text(x + 6, y + 20, k, 8, false, 0.35); p1.text(x + 6, y + 2, String(v), 15, true); });
  y -= 30;
  const AB = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  AB.forEach((k, i) => { const x = M + i * 86; p1.rect(x, y - 52, 80, 62); p1.text(x + 6, y + 2, k, 9, true); p1.text(x + 6, y - 20, String(d.score[k]), 18, true);
    p1.text(x + 6, y - 36, "mod " + (d.mod[k] >= 0 ? "+" : "") + d.mod[k], 8.5); p1.text(x + 6, y - 47, "save " + (d.save[k] >= 0 ? "+" : "") + d.save[k], 8.5); });
  y -= 80;
  p1.text(M, y, "Skills", 12, true); p1.text(300, y, "Attacks", 12, true); y -= 14;
  const sk = c.skills || []; let ys = y;
  sk.forEach((s, i) => { const v = d.skill[i]; p1.text(M + 8, ys, (s.p ? (s.p === 2 ? "** " : "*  ") : "   ") + s.n, 9); p1.text(M + 190, ys, (v >= 0 ? "+" : "") + v, 9, !!s.p); ys -= 12.5; });
  let ya = y; (c.attacks || []).forEach((a, i) => { const t = d.atk[i]; if (!t) return;
    p1.text(300, ya, a.n, 9.5, true); p1.text(470, ya, "+" + t.hit + "  " + t.dmg, 9.5); ya -= 11.5;
    const n = p1.wrap(300, ya, 255, [a.sub, a.type, a.range].filter(Boolean).join(", "), 8, false, 10); ya -= n * 10 + 5; });
  p1.text(M, 40, "* proficient   ** expertise   Vector prototype: text in this file can be selected and searched.", 7.5, false, 0.4);
  const p2 = new Page(); y = 800; p2.text(M, y, "Features", 14, true); y -= 20;
  for (const g of c.features || []) { if (y < 80) break; p2.text(M, y, g.g, 10.5, true); y -= 13;
    for (const it of g.items || []) { if (y < 80) break; const n = p2.wrap(M + 8, y, 500, it.n + ": " + (it.d || ""), 8.5, false, 10.5); y -= n * 10.5 + 3; } y -= 4; }
  const p3 = new Page(); y = 800; p3.text(M, y, "Inventory", 14, true); y -= 20;
  for (const it of c.inv || []) { if (y < 60) break; p3.text(M + 8, y, (it.q > 1 ? it.q + "x " : "") + it.n + (it.eq ? "  [equipped]" : ""), 9); y -= 12; }
  return build([p1, p2, p3]);
}
if (process.argv[2] && process.argv[3]) {
  const t0 = performance.now(); const pdf = sheetPdf(JSON.parse(fs.readFileSync(process.argv[2], "utf8"))); const ms = performance.now() - t0;
  fs.writeFileSync(process.argv[3], pdf); console.log(`wrote ${process.argv[3]}: ${pdf.length} bytes in ${ms.toFixed(1)} ms`);
}
