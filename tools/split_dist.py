#!/usr/bin/env python3
"""Split build for hosting (option B in reports/rencana-kerja-engine.md). index.html stays the single-file result of the project.
This tool makes a second form from it: the 35 deferred parts (builder, rules data, Learn, Training Ground) become files named
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
import base64, hashlib, os, re, sys

PART_RE = re.compile(r'<script type="text/x-defer" data-defer="([A-Za-z0-9_-]+)"( data-lazy="1")?>(.*?)</script>', re.S)
FONT_RE = re.compile(r"@font-face\{font-family:'?([^;']+?)'?;font-style:(\w+);font-weight:([0-9 ]+)([^}]*?)src:url\(data:font/woff2;base64,([A-Za-z0-9+/=]+)\)")
PRELOAD = (("Roboto", "400"), ("Roboto", "500"))  # the sheet's first screen (Record skin): preloaded so the text does not wait for the CSS to find them
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
SW_FONT = ('\n  /* M15: a font file has the hash of its content in the name, so the cache answers first and nothing is fetched again */\n'
           '  if(/\\/fonts\\/[A-Za-z0-9_-]+\\.[0-9a-f]{12}\\.woff2$/.test(u.pathname)){ e.respondWith(caches.match(r).then(function(hit){ return hit||fetch(r).then(function(res){ '
           'if(res.ok&&res.type==="basic"){ var cp=res.clone(); caches.open(CACHE).then(function(c){ c.put(r,cp); }); } return res; }); })); return; }')
SW_PART = ('\n  /* split build: a part file never changes under its name, so the cache answers and nothing is fetched in the background */\n'
           '  if(/\\/p\\/[A-Za-z0-9_-]+\\.[0-9a-f]{12}\\.js$/.test(u.pathname)){ e.respondWith(caches.match(r).then(function(hit){ return hit||fetch(r).then(function(res){ '
           'if(res.ok&&res.type==="basic"){ var cp=res.clone(); caches.open(CACHE).then(function(c){ c.put(r,cp); }); } return res; }); })); return; }')


def fonts(html):
    """M15: every font in a data URI in the CSS becomes fonts/FAMILY-WEIGHT.HASH.woff2. Returns the new page and [(rel, bytes)]."""
    files = []; links = []
    def one(m):
        fam, style, wt, mid, b64 = m.groups(); body = base64.b64decode(b64)
        rel = "fonts/%s-%s.%s.woff2" % (fam.replace(" ", ""), wt.replace(" ", "_"), hashlib.sha256(body).hexdigest()[:12])
        files.append((rel, body))
        if (fam, wt) in PRELOAD and "U+0000-00FF" in m.string[m.end():m.string.index("}", m.end())]: links.append(rel)  # the Latin subset only
        return "@font-face{font-family:%s;font-style:%s;font-weight:%s%ssrc:url(%s)" % (fam, style, wt, mid, rel)
    out = FONT_RE.sub(one, html)
    if links:
        tags = "".join('<link rel="preload" as="font" type="font/woff2" crossorigin href="%s">' % r for r in links)
        if out.count("<head>") != 1: raise SystemExit("split_dist: <head> not found once")
        out = out.replace("<head>", "<head>" + tags, 1)
    return out, files


def split(html, sw):
    html, ffiles = fonts(html)
    parts = []
    def one(m):
        name, lazy, body = m.group(1), m.group(2) or "", m.group(3).encode("utf-8")
        rel = "p/%s.%s.js" % (name, hashlib.sha256(body).hexdigest()[:12])
        parts.append((rel, body))
        return '<script type="text/x-defer" data-defer="%s"%s data-src="%s"></script>' % (name, lazy, rel)
    out = PART_RE.sub(one, html)
    if not parts:
        raise SystemExit("split_dist: no deferred part found in the page")
    if len({p[0] for p in parts}) != len(parts):
        raise SystemExit("split_dist: two parts have the same file name")
    for need in (SW_INSTALL, SW_API):
        if sw.count(need) != 1:
            raise SystemExit("split_dist: sw.js is not the expected text (missing: %s...)" % need[:60])
    names = ", ".join('"%s"' % p[0] for p in parts + ffiles)
    sw2 = sw.replace(SW_INSTALL, 'var PARTS=[%s];\n%s' % (names, SW_INSTALL_NEW)).replace(SW_API, SW_API + SW_FONT + SW_PART)
    # the cache name follows the split page (it holds the hash of every part), so it never equals the name of the single-file build
    sw2, k = CACHE_RE.subn(r'\g<1>' + hashlib.sha256(out.encode("utf-8")).hexdigest()[:16] + r'\g<2>', sw2)
    if k != 1:
        raise SystemExit("split_dist: the CACHE line of sw.js was not found")
    return out, sw2, parts + ffiles


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
    os.makedirs(os.path.join(outdir, "fonts"), exist_ok=True)
    for fn in os.listdir(os.path.join(outdir, "fonts")):
        if fn.endswith(".woff2"):
            os.remove(os.path.join(outdir, "fonts", fn))
    for rel, body in parts:
        with open(os.path.join(outdir, rel), "wb") as f:
            f.write(body)
    with open(os.path.join(outdir, "index.html"), "w", encoding="utf-8", newline="") as f:
        f.write(out)
    with open(os.path.join(outdir, "sw.js"), "w", encoding="utf-8", newline="") as f:
        f.write(sw2)
    print("split_dist: index.html %d bytes (was %d), %d files in p/ and fonts/, %d bytes" % (len(out.encode("utf-8")), len(html.encode("utf-8")), len(parts), sum(len(b) for _, b in parts)))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
