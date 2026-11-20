#!/usr/bin/env python3
"""Subclass numbers on the computed sheet, 2024 rules: every core subclass of the 12 PHB 2024 classes and the EFotA Artificer, levels 3 to 20.
  python3 tests/subclass_resources.py [--root DIR]
Same builds as tests/class_resources.py (window.__bldFuzz, Human, Soldier, array 15 14 13 12 10 8 in STR..CHA order: INT +1, WIS 0,
CHA -1 before Quick Build feats). Checks resource maxima (c.res), damage rows (c.xdmg, dice only where the added modifier can move with
Quick Build ability increases), resistances (c.defenses), HP bonus, AC base, speed and always-prepared subclass spells. Exit 1 on any difference."""
import asyncio, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); a = sys.argv[1:]
if "--root" in a: ROOT = os.path.abspath(a[a.index("--root") + 1])

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", p), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start(); return "http://127.0.0.1:%d/index.html" % p

def T(*runs):  # T((n, v), ...) -> per-level list: value v from level n on
    o = [None] * 20
    for n, v in runs:
        for i in range(n - 1, 20): o[i] = v
    return o

# subclass -> [(level, "spells always prepared from that level")] (PHB 2024, EFotA)
SP = {
 "Path of the Wild Heart": [(3, "Beast Sense,Speak with Animals"), (10, "Commune with Nature")],
 "College of Glamour": [(3, "Charm Person,Mirror Image"), (6, "Command")],
 "Life Domain": [(3, "Aid,Bless,Cure Wounds,Lesser Restoration"), (5, "Mass Healing Word,Revivify"), (7, "Aura of Life,Death Ward"), (9, "Greater Restoration,Mass Cure Wounds")],
 "Light Domain": [(3, "Burning Hands,Faerie Fire,Scorching Ray,See Invisibility"), (5, "Daylight,Fireball"), (7, "Arcane Eye,Wall of Fire"), (9, "Flame Strike,Scrying")],
 "Trickery Domain": [(3, "Charm Person,Disguise Self,Invisibility,Pass without Trace"), (5, "Hypnotic Pattern,Nondetection"), (7, "Confusion,Dimension Door"), (9, "Dominate Person,Modify Memory")],
 "War Domain": [(3, "Guiding Bolt,Magic Weapon,Shield of Faith,Spiritual Weapon"), (5, "Crusader's Mantle,Spirit Guardians"), (7, "Fire Shield,Freedom of Movement"), (9, "Hold Monster,Steel Wind Strike")],
 "Circle of the Moon": [(3, "Cure Wounds,Moonbeam,Starry Wisp"), (5, "Conjure Animals"), (7, "Fount of Moonlight"), (9, "Mass Cure Wounds")],
 "Circle of the Sea": [(3, "Fog Cloud,Gust of Wind,Ray of Frost,Shatter,Thunderwave"), (5, "Lightning Bolt,Water Breathing"), (7, "Control Water,Ice Storm"), (9, "Conjure Elemental,Hold Monster")],
 "Circle of the Stars": [(3, "Guidance,Guiding Bolt")],
 "Oath of Devotion": [(3, "Protection from Evil and Good,Shield of Faith"), (5, "Aid,Zone of Truth"), (9, "Beacon of Hope,Dispel Magic"), (13, "Freedom of Movement,Guardian of Faith"), (17, "Commune,Flame Strike")],
 "Oath of Glory": [(3, "Guiding Bolt,Heroism"), (5, "Enhance Ability,Magic Weapon"), (9, "Haste,Protection from Energy"), (13, "Compulsion,Freedom of Movement"), (17, "Legend Lore,Yolande's Regal Presence")],
 "Oath of the Ancients": [(3, "Ensnaring Strike,Speak with Animals"), (5, "Misty Step,Moonbeam"), (9, "Plant Growth,Protection from Energy"), (13, "Ice Storm,Stoneskin"), (17, "Commune with Nature,Tree Stride")],
 "Oath of Vengeance": [(3, "Bane,Hunter's Mark"), (5, "Hold Person,Misty Step"), (9, "Haste,Protection from Energy"), (13, "Banishment,Dimension Door"), (17, "Hold Monster,Scrying")],
 "Fey Wanderer": [(3, "Charm Person"), (5, "Misty Step"), (9, "Summon Fey"), (13, "Dimension Door"), (17, "Mislead")],
 "Gloom Stalker": [(3, "Disguise Self"), (5, "Rope Trick"), (9, "Fear"), (13, "Greater Invisibility"), (17, "Seeming")],
 "Aberrant Sorcery": [(3, "Arms of Hadar,Calm Emotions,Detect Thoughts,Dissonant Whispers,Mind Sliver"), (5, "Hunger of Hadar,Sending"), (7, "Evard's Black Tentacles,Summon Aberration"), (9, "Rary's Telepathic Bond,Telekinesis")],
 "Clockwork Sorcery": [(3, "Aid,Alarm,Lesser Restoration,Protection from Evil and Good"), (5, "Dispel Magic,Protection from Energy"), (7, "Freedom of Movement,Summon Construct"), (9, "Greater Restoration,Wall of Force")],
 "Draconic Sorcery": [(3, "Alter Self,Chromatic Orb,Command,Dragon's Breath"), (5, "Fear,Fly"), (7, "Arcane Eye,Charm Monster"), (9, "Legend Lore,Summon Dragon")],
 "Archfey Patron": [(3, "Calm Emotions,Faerie Fire,Misty Step,Phantasmal Force,Sleep"), (5, "Blink,Plant Growth"), (7, "Dominate Beast,Greater Invisibility"), (9, "Dominate Person,Seeming")],
 "Celestial Patron": [(3, "Aid,Cure Wounds,Guiding Bolt,Lesser Restoration,Light,Sacred Flame"), (5, "Daylight,Revivify"), (7, "Guardian of Faith,Wall of Fire"), (9, "Greater Restoration,Summon Celestial")],
 "Fiend Patron": [(3, "Burning Hands,Command,Scorching Ray,Suggestion"), (5, "Fireball,Stinking Cloud"), (7, "Fire Shield,Wall of Fire"), (9, "Geas,Insect Plague")],
 "Great Old One Patron": [(3, "Detect Thoughts,Dissonant Whispers,Phantasmal Force,Tasha's Hideous Laughter"), (5, "Clairvoyance,Hunger of Hadar"), (7, "Confusion,Summon Aberration"), (9, "Modify Memory,Telekinesis"), (10, "Hex")],
 "Abjurer": [(10, "Counterspell,Dispel Magic")],
 "Alchemist": [(3, "Healing Word,Ray of Sickness"), (5, "Flaming Sphere,Melf's Acid Arrow"), (9, "Gaseous Form,Mass Healing Word"), (13, "Death Ward,Vitriolic Sphere"), (17, "Cloudkill,Raise Dead")],
 "Armorer": [(3, "Magic Missile,Thunderwave"), (5, "Mirror Image,Shatter"), (9, "Hypnotic Pattern,Lightning Bolt"), (13, "Fire Shield,Greater Invisibility"), (17, "Passwall,Wall of Force")],
 "Artillerist": [(3, "Shield,Thunderwave"), (5, "Scorching Ray,Shatter"), (9, "Fireball,Wind Wall"), (13, "Ice Storm,Wall of Fire"), (17, "Cone of Cold,Wall of Force")],
 "Battle Smith": [(3, "Heroism,Shield"), (5, "Shining Smite,Warding Bond"), (9, "Aura of Vitality,Conjure Barrage"), (13, "Aura of Purity,Fire Shield"), (17, "Banishing Smite,Mass Cure Wounds")],
 "Cartographer": [(3, "Faerie Fire,Guiding Bolt,Healing Word"), (5, "Locate Object,Mind Spike"), (9, "Call Lightning,Clairvoyance"), (13, "Banishment,Locate Creature"), (17, "Scrying,Teleportation Circle")],
}

PSI = T((3, 4), (5, 6), (9, 8), (13, 10), (17, 12)); PSID = T((3, "d6"), (5, "d8"), (11, "d10"), (17, "d12"))
MA = T((3, "d6"), (5, "d8"), (11, "d10"), (17, "d12"))
P = {  # subclass -> {key: per-level list}; key 'res:Name', 'xd:Name' (dice before any +/- modifier), 'def:Type:Value', 'hpSub', 'acBase', 'speed', 'nores:Name', 'noxd:Name'
 "Path of the Berserker": {"xd:Frenzy": T((3, "2d6"), (9, "3d6"), (16, "4d6")), "res:Intimidating Presence": T((14, 1))},
 "Path of the Zealot": {"res:Warrior of the Gods": T((3, 4), (6, 5), (12, 6), (17, 7)), "xd:Divine Fury": ["1d6+%d" % (l // 2) if l >= 3 else None for l in range(1, 21)]},
 "College of Glamour": {"res:Mantle of Majesty": T((6, 1)), "res:Unbreakable Majesty": T((14, 1))},
 "Light Domain": {"xd:Radiance of the Dawn": ["2d10+%d" % l if l >= 3 else None for l in range(1, 21)], "res:Warding Flare": T((3, 1)), "res:Corona of Light": T((17, 1))},
 "War Domain": {"res:War Priest": T((3, 1)), "def:Resistance:Bludgeoning, Piercing, Slashing": T((17, True))},
 "Circle of the Land": {"xd:Land's Aid": T((3, "2d6"), (10, "3d6"), (14, "4d6")), "def:Immunity:Poisoned": T((10, True))},
 "Circle of the Moon": {"res:Moonlight Step": T((10, 1))},
 "Circle of the Sea": {"xd:Wrath of the Sea": T((3, "1d6"))},
 "Circle of the Stars": {"res:Star Map: Guiding Bolt": T((3, 1)), "res:Cosmic Omen": T((6, 1))},
 "Battle Master": {"res:Know Your Enemy": T((7, 1))},
 "Psi Warrior": {"res:Psionic Energy Dice": PSI, "xd:Psionic Strike": [("1" + d) if d else None for d in PSID], "res:Telekinetic Movement": T((3, 1)),
                 "res:Psi-Powered Leap": T((7, 1)), "res:Bulwark of Force": T((15, 1)), "def:Resistance:Psychic": T((10, True))},
 "Warrior of Mercy": {"xd:Hand of Harm": [("1" + d) if d else None for d in MA], "res:Hand of Ultimate Mercy": T((17, 1))},
 "Warrior of the Elements": {"xd:Elemental Burst": T((6, "3d8"), (11, "3d10"), (17, "3d12"))},
 "Warrior of the Open Hand": {"xd:Quivering Palm": T((17, "10d12"))},
 "Oath of Devotion": {"xd:Holy Nimbus": T((20, "5")), "def:Immunity:Charmed condition (you and your allies, while inside your Aura of Protection)": T((7, True))},
 "Oath of Glory": {"noxd:Holy Nimbus": T((3, True)), "speed": T((3, 30), (7, 40))},
 "Oath of the Ancients": {"noxd:Holy Nimbus": T((3, True)), "def:Resistance:Necrotic, Psychic, Radiant": T((7, True)), "res:Undying Sentinel": T((15, 1))},
 "Oath of Vengeance": {"noxd:Holy Nimbus": T((3, True))},
 "Fey Wanderer": {"xd:Dreadful Strikes": T((3, "1d4"), (11, "1d6")), "res:Fey Reinforcements: Summon Fey": T((11, 1))},
 "Gloom Stalker": {"xd:Dreadful Strike": T((3, "2d6"), (11, "2d8")), "res:Dreadful Strike": T((3, 1))},
 "Hunter": {"xd:Colossus Slayer": T((3, "1d8"))},
 "Arcane Trickster": {"res:Spell Thief": T((17, 1))},
 "Assassin": {"xd:Assassinate": [str(l) if l >= 3 else None for l in range(1, 21)], "xd:Envenom Weapons": T((13, "2d6"))},
 "Soulknife": {"res:Psionic Energy Dice": PSI, "res:Psychic Veil": T((13, 1)), "res:Rend Mind": T((17, 1))},
 "Aberrant Sorcery": {"def:Resistance:Psychic": T((6, True)), "xd:Warping Implosion": T((18, "3d10"))},
 "Clockwork Sorcery": {"res:Restore Balance": T((3, 1)), "res:Trance of Order": T((14, 1)), "res:Clockwork Cavalcade": T((18, 1))},
 "Draconic Sorcery": {"hpSub": [l if l >= 3 else None for l in range(1, 21)], "acBase": T((3, "Draconic Resilience (PHB-2024)")), "res:Dragon Wings": T((14, 1))},
 "Wild Magic Sorcery": {"res:Tides of Chaos": T((3, 1)), "res:Tamed Surge": T((18, 1))},
 "Archfey Patron": {"res:Steps of the Fey: Misty Step": T((3, 1)), "xd:Dreadful Step": T((6, "2d10")), "def:Immunity:Charmed": T((10, True))},
 "Celestial Patron": {"res:Healing Light": [1 + l if l >= 3 else None for l in range(1, 21)], "def:Resistance:Radiant": T((6, True)), "xd:Searing Vengeance": T((14, "2d8"))},
 "Fiend Patron": {"res:Dark One's Own Luck": T((6, 1)), "xd:Hurl Through Hell": T((14, "8d10"))},
 "Great Old One Patron": {"res:Clairvoyant Combatant": T((6, 1)), "def:Resistance:Psychic": T((10, True))},
 "Abjurer": {"res:Arcane Ward": [2 * l + 1 if l >= 3 else None for l in range(1, 21)]},
 "Diviner": {"res:Portent": T((3, 2), (14, 3)), "res:The Third Eye": T((10, 1))},
 "Evoker": {"res:Overchannel": T((14, 1))},
 "Illusionist": {"res:Illusory Self": T((10, 1))},
 "Artillerist": {"xd:Eldritch Cannon: Flamethrower": T((3, "2d8"), (9, "3d8")), "xd:Arcane Firearm": T((5, "1d8"))},
 "Battle Smith": {"xd:Arcane Jolt": T((9, "2d6"), (15, "4d6")), "res:Arcane Jolt": T((9, 1))},
}
SUBS = {"Barbarian": ["Path of the Berserker", "Path of the Wild Heart", "Path of the World Tree", "Path of the Zealot"],
        "Bard": ["College of Dance", "College of Glamour", "College of Lore", "College of Valor"],
        "Cleric": ["Life Domain", "Light Domain", "Trickery Domain", "War Domain"],
        "Druid": ["Circle of the Land", "Circle of the Moon", "Circle of the Sea", "Circle of the Stars"],
        "Fighter": ["Battle Master", "Champion", "Eldritch Knight", "Psi Warrior"],
        "Monk": ["Warrior of Mercy", "Warrior of Shadow", "Warrior of the Elements", "Warrior of the Open Hand"],
        "Paladin": ["Oath of Devotion", "Oath of Glory", "Oath of the Ancients", "Oath of Vengeance"],
        "Ranger": ["Beast Master", "Fey Wanderer", "Gloom Stalker", "Hunter"],
        "Rogue": ["Arcane Trickster", "Assassin", "Soulknife", "Thief"],
        "Sorcerer": ["Aberrant Sorcery", "Clockwork Sorcery", "Draconic Sorcery", "Wild Magic Sorcery"],
        "Warlock": ["Archfey Patron", "Celestial Patron", "Fiend Patron", "Great Old One Patron"],
        "Wizard": ["Abjurer", "Diviner", "Evoker", "Illusionist"],
        "Artificer": ["Alchemist", "Armorer", "Artillerist", "Battle Smith", "Cartographer"]}

JS = """(jobs)=>{const out=[];for(const [cls,sub] of jobs)for(let lv=3;lv<=20;lv++){let r;
 try{r=window.__bldFuzz({sp:'Human',bg:'Soldier',rs:'2024',src:{efa:true},cls,sub,lv,arr:[15,14,13,12,10,8],b2:0,b1:0})}catch(e){r={err:String(e)}}
 if(r.err||r.b.sub!==sub){out.push({sub,lv,err:String(r.err||'subclass not set')});continue}const c=r.c,res={},xd={},nres={};
 (c.res||[]).forEach(x=>{res[x.n]=x.max;nres[x.n]=(nres[x.n]||0)+1});(c.xdmg||[]).forEach(x=>{xd[x.n]=x.dmg});
 out.push({sub,lv,res,nres,xd,def:(c.defenses||[]).map(d=>d.t+':'+d.v),sp:(c.spells||[]).map(s=>s.n),
  hpSub:(c.hpBonus||[]).filter(h=>/Draconic/.test(h.s)).reduce((a,h)=>a+h.v,0)||null,acBase:(c.ac||{}).baseSrc,speed:c.speed})}return out}"""

def check(r):
    bad = []; n = 0; i = r["lv"] - 1; sub = r["sub"]
    def eq(k, want, g):
        nonlocal n; n += 1
        if want != g: bad.append("%s %d %s: expected %r got %r" % (sub, r["lv"], k, want, g))
    for k, row in P.get(sub, {}).items():
        v = row[i]
        if k.startswith("res:"):
            eq(k, v, r["res"].get(k[4:]))
            if v is not None: eq(k + " rows", 1, r["nres"].get(k[4:]))
        elif k.startswith("xd:"):
            g = r["xd"].get(k[3:])
            if v is not None and g is not None and "+" not in v: g = g.split("+")[0].split("-")[0] if "d" in g else g
            eq(k, v, g)
        elif k.startswith("noxd:"): eq(k, None, r["xd"].get(k[5:]))
        elif k.startswith("def:"): eq(k, bool(v), k[4:] in r["def"])
        else: eq(k, v, r.get(k))
    have = set(r["sp"])
    for lv, names in SP.get(sub, []):
        if r["lv"] >= lv:
            for s in names.split(","): eq("spell " + s, True, s in have)
    return n, bad

async def main():
    url = serve(); jobs = [[c, s] for c, ss in SUBS.items() for s in ss]
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto(url); await pg.wait_for_function("()=>!!window.__bldFuzz", timeout=120000); await pg.evaluate("()=>window.__bldNeed().then(()=>1)")
        rows = await pg.evaluate(JS, jobs); await b.close()
    bad = []; n = 0
    for r in rows:
        if "err" in r: bad.append("%s %d: build error %s" % (r["sub"], r["lv"], r["err"][:200])); continue
        k, b2 = check(r); n += k; bad += b2
    print("subclass_resources: %d builds, %d values checked, %d wrong" % (len(rows), n, len(bad)))
    for x in bad[:60]: print("  " + x)
    sys.exit(1 if bad or len(rows) != len(jobs) * 18 else 0)

asyncio.run(main())
