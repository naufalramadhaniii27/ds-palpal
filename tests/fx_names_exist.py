#!/usr/bin/env python3
"""Owner name gate for the fx data files.

Every name keyed in GX.cls, GX.sub, GX.species, GX.feat, GX.item, GX.bg and GX.spell (src/data/fx-*.js) must exist in the matching
rules table of the built page, read through window.__bldData() with every source on. A name that matches nothing never applies
(example: "Wretched Bloodline" while the subclass is "Wretched Bloodline Sorcery"). Names for content not in the data go in
tests/fx_names_allow.json ("kind|name": reason).

  python3 tests/fx_names_exist.py
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fx_overlap

ROOT = fx_overlap.ROOT
ALLOW = os.path.join(ROOT, 'tests', 'fx_names_allow.json')

JS = """() => { const d = window.__bldData(), G = window.GX || {};
 const sub = new Set(); Object.keys(d.sub).forEach(k => sub.add(k.split('|')[0])); (d.wxs || []).forEach(s => sub.add(s.name));
 const sp = [].concat(...[window.SPELL_FULL, window.SPELLS, window.SPELL_FX].map(t => Array.isArray(t) ? t.map(r => Array.isArray(r) ? r[0] : r && r.n) : Object.keys(t || {})));
 return { gx: Object.fromEntries(Object.keys(G).map(k => [k, Object.keys(G[k] || {})])),
  have: { cls: Object.keys(d.classes), sub: [...sub], species: Object.keys(d.species), feat: Object.keys(d.feats),
   bg: Object.keys(d.bgs), item: d.dmgi.map(r => r[0]), spell: sp } } }"""


def main():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.set_default_timeout(180000)
        pg.goto('file://' + os.path.join(ROOT, 'index.html')); pg.wait_for_timeout(800)
        pg.evaluate('window.__bldNeed&&window.__bldNeed()'); pg.wait_for_function('window.__bldData', timeout=90000)
        r = pg.evaluate(JS); b.close()
    files = fx_overlap.load()['owners']
    allow = json.load(open(ALLOW)) if os.path.exists(ALLOW) else {}
    bad, seen = [], set()
    for kind, names in sorted(r['gx'].items()):
        have = r['have'].get(kind)
        if have is None:
            bad.append(('%s|*' % kind, 'no rules table known for GX.%s' % kind)); continue
        have = set(have)
        for n in names:
            key = '%s|%s' % (kind, n); seen.add(key)
            # "Holy Avenger (Longsword)": a weapon variant activeFx() expands from the base item
            if n in have or allow.get(key) or (kind == 'item' and n.endswith(')') and n.rsplit(' (', 1)[0] in have):
                continue
            bad.append((key, ', '.join(files.get('GX.' + key, ['?']))))
    for k in allow:
        if k not in seen or k.split('|', 1)[1] in set(r['have'].get(k.split('|')[0]) or []):
            print('note: allowlist entry no longer needed: ' + k)
    for k, f in bad:
        print('MISSING %s  (%s)' % (k, f))
    if bad:
        print('fx_names_exist FAIL: %d name(s) match no rules table entry. Rename to the real name, or list in tests/fx_names_allow.json with a reason.' % len(bad))
        sys.exit(1)
    print('fx_names_exist OK: %d names checked' % len(seen))


if __name__ == '__main__':
    main()
