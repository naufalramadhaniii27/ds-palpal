#!/usr/bin/env python3
"""Text of monster traits and actions in own wording. Overlay: tools/q/overlay/monster_txt.json (key from qmon.tkey -> text).
  python3 tools/q/monster_txt.py --export OUT.json SRC[,SRC...]   unique blocks of those sources that still need text
Needs Q0_DIR with bestiary/*.json."""
import glob, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import qlib, qmon, re
ABIL = {"str": "Strength", "dex": "Dexterity", "con": "Constitution", "int": "Intelligence", "wis": "Wisdom", "cha": "Charisma"}
def pre(t):
    """5e.tools entries as readable text with the tags that matter for a rewrite kept as words"""
    t = re.sub(r"\{@atkr? ([a-z,]+)\}", lambda m: {"m": "Melee Attack Roll:", "r": "Ranged Attack Roll:", "m,r": "Melee or Ranged Attack Roll:"}.get(m.group(1), "Attack Roll:"), t)
    t = re.sub(r"\{@hit (-?\d+)\}", lambda m: "%+d" % int(m.group(1)), t)
    t = re.sub(r"\{@h\}", "Hit: ", t)
    t = re.sub(r"\{@actSave ([a-z]+)\}", lambda m: ABIL.get(m.group(1), m.group(1)) + " Saving Throw:", t)
    t = t.replace("{@actSaveFail}", "Failure:").replace("{@actSaveSuccess}", "Success:").replace("{@actSaveSuccessOrFail}", "Failure or Success:")
    t = re.sub(r"\{@actSaveFail (\d+)\}", r"Failure by \1 or more:", t)
    t = t.replace("{@actTrigger}", "Trigger:").replace("{@actResponse}", "Response:")
    t = re.sub(r"\{@dc (\d+)\}", r"DC \1", t)
    t = re.sub(r"\{@recharge (\d)\}", r"(Recharge \1-6)", t).replace("{@recharge}", "(Recharge 6)")
    return t
_orig = qlib.hb.strip
qlib.hb.strip = lambda t: _orig(pre(t))
def clean(t): return t
def main():
    srcs = set(sys.argv[3].split(",")) if len(sys.argv) > 3 else None
    seen = {}
    for p in sorted(glob.glob(os.path.join(qlib.Q0, "bestiary", "bestiary-*.json"))):
        for m in json.load(open(p, encoding="utf-8")).get("monster", []):
            if srcs and m["source"] not in srcs: continue
            for k in ("trait", "action", "bonus", "reaction", "legendary"):
                for e in m.get(k) or []:
                    if not isinstance(e, dict) or not e.get("name") or not e.get("entries"): continue
                    t = qmon.tkey(e)
                    if t in qmon.TXT or t in seen: continue
                    seen[t] = {"key": t, "name": e["name"], "source_text": clean(qlib.walk(e["entries"]))[:1500]}
    json.dump(list(seen.values()), open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=0); print(len(seen), "blocks need text")
main()
