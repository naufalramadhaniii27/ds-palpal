#!/usr/bin/env python3
"""Build index.html and sw.js from src/.

  python3 build.py                 build: write index.html and the CACHE name in sw.js
  python3 build.py --check         build in memory and compare with index.html and sw.js, exit 1 if different
  python3 build.py --verify-split  self test of the splitter: split index.html into a temp folder, rebuild from it, compare
  python3 build.py --split FILE DIR   one-time split of a built index.html into a source folder (old automatic names, kept for reference)
  python3 build.py --lint          node --check on every JS piece and on every assembled <script> block
  python3 build.py --vendor-update rewrite vendor/pdf/SHA256SUMS after a library file was changed on purpose

src/manifest.json lists the pieces in order. A piece is raw text. Joining all pieces gives index.html byte for byte.
Edit the pieces in src/, then run this script. Do not edit index.html by hand. SOURCE-NOTES.md has the file map.
--check also runs --lint when node is installed, and compares the files in vendor/pdf with vendor/pdf/SHA256SUMS.
"""
import base64, hashlib, json, os, re, subprocess, sys, tempfile

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


def bundle(srcdir, entry):
    """Module blocks: one entry file, imports are followed by esbuild. Output is a single strict IIFE, names kept."""
    here = os.path.dirname(os.path.abspath(__file__))
    es = os.environ.get("ESBUILD_BINARY_PATH") or os.path.join(here, "tools", "build", "node_modules", ".bin", "esbuild")
    if not os.path.exists(es):
        raise SystemExit("esbuild missing: run  npm ci --prefix tools/build")
    r = subprocess.run([es, os.path.join(srcdir, entry), "--bundle", "--format=iife", "--target=esnext", "--charset=utf8",
                        "--legal-comments=none", "--log-level=error"], capture_output=True)
    if r.returncode:
        raise SystemExit("esbuild bundle failed for " + entry + ":\n" + r.stderr.decode("utf-8", "replace"))
    out = r.stdout.decode("utf-8")
    head = "(() => {\n"
    if not out.startswith(head):
        raise SystemExit("esbuild output for " + entry + " does not start as an IIFE")
    # ES modules are strict; the directive sits inside the function so it also holds when the block is wrapped in a gate
    return "\n" + head + '"use strict";\n' + out[len(head):]


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
            if e.get("entry"):
                # ES module block: esbuild bundles the entry and its imports into one IIFE (strict), the block keeps its tags
                if e.get("pre"):
                    # classic files that must stay plain scripts (they also run under node in tests): put first, UI bundle after
                    if "data-gate" not in e["open"]:
                        out.append('"use strict";\n')
                    for fn in e["pre"]:
                        out.append(read(os.path.join(srcdir, fn)))
                out.append(bundle(srcdir, e["entry"]))
                out.append(e["close"])
                continue
            css = e["open"].startswith("<style")
            if css:
                out.append(LAYER_ORDER + "@layer app{\n")
                inapp = True
            for fn in e["files"]:
                if css and os.path.basename(fn).startswith("L-") and inapp:
                    out.append("\n}\n"); inapp = False  # files named L-*.css carry their own later layer (feat, learn, dice)
                out.append(read(os.path.join(srcdir, fn)))
            if css and inapp:
                out.append("\n}\n")
            out.append(e["close"])
    return "".join(out)


# T11 A4: all app CSS sits in the cascade layer "app" (the theme colors that 07-ui-theme writes at run time too). One layer keeps the
# cascade exactly as before (tests/style_snapshot.py: 0 differences on 25 screens). New parts go in later layers and win over the app
# by layer order, without !important: feat (new app features), learn (Learn menu), dice (dice tray).
LAYER_ORDER = "@layer app,feat,learn,dice;\n"


CSP_META_RE = re.compile(r'<meta http-equiv="Content-Security-Policy"[^>]*>\n?')
SCRIPT_RE = re.compile(r'<script(?:\s[^>]*)?>(.*?)</script>', re.S)


ESBUILD = os.environ.get("ESBUILD_BINARY_PATH") or os.path.join(HERE if "HERE" in globals() else os.path.dirname(os.path.abspath(__file__)), "tools", "build", "node_modules", ".bin", "esbuild")
BLOCK_RE = re.compile(r'(<(script|style)(?:\s[^>]*)?>)(.*?)</(?:script|style)>', re.S)


def minify(html):
    """T11 A7: every script and style block goes through esbuild (whitespace and syntax only, names are kept, so stack traces in
    problem reports still name the functions). Install once: npm ci --prefix tools/build. --no-minify builds without it."""
    if not os.path.exists(ESBUILD):
        raise SystemExit("esbuild missing: run  npm ci --prefix tools/build  (or build with --no-minify)")
    def one(m):
        kind = m.group(2); body = m.group(3)
        if not body.strip():
            return m.group(0)
        r = subprocess.run([ESBUILD, "--loader=" + ("css" if kind == "style" else "js"), "--minify-whitespace", "--minify-syntax",
                            "--target=esnext", "--charset=utf8", "--legal-comments=none", "--log-level=error"], input=body.encode("utf-8"), capture_output=True)
        if r.returncode:
            raise SystemExit("esbuild failed on a %s block: %s" % (kind, r.stderr.decode()[:400]))
        return m.group(1) + r.stdout.decode("utf-8").rstrip("\n") + "</%s>" % kind
    return BLOCK_RE.sub(one, html)


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
    pol = ("default-src 'self'; script-src 'self' " + " ".join(hs) + "; style-src 'self' 'unsafe-inline'; "
           "img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; media-src 'self' data: blob:; worker-src 'self'; "
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


VENDOR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vendor", "pdf")


def vendor_sums():
    """sha256 of PDF runtime libraries, template, layout and font assets."""
    out = {}
    for fn in sorted(os.listdir(VENDOR)):
        if fn.endswith((".js", ".pdf", ".json", ".ttf")):
            with open(os.path.join(VENDOR, fn), "rb") as f:
                out[fn] = hashlib.sha256(f.read()).hexdigest()
    return out


def vendor_check():
    """The PDF libraries are loaded as they are, so a changed file must be noticed. Returns the list of problems."""
    sums = os.path.join(VENDOR, "SHA256SUMS")
    if not os.path.exists(sums):
        return ["vendor/pdf/SHA256SUMS is missing (python3 build.py --vendor-update writes it)"]
    want = {}
    for line in read(sums).splitlines():
        if line.strip():
            h, name = line.split(None, 1)
            want[name.strip().lstrip("*")] = h
    have = vendor_sums()
    bad = []
    for name in sorted(set(want) | set(have)):
        if name not in have:
            bad.append("vendor/pdf/%s is listed in SHA256SUMS but the file is missing" % name)
        elif name not in want:
            bad.append("vendor/pdf/%s has no entry in SHA256SUMS" % name)
        elif want[name] != have[name]:
            bad.append("vendor/pdf/%s changed (sha256 %s, expected %s)" % (name, have[name][:16], want[name][:16]))
    return bad


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
            # Module files have local scopes; concatenating their raw imports/exports
            # falsely reports duplicate bindings. Check the same bundle we ship.
            block = ("".join(read(os.path.join(srcdir, fn)) for fn in e.get("pre", [])) + bundle(srcdir, e["entry"])) if e.get("entry") else "".join(read(os.path.join(srcdir, fn)) for fn in e["files"])
            write(tmp, block)
            n_blocks += 1
            r = subprocess.run([node, "--check", tmp], capture_output=True, text=True)
            if r.returncode:
                bad += 1
                print("node --check FAILED: block", e["open"], e["files"][0], why(r.stderr))
    print("lint: %d JS pieces, %d script blocks, %d failed" % (n_files, n_blocks, bad))
    return bad


def learn_lint():
    """T11 Learn U43: the plain-language gate. A Learn text that breaks the guide (sentence length, stiff Indonesian words,
    numbers that differ between English and Indonesian) stops the build. Needs node, which the minify step needs too."""
    data = os.path.join(SRC, "learn", "45-data-learn.js")
    if not os.path.exists(data): return
    r = subprocess.run(["node", os.path.join(ROOT, "tools", "learn_lint.js"), data], capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stderr or r.stdout); sys.exit("build stopped: Learn text does not pass tools/learn_lint.js")

def main(argv):
    if "--split" in argv:
        i = argv.index("--split")
        n = split(argv[i + 1], argv[i + 2])
        print("split into", n, "entries")
        return 0
    if "--verify-split" in argv:
        # T11: index.html is now minified, wrapped in a cascade layer and carries a CSP, so it no longer splits back into src/.
        # src/ is the only source. This check stays for builds made with --raw (no minify, no layer, no CSP).
        if "--raw" not in argv:
            print("--verify-split needs an index.html built with --raw (T11)"); return 0
        with tempfile.TemporaryDirectory() as d:
            n = split(OUT, d)
            again = assemble(d)
            same = again == read(OUT)
            print("split", n, "entries; rebuilt equals index.html:", same)
            return 0 if same else 1
    if "--vendor-update" in argv:
        write(os.path.join(VENDOR, "SHA256SUMS"), "".join("%s  %s\n" % (h, n) for n, h in vendor_sums().items()))
        print("wrote vendor/pdf/SHA256SUMS")
        return 0
    if "--lint" in argv:
        return 1 if lint(SRC) else 0
    learn_lint()
    html = assemble(SRC)
    if "--no-minify" not in argv:
        html = minify(html)
    html = with_csp(html)
    sw, h = sw_with(read(SW), html)
    if "--check" in argv:
        ok_html = html == read(OUT)
        ok_sw = sw == read(SW)
        print("index.html", "same" if ok_html else "DIFFERENT", "| sw.js", "same" if ok_sw else "DIFFERENT", "| hash", h)
        bad = lint(SRC)
        vb = vendor_check()
        for m in vb:
            print("vendor:", m)
        print("vendor/pdf", "ok" if not vb else "FAILED")
        return 0 if (ok_html and ok_sw and not bad and not vb) else 1
    write(OUT, html)
    write(SW, sw)
    print("built index.html %d bytes, sha256 %s, CACHE dnd-sheet-%s" % (len(html.encode("utf-8")), hashlib.sha256(html.encode("utf-8")).hexdigest(), h))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
