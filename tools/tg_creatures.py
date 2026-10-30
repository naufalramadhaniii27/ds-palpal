#!/usr/bin/env python3
"""G7 TG0b: turns the 5etools Monster Manual 2024 bestiary (bestiary-xmm.json) into the Training Ground creature data.

  python3 -I tools/tg_creatures.py PATH/TO/bestiary-xmm.json   -> data/tg-creatures.json

Source: https://github.com/5etools-mirror-3/5etools-src  data/bestiary/bestiary-xmm.json (503 creatures).
User decision 2026-10-29 (claude/rencana-kerja-training-ground.md part 7, choice B): all 503. Every entry keeps src, pg and srd
(1 = marked srd52 by 5etools, part of SRD 5.2.1 under CC-BY-4.0; 0 = not SRD), so the non-SRD ones can be filtered or dropped alone.
Numbers and action rules come from the data. Tags are turned into plain text. Each action also gets a parsed form the engine reads:
  k "atk"   attack roll  {mr:"m"|"r"|"mr", hit, reach, rng:[normal,long], dmg:[[avg,"XdY+Z","Type"],...]}
  k "save"  saving throw {sv:"dex", dc, dmg:[...], half:1 when a success halves}
  k "multi" Multiattack  {ma:[[action name, count],...]} (empty when the text only says "two attacks")
  k "cast"  uses Spellcasting, k "other" anything else (resolved by hand on the board)
The file is a static JSON file next to index.html. The Training Ground fetches it the first time it opens, and the service worker keeps
a copy for offline use, so the app's first load does not grow (claude/rencana-kerja-training-ground.md 5c, creature loader)."""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "data", "tg-creatures.json")
ABL = {"str": "Strength", "dex": "Dexterity", "con": "Constitution", "int": "Intelligence", "wis": "Wisdom", "cha": "Charisma"}
XP = {"0": 10, "1/8": 25, "1/4": 50, "1/2": 100, "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800, "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900,
      "11": 7200, "12": 8400, "13": 10000, "14": 11500, "15": 13000, "16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000, "21": 33000, "22": 41000,
      "23": 50000, "24": 62000, "25": 75000, "26": 90000, "27": 105000, "28": 120000, "29": 135000, "30": 155000}
SIZE = {"T": "Tiny", "S": "Small", "M": "Medium", "L": "Large", "H": "Huge", "G": "Gargantuan"}
ALIGN = {"L": "Lawful", "N": "Neutral", "C": "Chaotic", "G": "Good", "E": "Evil", "U": "Unaligned", "A": "Any alignment"}
NUM = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8}

def crnum(cr):
    if isinstance(cr, dict): cr = cr.get("cr", "0")
    return cr, (eval(cr) if "/" in cr else float(cr))
def pb_of(c): return 2 if c < 5 else 3 if c < 9 else 4 if c < 13 else 5 if c < 17 else 6 if c < 21 else 7 if c < 25 else 8 if c < 29 else 9
def mod(v): return (v - 10) // 2

def tag(m):
    name, body = m.group(1), (m.group(2) or "").strip()
    p = body.split("|")
    if name == "atkr": return {"m": "Melee Attack Roll:", "r": "Ranged Attack Roll:"}.get(body, "Melee or Ranged Attack Roll:")
    if name == "hit": return ("+" if not body.startswith("-") else "") + body
    if name == "h": return "Hit: "
    if name == "hom": return "Hit or Miss: "
    if name == "dc": return "DC " + body
    if name == "actSave": return ABL.get(body, body) + " Saving Throw:"
    if name == "actSaveFail": return "Failure by %s or More:" % body if body else "Failure:"
    if name == "actSaveFailBy": return "Failure by %s or More:" % body
    if name == "actSaveSuccess": return "Success:"
    if name == "actSaveSuccessOrFail": return "Failure or Success:"
    if name == "actTrigger": return "Trigger:"
    if name == "actResponse": return "Response:"
    if name == "recharge": return "(Recharge %s-6)" % body if body and body != "6" else "(Recharge 6)"
    return p[2] if len(p) > 2 and p[2] else p[0]
def plain(t): return re.sub(r"\s+", " ", re.sub(r"\{@(\w+)(?: ([^{}]*))?\}", tag, t)).strip()

def entries_text(es):
    out = []
    for e in es or []:
        if isinstance(e, str): out.append(plain(e))
        elif isinstance(e, dict):
            if e.get("type") == "list": out.append(" ".join(("%s %s" % (plain(i.get("name", "")), entries_text(i.get("entries", [i.get("entry", "")])))).strip() if isinstance(i, dict) else plain(i) for i in e.get("items", [])))
            else: out.append(((plain(e["name"]) + ". ") if e.get("name") else "") + entries_text(e.get("entries", [])))
    return " ".join(x for x in out if x)

def dmg_list(raw):
    # "5 ({@damage 1d6 + 2}) Slashing damage" and "plus 7 ({@damage 2d6}) Poison damage"; a flat "1 Bludgeoning damage" too
    out = []
    for a, d, ty in re.findall(r"(\d+) \(\{@damage ([^}]+)\}\) ((?:[A-Z]\w+)(?: or [A-Z]\w+)?)? ?damage", raw): out.append([int(a), d.replace(" ", ""), ty or "Choice"])
    if not out:
        m = re.search(r"\{@h\}(\d+) (\w+) damage", raw)
        if m: out.append([int(m.group(1)), m.group(1), m.group(2)])
    return out

def parse_action(a, names):
    name_raw = a.get("name", "")
    rc = re.search(r"\{@recharge ?(\d?)\}", name_raw)
    o = {"n": plain(re.sub(r"\{@recharge ?\d?\}", "", name_raw)).strip(), "t": entries_text(a.get("entries", []))}
    m = re.search(r"\((\d+)/Day(?:[^)]*)\)", o["n"])
    if rc: o["rc"] = int(rc.group(1) or 6)
    if m: o["day"] = int(m.group(1))
    raw = " ".join(x for x in a.get("entries", []) if isinstance(x, str))
    at = re.search(r"\{@atkr ([mr,]+)\} \{@hit (-?\d+)\}", raw)
    sv = re.search(r"\{@actSave (\w+)\} \{@dc (\d+)\}", raw)
    if o["n"].startswith("Multiattack"):
        o["k"] = "multi"; ma = []
        for cnt, nm in re.findall(r"\b(one|two|three|four|five|six)\s+([A-Z][\w' ]*?)\s+attacks?\b", o["t"]):
            hit = [x for x in names if x.lower() == nm.strip().lower()]
            if hit: ma.append([hit[0], NUM[cnt]])
        tm = {"once": 1, "twice": 2, "three times": 3, "four times": 4}
        def pick(txt):
            got = [x for x in names if re.search(r"\b" + re.escape(x) + r"\b", txt)]
            return "|".join(got)
        if not ma:
            g = re.search(r"makes (one|two|three|four|five|six) attacks, using (.+?) in any combination", o["t"])
            g2 = re.search(r"makes (one|two|three|four|five|six) ([A-Z][\w' ]*? or [A-Z][\w' ]*?) attacks?", o["t"])
            if g and pick(g.group(2)): ma.append([pick(g.group(2)), NUM[g.group(1)]])
            elif g2 and pick(g2.group(2)): ma.append([pick(g2.group(2)), NUM[g2.group(1)]])
        for nm, t in re.findall(r"uses ([A-Z][\w' ]*?) (once|twice|three times|four times)", o["t"]):
            if nm in names and not any(x[0] == nm for x in ma): ma.append([nm, tm[t]])
        o["ma"] = ma
    elif at:
        o["k"] = "atk"; o["mr"] = at.group(1).replace(",", ""); o["hit"] = int(at.group(2))
        r = re.search(r"reach (\d+) ft", raw); g = re.search(r"range (\d+)(?:/(\d+))? ft", raw)
        if r: o["reach"] = int(r.group(1))
        if g: o["rng"] = [int(g.group(1)), int(g.group(2) or g.group(1))]
        o["dmg"] = dmg_list(raw)
    elif sv:
        o["k"] = "save"; o["sv"] = sv.group(1); o["dc"] = int(sv.group(2)); o["dmg"] = dmg_list(raw)
        if re.search(r"\{@actSaveSuccess\} Half damage", raw): o["half"] = 1
    elif "Spellcasting" in raw or "{@spell" in raw: o["k"] = "cast"
    else: o["k"] = "other"
    return o

def flat_list(v):
    out = []
    for x in v or []:
        if isinstance(x, str): out.append(x)
        elif isinstance(x, dict):
            inner = [y for k in ("immune", "resist", "vulnerable", "conditionImmune") for y in flat_list(x.get(k))]
            note = x.get("note") or x.get("preNote") or ""
            if x.get("special"): out.append(plain(x["special"]))
            elif inner: out.append(", ".join(inner) + ((" " + plain(note)) if note else ""))
    return out

def spells(sc):
    out = []
    for s in sc or []:
        h = " ".join(s.get("headerEntries", [])); o = {"n": plain(s.get("name", "Spellcasting")), "t": plain(h)}
        d = re.search(r"\{@dc (\d+)\}", h); hi = re.search(r"\{@hit (-?\d+)\}", h)
        if d: o["dc"] = int(d.group(1))
        if hi: o["hit"] = int(hi.group(1))
        if s.get("ability"): o["ab"] = s["ability"]
        if s.get("will"): o["will"] = [plain(x) for x in s["will"]]
        if s.get("daily"): o["daily"] = {k: [plain(x) for x in v] for k, v in s["daily"].items()}
        if s.get("spells"): o["lv"] = {k: [plain(x) for x in v.get("spells", [])] for k, v in s["spells"].items()}
        if s.get("displayAs"): o["as"] = s["displayAs"]
        out.append(o)
    return out

def speed(sp):
    o = {}
    for k, v in (sp or {}).items():
        if k in ("canHover",): o["hover"] = 1; continue
        if isinstance(v, (int, float)): o[k] = int(v)
        elif isinstance(v, dict) and "number" in v: o[k] = int(v["number"])
    return o

def convert(m):
    cr, c = crnum(m.get("cr", "0")); pb = pb_of(c)
    ab = [m[k] for k in ("str", "dex", "con", "int", "wis", "cha")]
    acs = m.get("ac", [10]); a0 = acs[0]
    ac = a0 if isinstance(a0, int) else a0.get("ac", 10)
    acn = "" if isinstance(a0, int) else plain(", ".join(a0.get("from", [])) or a0.get("condition", ""))
    ty = m["type"] if isinstance(m["type"], str) else m["type"].get("type", "")
    if isinstance(ty, dict): ty = "/".join(ty.get("choose", []))
    tags = [] if isinstance(m["type"], str) else [t if isinstance(t, str) else t.get("tag", "") for t in m["type"].get("tags", [])]
    ini = mod(ab[1])
    if isinstance(m.get("initiative"), dict): ini += m["initiative"].get("proficiency", 0) * pb
    elif isinstance(m.get("initiative"), (int,)): ini = m["initiative"]
    o = {"id": re.sub(r"[^a-z0-9]+", "-", m["name"].lower()).strip("-"), "n": m["name"], "src": m["source"], "pg": m.get("page", 0), "srd": 1 if m.get("srd52") else 0,
         "sz": "".join(m.get("size", ["M"])[:1]), "ty": ty + (" (" + ", ".join(tags) + ")" if tags else ""),
         "al": " ".join(ALIGN.get(x, x) for x in m.get("alignment", []) if isinstance(x, str)),
         "ac": ac, "hp": m["hp"].get("average", 1), "hpf": m["hp"].get("formula", ""), "sp": speed(m.get("speed")), "ab": ab, "ini": ini,
         "cr": cr, "crn": c, "xp": XP.get(cr, 0), "pb": pb, "pp": m.get("passive", 10)}
    if acn: o["acn"] = acn
    if m.get("save"): o["sv"] = {k: int(v.replace("+", "")) for k, v in m["save"].items() if re.match(r"^[+-]?\d+$", str(v))}
    if m.get("skill"): o["sk"] = {k: int(v.replace("+", "")) for k, v in m["skill"].items() if isinstance(v, str) and re.match(r"^[+-]?\d+$", v)}
    for k, s in (("vulnerable", "vul"), ("resist", "res"), ("immune", "imm"), ("conditionImmune", "ci")):
        if m.get(k): o[s] = flat_list(m[k])
    if m.get("senses"): o["sen"] = [plain(x) for x in m["senses"]]
    if m.get("languages"): o["lang"] = [plain(x) for x in m["languages"]]
    names = [plain(re.sub(r"\{@recharge ?\d?\}", "", a.get("name", ""))).strip() for k in ("action", "bonus", "reaction") for a in m.get(k, [])]
    for k, s in (("trait", "tr"), ("action", "act"), ("bonus", "bo"), ("reaction", "re"), ("legendary", "lg")):
        if m.get(k): o[s] = [parse_action(a, names) if s != "tr" else {"n": plain(a.get("name", "")), "t": entries_text(a.get("entries", []))} for a in m[k]]
    for a in o.get("lg", []):  # "makes one Rend attack", "uses Tail Swipe": the legendary action runs that action
        r = re.search(r"makes one ([A-Z][\w' ]*?) attack", a["t"]) or re.search(r"uses ([A-Z][\w' ]*?)(?:[.,]| to )", a["t"])
        if r and r.group(1).strip() in names and a["k"] == "other": a["ref"] = r.group(1).strip()
    if m.get("legendary"): o["lgn"] = m.get("legendaryActions", 3)
    if m.get("spellcasting"): o["sc"] = spells(m["spellcasting"])
    return o

def main():
    src = sys.argv[1] if len(sys.argv) > 1 else None
    if not src: sys.exit(__doc__)
    data = json.load(open(src, encoding="utf-8"))["monster"]
    out = [convert(m) for m in data]
    ids = [x["id"] for x in out]; assert len(ids) == len(set(ids)), "duplicate ids"
    doc = {"about": "Training Ground creatures: Monster Manual 2024 (XMM), %d entries, made by tools/tg_creatures.py from the 5etools data "
                    "(github.com/5etools-mirror-3/5etools-src, data/bestiary/bestiary-xmm.json). srd 1 = part of SRD 5.2.1 (CC-BY-4.0, Wizards of the Coast), "
                    "srd 0 = Monster Manual 2024 only (user decision 2026-10-29). Do not edit by hand: change the tool and run it again." % len(out), "v": 1, "creatures": out}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n")
    kinds = {}
    for x in out:
        for s in ("act", "bo", "re", "lg"):
            for a in x.get(s, []): kinds[a["k"]] = kinds.get(a["k"], 0) + 1
    print("creatures %d (srd %d, not srd %d), actions %s, %d bytes" % (len(out), sum(x["srd"] for x in out), sum(1 - x["srd"] for x in out), kinds, os.path.getsize(OUT)))
if __name__ == "__main__": main()
