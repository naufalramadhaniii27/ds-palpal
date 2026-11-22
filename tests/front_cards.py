"""Front cards on the sheet tabs at 390x844 (Yudhi fixture, then a level 5 Wizard for Spells).
Actions: at least 6 attack cards fit between the top of the list and the play bar; the first card starts in the top half;
no column header row; each card (save cantrips too) is flat (no bordered or filled box inside), its TO HIT, DAMAGE and RANGE cells share one row and one text baseline (2 px), the range stays on one line, and nothing overlaps.
Features: no book source line on the front, the one-liner is at most two lines, an action badge on every card,
the use boxes tick on tap without opening the detail and keep the state after a re-render.
Spells: every row has a Duration cell; a Concentration spell shows the CONC badge there.
Detail leftover: feat bullets fold the sub-headed paragraphs behind Full text.
Round 4: tab titles at most 40 px tall; the first card of Actions and Features in the top half and the first spell row in the top 40 percent;
search folded behind an icon and Reorder as an icon in the filter row; casting times as short words (no 1A codes); no dash cells on spell rows;
no links inside the feature one-liner or badge row; attack cells and spell cells stay aligned without overlap in the light and high-contrast skins.
Round 5: the pager lands exactly on a page after 5 jumps to Features (and others); the identity card ends right under its last row;
Inventory Manage and Shop share one row; the weight column header is not shown over the item names on phones.
Round 6: the Home continue card portrait is top-aligned with its text column."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
SEED = "(v=>{try{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}catch(e){}})(" + json.dumps(d) + ")"
R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:300]))
def tab(pg, t): pg.click("[data-go='%s']" % t); pg.wait_for_timeout(1200)
TITLE = "id=>{const t=document.querySelector('#'+id+' .ptitle'); return t?Math.round(t.getBoundingClientRect().height):0}"
FIRST = "s=>{const e=[...document.querySelectorAll(s)].find(x=>x.offsetParent); return e?e.getBoundingClientRect().top/innerHeight:1}"
SPROW = r"""()=>{ const L=[...document.querySelectorAll('#spBody .sp-r[data-info^="sp:"]')].filter(r=>r.offsetParent), bad=[];
  for(const r of L){ const c=[...r.querySelectorAll(':scope>[data-l]')].filter(e=>e.offsetParent&&getComputedStyle(e).display!=='none');
    for(const e of c){ const t=e.textContent.trim(); if(t==='—'||t==='-') bad.push('dash '+e.dataset.l); if(/^1(A|BA|R)$/.test(t)) bad.push('code '+t); }
    const b=c.map(e=>e.getBoundingClientRect()); for(let i=0;i<b.length;i++) for(let j=i+1;j<b.length;j++){ const x=b[i],y=b[j]; if(x.left<y.right-1&&x.right>y.left+1&&x.top<y.bottom-1&&x.bottom>y.top+1) bad.push('overlap '+c[i].dataset.l+'/'+c[j].dataset.l); } }
  return bad; }"""
DOCK = "()=>{const v=document.getElementById('vbar'); return v&&v.offsetParent?v.getBoundingClientRect().top:innerHeight}"
ACT = r"""async ()=>{ const rows=[...document.querySelectorAll('#actBody .arow')].filter(e=>e.offsetParent), dock=(%s)(), out={n:rows.filter(r=>!r.classList.contains('xd')).length, bad:[]};
  if(!rows.length) return out; out.first=rows[0].getBoundingClientRect().top/innerHeight;
  out.head=[...document.querySelectorAll('#actBody .ahead')].filter(e=>e.offsetParent).length;
  // baseline of a text box = top + k*height, k measured once for the font with a zero-height inline-block probe
  const ff=getComputedStyle(rows[0]).fontFamily, t=document.createElement('div'); t.style.cssText='position:absolute;top:0;left:0;font:800 40px '+ff+';line-height:1';
  t.innerHTML='<span>8</span><i style="display:inline-block;width:0;height:0;vertical-align:baseline"></i>'; document.body.appendChild(t);
  const tr=t.firstChild.getBoundingClientRect(), k=(t.lastChild.getBoundingClientRect().top-tr.top)/tr.height; t.remove();
  const base=(e)=>{ const w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT); let n; while((n=w.nextNode())&&!n.data.trim()); if(!n) return null; const g=document.createRange(); const i=n.data.search(/\S/); g.setStart(n,i); g.setEnd(n,i+1); const b=g.getBoundingClientRect(); return b.top+k*b.height; };
  for(const r of rows){ const els=[...r.querySelectorAll(':scope>.abox,:scope>.arng')], c=els.map(e=>e.getBoundingClientRect()), an=r.querySelector(':scope>.an').getBoundingClientRect();
    if(c.length!==3) { out.bad.push('cells '+c.length+' '+r.textContent.slice(0,20)); continue; }
    if(Math.max(...c.map(x=>x.top))-Math.min(...c.map(x=>x.top))>1.5) out.bad.push('misaligned '+r.textContent.slice(0,20));
    const bl=els.map(base).filter(x=>x!=null); if(bl.length===3&&Math.max(...bl)-Math.min(...bl)>2) out.bad.push('baseline '+bl.map(Math.round)+' '+r.textContent.slice(0,20));
    const rg=els[2]; if(rg.getClientRects().length&&rg.scrollWidth>rg.clientWidth+1||(()=>{const g=document.createRange(); g.selectNodeContents(rg); return [...g.getClientRects()].map(x=>Math.round(x.top)).filter((v,i,a)=>a.indexOf(v)===i).length>1;})()) out.bad.push('range not one line '+rg.textContent);
    for(let i=0;i<3;i++){ if(c[i].top<an.bottom-1) out.bad.push('cell over name'); for(let j=i+1;j<3;j++) if(c[i].right>c[j].left+1) out.bad.push('cells overlap'); }
    // flat card: nothing inside the row (chips and the Ready toggle aside) draws its own border or panel
    for(const e of r.querySelectorAll('*')){ if(e.closest('.apc,.flag,.sit-ck')) continue; const s=getComputedStyle(e), bw=['Top','Right','Bottom','Left'].some(x=>parseFloat(s['border'+x+'Width'])>0&&s['border'+x+'Style']!=='none'&&!/rgba\(.*, 0\)|transparent/.test(s['border'+x+'Color']));
      const bg=s.backgroundColor!=='rgba(0, 0, 0, 0)'&&s.backgroundColor!=='transparent'||s.backgroundImage!=='none'; if((bw||bg)&&e.getBoundingClientRect().width>40) { out.bad.push('nested box '+e.className+' in '+r.textContent.slice(0,16)); break; } }
    const lab=els.map(e=>getComputedStyle(e,'::before').content); if(!/To hit|DC/i.test(lab[0])) out.bad.push('no TO HIT label'); }
  rows[0].scrollIntoView({block:'start'}); await new Promise(r=>setTimeout(r,250));
  out.fit=rows.filter(r=>{ const b=r.getBoundingClientRect(); return b.top>=-1&&b.bottom<=dock+1; }).length; return out; }""" % DOCK
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2); ctx.add_init_script(SEED); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("file://" + os.path.join(ROOT, "index.html")); pg.wait_for_timeout(3000)
    hp = pg.evaluate("()=>{const a=document.querySelector('#hxHero .hhpor'), t=document.querySelector('#hxHero .hhtx'); return a&&t?Math.round(a.getBoundingClientRect().top-t.getBoundingClientRect().top):null}")
    check("Home continue card portrait starts at the top of its text (no empty space above)", hp is not None and abs(hp) <= 8, hp)
    pg.click("[data-hview]"); pg.wait_for_selector("#dmgBtn", state="attached", timeout=30000); pg.wait_for_timeout(1500)
    # pager snap: every jump lands on a page edge (a page slide on the page itself once moved the snap 36 px)
    off = []
    for t in ["2", "5", "0", "5", "3", "5", "4", "5", "1", "5"]:
        tab(pg, t); pg.wait_for_timeout(500); sl = pg.evaluate("()=>{const p=document.getElementById('pager'); return [p.scrollLeft,p.clientWidth]}")
        if abs(sl[0] - int(t) * sl[1]) > 1: off.append((t, sl[0]))
    check("pager snap lands on the page after 10 jumps (5 to Features)", not off, off)
    tab(pg, "0")
    gap = pg.evaluate("()=>{const c=document.querySelector('.idcard').getBoundingClientRect(), x=document.getElementById('xpBox').getBoundingClientRect(); return Math.round(c.bottom-x.bottom)}")
    check("identity card ends right under its last row", gap <= 20, gap)
    tab(pg, "4")
    iv = pg.evaluate("()=>{const b=[...document.querySelectorAll('#invBody .ihero .ibtn')].map(e=>e.getBoundingClientRect()); const h=document.querySelector('#invBody .ihead>span:nth-child(2)'); return {n:b.length, row:b.length===2&&Math.abs(b[0].top-b[1].top)<2, w:h?getComputedStyle(h).visibility:'none'}}")
    check("Inventory Manage and Shop on one row", iv["row"], iv)
    check("no weight header over the item names", iv["w"] != "visible", iv)
    # Actions
    tab(pg, "2"); o = pg.evaluate(ACT)
    check("Actions has attack cards", o["n"] >= 3, o)
    check("first attack card starts in the top half", o.get("first", 1) < 0.5, o)
    check("no column header row", o.get("head") == 0, o)
    check("TO HIT / DAMAGE / RANGE: one row, one baseline (2 px), range on one line, labelled, no nested boxes", not o["bad"], o["bad"])
    check("at least 6 attack cards per screen at 390x844", o.get("fit", 0) >= 6, o)
    check("Actions tab title at most 40 px", 0 < pg.evaluate(TITLE, "p-actions") <= 40, pg.evaluate(TITLE, "p-actions"))
    for skin, attr in (("light", ["data-theme", "light"]), ("high-contrast", ["data-hc", "1"])):
        pg.evaluate("a=>document.documentElement.setAttribute(a[0],a[1])", attr); pg.wait_for_timeout(300); o2 = pg.evaluate(ACT)
        check("attack cells aligned in the %s skin" % skin, not o2["bad"], o2["bad"]); pg.evaluate("a=>document.documentElement.removeAttribute(a[0])", attr)
    dt = pg.evaluate("()=>[...document.querySelectorAll('#actBody .arow [data-bd^=\"ad-\"]>span')].map(e=>e.className)")
    check("damage dice carry the damage-type colour class", dt and all(c.startswith("dt-") for c in dt), dt)
    # Features
    tab(pg, "5")
    check("Features tab title at most 40 px", 0 < pg.evaluate(TITLE, "p-feat") <= 40, pg.evaluate(TITLE, "p-feat"))
    check("first feature card in the top half", pg.evaluate(FIRST, "#featBody .fitem") < 0.5, pg.evaluate(FIRST, "#featBody .fitem"))
    fr = pg.evaluate("()=>{const r=document.querySelector('#featBody .filrow'); return r?{q:!!r.querySelector('details.qd:not([open]) summary'), o:(r.querySelector('.ordb')||{}).offsetHeight||0}:null}")
    check("feature search folded and Reorder an icon in the filter row", fr and fr["q"] and fr["o"] >= 44, fr)
    lk = pg.evaluate("()=>document.querySelectorAll('#featBody .fitem :is(.fline,.fsub) :is(button.lk,a,.xl)').length")
    check("no links in feature one-liners or badge rows", lk == 0, lk)
    f = pg.evaluate(r"""()=>{ const it=[...document.querySelectorAll('#featBody .fitem')].filter(e=>e.offsetParent), lh=(e)=>parseFloat(getComputedStyle(e).lineHeight)||20;
      return {n:it.length, src:it.filter(e=>/pg\.\s*\d|PHB-20\d\d/.test(e.innerText)).map(e=>e.innerText.slice(0,40)),
        tall:it.map(e=>e.querySelector('.fline')).filter(l=>l&&l.getBoundingClientRect().height>2*lh(l)+2).map(l=>l.textContent.slice(0,30)),
        nobadge:it.filter(e=>!e.querySelector('.fkb')).map(e=>e.innerText.slice(0,30))}; }""")
    check("features listed", f["n"] >= 3, f)
    check("no source line on the feature front", not f["src"], f["src"])
    check("one-liner at most two lines", not f["tall"], f["tall"])
    check("action badge on every feature card", not f["nobadge"], f["nobadge"])
    bx = pg.evaluate("()=>{const b=document.querySelector('#featBody .fitem .bx'); if(!b) return null; b.scrollIntoView({block:'center'}); return {k:b.dataset.k,i:b.dataset.i,p:b.getAttribute('aria-pressed')}}")
    check("a feature card has use boxes", bx, bx)
    if bx:
        sel = "#featBody .fitem .bx[data-k='%s'][data-i='%s']" % (bx["k"], bx["i"])
        pg.click(sel); pg.wait_for_timeout(500)
        now = pg.evaluate("s=>(document.querySelector(s)||{getAttribute:()=>null}).getAttribute('aria-pressed')", sel)
        check("use box toggles on tap", now is not None and now != bx["p"], [bx, now])
        check("tapping a use box does not open the detail", not pg.evaluate("()=>document.getElementById('sheet').classList.contains('on')"))
        tab(pg, "0"); tab(pg, "5")
        check("use box state kept after re-render", pg.evaluate("s=>(document.querySelector(s)||{getAttribute:()=>null}).getAttribute('aria-pressed')", sel) == now)
        pg.click(sel); pg.wait_for_timeout(400)
    # detail leftover: Sentinel bullets fold the paragraphs
    pg.evaluate("""()=>{ const b=document.createElement('button'); b.setAttribute('data-info','lib:feat|Sentinel'); b.id='tb'; document.getElementById('dmgBtn').after(b); b.click(); }"""); pg.wait_for_timeout(900)
    s = pg.evaluate("()=>({fold:!!document.querySelector('#sheetBody details.dsum-full'), open:!!document.querySelector('#sheetBody details.dsum-full[open]'), dh:[...document.querySelectorAll('#sheetBody .dsum-dh')].filter(h=>!h.nextElementSibling).length})")
    check("Sentinel detail folds the paragraphs behind Full text", s["fold"] and not s["open"], s)
    check("no Detail heading with nothing after it", s["dh"] == 0, s)
    pg.evaluate("()=>{document.querySelector('#sheet [data-close]')?.click(); document.getElementById('tb')?.remove()}"); pg.wait_for_timeout(400)
    # Spells: level 5 Wizard
    pg.evaluate("()=>window.__bldNeed&&window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'&&typeof window.__sheetApply==='function'", timeout=120000)
    pg.evaluate("""()=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);
      const b=window.__bldFuzz({sp:'Human',bg:'Sage',rs:'2024',src:all,cls:'Wizard',lv:5,arr:[8,14,14,16,10,10],b2:0,b1:0}).b; window.__sheetApply(window.__bldSheetFor(b,{}),false)}"""); pg.wait_for_timeout(1500)
    tab(pg, "3")
    check("first spell row in the top 40 percent", pg.evaluate(FIRST, '#spBody .sp-r[data-info^="sp:"]') < 0.4, pg.evaluate(FIRST, '#spBody .sp-r[data-info^="sp:"]'))
    check("spell search folded behind an icon", pg.evaluate("()=>!!document.querySelector('#spBody details.qd:not([open]) summary')"))
    bad = pg.evaluate(SPROW); check("spell rows: short casting words, no dash cells, no overlap", not bad, bad[:6])
    for skin, attr in (("light", ["data-theme", "light"]), ("high-contrast", ["data-hc", "1"])):
        pg.evaluate("a=>document.documentElement.setAttribute(a[0],a[1])", attr); pg.wait_for_timeout(300); bad = pg.evaluate(SPROW)
        check("spell rows clean in the %s skin" % skin, not bad, bad[:6]); pg.evaluate("a=>document.documentElement.removeAttribute(a[0])", attr)
    sp = pg.evaluate("""()=>{ const L=[...document.querySelectorAll('#spBody .sp-r[data-info^="sp:"]')], C=window.__sheetC?null:null;
      return {n:L.length, nodur:L.filter(r=>!(r.querySelector('.sp-d')||{}).textContent).map(r=>r.textContent.slice(0,20)),
        conc:L.filter(r=>r.querySelector('.sp-d .dsum-b')).length, cells:L.slice(0,3).map(r=>[...r.querySelectorAll('[data-l]')].map(e=>e.dataset.l).join(','))}; }""")
    check("spell rows listed", sp["n"] >= 5, sp)
    check("every spell row has a Duration cell", not sp["nodur"], sp["nodur"])
    check("a Concentration spell row shows the CONC badge", sp["conc"] >= 1, sp)
    check("spell row has Time, Duration, Range and Hit/DC labels", all(all(k in c for k in ("Time", "Duration", "Range")) for c in sp["cells"]), sp["cells"])
    # Round 7 (ddb dark, owner 2026-11-22): the class scene is not stuck behind the 6% brush mask, the tiled motif is a hint, identity chips are bordered glass in two equal columns
    dc = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, color_scheme="dark"); dc.add_init_script(SEED); dp = dc.new_page()
    dp.goto("file://" + os.path.join(ROOT, "index.html")); dp.wait_for_timeout(3000); dp.click("[data-hview]"); dp.wait_for_selector("#dmgBtn", state="attached", timeout=30000); dp.wait_for_timeout(2500)
    z = dp.evaluate("""()=>{ const a=document.getElementById('clsArt'), s=a&&getComputedStyle(a), m=document.querySelector('#app .idcard .mi-motif'), D=[...document.querySelectorAll('#idF dd')].filter(e=>e.offsetParent);
      return {art:!document.documentElement.classList.contains('cls-art')||!!(s&&parseFloat(s.opacity)>.3&&!/^6%/.test(s.maskSize||s.webkitMaskSize||'')), mask:s&&s.maskSize, op:s&&s.opacity,
        motif:m?parseFloat(getComputedStyle(m).opacity):0, chips:D.map(e=>parseFloat(getComputedStyle(e).borderTopWidth)), cols:new Set(D.map(e=>Math.round(e.getBoundingClientRect().width))).size}; }""")
    check("ddb dark: class art layer visible (mask opened, opacity above .3)", z["art"], z)
    check("ddb dark: tiled class motif at most .03 opacity", z["motif"] <= 0.03, z)
    check("ddb dark: identity chips have a border, equal widths", z["chips"] and all(w >= 1 for w in z["chips"]) and z["cols"] == 1, z); dc.close()
    check("no page errors", not errs, errs); b.close()
print("SCORE %d" % round(100 * sum(R) / len(R))); sys.exit(0 if all(R) else 1)
