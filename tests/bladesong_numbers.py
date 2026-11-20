#!/usr/bin/env python3
"""Bladesong toggle (fx toggle id "bladesong", S.fxT) on the computed sheet (window.__D after __sheetApply), 2024 Bladesinger and 2014 Bladesinging.
  python3 tests/bladesong_numbers.py [-v]
On: AC + Int mod (min +1), Speed +10, Advantage on Dexterity (Acrobatics) checks. 2024 Bladework: Int for proficient weapon attacks.
2014 Song of Victory (L14): + Int mod to melee weapon damage. Armor gate: 2024 no armor and no Shield; 2014 no Medium/Heavy armor and no Shield
(Light armor is fine). With the wrong armor the toggle adds nothing. Exit 1 on any difference."""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""()=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);
const o=[],eq=(lab,want,got)=>o.push([lab,want,got]);
const R={'2024':['Human','Soldier','Bladesinger'],'2014':['Human (2014)','Soldier (2014)','Bladesinging']};
for(const rs of ['2024','2014'])for(const [lv,arr] of [[3,[8,14,14,16,10,10]],[14,[8,14,14,10,10,10]]]){
 const b=window.__bldFuzz({sp:R[rs][0],bg:R[rs][1],rs,src:all,cls:'Wizard',sub:R[rs][2],lv,arr,b2:0,b1:0}).b;if(rs==='2024')b.ch.spfeat='Crafter';
 const calc=(on,...wear)=>{const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=b.inv.map(x=>Object.assign({},x,{eq:false}));
  wear.forEach(n=>t.inv.push({n,q:1,eq:true}));const C=window.__bldSheetFor(t,{bladesong:on});window.__sheetApply(C,false);return {C,D:JSON.parse(JSON.stringify(window.__D()))}};
 const acro=C=>(C.defenses||[]).some(d=>/Acrobatics/.test(d.v)&&/Bladesong/.test(d.s));
 const rap=C=>(C.attacks||[]).find(r=>r.n==='Rapier')||{};
 const L=rs+' L'+lv+' ';
 const off=calc(false,'Rapier'),on=calc(true,'Rapier'),im=on.D.mod.INT,bon=Math.max(1,im);
 eq(L+'toggle listed',true,(on.C.fxToggles||[]).some(t=>t.id==='bladesong'));
 eq(L+'AC',off.D.ac+bon,on.D.ac);eq(L+'speed',off.D.speed+10,on.D.speed);
 eq(L+'Acrobatics adv off',false,acro(off.C));eq(L+'Acrobatics adv on',true,acro(on.C));
 if(rs==='2024'){eq(L+'Bladework off',rap(off.C).ab,'DEX');eq(L+'Bladework on',im>on.D.mod.DEX?'INT':'DEX',rap(on.C).ab)}
 if(rs==='2014'&&lv>=14){eq(L+'Song of Victory off',0,rap(off.C).dmgBonus||0);eq(L+'Song of Victory on',bon,rap(on.C).dmgBonus||0)}
 const gate=rs==='2024'?[['Leather Armor'],['Shield']]:[['Breastplate'],['Plate Armor'],['Shield']];
 for(const g of gate){const a=calc(false,...g),c=calc(true,...g);eq(L+g+' AC unchanged',a.D.ac,c.D.ac);eq(L+g+' speed unchanged',a.D.speed,c.D.speed);eq(L+g+' no Acrobatics',false,acro(c.C))}
 if(rs==='2014'){const a=calc(false,'Leather Armor'),c=calc(true,'Leather Armor');eq(L+'light armor AC',a.D.ac+bon,c.D.ac)}
}
return o}"""

bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(300000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'&&typeof window.__sheetApply==='function'")
    rows = pg.evaluate(JS); br.close()
for lab, want, got in rows:
    ok = want == got; bad += not ok
    if not ok or "-v" in sys.argv: print("%s %s%s" % ("ok  " if ok else "FAIL", lab, "" if ok else ": expected %r got %r" % (want, got)))
print("bladesong numbers: %d checks, %d failed" % (len(rows), bad))
sys.exit(1 if bad else 0)
