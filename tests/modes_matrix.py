#!/usr/bin/env python3
"""Modes matrix: skins, palettes, Color-blind, One-handed, text size 90 and 130, backdrop, frame, High Contrast.
  python3 tests/modes_matrix.py [config,config|all] [390x844,768x1024,1250x850]
Per screen: sideways overflow, controls under 44 px on phones, clipped text. Prints OK or the first findings. The .hcreate clip on Home is an entrance animation and comes and goes."""
import asyncio, json, sys, itertools
import os, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
class S:
    async_playwright = staticmethod(async_playwright)
    @staticmethod
    def serve():
        s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close()
        class Q(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *a): pass
        srv = http.server.ThreadingHTTPServer(("127.0.0.1", p), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
        return "http://127.0.0.1:%d/index.html" % p
MEAS = r"""()=>{
 const W=innerWidth,H=innerHeight;
 let e=document.elementFromPoint(W/2,H/2),root=null;
 for(let x=e;x&&x!==document.body;x=x.parentElement){const c=getComputedStyle(x);if(c.position==='fixed'&&x.getBoundingClientRect().width>W*.5)root=x}
 root=root||document.body;
 const o={root:(root.id?'#'+root.id:'')+'.'+(typeof root.className==='string'?root.className.split(' ')[0]:'')};
 const vis=x=>{const r=x.getBoundingClientRect();if(r.width<2||r.height<2)return false;const c=getComputedStyle(x);return c.visibility!=='hidden'&&c.display!=='none'&&+c.opacity>0.05};
 const inScr=x=>{for(let p=x.parentElement;p&&p!==root.parentElement;p=p.parentElement){const c=getComputedStyle(p);if((c.overflowX==='auto'||c.overflowX==='scroll')&&p.scrollWidth>p.clientWidth+1)return true}return false};
 const nm=x=>(x.id?'#'+x.id:'')+(typeof x.className==='string'&&x.className?'.'+x.className.split(' ')[0]:x.tagName.toLowerCase())+'"'+(x.textContent||'').trim().replace(/\\s+/g,' ').slice(0,18)+'"';
 o.side=[];o.small=[];o.clip=[];o.over=[];
 const hit=x=>{const r=x.getBoundingClientRect();const cx=Math.min(Math.max(r.left+r.width/2,1),W-1),cy=Math.min(Math.max(r.top+r.height/2,1),H-1);const t=document.elementFromPoint(cx,cy);return t&&(x===t||x.contains(t)||t.contains(x))};
 const ctr=[...document.querySelectorAll('button,a[href],input,select,textarea,[role=button]')].filter(x=>vis(x)&&hit(x)&&x.getBoundingClientRect().top<H&&x.getBoundingClientRect().bottom>0);
 ctr.forEach(x=>{const r=x.getBoundingClientRect();if((r.right>W+1||r.left<-1)&&!inScr(x))o.side.push(nm(x));
   if(W<700&&(r.height<43.5||r.width<43.5)&&x.tagName!=='INPUT'&&!(x.type==='checkbox'||x.type==='radio')){const t=(x.textContent||'').trim();if(!(x.classList.contains('lk')||x.classList.contains('hlink')||(x.matches('a')&&getComputedStyle(x).display==='inline')))o.small.push(Math.round(r.width)+'x'+Math.round(r.height)+' '+nm(x))}});
 for(let i=0;i<ctr.length;i++)for(let j=i+1;j<ctr.length;j++){const a=ctr[i],b=ctr[j];if(a.contains(b)||b.contains(a))continue;const p=a.getBoundingClientRect(),q=b.getBoundingClientRect();const ox=Math.min(p.right,q.right)-Math.max(p.left,q.left),oy=Math.min(p.bottom,q.bottom)-Math.max(p.top,q.top);if(ox>3&&oy>3)o.over.push(nm(a)+' x '+nm(b))}
 [...root.querySelectorAll('*')].filter(vis).forEach(x=>{const c=getComputedStyle(x);if(x.scrollWidth>x.clientWidth+2&&x.clientWidth>8&&(c.overflowX==='hidden'||c.overflowX==='clip')&&c.textOverflow!=='ellipsis'&&(x.textContent||'').trim()&&x.children.length<3&&!inScr(x))o.clip.push(nm(x))});
 for(const k of ['side','small','clip','over'])o[k]=[...new Set(o[k])].slice(0,6);
 return o}"""
Y=open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
CFG={
 "ddb-dark":{"skin":"ddb","theme":"dark"},
 "ddb-light":{"skin":"ddb","theme":"light"},
 "rec-light":{"skin":"record","theme":"light"},
 "rec-dark":{"skin":"record","theme":"dark"},
 "cb":{"skin":"ddb","theme":"dark","set":{"cb":"1"}},
 "oneh":{"skin":"ddb","theme":"dark","set":{"oneh":"1"}},
 "fs130-ddb":{"skin":"ddb","theme":"dark","set":{"fs":"130"}},
 "fs130-rec":{"skin":"record","theme":"light","set":{"fs":"130"}},
 "fs90":{"skin":"ddb","theme":"dark","set":{"fs":"90"}},
 "bd-stone":{"skin":"ddb","theme":"dark","bdrop":"stone"},
 "bd-parchment":{"skin":"ddb","theme":"light","bdrop":"parchment"},
 "bd-none":{"skin":"ddb","theme":"dark","bdrop":""},
 "frame-wood":{"skin":"ddb","theme":"dark","frame":"wood"},
 "frame-gilded":{"skin":"record","theme":"light","frame":"gilded"},
}
for pal in ["ocean","royal","slate","grove","crimson","ember","gold"]:
    CFG["pal-"+pal+"-d"]={"skin":"ddb","theme":"dark","color":pal}
    CFG["pal-"+pal+"-r"]={"skin":"record","theme":"light","color":pal}
CFG["hc-ddb"]={"skin":"ddb","theme":"dark"}
CFG["hc-rec"]={"skin":"record","theme":"light"}
CFG["hc-ddb-light"]={"skin":"ddb","theme":"light"}
CFG["hc-rec-dark"]={"skin":"record","theme":"dark"}
async def run(only,widths):
    base=S.serve(); out=[]
    async with S.async_playwright() as p:
        b=await p.chromium.launch()
        for name in only:
            cfg=CFG[name]
            for W,H in widths:
                ctx=await b.new_context(viewport={"width":W,"height":H},service_workers="block",has_touch=W<600)
                sh={k:v for k,v in cfg.items()}
                await ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);localStorage.setItem('yudhi-kelapa-sheet-v1',%s);if(%s)localStorage.setItem('cs-ui-hc','{\"m\":\"on\"}');sessionStorage.setItem('__s','1')}"%(json.dumps(Y),json.dumps(json.dumps(sh)),"true" if name.startswith("hc") else "false"))
                pg=await ctx.new_page(); pg.set_default_timeout(12000); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
                await pg.goto(base); await pg.wait_for_timeout(2000)
                rows=[]
                async def meas(tag):
                    m=await pg.evaluate(MEAS); pw=await pg.evaluate("document.documentElement.scrollWidth-innerWidth")
                    bad=m["side"] or m["small"] or m["clip"] or pw>0
                    if bad: rows.append((tag,pw,m["side"][:2],m["small"][:2],m["clip"][:2]))
                await meas("home")
                await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="attached"); await pg.wait_for_timeout(1500)
                for i,tab in [(1,"p-skills"),(2,"p-actions"),(3,"p-spells"),(4,"p-inv"),(5,"p-feat"),(6,"p-desc"),(7,"p-notes"),(8,"p-ext")]:
                    try:
                        if W<700: await pg.click(f"[data-go='{i}']")
                        else:
                            if tab=="p-skills": continue
                            await pg.click(f"[data-tab='{tab}']")
                    except Exception: continue
                    await pg.wait_for_timeout(450); await meas(tab)
                if name in ("fs130-rec","hc-ddb","hc-rec","cb","oneh","bd-parchment","frame-wood","pal-gold-r") and W in (390,1250):
                    await pg.screenshot(path=f"/tmp/mo-{name}-{W}.png")
                print(name,W,"OK" if not rows and not errs else "",rows[:3] if rows else "",errs[:1] if errs else "",flush=True)
                await ctx.close()
        await b.close()
only=sys.argv[1].split(",") if len(sys.argv)>1 and sys.argv[1]!="all" else list(CFG)
widths=[(390,844),(768,1024),(1250,850)] if len(sys.argv)<3 else [tuple(map(int,x.split("x"))) for x in sys.argv[2].split(",")]
asyncio.run(run(only,widths))
