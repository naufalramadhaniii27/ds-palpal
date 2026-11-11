import {ABK,ABN} from "./01-logic-core-helpers.js";
import {featDef} from "./00-env.js";
import {registerSheetGroup,registerSheetRule} from "./12a-logic-sheet-registry.js";
/* Sheet handlers, part 1 (contract in 12a-logic-sheet-registry.js): identity, ability scores, saving throw proficiencies.
   Phase "base" then "saves". Each handler works on ctx.C / ctx.l keys listed in `writes` (private copies) and returns ctx.patch(). */
/* the header of the sheet: who and what the character is, and the empty lists later handlers fill */
registerSheetGroup({id:"identity",group:"identity",phase:"base",order:10,reads:["i.B","i.c","i.TLv","i.sp","i.custom","i.spName","i.subName","i.bg","i.hpList","i.appVer"],
 writes:["C.v","C.bv","C.name","C.species","C.cls","C.sub","C.bg","C.size","C.office","C.camp","C.cardNo","C.level","C.hitDie","C.hpPerLevel","C.abilities","C.rolledNote","C.saves","C.skills","C.initBonus","C.hpBonus","C.grappler"],
 run:function(ctx){const I=ctx.i,B=I.B,C=ctx.C;
  C.v=3;C.bv=I.appVer;/* v27 RU28: the app version whose builder made this sheet */C.name=B.name;C.species=I.spName+(B.ch.lin?" ("+B.ch.lin.split(" (")[0]+")":"");C.cls=B.cls;C.sub=I.subName||"";C.bg=B.bg;
  C.size=I.custom?B.cSpecies.size:(I.sp.size.indexOf("or")>0?(B.size||"Medium"):I.sp.size);C.office="";C.camp=B.camp||"";C.cardNo="";C.level=I.TLv;C.hitDie=I.c.hd;C.hpPerLevel=I.hpList;C.abilities={};C.rolledNote="Built with PHB 2024 Builder";
  C.saves={};C.skills=[];C.initBonus=[];C.hpBonus=[];C.grappler=false;return ctx.patch()}});
/* base score and the sources that raise it (from abil()) */
registerSheetGroup({id:"abilities",group:"abilities",phase:"base",order:20,reads:["i.B","i.a"],writes:["C.abilities"],
 run:function(ctx){const B=ctx.i.B,a=ctx.i.a,C=ctx.C;ABK.forEach((k) =>{C.abilities[k]={base:+B.base[k]||10,bonus:a.src[k].map((b) =>{return {s:b.s,v:b.v}})}});return ctx.patch()}});
/* main class saving throws */
registerSheetGroup({id:"class-saves",group:"saves",phase:"saves",order:10,reads:["i.B","i.c","i.SRC"],writes:["C.saves"],
 run:function(ctx){const I=ctx.i,C=ctx.C;I.c.saves.forEach((k) =>{C.saves[k]=I.B.cls+" class ("+I.SRC+")"});return ctx.patch()}});
/* v74: species saving throw proficiency (Keldon Human) */
registerSheetGroup({id:"species-saves",group:"saves",phase:"saves",order:20,reads:["i.B","i.sp","i.custom","i.SRC"],writes:["C.saves"],
 run:function(ctx){const I=ctx.i,C=ctx.C,sp=I.sp;if(sp&&sp.saveProf&&!I.custom)sp.saveProf.forEach((k) =>{if(!C.saves[k])C.saves[k]=I.B.species+" ("+(sp.hb||I.SRC)+")"});return ctx.patch()}});
/* class rules for saving throws, once per class part in the order of the parts (M10: also from a multiclass part) */
registerSheetRule({id:"monk-14-saves",group:"saves",about:"Monk 14: proficiency in every saving throw (Diamond Soul, 2014: Disciplined Survivor)",phase:"saves",order:30,scope:"part",loop:"save-rules",reads:["i.SRC","i.r14"],writes:["C.saves"],
 run:function(ctx){const q=ctx.p,I=ctx.i,C=ctx.C;if(q.cls==="Monk"&&q.lv>=14){const mt=q.mc?", multiclass":"";ABK.forEach((k) =>{if(!C.saves[k])C.saves[k]=(I.r14?"Diamond Soul":"Disciplined Survivor")+" ("+I.SRC+", Monk 14"+mt+")"})}return ctx.patch()}});
registerSheetRule({id:"gloom-stalker-7-saves",group:"saves",about:"Gloom Stalker 7: Iron Mind, proficiency in the chosen save (Wisdom, Intelligence or Charisma)",phase:"saves",order:31,scope:"part",loop:"save-rules",reads:["i.SRC","q.subAt","q.chOf","q.wisElse"],writes:["C.saves"],
 run:function(ctx){const q=ctx.p,I=ctx.i,Q=ctx.q,C=ctx.C;
  if(q.cls==="Ranger"&&Q.subAt("Ranger","Gloom Stalker")>=7){const mt=q.mc?", multiclass":"",imc={Intelligence:"INT",Charisma:"CHA"}[Q.chOf("Ranger","p7opt")],im=!Q.wisElse()&&!C.saves.WIS?"WIS":imc&&!C.saves[imc]?imc:["WIS","INT","CHA"].filter((k) =>{return !C.saves[k]})[0];/* v32 RL49 no. 30: the chosen save. Not chosen yet: the first free one, as before */if(im)C.saves[im]="Iron Mind ("+I.SRC+", Gloom Stalker 7"+mt+")"}/* V17-5 */
  return ctx.patch()}});
registerSheetRule({id:"rogue-15-saves",group:"saves",about:"Rogue 15: Slippery Mind, Wisdom and Charisma saves (2014: Wisdom only)",phase:"saves",order:32,scope:"part",loop:"save-rules",reads:["i.SRC","i.r14"],writes:["C.saves"],
 run:function(ctx){const q=ctx.p,I=ctx.i,C=ctx.C;if(q.cls==="Rogue"&&q.lv>=15){const mt=q.mc?", multiclass":"";(I.r14?["WIS"]:["WIS","CHA"]).forEach((k) =>{if(!C.saves[k])C.saves[k]="Slippery Mind ("+I.SRC+", Rogue 15"+mt+")"})}return ctx.patch()}});
/* generic: fx.saveFrom = a chosen pick gives a saving throw proficiency (Warden Stalwart Spirit) */
registerSheetGroup({id:"fx-save-from",group:"saves",phase:"saves",order:40,reads:["i.G","q.fxCh"],writes:["C.saves"],
 run:function(ctx){const C=ctx.C,Q=ctx.q;ctx.i.G.forEach((e) =>{if(!e.saveFrom)return;const v=Q.fxCh(e.saveFrom,e.pre,e.kind,e.okey),a=Array.isArray(v)?v:(v?[v]:[]);a.forEach((nm) =>{const k=ABK.filter((x) =>{return ABN[x]===nm})[0];if(k&&!C.saves[k])C.saves[k]=e.lbl})});return ctx.patch()}});
/* fx engine v5: saveProf [ab] = a fixed saving throw proficiency from any source (no pick) */
registerSheetGroup({id:"fx-save-prof",group:"saves",phase:"saves",order:50,reads:["i.G"],writes:["C.saves"],
 run:function(ctx){const C=ctx.C;ctx.i.G.forEach((e) =>{(e.saveProf||[]).forEach((k) =>{if(ABK.indexOf(k)>=0&&!C.saves[k])C.saves[k]=e.lbl})});return ctx.patch()}});
/* M17: FEATS.saveFromAsi = the feat's chosen ability gives a saving throw proficiency */
registerSheetGroup({id:"feat-save-asi",group:"saves",phase:"saves",order:60,reads:["i.feats"],writes:["C.saves"],
 run:function(ctx){const C=ctx.C;ctx.i.feats.forEach((f) =>{const F=featDef(f.n);if(F&&F.saveFromAsi&&f.asi&&f.asi.a1)C.saves[f.asi.a1]=f.n+" feat ("+f.s+")"});return ctx.patch()}});

/* Fixed save, or a selected replacement only when the fixed save already exists.
   Runs after feat saves so a Resilient choice is a genuine existing source. */
registerSheetGroup({id:"fx-save-pe",group:"saves",phase:"saves",order:70,reads:["i.G","q.fxCh"],writes:["C.saves"],
 run:function(ctx){const C=ctx.C;ctx.i.G.forEach((e) =>{const g=e.savePE;if(!g||!ABK.includes(g.ab))return;
  if(!C.saves[g.ab]){C.saves[g.ab]=e.lbl;return}
  const key="gx-"+g.pick+"-"+e.kind+"-"+e.okey,v=ctx.q.fxCh(key,e.pre,e.kind,e.okey),a=Array.isArray(v)?v:[];
  const k=a.map((n) =>ABK.find((x) =>x===n||ABN[x]===n)).find((x) =>(g.from||[]).includes(x));if(k&&!C.saves[k])C.saves[k]=e.lbl});return ctx.patch()}});
