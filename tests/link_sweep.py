#!/usr/bin/env python3
"""Link sweep: every name that has an entry in the database must be a link wherever it is printed.
  python3 tests/link_sweep.py [OUTDIR] [--root DIR] [--vp 1250x850] [--quick] [--report]

For each test character (the old Yudhi sheet and rich builds: Warden 10, a Cleric, a Wizard, an Aberrant Horror) the sweep opens the sheet,
walks the header and every tab, opens every detail sheet that the tabs link to (one level), and reads all visible text nodes that are not inside
a button, link, input or other control. A phrase that equals a database name exactly (same name set as the Library: __bldData(), GLOSS, LIB_RULES,
spells, feats, items, creatures, weapons, armor, gear, species, classes, subclasses, backgrounds, conditions, rests, skills, actions) and is not
a link is a miss. Phrases the app leaves plain on purpose are counted apart as "stopped", each with its reason (STOP below).
Then it clicks a sample of every link type and asserts the detail sheet it opens is not empty (no dead link).
Exit code 1 on any miss, any dead link, or any page error. --report prints the misses and exits 0 (for measuring)."""
import asyncio, functools, http.server, json, os, socket, sys, threading
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
ROOT = os.path.dirname(HERE)
if "--root" in args:
    i = args.index("--root"); ROOT = os.path.abspath(args[i + 1]); del args[i:i + 2]
VPS = [("390x844", 390, 844), ("1250x850", 1250, 850)]
if "--vp" in args:
    i = args.index("--vp"); w, h = args[i + 1].split("x"); VPS = [(args[i + 1], int(w), int(h))]; del args[i:i + 2]
QUICK = "--quick" in args
REPORT = "--report" in args
FULL = "--full" in args
args = [a for a in args if not a.startswith("--")]
OUT = os.path.abspath(args[0]) if args else os.path.join(HERE, "out", "link_sweep")
os.makedirs(OUT, exist_ok=True)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
GB = os.path.join(HERE, "golden", "builds")
CHARS = [("yudhi", None), ("warden10", "warforged_warden10_tower.json"), ("cleric16", "fsub_hunting16_resolute_hunter.json"),
         ("wizard8", "fx_C_battlecaster_weapon.json"), ("aberrant", "fx_G_aberrant_chitinous_on.json")]
if QUICK:
    CHARS = CHARS[:2]


def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port


# Words and shapes the app leaves plain on purpose. Each entry says why. The sweep and the app use the same rule, so a change in one must be made in the other.
STOP = {
    # single common English words that are also database names. A capital letter only shows up at a sentence start or in a label, and a link there would be noise.
    "words": "Light Heavy Range Slow Push Help Search Study Ready Magic Influence Size Speed Attack Reaction Hide Languages Sap Vex Nick Graze Topple Cleave Reload "
             "Finesse Thrown Versatile Initiative Proficiency Resistance Immunity Reach Hover Concentration Cover Damage Healing Save Object Monster Creature Hazard Line Cone Cube "
             "Cylinder Sphere Emanation Darkness Common Ally Enemy Friendly Hostile Indifferent Dead Per Day Campaign Adventure Encounter Climbing Flying Jumping Crawling Possession Curses "
             "Illusions Alignment Attitude Expertise Ritual Cantrip Quiver Arrows Dagger Spear Club Shield Rope Torch Bell Chest Ladder Light Net Hammer Lamp Blanket Bedroll "
             "Dice Ammunition Magical Effect Hit Points Wild Shape".split(),
    # structural: the entry is printed as a heading or label by the app itself (stat labels, tile keys, section headers)
    "labels": "Speed Size Range Languages Initiative Damage Duration Components Target Time Save Type Level Source Weight Cost Properties Mastery Reach Resistance Vulnerability".split(),
}
STOP_ALL = set(STOP["words"]) | set(STOP["labels"])

JS_NAMES = r"""async (opts)=>{
  var N=new Map(), add=function(n,k,kind){ n=String(n||'').replace(/\s*\[.*\]\s*$/,'').replace(/\s*\(.*\)\s*$/,'').replace(/\s+/g,' ').trim().replace(/’/g,"'"); if(n.length<3||!/^[A-Z]/.test(n)||!/^[A-Za-z0-9+' -]+$/.test(n)) return; if(!N.has(n)) N.set(n,[]); var a=N.get(n); if(a.indexOf(kind)<0) a.push(kind); };
  var d=window.__bldData?window.__bldData():{};
  Object.keys(window.__GLOSS||{}).forEach(n=>add(n,0,'gloss:'+window.__GLOSS[n].c));
  var R=window.__xl&&window.__xl.rules?window.__xl.rules():{}; Object.keys(R).forEach(n=>add(n,0,'rule'));
  (window.SPELLS||[]).forEach(x=>add(x[0],0,'spell'));
  Object.keys(window.FEATS||{}).forEach(n=>add(n,0,'feat'));
  Object.keys(d.feats||{}).forEach(n=>add(n,0,'feat'));
  (window.DMGI||[]).forEach(x=>add(x[0],0,'item'));
  ((window.CREATURES&&window.CREATURES.creatures)||[]).forEach(c=>add(c.n,0,'creature'));
  Object.keys(window.WEAPONS||{}).forEach(n=>add(n,0,'weapon'));
  Object.keys(window.ARMOR||{}).forEach(n=>add(n,0,'armor'));
  (window.GEAR||[]).forEach(x=>{ if(!/[(\[]/.test(x[0])) add(x[0],0,'gear'); });
  Object.keys(window.SPECIES||{}).forEach(n=>add(n,0,'species'));
  Object.keys(d.species||{}).forEach(n=>add(n,0,'species'));
  Object.keys(window.CLASSES||{}).forEach(c=>{ add(c,0,'class'); Object.keys(window.CLASSES[c].subs||{}).forEach(s=>add(s,0,'sub')); });
  Object.keys(d.classes||{}).forEach(c=>{ add(c,0,'class'); Object.keys(d.classes[c].subs||{}).forEach(s=>add(s,0,'sub')); });
  Object.keys(window.BACKGROUNDS||{}).forEach(n=>add(n,0,'bg'));
  Object.keys(d.bgs||{}).forEach(n=>add(n,0,'bg'));
  (window.MANEUVERS||[]).concat(window.INVOCATIONS||[],window.METAMAGIC||[]).forEach(x=>add(x[0],0,'option'));
  var Q=window.QREFS||{}; ['rule','optfeat','facility','hazard','disease','vehicle','object','language','feature'].forEach(c=>(Q[c]||[]).forEach(r=>{ var nm=String(r.n).replace(/\s*[\[(].*$/,'').trim(); if(/^(rule|optfeat|hazard|disease|vehicle|object|feature)$/.test(c)&&nm.indexOf(' ')<0) return; if(c==='language'&&nm==='Common') return; add(r.n,0,c==='rule'?'rule':c); }));
  var FIRM=new Set('Advantage Disadvantage Darkvision Initiative Exhaustion Dash Disengage Dodge Utilize Grapple Shove Blindsight Truesight Tremorsense'.split(' ')), SIZE=new Set('Tiny Small Medium Large Huge Gargantuan'.split(' '));
  var o={}; N.forEach((v,k)=>{ if(SIZE.has(k)) return; var multi=k.indexOf(' ')>0, lv=0; if(!multi){ var gl=v.filter(x=>x.indexOf('gloss:')===0), nonrule=v.some(x=>!(x==='rule'||x.indexOf('gloss:')===0)); if(FIRM.has(k)||gl.some(x=>/^gloss:Condition/.test(x))) lv=0; else if(nonrule||gl.some(x=>/^gloss:(Skill|Ability|Heavy armor|Gear|Equipment pack|Ammunition|Gaming set|.*weapon$)/.test(x))) lv=1; else lv=2; } o[k]={k:v,l:lv}; var pl=k+'s'; if(lv<2&&!/s$/.test(k)&&!N.has(pl)&&!o[pl]) o[pl]={k:v,l:lv}; }); return o; }"""

JS_SWEEP = r"""(args)=>{
  var NAMES=window.__LSN, STOP=new Set(args.stop), root=args.root?document.querySelector(args.root):document.body, own=String(args.own||'').trim();
  var out=[], total=0, W=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  var SKIP='h1,h2,h3,summary,label,.fcat,a,button,input,textarea,select,option,script,style,svg,canvas,[contenteditable],[data-info],[data-bd],[data-lib-open],[data-lnk],[role=button],[role=tab],.lk,.lnk,.sw,#toasts,.toast';
  var re=/[A-Za-z0-9+'’-]+/g, n;
  while((n=W.nextNode())){
    var t=n.nodeValue; if(!t||t.length<3||!/[A-Z]/.test(t)) continue;
    var el=n.parentElement; if(!el||el.closest(SKIP)) continue;
    if(el.checkVisibility&&!el.checkVisibility({checkVisibilityCSS:true})) continue;
    t=t.replace(/’/g,"'"); total++;
    var tk=[], q; re.lastIndex=0; while((q=re.exec(t))) tk.push([q.index,q.index+q[0].length]);
    var i=0;
    while(i<tk.length){
      var a=tk[i][0], ch=t.charAt(a), hit=null, L2=0;
      if(ch>='A'&&ch<='Z'){
        for(var L=Math.min(6,tk.length-i);L>=1;L--){
          var ok=true; for(var j=i+1;j<i+L;j++){ if(t.slice(tk[j-1][1],tk[j][0])!==' '){ ok=false; break; } }
          if(!ok) continue;
          var ph=t.slice(a,tk[i+L-1][1]); if(NAMES[ph]){ hit=ph; L2=L; break; }
        }
      }
      if(!hit){ i++; continue; }
      var kinds=NAMES[hit].k, lvl=NAMES[hit].l, why='', single=hit.indexOf(' ')<0, before=t.slice(Math.max(0,a-40),a), after=t.slice(tk[i+L2-1][1],tk[i+L2-1][1]+30);
      if(hit===own){ i+=L2; continue; }
      if(kinds.indexOf('spell')>=0&&kinds.length>1&&hit.indexOf(' ')<0&&!/^: Used/.test(t.slice(tk[i+L2-1][1],tk[i+L2-1][1]+7))&&!/\b(?:spells?|cast|casts|casting|cantrips?)\b/i.test(t.slice(Math.max(0,a-40),a).split(/[.!?:]\s/).pop())){ kinds=kinds.filter(k=>k!=='spell'); lvl=kinds.every(k=>k==='rule'||k.indexOf('gloss:')===0)?(kinds.some(k=>/^gloss:(Condition)/.test(k))?0:(kinds.some(k=>/^gloss:(Skill|Ability|.*weapon$)/.test(k))?1:2)):1; }
      if(single){
        var pw=/([A-Za-z][A-Za-z'-]*) $/.exec(before);
        if(pw&&/^[A-Z]/.test(pw[1])&&!/^(The|A|An|Each|Any|Your|This|That|One|If|When|While|You|It|Its|On|In|At|As|For|With|Once|Until|After|Before|No|Choose|Cast|Casts|Roll|Both|Either|All|Other|Another|Of)$/.test(pw[1])) why='part of a longer proper name';
        else if(lvl===2&&!/^ (?:actions?|propert(?:y|ies)|mastery|masteries|conditions?|rules?)\b/.test(after)) why='common word, a term only before action/property/mastery: '+hit;
        else { var start=!pw && (/(^|[.!?:]\s+)$/.test(before)); var whole=t.trim().replace(/[.:,;]+$/,'')===hit;
          if(lvl===1&&start&&!whole&&!/^\s*,\s+[A-Z]/.test(after)&&!kinds.every(k=>k==='spell'||k==='feat')) why='sentence start';
          if(!why&&kinds.every(k=>k==='spell')&&!/^: Used/.test(after)&&!/\b(?:spells?|cast|casts|casting|cantrips?)\b/i.test(before.split(/[.!?:]\s/).pop())) why='spell word without spell context';
          if(!why&&kinds.every(k=>k==='feat')&&!/\bfeats?\b/i.test(before.split(/[.!?:]\s/).pop())) why='feat word without feat context';
          if(!why&&kinds.some(k=>/^(gear|bg|class|sub|species|weapon|armor)$/.test(k))&&/^ [A-Z]/.test(after)) why='part of a longer proper name'; }
      }
      out.push({p:hit, k:kinds.join(','), w:why, c:(before.slice(-25)+'['+hit+']'+after).replace(/\s+/g,' '), at:(function(){ var e=el, c=[]; while(e&&c.length<4){ c.push(e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className?'.'+e.className.split(' ')[0]:'')); e=e.parentElement; } return c.join('<'); })()});
      i+=L2;
    }
  }
  return {total:total, hits:out};
}"""

JS_LOAD = r"""async (b)=>{ var C=window.__bldSheetFor(b); if(!C||!C.abilities) return 'no sheet'; window.__sheetSoft(C); return 'ok'; }"""

JS_SPECS = r"""()=>{ var s={}, root=document.body; root.querySelectorAll('[data-info]').forEach(e=>{ if(e.closest('#sheet')) return; var k=e.getAttribute('data-info'); if(k&&!/^(w|it|sp|xd|spx|grp|cond|ab|sk):?/.test(k.split(':')[0]+':')||k) s[k]=(s[k]||0)+1; }); return Object.keys(s); }"""


async def main():
    srv, url = serve()
    res = {"miss": [], "stopped": {}, "dead": [], "errors": [], "texts": 0, "links": {}}
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for vp, W, H in VPS:
            ctx = await br.new_context(viewport={"width": W, "height": H}, service_workers="block")
            pg = await ctx.new_page(); pg.set_default_timeout(120000)
            pg.on("pageerror", lambda e: res["errors"].append(str(e)))
            pg.on("dialog", lambda d: (res["errors"].append("native dialog: " + d.message), asyncio.ensure_future(d.dismiss())))
            await pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}" % json.dumps(YUDHI))
            await pg.goto(url); await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone", timeout=90000)
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }")
            await pg.wait_for_function("()=>!!window.__bldSheetFor&&!!window.__xl&&!!window.__setSrc", timeout=90000)
            await pg.wait_for_timeout(1500)
            await pg.evaluate("()=>{ (window.WX&&window.WX.src||[]).forEach(x=>window.__setSrc(x.id,true)); }")
            # open the sheet from Home when Home is showing
            await pg.evaluate("()=>{ var b=document.querySelector('[data-hview]'); if(b&&b.offsetParent) b.click(); }")
            await pg.wait_for_timeout(1500)
            names = await pg.evaluate(JS_NAMES, {})
            for cid, fn in CHARS:
                tag = "%s/%s" % (vp, cid)
                if fn:
                    b = json.load(open(os.path.join(GB, fn)))["build"]
                    await pg.evaluate("ids=>ids.forEach(k=>window.__setSrc(k,true))", [k for k, v in (b.get("src") or {}).items() if v and k != "core"])
                    r = await pg.evaluate(JS_LOAD, b)
                    if r != "ok": res["errors"].append("%s: %s" % (tag, r)); continue
                else:
                    await pg.evaluate("t=>{ localStorage.setItem('yudhi-kelapa-build-v3', t); }", YUDHI)
                    await pg.reload(); await pg.wait_for_function("()=>!!window.__bldSheetFor&&!!window.__xl", timeout=90000); await pg.wait_for_timeout(2500)
                    await pg.evaluate("()=>{ var b=document.querySelector('[data-hview]'); if(b&&b.offsetParent) b.click(); }"); await pg.wait_for_timeout(1500)
                await pg.evaluate("n=>{window.__LSN=n}", names)
                await pg.wait_for_timeout(800)
                async def sweep(where, root=None, own=""):
                    await pg.evaluate("()=>{ if(window.__xlFlush){ window.__xlFlush(); window.__xlFlush(); window.__xlFlush(); } }")
                    r = await pg.evaluate(JS_SWEEP, {"root": root, "own": own})
                    res["texts"] += r["total"]
                    for h in r["hits"]:
                        h["where"] = "%s %s" % (tag, where)
                        if h["w"]:
                            res["stopped"].setdefault(h["w"], 0); res["stopped"][h["w"]] += 1
                        else:
                            res["miss"].append(h)
                # header and all tabs
                await sweep("header", "header, .idcard, #idc, #top")
                tabs = await pg.evaluate("()=>Array.from(document.querySelectorAll('#tabs .tab')).map(t=>t.getAttribute('data-tab'))")
                specs = set()
                for t in tabs:
                    await pg.evaluate("t=>{ var b=document.querySelector('#tabs .tab[data-tab=\"'+t+'\"]'); if(b) b.click(); }", t)
                    await pg.wait_for_timeout(350)
                    await sweep("tab " + t, "#" + t)
                    for s in await pg.evaluate("""t=>Array.from(document.querySelectorAll('#'+t+' [data-info]')).map(e=>e.getAttribute('data-info'))""", t): specs.add(s)
                for s in await pg.evaluate("""()=>Array.from(document.querySelectorAll('#app [data-info], header [data-info]')).map(e=>e.getAttribute('data-info'))"""): specs.add(s)
                # detail sheets: every distinct spec found (one level), by the same entry point the user taps
                kinds = {}
                for s in sorted(specs):
                    kinds.setdefault(s.split(":")[0], []).append(s)
                opened = 0
                for kind, lst in kinds.items():
                    for s in (lst if FULL else lst[:6 if QUICK else 20]):
                        info = await pg.evaluate("""s=>{ try{ var inf=window.__xl.info(s); return {t:inf.t, h:String(inf.h||'')}; }catch(e){ return {err:String(e)}; } }""", s)
                        if info.get("err") or len(info.get("h", "")) < 20 or "Not found" in info.get("h", "")[:200] or "No details yet" in info.get("h", "")[:200]:
                            res["dead"].append("%s %s -> %s" % (tag, s, (info.get("err") or info.get("h", ""))[:80])); continue
                        # draw the detail in the real sheet and sweep it
                        await pg.evaluate("s=>{ var b=document.querySelector('[data-info=\"'+s.replace(/\"/g,'\\\\\"')+'\"]'); if(b) b.click(); }", s)
                        await pg.wait_for_timeout(40)
                        vis = await pg.evaluate("()=>document.getElementById('sheet')&&document.getElementById('sheet').classList.contains('on')")
                        if vis:
                            opened += 1
                            await sweep("detail " + s, "#sheetBody", info.get("t") or "")
                            await pg.evaluate("()=>{ var x=document.querySelector('#sheetClose, #sheet [data-close], .sh-x'); if(x) x.click(); else if(window.closeSheet) window.closeSheet(); }")
                            await pg.wait_for_timeout(40)
                res["links"][tag] = {"specs": len(specs), "opened": opened}
                # click check: a sample of every link type found in the tabs
                for t in tabs:
                    await pg.evaluate("t=>{ var b=document.querySelector('#tabs .tab[data-tab=\"'+t+'\"]'); if(b) b.click(); }", t)
                    await pg.wait_for_timeout(200)
                    sample = await pg.evaluate("""t=>{ var seen={}, out=[]; document.querySelectorAll('#'+t+' button.xl, #'+t+' button.lk[data-info]').forEach((e,i)=>{ var k=(e.getAttribute('data-info')||'').split(':')[0]+(e.getAttribute('data-info')||'').split(':')[1].split('|')[0].slice(0,4); if(seen[k]) return; seen[k]=1; out.push(e.getAttribute('data-info')); }); return out.slice(0,12); }""", t)
                    for s in sample:
                        await pg.evaluate("s=>{ var b=Array.from(document.querySelectorAll('[data-info]')).filter(e=>e.getAttribute('data-info')===s&&e.offsetParent)[0]; if(b) b.click(); }", s)
                        await pg.wait_for_timeout(150)
                        body = await pg.evaluate("()=>{ var b=document.getElementById('sheetBody'); var on=document.getElementById('sheet').classList.contains('on'); return on&&b?b.innerText.trim():null; }")
                        if not body or len(body) < 25 or "Not found" in body[:120]:
                            res["dead"].append("%s click %s -> %s" % (tag, s, (body or "(no sheet)")[:60]))
                        res["links"].setdefault("clicked", 0); res["links"]["clicked"] += 1
                        await pg.evaluate("()=>{ var x=document.querySelector('#sheetClose, #sheet [data-close], .sh-x'); if(x) x.click(); }")
                        await pg.wait_for_timeout(60)
            await ctx.close()
        await br.close()
    # report
    seen = {}
    for m in res["miss"]:
        key = m["p"]
        seen.setdefault(key, []).append(m)
    print("text nodes read: %d" % res["texts"])
    print("MISSES: %d occurrences, %d distinct names" % (len(res["miss"]), len(seen)))
    for k, v in sorted(seen.items(), key=lambda kv: -len(kv[1]))[:80]:
        print("  %-28s x%-3d %-24s e.g. %s | %s | %s" % (k, len(v), v[0]["k"][:24], v[0]["c"], v[0]["where"], v[0]["at"]))
    print("STOPPED (left plain on purpose): %s" % json.dumps(res["stopped"], sort_keys=True)[:900])
    print("DEAD LINKS: %d" % len(res["dead"]))
    for d in res["dead"][:30]: print("  -", d)
    print("PAGE ERRORS: %d" % len(res["errors"]))
    for e in res["errors"][:5]: print("  -", e[:200])
    json.dump(res, open(os.path.join(OUT, "link_sweep.json"), "w"), indent=1)
    ok = not res["miss"] and not res["dead"] and not res["errors"]
    print("link_sweep %s" % ("OK" if ok else "FAIL"))
    sys.exit(0 if (ok or REPORT) else 1)


asyncio.run(main())
