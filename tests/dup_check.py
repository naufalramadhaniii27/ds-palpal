#!/usr/bin/env python3
"""Duplicate check: for every class at level 1, 5, 10, 20 no action card and no feature card may appear twice (same name and same source label in one group, so Expertise at levels 2 and 9 is fine).
Found by the Warden Interrupt case (a class table column named like a feature made a second card and a second action).
Run: python3 tests/dup_check.py [--root DIR]. Exit 1 on any duplicate."""
import json, os, sys
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
if '--root' in sys.argv: ROOT = os.path.abspath(sys.argv[sys.argv.index('--root') + 1])
g = json.load(open(os.path.join(HERE, 'golden/builds/warforged_warden10_tower.json')))['build']
fails = []; n = 0
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.set_default_timeout(120000)
    pg.goto('file://' + os.path.join(ROOT, 'index.html')); pg.wait_for_timeout(1500)
    pg.wait_for_function("typeof window.__bldSheetFor==='function'")
    classes = pg.evaluate("()=>Object.keys(window.__bldData().classes||{})")
    for cl in classes:
        for lv in (1, 5, 10, 20):
            bb = json.loads(json.dumps(g)); bb['cls'] = cl; bb['sub'] = ''; bb['level'] = lv; bb['ch'] = {}; bb.pop('inv', None)
            bb['src'] = dict(bb.get('src') or {}, tvss=True, tshl=True, tsdd=True, tsgeh=True, tsdm=True, tee24=True, tghp=True, dmg=True)
            try:
                C = pg.evaluate("b=>{const C=window.__bldSheetFor(b);return {acts:(C.acts||[]).map(a=>a.g+'|'+a.k+'|'+a.n),feat:(C.features||[]).map(f=>[f.g,(f.items||[]).map(i=>i.n+' @'+(i.s||''))])}}", bb)
            except Exception as e:
                fails.append('%s L%d: error %s' % (cl, lv, str(e)[:80])); continue
            n += 1
            seen = {}
            for a in C['acts']: seen[a] = seen.get(a, 0) + 1
            for k, v in seen.items():
                if v > 1: fails.append('%s L%d: action %s x%d' % (cl, lv, k, v))
            for gname, items in C['feat']:
                s2 = {}
                for i in items: s2[i] = s2.get(i, 0) + 1
                for k, v in s2.items():
                    if v > 1: fails.append('%s L%d: feature %s/%s x%d' % (cl, lv, gname, k, v))
    # regression cases from tests/invariants.py (fast): a subclass table that lists features twice, one invocation in two slots, a species with its own Creature Type
    src = pg.evaluate("()=>{const s={core:true,dmg:true,efa:true};(window.WX&&window.WX.src||[]).forEach(x=>{s[x.id]=true});return s}")
    for what, o in (('Prescient Knight L3', {'cls': 'Fighter', 'sub': 'Prescient Knight', 'lv': 3}), ('Warlock L10 invocations', {'cls': 'Warlock', 'lv': 10}), ('species Ankylier', {'cls': 'Fighter', 'lv': 1, 'sp': 'Ankylier'})):
        o = dict({'sp': 'Human', 'bg': 'Acolyte', 'arr': [15, 14, 13, 12, 10, 8], 'b2': 0, 'b1': 0, 'sub': '', 'src': src, 'anySub': True}, **o)
        feat = pg.evaluate("o=>{const r=window.__bldFuzz(o);return r.err?[['error',r.err]]:r.c.features.map(g=>[g.g,g.items.map(i=>i.n+' @'+(i.s||'')+(/Repeatable/i.test(i.d)?' R':''))])}", o); n += 1
        for gname, items in feat:
            if gname == 'error': fails.append('%s: %s' % (what, str(items)[:80])); continue
            s2 = {}
            for i in items: s2[i] = s2.get(i, 0) + 1
            for k, v in s2.items():
                if v > 1 and not k.endswith(' R'): fails.append('%s: %s/%s x%d' % (what, gname, k, v))
    b.close()
print('dup_check %s (%d builds)' % ('FAIL' if fails else 'OK', n))
for f in sorted(set(fails))[:40]: print('  -', f)
sys.exit(1 if fails else 0)
