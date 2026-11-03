#!/usr/bin/env node
/* N44 codemod: el.innerHTML = 'markup'+esc(x)+'markup'  ->  render(html`markup${x}markup`, el)
   esc(x) holes become plain holes (escaped by the library), other operands become raw(...) holes (same text as before).
   A site is left alone when the markup around a hole is not safe for a template (hole in a tag name or in an unquoted attribute).
   node tools/html_codemod.js [--write] FILE...   prints one line per site: converted or skipped with the reason */
const fs = require("fs"), path = require("path");
const acorn = require(path.join(__dirname, "build/node_modules/acorn"));
const args = process.argv.slice(2), WRITE = args.includes("--write"), files = args.filter(a => !a.startsWith("--"));
const lit = s => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
let total = 0, done = 0;
for (const file of files) {
  const src = fs.readFileSync(file, "utf8"); let ast;
  try { ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "module", locations: true }); } catch (e) { console.log(file + ": parse error " + e.message); continue; }
  const edits = []; let needRaw = false;
  const isEsc = n => n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "esc" && n.arguments.length === 1 && n.arguments[0].type !== "SpreadElement";
  const flat = n => n.type === "BinaryExpression" && n.operator === "+" ? flat(n.left).concat(flat(n.right)) : [n];
  const strLike = n => n.type === "Literal" && typeof n.value === "string";
  /* returns {code} for a template, or {skip: reason} */
  function tpl(n) {
    if (n.type === "ConditionalExpression") { const a = tpl(n.consequent), b = tpl(n.alternate); if (a.skip) return a; if (b.skip) return b; return { code: src.slice(n.test.start, n.test.end) + " ? " + a.code + " : " + b.code, wrapParens: true }; }
    if (n.type === "ParenthesizedExpression") return tpl(n.expression);
    const parts = flat(n); if (!parts.some(strLike)) return { skip: "no string literal" };
    let out = "", prevText = "", raws = 0;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (strLike(p)) { out += lit(p.value); prevText += p.value; continue; }
      /* context check on the text before this hole */
      const before = prevText; const inTag = (() => { let tag = false, q = ""; for (const c of before) { if (tag) { if (q) { if (c === q) q = ""; } else if (c === '"' || c === "'") q = c; else if (c === ">") tag = false; } else if (c === "<") tag = true; } return { tag, q }; })();
      if (inTag.tag && !inTag.q) { if (/=\s*$/.test(before) || /<[A-Za-z\/]*$/.test(before)) return { skip: "hole in tag name or unquoted attribute" }; }
      if (/<!--[^>]*$/.test(before) || /<(script|style|textarea)[\s>][^]*$/i.test(before) && !/<\/(script|style|textarea)>/i.test(before)) return { skip: "hole in script, style, textarea or comment" };
      const e = isEsc(p) ? null : p;
      if (isEsc(p)) out += "${" + src.slice(p.arguments[0].start, p.arguments[0].end) + "}";
      else { raws++; needRaw = true; out += "${rawHtml(" + src.slice(p.start, p.end) + ")}"; }
      prevText += "\u0000";
      if (inTag.tag && inTag.q) { /* ok: quoted attribute value */ }
    }
    return { code: "html`" + out + "`", raws };
  }
  const walk = (n, f) => { if (!n || typeof n.type !== "string") return; f(n); for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && walk(x, f)); else if (v && typeof v.type === "string") walk(v, f); } };
  const stmts = new Set(); walk(ast, n => { if (n.type === "ExpressionStatement" && n.expression.type === "AssignmentExpression") stmts.add(n.expression); if (n.type === "ArrowFunctionExpression" && n.expression && n.body.type === "AssignmentExpression") stmts.add(n.body); });
  walk(ast, n => {
    if (n.type === "AssignmentExpression" && n.operator === "=" && n.left.type === "MemberExpression" && !n.left.computed && n.left.property.name === "innerHTML" && !stmts.has(n)) { total++; console.log(file + ":" + n.loc.start.line + " skip: value of the assignment is used"); return; }
    if (!stmts.has(n) || n.type !== "AssignmentExpression" || n.operator !== "=" || n.left.type !== "MemberExpression" || n.left.computed || n.left.property.name !== "innerHTML") return;
    total++; const r = tpl(n.right), line = n.loc.start.line;
    if (r.skip) { console.log(file + ":" + line + " skip: " + r.skip); return; }
    const target = src.slice(n.left.object.start, n.left.object.end);
    if (/[=;]|\bfunction\b/.test(target) && !/^[\w$.\[\]"'#()\s,-]+$/.test(target)) { console.log(file + ":" + line + " skip: complex target"); return; }
    edits.push({ s: n.start, e: n.end, t: "drawHtml(" + r.code + ", " + target + ")" }); done++; console.log(file + ":" + line + " ok");
  });
  if (WRITE && edits.length) {
    let out = src; edits.sort((a, b) => b.s - a.s).forEach(x => { out = out.slice(0, x.s) + x.t + out.slice(x.e); });
    const rel = path.relative(path.dirname(file), path.join(__dirname, "../src/app/lib/html.js")).replace(/\\/g, "/");
    const imp = (rel.startsWith(".") ? rel : "./" + rel);
    const m = /^import[^\n]*lib\/html\.js"[^\n]*$/m.exec(out);
    const names = "html, render as drawHtml" + (needRaw ? ", raw as rawHtml" : "");
    if (m) { const have = /\{([^}]*)\}/.exec(m[0])[1].split(",").map(x => x.trim()).filter(Boolean); const want = names.split(", "); const all = [...new Set(have.concat(want))]; out = out.replace(m[0], m[0].replace(/\{[^}]*\}/, "{ " + all.join(", ") + " }")); }
    else { const ims = [...out.matchAll(/^import[^\n]*$/gm)]; const at = ims.length ? ims[ims.length - 1].index + ims[ims.length - 1][0].length : 0; out = out.slice(0, at) + (at ? "\n" : "") + 'import { ' + names + ' } from "' + imp + '";' + (at ? "" : "\n") + out.slice(at); }
    fs.writeFileSync(file, out);
  }
}
console.log("codemod: " + done + " of " + total + " innerHTML sites " + (WRITE ? "converted" : "convertible"));
