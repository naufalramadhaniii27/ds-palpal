"""Q7 bestiary: 5e.tools monsters -> Library rows (stat block facts only). Free text of traits and actions is NOT copied: attacks are rebuilt from their numbers, other features show their name.
Used by qbuild.py. Rows: {n, s, sub, tl, p, tx}"""
import re, glob, json, os, qlib
W = "/home/claude/work/q0/bestiary/"
SZ = {"T": "Tiny", "S": "Small", "M": "Medium", "L": "Large", "H": "Huge", "G": "Gargantuan"}
AL = {"L": "lawful", "N": "neutral", "C": "chaotic", "G": "good", "E": "evil", "U": "unaligned", "A": "any alignment"}
def mod(v): return "%+d" % ((v - 10) // 2)
def strip(t): return re.sub(r"\{@\w+ ([^|}]*)[^}]*\}", r"\1", t) if isinstance(t, str) else str(t)
def typ(t):
    if isinstance(t, str): return t
    if isinstance(t, dict):
        x = t.get("type"); x = x if isinstance(x, str) else (x or {}).get("choose", ["?"])[0] if isinstance(x, dict) else str(x)
        tg = t.get("tags") or []
        return x + (" (%s)" % ", ".join(a if isinstance(a, str) else a.get("tag", "") for a in tg) if tg else "")
    return ""
def alignment(a):
    if not a: return ""
    if isinstance(a, list):
        if all(isinstance(x, str) for x in a):
            if a == ["U"]: return "unaligned"
            if a == ["A"]: return "any alignment"
            return " ".join(AL.get(x, x) for x in a)
        return "any"
    return ""
def acs(a):
    o = []
    for x in a or []:
        if isinstance(x, int): o.append(str(x))
        elif isinstance(x, dict): o.append("%s%s" % (x.get("ac"), (" (%s)" % ", ".join(strip(f) for f in x.get("from", [])) if x.get("from") else "")))
    return ", ".join(o)
def hp(h):
    if not isinstance(h, dict): return ""
    if "average" in h: return "%s (%s)" % (h["average"], h.get("formula", ""))
    return h.get("special", "")
def spd(s):
    if not isinstance(s, dict): return ""
    o = []
    for k, v in s.items():
        if k == "canHover": continue
        if isinstance(v, dict): v = "%s%s" % (v.get("number"), " " + strip(v["condition"]) if v.get("condition") else "")
        o.append(("%s ft." % v) if k == "walk" else "%s %s ft." % (k, v))
    return ", ".join(o)
def dmgl(x, key):
    o = []
    for e in x.get(key, []) or []:
        if isinstance(e, str): o.append(e)
        elif isinstance(e, dict):
            inner = e.get("immune") or e.get("resist") or e.get("vulnerable") or []
            o.append(", ".join(map(str, inner)) + (" " + e.get("note", "") if e.get("note") else ""))
    return "; ".join(o).replace(";", ",")
ATT = re.compile(r"\{@atk[r]?\s*([a-z,]+)\}\s*(?:\{@hit\s*(-?\d+)\})?")
def attack(e):
    """rebuild an attack line from its numbers; None when the entry has no attack tag"""
    t = " ".join(strip_keep(x) for x in e.get("entries", []) if isinstance(x, str))
    m = ATT.search(t)
    if not m: return None
    ty = m.group(1); kind = ("Melee" if "m" in ty.split(",") or ty in ("mw", "ms") else "Ranged") if ty else "Attack"
    if ty in ("m,r", "mw,rw"): kind = "Melee or ranged"
    out = [kind + " attack"]
    if m.group(2): out.append("%+d to hit" % int(m.group(2)))
    r = re.search(r"reach (\d+) ft", t); g = re.search(r"range (\d+(?:/\d+)?) ft", t)
    if r: out.append("reach %s ft." % r.group(1))
    if g: out.append("range %s ft." % g.group(1))
    d = re.findall(r"(\d+) \(\{@damage ([^}]*)\}\) (\w+(?: \w+)?) damage", t)
    if d: out.append("hit " + " plus ".join("%s (%s) %s" % (a, b.replace(" ", ""), c.split(" damage")[0].lower()) for a, b, c in d))
    dc = re.findall(r"\{@dc (\d+)\}", t)
    if dc: out.append("DC " + "/".join(dc))
    return ", ".join(out) + "."
def strip_keep(t): return t if isinstance(t, str) else ""
def block(items, att=True):
    out = []
    for e in items or []:
        if not isinstance(e, dict) or not e.get("name"): continue
        a = attack(e) if att else None
        out.append([strip(e["name"]), a or ""])
    return out
def spells(x):
    o = []
    for sc in x.get("spellcasting", []) or []:
        names = []
        def grab(v):
            if isinstance(v, str): names.append(re.sub(r"\{@spell ([^|}]*)[^}]*\}", r"\1", v))
            elif isinstance(v, list): [grab(a) for a in v]
            elif isinstance(v, dict): [grab(a) for a in v.values()]
        for k in ("will", "daily", "spells", "ritual", "rest", "weekly"): grab(sc.get(k, []))
        if names: o.append(", ".join(dict.fromkeys(names)))
    return "; ".join(o).replace(";", ",")
def load_all():
    allm = []; byk = {}
    for f in sorted(glob.glob(W + "*.json")):
        for m in json.load(open(f)).get("monster", []): allm.append(m); byk[(m["name"], m["source"])] = m
    return allm, byk
def resolve(m, byk, depth=0):
    c = m.get("_copy")
    if not c or depth > 4: return m
    base = byk.get((c["name"], c["source"]))
    if not base: return None
    base = resolve(base, byk, depth + 1)
    if base is None: return None
    r = dict(base); r.update({k: v for k, v in m.items() if k not in ("_copy",)})
    return r
def row(x, sid):
    cr = x.get("cr"); cr = cr.get("cr") if isinstance(cr, dict) else cr
    ab = "  ".join("%s %s (%s)" % (k.upper(), x[k], mod(x[k])) for k in ("str", "dex", "con", "int", "wis", "cha") if isinstance(x.get(k), int))
    sv = ", ".join("%s %s" % (k.upper(), v) for k, v in (x.get("save") or {}).items())
    sk = ", ".join("%s %s" % (k.title(), v) for k, v in (x.get("skill") or {}).items() if isinstance(v, str))
    sen = ", ".join(strip(s) for s in x.get("senses", []) or []) + ((", " if x.get("senses") else "") + "passive Perception %s" % x["passive"] if x.get("passive") else "")
    lang = ", ".join(strip(l) for l in x.get("languages", []) or [])
    sub = "%s %s%s%s" % (", ".join(SZ.get(s, s) for s in x.get("size", []) or []), typ(x.get("type")), (", " + alignment(x.get("alignment"))) if alignment(x.get("alignment")) else "", " • CR %s" % cr if cr is not None else "")
    tl = [["AC", acs(x.get("ac"))], ["HP", hp(x.get("hp"))], ["Speed", spd(x.get("speed"))], ["Abilities", ab], ["Saves", sv], ["Skills", sk], ["Senses", sen], ["Languages", lang],
          ["Resist", dmgl(x, "resist")], ["Immune", dmgl(x, "immune")], ["Vulnerable", dmgl(x, "vulnerable")], ["Condition immune", ", ".join(map(lambda c: c if isinstance(c, str) else "", x.get("conditionImmune", []) or []))],
          ["Environment", ", ".join(x.get("environment", []) or [])], ["Spells", spells(x)]]
    p = []
    for lab, key, att in (("Traits", "trait", False), ("Actions", "action", True), ("Bonus Actions", "bonus", True), ("Reactions", "reaction", True), ("Legendary Actions", "legendary", True)):
        for nm, a in block(x.get(key), att): p.append([lab[:-1] if lab.endswith("s") else lab, nm, a])
    pp = []
    cur = None
    for lab, nm, a in p:
        if lab != cur: pp.append("**%ss**" % lab if not lab.endswith("s") else "**%s**" % lab); cur = lab
        pp.append("**%s.** %s" % (nm, a) if a else "**%s.**" % nm)
    nm = x["name"]
    return {"n": nm, "s": sid, "sub": sub, "tl": [t for t in tl if t[1]], "p": pp, "tx": (nm + " " + sub + " " + " ".join(x.get("environment", []) or [])).lower()}
def rows():
    allm, byk = load_all(); out = []; skipped = []
    app = qlib.app()["src"]
    for m in allm:
        if m.get("reprintedAs") and False: pass
        x = resolve(m, byk)
        if x is None or not x.get("ac"): skipped.append("%s|%s" % (m["name"], m["source"])); continue
        out.append((m["source"], x))
    return out, skipped
