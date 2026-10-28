#!/usr/bin/env python3
"""T7 storage on IndexedDB: migration from localStorage, more than 5 MB, reload, offline, fallback without IndexedDB, two tabs, clean first start.

  python3 tests/storage_idb.py [OUTDIR]

Exit code 0 only when every check passes and there is no page error.
"""
import asyncio, json, os, sys, socket, threading, functools, http.server, tempfile, shutil
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, "out", "storage_idb")
os.makedirs(OUT, exist_ok=True)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
RES = []; ERRS = []


def check(name, ok, info=""):
    RES.append((name, bool(ok), info)); print(("ok   " if ok else "FAIL ") + name + ("  " + str(info) if info and not ok else ""))


def serve():
    d = tempfile.mkdtemp()
    for n in ("index.html", "sw.js", "manifest.webmanifest", "img", "icons"):
        p = os.path.join(ROOT, n)
        if os.path.exists(p): os.symlink(p, os.path.join(d, n))
    open(os.path.join(d, "blank.html"), "w").write("<!doctype html><title>blank</title>")
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=d))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return "http://127.0.0.1:%d/" % port


IDB_ALL = """()=>new Promise(res=>{var rq=indexedDB.open('dnd-sheet');rq.onsuccess=()=>{var d=rq.result,o={kv:{},meta:{}},n=0;
 ['kv','meta'].forEach(s=>{var tx=d.transaction(s,'readonly'),c=tx.objectStore(s).openCursor();c.onsuccess=()=>{var x=c.result;if(x){o[s][x.key]=x.value;x.continue();}};tx.oncomplete=()=>{if(++n===2){d.close();res(o);}};});};rq.onerror=()=>res(null);})"""
LS_ALL = "()=>{var o={};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);o[k]=localStorage.getItem(k);}return o}"


async def page(ctx, tag):
    pg = await ctx.new_page(); pg.on("pageerror", lambda e: ERRS.append("%s: %s" % (tag, e)))
    pg.on("dialog", lambda d: (ERRS.append("%s: native dialog %s" % (tag, d.message)), asyncio.ensure_future(d.dismiss())))
    return pg


async def ready(pg):
    await pg.wait_for_function("()=>window.__store&&window.__store.mode()&&window.__sheetId", timeout=15000)
    await pg.wait_for_timeout(1500)


async def run(pw, base, vp, w, h):
    b = await pw.chromium.launch()
    # 1. old data in localStorage only (as before T7), then the new version opens
    ctx = await b.new_context(viewport={"width": w, "height": h}); pg = await page(ctx, vp)
    await pg.goto(base + "blank.html")
    await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}", YUDHI)
    await pg.goto(base + "index.html"); await ready(pg)
    mode = await pg.evaluate("()=>__store.mode()")
    check(vp + " 1 store runs on IndexedDB", mode == "idb", mode)
    db = await pg.evaluate(IDB_ALL)
    check(vp + " 1 sheet copied to IndexedDB", db and db["kv"].get("yudhi-kelapa-build-v3") == YUDHI)
    lb = (db or {}).get("meta", {}).get("__legacy-backup") or {}
    check(vp + " 1 copy of the old data kept before migration", lb.get("keys", {}).get("yudhi-kelapa-build-v3") == YUDHI)
    ls = await pg.evaluate(LS_ALL)
    check(vp + " 1 localStorage kept (not deleted)", ls.get("yudhi-kelapa-build-v3") is not None)
    await pg.evaluate("()=>__store.flush()"); await pg.wait_for_timeout(300); db = await pg.evaluate(IDB_ALL)
    r = json.loads(db["kv"].get("cs-roster-v1") or "{}")
    names = [c.get("name") for c in (r.get("chars") or {}).values()]
    check(vp + " 1 roster saved in IndexedDB with Yudhi", "Yudhi Kelapa" in names, names)
    await pg.evaluate("()=>{var b=document.querySelector('[data-hview]'); if(b) b.click()}"); await pg.wait_for_timeout(1500)
    txt = await pg.evaluate("()=>document.body.innerText")
    check(vp + " 1 Yudhi sheet shows (AC 17, HP 40)", "Yudhi Kelapa" in txt and "17" in txt and "40" in txt)
    await pg.screenshot(path=os.path.join(OUT, "%s-1-migrated.png" % vp))
    # 2. more than 5 MB: localStorage cannot hold it, IndexedDB can
    big = await pg.evaluate("()=>{var s='x'.repeat(6*1024*1024);__store.setItem('cs-test-big',s);return __store.flush().then(()=>({fail:__store.failed(),warn:!!document.getElementById('saveWarn')}))}")
    check(vp + " 2 6 MB value saved without the storage-full bar", not big["warn"], big)
    check(vp + " 2 mirror marked as failed for the big value", "cs-test-big" in big["fail"], big["fail"])
    await pg.reload(); await ready(pg)
    n = await pg.evaluate("()=>(__store.getItem('cs-test-big')||'').length")
    check(vp + " 2 6 MB value is back after reload", n == 6 * 1024 * 1024, n)
    yname = await pg.evaluate("()=>{try{return JSON.parse(__store.getItem('yudhi-kelapa-build-v3')).name}catch(e){return null}}")
    check(vp + " 2 sheet still Yudhi after reload", yname == "Yudhi Kelapa", yname)
    info = await pg.evaluate("()=>{try{return techInfo?1:0}catch(e){return 0}}")
    # storage line in Settings info: no longer "of about 5 MB"
    await pg.evaluate("()=>{__store.removeItem('cs-test-big');return __store.flush()}")
    # 3. a change made in the app survives reload (play state write through the app)
    await pg.evaluate("()=>{var o=JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')||'{}');o.notes=o.notes||{};o.notes.t7='kept';window.__lsSave('yudhi-kelapa-sheet-v1',o);return __store.flush()}")
    await pg.reload(); await ready(pg)
    kept = await pg.evaluate("()=>{try{return JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')).notes.t7}catch(e){return null}}")
    check(vp + " 3 app save survives reload", kept == "kept", kept)
    # 4. two tabs: a write in one tab is seen in the other at once
    pg2 = await page(ctx, vp + " tab2"); await pg2.goto(base + "index.html"); await ready(pg2)
    await pg.evaluate("()=>__store.setItem('cs-ui-t7tab','from-a')"); await pg2.wait_for_timeout(600)
    got = await pg2.evaluate("()=>__store.getItem('cs-ui-t7tab')")
    check(vp + " 4 other tab sees the change", got == "from-a", got)
    await pg2.close()
    # 5. offline after the service worker is ready
    sw = await pg.evaluate("()=>navigator.serviceWorker?navigator.serviceWorker.ready.then(()=>1):0")
    await pg.wait_for_timeout(1500); await ctx.set_offline(True)
    try:
        await pg.reload(); await ready(pg)
        ok = await pg.evaluate("()=>{try{return __store.mode()+':'+JSON.parse(__store.getItem('yudhi-kelapa-build-v3')).name}catch(e){return String(e)}}")
        check(vp + " 5 offline reload opens with data", ok == "idb:Yudhi Kelapa", ok)
        await pg.screenshot(path=os.path.join(OUT, "%s-5-offline.png" % vp))
    except Exception as e:
        check(vp + " 5 offline reload opens with data", False, "sw=%s %s" % (sw, e))
    await ctx.set_offline(False); await ctx.close()
    # 6. no IndexedDB: the app runs on localStorage as before
    ctx = await b.new_context(viewport={"width": w, "height": h})
    await ctx.add_init_script("try{Object.defineProperty(window,'indexedDB',{value:undefined,configurable:true})}catch(e){}")
    pg = await page(ctx, vp + " noidb"); await pg.goto(base + "blank.html")
    await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}", YUDHI)
    await pg.goto(base + "index.html"); await ready(pg)
    m = await pg.evaluate("()=>__store.mode()")
    check(vp + " 6 without IndexedDB the store uses localStorage", m == "ls", m)
    txt = await pg.evaluate("()=>document.body.innerText")
    check(vp + " 6 Yudhi on Home without IndexedDB", "Yudhi Kelapa" in txt)
    await ctx.close()
    # 7. first start in an empty browser: clean, no sample character
    ctx = await b.new_context(viewport={"width": w, "height": h}); pg = await page(ctx, vp + " fresh")
    await pg.goto(base + "index.html"); await ready(pg); await pg.evaluate("()=>__store.flush()")
    txt = await pg.evaluate("()=>document.body.innerText+' '+document.title")
    html = await pg.evaluate("()=>document.getElementById('app').innerHTML")
    check(vp + " 7 empty Home (no characters)", "Characters: 0" in txt or "No characters yet" in txt)
    bad = [x for x in ("Yudhi", "Retron", "Pencak") if x in txt or x in html]
    check(vp + " 7 no sample names on screen", not bad, bad)
    db = await pg.evaluate(IDB_ALL); allv = json.dumps(db["kv"])
    bad = [x for x in ("Yudhi", "Retron", "Pencak") if x in allv]
    check(vp + " 7 no sample names in storage", not bad, bad)
    await pg.screenshot(path=os.path.join(OUT, "%s-7-fresh.png" % vp))
    await ctx.close(); await b.close()


async def main():
    base = serve()
    async with async_playwright() as pw:
        for vp, w, h in (("390x844", 390, 844), ("1250x850", 1250, 850)):
            await run(pw, base, vp, w, h)
    check("no page errors", not ERRS, ERRS[:5])
    bad = [r for r in RES if not r[1]]
    json.dump([{"check": r[0], "ok": r[1], "info": str(r[2])} for r in RES], open(os.path.join(OUT, "result.json"), "w"), indent=1)
    print("%d checks, %d failed" % (len(RES), len(bad)))
    return 1 if bad else 0

sys.exit(asyncio.run(main()))
