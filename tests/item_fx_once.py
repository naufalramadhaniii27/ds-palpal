#!/usr/bin/env python3
"""Items whose AC or save bonus once came from two places. Before 0.0.85 five items crashed the sheet when worn (fx-B14 ac:1 as a number,
the AC handler wanted an array), and the sheet would have counted their bonus twice; five Feather Robes counted +1 to saves twice.
Each item must give its bonus once and the sheet must not throw.  python3 tests/item_fx_once.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AC = {"Knifewing Cape": 1, "Orrery of the Wanderer": 1, "Ingot of the Skold Rune": 1, "Jewel of Three Prayers (Awakened)": 2, "Jewel of Three Prayers (Exalted)": 3, "Ring of Protection": 1}
SAVE = ["Corvum Feather Robe", "Gallus Feather Robe", "Luma Feather Robe", "Raptor Feather Robe", "Strig Feather Robe"]
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    res = pg.evaluate("""(names)=>{const base=window.__bldFuzz({sp:'Human',bg:'Soldier',rs:'2024',sub:'',arr:[15,14,13,12,10,8],b2:0,b1:0,cls:'Wizard',lv:10}).b;
      base.src=Object.assign({},base.src);(window.WX&&WX.src||[]).forEach(x=>base.src[x.id]=true);
      return names.map(n=>{const b=structuredClone(base);b.inv=[{n:n,q:1,eq:true}];const t=window.__bldTestB();Object.assign(t,b);delete t.unset;
        try{const C=window.__bldSheetFor(t);const f=a=>(a||[]).filter(x=>String(x.s).indexOf(n)>=0).map(x=>x.v);return [n,f(C.ac.bonus),f(C.saveBonus)]}catch(e){return [n,'CRASH '+e,null]}})}""", list(AC) + SAVE)
    for n, ac, sv in res:
        if isinstance(ac, str): ok = False; got = ac
        elif n in AC: ok = ac == [AC[n]]; got = "AC %s" % ac
        else: ok = sv == [1]; got = "save %s" % sv
        bad += not ok
        print("%s %s: %s" % ("ok  " if ok else "FAIL", n, got))
    # worn effects added in 0.0.85: Titan Frame (Armor with no base armor: +2 AC, Str 23, Large) and Boots of Striding and Springing (Speed at least 30)
    w = pg.evaluate("""()=>{const r=window.__bldFuzz({sp:'Hill Dwarf',bg:'Soldier (2014)',rs:'2014',src:{phb14:true,dmg14:true,tdm14:true},sub:'',arr:[15,14,13,12,10,8],b2:0,b1:0,cls:'Fighter',lv:10});
      const one=n=>{const b=structuredClone(r.b);b.inv=[{n:n,q:1,eq:true}];const t=window.__bldTestB();Object.assign(t,b);delete t.unset;return window.__bldSheetFor(t)};
      const T=one('Titan Frame'),S=one('Boots of Striding and Springing');const sc=C=>C.abilities.STR.base+C.abilities.STR.bonus.reduce((a,x)=>a+x.v,0);
      return {tAc:T.ac.bonus.filter(x=>/Titan Frame/.test(x.s)).map(x=>x.v),tStr:sc(T),tSize:T.size,tSp:T.speed,bSp:S.speed}}""")
    for lab, ok in (("Titan Frame +2 AC once", w["tAc"] == [2]), ("Titan Frame Strength 23", w["tStr"] == 23), ("Titan Frame Large", w["tSize"] == "Large"),
                    ("Titan Frame Speed 30 on a 25 ft Dwarf", w["tSp"] == 30), ("Boots of Striding and Springing Speed 30 on a 25 ft Dwarf", w["bSp"] == 30)):
        bad += not ok; print("%s %s %s" % ("ok  " if ok else "FAIL", lab, "" if ok else w))
    # worn or carried proficiencies and DCs (0.0.85): Brawling Gloves, Stone of Creation, Travel Alchemical Kit, Thaumatonic Rifle (spell attack and DC), Deepstone Cestus (ki DC +2)
    w = pg.evaluate("""()=>{const mk=(rs,cls,o)=>{const b=window.__bldFuzz(Object.assign({rs,cls,sub:'',lv:10,arr:[15,14,13,12,10,8],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src);(WX.src||[]).forEach(x=>b.src[x.id]=true);return b};
      const one=(b0,n)=>{const b=structuredClone(b0);b.inv=n?[{n:n,q:1,eq:true}]:[];const t=window.__bldTestB();Object.assign(t,b);delete t.unset;return window.__bldSheetFor(t)};
      const F=mk('2014','Fighter',{sp:'Human (2014)',bg:'Soldier (2014)',src:{phb14:true,dmg14:true}}),W=mk('2024','Wizard',{sp:'Human',bg:'Soldier'}),M=mk('2024','Monk',{sp:'Human',bg:'Soldier'}),M14=mk('2014','Monk',{sp:'Human (2014)',bg:'Soldier (2014)',src:{phb14:true,dmg14:true}});
      const sc=C=>C.spellcasting,dc=C=>(JSON.stringify(C).match(/Focus Points, save DC (\\d+)|ki save DC: (\\d+)|save DC (\\d+)/)||[]).slice(1).find(x=>x);
      const w0=sc(one(W)),w3=sc(one(W,'Thaumatonic Rifle, +3'));
      return {bg:one(F,'Brawling Gloves (rare)').profs.weapons,sc:one(F,'Stone of Creation').profs.tools,tk:one(F,'Travel Alchemical Kit').profs.tools,
        rAtk:w3.atk-w0.atk,rDc:w3.dc-w0.dc,m:[dc(one(M)),dc(one(M,'Deepstone Cestus'))],m14:[dc(one(M14)),dc(one(M14,'Deepstone Cestus'))]}}""")
    for lab, ok in (("Brawling Gloves: Improvised weapons", "Improvised weapons" in w["bg"]), ("Stone of Creation: Mason's Tools", "Mason's Tools" in w["sc"]),
                    ("Travel Alchemical Kit: Poisoner's Kit", "Poisoner's Kit" in w["tk"]), ("Thaumatonic Rifle +3: spell attack and DC +3", w["rAtk"] == 3 and w["rDc"] == 3),
                    ("Deepstone Cestus: Focus DC +2", w["m"][0] and int(w["m"][1]) == int(w["m"][0]) + 2), ("Deepstone Cestus: ki DC +2 (2014)", w["m14"][0] and int(w["m14"][1]) == int(w["m14"][0]) + 2)):
        bad += not ok; print("%s %s %s" % ("ok  " if ok else "FAIL", lab, "" if ok else w))
    br.close()
print("%d failed" % bad); sys.exit(1 if bad else 0)
