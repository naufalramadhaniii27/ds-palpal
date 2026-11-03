"""M11: opening and closing a screen 50 times must not add listeners. addEventListener / removeEventListener are wrapped before the app runs, and the
number of live listeners (target, type, function, capture) is read before and after 50 rounds of each screen. The page has Yudhi's sheet at 390x844."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8"))
SEED = "(v=>{try{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v);localStorage.setItem('mi-fx','off')}catch(e){}})(" + json.dumps(json.dumps(d)) + ")"
COUNT = """(()=>{ var L=new Map(), ids=new WeakMap(), n=0, id=o=>{ if(o==null) return 'x'; if(typeof o!=='object'&&typeof o!=='function') return 'p'; var v=ids.get(o); if(!v){ v=++n; ids.set(o,v); } return v; };
 var key=(t,ty,f,o)=>id(t)+'|'+ty+'|'+id(f)+'|'+(typeof o==='boolean'?o:(o&&o.capture)?1:0);
 var add=EventTarget.prototype.addEventListener, rem=EventTarget.prototype.removeEventListener;
 EventTarget.prototype.addEventListener=function(ty,f,o){ if(f&&!(o&&o.once)&&!(o&&o.signal&&o.signal.aborted)){ var k=key(this,ty,f,o); L.set(k,ty); if(o&&o.signal) o.signal.addEventListener('abort',()=>L.delete(k),{once:true}); } return add.call(this,ty,f,o); };
 EventTarget.prototype.removeEventListener=function(ty,f,o){ L.delete(key(this,ty,f,o)); return rem.call(this,ty,f,o); };
 window.__lc=()=>{ var by={}; L.forEach(ty=>{ by[ty]=(by[ty]||0)+1; }); return {n:L.size,by:by}; }; })();"""
SCREENS = {
 "settings": ("()=>document.getElementById('themeBtn').click()", "()=>{var c=document.getElementById('sheetClose');c&&c.click()}"),
 "library": ("()=>window.__app.libOpen()", "()=>{var c=document.querySelector('#lib [data-x=close],#lib [data-lib=close]');if(c)c.click();else document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))}"),
 "learn": ("()=>window.__learnOpen()", "()=>{var c=document.querySelector('#learn [data-l=close]');c&&c.click()}"),
 "training ground": ("()=>window.__tgOpen()", "()=>{history.back()}"),
 "builder": ("()=>window.__bldOpen()", "()=>{history.back()}"),
 "reverse builder": ("()=>window.__rbOpen()", "()=>{var c=document.getElementById('sheetClose');c&&c.click()}"),
}
R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:300]))
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={"width": 390, "height": 844}); ctx.add_init_script(COUNT); ctx.add_init_script(SEED); pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("file://" + os.path.join(ROOT, "index.html")); pg.wait_for_selector("#homeV", state="attached", timeout=30000); pg.wait_for_function("()=>!!window.__deferDone", timeout=90000); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{var e=document.querySelector('[data-hview]');e&&e.click()}"); pg.wait_for_timeout(800)
    only = sys.argv[1:]
    for name, (o, c) in SCREENS.items():
        if only and name not in only: continue
        for _ in range(3): pg.evaluate(o); pg.wait_for_timeout(500); pg.evaluate(c); pg.wait_for_timeout(500)
        a = pg.evaluate("()=>window.__lc()")
        for _ in range(50): pg.evaluate(o); pg.wait_for_timeout(120); pg.evaluate(c); pg.wait_for_timeout(120)
        z = pg.evaluate("()=>window.__lc()")
        grow = {k: z["by"].get(k, 0) - a["by"].get(k, 0) for k in z["by"] if z["by"].get(k, 0) != a["by"].get(k, 0)}
        check("%s: listeners after 50 rounds (%d -> %d)" % (name, a["n"], z["n"]), z["n"] - a["n"] <= 5, grow)
    check("no page errors", not errs, errs)
    b.close()
print("SCORE %d" % round(100 * sum(R) / len(R))); sys.exit(0 if all(R) else 1)
