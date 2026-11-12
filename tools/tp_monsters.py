"""Stat block facts of third-party monsters as Library rows (QREFS.monster), same row shape as tools/q/qbuild.py.
Facts only: numbers, names, attack lines. Trait text is not copied. Used by tp_build.py for books with "monsters": True."""
import re, json

SIZE = {"T": "Tiny", "S": "Small", "M": "Medium", "L": "Large", "H": "Huge", "G": "Gargantuan", "C": "Colossal"}
AL = {"L": "lawful", "N": "neutral", "C": "chaotic", "G": "good", "E": "evil", "U": "unaligned", "A": "any alignment"}
AB = ["str", "dex", "con", "int", "wis", "cha"]


def clean(t):
    t = re.sub(r"\{@hit (-?\d+)\}", lambda m: "%+d" % int(m.group(1)), t)
    t = re.sub(r"\{@(?:damage|dice) ([^}|]+)(?:\|[^}]*)?\}", lambda m: m.group(1).replace(" ", ""), t)
    t = re.sub(r"\{@dc (\d+)\}", r"DC \1", t)
    t = t.replace("{@h}", "hit ")
    t = re.sub(r"\{@\w+ ([^}|]*)[^}]*\}", r"\1", t)
    return t


def mod(v):
    if isinstance(v, dict): return v.get("special", "varies")      # a form that sets the score from another one (Bear Form, Cat Form)
    return "%d (%+d)" % (v, (v - 10) // 2)


def typ(m):
    t = m["type"]
    if isinstance(t, dict):
        s = t["type"]
        tags = [x if isinstance(x, str) else x.get("tag", "") for x in t.get("tags", [])]
        if tags: s += " (" + ", ".join(tags) + ")"
        return s
    return t


def align(m):
    a = m.get("alignment", [])
    if a and all(isinstance(x, dict) for x in a):       # alternative alignments: join the variants
        out = []
        for x in a:
            t = align({"alignment": x.get("alignment", [])})
            if t not in out: out.append(t)
        return " or ".join(out)
    a = [x for x in a if not isinstance(x, dict)]
    if a == ["A"] or a == ["U"]: return AL[a[0]]
    if set(a) >= {"G", "NY", "E"}:      # good-evil axis open: any alignment on the law axis given
        lw = set(a) & {"L", "C", "NX"}
        return {frozenset({"L"}): "any lawful alignment", frozenset({"C"}): "any chaotic alignment", frozenset({"NX", "C"}): "any non-lawful alignment", frozenset({"NX", "L"}): "any non-chaotic alignment"}.get(frozenset(lw), "any alignment")
    if set(a) >= {"NX", "NY"}:      # both axes open: neutral on both, written as the plain word
        a = [x for x in a if x not in ("NX", "NY", "N")] + ["N"]
    w = [AL.get(x, x) for x in a if x not in ("NX", "NY")]
    return " ".join(w)


def ac(m):
    out = []
    for a in m.get("ac", []):
        if isinstance(a, dict) and "ac" not in a:
            out.append(clean(a.get("special", "")))
        elif isinstance(a, dict):
            fr = clean(", ".join(a.get("from", []))) if a.get("from") else a.get("condition", "")
            out.append("%d%s" % (a["ac"], " (%s)" % fr if fr else ""))
        else: out.append(str(a))
    return ", ".join(out)


def speed(m):
    sp = m.get("speed", {}); out = []
    for k, v in sp.items():
        if k == "canHover": continue
        n = v["number"] if isinstance(v, dict) else v
        out.append(("%d ft." % n) if k == "walk" else "%s %d ft.%s" % (k, n, " (hover)" if k == "fly" and sp.get("canHover") else ""))
    return ", ".join(out)


def dmgl(x):
    if isinstance(x, str): return x
    if "special" in x: return x["special"]
    s = ", ".join(dmgl(i) for i in x.get("immune", x.get("resist", x.get("vulnerable", [])))) if any(k in x for k in ("immune", "resist", "vulnerable")) else ""
    return (s + (" " + x["note"] if x.get("note") else "")).strip()


def attack(ent):
    if not ent or not isinstance(ent[0], str) or "{@atk" not in ent[0]: return ""
    t = ent[0]
    mk = re.search(r"\{@atkr? ([^}]+)\}", t)
    if not mk: return ""
    kind = mk.group(1)
    ty = "Melee or ranged attack" if "m" in kind and "r" in kind else "Melee attack" if "m" in kind else "Ranged attack"
    hit = re.search(r"\{@hit (-?\d+)\}", t)
    rr = re.search(r"((?:reach \d+ ft\.)(?: or range [\d/]+ ft\.)?|range [\d/]+ ft\.)", t)
    parts = [ty]
    if hit: parts.append("%+d to hit" % int(hit.group(1)))
    if rr: parts.append(rr.group(1))
    hits = re.findall(r"\{@h\}(\d+) \(\{@damage ([^}|]+)(?:\|[^}]*)?\}\)([^.,;]*?) damage", t)
    for n, dice, kindd in hits:
        parts.append("hit %s (%s)%s" % (n, dice.replace(" ", ""), kindd.replace(" in melee", "").replace(" at range", "")))
    dc = re.search(r"\{@dc (\d+)\}", t)
    if dc: parts.append("DC " + dc.group(1))
    return ", ".join(parts) + "."


def block(title, lst):
    out = []
    for e in lst or []:
        a = attack(e.get("entries", []))
        out.append("**%s.**%s" % (clean(e["name"]), (" " + a) if a else ""))
    return (["**%s**" % title] + out) if out else []


def row(m, skey):
    tl = [["AC", ac(m)], ["HP", "%d (%s)" % (m["hp"]["average"], m["hp"]["formula"]) if "formula" in m["hp"] else str(m["hp"].get("special", ""))],
          ["Speed", speed(m)], ["Abilities", "  ".join("%s %s" % (a.upper(), mod(m[a])) for a in AB)]]
    if m.get("save"): tl.append(["Saves", ", ".join("%s %s" % (k.upper(), v) for k, v in m["save"].items())])
    if m.get("skill"): tl.append(["Skills", ", ".join("%s %s" % (k.split("|")[0].title(), v) for k, v in m["skill"].items())])
    se = list(m.get("senses", [])) + ["passive Perception %d" % m["passive"]] if m.get("passive") else list(m.get("senses", []))
    tl.append(["Senses", clean(", ".join(se))])
    tl.append(["Languages", ", ".join(m.get("languages", [])) or "-"])
    for lab, k in (("Vulnerable", "vulnerable"), ("Resist", "resist"), ("Immune", "immune")):
        if m.get(k): tl.append([lab, ", ".join(dmgl(x) for x in m[k])])
    if m.get("conditionImmune"): tl.append(["Condition immune", ", ".join(x if isinstance(x, str) else str(x) for x in m["conditionImmune"])])
    cr = m.get("cr", "-")
    cr = cr["cr"] if isinstance(cr, dict) else cr
    sz = "/".join(SIZE.get(s, s) for s in m.get("size", ["M"]))
    sub = "%s %s, %s • CR %s" % (sz, typ(m), align(m), cr)
    p = block("Traits", (m.get("trait") or []) + [{"name": s["name"], "entries": []} for s in (m.get("spellcasting") or [])]) \
        + block("Actions", m.get("action")) + block("Bonus Actions", m.get("bonus")) + block("Reactions", m.get("reaction"))
    return {"n": m["name"], "s": skey, "sub": sub, "tl": tl, "p": p, "tx": ("%s %s %s, %s • cr %s " % (m["name"], sz, typ(m), align(m), cr)).lower(), "im": ""}


def monster_file(monsters, skey, label):
    rows = [row(m, skey) for m in monsters]
    return ("/* Generated by tools/tp_monsters.py from %s. Stat block facts only. Do not edit by hand. */\n(function(){\nvar ROWS=%s;\n"
            "DataEnv.slot.QREFS=DataEnv.slot.QREFS||{};DataEnv.slot.QREFS[\"monster\"]=(DataEnv.slot.QREFS[\"monster\"]||[]).concat(ROWS);\n})();\n") % (label, json.dumps(rows, ensure_ascii=False))
