#!/usr/bin/env python3
"""audit_char: check one character's sheet for the kinds of mistakes the owner found by reading PDFs.

  python3 tools/audit_char.py FILE.json      FILE is a build (the builder's B object, or {"build": B}) or a finished sheet (has "features")
  python3 tools/audit_char.py --tigor        the Tigor build of tests/valda14_tigor.py
  python3 tools/audit_char.py --selftest     the checks must flag a sheet with the old Tigor mistakes put in by hand
  python3 tools/audit_char.py --sweep        every class and subclass of both rule sets and of every third-party book, levels 3, 10, 20 (__bldFuzz);
                                             also flags a sheet with under 3 features and a missing subclass group at level 10+

Checks on the sheet (C.features and labels), the same for every character:
  group     2014 rules: Ability Score Improvement or a Fighting Style listed under Feats (it is a class feature in 2014)
  book      a feature of a third-party class, subclass, species or feat labelled with a core book (PHB-2014, PHB-2024)
  edition   a 2014 sheet with a PHB-2024 label or 2024 feat text ("This feat can't push", "Repeatable")
  text      a feature with no text
  double    the same feature twice in one group with the same label
Exit 1 when anything is flagged. Read only: writes nothing."""
import json, os, re, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CORE = re.compile(r"^PHB-20(14|24)\b")
TEXT24 = ("This feat can't push", "Repeatable")


def sheet_for(build, sources):
    with sync_playwright() as p:
        br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
        pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500)
        pg.evaluate("()=>window.__bldNeed()")
        for _ in range(600):
            if pg.evaluate("()=>typeof window.__bldSheetFor==='function'"): break
            pg.wait_for_timeout(100)
        pg.evaluate("ks=>ks.forEach(k=>window.__setSrc&&window.__setSrc(k,true))", sources)
        if isinstance(build, str):
            pg.evaluate(build); C = pg.evaluate("()=>window.__tig")
        else:
            C = pg.evaluate("b=>{const t=window.__bldTestB();Object.assign(t,b);delete t.unset;return window.__bldSheetFor(t)}", build)
        tp = pg.evaluate("""()=>{const o={};((window.WX&&WX.src)||[]).forEach(q=>{if(!q.tp)return;
            [].concat(q.classes||[],q.subs||[],q.species||[],q.feats||[]).forEach(n=>{if(!(n in o))o[n]=q.tag||q.id})});return o}""")
        br.close()
    return C, tp


def audit(C, tp):
    out = []
    r14 = str(C.get("rs", "")) == "2014"
    tpn = {re.sub(r" \(2014\)$", "", k): v for k, v in tp.items()}
    tpn.update(tp)
    for g in C.get("features") or []:
        gname = g.get("g", ""); seen = set()
        for it in g.get("items") or []:
            n, s = it.get("n", ""), str(it.get("s") or "")
            where = "%s / %s" % (gname, n)
            if r14 and gname == "Feats" and (n == "Ability Score Improvement" or n.startswith("Fighting Style")):
                out.append(("group", where, "2014 rules: this is a class feature, not a feat"))
            m = re.match(r"^[^,]+, (.+?)( \d+| table)?$", s)
            owner = m.group(1) if m else ""
            if CORE.match(s) and (owner in tpn or re.sub(r" \(2014\)$", "", owner) in tpn):
                out.append(("book", where, "label %r, the book is %s" % (s, tpn.get(owner) or tpn.get(re.sub(r" \(2014\)$", "", owner)))))
            if r14 and ("PHB-2024" in s or any(t in str(it.get("full") or it.get("d") or "") for t in TEXT24)):
                out.append(("edition", where, "2024 label or feat text on a 2014 sheet"))
            if not (it.get("d") or it.get("full") or it.get("t")):
                out.append(("text", where, "no text"))
            if (n, s) in seen:  # same name at two levels (Expertise at Bard 2 and 9) is the book, same name and same label is a double
                out.append(("double", where, "listed twice with the same label"))
            seen.add((n, s))
    return out


def report(name, found):
    if not found:
        print("audit_char %s: OK, nothing flagged" % name); return 0
    print("audit_char %s: %d flagged" % (name, len(found)))
    for k, w, m in found:
        print("  %-7s %s: %s" % (k, w, m))
    return 1


def tigor():
    s = open(os.path.join(ROOT, "tests", "valda14_tigor.py"), encoding="utf-8").read()
    return re.search(r'BUILD = """(.*?)"""', s, re.S).group(1)


TIGOR_SRC = ["tvss14", "erlw", "phb14", "dmg14", "cos"]


def selftest():
    C, tp = sheet_for(tigor(), TIGOR_SRC)
    if audit(C, tp):
        print("selftest: the current Tigor sheet already has findings"); return report("Tigor", audit(C, tp))
    # put back the three mistakes of 2026-11-11 (reports/requests.md) and a double
    feats = next(g for g in C["features"] if g["g"] == "Feats")
    feats["items"].append({"n": "Ability Score Improvement", "s": "PHB-2024, General Feat", "d": "This feat can't push an ability above 20. Repeatable."})
    feats["items"].append({"n": "Fighting Style: Protection", "s": "PHB-2014, Protection", "d": "x"})
    cls = next(g for g in C["features"] if g["g"].startswith("Warden"))
    cls["items"][0]["s"] = "PHB-2014, Warden (2014) 1"
    cls["items"].append(dict(cls["items"][1]))
    kinds = {k for k, _, _ in audit(C, tp)}
    want = {"group", "book", "edition", "double"}
    if want <= kinds:
        print("selftest OK: flagged %s" % ", ".join(sorted(kinds))); return 0
    print("selftest FAIL: missed %s" % ", ".join(sorted(want - kinds))); return 1


def sweep():
    found = {}
    with sync_playwright() as p:
        br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(300000)
        pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500)
        pg.evaluate("()=>window.__bldNeed()")
        for _ in range(600):
            if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
            pg.wait_for_timeout(100)
        tp = pg.evaluate("""()=>{const o={};((window.WX&&WX.src)||[]).forEach(q=>{if(!q.tp)return;
            [].concat(q.classes||[],q.subs||[],q.species||[],q.feats||[]).forEach(n=>{if(!(n in o))o[n]=q.tag||q.id})});return o}""")
        n = 0
        for rs in ("2024", "2014"):
            L = pg.evaluate("r=>window.__bldLists(r==='2014'?'2014':undefined)", rs)
            os_ = []
            for cls in L["cls"]:
                subs = [x for x in (L["subs"].get(cls) or []) if rs == "2014" or not x.endswith("(2014)")] or [""]
                for sub in subs:
                    for lv in (3, 10, 20):
                        n += 1
                        os_.append({"cls": cls, "sub": sub, "lv": lv, "sp": L["sp"][n % len(L["sp"])], "bg": L["bg"][n % len(L["bg"])],
                                    "arr": L["arr"], "b2": n % 3, "b1": n % 2, "rs": rs, "src": L.get("src")})
            for i in range(0, len(os_), 40):
                rows = pg.evaluate("os=>os.map(o=>{try{const r=window.__bldFuzz(o);return r&&r.c?{o:o,c:{rs:r.c.rs,features:r.c.features}}:{o:o,err:String(r&&r.err)}}catch(e){return {o:o,err:String(e)}}})", os_[i:i + 40])
                for r in rows:
                    o = r["o"]; who = "%s %s / %s %d" % (o["rs"], o["cls"], o["sub"] or "-", o["lv"])
                    if r.get("err"):
                        found.setdefault(("builder", r["err"][:80]), []).append(who); continue
                    if o["rs"] == "2014": r["c"]["rs"] = "2014"
                    for k, w, m in audit(r["c"], tp):
                        found.setdefault((k, w.split(" / ", 1)[-1] + ": " + m), []).append(who)
        # third-party books: every class of the book with each of its subclasses, and the book's subclasses of other classes
        TP = r"""()=>{const out=[];((window.WX&&WX.src)||[]).filter(q=>q.tp&&((q.classes||[]).length||(q.subs||[]).length)).forEach(q=>{
          const rs=/14$/.test(q.tag||'')?'2014':'2024', src={}; src[q.id]=true; if(rs==='2014'){src.phb14=true;src.dmg14=true;}
          const base={sp:rs==='2014'?'Human (2014)':'Human',bg:rs==='2014'?'Soldier (2014)':'Soldier',arr:[15,14,13,12,10,8],b2:0,b1:0,rs:rs,src:src};
          const probe=Object.assign({},base,{cls:(q.classes||[])[0]||(rs==='2014'?'Fighter':'Fighter'),sub:'',lv:3}); try{window.__bldFuzz(probe)}catch(e){}
          const pairs=[]; (q.classes||[]).forEach(c=>{const S=Object.keys(((window.CLASSES||{})[c]||{}).subs||{}); (S.length?S:['']).forEach(sb=>pairs.push([c,sb]))});
          Object.keys(window.CLASSES||{}).forEach(c=>{if((q.classes||[]).includes(c))return; Object.keys(CLASSES[c].subs||{}).forEach(sb=>{if((q.subs||[]).includes(sb))pairs.push([c,sb])})});
          if(!pairs.length)(q.classes||[]).forEach(c=>pairs.push([c,'']));
          pairs.forEach(pr=>[3,10,20].forEach(lv=>out.push(Object.assign({},base,{cls:pr[0],sub:pr[1],lv:lv,book:q.tag||q.id}))))});return out}"""
        os_ = pg.evaluate(TP)
        books = {}
        for o in os_: books[o["book"]] = books.get(o["book"], 0) + 1
        print("third-party builds:", books)
        for i in range(0, len(os_), 40):
            rows = pg.evaluate("os=>os.map(o=>{try{const r=window.__bldFuzz(o);return r&&r.c?{o:o,c:{rs:r.c.rs,features:r.c.features}}:{o:o,err:String(r&&r.err)}}catch(e){return {o:o,err:String(e)}}})", os_[i:i + 40])
            for r in rows:
                o = r["o"]; n += 1; who = "%s %s %s / %s %d" % (o["book"], o["rs"], o["cls"], o["sub"] or "-", o["lv"])
                if r.get("err"):
                    found.setdefault(("builder", r["err"][:80]), []).append(who); continue
                if o["rs"] == "2014": r["c"]["rs"] = "2014"
                items = sum(len(g.get("items") or []) for g in r["c"].get("features") or [])
                if items < 3:
                    found.setdefault(("empty", "sheet has %d features" % items), []).append(who)
                if o["sub"] and o["lv"] >= 10 and not any(o["sub"] in (g.get("g") or "") for g in r["c"].get("features") or []):
                    found.setdefault(("nosub", "subclass group missing at level 10+"), []).append(who)
                for k, w, m in audit(r["c"], tp):
                    found.setdefault((k, w.split(" / ", 1)[-1] + ": " + m), []).append(who)
        br.close()
    print("audit_char sweep: %d characters, %d kinds of finding" % (n, len(found)))
    for (k, what), whos in sorted(found.items(), key=lambda x: -len(x[1])):
        print("  %-7s x%-4d %s   e.g. %s" % (k, len(whos), what, whos[0]))
    return 1 if found else 0


def main():
    a = sys.argv[1:]
    if not a:
        print(__doc__); return 2
    if a[0] == "--sweep":
        return sweep()
    if a[0] == "--selftest":
        return selftest()
    if a[0] == "--tigor":
        C, tp = sheet_for(tigor(), TIGOR_SRC); return report("Tigor", audit(C, tp))
    d = json.load(open(a[0], encoding="utf-8"))
    if "features" in d:
        _, tp = sheet_for({}, []); return report(os.path.basename(a[0]), audit(d, tp))
    b = d.get("build", d)
    src = [k for k, v in (b.get("src") or {}).items() if v and k != "core"]
    C, tp = sheet_for(b, src); return report(b.get("name") or os.path.basename(a[0]), audit(C, tp))


sys.exit(main())
