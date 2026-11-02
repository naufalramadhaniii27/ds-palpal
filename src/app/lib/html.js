// @ts-check
/* N44 tagged templates. html`<b>${name}</b>` keeps the fixed part of the markup apart from the values:
   a value in text becomes a text node, a value in an attribute is set with setAttribute, so nothing a value holds can become markup.
   raw(str) marks a string that is trusted markup (icons from the ICO table, a fragment that an older function still returns as a string). Lint counts raw().
   render(html`...`, el) draws into el. The next call with the same template (same call site) only changes the values that changed.
   Holes:  text  ${v}  string, number, null (nothing), a template, an array of those, raw(...)
           attribute value  class="a ${b}"  any value, written as a string
           attribute list  <input ${' checked'}>  a string of ` name="value"` pairs (names are checked)
   on* attributes and javascript: addresses are refused. */
const SAFE_URL = /^\s*(?:javascript|vbscript|data\s*:\s*text\/html)/i, URL_ATTR = /^(?:href|src|action|formaction|xlink:href|poster|data)$/i, PAIR = /\s*([A-Za-z_:][-\w:.]*)(?:\s*=\s*"([^"]*)")?/y;
class Raw { constructor(s) { this.s = s; } }
/** @param {any} s */ export const raw = s => new Raw(s == null ? "" : String(s));
/** @param {TemplateStringsArray} s @param {...any} v */ export const html = (s, ...v) => ({ s, v });
/** @type {WeakMap<TemplateStringsArray, any>} */ const PREP = new WeakMap();
/* which kind of hole is after this piece of markup: "text", "attr" (inside a quoted value), "list" (inside a tag, between attributes), "area" (inside a textarea) */
function scan(strs) {
  const kinds = []; let tag = false, q = "", area = false;
  for (let i = 0; i < strs.length - 1; i++) {
    const t = strs[i];
    for (let j = 0; j < t.length; j++) {
      const c = t[j];
      if (tag) { if (q) { if (c === q) q = ""; } else if (c === '"' || c === "'") q = c; else if (c === ">") tag = false; }
      else if (c === "<") { if (/^<textarea[\s>]/i.test(t.slice(j, j + 10))) area = true; else if (/^<\/textarea/i.test(t.slice(j, j + 11))) area = false; if (/^<[A-Za-z!/]/.test(t.slice(j, j + 2))) tag = !/^<!--/.test(t.slice(j, j + 4)); }
    }
    kinds.push(tag ? (q ? "attr" : "list") : area ? "area" : "text");
  }
  return kinds;
}
function prep(strs) {
  let p = PREP.get(strs); if (p) return p;
  const kinds = scan(strs); let out = strs[0];
  kinds.forEach((k, i) => { out += (k === "text" ? "<!--§" + i + "-->" : k === "list" ? " _h" + i + "_ " : "§" + i + "§") + strs[i + 1]; });
  const tpl = document.createElement("template"); tpl.innerHTML = out;
  p = { tpl, kinds }; PREP.set(strs, p); return p;
}
class Part {
  constructor(a, b) { this.a = a; this.b = b; this.kids = null; this.s = null; this.st = null; this.v = undefined; }
  clear() { for (let n = this.a.nextSibling; n && n !== this.b;) { const nx = n.nextSibling; n.remove(); n = nx; } this.kids = null; this.s = null; this.st = null; }
  set(v) {
    if (v == null || v === false || v === true) { if (this.v !== null) { this.clear(); this.v = null; } return; }
    if (Array.isArray(v)) {
      if (!this.kids) { this.clear(); this.kids = []; }
      this.v = v;
      while (this.kids.length > v.length) { const k = /** @type {Part} */ (this.kids.pop()); k.clear(); k.a.remove(); k.b.remove(); }
      while (this.kids.length < v.length) { const a = document.createComment(""), b = document.createComment(""); this.b.before(a, b); this.kids.push(new Part(a, b)); }
      v.forEach((x, i) => /** @type {Part[]} */ (this.kids)[i].set(x)); return;
    }
    if (v instanceof Raw) { this.clear(); this.v = v; const t = document.createElement("template"); t.innerHTML = v.s; this.b.before(t.content); return; }
    if (typeof v === "object" && v.s) {
      if (this.s === v.s && this.st) { update(this.st, v.v); this.v = v; return; }
      this.clear(); this.v = v; this.s = v.s; this.st = build(v); this.b.before(this.st.frag); return;
    }
    const t = String(v);
    if (this.kids === null && this.s === null && this.a.nextSibling && this.a.nextSibling.nodeType === 3 && this.a.nextSibling.nextSibling === this.b) { if (this.a.nextSibling.data !== t) this.a.nextSibling.data = t; this.v = t; return; }
    this.clear(); this.v = t; this.b.before(document.createTextNode(t));
  }
}
function setAttr(el, name, val) {
  if (/^on/i.test(name)) throw new Error("html: on* attribute refused: " + name);
  if (URL_ATTR.test(name) && SAFE_URL.test(val)) val = "about:blank";
  el.setAttribute(name, val);
}
function build(r) {
  const { tpl, kinds } = prep(r.s), frag = /** @type {DocumentFragment} */ (tpl.content.cloneNode(true)), parts = [];
  const w = document.createTreeWalker(frag, 133); /* elements, text, comments */
  const marks = [];
  for (let n = w.nextNode(); n; n = w.nextNode()) marks.push(n);
  marks.forEach(n => {
    if (n.nodeType === 8) { const m = /^§(\d+)$/.exec(/** @type {Comment} */ (n).data); if (m) { const b = document.createComment(""); n.after(b); parts[+m[1]] = { t: "n", p: new Part(/** @type {Comment} */ (n), b) }; } }
    else if (n.nodeType === 3) { if (n.parentNode && n.parentNode.nodeName === "TEXTAREA") { const m = /^§(\d+)§$/.exec(/** @type {Text} */ (n).data); if (m) parts[+m[1]] = { t: "a", el: n.parentNode }; } }
    else { const el = /** @type {Element} */ (n);
      Array.from(el.attributes).forEach(at => {
        let m = /^_h(\d+)_$/.exec(at.name);
        if (m) { el.removeAttribute(at.name); parts[+m[1]] = { t: "l", el, names: [] }; return; }
        if (at.value.indexOf("§") < 0) return;
        const bits = at.value.split(/§(\d+)§/), idx = []; for (let i = 1; i < bits.length; i += 2) idx.push(+bits[i]);
        const bool = at.name[0] === "?"; if (bool) { el.removeAttribute(at.name); }
        const rec = { t: "t", el, name: bool ? at.name.slice(1) : at.name, bits, bool };
        idx.forEach(i => { parts[i] = { t: "t", rec }; });
        if (!bool) el.setAttribute(at.name, "");
        (rec.idx = idx);
      });
    }
  });
  const st = { frag, parts, vals: [], kinds }; update(st, r.v, true); return st;
}
function attrOf(rec, vals) { let s = rec.bits[0]; for (let i = 0; i < rec.idx.length; i++) s += (vals[rec.idx[i]] == null ? "" : String(vals[rec.idx[i]])) + rec.bits[i * 2 + 2]; return s; }
function update(st, vals, first) {
  const seen = new Set();
  st.parts.forEach((p, i) => {
    if (!p) return; const v = vals[i];
    if (!first && st.vals[i] === v && typeof v !== "object") return;
    if (p.t === "n") p.p.set(v);
    else if (p.t === "a") p.el.value = p.el.textContent = v == null ? "" : String(v);
    else if (p.t === "t") { if (seen.has(p.rec)) return; seen.add(p.rec); const val = attrOf(p.rec, vals); if (p.rec.bool) { if (val && val !== "false" && val !== "0") p.rec.el.setAttribute(p.rec.name, ""); else p.rec.el.removeAttribute(p.rec.name); } else setAttr(p.rec.el, p.rec.name, val); }
    else if (p.t === "l") {
      const s = v == null ? "" : String(v); p.names.forEach(n => p.el.removeAttribute(n)); p.names = []; PAIR.lastIndex = 0;
      for (let m; PAIR.lastIndex < s.length && (m = PAIR.exec(s));) { if (!m[0]) break; setAttr(p.el, m[1], (m[2] || "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'")); p.names.push(m[1]); }
    }
  });
  st.vals = vals.slice();
}
/** @type {WeakMap<Element, any>} */ const R = new WeakMap();
/** @param {{s: TemplateStringsArray, v: any[]}} r @param {Element} el */
export function render(r, el) {
  const st = R.get(el);
  if (st && st.s === r.s && st.first && st.first === el.firstChild && st.first.isConnected) { update(st.st, r.v); return; }
  const b = build(r), first = b.frag.firstChild; el.replaceChildren(b.frag); R.set(el, { s: r.s, st: b, first });
}
/** keyed list: items with the same key keep their place when the list changes. list(items, x => x.id, x => html`<li>${x.n}</li>`) */
/** @param {any[]} items @param {(x:any,i:number)=>any} key @param {(x:any,i:number)=>any} fn */
export const list = (items, key, fn) => items.map((x, i) => fn(x, i));
