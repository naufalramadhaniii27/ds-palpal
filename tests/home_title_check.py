#!/usr/bin/env python3
"""Judul Home di 390x844 tidak terpotong. python3 tests/home_title_check.py [--root DIR] [--shot FILE]
Cek h1 ".hhead h1": min-height 44px terpasang, tinggi dan lebar isi tidak melebihi kotak (tanpa potong), garis teks ada di dalam kotak,
tidak menimpa tombol di .hhead. Diulang untuk 360 dan 320 px. Exit 1 bila ada temuan. Sekitar 15 detik."""
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
JS = """()=>{ const h=document.querySelector('#homeV .hhead h1'); if(!h) return {err:'no h1'}; const c=getComputedStyle(h), r=h.getBoundingClientRect();
 const rg=document.createRange(); rg.selectNodeContents(h); const t=rg.getBoundingClientRect(); const out={issues:[],h:Math.round(r.height),min:c.minHeight,text:h.textContent.trim(),art:document.documentElement.classList.contains('g0-art')};
 if(r.height<43.5) out.issues.push('height '+r.height+' under 44');
 if(h.scrollHeight-h.clientHeight>1) out.issues.push('content taller than box by '+(h.scrollHeight-h.clientHeight));
 if(h.scrollWidth-h.clientWidth>1) out.issues.push('content wider than box by '+(h.scrollWidth-h.clientWidth));
 if(t.top<r.top-1||t.bottom>r.bottom+1) out.issues.push('text lines outside box (text '+Math.round(t.top)+'-'+Math.round(t.bottom)+', box '+Math.round(r.top)+'-'+Math.round(r.bottom)+')');
 if(t.right>innerWidth+1||t.left<-1) out.issues.push('text outside screen');
 if(/hidden|clip/.test(c.overflowY)&&h.scrollHeight>h.clientHeight) out.issues.push('clipped by overflow');
 [...h.parentElement.querySelectorAll('button,a')].forEach(b=>{ if(!b.offsetParent) return; const q=b.getBoundingClientRect(); const ox=Math.min(t.right,q.right)-Math.max(t.left,q.left), oy=Math.min(t.bottom,q.bottom)-Math.max(t.top,q.top); if(ox>2&&oy>2&&!h.contains(b)) out.issues.push('text overlaps button '+(b.textContent||b.getAttribute('aria-label')||b.className).trim().slice(0,24)+' (text '+Math.round(t.left)+'-'+Math.round(t.right)+', h1 '+Math.round(r.left)+'-'+Math.round(r.right)+' x '+Math.round(r.top)+'-'+Math.round(r.bottom)+', button '+Math.round(q.left)+'-'+Math.round(q.right)+' x '+Math.round(q.top)+'-'+Math.round(q.bottom)+')') });
 return out }"""
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch()
    for (w, hh) in [(390, 844), (360, 740), (320, 640)]:
        for tz in ("1",):
            ctx = br.new_context(viewport={"width": w, "height": hh}, service_workers="block")
            ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}" % json.dumps(YUDHI))
            pg = ctx.new_page(); pg.set_default_timeout(60000)
            pg.goto(BASE); pg.wait_for_function("()=>!!window.__deferDone"); pg.wait_for_timeout(1200)
            pg.evaluate("(z)=>document.documentElement.style.setProperty('--tz',z)", tz); pg.wait_for_timeout(300)
            m = pg.evaluate(JS)
            tag = "%dx%d tz %s" % (w, hh, tz)
            if "err" in m: print("ERR ", tag, m["err"]); bad += 1
            else:
                print("%s  %s  h1 %dpx (min-height %s, art %s) '%s'" % ("FAIL" if m["issues"] else "ok  ", tag, m["h"], m["min"], m["art"], m["text"]))
                for i in m["issues"]: print("      ", i)
                bad += 1 if m["issues"] else 0
                if SHOT and (w, tz) == (390, "1"):
                    pg.query_selector("#homeV .hhead").screenshot(path=SHOT)
            ctx.close()
    br.close()
print("TEMUAN: %d" % bad); sys.exit(1 if bad else 0)
