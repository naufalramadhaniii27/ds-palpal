#!/usr/bin/env python3
"""Live sheet numbers under conditions and states (window.__deriveFor(C, state)), 2024 and 2014 rules, one browser session.
  python3 tests/state_numbers.py [-v]
Exhaustion by edition (2024: -2 per level on d20 Tests, -5 ft Speed per level; 2014: level table, Hit Point maximum halved at 4),
conditions that set Speed 0 or give Advantage/Disadvantage (Grappled, Restrained, Prone, Poisoned, Frightened, Blinded, Invisible),
carrying capacity (Str x 15, size multiplier, Powerful Build), Rage (damage +2/+3/+4, Strength checks and saves, B/P/S Resistance).
Exit 1 on any difference."""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""()=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);
const o=[],eq=(lab,want,got)=>o.push([lab,want,got]);
const R={'2014':['Human (2014)','Soldier (2014)'],'2024':['Human','Soldier']};
const mk=(rs,cls,lv,arr,sp)=>{const b=window.__bldFuzz({sp:sp||R[rs][0],bg:R[rs][1],rs,src:all,cls,sub:'',lv,arr,b2:0,b1:0}).b;if(rs==='2024')b.ch.spfeat='Crafter';
 const t=window.__bldTestB();Object.assign(t,b);delete t.unset;return window.__bldSheetFor(t)};
const run=(C,st)=>{const D=window.__deriveFor(C,st||{});if(D.err)throw new Error(D.err);return D};
const has=(L,t,re)=>(L||[]).some(x=>x.t===t&&re.test(x.s));
for(const rs of ['2024','2014']){
 const C=mk(rs,'Fighter',5,[15,14,14,12,10,8]),D0=run(C),sp=D0.speed;
 const svs=Object.keys(D0.save),sk0=D0.skill;
 for(let e=1;e<=6;e++){const D=run(C,{exh:e}),n=rs==='2024'?2*e:0;
  eq(rs+' exh'+e+' saves',svs.map(k=>D0.save[k]-n),svs.map(k=>D.save[k]));
  eq(rs+' exh'+e+' skills',Object.values(sk0).map(v=>v-n),Object.values(D.skill));
  eq(rs+' exh'+e+' init',D0.init-n,D.init);
  eq(rs+' exh'+e+' attack',D0.atk.map(a=>a.hit-n),D.atk.map(a=>a.hit));
  eq(rs+' exh'+e+' speed',rs==='2024'?Math.max(0,sp-5*e):e>=5?0:e>=2?Math.floor(sp/2):sp,D.speed);
  eq(rs+' exh'+e+' hpmax',rs==='2014'&&e>=4?Math.floor(D0.hpmax/2)+(D0.hpmax%2):D0.hpmax,D.hpmax);
  if(rs==='2014'){eq(rs+' exh'+e+' check dis',e>=1,has(D.cf.chk,'DIS',/Exhaustion/));
   eq(rs+' exh'+e+' attack dis',e>=3,has(D.cf.atk,'DIS',/Exhaustion/));
   eq(rs+' exh'+e+' save dis',e>=3,has((D.cf.save||{}).STR,'DIS',/Exhaustion/))}
  else eq(rs+' exh'+e+' no 2014 disadvantage',false,has(D.cf.chk,'DIS',/Exhaustion/)||has(D.cf.atk,'DIS',/Exhaustion/))}
 const cd=k=>run(C,{cond:{[k]:true}});
 for(const k of ['Grappled','Restrained','Paralyzed','Petrified','Unconscious'])eq(rs+' '+k+' speed 0',0,cd(k).speed);
 for(const k of ['Prone','Poisoned','Frightened','Blinded','Invisible','Stunned','Incapacitated'])eq(rs+' '+k+' speed',sp,cd(k).speed);
 eq(rs+' Grappled + exhaustion speed 0',0,run(C,{exh:1,cond:{Grappled:true}}).speed);
 eq(rs+' Grappled attack dis',rs==='2024',has(cd('Grappled').cf.atk,'DIS',/Grappled/));
 eq(rs+' Restrained attack and Dex save dis',[true,true],[has(cd('Restrained').cf.atk,'DIS',/Restrained/),has(cd('Restrained').cf.save.DEX,'DIS',/Restrained/)]);
 eq(rs+' Poisoned attack and check dis',[true,true],[has(cd('Poisoned').cf.atk,'DIS',/Poisoned/),has(cd('Poisoned').cf.chk,'DIS',/Poisoned/)]);
 eq(rs+' Frightened attack and check dis',[true,true],[has(cd('Frightened').cf.atk,'DIS',/Frightened/),has(cd('Frightened').cf.chk,'DIS',/Frightened/)]);
 eq(rs+' Prone attack dis',true,has(cd('Prone').cf.atk,'DIS',/Prone/));
 eq(rs+' Blinded attack dis',true,has(cd('Blinded').cf.atk,'DIS',/Blinded/));
 eq(rs+' Invisible attack and init adv',[true,true],[has(cd('Invisible').cf.atk,'ADV',/Invisible/),has(cd('Invisible').cf.init,'ADV',/Invisible/)]);
 eq(rs+' Stunned Str and Dex save fail',[true,true],[has(cd('Stunned').cf.save.STR,'FAIL',/Stunned/),has(cd('Stunned').cf.save.DEX,'FAIL',/Stunned/)]);
 eq(rs+' conditions leave numbers alone',[D0.ac,D0.hpmax,D0.init],(D=>[D.ac,D.hpmax,D.init])(run(C,{cond:{Poisoned:true,Prone:true,Frightened:true}})));
 /* Speed bonuses (Unarmored Movement, Fast Movement): exhaustion applies to the total, Speed 0 wins over them */
 for(const [cl,lv] of [['Monk',6],['Barbarian',5]]){const M=mk(rs,cl,lv,[14,15,14,10,14,8]),m0=run(M).speed;
  eq(rs+' '+cl+lv+' speed bonus',cl==='Monk'?45:40,m0);
  eq(rs+' '+cl+lv+' exh2 speed',rs==='2024'?m0-10:Math.floor(m0/2),run(M,{exh:2}).speed);
  eq(rs+' '+cl+lv+' Grappled speed 0',0,run(M,{cond:{Grappled:true}}).speed)}
 /* carrying capacity */
 const str=D0.score.STR;eq(rs+' carry Medium',str*15,D0.carry);
 for(const [z,m] of [['Tiny',7.5],['Small',15],['Medium',15],['Large',30],['Huge',60]])eq(rs+' carry '+z,str*m,run(Object.assign({},C,{size:z})).carry);
 {const G=mk(rs,'Fighter',5,[15,14,14,12,10,8],rs==='2024'?'Goliath':'Goliath (2014)'),D=run(G);eq(rs+' carry Goliath Powerful Build',D.score.STR*30,D.carry)}
 /* Rage */
 for(const [lv,d] of [[1,2],[8,2],[9,3],[15,3],[16,4],[20,4]]){const B=mk(rs,'Barbarian',lv,[15,14,14,12,10,8]),off=run(B),on=run(B,{mode:{rage:1}});
  eq(rs+' Barbarian'+lv+' Rage damage',d,on.cf.dmgStr);eq(rs+' Barbarian'+lv+' Rage off',0,off.cf.dmgStr);
  if(lv===1){eq(rs+' Rage Str save adv',true,has(on.cf.save.STR,'ADV',/Rage/));eq(rs+' Rage Str check adv',true,has((on.cf.chkAb||{}).STR,'ADV',/Rage/));
   /* listed once: the builder writes "(while raging)" to Defenses, else the toggle adds them */
   eq(rs+' Rage resistances',true,(on.cf.res||[]).filter(r=>r.s==='Rage').length===3||(B.defenses||[]).some(d=>/Bludgeoning, Piercing, Slashing \(while raging\)/.test(d.v)));
   const ai=off.atk.findIndex(a=>/\+|−|^\d/.test(String(a.dmg))&&!/Unarmed/.test(B.attacks[off.atk.indexOf(a)].n||'')&&B.attacks[off.atk.indexOf(a)].ab==='STR');
   if(ai>=0)eq(rs+' Rage damage on Str weapon',true,String(on.atk[ai].dmg)!==String(off.atk[ai].dmg))}}
}
return o}"""

bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(300000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'&&typeof window.__deriveFor==='function'")
    rows = pg.evaluate(JS); br.close()
for lab, want, got in rows:
    ok = want == got; bad += not ok
    if not ok or "-v" in sys.argv: print("%s %s%s" % ("ok  " if ok else "FAIL", lab, "" if ok else ": expected %r got %r" % (want, got)))
print("state_numbers: %d checked, %d failed" % (len(rows), bad))
sys.exit(1 if bad else 0)
