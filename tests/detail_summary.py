"""Detail card summary block (dcSum) at 390x844: spells, feats (PHB and third-party) and a sheet feature.
Each card shows a one-line summary first; spells show a number row with Duration and chips (Concentration, damage);
feats show bullets from the bold sub-headings; the hero title never overlaps the tiles while the card scrolls."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
SEED = "(v=>{try{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}catch(e){}})(" + json.dumps(d) + ")"
R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:300]))
OPEN = """s=>{ if(s==='SHEETFEAT'){ const e=[...document.querySelectorAll('[data-info^="f:"]')].find(x=>/Savage Attacker/.test(x.textContent)); s=e?e.getAttribute('data-info'):''; }
  document.getElementById('tb')?.remove(); const b=document.createElement('button'); b.setAttribute('data-info',s); b.id='tb'; b.textContent='x'; document.getElementById('dmgBtn').after(b); b.click(); return s; }"""
INFO = """()=>{ const q=(s)=>[...document.querySelectorAll('#sheetBody '+s)].map(e=>e.textContent.trim());
  return {line:q('.dsum-l')[0]||'', nums:q('.dsum-c dt'), chips:q('.dsum-t'), pts:q('.dsum-p b')}; }"""
# title box vs every visible tile box, at several scroll positions, while the title is in the hero (not docked)
OVER = """async ()=>{ const b=document.getElementById('sheetBody'), sh=document.getElementById('sheet'), t=document.getElementById('sheetTitle'), hits=[];
  for(const y of [20,40,60,90,120,160,220,300]){ b.scrollTop=y; await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    if(sh.classList.contains('bl-compact')) continue; const a=t.getBoundingClientRect(), top=b.getBoundingClientRect().top;
    for(const e of b.querySelectorAll('.dsum,.dsum-c,.dc-cell,.tile,.dsum-l')){ const r=e.getBoundingClientRect(); if(r.bottom<=top) continue;
      if(a.left<r.right&&a.right>r.left&&a.top<r.bottom&&a.bottom>r.top) hits.push(y+':'+e.className); } }
  b.scrollTop=0; return hits; }"""
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={"width": 390, "height": 844}); ctx.add_init_script(SEED); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("file://" + os.path.join(ROOT, "index.html")); pg.wait_for_timeout(3000)
    pg.click("[data-hview]"); pg.wait_for_selector("#dmgBtn", state="attached", timeout=30000); pg.wait_for_timeout(1500)
    tp = pg.evaluate("()=>{const W=window.WXF_ALL||{}; return (Object.entries(W).find(([k,v])=>!(window.FEATS||{})[k]&&v.f&&v.f.full&&/\\*\\*/.test(v.f.full))||[''])[0]}")
    check("a third-party feat with sub-headings exists", tp, tp)
    cases = [("Fireball", "spn:Fireball"), ("Hex", "spn:Hex"), ("Bless", "spn:Bless"), ("Sentinel", "lib:feat|Sentinel"),
             ("Tavern Brawler", "lib:feat|Tavern Brawler"), ("third-party " + tp, "lib:feat|" + tp), ("sheet feature Savage Attacker", "SHEETFEAT")]
    for nm, spec in cases:
        s = pg.evaluate(OPEN, spec); pg.wait_for_timeout(900)
        if not s: check(nm + " card opened", False, spec); continue
        o = pg.evaluate(INFO)
        check(nm + " summary line present", len(o["line"]) > 10, o)
        if spec.startswith("spn:"):
            check(nm + " number row has Duration", "Duration" in o["nums"], o["nums"])
        if nm in ("Hex", "Bless"):
            check(nm + " Concentration chip", "Concentration" in o["chips"], o["chips"])
        if nm == "Fireball":
            check("Fireball damage chip 8d6 Fire", "8d6 Fire" in o["chips"], o["chips"])
            check("Fireball DEX save chip", "DEX save" in o["chips"], o["chips"])
        if nm == "Sentinel":
            check("Sentinel bullets include Guardian and Halt", "Guardian" in o["pts"] and "Halt" in o["pts"], o["pts"])
        if nm.startswith("third-party"):
            check(nm + " has bullets", len(o["pts"]) >= 2, o["pts"])
        if nm.startswith("sheet feature"):
            src = pg.evaluate("()=>[...document.querySelectorAll('#sheetBody .dc-strip small')].map(e=>e.textContent)")
            check(nm + " Source left the tile grid", "Source" not in src, src)
            check(nm + " Source in the footer", "PHB" in (pg.evaluate("()=>(document.querySelector('#sheetBody .dc-foot')||{}).textContent||''") or ""))
        hits = pg.evaluate(OVER)
        check(nm + " title does not overlap tiles after scroll", not hits, hits)
        pg.evaluate("()=>{document.querySelector('#sheet [data-close]')?.click()}"); pg.wait_for_timeout(400)
    check("no page errors", not errs, errs); b.close()
print("SCORE %d" % round(100 * sum(R) / len(R))); sys.exit(0 if all(R) else 1)
