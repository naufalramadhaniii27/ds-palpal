"""Helpers for reading TheGiddyLimit/homebrew collection files (5e.tools format). Used by tools/tp_build.py and for reading sources."""
import json, re, os
HB = os.environ.get("HB_DIR", "/home/claude/thegiddylimit/homebrew/collection")

def load(name):
    return json.load(open(os.path.join(HB, name), encoding="utf-8"))

def strip(t):
    """Plain text from 5e.tools markup: {@spell fireball|phb} -> fireball, {@dice 1d6} -> 1d6, {@b x} -> x."""
    t = re.sub(r"\{@(?:dice|damage|hit|d20|scaledice|scaledamage|chance|recharge)\s+([^}|]*)(?:\|[^}]*)*\}", lambda m: m.group(1), t)
    t = re.sub(r"\{@h\}", "Hit: ", t)
    t = re.sub(r"\{@\w+\s+([^}|]*)(?:\|[^}]*)*\}", lambda m: m.group(1), t)
    return t

def flat(e, ind=0):
    """Entries tree -> list of plain lines."""
    out = []
    if isinstance(e, str): out.append(strip(e))
    elif isinstance(e, list):
        for x in e: out += flat(x, ind)
    elif isinstance(e, dict):
        ty = e.get("type")
        if ty in ("entries", "section", "inset", "insetReadaloud", "quote", "item"):
            if e.get("name"): out.append("[%s]" % strip(e["name"]))
            out += flat(e.get("entries") or ([e["entry"]] if "entry" in e else []), ind)
        elif ty == "list":
            for it in e.get("items", []): out += ["- " + l for l in flat(it, ind)]
        elif ty == "table":
            out.append("(table %s: %d rows)" % (strip(e.get("caption", "")), len(e.get("rows", []))))
            for r in e.get("rows", []): out.append(" | ".join(strip(c) if isinstance(c, str) else json.dumps(c)[:40] for c in r))
        else:
            out += flat(e.get("entries", []), ind)
    return out
