#!/usr/bin/env python3
"""Tampilan toggle zero-miss-2 (Active effects). python3 tests/fx_toggle_layout.py [--root DIR] [--shots DIR]
14 karakter, tiap satu punya toggle dari src/data/fx-Z2.js. Di 390x844 dan 1250x850, dua keadaan (mati, hidup).
Cek per chip: teks terpotong (scrollWidth lebih besar dari clientWidth, termasuk <small>), chip keluar layar, chip saling menimpa,
jumlah baris label, tinggi chip. Exit 1 bila ada temuan. Sekitar 40 detik."""
import json, os, sys, socket, threading, functools, http.server
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a: ROOT = os.path.abspath(a[a.index("--root") + 1])
SHOTS = os.path.abspath(a[a.index("--shots") + 1]) if "--shots" in a else None
if SHOTS: os.makedirs(SHOTS, exist_ok=True)
WL = {"STR": 10, "DEX": 12, "CON": 14, "INT": 10, "WIS": 10, "CHA": 18}
NOSP = {"unset": {}}
# (nama, build, id toggle yang dicari)
CH = [
 ("falcon", dict(cls="Barbarian", level=14, sub="Path of the Wild Heart"), "wild-falcon"),
 ("dragon-wings-24", dict(cls="Sorcerer", level=14, sub="Draconic Sorcery"), "dragon-wings"),
 ("dragon-wings-14", dict(rs="2014", cls="Sorcerer", level=14, sub="Draconic Bloodline"), "dragon-wings"),
 ("otherworldly", dict(rs="2014", cls="Sorcerer", level=14, sub="Divine Soul"), "otherworldly-wings"),
 ("in-flesh", dict(cls="Sorcerer", level=14, sub="Aberrant Sorcery"), "flesh-aquatic"),
 ("avenging-24", dict(cls="Paladin", level=20, sub="Oath of Vengeance"), "avenging-angel"),
 ("avenging-14", dict(rs="2014", cls="Paladin", level=20, sub="Oath of Vengeance (2014)"), "avenging-angel"),
 ("psi-leap", dict(cls="Fighter", level=11, sub="Psi Warrior"), "psi-leap"),
 ("dread-ambusher", dict(cls="Ranger", level=3, sub="Gloom Stalker"), "dread-ambusher"),
 ("epitome", dict(cls="Monk", level=17, sub="Warrior of the Elements"), "epitome-step"),
 ("stars-dragon", dict(cls="Druid", level=10, sub="Circle of the Stars"), "stars-dragon"),
 ("charger", dict(cls="Fighter", level=4, ch={"feat4": {"feat": "Charger", "a1": "STR"}}), "charger-dash"),
 ("draconic-flight", dict(cls="Fighter", level=5, extra=dict({"species": "Dragonborn"}, **NOSP)), "draconic-flight"),
 ("large-form", dict(cls="Fighter", level=5, extra=dict({"species": "Goliath"}, **NOSP)), "large-form"),
]
srv = None
s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *x): pass
srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = "http://127.0.0.1:%d/index.html" % port

MK = """async (a)=>{ if(window.__bldNeed) await window.__bldNeed(); const s=a[0];
 const b=window.__bldTestB();
 if(s.rs==='2014'){ b.rs='2014'; b.species='Human (2014)'; b.bg='Acolyte (2014)' } else { delete b.rs; b.species='Human'; b.bg='Soldier' }
 b.cls=s.cls; b.sub=s.sub||''; b.level=s.level; b.name='ZM'; b.ch=Object.assign({},s.ch); b.inv=[]; b.weps=[]; b.base=Object.assign({},b.base||{},{STR:10,DEX:12,CON:14,INT:10,WIS:10,CHA:18}); if(s.extra) Object.assign(b,s.extra);
 return JSON.stringify([b,window.__bldSheetFor(b)]) }"""
MEASURE = """(id)=>{ const g=document.querySelector('#fxT'); if(!g||g.hidden) return {err:'no #fxT'};
 const chips=[...g.querySelectorAll('.fxchip')]; const me=g.querySelector('[data-fxt="'+id+'"]'); if(!me) return {err:'toggle '+id+' not shown'};
 const vw=innerWidth, out={n:chips.length,issues:[],chips:[]};
 const rs=chips.map(c=>c.getBoundingClientRect());
 chips.forEach((c,i)=>{ const r=rs[i], b=c.querySelector('b'), sm=c.querySelector('small'); const lh=parseFloat(getComputedStyle(b).lineHeight)||16*1.15;
  const lines=Math.round(b.getBoundingClientRect().height/lh); const t=b.textContent;
  const cut=(e)=>e&&(e.scrollWidth-e.clientWidth>1);
  const info={id:c.dataset.fxt,label:t,lines:lines,h:Math.round(r.height),w:Math.round(r.width)}; out.chips.push(info);
  if(cut(b)) out.issues.push(t+': label cut'); if(cut(sm)) out.issues.push(t+': source line cut ('+sm.textContent+')');
  const pgE=c.closest('[id^="p-"]')||document.body, pr=pgE.getBoundingClientRect(); if(r.left<pr.left-0.5||r.right>pr.right+0.5||pr.width>vw+1) out.issues.push(t+': outside its page (chip '+Math.round(r.left-pr.left)+'..'+Math.round(r.right-pr.left)+', page width '+Math.round(pr.width)+', screen '+vw+')');
  if(c.scrollWidth-c.clientWidth>1) out.issues.push(t+': chip content wider than chip');
  if(lines>2) out.issues.push(t+': '+lines+' lines');
  if(sm&&Math.round(sm.getBoundingClientRect().height/(parseFloat(getComputedStyle(sm).lineHeight)||13))>3) out.issues.push(t+': source line over 3 lines');
  const k=c.querySelector('.fxchip-k').getBoundingClientRect(), tb=b.getBoundingClientRect(); if(k.right>tb.left+1) out.issues.push(t+': switch overlaps text');
  for(let j=i+1;j<chips.length;j++){ const q=rs[j], ox=Math.min(r.right,q.right)-Math.max(r.left,q.left), oy=Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top); if(ox>1&&oy>1) out.issues.push(t+' overlaps '+chips[j].textContent.slice(0,20)); }
 });
 return out }"""

ONLY = a[a.index("--only") + 1].split(",") if "--only" in a else None
if ONLY: CH = [c for c in CH if c[0] in ONLY]
bad = 0; seen_lab = {}
with sync_playwright() as p:
    br = p.chromium.launch()
    ctx = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
    pg = ctx.new_page(); pg.set_default_timeout(60000)
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
    pg.goto(BASE); pg.wait_for_function("()=>!!window.__deferDone"); pg.wait_for_timeout(600)
    for name, b, tid in CH:
        r = pg.evaluate(MK, [b])
        B, C = json.loads(r)
        pg.evaluate("(v)=>{localStorage.clear(); localStorage.setItem('phb24-builder-v1', v[0]); localStorage.setItem('yudhi-kelapa-build-v3', v[1])}", [json.dumps(B), json.dumps(C)])
        pg.reload(); pg.wait_for_function("()=>!!window.__deferDone"); pg.wait_for_timeout(500)
        pg.evaluate("()=>{var b=[...document.querySelectorAll('#homeV button,[data-hview]')].filter(x=>/Continue/.test(x.textContent)||x.hasAttribute('data-hview'))[0]; b&&b.click()}")
        try: pg.wait_for_function("(id)=>{var e=document.querySelector('#fxT [data-fxt=\"'+id+'\"]');return !!e&&e.offsetParent!==null}", arg=tid, timeout=20000)
        except Exception: pass
        for (w, h) in [(390, 844), (1250, 850)]:
            pg.set_viewport_size({"width": w, "height": h}); pg.wait_for_timeout(250)
            if w < 700:
                pg.evaluate("()=>{var b=document.querySelector('#bnav [data-go=\"0\"],[data-go=\"0\"]'); b&&b.click()}")
                for _ in range(3):
                    try: pg.wait_for_function("(id)=>{var e=document.querySelector('#fxT [data-fxt=\"'+id+'\"]');if(!e)return false;var r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1}", arg=tid, timeout=7000); break
                    except Exception:
                        pg.evaluate("(id)=>{var e=document.querySelector('#fxT [data-fxt=\"'+id+'\"]'); e&&e.scrollIntoView({inline:'center',block:'center'})}", tid)
                pg.wait_for_timeout(200)
            else:
                pg.evaluate("()=>{var b=document.querySelector('[data-tab=\"p-actions\"]'); b&&b.click()}"); pg.wait_for_timeout(300)
            for st in ("off", "on"):
                if st == "on":
                    pg.evaluate("(id)=>{var e=document.querySelector('[data-fxt=\"'+id+'\"]'); e&&e.click()}", tid); pg.wait_for_timeout(250)
                m = pg.evaluate(MEASURE, tid)
                tag = "%s %dx%d %s" % (name, w, h, st)
                if "err" in m: print("ERR ", tag, m["err"]); bad += 1; continue
                for c in m["chips"]: seen_lab[c["id"]] = c
                if m["issues"]:
                    bad += 1; print("FAIL", tag, m["issues"][:4])
                if SHOTS and st == "on":
                    el = pg.query_selector("#fxT")
                    el.scroll_into_view_if_needed(); el.screenshot(path=os.path.join(SHOTS, "fx-%s-%d.png" % (name, w)))
            if SHOTS is None: pass
        # kembalikan ke 390 untuk reload berikut
        pg.set_viewport_size({"width": 390, "height": 844})
    br.close()
print("Chip teruji:", len(seen_lab))
for k, c in sorted(seen_lab.items()): print("  %-18s %d baris, %dpx  %s" % (k, c["lines"], c["h"], c["label"]))
for e in errs[:5]: print("pageerror", e)
print("TEMUAN: %d" % bad); sys.exit(1 if bad else 0)
