#!/usr/bin/env python3
"""Clause gate (REPORT MODE): per-sentence number conservation for every database text.

  python3 tests/clause_gate.py                 selftest, then scan the real data, write reports/clause-gate-report.md and tests/clause_gate_baseline.json
  python3 tests/clause_gate.py --selftest      only the synthetic cases and the mutation test (no browser, a few seconds)
  python3 tests/clause_gate.py --data F.json   read the rule tables from a cache file instead of opening index.html
  python3 tests/clause_gate.py --save-data F   write the loaded tables to F (the load takes about 75 s)
  python3 tests/clause_gate.py --audit N SEED  print N flagged and N unflagged mechanical sentences (stratified, fixed seed) for a manual check
  python3 tests/clause_gate.py --root DIR      another checkout (same as mech_scan.py)
  python3 tests/clause_gate.py --no-write      do not write the report and the baseline

Why: tests/mech_scan.py asks "does this FEATURE have a way to count" (by name and by keyword). A feature with two mechanical sentences passes when one of them
has a record. This gate asks the question per SENTENCE. Steps:
  1. every text of the universe mech_scan reads (class, subclass, species trait, feat, magic item, third party and homebrew rows) plus spells is split into sentences,
     each with a stable id (kind|owner|feature#n) and a text hash;
  2. each sentence is read for numbers, dice, DC, distances, durations, percents and mechanical keyword classes (AC, HP, SAVE, ADV, DIS, RES, IMM, SPEED, SENSE,
     PROF, SLOT, RESOURCE, ATK, DMG, DC, INIT, SPELL, ABIL, CHOICE);
  3. a sentence is COVERED when every keyword class has its own engine atom and every number is explained by the atoms of the feature. Atoms come from the data the
     sheet derivation reads: GX entries (cls/sub/species/feat/item), FXO, the structured fields of the records, LU_X, AUTO / SUB_GRANT / SP_AUTO / CLS_AUTO,
     SAVE_NOTES, ACTS (action card), FDMG, ITEM_SPELLS, SPELL_FX. An atom covers ONE sentence per class (this is what stops the Tower Shield case: one record
     must not cover a second mechanical sentence of the same feature). A sentence is also INFO when a documented tag says so (tests/mech_baseline.json by_design,
     an ACTS action card for a damage / DC / dice sentence = ACTIVATE) or ALLOW (tests/clause_gate_allow.json: id, hash, reason, expires);
  4. everything else that is mechanical is UNCOVERED. The gate only reports. It never fails a build (exit code 0), only the selftest can return 1.

The gate changes nothing in src/ and no fx data. It reuses mech_scan.py (loader window.__bldData, CAT / ITEM_CAT, GX_CAT, STRUCT_SKIP, the LU_X helper)
and tests/fx_overlap_loader.js (FXO and GX per file, no browser).
"""
import hashlib, json, os, random, re, subprocess, sys, time, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
args = sys.argv[1:]


def opt(name, n=0):
    """pop --name (and n values) from args"""
    if name in args:
        i = args.index(name)
        v = args[i + 1:i + 1 + n]
        del args[i:i + 1 + n]
        return v if n else True
    return None


_r = opt("--root", 1)
if _r:
    ROOT = os.path.abspath(_r[0])
sys.path.insert(0, HERE)
_save_argv = sys.argv
sys.argv = [sys.argv[0]]
import mech_scan as M  # noqa: E402  (reuse: CAT, ITEM_CAT, GX_CAT, STRUCT_SKIP, blob, lu_names, load pattern)
sys.argv = _save_argv

OUT_MD = os.path.join(ROOT, "reports", "clause-gate-report.md")
OUT_BASE = os.path.join(HERE, "clause_gate_baseline.json")
ALLOW = os.path.join(HERE, "clause_gate_allow.json")
CODE = os.path.join(HERE, "clause_gate_code.json")
MBASE = os.path.join(HERE, "mech_baseline.json")

# ---------------------------------------------------------------------------------------------------------------- loading
EXTRA_JS = """()=>{const J=o=>JSON.parse(JSON.stringify(o===undefined?null:o));const o={};
 const names={spellFull:'SPELL_FULL',spellFx:'SPELL_FX',spellRows:'SPELLS',itemDesc:'ITEMDESC',fxo:'FXO',fdmg:'FDMG',itemSpells:'ITEM_SPELLS',defSp:'DEF_SP'};
 for(const k in names){try{o[k]=J(eval(names[k]))}catch(e){o[k]=null}}return o}"""


def load():
    """Same page and hook as mech_scan.load(), plus the tables the gate needs that __bldData does not return (spell text, FXO, FDMG, ITEMDESC ...)."""
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); errs = []; pg.set_default_timeout(180000)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("file://" + os.path.join(ROOT, "index.html")); pg.wait_for_timeout(800)
        pg.evaluate("window.__bldNeed&&window.__bldNeed()"); pg.wait_for_function("window.__bldData", timeout=90000)
        d = pg.evaluate("window.__bldData()")
        d["gx"] = pg.evaluate("JSON.parse(JSON.stringify(window.GX||{}))")
        d["gxItem"] = pg.evaluate("()=>Object.keys(window.GX&&window.GX.item||{}).concat(Object.keys(window.FXO||{}))")
        d.update(pg.evaluate(EXTRA_JS)); b.close()
    if errs:
        print("page errors:", errs[:3]); sys.exit(2)
    return d


def fx_files():
    m = json.load(open(os.path.join(ROOT, "src", "manifest.json")))
    out = []

    def walk(x):
        if isinstance(x, dict):
            for v in x.values(): walk(v)
        elif isinstance(x, list):
            for v in x: walk(v)
        elif isinstance(x, str) and re.search(r"(^|/)data/fx-[^/]*\.js$", x):
            out.append(x)
    walk(m)
    return out


def fx_owner_files():
    """tests/fx_overlap_loader.js (node vm, no browser): which fx file defines each GX.kind|name and FXO|name. Used for the per-file attribution only."""
    try:
        fl = [os.path.join(ROOT, "src", f) for f in fx_files()]
        r = subprocess.run(["node", os.path.join(HERE, "fx_overlap_loader.js"), json.dumps(fl)], capture_output=True, text=True, timeout=120)
        return json.loads(r.stdout)["owners"] if r.returncode == 0 else {}
    except Exception:
        return {}


# ---------------------------------------------------------------------------------------------------------------- sentences
ABBR = {"e.g", "i.e", "vs", "ft", "lb", "lbs", "no", "cf", "approx", "dr", "mr", "mrs", "st", "lv", "lvl", "etc"}


def clean(text):
    t = text if isinstance(text, str) else json.dumps(text, ensure_ascii=False)
    t = re.sub(r"\[\[([^\]|]*)(?:\|([^\]]*))?\]\]", lambda m: m.group(2) or m.group(1), t)
    t = re.sub(r"\*\*([^*]+?)\*\*", r"\1", t)
    t = t.replace("’", "'").replace("−", "-").replace("–", "-")
    return t


def split_sentences(text):
    t = clean(text)
    out = []
    for para in re.split(r"[\n•]+| - (?=[A-Z])", t):
        para = para.strip()
        if not para:
            continue
        last = 0
        for m in re.finditer(r"[.!?]+[\"')\]]*\s+", para):
            before = para[last:m.start()].rsplit(" ", 1)[-1].lower().rstrip(".")
            nxt = para[m.end():m.end() + 1]
            if before in ABBR and not (nxt.isupper() and before in ("etc",)):
                continue
            if not (nxt.isupper() or nxt.isdigit() or nxt in "\"'([+"):
                continue
            out.append(para[last:m.end()].strip()); last = m.end()
        if para[last:].strip():
            out.append(para[last:].strip())
    return [s for s in out if len(s) > 1]


def norm(s):
    return re.sub(r"\s+", " ", s.lower()).strip()


def shash(s):
    return hashlib.sha1(norm(s).encode("utf-8")).hexdigest()[:8]


# ---------------------------------------------------------------------------------------------------------------- numbers
WORDN = {"two": "2", "three": "3", "four": "4", "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10", "eleven": "11", "twelve": "12",
         "fifteen": "15", "twenty": "20", "thirty": "30", "sixty": "60", "hundred": "100"}
WORD_RX = re.compile(r"\b(" + "|".join(WORDN) + r")\b(?![- ](?:handed|sided|dimensional|way))", re.I)
ONE_UNIT = re.compile(r"\bone (minute|hour|day|round|use|charge|week|mile|foot)\b")
SPECIAL = [(re.compile(r"\bhalf\b"), "half"), (re.compile(r"\b(double|twice|doubles|doubled)\b"), "double"), (re.compile(r"\b(triple|thrice)\b"), "3"),
           (re.compile(r"\bproficiency bonus\b"), "pb")]
# spans that are not mechanics of the sheet (level gates, prices, weights, page and table references, years, challenge ratings, 1 action)
IGN = [re.compile(p) for p in (
    r"\blevels? \d+(?:(?:\s*,\s*and\s+|\s*,\s*|\s+and\s+|\s+or\s+|\s+to\s+|\s*-\s*)(?:level )?\d+)*",
    r"\bat \d{1,2}\b(?! ?(?:feet|ft|foot|minutes?|hours?|rounds?|percent|%|gp|charges?|d\d))", r"\b(?:minimum(?: of)?|at least|maximum of|max\.?|up to a maximum of)\s*\+?\d+", r"\bhalf as much\b",
    r"\b(?:roll(?:s|ed)? an? |on an? |rolls? of |result of )\d{1,2}\b(?! ?(?:feet|ft))", r"\b\d+(?:st|nd|rd|th)(?:-| )levels?(?! spell| slot| or lower| or higher)(?:\s*(?:,|and|or)\s*\d+(?:st|nd|rd|th))*",
    r"\bat \d+(?:st|nd|rd|th)\b", r"\b\d[\d,]*(?:\.\d+)? ?(?:gp|sp|cp|pp|ep)\b", r"\b\d[\d,]*(?:\.\d+)? ?(?:lb|lbs|pounds?)\b\.?",
    r"\b(?:page|pages|p\.|pp\.|chapter|table|appendix|cr|challenge rating|section) ?\d+(?:/\d+)?", r"\b(?:19|20)\d\d\b", r"\b1 (?:bonus action|action|reaction)\b",
    r"\b\d+ ?(?:gp|sp|cp)\b")]
DICE = re.compile(r"\b(\d*)d(100|20|12|10|8|6|4|3)\b")
UNIT_DIST = re.compile(r"(\d[\d,]*)[- ]?(?:feet|foot|ft\.?|miles?|yards?|inches)\b")
UNIT_DUR = re.compile(r"(\d+)[- ](?:rounds?|minutes?|hours?|days?|turns?|weeks?|months?|years?|seconds?)\b")
PCT = re.compile(r"(\d+(?:\.\d+)?) ?(?:%|percent)")
SIGNED = re.compile(r"(?<![\w.])[+-]\s?(\d+)\b")
PLAIN = re.compile(r"(?<![\w.])(\d[\d,]*(?:\.\d+)?)(?![\w])")


def tokens(text):
    """Number tokens of one sentence: list of (token, kind). kind: dice, dist, dur, pct, num. Level gates, prices, weights, pages and years are dropped."""
    t = clean(text).lower()
    for rx in IGN:
        t = rx.sub(" ", t)
    out, seen = [], set()

    def add(tok, kind):
        if (tok, kind) not in seen:
            seen.add((tok, kind)); out.append((tok, kind))
    for m in DICE.finditer(t):
        add("%sd%s" % (m.group(1) or "1", m.group(2)), "dice")
    t2 = DICE.sub(" ", t)
    for m in UNIT_DIST.finditer(t2): add(m.group(1).replace(",", ""), "dist")
    for m in UNIT_DUR.finditer(t2): add(m.group(1), "dur")
    for m in PCT.finditer(t2): add(m.group(1), "pct")
    t3 = UNIT_DUR.sub(" ", UNIT_DIST.sub(" ", PCT.sub(" ", t2)))
    for m in PLAIN.finditer(t3): add(m.group(1).replace(",", ""), "num")
    for m in WORD_RX.finditer(t3): add(WORDN[m.group(1).lower()], "num")
    for m in ONE_UNIT.finditer(t3): add("1", "dur" if m.group(1) in ("minute", "hour", "day", "round", "week") else "num")
    for rx, tok in SPECIAL:
        if rx.search(t3): add(tok, "num")
    return out


def nums_in(o, out=None):
    """All numbers, dice and the word-like tokens of a record value, as strings."""
    if out is None:
        out = set()
    if isinstance(o, bool) or o is None:
        return out
    if isinstance(o, (int, float)):
        v = abs(o)
        out.add(str(int(v)) if float(v).is_integer() else str(v))
        if v == 0.5: out.add("half")
        if v == 2: out.add("double")
    elif isinstance(o, str):
        low = o.lower()
        for m in DICE.finditer(low): out.add("%sd%s" % (m.group(1) or "1", m.group(2)))
        for m in re.finditer(r"\d+(?:\.\d+)?", DICE.sub(" ", low)): out.add(m.group(0))
        if re.search(r"\bpb\b|prof", low): out.add("pb")
        if "half" in low: out.add("half")
        for w, n in WORDN.items():
            if re.search(r"\b%s\b" % w, low): out.add(n)
    elif isinstance(o, (list, tuple)):
        for x in o: nums_in(x, out)
    elif isinstance(o, dict):
        for k, v in o.items():
            if isinstance(k, str) and re.fullmatch(r"\d+", k): out.add(k)
            nums_in(v, out)
    return out


# ---------------------------------------------------------------------------------------------------------------- keyword classes
def R(p):
    return re.compile(p)


XCAT = {  # supplements to mech_scan.CAT (which has ac, hp, save, speed, init, skill, resist, uses, choice, fstyle)
    "ADV": R(r"\badvantage\b"), "DIS": R(r"\bdisadvantage\b"),
    "RES": R(r"\bresistan(?:ce|t)\b|\bvulnerab"), "IMM": R(r"\bimmun(?:e|ity)\b"),
    "SPEED": R(r"\bspeed\b|\b(?:flying|swimming|climbing|burrowing) (?:speed|at)\b|\b(?:gain|have|has|with) an? (?:flying|fly|swimming|swim|climbing|climb|burrowing|burrow)\b|\bhover\b"),
    "SENSE": R(r"\b(?:darkvision|blindsight|tremorsense|truesight|devil's sight)\b|\bsee in (?:magical )?darkness\b|\bpassive perception\b"),
    "PROF": R(r"\bproficien(?:t|cy)\b(?! bonus)|\bexpertise\b|\blanguages?\b[^.]{0,30}\b(?:learn|know|speak|add)\b"),
    "SLOT": R(r"\bspell slots?\b|\bslot level\b|\bregain[^.]{0,30}\bslots?\b"),
    "RESOURCE": R(r"\b(?:\d+|one|two|three|four|five|six|no|all|any|remaining|expended|extra|additional|equal to[^.]{0,40}|number of) uses?\b|\buses? (?:remaining|left|per|of)\b|\bcharges?\b|\bexpend(?:s|ed|ing)?\b|\bregains?\b|\brecharge[sd]?\b|\b(?:short|long) rest\b|\bat dawn\b|\bper (?:day|dawn)\b|\b(?:once|twice) per\b|\b(?:focus|sorcery|ki|psi) points?\b"),
    "ATK": R(r"(?:\+\d+|bonus|add|plus|extra|additional|increase)[^.]{0,40}\battack (?:rolls?|bonus)|\battack (?:rolls?|bonus)[^.]{0,40}(?:\+\d|bonus|increase)|\bextra attack\b|\battack twice\b|\btwo attacks\b|\bspell attack\b|\b(?:to hit|attack modifier)\b"),
    "DMG": R(r"\b\d*d\d+\b[^.]{0,40}\bdamage\b|\bdamage\b[^.]{0,40}\b\d*d\d+\b|(?:\+\d+|extra|additional|bonus)[^.]{0,20}\bdamage\b|\bdamage rolls?\b[^.]{0,30}(?:\+\d|bonus)"),
    "DC": R(r"\bdc\b|\bsave dc\b|\bdifficulty class\b"),
    "SPELL": R(r"\bcantrips?\b|\balways (?:have|has)[^.]{0,30}prepared\b|\bcast (?:the |it |that |this )?[a-z' ]{0,30}spell|\byou (?:know|learn)[^.]{0,30}(?:spell|cantrip)|\bspell list\b|\bwithout (?:expending|using|a) (?:a )?(?:spell )?slot|\bprepared spells?\b"),
    "ACB": R(r"\bbase (?:armor class|ac)\b|\b(?:armor class|ac) (?:is|equals|becomes) \d"),
    "ABIL": R(r"\b(?:raise|increase)\s+(?:one |an |your )?(?:ability score|strength|dexterity|constitution|intelligence|wisdom|charisma)\b|\b(?:strength|dexterity|constitution|intelligence|wisdom|charisma|ability) score\b[^.]{0,40}(?:increase|raise|\+\d|becomes|maximum|set|equal)|(?:increase|raise)[^.]{0,30}(?:strength|dexterity|constitution|intelligence|wisdom|charisma|ability) score"),
}
CAT_MAP = {"ac": "AC", "hp": "HP", "save": "SAVE", "speed": "SPEED", "init": "INIT", "skill": "PROF", "resist": None, "uses": "RESOURCE", "choice": "CHOICE", "fstyle": "CHOICE"}
ATOM_CLASSES = {"AC", "HP", "SAVE", "ADV", "DIS", "RES", "IMM", "SPEED", "SENSE", "PROF", "SLOT", "RESOURCE", "ATK", "DMG", "DC", "INIT", "SPELL", "ABIL", "CHOICE"}
STAT = {"AC", "HP", "SAVE", "SPEED", "SENSE", "PROF", "SLOT", "INIT", "ABIL", "RES", "IMM"}
ACT_OK = {"DMG", "DC", "RESOURCE", "ADV", "DIS", "ATK", "SAVE_ROLL"}
ACT_FORM = R(r"\b(?:as an action|as a bonus action|as a reaction|as a magic action|bonus action|magic action|reaction|use your action|command word|activate[sd]?|spend(?:s|ing)? (?:\d+|one|two|three|a|an|up to \w+)? ?(?:charges?|uses?|points?)|expend(?:s|ing)? (?:\d+|one|two|three|a|an|up to \w+)? ?(?:charges?|uses?)|(?:spend|expend)(?:s|ing)? (?:\d+|one|two|three|up to \d+)(?: or more)? of (?:its|the|your|their) charges?|charge cost \d+|\d+ charges?)\b")
TABLE_FORM = R(r"^(?:table\b|\(?\d+(?:[-\u2013]\d+)?\)?\s*[:.]\s|\d+(?:[-\u2013]\d+)? [A-Z])|\b(?:column|table)\b[^.]{0,60}\b(?:shows?|lists?|gives?|details?)\b|\b(?:shows?|lists?)\b[^.]{0,60}\b(?:column|table)\b|\(slot level|\broll an? d\d+ for\b")
POOL_RX = R(r"\b(?:has|have|holds?|contains?|with) (?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|twelve) (?:\w+ )?(?:charges?|uses)\b|\bregains? [^.]{0,40}(?:charges?|uses)\b|\bcharges?\b[^.]{0,40}\b(?:dawn|regain|recharge)\b|\bnumber of times equal to\b|\bpool\b[^.]{0,60}\b(?:dice|die|points?)\b")
ROLL_FORM = R(r"\b(?:saving throw|save|saves)\b[^.]{0,160}\b(?:fail|succeed|success|take|takes|half)\b|\b(?:fail|succeed|success|make|makes|must make)\b[^.]{0,160}\b(?:saving throw|save|check)\b|\bdc \d+|\bon a (?:failed|successful|hit|miss)\b|\bhalf as much\b")
ACTION_RX = R(r"\b(?:as an action|as a bonus action|as a reaction|as a magic action|bonus action|reaction|magic action|use your action|take the [a-z ]+ action)\b")
# a sentence that only hands out the proficiency (or training) of a SUB_GRANT row; a sentence with a modifier, a focus, a language, a choice or an "if you lack it" clause carries more than the row does
RX_GRANT_SENT = re.compile(r"^(?!.*(?:modifier|focus|speak|already|lack\b|another|your choice|usable|you obtain|you gain a )).*(?:proficien|training with)", re.S)
CLASS_ORDER = ["AC", "HP", "SAVE", "ADV", "DIS", "RES", "IMM", "SPEED", "SENSE", "PROF", "SLOT", "RESOURCE", "ATK", "DMG", "DC", "INIT", "SPELL", "ABIL", "CHOICE"]


def classes(text, kind=None):
    t = clean(text).lower()
    out = set()
    for k, rx in M.CAT.items():
        if rx.search(t):
            if k == "resist":
                out.add("IMM" if re.search(r"\bimmun", t) else "RES")
                if re.search(r"\bresistance to\b", t): out.add("RES")
            elif CAT_MAP.get(k): out.add(CAT_MAP[k])
    if kind == "item":
        for k, rx in M.ITEM_CAT.items():
            if rx.search(t):
                out.add({"ac": "AC", "save": "SAVE", "hp": "HP", "speed": "SPEED", "init": "INIT", "resist": "RES", "skill": "PROF"}[k])
    t_slot = re.sub(r"\b(?:without|no need for|instead of)\s+(?:expending |using |spending |needing |a |an |any |one |of |your )*(?:spell )?slots?\b|\b(?:or|and) with (?:a |any |your )?(?:spell )?slots?\b|\bcast (?:it|them|each|that)[^.]{0,30}\b(?:with|using) (?:a |any )?(?:spell )?slots?\b", " ", t)
    for k, rx in XCAT.items():
        if rx.search(t_slot if k == "SLOT" else t):
            out.add("AC" if k == "ACB" else k)
    # In a pure Advantage rule these words qualify the roll, not a change
    # to Speed or HP. Full-sentence matches keep genuine stat grants flagged.
    if re.fullmatch(r"you have advantage on (?!.*\b(?:gain|increase|reduce|decrease|becomes|set)\b).+ if you move no more than half your speed on the same turn\.", t):
        out.discard("SPEED")
    if re.fullmatch(r"you have advantage on (?:saves|saving throws) against (?:paralysis and )?effects that lower your hit point maximum\.", t) or re.fullmatch(r"you have advantage on wisdom \(perception or survival\) checks to (?:find|locate) or track a creature missing hit points\.", t):
        out.discard("HP")
    return out


# ---------------------------------------------------------------------------------------------------------------- atoms
FIELD_CLS = collections.defaultdict(set)


def reg(cls, *keys):
    for k in keys:
        FIELD_CLS[k].add(cls)


reg("AC", "ac", "acAdd", "acBase", "acDexAb", "acMw", "acArmAb", "acOver", "shAc", "acNoDex", "acAb", "acMin", "acCap", "acDexMax", "natAc", "acBonus", "dwAC", "unarmoredAC", "med3", "acSub", "ua", "mw")
reg("HP", "hp", "hpLvl", "hpFlat", "hpPerLevel", "hpSub")
reg("SAVE", "savePE", "saveBonus", "saveBonusNp", "saveBonusAb", "saveFrom", "saveProf", "saveFromAsi", "saveNote", "save", "advOn")
reg("ADV", "advOn", "initAdv", "saveNote", "noSurprise", "def", "defs", "adv")
reg("DIS", "saveNote", "def", "defs")
reg("RES", "res", "imm", "vul", "resToImm", "def", "defs", "condImm", "linRes", "saveNote", "resBy")
reg("IMM", "imm", "condImm", "resToImm", "def", "defs", "cimm")
reg("SPEED", "speed", "speedAdd", "speedSet", "speedMul", "speedAddIf", "mv", "fly", "swim", "climb", "burrow", "movesNote", "linFx")
reg("SENSE", "sense", "senseAdd", "dark", "darkAdd", "darkTo", "darkNone", "darkHave", "noSurprise", "senses")
reg("PROF", "skillProf", "skillExpert", "skillProfPlus", "skillBonus", "chkBonus", "chkBonusNp", "skillPE", "skillAb", "langs", "tools", "weapons", "armor", "toolExpert", "toolPE",
    "savePE", "weaponGroups", "skills", "skillPick", "toolPick", "allSk", "skTools", "wpPick", "wp", "tool", "saveProf", "exp")
reg("SLOT", "slotAdd", "nslot", "smax", "arcRec")
reg("RESOURCE", "atkSpendDice", "lu", "luBump", "cdAdd", "pbAdd", "ch", "by", "luckN", "resK", "res", "track", "resSub", "lg")
reg("ATK", "atk", "atkBonus", "atkDice", "atkSelfDamage", "atkSpendDice", "atkAb", "spAtk", "spellAtk", "attackRow", "extraAttack", "dieReplace", "unarmed", "reach", "attacks", "rngHit", "meleeDmg1h", "thrownDmg", "grappler", "mw", "wmAdd", "wm")
reg("DMG", "dmg", "atkDice", "atkSelfDamage", "atkSpendDice", "dieReplace", "attackRow", "unarmed", "meleeDmg1h", "thrownDmg", "xd")
reg("DC", "spDc", "dcAdd", "spellDc", "dc", "setsc")
reg("INIT", "init", "initAdv", "initDie")
# spellCls filters numerical item bonuses by class; it grants no spell or choice.
reg("SPELL", "spells", "spListAdd", "prepAdd", "cantAdd", "spCls", "bookAdd", "sp", "cantrips", "sfree", "xlists", "spAbTrait", "preSp")
reg("ABIL", "abUp", "abDown", "abSet", "abCut", "abPick", "abUpPick", "abil", "asi", "asi2", "asiPick", "asiFlex", "asiX")
reg("CHOICE", "pick", "pickLv", "fsPick", "opts", "lin", "featPick", "fs", "wm", "needs")


PROF_PICKS = {"expertise", "skills", "skill", "tools", "tool", "lang", "langs", "languages"}


class Atom:
    __slots__ = ("cls", "vals", "src", "weak", "i", "pool", "rx", "scope_values")

    def __init__(self, cls, vals, src, weak=False, pool=False, rx=None, scope_values=False):
        self.cls, self.vals, self.src, self.weak, self.i, self.pool, self.rx = cls, set(vals), src, weak, 0, pool, rx
        self.scope_values = scope_values is True


def critical_field_values(key, records):
    """Normal and critical rolls are separately computed nested fields.

    A bare d6 in prose describes the face of e.g. 4d6; preserve that actual face
    representation only for an explicit, supported critical replacement.
    """
    if key not in ("dieReplace", "atkDice", "atkSelfDamage") or not isinstance(records, list):
        return None
    normal_key, critical_key = ("normal", "critical") if key == "atkSelfDamage" else ("d", "critD")
    critical_values, normal_records = set(), []
    for record in records:
        if not isinstance(record, dict):
            normal_records.append(record)
            continue
        normal_records.append({k: v for k, v in record.items() if k != critical_key})
        before = re.fullmatch(r"(\d+)d(\d+)", str(record.get(normal_key, "")), re.I)
        after = re.fullmatch(r"(\d+)d(\d+)", str(record.get(critical_key, "")), re.I)
        if before and after and all(int(m[1]) > 0 and int(m[2]) > 1 for m in (before, after)):
            critical_values |= nums_in(record[critical_key]) | nums_in("1d" + before[2]) | nums_in("1d" + after[2])
    return (nums_in(normal_records), critical_values) if critical_values else None


TARGET_MISSING_HP = R(r"\b(?:creature|target)\s+(?:that is\s+)?below\s+(?:its|their)\s+(?:hit points? maximum|hp maximum|maximum hit points?)\b")
class TargetHpComparison:
    """Match only a target comparison, never an unimplemented HP benefit."""
    def search(self, text):
        found = TARGET_MISSING_HP.search(text)
        if not found:
            return None
        rest = TARGET_MISSING_HP.sub("target", text)
        return found if not re.search(r"\b(?:hit points?|hp)\b", rest, re.I) else None


def atoms_from(e, src, weak=False, extra=()):
    """One atom per (class, field) of a record dict (a GX entry, a fx dict, a structured field). Value numbers = numbers inside that field and the entry's `min`."""
    out = []
    if not isinstance(e, dict):
        return out
    # A repair override changes Mending's physical limit, not a generic distance
    # or Advantage amount. Require the matching attuned grant and strict schema.
    repair = e.get("objectRepair")
    if src.startswith("GX.item|") and e.get("n") == src.split("|", 1)[1] and e.get("itemState") == "attuned" and [1, "Mending"] in (e.get("spells") if isinstance(e.get("spells"), list) else []):
        if isinstance(repair, list) and len(repair) == 1 and isinstance(repair[0], dict):
            spec = repair[0]
            cap = spec.get("maxBreakFeet")
            if set(spec) == {"spell", "maxBreakFeet"} and spec.get("spell") == "Mending" and isinstance(cap, (int, float)) and not isinstance(cap, bool) and 0 < cap <= sys.float_info.max:
                # The runtime keeps Mending's native one-foot minimum.
                effective_cap = max(1, cap)
                scope = R(r"^you know mending while attuned, and it can repair a break or tear of up to %s (?:ft|feet)\.(?: you have advantage on smith's tools checks to craft or repair an object using the hammer head as the anvil\.)?$" % re.escape(format(effective_cap, "g")))
                out.append(Atom("SPELL", nums_in(effective_cap), "%s.objectRepair" % src, weak, rx=scope))
    if isinstance(e.get("target"), dict) and e["target"].get("missingHp") is True and isinstance(e.get("atkSpendDice"), list) and e["atkSpendDice"]:
        # targetMatches computes HP < maximum HP before exposing the paid hit.
        # This proves the comparison only, not a change to anyone's HP.
        out.append(Atom("HP", set(), "%s.target.missingHp" % src, weak, rx=TargetHpComparison()))
    # A consumed effect carries an explicit duration and an independent toggle
    # lifetime. Duration explains numbers on its actual benefit, never grants a
    # mechanical class by itself.
    if isinstance(e.get("consume"), dict) and isinstance(e.get("toggle"), dict) and e["toggle"].get("default") is False:
        extra = set(extra) | nums_in(e["consume"].get("duration"))
    for k, v in e.items():
        cl = FIELD_CLS.get(k)
        if not cl or v in (None, False, [], {}, "", 0) and k not in ("ac",):
            continue
        vals = nums_in(v) | nums_in(e.get("min")) | set(extra)
        if k == "atkSpendDice" and isinstance(v, list):
            # Damage dice and their resource price are distinct executed values.
            # A one-use price must not explain an unrelated one-minute rider.
            for spec in v:
                if not isinstance(spec, dict):
                    continue
                for spend_class in cl:
                    spend_values = (nums_in(spec.get("maxCost")) | {"1"}) if spend_class == "RESOURCE" else nums_in(spec.get("d"))
                    out.append(Atom(spend_class, spend_values, "%s.atkSpendDice" % src, weak, rx=R(r"^(?![\s\S]*\b(?:for each charge|per charge)\b)") if spend_class == "RESOURCE" else None))
                if spec.get("perCost") is True:
                    # The executed dice-times-charge formula is separate from
                    # its price. Some source clauses classify only as RESOURCE.
                    out.append(Atom("RESOURCE", nums_in(spec.get("d")) | {"1"}, "%s.atkSpendDice.perCost" % src, weak, rx=R(r"(?=[\s\S]*\b%s\b)[\s\S]*\b(?:for each charge|per charge)\b" % re.escape(str(spec.get("d", ""))))))
            continue
        if k == "atkDice" and src.startswith("GX.item|") and isinstance(v, list) and len(v) == 1 and isinstance(v[0], dict) and "typeFrom" in v[0] and isinstance(e.get("target"), dict) and set(e["target"]) == {"types"}:
            # A paid or differently triggered sentence must not consume this
            # named weapon's typed-target rider. Bind its existing literal dice
            # to the actual predicate; no numeric pooling or new amounts.
            spec, owner = v[0], src.split("|", 1)[1]
            target_types = e["target"]["types"]
            target_words = {"Dragon": r"dragons?", "Undead": r"undead", "Fiend": r"fiends?", "Construct": r"constructs?"}
            target_word = target_words.get(target_types[0]) if isinstance(target_types, list) and len(target_types) == 1 else None
            dice = spec.get("d")
            valid = target_word and spec.get("typeFrom") == "weapon" and spec.get("roll") is True and not spec.get("t") and spec.get("when") == owner and e.get("n") == owner and isinstance(dice, str) and re.fullmatch(r"[1-9]\d*d(?:[2-9]|[1-9]\d+)", dice, re.I)
            if valid:
                # Reviewed item-source forms: a short native bonus/rider
                # summary, or a target-qualified same-weapon damage clause.
                # Merely mentioning the type and dice proves neither an attack
                # bonus, self damage, a spell nor damage from every weapon.
                amount = re.escape(dice.lower())
                summary = r"(?:\+\d+ to attack and damage rolls,\s*)?\+%s damage against (?:%s)(?:, and you know [a-z ,'-]+)?[.!]?" % (amount, target_word)
                target_clause = r"when the target is an? (?:%s), add an extra %s damage of the same type the weapon normally deals[.!]?" % (target_word, amount)
                own_hit = r"when you hit an? (?:%s) with this weapon, you deal an extra %s damage[.!]?" % (target_word, amount)
                legacy_hit = r"when you hit an? (?:%s) with this weapon, the %s takes an extra %s damage of the weapon's type[.!]?" % (target_word, re.escape(target_types[0].lower()), amount)
                rider_scope = R(r"^(?:%s|%s|%s|%s)$" % (summary, target_clause, own_hit, legacy_hit))
                out.append(Atom("DMG", nums_in(dice), "%s.atkDice" % src, weak, rx=rider_scope))
            continue
        if k == "atkBonus" and isinstance(v, list) and src.startswith("GX.item|"):
            # A named item-weapon's scalar damage is executed independently
            # of atk. Generic attack groups/transformation stages stay outside
            # this extraction; their inherited references need their own model.
            owner = src.split("|", 1)[1]
            for spec in v:
                damage = spec.get("dmg") if isinstance(spec, dict) else None
                if not isinstance(spec, dict) or spec.get("when") != owner or e.get("n") != owner:
                    continue
                if isinstance(damage, int) and not isinstance(damage, bool) and damage != 0:
                    out.append(Atom("DMG", nums_in(damage) | nums_in(e.get("min")) | set(extra), "%s.atkBonus.dmg" % src, weak))
        critical_parts = critical_field_values(k, v)
        if critical_parts:
            normal_values, critical_values = critical_parts
            vals = normal_values | nums_in(e.get("min")) | set(extra)
            for critical_class in cl:
                out.append(Atom(critical_class, critical_values, "%s.%s.critical" % (src, k), weak))
        if k == "pick" and isinstance(v, (list, dict)):
            # a class pick of kind expertise / skills / tools / languages is what grants the proficiency (uncovered-1): a marker atom for STD:PICK_TEXT
            for pk in (v if isinstance(v, list) else [v]):
                if isinstance(pk, dict) and pk.get("k") in PROF_PICKS:
                    out.append(Atom("PICK_PROF", nums_in(pk.get("n")) | {"pb", "double"}, "%s.pick.%s" % (src, pk.get("k")), weak))  # marker class: no sentence needs it, STD:PICK_TEXT reads it
        if k == "ch" and isinstance(v, list) and len(v) >= 2 and all(not isinstance(x, (list, dict)) for x in v):
            # a charges pool [max, regain, reset] states two amounts a text names in separate sentences ("has 10 charges", "regains 1d6 + 4 at dawn"): one atom each
            # (uncovered-1, reports/uncovered-1.md). The reset word is no amount. A sentence still needs its own number to match its own part.
            # A pool amount may be restated by a later sentence ("up to 6"): its numbers explain other sentences of the feature too (pool=True), but only the sentence that
            # holds the atom is covered for the class. The notes after the reset word keep their numbers in a third atom.
            for part in (v[0], v[1], v[2:]):
                pv = nums_in(part)
                if pv:
                    for c in cl:
                        out.append(Atom(c, pv | nums_in(e.get("min")) | set(extra), "%s.%s" % (src, k), weak, pool=True))
            continue
        if k == "atkSelfDamage" and isinstance(v, list):
            # The self-damage control applies the literal amount through the HP
            # operation, without resistance/immunity adjustment, only when the
            # supported explicit bypass policy is present.
            for spec in v:
                if isinstance(spec, dict) and spec.get("bypassDefenses") is True:
                    policy_values = nums_in(spec.get("normal")) | nums_in(spec.get("critical"))
                    for policy_class in ("RES", "IMM"):
                        out.append(Atom(policy_class, policy_values, "%s.atkSelfDamage.bypassDefenses" % src, weak))
        for c in cl:
            out.append(Atom(c, vals, "%s.%s" % (src, k), weak))
    return out


def mentions(obj, name):
    """Parts of a structured field (list of dicts, dict of name -> value) that name the feature."""
    nm = name.lower()
    if isinstance(obj, list):
        return [x for x in obj if nm in M.blob(x)]
    if isinstance(obj, dict):
        return [{k: v} for k, v in obj.items() if nm in str(k).lower() or nm in M.blob(v)]
    return [obj] if nm in M.blob(obj) else []


def gx_match(entries, name, text, source_cls=None):
    """mech_scan.gxcov rule: an entry counts for the feature when it is named like it or named in its text."""
    out, t, f = [], (text or "").lower(), name.lower()
    for e in entries or []:
        if not isinstance(e, dict):
            continue
        if e.get("classOnly") and e["classOnly"] != source_cls:
            continue
        en = (e.get("n") or "").lower()
        base = re.sub(r"\s*\(.*\)\s*$", "", en).split(":")[0].strip()
        if en == f or (base and len(base) > 3 and (base in t or base in f)) or (f and f in en):
            out.append(e)
    return out


def spell_atoms(auto, text, src):
    """AUTO / SUB_GRANT / SP_AUTO / CLS_AUTO rows [[lvl, "A,B"]]: a row counts for the sentences that name one of its spells."""
    out, t = [], clean(text).lower()
    for rows in auto:
        for r in rows or []:
            if not isinstance(r, (list, tuple)) or len(r) < 2 or not isinstance(r[1], str):
                continue
            names = [x.strip().lower() for x in r[1].split(",") if x.strip()]
            if any(n in t for n in names):
                out.append(Atom("SPELL", nums_in(r[0]) | nums_in(r[1]), src))
    return out


def lu_atoms(D, owner, name, kind_ok=None):
    out = []
    for e in D.get("lu_by_owner", {}).get(owner, []):
        if (e.get("feature") or "").lower() == name.lower() or name.lower() in (e.get("n") or "").lower():
            out.append(Atom("RESOURCE", nums_in([e.get("max"), e.get("lvl"), e.get("tag")]), "LU_X"))
    return out


def sn_atoms(D, name, owner):
    out = []
    for row in D.get("saveNotes") or []:
        if len(row) >= 3 and isinstance(row[1], str) and row[1].lower() == name.lower() and (len(row) < 4 or not row[3] or row[3] == owner):
            cl = (classes(row[2]) & {"ADV", "DIS", "RES", "IMM", "SAVE"}) | {"ADV", "SAVE"}
            for c in cl:
                out.append(Atom(c, nums_in(row[2]), "SAVE_NOTES"))
    return out


def calc_note_names():
    """Names in the table T of calcNote() (src/builder/16-logic-feature-numbers.js): the sheet writes the level numbers of these features into their note from code, not from a record.
    Read-only parse of the source; the atoms are wildcards (the numbers come from the class tables at run time)."""
    try:
        src = open(os.path.join(ROOT, "src", "builder", "16-logic-feature-numbers.js"), encoding="utf-8").read()
        i = src.index("const T={"); j = src.index("calcNote", i + 10) if "calcNote" in src[i + 10:] else len(src)
        return set(re.findall(r'"([^"]+)":function', src[i:i + 9000]))
    except Exception:
        return set()


def build_index(D):
    D["calc_names"] = calc_note_names()
    D["lu_by_owner"] = collections.defaultdict(list)
    for e in D.get("lu") or []:
        D["lu_by_owner"][e.get("owner")].append(e)
    D["fdmg_by"] = collections.defaultdict(list)
    for r in D.get("fdmg") or []:
        if isinstance(r, list) and len(r) > 3:
            D["fdmg_by"][(r[1], r[2])].append(r)
    D["acts_set"] = set((D.get("acts") or {}).keys())
    return D


# ---------------------------------------------------------------------------------------------------------------- universe
CODE_ATOMS = {}


def scope_atoms(atoms, bindings):
    """Narrow existing record atoms under a live, tested code entry. No atom is
    added and an existing sentence restriction can never be broadened."""
    for a in atoms:
        if a.src in bindings:
            rx = bindings[a.src]
            if a.rx:
                rx = "(?=" + a.rx.pattern + ")" + rx
            a.rx = re.compile(rx)
    return atoms


def item_effect_override(row_fx, override):
    """Mirror ovFx: metadata alone preserves row effects; explicit null removes."""
    replaces = isinstance(override, dict) and "fx" in override
    return (override["fx"] if replaces else row_fx), replaces, bool(replaces and override["fx"] is None)


def features(D):
    global CODE_ATOMS
    CODE_NOTES.clear()
    CODE_ATOMS = load_code_atoms()
    """Yield feature contexts: dict(kind, owner, name, book, text, lvl, atoms, acts) for the universe mech_scan reads, plus spells. Atoms are built here (data side)."""
    gx = D.get("gx") or {}
    fxo = D.get("fxo") or {}
    seen = collections.Counter()

    def mk(kind, owner, name, book, text, lvl, atoms, acts):
        key = "%s|%s|%s" % (kind, owner, name)
        for e, a in CODE_ATOMS.get(key, []):
            if e.get("lvl") is None or lvl == e["lvl"]:  # the level of the data row must be the level the entry was checked at
                atoms = scope_atoms(atoms, e.get("scopeAtoms", {})) + [a]
            else:
                CODE_NOTES.append("code atom %s dropped: data row level %s, entry level %s" % (e["id"], lvl, e["lvl"]))
        if name in D["calc_names"] and kind in ("class", "sub", "species", "feat"):
            atoms = atoms + [Atom(c, {"*"}, "calcNote") for c in ("RESOURCE", "DC", "DMG", "HP", "ATK")]
        seen[key] += 1
        if seen[key] > 1:
            key += "~%d" % seen[key]
        return {"key": key, "kind": kind, "owner": owner, "name": name, "book": book or "core", "text": text if isinstance(text, str) else json.dumps(text, ensure_ascii=False) if text else "",
                "lvl": lvl, "atoms": atoms, "acts": acts}

    # class features
    for cn, c in D["classes"].items():
        st = {k: v for k, v in c.items() if k in ("pick", "res", "track", "fx", "ua", "acSub", "hpSub", "toolPick", "resSub", "xlists", "nslot", "smax")}
        book = D["srcOf"]["cls"].get(cn, "core")
        for row in c.get("f", []):
            lvl, name = row[0], row[1]
            text = D["cf"].get("%s|%s" % (cn, name)) or row[2]
            at = []
            for e in gx_match((gx.get("cls") or {}).get(cn), name, text, cn):
                at += atoms_from(e, "GX.cls|" + cn)
            for k, v in st.items():
                for part in mentions(v, name):
                    at += atoms_from({k: part}, "cls." + cn)
            if c.get("fs") and "fighting style" in name.lower(): at.append(Atom("CHOICE", nums_in(c.get("fs")), "cls.fs"))
            if c.get("wm") and "weapon mastery" in name.lower(): at += [Atom("CHOICE", nums_in(c["wm"]), "cls.wm"), Atom("ATK", nums_in(c["wm"]), "cls.wm"), Atom("PROF", nums_in(c["wm"]), "cls.wm")]
            at += lu_atoms(D, cn, name)
            if name.lower() in ("spellcasting", "pact magic") and (c.get("cast") or c.get("caster")):  # slots, prepared spells and cantrip counts are class tables, read by the slot code
                at += [Atom(k, {"*"}, "cls.cast") for k in ("SLOT", "SPELL", "CHOICE", "RESOURCE", "DC", "ATK", "ABIL")]
            ca = D["clsAuto"].get(cn)
            if isinstance(ca, dict):
                for rows in ca.values():
                    at += spell_atoms([rows], text, "CLS_AUTO")
            elif isinstance(ca, list):
                at += spell_atoms([ca], text, "CLS_AUTO")
            for r in D["fdmg_by"].get((cn, name), []):
                at += [Atom("DMG", nums_in(r[3:]), "FDMG"), Atom("RESOURCE", nums_in(r[3:]), "FDMG")]
            yield mk("class", cn, name, book, text, lvl, at, "cls|%s|%s" % (cn, name) in D["acts_set"])
        # subclass features
        for sn, arr in (c.get("subs") or {}).items():
            w = next((x for x in D["wxs"] if x["name"] == sn and x["cls"] == cn), None)
            sbook = (w or {}).get("src", "") or book
            for row in arr:
                lvl, name = row[0], row[1]
                text = D["sub"].get("%s|%s" % (sn, name)) or row[2]
                at = []
                for e in gx_match((gx.get("sub") or {}).get(sn), name, text, cn):
                    at += atoms_from(e, "GX.sub|" + sn)
                for k in ("pickSub", "resSub", "acSub", "hpSub"):
                    if isinstance(c.get(k), dict) and sn in c[k]:
                        for part in mentions(c[k][sn], name):
                            at += atoms_from({k: part}, "sub." + sn)
                if w:
                    at += wx_fx_atoms(w, name, lvl)
                    for k, v in w.items():
                        if k in ("cls", "name", "src", "alt") or v in ([], {}, "", None):
                            continue
                        for part in (mentions(v, name) if isinstance(v, (list, dict)) else []):
                            at += atoms_from({k: part}, "wxs." + sn)
                at += lu_atoms(D, sn, name)
                for src_name, tbl in (("AUTO", D["auto"].get(sn)), ("SUB_GRANT", D["subGrant"].get(sn))):
                    if isinstance(tbl, list):
                        at += spell_atoms([tbl], text, src_name)
                    elif isinstance(tbl, dict):
                        for rows in tbl.values():
                            at += spell_atoms([rows], text, src_name)
                sg = D["subGrant"].get(sn)
                if isinstance(sg, dict) and sg.get("f") == name:  # SUB_GRANT[sub] {f: feature name, armor|weapons|tools|skills: [[level, text]]} is read by the sheet (13-logic-sources-and-packs.js subGrant, 12g prof rows); uncovered-2
                    for k in ("armor", "weapons", "tools", "skills"):
                        rows = [r for r in (sg.get(k) or []) if isinstance(r, list) and len(r) > 1 and r[0] == lvl]
                        if rows:
                            at.append(Atom("PROF", nums_in([r[1] for r in rows]), "sub.SUB_GRANT." + k, True, rx=RX_GRANT_SENT))
                for r in D["fdmg_by"].get((sn, name), []):
                    at += [Atom("DMG", nums_in(r[3:]), "FDMG"), Atom("RESOURCE", nums_in(r[3:]), "FDMG")]
                yield mk("sub", "%s/%s" % (cn, sn), name, sbook, text, lvl, at, ("sub|%s|%s" % (sn, name)) in D["acts_set"])
    # species traits
    sk = {"natAc", "acBonus", "hpPerLevel", "speed", "dark", "skills", "skillPick", "saveProf", "opts", "lin", "toolPick", "featPick", "wpPick", "asiPick", "asiFlex", "spAbTrait",
          "linRes", "linFx", "fly", "swim", "climb", "burrow", "movesNote", "sense", "res", "imm", "cantrips"}
    for sn, s in D["species"].items():
        book = D["srcOf"]["species"].get(sn, "core")
        own = []
        for k, v in s.items():
            if k in sk and v not in ([], {}, "", None, 0):
                own += atoms_from({k: v}, "species." + sn, weak=True)
        for e in (s.get("fx") or []) if isinstance(s.get("fx"), list) else []:
            own += atoms_from(e, "species.fx|" + sn, weak=True)
        for x in (D.get("defSp") or {}).get(sn, []):  # DEF_SP (src/data/db4/01-...): the species Defenses table read by defenses() in 16-logic-feature-numbers.js
            if isinstance(x, list) and x and x[0] in ("Resistance", "Immunity", "Vulnerability"):
                own.append(Atom("RES" if x[0] != "Immunity" else "IMM", nums_in(x[1:]), "species.DEF_SP|" + sn, True))
                if x[0] == "Immunity": own.append(Atom("RES", nums_in(x[1:]), "species.DEF_SP|" + sn, True))
        for t in s.get("traits", []):
            name, text = t[0], t[1]
            at = list(own)
            for e in gx_match((gx.get("species") or {}).get(sn), name, text):
                at += atoms_from(e, "GX.species|" + sn)
            at += lu_atoms(D, sn, name) + sn_atoms(D, name, sn)
            sp = D["spAuto"].get(sn)
            if isinstance(sp, dict):
                for rows in sp.values():
                    at += spell_atoms([rows], text, "SP_AUTO")
            for r in D["fdmg_by"].get((sn, name), []):
                at += [Atom("DMG", nums_in(r[3:]), "FDMG"), Atom("RESOURCE", nums_in(r[3:]), "FDMG")]
            yield mk("species", sn, name, book, text, None, at, ("sp|%s|%s" % (sn, name)) in D["acts_set"])
    # feats
    for fn, f in D["feats"].items():
        keys = {k: v for k, v in f.items() if (k not in M.STRUCT_SKIP or k in ("asi",)) and k not in ("hb", "cat", "d", "full", "pre", "preSp", "preBg", "kind", "rep", "cls", "dt", "pas", "fi", "resBy") and v not in ([], {}, "", None)}
        at = []
        for k, v in keys.items():
            at += atoms_from({k: v}, "feat." + fn)
        for k in ("armor", "weapons", "tools"):  # mech_scan skips these structural fields, but the sheet reads them for feats (12g-logic-sheet-handlers-profs.js, prof-feats); uncovered-1
            if f.get(k) not in (None, "", [], {}):
                at += atoms_from({k: f[k]}, "feat." + fn)
        if isinstance(f.get("fx"), dict):  # FEATS[n].fx: res, imm, cimm, senses, skills, langs, exp are read by the sheet (09-logic-feats-and-choices.js); uncovered-1
            at += atoms_from(f["fx"], "feat.fx|" + fn)
        for e in (gx.get("feat") or {}).get(fn, []):
            at += atoms_from(e, "GX.feat|" + fn)
        at += lu_atoms(D, fn, fn) + sn_atoms(D, fn, fn)
        text = f.get("full") or f.get("d")
        yield mk("feat", fn, fn, D["srcOf"]["feats"].get(fn) or f.get("hb") or "core", text, None, at, ("feat|" + fn) in D["acts_set"])
    # magic items
    def item_rows():
        for r in D["dmgi"]:
            yield "dmg", r
        for book, rows in D["wxi"].items():
            for r in rows:
                yield book, r
    for src, r in item_rows():
        if not isinstance(r, list) or len(r) < 5 or not isinstance(r[4], str):
            continue
        name = r[0]
        ex = r[5] if len(r) > 5 and isinstance(r[5], dict) else {}
        fx, replaces_fx, fxo_null = item_effect_override(ex.get("fx"), fxo.get(name))
        at = []
        if isinstance(fx, dict):
            at += atoms_from(fx, "FXO|" + name if replaces_fx else "item.fx|" + name)
        # This declared scalar is computed for both weapon attack and damage
        # while unattuned; it is distinct from the attuned fx replacement.
        unattuned_bonus = (fxo.get(name) or {}).get("unattunedBonus")
        if isinstance(unattuned_bonus, int) and not isinstance(unattuned_bonus, bool) and unattuned_bonus > 0:
            at += atoms_from({"atk": unattuned_bonus, "dmg": unattuned_bonus}, "FXO.unattunedBonus|" + name)
        for k in ("ch", "by", "xd", "wp"):
            if ex.get(k) not in (None, "", [], {}):
                at += atoms_from({k: ex[k]}, "item.ex|" + name) or [Atom("RESOURCE", nums_in(ex[k]), "item.ex.%s" % k)]
        if ex.get("pick"):
            at.append(Atom("CHOICE", nums_in(ex["pick"]), "item.pick"))
        for e in (gx.get("item") or {}).get(name, []):
            at += atoms_from(e, "GX.item|" + name)
        isp = (D.get("itemSpells") or {}).get(name)
        if isinstance(isp, dict):
            at += atoms_from({"sp": isp.get("sp")}, "ITEM_SPELLS") if isp.get("sp") else []
            if isp.get("atk") is not None: at.append(Atom("ATK", nums_in(isp["atk"]), "ITEM_SPELLS.atk"))
            if isp.get("dc") is not None: at.append(Atom("DC", nums_in(isp["dc"]), "ITEM_SPELLS.dc"))
            for k, v in isp.items():
                if k not in ("sp", "atk", "dc") and v not in (None, [], {}, ""):
                    at.append(Atom("RESOURCE", nums_in(v), "ITEM_SPELLS.%s" % k))
        at += lu_atoms(D, name, name)
        text = r[4]
        extra = (D.get("itemDesc") or {}).get(name)
        if isinstance(extra, str) and extra and extra not in text:
            text = text + " " + extra
        if fxo_null:  # documented override: FXO[name]={fx:null} drops the fx of the row on purpose (SOURCE-NOTES, "Override item")
            at.append(Atom("*", {"*"}, "FXO_NULL_REPL" if any(a.cls != "*" for a in at) else "FXO_NULL"))  # _REPL: the item also has a replacement entry (addI, GX), which is compared with the text (uncovered-2)
        yield mk("item", src, name, src, text, None, at, False)
    # spells
    sfx = D.get("spellFx") or {}
    rows = {r[0]: r for r in (D.get("spellRows") or []) if isinstance(r, list) and r}
    for name, text in sorted((D.get("spellFull") or {}).items()):
        at = []
        e = sfx.get(name) or {}
        if e.get("dmg"): at.append(Atom("DMG", nums_in(e["dmg"]), "SPELL_FX.dmg"))
        for k, v in e.items():
            if k not in ("dmg",) and v not in (None, [], {}, ""):
                at.append(Atom("DC" if k in ("save", "dc") else "SPELL", nums_in(v), "SPELL_FX.%s" % k))
        r = rows.get(name)
        if r:
            at.append(Atom("SPELL", nums_in([r[1], r[5], r[7]]), "SPELLS.row"))
            at.append(Atom("DC", nums_in(r[10]), "SPELLS.row")) if len(r) > 10 and r[10] else None
        yield mk("spell", "spells", name, "spells", text, None, [a for a in at if a], False)


# ---------------------------------------------------------------------------------------------------------------- explicit informational rules (reason codes)
# Every rule below turns an UNCOVERED sentence into INFO with a code. None of them touches the number-conservation check of analyze(): a sentence reaches this
# pass only after the atoms and the numbers were compared and failed. A rule may use an atom of the feature (STD:*), never invents one. Each code has a reason.
REASONS = collections.OrderedDict([
    ("STD:ASI", "Feat ability score line 'raise X by 1, to a maximum of 20 (30)': the +1 and the cap are the standard ASI rule of the builder; the feat has an ability atom (asi / asiPick) that names the abilities."),
    ("STD:PICK_TEXT", "Sentence of a feature whose skill, Expertise, tool or language pick is a builder pick (class pick of kind expertise, skills, tools or languages): the pick is the record, the sentence says who qualifies, what is suggested or what Expertise does for that pick."),
    ("ROLL:LAST_CHARGE", "'When you use the last charge, roll a d20, on a 1 the item is destroyed': a roll made at the table when the pool reaches 0. The item has a charges pool record (the counter); the d20 is the only number the record does not name."),
    ("MOVE:SPEED_REF", "A one-off movement measured in Speed ('move up to half your Speed', 'as far as its Speed', 'teleport up to your Speed'): it spends movement, it does not change a Speed value of the character."),
    ("TARGET:SPEED", "Speed of another creature ('that creature's Speed becomes 0', 'its Speed is halved'): the effect sits on the target, the sheet tracks the character."),
    ("KNOW:TARGET_DEFENSES", "'You learn whether it has Immunities, Resistances or Vulnerabilities': information about another creature, not a Resistance or Immunity of the character."),
    ("FOCUS:SPELLCASTING", "Says which item can serve as a Spellcasting Focus ('a weapon you are proficient with works as your Spellcasting Focus'): the sheet keeps no focus, and 'proficient with' is the condition of the sentence, not a grant."),
    ("STD:SUBCLASS_PICK", "'Choose a X subclass': the subclass picker of the builder; no fx record."),
    ("STD:AC10", "'10 + Dex + ability' style base AC: the 10 is the standard base AC constant; the feature has an AC atom that names the ability."),
    ("TABLE:CLASS", "Class tables for spell slots, cantrips and spells known / prepared and the invocation list: read by the slot code and the builder tables from the class row, not by fx records."),
    ("REST:NONUM", "Rest or recharge rule that states no amount ('regains all expended charges at dawn', 'after a Long Rest'): the amount lives in the sentence that has the number; the refill timing is the reset of the pool."),
    ("DC:REFERENCE", "Sentence only points to the spell save DC / save DC of the feature (no number): the sheet computes the DC from the casting ability."),
    ("OBJECT:STATS", "Stat block of an object, stone, cube or summoned thing (AC, HP, resistance of the thing, not of the character): not a character stat."),
    ("ITEM:SENSES", "Senses of a sentient item ('It has hearing and darkvision out to 120 feet'): belong to the item, not to the wearer."),
    ("ACTIVE:OTHERS", "Effect placed on another creature (target, enemy, ally, 'its next turn') or a timed effect that ends by itself: the sheet tracks the character, not the target or a combat clock."),
    ("ACTIVE:TIMED_IMM", "'A creature that succeeds is immune to this power for 24 hours': immunity of the target to the power, not of the character."),
    ("POOL:SHARED", "Charges of several copies of an item form one shared pool: the sheet keeps one pool per item entry and cannot know how many copies the character carries."),
    ("ACTIVE:TRIGGER", "Triggered or optional effect with no stat of the character: save-or-suffer, reroll, replace-a-roll, spend-a-resource riders and spell options, decided at play. Rider dice on your own weapon hit stay flagged (atkDice exists)."),
    ("ACTIVE:REACTION", "Reaction or action that gives a temporary resistance, speed or similar for one attack or one turn: a combat action, not a standing stat."),
    ("COND:PLAY_STATE", "Bonus that exists only in a play state the sheet does not track (Bloodied is a toggle only where a record exists; flanking, cover, allies near, first round, mounted, underwater, next attack): the sheet does not compute it on purpose (SOURCE-NOTES, fx batch H)."),
    ("COND:ATTACK_ROLL_ADV", "Advantage or disadvantage on a single attack roll (per attack, per target): decided at the table."),
    ("NUMONLY:ROLL", "Number-only sentence about a die rolled at play (reroll, d20, healing roll, table roll): no stat class."),
    ("NUMONLY:GEOMETRY", "Number-only sentence whose numbers are only distances, areas or durations of an effect or a story: no stat class."),
    ("NUMONLY:TABLE", "Number-only fragment of a table or list (no verb): a row of a table the sheet prints from its own tables."),
    ("NUMONLY:FLAVOR", "Number-only sentence about lore, quantity, price, weight or a count of things: no stat class."),
    ("NUMONLY:ZERO", "Number-only sentence about dropping to 0 Hit Points, 0 speed of a target or similar rule text: no stat class."),
    ("NUMONLY:TEXT", "Number-only sentence with unsigned numbers and no stat word in a sentence that has no sign (+/-) or 'increases by': prose; a signed bonus without a stat word stays flagged."),
])
NONSTAT = {"DMG", "DC", "ATK", "RESOURCE", "SPELL", "CHOICE", "ADV", "DIS", "SAVE_ROLL", "SLOT"}
RX_ASI = R(r"\b(?:raise|increase|add 1 to)\b[^.]{0,90}\b(?:by 1|add 1 to it)\b[^.]{0,40}\bmaximum(?: of)? (?:20|30)\b|\bchoose an ability score and add 1 to it \(maximum (?:20|30)\)")
RX_AC10 = R(r"\b10 (?:plus|\+)")
RX_TABLE_NAME = R(r"^(?:spellcasting|pact magic|eldritch invocations?|cantrips?|spell slots?|spells known|prepared spells|the (?:[a-z]+ )?table)$")
RX_TABLE_SENT = R(r"\b(?:swap|replace|exchange)\b[^.]{0,40}\b(?:cantrip|spell)\b|\brules below\b|\bspell list\b|\bspell slots? (?:of|per|at) (?:each|every|a new)|\b(?:new|higher) level of spell slots\b|\bchoose (?:two|three|four|five|six|\d+) (?:level \d+ )?[a-z]+ (?:cantrips|spells)\b|\byou know (?:two|three|four|five|\d+) [a-z]+ cantrips\b|\bpick one invocation\b|\binvocations?\b[^.]{0,40}\b(?:known|table|list|learn|swap|replace)\b|\bcantrips? (?:known|column)\b|\bprepared spells? (?:column|table)\b|\byour list holds\b|\bspellbook\b|\bto start\b|\bat higher levels\b|\bupcast|\bhigher-level slot")
RX_REST = R(r"\b(?:long|short) rest\b|\bat dawn\b|\bdawn\b|\bregains?\b|\brecharge[sd]?\b|\bexpended\b|\bper day\b|\bdaily\b|\bunlimited\b|\bcharges?\b|\buses?\b|\bexpend\b")
RX_OBJ = R(r"\bobject with ac\b|\b(?:stone|cube|crystal|orb|construct|statue|barrier|wall|panel|object|summon|familiar|creature|spirit|pet|mount|companion|drone|turret|totem|device|item|it|they) (?:has|have|with|gains?|gain)\b[^.]{0,20}\b(?:ac|armor class|\d+ hit points)\b|\bhas ac \d+")
RX_ITEMSENSE = R(r"^(?:it|the (?:weapon|sword|item|blade|staff|armor|shield|axe|lance|hammer|dagger|bow|rod|wand|cloak)) (?:also )?(?:has|have) (?:hearing|blindsight|darkvision|truesight|normal vision)")
RX_OTHER_SUBJ = R(r"^(?:the )?(?:target|targets|creature|creatures|a creature|an enemy|each enemy|enemies|that creature|the creature|one creature|each creature|any creature|ally|allies|an ally|each ally|that ally|it|its|their|they|those|the chosen|the affected|the struck|the hit|opponents?|attackers?|the attacker|a spellcaster|a hit|a failed|a successful|on a (?:failed|successful|failure|success)(?: save| saving throw)?|if (?:the target|it|a creature|the creature)|until (?:the (?:start|end) of )?(?:its|their|the target's))\b")
RX_24H = R(r"\bimmune to\b[^.]{0,60}\b(?:for|the next) (?:the next )?(?:24 hours|a day|1 day|one day|hour)\b|\bimmune to this (?:power|effect|property|ability|spell)\b")
RX_TRIG = R(r"\bwhen you (?:hit|take|use|cast|roll|make|reduce|score|drop|fail|succeed|miss|are hit|are targeted|see|finish)\b|\bwhenever\b|\beach time\b|\bon an? (?:hit|miss|failed|successful|critical|natural)\b|\bif the target\b|\bthe next (?:attack|time|d20|saving|roll|spell|damage)\b|\buntil (?:the (?:start|end)|your next|the beginning)\b|\bat the (?:start|end) of\b|\byou can (?:add|roll|reroll|re-roll|replace|expend|spend|force|cause|impose|give|swap|push|redirect|reduce|halve|prevent|negate|extend|spread|divide)\b|\bas part of\b|\b(?:fails?|succeeds?) (?:on )?(?:its|the|a|their|that)\b|\b(?:target|creature|enemy) (?:takes?|must|can't|cannot|is|has|becomes|gains?|suffers?|regains?)\b|\bsaving throw against (?:your|the|this)\b|\bregains? hit points\b|\bwithin the next\b|\bcritical hit\b|\bspend (?:one|a|\\d+)\b")
RX_RIDER = R(r"\b(?:extra|additional)\b[^.]{0,40}\d+d\d+[^.]{0,40}\bdamage\b|\bdeals? \d+d\d+[^.]{0,30}\b(?:extra|additional|more)\b|\b\d+d\d+[^.]{0,30}\bextra damage\b")
RX_RIDER_HIT = R(r"\byou hit\b|\bhit(?:s|ting)? (?:a creature |it |the target )?with (?:an? |this |the )?(?:weapon |melee |ranged )?(?:attack|weapon)|\bwhen (?:it|the weapon) hits\b|\bon a hit\b|\bweapon attack\b|\bwhen you hit\b")
RX_POOL_SHARED = R(r"\b(?:charges|uses) (?:of (?:all|each|every) [a-z ]+ )?form (?:one|a single|a shared) pool\b|\bshare (?:a|one|the same) (?:single )?pool\b")
RX_PLAY = R(r"\bbloodied\b|\braging\b|\bwhile (?:you are )?(?:prone|mounted|flying|hidden|surprised|concentrating|underwater|transformed|in (?:bright|dim) light|in darkness|flanking|wearing no|incapacitated|unconscious|frightened|charmed)\b|\bwithin \d+ (?:feet|ft)\b[^.]{0,30}\b(?:of|from) (?:you|an ally|a|the|one|another)\b|\bfirst round\b|\bagainst (?:a |an |any )?(?:creature|creatures|undead|fiends?|aberrations?|dragons?|giants?|constructs?|beasts?|humanoids?|monstrosities|oozes|plants?|celestials?|fey|elementals?|aligned|evil|good|spellcasters?|the (?:target|creature|attacker))\b|\bwhile you have cover\b|\bhalf cover\b|\bthree-quarters cover\b|\bnext (?:attack|turn)\b|\bduring that time\b|\bduring this time\b|\bfor the duration\b|\bthat turn\b|\bthis turn\b|\buntil the end\b|\bwhen you are (?:hit|bloodied|targeted|reduced|attacked)\b|\bwhile (?:an? )?(?:ally|creature|enemy|enemies|allies)\b|\bfor the next\b|\bwhen you (?:roll|expend|spend)\b")
RX_ATKROLL = R(r"\battack rolls?\b[^.]{0,60}\b(?:against|made|by)\b|\bnext attack\b|\bon (?:that|its|the|this|your next) attack\b|\bthe attack\b|\bon the attack\b|\bagainst you\b|\bagainst the\b")
RX_DCREF = R(r"\b(?:spell )?save dc\b|\bsaving throw dc\b|\buse your\b[^.]{0,20}\bdc\b|\bthe dc\b|\bdifficulty class\b|\bdc is\b")
RX_STATUS = R(r"\bimmune to (?:the )?(?:frightened|charmed|poisoned|paralyzed|stunned|blinded|deafened|exhaustion|disease|petrified|restrained|prone|grappled|incapacitated)\b")
RX_OWN_STAT = R(r"\byou (?:have|gain|are|can see|know)\b|\byour\b[^.]{0,30}\b(?:speed|ac|armor class|hit points|score)\b")
RX_FRAGMENT_VERB = R(r"\b(?:is|are|was|were|can|could|may|must|has|have|had|gain|gains|deal|deals|take|takes|become|becomes|use|uses|cast|casts|add|adds|roll|rolls|make|makes|regain|regains|see|sees|know|knows|learn|learns|choose|chooses|pick|picks|get|gets|grant|grants|lose|loses|increase|increases|decrease|decreases|reduce|reduces|equal|equals|ends|end|lasts|last|rises|drops|drop|ignore|ignores|treat|treats|count|counts|move|moves|fly|flies|speak|speaks|wear|wears|hold|holds|carry|carries|require|requires|need|needs|let|lets|allow|allows|turn|turns|appear|appears|shed|sheds|spread|spreads|wake|wakes|work|works|apply|applies|do|does|cause|causes|suffer|suffers|fail|fails|succeed|succeeds|hit|hits|miss|misses|stay|stays|remain|remains)\b")
RX_FLAVOR = R(r"\bin the world of\b|\bknown to exist\b|\blots of\b|\bgallons?\b|\busually\b|\bfor sale\b|\bcost[s]?\b|\bweighs?\b|\bhundred\b|\bcentur(?:y|ies)\b|\bfound\b|\bcreated\b|\bforged\b|\bhistory\b|\blegend\b|\bonly (?:one|two|three|four|five|six|seven|eight|nine|ten) \b|\bof these\b|\bsized?\b|\bcarri(?:es|ed)\b|\bweight\b|\bcarry\b|\bpounds?\b|\bbarrels?\b|\bvolume\b|\bcubic\b|\bhalf-life\b|\bage\b|\byears? old\b")
RX_SIGNED = R(r"(?<![\w])[+-]\s?\d|\b(?:increases?|decreases?|rises?|reduced|raises?|lowers?|bonus|penalty)\b[^.]{0,30}\b(?:by )?\d")


RX_LAST_CHARGE = R(r"\b(?:last|final) (?:charge|one)\b[^.]{0,80}\broll (?:a |an |1)?d?20\b|\broll (?:a |an |1)?d?20\b[^.]{0,80}\b(?:last|final) charge\b")
RX_MOVE_SPEED = R(r"\b(?:move|moves|moving|teleport|teleports|travel)\b[^.]{0,60}\b(?:up to|as far as|a distance (?:of |equal to |up to )+)[^.]{0,25}\b(?:your|its|their) (?:walking )?speed\b|\b(?:move|moves|moving)\b[^.]{0,30}\b(?:half|twice|double) (?:your|its|their) (?:walking )?speed\b")
RX_SPEED_GAIN = R(r"\b(?:fly|flying|swim|swimming|climb|climbing|burrow|burrowing) speed\b|\bspeed (?:increases|rises|goes up|is increased|doubles|is doubled|is \d+|of \d+|equals?)|\+\d+ ?(?:ft|feet)\b|\b(?:gain|gains|have|has|get|gets)\b[^.]{0,25}\bspeed\b|\bspeed\b[^.]{0,20}\b(?:higher|greater|bonus)\b")
RX_TARGET_SPEED = R(r"\b(?:that|the|a|each) (?:creature|target|enemy|foe|attacker|monster|opponent)(?:'s| has)? speed\b|\b(?:reduce|lower|halve|cut|drop|set)s?\b[^.]{0,30}\b(?:its|their|that creature's|the target's) speed\b|\b(?:its|their) speed (?:drops?|is (?:reduced|halved|lowered|0)|becomes? (?:0|half))")
RX_FOCUS = R(r"\b(?:works?|serves?|counts?|used?|using|use|work|serve|count)\b[^.]{0,60}\bas (?:your |an? |the )?(?:spellcasting|arcane|druidic) focus\b|\b(?:spellcasting|arcane|druidic) focus\b[^.]{0,40}\b(?:is|are|can be)\b")
RX_KNOW_DEF = R(r"\b(?:you |the (?:dm|dungeon master) )?(?:learn|know|knows|tells you|find out|discover)\b[^.]{0,80}\b(?:immunities|resistances|vulnerabilit)")


def excuse(r, ctx, atoms):
    """Return (code, why) when an uncovered sentence is informational by an explicit rule, else None. Called only for sentences that failed the atom and number comparison."""
    t = r["text"].lower()
    need, toks, kind = r["need"], r["toks"], ctx["kind"]
    name = ctx["name"].lower()
    nokind = set(need)
    unexpl = set(r.get("unexplained") or [])
    has = lambda c: any(a.cls == c for a in atoms)
    own_rider = bool(RX_RIDER.search(t) and RX_RIDER_HIT.search(t) and not re.search(r"\bsaving throw\b|\bsave\b|\b(?:target|creature) (?:takes|must)\b", t))
    # standard constants explained by an atom of the same class (the class atom must exist, only the standard number is missing)
    if "ABIL" in need and not r.get("missing") and unexpl and unexpl <= {"1", "2", "20", "30"} and RX_ASI.search(t) and has("ABIL"):
        return "STD:ASI"
    if need <= {"CHOICE"} and kind == "class" and not toks and re.match(r"^(?:choose|pick) an? [a-z' -]+ (?:subclass|patron|circle|college|domain|oath|path)\b", t):
        return "STD:SUBCLASS_PICK"
    if "AC" in need and not r.get("missing") and unexpl and unexpl <= {"10"} and RX_AC10.search(t) and has("AC"):
        return "STD:AC10"
    if need <= {"RESOURCE"} and need and unexpl and unexpl <= {"1d20", "20"} and has("RESOURCE") and RX_LAST_CHARGE.search(t):
        return "ROLL:LAST_CHARGE"
    if need == {"SPEED"} and RX_MOVE_SPEED.search(t) and not RX_SPEED_GAIN.search(t):
        return "MOVE:SPEED_REF"
    if need == {"SPEED"} and RX_TARGET_SPEED.search(t) and not re.search(r"\byour speed\b|\byours\b|\byou (?:gain|have)\b", t):
        return "TARGET:SPEED"
    if need and need <= {"PROF", "SPELL"} and RX_FOCUS.search(t) and not re.search(r"\b(?:you|they) (?:gain|become|get|obtain)\b[^.]{0,40}\bproficien|\bgain proficiency\b|\bcast\b[^.]{0,60}\bwithout\b|\bwithout (?:a |expending )?(?:spell )?slot|\bcantrips?\b|\bonce\b", t):
        return "FOCUS:SPELLCASTING"
    if need <= {"RES", "IMM"} and need and RX_KNOW_DEF.search(t) and not re.search(r"\byou (?:have|gain) (?:resistance|immunity)", t):
        return "KNOW:TARGET_DEFENSES"
    if need and need <= {"PROF", "CHOICE"} and has("PICK_PROF") and kind in ("class", "sub") and re.search(r"\bexpertise\b|\bproficien|\bskills?\b|\btools?\b|\blanguages?\b", t):
        pv = set().union(*[a.vals for a in atoms if a.cls == "PICK_PROF"])
        if not (unexpl - pv):
            return "STD:PICK_TEXT"
    if need:
        # number conservation is not loosened: a feature that HAS an atom of a needed class but whose numbers disagree with the text stays flagged
        if unexpl and any(a.cls in need for a in atoms):
            return None
        if toks and POOL_RX.search(t) and "RESOURCE" in need:  # the size or refill of a pool (has 7 charges, regains 1d6 at dawn) always needs a charges / uses record
            return None
        if need <= {"SLOT", "SPELL", "CHOICE", "RESOURCE", "ABIL", "PROF"} and kind in ("class", "sub") and (RX_TABLE_NAME.match(name) or "spellcasting" in name or "invocation" in name or "pact" in name) and RX_TABLE_SENT.search(t):
            return "TABLE:CLASS"
        if need <= {"SLOT", "SPELL", "CHOICE"} and RX_TABLE_SENT.search(t) and kind in ("class", "sub") and re.search(r"savant|spellcasting|invocation|spell mastery|pact|magical secrets", name) and ("cantrip" in t or "spellbook" in t or "slots of a" in t or "level of spell slots" in t or "invocation" in t):
            return "TABLE:CLASS"
        if need <= {"RESOURCE", "CHOICE"} and not toks and "RESOURCE" in need and RX_REST.search(t) and not RX_SIGNED.search(t):
            return "REST:NONUM"
        if need <= {"DC", "SAVE"} and not toks and RX_DCREF.search(t):
            return "DC:REFERENCE"
        if need & {"AC", "RES", "IMM", "HP"} and RX_OBJ.search(t) and not re.search(r"\byou (?:have|gain)\b", t):
            return "OBJECT:STATS"
        if "SENSE" in need and RX_ITEMSENSE.search(t):
            return "ITEM:SENSES"
        if "IMM" in need and RX_24H.search(t):
            return "ACTIVE:TIMED_IMM"
        if need & {"RES", "IMM"} and re.search(r"\bignores? resistance|\bresistance to [a-z]+ damage doesn't apply|\bdoesn't apply to this damage|\bbypass|\bovercom", t):
            return "ACTIVE:OTHERS"
        if need <= {"RESOURCE", "CHOICE"} and RX_POOL_SHARED.search(t):
            return "POOL:SHARED"
        # effects on others
        subj_ok = RX_OTHER_SUBJ.search(t) and (not (need & STAT) or (not re.match(r"^(?:it|its|their|they|those)\b", t) and not re.search(r"\battuned|\bpossession\b|\bwearer\b|\bbearer\b|\bgrants?\b|\bwhile you (?:wear|hold|wield)", t)))
        if need <= (NONSTAT | {"RES", "IMM", "SPEED", "AC", "SENSE"}) and not own_rider and subj_ok and not RX_OWN_STAT.search(t) and not RX_STATUS.search(t):
            return "ACTIVE:OTHERS"
        if need <= {"ADV", "DIS"} and not toks and (re.search(r"\b(?:target|creature|enemy|ally|allies|it|its|that creature)\b[^.]{0,30}\b(?:has|have|gains?)\b[^.]{0,20}\b(?:dis)?advantage", t) or re.search(r"\b(?:against|targeting) (?:you|the|that|it)\b", t)):
            return "ACTIVE:OTHERS"
        if need <= {"ADV", "DIS"} and RX_ATKROLL.search(t) and not re.search(r"\bsaving throws?\b|\bability checks?\b|\bskill\b|\binitiative\b", t):
            return "COND:ATTACK_ROLL_ADV"
        # reactions and actions that give a temporary stat
        if need & {"RES", "IMM", "SPEED", "AC"} and need <= (NONSTAT | {"RES", "IMM", "SPEED", "AC"}) and re.search(r"\b(?:use your reaction|as a reaction|reaction to|bonus action|as an action|as a magic action|magic action)\b", t) and re.search(r"\b(?:this turn|until the (?:start|end)|that attack|the next|for 1 minute|for the next|until you|for the duration)\b", t):
            return "ACTIVE:REACTION"
        if need <= {"RESOURCE", "HP"} and re.search(r"\bwhile (?:you are |you're )?bloodied\b", t) and re.search(r"\bregain", t):  # regeneration in the Bloodied state: a play state, not a trigger (uncovered-2)
            return "COND:PLAY_STATE"
        # triggered / optional effects without a stat of the character (rider dice on your own weapon hit stay flagged)
        if need <= NONSTAT and RX_TRIG.search(t) and not own_rider:
            return "ACTIVE:TRIGGER"
        # conditions in play that the sheet does not compute (not equip states: hold / wear / wield / attune stay flagged)
        own_adv = need <= {"ADV", "DIS"} and re.search(r"\byou(?: and [a-z ]+)? (?:have|has) (?:dis)?advantage on (?:[a-z ]+ )?(?:saving throws?|saves?|ability checks?|checks?|initiative|[a-z]+ \([a-z ]+\) checks?)", t)
        if need <= (NONSTAT | {"SPEED", "AC", "SAVE", "RES"}) and not own_rider and not own_adv and RX_PLAY.search(t) and not re.search(r"\bwhile (?:you )?(?:are )?(?:wearing|wielding|holding|carrying|attuned|using this|you have this|you wear|you wield|you hold)\b", t) and not re.search(r"\bresistance to\b[^.]{0,30}\bdamage\b", t) and not re.search(r"\bspeed (?:of|is|equal)|\bfly(?:ing)? speed|\bclimb|\bswim", t):
            return "COND:PLAY_STATE"
        return None
    # number-only (no keyword class)
    if not toks:
        return None
    kinds = {k for _, k in toks}
    if RX_SIGNED.search(t) and not RX_FLAVOR.search(t) and not re.search(r"\broll|\bd20\b|\bdie\b|\bdice\b", t):
        return None
    if re.search(r"\broll(?:s|ed)?\b|\bd20\b|\bd100\b|\bdie\b|\bdice\b|\breroll|\bd\d+\b|\bhit point dice\b|\btemporary hit points\b|\bheals?\b|\bregains?\b", t) or "dice" in kinds:
        return "NUMONLY:ROLL"
    if re.search(r"\b(?:drops?|reduced|falls?) to 0\b|\b0 hit points\b|\bspeed (?:is |becomes )?0\b|\bat 0\b", t):
        return "NUMONLY:ZERO"
    if kinds <= {"dist", "dur"}:
        return "NUMONLY:GEOMETRY"
    if RX_FLAVOR.search(t):
        return "NUMONLY:FLAVOR"
    if not RX_FRAGMENT_VERB.search(t) or len(re.findall(r"[A-Za-z']+", t)) <= 6 or re.match(r"^[a-z' ()/-]{0,40}[:,]", t) and len(re.findall(r"\d", t)) >= 1 and t.count(",") >= 2:
        return "NUMONLY:TABLE"
    if kinds <= {"num", "dist", "dur", "pct"} and not RX_SIGNED.search(t):
        return "NUMONLY:TEXT"
    return None


# ---------------------------------------------------------------------------------------------------------------- analysis
def sentence_info(text, kind):
    ks = classes(text, kind)
    toks = tokens(text)
    return ks, toks


def analyze(ctx, by_design=None, allow=None, atoms=None, today=None):
    """Result for every sentence of one feature. Pure function of (ctx, atoms): used by the real run, the synthetic cases and the mutation test.
    Returns list of dict(sid, h, text, K, toks, status, why, unexplained, used)."""
    atoms = ctx["atoms"] if atoms is None else atoms
    key = ctx["key"]
    sents = split_sentences(ctx["text"])
    res = []
    all_vals = set()
    for a in atoms:
        if a.src != "FXO_NULL_REPL" and not a.src.endswith(".objectRepair") and not a.scope_values:  # repair limits and opted-in CODE literals stay local to their matching sentences
            all_vals |= a.vals
    if ctx.get("lvl") is not None:
        all_vals |= {str(ctx["lvl"])}
    for i, s in enumerate(sents):
        ks, toks = sentence_info(s, ctx["kind"])
        need = ks & ATOM_CLASSES
        w_ = re.findall(r"[A-Za-z']+", s)
        if not toks and (len(w_) <= 3 or (len(w_) <= 9 and all(x[0].isupper() or x.lower() in ("of", "the", "your", "a", "an", "and", "to", "in", "for", "on", "or") for x in w_))):
            ks = set()  # a label such as "Cantrip.", "Cantrip Upgrade." or "Changing Your Prepared Spells."
        mech = bool(ks) or bool(toks)
        nk = sorted({"NUM-" + k.upper() if k != "num" else "NUM" for t, k in toks})
        res.append({"nk": nk, "sid": "%s#%d" % (key, i + 1), "h": shash(s), "text": s, "K": sorted(ks), "toks": toks, "mech": mech, "need": need, "status": None, "why": "", "unexplained": [], "used": []})
    # info and allow first
    bd = (by_design or {}).get(key)
    fxo_keep = any(a.src in ("FXO_NULL", "FXO_NULL_REPL") for a in atoms)
    fxo_repl = any(a.src == "FXO_NULL_REPL" for a in atoms)  # uncovered-2: FXO[name]={fx:null} drops the OLD fx; an addI/GX entry of the same item replaces it and must be compared with the text
    fxo_null = fxo_keep and not fxo_repl
    if fxo_repl:
        atoms = [a for a in atoms if a.src != "FXO_NULL_REPL"]
    for r in res:
        if not r["mech"]:
            r["status"] = "inert"; continue
        if fxo_null:
            r["status"] = "info"; r["why"] = "FXO_NULL"; continue
        al = (allow or {}).get(r["sid"])
        if al:
            if al.get("h") != r["h"]:
                r["note"] = "allow entry is stale (hash changed)"
            elif al.get("expires") and today and al["expires"] < today:
                r["note"] = "allow entry expired"
            elif al.get("reason"):
                r["status"] = "allow"; r["why"] = al["reason"]; continue
        if ctx["acts"] and r["need"] <= ACT_OK and r["toks"] and not (r["need"] & STAT) \
                and (ACTION_RX.search(r["text"].lower()) or r["need"] & {"DMG", "DC", "RESOURCE"}):
            r["status"] = "info"; r["why"] = "ACTIVATE"; continue
    # info by form (heuristic, listed apart as FORM:*): an activated effect (action, charges) or a roll made at the table (save, DC, check) with no stat class
    for r in res:
        if r["status"] is not None:
            continue
        low = r["text"].lower()
        if ctx["kind"] == "spell":
            if not any(a.cls in r["need"] for a in atoms):
                r["status"] = "info"; r["why"] = "SPELL_TEXT"
            continue
        if TABLE_FORM.search(low) or len(r["toks"]) >= 5:
            r["status"] = "info"; r["why"] = "FORM:TABLE"; continue
        if r["need"] & STAT or POOL_RX.search(low):  # a stat, or the size / refill of a pool (needs a charges or uses record)
            continue
        if ACT_FORM.search(low):
            r["status"] = "info"; r["why"] = "FORM:ACTIVATE"
        elif ROLL_FORM.search(low):
            r["status"] = "info"; r["why"] = "FORM:ROLL"
    # greedy assignment of atoms to (sentence, class): best number match first, then earliest sentence
    cand = []
    for r in res:
        if r["status"] is not None:
            continue
        sv = {t for t, k in r["toks"]}
        for c in r["need"]:
            for j, a in enumerate(atoms):
                if a.cls != c:
                    continue
                score = len(sv & a.vals)
                if a.weak and sv and score == 0:
                    continue
                if a.rx and not a.rx.search(r["text"].lower()):
                    continue  # a code atom (tests/clause_gate_code.json) names the sentence it is for
                cand.append((-score, res.index(r), c, j, a.weak))
    cand.sort()
    used_atoms, got = set(), set()
    matched = collections.defaultdict(set)  # (sentence, class) -> numbers the atoms already given to it explain
    for ns, ri, c, j, weak in cand:
        sv = {t for t, k in res[ri]["toks"]}
        if (ri, c) in got:
            # a second atom of the same class for the same sentence only when it explains numbers no atom of that sentence explains yet
            # (uncovered-1: "has 10 charges and regains 1d6 + 4 at dawn" needs the max atom and the regain atom of one pool). Every atom still serves one sentence.
            if weak or not atoms[j].pool or ns >= 0 or j in used_atoms or not ((sv & atoms[j].vals) - matched[(ri, c)]):
                continue
            used_atoms.add(j); res[ri]["used"].append(j); matched[(ri, c)] |= sv & atoms[j].vals
            continue
        if j in used_atoms and not atoms[j].weak:
            continue
        got.add((ri, c))
        matched[(ri, c)] |= sv & atoms[j].vals
        if not atoms[j].weak: used_atoms.add(j)
        res[ri]["used"].append(j)
    for ri, r in enumerate(res):
        if r["status"] is not None:
            continue
        spell_txt = ctx["kind"] == "spell"
        missing = sorted(c for c in r["need"] if (ri, c) not in got)
        if "CHOICE" in missing and any((ri, c) in got for c in ("PROF", "SPELL", "ABIL", "RES", "IMM", "SPEED", "SENSE")):
            missing.remove("CHOICE")  # a pick that the other atom already carries ("two tools of your choice")
        assigned = set()
        scoped_vals = set()
        for j, a in enumerate(atoms):
            if (a.src.endswith(".objectRepair") or a.scope_values) and a.rx and a.rx.search(r["text"].lower()):
                scoped_vals |= a.vals
                if a.vals & {t for t, k in r["toks"]} and j not in r["used"]:
                    r["used"].append(j)
        for j in r["used"]:
            assigned |= atoms[j].vals
        for j, a in enumerate(atoms):  # other atoms of the classes this sentence needs that no other sentence has claimed (pool amounts may be restated)
            if a.cls in r["need"] and (a.weak or a.pool or j not in used_atoms) and (not a.rx or a.rx.search(r["text"].lower())):
                assigned |= a.vals
        wild = "*" in all_vals
        # dist and dur numbers: any atom of the feature explains them (records rarely keep units). dice, plain numbers, percents: the atoms assigned to this sentence,
        # or any atom of the feature when the sentence has no atom class of its own (so a lone "1" is not explained by an unrelated record)
        unexpl = []
        for t, k in r["toks"]:
            pool = (all_vals | scoped_vals) if (k in ("dist", "dur") or not r["need"]) else assigned
            if "*" in pool or t in pool or wild and r["used"]:
                continue
            unexpl.append(t)
        r["unexplained"] = unexpl
        if not missing and not unexpl and not (fxo_repl and not r["need"]):  # a sentence of an FXO_NULL item with no stat class of its own is not covered by a numbers-only match
            r["status"] = "covered"
        elif spell_txt:  # spell text is reference text: the sheet reads only SPELL_FX; what has no record stays SPELL_TEXT info and is counted apart
            r["status"] = "info"; r["why"] = "SPELL_TEXT"
        elif bd:  # a by-design sentence stays info only when no record explains it (uncovered-2: a record that explains it wins, so a stale entry cannot hide a later change)
            r["status"] = "info"; r["why"] = "BY_DESIGN"; continue
        elif fxo_repl:  # the item has a replacement entry that does not explain this sentence: kept as info FXO_NULL so the baseline does not rise, counted apart in the report
            r["status"] = "info"; r["why"] = "FXO_NULL"; r["fxo_repl"] = True; continue
        else:
            r["status"] = "uncovered"
            if missing and unexpl: r["why"] = "no record for %s; number %s unexplained" % (",".join(missing), ",".join(unexpl))
            elif missing: r["why"] = "no record for " + ",".join(missing)
            else: r["why"] = "number %s no record explains" % ",".join(unexpl)
        r["missing"] = missing
        if r["status"] == "uncovered" and not r.get("note"):
            ex = excuse(r, ctx, atoms)
            if ex:
                r["status"] = "info"; r["why"] = ex; continue
        if r.get("note"):
            r["why"] = r["note"] + "; " + r["why"]
    return res


CODE_NOTES = []


def load_code_atoms(ents=None):
    """Features the SHEET computes in code (a registered sheet rule, defenses() in 16-logic-feature-numbers.js) and not from an fx record (uncovered-1).
    tests/clause_gate_code.json lists, per feature and sentence, the class the code carries, the numbers it handles, an anchor (file + text that must still be in the
    source, so deleting the code makes the sentence uncovered again) and the zero_miss_fx case that shows the sheet change (the selftest checks that the case exists).
    Returns {kind|owner|name: [(entry, Atom)]}. An entry whose anchor is gone is dropped and noted in CODE_NOTES."""
    out = collections.defaultdict(list)
    if ents is None:
        try:
            ents = json.load(open(CODE, encoding="utf-8")).get("entries", [])
        except Exception:
            return out
    cache = {}
    for e in ents:
        if "scopeValues" in e and type(e["scopeValues"]) is not bool:
            CODE_NOTES.append("code atom %s dropped: scopeValues must be a boolean" % e["id"])
            continue
        extra = e.get("extraAnchors", [])
        if not isinstance(extra, list) or any(not isinstance(pair, list) or len(pair) != 2 or any(not isinstance(value, str) or not value for value in pair) for pair in extra):
            CODE_NOTES.append("code atom %s dropped: extraAnchors must be a list of nonempty file/text pairs" % e["id"])
            continue
        anchors_ok = True
        for f, needle in [e["anchor"]] + extra:
            if f not in cache:
                try: cache[f] = open(os.path.join(ROOT, f), encoding="utf-8").read()
                except Exception: cache[f] = ""
            if needle not in cache[f]:
                CODE_NOTES.append("code atom %s dropped: anchor %r not found in %s" % (e["id"], needle, f))
                anchors_ok = False
        if not anchors_ok:
            continue
        for c in e["cls"]:
            out["%s|%s|%s" % (e["kind"], e["owner"], e["name"])].append((e, Atom(c, set(e.get("vals", [])), "CODE|" + e["id"] + "." + c, rx=re.compile(e["rx"]), scope_values=e.get("scopeValues") is True)))
    return out


def wx_fx_atoms(w, name, lvl):
    """WXS.fx [level, feature, payload] fields actually consumed by sbFx/XFX.

    The outer `fx` key is not an effect field. Do not treat arbitrary payload
    keys (or free-form notes) as GX fields: Only supported fields with a whole-sentence semantic match count.
    """
    out = []
    for row in (w or {}).get("fx", []):
        if not isinstance(row, list) or len(row) != 3 or row[:2] != [lvl, name] or not isinstance(row[2], dict):
            continue
        for field, cls, noun in (("res", "RES", "resistance"), ("imm", "IMM", "immunity"), ("skills", "PROF", "proficiency")):
            values = row[2].get(field) or []
            if not values or not all(isinstance(v, str) for v in values):
                continue
            alternatives = "(?:" + "|".join(re.escape(v.lower()) for v in values) + ")"
            listing = alternatives + r"(?:(?:, | and |, and )" + alternatives + ")*"
            phrase = (r"(?:the )?" + listing + r"(?: skill)?") if field == "skills" else listing + " damage"
            rx = re.compile(r"^you (?:have|gain) " + noun + (" in " if field == "skills" else " to ") + phrase + r"\.?$", re.I)
            out.append(Atom(cls, nums_in(values), "wxs.fx|" + w["name"] + "." + field, rx=rx))
        for sense in row[2].get("senses", []):
            if not isinstance(sense, list) or len(sense) < 2:
                continue
            rx = re.compile(r"^you (?:have|gain) " + re.escape(str(sense[0])) + r" (?:(?:out to|to|with a range of|out to a range of) )?" + re.escape(str(sense[1])) + r" (?:ft|feet)\.?$", re.I)
            out.append(Atom("SENSE", nums_in(sense[1:2]), "wxs.fx|" + w["name"] + ".senses", rx=rx))
    return out


def load_by_design():
    try:
        return json.load(open(MBASE, encoding="utf-8")).get("by_design", {})
    except Exception:
        return {}


def load_known_gaps():
    try:
        return set(json.load(open(MBASE, encoding="utf-8")).get("gaps", {}))
    except Exception:
        return set()


def load_allow():
    try:
        return json.load(open(ALLOW, encoding="utf-8")).get("entries", {})
    except Exception:
        return {}


# ---------------------------------------------------------------------------------------------------------------- selftest
def synth(kind, owner, name, text, atoms, acts=False, lvl=None):
    return {"key": "%s|%s|%s" % (kind, owner, name), "kind": kind, "owner": owner, "name": name, "book": "synthetic", "text": text, "lvl": lvl, "atoms": atoms, "acts": acts}


def selftest():
    fails = []

    def check(label, cond, extra=""):
        print("  %s %s %s" % ("ok  " if cond else "FAIL", label, extra))
        if not cond: fails.append(label)
    print("selftest (synthetic):")
    wx = {"name": "Example", "fx": [[6, "Winter", {"res": ["Cold"], "acAdd": 2}]]}
    wa = wx_fx_atoms(wx, "Winter", 6)
    check("U5 WXS nested resistance is a record", analyze(synth("sub", "Wizard/Example", "Winter", "You have Resistance to Cold damage.", wa))[0]["status"] == "covered")
    check("U5 NEG WXS ignores unsupported GX fields", not any(a.cls == "AC" for a in wa))
    check("U5 NEG WXS feature name must match", not wx_fx_atoms(wx, "Summer", 6))
    check("U5 NEG WXS feature level must match", not wx_fx_atoms(wx, "Winter", 5))
    check("U5 NEG WXS removed payload stays uncovered", analyze(synth("sub", "Wizard/Example", "Winter", "You have Resistance to Cold damage.", wx_fx_atoms({"name": "Example", "fx": []}, "Winter", 6)))[0]["status"] == "uncovered")
    check("U5 NEG WXS notes are not computed stat fields", not wx_fx_atoms({"name": "Example", "fx": [[6, "Winter", {"notes": [["Resistance", "Cold"]]}]]}, "Winter", 6))
    S1 = "While you hold a Shield, it gives you +3 AC instead of +2."
    S2 = "While you hold a Shield, you also gain a +1 bonus to saving throws against spells."
    ts_atoms = lambda: [Atom("AC", {"3", "2", "1"}, "GX.sub|Armigers' Guild.shAc")]
    # 1 Tower Shield: two mechanical sentences, only the first has a record
    c1 = synth("sub", "Fighter/Armigers", "Tower Shield", S1 + " " + S2, ts_atoms())
    r = analyze(c1)
    check("1 Tower Shield: sentence 1 covered", r[0]["status"] == "covered", r[0]["why"])
    check("1 Tower Shield: sentence 2 flagged", r[1]["status"] == "uncovered", r[1]["why"])
    # 1b the same feature with the second record present
    c1b = synth("sub", "Fighter/Armigers", "Tower Shield", S1 + " " + S2, ts_atoms() + [Atom("SAVE", {"1"}, "GX.sub.saveBonus"), Atom("ADV", set(), "x")][:1])
    r = analyze(c1b)
    check("1b both records present -> both covered", all(x["status"] == "covered" for x in r), str([x["why"] for x in r]))
    # 1c the one-record-two-sentences trap: a single AC atom must not cover a second AC sentence
    c1c = synth("sub", "X", "Y", "You gain +2 AC. While wielding a Shield you gain another +2 bonus to AC.", [Atom("AC", {"2"}, "ac")])
    r = analyze(c1c)
    check("2 one atom, two AC sentences -> second flagged", [x["status"] for x in r] == ["covered", "uncovered"], str([x["status"] for x in r]))
    # 3 number mismatch: record says 1, text says +2
    c3 = synth("feat", "F", "F", "Your Armor Class increases by 2.", [Atom("AC", {"1"}, "ac")])
    r = analyze(c3)
    check("3 number not conserved (text 2, record 1) -> flagged", r[0]["status"] == "uncovered" and r[0]["unexplained"] == ["2"], r[0]["why"])
    # 4 by_design info tag
    c4 = synth("class", "Cleric", "Divine Order", "You gain +2 AC when you are in the right mood.", [])
    r = analyze(c4, by_design={c4["key"]: "story rule"})
    check("4 documented informational tag (by_design) -> info", r[0]["status"] == "info", r[0]["why"])
    # 5 allowlist: valid, stale hash, expired
    sid = c4["key"] + "#1"
    h = shash("You gain +2 AC when you are in the right mood.")
    r = analyze(c4, allow={sid: {"h": h, "reason": "DM decides", "expires": "2099-01-01"}}, today="2026-11-05")
    check("5a allowlist entry with hash -> allow", r[0]["status"] == "allow")
    r = analyze(c4, allow={sid: {"h": "deadbeef", "reason": "DM decides", "expires": "2099-01-01"}}, today="2026-11-05")
    check("5b allowlist entry with changed hash -> flagged (stale)", r[0]["status"] == "uncovered" and "stale" in r[0]["why"], r[0]["why"])
    r = analyze(c4, allow={sid: {"h": h, "reason": "DM decides", "expires": "2020-01-01"}}, today="2026-11-05")
    check("5c expired allowlist entry -> flagged", r[0]["status"] == "uncovered" and "expired" in r[0]["why"], r[0]["why"])
    # 6 inert sentence and level gate only
    c6 = synth("species", "S", "T", "You feel at home in the forest. At level 5 you are stronger in spirit.", [])
    r = analyze(c6)
    check("6 inert sentence and a level gate are not mechanical", all(x["status"] == "inert" for x in r), str([x["status"] for x in r]))
    cp = {"consume": {"duration": "1 hour"}, "toggle": {"id": "test-potion", "default": False}, "mv": {"fly": "speed"}}
    ca = atoms_from(cp, "GX.item|Test Potion")
    cr = analyze(synth("item", "dmg", "Test Potion", "You gain a Fly Speed equal to your Speed for 1 hour.", ca))[0]
    check("consumed duration explains the typed speed benefit", cr["status"] == "covered", cr["why"])
    cp.pop("mv")
    cr = analyze(synth("item", "dmg", "Test Potion", "You gain a Fly Speed equal to your Speed for 1 hour.", atoms_from(cp, "GX.item|Test Potion")))[0]
    check("consumed duration alone cannot grant speed", cr["status"] == "uncovered", cr["why"])

    for txt, absent in [
        ("You have Advantage on a Dexterity (Stealth) check if you move no more than half your Speed on the same turn.", "SPEED"),
        ("You have Advantage on saves against paralysis and effects that lower your Hit Point maximum.", "HP"),
        ("You have Advantage on Wisdom (Perception or Survival) checks to find or track a creature missing Hit Points.", "HP")]:
        check("qualified Advantage is not a stat grant: "+absent, absent not in classes(txt,"item"), str(classes(txt,"item")))
    check("real Speed grant beside Advantage is preserved", "SPEED" in classes("You have Advantage on Stealth checks and your Speed increases by 10 feet."), "SPEED preserved")
    check("real HP grant beside Advantage is preserved", "HP" in classes("You have Advantage on saves and your Hit Point maximum increases by 10."), "HP preserved")

    # 7 dice / DC / distance / duration conservation
    c7 = synth("item", "dmg", "Wand", "It deals 3d6 fire damage in a 20-foot radius for 10 minutes. DC 15 Dexterity save.", [Atom("DMG", {"3d6", "20", "10", "15"}, "d")])
    r = analyze(c7)
    check("7 dice, distance, duration explained by atoms -> covered; DC save sentence = info FORM:ROLL", r[0]["status"] == "covered" and r[1]["why"] == "FORM:ROLL", str([(x["status"], x["why"]) for x in r]))
    c7c = synth("class", "C", "F", "Your spell save DC increases by 1.", [])
    r = analyze(c7c)
    check("7c a DC bonus sentence is not excused as a roll -> flagged", r[0]["status"] == "uncovered" and "DC" in r[0]["why"], r[0]["why"])
    c7b = synth("item", "dmg", "Wand", "It deals 3d6 fire damage in a 20-foot radius for 10 minutes.", [Atom("DMG", {"2d6", "20", "10"}, "d")])
    r = analyze(c7b)
    check("7b dice 3d6 vs record 2d6 -> flagged", r[0]["status"] == "uncovered" and "3d6" in r[0]["unexplained"], r[0]["why"])
    # 7d charges pool [max, regain, reset] (uncovered-1): the max and the regain are two amounts, a sentence that names both uses both atoms, each atom serves ONE sentence
    pool = atoms_from({"ch": [10, "1d6+4", "dawn"]}, "item.ex|Staff")
    c7d = synth("item", "dmg", "Staff", "The staff has 10 charges and regains 1d6 + 4 expended charges daily at dawn. If you expend the last charge, roll a d20.", pool)
    r = analyze(c7d)
    check("7d pool: one sentence names the max and the regain -> covered", r[0]["status"] == "covered", r[0]["why"])
    check("7d pool: the last-charge d20 roll is a table roll -> info ROLL:LAST_CHARGE", r[1]["status"] == "info" and r[1]["why"] == "ROLL:LAST_CHARGE", r[1]["why"])
    r = analyze(synth("item", "dmg", "Staff", "If you expend the last charge, roll a d20.", []))
    check("7d NEG no charges record: the last-charge roll stays flagged", r[0]["status"] == "uncovered", r[0]["why"])
    r = analyze(synth("item", "dmg", "Staff", "Add a d20 to the damage per charge the staff holds.", pool))
    check("7d NEG a d20 roll that is not about the last charge stays flagged", r[0]["status"] == "uncovered", r[0]["why"])
    c7e = synth("item", "dmg", "Staff", "The staff has 10 charges. It regains 1d6 + 4 charges at dawn. Another property says the staff has 12 charges.", pool)
    r = analyze(c7e)
    check("7e pool: max and regain in separate sentences -> both covered, a third amount (12) flagged", [x["status"] for x in r] == ["covered", "covered", "uncovered"], str([x["status"] for x in r]))
    c7f = synth("item", "dmg", "Staff", "The staff has 10 charges. The staff has 10 charges and uses 1 charge for each spell.", pool)
    r = analyze(c7f)
    check("7f pool: the max restated in a later sentence explains the number 10, the unrelated 1 stays flagged", r[0]["status"] == "covered" and r[1]["status"] == "uncovered" and r[1]["unexplained"] == ["1"], str([(x["status"], x["why"]) for x in r]))
    c7g = synth("item", "dmg", "Staff", "The staff has 8 charges.", pool)
    r = analyze(c7g)
    check("7g pool: 8 charges against a record of 10 -> flagged", r[0]["status"] == "uncovered" and r[0]["unexplained"] == ["8"], r[0]["why"])
    # uncovered-1 reason codes: each has a positive sentence and a similar sentence with another meaning that must stay flagged
    one = lambda text, atoms=(), kind="sub": analyze(synth(kind, "Owner", "Feature", text, list(atoms)))[0]
    r = one("When you hit with an Opportunity Attack, you can move up to half your Speed without provoking Opportunity Attacks.")
    check("10a MOVE:SPEED_REF: a move measured in Speed", r["status"] == "info" and r["why"] == "MOVE:SPEED_REF", r["why"])
    r = one("Your Speed increases by 10 feet while you move up to your Speed.")
    check("10b NEG a Speed increase is not a move", r["status"] == "uncovered", r["why"])
    r = one("You gain a Fly Speed equal to your Speed and can move up to half your Speed.")
    check("10c NEG a granted Fly Speed stays flagged", r["status"] == "uncovered", r["why"])
    r = one("If the attack hits, that creature's Speed becomes 0 until the end of the turn.")
    check("10d TARGET:SPEED: Speed of the target", r["status"] == "info" and r["why"] == "TARGET:SPEED", r["why"])
    r = one("Using it also drops your Speed to 0 for the rest of the current turn.")
    check("10e NEG own Speed drop stays flagged", r["status"] == "uncovered", r["why"])
    r = one("That creature's Speed drops by 10 ft and yours rises by 10 ft.")
    check("10f NEG a sentence that also raises your own Speed is not excused by TARGET:SPEED", r["why"] != "TARGET:SPEED", r["why"])
    r = one("You learn whether it has any Immunities, Resistances, or Vulnerabilities.")
    check("10g KNOW:TARGET_DEFENSES", r["status"] == "info" and r["why"] == "KNOW:TARGET_DEFENSES", r["why"])
    r = one("You have Resistance to the damage types you learn about.")
    check("10h NEG own Resistance stays flagged", r["status"] == "uncovered", r["why"])
    pk = atoms_from({"pick": [{"l": 1, "k": "expertise", "n": 2}]}, "cls.Rogue")
    r = one("You gain Expertise in them. If you have Stealth, it is recommended.", pk, "class")
    check("10i STD:PICK_TEXT: Expertise text of a feature with an expertise pick", r["status"] == "info" and r["why"] == "STD:PICK_TEXT", r["why"])
    r = one("You gain Expertise in them. If you have Stealth, it is recommended.", [], "class")
    check("10j NEG the same text without a pick record stays flagged", r["status"] == "uncovered", r["why"])
    r = one("You gain Expertise in them and a +5 bonus to those checks.", pk, "class")
    check("10k NEG an Expertise sentence with another number (+5) stays flagged", r["status"] == "uncovered", r["why"])
    r = one("A weapon you are proficient with can serve as a Spellcasting Focus for your Artificer spells.")
    check("10o FOCUS:SPELLCASTING: a weapon as the focus", r["status"] == "info" and r["why"] == "FOCUS:SPELLCASTING", r["why"])
    r = one("You gain proficiency with Martial weapons, and you can use a weapon you are proficient with as a Spellcasting Focus.")
    check("10p NEG a sentence that also grants proficiency stays flagged", r["status"] == "uncovered", r["why"])
    r = one("You can cast Raise Dead once without a spell slot if you use Tinker's Tools as your Spellcasting Focus.")
    check("10q NEG a spell cast without a slot stays flagged", r["status"] == "uncovered", r["why"])
    r = one("Raise your Intelligence by 1 (maximum 20).", [Atom("ABIL", set(), "feat.asi")], "feat")
    check("10u STD:ASI: the standard +1 and the cap 20", r["status"] == "info" and r["why"] == "STD:ASI", r["why"])
    r = one("Raise your Intelligence by 1 (maximum 25).", [Atom("ABIL", set(), "feat.asi")], "feat")
    check("10v NEG a cap of 25 is not the standard ASI rule", r["status"] == "uncovered", r["why"])
    r = one("Their charges form one pool that regains 1d6 per fragment at dawn.", [], "item")
    check("12d POOL:SHARED: charges of several copies form one pool", r["status"] == "info" and r["why"] == "POOL:SHARED", r["why"])
    r = one("Their charges form one pool that grants you a +2 bonus to AC.", [], "item")
    check("12e NEG a shared pool sentence that also gives AC stays flagged", r["status"] == "uncovered", r["why"])
    r = one("While Bloodied you regain 1d4 + Constitution modifier (minimum 1) Hit Points at the start of each turn.", [], "item")
    check("12f Bloodied regeneration is COND:PLAY_STATE, not a trigger", r["why"] == "COND:PLAY_STATE", r["why"])
    r = one("When you roll a 1 you regain 1d4 + Constitution modifier (minimum 1) Hit Points at the start of each turn.", [], "item")
    check("12g NEG regeneration without the Bloodied state keeps its old code", r["why"] != "COND:PLAY_STATE", r["why"])
    spend_record = {"atkSpendDice": [{"when": "Staff", "d": "1d6", "type": "Force", "maxCost": 3, "perCost": True, "resource": {"kind": "charges"}}]}
    spend_atoms = atoms_from(spend_record, "GX.item|Staff")
    check("12q resource damage exposes its executed dice and charge limit", any(a.cls == "DMG" and "1d6" in a.vals for a in spend_atoms) and any(a.cls == "RESOURCE" and "3" in a.vals for a in spend_atoms))
    check("12t paid damage has the validated minimum cost of one", any(a.cls == "RESOURCE" and "1" in a.vals for a in spend_atoms))
    check("12r NEG removing optional resource damage removes its atoms", not atoms_from({}, "GX.item|Staff"))
    check("12s NEG resource price is not a damage amount", all("3" not in a.vals for a in spend_atoms if a.cls == "DMG") and all("1d6" not in a.vals for a in spend_atoms if a.cls == "RESOURCE" and not a.src.endswith(".perCost")))
    per_charge_text = "When you hit with a melee attack using the staff, you can expend up to 3 of its charges. For each charge you expend, the target takes an extra 1d6 lightning damage."
    per_charge_rows = analyze(synth("item", "dmg", "Staff", per_charge_text, spend_atoms))
    check("12u executed per-charge formula explains its own dice sentence", per_charge_rows[-1]["status"] == "covered", per_charge_rows[-1]["why"])
    flat_spend = {"atkSpendDice": [dict(spend_record["atkSpendDice"][0], perCost=False)]}
    flat_rows = analyze(synth("item", "dmg", "Staff", per_charge_text, atoms_from(flat_spend, "GX.item|Staff")))
    check("12v NEG fixed dice do not declare per-charge scaling", flat_rows[-1]["status"] != "covered", flat_rows[-1]["why"])
    cinnabar_text = "When you hit, spend 1 or more charges to deal an extra 1d6 Poison per charge."
    cinnabar_row = analyze(synth("item", "dmg", "Staff", cinnabar_text, spend_atoms))[0]
    check("12w computed scaling supports a resource-only dice clause", cinnabar_row["status"] == "covered", cinnabar_row["why"])
    formula_atoms = [a for a in spend_atoms if a.src.endswith(".perCost")]
    check("12x NEG scaling formula cannot explain a condition duration", formula_atoms and all(not a.rx.search("for each charge, the creature is stunned for 1 minute") for a in formula_atoms))
    check("12y scaling formula retains its real effect owner", all(atom_key(a.src) == "GX.item|Staff" for a in formula_atoms))
    scalar_bonus = atoms_from({"n":"Staff", "atkBonus": [{"when": "Staff", "atk": 2, "dmg": 1}]}, "GX.item|Staff")
    check("12z attack bonus damage is its own executed scalar", any(a.cls == "DMG" and a.vals == {"1"} for a in scalar_bonus) and all("2" not in a.vals for a in scalar_bonus if a.cls == "DMG"))
    for label, payload in [("attack only", {"atk": 2}), ("critical only", {"crit": 18}), ("advisory", {"note": "extra 1d4 Thunder"}), ("unsupported dice value", {"dmg": "1d4"}), ("boolean", {"dmg": True}), ("zero", {"dmg": 0})]:
        check("12za NEG " + label + " grants no scalar damage", not any(a.cls == "DMG" for a in atoms_from({"n":"Staff", "atkBonus": [dict(payload, when="Staff")]}, "GX.item|Staff")))
    saucepan_atoms = atoms_from({"n":"Mace", "atkBonus": [{"when": "Mace", "atk": 1, "dmg": 1}], "atkDice": [{"when": "Mace", "d": "1d4", "t": "Thunder", "roll": True}]}, "GX.item|Mace")
    saucepan_row = analyze(synth("item", "dmg", "Mace", "It works as a Mace with +1 to attack and damage rolls and deals an extra 1d4 Thunder to a target in metal armor or made of metal or stone.", saucepan_atoms))[0]
    check("12zb executed scalar and dice explain their compound clause", saucepan_row["status"] == "covered", saucepan_row["why"])
    check("12zc damage component retains its real owner", all(atom_key(a.src) == "GX.item|Staff" for a in scalar_bonus))
    targeted_text = "+3 to attack and damage rolls, +2d6 damage against Dragons, and you know Draconic. If the breath dealt damage, the first hit you land deals 6d6 of the breath's damage type, ignoring Resistance and Immunity."
    targeted_record = {"n":"Staff", "target":{"types":["Dragon"]}, "atkDice":[{"when":"Staff","d":"2d6","typeFrom":"weapon","roll":True}]}
    targeted_base = atoms_from({"dmg":3},"item.fx|Staff")
    targeted_rows = analyze(synth("item","dmg","Staff",targeted_text,targeted_base+atoms_from(targeted_record,"GX.item|Staff")))
    check("12zk typed weapon rider stays with its target-and-dice clause", targeted_rows[0]["status"] == "covered", targeted_rows[0]["why"])
    check("12zl NEG typed rider cannot fund unrelated breath dice", targeted_rows[1]["status"] != "covered", targeted_rows[1]["why"])
    legacy_targeted = dict(targeted_record,atkDice=[dict(targeted_record["atkDice"][0],d="3d6")])
    legacy_target_text = "When you hit a dragon with this weapon, the dragon takes an extra 3d6 damage of the weapon's type."
    legacy_target_row = analyze(synth("item","dmg","Staff",legacy_target_text,atoms_from(legacy_targeted,"GX.item|Staff")))[0]
    check("12zl1 native legacy Dragon hit retains actual same-weapon damage", legacy_target_row["status"] == "covered", legacy_target_row["why"])
    legacy_wrong_dice = analyze(synth("item","dmg","Staff",legacy_target_text.replace("3d6","6d6"),atoms_from(legacy_targeted,"GX.item|Staff")))[0]
    check("12zl2 NEG legacy phrase still requires its actual dice", legacy_wrong_dice["status"] != "covered", legacy_wrong_dice["why"])
    for label, patch in [("wrong dice",{"d":"3d6"}), ("wrong type reference",{"typeFrom":"invalid"}), ("two type sources",{"t":"Fire"}), ("not rolled",{"roll":False}), ("other weapon",{"when":"Other"})]:
        altered = dict(targeted_record,atkDice=[dict(targeted_record["atkDice"][0],**patch)])
        altered_row = analyze(synth("item","dmg","Staff",targeted_text,targeted_base+atoms_from(altered,"GX.item|Staff")))[0]
        check("12zm NEG targeted rider "+label, altered_row["status"] != "covered", altered_row["why"])
    other_target = dict(targeted_record,target={"types":["Undead"]})
    other_row = analyze(synth("item","dmg","Staff",targeted_text,targeted_base+atoms_from(other_target,"GX.item|Staff")))[0]
    check("12zn NEG typed target must match the rule clause", other_row["status"] != "covered", other_row["why"])
    check("12zo target rider retains actual source attribution", all(atom_key(a.src)=="GX.item|Staff" for a in atoms_from(targeted_record,"GX.item|Staff")))
    for text in ["You add 2d6 to attack rolls against Dragons.", "You deal 2d6 damage to yourself when a Dragon attacks you.", "Your spell deals an extra 2d6 damage to Dragons.", "You add 2d6 damage against Dragons with any weapon."]:
        unrelated = analyze(synth("item","dmg","Staff",text,targeted_base+atoms_from(targeted_record,"GX.item|Staff")))[0]
        check("12zp NEG target rider does not prove unrelated mechanics", unrelated["status"] != "covered", unrelated["why"])
    for when in ["melee", "any", "Other weapon", ["Staff", "melee"]]:
        check("12zd NEG unrelated/generic attack groups gain no named damage", not any(a.cls == "DMG" for a in atoms_from({"n":"Staff", "atkBonus":[{"when":when,"dmg":2}]}, "GX.item|Staff")))
    hp_hit = {"n":"Coat", "ch":[3,"1d3","dawn"], "target":{"creature":True,"missingHp":True}, "atkSpendDice":[{"when":"any","d":"1d10","type":"Fire","maxCost":1,"resource":{"kind":"charges"},"attackKind":"melee"}]}
    hp_hit_text = "It has 3 charges, and when you hit with a melee attack against a creature below its Hit Point maximum you can spend 1 to deal an extra 1d10 Fire damage."
    hp_hit_atoms = atoms_from(hp_hit,"GX.item|Coat")
    hp_hit_row = analyze(synth("item","dmg","Coat",hp_hit_text,hp_hit_atoms))[0]
    check("12ze computed target HP comparison and paid hit cover the clause", hp_hit_row["status"] == "covered", hp_hit_row["why"])
    hp_missing = dict(hp_hit,target={"creature":True})
    hp_missing_row = analyze(synth("item","dmg","Coat",hp_hit_text,atoms_from(hp_missing,"GX.item|Coat")))[0]
    check("12zf NEG no HP predicate means no HP comparison coverage", hp_missing_row["status"] != "covered", hp_missing_row["why"])
    hp_benefit_text = hp_hit_text[:-1] + " and regain 1 Hit Point."
    hp_benefit_row = analyze(synth("item","dmg","Coat",hp_benefit_text,hp_hit_atoms))[0]
    check("12zg NEG comparison cannot claim an HP recovery", hp_benefit_row["status"] != "covered", hp_benefit_row["why"])
    hp_max_text = hp_hit_text[:-1] + " and increase your Hit Point maximum by 1."
    hp_max_row = analyze(synth("item","dmg","Coat",hp_max_text,hp_hit_atoms))[0]
    check("12zh NEG comparison cannot claim maximum HP", hp_max_row["status"] != "covered", hp_max_row["why"])
    check("12zi comparison retains real source attribution", all(atom_key(a.src)=="GX.item|Coat" for a in hp_hit_atoms if a.cls=="HP"))
    check("12zj NEG target-only metadata grants no paid-hit HP atom", not any(a.cls=="HP" for a in atoms_from({"target":{"missingHp":True}},"GX.item|Coat")))
    repair_record = {"n":"Forge", "itemState":"attuned", "spells":[[1,"Mending"]], "objectRepair":[{"spell":"Mending", "maxBreakFeet":5}]}
    anvil_record = {"advOn":["Smith's Tools checks to craft or repair an object using the hammer head as the anvil"]}
    repair_text = "You know Mending while attuned, and it can repair a break or tear of up to 5 ft. You have Advantage on Smith's Tools checks to craft or repair an object using the hammer head as the anvil."
    anvil_atoms = atoms_from(anvil_record, "GX.item|Forge")
    def repair_row(record, text=repair_text, with_anvil=True):
        return analyze(synth("item", "dmg", "Forge", text, atoms_from(record,"GX.item|Forge") + (anvil_atoms if with_anvil else [])))[0]
    check("U32 computed repair limit and separate anvil Advantage cover compound", repair_row(repair_record)["status"] == "covered")
    check("U32 numeric equivalent cap keeps runtime limit", repair_row(dict(repair_record,objectRepair=[{"spell":"Mending","maxBreakFeet":5.0}]))["status"] == "covered")
    check("U32 native minimum prevents a false fractional repair cap", repair_row(dict(repair_record,objectRepair=[{"spell":"Mending","maxBreakFeet":0.5}]),repair_text.replace("5 ft.","0.5 ft."))["status"] != "covered")
    check("U32 NEG repair does not grant anvil Advantage", repair_row(repair_record,with_anvil=False)["status"] != "covered")
    invalid_repairs = [
        ("missing override", {k:v for k,v in repair_record.items() if k!="objectRepair"}),
        ("missing grant", {k:v for k,v in repair_record.items() if k!="spells"}),
        ("wrong grant", dict(repair_record,spells=[[1,"Light"]])),
        ("wrong spell", dict(repair_record,objectRepair=[{"spell":"Light","maxBreakFeet":5}])),
        ("wrong cap", dict(repair_record,objectRepair=[{"spell":"Mending","maxBreakFeet":4}])),
        ("unknown schema field", dict(repair_record,objectRepair=[{"spell":"Mending","maxBreakFeet":5,"other":True}])),
        ("boolean cap", dict(repair_record,objectRepair=[{"spell":"Mending","maxBreakFeet":True}])),
        ("string cap", dict(repair_record,objectRepair=[{"spell":"Mending","maxBreakFeet":"5"}])),
        ("nonfinite cap", dict(repair_record,objectRepair=[{"spell":"Mending","maxBreakFeet":float("inf")}])),
        ("beyond runtime number range", dict(repair_record,objectRepair=[{"spell":"Mending","maxBreakFeet":10**400}])),
        ("wrong itemState", dict(repair_record,itemState="wielded")),
        ("missing itemState", {k:v for k,v in repair_record.items() if k!="itemState"}),
        ("different owner", dict(repair_record,n="Other item")),
    ]
    for label, record in invalid_repairs:
        check("U32 NEG "+label+" cannot cover repair cap", repair_row(record)["status"] != "covered")
    for label, text in [("unrelated Advantage distance", "You have Advantage on checks within 5 feet."), ("unrelated distance", "The item reaches 5 feet."), ("other spell",repair_text.replace("Mending","Light")), ("other Advantage",repair_text.replace("Smith's Tools checks to craft or repair an object using the hammer head as the anvil", "all attack rolls"))]:
        check("U32 NEG repair limit cannot fund "+label, repair_row(repair_record,text)["status"] != "covered")
    repair_atoms = atoms_from(repair_record,"GX.item|Forge")
    check("U32 repair numeric atom preserves actual source", all(atom_key(a.src)=="GX.item|Forge" for a in repair_atoms if a.src.endswith(".objectRepair")))
    critical_record = {"dieReplace": [{"when": "Scourge", "d": "3d4", "critD": "3d6"}]}
    critical_atoms = atoms_from(critical_record, "GX.item|Scourge")
    critical_text = "The weapon deals 3d4 Slashing damage. On a critical hit, it deals 3d6 Slashing damage instead."
    critical_rows = analyze(synth("item", "dmg", "Scourge", critical_text, critical_atoms))
    check("12n normal and critical replacement have independent amounts", all(r["status"] == "covered" for r in critical_rows), str([(r["status"], r["why"]) for r in critical_rows]))
    face_text = "On a critical hit, its necrotic damage dice become a d6 instead of a d4."
    face_atoms = atoms_from({"atkDice": [{"when": "Scourge", "d": "4d4", "critD": "4d6", "t": "Necrotic", "roll": True}]}, "GX.item|Scourge")
    face_row = analyze(synth("item", "dmg", "Scourge", face_text, face_atoms))[0]
    check("12o explicit critical dice explains its literal face", face_row["status"] == "covered", face_row["why"])
    no_upgrade = atoms_from({"atkDice": [{"when": "Scourge", "d": "4d4", "t": "Necrotic", "roll": True}]}, "GX.item|Scourge")
    no_face = analyze(synth("item", "dmg", "Scourge", face_text, no_upgrade))[0]
    check("12p NEG normal dice do not imply an upgrade", no_face["status"] != "covered", no_face["why"])
    self_spec = {"when": "Scourge", "normal": "2d4", "critical": "2d6", "type": "Necrotic", "bypassDefenses": True}
    self_text = "Whenever an unattuned creature attacks with the weapon, it deals 2d4 necrotic damage, ignoring resistances and immunities, to them."
    self_atoms = atoms_from({"atkSelfDamage": [self_spec]}, "GX.item|Scourge")
    self_result = analyze(synth("item", "dmg", "Scourge", self_text, self_atoms))[0]
    check("12k attack self damage and explicit defense bypass are computed", self_result["status"] == "covered", self_result["why"])
    no_bypass = atoms_from({"atkSelfDamage": [dict(self_spec, bypassDefenses=False)]}, "GX.item|Scourge")
    check("12l NEG self damage without bypass grants no RES/IMM atom", not any(a.cls in ("RES", "IMM") for a in no_bypass))
    self_missing = analyze(synth("item", "dmg", "Scourge", self_text, []))[0]
    check("12m NEG removed self damage loses computed coverage", self_missing["status"] == "info" and self_missing["why"] == "ACTIVE:TRIGGER", self_missing["why"])
    check("12h metadata-only override retains row fx", item_effect_override({"atk": 3}, {"base": ["Mace"]}) == ({"atk": 3}, False, False), "metadata must not create FXO_NULL")
    check("12i explicit null override removes row fx", item_effect_override({"atk": 3}, {"fx": None}) == (None, True, True), "explicit null only")
    check("12j replacement effect overrides row fx", item_effect_override({"atk": 3}, {"fx": {"atk": 1}}) == ({"atk": 1}, True, False), "replacement fx")
    # 13 an FXO_NULL item (uncovered-2): with a replacement entry the entry is compared with the text; without one the whole item is info
    rp = Atom("*", {"*"}, "FXO_NULL_REPL")
    r = analyze(synth("item", "dmg", "Badge", "While wearing the badge, you gain a +2 bonus to AC.", [Atom("AC", {"2"}, "GX.item|Badge.acAdd"), rp]))[0]
    check("13a FXO_NULL item with a replacement entry that explains the sentence -> covered", r["status"] == "covered", r["why"])
    r = analyze(synth("item", "dmg", "Badge", "While wearing the badge, you gain a +3 bonus to AC.", [Atom("AC", {"2"}, "GX.item|Badge.acAdd"), rp]))[0]
    check("13b NEG replacement entry with another amount: info FXO_NULL, counted apart (fxo_repl)", r["status"] == "info" and r["why"] == "FXO_NULL" and r.get("fxo_repl") is True, r["why"])
    r = analyze(synth("item", "dmg", "Badge", "While wearing the badge, you gain a +3 bonus to AC.", [Atom("*", {"*"}, "FXO_NULL")]))[0]
    check("13c FXO_NULL item without a replacement: info FXO_NULL", r["status"] == "info" and r["why"] == "FXO_NULL" and not r.get("fxo_repl"), r["why"])
    ctxb = synth("item", "dmg", "Gem", "You gain a +2 bonus to AC.", [Atom("AC", {"2"}, "item.fx")])
    r = analyze(ctxb, {"item|dmg|Gem": True})[0]
    check("13d BY_DESIGN does not hide a sentence that a record explains", r["status"] == "covered", r["why"])
    r = analyze(dict(ctxb, atoms=[]), {"item|dmg|Gem": True})[0]
    check("13e BY_DESIGN keeps a sentence no record explains as info", r["status"] == "info" and r["why"] == "BY_DESIGN", r["why"])
    # 12 a SUB_GRANT row (uncovered-2) covers a plain "you gain proficiency with ..." sentence, nothing more
    ga = [Atom("PROF", set(), "sub.SUB_GRANT.weapons", True, rx=RX_GRANT_SENT)]
    r = one("You gain proficiency with Martial weapons and Medium armor.", ga, "sub")
    check("12a SUB_GRANT row covers a plain proficiency sentence", r["status"] == "covered", r["why"])
    r = one("You gain proficiency with Martial weapons and add your Dexterity modifier to their damage.", ga, "sub")
    check("12b NEG a proficiency sentence that also adds a modifier stays flagged", r["status"] == "uncovered", r["why"])
    r = one("You gain proficiency with Martial weapons if you lack it.", ga, "sub")
    check("12c NEG an 'if you lack it' clause stays flagged", r["status"] == "uncovered", r["why"])
    # 10r a feat's own fx dict (senses, res, cimm, exp ...) is a record (FEATS[n].fx, read by 09-logic-feats-and-choices.js)
    fa = atoms_from({"senses": [["Blindsight", 10, "Skulker"]]}, "feat.fx|Skulker")
    r = one("You gain Blindsight out to 10 feet.", fa, "feat")
    check("10r feat fx senses covers its sentence", r["status"] == "covered", r["why"])
    r = one("You gain Blindsight out to 30 feet.", fa, "feat")
    check("10s NEG the same sentence with 30 feet against a record of 10 stays flagged", r["status"] == "uncovered", r["why"])
    r = one("You gain Blindsight out to 10 feet.", [], "feat")
    check("10t NEG no fx record: flagged", r["status"] == "uncovered", r["why"])
    # 10l activation cost written "expend 1 of its charges" / "(Charge Cost 3)" is an activation (FORM:ACTIVATE), a stat gain is not excused by it
    r = analyze(synth("item", "dmg", "Wand", "While holding it, you can expend 1 of its charges and target a humanoid you can see within 30 feet of you.", pool))[0]
    check("10l FORM:ACTIVATE: expend 1 of its charges", r["status"] == "info" and r["why"] == "FORM:ACTIVATE", r["why"])
    r = analyze(synth("item", "dmg", "Wand", "Catnap (Charge Cost 3).", pool))[0]
    check("10m FORM:ACTIVATE: a spell line with a charge cost", r["status"] == "info" and r["why"] == "FORM:ACTIVATE", r["why"])
    r = analyze(synth("item", "dmg", "Wand", "You can expend 1 of its charges to gain a +2 bonus to AC.", pool))[0]
    check("10n NEG a charge spent for an AC bonus is not excused as an activation", r["status"] == "uncovered", r["why"])
    # 11 code atoms (tests/clause_gate_code.json): an entry with a live anchor covers its own sentence only; a vanished anchor drops the atom
    ent = dict(id="t", kind="class", owner="Barbarian", name="Fast Movement", lvl=5, cls=["SPEED"], vals=["10"], rx="speed is 10 feet higher", anchor=["src/builder/12f-logic-sheet-handlers-movement.js", 'id:"barbarian-5-fast-movement"'])
    CODE_NOTES.clear()
    ca = load_code_atoms([ent])["class|Barbarian|Fast Movement"][0][1]
    txt = "As long as you aren't wearing Heavy armor, your Speed is 10 feet higher. Your Speed is 10 feet higher again while you rage."
    r = analyze(synth("class", "Barbarian", "Fast Movement", txt, [ca]))
    check("11a code atom: covers the sentence its rx names", r[0]["status"] == "covered", r[0]["why"])
    check("11b code atom: the second Speed sentence is not covered by the same atom", r[1]["status"] == "uncovered", r[1]["why"])
    ent2 = dict(ent, anchor=ent["anchor"][:1] + ["id:\"this-rule-was-deleted\""])
    CODE_NOTES.clear()
    gone = load_code_atoms([ent2])
    check("11c code atom: an anchor that is no longer in the source drops the atom and says so", not gone and len(CODE_NOTES) == 1, str(CODE_NOTES))
    CODE_NOTES.clear()
    instrument = "It counts as a Musical Instrument you are proficient with and keeps its weapon stats."
    performance = "You gain Performance proficiency and add your Strength modifier (minimum +1) to Performance checks."
    bound = scope_atoms([Atom("PROF", {"1"}, "bonus")], {"bonus": "^"+re.escape(performance.lower())+"$"})
    br = analyze(synth("sub", "X", "Rocker", instrument+" "+performance, bound))
    check("11d scoped Performance record does not grant an Instrument Weapon", br[0]["status"] == "uncovered" and br[1]["status"] == "covered", str([x["status"] for x in br]))
    check("11e record scope cannot manufacture an atom", not scope_atoms([], {"bonus":".*"}), "empty remains empty")
    narrow = scope_atoms([Atom("PROF", set(), "bonus", rx=re.compile("^you gain proficiency in arcana\\.$"))], {"bonus":".*"})
    br = analyze(synth("sub", "X", "Y", "You gain proficiency in Performance.", narrow))[0]
    check("11f a new scope cannot broaden an existing restriction", br["status"] == "uncovered", br["why"])
    # Native tool forms grant source-owned checks, never a character-wide tool
    # proficiency. These CODE atoms require the actual guarded dice consumer.
    tool_entries = [e for e in json.load(open(CODE, encoding="utf-8"))["entries"] if e.get("id", "").startswith("u33-")]
    check("U33 eight exact native tool proficiency clauses", len(tool_entries) == 8)
    import importlib.util
    tool_case_spec = importlib.util.spec_from_file_location("clause_gate_tool_cases", os.path.join(ROOT,"tests","zero_miss_fx.py"))
    tool_cases = importlib.util.module_from_spec(tool_case_spec)
    tool_case_spec.loader.exec_module(tool_cases)
    tool_cases_by_name = {case["name"]:case for case in tool_cases.CASES}
    for entry in tool_entries:
        key = "item|%s|%s" % (entry["owner"],entry["name"])
        text = "Whatever form the tool takes, you have proficiency with it when you use it." if entry["name"] == "Manifold Tool" else "Whatever form the tool takes, you are proficient with it."
        loaded = load_code_atoms([entry])
        owned_atoms = [a for e,a in loaded.get(key,[])]
        row = analyze(synth("item",entry["owner"],entry["name"],text,owned_atoms))[0]
        check("U33 own exact proficiency "+entry["id"], row["status"] == "covered" and entry["cls"] == ["PROF"] and entry["vals"] == [], row["why"])
        case = tool_cases_by_name.get(entry["test"])
        check("U33 actual named capability fixture "+entry["id"], bool(case and case.get("expect")))
        gone = load_code_atoms([dict(entry,anchor=entry["anchor"][:1]+["missing-owned-tool-roll-consumer"])])
        missing_row = analyze(synth("item",entry["owner"],entry["name"],text,[]))[0]
        check("U33 NEG missing owned roll anchor "+entry["id"], not gone and missing_row["status"] == "uncovered")
        CODE_NOTES.clear()
        wrong_owner = [a for e,a in loaded.get("item|unrelated|"+entry["name"],[])]
        row = analyze(synth("item","unrelated",entry["name"],text,wrong_owner))[0]
        check("U33 NEG wrong native owner "+entry["id"], row["status"] == "uncovered")
        for label,other in [("global tools", "You gain proficiency with all Artisan's Tools."),("ordinary tool", "You gain proficiency with Smith's Tools."),("language", "Additional languages you know include Draconic."),("ability", "Your Strength score increases by 2."),("touch alone", "As a Magic action, you can touch the item and transform it into a type of Artisan's Tools of your choice.")]:
            rows = analyze(synth("item",entry["owner"],entry["name"],other,owned_atoms))
            check("U33 NEG "+label+" "+entry["id"], all(r["status"] != "covered" if label == "touch alone" else r["status"] == "uncovered" for r in rows))
    # Vehicle-only carpet clauses require an executable owned consumer and exact
    # native owner/sentence/literals; no actor flight or generic numeric grant.
    carpet_entries = [e for e in json.load(open(CODE, encoding="utf-8"))["entries"] if e.get("id", "").startswith("u34-")]
    check("U34 exact 26 native carpet clauses", len(carpet_entries) == 26)
    for entry in carpet_entries:
        key = "item|%s|%s" % (entry["owner"],entry["name"])
        loaded = load_code_atoms([entry])
        owned_atoms = [a for e,a in loaded.get(key,[])]
        generic = entry["name"] == "Carpet of Flying"
        sentence_index = int(entry["id"].rsplit("-",1)[1])
        profile = next((p for p in [(3,5,200,80),(4,6,400,60),(5,7,600,40),(6,9,800,30)] if entry["name"] == "Carpet of Flying, %s ft. × %s ft." % p[:2]), None)
        if sentence_index == 1:
            text = "By taking a Magic action and speaking the carpet's command word, you make the carpet hover and fly." if generic else "You can speak the carpet's command word as an action to make the carpet hover and fly."
            expected_vals = set()
        elif sentence_index == 3:
            text = "A %s ft. × %s ft. carpet can carry up to %s lb. at a fly speed of %s feet." % profile
            expected_vals = set(map(str,profile))
        else:
            text = "A carpet can bear as much as double its listed capacity, but while its load exceeds the normal capacity, its Fly Speed is halved." if generic else "A carpet can carry up to twice this weight, but it flies at half speed if it carries more than its normal capacity."
            expected_vals = {"double"} if generic else {"double","half"}
        check("U34 native literal values "+entry["id"], set(entry["vals"]) == expected_vals and entry.get("scopeValues") is True)
        row = analyze(synth("item",entry["owner"],entry["name"],text,owned_atoms))[0]
        check("U34 exact native vehicle "+entry["id"], row["status"] == "covered" and entry["cls"] == ["SPEED"], row["why"])
        case = tool_cases_by_name.get(entry["test"])
        check("U34 actual native fixture "+entry["id"], bool(case and case.get("expect")))
        gone = load_code_atoms([dict(entry,anchor=entry["anchor"][:1]+["missing-owned-carpet-consumer"])])
        check("U34 NEG missing consumer "+entry["id"], not gone and analyze(synth("item",entry["owner"],entry["name"],text,[]))[0]["status"] != "covered")
        CODE_NOTES.clear()
        wrong_owner = [a for e,a in loaded.get("item|unrelated|"+entry["name"],[])]
        check("U34 NEG wrong owner "+entry["id"], analyze(synth("item","unrelated",entry["name"],text,wrong_owner))[0]["status"] == "uncovered")
        for label,other in [("actor flight","You have a Fly Speed of 80 feet."),("unrelated distance","You can teleport 5 feet."),("wrong native action",text.replace("Magic action","Bonus Action").replace("as an action","as a Bonus Action")),("wrong size or literal",re.sub(r"\d+",lambda m:str(int(m.group())+1),text)),("wrong load fraction",text.replace("half speed","full speed").replace("halved","doubled"))]:
            if other == text: continue
            check("U34 NEG "+label+" "+entry["id"], all(r["status"] != "covered" for r in analyze(synth("item",entry["owner"],entry["name"],other,owned_atoms))))
    # Missing and explicit false preserve legacy behavior; malformed opt-ins
    # must fail closed rather than accidentally restoring global numeric lending.
    legacy_scope_entry = dict(carpet_entries[3], id="scope-values-compat", scopeValues=False)
    for scope_flag in (False, True):
        configured = dict(legacy_scope_entry, scopeValues=scope_flag)
        atom = next(a for pairs in load_code_atoms([configured]).values() for e,a in pairs)
        check("U34 scopeValues strict boolean "+repr(scope_flag), atom.scope_values is scope_flag)
    absent_flag = dict(legacy_scope_entry)
    absent_flag.pop("scopeValues")
    legacy_atom = next(a for pairs in load_code_atoms([absent_flag]).values() for e,a in pairs)
    check("U34 absent scopeValues preserves legacy default", legacy_atom.scope_values is False)
    for scope_flag in (None, "true", 1, [], {}):
        configured = dict(legacy_scope_entry, scopeValues=scope_flag)
        CODE_NOTES.clear()
        malformed = load_code_atoms([configured])
        check("U34 NEG malformed scopeValues drops with diagnostic "+repr(scope_flag), not malformed and any("scopeValues must be a boolean" in note for note in CODE_NOTES))
        for text in ("A 3 ft. × 5 ft. carpet can carry up to 200 lb. at a fly speed of 80 feet.","You can teleport 5 feet."):
            malformed_row = analyze(synth("item",configured["owner"],configured["name"],text,[]))[0]
            check("U34 NEG malformed scopeValues cannot explain "+repr(scope_flag)+text, malformed_row["status"] != "covered" if text.startswith("You can teleport") else malformed_row["status"] == "uncovered")
        CODE_NOTES.clear()
    # The native phrase "saving throw DCs" is caster DC, never actor SAVE.
    spell_bonus_entries = [e for e in json.load(open(CODE, encoding="utf-8"))["entries"] if e.get("id", "").startswith("u35-")]
    check("U35 six exact native class spell bonuses", len(spell_bonus_entries) == 6)
    for entry in spell_bonus_entries:
        potency = int(entry["name"][1])
        text = "While holding this tool, you gain a +%s bonus to the spell attack rolls and the saving throw DCs of your artificer spells." % potency
        key = "item|%s|%s" % (entry["owner"],entry["name"])
        loaded = load_code_atoms([entry])
        owned_atoms = [a for e,a in loaded.get(key,[])]
        row = analyze(synth("item",entry["owner"],entry["name"],text,owned_atoms))[0]
        check("U35 native computed spell bonus "+entry["id"], row["status"] == "covered" and entry["cls"] == ["ATK","SAVE"] and entry["vals"] == [str(potency)] and entry.get("scopeValues") is True, row["why"])
        case = tool_cases_by_name.get(entry["test"])
        check("U35 actual computed class-source fixture "+entry["id"], bool(case and case.get("expect")))
        check("U35 exact class channel and typed exhaustion consumer "+entry["id"], ["src/app/23e-ui-spells-dc.js",'return selectSpellSource(scAdj(C.spellcasting||{}),x,x&&cuK("s:"+x.n),{attackAdjustment:-spellExhaustion()})'] in entry["extraAnchors"])
        for anchor_index in range(1+len(entry["extraAnchors"])):
            damaged = dict(entry,extraAnchors=[list(pair) for pair in entry["extraAnchors"]])
            if anchor_index == 0: damaged["anchor"] = [entry["anchor"][0],"missing-spell-source-producer"]
            else: damaged["extraAnchors"][anchor_index-1][1] = "missing-class-scoped-spell-consumer"
            check("U35 NEG missing required anchor "+entry["id"]+str(anchor_index), not load_code_atoms([damaged]))
            CODE_NOTES.clear()
        for label,other in [("same ability wrong class",text.replace("artificer spells","wizard spells")),("wrong potency",text.replace("+"+str(potency),"+"+str(potency+1))),("actor saving throws","You gain a +%s bonus to saving throws." % potency),("weapon attacks","You gain a +%s bonus to attack and damage rolls made with this weapon." % potency),("unrelated distance","You can teleport %s feet." % potency)]:
            check("U35 NEG "+label+" "+entry["id"], all(r["status"] != "covered" for r in analyze(synth("item",entry["owner"],entry["name"],other,owned_atoms))))
        for other_key in ("item|unrelated|"+entry["name"],"item|"+entry["owner"]+"|Unrelated Tool"):
            wrong_atoms = [a for e,a in loaded.get(other_key,[])]
            check("U35 NEG wrong owner/item "+entry["id"]+other_key, analyze(synth("item",entry["owner"],entry["name"],text,wrong_atoms))[0]["status"] == "uncovered")
    for malformed in (None,False,"not-pairs",[[]],[["missing"]],[["file",""]]):
        CODE_NOTES.clear()
        check("U35 NEG malformed extraAnchors "+repr(malformed), not load_code_atoms([dict(spell_bonus_entries[0],extraAnchors=malformed)]) and any("extraAnchors must" in note for note in CODE_NOTES))
        CODE_NOTES.clear()
    # FXO spellCls is a class filter on numerical bonuses, not a grant or
    # cantrip choice. Genuine typed spells remain grant evidence separately.
    for owner in ("dmg","tce"):
        for potency in (1,2,3):
            name = "+%s All-Purpose Tool" % potency
            filter_atoms = atoms_from({"spellAtk":potency,"spellDc":potency,"spellCls":"Artificer"},"FXO|"+name)
            check("U35 spellCls creates no grant atom "+owner+name, {a.cls for a in filter_atoms} == {"ATK","DC"} and all(not a.src.endswith(".spellCls") for a in filter_atoms))
            for sentence_index,text in [(5,"Choose a cantrip that you don't know from any class list."),(6,"For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you.")]:
                result = analyze(synth("item",owner,name,text,filter_atoms))[0]
                check("U35 NEG borrowed native clause #"+str(sentence_index)+owner+name, result["status"] == "uncovered", result["why"])
            for filter_record in ({"spellCls":"Artificer"},{"spellCls":"Wizard"}, {"spellAtk":potency,"spellDc":potency,"spellCls":"Artificer"}):
                extracted = atoms_from(filter_record,"FXO|"+name)
                check("U35 NEG filter cannot grant spell or choice "+owner+name+str(filter_record), all(a.cls not in {"SPELL","CHOICE"} for a in extracted))
    genuine = atoms_from({"spellCls":"Artificer","spells":[[1,"Light"]]},"GX.item|Native Spell Item")
    check("U35 genuine typed spell grant retained", any(a.cls == "SPELL" and a.src.endswith(".spells") for a in genuine) and all(not a.src.endswith(".spellCls") for a in genuine))
    # U36 proofs are exercised before registration as well: a draft atom must
    # already require each real producer/consumer, never an INFO exception.
    temporary_anchors = [
        ["src/app/lib/temporary-cantrip-runtime.js", "function activate(token,declarations)"],
        ["src/app/lib/temporary-cantrip-runtime.js", "function advance(token,seconds)"],
        ["src/app/lib/temporary-cantrip-runtime.js", "function dawn(token,declaration)"],
        ["src/app/lib/temporary-cantrip-guard.js", "export function temporaryCantripStatus(row,state)"],
        ["src/app/32b-logic-play-concentration-casting.js", "function temporaryCastCurrent(view,index,spell)"],
    ]
    temporary_registered = [e for e in json.load(open(CODE, encoding="utf-8"))["entries"] if e.get("id", "").startswith("u36-")]
    temporary_expected = []
    for owner in ("dmg", "tce"):
        for potency in (1,2,3):
            for sentence_index,text,proof_classes,values in [
                (5,"Choose a cantrip that you don't know from any class list.",["CHOICE","SPELL"],[]),
                (6,"For 8 hours, you can cast that cantrip, and it counts as an artificer cantrip for you.",["SPELL"],["8"]),
            ]:
                name = "+%s All-Purpose Tool" % potency
                entry = dict(id="u36-%s-%s-temporary-cantrip-%s" % (owner,potency,sentence_index),kind="item",owner=owner,name=name,lvl=None,cls=proof_classes,vals=values,scopeValues=True,rx="^"+re.escape(text.lower())+"$",anchor=["src/builder/12k-logic-sheet-handlers-spells.js",'id:"spells-temporary-cantrips"'],extraAnchors=temporary_anchors,test="Z3 U36 temporary cantrip "+name+" 2014 elapsed 28799")
                temporary_expected.append(entry)
                loaded = load_code_atoms([entry]); key="item|%s|%s" % (owner,name)
                atoms = [atom for proof,atom in loaded.get(key,[])]
                row = analyze(synth("item",owner,name,text,atoms))[0]
                check("U36 exact native temporal proof "+entry["id"], row["status"] == "covered", row["why"])
                case = tool_cases_by_name.get(entry["test"])
                check("U36 computed eight-hour fixture "+entry["id"], bool(case and case.get("temporal",{}).get("elapsedSeconds")==28799 and case.get("expect")))
                for index in range(1+len(temporary_anchors)):
                    damaged=dict(entry,extraAnchors=[list(pair) for pair in temporary_anchors])
                    if index==0: damaged["anchor"]=[entry["anchor"][0],"missing-temporary-cantrip-producer"]
                    else: damaged["extraAnchors"][index-1][1]="missing-temporary-cantrip-consumer"
                    check("U36 NEG missing required anchor "+entry["id"]+str(index), not load_code_atoms([damaged]))
                    CODE_NOTES.clear()
                for label,other in [("wrong duration",text.replace("8 hours","9 hours")),("permanent knowledge",text.replace("can cast","know")),("known choice",text.replace("don't know","already know")),("wrong class",text.replace("artificer cantrip","wizard cantrip")),("unrelated distance","You can teleport 8 feet.")]:
                    if other != text:
                        check("U36 NEG "+label+entry["id"], all(result["status"] != "covered" for result in analyze(synth("item",owner,name,other,atoms))))
                for other_key in ("item|unrelated|"+name,"item|"+owner+"|Manifold Tool"):
                    wrong=[atom for proof,atom in loaded.get(other_key,[])]
                    check("U36 NEG wrong owner or item "+entry["id"]+other_key, analyze(synth("item",owner,name,text,wrong))[0]["status"]=="uncovered")
    check("U36 draft or exactly twelve registered clauses", len(temporary_registered) in (0,12))
    if temporary_registered:
        expected_by_id={entry["id"]:entry for entry in temporary_expected}
        for entry in temporary_registered:
            expected=expected_by_id.get(entry["id"])
            check("U36 registered exact source and consumers "+entry["id"], bool(expected and all(entry.get(key)==value for key,value in expected.items())))
    # U37 owns vehicle movement; the same speed numerals cannot prove actor flight.
    ridden_candidates=[
        ("dmg","Broom of Flying",3,"Its Fly Speed is 50 feet.",["50"]),
        ("dmg","Broom of Flying",4,"It can bear a load of up to 400 pounds, though while it carries more than 200 pounds its Fly Speed falls to 30 feet.",["400","200","30"]),
    ]
    for owner in ("dmg","wbtw"):
        ridden_candidates.extend([
            (owner,"Bobbing Lily Pad",3,"It has a walking, flying, and swimming speed of 20 feet, and it can hover.",["20"]),
            (owner,"Bobbing Lily Pad",6,"It can carry up to twice this weight, but it moves at half speed if it carries more than its normal capacity.",["half","double"]),
        ])
    ridden_expected=[]
    for owner,name,index,text,values in ridden_candidates:
        entry=dict(id="u37-"+owner+"-"+("broom" if name=="Broom of Flying" else "lily")+"-"+str(index),kind="item",owner=owner,name=name,lvl=None,cls=["SPEED"],vals=values,scopeValues=True,rx="^"+re.escape(text.lower())+"$",anchor=["src/app/lib/ridden-vehicle-runtime.js","const result=evaluateRiddenVehicle(row,facts,edition);"],extraAnchors=[["src/data/lib/ridden-vehicle.js","export function evaluateRiddenVehicle(row,declarations,edition="]],test="Z3 U37 native ridden vehicle "+name+" 2024")
        ridden_expected.append(entry);loaded=load_code_atoms([entry]);key="item|%s|%s" % (owner,name);atoms=[atom for proof,atom in loaded.get(key,[])]
        row=analyze(synth("item",owner,name,text,atoms))[0]
        check("U37 native vehicle-only clause "+entry["id"],row["status"]=="covered",row["why"])
        case=tool_cases_by_name.get(entry["test"])
        check("U37 actual derived native-profile fixture "+entry["id"],bool(case and case.get("expect")))
        for anchor_index in (0,1):
            damaged=dict(entry,extraAnchors=[list(pair) for pair in entry["extraAnchors"]])
            if anchor_index==0:damaged["anchor"]=[entry["anchor"][0],"missing-ridden-vehicle-consumer"]
            else:damaged["extraAnchors"][0][1]="missing-native-load-evaluator"
            check("U37 NEG missing actual consumer "+entry["id"]+str(anchor_index),not load_code_atoms([damaged]));CODE_NOTES.clear()
        for other in ["You gain a Fly Speed of 50 feet.","You can teleport 20 feet.",text.replace("50","60").replace("400","500").replace("20 feet","30 feet").replace("half speed","full speed")]:
            if other!=text:check("U37 NEG unrelated or wrong native value "+entry["id"]+other,all(result["status"]!="covered" for result in analyze(synth("item",owner,name,other,atoms))))
        for wrong_key in ("item|unrelated|"+name,"item|"+owner+"|Ornithopter of Flying"):
            wrong=[atom for proof,atom in loaded.get(wrong_key,[])]
            check("U37 NEG wrong source "+entry["id"]+wrong_key,analyze(synth("item",owner,name,text,wrong))[0]["status"]=="uncovered")
    ridden_registered=[entry for entry in json.load(open(CODE,encoding="utf-8"))["entries"] if entry.get("id","").startswith("u37-")]
    check("U37 draft or exactly six registered clauses",len(ridden_registered) in (0,6))
    expected_ridden_by_id={entry["id"]:entry for entry in ridden_expected}
    for entry in ridden_registered:
        expected=expected_ridden_by_id.get(entry["id"])
        check("U37 registered exact vehicle source and consumers "+entry["id"],bool(expected and all(entry.get(key)==value for key,value in expected.items())))
    # U38 reconstructs every native milestone, including separately named Blood14.
    strike_rows=[]
    for domain,profile in tool_cases.U38_NATIVE.items():
        for level,title,feature in profile["milestones"]:
            for index,text in enumerate(split_sentences(feature),1):
                if re.search(r"\b\d+d\d+\b",text):strike_rows.append(("sub","Cleric/"+domain,title,level,index,text))
    cf_text=open(os.path.join(ROOT,"src","data","cffull-class-feature-text.js"),encoding="utf-8").read()
    cf_start=re.search(r"\bvar CF_FULL\s*=",cf_text)
    native_cf=json.JSONDecoder().raw_decode(cf_text[cf_start.end():])[0]
    for title,level in [("Blessed Strikes",7),("Improved Blessed Strikes",14)]:
        for index,text in enumerate(split_sentences(native_cf["Cleric|"+title]),1):
            if re.search(r"\b\d+d\d+\b",text):strike_rows.append(("class","Cleric",title,level,index,text))
    check("U38 all63 native damage milestones including Blood14",len(strike_rows)==63 and any(row[2]=="Divine Strike (14th Level)" for row in strike_rows))
    strike_anchors=[
        ["src/builder/12n-logic-sheet-handlers-turn-damage.js","ctx.C.divineStrike=options[0]"],
        ["src/app/lib/turn-damage-runtime.js","value.actor.S.sit=next.sit"],
        ["src/data/lib/turn-damage.js","export function commitTurnDamage(rule,sit,context,expectedGeneration)"],
        ["src/app/34-ui-situations.js","export function sitReset(kind){invalidateTurnDamageState(S);"],
        ["src/fx/16-z-pack-dice-sound-hover.js","FXENV.__miRoll.commitHook=1"],
    ]
    strike_expected=[]
    for kind,owner,title,level,index,text in strike_rows:
        sid="%s|%s|%s#%s" % (kind,owner,title,index)
        values=list(dict.fromkeys(re.findall(r"\b\d+d\d+\b",text.lower())));scaling=values==["2d8"]
        case=("Z3 U38 native Divine Strike "+owner.split("/",1)[1]+" level "+("14" if "2d8" in values else "8")) if kind=="sub" else "Z3 U38 selected current choice "+("14" if scaling else "7")+" "+json.dumps("Divine Strike")
        extra_strike_anchors=[list(pair) for pair in strike_anchors]
        if kind=="sub" and tool_cases.U38_NATIVE[owner.split("/",1)[1]]["sourceFile"].startswith("tp"):
            extra_strike_anchors.append(["src/builder/08-logic-2014-rules.js",'if(c14NativeSource(cn,x))return'])
        entry=dict(id="u38-"+re.sub("[^a-z0-9]+","-",sid.lower()).strip("-"),kind=kind,owner=owner,name=title,lvl=level,cls=["DMG"] if scaling else ["DMG","RESOURCE"],vals=values,scopeValues=True,rx="^"+re.escape(text.lower())+"$",anchor=["src/app/08f-ui-turn-damage.js","const result=turnDamageRuntime.request(view.context,facts,"],extraAnchors=extra_strike_anchors,test=case)
        strike_expected.append(entry);loaded=load_code_atoms([entry]);key="%s|%s|%s" % (kind,owner,title);atoms=[atom for proof,atom in loaded.get(key,[])]
        row=analyze(synth(kind,owner,title,text,atoms,lvl=level))[0]
        check("U38 exact source-owned damage proof "+entry["id"],row["status"]=="covered",row["why"])
        fixture=tool_cases_by_name.get(case)
        check("U38 computed source/level fixture "+entry["id"],bool(fixture and fixture.get("expect")))
        for anchor_index in range(1+len(extra_strike_anchors)):
            damaged=dict(entry,extraAnchors=[list(pair) for pair in extra_strike_anchors])
            if anchor_index==0:damaged["anchor"]=[entry["anchor"][0],"missing-conditional-hit-ui"]
            else:damaged["extraAnchors"][anchor_index-1][1]="missing-conditional-hit-producer-or-commit"
            check("U38 NEG missing actual producer/consumer "+entry["id"]+str(anchor_index),not load_code_atoms([damaged]));CODE_NOTES.clear()
        for other in ["You deal 1 damage.","You gain a +1 bonus to AC.","You can teleport 8 feet.",re.sub(r"\b[12]d8\b","3d8",text),"You deal an extra 1d8 damage on every attack."]:
            check("U38 NEG unrelated/version/wrong dice "+entry["id"]+other,all(result["status"]!="covered" for result in analyze(synth(kind,owner,title,other,atoms))))
        for wrong_key in [kind+"|Unrelated|"+title,kind+"|"+owner+"|Unrelated Strike"]:
            wrong=[atom for proof,atom in loaded.get(wrong_key,[])]
            check("U38 NEG wrong native source "+entry["id"]+wrong_key,all(result["status"]!="covered" for result in analyze(synth(kind,owner,title,text,wrong,lvl=level))))
    for profile in ["legacy","blessed"]:
        marker_atoms=atoms_from({"divineStrike":{"v":1,"profile":profile}},"GX.typed-strike")
        check("U38 selector/version alone grants no gate atoms "+profile,not marker_atoms)
    strike_registered=[entry for entry in json.load(open(CODE,encoding="utf-8"))["entries"] if entry.get("id","").startswith("u38-")]
    check("U38 draft or exactly63 registered native damage proofs",len(strike_registered) in (0,63))
    strike_by_id={entry["id"]:entry for entry in strike_expected}
    for entry in strike_registered:
        expected=strike_by_id.get(entry["id"])
        check("U38 registered exact source and conditional consumers "+entry["id"],bool(expected and all(entry.get(key)==value for key,value in expected.items())))
    # U39 names exact native outcomes, never the separate free-casting sentence.
    cleric_expected = [{'id': 'u39-class-cleric-divine-intervention-4',
      'kind': 'class',
      'owner': 'Cleric',
      'name': 'Divine Intervention',
      'lvl': 10,
      'cls': ['RESOURCE'],
      'vals': [],
      'scopeValues': True,
      'rx': '^after\\ you\\ use\\ this\\ feature,\\ you\\ must\\ finish\\ a\\ long\\ rest\\ before\\ you\\ can\\ use\\ it\\ '
            'again\\.$',
      'anchor': ['src/app/32f-logic-divine-intervention.js', 'export function interventionPaymentAllowed(key)'],
      'extraAnchors': [['src/builder/12o-logic-sheet-handlers-cleric-powers.js',
                        'function interventionCapability(ctx,source,indices)'],
                       ['src/app/19-ui-global-click-delegation.js', 'finishDivineInterventionRest(kind,interventionRest)']],
      'test': 'Z3 U39 native Intervention 2024 level 10'},
     {'id': 'u39-class-cleric-greater-divine-intervention-3',
      'kind': 'class',
      'owner': 'Cleric',
      'name': 'Greater Divine Intervention',
      'lvl': 20,
      'cls': ['RESOURCE'],
      'vals': ['2d4'],
      'scopeValues': True,
      'rx': '^if\\ you\\ do,\\ divine\\ intervention\\ becomes\\ unavailable\\ to\\ you\\ until\\ you\\ have\\ finished\\ 2d4\\ '
            'long\\ rests\\.$',
      'anchor': ['src/app/32f-logic-divine-intervention.js', 'export function requestWishIntervention(options)'],
      'extraAnchors': [['src/builder/12o-logic-sheet-handlers-cleric-powers.js',
                        'function interventionCapability(ctx,source,indices)'],
                       ['src/data/lib/cleric-maths.js', 'export function recordWishIntervention('],
                       ['src/data/lib/cleric-maths.js', 'export function completeInterventionLongRest('],
                       ['src/app/19-ui-global-click-delegation.js', 'finishDivineInterventionRest(kind,interventionRest)'],
                       ['src/app/32f-logic-divine-intervention.js', 'export function interventionPaymentAllowed(key)']],
      'test': 'Z3 U39 native Intervention 2024 level 20'},
     {'id': 'u39-sub-cleric-life-domain-supreme-healing-3',
      'kind': 'sub',
      'owner': 'Cleric/Life Domain',
      'name': 'Supreme Healing',
      'lvl': 17,
      'cls': ['HP'],
      'vals': ['2d6', '12'],
      'scopeValues': True,
      'rx': '^for\\ example,\\ a\\ spell\\ that\\ would\\ restore\\ 2d6\\ hit\\ points\\ to\\ a\\ creature\\ restores\\ 12\\ '
            'instead\\.$',
      'anchor': ['src/app/lib/supreme-healing-runtime.js', 'function request(token,facts,onResult)'],
      'extraAnchors': [['src/builder/12o-logic-sheet-handlers-cleric-powers.js', 'function supremeCapability(source)'],
                       ['src/data/lib/cleric-maths.js', 'export function evaluateSupremeHealing(rule,packet,facts)'],
                       ['src/app/lib/supreme-healing-runtime.js', 'evaluateSupremeHealing(value.rule,packet,']],
      'test': 'Z3 U39 Supreme native Life Domain 2024 level 17'},
     {'id': 'u39-sub-cleric-life-domain-2014-supreme-healing-2',
      'kind': 'sub',
      'owner': 'Cleric/Life Domain (2014)',
      'name': 'Supreme Healing',
      'lvl': 17,
      'cls': ['HP'],
      'vals': ['2d6', '12'],
      'scopeValues': True,
      'rx': '^for\\ example,\\ 2d6\\ restores\\ 12\\.$',
      'anchor': ['src/app/lib/supreme-healing-runtime.js', 'function request(token,facts,onResult)'],
      'extraAnchors': [['src/builder/12o-logic-sheet-handlers-cleric-powers.js', 'function supremeCapability(source)'],
                       ['src/data/lib/cleric-maths.js', 'export function evaluateSupremeHealing(rule,packet,facts)'],
                       ['src/app/lib/supreme-healing-runtime.js', 'evaluateSupremeHealing(value.rule,packet,']],
      'test': 'Z3 U39 Supreme native Life Domain (2014) 2014 level 17'},
     {'id': 'u39-sub-cleric-order-domain-order-s-wrath-2',
      'kind': 'sub',
      'owner': 'Cleric/Order Domain',
      'name': "Order's Wrath",
      'lvl': 17,
      'cls': ['DMG', 'RESOURCE'],
      'vals': ['2d8'],
      'scopeValues': True,
      'rx': '^the\\ next\\ time\\ an\\ ally\\ hits\\ the\\ cursed\\ creature,\\ it\\ takes\\ an\\ extra\\ 2d8\\ psychic\\ damage\\ '
            'and\\ the\\ curse\\ ends\\.$',
      'anchor': ['src/app/lib/orders-wrath-runtime.js', 'function resolveDamage(token,eventId,onResult)'],
      'extraAnchors': [['src/builder/12o-logic-sheet-handlers-cleric-powers.js',
                        'const profile=ordersWrathProfile(order);if(profile)ctx.C.ordersWrath=profile'],
                       ['src/data/lib/orders-wrath.js', 'export function createOrdersWrathCurse('],
                       ['src/data/lib/orders-wrath.js', 'export function startOrdersWrathOwnTurn('],
                       ['src/data/lib/orders-wrath.js', 'export function recordOrdersWrathAllyHit('],
                       ['src/data/lib/orders-wrath.js', 'export function resolveOrdersWrathDamage('],
                       ['src/app/lib/orders-wrath-runtime.js', 'function recordAllyHit(token,facts)']],
      'test': 'Z3 U39 native Order curse 2014 level 17'}]
    sub_text=open(os.path.join(ROOT,"src","data","subfull-subclass-feature-text.js"),encoding="utf-8").read()
    sub_start=re.search(r"\bvar SUB_FULL\s*=",sub_text)
    native_sub=json.JSONDecoder().raw_decode(sub_text[sub_start.end():])[0]
    old_sub_text=open(os.path.join(ROOT,"src","data","wotc09-subclasses-2014.js"),encoding="utf-8").read()
    old_cleric={}
    for match in re.finditer(r'\{"cls":"Cleric","name":"(?:Life Domain \(2014\)|Order Domain)"',old_sub_text):
        record=json.JSONDecoder().raw_decode(old_sub_text[match.start():])[0]
        old_cleric.update(record.get("full",{}))
    cleric_native={
        "u39-class-cleric-divine-intervention-4":(native_cf["Cleric|Divine Intervention"],4,10),
        "u39-class-cleric-greater-divine-intervention-3":(native_cf["Cleric|Greater Divine Intervention"],3,20),
        "u39-sub-cleric-life-domain-supreme-healing-3":(native_sub["Life Domain|Supreme Healing"],3,17),
        "u39-sub-cleric-life-domain-2014-supreme-healing-2":(old_cleric["Life Domain (2014)|Supreme Healing"],2,17),
        "u39-sub-cleric-order-domain-order-s-wrath-2":(old_cleric["Order Domain|Order's Wrath"],2,17),
    }
    for entry in cleric_expected:
        full,index,level=cleric_native[entry["id"]];text=split_sentences(full)[index-1]
        check("U39 exact native full sentence and level "+entry["id"],entry["rx"]=="^"+re.escape(text.lower())+"$" and entry["lvl"]==level)
        loaded=load_code_atoms([entry]);key="%s|%s|%s"%(entry["kind"],entry["owner"],entry["name"])
        atoms=[atom for proof,atom in loaded.get(key,[])]
        row=analyze(synth(entry["kind"],entry["owner"],entry["name"],text,atoms,lvl=level))[0]
        check("U39 native computed outcome "+entry["id"],row["status"]=="covered",row["why"])
        fixture=tool_cases_by_name.get(entry["test"])
        check("U39 actual source-level differential fixture "+entry["id"],bool(fixture and fixture.get("expect")))
        for anchor_index in range(1+len(entry["extraAnchors"])):
            damaged=dict(entry,extraAnchors=[list(pair) for pair in entry["extraAnchors"]])
            if anchor_index==0:damaged["anchor"]=[entry["anchor"][0],"missing-cleric-native-consumer"]
            else:damaged["extraAnchors"][anchor_index-1][1]="missing-cleric-native-producer-or-transaction"
            check("U39 NEG missing actual producer/consumer "+entry["id"]+str(anchor_index),not load_code_atoms([damaged]));CODE_NOTES.clear()
        mutated=re.sub(r"\b2d[468]\b","3d10",text)
        if mutated==text:mutated=text.replace("a Long Rest","two Long Rests")
        for other in ["You gain a +1 bonus to AC.","You deal an extra 1d8 damage on every attack.","You restore 99 Hit Points.",mutated]:
            check("U39 NEG unrelated or changed outcome "+entry["id"]+other,all(result["status"]!="covered" for result in analyze(synth(entry["kind"],entry["owner"],entry["name"],other,atoms,lvl=level))))
        for wrong_key in [entry["kind"]+"|Unrelated|"+entry["name"],entry["kind"]+"|"+entry["owner"]+"|Unrelated Cleric Power"]:
            check("U39 NEG wrong native source "+entry["id"]+wrong_key,not loaded.get(wrong_key))
        freecasting=split_sentences(native_cf["Cleric|Divine Intervention"])[2]
        check("U39 NEG cooldown/healing/curse cannot prove freecasting "+entry["id"],all(result["status"]!="covered" for result in analyze(synth(entry["kind"],entry["owner"],entry["name"],freecasting,atoms,lvl=level))))
    for profile in ["supreme-healing","divine-spark-heal","divine-intervention","orders-wrath"]:
        for version in [1,2]:
            check("U39 selector/version grants no gate atoms "+profile+str(version),not atoms_from({"clericPower":{"v":version,"profile":profile}},"GX.typed-cleric"))
    cleric_registered=[entry for entry in json.load(open(CODE,encoding="utf-8"))["entries"] if entry.get("id","").startswith("u39-")]
    check("U39 draft or exactly5 registered native outcome proofs",len(cleric_registered) in (0,5))
    cleric_by_id={entry["id"]:entry for entry in cleric_expected}
    for entry in cleric_registered:
        expected=cleric_by_id.get(entry["id"])
        check("U39 registered exact native source and consumers "+entry["id"],bool(expected and all(entry.get(key)==value for key,value in expected.items())))
    # U40 body permissions are exact native item sources, never learned spells.
    tattoo_text=open(os.path.join(ROOT,"src","data","wotc11-magic-items-2014.js"),encoding="utf-8").read()
    tattoo_start=re.search(r"\bvar R\s*=",tattoo_text)
    native_tattoo=json.JSONDecoder().raw_decode(tattoo_text[tattoo_start.end():])[0]
    tattoo_rows=[row for row in native_tattoo["tce"] if row[0].startswith("Spellwrought Tattoo (")]
    check("U40 exactly six native physical profiles",len(tattoo_rows)==6)
    tattoo_groups = {4: {'anchor': ['src/app/32g-logic-spellwrought-tattoo.js', 'export function completeTattooCast(options)'],
         'extraAnchors': [['src/builder/25a-logic-tattoo-sources.js',
                           'function commitTattooPlan(owner,current,plan,body,beforeCommit,result)'],
                          ['src/data/lib/spellwrought-tattoo.js', 'export function applySpellwroughtTattoo('],
                          ['src/data/lib/tattoo-projection.js', 'export function tattooOwnedSpellRow('],
                          ['src/data/lib/spellwrought-tattoo.js', 'export function tattooCastPermission('],
                          ['src/app/lib/spellwrought-tattoo-runtime.js', 'function complete(token,declarations)'],
                          ['src/data/lib/spellwrought-tattoo.js', "x&&x!=='M'"]],
         'cls': ['SPELL'],
         'test': 'tests/spellwrought_tattoo_model.mjs'},
     5: {'anchor': ['src/app/08k-ui-spellwrought-body.js', 'function tattooBodyStateText(record)'],
         'extraAnchors': [['src/builder/25a-logic-tattoo-sources.js',
                           'function commitTattooPlan(owner,current,plan,body,beforeCommit,result)'],
                          ['src/data/lib/spellwrought-tattoo.js', 'export function applySpellwroughtTattoo('],
                          ['src/data/lib/tattoo-projection.js', 'export function tattooOwnedSpellRow('],
                          ['src/data/lib/spellwrought-tattoo.js', 'export function beginTattooCasting('],
                          ['src/data/lib/spellwrought-tattoo.js', 'export function completeTattooCasting('],
                          ['src/data/lib/spellwrought-tattoo.js', 'export function endTattooEffect('],
                          ['src/data/lib/spellwrought-tattoo.js', "glowing:grant.phase==='casting'||grant.phase==='active'"],
                          ['src/app/lib/spellwrought-tattoo-runtime.js', 'function end(token,declarations)']],
         'cls': ['SPELL'],
         'test': 'tests/spellwrought_tattoo_runtime.mjs'},
     7: {'anchor': ['src/data/lib/spell-source.js',
                    "const stored=spell.fixedSpellSource&&spell.fixedSpellSource.kind==='stored-spell',tattoo=stored?storedSpellFixedSourceStats(spell.fixedSpellSource,spell):spell.fixedSpellSource&&spell.fixedSpellSource.kind==='spell-gem'?spellGemFixedSourceStats(spell.fixedSpellSource,spell):tattooFixedSourceStats(spell.fixedSpellSource,spell);if(!tattoo)return {};"],
         'extraAnchors': [['src/builder/25a-logic-tattoo-sources.js',
                           'function commitTattooPlan(owner,current,plan,body,beforeCommit,result)'],
                          ['src/data/lib/spellwrought-tattoo.js', 'export function applySpellwroughtTattoo('],
                          ['src/data/lib/tattoo-projection.js', 'export function tattooOwnedSpellRow('],
                          ['src/data/lib/spellwrought-tattoo.js', 'export function tattooFixedSourceStats('],
                          ['src/app/23e-ui-spells-dc.js', 'export function scOf(x){return selectSpellSource('],
                          ['src/app/22-ui-spell-data-and-slots.js', 'export function tattooSpellCalculation(']],
         'cls': ['ATK', 'DC'],
         'test': 'tests/tattoo_spell_source.mjs + tests/tattoo_spell_consumer.mjs'},
     1: {'anchor': ['src/data/lib/spellwrought-tattoo.js', 'export function projectTattooBody('],
         'extraAnchors': [['src/builder/25a-logic-tattoo-sources.js',
                           'function commitTattooPlan(owner,current,plan,body,beforeCommit,result)'],
                          ['src/data/lib/spellwrought-tattoo.js', 'export function applySpellwroughtTattoo('],
                          ['src/data/lib/tattoo-projection.js', 'export function tattooOwnedSpellRow(']],
         'cls': ['SPELL'],
         'test': 'tests/spellwrought_tattoo_model.mjs'}}
    tattoo_expected=[]
    for native in tattoo_rows:
        for owner in ["dmg","tce"]:
            for index,text in enumerate(split_sentences(native[4]),1):
                if index not in (4,5,7) and not(index==1 and native[0]=="Spellwrought Tattoo (Cantrip)"):continue
                sid="item|%s|%s#%s"%(owner,native[0],index);group=tattoo_groups[index]
                values=re.findall(r"\b\d+\b",text) if index==7 else []
                entry=dict(id="u40-"+re.sub("[^a-z0-9]+","-",sid.lower()).strip("-"),kind="item",owner=owner,name=native[0],cls=group["cls"],vals=values,scopeValues=True,rx="^"+re.escape(text.lower())+"$",anchor=group["anchor"],extraAnchors=group["extraAnchors"],test="Z3 U40 native physical needle "+("2014" if owner=="dmg" else "2024")+" "+native[0],consumerTests=group["test"].split(" + "))
                tattoo_expected.append(entry);loaded=load_code_atoms([entry]);key="item|%s|%s"%(owner,native[0]);atoms=[atom for proof,atom in loaded.get(key,[])]
                result=analyze(synth("item",owner,native[0],text,atoms))[0]
                check("U40 exact native physical sentence "+sid,result["status"]=="covered",result["why"])
                check("U40 source has no attunement prerequisite "+sid,native[3]==0 and native[5] is None)
                fixture=tool_cases_by_name.get(entry["test"])
                for testfile in entry["consumerTests"]:
                    path=os.path.join(ROOT,testfile)
                    check("U40 retained actual model/runtime/calculator test "+sid+testfile,bool(fixture and fixture.get("expect") and fixture.get("lo")) and os.path.isfile(path) and "spellwrought-tattoo" in open(path,encoding="utf-8").read())
                for anchor_index in range(1+len(entry["extraAnchors"])):
                    damaged=dict(entry,extraAnchors=[list(pair) for pair in entry["extraAnchors"]])
                    if anchor_index==0:damaged["anchor"]=[entry["anchor"][0],"missing-native-tattoo-consumer"]
                    else:damaged["extraAnchors"][anchor_index-1][1]="missing-native-tattoo-producer-or-lifecycle"
                    check("U40 NEG missing physical source/consumer "+sid+str(anchor_index),not load_code_atoms([damaged]));CODE_NOTES.clear()
                changed=text.replace("+3","+6").replace("+4","+6").replace("+5","+6").replace("+7","+6").replace("+9","+6") if index==7 else text[:-1]+" at will."
                for other in [changed,"You gain a +1 bonus to AC.","You gain a +3 bonus to all spell attacks.","You permanently learn this spell.","The tattoo glows whenever you carry the needle."]:
                    check("U40 NEG unrelated or broadened permission "+sid+other,all(row["status"]!="covered" for row in analyze(synth("item",owner,native[0],other,atoms))))
                for wrong_key in ["item|other|"+native[0],"item|"+owner+"|Ordinary Needle"]:
                    check("U40 NEG wrong alias or item "+sid+wrong_key,not loaded.get(wrong_key))
    check("U40 exactly38 native initial candidates across both aliases",len(tattoo_expected)==38)
    for version in [1,2]:
        check("U40 Disciple selector/version is not numerical evidence "+str(version),not atoms_from({"clericPower":{"v":version,"profile":"disciple-of-life"}},"GX.tattoo-passive"))
    tattoo_registered=[entry for entry in json.load(open(CODE,encoding="utf-8"))["entries"] if entry.get("id","").startswith("u40-")]
    check("U40 draft or exactly38 registered native source proofs",len(tattoo_registered) in (0,38))
    tattoo_by_id={entry["id"]:entry for entry in tattoo_expected}
    for entry in tattoo_registered:
        expected=tattoo_by_id.get(entry["id"])
        check("U40 registered exact native source and lifecycle "+entry["id"],bool(expected and all(entry.get(key)==value for key,value in expected.items())))
    # U41 native preflight: these inputs alone cannot count as a computed source.
    gem_native_rows=[row for row in native_tattoo["oota"] if row[0].startswith("Spell Gem (")]
    check("U41 ten exact native Gem profiles",len(gem_native_rows)==10)
    gem_native_candidates=[]
    for native in gem_native_rows:
        text=native[4];fixed=re.search(r"save DC of (\d+) and an attack bonus of \+(\d+)",text)
        check("U41 printed source has independent ATK/DC "+native[0],bool(fixed))
        check("U41 source does not print a fixed modifier "+native[0],not re.search(r"ability modifier|spellcasting modifier",text,re.I))
        check("U41 optional imbue attunement is not release ATT "+native[0],native[3]==0 and "doesn't require attunement" in text and "attuned to it and it's empty" in text)
        check("U41 native dawn metadata is not a release pool "+native[0],native[5].get("ch")==[1,"1","dawn"] and "can't be imbued again until the next dawn" in text)
        for owner in ["dmg","oota"]:
            for index,sentence in enumerate(split_sentences(text),1):
                if index not in (1,7,10,12) and not(index==9 and native[0]=="Spell Gem (Obsidian)"):continue
                sid="item|%s|%s#%s"%(owner,native[0],index);gem_native_candidates.append(sid)
                raw={"spellGem":{"v":1,"id":"gem-1","contents":{"spell":"Mending","level":0},"imbueAvailable":False,"loadId":"sgl-1"}}
                markers=atoms_from(raw,"physical-gem")
                result=analyze(synth("item",owner,native[0],sentence,markers))[0]
                check("U41 native target requires real consumer evidence "+sid,not markers and result["status"]=="uncovered",result["why"])
    check("U41 exactly82 initial source-sentence candidates",len(gem_native_candidates)==82 and len(set(gem_native_candidates))==82)
    for version in [1,2]:
        for field,value in [("spellGemSources",{"v":version,"nextId":2,"reservedIds":["gem-1"]}),("castingSources",{"v":version,"edition":"2024","classParts":[],"sources":[],"complete":True}),("spellGemCasts",{"v":version,"nextCastId":2,"casts":[]})]:
            check("U41 registry/caster/receipt versions give no gate atoms "+field+str(version),not atoms_from({field:value},"gem-metadata"))
    # Exact U41 candidates remain outside registration until actual UI approval.
    gem_proof_groups = {1: {'anchor': ['src/builder/25b-logic-spell-gem-sources.js', 'genv.__bldGemReview=function'],
         'extraAnchors': [['src/builder/25b-logic-spell-gem-sources.js', 'function gemCommit(token,prepare,beforeCommit,isCurrent'],
                          ['src/data/lib/spell-gem-authority.js', 'export function assertGemPhysicalCurrent('],
                          ['src/data/lib/spell-gem-authority.js', 'export function applyGemPhysicalChanges('],
                          ['src/builder/25b-logic-spell-gem-sources.js', 'Array.isArray(matches[0].classList)'],
                          ['src/data/lib/spell-gem-physical.js', 'export function reviewGemPhysical('],
                          ['src/data/lib/spell-gem.js', 'export function spellGemProblems('],
                          ['src/data/lib/spell-gem.js', 'export function evaluateGemImbue(']],
         'consumerTests': ['tests/spell_gem_model.mjs',
                           'tests/spell_gem_physical.mjs',
                           'tests/spell_gem_authority.mjs',
                           'tests/spell_gem_backend.mjs']},
     7: {'anchor': ['src/app/32h-logic-spell-gem.js', 'function gemReleaseCheck(options,view,facts,evaluated,selection)'],
         'extraAnchors': [['src/builder/25b-logic-spell-gem-sources.js', 'function gemCommit(token,prepare,beforeCommit,isCurrent'],
                          ['src/data/lib/spell-gem-authority.js', 'export function assertGemPhysicalCurrent('],
                          ['src/data/lib/spell-gem-authority.js', 'export function applyGemPhysicalChanges('],
                          ['src/data/lib/spell-gem.js', 'checkDC:checkRequired?10+state.contents.level:null'],
                          ['src/app/32h-logic-spell-gem.js', 'dice.commitHook!==1'],
                          ['src/app/32h-logic-spell-gem.js', 'function gemReleaseCommit(token,facts,event,selection'],
                          ['src/builder/25b-logic-spell-gem-sources.js', 'genv.__bldGemRelease=function'],
                          ['src/data/lib/spell-gem-casts.js', 'export function recordSpellGemCast('],
                          ['src/data/lib/gem-check-bonuses.js', 'export function evaluateGemCheckBonuses(']],
         'consumerTests': ['tests/spell_gem_model.mjs',
                           'tests/spell_gem_runtime.mjs',
                           'tests/casting_sources.mjs',
                           'tests/gem_check_bonuses.mjs']},
     10: {'anchor': ['src/app/32h-logic-spell-gem.js', 'export function requestGemReceiptEffect(options)'],
          'extraAnchors': [['src/builder/25b-logic-spell-gem-sources.js', 'function gemCommit(token,prepare,beforeCommit,isCurrent'],
                           ['src/data/lib/spell-gem-authority.js', 'export function assertGemPhysicalCurrent('],
                           ['src/data/lib/spell-gem-authority.js', 'export function applyGemPhysicalChanges('],
                           ['src/data/lib/spell-gem-casts.js', 'export function spellGemFixedSourceStats('],
                           ['src/data/lib/spell-gem-casts.js', 'export function gemOwnedSpellRow('],
                           ['src/data/lib/spell-source.js', 'spellGemFixedSourceStats(spell.fixedSpellSource,spell)'],
                           ['src/app/22-ui-spell-data-and-slots.js', 'export function gemReceiptDetails('],
                           ['src/data/lib/spell-gem-casts.js', 'export function recordSpellGemCast(']],
          'consumerTests': ['tests/spell_gem_consumer.mjs',
                            'tests/spell_gem_casts.mjs',
                            'tests/spell_gem_source.mjs',
                            'tests/spell_gem_runtime.mjs']},
     12: {'anchor': ['src/builder/25b-logic-spell-gem-sources.js', 'genv.__bldGemImbue=function'],
          'extraAnchors': [['src/builder/25b-logic-spell-gem-sources.js', 'function gemCommit(token,prepare,beforeCommit,isCurrent'],
                           ['src/data/lib/spell-gem-authority.js', 'export function assertGemPhysicalCurrent('],
                           ['src/data/lib/spell-gem-authority.js', 'export function applyGemPhysicalChanges('],
                           ['src/app/32h-logic-spell-gem.js', 'export function requestGemImbue(options)'],
                           ['src/app/32h-logic-spell-gem.js', 'export function gemNativePaymentPlan('],
                           ['src/app/lib/gem-native-payment.js', 'function plan(token,bound,material)'],
                           ['src/data/lib/spell-gem.js', 'export function imbueSpellGem('],
                           ['src/data/lib/spell-gem.js', 'externalSpellEffectAllowed:false'],
                           ['src/builder/25b-logic-spell-gem-sources.js', 'attunedActive:!!(status&&status.attuned)'],
                           ['src/data/lib/spell-gem.js', 'export function declareGemNextDawn(']],
          'consumerTests': ['tests/spell_gem_runtime.mjs',
                            'tests/spell_gem_backend.mjs',
                            'tests/spell_gem_attunement.mjs',
                            'tests/spell_gem_model.mjs']},
     9: {'anchor': ['src/builder/25b-logic-spell-gem-sources.js', 'genv.__bldGemReview=function'],
         'extraAnchors': [['src/builder/25b-logic-spell-gem-sources.js', 'function gemCommit(token,prepare,beforeCommit,isCurrent'],
                          ['src/data/lib/spell-gem-authority.js', 'export function assertGemPhysicalCurrent('],
                          ['src/data/lib/spell-gem-authority.js', 'export function applyGemPhysicalChanges('],
                          ['src/builder/25b-logic-spell-gem-sources.js', 'Array.isArray(matches[0].classList)'],
                          ['src/data/lib/spell-gem-physical.js', 'export function reviewGemPhysical('],
                          ['src/data/lib/spell-gem.js', 'export function spellGemProblems('],
                          ['src/data/lib/spell-gem.js', 'export function evaluateGemImbue(']],
         'consumerTests': ['tests/spell_gem_model.mjs',
                           'tests/spell_gem_physical.mjs',
                           'tests/spell_gem_authority.mjs',
                           'tests/spell_gem_backend.mjs']}}
    gem_proof_expected=[]
    for native in gem_native_rows:
        for owner in ["dmg","oota"]:
            for index,text in enumerate(split_sentences(native[4]),1):
                if index not in (1,7,10,12) and not(index==9 and native[0]=="Spell Gem (Obsidian)"):continue
                sid="item|%s|%s#%s"%(owner,native[0],index);group=gem_proof_groups[index]
                bare=analyze(synth("item",owner,native[0],text,[]))[0]
                entry=dict(id="u41-"+re.sub("[^a-z0-9]+","-",sid.lower()).strip("-"),kind="item",owner=owner,name=native[0],cls=bare["K"],vals=list(dict.fromkeys(value for value,kind in bare["toks"])),scopeValues=True,rx="^"+re.escape(text.lower())+"$",anchor=group["anchor"],extraAnchors=group["extraAnchors"],test="Z3 U41 native loaded physical gem "+("2014" if owner=="dmg" else "2024")+" "+native[0],consumerTests=group["consumerTests"])
                gem_proof_expected.append(entry);loaded=load_code_atoms([entry]);key="item|%s|%s"%(owner,native[0]);atoms=[atom for proof,atom in loaded.get(key,[])]
                result=analyze(synth("item",owner,native[0],text,atoms))[0]
                check("U41 candidate exact native source outcome "+sid,result["status"]=="covered",result["why"])
                fixture=tool_cases_by_name.get(entry["test"])
                check("U41 real native physical FX differential "+sid,bool(fixture and fixture.get("expect") and fixture.get("lo") and fixture["b"]["inv"][0]["n"]==native[0]))
                for testfile in entry["consumerTests"]:
                    filename=os.path.join(ROOT,testfile);needle="casting-sources" if testfile.endswith("casting_sources.mjs") else "gem-check-bonuses" if testfile.endswith("gem_check_bonuses.mjs") else "spell-gem"
                    check("U41 actual consumer witness retained "+sid+testfile,os.path.isfile(filename) and needle in open(filename,encoding="utf-8").read())
                for anchor_index in range(1+len(entry["extraAnchors"])):
                    damaged=dict(entry,extraAnchors=[list(pair) for pair in entry["extraAnchors"]])
                    if anchor_index==0:damaged["anchor"]=[entry["anchor"][0],"missing-native-gem-source-consumer"]
                    else:damaged["extraAnchors"][anchor_index-1][1]="missing-native-gem-authority-or-transaction"
                    check("U41 NEG missing native producer/consumer "+sid+str(anchor_index),not load_code_atoms([damaged]));CODE_NOTES.clear()
                if index==7:changed=text.replace("10 +","11 +")
                elif index==10:
                    fixed=re.search(r"save DC of (\d+)",text);changed=text[:fixed.start(1)]+str(int(fixed.group(1))+1)+text[fixed.end(1):]
                elif index==1:changed=text.replace("one spell","two spells").replace("one cantrip","two cantrips")
                elif index==9:changed=text.replace("only store cantrips","store ninth level spells")
                else:changed=text.replace("while holding the gem","without holding the gem")
                check("U41 source-sentence mutant differs "+sid,changed!=text)
                for other in [changed,"You permanently learn this spell.","You gain a +3 bonus to all spell attacks.","The gem refills after every Long Rest.","You can cast any spell without a real casting source."]:
                    check("U41 NEG changed or broadened permission "+sid+other,all(row["status"]!="covered" for row in analyze(synth("item",owner,native[0],other,atoms))))
                for wrong_key in ["item|other|"+native[0],"item|"+owner+"|Ordinary Gem"]:
                    check("U41 NEG wrong source alias or item "+sid+wrong_key,not loaded.get(wrong_key))
    check("U41 exactly82 narrowly scoped draft proofs",len(gem_proof_expected)==82)
    gem_registered=[entry for entry in json.load(open(CODE,encoding="utf-8"))["entries"] if entry.get("id","").startswith("u41-")]
    check("U41 outside draft or exactly82 registered proofs",len(gem_registered) in (0,82))
    gem_expected_by_id={entry["id"]:entry for entry in gem_proof_expected}
    for entry in gem_registered:
        expected=gem_expected_by_id.get(entry["id"])
        check("U41 registered exact native source and real consumers "+entry["id"],bool(expected and all(entry.get(key)==value for key,value in expected.items())))
    # U42 native storage proofs: exact native scope and verified actual consumers.
    storage_spec = json.loads('{"entries": [{"id": "u42-item-dmg-ioun-stone-reserve-19", "kind": "item", "owner": "dmg", "name": "Ioun Stone (reserve)", "cls": ["SPELL"], "vals": [], "scopeValues": true, "rx": "^while\\\\ the\\\\ prism\\\\ orbits\\\\ your\\\\ head,\\\\ you\\\\ can\\\\ cast\\\\ any\\\\ spell\\\\ it\\\\ holds\\\\.$", "anchor": ["src/app/32i-logic-stored-spells.js", "function storedReleaseCommit("], "extraAnchors": [["src/builder/25c-logic-stored-spell-sources.js", "function storingCommit("], ["src/data/lib/stored-spell.js", "export function assertStoredItemCurrent("], ["src/data/lib/stored-spell.js", "export function storedSpellProfile("], ["src/builder/25c-logic-stored-spell-sources.js", "genv.__bldStoredSpellRelease=function"], ["src/data/lib/stored-spell.js", "export function releaseStoredSpell("], ["src/app/32i-logic-stored-spells.js", "export function requestStoredSpellRelease("]], "test": "Z3 U42 native physical stored source 2024 Ioun Stone (reserve) empty", "consumerTests": ["tests/stored_spell_backend.mjs", "tests/stored_spell_model.mjs", "tests/stored_spell_consumer.mjs", "tests/stored_spell_runtime.mjs", "tests/stored_spell_payment.mjs"], "note": "OUTSIDE DRAFT. Native source clause only; actual physical/load/release/receipt consumers required. Generic parent scope is explicitly selected current Reserve, never bare Ioun or other variants."}, {"id": "u42-item-dmg-ioun-stone-reserve-20", "kind": "item", "owner": "dmg", "name": "Ioun Stone (reserve)", "cls": ["ATK", "DC", "SLOT"], "vals": [], "scopeValues": true, "rx": "^that\\\\ spell\\\\ uses\\\\ the\\\\ original\\\\ caster\'s\\\\ slot\\\\ level,\\\\ spellcasting\\\\ ability,\\\\ spell\\\\ attack\\\\ bonus,\\\\ and\\\\ spell\\\\ save\\\\ dc,\\\\ but\\\\ in\\\\ every\\\\ other\\\\ way\\\\ it\\\\ counts\\\\ as\\\\ a\\\\ spell\\\\ you\\\\ cast\\\\.$", "anchor": ["src/app/22-ui-spell-data-and-slots.js", "export function storedSpellCalculation("], "extraAnchors": [["src/builder/25c-logic-stored-spell-sources.js", "function storingCommit("], ["src/data/lib/stored-spell.js", "export function assertStoredItemCurrent("], ["src/data/lib/stored-spell.js", "export function storedSpellProfile("], ["src/data/lib/stored-spell.js", "export function storedSpellFixedSourceStats("], ["src/data/lib/stored-spell.js", "export function ownedStoredSpellRow("], ["src/app/22-ui-spell-data-and-slots.js", "export function storedReceiptDetails("], ["src/app/32i-logic-stored-spells.js", "export function requestStoredSpellReceiptEffect("], ["src/data/lib/stored-spell.js", "export function recordStoredSpellCast("]], "test": "Z3 U42 native physical stored source 2024 Ioun Stone (reserve) empty", "consumerTests": ["tests/stored_spell_backend.mjs", "tests/stored_spell_model.mjs", "tests/stored_spell_consumer.mjs", "tests/stored_spell_runtime.mjs", "tests/stored_spell_payment.mjs"], "note": "OUTSIDE DRAFT. Native source clause only; actual physical/load/release/receipt consumers required. Generic parent scope is explicitly selected current Reserve, never bare Ioun or other variants."}, {"id": "u42-item-dmg-ring-of-spell-storing-7", "kind": "item", "owner": "dmg", "name": "Ring of Spell Storing", "cls": ["SLOT"], "vals": [], "scopeValues": true, "rx": "^the\\\\ level\\\\ of\\\\ the\\\\ spell\\\\ slot\\\\ used\\\\ for\\\\ the\\\\ casting\\\\ sets\\\\ how\\\\ much\\\\ room\\\\ the\\\\ spell\\\\ takes\\\\.$", "anchor": ["src/builder/25c-logic-stored-spell-sources.js", "genv.__bldStoredSpellLoad=function"], "extraAnchors": [["src/builder/25c-logic-stored-spell-sources.js", "function storingCommit("], ["src/data/lib/stored-spell.js", "export function assertStoredItemCurrent("], ["src/data/lib/stored-spell.js", "export function storedSpellProfile("], ["src/data/lib/stored-spell.js", "export function storedCapacity("], ["src/data/lib/stored-spell.js", "export function storeSpell("], ["src/app/32i-logic-stored-spells.js", "function storedLoadCommit("], ["src/app/lib/stored-spell-payment.js", "export function createStoredSpellPayment("]], "test": "Z3 U42 native physical stored source 2024 Ring of Spell Storing empty", "consumerTests": ["tests/stored_spell_backend.mjs", "tests/stored_spell_model.mjs", "tests/stored_spell_consumer.mjs", "tests/stored_spell_runtime.mjs", "tests/stored_spell_payment.mjs"], "note": "OUTSIDE DRAFT. Native source clause only; actual physical/load/release/receipt consumers required. Generic parent scope is explicitly selected current Reserve, never bare Ioun or other variants."}, {"id": "u42-item-dmg-ring-of-spell-storing-8", "kind": "item", "owner": "dmg", "name": "Ring of Spell Storing", "cls": ["SPELL"], "vals": [], "scopeValues": true, "rx": "^while\\\\ you\\\\ wear\\\\ the\\\\ ring,\\\\ you\\\\ can\\\\ cast\\\\ any\\\\ spell\\\\ held\\\\ in\\\\ it\\\\.$", "anchor": ["src/app/32i-logic-stored-spells.js", "function storedReleaseCommit("], "extraAnchors": [["src/builder/25c-logic-stored-spell-sources.js", "function storingCommit("], ["src/data/lib/stored-spell.js", "export function assertStoredItemCurrent("], ["src/data/lib/stored-spell.js", "export function storedSpellProfile("], ["src/builder/25c-logic-stored-spell-sources.js", "genv.__bldStoredSpellRelease=function"], ["src/data/lib/stored-spell.js", "export function releaseStoredSpell("], ["src/app/32i-logic-stored-spells.js", "export function requestStoredSpellRelease("]], "test": "Z3 U42 native physical stored source 2024 Ring of Spell Storing empty", "consumerTests": ["tests/stored_spell_backend.mjs", "tests/stored_spell_model.mjs", "tests/stored_spell_consumer.mjs", "tests/stored_spell_runtime.mjs", "tests/stored_spell_payment.mjs"], "note": "OUTSIDE DRAFT. Native source clause only; actual physical/load/release/receipt consumers required. Generic parent scope is explicitly selected current Reserve, never bare Ioun or other variants."}, {"id": "u42-item-dmg-ring-of-spell-storing-9", "kind": "item", "owner": "dmg", "name": "Ring of Spell Storing", "cls": ["ATK", "DC", "SLOT"], "vals": [], "scopeValues": true, "rx": "^that\\\\ spell\\\\ keeps\\\\ the\\\\ slot\\\\ level,\\\\ spellcasting\\\\ ability,\\\\ spell\\\\ attack\\\\ bonus,\\\\ and\\\\ spell\\\\ save\\\\ dc\\\\ of\\\\ whoever\\\\ first\\\\ cast\\\\ it,\\\\ but\\\\ in\\\\ every\\\\ other\\\\ way\\\\ it\\\\ counts\\\\ as\\\\ a\\\\ spell\\\\ you\\\\ cast\\\\.$", "anchor": ["src/app/22-ui-spell-data-and-slots.js", "export function storedSpellCalculation("], "extraAnchors": [["src/builder/25c-logic-stored-spell-sources.js", "function storingCommit("], ["src/data/lib/stored-spell.js", "export function assertStoredItemCurrent("], ["src/data/lib/stored-spell.js", "export function storedSpellProfile("], ["src/data/lib/stored-spell.js", "export function storedSpellFixedSourceStats("], ["src/data/lib/stored-spell.js", "export function ownedStoredSpellRow("], ["src/app/22-ui-spell-data-and-slots.js", "export function storedReceiptDetails("], ["src/app/32i-logic-stored-spells.js", "export function requestStoredSpellReceiptEffect("], ["src/data/lib/stored-spell.js", "export function recordStoredSpellCast("]], "test": "Z3 U42 native physical stored source 2024 Ring of Spell Storing empty", "consumerTests": ["tests/stored_spell_backend.mjs", "tests/stored_spell_model.mjs", "tests/stored_spell_consumer.mjs", "tests/stored_spell_runtime.mjs", "tests/stored_spell_payment.mjs"], "note": "OUTSIDE DRAFT. Native source clause only; actual physical/load/release/receipt consumers required. Generic parent scope is explicitly selected current Reserve, never bare Ioun or other variants."}, {"id": "u42-item-dmg-ioun-stone-reserve-14", "kind": "item", "owner": "dmg", "name": "Ioun Stone, Reserve", "cls": ["SPELL"], "vals": [], "scopeValues": true, "rx": "^the\\\\ level\\\\ of\\\\ the\\\\ slot\\\\ used\\\\ to\\\\ cast\\\\ the\\\\ spell\\\\ determines\\\\ how\\\\ much\\\\ space\\\\ it\\\\ uses\\\\.$", "anchor": ["src/builder/25c-logic-stored-spell-sources.js", "genv.__bldStoredSpellLoad=function"], "extraAnchors": [["src/builder/25c-logic-stored-spell-sources.js", "function storingCommit("], ["src/data/lib/stored-spell.js", "export function assertStoredItemCurrent("], ["src/data/lib/stored-spell.js", "export function storedSpellProfile("], ["src/data/lib/stored-spell.js", "export function storedCapacity("], ["src/data/lib/stored-spell.js", "export function storeSpell("], ["src/app/32i-logic-stored-spells.js", "function storedLoadCommit("], ["src/app/lib/stored-spell-payment.js", "export function createStoredSpellPayment("]], "test": "Z3 U42 native physical stored source 2024 Ioun Stone, Reserve empty", "consumerTests": ["tests/stored_spell_backend.mjs", "tests/stored_spell_model.mjs", "tests/stored_spell_consumer.mjs", "tests/stored_spell_runtime.mjs", "tests/stored_spell_payment.mjs"], "note": "OUTSIDE DRAFT. Native source clause only; actual physical/load/release/receipt consumers required. Generic parent scope is explicitly selected current Reserve, never bare Ioun or other variants."}, {"id": "u42-item-dmg-ioun-stone-reserve-15", "kind": "item", "owner": "dmg", "name": "Ioun Stone, Reserve", "cls": ["SPELL"], "vals": [], "scopeValues": true, "rx": "^while\\\\ this\\\\ stone\\\\ orbits\\\\ your\\\\ head,\\\\ you\\\\ can\\\\ cast\\\\ any\\\\ spell\\\\ stored\\\\ in\\\\ it\\\\.$", "anchor": ["src/app/32i-logic-stored-spells.js", "function storedReleaseCommit("], "extraAnchors": [["src/builder/25c-logic-stored-spell-sources.js", "function storingCommit("], ["src/data/lib/stored-spell.js", "export function assertStoredItemCurrent("], ["src/data/lib/stored-spell.js", "export function storedSpellProfile("], ["src/builder/25c-logic-stored-spell-sources.js", "genv.__bldStoredSpellRelease=function"], ["src/data/lib/stored-spell.js", "export function releaseStoredSpell("], ["src/app/32i-logic-stored-spells.js", "export function requestStoredSpellRelease("]], "test": "Z3 U42 native physical stored source 2024 Ioun Stone, Reserve empty", "consumerTests": ["tests/stored_spell_backend.mjs", "tests/stored_spell_model.mjs", "tests/stored_spell_consumer.mjs", "tests/stored_spell_runtime.mjs", "tests/stored_spell_payment.mjs"], "note": "OUTSIDE DRAFT. Native source clause only; actual physical/load/release/receipt consumers required. Generic parent scope is explicitly selected current Reserve, never bare Ioun or other variants."}, {"id": "u42-item-dmg-ioun-stone-reserve-16", "kind": "item", "owner": "dmg", "name": "Ioun Stone, Reserve", "cls": ["ATK", "DC", "SLOT", "SPELL"], "vals": [], "scopeValues": true, "rx": "^the\\\\ spell\\\\ uses\\\\ the\\\\ slot\\\\ level,\\\\ spell\\\\ save\\\\ dc,\\\\ spell\\\\ attack\\\\ bonus,\\\\ and\\\\ spellcasting\\\\ ability\\\\ of\\\\ the\\\\ original\\\\ caster,\\\\ but\\\\ is\\\\ otherwise\\\\ treated\\\\ as\\\\ if\\\\ you\\\\ cast\\\\ the\\\\ spell\\\\.$", "anchor": ["src/app/22-ui-spell-data-and-slots.js", "export function storedSpellCalculation("], "extraAnchors": [["src/builder/25c-logic-stored-spell-sources.js", "function storingCommit("], ["src/data/lib/stored-spell.js", "export function assertStoredItemCurrent("], ["src/data/lib/stored-spell.js", "export function storedSpellProfile("], ["src/data/lib/stored-spell.js", "export function storedSpellFixedSourceStats("], ["src/data/lib/stored-spell.js", "export function ownedStoredSpellRow("], ["src/app/22-ui-spell-data-and-slots.js", "export function storedReceiptDetails("], ["src/app/32i-logic-stored-spells.js", "export function requestStoredSpellReceiptEffect("], ["src/data/lib/stored-spell.js", "export function recordStoredSpellCast("]], "test": "Z3 U42 native physical stored source 2024 Ioun Stone, Reserve empty", "consumerTests": ["tests/stored_spell_backend.mjs", "tests/stored_spell_model.mjs", "tests/stored_spell_consumer.mjs", "tests/stored_spell_runtime.mjs", "tests/stored_spell_payment.mjs"], "note": "OUTSIDE DRAFT. Native source clause only; actual physical/load/release/receipt consumers required. Generic parent scope is explicitly selected current Reserve, never bare Ioun or other variants."}, {"id": "u42-item-dmg14-ioun-stone-reserve-14", "kind": "item", "owner": "dmg14", "name": "Ioun Stone, Reserve", "cls": ["SPELL"], "vals": [], "scopeValues": true, "rx": "^the\\\\ level\\\\ of\\\\ the\\\\ slot\\\\ used\\\\ to\\\\ cast\\\\ the\\\\ spell\\\\ determines\\\\ how\\\\ much\\\\ space\\\\ it\\\\ uses\\\\.$", "anchor": ["src/builder/25c-logic-stored-spell-sources.js", "genv.__bldStoredSpellLoad=function"], "extraAnchors": [["src/builder/25c-logic-stored-spell-sources.js", "function storingCommit("], ["src/data/lib/stored-spell.js", "export function assertStoredItemCurrent("], ["src/data/lib/stored-spell.js", "export function storedSpellProfile("], ["src/data/lib/stored-spell.js", "export function storedCapacity("], ["src/data/lib/stored-spell.js", "export function storeSpell("], ["src/app/32i-logic-stored-spells.js", "function storedLoadCommit("], ["src/app/lib/stored-spell-payment.js", "export function createStoredSpellPayment("]], "test": "Z3 U42 native physical stored source 2024 Ioun Stone, Reserve empty", "consumerTests": ["tests/stored_spell_backend.mjs", "tests/stored_spell_model.mjs", "tests/stored_spell_consumer.mjs", "tests/stored_spell_runtime.mjs", "tests/stored_spell_payment.mjs"], "note": "OUTSIDE DRAFT. Native source clause only; actual physical/load/release/receipt consumers required. Generic parent scope is explicitly selected current Reserve, never bare Ioun or other variants."}, {"id": "u42-item-dmg14-ioun-stone-reserve-15", "kind": "item", "owner": "dmg14", "name": "Ioun Stone, Reserve", "cls": ["SPELL"], "vals": [], "scopeValues": true, "rx": "^while\\\\ this\\\\ stone\\\\ orbits\\\\ your\\\\ head,\\\\ you\\\\ can\\\\ cast\\\\ any\\\\ spell\\\\ stored\\\\ in\\\\ it\\\\.$", "anchor": ["src/app/32i-logic-stored-spells.js", "function storedReleaseCommit("], "extraAnchors": [["src/builder/25c-logic-stored-spell-sources.js", "function storingCommit("], ["src/data/lib/stored-spell.js", "export function assertStoredItemCurrent("], ["src/data/lib/stored-spell.js", "export function storedSpellProfile("], ["src/builder/25c-logic-stored-spell-sources.js", "genv.__bldStoredSpellRelease=function"], ["src/data/lib/stored-spell.js", "export function releaseStoredSpell("], ["src/app/32i-logic-stored-spells.js", "export function requestStoredSpellRelease("]], "test": "Z3 U42 native physical stored source 2024 Ioun Stone, Reserve empty", "consumerTests": ["tests/stored_spell_backend.mjs", "tests/stored_spell_model.mjs", "tests/stored_spell_consumer.mjs", "tests/stored_spell_runtime.mjs", "tests/stored_spell_payment.mjs"], "note": "OUTSIDE DRAFT. Native source clause only; actual physical/load/release/receipt consumers required. Generic parent scope is explicitly selected current Reserve, never bare Ioun or other variants."}, {"id": "u42-item-dmg14-ioun-stone-reserve-16", "kind": "item", "owner": "dmg14", "name": "Ioun Stone, Reserve", "cls": ["ATK", "DC", "SLOT", "SPELL"], "vals": [], "scopeValues": true, "rx": "^the\\\\ spell\\\\ uses\\\\ the\\\\ slot\\\\ level,\\\\ spell\\\\ save\\\\ dc,\\\\ spell\\\\ attack\\\\ bonus,\\\\ and\\\\ spellcasting\\\\ ability\\\\ of\\\\ the\\\\ original\\\\ caster,\\\\ but\\\\ is\\\\ otherwise\\\\ treated\\\\ as\\\\ if\\\\ you\\\\ cast\\\\ the\\\\ spell\\\\.$", "anchor": ["src/app/22-ui-spell-data-and-slots.js", "export function storedSpellCalculation("], "extraAnchors": [["src/builder/25c-logic-stored-spell-sources.js", "function storingCommit("], ["src/data/lib/stored-spell.js", "export function assertStoredItemCurrent("], ["src/data/lib/stored-spell.js", "export function storedSpellProfile("], ["src/data/lib/stored-spell.js", "export function storedSpellFixedSourceStats("], ["src/data/lib/stored-spell.js", "export function ownedStoredSpellRow("], ["src/app/22-ui-spell-data-and-slots.js", "export function storedReceiptDetails("], ["src/app/32i-logic-stored-spells.js", "export function requestStoredSpellReceiptEffect("], ["src/data/lib/stored-spell.js", "export function recordStoredSpellCast("]], "test": "Z3 U42 native physical stored source 2024 Ioun Stone, Reserve empty", "consumerTests": ["tests/stored_spell_backend.mjs", "tests/stored_spell_model.mjs", "tests/stored_spell_consumer.mjs", "tests/stored_spell_runtime.mjs", "tests/stored_spell_payment.mjs"], "note": "OUTSIDE DRAFT. Native source clause only; actual physical/load/release/receipt consumers required. Generic parent scope is explicitly selected current Reserve, never bare Ioun or other variants."}, {"id": "u42-item-dmg-ioun-stone-56", "kind": "item", "owner": "dmg", "name": "Ioun Stone", "cls": ["SPELL"], "vals": [], "scopeValues": true, "rx": "^while\\\\ the\\\\ prism\\\\ orbits\\\\ your\\\\ head,\\\\ you\\\\ can\\\\ cast\\\\ any\\\\ spell\\\\ it\\\\ holds\\\\.$", "anchor": ["src/app/32i-logic-stored-spells.js", "function storedReleaseCommit("], "extraAnchors": [["src/builder/25c-logic-stored-spell-sources.js", "function storingCommit("], ["src/data/lib/stored-spell.js", "export function assertStoredItemCurrent("], ["src/data/lib/stored-spell.js", "export function storedSpellProfile("], ["src/builder/25c-logic-stored-spell-sources.js", "genv.__bldStoredSpellRelease=function"], ["src/data/lib/stored-spell.js", "export function releaseStoredSpell("], ["src/app/32i-logic-stored-spells.js", "export function requestStoredSpellRelease("], ["src/builder/25c-logic-stored-spell-sources.js", "genv.__bldStoredSpellSelectReserve=function"], ["tests/stored_spell_backend.mjs", "eq(generic.B.inv[0].n,item)"]], "test": "Z3 U42 native physical stored source 2024 Ioun Stone (reserve) empty", "consumerTests": ["tests/stored_spell_backend.mjs", "tests/stored_spell_model.mjs", "tests/stored_spell_consumer.mjs", "tests/stored_spell_runtime.mjs", "tests/stored_spell_payment.mjs"], "note": "OUTSIDE DRAFT. Native source clause only; actual physical/load/release/receipt consumers required. Generic parent scope is explicitly selected current Reserve, never bare Ioun or other variants."}, {"id": "u42-item-dmg-ioun-stone-57", "kind": "item", "owner": "dmg", "name": "Ioun Stone", "cls": ["ATK", "DC", "SLOT"], "vals": [], "scopeValues": true, "rx": "^that\\\\ spell\\\\ uses\\\\ the\\\\ original\\\\ caster\'s\\\\ slot\\\\ level,\\\\ spellcasting\\\\ ability,\\\\ spell\\\\ attack\\\\ bonus,\\\\ and\\\\ spell\\\\ save\\\\ dc,\\\\ but\\\\ in\\\\ every\\\\ other\\\\ way\\\\ it\\\\ counts\\\\ as\\\\ a\\\\ spell\\\\ you\\\\ cast\\\\.$", "anchor": ["src/app/22-ui-spell-data-and-slots.js", "export function storedSpellCalculation("], "extraAnchors": [["src/builder/25c-logic-stored-spell-sources.js", "function storingCommit("], ["src/data/lib/stored-spell.js", "export function assertStoredItemCurrent("], ["src/data/lib/stored-spell.js", "export function storedSpellProfile("], ["src/data/lib/stored-spell.js", "export function storedSpellFixedSourceStats("], ["src/data/lib/stored-spell.js", "export function ownedStoredSpellRow("], ["src/app/22-ui-spell-data-and-slots.js", "export function storedReceiptDetails("], ["src/app/32i-logic-stored-spells.js", "export function requestStoredSpellReceiptEffect("], ["src/data/lib/stored-spell.js", "export function recordStoredSpellCast("], ["src/builder/25c-logic-stored-spell-sources.js", "genv.__bldStoredSpellSelectReserve=function"], ["tests/stored_spell_backend.mjs", "eq(generic.B.inv[0].n,item)"]], "test": "Z3 U42 native physical stored source 2024 Ioun Stone (reserve) empty", "consumerTests": ["tests/stored_spell_backend.mjs", "tests/stored_spell_model.mjs", "tests/stored_spell_consumer.mjs", "tests/stored_spell_runtime.mjs", "tests/stored_spell_payment.mjs"], "note": "OUTSIDE DRAFT. Native source clause only; actual physical/load/release/receipt consumers required. Generic parent scope is explicitly selected current Reserve, never bare Ioun or other variants."}], "texts": {"item|dmg|Ioun Stone (reserve)#19": "While the prism orbits your head, you can cast any spell it holds.", "item|dmg|Ioun Stone (reserve)#20": "That spell uses the original caster\'s slot level, spellcasting ability, spell attack bonus, and spell save DC, but in every other way it counts as a spell you cast.", "item|dmg|Ring of Spell Storing#7": "The level of the spell slot used for the casting sets how much room the spell takes.", "item|dmg|Ring of Spell Storing#8": "While you wear the ring, you can cast any spell held in it.", "item|dmg|Ring of Spell Storing#9": "That spell keeps the slot level, spellcasting ability, spell attack bonus, and spell save DC of whoever first cast it, but in every other way it counts as a spell you cast.", "item|dmg|Ioun Stone, Reserve#14": "The level of the slot used to cast the spell determines how much space it uses.", "item|dmg|Ioun Stone, Reserve#15": "While this stone orbits your head, you can cast any spell stored in it.", "item|dmg|Ioun Stone, Reserve#16": "The spell uses the slot level, spell save DC, spell attack bonus, and spellcasting ability of the original caster, but is otherwise treated as if you cast the spell.", "item|dmg14|Ioun Stone, Reserve#14": "The level of the slot used to cast the spell determines how much space it uses.", "item|dmg14|Ioun Stone, Reserve#15": "While this stone orbits your head, you can cast any spell stored in it.", "item|dmg14|Ioun Stone, Reserve#16": "The spell uses the slot level, spell save DC, spell attack bonus, and spellcasting ability of the original caster, but is otherwise treated as if you cast the spell.", "item|dmg|Ioun Stone#56": "While the prism orbits your head, you can cast any spell it holds.", "item|dmg|Ioun Stone#57": "That spell uses the original caster\'s slot level, spellcasting ability, spell attack bonus, and spell save DC, but in every other way it counts as a spell you cast."}}')
    storage_expected=storage_spec["entries"]
    storage_registered=[entry for entry in json.load(open(CODE,encoding="utf-8"))["entries"] if entry.get("id","").startswith("u42-")]
    check("U42 exactly13 native scoped candidates",len(storage_expected)==13 and len({entry["id"] for entry in storage_expected})==13)
    check("U42 no partial proof registration",len(storage_registered) in (0,13))
    for entry in storage_expected:
        text=next(text for sid,text in storage_spec["texts"].items() if entry["id"]=="u42-"+re.sub("[^a-z0-9]+","-",sid.lower()).strip("-"))
        native_texts=[open(os.path.join(ROOT,"src/data",filename),encoding="utf-8").read() for filename in ["dmgi-magic-items-dmg2024.js","wotc11-magic-items-2014.js"]]
        check("U42 literal actual native sentence "+entry["id"],any(json.dumps(text,ensure_ascii=ascii_)[1:-1] in source for source in native_texts for ascii_ in [True,False]))
        loaded=load_code_atoms([entry]);key="item|"+entry["owner"]+"|"+entry["name"];atoms=[atom for _,atom in loaded.get(key,[])]
        result=analyze(synth("item",entry["owner"],entry["name"],text,atoms))[0]
        check("U42 exact native consumer proof "+entry["id"],result["status"]=="covered",result["why"])
        check("U42 no permission from raw source versions "+entry["id"],not atoms_from({"storedSpells":{"v":1,"profile":"ring","entries":[]}},"raw-storage"))
        for index in range(len(entry["extraAnchors"])+1):
            damaged=dict(entry)
            if index==0:damaged["anchor"]=[entry["anchor"][0],"U42_DELETED_ACTUAL_CONSUMER"]
            else:
                damaged["extraAnchors"]=[list(pair) for pair in entry["extraAnchors"]];damaged["extraAnchors"][index-1][1]="U42_DELETED_ACTUAL_CONSUMER"
            check("U42 NEG missing producer/consumer "+entry["id"]+str(index),not load_code_atoms([damaged]));CODE_NOTES.clear()
        changed=text.replace("original caster","current wearer").replace("whoever first cast it","current wearer").replace("slot level","base level").replace("spell slot used","spell base level").replace("level of the slot","base level of the spell").replace("orbits your head","is in your pack").replace("wear the ring","carry the ring")
        check("U42 native sentence mutant differs "+entry["id"],changed!=text)
        check("U42 NEG broadened storage permission "+entry["id"],all(row["status"]!="covered" for row in analyze(synth("item",entry["owner"],entry["name"],changed,atoms))))
        for wrong in ["item|wrong-owner|"+entry["name"],"item|"+entry["owner"]+"|Other storage item"]:
            check("U42 NEG wrong native item or alias "+entry["id"]+wrong,not loaded.get(wrong))
    storage_expected_by_id={entry["id"]:entry for entry in storage_expected}
    for entry in storage_registered:
        expected=storage_expected_by_id.get(entry["id"])
        check("U42 registered exact native proof "+entry["id"],bool(expected and all(entry.get(key)==value for key,value in expected.items() if key!="note")))
    # U43 source-scoped direct slot restoration; metadata alone never refunds a slot.
    recovery_spec=json.loads('{"entries": [{"id": "u43-item-dmg-pearl-of-power-1", "kind": "item", "owner": "dmg", "name": "Pearl of Power", "cls": ["SLOT"], "vals": [], "scopeValues": true, "rx": "^as\\\\ a\\\\ magic\\\\ action,\\\\ you\\\\ can\\\\ use\\\\ this\\\\ pearl\\\\ to\\\\ recover\\\\ one\\\\ spent\\\\ spell\\\\ slot\\\\ of\\\\ level\\\\ 3\\\\ or\\\\ lower,\\\\ provided\\\\ the\\\\ pearl\\\\ is\\\\ somewhere\\\\ on\\\\ your\\\\ person\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 Pearl of Power", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-dmg-rod-of-the-pact-keeper-1-4", "kind": "item", "owner": "dmg", "name": "Rod of the Pact Keeper, +1", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^while\\\\ holding\\\\ the\\\\ rod,\\\\ you\\\\ can\\\\ also\\\\ take\\\\ a\\\\ magic\\\\ action\\\\ to\\\\ regain\\\\ one\\\\ spell\\\\ slot\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 Rod of the Pact Keeper, +1", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-dmg-rod-of-the-pact-keeper-2-4", "kind": "item", "owner": "dmg", "name": "Rod of the Pact Keeper, +2", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^while\\\\ holding\\\\ the\\\\ rod,\\\\ you\\\\ can\\\\ also\\\\ take\\\\ a\\\\ magic\\\\ action\\\\ to\\\\ regain\\\\ one\\\\ spell\\\\ slot\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 Rod of the Pact Keeper, +2", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-dmg-rod-of-the-pact-keeper-3-4", "kind": "item", "owner": "dmg", "name": "Rod of the Pact Keeper, +3", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^while\\\\ holding\\\\ the\\\\ rod,\\\\ you\\\\ can\\\\ also\\\\ take\\\\ a\\\\ magic\\\\ action\\\\ to\\\\ regain\\\\ one\\\\ spell\\\\ slot\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 Rod of the Pact Keeper, +3", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-dmg-psionic-rod-of-the-honed-mind-2", "kind": "item", "owner": "dmg", "name": "Psionic Rod of the Honed Mind", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^in\\\\ addition,\\\\ you\\\\ can\\\\ regain\\\\ one\\\\ spell\\\\ slot\\\\ as\\\\ a\\\\ magic\\\\ action\\\\ while\\\\ holding\\\\ the\\\\ rod\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 Psionic Rod of the Honed Mind", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-dmg-tranquil-rod-of-the-honed-mind-2", "kind": "item", "owner": "dmg", "name": "Tranquil Rod of the Honed Mind", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^in\\\\ addition,\\\\ you\\\\ can\\\\ regain\\\\ one\\\\ spell\\\\ slot\\\\ as\\\\ a\\\\ magic\\\\ action\\\\ while\\\\ holding\\\\ the\\\\ rod\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 Tranquil Rod of the Honed Mind", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-dmg-vigilant-rod-of-the-honed-mind-2", "kind": "item", "owner": "dmg", "name": "Vigilant Rod of the Honed Mind", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^in\\\\ addition,\\\\ you\\\\ can\\\\ regain\\\\ one\\\\ spell\\\\ slot\\\\ as\\\\ a\\\\ magic\\\\ action\\\\ while\\\\ holding\\\\ the\\\\ rod\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 Vigilant Rod of the Honed Mind", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-dmg-spell-refueling-ring-1", "kind": "item", "owner": "dmg", "name": "Spell-Refueling Ring", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^while\\\\ wearing\\\\ this\\\\ ring,\\\\ you\\\\ can\\\\ recover\\\\ one\\\\ expended\\\\ spell\\\\ slot\\\\ as\\\\ a\\\\ bonus\\\\ action\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 Spell-Refueling Ring", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-dmg-1-rod-of-the-pact-keeper-2", "kind": "item", "owner": "dmg", "name": "+1 Rod of the Pact Keeper", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^in\\\\ addition,\\\\ you\\\\ can\\\\ regain\\\\ one\\\\ warlock\\\\ spell\\\\ slot\\\\ as\\\\ an\\\\ action\\\\ while\\\\ holding\\\\ the\\\\ rod\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 +1 Rod of the Pact Keeper", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-dmg-2-rod-of-the-pact-keeper-2", "kind": "item", "owner": "dmg", "name": "+2 Rod of the Pact Keeper", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^in\\\\ addition,\\\\ you\\\\ can\\\\ regain\\\\ one\\\\ warlock\\\\ spell\\\\ slot\\\\ as\\\\ an\\\\ action\\\\ while\\\\ holding\\\\ the\\\\ rod\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 +2 Rod of the Pact Keeper", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-dmg-3-rod-of-the-pact-keeper-2", "kind": "item", "owner": "dmg", "name": "+3 Rod of the Pact Keeper", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^in\\\\ addition,\\\\ you\\\\ can\\\\ regain\\\\ one\\\\ warlock\\\\ spell\\\\ slot\\\\ as\\\\ an\\\\ action\\\\ while\\\\ holding\\\\ the\\\\ rod\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 +3 Rod of the Pact Keeper", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-au-psionic-rod-of-the-honed-mind-2", "kind": "item", "owner": "au", "name": "Psionic Rod of the Honed Mind", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^in\\\\ addition,\\\\ you\\\\ can\\\\ regain\\\\ one\\\\ spell\\\\ slot\\\\ as\\\\ a\\\\ magic\\\\ action\\\\ while\\\\ holding\\\\ the\\\\ rod\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 Psionic Rod of the Honed Mind", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-au-tranquil-rod-of-the-honed-mind-2", "kind": "item", "owner": "au", "name": "Tranquil Rod of the Honed Mind", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^in\\\\ addition,\\\\ you\\\\ can\\\\ regain\\\\ one\\\\ spell\\\\ slot\\\\ as\\\\ a\\\\ magic\\\\ action\\\\ while\\\\ holding\\\\ the\\\\ rod\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 Tranquil Rod of the Honed Mind", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-au-vigilant-rod-of-the-honed-mind-2", "kind": "item", "owner": "au", "name": "Vigilant Rod of the Honed Mind", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^in\\\\ addition,\\\\ you\\\\ can\\\\ regain\\\\ one\\\\ spell\\\\ slot\\\\ as\\\\ a\\\\ magic\\\\ action\\\\ while\\\\ holding\\\\ the\\\\ rod\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 Vigilant Rod of the Honed Mind", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-efa-spell-refueling-ring-1", "kind": "item", "owner": "efa", "name": "Spell-Refueling Ring", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^while\\\\ wearing\\\\ this\\\\ ring,\\\\ you\\\\ can\\\\ recover\\\\ one\\\\ expended\\\\ spell\\\\ slot\\\\ as\\\\ a\\\\ bonus\\\\ action\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 Spell-Refueling Ring", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-dmg14-1-rod-of-the-pact-keeper-2", "kind": "item", "owner": "dmg14", "name": "+1 Rod of the Pact Keeper", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^in\\\\ addition,\\\\ you\\\\ can\\\\ regain\\\\ one\\\\ warlock\\\\ spell\\\\ slot\\\\ as\\\\ an\\\\ action\\\\ while\\\\ holding\\\\ the\\\\ rod\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 +1 Rod of the Pact Keeper", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-dmg14-2-rod-of-the-pact-keeper-2", "kind": "item", "owner": "dmg14", "name": "+2 Rod of the Pact Keeper", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^in\\\\ addition,\\\\ you\\\\ can\\\\ regain\\\\ one\\\\ warlock\\\\ spell\\\\ slot\\\\ as\\\\ an\\\\ action\\\\ while\\\\ holding\\\\ the\\\\ rod\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 +2 Rod of the Pact Keeper", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}, {"id": "u43-item-dmg14-3-rod-of-the-pact-keeper-2", "kind": "item", "owner": "dmg14", "name": "+3 Rod of the Pact Keeper", "cls": ["RESOURCE", "SLOT"], "vals": [], "scopeValues": true, "rx": "^in\\\\ addition,\\\\ you\\\\ can\\\\ regain\\\\ one\\\\ warlock\\\\ spell\\\\ slot\\\\ as\\\\ an\\\\ action\\\\ while\\\\ holding\\\\ the\\\\ rod\\\\.$", "anchor": ["src/builder/25d-logic-slot-recovery-sources.js", "genv.__bldSlotRecoveryActivate=function"], "extraAnchors": [["src/builder/25d-logic-slot-recovery-sources.js", "function recoveryCommit("], ["src/builder/03-logic-magic-item-effects.js", "export function slotRecoveryNativeProfile("], ["src/data/lib/slot-recovery.js", "export function recoverSlotRecovery("], ["src/data/lib/slot-recovery.js", "export function assertSlotRecoveryCurrent("], ["src/data/lib/slot-recovery-slots.js", "export function slotRecoverySpentSlots("], ["src/app/32j-logic-slot-recovery.js", "export function requestSlotRecovery("], ["src/app/lib/slot-recovery-action.js", "export function slotRecoveryActionAllowed("], ["src/builder/10-logic-v17-additions.js", "slotRecovery:{v:1,id:recovery.source.id,nativeProfile:recovery.source.nativeProfile}"], ["src/data/lib/slot-recovery.js", "export function recordSlotRecoveryReset("], ["src/app/lib/slot-recovery-rest.js", "export function createSlotRecoveryRestBoundary("]], "test": "Z3 U43 native one-budget recovery source 2024 +3 Rod of the Pact Keeper", "consumerTests": ["tests/slot_recovery_backend.mjs", "tests/slot_recovery_model.mjs", "tests/slot_recovery_slots.mjs", "tests/slot_recovery_runtime.mjs", "tests/slot_recovery_rest.mjs"], "note": "OUTSIDE DRAFT ONLY. Actual native source and paid item-use/eligible spent-slot transaction consumer must pass before registration. Profile follows native item identity; no slot capacity, spell grant, generic legacy Pearl conversion, or unrelated attack/DC evidence."}], "texts": {"item|dmg|Pearl of Power#1": "As a Magic action, you can use this pearl to recover one spent spell slot of level 3 or lower, provided the pearl is somewhere on your person.", "item|dmg|Rod of the Pact Keeper, +1#4": "While holding the rod, you can also take a Magic action to regain one spell slot.", "item|dmg|Rod of the Pact Keeper, +2#4": "While holding the rod, you can also take a Magic action to regain one spell slot.", "item|dmg|Rod of the Pact Keeper, +3#4": "While holding the rod, you can also take a Magic action to regain one spell slot.", "item|dmg|Psionic Rod of the Honed Mind#2": "In addition, you can regain one spell slot as a Magic action while holding the rod.", "item|dmg|Tranquil Rod of the Honed Mind#2": "In addition, you can regain one spell slot as a Magic action while holding the rod.", "item|dmg|Vigilant Rod of the Honed Mind#2": "In addition, you can regain one spell slot as a Magic action while holding the rod.", "item|dmg|Spell-Refueling Ring#1": "While wearing this ring, you can recover one expended spell slot as a Bonus Action.", "item|dmg|+1 Rod of the Pact Keeper#2": "In addition, you can regain one warlock spell slot as an action while holding the rod.", "item|dmg|+2 Rod of the Pact Keeper#2": "In addition, you can regain one warlock spell slot as an action while holding the rod.", "item|dmg|+3 Rod of the Pact Keeper#2": "In addition, you can regain one warlock spell slot as an action while holding the rod.", "item|au|Psionic Rod of the Honed Mind#2": "In addition, you can regain one spell slot as a Magic action while holding the rod.", "item|au|Tranquil Rod of the Honed Mind#2": "In addition, you can regain one spell slot as a Magic action while holding the rod.", "item|au|Vigilant Rod of the Honed Mind#2": "In addition, you can regain one spell slot as a Magic action while holding the rod.", "item|efa|Spell-Refueling Ring#1": "While wearing this ring, you can recover one expended spell slot as a Bonus Action.", "item|dmg14|+1 Rod of the Pact Keeper#2": "In addition, you can regain one warlock spell slot as an action while holding the rod.", "item|dmg14|+2 Rod of the Pact Keeper#2": "In addition, you can regain one warlock spell slot as an action while holding the rod.", "item|dmg14|+3 Rod of the Pact Keeper#2": "In addition, you can regain one warlock spell slot as an action while holding the rod."}}')
    recovery_expected=recovery_spec["entries"]
    recovery_registered=[entry for entry in json.load(open(CODE,encoding="utf-8"))["entries"] if entry.get("id","").startswith("u43-")]
    recovery_native_sources=[open(os.path.join(ROOT,"src/data",filename),encoding="utf-8").read() for filename in os.listdir(os.path.join(ROOT,"src/data")) if filename.endswith(".js")]
    check("U43 exactly18 source claims and5 native sentence hashes",len(recovery_expected)==18 and len(set(recovery_spec["texts"].values()))==5)
    check("U43 no partial registration",len(recovery_registered) in (0,18))
    for entry in recovery_expected:
        text=next(text for sid,text in recovery_spec["texts"].items() if entry["id"]=="u43-"+re.sub("[^a-z0-9]+","-",sid.lower()).strip("-"))
        check("U43 literal native full sentence "+entry["id"],any(json.dumps(text,ensure_ascii=ascii_)[1:-1] in source for source in recovery_native_sources for ascii_ in [True,False]))
        loaded=load_code_atoms([entry]);key="item|"+entry["owner"]+"|"+entry["name"];atoms=[atom for _,atom in loaded.get(key,[])]
        row=analyze(synth("item",entry["owner"],entry["name"],text,atoms))[0]
        check("U43 exact actual native slot consumer "+entry["id"],row["status"]=="covered",row["why"])
        for version in [1,2]:
            check("U43 NEG raw marker is not slot recovery "+entry["id"]+str(version),not atoms_from({"slotRecovery":{"v":version,"id":"recovery-1","nativeProfile":"dmg2024","chargeKey":"s1"}},"raw-recovery"))
        for index in range(len(entry["extraAnchors"])+1):
            damaged=dict(entry)
            if index==0:damaged["anchor"]=[entry["anchor"][0],"U43_DELETED_SLOT_CONSUMER"]
            else:
                damaged["extraAnchors"]=[list(pair) for pair in entry["extraAnchors"]];damaged["extraAnchors"][index-1][1]="U43_DELETED_SLOT_CONSUMER"
            check("U43 NEG missing actual producer or consumer "+entry["id"]+str(index),not load_code_atoms([damaged]));CODE_NOTES.clear()
        changed=text.replace("one warlock spell slot","one wizard spell slot").replace("one spell slot","two spell slots").replace("one expended spell slot","two expended spell slots").replace("one spent spell slot","two spent spell slots").replace("level 3","level 9")
        check("U43 native source mutant differs "+entry["id"],changed!=text)
        check("U43 NEG changed scope or number "+entry["id"],all(row["status"]!="covered" for row in analyze(synth("item",entry["owner"],entry["name"],changed,atoms))))
        for wrong in ["item|wrong-source|"+entry["name"],"item|"+entry["owner"]+"|Other item"]:
            check("U43 NEG unrelated item or source "+entry["id"]+wrong,not loaded.get(wrong))
    recovery_expected_by_id={entry["id"]:entry for entry in recovery_expected}
    for entry in recovery_registered:
        expected=recovery_expected_by_id.get(entry["id"])
        check("U43 registered native consumer exact fields "+entry["id"],bool(expected and all(entry.get(key)==value for key,value in expected.items() if key!="note")))
    # U44 retained reading: actual ability phases and a qualified native D20 consumer.
    necro_spec = json.loads('{"entries":[{"id":"u44-item-dmg-necronomicon-13","kind":"item","owner":"dmg","name":"Necronomicon","cls":["ABIL"],"vals":["2","24","3"],"scopeValues":true,"rx":"^after\\\\ the\\\\ reading,\\\\ your\\\\ intelligence\\\\ rises\\\\ by\\\\ 2\\\\ \\\\(maximum\\\\ 24\\\\)\\\\ and\\\\ your\\\\ wisdom\\\\ falls\\\\ by\\\\ 2\\\\ \\\\(minimum\\\\ 3\\\\)\\\\.$","anchor":["src/builder/11-logic-derivation.js","function applyNecronomiconReading("],"extraAnchors":[["src/data/lib/necronomicon-reading.js","export function necronomiconReadingProfile("],["src/data/lib/necronomicon-reading.js","export function necronomiconProblems("],["src/data/lib/necronomicon-reading.js","export function recordNecronomiconReading("],["src/builder/25e-logic-necronomicon-reading.js","function readingCommit("],["src/builder/25e-logic-necronomicon-reading.js","genv.__bldNecronomiconStudy="],["src/builder/12t-logic-necronomicon-reading.js","id:\'retained-necronomicon-reading\'"],["src/builder/10f-logic-necronomicon-reading.js","export function necronomiconAbilityProjection("],["src/data/lib/necronomicon-reading.js","export function necronomiconProjection("],["src/builder/11-logic-derivation.js","applyNecronomiconReading(actx,core,AFX,GF);"]],"test":"Z3 U44 retained Necronomicon completed reading 2024","consumerTests":["tests/necronomicon_reading_model.mjs","tests/necronomicon_ability.mjs","tests/necronomicon_backend.mjs","tests/necronomicon_base_review.mjs"],"note":"OUTSIDE DRAFT. Replaces old inventory-bound ability evidence with actual once-only reading acquisition and fixed earned deltas; not a new uncovered closure."},{"id":"u44-item-dmg-necronomicon-25","kind":"item","owner":"dmg","name":"Necronomicon","cls":["ADV"],"vals":[],"scopeValues":true,"rx":"^you\\\\ have\\\\ advantage\\\\ on\\\\ charisma\\\\ \\\\(persuasion\\\\)\\\\ checks\\\\ against\\\\ aberrations\\\\ and\\\\ on\\\\ charisma\\\\ \\\\(intimidation\\\\)\\\\ checks\\\\ against\\\\ non\\\\-aberrations\\\\.$","anchor":["src/app/32k-logic-necronomicon-reading.js","export function requestNecronomiconSocialCheck("],"extraAnchors":[["src/data/lib/necronomicon-reading.js","export function necronomiconReadingProfile("],["src/data/lib/necronomicon-reading.js","export function necronomiconProblems("],["src/data/lib/necronomicon-reading.js","export function recordNecronomiconReading("],["src/builder/25e-logic-necronomicon-reading.js","function readingCommit("],["src/builder/25e-logic-necronomicon-reading.js","genv.__bldNecronomiconStudy="],["src/builder/12t-logic-necronomicon-reading.js","id:\'retained-necronomicon-reading\'"],["src/data/lib/necronomicon-reading.js","export function necronomiconSocialCheck("],["src/app/32k-logic-necronomicon-reading.js","export function currentNecronomiconSocialCheck("],["src/app/32k-logic-necronomicon-reading.js","total=D.skill&&D.skill[index]"],["src/app/lib/qualified-skill-roll.js","export function qualifiedSkillMode("],["src/app/lib/qualified-skill-roll.js","export function createQualifiedSkillRollRuntime("],["src/app/lib/qualified-skill-roll.js","dice.roll({bon:check.total},check.mode,check.label"]],"test":"Z3 U44 retained Necronomicon completed reading 2024","consumerTests":["tests/necronomicon_reading_model.mjs","tests/necronomicon_reading_runtime.mjs","tests/necronomicon_reading_ui.mjs"],"note":"OUTSIDE DRAFT. New social clause requires actual native Charisma skill modifier and qualified D20 Advantage consumer; readonly source/FX witness alone is not a roll proof."},{"id":"u44-item-tkdm-necronomicon-13","kind":"item","owner":"tkdm","name":"Necronomicon","cls":["ABIL"],"vals":["2","24","3"],"scopeValues":true,"rx":"^after\\\\ the\\\\ reading,\\\\ your\\\\ intelligence\\\\ rises\\\\ by\\\\ 2\\\\ \\\\(maximum\\\\ 24\\\\)\\\\ and\\\\ your\\\\ wisdom\\\\ falls\\\\ by\\\\ 2\\\\ \\\\(minimum\\\\ 3\\\\)\\\\.$","anchor":["src/builder/11-logic-derivation.js","function applyNecronomiconReading("],"extraAnchors":[["src/data/lib/necronomicon-reading.js","export function necronomiconReadingProfile("],["src/data/lib/necronomicon-reading.js","export function necronomiconProblems("],["src/data/lib/necronomicon-reading.js","export function recordNecronomiconReading("],["src/builder/25e-logic-necronomicon-reading.js","function readingCommit("],["src/builder/25e-logic-necronomicon-reading.js","genv.__bldNecronomiconStudy="],["src/builder/12t-logic-necronomicon-reading.js","id:\'retained-necronomicon-reading\'"],["src/builder/10f-logic-necronomicon-reading.js","export function necronomiconAbilityProjection("],["src/data/lib/necronomicon-reading.js","export function necronomiconProjection("],["src/builder/11-logic-derivation.js","applyNecronomiconReading(actx,core,AFX,GF);"]],"test":"Z3 U44 retained Necronomicon completed reading 2024","consumerTests":["tests/necronomicon_reading_model.mjs","tests/necronomicon_ability.mjs","tests/necronomicon_backend.mjs","tests/necronomicon_base_review.mjs"],"note":"OUTSIDE DRAFT. Replaces old inventory-bound ability evidence with actual once-only reading acquisition and fixed earned deltas; not a new uncovered closure."},{"id":"u44-item-tkdm-necronomicon-25","kind":"item","owner":"tkdm","name":"Necronomicon","cls":["ADV"],"vals":[],"scopeValues":true,"rx":"^you\\\\ have\\\\ advantage\\\\ on\\\\ charisma\\\\ \\\\(persuasion\\\\)\\\\ checks\\\\ against\\\\ aberrations\\\\ and\\\\ on\\\\ charisma\\\\ \\\\(intimidation\\\\)\\\\ checks\\\\ against\\\\ non\\\\-aberrations\\\\.$","anchor":["src/app/32k-logic-necronomicon-reading.js","export function requestNecronomiconSocialCheck("],"extraAnchors":[["src/data/lib/necronomicon-reading.js","export function necronomiconReadingProfile("],["src/data/lib/necronomicon-reading.js","export function necronomiconProblems("],["src/data/lib/necronomicon-reading.js","export function recordNecronomiconReading("],["src/builder/25e-logic-necronomicon-reading.js","function readingCommit("],["src/builder/25e-logic-necronomicon-reading.js","genv.__bldNecronomiconStudy="],["src/builder/12t-logic-necronomicon-reading.js","id:\'retained-necronomicon-reading\'"],["src/data/lib/necronomicon-reading.js","export function necronomiconSocialCheck("],["src/app/32k-logic-necronomicon-reading.js","export function currentNecronomiconSocialCheck("],["src/app/32k-logic-necronomicon-reading.js","total=D.skill&&D.skill[index]"],["src/app/lib/qualified-skill-roll.js","export function qualifiedSkillMode("],["src/app/lib/qualified-skill-roll.js","export function createQualifiedSkillRollRuntime("],["src/app/lib/qualified-skill-roll.js","dice.roll({bon:check.total},check.mode,check.label"]],"test":"Z3 U44 retained Necronomicon completed reading 2024","consumerTests":["tests/necronomicon_reading_model.mjs","tests/necronomicon_reading_runtime.mjs","tests/necronomicon_reading_ui.mjs"],"note":"OUTSIDE DRAFT. New social clause requires actual native Charisma skill modifier and qualified D20 Advantage consumer; readonly source/FX witness alone is not a roll proof."}],"targets":[{"sid":"item|dmg|Necronomicon#13","h":"6f79e4f9","text":"After the reading, your Intelligence rises by 2 (maximum 24) and your Wisdom falls by 2 (minimum 3).","status":"covered"},{"sid":"item|dmg|Necronomicon#25","h":"270dca58","text":"You have Advantage on Charisma (Persuasion) checks against aberrations and on Charisma (Intimidation) checks against non-aberrations.","status":"uncovered"},{"sid":"item|tkdm|Necronomicon#13","h":"6f79e4f9","text":"After the reading, your Intelligence rises by 2 (maximum 24) and your Wisdom falls by 2 (minimum 3).","status":"covered"},{"sid":"item|tkdm|Necronomicon#25","h":"270dca58","text":"You have Advantage on Charisma (Persuasion) checks against aberrations and on Charisma (Intimidation) checks against non-aberrations.","status":"uncovered"}]}')
    necro_expected=necro_spec["entries"]
    necro_registered=[entry for entry in json.load(open(CODE,encoding="utf-8"))["entries"] if entry.get("id","").startswith("u44-")]
    check("U44 exactly2 new social clauses and2 ability replacements",len(necro_expected)==4 and len({entry["id"] for entry in necro_expected})==4 and sum(entry["cls"]==["ADV"] for entry in necro_expected)==2)
    check("U44 all-or-none complete consumer registration",len(necro_registered) in (0,4))
    native_source=open(os.path.join(ROOT,"src/data/tp14-tkdm.js"),encoding="utf-8").read()
    native_match=re.search(r'\["Necronomicon","Wondrous Item","Artifact",1,("(?:\\.|[^"\\])*")',native_source)
    check("U44 actual native Necronomicon source row",bool(native_match))
    native_book=json.loads(native_match.group(1)) if native_match else ""
    surviving_book_atoms=atoms_from({"langs":["Void Speech"],"lu":{"n":"Necronomicon: Dominate Monster","max":1,"reset":"dawn"}},"native-carried-book")
    for entry in necro_expected:
        target=next(row for row in necro_spec["targets"] if entry["id"]=="u44-"+re.sub("[^a-z0-9]+","-",row["sid"].lower()).strip("-"))
        check("U44 literal native source "+entry["id"],target["text"] in native_book)
        loaded=load_code_atoms([entry]);key="item|"+entry["owner"]+"|Necronomicon";atoms=[atom for _,atom in loaded.get(key,[])]
        rows=analyze(synth("item",entry["owner"],"Necronomicon",native_book,atoms+surviving_book_atoms));proof=next(row for row in rows if row["sid"]==target["sid"])
        check("U44 exact actual consumer "+entry["id"],proof["status"]=="covered",proof["why"])
        check("U44 source-scoped values "+entry["id"],bool(atoms and all(atom.scope_values for atom in atoms)))
        for index in range(len(entry["extraAnchors"])+1):
            damaged=dict(entry)
            if index==0:damaged["anchor"]=[entry["anchor"][0],"U44_DELETED_ACTUAL_CONSUMER"]
            else:
                damaged["extraAnchors"]=[list(pair) for pair in entry["extraAnchors"]];damaged["extraAnchors"][index-1][1]="U44_DELETED_ACTUAL_CONSUMER"
            check("U44 NEG deleted acquisition/projection/roll consumer "+entry["id"]+str(index),not load_code_atoms([damaged]));CODE_NOTES.clear()
        changed=target["text"].replace("maximum 24","maximum 25").replace("minimum 3","minimum 2").replace("After the reading","While carrying the book").replace("against aberrations","against fiends").replace("against non-aberrations","against all creatures")
        mutant=analyze(synth("item",entry["owner"],"Necronomicon",changed,atoms+surviving_book_atoms))[0]
        check("U44 NEG wrong source cap/lifetime/target "+entry["id"],changed!=target["text"] and mutant["status"]!="covered")
        for wrong in ["item|wrong-book|Necronomicon","item|"+entry["owner"]+"|Necronomicon Ex Corvis"]:
            check("U44 NEG other source or Ex Corvis "+entry["id"]+wrong,not loaded.get(wrong))
        if entry["cls"]==["ABIL"]:
            for number in [5,11]:
                unrelated=next(row for row in rows if row["sid"].endswith("#"+str(number)))
                check("U44 ABI numbers do not proxy artifact/flavor "+entry["id"]+str(number),unrelated["status"]=="info" and unrelated["why"]=="NUMONLY:TABLE")
    for version in [1,99]:
        check("U44 raw reading metadata is not numerical/ADV evidence "+str(version),not atoms_from({"necronomiconReading":{"v":version,"reading":{"source":"Necronomicon","INT":{"delta":2},"WIS":{"delta":-2},"advantage":True}}},"raw-reading"))
    necro_expected_by_id={entry["id"]:entry for entry in necro_expected}
    for entry in necro_registered:
        expected=necro_expected_by_id.get(entry["id"])
        check("U44 registered exact native consumer fields "+entry["id"],bool(expected and all(entry.get(key)==value for key,value in expected.items() if key!="note")))
    # 8 ACTIVATE
    c8 = synth("feat", "F", "F", "As a bonus action you deal 2d8 radiant damage to one creature within 30 feet.", [], acts=True)
    r = analyze(c8)
    check("8 action card + damage sentence -> info ACTIVATE", r[0]["status"] == "info" and r[0]["why"] == "ACTIVATE", r[0]["why"])
    c8b = synth("feat", "F", "F", "As a bonus action you gain a +2 bonus to AC.", [], acts=True)
    r = analyze(c8b)
    check("8b action card does NOT excuse an AC sentence", r[0]["status"] == "uncovered", r[0]["why"])
    # 9 explicit informational rules (reason codes): positive cases, and the cases that must stay flagged
    def st(kind, name, text, atoms=(), owner="X", acts=False):
        return analyze(synth(kind, owner, name, text, list(atoms), acts))[0]
    r = st("feat", "Cold Caster", "Raise Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.", [Atom("ABIL", {"INT", "WIS", "CHA"}, "feat.asi")])
    check("9a STD:ASI with an ability atom -> info", r["status"] == "info" and r["why"] == "STD:ASI", r["why"])
    r = st("feat", "Cold Caster", "Raise Intelligence, Wisdom, or Charisma by 1, to a maximum of 20.", [])
    check("9b STD:ASI without any ability atom -> flagged", r["status"] == "uncovered", r["why"])
    r = st("feat", "Odd Feat", "Raise Strength by 2, to a maximum of 22.", [Atom("ABIL", {"STR"}, "feat.asi")])
    check("9c ASI line with other numbers (2, 22) -> flagged", r["status"] == "uncovered", r["why"])
    r = st("item", "Wand", "The wand regains all its expended charges at dawn.")
    check("9d REST:NONUM -> info", r["status"] == "info" and r["why"] == "REST:NONUM", r["why"])
    r = st("item", "Wand", "The wand has 7 charges and regains 1d6 of them at dawn.")
    check("9e rest sentence WITH numbers -> flagged", r["status"] == "uncovered", r["why"])
    r = st("species", "Martial Advantage", "Once per turn you deal an extra 2d6 damage to a creature you hit with a weapon attack if it is within 5 ft of an ally of yours.")
    check("9f rider dice on your own weapon hit -> flagged (atkDice exists)", r["status"] == "uncovered", r["why"])
    r = st("sub", "Spectral Strike", "The target takes 3d6 force damage and its speed is 0 until the end of its next turn.")
    check("9g effect on another creature -> info ACTIVE:OTHERS", r["status"] == "info" and r["why"].startswith("ACTIVE") or r["status"] == "info" and r["why"].startswith("FORM"), r["why"])
    r = st("feat", "Boon", "You have Resistance to Lightning and Thunder damage.")
    check("9h own resistance without a record -> flagged", r["status"] == "uncovered", r["why"])
    r = st("species", "Keen Eyes", "You have Darkvision with a range of 120 feet.")
    check("9i own sense without a record -> flagged", r["status"] == "uncovered", r["why"])
    r = st("item", "Lamp", "It sheds Bright Light in a 20-foot radius for 10 minutes.")
    check("9j geometry / duration only -> info NUMONLY:GEOMETRY", r["status"] == "info" and r["why"] == "NUMONLY:GEOMETRY", r["why"])
    r = st("item", "Charm", "You gain a +2 bonus to the thing.")
    check("9k signed bonus with no stat word -> flagged", r["status"] == "uncovered", r["why"])
    r = st("class", "Spellcasting", "When you gain a Rogue level, you can swap one cantrip for another Wizard cantrip.")
    check("9l class table sentence -> info TABLE:CLASS", r["status"] == "info" and r["why"] == "TABLE:CLASS", r["why"])
    r = st("item", "Stone", "A stone has AC 24, 10 hit points, and resistance to all damage.")
    check("9m object stat block -> info OBJECT:STATS", r["status"] == "info" and r["why"] == "OBJECT:STATS", r["why"])
    r = st("item", "Ring", "While wearing the ring you gain a +1 bonus to AC.")
    check("9n equip-state AC bonus without a record -> flagged", r["status"] == "uncovered", r["why"])
    r = st("sub", "Resilience", "While you wear no armor, your base Armor Class equals 10 + your Dexterity modifier + your Charisma modifier.", [Atom("AC", {"CHA"}, "sub.ua")])
    check("9o STD:AC10 with an AC atom -> info", r["status"] == "info" and r["why"] == "STD:AC10", r["why"])
    check("9p every reason code is documented", all(REASONS.get(c) for c in ("FOCUS:SPELLCASTING", "ROLL:LAST_CHARGE", "MOVE:SPEED_REF", "TARGET:SPEED", "KNOW:TARGET_DEFENSES", "STD:PICK_TEXT", "STD:ASI", "STD:AC10", "TABLE:CLASS", "REST:NONUM", "DC:REFERENCE", "OBJECT:STATS", "ITEM:SENSES", "ACTIVE:OTHERS", "ACTIVE:TIMED_IMM", "ACTIVE:TRIGGER", "ACTIVE:REACTION", "COND:PLAY_STATE", "COND:ATTACK_ROLL_ADV", "NUMONLY:ROLL", "NUMONLY:GEOMETRY", "NUMONLY:TABLE", "NUMONLY:FLAVOR", "NUMONLY:ZERO", "NUMONLY:TEXT")))
    # mutation on the synthetic cases
    print("mutation test (synthetic): remove the record, the gate must flag")
    for lab, c in (("Tower Shield sentence 1", c1), ("both records", c1b), ("dice item", c7b)):
        base = analyze(c)
        cov = [x for x in base if x["status"] == "covered"]
        for x in cov:
            kill = analyze(c, atoms=[a for j, a in enumerate(c["atoms"]) if j not in x["used"]])
            y = next(z for z in kill if z["sid"] == x["sid"])
            check("mutation %s %s: record removed -> flagged" % (lab, x["sid"].rsplit("#", 1)[1]), y["status"] == "uncovered", y["why"])
    return fails


# ---------------------------------------------------------------------------------------------------------------- scan and report
def scan(D, by_design, allow, today):
    feats = list(features(D))
    results, ctxs = [], {}
    for ctx in feats:
        rs = analyze(ctx, by_design, allow, today=today)
        for r in rs:
            r["kind"], r["book"], r["owner"], r["name"] = ctx["kind"], ctx["book"], ctx["owner"], ctx["name"]
            r["fkey"] = ctx["key"]
            results.append(r)
        ctxs[ctx["key"]] = ctx
    return feats, results, ctxs


def atom_key(src):
    if src.endswith(".target.missingHp"):
        return src[:-len(".target.missingHp")]
    if src.endswith((".atkSpendDice.perCost", ".atkBonus.dmg")):
        src = src.rsplit(".", 1)[0]
    base, _, last = src.rpartition(".")
    return base if last in FIELD_CLS or last in ("ch", "by", "xd", "wp", "pick", "row", "atk", "dc", "objectRepair") else src


def sources_of(results, ctxs, owners):
    fam, files = collections.Counter(), collections.Counter()
    for r in results:
        if r["status"] != "covered":
            continue
        at = ctxs[r["fkey"]]["atoms"]
        srcs = {at[j].src for j in r["used"]} or {a.src for a in at if a.vals & {t for t, k in r["toks"]}}
        for x in {x.split("|")[0].split(".")[0] for x in srcs}: fam[x] += 1
        fs = set()
        for x in srcs:
            for fl in owners.get(atom_key(x), []): fs.add(fl)
        for x in fs: files[x] += 1
    return fam, files


def mutation_real(feats, results, by_design, allow, today, n=300, seed=7, stat_only=False):
    """Sample covered sentences (fixed seed). Two mutations per sentence:
    record: remove the atoms the sentence used and their siblings from the same record (same source up to the last dot), as if the fx entry were deleted;
    class:  remove every atom of the classes the sentence needs (the feature has no record at all for that class).
    A sentence that has no atom class (numbers only) loses every atom that explains one of its numbers.
    The gate must flag the sentence after the mutation. Returns (tested, killed_record, killed_class, survivors)."""
    rnd = random.Random(seed)
    fmap = {c["key"]: c for c in feats}
    cov = [r for r in results if r["status"] == "covered" and r["kind"] != "spell" and (not stat_only or r["need"] & STAT)]  # a spell without a record is SPELL_TEXT info by design, so it cannot be flagged
    rnd.shuffle(cov)
    tested = kr = kc = 0
    survivors = []
    for r in cov[:n]:
        ctx = fmap[r["fkey"]]
        at = ctx["atoms"]
        sv = {t for t, k in r["toks"]}
        if r["need"]:
            srcs = {at[j].src.rsplit(".", 1)[0] for j in r["used"]}
            rm_rec = set(r["used"]) | {j for j, a in enumerate(at) if a.src.rsplit(".", 1)[0] in srcs and a.cls in r["need"]}
            rm_cls = {j for j, a in enumerate(at) if a.cls in r["need"]}
        else:
            rm_rec = rm_cls = {j for j, a in enumerate(at) if a.vals & sv or "*" in a.vals}
        if not rm_rec:
            continue
        tested += 1
        for rm, label in ((rm_rec, "record"), (rm_cls, "class")):
            rs = analyze(ctx, by_design, allow, today=today, atoms=[a for j, a in enumerate(at) if j not in rm])
            y = next(z for z in rs if z["sid"] == r["sid"])
            if y["status"] == "uncovered" or y.get("fxo_repl"):  # an FXO_NULL item with a replacement entry keeps info FXO_NULL for a sentence the entry does not explain, but the gate counts it apart (fxo_repl)
                if label == "record": kr += 1
                else: kc += 1
            else:
                survivors.append((label, r["sid"], r["text"][:120], y["status"] + (":" + y["why"] if y["status"] == "info" else ""), sorted(r["need"])))
    return tested, kr, kc, survivors


def pct(a, b):
    return "%.1f%%" % (100.0 * a / b) if b else "0%"


def summarize(results, known_gaps):
    S = {}
    S["total"] = len(results)
    S["by_status"] = collections.Counter(r["status"] for r in results)
    mech = [r for r in results if r["mech"]]
    S["mechanical"] = len(mech)
    S["covered"] = sum(1 for r in mech if r["status"] == "covered")
    S["info"] = collections.Counter(r["why"] for r in mech if r["status"] == "info")
    S["allow"] = sum(1 for r in mech if r["status"] == "allow")
    unc = [r for r in mech if r["status"] == "uncovered"]
    S["uncovered"] = len(unc)
    S["unc_num"] = [r for r in unc if r["toks"]]
    S["unc_kw"] = [r for r in unc if r["K"]]  # has a mechanical keyword class
    S["unc_numonly"] = [r for r in unc if not r["K"]]  # only a number (distance, duration, dice ...): often flavor or an activated effect, kept apart
    S["unc_unexplained"] = [r for r in unc if r["unexplained"]]
    S["unc_missing"] = [r for r in unc if r["missing"]]
    S["by_class"] = collections.Counter(c for r in unc for c in (r["K"] or r["nk"] or ["NUM"]))
    S["by_class_all"] = collections.Counter(c for r in mech for c in (r["K"] or r["nk"] or ["NUM"]))
    S["by_book"] = collections.defaultdict(lambda: collections.Counter())
    S["by_kind"] = collections.defaultdict(lambda: collections.Counter())
    for r in mech:
        S["by_book"][r["book"]][r["status"]] += 1
        S["by_kind"][r["kind"]][r["status"]] += 1
    S["known_gap"] = sum(1 for r in unc if r["fkey"] in known_gaps)
    S["unc"] = unc
    return S


def top_class_of(r):
    ks = r["K"]
    for c in CLASS_ORDER:
        if c in ks:
            return c
    return ks[0] if ks else (r["nk"][0] if r["nk"] else "NUM")


def write_outputs(S, mut, selftest_ok, rt, today, results):
    os.makedirs(os.path.dirname(OUT_MD), exist_ok=True)
    L = []
    w = L.append
    w("# Laporan clause gate (mode laporan, %s)\n" % today)
    w("Alat: `tests/clause_gate.py`. Tidak mengubah src/ dan data fx. Tidak gagal build. Dijalankan sebagai langkah laporan dengan `continue-on-error`.\n")
    w("## Ringkasan\n")
    w("| Ukuran | Jumlah |\n|---|---|")
    w("| Kalimat di seluruh teks | %d |" % S["total"])
    w("| Kalimat mekanik (kelas kata kunci atau angka) | %d (%s) |" % (S["mechanical"], pct(S["mechanical"], S["total"])))
    w("| Covered (atom engine per kelas dan semua angka terjelaskan) | %d |" % S["covered"])
    w("| Info (tag terdokumentasi) | %d (%s) |" % (sum(S["info"].values()), ", ".join("%s %d" % kv for kv in S["info"].most_common())))
    w("| Allow (tests/clause_gate_allow.json) | %d |" % S["allow"])
    w("| Uncovered | %d |" % S["uncovered"])
    w("| Uncovered dengan angka | %d |" % len(S["unc_num"]))
    w("| Uncovered dengan kelas kata kunci mekanik | %d |" % len(S["unc_kw"]))
    w("| Uncovered hanya angka (tanpa kelas kata kunci; sering flavor atau efek aktif) | %d |" % len(S["unc_numonly"]))
    w("| Angka yang tidak dijelaskan record mana pun | %d kalimat |" % len(S["unc_unexplained"]))
    w("| Kelas tanpa atom (record tidak ada untuk kelas itu) | %d kalimat |" % len(S["unc_missing"]))
    w("| Uncovered yang fiturnya sudah ada di `gaps` mech_baseline | %d |" % S["known_gap"])
    w("| Waktu | muat data %.0f s, analisis %.0f s |\n" % (rt["load"], rt["scan"]))
    w("Uji mutasi pada data nyata (seed 7): %d kalimat covered diuji. Hapus record yang dipakai kalimat (dan saudaranya dari sumber yang sama): %d ditangkap (%s). Hapus semua atom kelas yang dibutuhkan: %d ditangkap (%s). Selftest sintetis: %s.\n" % (mut[0], mut[1], pct(mut[1], mut[0]), mut[2], pct(mut[2], mut[0]), "lulus" if selftest_ok else "GAGAL"))
    ms = S.get("mut_stat")
    if ms:
        w("Uji mutasi hanya untuk kalimat berkelas stat (AC, HP, SAVE, SPEED, SENSE, PROF, SLOT, INIT, ABIL, RES, IMM; seed 7): %d diuji, record dihapus: %d ditangkap (%s), semua atom kelas dihapus: %d ditangkap (%s). Kalimat covered tanpa kelas stat (aturan istirahat, durasi, jarak) tetap lolos sebagai info sesudah record dihapus, itu disengaja.\n" % (ms[0], ms[1], pct(ms[1], ms[0]), ms[2], pct(ms[2], ms[0])))
    w("Batas: kalimat tanpa angka dan tanpa kata kunci kelas dianggap inert (tidak dilaporkan). Kalimat seperti \"treat the Shield as part of your armor\" lolos. Atom yang menjelaskan angka mencocokkan nilai, bukan makna.\n")
    w("## Cara membaca, dan pemeriksaan manual (2026-11-05)\n")
    w("- Info `SPELL_TEXT`: teks spell hanya dibaca sheet lewat SPELL_FX, jadi spell tanpa record dihitung info, bukan uncovered. `FORM:*` adalah heuristik bentuk kalimat (aksi atau charges, lemparan save atau DC, tabel). Keduanya bisa menyembunyikan kalimat yang sebenarnya perlu record.")
    w("- `FXO_NULL`: item yang `FXO[nama]={fx:null}` (efek lama dibuang dengan sengaja, tercatat di SOURCE-NOTES).")
    w("- Pemeriksaan manual 60 kalimat uncovered acak (berstrata per jenis sumber, seed 20261108): sekitar 12 benar-benar celah record (20 persen), jadi sekitar 80 persen false positive. Kalimat berkelas kata kunci: 11 dari 41 benar (27 persen). Kalimat hanya angka: 1 dari 19 benar (5 persen), hampir semuanya flavor, tabel, atau efek aktif.")
    w("- Sumber false positive terbanyak: efek aktif tanpa kata aksi (rider damage, reroll), tabel kelas (slot, invocations), aturan istirahat tanpa angka, durasi dan jarak cerita, dan bonus kondisional yang memang tidak dihitung sheet.")
    w("- Pemeriksaan manual 58 kalimat tidak ditandai (covered atau info), seed sama: 2 yang mencurigakan (3 persen), yaitu angka yang hanya cocok longgar dengan atom lain (Agent of Order, Circle Forms). Pada putaran audit sebelumnya (sebelum POOL_RX dan aturan ACTS diperketat) 6 dari 60 lolos salah, terutama jumlah charges item yang tersembunyi di bawah FORM:ACTIVATE. Kalimat inert tidak diambil sampelnya.\n")
    w("## Sumber atom yang menutup kalimat covered\n")
    w("| Sumber | Kalimat covered |\n|---|---|")
    for k, n in S["fam"].most_common():
        w("| %s | %d |" % (k, n))
    if S["files"]:
        w("\nBerkas fx (lewat tests/fx_overlap_loader.js) yang menutup paling banyak: " + ", ".join("%s %d" % kv for kv in S["files"].most_common(12)) + ".\n")
    w("## Hitungan per kelas (kalimat bisa masuk beberapa kelas)\n")
    w("| Kelas | Mekanik | Uncovered | Uncovered % |\n|---|---|---|---|")
    for c, n in sorted(S["by_class"].items(), key=lambda kv: -kv[1]):
        w("| %s | %d | %d | %s |" % (c, S["by_class_all"][c], n, pct(n, S["by_class_all"][c])))
    w("\n## Per jenis sumber\n")
    w("| Jenis | Mekanik | Covered | Info | Allow | Uncovered |\n|---|---|---|---|---|---|")
    for k, c in sorted(S["by_kind"].items()):
        w("| %s | %d | %d | %d | %d | %d |" % (k, sum(c.values()), c["covered"], c["info"], c["allow"], c["uncovered"]))
    w("\n## Per buku\n")
    w("| Buku | Mekanik | Covered | Info | Uncovered | Uncovered % |\n|---|---|---|---|---|---|")
    for k, c in sorted(S["by_book"].items(), key=lambda kv: -kv[1]["uncovered"]):
        n = sum(c.values())
        w("| %s | %d | %d | %d | %d | %s |" % (k, n, c["covered"], c["info"], c["uncovered"], pct(c["uncovered"], n)))
    unc_by = collections.defaultdict(list)
    for r in S["unc"]:
        unc_by[top_class_of(r)].append(r)
    w("\n## Kalimat numerik uncovered, urut per kelas (kelas utama = urutan prioritas AC, HP, SAVE ...)\n")
    w("| Kelas utama | Uncovered | Dengan angka |\n|---|---|---|")
    order = sorted(unc_by, key=lambda c: -len(unc_by[c]))
    for c in order:
        w("| %s | %d | %d |" % (c, len(unc_by[c]), sum(1 for r in unc_by[c] if r["toks"])))
    rnd = random.Random(20261105)
    w("\n## Contoh 40 kalimat per kelas teratas (seed tetap)\n")
    for c in order[:10]:
        pool = [r for r in unc_by[c] if r["toks"]] or unc_by[c]
        smp = rnd.sample(pool, min(40, len(pool)))
        w("\n### %s (%d uncovered)\n" % (c, len(unc_by[c])))
        for r in sorted(smp, key=lambda r: r["sid"]):
            w("- `%s` %s | %s" % (r["sid"], r["text"][:220].replace("|", "/"), r["why"]))
    w("\n## Kalimat dengan angka yang tidak dijelaskan record mana pun (30 contoh per jenis, daftar penuh ada di baseline)\n")
    byk = collections.defaultdict(list)
    for r in S["unc_unexplained"]:
        byk[r["kind"]].append(r)
    for k in sorted(byk):
        w("\n### %s (%d)\n" % (k, len(byk[k])))
        for r in rnd.sample(byk[k], min(30, len(byk[k]))):
            w("- `%s` %s | angka: %s" % (r["sid"], r["text"][:200].replace("|", "/"), ",".join(r["unexplained"])))
    if mut[3]:
        w("\n## Mutasi yang lolos (record dihapus tetapi kalimat masih lolos; 30 contoh)\n")
        for lab, sid, t, st, nd in mut[3][:30]:
            w("- %s `%s` %s -> %s" % (lab, sid, t, st))
    open(OUT_MD, "w", encoding="utf-8").write("\n".join(L) + "\n")
    base = {"generated": today, "note": "Report mode. uncovered = mechanical sentences without a covering record; value = text hash. Not used to fail a build.",
            "totals": {"sentences": S["total"], "mechanical": S["mechanical"], "covered": S["covered"], "info": sum(S["info"].values()), "allow": S["allow"],
                       "uncovered": S["uncovered"], "uncovered_with_numbers": len(S["unc_num"]), "uncovered_keyword": len(S["unc_kw"]), "uncovered_number_only": len(S["unc_numonly"]), "numbers_unexplained": len(S["unc_unexplained"])},
            "by_class_uncovered": dict(S["by_class"]), "by_kind": {k: dict(v) for k, v in S["by_kind"].items()},
            "by_book": {k: dict(v) for k, v in S["by_book"].items()},
            "uncovered": {r["sid"]: r["h"] for r in sorted(S["unc"], key=lambda r: r["sid"])},
            "numbers_unexplained": sorted(r["sid"] for r in S["unc_unexplained"])}
    json.dump(base, open(OUT_BASE, "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=False, sort_keys=True)


def audit(results, n, seed):
    rnd = random.Random(seed)
    mech = [r for r in results if r["mech"]]
    unc = [r for r in mech if r["status"] == "uncovered"]
    cov = [r for r in mech if r["status"] in ("covered", "info")]

    def strat(pool, n):
        g = collections.defaultdict(list)
        for r in pool: g[r["kind"]].append(r)
        out, keys = [], sorted(g)
        while len(out) < n and any(g.values()):
            for k in keys:
                if g[k] and len(out) < n:
                    out.append(g[k].pop(rnd.randrange(len(g[k]))))
        return out
    for lab, pool in (("FLAGGED", unc), ("UNFLAGGED", cov)):
        print("=====", lab)
        for r in strat(pool, n):
            print("[%s] %s | K=%s | toks=%s | %s %s | atoms=%s" % (r["sid"], r["text"][:300], ",".join(r["K"]), ",".join(t for t, k in r["toks"]), r["status"], r["why"], r.get("used")))


def main():
    t0 = time.time()
    fails = selftest()
    if "--selftest" in args:
        print("selftest", "FAILED" if fails else "OK")
        return 1 if fails else 0
    dpath = opt("--data", 1)
    spath = opt("--save-data", 1)
    D = json.load(open(dpath[0], encoding="utf-8")) if dpath else load()
    if spath:
        json.dump(D, open(spath[0], "w", encoding="utf-8"), ensure_ascii=False)
    owners = fx_owner_files()
    t_load = time.time() - t0
    build_index(D)
    t1 = time.time()
    by_design, allow = load_by_design(), load_allow()
    today = time.strftime("%Y-%m-%d")
    feats, results, ctxs = scan(D, by_design, allow, today)
    for note in CODE_NOTES:
        print("WARNING", note)
    S = summarize(results, load_known_gaps())
    S["fam"], S["files"] = sources_of(results, ctxs, owners)
    mut = mutation_real(feats, results, by_design, allow, today)
    mut_stat = mutation_real(feats, results, by_design, allow, today, stat_only=True)
    rt = {"load": t_load, "scan": time.time() - t1}
    if "--audit" in args:
        i = args.index("--audit"); audit(results, int(args[i + 1]), int(args[i + 2]))
    print("sentences %d, mechanical %d, covered %d, info %d, allow %d, uncovered %d (with numbers %d, numbers unexplained %d)" % (
        S["total"], S["mechanical"], S["covered"], sum(S["info"].values()), S["allow"], S["uncovered"], len(S["unc_num"]), len(S["unc_unexplained"])))
    print("mutation on real data: %d tested, record-level caught %d, class-level caught %d" % (mut[0], mut[1], mut[2]))
    print("mutation on real data, stat classes only (AC HP SAVE SPEED SENSE PROF SLOT INIT ABIL RES IMM): %d tested, record-level caught %d, class-level caught %d" % (mut_stat[0], mut_stat[1], mut_stat[2]))
    S["mut_stat"] = mut_stat
    print("top uncovered classes:", S["by_class"].most_common(10))
    print("runtime: load %.0fs, scan %.0fs" % (rt["load"], rt["scan"]))
    if "--no-write" not in args:
        write_outputs(S, mut, not fails, rt, today, results)
        print("wrote", OUT_MD, "and", OUT_BASE)
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
