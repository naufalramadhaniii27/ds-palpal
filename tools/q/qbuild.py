#!/usr/bin/env python3
"""Q builder: 5e.tools categories + own wording overlays in tools/q/overlay/ -> src/data/qNN-<cat>.js.
  python3 tools/q/qbuild.py --check          nothing is written, prints GAP rows
  python3 tools/q/qbuild.py                  writes src/data/q*.js and reports/q-gap.md
Overlay for reward (tools/q/overlay/reward_<x>.py):  R = {"Name|SRC": {"d": "own wording", "fx": {...}, "ch": [max, "0", "never"], "sp": [["Spell", 0]]}}"""
import sys, os, json, glob, importlib.util, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import qlib, qgen, qmon
IMGMAP = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'imgmap.json'))) if os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'imgmap.json')) else {}
GAP = []
EXTRA = {}
def extra_src(code):
    """a book with entries but no source in the app: register it (off by default) from the book list"""
    sid = qlib.srcid(code)
    if sid in EXTRA: return sid
    b = {x["id"].lower(): x for x in qlib.load("books.json")["book"] + qlib.load("adventures.json")["adventure"]}.get(code.lower())
    if not b:
        FB = {"uathemysticclass": ("UAMyst", "Unearthed Arcana: The Mystic Class", "2020-01-01"), "esk": ("ESK", "Essentials Kit", "2019-11-19"), "mcv2dc": ("MCV2DC", "Monstrous Compendium Volume 2: Dragonlance Creatures", "2022-12-06"), "mcv3mc": ("MCV3MC", "Monstrous Compendium Volume 3: Minecraft Creatures", "2023-05-25")}
        if code.lower() not in FB and code.lower() not in ("uathemysticclass",) and code.lower() not in ("mff", "hfdomm", "mismv1", "vd", "sads"): return None
        i, nm, pub = FB.get(code.lower(), (code.upper(), code.upper() + " (additional source)", "2020-01-01"))
        b = {"id": i, "name": nm, "published": pub}
    leg = 1 if b.get("published", "9999") < "2024-09" else 0
    EXTRA[sid] = {"id": sid, "tag": b["id"][:6].upper(), "name": b["name"], "desc": "Reference entries from %s." % b["name"], "feats": [], "spells": [], "rows": [], "legacy": leg} if leg else {"id": sid, "tag": b["id"][:6].upper(), "name": b["name"], "desc": "Reference entries from %s." % b["name"], "feats": [], "spells": [], "rows": []}
    return sid
def overlays(prefix, var):
    out = {}
    for p in sorted(glob.glob(os.path.join(HERE, "overlay", prefix + "_*.py"))):
        sp = importlib.util.spec_from_file_location(os.path.basename(p)[:-3], p); m = importlib.util.module_from_spec(sp); 
        try: sp.loader.exec_module(m)
        except SyntaxError as e:
            print("overlay not readable yet:", os.path.basename(p), e.msg); continue
        out.update(getattr(m, var, {}))
    return out
def todo(cat):
    if cat == "reward":
        have = qlib.app_item_names(); out = []
        for x in qlib.load("rewards.json")["reward"]:
            if x["name"] in have or x.get("reprintedAs"): continue
            x = dict(x); x["_text"] = qlib.walk(x.get("entries", [])); out.append(x)
        return out
    if cat == "deity":
        return [g["best"] for g in deity_groups() if g["best"].get("entries")]
    if cat in qgen.CATS: return [{"name": e["name"], "source": e["src"], "type": e["sub"], "_text": e["text"]} for e in gen_todo(cat)]
    raise SystemExit("unknown category " + cat)
def reward_block():
    T = overlays("reward", "R"); rows = {}; isp = {}; seen = set()
    for e in todo("reward"):
        key = "%s|%s" % (e["name"], e["source"].upper()); sid = qlib.srcid(e["source"])
        if sid not in qlib.app()["src"] and sid not in ("efa", "dmg", "core"): GAP.append(("reward", key, "source %s has no source in the app" % sid)); continue
        o = T.get(key)
        if not o or not o.get("d"): GAP.append(("reward", key, "no overlay text")); continue
        if e["name"] in seen: GAP.append(("reward", key, "same name as an earlier reward, skipped")); continue
        seen.add(e["name"])
        opts = {"gift": e.get("type", "")}
        for k in ("fx", "ch"):
            if o.get(k): opts[k] = o[k]
        rows.setdefault(sid, []).append([e["name"], "Supernatural Gift", e.get("type", "Reward"), 0, o["d"], opts])
        if o.get("sp"): isp[e["name"]] = {"sp": o["sp"]}
    for k in T:
        if k not in {"%s|%s" % (e["name"], e["source"].upper()) for e in todo("reward")}: GAP.append(("reward", k, "overlay text without a source reward"))
    return rows, isp
ALN = {"L": "Lawful", "N": "Neutral", "C": "Chaotic", "G": "Good", "E": "Evil", "U": "Unaligned", "A": "Any alignment"}
def aln(a):
    a = a or []
    if a == ["N"] or a == ["N", "N"]: return "Neutral"
    return " ".join(ALN.get(x, x) for x in a)
def deity_groups():
    G = {}; order = []
    for x in qlib.load("deities.json")["deity"]:
        x = dict(x)
        if "_copy" in x:
            b = [y for y in qlib.load("deities.json")["deity"] if y["name"] == x["_copy"]["name"] and y["source"] == x["_copy"]["source"]]
            if b:
                m = dict(b[0]); m.update({k: v for k, v in x.items() if k != "_copy"}); x = m
        k = (x["name"], x.get("pantheon", ""))
        if k not in G: G[k] = {"all": [], "k": k}; order.append(k)
        G[k]["all"].append(x)
    out = []
    for k in order:
        g = G[k]; g["best"] = max(g["all"], key=lambda y: len(json.dumps(y.get("entries", []))))
        g["best"]["_text"] = qlib.walk(g["best"].get("entries", [])); out.append(g)
    return out
def deity_block():
    T = overlays("deity", "D"); rows = []; keys = set(); names = {}
    gs = deity_groups()
    for g in gs: names.setdefault(g["k"][0], set()).add(g["k"][1])
    for g in gs:
        x = g["best"]; key = "%s|%s" % (x["name"], x["source"].upper())
        sids = []
        for y in g["all"]:
            sid = qlib.srcid(y["source"])
            if sid not in qlib.app()["src"] and sid not in ("efa", "dmg", "core"): GAP.append(("deity", "%s|%s" % (y["name"], y["source"].upper()), "source %s has no source in the app" % sid)); continue
            if sid not in sids: sids.append(sid)
        if not sids: continue
        dom = ", ".join(x.get("domains", []))
        tl = [["Title", x.get("title", "")], ["Pantheon", x.get("pantheon", "")], ["Alignment", aln(x.get("alignment"))], ["Domains", dom], ["Province", x.get("province", "")], ["Symbol", x.get("symbol", "")]]
        p = []
        if x.get("entries"):
            keys.add(key); t = T.get(key)
            if not t: GAP.append(("deity", key, "no overlay text"))
            else: p.append(t)
        multi = len(names[x["name"]]) > 1 and x.get("pantheon")
        rows.append({"n": x["name"] + (" (%s)" % x["pantheon"] if multi else ""), "s": sids,
                     "sub": ("Deity" + (" • " + x["pantheon"] if x.get("pantheon") else "") + ((" • " + aln(x.get("alignment"))) if x.get("alignment") else "")),
                     "tl": [t for t in tl if t[1]], "p": p, "tx": (dom + " " + x.get("province", "") + " " + x.get("title", "") + " " + " ".join(p)).lower(), **({"im": IMGMAP["deity"][key]} if key in IMGMAP.get("deity", {}) else {})})
    for k in T:
        if k not in keys: GAP.append(("deity", k, "overlay text without a source deity with lore"))
    return rows

# ---------- generic reference categories (Library only, plus tables) ----------
def _rng(r): return ("%02d" % r["min"]) if r["min"] == r["max"] else "%02d to %02d" % (r["min"], r["max"])
def _coins(c): return ", ".join("%s %s" % (v, k) for k, v in (c or {}).items())
def _loot_line(r):
    parts = []
    if r.get("coins"): parts.append(_coins(r["coins"]))
    if r.get("gems"): parts.append("%s gems worth %s gp each" % (r["gems"]["amount"], r["gems"]["type"]))
    if r.get("artObjects"): parts.append("%s art objects worth %s gp each" % (r["artObjects"]["amount"], r["artObjects"]["type"]))
    for m in r.get("magicItems", []) or []:
        parts.append("%s from Magic Item Table %s" % (m.get("amount", "1"), m.get("type", "?")))
    if r.get("item"): parts.append(qlib.walk(r["item"]))
    ch = r.get("choose")
    if ch:
        fm = ch.get("fromMatching") or {}
        parts.append("Choose a %s magic item" % fm.get("rarity", "") if fm.get("rarity") else "Choose a magic item")
    return "**%s.** %s" % (_rng(r), "; ".join(parts).replace(";", ",") if parts else "Nothing extra.")
def loot_rows():
    d = qlib.load("loot.json"); rows = []
    def add(name, src, sub, tl, p):
        rows.append({"n": name, "s": qlib.srcid(src), "sub": sub, "tl": tl, "p": p, "tx": (name + " " + sub + " treasure loot " + " ".join(p[:3])).lower()})
    for x in d["individual"]:
        add("Individual Treasure, %s" % x["name"], x["source"], "Table • Treasure", [["Roll", "d100"]], [_loot_line(r) for r in x["table"]])
    for x in d["hoard"]:
        add("Treasure Hoard, %s" % x["name"], x["source"], "Table • Treasure", [["Roll", "d100"], ["Coins", _coins(x.get("coins"))]], [_loot_line(r) for r in x["table"]])
    for x in d["dragon"]:
        p = ["Coins: " + _coins(x.get("coins")) + "."]
        if x.get("gems"): p.append("Gems: %s, each worth 10, 50 or 100 gp by roll." % x["gems"]["amount"])
        if x.get("artObjects"): p.append("Art objects: %s." % x["artObjects"]["amount"])
        add("Dragon Hoard, %s" % x["name"], x["source"], "Table • Treasure", [], p)
    for x in d["gems"]:
        add(x["name"], x["source"], "Table • Treasure", [["Roll", "d%d" % len(x["table"])], ["Value", "%s gp each" % x["type"]]], ["**%d.** %s" % (i + 1, qlib.walk(t)) for i, t in enumerate(x["table"])])
    for x in d["artObjects"]:
        add(x["name"], x["source"], "Table • Treasure", [["Roll", "d%d" % len(x["table"])], ["Value", "%s gp each" % x["type"]]], ["**%d.** %s" % (i + 1, qlib.walk(t)) for i, t in enumerate(x["table"])])
    for x in d["magicItems"]:
        add(x["name"], x["source"], "Table • Magic Items", [["Roll", "d100"]], [_loot_line(r) for r in x["table"]])
    return rows

GENFILE = {"disease": "q06-disease.js", "cult": "q05-cult.js", "charopt": "q05-charopt.js", "recipe": "q04-recipe.js", "hazard": "q08-hazard.js", "vehicle": "q08-vehicle.js", "object": "q08-object.js", "psionic": "q08-psionic.js", "language": "q06-language.js", "deck": "q08-deck.js", "table": "q08-table.js", "rule": "q12-rule.js", "facility": "q12-facility.js"}
def gen_todo(cat):
    """entries of a generic category that are in the app and need prose"""
    out = []
    for e in qgen.CATS[cat]():
        sid = qlib.srcid(e["src"])
        if sid not in qlib.app()["src"] and sid not in ("efa", "dmg", "core") and not extra_src(e["src"]): continue
        if e["text"]: out.append(e)
    return out
def gen_block(cat):
    T = overlays(cat, "D"); rows = []; keys = set(); merged = {}
    for e in qgen.CATS[cat]():
        key = "%s|%s" % (e["name"], e["src"].upper()); sid = qlib.srcid(e["src"])
        if sid not in qlib.app()["src"] and sid not in ("efa", "dmg", "core"):
            if not extra_src(e["src"]): GAP.append((cat, key, "source %s has no source in the app" % sid)); continue
        p = []
        if e["text"]:
            keys.add(key); t = T.get(key)
            if not t: GAP.append((cat, key, "no overlay text"))
            else: p = [t] if isinstance(t, str) else list(t)
        if e.get("ing"):
            p.insert(0, ["Ingredients", "; ".join(re.sub(r"\{=?[^}]*\}", "", qlib.walk([i["entry"]] if isinstance(i, dict) and "entry" in i else [i])) for i in e["ing"]).replace(";", ",")])
        p += ["**%s**" % x for x in []] + [x for x in e["mech"]]
        im = IMGMAP.get(cat, {}).get(key)
        rows.append({"n": e["name"], "s": sid, "sub": e["sub"], "tl": e["tl"], "p": p, "tx": (e["name"] + " " + e["sub"] + " " + " ".join(x if isinstance(x, str) else " ".join(x) for x in p)).lower(), **({"im": im} if im else {})})
    for k in T:
        if k not in keys: GAP.append((cat, k, "overlay text without a source entry"))
    return rows

def mon_block():
    import collections
    pairs, skipped = qmon.rows(); rows = []; cnt = collections.Counter(x["name"] for _, x in pairs)
    for src, x in pairs:
        sid = qlib.srcid(src)
        if sid not in qlib.app()["src"] and sid not in ("efa", "dmg", "core") and not extra_src(src):
            GAP.append(("monster", "%s|%s" % (x["name"], src), "source %s has no source in the app" % sid)); continue
        r = qmon.row(x, sid)
        im = IMGMAP.get("monster", {}).get("%s|%s" % (x["name"], src))
        if im: r["im"] = im
        if cnt[x["name"]] > 1 and sid != "core": r["n"] = "%s (%s)" % (x["name"], src)
        rows.append(r)
    for k in skipped: GAP.append(("monster", k, "unresolved copy or no stat block"))
    nf = sum(1 for r in rows if any(b.endswith(".**") for b in r["p"] if isinstance(b, str)))
    GAP.append(("monster", "%d stat blocks" % len(rows), "trait and action text not copied: features show their name and rebuilt attack numbers only (own-wording rewrite pending)"))
    return rows

REGQ = '''
var ROWS=%s;
window.QREFS=window.QREFS||{};window.QREFS[%s]=(window.QREFS[%s]||[]).concat(ROWS);
'''
REG = '''
var IT=%s, ISP=%s;
window.WXI=window.WXI||{};
Object.keys(IT).forEach(function(id){var cur=window.WXI[id]=window.WXI[id]||[];IT[id].forEach(function(r){if(!cur.some(function(x){return x[0]===r[0]}))cur.push(r)});
 var s=(window.WX&&window.WX.src||[]).filter(function(q){return q.id===id})[0];if(s){s.items=s.items||[];IT[id].forEach(function(r){if(s.items.indexOf(r[0])<0)s.items.push(r[0])})}});
Object.keys(ISP).forEach(function(k){if(typeof ITEM_SPELLS!=="undefined")ITEM_SPELLS[k]=ISP[k]});
'''
def build(write):
    GAP.clear(); files = {}
    rows, isp = reward_block()
    files["q01-reward.js"] = "/* Generated by tools/q/qbuild.py from 5e.tools reward data. Own wording. Do not edit by hand. */\n(function(){" + REG % (json.dumps(rows, ensure_ascii=False), json.dumps(isp, ensure_ascii=False)) + "})();\n"
    lrows = loot_rows()
    files["q03-loot.js"] = "/* Generated by tools/q/qbuild.py from 5e.tools loot tables. Own wording. Do not edit by hand. */\n(function(){" + REGQ % (json.dumps(lrows, ensure_ascii=False), json.dumps("table"), json.dumps("table")) + "})();\n"
    drows = deity_block()
    files["q02-deity.js"] = "/* Generated by tools/q/qbuild.py from 5e.tools deity data. Own wording. Do not edit by hand. */\n(function(){" + REGQ % (json.dumps(drows, ensure_ascii=False), json.dumps("deity"), json.dumps("deity")) + "})();\n"
    for cat in qgen.CATS:
        files[GENFILE[cat]] = "/* Generated by tools/q/qbuild.py from 5e.tools data. Own wording. Do not edit by hand. */\n(function(){" + REGQ % (json.dumps(gen_block(cat), ensure_ascii=False), json.dumps(cat), json.dumps(cat)) + "})();\n"
    files["q07-bestiary.js"] = "/* Generated by tools/q/qbuild.py from 5e.tools bestiary. Stat block facts only. Do not edit by hand. */\n(function(){" + REGQ % (json.dumps(mon_block(), ensure_ascii=False, separators=(",", ":")), json.dumps("monster"), json.dumps("monster")) + "})();\n"
    files["q00-src.js"] = "/* Generated by tools/q/qbuild.py. Books that only have reference entries. Off by default. */\n(function(){var L=%s;window.WX=window.WX||{src:[]};L.forEach(function(s){if(!window.WX.src.some(function(x){return x.id===s.id}))window.WX.src.push(s)})})();\n" % json.dumps(list(EXTRA.values()), ensure_ascii=False)
    if write:
        for n, s in files.items(): open(os.path.join(ROOT, "src", "data", n), "w", encoding="utf-8").write(s)
        with open(os.path.join(ROOT, "reports", "q-gap.md"), "w", encoding="utf-8") as f:
            f.write("# Q gap\n\n| Category | Entry | Note |\n|---|---|---|\n" + "\n".join("| %s | %s | %s |" % g for g in GAP) + "\n")
    print("GAP rows: %d" % len(GAP))
if __name__ == "__main__": build("--check" not in sys.argv)
