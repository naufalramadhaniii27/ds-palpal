#!/usr/bin/env python3
"""Items that 5e.tools lists and the Library lacked: magic item variants, item groups, base items, and single items.
Facts come from the data. Descriptions come from tools/q/overlay/itemgap.json (own wording, key "Name|SRC").
  python3 tools/q/items_gap.py --export OUT.json   entries that still need a description
  python3 tools/q/items_gap.py                     writes src/data/q16-items-gap.js (QREFS["item"])
Needs Q0_DIR with items.json, items-base.json, magicvariants.json. tools/q/itemhave.txt lists the item and gear names already in the app."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import qlib
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
HAVE = {norm(l) for l in open(os.path.join(HERE, "itemhave.txt"), encoding="utf-8").read().split("\n") if l}
OV_P = os.path.join(HERE, "overlay", "itemgap.json")
OV = json.load(open(OV_P, encoding="utf-8")) if os.path.exists(OV_P) else {}
RAR = {"none": "", "unknown": "Unknown", "unknown (magic)": "Unknown"}
TYPE = {"A": "Ammunition", "AF": "Ammunition (firearm)", "AT": "Artisan's tools", "EM": "Explosive", "EXP": "Explosive", "FD": "Food and drink", "G": "Adventuring gear", "GS": "Gaming set", "HA": "Heavy armor", "IM": "Instrument", "INS": "Instrument",
        "LA": "Light armor", "M": "Melee weapon", "MA": "Medium armor", "MNT": "Mount", "OTH": "Other", "P": "Potion", "R": "Ranged weapon", "RD": "Rod", "RG": "Ring", "S": "Shield", "SC": "Scroll", "SCF": "Spellcasting focus",
        "SHP": "Ship", "T": "Tool", "TAH": "Tack and harness", "TG": "Trade good", "VEH": "Vehicle", "WD": "Wand", "W": "Wondrous item", "GV": "Magic variant", "$": "Treasure", "$A": "Treasure (art)", "$C": "Treasure", "$G": "Treasure (gem)"}
DT = {"B": "Bludgeoning", "P": "Piercing", "S": "Slashing", "F": "Fire", "C": "Cold", "L": "Lightning", "N": "Necrotic", "O": "Force", "R": "Radiant", "T": "Thunder", "Y": "Psychic", "A": "Acid", "I": "Poison"}
def tname(t): return TYPE.get((t or "").split("|")[0], "")
def cost(v):
    if not v: return ""
    return ("%g gp" % (v / 100)) if v >= 100 else (("%g sp" % (v / 10)) if v >= 10 else "%g cp" % v)
def tiles(x):
    tl = []
    t = tname(x.get("type"))
    if x.get("wondrous") and not t: t = "Wondrous item"
    if t: tl.append(["Type", t])
    r = RAR.get(str(x.get("rarity", "")).lower(), str(x.get("rarity", "")).title())
    if r: tl.append(["Rarity", r])
    if x.get("reqAttune"): tl.append(["Attunement", "Required" if x["reqAttune"] is True else "Required " + re.sub(r"^by ", "by ", str(x["reqAttune"]))])
    if x.get("value"): tl.append(["Cost", cost(x["value"])])
    if x.get("weight"): tl.append(["Weight", "%g lb." % x["weight"]])
    if x.get("ac"): tl.append(["AC", str(x["ac"])])
    if x.get("dmg1"): tl.append(["Damage", "%s %s" % (x["dmg1"], DT.get(x.get("dmgType", ""), ""))])
    if x.get("range"): tl.append(["Range", x["range"]])
    return tl
def sub(x, kind): return kind + (" • " + tname(x.get("type")) if tname(x.get("type")) and kind != "Item group" else "")
def body(x):
    return qlib.walk(x.get("entries", []))
def src_ok(code): return True
def todo():
    out = []; seen = set()
    d = qlib.load("items.json"); b = qlib.load("items-base.json"); mv = qlib.load("magicvariants.json")
    def add(kind, x, text, extra=None):
        n = x["name"]; code = x.get("source") or (x.get("inherits") or {}).get("source") or "DMG"
        if norm(n) in HAVE or norm(n) in seen: return
        seen.add(norm(n)); out.append({"kind": kind, "x": x, "n": n, "src": code, "text": text, "extra": extra})
    for x in d["itemGroup"]: add("Item group", x, body(x), x.get("items"))
    for x in d["item"]: add("Item", x, body(x))
    for x in b["baseitem"]: add("Item", x, body(x))
    for x in mv["magicvariant"]:
        inh = x.get("inherits") or {}
        y = dict(inh); y["name"] = x["name"]; y["type"] = inh.get("type") or (x.get("type") if x.get("type") != "GV|DMG" else None)
        t = body(inh)
        for k in ("bonusWeapon", "bonusAc", "bonusWeaponAttack", "bonusWeaponDamage", "bonusSavingThrow", "bonusSpellAttack", "bonusAbilityCheck"):
            if inh.get(k): t = t.replace("{=%s}" % k, str(inh[k]))
        add("Magic variant", y, t, x.get("requires"))
    return out
def key(e): return "%s|%s" % (e["n"], e["src"].upper())
def main():
    rows = todo()
    if len(sys.argv) > 2 and sys.argv[1] == "--export":
        need = [{"key": key(e), "kind": e["kind"], "source_text": e["text"][:1800]} for e in rows if e["text"].strip() and not OV.get(key(e))]
        json.dump(need, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1); print(len(need), "need text of", len(rows)); return
    out = []; nodesc = 0
    for e in rows:
        x = e["x"]; sid = qlib.srcid(e["src"]); tl = tiles(x); p = []
        d = OV.get(key(e))
        if d: p.append(d)
        elif e["text"].strip(): nodesc += 1
        if e["kind"] == "Item group" and e["extra"]: p.append(["Members", ", ".join(m if isinstance(m, str) else m.get("item", "") for m in e["extra"]).replace("|", " ").replace(" dmg", "").replace(" xdmg", "").replace(" phb", "").replace(" xphb", "")[:1500]])
        if e["kind"] == "Magic variant" and e["extra"]:
            ap = []
            for r in e["extra"]:
                for k, v in r.items():
                    if k in ("type", "armor", "weapon", "sword", "axe", "bow", "crossbow", "polearm", "net", "dagger", "bludgeoning", "slashing", "piercing", "shield", "ammo") and v: ap.append(TYPE.get(str(v).split("|")[0], k if v is True else str(v)))
            if ap: p.append(["Applies to", ", ".join(dict.fromkeys(a for a in ap if a))])
        out.append({"n": e["n"], "s": sid, "sub": sub(x, e["kind"]), "tl": tl, "p": p, "tx": (e["n"] + " " + sub(x, e["kind"]) + " " + " ".join(q if isinstance(q, str) else q[1] for q in p)).lower()})
    open(os.path.join(ROOT, "src", "data", "q16-items-gap.js"), "w", encoding="utf-8").write("/* Generated by tools/q/items_gap.py. Own wording. Do not edit by hand. */\n(function(){\nvar ROWS=" + json.dumps(out, ensure_ascii=False) + ';\nwindow.QREFS=window.QREFS||{};window.QREFS["item"]=(window.QREFS["item"]||[]).concat(ROWS);\n})();\n')
    print(len(out), "rows,", nodesc, "without description")
main()
