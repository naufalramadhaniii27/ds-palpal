"""Generic Q reference categories: source data -> entries {key,name,src,sub,tl,text,mech}. Prose comes from overlays tools/q/overlay/<cat>_*.py (D = {"Name|SRC": str}).
Facts (stats, tiles, tables of values) are built here. Prose is rewritten by agents. Used by qbuild.py."""
import re, qlib
def W(f): return qlib.load(f)
def _n(x): return x if isinstance(x, str) else str(x)
def _sz(s): return ", ".join({"T": "Tiny", "S": "Small", "M": "Medium", "L": "Large", "H": "Huge", "G": "Gargantuan"}.get(a, a) for a in (s or []))
def _spd(s):
    if isinstance(s, (int, float)): return "%s ft." % s
    if not isinstance(s, dict): return ""
    o = []
    for k, v in s.items():
        if isinstance(v, dict): v = "%s %s" % (v.get("number"), v.get("condition", "")); 
        o.append(("%s %s ft." % (k, v)) if k != "walk" else "%s ft." % v)
    return ", ".join(o)
def _ent(x, text="", mech=None, sub="", tl=None):
    return {"name": x["name"], "src": x["source"], "sub": sub, "tl": [t for t in (tl or []) if t[1] not in ("", None)], "text": text, "mech": mech or []}
def disease():
    d = W("conditionsdiseases.json"); out = []
    for x in d["disease"]: out.append(_ent(x, qlib.walk(x["entries"]), sub="Disease"))
    for x in d["status"]: out.append(_ent(x, qlib.walk(x["entries"]), sub="Status"))
    return out
def cult():
    d = W("cultsboons.json"); out = []
    for x in d["cult"]: out.append(_ent(x, qlib.walk(x["entries"]), sub="Cult" + (" • " + x["type"] if x.get("type") else ""), tl=[["Kind", x.get("type", "")]]))
    for x in d["boon"]: out.append(_ent(x, qlib.walk(x["entries"]), sub="Supernatural Boon" + (" • " + x["type"] if x.get("type") else ""), tl=[["Kind", x.get("type", "")]]))
    return out
OPT = {"CS": "Character Secret", "HS": "Hook", "DG": "Dragonmark", "OF": "Optional Feature", "RF": "Racial Feature", "SG": "Supernatural Gift", "SS": "Secret"}
def charopt():
    out = []
    for x in W("charcreationoptions.json")["charoption"]:
        ot = ", ".join(OPT.get(t, t) for t in x.get("optionType", []))
        out.append(_ent(x, qlib.walk(x.get("entries", [])), sub="Character Option" + (" • " + ot if ot else ""), tl=[["Type", ot], ["Prerequisite", qlib.walk(x.get("prerequisite", [])) if x.get("prerequisite") else ""]]))
    return out
def recipe():
    out = []
    for x in W("recipes.json")["recipe"]:
        ing = [re.sub(r"\{=?[^}]*\}", "", qlib.walk([i["entry"]] if isinstance(i, dict) and "entry" in i else [i])) for i in x.get("ingredients", [])]
        out.append(_ent(x, qlib.walk(x.get("instructions", [])), sub="Recipe" + (" • " + x["type"] if x.get("type") else ""),
                        tl=[["Type", x.get("type", "")], ["Dish", ", ".join(x.get("dishTypes", []))], ["Makes", x.get("makes", "")], ["Allergens", ", ".join(x.get("allergenGroups", []))]]))
        out[-1]["ing"] = x.get("ingredients", [])
    return out
def hazard():
    out = []; d = W("trapshazards.json")
    for k, lab in (("trap", "Trap"), ("hazard", "Hazard")):
        for x in d[k]:
            r = x.get("rating") or []
            rt = ", ".join("Tier %s, %s" % (a.get("tier"), a.get("threat")) for a in r)
            out.append(_ent(x, qlib.walk(x.get("entries", [])), sub=lab, tl=[["Type", x.get("trapHazType", "")], ["Rating", rt]]))
    return out
def vehicle():
    out = []; d = W("vehicles.json")
    for x in d["vehicle"]:
        out.append(_ent(x, qlib.walk(x.get("entries", [])), sub="Vehicle • " + (x.get("vehicleType") or ""), tl=[["Size", _sz(x.get("size"))], ["Terrain", ", ".join(x.get("terrain", []))], ["Crew", x.get("capCrew")], ["Passengers", x.get("capPassenger")], ["AC", x.get("ac")], ["HP", x.get("hp")], ["Speed", _spd(x.get("speed"))], ["Immune", ", ".join(map(_n, x.get("immune", [])))]]))
    for x in d["vehicleUpgrade"]:
        out.append(_ent(x, qlib.walk(x.get("entries", [])), sub="Vehicle Upgrade", tl=[["Type", ", ".join(x.get("upgradeType", []))]]))
    return out
def obj():
    out = []
    for x in W("objects.json")["object"]:
        ab = " ".join("%s %s" % (a.upper(), x[a]) for a in ("str", "dex", "con", "int", "wis", "cha") if a in x)
        acts = []
        for a in x.get("actionEntries", []): acts.append(qlib.walk([a]))
        out.append(_ent(x, "\n".join(acts), sub="Object" + (" • " + x["objectType"] if x.get("objectType") else ""), tl=[["Size", _sz(x.get("size"))], ["AC", x.get("ac")], ["HP", x.get("hp")], ["Speed", _spd(x.get("speed"))], ["Abilities", ab], ["Senses", ", ".join(x.get("senses", []))], ["Immune", ", ".join(map(_n, x.get("immune", [])))]]))
    return out
def psionic():
    out = []
    for x in W("psionics.json")["psionic"]:
        t = qlib.walk(x.get("entries", [])) + ("\n" + qlib.walk(x["modes"]) if x.get("modes") else "") + ("\nFocus: " + x["focus"] if x.get("focus") else "")
        out.append(_ent(x, t, sub="Psionic • " + {"D": "Discipline", "T": "Talent"}.get(x.get("type"), x.get("type", "")), tl=[["Order", x.get("order", "")], ["Kind", {"D": "Discipline", "T": "Talent"}.get(x.get("type"), "")]]))
    return out
def language():
    out = []; d = W("languages.json")
    for x in d["language"]:
        if x.get("reprintedAs"): continue
        out.append(_ent(x, "", sub="Language", tl=[["Typical speakers", ", ".join(re.sub(r"\{@\w+ ([^|}]*)[^}]*\}", r"\1", s) for s in x.get("typicalSpeakers", []))], ["Script", x.get("script", "")], ["Type", x.get("type", "")]]))
    for x in d["languageScript"]: out.append(_ent(x, "", sub="Script"))
    return out
def deck():
    out = []
    for x in W("decks.json")["deck"]: out.append(_ent(x, qlib.walk(x.get("entries", [])), sub="Deck", tl=[["Cards", sum((c.get("count", 1) if isinstance(c, dict) else 1) for c in x.get("cards", []))]]))
    return out
def table():
    out = []
    for x in W("tables.json")["table"]:
        rows = [" | ".join(qlib.walk([c]) if not isinstance(c, str) else re.sub(r"\{@\w+ ([^|}]*)[^}]*\}", r"\1", c) for c in r) for r in x.get("rows", [])]
        out.append(_ent(x, "", sub="Table", tl=[["Columns", " | ".join(map(str, x.get("colLabels", [])))]], mech=rows))
    return out
CATS = {"disease": disease, "cult": cult, "charopt": charopt, "recipe": recipe, "hazard": hazard, "vehicle": vehicle, "object": obj, "psionic": psionic, "language": language, "deck": deck, "table": table}
PROSE = {"disease", "cult", "charopt", "recipe", "hazard", "vehicle", "object", "psionic", "deck"}

_KN = None
def known(name):
    """name appears as a quoted string in the hand written app source (not the generated q or tp files)"""
    global _KN
    import glob, os
    if _KN is None:
        R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        t = ""
        for f in glob.glob(R + "/src/app/*.js") + glob.glob(R + "/src/builder/*.js") + [x for x in glob.glob(R + "/src/data/*.js") if not re.search(r"/(q\d|tp\d|hb)", x)]:
            t += open(f, encoding="utf-8", errors="ignore").read()
        _KN = t
    return ('"%s"' % name) in _KN
def rule():
    out = []
    for x in W("variantrules.json")["variantrule"]:
        if known(x["name"]): continue
        out.append(_ent(x, qlib.walk(x.get("entries", [])), sub="Rule" + (" • " + x["ruleType"] if x.get("ruleType") else ""), tl=[["Kind", x.get("ruleType", "")]]))
    for x in W("actions.json")["action"]:
        if known(x["name"]): continue
        out.append(_ent(x, qlib.walk(x.get("entries", [])), sub="Action", tl=[["Time", str(x.get("time", [""])[0] if x.get("time") else "")]]))
    return out
def facility():
    out = []
    for x in W("bastions.json")["facility"]:
        if known(x["name"]): continue
        out.append(_ent(x, qlib.walk(x.get("entries", [])), sub="Bastion Facility • " + str(x.get("facilityType", "")), tl=[["Level", x.get("level", "")], ["Space", x.get("space", "")]]))
    return out
def psionic_ua(): return psionic()
CATS["rule"] = rule; CATS["facility"] = facility
PROSE |= {"rule", "facility"}
