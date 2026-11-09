#!/usr/bin/env python3
"""Pack small files of the hosted build so dist/ stays under the Cloudflare Pages Free limit (20,000 files per site, 25 MiB per file).
  python3 tools/dist_pack.py DIST        (run by tools/pages_dist.sh after the copy; Python standard library only)
Works on DIST only. The source tree keeps data/hb/<id>.json and img/portrait/t/<id>.avif, and the app still reads them there.

1. Homebrew packs: DIST/data/hb/<id>.json (one file per pack) -> DIST/data/hbs/NN.json ({"<id>": rows, ...}, about 600 KB each, a bigger pack
   gets a shard of its own) plus DIST/data/hbs/map.json ({"<id>": "NN"}). The rows text is copied byte for byte. src/app/27b-ui-library.js
   (hbRows) reads the map and the shard, and falls back to data/hb/<id>.json when there is no map.
2. Portrait thumbs: DIST/img/portrait/t/<id>.avif -> DIST/img/portrait/tp/N.bin (the AVIF files back to back, 4 thumbs of one species per pack,
   in the order of img/portrait/index.js) and window.__PPTP=[[id, bytes, ...], ...] appended to DIST/img/portrait/index.js.
   src/app/20-ui-portrait.js shows each thumb from its pack through a blob URL (same bytes), or reads the single file when __PPTP is missing.
Every packed file is read back and compared with its source before the single files are removed from DIST. Exit 1 on any mismatch."""
import json, os, re, shutil, sys

HB_TARGET = 600 * 1024
THUMBS_PER_PACK = 4
MAX_FILE = 25 * 1024 * 1024


def fail(msg):
    print("dist_pack: FAIL " + msg); sys.exit(1)


def pack_hb(dist):
    src = os.path.join(dist, "data", "hb")
    if not os.path.isdir(src): fail("no %s" % src)
    ids = sorted(f[:-5] for f in os.listdir(src) if f.endswith(".json"))
    if len(ids) != len(os.listdir(src)): fail("data/hb holds files that are not .json")
    raw = {i: open(os.path.join(src, i + ".json"), encoding="utf-8").read() for i in ids}
    shards, cur, size = [], [], 0
    for i in ids:
        n = len(raw[i].encode("utf-8"))
        if cur and size + n > HB_TARGET: shards.append(cur); cur, size = [], 0
        cur.append(i); size += n
    if cur: shards.append(cur)
    out = os.path.join(dist, "data", "hbs"); os.makedirs(out, exist_ok=True)
    width = max(2, len(str(len(shards) - 1))); mp = {}
    for k, part in enumerate(shards):
        name = str(k).zfill(width)
        text = "{" + ",".join(json.dumps(i) + ":" + raw[i] for i in part) + "}"
        p = os.path.join(out, name + ".json"); open(p, "w", encoding="utf-8").write(text)
        back = json.loads(open(p, encoding="utf-8").read())
        for i in part:
            if back.get(i) != json.loads(raw[i]): fail("shard %s does not give back %s" % (name, i))
            mp[i] = name
    open(os.path.join(out, "map.json"), "w", encoding="utf-8").write(json.dumps(mp, separators=(",", ":")))
    if set(mp) != set(ids): fail("map does not list every pack")
    shutil.rmtree(src)
    print("dist_pack: data/hb %d files -> data/hbs %d shards + map.json" % (len(ids), len(shards)))


def pack_thumbs(dist):
    tdir = os.path.join(dist, "img", "portrait", "t"); ix = os.path.join(dist, "img", "portrait", "index.js")
    if not os.path.isdir(tdir) or not os.path.isfile(ix): fail("no portrait thumbs or index in %s" % dist)
    js = open(ix, encoding="utf-8").read()
    if "__PPTP" in js: fail("index.js is packed already")
    m = re.search(r"window\.__PPIDX=(\[.*\]);?\s*$", js, re.S)
    if not m: fail("img/portrait/index.js has an unexpected shape")
    rows = json.loads(m.group(1))
    files = sorted(f[:-5] for f in os.listdir(tdir) if f.endswith(".avif"))
    if len(files) != len(os.listdir(tdir)): fail("img/portrait/t holds files that are not .avif")
    order = [r[0] for r in rows if r[0] in set(files)]
    if set(order) != set(files): fail("thumbs not in the index: %s" % sorted(set(files) - set(order))[:5])
    packs, cur, sp = [], [], None
    for r in rows:
        if r[0] not in set(files): continue
        if cur and (r[1] != sp or len(cur) >= THUMBS_PER_PACK): packs.append(cur); cur = []
        cur.append(r[0]); sp = r[1]
    if cur: packs.append(cur)
    out = os.path.join(dist, "img", "portrait", "tp"); os.makedirs(out, exist_ok=True); meta = []
    for k, part in enumerate(packs):
        blobs = [open(os.path.join(tdir, i + ".avif"), "rb").read() for i in part]
        p = os.path.join(out, "%d.bin" % k); open(p, "wb").write(b"".join(blobs))
        back = open(p, "rb").read(); o = 0; L = []
        for i, b in zip(part, blobs):
            if back[o:o + len(b)] != b: fail("pack %d does not give back %s" % (k, i))
            o += len(b); L += [i, len(b)]
        meta.append(L)
    js = js.rstrip() + "\n/* added by tools/dist_pack.py: thumbs packed in img/portrait/tp/N.bin, [id, bytes, ...] per pack */\nwindow.__PPTP=" + json.dumps(meta, separators=(",", ":")) + ";\n"
    open(ix, "w", encoding="utf-8").write(js)
    shutil.rmtree(tdir)
    print("dist_pack: img/portrait/t %d files -> img/portrait/tp %d packs" % (len(files), len(packs)))


def main():
    if len(sys.argv) != 2: fail("usage: dist_pack.py DIST")
    dist = sys.argv[1]
    pack_hb(dist); pack_thumbs(dist)
    big = [(os.path.getsize(os.path.join(d, f)), os.path.join(d, f)) for d, _, fs in os.walk(dist) for f in fs]
    over = [p for s, p in big if s > MAX_FILE]
    if over: fail("files over 25 MiB: %s" % over[:5])
    print("dist_pack: largest file %d bytes (%s)" % max(big))


if __name__ == "__main__":
    main()
