import asyncio, json, functools, http.server, socket, threading, sys
from playwright.async_api import async_playwright
ROOT="/tmp/claude-0/main-wt"; SCEN=sys.argv[1]
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
INIT='''window.__cp={};(function(){var sp=CSSStyleDeclaration.prototype.setProperty;
CSSStyleDeclaration.prototype.setProperty=function(n,v,p){try{if(window.__rec&&n.indexOf("--")===0&&this.getPropertyValue(n)!==String(v)){var el=null;var ow=this.__owner;
 var all=[document.documentElement,document.body,document.getElementById("pager"),document.getElementById("app")];for(var i=0;i<all.length;i++){if(all[i]&&all[i].style===this){el=all[i];break}}
 if(!el){var cand=document.querySelectorAll("[style]");for(var j=0;j<cand.length;j++){if(cand[j].style===this){el=cand[j];break}}}
 var cnt=el?el.getElementsByTagName("*").length:-1;var k=(el?el.tagName+(el.id?"#"+el.id:"")+"."+(typeof el.className==="string"?el.className.split(" ")[0]:""):"?")+" "+n+" (desc "+cnt+")";window.__cp[k]=(window.__cp[k]||0)+1}}catch(e){}
 return sp.call(this,n,v,p)};
var ds=Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,"cssText");})()'''
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page(); pg.set_default_timeout(2000); await pg.add_init_script(INIT)
        await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
        tabs=[t for t in await pg.query_selector_all("#bnav button") if await t.is_visible()]
        await pg.evaluate("()=>{window.__rec=true;window.__cp={}}")
        if SCEN=="tabs":
            for t in tabs*2:
                try: await t.click(timeout=1500)
                except Exception: pass
                await pg.wait_for_timeout(300)
        else:
            for _ in range(4):
                await pg.fill("#hpAmt","3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(500); await pg.click("#healBtn"); await pg.wait_for_timeout(500)
        r=await pg.evaluate("()=>window.__cp"); await b.close()
    print(SCEN); [print("%5d  %s"%(v,k)) for k,v in sorted(r.items(),key=lambda x:-x[1])[:14]]
asyncio.run(main())
