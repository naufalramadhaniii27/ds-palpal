"""N36 edition isolation: 2014 data must not leak into the 2024 view.
Round trip: hash the live 2024 tables, switch 2014 on (all override names must differ), switch off,
the hash must equal the first one. Repeated with a random on/off sequence per seed."""
import sys, os, random, json
from playwright.sync_api import sync_playwright
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEEDS = int(sys.argv[1]) if len(sys.argv) > 1 else 5
HASH = """()=>{const T=['SPELLS','SPELL_FULL','SPELL_FX','WEAPONS','ARMOR','GEAR','PACKS','DMGI','FEATS','SPECIES','BACKGROUNDS','CLASSES'];
const o={};for(const k of T){let v;try{v=(0,eval)(k)}catch(e){continue}if(v===undefined)continue;let s;try{s=JSON.stringify(v,(k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(q=>[q,x[q]])):x)}catch(e){s=String(v.length)}let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;o[k]=h+':'+s.length}return o}"""
bad = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1250, "height": 850})
    pg.goto('file://' + R + '/index.html'); pg.wait_for_function("()=>!!window.__deferDone", timeout=90000)
    pg.evaluate("()=>window.__bldOpen&&window.__bldOpen()"); pg.wait_for_timeout(2500)
    has = pg.evaluate("()=>typeof window.__sp14Set==='function'")
    if not has: print("edition_isolation: __sp14Set missing"); sys.exit(1)
    base = pg.evaluate(HASH)
    pg.evaluate("()=>window.__sp14Set(true)"); pg.wait_for_timeout(500)
    on = pg.evaluate(HASH)
    changed = [k for k in base if on.get(k) != base[k]]
    print("2014 on changes tables:", changed)
    if not changed: bad.append("2014 on changed nothing")
    pg.evaluate("()=>window.__sp14Set(false)"); pg.wait_for_timeout(500)
    off = pg.evaluate(HASH)
    for k in base:
        if off.get(k) != base[k]: bad.append("leak after off: " + k)
    for sd in range(SEEDS):
        rnd = random.Random(sd); seq = [rnd.random() < .5 for _ in range(6)] + [False]
        for v in seq:
            pg.evaluate("(v)=>window.__sp14Set(v)", v); pg.wait_for_timeout(150)
        now = pg.evaluate(HASH)
        for k in base:
            if now.get(k) != base[k]: bad.append("seed %d leak: %s" % (sd, k))
    b.close()
print("edition_isolation: %d problems" % len(bad)); [print(" ", x) for x in bad[:10]]
sys.exit(1 if bad else 0)
