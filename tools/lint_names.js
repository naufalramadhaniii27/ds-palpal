#!/usr/bin/env node
/* Stage M1/M2: per script block, (1) names used but never declared (no-undef) and (2) how many top-level names are used from another file.
   Usage: node tools/lint_names.js [--json out.json]   Needs: npm ci --prefix tools/build. Reads src/, changes nothing. */
const fs = require("fs"), path = require("path");
const B = path.join(__dirname, "build", "node_modules");
const espree = require(path.join(B, "espree")), escope = require(path.join(B, "eslint-scope")), globals = require(path.join(B, "globals"));
const SRC = path.join(__dirname, "..", "src");
const man = JSON.parse(fs.readFileSync(path.join(SRC, "manifest.json"), "utf8")).entries;
const known = Object.assign({}, globals.browser, globals.es2021, globals.serviceworker);
["window","document","navigator","localStorage"].forEach(k => known[k] = false);
const out = [], globalDecl = new Set(), undefAll = [];
const units = [];
man.forEach((e, bi) => {
  if (e.t !== "block" || !/^<script/.test(e.open) || /src=/.test(e.open)) return;
  const fl = e.files.filter(f => f.endsWith(".js")); if (!fl.length) return;
  /* ES module blocks (entry): each file is its own module, imports are followed by esbuild at build */
  if (e.entry) fl.forEach(f => units.push({ e, bi, files: [f], mod: true })); else units.push({ e, bi, files: fl, mod: false });
});
units.forEach(({ e, bi, files, mod }) => {
  let text = "", spans = [];
  files.forEach(f => { const t = fs.readFileSync(path.join(SRC, f), "utf8"); spans.push({ f, a: text.length, b: text.length + t.length }); text += t; });
  const rec = { block: bi, tag: e.open, files: files.length, first: files[0], bytes: text.length };
  let ast; try { ast = espree.parse(text, { ecmaVersion: 2022, range: true, loc: true, sourceType: mod ? "module" : "script" }); } catch (er) { rec.parseError = String(er.message).slice(0, 120) + " @" + (er.index || "?"); out.push(rec); return; }
  const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: mod ? "module" : "script" });
  const fileOf = pos => { for (const s of spans) if (pos >= s.a && pos < s.b) return s.f; return "?"; };
  const undef = {}, cross = {}, decl = {}, where = {};
  const visit = sc => {
    sc.variables.forEach(v => v.defs.forEach(d => { if (d.name && d.name.range && sc.type !== "global") { /* declared in this scope */ } }));
    sc.references.forEach(r => { if (!r.resolved) { const n = r.identifier.name; if (!(n in known) && !typeofNames.has(n)) { undef[n] = (undef[n] || 0) + 1; (where[n] = where[n] || []).length < 2 && where[n].push(fileOf(r.identifier.range[0]) + ':' + (text.slice(0, r.identifier.range[0]).split('\n').length - text.slice(0, spans.filter(x => r.identifier.range[0] >= x.a && r.identifier.range[0] < x.b)[0].a).split('\n').length + 1)); } } });
    sc.childScopes.forEach(visit);
  };
  const typeofNames = new Set(); (function wt(n){ if (!n || typeof n !== 'object') return; if (n.type === 'UnaryExpression' && n.operator === 'typeof' && n.argument.type === 'Identifier') typeofNames.add(n.argument.name); for (const k in n) { if (k === 'loc' || k === 'range') continue; const c = n[k]; if (Array.isArray(c)) c.forEach(wt); else if (c && typeof c.type === 'string') wt(c); } })(ast);
  visit(sm.globalScope);
  sm.globalScope.variables.forEach(v => { if (v.defs.length) globalDecl.add(v.name); });
  (function wa(n){ if (!n || typeof n !== 'object') return; if (n.type === 'AssignmentExpression' && n.left.type === 'MemberExpression' && (n.left.object.name === 'window' || n.left.object.name === 'BootEnv' || n.left.object.name === 'FXENV' || n.left.object.name === 'genv' || n.left.object.name === 'env' || (n.left.object.type === 'MemberExpression' && n.left.object.object.name === 'DataEnv' && n.left.object.property.name === 'slot')) && !n.left.computed && n.left.property.name) globalDecl.add(n.left.property.name); if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && n.callee.object.name === 'DataEnv' && n.callee.property.name === 'declare') n.arguments.forEach(a => { if (a.type === 'Literal' && typeof a.value === 'string') globalDecl.add(a.value); }); for (const k in n) { if (k === 'loc' || k === 'range') continue; const c = n[k]; if (Array.isArray(c)) c.forEach(wa); else if (c && typeof c.type === 'string') wa(c); } })(ast);
  /* names declared at the outermost function scope (the IIFE) or global: used from another file? */
  const top = []; sm.scopes.forEach(sc => { if (sc.type === "global") top.push(sc); else if (sc.type === "module") top.push(sc); else if (sc.type === "function" && sc.upper && sc.upper.type === "global") top.push(sc); });
  let nDecl = 0, nCross = 0; const crossTop = {};
  top.forEach(sc => sc.variables.forEach(v => {
    if (!v.defs.length || v.name === "arguments") return; nDecl++;
    const df = fileOf(v.defs[0].name.range[0]); const users = new Set();
    v.references.forEach(r => { const uf = fileOf(r.identifier.range[0]); if (uf !== df) users.add(uf); });
    if (users.size) { nCross++; crossTop[v.name] = users.size; }
  }));
  rec.topNames = nDecl; rec.usedAcrossFiles = nCross; rec.undefinedNames = Object.keys(undef).length;
  rec.undefinedTop = Object.entries(undef).sort((a, b) => b[1] - a[1]).slice(0, 15);
  rec.crossTop = Object.entries(crossTop).sort((a, b) => b[1] - a[1]).slice(0, 8);
  rec._undef = undef; rec._where = where; out.push(rec);
});
out.forEach(r => { if (!r._undef) return; const real = Object.keys(r._undef).filter(n => !globalDecl.has(n)); r.fromOtherBlocks = Object.keys(r._undef).length - real.length; r.reallyUndefined = real.map(n => [n, r._undef[n], r._where[n]]); delete r._undef; delete r._where; });
const ji = process.argv.indexOf("--json"); if (ji > 0) fs.writeFileSync(process.argv[ji + 1], JSON.stringify(out, null, 1));
out.forEach(r => console.log(JSON.stringify({ b: r.block, other: r.fromOtherBlocks, real: (r.reallyUndefined||[]).length, files: r.files, first: r.first, kb: Math.round(r.bytes / 1024), top: r.topNames, cross: r.usedAcrossFiles, undef: r.undefinedNames, err: r.parseError })));
