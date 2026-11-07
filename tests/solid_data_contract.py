#!/usr/bin/env python3
"""SOLID stage 7 contract test for src/data (reports/solid-s7-analysis.md). The door is src/data/00-data-env.js (global DataEnv).
Checks:
 1 static: no data file (src/data/**) except the door uses window or globalThis (comments and strings are blanked first). The door is the first file of the first data part.
 2 static: every slot a data file touches (DataEnv.slot.X, the alias W.X of "var W=DataEnv.slot", DataEnv.get/set/has/reg("X")) is declared: in the CORE list of the door or by DataEnv.declare("X") in the same file.
 3 static: the door holds no data (small) and no other file names the global DataEnv except data files and this test.
 4 browser, shape: every core slot has the expected type (registries objects or arrays, tables non-empty), WX.src rows have an id, per-book tables (WXSP, WXG, WXBG, WXW) are keyed by a known source id, QREFS holds arrays of rows.
 5 browser, alias: the old global names stay alive. A slot reads and writes window[name] both ways, and the bare name reaches the same value.
 6 browser, open for extension: a data file that is not known to the door (run as a script text) declares a new slot, registers a book in WX and a table, with no edit of the door. The result is visible under the old window names. Cleaned afterwards.
Run: python3 tests/solid_data_contract.py [--root DIR]. Exit 1 on any failure."""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
if '--root' in sys.argv: ROOT = os.path.abspath(sys.argv[sys.argv.index('--root') + 1])
sys.path.insert(0, HERE)
from guard_lib import manifest_files, stripped
fails = []; n = 0
def ok(cond, msg):
    global n; n += 1
    if not cond: fails.append(msg); print('FAIL', msg)
DOOR = 'data/00-data-env.js'
files = [f for f in manifest_files(ROOT) if f.startswith('data/')]
ok(files and files[0] == DOOR, 'the door %s must be the first data file in the manifest (got %s)' % (DOOR, files[:1]))
door_raw = open(os.path.join(ROOT, 'src', DOOR), encoding='utf-8').read()
ok(len(door_raw) < 6000, 'the door must stay small (no data in it): %d bytes' % len(door_raw))
CORE = set()
for m in re.finditer(r'^\s*declare\(([^)]*)\);', door_raw, re.M): CORE.update(re.findall(r'"([^"]+)"', m.group(1)))
ok(len(CORE) >= 25, 'core slots not found in the door: %s' % sorted(CORE))
mf = json.load(open(os.path.join(ROOT, 'src', 'manifest.json')))['entries']
blocks = [b for b in mf if isinstance(b, dict) and b.get('t') == 'block' and any(x.startswith('data/') for x in b.get('files', []))]
ok(blocks and blocks[0]['files'][0] == DOOR, 'the door must be the first file of the first data part')

# 1 + 2 static
for f in files:
    raw = open(os.path.join(ROOT, 'src', f), encoding='utf-8').read(); code = stripped(ROOT, f)
    if f == DOOR: continue
    ok(not re.search(r'\bwindow\b|\bglobalThis\b', code), '%s reaches window or globalThis directly (use DataEnv)' % f)
    declared = set(CORE)
    for m in re.finditer(r'DataEnv\.declare\(([^)]*)\)', raw): declared.update(re.findall(r'"([^"]+)"', m.group(1)))
    used = set(re.findall(r'DataEnv\.slot\.([A-Za-z_$][\w$]*)', code))
    if re.search(r'\bvar W=DataEnv\.slot\b', code): used |= set(re.findall(r'\bW\.([A-Za-z_$][\w$]*)', code))
    for m in re.finditer(r'DataEnv\.(?:get|set|has|reg)\(\s*"([^"]+)"', raw): used.add(m.group(1))
    for nm in sorted(used - declared): ok(False, '%s uses the slot %s but never declares it (DataEnv.declare("%s") on its first line)' % (f, nm, nm))
    ok(True, 'declared ok')
# 3 other modules do not name the door
for d in ('app', 'builder', 'fx', 'boot', 'learn', 'tg'):
    base = os.path.join(ROOT, 'src', d)
    if not os.path.isdir(base): continue
    for r, _, fs in os.walk(base):
        for fn in fs:
            if fn.endswith('.js') and 'DataEnv' in open(os.path.join(r, fn), encoding='utf-8').read():
                ok(False, '%s/%s names DataEnv (only data files go through the door)' % (os.path.relpath(r, os.path.join(ROOT, 'src')), fn))

JS = r"""() => {
 const out = {n: 0, fails: []}; const ok = (c, m) => { out.n++; if (!c) out.fails.push(m); };
 ok(typeof DataEnv === 'object' && !!DataEnv.slot, 'DataEnv missing');
 const names = DataEnv.names();
 const OBJ = ['WX','WXI','WXSP','WXG','WXBG','WXW','WXC','QREFS','QIMG','GX','FXO','DM_SP','THIRD_SUBS','AUTO','__ICO','__lazyOn','CLASSES','SPECIES','BACKGROUNDS','FEATS','WEAPONS','ARMOR','SKILLS'];
 const ARR = ['WXS','WXE','WXWP','LU_X','SPELLS'];
 for (const k of OBJ) { const v = window[k]; ok(v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0, k + ' should be a non-empty object'); ok(DataEnv.slot[k] === v, k + ': slot differs from window'); }
 for (const k of ARR) { const v = window[k]; ok(Array.isArray(v) && v.length > 0, k + ' should be a non-empty array'); ok(DataEnv.slot[k] === v, k + ': slot differs from window'); }
 ok(typeof window.__lazyRun === 'function' && DataEnv.slot.__lazyRun === window.__lazyRun, '__lazyRun');
 ok(Array.isArray(WX.src) && WX.src.length > 0 && WX.src.every(s => s && typeof s.id === 'string'), 'WX.src rows need a string id');
 const ids = new Set(WX.src.map(s => s.id));
 for (const k of ['WXSP','WXG','WXBG','WXW']) for (const id of Object.keys(window[k])) ok(ids.has(id), k + '[' + id + '] has no source in WX.src');
 for (const id of Object.keys(WXI)) ok(Array.isArray(WXI[id]) && WXI[id].every(r => Array.isArray(r) && typeof r[0] === 'string'), 'WXI[' + id + '] rows are [name, ...]');
 for (const c of Object.keys(QREFS)) ok(Array.isArray(QREFS[c]), 'QREFS.' + c + ' should be an array');
 for (const k of ['sub','feat','cls']) ok(GX[k] && typeof GX[k] === 'object', 'GX.' + k);
 for (const s of SPELLS) { if (typeof s[0] !== 'string' || typeof s[1] !== 'number') { ok(false, 'SPELLS row [name, level, ...]: ' + JSON.stringify(s).slice(0, 60)); break; } }
 for (const k of Object.keys(CLASSES)) ok(CLASSES[k] && typeof CLASSES[k] === 'object', 'CLASSES.' + k);
 for (const nm of names) { const d = Object.getOwnPropertyDescriptor(DataEnv.slot, nm); ok(d && d.get && d.set, 'slot ' + nm + ' is not an accessor'); }
 /* 5 alias both ways */
 DataEnv.declare('ZZ_ALIAS'); DataEnv.slot.ZZ_ALIAS = 7; ok(window.ZZ_ALIAS === 7 && ZZ_ALIAS === 7, 'slot write not on window'); window.ZZ_ALIAS = 9; ok(DataEnv.slot.ZZ_ALIAS === 9 && DataEnv.get('ZZ_ALIAS') === 9, 'window write not on slot');
 ok(DataEnv.has('ZZ_ALIAS') && !DataEnv.has('ZZ_NOPE'), 'has');
 delete window.ZZ_ALIAS;
 /* 6 open for extension: a new data file, no edit of the door */
 const before = JSON.stringify([WX.src.length, Object.keys(WXI).length]);
 const txt = 'DataEnv.declare("ZZ_TABLE");\n(function(){var SRC={id:"zztest",name:"ZZ Test"};DataEnv.slot.ZZ_TABLE=DataEnv.slot.ZZ_TABLE||{};DataEnv.slot.ZZ_TABLE.a=1;' +
   'DataEnv.slot.WXI=DataEnv.slot.WXI||{};DataEnv.slot.WXI[SRC.id]=[["ZZ Item"]];DataEnv.slot.WX=DataEnv.slot.WX||{src:[]};if(!DataEnv.slot.WX.src.some(function(x){return x.id===SRC.id}))DataEnv.slot.WX.src.push(SRC);})();';
 (0, eval)(txt);
 ok(window.ZZ_TABLE && window.ZZ_TABLE.a === 1, 'new slot not visible as window.ZZ_TABLE');
 ok(window.WXI.zztest && window.WX.src.some(x => x.id === 'zztest'), 'new book not registered through the door');
 ok(DataEnv.names().indexOf('ZZ_TABLE') >= 0, 'names() lacks the new slot');
 delete window.WXI.zztest; WX.src.splice(WX.src.findIndex(x => x.id === 'zztest'), 1); delete window.ZZ_TABLE;
 ok(before === JSON.stringify([WX.src.length, Object.keys(WXI).length]), 'cleanup left a trace');
 return out; }"""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1250, 'height': 850}); pg.set_default_timeout(300000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file://' + os.path.join(ROOT, 'index.html')); pg.wait_for_timeout(1500)
    pg.evaluate("window.__bldNeed && window.__bldNeed()")
    pg.wait_for_function("()=>!!window.__deferDone")
    r = pg.evaluate(JS); b.close()
n += r['n']
for m in r['fails'][:40]: fails.append(m); print('FAIL', m)
ok(not errs, 'page errors: %s' % errs[:3])
print('solid_data_contract: %d checks, %d failed' % (n, len(fails)))
sys.exit(1 if fails else 0)
