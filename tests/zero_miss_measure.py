#!/usr/bin/env python3
"""Zero miss measure (reports/zm3.md, part A): reads the RESULT SHEET, it does not count sentences.

  python3 tests/zero_miss_measure.py [--list] [--only KIND] [--update-baseline] [--root DIR] [--json OUT]

Universe 2024: the core features that state a measurable effect: 12 class features, 48 subclass features, 10 species traits, 79 feats
(names come from the app data through window.__bldLists and window.__bldData).
Universe 2014 (zero miss 4): the PHB 2014 and DMG 2014 classes and subclasses (window.__bldLists("2014")), the PHB 2014 species and the 38 PHB 2014 feats. The feature list and its text
come from the sheet the 2014 build makes (the "features" groups), because the 2014 tables keep subclasses and long texts in several places. Ids of the 2014 units carry the kinds cls14, sub14,
species14, feat14; the tables are printed once for 2024 and once for 2014 (baseline keys measured and measured14). For each owner a character is built with the builder hooks
(window.__bldFuzz for the class, subclass and species, window.__bldFillFor for a feat, then window.__bldSheetFor, as tests/zero_miss_fx.py does)
at level 20 (level 19 with the feat for a feat), with every play toggle (fx toggle) of the owner switched on.
A feature gets one measure per MECHANICAL CLASS its text states (the class comes from the words of the feature text, see CLASSES):
  AC, SPEED, RES (resistance or immunity), ADV (advantage), PROF (proficiency), RESOURCE (limited use), DICE, SPELL, NUM (initiative, Hit Point maximum).
The sheet is flattened into evidence lines (section, label, text). A measure is
  ok     a computed line of the right class names the feature (its label, or the bold sub-feature names in its text), or the sheet line of that
         class is new when the feature level is reached (level L against level L-1, or the owner against the base build), see DELTA below
  card   only an action card (actions, acts) names the feature: the rule is shown as text, no number is computed
  miss   neither.
The sections of C that never count as evidence: features (the book text), inv, names, the builder choice list.
DELTA is not used for ADV and RES (their lines always name the source). For the other classes it is accepted only when the new lines of that class are at least as many as the features of the same owner, level and class that no name explained
(a lone new line cannot explain two features).
Result: a table per mechanical class (measured, ok, card, miss) and, with --list, the lists of miss and card.
Baseline tests/zero_miss_baseline.json: the miss list and the card list may only get SHORTER. A new miss (or a counted feature that was ok) fails with exit 1.
The lists are kept in the baseline so a diff shows which feature moved. --update-baseline writes the baseline (only when it is not worse, unless --force).
About 2 minutes. Needs playwright."""
import json, os, re, sys, time, functools, http.server, socket, threading, collections

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
args = sys.argv[1:]
if "--root" in args:
    ROOT = os.path.abspath(args[args.index("--root") + 1])
ONLY = args[args.index("--only") + 1] if "--only" in args else None
BASE = os.path.join(HERE, "zero_miss_baseline.json")
OUT = args[args.index("--json") + 1] if "--json" in args else None
CLASSES = ["AC", "SPEED", "RES", "ADV", "PROF", "RESOURCE", "DICE", "SPELL", "NUM", "MASTERY", "D20"]

# ------------------------------------------------------------------------------------------------ reading the feature text
RX = {
    "AC": re.compile(r"(armor class|\bac\b)[^.]{0,60}(\+\d|bonus|equals|increase|base|plus|\bcan be\b)|(\+\d|bonus|add)[^.]{0,40}(armor class|\bac\b)|\bbase armor class\b"),
    "SPEED": re.compile(r"\b(fly|flying|climb|swim|burrow) speed\b|\bspeed (increases|is increased|rises|grows)|your speed (is|becomes)|\+\d+ feet to your speed|(gain|have) a [^.]{0,20}speed|speed rises by|speed increases by"),
    "RES": re.compile(r"\bresistance to\b|\bimmunity to\b|\bimmune to\b|\bresistances? (to|against)\b|\bhave resistance\b|\bgain resistance\b"),
    "ADV": re.compile(r"(?<!dis)advantage\b"),
    "PROF": re.compile(r"proficien\w*|\bexpertise\b"),
    "RESOURCE": re.compile(r"(short|long) rest[^.]{0,60}(regain|expended|restore)|(uses?|times)[^.]{0,40}(short|long) rest|(once|twice) (per|before|until)[^.]{0,20}(short|long) rest|proficiency bonus times|\b(number of|equal to)[^.]{0,30}\buses\b|\bexpend(ed)? (one|a|an|1)\b[^.]{0,30}\buse"),
    "DICE": re.compile(r"\b\d*d(4|6|8|10|12)\b|\b\d+d20\b"),
    "NUM": re.compile(r"\binitiative\b[^.]{0,40}(bonus|add|\+\d)|(bonus|add)[^.]{0,40}\binitiative\b|hit point maximum|hit points? maximum|maximum hit points"),
    "MASTERY": re.compile(r"use the mastery propert(?:y|ies) of (?:those|that)"),
    "D20": re.compile(r"d20 (roll|result)s? (of|below) \d+ or (lower|less)|(count|treat)[^.]{0,40}d20[^.]{0,40}as (a )?\d+|roll of \d+ or lower[^.]{0,30}(count|treat)"),
}
# Reading rules that keep a word from being read as a grant (zero miss 4, reports/zm4.md):
#  PROF: "weapons you're proficient with" and "a skill you have proficiency in" are CONDITIONS of a pick, not a proficiency the feature grants; "Initiative Proficiency" is the
#        Proficiency Bonus added to Initiative (class NUM). Weapon Mastery has its own class MASTERY, a d20 floor (Reliable Talent) has D20.
#  DICE: "pick it or roll 1d6 on the Star Map table / to decide" is a cosmetic table (look of a map, a gift, a manifestation), not a game die.
PROF_COND = re.compile(r"attack with proficiency|(?:weapons?|skills?|tools?|armor|crossbows?|kinds? of \w+|that|which)\b[^.]{0,30}\byou(?:['\u2019]re| are| have)\s+(?:now\s+)?(?:proficient|proficiency)(?: with| in)?|initiative proficiency")
# RES: "overcoming Resistance" and "immune to your aura / Charm" are about the TARGET of the feature, not a resistance of the character.
RES_TARGET = re.compile(r"(?:overcom\w+|ignor\w+|bypass\w*) resistance(?: and immunity)?|(?:are|is|cannot be|can't be) immune to (?:being )?(?:charm\w*|frighten\w*|your \w+)|immune to (?:charm|being frightened|frightened)")
# SPELL: "against your spell save DC", "such as a Lightning Bolt spell" and "as with the Hallow spell" name a spell or the DC, they do not grant spellcasting.
SPELL_REF = re.compile(r"(?:against|using|with) your spell save dc|such as [^.]*|as with the [a-z' ]+ spell")
DICE_COSMETIC = re.compile(r"(?:or )?roll(?:ing)? \d*d\d+ (?:to decide|on the [a-z ]{3,30} table)")
SPELL_WORDS = re.compile(r"(can|may|could) cast\b|always have [^.]{0,60}prepared|\bspell slots?\b|\bcantrips?\b|spell list|spellcasting ability|spell save dc|spell attack|without (expending )?a spell slot|\bprepared\b")
GENERIC = {"your choice", "hit points", "temporary hit points", "ability score increase", "benefit", "prerequisite", "duration", "effect", "damage", "options"}
COMMON_SPELLS = {"Shield", "Light", "Guidance", "Resistance", "Command", "Heroism", "Fly", "Haste", "Bless", "Bane", "Sleep", "Fear", "Message", "Longstrider", "Aid", "Jump", "Alarm", "Entangle", "Confusion", "Blur", "Slow", "Web", "Darkness", "Daylight", "Silence", "Sanctuary", "Smite", "Barkskin", "Reincarnate"}
SKIP_TRAITS = {"Creature Type", "Size", "Speed"}
# Features that sit behind a builder pick or a piece of gear the default build does not take. The unit is also built with each variant and counts as ok when ANY build shows it.
# fz = other base build (Ability scores ...), ch = builder choices, inv = items, a1 = the Ability the feat raises. Reasons in reports/zm4.md.
BREAST = [{"n": "Breastplate", "q": 1, "eq": True}]
VARIANTS = {
    "cls|Druid|Improved Elemental Fury|DICE": [{"ch": {"p7opt": "Primal Strike"}}],
    "sub|Barbarian/Path of the Wild Heart|Aspect of the Wilds|SPEED": [{"ch": {"p6opt": "Panther"}}, {"ch": {"p6opt": "Salmon"}}],
    "feat|Medium Armor Master|Medium Armor Master|AC": [{"fz": {"cls": "Fighter", "lv": 19, "arr": [10, 15, 14, 12, 10, 8]}, "inv": BREAST, "a1": "DEX"}],
    "sub|Bard/College of Dance|Dazzling Footwork|AC": [{"fz": {"cls": "Bard", "sub": "College of Dance", "arr": [10, 15, 14, 12, 10, 13]}, "inv": []}],
    "feat|Martial Weapon Training|Martial Weapon Training|PROF": [{"fz": {"cls": "Wizard", "lv": 19}}],
}
# The sheet calls the row by another name than the feature
ALIAS = {"cls|Warlock|Pact Magic|RESOURCE": ["pact slots"]}


def classes_of(text, spells):
    t = (text or "").lower()
    def view(c):
        if c == "PROF": return PROF_COND.sub(" ", t.replace("proficiency bonus", ""))
        if c == "DICE": return DICE_COSMETIC.sub(" ", t)
        if c == "RES": return RES_TARGET.sub(" ", t)
        return t
    out = [c for c, rx in RX.items() if rx.search(view(c))]
    # SPELL: a spell sentence (cast, prepared, slot, cantrip, spell list ...) or a named spell next to cast / prepared / spell
    ts = SPELL_REF.sub(" ", t)
    if SPELL_WORDS.search(ts) or (re.search(r"\bcast|prepared|\bspell", ts) and any(re.search(r"(?<![a-z])" + re.escape(s) + r"(?![a-z])", ts) for s in spells)):
        out.append("SPELL")
    return out


def base_name(n):
    return re.sub(r"\s+", " ", re.sub(r"\(.*?\)", "", (n or "").lower())).strip()


def name_rx(names):
    ps = [r"(?<![a-z])" + re.escape(x) + r"(?![a-z])" for x in names if len(x) >= 3]
    return re.compile("|".join(ps)) if ps else None


# ------------------------------------------------------------------------------------------------ the page side
JS_DATA = r"""()=>{
 const L=window.__bldLists(), d=window.__bldData(), J=o=>JSON.parse(JSON.stringify(o===undefined?null:o));
 const out={classes:{},species:{},feats:{},tog:{cls:{},sub:{},species:{},feat:{}},spells:window.__spellNames()};
 for(const c of L.cls){ const C=d.classes[c]; const o={f:C.f.map(x=>[x[0],x[1],d.cf[c+'|'+x[1]]||x[2]]),subs:{}};
   for(const s of L.subs[c]){ o.subs[s]=(C.subs[s]||[]).map(x=>[x[0],x[1],d.sub[s+'|'+x[1]]||x[2]]) } out.classes[c]=o }
 for(const s of L.sp){ out.species[s]=J(d.species[s]) }
 for(const k in d.feats){ const f=d.feats[k]; if(f.src||f.hb||/\(2014\)/.test(k)||k==='Ability Score Improvement') continue; if(!f.full&&!f.d) continue; out.feats[k]={cat:f.cat,t:f.full||f.d} }
 out.feats14={}; for(const k in d.feats){ const f=d.feats[k]; if(f.hb==='PHB 2014'&&(f.full||f.d)) out.feats14[k]={cat:f.cat,t:f.full||f.d} }
 out.l14=window.__bldLists('2014');
 const G=window.GX||{}; for(const t of ['cls','sub','species','feat']){ const T=G[t]||{}; for(const n in T){ const ids=[]; (T[n]||[]).forEach(e=>{ if(e&&e.toggle&&e.toggle.id) ids.push(e.toggle.id) }); if(ids.length) out.tog[t][n]=ids } }
 return out}"""

JS_LIB = r"""()=>{
 if(window.__zm) return 1;
 const SRC={core:true,dmg:true,efa:true}; const store={};
 const t=x=>x==null?'':String(x);
 const lines=(C)=>{ const o=[]; const add=(sec,kind,label,text)=>o.push([sec,kind,t(label),t(text)]);
  if(C.ac&&typeof C.ac==='object'){ add('ac','c',C.ac.baseSrc,'base '+C.ac.base); (C.ac.bonus||[]).forEach(b=>add('ac','c',b.s,b.v)); if(C.ac.dex==='max3') add('ac','c','Medium Armor Master','Dexterity modifier cap +3, the rule of the feat') /* the editor names this mode "Up to +3 (Medium Armor Master)" */ }
  add('speed','c',C.speedSrc,'speed '+C.speed); if(C.moves) add('speed','c','',JSON.stringify(C.moves));
  if(C.speeds) for(const k in C.speeds) add('speed','c',C.speeds[k].s,k+' speed '+C.speeds[k].v);
  (C.defenses||[]).forEach(x=>add('def','c',x.s,x.t+': '+x.v)); (C.saveNotes||[]).forEach(x=>add('sn','c',x.s,x.t));
  (C.skills||[]).forEach(s=>{ if(s.p||s.e) add('skill','c',s.src,s.n+(s.e?' expertise':' proficiency')) });
  const ps=C.profSrc||{}; for(const k in ps) (ps[k]||[]).forEach(e=>add('prof','c',e[1],k+': '+e[0]));
  const sv=C.saves||{}; for(const k in sv) add('prof','c',sv[k],'save '+k);
  (C.res||[]).forEach(r=>add('res','c',[r.n,r.f,r.own].join(' | '),r.tag+' max '+r.max+' '+r.reset));
  (C.xdmg||[]).forEach(x=>add('xdmg','c',x.n+' '+x.sub,x.dmg+' '+x.type+' '+x.note));
  (C.attacks||[]).forEach(a=>add('att','c',t(a.dieSrc)+' '+t(a.miscSrc),a.n+' '+t(a.die)+' '+t(a.note)+' '+JSON.stringify(a.xdice||'')));
  (C.hpBonus||[]).forEach(x=>add('num','c',x.s,'hp '+x.v)); (C.initBonus||[]).forEach(x=>add('num','c',x.s,'init '+x.v));
  (C.spells||[]).forEach(s=>add('spell','c',t(s.src)+' '+t(s.mi),s.n)); if(C.spellcasting) add('spellc','c','spellcasting pact magic',JSON.stringify(C.spellcasting));
  (C.itemAdv||[]).forEach(x=>add('def','c','',JSON.stringify(x)));
  if(window.__sit&&window.__sit.table) window.__sit.table.forEach(r=>add('sit','c',(r.f||[]).join(' | '),t(r.n)+' '+(typeof r.s==='string'?r.s:'')+' '+JSON.stringify(r.e||{}))); /* the Situations panel of the sheet (app/34): switchable play states, a static table */
  (C.features||[]).forEach(g=>(g.items||[]).forEach(i=>{ const m=/\*\*(At your level|Your choice)\.?:?\*\*\.?:?\s*(.*)$/.exec(t(i.d)); if(m) add('fnum','c',i.n,m[2]); if(/^Masteries:|\bweapon mastery: /i.test(t(i.d))) add('wm','c',i.n,t(i.d)) })); /* numbers and choices the sheet adds to a feature text (feature numbers, picks) */
  (C.actions||[]).forEach(a=>add('card','k',a.n+' '+t(a.t),t(a.d))); (C.acts||[]).forEach(a=>add('card','k',a.n+' '+t(a.f),t(a.d)));
  return o };
 window.__zm={
  feats(key,lv){ let b=structuredClone(store[key]); b.level=lv||20; const C=window.__bldSheetFor(b); return (C.features||[]).map(g=>({g:g.g,items:(g.items||[]).map(i=>[t(i.n),t(i.s),t(i.full||i.d)])})) },
  base(key,o){ const f=window.__bldFuzz(Object.assign({sp:'Human',bg:'Acolyte',arr:[15,14,13,12,10,8],b2:0,b1:0,lv:20,sub:'',src:SRC,anySub:true},o)); if(!f||!f.b) return f&&f.err||'none'; store[key]=f.b; return null },
  run(reqs){ return reqs.map(r=>{ try{ let b=structuredClone(store[r.key]); b.level=r.lv; if(r.sp) b.species=r.sp;
      if(r.feat){ b.ch=b.ch||{}; b.ch.feat4={feat:r.feat,a1:r.a1||'STR',a2:'CON'}; const b2=window.__bldFillFor(b); if(b2) b=b2;
        /* the picks a feat asks for (a skill for Keen Mind and Observant, a weapon kind for Weapon Master) are left open by the quick fill: take the first options */
        (window.__bldChoiceList(b)||[]).forEach(c=>{ if(c.fk==='feat4'&&!c.done&&c.from&&c.from.length){ b.ch[c.key]=c.from.slice(0,c.n||1) } }) }
      if(r.nosub){ b.sub='' } if(r.ch){ b.ch=Object.assign(b.ch||{},r.ch) } if(r.inv){ b.inv=r.inv }
      const tg={}; (r.tog||[]).forEach(i=>{tg[i]=true}); const C=window.__bldSheetFor(b,Object.keys(tg).length?tg:undefined); return lines(C) }catch(e){ return 'ERR '+String(e).slice(0,120) } }) }
 };
 return 1}"""

# ------------------------------------------------------------------------------------------------ the units
def bk(kind):
    """the kind without the edition mark (cls14 -> cls)"""
    return kind[:-2] if kind.endswith("14") else kind


def units(D, D14=None):
    spells = [s.lower() for s in D["spells"] if len(s) > 4 and s not in COMMON_SPELLS]
    U = []

    def add(kind, owner, name, lvl, text, tg):
        if ONLY and bk(kind) != ONLY:
            return
        cs = classes_of(text, spells)
        spn = [x for x in D["spells"] if re.search(r"(?<![A-Za-z])" + re.escape(x) + r"(?![A-Za-z])", text or "") and len(x) > 5 and x not in COMMON_SPELLS]
        names = [base_name(name)] + [base_name(x) for x in re.findall(r"\*\*([^*]{3,40}?)\.?\*\*", text or "")]
        if bk(kind) == "species":
            names.append(base_name(owner))  # the sheet labels species lines with the species name (Dwarf, Aasimar)
            if kind == "species14" and len(base_name(owner).split()) > 1:
                names.append(base_name(owner).split()[-1])  # Hill Dwarf, High Elf: the sheet says Dwarf, Elf
        names = [x for x in dict.fromkeys(names) if x and x not in GENERIC]
        for c in cs:
            old = [x for x in U if x["id"] == "%s|%s|%s|%s" % (kind, owner, name, c)]
            if old:
                old[0]["lvls"].append(lvl)  # the same feature name at two levels (Reckless Attack, Improved ...): one measure, checked at each of its levels
                continue
            U.append({"id": "%s|%s|%s|%s" % (kind, owner, name, c), "kind": kind, "owner": owner, "name": name, "lvl": lvl, "lvls": [lvl], "cat": c, "names": names, "spn": [x.lower() for x in spn], "tog": tg})

    for cls, o in D["classes"].items():
        for lv, n, tx in o["f"]:
            add("cls", cls, n, lv, tx, D["tog"]["cls"].get(cls, []))
        for sub, fl in o["subs"].items():
            for lv, n, tx in fl:
                add("sub", cls + "/" + sub, n, lv, tx, D["tog"]["cls"].get(cls, []) + D["tog"]["sub"].get(sub, []))
    for sp, o in D["species"].items():
        for tr in o.get("traits", []):
            if tr[0] in SKIP_TRAITS:
                continue
            m = re.search(r"\blevel (\d+)", tr[1] or "")
            add("species", sp, tr[0], int(m.group(1)) if m else 1, tr[1], D["tog"]["species"].get(sp, []))
    for ft, o in D["feats"].items():
        add("feat", ft, ft, 1, o["t"], D["tog"]["feat"].get(ft, []))
    for cls, o in (D14 or {}).get("classes", {}).items():
        for lv, n, tx in o["f"]:
            add("cls14", cls, n, lv, tx, D["tog"]["cls"].get(cls, []))
        for sub, fl in o["subs"].items():
            for lv, n, tx in fl:
                add("sub14", cls + "/" + sub, n, lv, tx, D["tog"]["cls"].get(cls, []) + D["tog"]["sub"].get(sub, []))
    for sp, fl in (D14 or {}).get("species", {}).items():
        for n, tx in fl:
            if n in SKIP_TRAITS:
                continue
            m = re.search(r"\blevel (\d+)", tx or "")
            add("species14", sp, n, int(m.group(1)) if m else 1, tx, D["tog"]["species"].get(sp, []))
    for ft, o in (D14 or {}).get("feats", {}).items():
        add("feat14", ft, ft, 1, o["t"], D["tog"]["feat"].get(ft, []) + D["tog"]["feat"].get(re.sub(r"\s*\(2014\)", "", ft), []))
    return U


SEC = {  # section -> classes it is evidence for, plus the keyword rule below for text sections
    "ac": ["AC"], "speed": ["SPEED"], "skill": ["PROF"], "prof": ["PROF"], "res": ["RESOURCE"], "xdmg": ["DICE"], "att": ["DICE"], "num": ["NUM"], "spell": ["SPELL"], "spellc": ["SPELL"], "wm": ["MASTERY"]}
KW = {"RES": re.compile(r"resist|immun"), "ADV": re.compile(r"advantage|disadvantage|\"adv\""), "SPEED": re.compile(r"\bspeed\b|\bfly|swim|climb|burrow"), "PROF": re.compile(r"proficien|expertise"),
      "DICE": RX["DICE"], "RESOURCE": re.compile(r"\buses?\b|\brest\b"), "SPELL": re.compile(r"spell|cast|\bslots?\b|cantrip"), "AC": re.compile(r"\bac\b|armor class"), "NUM": re.compile(r"initiative|hit point"),
      "MASTERY": re.compile(r"mastery|masteries"), "D20": re.compile(r"9 or lower|count[^.]{0,30}as a 10|treat[^.]{0,30}as a 10")}
TEXT_SEC = {"def", "sn", "card", "xdmg", "att", "res", "sit", "fnum", "wm"}


def line_classes(sec, label, text):
    cs = set(SEC.get(sec, []))
    if sec in TEXT_SEC:
        t = (label + " " + text).lower()
        for c, rx in KW.items():
            if rx.search(t):
                cs.add(c)
    return cs


def prep(lines):
    """lines from the page -> list of (kind, label.lower, text.lower, classes, key)"""
    out = []
    for sec, kind, label, text in lines:
        out.append((kind, label.lower(), text.lower(), line_classes(sec, label.lower(), text.lower()), sec + "|" + label + "|" + text))
    return out


def run_page(root, D=None):
    from playwright.sync_api import sync_playwright
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()

    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=root))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    p = sync_playwright().start()
    b = p.chromium.launch(); pg = b.new_context(service_workers="block").new_page(); pg.set_default_timeout(600000)
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
    pg.goto("http://127.0.0.1:%d/index.html" % port); pg.wait_for_function("()=>!!window.__deferDone")
    pg.evaluate("window.__bldNeed&&window.__bldNeed()"); pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__bldFillFor&&!!window.__bldData&&!!window.__bldSheetFor")
    pg.wait_for_timeout(2500)
    return p, b, pg, srv, errs


def main():
    t0 = time.time()
    p, b, pg, srv, errs = run_page(ROOT)
    D = pg.evaluate(JS_DATA)
    pg.evaluate(JS_LIB)
    cache = {}

    def sheet(key, lv, tog=(), feat=None, sp=None, extra=None):
        """lines of the sheet (prepared), cached. extra = a variant (VARIANTS): choices (ch), items (inv), feat Ability pick (a1)"""
        ex = json.dumps(extra, sort_keys=True) if extra else ""
        k = (key, lv, tuple(tog), feat, sp, ex)
        if k not in cache:
            q = {"key": key, "lv": lv, "tog": list(tog), "feat": feat, "sp": sp}
            if extra: q.update({x: extra[x] for x in ("ch", "inv", "a1", "nosub") if x in extra})
            r = pg.evaluate("(q)=>window.__zm.run(q)", [q])[0]
            if isinstance(r, str):
                raise RuntimeError("build %s: %s" % (k, r))
            cache[k] = prep(r)
        return cache[k]

    # base builds (one fuzz per owner, level 20)
    L = pg.evaluate("window.__bldLists()")
    bases = {}
    for c in D["classes"]:
        e = pg.evaluate("(a)=>window.__zm.base(a[0],a[1])", ["cls|" + c, {"cls": c}])
        if e: print("base error", c, e)
        for s in D["classes"][c]["subs"]:
            e = pg.evaluate("(a)=>window.__zm.base(a[0],a[1])", ["sub|%s/%s" % (c, s), {"cls": c, "sub": s}])
            if e: print("base error", c, s, e)
    for sp in D["species"]:
        e = pg.evaluate("(a)=>window.__zm.base(a[0],a[1])", ["species|" + sp, {"cls": "Fighter", "sp": sp}])
        if e: print("base error", sp, e)
    e = pg.evaluate("(a)=>window.__zm.base(a[0],a[1])", ["feat|base", {"cls": "Fighter", "lv": 19}])
    # 2014: the same, with the 2014 rules; the features and their text are read from the sheet of each base build
    D14 = {"classes": {}, "species": {}, "feats": D["feats14"]}
    if True:
        l14 = D["l14"]; R14 = {"rs": "2014", "sp": "Human (2014)", "bg": "Acolyte (2014)", "src": l14["src"]}
        def call(key, o):
            e = pg.evaluate("(a)=>window.__zm.base(a[0],a[1])", [key, dict(R14, **o)])
            if e: print("base error", key, e)
        def items(key, group):
            out = []
            for g in pg.evaluate("(a)=>window.__zm.feats(a[0],20)", [key]):
                if g["g"] == group or (group.endswith(":") and g["g"].startswith(group)):
                    out += [(n, sv, re.sub(r"\s*\*\*At your level:?\*\*.*$", "", tx, flags=re.S)) for n, sv, tx in g["items"] if not re.match(r"^At level \d+:", tx)]  # rows that only restate a number the sheet computes
            return out
        def lvl_of(sv):
            m = re.search(r"(\d+)\s*$", sv or ""); return int(m.group(1)) if m else 1
        SKIP14 = re.compile(r"^(Core .*|Proficiencies|Equipment|Hit Points|Ability Score Improvement)$")
        for c in l14["cls"]:
            call("cls14|" + c, {"cls": c})
            D14["classes"][c] = {"f": [(lvl_of(sv), n, tx) for n, sv, tx in items("cls14|" + c, c) if not SKIP14.match(n)], "subs": {}}
            for sb in l14["subs"].get(c, []):
                call("sub14|%s/%s" % (c, sb), {"cls": c, "sub": sb})
                D14["classes"][c]["subs"][sb] = [(lvl_of(sv), n, tx) for n, sv, tx in items("sub14|%s/%s" % (c, sb), c + " Subclass: " + sb) if not SKIP14.match(n)]
        for sp in l14["sp"][:l14["sp"].index("Tiefling (2014)") + 1]:
            call("species14|" + sp, {"cls": "Fighter", "sp": sp})
            D14["species"][sp] = [(n, tx) for n, sv, tx in items("species14|" + sp, "Species: " + sp)]
        call("feat14|base", {"cls": "Fighter", "lv": 19})
    U = units(D, D14)
    print("bases %.0fs, %d units (%d from 2014)" % (time.time() - t0, len(U), len([u for u in U if u["kind"].endswith("14")])), flush=True)

    status = {}   # id -> (state, how)

    def match(lines, u, kinds):
        rx = name_rx(u["names"])
        if not rx:
            return False
        for kind, lab, txt, cs, key in lines:
            if kind in kinds and u["cat"] in cs and rx.search(lab if lab.strip() else txt):
                return True
        if u["cat"] == "SPELL" and "c" in kinds and u["spn"]:  # a spell the feature text names is on the sheet (spell list or a limited use row)
            for kind, lab, txt, cs, key in lines:
                if kind == "c" and key.split("|")[0] in ("spell", "res") and any(sn == txt.strip() or sn in lab or sn in txt for sn in u["spn"]):
                    return True
        return False

    # pass 1: names
    groups = collections.defaultdict(list)
    for u in U:
        if bk(u["kind"]) in ("cls", "sub", "species"):
            key, lv, tog, ft, sp = u["kind"] + "|" + u["owner"], 20, u["tog"], None, None
        else:
            key, lv, tog, ft, sp = u["kind"] + "|base", 19, u["tog"], u["name"], None
        u["_b"] = (key, lv, tuple(tog), ft, sp)
        u["names"] = u["names"] + ALIAS.get(u["id"], [])
        L1 = sheet(*u["_b"])
        if match(L1, u, ("c",)):
            status[u["id"]] = ("ok", "name")
        elif match(L1, u, ("k",)):
            status[u["id"]] = ("card", "name")
        for gl in (u["lvls"] if bk(u["kind"]) in ("cls", "sub") else [0]):
            groups[(u["kind"], u["owner"], gl, u["cat"])].append(u)
    print("pass 1 %.0fs, builds %d" % (time.time() - t0, len(cache)), flush=True)

    # pass 2: delta for what the names did not explain
    for (kind, owner, lvl, cat), us in groups.items():
        unmet = [u for u in us if status.get(u["id"], ("", ""))[0] != "ok"]
        if not unmet or cat in ("ADV", "RES"):  # advantage and resistance lines always carry the name of their source: no delta guess
            continue
        named = len([u for u in us if status.get(u["id"], ("",))[0] == "ok"])
        u0 = us[0]
        key, lv, tog, ft, sp = u0["_b"]
        if bk(kind) in ("cls", "sub"):
            if lvl < 2 and kind != "sub14":
                continue
            A = sheet(key, lvl, tog)
            Z = sheet(key, lvl - 1, tog) if lvl >= 2 else sheet(key, lvl, tog, extra={"nosub": 1})  # a 2014 subclass that starts at level 1: the same level without the subclass
        elif bk(kind) == "species":
            A = sheet(key, 20, tog); Z = sheet("species14|Human (2014)" if kind.endswith("14") else "species|Human", 20, ())
        else:
            A = sheet(key, 19, tog, ft); Z = sheet(kind + "|base", 19, ())
        zs = {x[4] for x in Z}
        new_c = [x for x in A if x[4] not in zs and cat in x[3] and x[0] == "c"]
        new_k = [x for x in A if x[4] not in zs and cat in x[3] and x[0] == "k"]
        if len(new_c) - named >= len(unmet) and new_c:
            for u in unmet: status[u["id"]] = ("ok", "delta")
        elif status.get(unmet[0]["id"]) is None and new_k and len(new_k) >= len(unmet):
            for u in unmet:
                if u["id"] not in status: status[u["id"]] = ("card", "delta")
    # pass 3: the builds with a pick or gear the default build does not take (VARIANTS)
    made = set()
    for u in U:
        if status.get(u["id"], ("",))[0] == "ok" or u["id"] not in VARIANTS:
            continue
        for v in VARIANTS[u["id"]]:
            key, lv, tog, ft, sp = u["_b"]
            if v.get("fz"):
                key = "var|" + json.dumps(v["fz"], sort_keys=True); lv = v["fz"].get("lv", lv)
                if key not in made:
                    e = pg.evaluate("(a)=>window.__zm.base(a[0],a[1])", [key, v["fz"]]); made.add(key)
                    if e: print("base error", key, e)
            L = sheet(key, lv, tog, ft, sp, v)
            hit = match(L, u, ("c",))
            if not hit and bk(u["kind"]) in ("cls", "sub"):
                for gl in u["lvls"]:
                    if gl < 2: continue
                    zs = {x[4] for x in sheet(key, gl - 1, tog, ft, sp, v)}
                    if [x for x in sheet(key, gl, tog, ft, sp, v) if x[4] not in zs and u["cat"] in x[3] and x[0] == "c"]:
                        hit = True; break
            if hit:
                status[u["id"]] = ("ok", "variant"); break
    print("pass 2 %.0fs, builds %d" % (time.time() - t0, len(cache)), flush=True)
    b.close(); p.stop(); srv.shutdown()

    base = json.load(open(BASE)) if os.path.exists(BASE) else None
    design = (base or {}).get("by_design", {})   # id -> reason: a sentence the sheet cannot count (effect on another creature, a table rule, a roll table); listed in reports/rules-notes.md
    blank = lambda: {"n": 0, "ok": 0, "card": 0, "design": 0, "miss": 0}
    EDS = ("2024", "2014")
    res = {ed: {c: blank() for c in CLASSES} for ed in EDS}
    by_kind = {ed: {k: blank() for k in ("cls", "sub", "species", "feat")} for ed in EDS}
    miss, card, dlist = [], [], []
    how = collections.Counter()
    for u in U:
        st = status.get(u["id"], ("miss", ""))
        if st[0] == "miss" and u["id"] in design:
            st = ("design", "")
        ed = "2014" if u["kind"].endswith("14") else "2024"
        for tab in (res[ed][u["cat"]], by_kind[ed][bk(u["kind"])]):
            tab["n"] += 1; tab[st[0]] += 1
        how[(ed,) + st] += 1
        (miss if st[0] == "miss" else card if st[0] == "card" else []).append(u["id"])
        if st[0] == "design": dlist.append(u["id"])
    print("\nMeasure %s (%.0fs, %d builds)" % (time.strftime("%Y-%m-%d"), time.time() - t0, len(cache)))
    for ed in EDS:
        print("\n=== Edition %s\n" % ed)
        print("%-9s %8s %6s %6s %6s %6s" % ("class", "measured", "ok", "card", "design", "miss"))
        tot = collections.Counter()
        for c in CLASSES:
            r = res[ed][c]
            if not r["n"]: continue
            print("%-9s %8d %6d %6d %6d %6d" % (c, r["n"], r["ok"], r["card"], r["design"], r["miss"]))
            for k in r: tot[k] += r[k]
        print("%-9s %8d %6d %6d %6d %6d" % ("all", tot["n"], tot["ok"], tot["card"], tot["design"], tot["miss"]))
        print("\n%-9s %8s %6s %6s %6s %6s" % ("owner", "measured", "ok", "card", "design", "miss"))
        for k, r in by_kind[ed].items(): print("%-9s %8d %6d %6d %6d %6d" % (k, r["n"], r["ok"], r["card"], r["design"], r["miss"]))
    print("\nhow:", dict((a + ":" + b2 + ":" + c2, n) for (a, b2, c2), n in how.items()))
    if "--list" in args:
        print("\nMISS (%d)" % len(miss)); [print("  " + x) for x in sorted(miss)]
        print("\nCARD (%d)" % len(card)); [print("  " + x) for x in sorted(card)]
    cur = {"measured": {c: res["2024"][c] for c in CLASSES}, "measured14": {c: res["2014"][c] for c in CLASSES if res["2014"][c]["n"]}, "miss": sorted(miss), "card": sorted(card), "by_design": {k: design[k] for k in sorted(design)}}
    if OUT: json.dump(cur, open(OUT, "w"), indent=1)
    bad = 0
    if base:
        newm = sorted(set(miss) - set(base["miss"]))
        newc = sorted((set(card) | set(miss)) - set(base["card"]) - set(base["miss"])); newc = sorted((set(card) | set(miss)) - set(base["card"]) - set(base["miss"]))
        fixed = sorted(set(base["miss"]) - set(miss))
        print("\nagainst baseline: %d fixed, %d new miss, %d new card-or-miss" % (len(fixed), len(newm), len(newc)))
        for x in newm: print("  NEW MISS " + x)
        for x in newc: print("  NEW CARD " + x)
        bad = len(newm) + len(newc)
    if "--update-baseline" in args:
        if base and bad and "--force" not in args:
            print("not written: the baseline would get worse"); return 1
        json.dump(cur, open(BASE, "w"), indent=1); print("baseline written")
    if errs: print("page errors:", errs[:3])
    return 1 if bad or errs else 0


if __name__ == "__main__":
    sys.exit(main())
