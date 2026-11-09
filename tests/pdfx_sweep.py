#!/usr/bin/env python3
"""PDFX sweep: every class x every subclass x levels 1, 3, 5, 11, 17, 20, on the 2024 and the 2014 rules, built by the real builder
(__bldFuzz), turned into the print model (__pdfModelFor) and, at levels 1 and 20, drawn by PDFX. One page, no downloads, no clicks.

  python3 tests/pdfx_sweep.py [OUTDIR] [--root DIR] [--levels 1,3,5,11,17,20]

Hard misses (exit 1): builder, model or render error; broken text in the model (undefined, NaN, [object, {dc}, [[link]], HTML tags);
an appendix entry or spell without a short line; a spell without casting time, range or duration; a weapon without a hit value;
a creature without AC or HP; a Druid (level 2+, 2024) or Beast Master without creatures.
Report only (OUTDIR/sweep.json): 2024 features with no full text in the data, page-1 boxes cut (their rest goes to the CONTINUED page), spells past the template rows."""
import asyncio, json, os, sys, functools, http.server, socket, threading
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); args = sys.argv[1:]
def opt(n, d):
    if n in args: i = args.index(n); v = args[i + 1]; del args[i:i + 2]; return v
    return d
ROOT = os.path.abspath(opt("--root", ROOT)); LEVELS = [int(x) for x in opt("--levels", "1,3,5,11,17,20").split(",")]
OUT = os.path.abspath(args[0]) if args else os.path.join(HERE, "out", "pdfx-sweep"); os.makedirs(OUT, exist_ok=True)

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port

LOAD = r"""async ()=>{
  const add=u=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=u;s.onload=res;s.onerror=rej;document.head.appendChild(s)});
  if(!window.PDFLib){ for(const u of ['vendor/pdf/cantoo-pdf-lib-2.11.1.min.js','vendor/pdf/pdf-lib-fontkit-1.1.1.min.js']) await add(u); }
  if(!window.PDFX) throw new Error('PDFX block (src/pdf) did not load');
  const b=u=>fetch(u).then(r=>r.arrayBuffer()), F=['Regular','Medium','SemiBold','Bold','Italic'], fonts={};
  for(const f of F) fonts[f]=await b('vendor/pdf/pdfx-Inter-'+f+'.ttf');
  window.__pxA={tpl:{'2014':await b('vendor/pdf/pdfx-tpl-2014.pdf'),'2024':await b('vendor/pdf/pdfx-tpl-2024.pdf')}, map:await (await fetch('vendor/pdf/pdfx-map.json')).json(), fonts:fonts};
  return true; }"""

CHECK = r"""async (o)=>{
  const r=window.__bldFuzz(o); if(!r||r.err) return {err:'builder: '+String(r&&r.err).slice(0,300)};
  const m=window.__pdfModelFor(r.c); if(!m||m.err) return {err:'model: '+String(m&&m.err).slice(0,400)};
  const bad=[], rep={nofull:[], over:[], spellOver:0};
  const scan=(v,path)=>{ if(v==null) return; if(typeof v==='string'){ if(/\bundefined\b|\bNaN\b|\[object|\{(dc|level|pb|unarmed)\}|\[\[|\]\]|<\/?(b|i|br|span|div|strong|p)\b/.test(v)) bad.push('broken text at '+path+': '+v.slice(0,90)); return; }
    if(Array.isArray(v)) v.forEach((x,i)=>scan(x,path+'['+i+']')); else if(typeof v==='object') Object.keys(v).forEach(k=>scan(v[k],path+'.'+k)); };
  scan(m,'m');
  (m.appendix||[]).forEach(g=>g[1].forEach(f=>{ if(!f.summary) bad.push('no short line: '+g[0]+' / '+f.name);
    if(!f.text.length&&f.summary.length>120&&/^(Feats?$|\w+ Subclass:|[A-Z][a-z]+$)/.test(g[0])) rep.nofull.push(o.rs+' '+g[0]+' / '+f.name); }));
  const sc=m.spellcasting; if(sc) sc.levels.forEach(L=>L.spells.forEach(s=>{ if(!s.summary) bad.push('spell without short line: '+s.name);
    const d={}; s.details.forEach(x=>d[x[0]]=x[1]); ['Casting Time','Range','Duration'].forEach(k=>{ if(!d[k]) bad.push('spell '+s.name+' has no '+k); }); }));
  (m.weapons||[]).forEach(w=>{ if(!w[1]||w[1]==='+NaN') bad.push('weapon without hit: '+w[0]); });
  (m.creatures||[]).forEach(c=>{ const st={}; c.stats.forEach(x=>st[x[0]]=x[1]); if(!st.AC||!st.HP) bad.push('creature without AC/HP: '+c.name); if(!c.summary) bad.push('creature without short line: '+c.name); });
  if(o.rs!=='2014'&&o.cls==='Druid'&&o.lv>=2&&!(m.creatures||[]).length) bad.push('Druid without Wild Shape creatures');
  if(/Beast Master/.test(o.sub||'')&&o.lv>=3&&!(m.creatures||[]).length) bad.push('Beast Master without a companion');
  if(/Beast Master/.test(o.sub||'')&&o.lv>=3){ const tags=(m.creatures||[]).map(c=>c.tag).join('|');
    if(o.rs==='2014'&&(!/Ranger's Companion/.test(tags)||/Primal Companion/.test(tags))) bad.push('Beast Master (2014) without the 2014 Ranger\'s Companion');
    if(o.rs!=='2014'&&/Ranger's Companion/.test(tags)) bad.push('Beast Master (2024) with the 2014 companion'); }
  /* the sheet against the PDF model: everything on the sheet must be in the print */
  const c=r.c, has=(arr,n)=>JSON.stringify(arr||[]).indexOf(JSON.stringify(String(n)).slice(1,-1))>=0;
  (c.features||[]).forEach(g=>(g.items||[]).forEach(f=>{ if(!has(m.appendix,f.n)&&!has(m.appendix,(f.n||'').split(':')[0])) bad.push('sheet feature not in PDF: '+f.n); }));
  (c.spells||[]).forEach(x=>{ if(!has(m.spellcasting&&m.spellcasting.levels,x.n)) bad.push('sheet spell not in PDF: '+x.n); });
  (c.inv||[]).forEach(i=>{ if(!has(m.equipment,i.n)) bad.push('sheet item not in PDF: '+i.n); });
  (c.attacks||[]).filter(a=>a&&a.n&&a.on!==false).forEach(a=>{ if(!has(m.weapons,a.n)&&!has(m.attackNotes,a.n)) bad.push('sheet attack not in PDF: '+a.n); });
  (c.res||[]).forEach(x=>{ if(!/^(hd|pact|s\d)/.test(x.k)&&!has(m.moreFeatures,x.n)&&!has(m.hitDice,x.n)) bad.push('sheet limited use not in PDF: '+x.n); });
  if(+c.darkvision>0&&!has(m.proficiencies,'Darkvision '+c.darkvision)) bad.push('darkvision not in PDF');
  (c.senses||[]).filter(x=>x&&x.n).forEach(x=>{ if(!has(m.proficiencies,x.n)) bad.push('sense not in PDF: '+x.n); });
  (c.defenses||[]).forEach(x=>{ const where=o.rs==='2014'?m.moreFeatures:m.boxes; if(x&&x.v&&!(has(where,x.t)&&has(where,x.v))) bad.push('defense not in PDF: '+x.t+' '+x.v); });
  let pages=null;
  if(o.render){ try{ const out=await PDFX.render(m,window.__pxA,{PDFLib:window.PDFLib,fontkit:window.fontkit}); pages=out.pages;
      out.overflow.forEach(x=>{ if(/^spells:/.test(x)) rep.spellOver++; else rep.over.push(x); }); }
    catch(e){ bad.push('render: '+String(e&&e.message||e).slice(0,200)); } }
  if(o.render&&pages&&rep.over.length&&!pages) bad.push('cut boxes but no pages');
  return {bad:bad, rep:rep, pages:pages, n:{feat:(m.appendix||[]).reduce((t,g)=>t+g[1].length,0), spells:sc?sc.levels.reduce((t,L)=>t+L.spells.length,0):0, cr:(m.creatures||[]).length}};
}"""

async def main():
    srv, url = serve(); res = []; errs = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page(viewport={"width": 1250, "height": 850})
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.goto(url); await pg.evaluate("()=>{localStorage.clear()}"); await pg.reload()
        await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone", timeout=60000)
        await pg.evaluate("()=>window.__bldNeed?window.__bldNeed().then(()=>1):1")
        await pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__pdfModelFor", timeout=120000)
        await pg.evaluate(LOAD)
        LS = {"2024": await pg.evaluate("()=>window.__bldLists()"), "2014": await pg.evaluate("()=>window.__bldLists('2014')")}
        print("lists:", {k: (len(v["cls"]), sum(len(x) for x in v["subs"].values()), len(v["sp"]), len(v["bg"])) for k, v in LS.items()})
        i = 0
        for rs in ("2024", "2014"):
            L = LS[rs]; sps = L["sp"]; bgs = L["bg"]
            for cls in L["cls"]:
                subs24 = [x for x in (L["subs"].get(cls) or []) if rs == "2014" or not x.endswith("(2014)")]
                for sub in (subs24 or [""]):
                    for lv in LEVELS:
                        i += 1
                        o = {"cls": cls, "sub": sub, "lv": lv, "sp": sps[i % len(sps)], "bg": bgs[i % len(bgs)], "arr": L["arr"], "b2": i % 3, "b1": i % 2,
                             "render": lv in (1, 20), "rs": rs, "src": L.get("src")}
                        r = await pg.evaluate(CHECK, o); r["o"] = {k: o[k] for k in ("rs", "cls", "sub", "lv", "sp", "bg")}; res.append(r)
        await b.close()
    srv.shutdown()
    hard = [r for r in res if r.get("err") or r.get("bad")]
    agg = lambda key: sorted({x for r in res for x in (r.get("rep") or {}).get(key, [])})
    rep = {"characters": len(res), "rendered": sum(1 for r in res if r.get("pages")), "hard": len(hard), "page_errors": errs[:20],
           "hard_cases": hard[:80], "no_full_text_2024": agg("nofull"), "boxes_cut": agg("over"),
           "spells_past_rows": sum((r.get("rep") or {}).get("spellOver", 0) for r in res),
           "max_pages": max([r.get("pages") or 0 for r in res] or [0])}
    json.dump(rep, open(os.path.join(OUT, "sweep.json"), "w"), indent=1)
    kinds = {}
    for r in hard:
        for x in ([r["err"]] if r.get("err") else r["bad"]):
            k = x.split(":")[0][:60]; kinds[k] = kinds.get(k, 0) + 1
    print("%d characters (%d rendered), %d with misses, %d page errors, max %d pages" % (rep["characters"], rep["rendered"], len(hard), len(errs), rep["max_pages"]))
    for k, v in sorted(kinds.items(), key=lambda x: -x[1]): print("  %4d  %s" % (v, k))
    print("report only: %d features without full text (2024), boxes cut: %s, spells past rows: %d" % (len(rep["no_full_text_2024"]), rep["boxes_cut"], rep["spells_past_rows"]))
    return 1 if hard or errs else 0

sys.exit(asyncio.run(main()))
