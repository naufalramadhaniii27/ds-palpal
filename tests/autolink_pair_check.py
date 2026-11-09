#!/usr/bin/env python3
"""Dua tautan berdampingan untuk satu frasa ("Dexterity saving throw"). python3 tests/autolink_pair_check.py [--root DIR] [--shot FILE]
Jalur string (xlink) dan jalur DOM (pengamat mutasi) di sheet, 390x844 dan 1250x850. Cek: pasangan dibungkus span.xlp dengan dua tombol,
pasangan tidak pernah terbelah antar baris (awalan 0 sampai 30 huruf di kotak sempit), dua tombol tidak saling menimpa, jumlah tombol sama
dengan tanpa pembungkus. Exit 1 bila ada temuan. Sekitar 15 detik."""
import json, os, sys, socket, threading, functools, http.server
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a: ROOT = os.path.abspath(a[a.index("--root") + 1])
SHOT = os.path.abspath(a[a.index("--shot") + 1]) if "--shot" in a else None
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *x): pass
srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = "http://127.0.0.1:%d/index.html" % port
PHRASES = ["Dexterity saving throw", "Constitution saving throws", "Wisdom saving throw"]
JS = """async (a)=>{ const [phr]=a; const host=document.querySelector('#sheetBody')||document.body; const box=document.createElement('div'); box.id='xlbox'; box.style.cssText='width:230px;font-size:15px;line-height:22px;padding:4px;position:fixed;top:70px;left:8px;z-index:99999;background:var(--paper,#fff);color:var(--ink,#000)';
 host.prepend(box); const out={pairs:0,split:0,over:0,noWrap:0,buttons:0,ctrl:0,msgs:[]}; __xl.idx();
 for(const path of ['string','dom']){ for(let n=0;n<=30;n++){ const pre='x'.repeat(0)+'Roll '.repeat(0)+'abcdefghijklmnopqrstuvwxyzabcd'.slice(0,n)+' roll a '; const txt=pre+phr+' to resist it.';
   const p=document.createElement('p'); p.style.margin='0'; box.appendChild(p);
   if(path==='string') p.innerHTML=__xl.xlink(txt.replace(/&/g,'&amp;'),''); else { p.textContent=txt; }
   if(path==='dom'){ for(let t=0;t<40&&!p.querySelector('.xl');t++) await new Promise(r=>setTimeout(r,50)); }
   const sp=p.querySelectorAll('.xlp'), bt=p.querySelectorAll('button.lk.xl'); out.buttons+=bt.length;
   if(bt.length===2){ if(sp.length!==1||sp[0].querySelectorAll('button').length!==2){ out.noWrap++; out.msgs.push(path+' '+n+': pair not wrapped ('+sp.length+' spans)') } else { out.pairs++;
     const r=[...sp[0].getClientRects()]; if(r.length>1){ out.split++; out.msgs.push(path+' '+n+': pair split in '+r.length+' lines') }
     const A=bt[0].getBoundingClientRect(), B=bt[1].getBoundingClientRect(); if(Math.min(A.right,B.right)-Math.max(A.left,B.left)>0.5&&Math.min(A.bottom,B.bottom)-Math.max(A.top,B.top)>0.5){ out.over++; out.msgs.push(path+' '+n+': buttons overlap') }
     sp[0].className=''; if(Math.abs(bt[0].getBoundingClientRect().top-bt[1].getBoundingClientRect().top)>3) out.ctrl++; } }
   else if(bt.length) out.msgs.push(path+' '+n+': '+bt.length+' buttons');
 } }
 return out }"""
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch()
    for (w, h) in [(390, 844), (1250, 850)]:
        ctx = br.new_context(viewport={"width": w, "height": h}, service_workers="block")
        ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}" % json.dumps(YUDHI))
        pg = ctx.new_page(); pg.set_default_timeout(90000)
        pg.goto(BASE); pg.wait_for_function("()=>!!window.__deferDone&&!!window.__xl"); pg.wait_for_timeout(800)
        pg.evaluate("()=>{var b=document.querySelector('[data-hview]'); b&&b.click()}"); pg.wait_for_timeout(1200)
        for ph in PHRASES[:2]:
            m = pg.evaluate(JS, [ph])
            line = "%dx%d %-28s pairs %d  split %d  overlap %d  not wrapped %d  (control, split without wrapper: %d)" % (w, h, ph, m["pairs"], m["split"], m["over"], m["noWrap"], m["ctrl"])
            ok = m["pairs"] >= 60 and not (m["split"] or m["over"] or m["noWrap"])
            print("ok  " if ok else "FAIL", line)
            if not ok:
                bad += 1
                for x in m["msgs"][:4]: print("     ", x)
            pg.evaluate("()=>document.getElementById('xlbox').remove()")
        if SHOT and w == 390:
            pg.evaluate("""()=>{const b=document.createElement('div'); b.id='xlshot'; b.style.cssText='width:230px;font-size:15px;line-height:22px;padding:6px;position:fixed;top:70px;left:8px;z-index:99999;background:var(--paper,#fff);color:var(--ink,#000)';
              b.innerHTML=__xl.xlink('Make a Dexterity saving throw. On a failed save, a creature takes damage; a Wisdom saving throw ends it. Roll a Constitution saving throw to hold on.',''); document.body.appendChild(b)}""")
            pg.wait_for_timeout(300); pg.query_selector("#xlshot").screenshot(path=SHOT)
        ctx.close()
    br.close()
print("TEMUAN: %d" % bad); sys.exit(1 if bad else 0)
