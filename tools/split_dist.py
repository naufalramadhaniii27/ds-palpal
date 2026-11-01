#!/usr/bin/env python3
"""Split build for hosting (option B in reports/rencana-kerja-engine.md). index.html stays the single-file result of the project.
This tool makes a second form from it: the 34 deferred parts (builder, rules data, Learn, Training Ground) become files named
p/NAME.HASH.js, so the first download is the sheet alone (about 1 MB gzip instead of 4 MB). Python standard library only.

  python3 tools/split_dist.py SRC_INDEX SRC_SW OUTDIR     write OUTDIR/index.html, OUTDIR/sw.js and OUTDIR/p/*.js

What changes:
  index.html  each <script type="text/x-defer" data-defer="N">TEXT</script> becomes <script ... data-src="p/N.HASH.js"></script> (no text).
              The Content-Security-Policy meta is NOT touched: it already holds the sha256 of every TEXT, and the loader runs the fetched
              text as an inline script, so a part that arrives changed or cut short is refused by the browser.
  sw.js       the part files are listed in PARTS and stored at install (a part already in an older cache is copied, not downloaded again,
              because its name carries the hash of its content). A request for p/NAME.HASH.js is answered from the cache first and never
              fetched again in the background (the old rule fetches every file again on each visit, which would cost 14 MB).
Run it on the files that build.py wrote. It refuses to run when the page has no deferred part or the service worker text is not the expected one."""
import hashlib, os, re, sys

PART_RE = re.compile(r'<script type="text/x-defer" data-defer="([A-Za-z0-9_-]+)">(.*?)</script>', re.S)
CACHE_RE = re.compile(r'(var CACHE="dnd-sheet-)[0-9a-f]{16}(";)')
SW_INSTALL = ('self.addEventListener("install",function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ '
              'return c.addAll(SHELL.map(function(u){ return new Request(u,{cache:"reload"}); })); })); });')
SW_INSTALL_NEW = '''self.addEventListener("install",function(e){ e.waitUntil(caches.open(CACHE).then(function(c){
  return c.addAll(SHELL.map(function(u){ return new Request(u,{cache:"reload"}); })).then(function(){
    /* split build: the parts have the hash of their content in the name, so one found in an older cache is the same file */
    var q=PARTS.slice(), one=function(){ var u=q.shift(); if(!u) return Promise.resolve();
      return c.match(u).then(function(h){ return h||caches.match(u); }).then(function(h){ return h?c.put(u,h.clone()):c.add(u); }).then(one); };
    return Promise.all([one(),one(),one(),one()]); }); })); });'''
SW_API = 'if(u.pathname.indexOf("/api/")===0) return;'
SW_PART = ('\n  /* split build: a part file never changes under its name, so the cache answers and nothing is fetched in the background */\n'
           '  if(/\\/p\\/[A-Za-z0-9_-]+\\.[0-9a-f]{12}\\.js$/.test(u.pathname)){ e.respondWith(caches.match(r).then(function(hit){ return hit||fetch(r).then(function(res){ '
           'if(res.ok&&res.type==="basic"){ var cp=res.clone(); caches.open(CACHE).then(function(c){ c.put(r,cp); }); } return res; }); })); return; }')


def split(html, sw):
    parts = []
    def one(m):
        name, body = m.group(1), m.group(2).encode("utf-8")
        rel = "p/%s.%s.js" % (name, hashlib.sha256(body).hexdigest()[:12])
        parts.append((rel, body))
        return '<script type="text/x-defer" data-defer="%s" data-src="%s"></script>' % (name, rel)
    out = PART_RE.sub(one, html)
    if not parts:
        raise SystemExit("split_dist: no deferred part found in the page")
    if len({p[0] for p in parts}) != len(parts):
        raise SystemExit("split_dist: two parts have the same file name")
    for need in (SW_INSTALL, SW_API):
        if sw.count(need) != 1:
            raise SystemExit("split_dist: sw.js is not the expected text (missing: %s...)" % need[:60])
    names = ", ".join('"%s"' % p[0] for p in parts)
    sw2 = sw.replace(SW_INSTALL, 'var PARTS=[%s];\n%s' % (names, SW_INSTALL_NEW)).replace(SW_API, SW_API + SW_PART)
    # the cache name follows the split page (it holds the hash of every part), so it never equals the name of the single-file build
    sw2, k = CACHE_RE.subn(r'\g<1>' + hashlib.sha256(out.encode("utf-8")).hexdigest()[:16] + r'\g<2>', sw2)
    if k != 1:
        raise SystemExit("split_dist: the CACHE line of sw.js was not found")
    return out, sw2, parts


def main(argv):
    if len(argv) != 3:
        print(__doc__); return 2
    src_html, src_sw, outdir = argv
    html = open(src_html, encoding="utf-8").read()
    sw = open(src_sw, encoding="utf-8").read()
    out, sw2, parts = split(html, sw)
    os.makedirs(os.path.join(outdir, "p"), exist_ok=True)
    for fn in os.listdir(os.path.join(outdir, "p")):
        if fn.endswith(".js"):
            os.remove(os.path.join(outdir, "p", fn))
    for rel, body in parts:
        with open(os.path.join(outdir, rel), "wb") as f:
            f.write(body)
    with open(os.path.join(outdir, "index.html"), "w", encoding="utf-8", newline="") as f:
        f.write(out)
    with open(os.path.join(outdir, "sw.js"), "w", encoding="utf-8", newline="") as f:
        f.write(sw2)
    print("split_dist: index.html %d bytes (was %d), %d parts, %d bytes in p/" % (len(out.encode("utf-8")), len(html.encode("utf-8")), len(parts), sum(len(b) for _, b in parts)))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
