"""Open5e v2 spells -> 5e.tools-like JSON for tools/tp_build.py (file goes to tools/tp/o5/). Facts only (level, school, casting time,
range, components, duration, classes, save). The app text is written in the overlay, in our own words.
Usage: python3 tools/o5_spells.py <open5e v2 dir of one document> <out.json> <source tag>"""
import json, re, sys, os
SCH = {"abjuration": "A", "conjuration": "C", "divination": "D", "enchantment": "E", "evocation": "V", "illusion": "I", "necromancy": "N", "transmutation": "T"}
CLS = {"srd_wizard": "Wizard", "srd_sorcerer": "Sorcerer", "srd_druid": "Druid", "srd_warlock": "Warlock", "srd_bard": "Bard", "srd_cleric": "Cleric", "srd_ranger": "Ranger", "srd_paladin": "Paladin", "srd_artificer": "Artificer"}
AB = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]

def ctime(t):
    m = re.match(r"(\d+)(minute|hour)s?$", t)
    if m: return [{"number": int(m.group(1)), "unit": m.group(2)}]
    return [{"number": 1, "unit": {"action": "action", "bonus-action": "bonus", "reaction": "reaction"}[t]}]

def rng(txt, unit):
    t = (txt or "").strip().lower()
    if t.startswith("self"):
        m = re.search(r"(\d+)[- ](?:foot|feet|ft|mile)s?\s*(radius|dome|sphere|cone|line|cube|hemisphere)?", t)
        if m and m.group(2):
            ty = {"dome": "hemisphere"}.get(m.group(2), m.group(2))
            return {"type": ty, "distance": {"type": "miles" if "mile" in t else "feet", "amount": int(m.group(1))}}
        return {"type": "point", "distance": {"type": "self"}}
    if t == "touch": return {"type": "point", "distance": {"type": "touch"}}
    m = re.match(r"(\d+)\s*(ft|feet|miles?|mile)", t)
    if m: return {"type": "point", "distance": {"type": "miles" if m.group(2).startswith("mile") else "feet", "amount": int(m.group(1))}}
    return {"type": "point", "distance": {"type": "self"}}

def dur(t, conc):
    t = (t or "").lower()
    if t == "instantaneous": return [{"type": "instant"}]
    if t.startswith("until dispelled") or t == "permanent": return [{"type": "permanent"}]
    m = re.match(r"(\d+) (round|minute|hour|day)s?$", t)
    if m:
        d = {"type": "timed", "duration": {"type": m.group(2), "amount": int(m.group(1))}}
        if conc: d["concentration"] = True
        return [d]
    return [{"type": "special"}]

def main(src, out, tag):
    sp = json.load(open(os.path.join(src, "Spell.json")))
    rows = []
    for e in sp:
        f = e["fields"]; desc = (f.get("desc") or "") + "\n" + (f.get("higher_level") or "")
        cl = sorted(set(CLS[c] for c in f["classes"] if c in CLS))
        sv = [a for a in AB if re.search(a + r" saving throw", desc, re.I)]
        r = {"name": f["name"], "source": tag, "level": f["level"], "school": SCH[f["school"]], "time": ctime(f["casting_time"]),
             "range": rng(f.get("range_text"), f.get("range_unit")),
             "components": {k: True for k, on in (("v", f.get("verbal")), ("s", f.get("somatic")), ("m", f.get("material"))) if on},
             "duration": dur(f.get("duration"), f.get("concentration")), "entries": [],
             "classes": {"fromClassList": [{"name": c, "source": "PHB"} for c in cl]}}
        if sv: r["savingThrow"] = [sv[0]]
        if f.get("ritual"): r["meta"] = {"ritual": True}
        rows.append(r)
    json.dump({"_meta": {"sources": [{"json": tag, "full": tag}]}, "spell": rows}, open(out, "w"), indent=1, ensure_ascii=False)
    print(len(rows), "spells ->", out)

if __name__ == "__main__": main(*sys.argv[1:4])
