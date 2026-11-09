#!/usr/bin/env python3
"""Presisi dan recall auto link (xlink di src/app/13-ui-detail-cards.js).
  python3 tests/autolink_measure.py               ukur sampel emas tests/autolink_gold.json (kurang dari 1 menit)
  python3 tests/autolink_measure.py --top 20      daftar kesalahan terbanyak (FP dan FN) dengan jumlah
  python3 tests/autolink_measure.py --json OUT    tulis hasil per kalimat
  python3 tests/autolink_measure.py --sample OUT [--seed N] [--scale F]   buat kalimat calon (untuk memberi label), bukan untuk uji rutin
  python3 tests/autolink_measure.py --root DIR    pakai build di DIR (default: akar repo)
Mesin: env.__xl.xlink(html, self) di halaman hasil build, mode sheet. Edisi 2014 dipasang lewat __sp14Set(true).
Gold: tiap item {id, ed, kind, self, text, want:[tautan yang seharusnya], no:[tautan yang sudah ditinjau dan salah]}.
want dan no berisi teks permukaan persis (satu entri per kemunculan). Entri want bisa string atau {s, k} (k = target, mis. "g:Bonus Action").
Presisi = tautan mesin yang cocok want / semua tautan mesin. Recall = want yang cocok / semua want.
Tautan mesin di luar want dan no dihitung salah dan dicatat sebagai 'belum ditinjau' (tanda kalimat baru atau drift)."""
import asyncio, collections, functools, html, http.server, json, os, random, re, socket, subprocess, sys, threading
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
GOLD = os.path.join(HERE, "autolink_gold.json")
a = sys.argv[1:]
def opt(name, default=None, flag=False):
    global a
    if name in a:
        i = a.index(name)
        if flag: del a[i]; return True
        v = a[i+1]; del a[i:i+2]; return v
    return default
ROOT = os.path.abspath(opt("--root", ROOT))
SAMPLE = opt("--sample"); SEED = int(opt("--seed", "20261109")); SCALE = float(opt("--scale", "1")); TOP = opt("--top"); JSON_OUT = opt("--json")

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return "http://127.0.0.1:%d/index.html" % port

def esc(t): return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&#39;")
LINK = re.compile(r'<button type="button" class="lk xl" data-info="([^"]*)">(.*?)</button>', re.S)
def unesc(t): return t.replace("&#39;", "'").replace("&quot;", '"').replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")
def links_of(out): return [(unesc(m.group(2)), unesc(m.group(1))) for m in LINK.finditer(out)]

RUN_JS = """([items, ed]) => {
  if (ed === '2014') __sp14Set(true); else __sp14Set(false);
  __xl.idx();
  const res = items.map(it => { let out = ''; try { out = __xl.xlink(it.h, it.self || ''); } catch (e) { out = 'ERR ' + e; } return out; });
  return res;
}"""

async def with_page(fn):
    base = serve()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(bypass_csp=True, service_workers="block", viewport={"width": 1250, "height": 850})
        pg = await ctx.new_page(); pg.set_default_timeout(120000)
        await pg.goto(base)
        await pg.wait_for_function("()=>window.__deferDone && window.__xl")
        r = await fn(pg)
        await b.close(); return r

async def run_engine(pg, items):
    out = {}
    for ed in ("2024", "2014"):
        sub = [it for it in items if it["ed"] == ed]
        if not sub: continue
        res = await pg.evaluate(RUN_JS, [[{"h": esc(it["text"]), "self": it.get("self", "")} for it in sub], ed])
        for it, o in zip(sub, res): out[it["id"]] = o
    return out

def norm_want(w): return (w, None) if isinstance(w, str) else (w["s"], w.get("k"))

def score(items, outs):
    tp = fp = fn = 0; tp_c = fn_c = 0
    fp_by = collections.Counter(); fn_by = collections.Counter(); unrev = []; per = {}
    by_kind = collections.defaultdict(lambda: [0, 0, 0])
    for it in items:
        eng = links_of(outs[it["id"]])
        want = [norm_want(w) for w in it.get("want", [])]; no = list(it.get("no", []))
        left = list(want); good = []; bad = []
        for s, k in eng:
            hit = None
            for j, (ws, wk) in enumerate(left):
                if ws == s and (wk is None or wk == k): hit = j; break
            if hit is not None: left.pop(hit); good.append(s)
            else:
                bad.append((s, k))
                if s in no: no.remove(s)
                else: unrev.append((it["id"], s))
        for s in good: pass
        t, f, n = len(good), len(bad), len(left)
        tp += t; fp += f; fn += n
        for s, k in bad: fp_by[(s, k)] += 1
        for s, k in left: fn_by[s] += 1
        tp_c += sum(1 for s in good if s[:1].isupper()); fn_c += sum(1 for s, k in left if s[:1].isupper())
        kk = by_kind[it["ed"] + " " + it["kind"]]; kk[0] += t; kk[1] += f; kk[2] += n
        per[it["id"]] = {"links": [s for s, k in eng], "fp": [s for s, k in bad], "fn": [s for s, k in left]}
    P = tp / (tp + fp) if tp + fp else 1.0; R = tp / (tp + fn) if tp + fn else 1.0
    Rc = tp_c / (tp_c + fn_c) if tp_c + fn_c else 1.0
    return dict(tp=tp, fp=fp, fn=fn, P=P, R=R, Rcap=Rc, fp_by=fp_by, fn_by=fn_by, unrev=unrev, by_kind=by_kind, per=per)

def report(r, items, top):
    print("kalimat %d  tautan benar %d  salah %d  terlewat %d" % (len(items), r["tp"], r["fp"], r["fn"]))
    print("presisi %.1f%%  recall %.1f%%  (recall istilah berhuruf awal besar saja %.1f%%)" % (100*r["P"], 100*r["R"], 100*r["Rcap"]))
    for k, (t, f, n) in sorted(r["by_kind"].items()):
        print("  %-18s benar %3d salah %3d lewat %3d  P %5.1f%% R %5.1f%%" % (k, t, f, n, 100*t/max(1, t+f), 100*t/max(1, t+n)))
    if r["unrev"]: print("belum ditinjau (dihitung salah): %d, contoh %s" % (len(r["unrev"]), r["unrev"][:5]))
    if top:
        n = int(top)
        print("\nTautan salah terbanyak:")
        for (s, k), c in r["fp_by"].most_common(n): print("  %3d  %s  -> %s" % (c, s, k))
        print("Tautan terlewat terbanyak:")
        for s, c in r["fn_by"].most_common(n): print("  %3d  %s" % (c, s))

# ---------- mode sampel ----------
SENT = re.compile(r"(?<=[.!?])\s+(?=[A-Z*\[(])")
def sentences(t):
    t = re.sub(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", lambda m: m.group(2) or m.group(1), t).replace("**", "")
    out = []
    for para in re.split(r"\n+", t):
        for s in SENT.split(para.strip()):
            s = s.strip()
            if len(s.split()) >= 7 and len(s) <= 400: out.append(s)
    return out

DUMP_JS = """async (ed) => {
  if (ed === '2014') __sp14Set(true); else __sp14Set(false);
  const o = {spell: [], item: [], feat: [], cf: []};
  const sp = Object.keys(SPELL_FULL).filter(k => SPELLS.some(x => x[0] === k));
  sp.forEach(k => o.spell.push([k, String(SPELL_FULL[k])]));
  DMGI.forEach(r => { if (r && r[0] && r[4]) o.item.push([r[0], String(r[4])]); });
  Object.keys(FEAT_FULL).forEach(k => o.feat.push([k, String(FEAT_FULL[k])]));
  Object.keys(CF_FULL).forEach(k => o.cf.push([k.split('|').pop(), String(CF_FULL[k])]));
  return o;
}"""

def cls14():
    js = ('import fs from "fs";const s=fs.readFileSync(%r,"utf8");fs.writeFileSync(%r,s);const m=await import(%r);'
          'const o=[];for(const c in m.CLS14){const f=m.CLS14[c].full||{};for(const k in f)o.push([k,f[k]]);}console.log(JSON.stringify(o));') % (
          os.path.join(ROOT, "src/builder/06-data-2014-classes.js"), "/tmp/_cls14_mod.mjs", "file:///tmp/_cls14_mod.mjs")
    open("/tmp/_cls14.mjs", "w").write(js)
    return json.loads(subprocess.check_output(["node", "/tmp/_cls14.mjs"]))

async def do_sample(pg):
    rnd = random.Random(SEED); cand = []
    plan = [("2024", "spell", 40), ("2024", "item", 40), ("2024", "feat", 40), ("2024", "cf", 45),
            ("2014", "spell", 40), ("2014", "item", 40), ("2014", "cf", 55)]
    d = {ed: await pg.evaluate(DUMP_JS, ed) for ed in ("2024", "2014")}
    d["2014"]["cf"] = cls14()
    for ed, kind, n in plan:
        pool = []
        for name, txt in d[ed][kind]:
            for s in sentences(txt): pool.append((name, s))
        for name, s in rnd.sample(pool, max(1, round(n*SCALE))): cand.append({"ed": ed, "kind": kind, "self": name, "text": s})
    for i, c in enumerate(cand): c["id"] = i + 1
    return cand

async def main():
    if SAMPLE:
        cand = await with_page(do_sample)
        outs = await with_page(lambda pg: run_engine(pg, cand))
        for c in cand: c["engine"] = [s for s, k in links_of(outs[c["id"]])]
        json.dump(cand, open(SAMPLE, "w"), ensure_ascii=False, indent=1); print("calon:", len(cand)); return
    items = json.load(open(GOLD, encoding="utf-8"))["items"]
    outs = await with_page(lambda pg: run_engine(pg, items))
    r = score(items, outs); report(r, items, TOP)
    for st in ("dev", "holdout"):
        sub = [it for it in items if it.get("set", "dev") == st]
        if sub and len(sub) != len(items):
            q = score(sub, outs); print("set %-8s kalimat %3d  benar %3d salah %2d lewat %3d  presisi %.1f%%  recall %.1f%%" % (st, len(sub), q["tp"], q["fp"], q["fn"], 100*q["P"], 100*q["R"]))
    if JSON_OUT: json.dump({"summary": {k: r[k] for k in ("tp", "fp", "fn", "P", "R", "Rcap")}, "per": r["per"], "unrev": r["unrev"]}, open(JSON_OUT, "w"), ensure_ascii=False, indent=1)
    return 0

if __name__ == "__main__": asyncio.run(main())
