#!/usr/bin/env python3
"""T8 cloud sync with the real API on a local Pages server (wrangler pages dev with D1, DEV_USER set). Two browser contexts are two devices of one person.

  # terminal 1:  sh tools/pages_dist.sh && npx wrangler pages dev --port 8788 --binding DEV_USER=a@test.dev --binding ACCESS_TEAM=
  BASE=http://localhost:8788 python3 tests/cloud_sync.py [OUTDIR]

Checks: upload, a second device gets the character, edits travel, conflict keeps the other copy as a version, delete goes to the recycle bin,
restore as copy, offline state, the cloud button at 390x844 and 1250x850. Exit code 0 only when every check passes."""
import asyncio, json, os, sys, urllib.request
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.environ.get("BASE", "http://localhost:8788").rstrip("/")
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, "out", "cloud_sync"); os.makedirs(OUT, exist_ok=True)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
RES = []; ERRS = []
def check(n, ok, info=""): RES.append((n, bool(ok))); print(("ok   " if ok else "FAIL ") + n + ("  " + str(info)[:300] if not ok else ""))
def api(path, method="GET"):
    rq = urllib.request.Request(BASE + "/api/" + path, method=method)
    with urllib.request.urlopen(rq, timeout=20) as r: return json.loads(r.read())

async def dev(b, vp, w, h, tag):
    ctx = await b.new_context(viewport={"width": w, "height": h}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: ERRS.append(tag + ": " + str(e)))
    return ctx, pg

async def ready(pg):
    # the app may reload itself after a sync (the open character came from the cloud). Retry until a page is settled for a moment
    for i in range(6):
        try:
            await pg.wait_for_load_state("load")
            await pg.wait_for_function("()=>window.__store&&__store.mode()&&window.__sync", timeout=20000)
            await pg.wait_for_function("()=>__sync.on&&!__sync.busy&&!__sync.again&&__sync.st!=='busy'", timeout=20000)
            await pg.wait_for_timeout(700)
            if await pg.evaluate("()=>__sync.on&&!__sync.busy"): return
        except Exception as e:
            if "destroyed" not in str(e) and "navigat" not in str(e) and i > 3: raise
            await pg.wait_for_timeout(500)

async def sync(pg, why="show"):
    # a run may reload the page (the open character changed in the cloud). Wait until the page is settled again
    try:
        await pg.evaluate("w=>{__syncRun(w)}", why)
        await pg.wait_for_function("()=>!__sync.busy&&!__sync.again", timeout=20000)
    except Exception:
        pass
    await pg.wait_for_timeout(500); await ready(pg)

async def names(pg):
    await ready(pg)
    return await pg.evaluate("()=>{try{var r=JSON.parse(__store.getItem('cs-roster-v1'));return Object.keys(r.chars).filter(k=>!r.chars[k].ph).map(k=>r.chars[k].name)}catch(e){return []}}")

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for vp, w, h in (("390x844", 390, 844), ("1250x850", 1250, 850)):
            for c in api("chars")["chars"]:
                if not c["deleted"]: api("chars/" + c["id"], "DELETE")
            # device A: an old sheet in localStorage, first start uploads it
            A, pa = await dev(b, vp, w, h, vp + " A")
            await pa.goto(BASE + "/index.html"); await pa.wait_for_timeout(1500)
            await pa.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}", YUDHI)
            await pa.evaluate("()=>new Promise(r=>{var q=indexedDB.deleteDatabase('dnd-sheet');q.onsuccess=q.onerror=q.onblocked=()=>r()})")
            await pa.reload(); await ready(pa); await sync(pa)
            srv = [c for c in api("chars")["chars"] if not c["deleted"]]
            check(vp + " A uploads its character", any(c["name"] == "Yudhi Kelapa" for c in srv), srv)
            st = await pa.evaluate("()=>[__sync.st, !!document.querySelector('.sy-b[data-st=ok]')]")
            check(vp + " A cloud button shows backed up", st == ["ok", True], st)
            await pa.screenshot(path=os.path.join(OUT, vp + "-A-home.png"))
            # device B: empty, gets the character
            B, pb = await dev(b, vp, w, h, vp + " B")
            await pb.goto(BASE + "/index.html")
            await pb.wait_for_function("()=>{try{return JSON.parse(__store.getItem('cs-roster-v1')).chars&&document.body.innerText.indexOf('Yudhi Kelapa')>=0}catch(e){return false}}", timeout=30000)
            await ready(pb)
            check(vp + " B receives the character", "Yudhi Kelapa" in await names(pb))
            await pb.screenshot(path=os.path.join(OUT, vp + "-B-home.png"))
            # edit on A travels to B (open character, so B reloads when it comes back to the tab)
            await pa.evaluate("()=>{var o=JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')||'{}');o.notes=o.notes||{};o.notes.t8='from A';window.__lsSave('yudhi-kelapa-sheet-v1',o);location.reload()}")
            await ready(pa); await sync(pa)
            for i in range(30):
                if any("from A" in (json.loads(api("chars/" + c["id"])["data"]).get("S") or "") for c in api("chars")["chars"] if not c["deleted"]): break
                await pa.wait_for_timeout(500)
            else:
                check(vp + " A uploads its edit", False, await pa.evaluate("()=>__sync.log"))
            await pb.evaluate("()=>__syncRun('show')")
            try:
                await pb.wait_for_function("()=>{try{return JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')).notes.t8==='from A'}catch(e){return false}}", timeout=30000)
                check(vp + " edit on A shows on B", True)
            except Exception as e:
                dbg = await pb.evaluate("()=>({log:__sync.log,loc:__syncLocal(),again:__sync.again,busy:__sync.busy,on:__sync.on,sy:__store.getItem('cs-sync-v1'),st:__sync.st,act:JSON.parse(__store.getItem('cs-roster-v1')).active,t8:(JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')||'{}').notes||{}).t8})")
                print("DBG", json.dumps(dbg)); print("DBG A", await pa.evaluate("()=>JSON.stringify(__sync.log)")); print("SRV", json.dumps([(c["id"], c["rev"], c["deleted"], c["name"]) for c in api("chars")["chars"]])); check(vp + " edit on A shows on B", False)
                raise
            await ready(pb)
            # conflict: both edit the same character, A first, then B. B wins, A's copy is a version
            await pa.evaluate("()=>{var o=JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1'));o.notes.t8='A2';window.__lsSave('yudhi-kelapa-sheet-v1',o);location.reload()}"); await ready(pa); await sync(pa)
            await pb.evaluate("()=>{var o=JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1'));o.notes.t8='B2';window.__lsSave('yudhi-kelapa-sheet-v1',o);location.reload()}"); await ready(pb); await sync(pb)
            yid = [c["id"] for c in api("chars")["chars"] if c["name"] == "Yudhi Kelapa" and not c["deleted"]][0]
            cur = json.loads(api("chars/" + yid)["data"]); vers = api("chars/%s/versions" % yid)["versions"]
            check(vp + " conflict: newest push is the cloud copy", "B2" in cur.get("S", ""), cur.get("S", "")[:80])
            other = [v for v in vers if v["why"] == "other-device"]
            check(vp + " conflict: the other copy is kept as a version", other and "A2" in json.loads(api("chars/%s/versions/%d" % (yid, other[0]["rev"]))["data"]).get("S", ""), vers)
            mine = await pb.evaluate("()=>[JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')).notes.t8, __sync.st, __sync.on, !!document.getElementById('moreBtn'), !!document.querySelector('.hhead h1')]")
            check(vp + " B kept its own edit", mine[0] == "B2", mine)
            # T11 N12: the part changed on both is listed for a choice on B, with the other device's value
            mg = await pb.evaluate("id=>window.__syMerge.get(id)", yid)
            check(vp + " N12 conflict part listed", mg and any(q["p"] == ["S", "notes", "t8"] and q["r"] == '"A2"' for q in mg["parts"]), mg)
            await pb.evaluate("id=>__store.removeItem('cs-sync-mg-'+id)", yid)
            # T11 N12: different parts changed on two devices are combined, nothing is lost and no choice is asked
            await pa.evaluate("()=>{var o=JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1'));o.notes.ma='A3';window.__lsSave('yudhi-kelapa-sheet-v1',o);location.reload()}"); await ready(pa); await sync(pa)
            await pb.evaluate("()=>{var o=JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1'));o.notes.mb='B3';window.__lsSave('yudhi-kelapa-sheet-v1',o);location.reload()}"); await ready(pb); await sync(pb)
            await pa.evaluate("()=>__syncRun('show')"); await pa.wait_for_timeout(1500); await ready(pa)
            cur = json.loads(json.loads(api("chars/" + yid)["data"])["S"]).get("notes", {})
            check(vp + " N12 cloud has both edits", cur.get("ma") == "A3" and cur.get("mb") == "B3" and cur.get("t8") == "B2", cur)
            for pg_, nm_ in ((pa, "A"), (pb, "B")):
                n_ = await pg_.evaluate("id=>[JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')).notes, window.__syMerge.get(id)]", yid)
                check(vp + " N12 device %s has both edits, nothing to choose" % nm_, n_[0].get("ma") == "A3" and n_[0].get("mb") == "B3" and not n_[1], n_)
            # restore that version as a copy from the cloud dialog on B
            await pb.evaluate("()=>document.querySelector('.sy-b').click()"); await pb.wait_for_selector(".sy-dlg [data-syv]", timeout=10000)
            await pb.screenshot(path=os.path.join(OUT, vp + "-B-cloud.png"))
            await pb.click(".sy-dlg [data-syv]"); await pb.wait_for_selector(".sy-dlg [data-syc]", timeout=10000)
            await pb.click(".sy-dlg [data-syc]"); await pb.wait_for_timeout(800)
            nm = await names(pb)
            check(vp + " restore as copy adds a new character", any(n.startswith("Yudhi Kelapa (restored)") for n in nm), nm)
            await sync(pb)
            # delete the copy on B: cloud recycle bin, and A drops it too
            await sync(pa); check(vp + " A gets the restored copy", any(n.startswith("Yudhi Kelapa (restored)") for n in await names(pa)), await names(pa))
            await pb.evaluate("()=>{var r=JSON.parse(__store.getItem('cs-roster-v1'));Object.keys(r.chars).forEach(k=>{if((r.chars[k].name||'').indexOf('(restored)')>0) delete r.chars[k]});__store.setItem('cs-roster-v1',JSON.stringify(r))}")
            await sync(pb)
            dl = [c for c in api("chars")["chars"] if "(restored)" in (c["name"] or "")]
            check(vp + " delete on B moves the copy to the recycle bin", dl and all(c["deleted"] for c in dl), dl)
            if not (dl and all(c["deleted"] for c in dl)): print("DBG B", await pb.evaluate("()=>JSON.stringify({log:__sync.log,sy:__store.getItem('cs-sync-v1'),loc:__syncLocal()})"))
            await sync(pa)
            check(vp + " A drops the deleted copy", not any("(restored)" in n for n in await names(pa)), await names(pa))
            # stage 4: an uploaded portrait travels on its own, the character text holds "cloud:<hash>"
            pic = "data:image/jpeg;base64," + "Q" * 3000
            await pa.evaluate("p=>{var o=JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1'));o.portrait=p;window.__lsSave('yudhi-kelapa-sheet-v1',o);location.reload()}", pic)
            await ready(pa); await sync(pa)
            yid = [c["id"] for c in api("chars")["chars"] if c["name"] == "Yudhi Kelapa" and not c["deleted"]][0]
            txt = api("chars/" + yid)["data"]; me = api("me")
            pp = api("pic/%s/%s" % (me["id"], yid))
            check(vp + " portrait stored on its own, text holds a reference", "cloud:" in txt and "QQQQ" not in txt and pp.get("data") == pic, txt[:120])
            await pb.evaluate("()=>__syncRun('show')"); await pb.wait_for_timeout(1500); await ready(pb)
            got = await pb.evaluate("()=>JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')).portrait")
            check(vp + " B gets the picture back in the sheet", got == pic, (got or "")[:60])
            # settings follow the person
            await pa.evaluate("()=>{__store.setItem('mi-snd','off')}"); await sync(pa)
            await pb.reload(); await ready(pb)
            check(vp + " setting from A arrives on B", await pb.evaluate("()=>__store.getItem('mi-snd')") == "off")
            await pa.evaluate("()=>{__store.setItem('mi-snd','on')}"); await sync(pa)
            # offline: state only, no popup
            await B.set_offline(True); await pb.evaluate("()=>window.dispatchEvent(new Event('offline'))"); await pb.wait_for_timeout(300)
            st = await pb.evaluate("()=>[__sync.st, document.querySelector('.sy-b').getAttribute('aria-label')]")
            check(vp + " offline: cloud button says saved on this device", st[0] == "offline" and "Saved on this device" in st[1], st)
            await pb.screenshot(path=os.path.join(OUT, vp + "-B-offline.png"))
            await B.set_offline(False)
            await A.close(); await B.close()
        await b.close()
    check("no page errors", not ERRS, ERRS[:3])
    bad = [r for r in RES if not r[1]]; print("%d checks, %d failed" % (len(RES), len(bad))); return 1 if bad else 0
sys.exit(asyncio.run(main()))
