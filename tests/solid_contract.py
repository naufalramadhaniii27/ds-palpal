#!/usr/bin/env python3
"""SOLID stage 1 contract test (reports/solid-s1-analysis.md, contract text in src/builder/10a-logic-fx-registry.js).
Checks:
 1 static: handler files (10b, 10c, 10d, 11c) import nothing but the registry and core helpers, and use no window, document, storage, clock or random.
 2 static: the orchestrators (marked ORCH-BEGIN / ORCH-END in 11-logic-derivation.js) hold no per-kind branch (no source kind literal) and name no
   handler field; the "sheet" phases in 12-logic-export-to-sheet.js are only runFxPhase calls.
 3 registry shape: unique ids, group, phase of the registry, fields[], run(e, ctx) with two parameters, every phase has a handler.
 4 purity (browser): every handler runs on every real effect entry (the GX registry, the magic item rows, built entries) with deep frozen inputs, twice:
   same input gives the same patch, the inputs are not changed (a write to a frozen object throws in strict code), the patch is a fresh plain object.
 5 open for extension (browser): a handler registered at run time (no orchestrator edit) is applied by gfx() to a test entry.
Run: python3 tests/solid_contract.py [--root DIR]. Exit 1 on any failure."""
import json, os, re, sys
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
if '--root' in sys.argv: ROOT = os.path.abspath(sys.argv[sys.argv.index('--root') + 1])
SRC = os.path.join(ROOT, 'src', 'builder')
fails = []; n = 0
def ok(cond, msg):
    global n; n += 1
    if not cond: fails.append(msg); print('FAIL', msg)
def rd(f): return open(os.path.join(SRC, f), encoding='utf-8').read()

# 1 static: handler files
HFILES = ['10b-logic-fx-handlers-entry.js', '10c-logic-fx-handlers-ability.js', '10d-logic-fx-rules-cond-value.js', '11c-logic-fx-handlers-sheet.js']
ALLOWED_IMPORTS = {'./10a-logic-fx-registry.js', './01-logic-core-helpers.js'}
for f in HFILES:
    t = rd(f)
    for m in re.finditer(r'^import\s.*?from\s+"([^"]+)"', t, re.M):
        ok(m.group(1) in ALLOWED_IMPORTS, '%s imports %s (a handler file may import only the registry and core helpers)' % (f, m.group(1)))
    body = re.sub(r'/\*.*?\*/', '', t, flags=re.S)
    for bad in [r'\bwindow\b', r'\bdocument\b', r'\blocalStorage\b', r'\bsessionStorage\b', r'\b__store\b', r'\bDate\b', r'Math\.random', r'\b__R\b', r'\bfetch\b', r'\bperformance\b']:
        ok(not re.search(bad, body), '%s uses %s (handlers are pure)' % (f, bad))

# 2 static: orchestrators
d11 = rd('11-logic-derivation.js')
blocks = re.findall(r'/\*ORCH-BEGIN (\w+).*?\*/(.*?)/\*ORCH-END \1\*/', d11, re.S)
ok(sorted(b[0] for b in blocks) == ['abil', 'gfx0'], 'orchestrator markers abil and gfx0 not both found in 11-logic-derivation.js: %s' % [b[0] for b in blocks])
KINDS = ['cls', 'sub', 'species', 'bg', 'feat', 'item', 'class', 'background', 'items', 'feats']
# field names a handler owns (read from the registry below, with a fixed fallback): the orchestrators must not name them
FIELDS_FALLBACK = ['abCut', 'abil', 'abUp', 'abDown', 'abPick', 'abUpPick', 'abSet', 'setsc', 'toggle', 'when', 'spCls', 'speedMul', 'speedAdd', 'speedSet', 'darkAdd', 'darkTo', 'darkNone', 'darkHave', 'init']
def orch_text(b): return re.sub(r'/\*.*?\*/', '', b, flags=re.S)
for name, body in blocks:
    t = orch_text(body)
    for k in KINDS:
        ok(not re.search(r'["\']%s["\']' % k, t), 'orchestrator %s names the kind "%s"' % (name, k))
    ok('window' not in t, 'orchestrator %s reads window' % name)
d12 = rd('12-logic-export-to-sheet.js')
ph = re.findall(r'runFxPhase\("sheet","([\w-]+)"', d12)
ok(sorted(ph) == ['darkvision', 'init', 'speed', 'speed-mul'], 'toSheet runs the sheet phases %s' % ph)

# 3 + 4 + 5 browser
JS = r"""() => {
  const R = window.__fxRegistry(); const out = {fails: [], n: 0, info: {}};
  const F = (m) => { out.fails.push(String(m).slice(0, 240)); }, C = (c, m) => { out.n++; if (!c) F(m); };
  const deep = (o, seen) => { seen = seen || new Set(); if (o && typeof o === 'object' && !seen.has(o)) { seen.add(o); Object.keys(o).forEach(k => deep(o[k], seen)); Object.freeze(o); } return o; };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  // 3 shape
  Object.keys(R.handlers).forEach(reg => {
    const ids = new Set(); const phases = R.phases[reg];
    R.handlers[reg].forEach(h => {
      C(!ids.has(h.id), reg + ': duplicate id ' + h.id); ids.add(h.id);
      C(typeof h.group === 'string' && h.group, h.id + ': group'); C(phases.indexOf(h.phase) >= 0, h.id + ': phase ' + h.phase);
      C(Array.isArray(h.fields) && h.fields.length && h.fields.every(x => typeof x === 'string'), h.id + ': fields[]');
      C(typeof h.run === 'function' && h.run.length === 2, h.id + ': run(e, ctx) needs two parameters');
    });
    phases.forEach(p => C(R.handlers[reg].some(h => h.phase === p), reg + ': phase ' + p + ' has no handler'));
    out.info[reg] = R.handlers[reg].length;
  });
  out.fields = Array.from(new Set([].concat.apply([], Object.keys(R.handlers).map(r => R.handlers[r].map(h => h.fields).reduce((a, b) => a.concat(b), [])))));
  // corpus of real entries
  const G = window.GX || {}, ents = [];
  Object.keys(G).forEach(kind => { const t = G[kind]; if (t && typeof t === 'object') Object.keys(t).forEach(nm => { if (Array.isArray(t[nm])) t[nm].forEach(e => { if (e && typeof e === 'object') ents.push(e); }); }); });
  const rows = (typeof DMGI !== 'undefined' ? DMGI : []).map(x => ({n: x[0], fx: (x[5] && x[5].fx) || {}}));
  const spec = [{n: 'Ioun A', fx: {abil: ['STR', 2, 24]}}, {n: 'Ioun B', fx: {abil: ['DEX', -3]}}, {n: 'Ioun C', fx: {setsc: ['CON', 19]}}, {n: 'Ioun D', fx: {abil: ['WIS', 1, 20]}}];
  const probes = [{abUp: [['STR', 1, 20]]}, {abUp: [['STR', 'pb', 24], ['BAD', 1]]}, {abDown: [['CON', -2, 3]]}, {abPick: {k: 'ab', up: 1, max: 20}}, {abPick: {k: 'ab', set: 19, n: 2}},
    {abPick: {k: 'ab', from: ['STR', 'DEX'], up: 1}}, {abUpPick: {max: 20}, pickLv: [{k: 'p', lv: 1}, {k: 'q', lv: 9}]}, {abSet: [['INT', 19], ['STR', 3]]}, {abCut: {total: 60, each: 1}},
    {speed: [[1, 10], [5, 20]], speedAdd: 'pb', speedSet: 40}, {speedMul: 2}, {darkAdd: 30}, {darkTo: 120}, {darkNone: 60}, {darkHave: {add: 30}}, {darkHave: {to: 120}}, {darkNone: 60, darkHave: {to: 120}},
    {init: 'pb'}, {init: 2, cond: 'noHeavy'}, {toggle: {id: 't1', label: 'T', default: true}, pick: [], abPick: {k: 'x', from: ['STR']}}, {toggle: {id: 't2'}}, {l: 5}, {l: 1}, {when: {key: 'k', val: 'v'}}, {when: {key: 'k', val: 'zz', any: 1}}, {spCls: '@asi'}, {spCls: '@abpick'}, {spCls: 'Wizard'}, {}];
  const gx = ents.concat(probes).map((e, i) => Object.assign({lbl: 'Label ' + i, lv: 5, n: 'E' + i}, e));
  const ctxs = {
    entry: [v => ({src: {kind: 'feat', owner: 'O', lv: 5, pre: '', okey: 'O', alias: {'@asi': '@sub:CHA', '@abpick': '@sub:INT'}}, ch: {k: 'v', 'gx-k-feat-O': ['v'], 'k-O': 'zz'}, fxT: v ? {t1: false, t2: true} : {}}),
            v => ({src: {kind: 'cls', owner: 'C', lv: 1, pre: 'm0:', okey: 'C'}, ch: {}, fxT: {}})],
    ability: [v => ({sc: {STR: 10, DEX: 14, CON: 12, INT: 8, WIS: 15, CHA: 17}, src: {STR: [{s: 'a', v: 1}], DEX: [], CON: [], INT: [], WIS: [], CHA: []}, val: (x, e) => typeof x === 'number' ? x : 3, pick: (e, k) => k === 'q' ? ['STR +2, DEX +1'] : ['STR', 'Dexterity']}),
              v => ({sc: {STR: 19, DEX: 20, CON: 8, INT: 1, WIS: 15, CHA: 30}, src: {STR: [], DEX: [], CON: [], INT: [], WIS: [], CHA: []}, val: () => -2, pick: () => 'Charisma'})],
    sheet: [v => ({ok: () => true, val: (x, e) => typeof x === 'number' ? x : 3, spd: 30, dark: {vision: 60, src: 'Species'}}), v => ({ok: () => false, val: () => 0, spd: 0, dark: {vision: undefined, src: undefined}}),
            v => ({ok: () => true, val: () => 0, spd: 30, dark: {vision: undefined, src: undefined}})]
  };
  const inputsFor = (reg, h) => (reg === 'ability' && /^item-/.test(h.phase)) ? rows.concat(spec) : gx;
  let runs = 0, patches = 0;
  Object.keys(R.handlers).forEach(reg => R.handlers[reg].forEach(h => {
    const list = inputsFor(reg, h);
    list.forEach(e0 => ctxs[reg].forEach((mk, ci) => [0, 1].forEach(variant => {
      let e1, e2, c1, c2, a, b;
      try { e1 = deep(clone(e0)); e2 = deep(clone(e0)); c1 = deep(Object.assign({}, mk(variant))); c2 = deep(Object.assign({}, mk(variant))); } catch (x) { return; }
      try { a = h.run(e1, c1); b = h.run(e2, c2); } catch (x) { F(h.id + ' threw on ' + JSON.stringify(e0).slice(0, 80) + ': ' + x); return; }
      runs++;
      const ja = JSON.stringify(a === undefined ? null : a), jb = JSON.stringify(b === undefined ? null : b);
      if (ja !== jb) F(h.id + ': same input gave different patches for ' + JSON.stringify(e0).slice(0, 80));
      if (a) { patches++; if (a === e1 || a === c1 || typeof a !== 'object' || Array.isArray(a)) F(h.id + ': patch must be a fresh plain object'); if (a.replace && a.replace === e1) F(h.id + ': replace returns the input'); }
      if (JSON.stringify(e1) !== JSON.stringify(clone(e0))) F(h.id + ': changed its entry');
    })));
  }));
  C(runs > 1000, 'purity corpus too small: ' + runs); out.info.runs = runs; out.info.patches = patches; out.info.entries = gx.length + rows.length;
  // rule tables (cond and value words): pure functions, same answer twice, inputs untouched
  const T = R.rules, invs = [[], [{n: 'Chain Mail', eq: true, mw: true}], [{n: 'Chain Mail', eq: false, mw: true}]];
  const ars = [undefined, {cat: 'Heavy'}, {cat: 'Medium'}, {cat: 'Light'}];
  C(Object.keys(T.conds).length >= 12 && Object.keys(T.values).length >= 6, 'rule tables are smaller than the old if chains');
  Object.keys(T.conds).forEach(k => ars.forEach(ar => [true, false].forEach(sh => ['', 'Chain Mail', 'Chain Mail, Masterwork'].forEach(ea => invs.forEach(inv => {
    const a = deep(clone({ar: ar || null})).ar || undefined, iv = deep(clone(inv)); let x, y;
    try { x = T.conds[k](a, sh, ea, iv); y = T.conds[k](a, sh, ea, iv); } catch (z) { F('cond ' + k + ' threw: ' + z); return; }
    C(typeof x === 'boolean' && x === y, 'cond ' + k + ' is not a pure boolean'); out.info.runs++; })))));
  Object.keys(T.values).forEach(k => [{lv: 5}, {}, null, {lv: 0}].forEach(e => [1, 6].forEach(L => {
    const env = deep({L: L, pb: 2 + Math.floor((L - 1) / 4), rageLv: () => L * 3}), ee = e && deep(clone(e)); let x, y;
    try { x = T.values[k](ee, env); y = T.values[k](ee, env); } catch (z) { F('value ' + k + ' threw: ' + z); return; }
    C(typeof x === 'number' && x === y && isFinite(x), 'value ' + k + ' is not a pure number'); })));
  // 5 open for extension: a new field group = a new handler, the orchestrator stays as it is
  const tb = {name: 'T', species: 'Human', bg: 'Soldier', bgMode: '21', bg2: 'STR', bg1: 'CON', cls: 'Fighter', sub: '', level: 3, base: {STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8}, ch: {}, src: {core: true}, method: 'array', arr: {STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8}, hb: false, armor: '', shield: false, weps: [], eqC: 'A', eqB: 'B', size: 'Medium'};
  window.GX = window.GX || {}; window.GX.cls = window.GX.cls || {}; const keepF = window.GX.cls.Fighter; window.GX.cls.Fighter = (keepF || []).concat([{n: 'Zz Probe', zzProbe: 7}]);
  try {
    window.__bldTestSet(tb);
    const before = R.gfx().filter(e => e.n === 'Zz Probe')[0];
    C(before && before.zzProbe === 7 && before.zzSeen === undefined, 'probe entry before registration');
    R.register('entry', {id: 'zz-probe', group: 'test', phase: 'prepare', fields: ['zzProbe'], run: function (e, ctx) { return e.zzProbe ? {set: {zzSeen: e.zzProbe * ctx.src.lv}} : null; }});
    const after = R.gfx().filter(e => e.n === 'Zz Probe')[0];
    C(after && after.zzSeen === 7 * 3, 'a handler registered at run time was not applied by gfx(): ' + JSON.stringify(after));
  } finally { window.__bldTestSet(null); if (keepF) window.GX.cls.Fighter = keepF; else delete window.GX.cls.Fighter; }
  return out; }"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1250, 'height': 850}); pg.set_default_timeout(300000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file://' + os.path.join(ROOT, 'index.html')); pg.wait_for_timeout(1500)
    pg.evaluate("window.__bldNeed && window.__bldNeed()")
    pg.wait_for_function("()=>!!window.__fxRegistry&&!!window.__bldTestSet")
    r = pg.evaluate(JS); b.close()
n += r['n']
for m in r['fails'][:40]: fails.append(m); print('FAIL', m)
if len(r['fails']) > 40: print('... %d more' % (len(r['fails']) - 40))
# orchestrators name no field of any handler (distinctive names only: the structural fields the loop itself carries are not handler fields)
STRUCT = {'l', 'lv', 'lbl', 'pre', 'kind', 'owner', 'okey', 'idx', 'ocls', 'n', 'pick', 'cond', 'when'}
fields = [f for f in r['fields'] if f not in STRUCT] or FIELDS_FALLBACK
for name, body in blocks:
    t = orch_text(body)
    for f in fields:
        ok(not re.search(r'\.%s\b|["\']%s["\']' % (re.escape(f), re.escape(f)), t), 'orchestrator %s names the field %s' % (name, f))
ok(not errs, 'page errors: %s' % errs[:3])
print('solid_contract: %s (%d checks, handlers %s, %d runs, %d patches, %d entries)' % ('FAIL' if fails else 'OK', n, {k: v for k, v in r['info'].items() if k in ('entry', 'ability', 'sheet')}, r['info']['runs'], r['info']['patches'], r['info']['entries']))
sys.exit(1 if fails else 0)
