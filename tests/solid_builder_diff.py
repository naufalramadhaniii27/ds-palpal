#!/usr/bin/env python3
"""Differential test for the SOLID builder refactor (reports/solid-s11-analysis.md, solid-s13c-analysis.md).
Calls window.__bldNorm on 3113 inputs (777 golden builds, 3 messy variants each, edge cases) and window.__bldRound(window.__bldSheetFor(build)) on the 777 golden builds
(the fromSheet path), and hashes every returned JSON string. Compare two trees: the output of a function must be byte for byte the same.
Run: python3 tests/solid_builder_diff.py OUT.json [--root DIR]      (record, ROOT = repo root by default)
     python3 tests/solid_builder_diff.py --diff A.json B.json       (compare)
     python3 tests/solid_builder_diff.py --base DIR [--root DIR]    (record both trees and compare; DIR is a built tree of origin/main)
Not in CI (records and compares only). Needs playwright."""
import json, os, sys, glob, copy, random, hashlib, socket, threading, http.server, functools
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)

def sha(t): return hashlib.sha256(t.encode()).hexdigest()[:16]

def compare(a, b):
    bad = [k for k in sorted(set(a['h']) | set(b['h'])) if a['h'].get(k) != b['h'].get(k)]
    print('inputs', len(a['h']), len(b['h']), 'total', a['total'], b['total'], 'DIFFERENT: %d' % len(bad) if bad else 'IDENTICAL')
    for k in bad[:30]: print('  ', k)
    return 1 if bad else 0

def builds():
    out = []
    for f in sorted(glob.glob(os.path.join(HERE, 'golden', 'builds', '*.json'))):
        g = json.load(open(f))
        for e in (g if isinstance(g, list) else [g]):
            if 'build' in e: out.append([e['build'], e.get('fxT')])
    return out

def mut(b, i):
    b = copy.deepcopy(b); r = random.Random(i)
    if b.get('cls') and r.random() < .5: b['cls'] = b['cls'].lower()
    if b.get('species') and r.random() < .4: b['species'] = b['species'].upper().replace(' ', '')
    if b.get('bg') and r.random() < .4: b['bg'] = b['bg'][:-1] + 'x'
    if b.get('sub') and r.random() < .4: b['sub'] = b['sub'].lower()
    if 'level' in b and r.random() < .3: b['level'] = str(b['level']) + ' '
    if b.get('base') and r.random() < .4:
        k = list(b['base'])[0]; b['base'][k] = str(b['base'][k] + 9)
    if b.get('bg2') is not None and r.random() < .5: b['bg2'] = 'dex'; b['bg1'] = 'dex'
    if b.get('sp') and r.random() < .5: b['sp'] = [s.lower() for s in b['sp']] + ['Fakespell']
    if r.random() < .5:
        b['inv'] = [{'n': n, 'q': 3} for n in ['longsword', '+1 Longsword', 'Plate', 'Rope', 'Potion of Superior Healing', 'Spell Scroll (fireball)', 'Arrows', 'Shield', 'Backpackk', 'Quarterstaff, +2', 'Arrows (20)']] + (b.get('inv') or [])
    if b.get('ch') and r.random() < .5:
        b['choices'] = {'Fighting Style': 'defence', 'Skills': ['Arcana', 'Stealth'], 'Magic Initiate (Wizard)': {'cantrips': ['light'], 'spell': 'shield', 'ability': 'int'}, 'Feat': ['Alert']}
        b['ch'].update({'clsk': ['arcana', 'Fakeskill'], 'lang': ['elvish', 'x'], 'feat4': {'feat': 'alert', 'a1': 'str'}})
    if r.random() < .2: b['mc'] = [{'class': 'wizard', 'level': '2', 'sub': 'evoker'}]
    return b

def norm_inputs():
    random.seed(7); xs = []
    for i, (b, _) in enumerate(builds()):
        xs.append(b)
        for j in range(3): xs.append(mut(b, i * 10 + j))
    xs += [{}, {'cls': 'Nonsense'}, {'cls': 'fighter', 'level': 25}, {'class': 'Wizard', 'level': 3, 'race': 'Wood Elf', 'background': 'sage', 'abilities': {'strength': '8', 'Dex': 14}}, {'cls': 'Cleric', 'species': 'Tiefling (Infernal)', 'level': 'x'}]
    return xs

def record(root, out):
    from playwright.sync_api import sync_playwright
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Quiet, directory=root))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    xs = norm_inputs(); bs = builds(); h = {}
    with sync_playwright() as p:
        br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(900000)
        pg.goto('http://127.0.0.1:%d/index.html' % port); pg.wait_for_function("()=>!!window.__deferDone"); pg.wait_for_timeout(1500)
        pg.evaluate("window.__bldNeed && window.__bldNeed()")
        pg.wait_for_function("()=>!!window.__bldNorm&&!!window.__bldRound&&!!window.__bldSheetFor")
        pg.wait_for_timeout(3000)
        for i in range(0, len(xs), 200):
            r = pg.evaluate("(xs)=>xs.map(x=>{try{return JSON.stringify(window.__bldNorm(x))}catch(e){return 'ERR '+String(e).slice(0,80)}})", xs[i:i + 200])
            for j, t in enumerate(r): h['norm %04d' % (i + j)] = sha(t)
        for i in range(0, len(bs), 100):
            r = pg.evaluate("(xs)=>xs.map(([bd,fx])=>{try{const C=window.__bldSheetFor(bd,fx);return JSON.stringify(window.__bldRound(C))}catch(e){return 'ERR '+String(e).slice(0,80)}})", bs[i:i + 100])
            for j, t in enumerate(r): h['round %04d' % (i + j)] = sha(t)
        br.close()
    res = {'total': sha(json.dumps(h, sort_keys=True)), 'h': h}
    json.dump(res, open(out, 'w')); print('recorded %d inputs, total %s' % (len(h), res['total']))
    return res

a = sys.argv[1:]
if '--diff' in a:
    i = a.index('--diff'); sys.exit(compare(json.load(open(a[i + 1])), json.load(open(a[i + 2]))))
if '--root' in a:
    i = a.index('--root'); ROOT = os.path.abspath(a[i + 1]); del a[i:i + 2]
if '--base' in a:
    i = a.index('--base'); base = os.path.abspath(a[i + 1]); del a[i:i + 2]
    import tempfile; d = tempfile.mkdtemp()
    sys.exit(compare(record(base, d + '/base.json'), record(ROOT, d + '/cur.json')))
record(ROOT, a[0])
