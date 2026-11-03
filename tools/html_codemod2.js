#!/usr/bin/env node
/* N44 codemod, second pass. Turns markup that is joined from strings into html templates, from the inside out:
     'a<b>'+esc(x)+'</b>'                  -> html`a<b>${x}</b>`
     cond ? '<i>'+esc(y)+'</i>' : ''       -> cond ? html`<i>${y}</i>` : ""        (a hole value)
     list.map(x => '<li>'+esc(x)+'</li>').join("")  -> list.map(x => html`<li>${x}</li>`)
     return '<div>'+...                    -> return html`<div>...`                 (a template joins like a string through toString)
     el.innerHTML = X                      -> drawHtml(X as template, el)           (X that is not markup becomes rawHtml(X))
   Holes in a quoted attribute stay plain values, holes in text that are not markup become rawHtml(...) (same text as before).
   Sites that cannot be made safe are left alone, with the reason.
   node tools/html_codemod2.js [--write] FILE...      prints counts per file */
const fs = require("fs"), path = require("path");
const acorn = require(path.join(__dirname, "build/node_modules/acorn"));
const args = process.argv.slice(2), WRITE = args.includes("--write"), NAMES_OUT = args.includes("--names");
const oi = args.indexOf("--only"), ONLY = oi >= 0 ? new Set(JSON.parse(fs.readFileSync(args[oi + 1], "utf8"))) : null;
const files = args.filter((a, i) => !a.startsWith("--") && !(oi >= 0 && i === oi + 1));
const lit = s => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
const strLike = n => n.type === "Literal" && typeof n.value === "string";
const isEsc = n => n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "esc" && n.arguments.length === 1 && n.arguments[0].type !== "SpreadElement";
const flat = n => n.type === "BinaryExpression" && n.operator === "+" ? flat(n.left).concat(flat(n.right)) : n.type === "ParenthesizedExpression" ? flat(n.expression) : [n];
const NAMES = {};
let totals = { ret: 0, inner: 0, arrow: 0, hole: 0, skipped: 0 };
for (const file of files) {
  const src = fs.readFileSync(file, "utf8"); let ast;
  try { ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "module", locations: true }); } catch (e) { console.log(file + ": parse error " + e.message); continue; }
  const edits = []; let needRaw = false, needHtml = false, needDraw = false;
  const emit = n => { /* source of n with the edits inside it applied */
    const inner = edits.filter(e => e.s >= n.start && e.e <= n.end).sort((a, b) => b.s - a.s);
    let out = src.slice(n.start, n.end), base = n.start, last = Infinity;
    for (const e of inner) { if (e.e > last) continue; out = out.slice(0, e.s - base) + e.t + out.slice(e.e - base); last = e.s; }
    return out;
  };
  const markupChain = n => { const p = flat(n); return p.length > 0 && p.some(x => strLike(x) && /</.test(x.value)) && (p.length > 1 || strLike(p[0])) ; };
  const isMarkup = n => n.type === "ParenthesizedExpression" ? isMarkup(n.expression) : n.type === "ConditionalExpression" ? (isMarkup(n.consequent) || isMarkup(n.alternate)) : markupChain(n) || mapJoin(n);
  function mapJoin(n) { return n.type === "CallExpression" && n.callee.type === "MemberExpression" && !n.callee.computed && n.callee.property.name === "join" && n.arguments.length === 1 && strLike(n.arguments[0]) && n.arguments[0].value === "" && n.callee.object.type === "CallExpression" && n.callee.object.callee.type === "MemberExpression" && n.callee.object.callee.property.name === "map" && n.callee.object.arguments.length === 1 && /Function/.test(n.callee.object.arguments[0].type) && cbMarkup(n.callee.object.arguments[0]); }
  function cbMarkup(f) { if (f.expression) return isMarkup(f.body); const rets = []; collectReturns(f.body, rets); return rets.length > 0 && rets.every(r => r.argument && isMarkup(r.argument)); }
  function collectReturns(n, out) { if (!n || typeof n.type !== "string") return; if (/Function/.test(n.type)) return; if (n.type === "ReturnStatement") out.push(n); for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(x => x && collectReturns(x, out)); else if (v && typeof v.type === "string") collectReturns(v, out); } }
  /* code for a value that may be markup: a template, a conditional of templates, a map without join */
  function conv(n) {
    if (n.type === "ParenthesizedExpression") return conv(n.expression);
    if (n.type === "ConditionalExpression") return emit(n.test) + " ? " + convOrKeep(n.consequent) + " : " + convOrKeep(n.alternate);
    if (mapJoin(n)) return emit(n.callee.object);
    return tpl(flat(n));
  }
  const convOrKeep = n => (strLike(n) && !/</.test(n.value)) ? emit(n) : isMarkup(n) ? conv(n) : "rawHtml(" + emit(n) + ")";
  function tpl(parts) {
    let out = "", prev = "";
    for (const p of parts) {
      if (strLike(p)) { out += lit(p.value); prev += p.value; continue; }
      let tag = false, q = ""; for (const c of prev) { if (tag) { if (q) { if (c === q) q = ""; } else if (c === '"' || c === "'") q = c; else if (c === ">") tag = false; } else if (c === "<") tag = true; }
      if (tag && !q && (/=\s*$/.test(prev) || /<[A-Za-z\/]*$/.test(prev))) throw new Error("hole in tag name or unquoted attribute");
      if (/<!--[^>]*$/.test(prev) || (/<(script|style|textarea)[\s>]/i.test(prev) && !/<\/(script|style|textarea)>/i.test(prev))) throw new Error("hole in script, style, textarea or comment");
      if (isEsc(p)) out += "${" + emit(p.arguments[0]) + "}";
      else if (tag && q) out += "${" + emit(p) + "}";
      else if (tag) out += "${" + emit(p) + "}"; /* inside a tag between attributes: a list of attributes */
      else if (isMarkup(p)) { out += "${" + conv(p) + "}"; totals.hole++; }
      else { needRaw = true; out += "${rawHtml(" + emit(p) + ")}"; }
      prev += "\u0000";
    }
    needHtml = true; return "html`" + out + "`";
  }
  const ONLY_RET = false;
  const attempt = (n, f) => { try { return f(); } catch (e) { totals.skipped++; console.log(file + ":" + n.loc.start.line + " skip: " + e.message); return null; } };
  /* post-order walk so inner sites are edited first */
  const stack = [], fnParents = [];
  const inMap = () => { const p = fnParents[fnParents.length - 1]; return !!p && p.type === "CallExpression" && p.callee.type === "MemberExpression" && p.callee.property.name === "map"; };
  const inReplace = () => { const p = fnParents[fnParents.length - 1]; return !!p && p.type === "CallExpression" && p.callee.type === "MemberExpression" && /^(replace|replaceAll)$/.test(p.callee.property.name); };
  const nameOf = (n, parent) => n.type === "FunctionDeclaration" && n.id ? n.id.name : (parent && parent.type === "VariableDeclarator" && parent.id.type === "Identifier") ? parent.id.name : (parent && parent.type === "Property" && parent.key.name) ? parent.key.name : (parent && parent.type === "AssignmentExpression" && parent.left.type === "MemberExpression" && parent.left.property.name) ? parent.left.property.name : "";
  const walk = (n, parent) => {
    if (!n || typeof n.type !== "string") return;
    const isFn = /Function/.test(n.type); if (isFn) { stack.push(nameOf(n, parent) || ""); fnParents.push(parent); }
    for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && walk(x, n)); else if (v && typeof v.type === "string") walk(v, n); }
    if (isFn) { stack.pop(); fnParents.pop(); }
    if (n.type === "ReturnStatement" && n.argument && isMarkup(n.argument) && !(n.argument.type === "CallExpression") && !inReplace() && (!ONLY || (stack[stack.length - 1] === "" ? inMap() : ONLY.has(stack[stack.length - 1])))) { const c = attempt(n, () => conv(n.argument)); if (c) { edits.push({ s: n.argument.start, e: n.argument.end, t: c }); totals.ret++; const nm = stack.slice().reverse().find(x => x) || "(anonymous)"; NAMES[nm] = (NAMES[nm] || 0) + 1; } }
    else if (n.type === "CallExpression" && n.callee.type === "MemberExpression" && !n.callee.computed && n.callee.property.name === "push" && n.arguments.length >= 1 && n.arguments.every(a => a.type !== "SpreadElement") && n.arguments.some(a => isMarkup(a) && a.type !== "CallExpression") && !ONLY_RET) {
      n.arguments.forEach(a => { if (!(isMarkup(a) && a.type !== "CallExpression")) return; const c = attempt(n, () => conv(a)); if (c) { edits.push({ s: a.start, e: a.end, t: c }); totals.push = (totals.push || 0) + 1; } });
    }
    else if (n.type === "ArrowFunctionExpression" && n.expression && isMarkup(n.body) && n.body.type !== "CallExpression") { const c = attempt(n, () => conv(n.body)); if (c) { edits.push({ s: n.body.start, e: n.body.end, t: c }); totals.arrow++; } }
    else if (n.type === "ExpressionStatement" && n.expression.type === "AssignmentExpression" && n.expression.operator === "=" && n.expression.left.type === "MemberExpression" && !n.expression.left.computed && n.expression.left.property.name === "innerHTML") {
      const a = n.expression, tgt = emit(a.left.object);
      if (/[=;]/.test(tgt) && !/^[\w$.\[\]"'#()\s,-]+$/.test(tgt)) { totals.skipped++; console.log(file + ":" + n.loc.start.line + " skip: complex target"); return; }
      const c = attempt(n, () => isMarkup(a.right) ? conv(a.right) : (needRaw = true, "rawHtml(" + emit(a.right) + ")"));
      if (c) { needDraw = true; edits.push({ s: a.start, e: a.end, t: "drawHtml(" + c + ", " + tgt + ")" }); totals.inner++; }
    }
  };
  walk(ast, null);
  if (WRITE && edits.length) {
    let out = src; const sorted = edits.sort((a, b) => b.s - a.s || b.e - a.e); let last = Infinity;
    for (const e of sorted) { if (e.e > last) continue; out = out.slice(0, e.s) + e.t + out.slice(e.e); last = e.s; }
    const rel = path.relative(path.dirname(file), path.join(__dirname, "../src/app/lib/html.js")).replace(/\\/g, "/"), imp = rel.startsWith(".") ? rel : "./" + rel;
    const want = []; if (needHtml) want.push("html"); if (needDraw) want.push("render as drawHtml"); if (needRaw || /rawHtml\(/.test(out)) want.push("raw as rawHtml");
    const m = /^import[^\n]*lib\/html\.js"[^\n]*$/m.exec(out);
    if (m) { const have = /\{([^}]*)\}/.exec(m[0])[1].split(",").map(x => x.trim()).filter(Boolean); const all = [...new Set(have.concat(want))]; out = out.replace(m[0], m[0].replace(/\{[^}]*\}/, "{ " + all.join(", ") + " }")); }
    else { const ims = [...out.matchAll(/^import[^\n]*$/gm)]; const at = ims.length ? ims[ims.length - 1].index + ims[ims.length - 1][0].length : 0; out = out.slice(0, at) + (at ? "\n" : "") + 'import { ' + want.join(", ") + ' } from "' + imp + '";' + (at ? "" : "\n") + out.slice(at); }
    fs.writeFileSync(file, out);
  }
}
if (NAMES_OUT) { console.log(JSON.stringify(Object.keys(NAMES))); process.exit(0); } console.log("codemod2: returns " + totals.ret + ", arrows " + totals.arrow + ", innerHTML " + totals.inner + ", nested markup holes " + totals.hole + ", pushes " + (totals.push || 0) + ", skipped " + totals.skipped);
