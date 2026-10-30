"""Shared helpers for the Q stages (5e.tools data categories). Read only access to /home/claude/work/q0."""
import json, os, sys, glob
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tp"))
import hb
Q0 = os.environ.get("Q0_DIR", "/home/claude/work/q0")
# 5e.tools source code (lower case) to the id of the source in the app. Anything else keeps the lower case code.
SRCMAP = {"xdmg": "dmg", "dmg": "dmg14", "xphb": "core", "phb": "phb14", "bam": "misc14", "drde": "misc14", "vnotee": "misc14", "dip": "misc14",
          "hfstcm": "misc14", "tor": "misc14", "tofw": "misc14", "hof": "hof", "frhof": "hof", "frafi": "frafi"}
def srcid(code): return SRCMAP.get(code.lower(), code.lower())
def load(f): return json.load(open(os.path.join(Q0, f), encoding="utf-8"))
def walk(e):
    """Entries to plain text. Tags like {@spell Fireball|PHB} become the name only."""
    if isinstance(e, str): return hb.strip(e)
    if isinstance(e, list): return " ".join(walk(x) for x in e)
    if isinstance(e, dict):
        t = e.get("type")
        if t in ("entries", "inset", "insetReadaloud", "section", "quote", "variantSub", "variant"):
            return ("[" + e["name"] + "] " if e.get("name") else "") + " ".join(walk(x) for x in e.get("entries", []))
        if t == "list": return " | ".join(walk(x) for x in e.get("items", []))
        if t == "item": return e.get("name", "") + ": " + walk(e.get("entry") or e.get("entries") or "")
        if t == "table": return "TABLE %s: " % hb.strip(e.get("caption", "")) + " / ".join(" , ".join(walk(c) for c in r) for r in e.get("rows", []))
        return json.dumps(e)[:300]
    return str(e)
def app():
    p = os.path.join(Q0, "app_items.json")
    return json.load(open(p)) if os.path.exists(p) else {"src": [], "dmgi": [], "wxi": {}}
def app_item_names():
    a = app(); return set(a["dmgi"]) | {n for v in a["wxi"].values() for n in v}
