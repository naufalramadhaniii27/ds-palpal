#!/usr/bin/env python3
"""Hosted build budget. Cloudflare Pages Free (and Workers static assets) take at most 20,000 files per site and 25 MiB per file.
  python3 tests/dist_budget.py [--dist DIR]
Without --dist it runs sh tools/pages_dist.sh (rebuilds dist/) and checks dist/. Checks:
  - at most 19,500 files (500 under the limit, so the next art drop fails here and not at the Cloudflare upload),
  - no file over 25 MiB,
  - the packed forms are complete (tools/dist_pack.py): every homebrew source of src/data/q09-hbindex.js is in data/hbs/map.json and its
    shard holds the same rows as data/hb/<id>.json; every portrait of img/portrait/index.js has its thumb bytes in img/portrait/tp,
  - the single files (data/hb, img/portrait/t) are not in dist.
Exit 1 on any failure, with the count per top folder."""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
LIMIT, BUDGET, MAX_FILE = 20000, 19500, 25 * 1024 * 1024
a = sys.argv[1:]
if "--dist" in a: DIST = os.path.abspath(a[a.index("--dist") + 1])
else:
    subprocess.run(["sh", os.path.join(ROOT, "tools", "pages_dist.sh")], check=True, cwd=ROOT, stdout=subprocess.DEVNULL)
    DIST = os.path.join(ROOT, "dist")
fails = 0
def chk(name, ok):
    global fails
    print("%s  %s" % ("ok  " if ok else "FAIL", name)); fails += 0 if ok else 1
files = [(os.path.join(d, f), os.path.getsize(os.path.join(d, f))) for d, _, fs in os.walk(DIST) for f in fs]
per = {}
for p, _ in files:
    r = os.path.relpath(p, DIST).split(os.sep); k = "/".join(r[:2]) if len(r) > 2 else r[0]; per[k] = per.get(k, 0) + 1
for k, n in sorted(per.items(), key=lambda x: -x[1])[:14]: print("   %6d  %s" % (n, k))
n = len(files)
chk("dist has %d files, budget %d (host limit %d). Over budget: pack or drop files in dist (tools/dist_pack.py), not at the Cloudflare upload" % (n, BUDGET, LIMIT), n <= BUDGET)
big = [p for p, s in files if s > MAX_FILE]
chk("no file over 25 MiB (largest %d bytes)" % max(s for _, s in files), not big)
chk("no single homebrew files in dist (data/hb)", not os.path.exists(os.path.join(DIST, "data", "hb")))
chk("no single portrait thumbs in dist (img/portrait/t)", not os.path.exists(os.path.join(DIST, "img", "portrait", "t")))
# homebrew: every source listed by the app resolves to the same rows
idx = open(os.path.join(ROOT, "src", "data", "q09-hbindex.js"), encoding="utf-8").read()
ids = re.findall(r'\{"id":"([^"]+)","tag"', idx)
mp = json.load(open(os.path.join(DIST, "data", "hbs", "map.json"), encoding="utf-8"))
chk("map lists every homebrew source (%d of %d)" % (sum(1 for i in ids if i in mp), len(ids)), all(i in mp for i in ids))
sh, same = {}, True
for i in ids:
    if i not in mp: continue
    s = sh.get(mp[i]) or sh.setdefault(mp[i], json.load(open(os.path.join(DIST, "data", "hbs", mp[i] + ".json"), encoding="utf-8")))
    if s.get(i) != json.load(open(os.path.join(ROOT, "data", "hb", i + ".json"), encoding="utf-8")): same = False; print("   differs:", i)
chk("every shard gives back the rows of data/hb/<id>.json", same)
# portrait thumbs: same bytes for every portrait in the search index
js = open(os.path.join(DIST, "img", "portrait", "index.js"), encoding="utf-8").read()
m = re.search(r"window\.__PPTP=(\[.*?\]);\s*$", js, re.S); P = json.loads(m.group(1)) if m else []
rows = json.loads(re.search(r"window\.__PPIDX=(\[.*?\]);", js, re.S).group(1))
got, ok = {}, True
for k, L in enumerate(P):
    b = open(os.path.join(DIST, "img", "portrait", "tp", "%d.bin" % k), "rb").read(); o = 0
    for j in range(0, len(L), 2): got[L[j]] = b[o:o + L[j + 1]]; o += L[j + 1]
    if o != len(b): ok = False
for r in rows:
    src = os.path.join(ROOT, "img", "portrait", "t", r[0] + ".avif")
    if got.get(r[0]) != open(src, "rb").read(): ok = False; print("   thumb differs:", r[0])
chk("every portrait thumb is in a pack, byte for byte (%d thumbs, %d packs)" % (len(got), len(P)), ok and len(got) == len(rows))
print("dist_budget: %d files, %s" % (n, "PASS" if not fails else "FAIL %d" % fails))
sys.exit(1 if fails else 0)
