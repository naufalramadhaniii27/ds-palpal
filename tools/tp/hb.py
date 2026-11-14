"""Helpers for reading TheGiddyLimit/homebrew collection files (5e.tools format). Used by tools/tp_build.py and for reading sources."""
import json, re, os
HB = os.environ.get("HB_DIR", "/home/claude/thegiddylimit/homebrew/collection")

def _key(k, x):
    if isinstance(x, dict) and "name" in x:
        return (k, json.dumps([x.get(q) for q in ("name", "className", "subclassShortName", "level", "featureType", "source")], sort_keys=True))
    return (k, json.dumps(x, sort_keys=True))
def merge(ds):
    """Several files of one book (Deep Magic): lists are joined, the first copy of an entry wins."""
    out = {}; seen = set()
    for d in ds:
        for k, v in d.items():
            if isinstance(v, list):
                out.setdefault(k, [])
                for x in v:
                    kk = _key(k, x)
                    if kk in seen: continue
                    seen.add(kk); out[k].append(x)
            elif k not in out: out[k] = v
    return out
UA = os.environ.get("UA_DIR", "/home/claude/src-data/ua")
def _path(n):
    """A name starting with "ua/" is a file of TheGiddyLimit/unearthed-arcana (UA_DIR), anything else is in the homebrew collection."""
    return os.path.join(UA, n[3:]) if n.startswith("ua/") else os.path.join(HB, n)
def prune(ds):
    """Unearthed Arcana files repeat an entry in each playtest round. ds is ordered newest first: an entry already seen (same name,
    class) is dropped from the older files, together with the features that belong to that older copy."""
    seen = {}; drop_src = set()
    for d in ds:
        for k in ("subclass", "feat", "race", "subrace", "spell", "optionalfeature", "background", "item"):
            keep = []
            for x in d.get(k, []):
                if k == "subclass" and "subclassFeatures" in x and not x["subclassFeatures"]: continue
                if k == "subclass" and "subclassFeatures" not in x and x.get("source", "").endswith("Update"): continue          # an Update file lists an unchanged subclass without its features: the older file keeps it
                key = (k, x.get("name"), x.get("className"), x.get("raceName"))
                if key in seen and seen[key] != x.get("source"):
                    if k == "subclass": drop_src.add((x.get("className"), x.get("shortName"), x.get("source")))
                    continue
                seen[key] = x.get("source"); keep.append(x)
            if k in d: d[k] = keep
    for d in ds:
        for k in ("subclassFeature",):
            if k in d: d[k] = [f for f in d[k] if (f.get("className"), f.get("subclassShortName"), f.get("source")) not in drop_src]
    return ds
def load(name):
    if isinstance(name, (list, tuple)):
        ds = [json.load(open(_path(n), encoding="utf-8")) for n in name]
        if any(n.startswith("ua/") for n in name): ds = prune(ds)
        return merge(ds)
    return json.load(open(_path(name), encoding="utf-8"))

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
