#!/usr/bin/env python3
"""Snapshot of the engine output for the SOLID refactor (reports/solid-s1-analysis.md).
Builds every golden build (tests/golden/builds/*.json, with its fxT) and every invariant build (same list as tests/invariants.py),
derives the sheet and hashes the JSON of {C, D} per build. Prints one total hash.
Run: python3 tests/solid_snapshot.py OUT.json [--root DIR] [--quick] [--golden]. Compare two outputs with: python3 tests/solid_snapshot.py --diff A.json B.json
Not part of CI (it only records, it asserts nothing): it is the proof tool that a refactor changed no computed value."""
import json, os, sys, glob, hashlib
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
if '--diff' in sys.argv:
    i = sys.argv.index('--diff'); a = json.load(open(sys.argv[i + 1])); b = json.load(open(sys.argv[i + 2]))
    bad = [k for k in sorted(set(a['h']) | set(b['h'])) if a['h'].get(k) != b['h'].get(k)]
    print('builds', len(a['h']), len(b['h']), 'total', a['total'], b['total'], 'DIFFERENT: %d' % len(bad) if bad else 'IDENTICAL')
    for k in bad[:20]: print('  ', k)
    sys.exit(1 if bad else 0)
from playwright.sync_api import sync_playwright
if '--root' in sys.argv: ROOT = os.path.abspath(sys.argv[sys.argv.index('--root') + 1])
QUICK = '--quick' in sys.argv
GOLDEN = '--golden' in sys.argv   # only the golden builds (a faster check)
OUT = sys.argv[1]
H = r"""async (x)=>{
  const canon=(v)=>JSON.stringify(v,(k,o)=>{ if(o&&typeof o==='object'&&!Array.isArray(o)){ const r={}; Object.keys(o).sort().forEach(q=>{r[q]=o[q]}); return r } return o });
  const sha=async(t)=>{ const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)); return Array.from(new Uint8Array(b)).slice(0,10).map(c=>c.toString(16).padStart(2,'0')).join('') };
  const out={};
  for(const [name,kind,arg,fxT] of x){
    let C,D;
    try{ if(kind==='g'){ C=window.__bldSheetFor(arg,fxT) } else { const r=window.__bldFuzz(arg); C=r&&r.c; if(!C) throw new Error(r&&r.err||'none') } D=window.__deriveFor(C) }catch(e){ out[name]='ERR '+String(e).split('\n')[0].slice(0,80); continue }
    const t=canon({C:C,D:D}).replace(/"bv":\d+/g,'"bv":0').replace(/<button type=\\"button\\" class=\\"lnk\\" data-lnk=\\"[^"]*?\\">(.*?)<\/button>/g,'$1');/* the cross links in item texts appear only once the link index is warm (timing): compare the text without them */ out[name]=await sha(t);
  }
  return out }"""
def main():
    items = []
    for f in sorted(glob.glob(os.path.join(HERE, 'golden', 'builds', '*.json'))):
        g = json.load(open(f))
        for j, e in enumerate(g if isinstance(g, list) else [g]):
            if 'build' in e: items.append(['G:%s:%d' % (os.path.basename(f), j), 'g', e['build'], e.get('fxT')])
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1250, 'height': 850}); pg.set_default_timeout(900000)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        pg.goto('file://' + os.path.join(ROOT, 'index.html')); pg.wait_for_timeout(1500)
        pg.evaluate("window.__bldNeed && window.__bldNeed()")
        pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__deriveFor&&!!window.__bldData&&!!window.__bldSheetFor")
        pg.wait_for_function("()=>!!window.__deferDone")   # every deferred data part is in (item texts depend on it, a build made earlier differs)
        pg.wait_for_timeout(3000)
        D = pg.evaluate("()=>{const d=window.__bldData();const s={core:true,dmg:true,efa:true};(window.WX&&window.WX.src||[]).forEach(x=>{s[x.id]=true});"
                        "const cl={};Object.keys(d.classes).forEach(k=>{const c=d.classes[k];const subs={};Object.keys(c.subs||{}).forEach(n=>{const f=(c.subs[n]||[]).map(x=>x[0]).filter(x=>typeof x==='number');subs[n]=f.length?Math.min.apply(null,f):3});cl[k]={caster:c.caster||'',subs:subs}});"
                        "return {src:s,cl:cl,sp:Object.keys(d.species).filter(k=>!/\\(2014\\)$/.test(k)&&k!=='Custom'),bg:Object.keys(d.bgs).filter(k=>!/\\(2014\\)$/.test(k)&&(d.bgs[k].ab||[]).length===3)}}")
        src = D['src']; arr = [15, 14, 13, 12, 10, 8]
        def mk(cls, lv, sub='', sp='Human', bg='Acolyte'):
            return {'cls': cls, 'sp': sp, 'bg': bg, 'arr': arr, 'b2': 0, 'b1': 0, 'lv': lv, 'sub': sub, 'src': src, 'anySub': True}
        if GOLDEN: D['cl'] = {}; D['sp'] = []; D['bg'] = []
        for cls, c in D['cl'].items():
            for lv in (1, 5, 10, 20): items.append(['I:%s L%d' % (cls, lv), 'i', mk(cls, lv), None])
            for sub, first in c['subs'].items():
                for lv in sorted({20, max(1, min(20, first))}): items.append(['I:%s/%s L%d' % (cls, sub, lv), 'i', mk(cls, lv, sub), None])
        for sp in D['sp']:
            for lv in (1, 10): items.append(['I:species %s L%d' % (sp, lv), 'i', mk('Fighter', lv, sp=sp), None])
        for bg in D['bg']:
            for lv in (1, 10): items.append(['I:background %s L%d' % (bg, lv), 'i', mk('Fighter', lv, bg=bg), None])
        if QUICK: items = items[::8]
        h = {}
        for i in range(0, len(items), 100): h.update(pg.evaluate(H, items[i:i + 100]))
        b.close()
    tot = hashlib.sha256(json.dumps(h, sort_keys=True).encode()).hexdigest()[:16]
    json.dump({'total': tot, 'h': h, 'errors': errs}, open(OUT, 'w'), indent=0)
    print('snapshot %d builds, total %s, page errors %d, build errors %d' % (len(h), tot, len(errs), sum(1 for v in h.values() if v.startswith('ERR'))))
main()
