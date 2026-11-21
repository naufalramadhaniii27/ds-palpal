"""Detail card summary block (dcSum) at 390x844: spells, feats (PHB and third-party) and a sheet feature.
Each card shows a one-line summary first; spells show a number row with Duration (CONC badge) and Damage (type word);
feats show bullets from the bold sub-headings; the hero title never overlaps the tiles while the card scrolls.
Round 2 locks (LOCKS): no chip repeats the number row, line dice match the Damage tile (Fire Bolt 2d10 at level 5), one meta line,
no dash tile, the line is not repeated as the first detail sentence, bullets never end mid-word, pager/close/title/art do not overlap."""
import json, os, re, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
SEED = "(v=>{try{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}catch(e){}})(" + json.dumps(d) + ")"
R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:300]))
OPEN = """s=>{ if(s==='SHEETFEAT'){ const e=[...document.querySelectorAll('[data-info^="f:"]')].find(x=>/Savage Attacker/.test(x.textContent)); s=e?e.getAttribute('data-info'):''; }
  document.getElementById('tb')?.remove(); const b=document.createElement('button'); b.setAttribute('data-info',s); b.id='tb'; b.textContent='x'; document.getElementById('dmgBtn').after(b); b.click(); return s; }"""
INFO = """()=>{ const q=(s)=>[...document.querySelectorAll('#sheetBody '+s)].map(e=>e.textContent.trim());
  return {line:q('.dsum-l')[0]||'', nums:q('.dsum-c dt'), vals:q('.dsum-c dd'), chips:q('.dsum-t'), pts:q('.dsum-p b').map(t=>t.replace(/:$/,'')), conc:q('.dsum-c .dsum-b').length}; }"""
# every round-2 problem on the open card, as a list of strings
LOCKS = r"""()=>{ const B=document.getElementById('sheetBody'), sh=document.getElementById('sheet'), bad=[], q=(s)=>[...B.querySelectorAll(s)], tx=(e)=>e.textContent.replace(/\s+/g,' ').trim();
  const norm=(s)=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(), dd=q('.dsum-c').map(c=>norm(tx(c)));
  for(const c of q('.dsum-t')){ const k=norm(tx(c)); if(/^spell attack$| save$|^bonus action$|^reaction$|^\d+d\d+ [a-z]+$/.test(k)||dd.some(v=>v===k||v.endsWith(' '+k))) bad.push('chip repeats number row: '+k); }
  const line=tx(B.querySelector('.dsum-l')||{textContent:''}), dmg=q('.dsum-c').find(c=>/^damage/i.test(tx(c)));
  if(dmg){ const dice=tx(dmg).match(/\d+d\d+/g)||[]; for(const x of (line.match(/\d+d\d+/g)||[])) if(!dice.includes(x)) bad.push('line dice '+x+' vs tile '+dice); }
  for(const e of q('.dsum-c dd,.dc-cell b')) if(e.offsetParent&&tx(e)==='—') bad.push('dash tile');
  const meta=[...sh.querySelectorAll('.bl-meta span,.dc-head .dc-sub')].filter(e=>e.offsetParent&&tx(e)); if(meta.length>1) bad.push('meta lines: '+meta.map(tx).join(' | '));
  const dh=B.querySelector('.dsum-dh'), det=dh&&[...B.querySelectorAll('.info-d')].find(e=>dh.compareDocumentPosition(e)&4&&!/^Components:/.test(tx(e)));
  if(det&&line){ const f=tx(det).split(/(?<=[.!?])\s+(?=[A-Z])/)[0]||''; if(norm(f)===norm(line)) bad.push('line repeated as detail start'); }
  const all=tx(B); for(const li of q('.dsum-p li')){ const t=tx(li).replace(/^[^:]+:\s*/,''); if(!/[.!?…]$/.test(t)) bad.push('bullet end: '+t);
    if(t.endsWith('…')){ const p=t.slice(0,-1), i=all.indexOf(p,all.indexOf(t)+t.length); if(i>=0&&/[A-Za-z0-9]/.test(all[i+p.length]||'')) bad.push('mid-word cut: '+t); } }
  const box=(e)=>e&&e.offsetParent!==null?e.getBoundingClientRect():null, hit=(a,b)=>a&&b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
  const P=[['title',document.getElementById('sheetTitle')],['close',sh.querySelector('.sh-h .xbtn:not(#sheetBack)')],['art',B.querySelector('.sh-wm img')]].concat(q('.swp-b,.swp-d').map(e=>['pager',e]));
  for(let i=0;i<P.length;i++) for(let j=i+1;j<P.length;j++){ const a=P[i], b=P[j]; if(a[0]==='pager'&&b[0]==='pager') continue;
    if(a[0]!=='pager'&&b[0]!=='pager'&&!(a[0]==='title'&&b[0]==='close')) continue; if(hit(box(a[1]),box(b[1]))) bad.push('overlap '+a[0]+'/'+b[0]); }
  for(const e of q('.swp-b')){ const r=box(e); if(r&&(r.width<44||r.height<44)) bad.push('pager target '+r.width+'x'+r.height); }
  return bad; }"""
# title box vs every visible tile box, at several scroll positions, while the title is in the hero (not docked)
OVER = """async ()=>{ const b=document.getElementById('sheetBody'), sh=document.getElementById('sheet'), t=document.getElementById('sheetTitle'), hits=[];
  for(const y of [20,40,60,90,120,160,220,300]){ b.scrollTop=y; await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    if(sh.classList.contains('bl-compact')) continue; const a=t.getBoundingClientRect(), top=b.getBoundingClientRect().top;
    for(const e of b.querySelectorAll('.dsum,.dsum-c,.dc-cell,.tile,.dsum-l')){ const r=e.getBoundingClientRect(); if(r.bottom<=top) continue;
      if(a.left<r.right&&a.right>r.left&&a.top<r.bottom&&a.bottom>r.top) hits.push(y+':'+e.className); } }
  b.scrollTop=0; return hits; }"""
SHOT = os.environ.get("SHOT_DIR")
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
            check(nm + " CONC badge in the Duration tile", o["conc"] == 1 and "Concentration" not in o["chips"], o)
        if nm == "Fireball":
            check("Fireball chips add area and upcast", "20-ft Sphere" in o["chips"] and "+1d6 per slot" in o["chips"], o["chips"])
            check("Fireball Damage tile has the type word", any(v.endswith("Fire") for v in o["vals"]), o["vals"])
        if nm == "Sentinel":
            check("Sentinel bullets include Guardian and Halt", "Guardian" in o["pts"] and "Halt" in o["pts"], o["pts"])
            check("Sentinel ASI is a chip, not a bullet", "+1 STR or DEX" in o["chips"] and not any("Ability" in x for x in o["pts"]), o)
        if nm.startswith("third-party"):
            check(nm + " has bullets", len(o["pts"]) >= 2, o["pts"])
        if nm.startswith("sheet feature"):
            src = pg.evaluate("()=>[...document.querySelectorAll('#sheetBody .dc-strip small')].map(e=>e.textContent)")
            check(nm + " Source left the tile grid", "Source" not in src, src)
            check(nm + " Source in the footer", "PHB" in (pg.evaluate("()=>(document.querySelector('#sheetBody .dc-foot')||{}).textContent||''") or ""))
            check(nm + " Passive is a chip, not a tile", "Passive" in o["chips"] and "Time" not in o["nums"], o)
        bad = pg.evaluate(LOCKS); check(nm + " round-2 locks", not bad, bad)
        hits = pg.evaluate(OVER)
        check(nm + " title does not overlap tiles after scroll", not hits, hits)
        pg.evaluate("()=>{document.querySelector('#sheet [data-close]')?.click()}"); pg.wait_for_timeout(400)
    # species trait card (library): line and bullets when the trait has sub-headings
    sp = pg.evaluate("()=>{for(const [n,s] of Object.entries(window.SPECIES||{})) for(const t of (s.traits||[])) if(String(t[1]).length>60) return 'lib:feature|sp:'+n+'|'+t[0]; return ''}")
    check("a species trait exists", sp, sp)
    pg.evaluate(OPEN, sp); pg.wait_for_timeout(900); o = pg.evaluate(INFO)
    check("species trait summary line present (" + sp + ")", len(o["line"]) > 10, o)
    bad = pg.evaluate(LOCKS); check("species trait round-2 locks", not bad, bad)
    pg.evaluate("()=>{document.querySelector('#sheet [data-close]')?.click()}"); pg.wait_for_timeout(400)
    # caster sheet: a level 5 Wizard from the builder fuzz hook, then sheet spell cards (sp:)
    pg.evaluate("()=>window.__bldNeed&&window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'&&typeof window.__sheetApply==='function'", timeout=120000)
    sps = pg.evaluate("""()=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);
      const b=window.__bldFuzz({sp:'Human',bg:'Sage',rs:'2024',src:all,cls:'Wizard',lv:5,arr:[8,14,14,16,10,10],b2:0,b1:0}).b;
      const C=window.__bldSheetFor(b,{}); window.__sheetApply(C,false); const L=C.spells||[], ix=(f)=>L.findIndex(f);
      return {conc:ix(s=>s.conc), dmg:ix(s=>(window.SPELL_FX[s.n]||{}).dmg&&s.sv), fb:ix(s=>s.n==='Fire Bolt'), names:L.map(s=>s.n)}; }""")
    pg.wait_for_timeout(1500)
    for nm, i in (("concentration", sps["conc"]), ("damage", sps["dmg"]), ("Fire Bolt", sps["fb"])):
        if i < 0: check("Wizard sheet has a " + nm + " spell", False, sps["names"]); continue
        pg.evaluate(OPEN, "sp:%d" % i); pg.wait_for_timeout(900); o = pg.evaluate(INFO)
        if SHOT: pg.screenshot(path=SHOT + "/after_sp_" + nm.replace(" ", "_") + ".png")
        check("sheet spell %s (%s) summary line" % (nm, sps["names"][i]), len(o["line"]) > 10, o)
        check("sheet spell %s number row has Duration" % nm, "Duration" in o["nums"], o["nums"])
        if nm == "concentration": check("sheet spell CONC badge", o["conc"] == 1, o)
        elif nm == "Fire Bolt": check("Fire Bolt line says the character's 2d10, not 1d10", "2d10" in o["line"] and "1d10" not in o["line"], o["line"])
        else:
            check("sheet spell shows the character's DC or to hit", any(v.startswith("DC ") or v.startswith("+") for v in o["vals"]), o["vals"])
            check("sheet spell Damage tile has the type word", any(re.search(r"\d+d\d+.*[A-Za-z]{3,}$", v) for v in o["vals"]), o["vals"])
        bad = pg.evaluate(LOCKS); check("sheet spell %s round-2 locks" % nm, not bad, bad)
        hits = pg.evaluate(OVER); check("sheet spell %s title does not overlap tiles" % nm, not hits, hits)
        pg.evaluate("()=>{document.querySelector('#sheet [data-close]')?.click()}"); pg.wait_for_timeout(400)
    check("no page errors", not errs, errs); b.close()
print("SCORE %d" % round(100 * sum(R) / len(R))); sys.exit(0 if all(R) else 1)
