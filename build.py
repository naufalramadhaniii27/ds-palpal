#!/usr/bin/env python3
"""Build index.html and sw.js from src/.

  python3 build.py                 build: write index.html and the CACHE name in sw.js
  python3 build.py --check         build in memory and compare with index.html and sw.js, exit 1 if different
  python3 build.py --verify-split  self test of the splitter: split index.html into a temp folder, rebuild from it, compare
  python3 build.py --split FILE DIR   one-time split of a built index.html into a source folder (old automatic names, kept for reference)
  python3 build.py --lint          node --check on every JS piece and on every assembled <script> block

src/manifest.json lists the pieces in order. A piece is raw text. Joining all pieces gives index.html byte for byte.
Edit the pieces in src/, then run this script. Do not edit index.html by hand. SOURCE-NOTES.md has the file map.
--check also runs --lint when node is installed.
"""
import base64, hashlib, json, os, re, sys, tempfile

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
OUT = os.path.join(ROOT, "index.html")
SW = os.path.join(ROOT, "sw.js")
CACHE_RE = re.compile(r'(var CACHE="dnd-sheet-)[0-9a-f]{16}(";)')

TAG_RE = re.compile(r'<(/?)(script|style)\b([^>]*)>')
SPLIT_LINE = re.compile(r'^/\* (={3,}|v\d+ )')
MIN_PIECE = 25000      # a new piece starts at a banner line once the current piece has this many characters
MIN_BLOCK = 80000      # blocks smaller than this stay in one piece
NAMES = {4: "sheet", 5: "mi-core"}   # script block index -> label (others: script-NN, x-defer: data-defer name)


def read(path):
    with open(path, "rb") as f:
        return f.read().decode("utf-8")


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(text.encode("utf-8"))


def slug(line):
    t = re.sub(r'/\*|\*/|=+', ' ', line)
    t = re.sub(r'\bv\d+\b', ' ', t, count=1) if not re.search(r'[a-z]{3}', re.sub(r'\bv\d+\b', '', t)) else t
    w = re.findall(r'[A-Za-z0-9]+', t.lower())[:6]
    s = "-".join(w)[:40].strip("-")
    return s or "part"


def split_block(content):
    """Cut content into pieces at banner lines. Returns list of (slug, text)."""
    if len(content) < MIN_BLOCK:
        return [("all", content)]
    lines = content.splitlines(keepends=True)
    if sum(1 for l in lines if SPLIT_LINE.match(l)) < 3:
        return [("all", content)]
    pieces, cur, curname, size = [], [], "start", 0
    for l in lines:
        if SPLIT_LINE.match(l) and size >= MIN_PIECE:
            pieces.append((curname, "".join(cur)))
            cur, size, curname = [], 0, slug(l)
        elif SPLIT_LINE.match(l) and not cur:
            curname = slug(l)
        cur.append(l)
        size += len(l)
    if cur:
        pieces.append((curname, "".join(cur)))
    return pieces


def split(index_path, outdir):
    s = read(index_path)
    entries, pos, n, bidx, gidx = [], 0, 0, 0, 0
    opens = [m for m in TAG_RE.finditer(s) if not m.group(1)]
    closes = [m for m in TAG_RE.finditer(s) if m.group(1)]
    assert len(opens) == len(closes)

    def add_gap(text):
        nonlocal n, gidx
        if not text:
            return
        if len(text) <= 2000:
            entries.append({"t": "text", "text": text})
        else:
            gidx += 1
            fn = "html/%03d-markup-%d.html" % (n, gidx)
            n += 1
            write(os.path.join(outdir, fn), text)
            entries.append({"t": "file", "file": fn})

    first = True
    for o, c in zip(opens, closes):
        gap = s[pos:o.start()]
        if first and len(gap) > 2000:
            fn = "html/%03d-head.html" % n
            n += 1
            write(os.path.join(outdir, fn), gap)
            entries.append({"t": "file", "file": fn})
        else:
            add_gap(gap)
        first = False
        kind = o.group(2)
        opentag = o.group(0)
        content = s[o.end():c.start()]
        am = re.search(r'data-defer="([^"]+)"', opentag)
        if kind == "style":
            label, ext, sub = "style", "css", "css"
        elif am:
            label, ext, sub = am.group(1), "js", "data"
        else:
            label, ext, sub = NAMES.get(bidx, "script-%02d" % bidx), "js", "js"
        bidx += 1
        files = []
        for i, (nm, text) in enumerate(split_block(content)):
            if nm == "all":
                fn = "%s/%03d-%s.%s" % (sub, n, label, ext)
            else:
                fn = "%s/%03d-%s-%02d-%s.%s" % (sub, n, label, i + 1, nm, ext)
            n += 1
            write(os.path.join(outdir, fn), text)
            files.append(fn)
        entries.append({"t": "block", "open": opentag, "close": c.group(0), "files": files})
        pos = c.end()
    add_gap(s[pos:])
    write(os.path.join(outdir, "manifest.json"), json.dumps({"entries": entries}, indent=1, ensure_ascii=False) + "\n")
    return len(entries)


def assemble(srcdir):
    man = json.loads(read(os.path.join(srcdir, "manifest.json")))
    out = []
    for e in man["entries"]:
        if e["t"] == "text":
            out.append(e["text"])
        elif e["t"] == "file":
            out.append(read(os.path.join(srcdir, e["file"])))
        else:
            out.append(e["open"])
            for fn in e["files"]:
                out.append(read(os.path.join(srcdir, fn)))
            out.append(e["close"])
    return "".join(out)


CSP_META_RE = re.compile(r'<meta http-equiv="Content-Security-Policy"[^>]*>\n?')
SCRIPT_RE = re.compile(r'<script(?:\s[^>]*)?>(.*?)</script>', re.S)


def with_csp(html):
    """T11 A1: Content-Security-Policy as a meta tag. Every inline script (also the deferred builder parts, which the loader runs with
    the same text) is allowed by its sha256 hash, nothing else inline runs. Trusted Types are required (boot/trusted-types.js).
    frame-ancestors cannot be set in a meta tag, it is in _headers."""
    html = CSP_META_RE.sub("", html)
    hs = []
    for m in SCRIPT_RE.finditer(html):
        h = "'sha256-%s'" % base64.b64encode(hashlib.sha256(m.group(1).encode("utf-8")).digest()).decode()
        if h not in hs:
            hs.append(h)
    pol = ("default-src 'self'; script-src 'self' 'wasm-unsafe-eval' " + " ".join(hs) + "; style-src 'self' 'unsafe-inline'; "
           "img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; media-src 'self' data: blob:; worker-src 'self' blob:; "
           "manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; "
           "require-trusted-types-for 'script'; trusted-types default cs-loader html2canvas-pro")
    tag = '<meta charset="utf-8">\n'
    assert tag in html, "charset meta not found"
    return html.replace(tag, tag + '<meta http-equiv="Content-Security-Policy" content="%s">\n' % pol, 1)


def sw_with(text, html):
    h = hashlib.sha256(html.encode("utf-8")).hexdigest()[:16]
    new, k = CACHE_RE.subn(r'\g<1>' + h + r'\g<2>', text)
    assert k == 1, "CACHE line not found in sw.js"
    return new, h


def lint(srcdir):
    """node --check each JS piece (pieces named *.wrap.js only open or close an IIFE, so they are checked inside their block)
    and each assembled script block. Returns the number of failures, or None when node is missing."""
    import shutil, subprocess
    node = shutil.which("node")
    if not node:
        print("lint skipped: node not found")
        return None
    def why(err):
        ls = err.strip().splitlines()
        return ([l for l in ls if "Error" in l] or ls[-1:] or [""])[0]
    man = json.loads(read(os.path.join(srcdir, "manifest.json")))
    bad, n_files, n_blocks = 0, 0, 0
    with tempfile.TemporaryDirectory() as d:
        for i, e in enumerate(man["entries"]):
            if e["t"] != "block" or not e["files"][0].endswith(".js"):
                continue
            for fn in e["files"]:
                if fn.endswith(".wrap.js"):
                    continue
                n_files += 1
                r = subprocess.run([node, "--check", os.path.join(srcdir, fn)], capture_output=True, text=True)
                if r.returncode:
                    bad += 1
                    print("node --check FAILED:", fn, why(r.stderr))
            tmp = os.path.join(d, "block-%03d.js" % i)
            write(tmp, "".join(read(os.path.join(srcdir, fn)) for fn in e["files"]))
            n_blocks += 1
            r = subprocess.run([node, "--check", tmp], capture_output=True, text=True)
            if r.returncode:
                bad += 1
                print("node --check FAILED: block", e["open"], e["files"][0], why(r.stderr))
    print("lint: %d JS pieces, %d script blocks, %d failed" % (n_files, n_blocks, bad))
    return bad


def main(argv):
    if "--split" in argv:
        i = argv.index("--split")
        n = split(argv[i + 1], argv[i + 2])
        print("split into", n, "entries")
        return 0
    if "--verify-split" in argv:
        with tempfile.TemporaryDirectory() as d:
            n = split(OUT, d)
            again = assemble(d)
            same = again == read(OUT)
            print("split", n, "entries; rebuilt equals index.html:", same)
            return 0 if same else 1
    if "--lint" in argv:
        return 1 if lint(SRC) else 0
    html = with_csp(assemble(SRC))
    sw, h = sw_with(read(SW), html)
    if "--check" in argv:
        ok_html = html == read(OUT)
        ok_sw = sw == read(SW)
        print("index.html", "same" if ok_html else "DIFFERENT", "| sw.js", "same" if ok_sw else "DIFFERENT", "| hash", h)
        bad = lint(SRC)
        return 0 if (ok_html and ok_sw and not bad) else 1
    write(OUT, html)
    write(SW, sw)
    print("built index.html %d bytes, sha256 %s, CACHE dnd-sheet-%s" % (len(html.encode("utf-8")), hashlib.sha256(html.encode("utf-8")).hexdigest(), h))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
