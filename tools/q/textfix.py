#!/usr/bin/env python3
"""Text for Library entries whose 5etools data is a template or a copy: items built from {#itemEntry ...}, _copy variants, languages with speakers only.
python3 tools/q/textfix.py /path/to/5etools-src/data EMPTIES.json  ->  src/data/q22-textfix.js (window.ITEMFIX, window.ITEMTPL, window.LANGFIX)"""
import json, os, re, sys, copy
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tp"))
import hb
D = sys.argv[1]; EMP = json.load(open(sys.argv[2])); ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
items = json.load(open(os.path.join(D, "items.json"), encoding="utf-8"))["item"]
base = json.load(open(os.path.join(D, "items-base.json"), encoding="utf-8"))
tpl = base["itemEntry"]; mv = json.load(open(os.path.join(D, "magicvariants.json"), encoding="utf-8"))["magicvariant"]
PRI = ["XDMG", "XPHB", "DMG", "PHB"]
def pick(rows, src=None):
    if src:
        for r in rows:
            if r.get("source") == src: return r
    for p in PRI:
        for r in rows:
            if r.get("source") == p: return r
    return rows[0] if rows else None
def find(name, src=None): return pick([x for x in items if x["name"] == name] + [x for x in mv if x["name"] == name], src)
def listj(v): v = [str(x) for x in v]; return v[0] if len(v) == 1 else ", ".join(v[:-1]) + " and " + v[-1]
def render(t, item):
    def sub(m):
        k = m.group(1).strip()
        if k == "item.resist" or k == "getFullImmRes item.resist": return listj(item.get("resist", []))
        if k.startswith("item."): v = item.get(k[5:]); return str(v) if v is not None else ""
        return ""
    return re.sub(r"\{\{([^}]*)\}\}", sub, t)
def expand(e, item):
    if isinstance(e, str):
        m = re.fullmatch(r"\{#itemEntry ([^|}]+)(?:\|([^}]*))?\}", e.strip())
        if m:
            rows = [x for x in tpl if x["name"] == m.group(1)]; t = pick(rows, m.group(2) or item.get("source"))
            return [expand(x, item) for x in t["entriesTemplate"]] if t else []
        return render(e, item)
    if isinstance(e, list): return [expand(x, item) for x in e]
    if isinstance(e, dict):
        o = dict(e)
        for k in ("entries", "items", "entry"):
            if k in o: o[k] = expand(o[k], item)
        return o
    return e
def flat(x):
    o = []
    for y in x:
        if isinstance(y, list): o += flat(y)
        else: o.append(y)
    return o
def resolve(item, depth=0):
    item = copy.deepcopy(item)
    if "_copy" in item and depth < 6:
        c = item["_copy"]; b = find(c["name"], c.get("source")); 
        if b:
            b = resolve(b, depth + 1); ent = copy.deepcopy(b.get("entries", []))
            mod = (c.get("_mod") or {}); 
            for key in ("entries", "inherits.entries"):
                ops = mod.get(key)
                for op in (ops if isinstance(ops, list) else [ops] if ops else []):
                    it = op.get("items"); it = it if isinstance(it, list) else [it]
                    if op["mode"] == "appendArr": ent += it
                    elif op["mode"] == "prependArr": ent = it + ent
                    elif op["mode"] == "replaceArr":
                        i = op["replace"]["index"] if isinstance(op["replace"], dict) else 0; ent[i:i + 1] = it
            for k, v in b.items():
                if k not in item and k not in ("entries", "source", "page"): item[k] = v
            item["entries"] = ent
    item["entries"] = flat([expand(x, item) for x in item.get("entries", [])])
    return item
def text(es):
    out = []
    for e in es:
        if isinstance(e, str): out.append(hb.strip(e))
        elif isinstance(e, dict):
            t = e.get("type")
            if t == "list": out.append("\n".join("• " + hb.strip(x if isinstance(x, str) else (x.get("name", "") + ": " if x.get("name") else "") + " ".join(hb.strip(y) if isinstance(y, str) else "" for y in flat(x.get("entries", [x.get("entry", "")])))) for x in e.get("items", [])))
            elif t == "table": out.append("")
            else:
                sub = text(flat(e.get("entries", [])))
                out.append((e["name"] + ". " if e.get("name") else "") + sub)
    return re.sub(r"Magic Item Property Tables; ", "", "\n\n".join(x for x in out if x.strip()))
fix = {}
for c, n in EMP:
    if c != "item": continue
    it = find(n)
    if not it: print("no source for", n); continue
    r = resolve(it); t = text(r["entries"]).strip()
    if t and "{{" not in t and "{#" not in t: fix[n] = t
    else: print("unresolved", n)
tp = {}
for t in tpl:
    s = json.dumps(t["entriesTemplate"])
    if "{{" not in s: tp[t["name"] + "|" + t["source"]] = text(flat(t["entriesTemplate"]))
lang = {}
L = json.load(open(os.path.join(D, "languages.json"), encoding="utf-8"))["language"]
for c, n in EMP:
    if c != "language": continue
    rows = [x for x in L if x["name"] == n]; sp = []; sc = ""; ty = ""; en = ""; og = ""
    for x in rows:
        for s in x.get("typicalSpeakers", []):
            s = hb.strip(s); s = re.sub(r"^\{@filter ", "", s)
            if s not in sp: sp.append(s)
        sc = sc or x.get("script", ""); ty = ty or x.get("type", ""); og = og or x.get("origin", "")
        if x.get("entries") and not en: en = text(flat(x["entries"]))
    if sc.lower() == "none": sc = ""
    t = en
    if sp or sc or og: t = (t + "\n\n" if t else "") + (("Origin: " + og + ". ") if og else "") + ("Typical speakers: " + ", ".join(sp) + ". " if sp else "") + ("Written in the " + sc + " script." if sc else "")
    if not t:
        bk = {"TftYP": "Tales from the Yawning Portal"}; src = rows[0]["source"] if rows else ""
        t = ("This language appears in %s" % bk.get(src, "the source books")) + (" (page %s)" % rows[0]["page"] if rows and rows[0].get("page") else "") + ". The book gives no further description."
    lang[n] = t.strip()
dk = {}
D2 = json.load(open(os.path.join(D, "decks.json"), encoding="utf-8"))["deck"]
for c, n in EMP:
    if c != "deck": continue
    x = pick([d for d in D2 if d["name"] == n])
    if x and x.get("cards"): dk[n] = "Cards in this deck: " + ", ".join(sorted((cd["uid"] if isinstance(cd, dict) else cd).split("|")[0] for cd in x["cards"])) + "."
js = "/* Generated by tools/q/textfix.py. Item text built from 5etools templates, and language notes. */\nwindow.ITEMFIX=" + json.dumps(fix, ensure_ascii=False) + ";\nwindow.ITEMTPL=" + json.dumps(tp, ensure_ascii=False) + ";\nwindow.LANGFIX=" + json.dumps(lang, ensure_ascii=False) + ";\nwindow.DECKFIX=" + json.dumps(dk, ensure_ascii=False) + ";\n"
open(os.path.join(ROOT, "src", "data", "q22-textfix.js"), "w", encoding="utf-8").write(js)
print(len(fix), len(tp), len(lang), len(js) // 1024, "KB")
