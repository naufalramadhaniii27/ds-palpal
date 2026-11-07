import {ABN,mod} from "./01-logic-core-helpers.js";
import {armorDef,classDef,featDef,weaponDef} from "./00-env.js";
import {registerSheetGroup,registerSheetRule} from "./12a-logic-sheet-registry.js";
import {defineLocals} from "./12b-logic-sheet-schema.js";
/* Sheet handlers, part 3 (contract in 12a-logic-sheet-registry.js): what is worn and held (phase "gear"), Armor Class (phases "ac" and "acbonus"),
   saving throw bonuses (phase "savebonus").
   l.EW active weapons (a conjured pact weapon joins), l.pactW pact weapon name or "", l.uaM / l.acS / l.uaX ways to get an unarmored AC (main class
   Unarmored Defense, subclass AC, multiclass Unarmored Defense), l.monkLv, l.umOn (Monk, no armor, no Shield), l.maOn (Martial Arts usable), l.maDie,
   l.acm AC methods (read by the builder), l.sbn saving throw bonuses. */
defineLocals({EW:"array",pactW:"string",uaM:"object?",acS:"object?",uaX:"object?",monkLv:"number",umOn:"boolean",maOn:"boolean",maDie:"string",acm:"array",sbn:"array"});
/* ---------- gear ---------- */
/* M13: Pact of the Blade. A pact weapon that is not in the inventory is conjured in your hand, so it counts as an active weapon */
registerSheetRule({id:"warlock-pact-weapon",group:"gear",about:"Warlock, Pact of the Blade: the bonded weapon counts as active",phase:"gear",order:10,reads:["i.EW0","q.pactWeapon","q.baseOf","q.ensureInv"],writes:["l.EW","l.pactW"],
 run:function(ctx){const Q=ctx.q,l=ctx.l;let EW=ctx.i.EW0,pactW=Q.pactWeapon();const pactWw=pactW&&weaponDef(Q.baseOf(pactW).b);
  if(pactWw&&pactWw.k==="M"&&EW.indexOf(pactW)<0&&!Q.ensureInv().some((x) =>{return x.n===pactW}))EW=EW.concat([pactW]);else if(!(pactWw&&pactWw.k==="M"))pactW="";
  l.EW=EW;l.pactW=pactW;return ctx.patch()}});
/* M4 (RL10), M17, M10: the ways to get an AC without armor, read from data. CLASSES.*.ua (Unarmored Defense of the main class, then a multiclass part) and CLASSES.*.acSub[sub] (main class first, then multiclass) */
registerSheetGroup({id:"ac-sources",group:"armorClass",phase:"gear",order:20,reads:["i.c","i.B","i.L","i.ESH","i.mcl"],writes:["l.uaM","l.acS","l.uaX"],
 run:function(ctx){const I=ctx.i,ESH=I.ESH,l=ctx.l;let uaM=I.c.ua&&(I.c.ua.shield||!ESH)?I.c.ua:null,acS=null,uaX=null;
  I.mcl.forEach((m) =>{const u=classDef(m.cls).ua;if(u&&(u.shield||!ESH)&&m.lv>=u.l&&!uaX)uaX={u:u,cls:m.cls}});/* M10: multiclass Unarmored Defense, after the old order */
  [[I.B.cls,I.B.sub,I.L,0]].concat(I.mcl.map((m) =>{return [m.cls,m.sub,m.lv,1]})).forEach((q) =>{const s=(classDef(q[0]).acSub||{})[q[1]];if(s&&q[2]>=s.l&&!acS)acS={s:s,cls:q[0],lv:q[2],mc:q[3]}});
  l.uaM=uaM;l.acS=acS;l.uaX=uaX;return ctx.patch()}});
/* M6 (RL7): Martial Arts (die, Dexterous Attacks) and Unarmored Movement work only with no armor and no Shield (PHB 2024 p. 101-102).
   RL35 1b: Martial Arts also needs "unarmed or only Monk weapons": an active weapon that is not Simple Melee or Martial Melee Light turns it off.
   Unarmored Movement keeps the armor and Shield check only. M10: Monk level from the main class or a multiclass */
registerSheetRule({id:"monk-martial-arts-state",group:"gear",about:"Monk: Martial Arts and Unarmored Movement are on only with no armor, no Shield and only Monk weapons",phase:"gear",order:30,reads:["i.ar","i.ESH","l.EW","q.clsLv","q.baseOf","q.monkRule"],writes:["l.monkLv","l.umOn","l.maOn","l.maDie"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,l=ctx.l,EW=l.EW,monkLv=Q.clsLv("Monk"),umOn=monkLv>0&&!I.ar&&!I.ESH;
  const maOn=umOn&&!EW.some((n) =>{const w=weaponDef(Q.baseOf(n).b);return w&&!Q.monkRule(w,Q.baseOf(n).b)}),maDie=monkLv?classDef("Monk").track["Martial Arts Die"][monkLv-1].replace("d","1d"):"";
  l.monkLv=monkLv;l.umOn=umOn;l.maOn=maOn;l.maDie=maDie;return ctx.patch()}});
/* ---------- Armor Class ---------- */
registerSheetGroup({id:"ac-init",group:"armorClass",phase:"ac",order:5,reads:[],writes:["l.acm"],run:function(ctx){ctx.l.acm=[];return ctx.patch()}});/* v27 i2: AC methods of this build */
/* worn armor: its base AC, Dexterity limit (Medium Armor Master) and the Stealth disadvantage */
registerSheetGroup({id:"ac-worn-armor",group:"armorClass",phase:"ac",order:10,reads:["i.ar","i.EA","i.feats","i.a","i.SRC"],writes:["C.ac","C.skills"],
 run:function(ctx){const I=ctx.i,ar=I.ar,C=ctx.C;if(!ar)return null;let mam=null;I.feats.forEach((f) =>{const F=featDef(f.n);if(F&&F.med3&&ar.cat==="Medium")mam=F});/* v69: Medium Armor Master */let adx=ar.dex;if(mam&&adx==="max2"&&(mam.med3===1||I.a.sc.DEX>=mam.med3))adx="max3";
  C.ac={base:ar.ac,baseSrc:I.EA+", "+ar.cat+" armor ("+I.SRC+")",dex:adx,bonus:[]};if(ar.dis&&!(mam&&mam.medStealth))C.skills.forEach((s) =>{if(s.n==="Stealth")s.dis=I.EA});return ctx.patch()}});
/* no armor: the ways to set AC without armor, in the old rule order. B.acMode picks one, empty = the first */
registerSheetGroup({id:"ac-unarmored",group:"armorClass",phase:"ac",order:20,reads:["i.ar","i.B","i.a","i.sp","i.custom","i.feats","i.SRC","l.uaM","l.acS","l.uaX"],writes:["C.ac","l.acm"],
 run:function(ctx){const I=ctx.i,l=ctx.l,C=ctx.C,a=I.a,SRC=I.SRC,B=I.B,sp=I.sp,uaM=l.uaM,acS=l.acS,uaX=l.uaX;if(I.ar)return null;const acC=[];
  if(uaM)acC.push({k:"ua",ac:{base:10,baseSrc:uaM.n+" ("+SRC+", "+B.cls+" "+uaM.l+")",dex:"full",bonus:[{s:ABN[uaM.ab]+" modifier ("+uaM.n+")",v:mod(a.sc[uaM.ab])}]}});
  if(acS)acC.push({k:"acs",ac:{base:acS.s.base||10,baseSrc:acS.s.n+" ("+SRC+(acS.mc?", "+acS.cls+" "+acS.lv+", multiclass":"")+")",dex:"full",bonus:acS.s.ab?[{s:ABN[acS.s.ab]+" modifier ("+acS.s.n+")",v:mod(a.sc[acS.s.ab])}]:[]}});
  if(uaX)acC.push({k:"uax",ac:{base:10,baseSrc:uaX.u.n+" ("+SRC+", "+uaX.cls+" "+uaX.u.l+", multiclass)",dex:"full",bonus:[{s:ABN[uaX.u.ab]+" modifier ("+uaX.u.n+")",v:mod(a.sc[uaX.u.ab])}]}});
  if(sp&&sp.natAc&&!I.custom)acC.push({k:"nat",ac:{base:sp.natAc.base,baseSrc:"Natural Armor ("+B.species+", "+(sp.hb||SRC)+")",dex:"",bonus:sp.natAc.ab?[{s:ABN[sp.natAc.ab]+" modifier (Natural Armor)",v:mod(a.sc[sp.natAc.ab])}]:[]}});/* v36 p21 */
  I.feats.forEach((f) =>{const F=featDef(f.n);if(F&&F.unarmoredAC)acC.push({k:"ft"+f.n,ac:{base:F.unarmoredAC,baseSrc:f.n+" ("+f.s+")",dex:"full",bonus:[]}})});/* v69 */
  acC.push({k:"none",ac:{base:10,baseSrc:"Unarmored",dex:"full",bonus:[]}});const dmA=mod(a.sc.DEX);
  l.acm=acC.map((x) =>{return {k:x.k,n:x.ac.baseSrc.replace(" ("+SRC+")","").replace("("+SRC+", ","("),v:x.ac.base+(x.ac.dex==="full"?dmA:0)+x.ac.bonus.reduce((t,b) =>{return t+b.v},0)}});
  const pkA=acC.filter((x) =>{return x.k===B.acMode})[0];C.ac=structuredClone((pkA||acC[0]).ac);if(pkA&&pkA!==acC[0])C.ac.baseSrc+=", chosen in the builder";return ctx.patch()}});
/* v19 RL42: Robe of the Archmagi with no armor on: base AC 15 + Dex, used when it beats the base from above */
registerSheetGroup({id:"item-ac-base",group:"armorClass",phase:"ac",order:30,reads:["i.ar","i.AFX"],writes:["C.ac"],
 run:function(ctx){const C=ctx.C;if(ctx.i.ar)return null;ctx.i.AFX.forEach((q) =>{const f=q.fx;if(!f.acBase)return;const cur=C.ac.base+C.ac.bonus.reduce((t,b) =>{return t+b.v},0);if(f.acBase>cur)C.ac={base:f.acBase,baseSrc:q.n+" (no armor)",dex:"full",bonus:[]}});return ctx.patch()}});
/* fx engine v2: acBase [base, "full" for Dex, ability key] or acDexAb "CON" (10 + Dex + ability) replace the base AC while no armor is worn, when higher.
   acBase ability "cast" = best spellcasting ability; acOver = also counts while armor is worn (the better one is used). fx engine v4: acDexMax 2 = the Dex modifier counts at most +2 in this base (Medium-armor style, sheet mode "max2") */
registerSheetGroup({id:"fx-ac-base",group:"armorClass",phase:"ac",order:40,reads:["i.G","i.ar","i.ESH","i.EA","i.a","q.fxOk","q.casterParts"],writes:["C.ac"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C,a=I.a,ar=I.ar;I.G.forEach((e) =>{const b0=e.acBase||(e.acDexAb?[10,"full",e.acDexAb]:null);if(!b0||(ar&&!e.acOver)||!Q.fxOk(e,ar,I.ESH,I.EA))return;const b=b0.slice();if(b[2]==="cast"){let best=null;Q.casterParts().forEach((p) =>{if(!best||mod(a.sc[p.ab])>mod(a.sc[best]))best=p.ab});if(!best)return;b[2]=best}
  const dx0=mod(a.sc.DEX),dx=e.acDexMax!=null?Math.min(dx0,e.acDexMax):dx0,ab=b[2]?Math.min(mod(a.sc[b[2]]),e.acCap!=null?e.acCap:99):0,nb=b[0]+(b[1]==="full"?dx:0)+ab,cur=C.ac.base+(C.ac.dex==="full"?dx0:C.ac.dex==="max2"?Math.min(2,dx0):0)+C.ac.bonus.reduce((t,x) =>{return t+x.v},0);
  if(nb>cur)C.ac={base:b[0],baseSrc:e.lbl+(ar?" (used instead of the worn armor)":" (no armor)"),dex:b[1]==="full"?(e.acDexMax===2?"max2":"full"):"",bonus:b[2]?[{s:ABN[b[2]]+" modifier ("+e.n+")",v:ab}]:[]}});return ctx.patch()}});
/* fx engine v2: acNoDex (the Dex modifier is not added to AC) and acArmAb "WIS" (while wearing armor, add that ability modifier to AC in place of the Dex modifier). Runs after the base AC is settled */
registerSheetGroup({id:"fx-ac-nodex",group:"armorClass",phase:"ac",order:50,reads:["i.G","i.ar","i.ESH","i.EA","i.a","q.fxOk"],writes:["C.ac"],
 run:function(ctx){const I=ctx.i,C=ctx.C,ar=I.ar;I.G.forEach((e) =>{if(!e.acNoDex&&!(e.acArmAb&&ar))return;if(!ctx.q.fxOk(e,ar,I.ESH,I.EA))return;C.ac.dex="";if(e.acArmAb&&ar)C.ac.bonus.push({s:ABN[e.acArmAb]+" modifier in place of Dexterity ("+e.lbl+")",v:Math.min(mod(I.a.sc[e.acArmAb]),e.acCap!=null?e.acCap:99)})});return ctx.patch()}});
/* M18: a magic item that gives AC (not armor) */
registerSheetGroup({id:"item-ac-bonus",group:"armorClass",phase:"ac",order:60,reads:["i.AFX","q.dmapRow"],writes:["C.ac"],
 run:function(ctx){const C=ctx.C;ctx.i.AFX.forEach((q) =>{if(q.fx.ac&&!q.arm&&q.t!=="Armor")C.ac.bonus.push({s:q.n+" (magic item"+(ctx.q.dmapRow(q.n)[3]?", attuned":"")+")",v:q.fx.ac})});return ctx.patch()}});
/* ---------- saving throw bonuses ---------- */
/* l.sbn: magic items (+1 to saves), fx saveBonus, the Paladin aura, saveBonusNp (only saves without proficiency), saveBonusAb (one ability's save) */
registerSheetGroup({id:"save-bonus-items",group:"saveBonus",phase:"savebonus",order:10,reads:["i.AFX","q.dmapRow"],writes:["l.sbn"],
 run:function(ctx){const sbn=[];ctx.i.AFX.forEach((q) =>{if(q.fx.save)sbn.push({s:q.n+" (magic item"+(ctx.q.dmapRow(q.n)[3]?", attuned":"")+")",v:q.fx.save})});ctx.l.sbn=sbn;return ctx.patch()}});
registerSheetGroup({id:"fx-save-bonus",group:"saveBonus",phase:"savebonus",order:20,reads:["i.G","i.ar","i.ESH","i.EA","q.fxOk","q.fxv"],writes:["l.sbn"],
 run:function(ctx){const I=ctx.i,sbn=ctx.l.sbn,Q=ctx.q;I.G.forEach((e) =>{if(e.saveBonus==null||!Q.fxOk(e,I.ar,I.ESH,I.EA))return;const v=Q.fxv(e.saveBonus,e);if(v)sbn.push({s:e.lbl,v:v})});return ctx.patch()}});
/* RU35 no. 6: you are inside your own aura */
registerSheetRule({id:"paladin-6-aura",group:"saveBonus",about:"Paladin 6: Aura of Protection, Charisma modifier (at least +1) to your saves",phase:"savebonus",order:30,reads:["i.a","q.clsLv"],writes:["l.sbn"],
 run:function(ctx){const sbn=ctx.l.sbn,pal=ctx.q.clsLv("Paladin");if(pal>=6)sbn.push({s:"Aura of Protection (Paladin "+pal+")",v:Math.max(1,mod(ctx.i.a.sc.CHA))});return ctx.patch()}});
/* fx engine v2: saveBonusNp, only the saves without proficiency */
registerSheetGroup({id:"fx-save-bonus-np",group:"saveBonus",phase:"savebonus",order:40,reads:["i.G","i.ar","i.ESH","i.EA","q.fxOk","q.fxv"],writes:["l.sbn"],
 run:function(ctx){const I=ctx.i,sbn=ctx.l.sbn,Q=ctx.q;I.G.forEach((e) =>{if(e.saveBonusNp==null||!Q.fxOk(e,I.ar,I.ESH,I.EA))return;const v=Q.fxv(e.saveBonusNp,e);if(v)sbn.push({s:e.lbl,v:v,np:1,t:(v>0?"+":"")+v+" to saving throws that do not use your Proficiency Bonus"})});return ctx.patch()}});
/* fx engine v4: saveBonusAb [[ability, value]] = bonus to that one saving throw (item "+1 to Intelligence saving throws"). Entry {s,v,ab}; the sheet adds it to that save only */
registerSheetGroup({id:"fx-save-bonus-ab",group:"saveBonus",phase:"savebonus",order:50,reads:["i.G","i.ar","i.ESH","i.EA","q.fxOk","q.fxv"],writes:["l.sbn"],
 run:function(ctx){const I=ctx.i,sbn=ctx.l.sbn,Q=ctx.q;I.G.forEach((e) =>{if(!e.saveBonusAb||(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA)))return;e.saveBonusAb.forEach((r) =>{const v=Q.fxv(r[1],e);if(v)sbn.push({s:e.lbl,v:v,ab:r[0]})})});return ctx.patch()}});
/* M18: new optional C.saveBonus [{s,v}], all saving throws */
registerSheetGroup({id:"save-bonus-sheet",group:"saveBonus",phase:"savebonus",order:60,reads:["l.sbn"],writes:["C.saveBonus"],
 run:function(ctx){if(ctx.l.sbn.length)ctx.C.saveBonus=ctx.l.sbn;return ctx.patch()}});
/* v19 RL43: optional, missing = 3 */
registerSheetGroup({id:"attunement-max",group:"attunement",phase:"savebonus",order:70,reads:["i.attMax"],writes:["C.attMax"],
 run:function(ctx){if(ctx.i.attMax!==3)ctx.C.attMax=ctx.i.attMax;return ctx.patch()}});
/* ---------- more AC (phase "acbonus") ---------- */
registerSheetGroup({id:"item-bracers",group:"armorClass",phase:"acbonus",order:10,reads:["i.B","i.EA","i.ESH"],writes:["C.ac"],
 run:function(ctx){const I=ctx.i,C=ctx.C;(I.B.inv||[]).forEach((x) =>{if(!x.eq)return;if(x.n==="Bracers of Defense"&&!I.EA&&!I.ESH)C.ac.bonus.push({s:"Bracers of Defense (no armor or Shield)",v:2})});return ctx.patch()}});
registerSheetGroup({id:"shield-ac",group:"armorClass",phase:"acbonus",order:20,reads:["i.ESH","i.SRC","q.baseOf"],writes:["C.ac"],
 run:function(ctx){const I=ctx.i;if(I.ESH)ctx.C.ac.bonus.push({s:I.ESH+" ("+I.SRC+")",v:2+ctx.q.baseOf(I.ESH).p});return ctx.patch()}});
/* generic: fx.shAc, extra AC while a Shield is held (Warden Tower Shield) */
registerSheetGroup({id:"fx-shield-ac",group:"armorClass",phase:"acbonus",order:30,reads:["i.ESH","i.G"],writes:["C.ac"],
 run:function(ctx){const C=ctx.C;if(ctx.i.ESH)ctx.i.G.forEach((e) =>{if(!e.shAc)return;let ex=0;e.shAc.forEach((r) =>{if(e.lv>=r[0])ex=r[1]});if(ex)C.ac.bonus.push({s:e.lbl,v:ex})});return ctx.patch()}});
/* generic: class fx.ac [[class level, bonus]] and fx.acAb (add an ability modifier), cond armor or noArmor. fx engine v5: acCap = the entry adds at most this much AC (Wooden Chain: Wisdom modifier, max +2) */
registerSheetGroup({id:"fx-ac-bonus",group:"armorClass",phase:"acbonus",order:40,reads:["i.G","i.ar","i.ESH","i.EA","i.a","q.fxOk","q.fxv"],writes:["C.ac"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C,a=I.a;I.G.forEach((e) =>{if(!e.ac&&!e.acAb&&e.acAdd==null&&!e.acMw)return;if(!Q.fxOk(e,I.ar,I.ESH,I.EA))return;let v=0;(e.ac||[]).forEach((r) =>{if(e.lv>=r[0])v=r[1]});if(e.acAb)v+=Math.max(e.acMin||0,mod(a.sc[e.acAb]));if(e.acAdd!=null)v+=Q.fxv(e.acAdd,e);if(e.acMw&&/Masterwork/.test(I.EA||""))v+=e.acMw;if(e.acCap!=null&&v>e.acCap)v=e.acCap;if(v)C.ac.bonus.push({s:e.lbl,v:v})});return ctx.patch()}});
registerSheetGroup({id:"armor-magic-bonus",group:"armorClass",phase:"acbonus",order:50,reads:["i.EAp","i.EA"],writes:["C.ac"],
 run:function(ctx){const I=ctx.i;if(I.EAp)ctx.C.ac.bonus.push({s:I.EA+" (magic bonus)",v:I.EAp});return ctx.patch()}});
/* v69: Dual Wielder, +1 AC with a melee weapon in each hand and no Shield */
registerSheetGroup({id:"feat-dual-wielder-ac",group:"armorClass",phase:"acbonus",order:60,reads:["i.feats","i.ESH","l.EW","q.baseOf"],writes:["C.ac"],
 run:function(ctx){const I=ctx.i,C=ctx.C,EW=ctx.l.EW;I.feats.forEach((f) =>{const F=featDef(f.n);if(F&&F.dwAC&&!I.ESH&&EW.filter((n) =>{const w=weaponDef(ctx.q.baseOf(n).b);return w&&w.k==="M"}).length>=2)C.ac.bonus.push({s:f.n+" (melee weapon in each hand)",v:1})});return ctx.patch()}});
/* M17: FEATS.ac (with armor) */
registerSheetGroup({id:"feat-ac",group:"armorClass",phase:"acbonus",order:70,reads:["i.feats","i.ar"],writes:["C.ac"],
 run:function(ctx){const I=ctx.i,C=ctx.C;I.feats.forEach((f) =>{const F=featDef(f.n);if(F&&F.ac&&I.ar)C.ac.bonus.push({s:(F.cat==="F"?"Fighting Style: ":"")+f.n+" ("+f.s+")",v:F.ac})});return ctx.patch()}});
registerSheetGroup({id:"species-ac-bonus",group:"armorClass",phase:"acbonus",order:80,reads:["i.sp","i.custom"],writes:["C.ac"],
 run:function(ctx){const sp=ctx.i.sp;if(sp&&sp.acBonus&&!ctx.i.custom)ctx.C.ac.bonus.push({s:sp.acBonus.s,v:sp.acBonus.v});return ctx.patch()}});
/* third party: a flat Armor Class bonus a subclass gives from a level (acb:{l,v,s}) */
registerSheetGroup({id:"subclass-ac-bonus",group:"armorClass",phase:"acbonus",order:90,reads:["i.B","i.L","i.custom","q.sbWx"],writes:["C.ac"],
 run:function(ctx){const I=ctx.i,Wsb=ctx.q.sbWx(I.B.sub,I.B.cls);if(Wsb&&Wsb.acb&&!I.custom&&I.L>=(Wsb.acb.l||1))ctx.C.ac.bonus.push({s:Wsb.acb.s,v:Wsb.acb.v});return ctx.patch()}});
/* v74: AC bonus from a species option (Simic Hybrid Carapace). v58: species bonus to AC (Warforged Integrated Protection) */
registerSheetGroup({id:"species-option-ac-bonus",group:"armorClass",phase:"acbonus",order:100,reads:["i.L","i.custom","i.SFX"],writes:["C.ac"],
 run:function(ctx){const I=ctx.i,SFa=I.SFX;if(SFa.acBonus&&!I.custom&&I.L>=(SFa.acBonus.l||1))ctx.C.ac.bonus.push({s:SFa.acBonus.s,v:SFa.acBonus.v});return ctx.patch()}});
