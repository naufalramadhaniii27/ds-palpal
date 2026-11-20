#!/usr/bin/env python3
"""PDF numbers: the exported PDF shows the same numbers as the sheet. One browser page, no downloads.
  python3 tests/pdf_numbers.py [OUTDIR] [--root DIR]
About 16 characters on the 2024 and the 2014 rules (martial, half and full casters, Warlock, multiclass, Monk, Barbarian,
a 2014 Dragonborn, magic weapons and armor with attunement, Bladesong and Shillelagh off) are built by the real builder,
applied to the sheet and drawn by PDFX. The numbers the sheet shows (read from the sheet itself) are compared with the PDF:
form field values on page 1, the text drawn inside a template field elsewhere, and the text of the whole PDF for lists.
Checked: ability scores and mods, saves, skills, passive Perception, AC, initiative, speed, max HP, hit dice, proficiency bonus,
attack rows (name, to-hit, damage), spell save DC and attack, spell slots and pact slots, class uses, extra damage rows, defenses."""
import asyncio, base64, io, json, os, re, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
import pypdf
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); args = sys.argv[1:]
if "--root" in args: i = args.index("--root"); ROOT = os.path.abspath(args[i + 1]); del args[i:i + 2]
OUT = os.path.abspath(args[0]) if args else os.path.join(HERE, "out", "pdf-numbers"); os.makedirs(OUT, exist_ok=True)
FMAP = json.load(open(os.path.join(ROOT, "vendor", "pdf", "pdfx-map.json"), encoding="utf-8"))

S14 = {"phb14": True, "dmg14": True}
# (label, rules, class, subclass, level, species, background, multiclass, inventory [name, attuned])
CASES = [
    ("fighter24-magic", "2024", "Fighter", "Battle Master", 5, "Human", "Soldier", [], [["Longsword, +1", 0], ["Cloak of Protection", 1]]),
    ("paladin24", "2024", "Paladin", "Oath of Devotion", 6, "Dwarf", "Acolyte", [], []),
    ("bladesinger24", "2024", "Wizard", "Bladesinger", 5, "Elf", "Sage", [], [["Ring of Protection", 1]]),
    ("warlock24", "2024", "Warlock", "Fiend Patron", 5, "Tiefling", "Charlatan", [], []),
    ("monk24", "2024", "Monk", "Warrior of the Open Hand", 5, "Human", "Hermit", [], []),
    ("barbarian24", "2024", "Barbarian", "Path of the Berserker", 5, "Goliath", "Soldier", [], []),
    ("druid24", "2024", "Druid", "Circle of the Moon", 3, "Halfling", "Guide", [], []),
    ("sorlock24-mc", "2024", "Sorcerer", "Draconic Sorcery", 3, "Dragonborn", "Noble", [["Warlock", 2]], []),
    ("cleric-fighter24-mc", "2024", "Cleric", "Life Domain", 5, "Human", "Acolyte", [["Fighter", 2]], [["Plate Armor, +1", 0]]),
    ("dragonborn14", "2014", "Fighter", "Champion", 5, "Dragonborn (2014)", "Soldier (2014)", [], []),
    ("paladin14-magic", "2014", "Paladin", "Oath of Vengeance", 5, "Human (2014)", "Acolyte (2014)", [], [["Longsword, +1", 0], ["Ring of Protection", 1]]),
    ("wizard14", "2014", "Wizard", "School of Evocation", 5, "High Elf", "Sage (2014)", [], []),
    ("warlock14", "2014", "Warlock", "The Fiend", 5, "Tiefling (2014)", "Charlatan (2014)", [], []),
    ("monk14", "2014", "Monk", "Way of the Open Hand", 5, "Wood Elf", "Hermit (2014)", [], []),
    ("barbarian14", "2014", "Barbarian", "Path of the Totem Warrior", 5, "Half-Orc", "Sailor (2014)", [], []),
    ("druid14-mc", "2014", "Druid", "Circle of the Land", 4, "Hill Dwarf", "Hermit (2014)", [["Rogue", 2]], []),
]

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port

LOAD = r"""async ()=>{
  const add=u=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=u;s.onload=res;s.onerror=rej;document.head.appendChild(s)});
  if(!window.PDFLib){ for(const u of ['vendor/pdf/cantoo-pdf-lib-2.11.1.min.js','vendor/pdf/pdf-lib-fontkit-1.1.1.min.js']) await add(u); }
  if(!window.PDFX) throw new Error('PDFX block (src/pdf) did not load');
  const b=u=>fetch(u).then(r=>r.arrayBuffer()), F=['Regular','Medium','SemiBold','Bold','Italic'], fonts={};
  for(const f of F) fonts[f]=await b('vendor/pdf/pdfx-Inter-'+f+'.ttf');
  window.__pxA={tpl:{'2014':await b('vendor/pdf/pdfx-tpl-2014.pdf'),'2024':await b('vendor/pdf/pdfx-tpl-2024.pdf')}, map:await (await fetch('vendor/pdf/pdfx-map.json')).json(), fonts:fonts};
  return true; }"""

# build, apply to the open sheet, read what the sheet shows, draw the PDF from the sheet's own character
CASE = r"""async ([lab,rs,cls,sub,lv,sp,bg,mc,inv])=>{
  const r=window.__bldFuzz({rs,cls,sub,lv,sp,bg,arr:[15,14,13,12,10,8],b2:0,b1:0,src:rs==='2014'?{phb14:true,dmg14:true}:undefined});
  if(!r||r.err) return {err:'builder: '+String(r&&r.err).slice(0,300)};
  let b=r.b; if(mc.length){ b.mc=mc.map(x=>({cls:x[0],lv:x[1],sub:''})); b.level=lv+mc.reduce((t,x)=>t+x[1],0); }
  if(inv.length) b.inv=(b.inv||[]).concat(inv.map(x=>({n:x[0],q:1,eq:true,att:!!x[1]})));
  b=window.__bldFillFor(b)||b;
  const c=window.__bldSheetFor(b); if(!c||!c.abilities) return {err:'sheet: no character'};
  window.__sheetApply(c,false); await new Promise(f=>setTimeout(f,50));
  const q=s=>document.querySelector(s), tx=e=>{ if(!e) return null; e=e.cloneNode(true); e.querySelectorAll('svg').forEach(x=>x.remove()); return e.textContent.replace(/\s+/g,' ').trim(); }, Dx=window.__D();
  const sh={ab:{},save:{},skill:{},atk:[],xd:[],sc:[]};
  ['STR','DEX','CON','INT','WIS','CHA'].forEach(k=>{ sh.ab[k]=[String(Dx.score[k]),tx(q('[data-bd="ab-'+k+'"] .s'))===String(Dx.score[k])?tx(q('[data-bd="ab-'+k+'"] .m')):tx(q('[data-bd="ab-'+k+'"] .s'))];
    sh.save[k]=tx(q('#saves [data-bd="save-'+k+'"]')); });
  const C=window.__sheetState().C;
  C.skills.forEach((s,i)=>{ sh.skill[s.n]=tx(q('#skills [data-bd="sk-'+i+'"]')); });
  sh.ac=String(Dx.ac);/* the tile animates its digits */ sh.init=tx(q('#tiles [data-bd="init"] .v')); sh.pb=tx(q('#tiles [data-bd="pb"] .v'));
  sh.speed=tx(q('#tiles [data-bd="speed"] .v')); sh.passive=tx(q('[data-bd="pas-per"]')); sh.hpmax=tx(q('#hpMax [data-bd="hp"]'));
  document.querySelectorAll('#actBody .arow').forEach(row=>{ const h=row.querySelector('[data-bd^="ah-"]'), d=row.querySelector('[data-bd^="ad-"]'), n=row.querySelector('.an .tx');
    if(h) sh.atk.push([tx(n),tx(h),tx(d)]); else if(row.classList.contains('xd')) sh.xd.push([tx(n), tx(row.querySelectorAll('.abox')[1])]); });
  document.querySelectorAll('[data-bd^="spdc"]').forEach((e,i)=>{ const a=document.querySelectorAll('[data-bd^="spatk"]')[i]; sh.sc.push([tx(e.querySelector('b')),tx(a&&a.querySelector('b'))]); });
  sh.slots=tx(q('.sp-slots'));
  sh.res=(Dx.res||[]).map(x=>({k:x.k,n:x.n,max:x.max,pool:!!x.pool}));
  sh.defs=(C.defenses||[]).concat(Dx.cf&&Dx.cf.res?Dx.cf.res:[]).filter(d=>d&&d.t&&d.t!=='Note').map(d=>[d.t,String(d.v)]);
  sh.defsText=tx(q('#defs'));
  sh.spc=C.spellcasting?{slots:(C.spellcasting.slots||[]).slice(), pact:C.spellcasting.pact||null}:null;
  sh.level=Dx.level; sh.hitDie=C.hitDie;
  const m=window.__pdfModelNow(); if(!m||m.err) return {err:'model: '+String(m&&m.err).slice(0,300)};
  const out=await PDFX.render(m,window.__pxA,{PDFLib:window.PDFLib,fontkit:window.fontkit});
  let s=''; const u=new Uint8Array(out.bytes); for(let i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));
  return {sh, pdf:btoa(s), weapons:m.weapons, attackNotes:m.attackNotes}; }"""


def norm(v):
    return re.sub(r"\s+", " ", str(v if v is not None else "")).replace("−", "-").strip()


class Pdf:
    """field value: the form value on page 1, or the text drawn inside the field's box"""
    def __init__(self, raw, ed):
        self.r = pypdf.PdfReader(io.BytesIO(raw)); self.map = FMAP[ed]
        self.form = {k: norm(v.get("/V")) for k, v in (self.r.get_fields() or {}).items() if v.get("/V") not in (None, "")}
        self.drawn = {}
        for pi, p in enumerate(self.r.pages[:3]):
            bits = []
            def vis(t, cm, tm, fd, fs, bits=bits):
                if t and t.strip():
                    m = pypdf.mult(tm, cm); bits.append((m[4], m[5], t))
            p.extract_text(visitor_text=vis); self.drawn[pi] = bits
        self.text = norm(" ".join((p.extract_text() or "") for p in self.r.pages) + " " + " ".join(self.form.values()))

    def field(self, name):
        if name in self.form: return self.form[name]
        r = self.map.get(name)
        if not r: return None
        pg, x0, y0, x1, y1 = r[:5]
        hits = sorted([b for b in self.drawn.get(pg, []) if x0 - 1 <= b[0] <= x1 + 1 and y0 - 1 <= b[1] <= y1 + 1], key=lambda b: (-round(b[1]), b[0]))
        return norm("".join(b[2] for b in hits)) or None


def dmg_parts(s):
    return re.sub(r"\s+", "", norm(s)).lower()


def compare(lab, ed, d, bad, cnt):
    sh = d["sh"]; P = Pdf(base64.b64decode(d["pdf"]), ed)
    open(os.path.join(OUT, lab + ".pdf"), "wb").write(base64.b64decode(d["pdf"]))
    def eq(what, sheet, pdf):
        cnt[0] += 1
        if norm(sheet) != norm(pdf): bad.append("%s %s: sheet %r, pdf %r" % (lab, what, norm(sheet), norm(pdf)))
    def has(what, s):
        cnt[0] += 1
        if norm(s) not in P.text: bad.append("%s %s: %r not in the PDF" % (lab, what, norm(s)))
    mods = {"STR": "STRmod", "DEX": "DEXmod ", "CON": "CONmod", "INT": "INTmod", "WIS": "WISmod", "CHA": "CHamod"}
    for k, (sc, md) in sh["ab"].items():
        eq(k + " score", sc, P.field(k)); eq(k + " mod", md, P.field(mods[k]))
    for k, f in zip(["STR", "DEX", "CON", "INT", "WIS", "CHA"], ["ST Strength", "ST Dexterity", "ST Constitution", "ST Intelligence", "ST Wisdom", "ST Charisma"]):
        eq("save " + k, sh["save"][k], P.field(f))
    sk = dict([["Acrobatics", "Acrobatics"], ["Animal Handling", "Animal"], ["Arcana", "Arcana"], ["Athletics", "Athletics"], ["Deception", "Deception "], ["History", "History "],
               ["Insight", "Insight"], ["Intimidation", "Intimidation"], ["Investigation", "Investigation "], ["Medicine", "Medicine"], ["Nature", "Nature"], ["Perception", "Perception "],
               ["Performance", "Performance"], ["Persuasion", "Persuasion"], ["Religion", "Religion"], ["Sleight of Hand", "SleightofHand"], ["Stealth", "Stealth "], ["Survival", "Survival"]])
    for n, f in sk.items(): eq("skill " + n, sh["skill"].get(n), P.field(f))
    eq("passive", sh["passive"], P.field("Passive")); eq("AC", sh["ac"], P.field("AC")); eq("initiative", sh["init"], P.field("Initiative"))
    eq("proficiency", sh["pb"], P.field("ProfBonus")); eq("max HP", sh["hpmax"], P.field("HPMax"))
    eq("speed", re.sub(r"ft$", " ft", norm(sh["speed"]).replace(" ", "")), P.field("Speed"))
    hd = [x for x in sh["res"] if x["k"] == "hd" or x["k"].startswith("hd-d")]
    want = " + ".join("%s%s" % (x["max"], ("d" + re.search(r"d(\d+)", x["k"] + " " + x["n"]).group(1)) if re.search(r"d(\d+)", x["k"] + " " + x["n"]) else "") for x in hd) if hd else "%sd%s" % (sh["level"], sh["hitDie"])
    eq("hit dice", want, P.field("HDTotal")); eq("hit dice left", str(sum(x["max"] for x in hd)) if hd else str(sh["level"]), P.field("HD"))
    rows = [["Wpn Name", "Wpn1 AtkBonus", "Wpn1 Damage"], ["Wpn Name 2", "Wpn2 AtkBonus ", "Wpn2 Damage "], ["Wpn Name 3", "Wpn3 AtkBonus  ", "Wpn3 Damage "]]
    for i, a in enumerate(sh["atk"]):
        if i < 3:
            eq("attack %d name" % (i + 1), a[0], P.field(rows[i][0])); eq("attack %s to-hit" % a[0], a[1], P.field(rows[i][1]))
            cnt[0] += 1
            if dmg_parts(a[2]) != dmg_parts(P.field(rows[i][2])): bad.append("%s attack %s damage: sheet %r, pdf %r" % (lab, a[0], norm(a[2]), P.field(rows[i][2])))
        else:
            has("attack %s" % a[0], a[0]); has("attack %s to-hit" % a[0], a[0] + " " + a[1])
    for x in sh["xd"]:
        has("extra damage row " + x[0], x[0]); cnt[0] += 1
        if dmg_parts(x[1]) not in dmg_parts(P.text): bad.append("%s extra damage %s: %r not in the PDF" % (lab, x[0], norm(x[1])))
    if sh["sc"]:
        eq("spell save DC", sh["sc"][0][0], P.field("SpellSaveDC  2")); eq("spell attack", sh["sc"][0][1], P.field("SpellAtkBonus 2"))
    if sh["spc"]:
        tot = {}
        for i, n in enumerate(sh["spc"]["slots"]):
            if n: tot[i + 1] = n
        pc = sh["spc"]["pact"]
        if pc and int(pc.get("lvl") or 0):
            pr = [x for x in sh["res"] if x["k"] == "pact"]
            tot[int(pc["lvl"])] = tot.get(int(pc["lvl"]), 0) + int(pc.get("n") or (pr and pr[0]["max"]) or 0)
        for lv, n in tot.items():
            fld = FMAP["spells"]["slots"][str(lv)][0]
            eq("slots level %d" % lv, n, P.field(fld))
    for x in sh["res"]:
        if x["k"] in ("pact",) or x["k"] == "hd" or x["k"].startswith("hd-d") or re.match(r"^s\d$", x["k"]): continue
        n = re.sub(r"<[^>]+>", "", x["n"])
        has("uses " + n, "%s. %s %s" % (n, x["max"], "points" if x["pool"] else ("use" if str(x["max"]) == "1" else "uses")))
    for t, v in sh["defs"]:
        has("defense %s" % t, v)
    return P


async def main():
    srv, base = serve(); bad = []; cnt = [0]; errs = []; info = {}
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page(viewport={"width": 1250, "height": 850})
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await pg.goto(base); await pg.evaluate("()=>{localStorage.clear()}"); await pg.reload()
        await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone", timeout=60000)
        await pg.evaluate("()=>window.__bldNeed?window.__bldNeed().then(()=>1):1")
        await pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__pdfModelFor&&!!window.__sheetApply", timeout=120000)
        await pg.evaluate(LOAD)
        for c in CASES:
            d = await pg.evaluate(CASE, list(c))
            if d.get("err"): bad.append("%s %s" % (c[0], d["err"])); continue
            n0 = cnt[0]; compare(c[0], c[1], d, bad, cnt); info[c[0]] = {"checks": cnt[0] - n0, "attacks": d["sh"]["atk"], "xd": d["sh"]["xd"], "sc": d["sh"]["sc"]}
        await b.close()
    srv.shutdown()
    json.dump(info, open(os.path.join(OUT, "result.json"), "w"), indent=1)
    for e in errs: bad.append("page error: " + e)
    for x in bad: print("FAIL", x)
    print("%d characters, %d numbers checked, %s" % (len(CASES), cnt[0], "ok" if not bad else "%d mismatches" % len(bad)))
    return 1 if bad else 0

sys.exit(asyncio.run(main()))
