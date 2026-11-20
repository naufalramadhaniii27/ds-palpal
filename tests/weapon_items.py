#!/usr/bin/env python3
"""Attack rows of magic weapons and attack items, rules 2024 and 2014, one browser session.  python3 tests/weapon_items.py
Level 5 Human Fighter, Str 17 (2024) or 16 (2014), Dex 15: Str attack +6, damage +3; Dex attack +5, damage +2. The bonus of a +N weapon counts once.
An item that needs attunement gives its bonus only while attuned: Holy Avenger by a Paladin, Dwarven Thrower by a Dwarf (DMG 2014 and 2024; a Mountain Dwarf counts)."""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, class, extra fuzz options, inventory, choices, row, attack, damage, text in the note or "")
CASES = [
    ("Longsword", "Fighter", {}, ["Longsword"], None, "Longsword", 6, "1d8+3", ""),
    ("+1 once", "Fighter", {}, ["Longsword, +1"], None, "Longsword, +1", 7, "1d8+4", ""),
    ("+3 once", "Fighter", {}, ["Longsword, +3"], None, "Longsword, +3", 9, "1d8+6", ""),
    ("Flame Tongue", "Fighter", {}, ["Flame Tongue (Longsword)"], None, "Flame Tongue (Longsword)", 6, "1d8+3", "2d6 Fire"),
    ("Frost Brand", "Fighter", {}, ["Frost Brand (Longsword)"], None, "Frost Brand (Longsword)", 6, "1d8+3", "1d6 cold"),
    ("Holy Avenger, Paladin", "Paladin", {}, ["Holy Avenger (Longsword)"], None, "Holy Avenger (Longsword)", 9, "1d8+6", "2d10 radiant"),
    ("Holy Avenger, not a Paladin", "Fighter", {}, ["Holy Avenger (Longsword)"], None, "Holy Avenger (Longsword)", 6, "1d8+3", "Not attuned"),
    ("Defender", "Fighter", {}, ["Defender (Longsword)"], None, "Defender (Longsword)", 9, "1d8+6", ""),
    ("Vorpal Sword", "Fighter", {}, ["Vorpal Sword (Longsword)"], None, "Vorpal Sword (Longsword)", 9, "1d8+6", ""),
    ("Sun Blade, Dex", "Fighter", {"arr": [8, 15, 14, 13, 12, 10]}, ["Sun Blade"], None, "Sun Blade", 8, "1d8+5", "1d8 Radiant"),
    ("Dragon Slayer", "Fighter", {}, ["Dragon Slayer (Longsword)"], None, "Dragon Slayer (Longsword)", 7, "1d8+4", "3d6"),
    ("Giant Slayer", "Fighter", {}, ["Giant Slayer (Longsword)"], None, "Giant Slayer (Longsword)", 7, "1d8+4", "against a Giant"),
    ("Javelin of Lightning", "Fighter", {}, ["Javelin of Lightning"], None, "Javelin of Lightning", 6, "1d6+3", ""),
    ("Dagger of Venom", "Fighter", {}, ["Dagger of Venom"], None, "Dagger of Venom", 7, "1d4+4", ""),
    ("Mace of Disruption", "Fighter", {}, ["Mace of Disruption"], None, "Mace of Disruption", 6, "1d6+3", "2d6 Radiant"),
    ("Dwarven Thrower, Dwarf", "Fighter", {"dwarf": 1}, ["Dwarven Thrower"], None, "Dwarven Thrower", 9, "1d8+6", ""),
    ("Dwarven Thrower, Human", "Fighter", {}, ["Dwarven Thrower"], None, "Dwarven Thrower", 6, "1d8+3", "Not attuned"),
    ("Oathbow", "Fighter", {}, ["Oathbow (Longbow)"], None, "Oathbow (Longbow)", 5, "1d8+2", "sworn enemy"),
    ("Nine Lives Stealer", "Fighter", {}, ["Nine Lives Stealer (Longsword)"], None, "Nine Lives Stealer (Longsword)", 8, "1d8+5", ""),
    ("Sword of Sharpness", "Fighter", {}, ["Sword of Sharpness (Longsword)"], None, "Sword of Sharpness (Longsword)", 6, "1d8+3", ""),
    ("Luck Blade", "Fighter", {}, ["Luck Blade (Longsword)"], None, "Luck Blade (Longsword)", 7, "1d8+4", ""),
    ("Scimitar of Speed", "Fighter", {}, ["Scimitar of Speed"], None, "Scimitar of Speed", 8, "1d6+5", ""),
    ("Weapon of Warning", "Fighter", {}, ["Weapon of Warning (Longsword)"], None, "Weapon of Warning (Longsword)", 6, "1d8+3", ""),
    ("Bracers of Archery, Longbow", "Fighter", {}, ["Longbow", "Longsword", "Bracers of Archery"], None, "Longbow", 5, "1d8+4", ""),
    ("Bracers of Archery, +1 Shortbow", "Fighter", {}, ["Shortbow, +1", "Bracers of Archery"], None, "Shortbow, +1", 6, "1d6+5", ""),
    ("Bracers of Archery, not a bow", "Fighter", {}, ["Longbow", "Longsword", "Bracers of Archery"], None, "Longsword", 6, "1d8+3", ""),
    ("Gauntlets of Ogre Power, Str", "Fighter", {}, ["Longsword", "Longbow", "Gauntlets of Ogre Power"], None, "Longsword", 7, "1d8+4", ""),
    ("Gauntlets of Ogre Power, Dex row", "Fighter", {}, ["Longsword", "Longbow", "Gauntlets of Ogre Power"], None, "Longbow", 5, "1d8+2", ""),
    ("Belt of Hill Giant Strength", "Fighter", {}, ["Longsword", "Belt of Giant Strength (hill)"], None, "Longsword", 8, "1d8+5", ""),
    ("Archery and +1 Longbow", "Fighter", {}, ["Longbow, +1"], {"fs1": "Archery"}, "Longbow, +1", 8, "1d8+3", ""),
    ("Dueling and +1 Longsword", "Fighter", {}, ["Longsword, +1", "Shield"], {"fs1": "Dueling"}, "Longsword, +1", 7, "1d8+6", ""),
    ("Wizard, Longsword not proficient", "Wizard", {}, ["Longsword"], None, "Longsword", 3, "1d8+3", ""),
]
JS = """([rs,cases])=>{const sc=(C,k)=>{const A=C.abilities[k];return A.base+A.bonus.reduce((a,x)=>a+x.v,0)},md=s=>Math.floor((s-10)/2);
  return cases.map(([lab,cls,ex,inv,ch,row])=>{try{const o=rs==='2014'?{sp:ex.dwarf?'Mountain Dwarf':'Human (2014)',bg:'Soldier (2014)',src:{phb14:true,dmg14:true}}:{sp:ex.dwarf?'Dwarf':'Human',bg:'Soldier'};
    const b=window.__bldFuzz(Object.assign({rs,cls,sub:'',lv:5,arr:ex.arr||[15,14,13,12,10,8],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src);(WX.src||[]).forEach(x=>b.src[x.id]=true);
    if(ch)b.ch=Object.assign({},b.ch,ch);b.inv=inv.map(n=>({n,q:1,eq:true}));const t=window.__bldTestB();Object.assign(t,b);delete t.unset;const C=window.__bldSheetFor(t),pb=Math.ceil(C.level/4)+1;
    const a=C.attacks.filter(x=>x.n===row)[0];if(!a)return 'no row';const m=md(sc(C,a.ab));
    return [m+(a.prof?pb:0)+(a.misc||0),a.die+'+'+((a.nomod?0:m)+(a.dmgBonus||0)),a.note||'']}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    for rs in ("2024", "2014"):
        res = pg.evaluate(JS, [rs, [list(c[:6]) for c in CASES]])
        for c, got in zip(CASES, res):
            ok = isinstance(got, list) and got[0] == c[6] and got[1] == c[7] and c[8].lower() in got[2].lower()
            n += 1; bad += not ok
            print("%s %s %s: %s" % ("ok  " if ok else "FAIL", rs, c[0], "" if ok else "%s, expected +%s %s %r" % (got, c[6], c[7], c[8])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
