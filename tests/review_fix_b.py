#!/usr/bin/env python3
"""Review fixes B: no double Potent Spellcasting (Grave Domain (2014), Peace Domain), Tectonic Plate Armor burrow only while switched on,
one burrow row for Claws of the Umber Hulk, Travel Domain per book (Kobold Press: Lightning, no Godspeed; Valda's Spire 2014: Force, Godspeed),
Star Map counter at Druid 2 (2014) with no second Guidance or Guiding Bolt, one Advantage per item, no doubled Technopath or Psionic-Awakened spells.
python3 tests/review_fix_b.py"""
import os, sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = r"""()=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(o)=>{const b=window.__bldFuzz(Object.assign({rs:'2014',cls:'Fighter',sub:'',lv:8,arr:[10,14,14,15,16,15],b2:0,b1:0,sp:'Human (2014)',bg:'Soldier (2014)'},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;if(o.inv)t.inv=o.inv;if(o.feat)t.ch=Object.assign({},t.ch,{feat4:{feat:o.feat,a1:'STR',a2:'CON'}});return t};
 const S=(o,tg)=>window.__bldSheetFor(mk(o),tg||{});const out={};
 const wis=e=>(e.atkBonus||[]).some(x=>x.dmg==='WIS');
 out.potent=['Grave Domain (2014)','Peace Domain'].map(k=>(GX.sub[k]||[]).filter(wis).length);
 out.potentRow=['Grave Domain (2014)','Peace Domain'].map(k=>{const C=S({cls:'Cleric',sub:k}),f=(C.spells||[]).find(s=>s.n==='Sacred Flame');
  return f?(f.db||[]).filter(d=>/Potent/.test(d.s)).map(d=>d.v).join('+'):'no row'});/* Sacred Flame damage bonus: WIS 16 = +3, once */
 const tec=tg=>{const C=S({inv:[{n:'Tectonic Gauntlets',q:1,eq:true,att:true}]},tg);return /urrow[^"]{0,20}30/.test(JSON.stringify([C.speed,C.speedSrc,C.defenses,C.res]))};
 out.tecOff=tec({});out.tecOn=tec({'b52-tectonic-plate':true});
 out.claws=(GX.item['Claws of the Umber Hulk']||[]).filter(e=>e.mv&&e.mv.burrow).length;
 const dice=k=>(GX.sub[k]||[]).filter(e=>e.atkDice&&e.l===8).map(e=>e.atkDice[0].t).join(',');
 out.travel=[dice('Travel Domain'),dice('Travel Domain (2014)'),(GX.sub['Travel Domain']||[]).some(e=>e.speedMul)?1:0,(GX.sub['Travel Domain (2014)']||[]).some(e=>e.speedMul)?1:0];
 const god=(k)=>{const C=S({cls:'Cleric',sub:k,lv:17},{'b49-godspeed':true}),A=S({cls:'Cleric',sub:k,lv:17},{});return C.speed-A.speed};
 out.godspeed=[god('Travel Domain'),god('Travel Domain (2014)')];
 out.travelSubs=(WXS||[]).filter(x=>/^Travel Domain/.test(x.name)).map(x=>x.src+':'+x.name).sort().join(',');
 const st=S({cls:'Druid',sub:'Circle of Stars',lv:2});
 out.stars=[(st.lu||st.res||[]).length>=0&&/Star Map: Guiding Bolt/.test(JSON.stringify(st))?1:0,(st.spells||[]).filter(s=>s.n==='Guiding Bolt').length,(st.spells||[]).filter(s=>s.n==='Guidance').length];
 out.stars24=(GX.sub['Circle of the Stars']||[]).filter(e=>e.spells).length;
 out.adv=['Ioun Stone (awareness)','Rod of Alertness','Sentinel Shield','Weapon of Warning','Chattering Staff of Skulls'].map(n=>{const C=S({rs:'2024',cls:'Wizard',sp:'Human',bg:'Soldier',inv:[{n,q:1,eq:true,att:true}]});
  return n+':'+(C.itemAdv||[]).filter(r=>r.s===n||r.s.indexOf(n)===0).length+'/'+(GX.item[n]||[]).filter(e=>e.initAdv||(e.defs||[]).some(d=>d[0]==='Advantage')).length});
 out.feat=['Technopath','Psionic-Awakened'].map(n=>(GX.feat[n]||[]).filter(e=>e.spells).length);
 return out}"""
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("typeof window.__bldFuzz==='function'"); pg.wait_for_function("window.__deferDone", timeout=120000)
    o = pg.evaluate(JS); br.close()
print(json.dumps(o))
EXP = [("one Potent row per domain (Grave 2014, Peace)", o["potent"] == [1, 1]),
       ("Sacred Flame gets Wisdom (+3) once (Grave 2014, Peace)", o["potentRow"] == ["3", "3"]),
       ("Tectonic burrow 30 off without the switch", o["tecOff"] is False), ("Tectonic burrow 30 with the switch", o["tecOn"] is True),
       ("Claws of the Umber Hulk burrow from the item row only", o["claws"] == 0),
       ("Travel Domain per book", o["travel"] == ["Lightning", "Force", 0, 1] and o["travelSubs"] == "tkdm:Travel Domain,tvss14:Travel Domain (2014)"),
       ("Godspeed only for Valda's Travel Domain (2014)", o["godspeed"][0] == 0 and o["godspeed"][1] > 0),
       ("Star Map counter at Druid 2, Guidance and Guiding Bolt once", o["stars"] == [1, 1, 1] and o["stars24"] == 0),
       ("one Advantage per item", all(s.split(":")[1].split("/")[0] in ("1", "2") and s.endswith("/0") for s in o["adv"])),
       ("Technopath and Psionic-Awakened spells from the book only", o["feat"] == [0, 0])]
bad = 0
for lab, ok in EXP:
    bad += not ok; print(("ok   " if ok else "FAIL ") + lab)
print("%d checked, %d failed" % (len(EXP), bad)); sys.exit(1 if bad else 0)
