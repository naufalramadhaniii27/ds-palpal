# Research prototype N90 (2026-10-30): DOM-based HTML cleaner versus the current Trusted Types default policy.
# Runs in a plain page (no Trusted Types) with Playwright. Does not touch the app.
import asyncio, json
from playwright.async_api import async_playwright
OLD = r"""
var BAD=/<\s*\/?\s*(script|iframe|object|embed|base|meta)\b|\son[a-z]+\s*=|javascript\s*:/i;
var strip=function(s){ return s.replace(/<\s*(script|iframe|object|embed)\b[\s\S]*?<\s*\/\s*\1\s*>/gi,"").replace(/<\s*\/?\s*(script|iframe|object|embed|base|meta)\b[^>]*>/gi,"").replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,"").replace(/javascript\s*:/gi,"blocked:"); };
window.oldClean=function(s){ s=String(s); if(!BAD.test(s)) return s; return strip(s); };
"""
NEW = r"""
var DROP_EL={script:1,iframe:1,object:1,embed:1,base:1,meta:1,link:1,style:0,frame:1,frameset:1,applet:1};
var okUrl=function(v){ var t=String(v).replace(/[\s\x00-\x1f]/g,"").toLowerCase(); return !/^(javascript|vbscript|data):/.test(t) || /^data:image\/(png|jpeg|jpg|gif|webp|avif);/.test(t); };
window.newClean=function(html){
  var t=document.createElement("template"); t.innerHTML=String(html);
  var changed=false;
  var walk=function(n){ var kids=[].slice.call(n.childNodes);
    kids.forEach(function(k){ if(k.nodeType!==1) return; var tag=k.localName;
      if(DROP_EL[tag]===1||tag==="script"){ k.remove(); changed=true; return; }
      [].slice.call(k.attributes).forEach(function(a){ var nm=a.name.toLowerCase();
        if(/^on/.test(nm)||nm==="srcdoc"){ k.removeAttribute(a.name); changed=true; }
        else if((nm==="href"||nm==="src"||nm==="action"||nm==="formaction"||nm==="xlink:href"||nm==="poster"||nm==="data")&&!okUrl(a.value)){ k.removeAttribute(a.name); changed=true; } });
      if(k.content) walk(k.content); walk(k); }); };
  walk(t.content);
  return changed? t.innerHTML : String(html);
};
"""
BENIGN = ["Rage: once = 1 per rest","Spell slots: one = 1st level","Javascript: a language","Note on = 5","Uses: only = true","Plain note","Dagger, Light, Thrown","Chain Mail (AC 16)","He said \"hello\" & left","Level 3 > level 2 < level 4","100% done","A&amp;B &lt;b&gt; escaped","<b>bold</b> and <i>italic</i>","<button type=\"button\" class=\"x\" data-info=\"f:0.0\">Rage once = 1</button>","<div class=\"row\"><span>Online = good</span></div>","Burning hands: 3d6 fire; save = half","Conditions: on fire = 1d10","onion = vegetable","Sorcery points: once per day = 2","Pak Budi's \"selamat\" = ok","Kelapa: sekali = satu"]
# the app escapes text with esc() first, so benign HTML is escaped text plus its own markup
MAL = ["<script>window.__pwn=1</script>","<img src=x onerror=\"window.__pwn=2\">","<svg onload=\"window.__pwn=3\">","<a href=\"javascript:window.__pwn=4\" id=lnk>x</a>","<iframe src=\"javascript:window.__pwn=5\"></iframe>","<div onclick=\"window.__pwn=6\" id=clk>x</div>","<IMG SRC=x ONERROR=\"window.__pwn=7\">","<a href=\" jav&#x09;ascript:window.__pwn=8\" id=lnk2>x</a>","<form action=\"javascript:window.__pwn=9\"><button id=fb>go</button></form>","<object data=\"javascript:window.__pwn=10\"></object>","<embed src=\"javascript:window.__pwn=11\">","<meta http-equiv=\"refresh\" content=\"0;url=javascript:window.__pwn=12\">","<base href=\"javascript:window.__pwn=13//\">","<svg><script>window.__pwn=14</script></svg>","<input autofocus onfocus=\"window.__pwn=15\">","<details open ontoggle=\"window.__pwn=16\">x</details>","<button formaction=\"javascript:window.__pwn=17\" id=fb2>x</button>","<math><mtext><table><mglyph><style><img src=x onerror=\"window.__pwn=18\">","<video><source onerror=\"window.__pwn=19\"></video>","<body onload=\"window.__pwn=20\">","<a href=\"data:text/html,<script>window.__pwn=21</script>\" id=lnk3>x</a>","<svg><a xlink:href=\"javascript:window.__pwn=22\"><text>x</text></a></svg>","<img src=x onerror=window.__pwn=23>","<div style=\"background:url(javascript:window.__pwn=24)\">x</div>","<template><img src=x onerror=\"window.__pwn=25\"></template>"]
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page()
        await pg.add_init_script("(function(){" + OLD + NEW + "})()"); await pg.goto("about:blank")
        r = await pg.evaluate("""(args)=>{ var B=args[0], out={oldB:0,newB:0,oldBex:[],newBex:[]};
          B.forEach(function(s){ var o=window.oldClean(s), n=window.newClean(s); if(o!==s){out.oldB++; out.oldBex.push([s,o]);} if(n!==s){out.newB++; out.newBex.push([s,n]);} }); return out; }""", [BENIGN])
        print("Benign texts: %d. Old policy changed %d. New cleaner changed %d." % (len(BENIGN), r["oldB"], r["newB"]))
        for s, o in r["oldBex"][:6]: print("   old mangles:", repr(s), "->", repr(o))
        for s, o in r["newBex"][:6]: print("   new mangles:", repr(s), "->", repr(o))
        res = {}
        for name in ("oldClean", "newClean"):
            ran = []
            for i, p in enumerate(MAL):
                await pg.goto("about:blank"); await pg.evaluate("()=>{ window.__pwn=0; }")
                await pg.evaluate("([n,p])=>{ var d=document.createElement('div'); document.body.appendChild(d); d.innerHTML=window[n](p); [].forEach.call(d.querySelectorAll('a,button,div,input,form'),function(e){ try{e.click();}catch(x){} }); try{ var f=d.querySelector('form'); if(f) f.submit(); }catch(x){} }", [name, p])
                await pg.wait_for_timeout(60)
                try: v = await pg.evaluate("()=>window.__pwn")
                except Exception: v = "navigated"
                if v: ran.append((i + 1, p[:48], v))
            res[name] = ran
        print("Malicious payloads: %d" % len(MAL))
        print("   old policy: %d ran %s" % (len(res["oldClean"]), [x[0] for x in res["oldClean"]]))
        print("   new cleaner: %d ran %s" % (len(res["newClean"]), [x[0] for x in res["newClean"]]))
        for x in res["newClean"]: print("      new ran:", x)
        await b.close()
asyncio.run(main())
