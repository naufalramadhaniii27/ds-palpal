"""Pemindai visual kontrol berstatus.

Untuk tiap kontrol berstatus yang terlihat (.bx, .pip, chip toggle, aria-pressed, aria-checked)
skrip membaca computed style pada dua keadaan (klik asli, lalu klik balik) dan melapor jika
dua keadaan tampak sama. Perbandingan style, bukan screenshot.

Pakai: python3 tests/visual_state_scan.py [--root DIR] [--json OUT.json] [--quick]
Exit 1 jika ada temuan (kecuali ada di allowlist tests/visual_state_allow.json).
"""
import json, sys, os, socket, threading, functools, http.server, time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
args = sys.argv[1:]
if "--root" in args:
    ROOT = args[args.index("--root") + 1]
OUTJ = args[args.index("--json") + 1] if "--json" in args else None
QUICK = "--quick" in args
SELFTEST = "--selftest" in args  # menyuntik aturan CSS yang sengaja merusak, skrip harus menemukannya
COVER = {}

CHARS = [("Warlock", 3, "2024"), ("Warlock", 11, "2024"), ("Wizard", 5, "2024"),
         ("Fighter", 5, "2024"), ("Cleric", 5, "2024"),
         ("Warlock", 3, "2014"), ("Wizard", 5, "2014"), ("Cleric", 5, "2014")]
if QUICK:
    CHARS = CHARS[:2]
WORKERS = 4  # proses paralel, tiap proses punya browser dan server sendiri

def worker_slice():
    if "--worker" in args:
        k, n = args[args.index("--worker") + 1].split("/")
        return CHARS[int(k)::int(n)]
    return CHARS

if "--worker" not in args and "--single" not in args:
    import subprocess, tempfile
    tmp = tempfile.mkdtemp(prefix="vss")
    procs = []
    extra = [a for a in args if a in ("--selftest", "--quick", "--cover", "--diffs")] + (["--root", ROOT] if "--root" in args else [])
    for k in range(WORKERS):
        out = os.path.join(tmp, "w%d.json" % k)
        procs.append((out, subprocess.Popen([sys.executable, "-u", os.path.abspath(__file__), "--worker", "%d/%d" % (k, WORKERS), "--json", out] + extra,
                                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)))
    t0 = time.time(); merged = {}; checked = skipped = 0; cover = {}
    for out, pr in procs:
        pr.wait()
        if not os.path.exists(out):
            print("PROSES GAGAL, tidak ada keluaran:", out); sys.exit(2)
        d = json.load(open(out))
        checked += d["checked"]; skipped += d["skipped"]
        for k2, v in d["cover"].items(): cover[k2] = cover.get(k2, 0) + v
        for f in d["rows"]:
            m = merged.setdefault(f["sel"], dict(f, where=[]))
            m["where"] = sorted(set(m["where"]) | set(f["where"]))
    allow = json.load(open(os.path.join(HERE, "visual_state_allow.json"))) if os.path.exists(os.path.join(HERE, "visual_state_allow.json")) else []
    rows = list(merged.values())
    for r in rows: r["allowed"] = r["sel"] in allow
    print("Tanda tangan teruji: %d, kontrol diperiksa: %d, dilewati: %d, waktu %.0f detik" % (len(cover), checked, skipped, time.time() - t0))
    if "--cover" in args:
        for k2 in sorted(cover): print("  ", k2, cover[k2])
    for r in rows:
        print("%s  %s  aria=%s -> %s  (%d tempat, contoh: %s)" % ("IZIN " if r["allowed"] else "SAMA ", r["sel"], r["aria"][0], r["aria"][1], len(r["where"]), r["where"][0]))
    bad = [r for r in rows if not r["allowed"]]
    if OUTJ: json.dump(rows, open(OUTJ, "w"), indent=1, ensure_ascii=False)
    print("TEMUAN: %d" % len(bad))
    sys.exit(1 if bad else 0)

VIEWS = [(390, 844), (1250, 850)]
TABS = ["Actions", "Spells", "Inventory", "Features & Traits", "Description", "Notes", "Extras"]

s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = "http://127.0.0.1:%d/index.html" % port

# Daftar kontrol berstatus yang terlihat, dengan tanda tangan untuk dedup.
LIST_JS = r"""()=>{
 const sel='.bx,.pip,[aria-pressed],[aria-checked],.chip,.tog';
 const out=[],seen={};let n=0;
 document.querySelectorAll(sel).forEach(el=>{
  if(!el.offsetParent) return; const r=el.getBoundingClientRect(); if(r.width<4||r.height<4) return;
  if(el.closest('[hidden],[inert]')) return;
  const sig=el.tagName.toLowerCase()+'.'+[...el.classList].filter(c=>!/^(on|sel|used|open|active|lvup)$/.test(c)).sort().join('.')+
   (el.dataset.k?'[k='+el.dataset.k+']':'')+(el.dataset.hdk!=null?'[hdk]':'')+
   '<'+(el.parentElement?(el.parentElement.className+'').split(' ').filter(c=>!/^(on|sel)$/.test(c)).join('.'):'')+
   (el.closest('.spsl')?'<.spsl':'')+(el.closest('.lu')?'<.lu':'');
  if(seen[sig]) return; seen[sig]=1;
  el.setAttribute('data-vss',String(n)); out.push({i:n,sig:sig}); n++;
 });
 return out;}"""

# Satu ukuran keadaan: style elemen, ::before, ::after, dan anak langsung.
STATE_JS = r"""(i)=>{
 const el=document.querySelector('[data-vss="'+i+'"]'); if(!el) return null;
 const P=['backgroundImage','backgroundColor','borderTopColor','borderTopWidth','opacity','color','boxShadow','filter','outlineStyle','transform','textDecorationLine','fill','stroke','content','display','visibility'];
 const snap=(n,ps)=>{const c=getComputedStyle(n,ps||null);const o={};P.forEach(p=>o[p]=c[p]);return o};
 const parts={el:snap(el),before:snap(el,'::before'),after:snap(el,'::after')};
 [...el.children].slice(0,4).forEach((c,k)=>{parts['c'+k]=snap(c);parts['c'+k+'b']=snap(c,'::before')});
 const aria={p:el.getAttribute('aria-pressed'),c:el.getAttribute('aria-checked'),cls:[...el.classList].filter(c=>/^(on|sel|used|active)$/.test(c)).join(' '),
  d:el.getAttribute('aria-disabled')||(el.disabled?'1':null)};
 return {parts,aria,txt:(el.textContent||'').trim().slice(0,24),html:el.innerHTML.length+':'+(el.innerHTML.match(/href="[^"]*"/g)||[]).join()};}"""


CYCLE_JS = "async(seen)=>{const LIST=("+LIST_JS+");const ST=("+STATE_JS+");const tick=()=>new Promise(r=>setTimeout(()=>requestAnimationFrame(r),20));"+\
 """const first=LIST();const rows=[];let skipped=0;const todo=first.map(c=>c.sig).filter(s=>seen.indexOf(s)<0);
 for(const sig of todo){
  try{const c=LIST().filter(x=>x.sig===sig)[0];if(!c){continue}seen.push(sig);
   const A=ST(c.i);if(!A||A.aria.d){skipped++;continue}
   document.querySelector('[data-vss="'+c.i+'"]').click();await tick();
   let c2=LIST().filter(x=>x.sig===sig)[0];let B=c2?ST(c2.i):null;
   for(let w=0;w<6&&B&&JSON.stringify(A.aria)===JSON.stringify(B.aria)&&A.txt===B.txt;w++){await tick();await tick();c2=LIST().filter(x=>x.sig===sig)[0];B=c2?ST(c2.i):null}
   await tick();B=c2?ST(c2.i):B;
   if(c2)document.querySelector('[data-vss="'+c2.i+'"]').click();await tick();
   if(!B||JSON.stringify(A.aria)===JSON.stringify(B.aria)){skipped++;continue}
   rows.push({c:c,A:A,B:B});}catch(e){skipped++}}
 return {rows:rows,skipped:skipped,seen:seen};}"""

def add_css(pg, css):
    """CSP menolak <style> sisipan. Lembar gaya adopsi tidak ditolak."""
    pg.evaluate("(c)=>{const s=new CSSStyleSheet();s.replaceSync(c);document.adoptedStyleSheets=[...document.adoptedStyleSheets,s]}", css)

def painted(sn):
    """::before atau ::after menggambar sesuatu (isi ada dan ada latar)."""
    if not sn or sn.get("content") in ("none", "normal", None): return False
    bg = sn.get("backgroundColor", "")
    return sn.get("backgroundImage", "none") != "none" or not bg.endswith(", 0)") and bg not in ("rgba(0, 0, 0, 0)", "transparent")

def diff(a, b):
    d = []
    # Bila ::before menggambar penuh, latar dan garis tepi elemen tertutup olehnya, jadi tidak dihitung.
    cover = painted(a["parts"].get("before")) or painted(b["parts"].get("before"))
    skipEl = ("backgroundImage", "backgroundColor", "borderTopColor", "borderTopWidth", "boxShadow")
    for part in a["parts"]:
        for k, v in a["parts"][part].items():
            w = (b["parts"].get(part) or {}).get(k)
            if v != w:
                if cover and part == "el" and k in skipEl: continue
                # ::before yang menggambar: yang menentukan tampilan adalah isinya (latar), bukan cincin tipis
                if cover and part == "before" and k in ("borderTopColor", "borderTopWidth", "boxShadow"): continue
                d.append(part + "." + k)
    return d

findings = {}
checked = 0
skipped = 0
t0 = time.time()

with sync_playwright() as p:
    br = p.chromium.launch()
    ctx = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
    pg = ctx.new_page(); pg.set_default_timeout(120000)
    pg.goto(BASE); pg.wait_for_function("()=>!!window.__deferDone"); pg.wait_for_timeout(800)
    for cls, lv, ed in worker_slice():
        r = pg.evaluate("""async (a)=>{ if(window.__bldNeed) await window.__bldNeed(); const b=window.__bldQuickFor(a[0],a[1]);
            if(!b) return null; if(a[2]==='2014') b.rs='2014'; return JSON.stringify([b,window.__bldSheetFor(b)]) }""", [cls, lv, ed])
        if not r:
            print("lewati", cls, lv, ed); continue
        b, C = json.loads(r)
        for (w, h) in VIEWS:
            pg.set_viewport_size({"width": w, "height": h})
            if (w, h) == VIEWS[0]:
                pg.evaluate("(v)=>{localStorage.clear(); localStorage.setItem('phb24-builder-v1', v[0]); localStorage.setItem('yudhi-kelapa-build-v3', v[1])}",
                            [json.dumps(b), json.dumps(C)])
            seen = []
            if (w, h) == VIEWS[0]:
                pg.goto(BASE); pg.wait_for_function("()=>!!window.__deferDone"); pg.wait_for_timeout(700)
                add_css(pg, "*,*::before,*::after{transition:none!important}")
                if SELFTEST:
                    # Menghidupkan lagi bug pact: buang :not([aria-pressed="true"]) dari aturan hijau
                    print("selftest", pg.evaluate("""()=>{let n=0;const walk=(rs)=>{for(const r of rs){if(r.cssRules&&!r.selectorText)walk(r.cssRules);
                        else if(r.selectorText&&r.selectorText.includes('pact')&&r.selectorText.includes(':not(')){r.selectorText=r.selectorText.replace(/:not\\(\\[aria-pressed="true"\\]\\)/,'');n++}}};
                        for(const sh of document.styleSheets){try{walk(sh.cssRules)}catch(e){}}return n}"""))
                pg.evaluate("()=>{var b=[...document.querySelectorAll('#homeV button')].filter(x=>/Continue/.test(x.textContent))[0]; b&&b.click()}")
            pg.wait_for_timeout(500)
            pages = [("Home", None)] + [(t, t) for t in TABS]
            for pname, tab in pages:
                if tab:
                    pg.evaluate("(t)=>{var x=[...document.querySelectorAll('.tab,[data-tab]')].filter(e=>e.textContent.trim()===t)[0]; x&&x.click()}", tab)
                    pg.wait_for_timeout(200)
                else:
                    # Home: kembali ke Home bila ada tombol, jika tidak lewati
                    ok = pg.evaluate("()=>{var b=document.querySelector('#homeBtn,[data-act=home],.home-btn');if(b){b.click();return true}return false}")
                    if not ok: continue
                    pg.wait_for_timeout(500)
                res = pg.evaluate(CYCLE_JS, seen); seen = res["seen"]
                skipped += res["skipped"]
                for r in res["rows"]:
                    checked += 1
                    COVER[r["c"]["sig"]] = COVER.get(r["c"]["sig"], 0) + 1
                    if "--diffs" in args and "pact" in r["c"]["sig"]: print("   DIFF", r["c"]["sig"], diff(r["A"], r["B"]), flush=True)
                    A, Bs, c = r["A"], r["B"], r["c"]
                    d = diff(A, Bs)
                    vis = [x for x in d if not x.endswith(".transform")]
                    if A["txt"] != Bs["txt"] or A["html"] != Bs["html"]: vis.append("isi")  # teks atau ikon berganti, tampak beda
                    if not vis:
                        f = findings.setdefault(c["sig"], {"sel": c["sig"], "where": set(), "aria": [A["aria"], Bs["aria"]],
                                                         "transformOnly": bool(d), "txt": A["txt"]})
                        f["where"].add("%s%s %s %s %dx%d" % (cls, lv, ed, pname, w, h))
                # tutup overlay yang mungkin terbuka
                pg.keyboard.press("Escape")
            print("selesai", cls, lv, ed, w, "t=%.0fs" % (time.time() - t0), flush=True)
    br.close()

allow = []
ap = os.path.join(HERE, "visual_state_allow.json")
if os.path.exists(ap):
    allow = json.load(open(ap))
rows = []
for f in findings.values():
    f["where"] = sorted(f["where"])
    f["allowed"] = f["sel"] in allow
    rows.append(f)
print("Tanda tangan teruji: %d" % len(COVER))
if "--cover" in args:
    for k in sorted(COVER): print("  ", k, COVER[k])
print("\nDiperiksa: %d kontrol (dua keadaan), dilewati: %d, waktu %.0f detik" % (checked, skipped, time.time() - t0))
bad = [r for r in rows if not r["allowed"]]
for r in rows:
    print("%s  %s  aria=%s -> %s  (%d tempat, contoh: %s)" % ("IZIN " if r["allowed"] else "SAMA ", r["sel"], r["aria"][0], r["aria"][1], len(r["where"]), r["where"][0]))
if OUTJ:
    if "--worker" in args:
        json.dump({"rows": rows, "checked": checked, "skipped": skipped, "cover": COVER}, open(OUTJ, "w"), ensure_ascii=False)
    else:
        json.dump(rows, open(OUTJ, "w"), indent=1, ensure_ascii=False)
print("TEMUAN: %d" % len(bad))
sys.exit(1 if bad else 0)
