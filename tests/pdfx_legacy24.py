"""PDF fallback for 2024 sheets saved before the builder stored `full`. python3 tests/pdfx_legacy24.py
Orc Fighter (2024) from the builder, `full` removed from every feature, then the print model: the appendix must still carry the long
text of Relentless Endurance. Exit 1 when it does not or a page error happens."""
import asyncio, functools, http.server, socket, threading, sys, os
from playwright.async_api import async_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def serve():
    s=socket.socket(); s.bind(("127.0.0.1",0)); p=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",p),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start(); return srv,"http://127.0.0.1:%d/index.html"%p
JS="""(strip)=>{ const L=window.__bldLists('2024'); const r=window.__bldFuzz({cls:'Fighter',sub:'',lv:1,sp:'Orc',bg:'Soldier',arr:L.arr,b2:0,b1:0,src:L.src});
  if(!r||r.err) return {err:String(r&&r.err)}; let n=0;
  if(strip) (function w(v){ if(v&&typeof v==='object'){ if(typeof v.full==='string'&&v.n){ delete v.full; n++; } Object.values(v).forEach(w); } })(r.c);
  const m=window.__pdfModelFor(r.c); if(!m||m.err) return {err:'model '+String(m&&m.err)};
  let t=''; (m.appendix||[]).forEach(g=>g[1].forEach(f=>{ if(f.name==='Relentless Endurance') t=(f.text||[]).join(' '); }));
  return {stripped:n, text:t}; }"""
async def main():
    srv,url=serve(); bad=False
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); pg=await b.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)[:150]))
        await pg.goto(url); await pg.evaluate("()=>localStorage.clear()"); await pg.reload()
        await pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__pdfModelFor",timeout=120000); await pg.evaluate("()=>window.__bldNeed().then(()=>1)")
        for strip in (False,True):
            r=await pg.evaluate(JS,strip); ok=bool(r.get("text")) and "Hit Point" in r["text"] and len(r["text"])>120
            print("strip full:",strip,"| removed:",r.get("stripped"),"| long text in PDF model:",ok,"|",(r.get("err") or r.get("text","")[:70]))
            bad|=not ok
        await b.close()
    srv.shutdown(); print("errors:",errs)
    print("ok" if not bad and not errs else "FAIL"); sys.exit(1 if bad or errs else 0)
asyncio.run(main())
