import {ABK,ABN,SRC,dieAvg,mod,pbOf} from "./01-logic-core-helpers.js";
import {DMAP,activeFx,attMax,bgX,byOk,htText,spX} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {CL,R14} from "./05-logic-choice-model-ruleset.js";
import {PACTB14,sdn,subLbl,subLv} from "./08-logic-2014-rules.js";
import {XFX,allFeats,bgTl,chOf,choices,dmSpells,featSpells,grantTools,hbPickOk,kitTool,sbWx,spClsJ,spFxTo,spItemB,spItemSrc,spLinTrait,spTraitText,subAt,toolChoices} from "./09-logic-feats-and-choices.js";
import {agOn,invList,luRows,optAny,pactWeapon,saveNotes,wisElse,wmAll,xdmgRows,ycOf} from "./10-logic-v17-additions.js";
import {fxToggles,ATKC,__set_ATKC,abil,casterParts,classFeatures,clsLv,clsParts,featsOf,keepResKeys,resKey,resMax,slotsFor,slugK,spLists,spellAb} from "./11-logic-derivation.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"toSheet",{get:function(){return toSheet;},set:function(v){toSheet=v;},configurable:true});
/* ---------- export to sheet (v3) ---------- */
export var ACM=[];/* v27 i2: AC methods of the last toSheet, for the builder */
export function toSheet(){
 __R.syncPickItems();/* fx pick t:"item": chosen items join the inventory before anything reads it */
 const c=CL(),L=B.level,TLv=__R.TL(),a=abil(),pb=pbOf(TLv),sp=SPECIES[B.species],custom=B.species==="Custom";
 const spName=custom?(B.cSpecies.name||"Custom species"):B.species;
 const subName=B.sub==="__custom"?(B.cSub||"Homebrew subclass"):B.sub;
 const bg=BACKGROUNDS[B.bg],feats=allFeats();
 const C={v:3,bv:window.__appVer||0,/* v27 RU28: the app version whose builder made this sheet */name:B.name,species:spName+(B.ch.lin?" ("+B.ch.lin.split(" (")[0]+")":""),cls:B.cls,sub:subName||"",bg:B.bg,size:custom?B.cSpecies.size:(sp.size.indexOf("or")>0?(B.size||"Medium"):sp.size),office:"",camp:B.camp||"",cardNo:"",level:TLv,hitDie:c.hd,hpPerLevel:__R.hpCalc().list.map((e) =>{return {v:e.v,c:e.c,r:e.r,n:e.n}}),abilities:{},rolledNote:"Built with PHB 2024 Builder",saves:{},skills:[],initBonus:[],hpBonus:[],grappler:false};
 ABK.forEach((k) =>{C.abilities[k]={base:+B.base[k]||10,bonus:a.src[k].map((b) =>{return {s:b.s,v:b.v}})}});
 c.saves.forEach((k) =>{C.saves[k]=B.cls+" class ("+SRC+")"});
 if(sp&&sp.saveProf&&!custom)sp.saveProf.forEach((k) =>{if(!C.saves[k])C.saves[k]=B.species+" ("+(sp.hb||SRC)+")"});/* v74: species saving throw proficiency (Keldon Human) */
 /* M10: also from a multiclass Monk 14 or Rogue 15 */
 clsParts().forEach((q) =>{const mt=q.mc?", multiclass":"";if(q.cls==="Monk"&&q.lv>=14)ABK.forEach((k) =>{if(!C.saves[k])C.saves[k]=(R14()?"Diamond Soul":"Disciplined Survivor")+" ("+SRC+", Monk 14"+mt+")"});
  if(q.cls==="Ranger"&&subAt("Ranger","Gloom Stalker")>=7){const imc={Intelligence:"INT",Charisma:"CHA"}[chOf("Ranger","p7opt")],im=!wisElse()&&!C.saves.WIS?"WIS":imc&&!C.saves[imc]?imc:["WIS","INT","CHA"].filter((k) =>{return !C.saves[k]})[0];/* v32 RL49 no. 30: the chosen save. Not chosen yet: the first free one, as before */if(im)C.saves[im]="Iron Mind ("+SRC+", Gloom Stalker 7"+mt+")"}/* V17-5 */
  if(q.cls==="Rogue"&&q.lv>=15){(R14()?["WIS"]:["WIS","CHA"]).forEach((k) =>{if(!C.saves[k])C.saves[k]="Slippery Mind ("+SRC+", Rogue 15"+mt+")"})}});
 __R.classFx().forEach((e) =>{if(!e.saveFrom)return;const v=__R.fxCh(e.saveFrom,e.pre,e.kind,e.okey),a=Array.isArray(v)?v:(v?[v]:[]);a.forEach((nm) =>{const k=ABK.filter((x) =>{return ABN[x]===nm})[0];if(k&&!C.saves[k])C.saves[k]=e.lbl})});/* generic: fx.saveFrom */
 feats.forEach((f) =>{const F=FEATS[f.n];if(F&&F.saveFromAsi&&f.asi&&f.asi.a1)C.saves[f.asi.a1]=f.n+" feat ("+f.s+")"});/* M17: FEATS.saveFromAsi */
 const prof={},exp={};
 function p(n,s){if(n&&!prof[n])prof[n]=s}
 if(bg)bg.sk.forEach((n) =>{p(n,B.bg+" background ("+SRC+")")});
 const CHT0=choices();CHT0.forEach((ch) =>{const v=B.ch[ch.key];if(ch.t==="skills"&&Array.isArray(v))v.forEach((n) =>{p(n,ch.title+", "+ch.src);if(ch.ex)exp[n]=ch.feature+" ("+ch.src+")"/* v63 */});if(ch.t==="exp"&&Array.isArray(v))v.forEach((n) =>{exp[n]=ch.src})});
 const SG=__R.subGrant(B.sub);if(SG&&SG.skills)SG.skills.forEach((q) =>{if(L>=q[0])p(q[1],B.sub+" "+q[0])});
 if(sp&&sp.skills)sp.skills.forEach((n) =>{p(n,B.species+" ("+(sp.hb||SRC)+")")});
 /* v32 RL49: Keen Mind, Observant: proficiency, or Expertise when you have it already. Boon of Skill: every skill */
 CHT0.forEach((ch) =>{const v=B.ch[ch.key];if(ch.t==="pe"&&Array.isArray(v))v.forEach((n) =>{if(prof[n])exp[n]=ch.feature+" ("+ch.src+")";else p(n,ch.title+", "+ch.src)})});
 feats.forEach((f) =>{const F=FEATS[f.n];if(F&&F.allSk)ALLSK.forEach((n) =>{p(n,f.n+" ("+f.s+")")})});XFX.skills(feats,p,prof,exp);/* v62 */__R.gfx().forEach((e) =>{(e.skillProf||[]).forEach((n) =>{p(n,e.lbl)})});/* fx engine v2 */
 clsParts().forEach((q) =>{const g=typeof SUB_GRANT!=="undefined"&&SUB_GRANT[q.sub];if(g&&g.skills)g.skills.forEach((s) =>{if(q.lv>=s[0])p(s[1],g.f+" ("+q.sub+" "+s[0]+")")})});/* v32 */
 __R.gfx().forEach((e) =>{(e.skillExpert||[]).forEach((n) =>{if(prof[n])exp[n]=e.lbl})});/* fx engine v2: Expertise needs the proficiency */__R.gfx().forEach((e) =>{(e.skillPE||[]).forEach((n) =>{if(prof[n])exp[n]=e.lbl;else p(n,e.lbl)})});/* fx batch E: skillPE = proficiency, or Expertise when already proficient (Red Sisterhood, Strigoi) */
 const PPLUS=[];__R.gfx().forEach((e) =>{(e.skillProfPlus||[]).forEach((n) =>{if(prof[n])PPLUS.push([n,e]);else p(n,e.lbl)})});/* skillProfPlus: proficiency, or a +1 bonus to checks with the skill when already proficient (Ioun stones) */
 ALLSK.forEach((n) =>{const o={n:n,ab:SKILLS[n]};if(prof[n]){o.p=1;o.src=prof[n]}if(exp[n]){o.p=2;o.src=(prof[n]||"")+"; Expertise from "+exp[n]}C.skills.push(o)});
 __R.packSkills().forEach((s) =>{const o={n:s.n,ab:s.ab,hb:1};if(s.d)o.hbd=s.d;if(prof[s.n]){o.p=1;o.src=prof[s.n]}C.skills.push(o)});
 if(clsLv("Bard")>=2&&Math.floor(pb/2))C.skills.forEach((s) =>{if(!s.p){s.misc=(s.misc||0)+Math.floor(pb/2);s.miscSrc=(s.miscSrc?s.miscSrc+"; ":"")+"Jack of All Trades (PHB-2024, Bard 2)"}});/* v35 p07 */XFX.post(C,a);/* v63 */__R.gfx().forEach((e) =>{const add=function(s,v){if(!v)return;s.misc=(s.misc||0)+v;s.miscSrc=(s.miscSrc?s.miscSrc+"; ":"")+e.lbl+" "+(v>0?"+":"")+v};(e.skillBonus||[]).forEach((r) =>{C.skills.forEach((s) =>{if(r[0]==="*"||s.n===r[0])add(s,__R.fxv(r[1],e))})});(e.chkBonus||[]).forEach((r) =>{C.skills.forEach((s) =>{if(s.ab===r[0])add(s,__R.fxv(r[1],e))})});(e.skillAb||[]).forEach((r) =>{C.skills.forEach((s) =>{if(s.n===r[0]&&a.sc[r[1]]!=null&&a.sc[s.ab]!=null){const d=mod(a.sc[r[1]])-mod(a.sc[s.ab]);if(d>0){s.misc=(s.misc||0)+d;s.miscSrc=(s.miscSrc?s.miscSrc+"; ":"")+e.lbl+" ("+r[1]+" modifier instead of "+s.ab+") +"+d}}})})});/* fx batch E: skillAb [[skill, ability]] uses that ability's modifier for the skill when higher (shown as a misc bonus) */PPLUS.forEach((r) =>{C.skills.forEach((s) =>{if(s.n===r[0]){s.misc=(s.misc||0)+1;s.miscSrc=(s.miscSrc?s.miscSrc+"; ":"")+r[1].lbl+" +1"}})});/* fx engine v2: skillBonus [[skill or "*", value]], chkBonus [[ability, value]] */
 const lg=["Common"];if(R14()){const sl0=spX(),bl0=bgX();((sl0&&sl0.lgf)||[]).concat((bl0&&bl0.lgf)||[]).forEach((x) =>{if(lg.indexOf(x)<0)lg.push(x)})}__R.langKeys().forEach((k) =>{(B.ch[k]||[]).forEach((x) =>{if(lg.indexOf(x)<0)lg.push(x)})});if(clsLv("Druid")&&lg.indexOf("Druidic")<0)lg.push("Druidic");if(clsLv("Rogue")&&lg.indexOf("Thieves' Cant")<0)lg.push("Thieves' Cant");XFX.lang(lg);C.lang=lg;/* M10: any class. v62: feat languages */
 /* armor */
 let EA=__R.effArmor(),ESH=__R.effShield(),EW=__R.effWeps(),KIT=__R.kitItems(),EAp=__R.baseOf(EA).p,ar=ARMOR[__R.baseOf(EA).b];
 /* M13: a pact weapon that is not in the inventory is conjured in your hand, so it counts as an active weapon */
 let pactW=pactWeapon(),pactWw=pactW&&WEAPONS[__R.baseOf(pactW).b];if(pactWw&&pactWw.k==="M"&&EW.indexOf(pactW)<0&&!__R.ensureInv().some((x) =>{return x.n===pactW}))EW=EW.concat([pactW]);else if(!(pactWw&&pactWw.k==="M"))pactW="";
 /* M6 (RL7): Martial Arts (die, Dexterous Attacks) and Unarmored Movement work only with no armor and no Shield (PHB 2024 p. 101-102).
    RL35 1b: Martial Arts also needs "unarmed or only Monk weapons": an active weapon that is not Simple Melee or Martial Melee Light turns it off.
    Unarmored Movement keeps the armor and Shield check only. M10: Monk level from the main class or a multiclass */
 /* M4 (RL10): Draconic Resilience AC also from a multiclass Sorcerer level 3+. Same place in the AC order as before.
    M17: read from data. CLASSES.*.ua (Unarmored Defense of the main class) and CLASSES.*.acSub[sub] (main class first, then multiclass) */
 let uaM=c.ua&&(c.ua.shield||!ESH)?c.ua:null,acS=null,uaX=null;__R.MCL().forEach((m) =>{const u=CLASSES[m.cls].ua;if(u&&(u.shield||!ESH)&&m.lv>=u.l&&!uaX)uaX={u:u,cls:m.cls}});/* M10: multiclass Unarmored Defense, after the old order */[[B.cls,B.sub,L,0]].concat(__R.MCL().map((m) =>{return [m.cls,m.sub,m.lv,1]})).forEach((q) =>{const s=(CLASSES[q[0]].acSub||{})[q[1]];if(s&&q[2]>=s.l&&!acS)acS={s:s,cls:q[0],lv:q[2],mc:q[3]}});
 const monkLv=clsLv("Monk"),umOn=monkLv>0&&!ar&&!ESH,monkW=function(w,nm){return __R.monkRule(w,nm)};
 const maOn=umOn&&!EW.some((n) =>{const w=WEAPONS[__R.baseOf(n).b];return w&&!monkW(w,__R.baseOf(n).b)}),maDie=monkLv?CLASSES.Monk.track["Martial Arts Die"][monkLv-1].replace("d","1d"):"";
 ACM=[];/* v27 i2 */
 if(ar){let mam=null;feats.forEach((f) =>{const F=FEATS[f.n];if(F&&F.med3&&ar.cat==="Medium")mam=F});/* v69: Medium Armor Master */let adx=ar.dex;if(mam&&adx==="max2"&&(mam.med3===1||a.sc.DEX>=mam.med3))adx="max3";
  C.ac={base:ar.ac,baseSrc:EA+", "+ar.cat+" armor ("+SRC+")",dex:adx,bonus:[]};if(ar.dis&&!(mam&&mam.medStealth))C.skills.forEach((s) =>{if(s.n==="Stealth")s.dis=EA})}
 else{const acC=[];/* v27 i2: the ways to set AC without armor, in the old rule order. B.acMode picks one, empty = the first */if(uaM)acC.push({k:"ua",ac:{base:10,baseSrc:uaM.n+" ("+SRC+", "+B.cls+" "+uaM.l+")",dex:"full",bonus:[{s:ABN[uaM.ab]+" modifier ("+uaM.n+")",v:mod(a.sc[uaM.ab])}]}});
 if(acS)acC.push({k:"acs",ac:{base:acS.s.base||10,baseSrc:acS.s.n+" ("+SRC+(acS.mc?", "+acS.cls+" "+acS.lv+", multiclass":"")+")",dex:"full",bonus:acS.s.ab?[{s:ABN[acS.s.ab]+" modifier ("+acS.s.n+")",v:mod(a.sc[acS.s.ab])}]:[]}});
 if(uaX)acC.push({k:"uax",ac:{base:10,baseSrc:uaX.u.n+" ("+SRC+", "+uaX.cls+" "+uaX.u.l+", multiclass)",dex:"full",bonus:[{s:ABN[uaX.u.ab]+" modifier ("+uaX.u.n+")",v:mod(a.sc[uaX.u.ab])}]}});
 if(sp&&sp.natAc&&!custom)acC.push({k:"nat",ac:{base:sp.natAc.base,baseSrc:"Natural Armor ("+B.species+", "+(sp.hb||SRC)+")",dex:"",bonus:sp.natAc.ab?[{s:ABN[sp.natAc.ab]+" modifier (Natural Armor)",v:mod(a.sc[sp.natAc.ab])}]:[]}});/* v36 p21 */
 feats.forEach((f) =>{const F=FEATS[f.n];if(F&&F.unarmoredAC)acC.push({k:"ft"+f.n,ac:{base:F.unarmoredAC,baseSrc:f.n+" ("+f.s+")",dex:"full",bonus:[]}})});/* v69 */
 acC.push({k:"none",ac:{base:10,baseSrc:"Unarmored",dex:"full",bonus:[]}});const dmA=mod(a.sc.DEX);ACM=acC.map((x) =>{return {k:x.k,n:x.ac.baseSrc.replace(" ("+SRC+")","").replace("("+SRC+", ","("),v:x.ac.base+(x.ac.dex==="full"?dmA:0)+x.ac.bonus.reduce((t,b) =>{return t+b.v},0)}});
  const pkA=acC.filter((x) =>{return x.k===B.acMode})[0];C.ac=structuredClone((pkA||acC[0]).ac);if(pkA&&pkA!==acC[0])C.ac.baseSrc+=", chosen in the builder"}
 /* v19 RL42: Robe of the Archmagi with no armor on: base AC 15 + Dex, used when it beats the base from above */
 if(!ar)activeFx().forEach((q) =>{const f=q.fx;if(!f.acBase)return;const cur=C.ac.base+C.ac.bonus.reduce((t,b) =>{return t+b.v},0);if(f.acBase>cur)C.ac={base:f.acBase,baseSrc:q.n+" (no armor)",dex:"full",bonus:[]}});
 /* fx engine v2: acBase [base, "full" for Dex, ability key] or acDexAb "CON" (10 + Dex + ability) replace the base AC while no armor is worn, when higher */
 __R.gfx().forEach((e) =>{const b0=e.acBase||(e.acDexAb?[10,"full",e.acDexAb]:null);if(!b0||(ar&&!e.acOver)||!__R.fxOk(e,ar,ESH,EA))return;const b=b0.slice();if(b[2]==="cast"){let best=null;__R.casterParts().forEach((p) =>{if(!best||mod(a.sc[p.ab])>mod(a.sc[best]))best=p.ab});if(!best)return;b[2]=best}/* acBase ability "cast" = best spellcasting ability; acOver = also counts while armor is worn (the better one is used) */const dx=mod(a.sc.DEX),ab=b[2]?mod(a.sc[b[2]]):0,nb=b[0]+(b[1]==="full"?dx:0)+ab,cur=C.ac.base+(C.ac.dex==="full"?dx:0)+C.ac.bonus.reduce((t,x) =>{return t+x.v},0);if(nb>cur)C.ac={base:b[0],baseSrc:e.lbl+(ar?" (used instead of the worn armor)":" (no armor)"),dex:b[1]==="full"?"full":"",bonus:b[2]?[{s:ABN[b[2]]+" modifier ("+e.n+")",v:ab}]:[]}});
 /* fx engine v2: acNoDex (the Dex modifier is not added to AC) and acArmAb "WIS" (while wearing armor, add that ability modifier to AC in place of the Dex modifier). Runs after the base AC is settled */
 __R.gfx().forEach((e) =>{if(!e.acNoDex&&!(e.acArmAb&&ar))return;if(!__R.fxOk(e,ar,ESH,EA))return;C.ac.dex="";if(e.acArmAb&&ar)C.ac.bonus.push({s:ABN[e.acArmAb]+" modifier in place of Dexterity ("+e.lbl+")",v:mod(a.sc[e.acArmAb])})});
 activeFx().forEach((q) =>{if(q.fx.ac&&!q.arm&&q.t!=="Armor")C.ac.bonus.push({s:q.n+" (magic item"+(DMAP[q.n][3]?", attuned":"")+")",v:q.fx.ac})});/* M18 */
 const sbn=[];activeFx().forEach((q) =>{if(q.fx.save)sbn.push({s:q.n+" (magic item"+(DMAP[q.n][3]?", attuned":"")+")",v:q.fx.save})});__R.gfx().forEach((e) =>{if(e.saveBonus==null||!__R.fxOk(e,ar,ESH,EA))return;const v=__R.fxv(e.saveBonus,e);if(v)sbn.push({s:e.lbl,v:v})});const pal=clsLv("Paladin");if(pal>=6)sbn.push({s:"Aura of Protection (Paladin "+pal+")",v:Math.max(1,mod(a.sc.CHA))});/* RU35 no. 6: you are inside your own aura */
 __R.gfx().forEach((e) =>{if(e.saveBonusNp==null||!__R.fxOk(e,ar,ESH,EA))return;const v=__R.fxv(e.saveBonusNp,e);if(v)sbn.push({s:e.lbl,v:v,np:1,t:(v>0?"+":"")+v+" to saving throws that do not use your Proficiency Bonus"})});/* fx engine v2: saveBonusNp, only the saves without proficiency */
 if(sbn.length)C.saveBonus=sbn;/* M18: new optional C.saveBonus [{s,v}], all saving throws */
 if(attMax()!==3)C.attMax=attMax();/* v19 RL43: optional, missing = 3 */
 (B.inv||[]).forEach((x) =>{if(!x.eq)return;if(x.n==="Bracers of Defense"&&!EA&&!ESH)C.ac.bonus.push({s:"Bracers of Defense (no armor or Shield)",v:2})});
 if(ESH)C.ac.bonus.push({s:ESH+" ("+SRC+")",v:2+__R.baseOf(ESH).p});if(ESH)__R.classFx().forEach((e) =>{if(!e.shAc)return;let ex=0;e.shAc.forEach((r) =>{if(e.lv>=r[0])ex=r[1]});if(ex)C.ac.bonus.push({s:e.lbl,v:ex})});/* generic: fx.shAc, extra AC while a Shield is held (Warden Tower Shield) */__R.gfx().forEach((e) =>{if(!e.ac&&!e.acAb&&e.acAdd==null&&!e.acMw)return;if(!__R.fxOk(e,ar,ESH,EA))return;let v=0;(e.ac||[]).forEach((r) =>{if(e.lv>=r[0])v=r[1]});if(e.acAb)v+=Math.max(e.acMin||0,mod(a.sc[e.acAb]));if(e.acAdd!=null)v+=__R.fxv(e.acAdd,e);if(e.acMw&&/Masterwork/.test(EA||""))v+=e.acMw;if(v)C.ac.bonus.push({s:e.lbl,v:v})});/* generic: class fx.ac [[class level, bonus]] and fx.acAb (add an ability modifier), cond armor or noArmor */if(EAp)C.ac.bonus.push({s:EA+" (magic bonus)",v:EAp});
 feats.forEach((f) =>{const F=FEATS[f.n];if(F&&F.dwAC&&!ESH&&EW.filter((n) =>{const w=WEAPONS[__R.baseOf(n).b];return w&&w.k==="M"}).length>=2)C.ac.bonus.push({s:f.n+" (melee weapon in each hand)",v:1})});/* v69 */
 feats.forEach((f) =>{const F=FEATS[f.n];if(F&&F.ac&&ar)C.ac.bonus.push({s:(F.cat==="F"?"Fighting Style: ":"")+f.n+" ("+f.s+")",v:F.ac})});/* M17: FEATS.ac (with armor) */
 if(sp&&sp.acBonus&&!custom)C.ac.bonus.push({s:sp.acBonus.s,v:sp.acBonus.v});
 {const Wsb=typeof sbWx==="function"?sbWx(B.sub,B.cls):null;if(Wsb&&Wsb.acb&&!custom&&L>=(Wsb.acb.l||1))C.ac.bonus.push({s:Wsb.acb.s,v:Wsb.acb.v})}/* third party: a flat Armor Class bonus a subclass gives from a level (acb:{l,v,s}) */
 {const SFa=__R.spOptFx();if(SFa.acBonus&&!custom&&L>=(SFa.acBonus.l||1))C.ac.bonus.push({s:SFa.acBonus.s,v:SFa.acBonus.v})}/* v74: AC bonus from a species option (Simic Hybrid Carapace) *//* v58: species bonus to AC (Warforged Integrated Protection) */
 /* speed and senses */
 let SFX2=__R.spOptFx(),spd=custom?+B.cSpecies.speed:(SFX2.speedSet||sp.speed),spSrc=spName+" ("+(custom?"homebrew":(sp.hb||SRC))+")";if(SFX2.speed){spd+=SFX2.speed;spSrc+=", +"+SFX2.speed+" Quick"}
 if(clsLv("Barbarian")>=5&&!(ar&&ar.cat==="Heavy")){spd+=10;spSrc+=", +10 Fast Movement"}
 if(umOn&&monkLv>=2){const um=CLASSES.Monk.track["Unarmored Movement"][monkLv-1];spd+=parseInt(um);spSrc+=", "+um+" Unarmored Movement"}
 if(clsLv("Ranger")>=6&&!R14()&&!(ar&&ar.cat==="Heavy")){spd+=10;spSrc+=", +10 Roving"}/* M8 (RL8): not in Heavy armor (PHB 2024 p. 121) */
 __R.gfx().forEach((e) =>{if(!__R.fxOk(e,ar,ESH,EA))return;let v=0;(e.speed||[]).forEach((r) =>{if(e.lv>=r[0])v=r[1]});if(e.speedAdd!=null)v+=__R.fxv(e.speedAdd,e);if(v){spd+=v;spSrc+=", "+(v>0?"+":"")+v+" "+e.lbl}if(e.speedSet&&spd<e.speedSet){spd=e.speedSet;spSrc+=", set to "+e.speedSet+" "+e.lbl}});/* generic: class fx.speed [[class level, feet]], cond noHeavy or noArmor */
 clsParts().forEach((q) =>{if(q.sub==="Oath of Glory (2014)"&&q.lv>=7){spd+=10;spSrc+=", +10 Aura of Alacrity"}if(q.sub==="Scout"&&q.cls==="Rogue"&&q.lv>=9){spd+=10;spSrc+=", +10 Superior Mobility"}});/* v71 */
 feats.forEach((f) =>{const F=FEATS[f.n];if(F&&F.speed){spd+=F.speed;spSrc+=", +"+F.speed+" "+f.n}});/* M17: FEATS.speed */
 /* M11 (RL8): armor with a Strength score in the armor table cuts Speed by 10 ft when the wearer's Strength is lower (PHB 2024 p. 219) */
 if(ar&&ar.str&&a.sc.STR<ar.str){spd=Math.max(0,spd-10);spSrc+=", \u221210 "+EA+" (needs Str "+ar.str+", yours is "+a.sc.STR+")"}
 __R.gfx().forEach((e) =>{if(!e.mv||!__R.fxOk(e,ar,ESH,EA))return;Object.keys(e.mv).forEach((m) =>{if(e.speedAddIf&&e.speedAddIf[m]!=null)return;/* fx v3a: handled in the late pass */const v=e.mv[m],t=v==="speed"?"equal to your Speed ("+spd+" ft)":(v+" ft");spSrc+=", "+m.charAt(0).toUpperCase()+m.slice(1)+" Speed "+t+" ("+e.lbl+")";(C.moves=C.moves||[]).push({m:m,v:v==="speed"?spd:+v,s:e.lbl})})});/* fx engine v2: mv {climb,swim,fly}: "speed" or feet. Sheet shows it in speedSrc, C.moves is optional */
 C.speed=spd;C.speedSrc=spSrc;if(R14())C.rs="2014";/* v82 */
 const dk=custom?+B.cSpecies.dark:Math.max(sp.dark||0,SFX2.dark||0);/* RL36 d, M17: Drow Darkvision 120 and Wood Elf Speed 35 come from SPECIES.Elf.linFx (spOptFx) */
 /* m4 (RL20): name the source that gives Darkvision: species or pack, plus the pack option or lineage when that raised it */
 let dkOpt="";if(!custom&&(SFX2.dark||0)>(sp.dark||0)){(B.ch.spopt||[]).forEach((n) =>{const o=sp.opts&&sp.opts.list.filter((x) =>{return x[0]===n})[0];if(o&&o[2].dark&&!dkOpt)dkOpt=n});if(!dkOpt&&sp.linFx&&B.ch.lin)dkOpt=B.ch.lin.split(" (")[0]}
 C.darkvision=dk;C.darkSrc=dk?spName+(dkOpt?", "+dkOpt:"")+" ("+(custom?"homebrew":(sp.hb||SRC))+")":"";
 if(subAt("Barbarian","Path of the Wild Heart")>=6&&chOf("Barbarian","p6opt")==="Owl"){C.darkvision=dk?dk+60:60;C.darkSrc=(C.darkSrc?C.darkSrc+", +60 ":"")+"Aspect of the Wilds (Owl)"}/* v32 RL49 no. 31 */
 __R.gfx().forEach((e) =>{if(e.darkAdd){C.darkvision=(C.darkvision||0)+e.darkAdd;C.darkSrc=(C.darkSrc?C.darkSrc+", +"+e.darkAdd+" ":"")+e.lbl}if(e.darkTo&&(C.darkvision||0)<e.darkTo){C.darkvision=e.darkTo;C.darkSrc=e.lbl}});/* fx batch E: darkAdd = more feet of Darkvision on top of what you have, darkTo = Darkvision to that range if you have less */
 /* HP and init */
 C.hpBonus=__R.hpBonusList();/* M4 (RL10): same list as hpCalc() */
 clsParts().forEach((q) =>{if((q.sub==="Gloom Stalker"||q.sub==="Gloom Stalker (2014)")&&q.lv>=3&&!C.initBonus.some((x) =>{return /^Dread Ambusher/.test(x.s)}))C.initBonus.push({s:"Dread Ambusher: Wisdom modifier (PHB-2024, Gloom Stalker 3)",v:mod(a.sc.WIS)})});/* v35 p06 */clsParts().forEach((q) =>{if(q.sub==="Swashbuckler"&&q.cls==="Rogue"&&q.lv>=3&&!C.initBonus.some((x) =>{return /^Rakish Audacity/.test(x.s)}))C.initBonus.push({s:"Rakish Audacity (Swashbuckler 3): Charisma modifier",v:mod(a.sc.CHA)})});/* v71 */clsParts().forEach((q) =>{if(q.sub==="War Magic"&&q.cls==="Wizard"&&q.lv>=3&&!C.initBonus.some((x) =>{return /^Tactical Wit/.test(x.s)}))C.initBonus.push({s:"Tactical Wit (War Magic): Intelligence modifier",v:mod(a.sc.INT)})})
__R.gfx().forEach((e) =>{if(e.init==null)return;const iv=__R.fxv(e.init,e);if(iv)C.initBonus.push({s:e.lbl,v:iv})});/* generic: class fx.init = number or ability key */
/* v73 */clsParts().forEach((q) =>{if(q.sub==="Chronurgy Magic"&&q.cls==="Wizard"&&q.lv>=3&&!C.initBonus.some((x) =>{return /^Temporal Awareness/.test(x.s)}))C.initBonus.push({s:"Temporal Awareness (Chronurgy Magic): Intelligence modifier",v:mod(a.sc.INT)})});/* v71 */clsParts().forEach((q) =>{if(q.sub==="Oath of the Watchers"&&q.lv>=7&&!C.initBonus.some((x) =>{return /^Aura of the Sentinel/.test(x.s)}))C.initBonus.push({s:"Aura of the Sentinel (Oath of the Watchers 7): Proficiency Bonus",v:pb})});/* v71 */feats.forEach((f) =>{const F=FEATS[f.n];if(F&&F.init==="pb")C.initBonus.push({s:f.n+" feat ("+f.s+")",v:pb});else if(F&&typeof F.init==="number")C.initBonus.push({s:f.n+" feat ("+f.s+")",v:F.init});if(F&&F.pas){C.pasBon=C.pasBon||[];Object.keys(F.pas).forEach((k) =>{C.pasBon.push({k:k,v:F.pas[k],s:f.n+" feat ("+f.s+")"})})}/* v69 */if(F&&F.grappler)C.grappler=true});/* M17: FEATS.init, FEATS.grappler */
 (function(){const sx=spX();if(sx&&(sx.traits||[]).some((t) =>{return t[0]==="Hare-Trigger"})&&!C.initBonus.some((x) =>{return /^Hare-Trigger/.test(x.s)}))C.initBonus.push({s:"Hare-Trigger (Harengon): Proficiency Bonus",v:pb})})();/* v56: Harengon adds PB to Initiative */
 /* proficiencies */
 /* v32 RL49: a tool "of your choice" in the data (toolPick) is replaced by the tools chosen in the builder (none chosen: nothing) */
 const CHT=choices(),tp=function(txt,pick,key){if(!pick)return txt;const v=B.ch[key];return Array.isArray(v)?v.join(", "):""},XT=toolChoices(CHT).concat(grantTools(feats));
 let armor=c.armor,weapons=c.weapons,tools=[tp(c.tools,c.toolPick,"clsTool"),bg?bgTl(bg,tp):""].filter((x) =>{return x&&x!=="None"});/* v95: a background with no tool says "None", which is no tool */
 if(SG&&SG.armor)SG.armor.forEach((q) =>{if(L>=q[0])armor+=", "+q[1]});if(SG&&SG.weapons)SG.weapons.forEach((q) =>{if(L>=q[0])weapons+=", "+q[1]});if(SG&&SG.tools)SG.tools.forEach((q) =>{if(L>=q[0])tools.push(q[1])});(B.ch.spwep||[]).forEach((n) =>{weapons+=", "+n+" (Masterful)"});if(pactW)weapons+=", "+__R.baseOf(pactW).b+" (Pact Weapon)";/* M13 */
 if(optAny("Protector")){armor+=", Heavy";weapons+=", Martial"}/* v32: multiclass Cleric too */
 if(optAny("Warden")){armor+=", Medium";weapons+=", Martial"}
 if(B.sub==="College of Valor"&&L>=3){armor+=", Medium, Shields";weapons+=", Martial"}
 feats.forEach((f) =>{const F=FEATS[f.n];if(F&&F.armor)armor+=", "+F.armor;if(F&&F.weapons)weapons+=", "+F.weapons;if(/^Tavern Brawler/.test(f.n))weapons+=", Improvised";if(F&&F.wpPick){const wv=B.ch[F.wpPick+"-"+(f.key||f.s)];if(Array.isArray(wv))wv.forEach((n) =>{weapons+=", "+n})}});/* v69 */
 __R.MCL().forEach((m,mi) =>{const g=MC_GRANT[m.cls];if(g.armor)armor+=(armor?", ":"")+g.armor;if(g.weapons)weapons+=", "+g.weapons;const gt=tp(g.tools,g.toolPick,"m"+mi+":tool");if(gt)tools.push(gt)});
 if(sp&&sp.wpPick&&!custom)(B.ch.spwp||[]).forEach((n) =>{weapons+=", "+n});
 if(sp&&sp.profs&&!custom){if(sp.profs.armor)armor+=", "+sp.profs.armor;if(sp.profs.weapons)weapons+=", "+sp.profs.weapons;if(sp.profs.tools)tools.push(sp.profs.tools)}/* v74: species proficiencies (2014 species) */
 XT.forEach((q) =>{tools.push(q[0])});
 armor=armor.split(/,\s*/).filter((x,i,a) =>{return x&&a.indexOf(x)===i}).join(", ");weapons=weapons.split(/,\s*/).filter((x,i,a) =>{return x&&a.indexOf(x)===i}).join(", ");
 tools=tools.join(", ").split(/,\s*/).filter((x,i,a) =>{return x&&a.indexOf(x)===i});/* v32: each tool once */
 C.profs={armor:armor||"None",weapons:weapons,tools:tools.join(", ")||"None"};
 /* v23 RU36 no. 7: each proficiency with where it comes from */
 const PS={armor:[],weapons:[],tools:[]},ad=function(k,str,s){String(str||"").split(/,\s*/).forEach((n) =>{n=n.replace(/ \((Masterful|Pact Weapon)\)$/,"");if(!n||n==="None"||PS[k].some((x) =>{return x[0]===n}))return;PS[k].push([n,s])})};
 ad("armor",c.armor,B.cls);ad("weapons",c.weapons,B.cls);ad("tools",tp(c.tools,c.toolPick,"clsTool"),B.cls);if(bg)ad("tools",bgTl(bg,tp),B.bg);
 if(SG&&SG.armor)SG.armor.forEach((q) =>{if(L>=q[0])ad("armor",q[1],B.sub)});if(SG&&SG.weapons)SG.weapons.forEach((q) =>{if(L>=q[0])ad("weapons",q[1],B.sub)});if(SG&&SG.tools)SG.tools.forEach((q) =>{if(L>=q[0])ad("tools",q[1],B.sub)});
 ["Protector","Warden"].forEach((o) =>{if(optAny(o)){ad("armor",o==="Protector"?"Heavy":"Medium",o);ad("weapons","Martial",o)}});
 if(B.sub==="College of Valor"&&L>=3){ad("armor","Medium, Shields",B.sub);ad("weapons","Martial",B.sub)}
 feats.forEach((f) =>{const F=FEATS[f.n];if(F&&F.armor)ad("armor",F.armor,f.n);if(F&&F.weapons)ad("weapons",F.weapons,f.n);if(/^Tavern Brawler/.test(f.n))ad("weapons","Improvised",f.n);if(F&&F.wpPick){const wv=B.ch[F.wpPick+"-"+(f.key||f.s)];if(Array.isArray(wv))wv.forEach((n) =>{ad("weapons",n,f.n)})}});/* v69 */
 if(sp&&sp.wpPick&&!custom)(B.ch.spwp||[]).forEach((n) =>{ad("weapons",n,B.species+" ("+(sp.hb||SRC)+")")});
 if(sp&&sp.profs&&!custom){var spl=B.species+" ("+(sp.hb||SRC)+")";if(sp.profs.armor)ad("armor",sp.profs.armor,spl);if(sp.profs.weapons)ad("weapons",sp.profs.weapons,spl);if(sp.profs.tools)ad("tools",sp.profs.tools,spl)}/* v74 */
 __R.MCL().forEach((m,mi) =>{const g=MC_GRANT[m.cls];ad("armor",g.armor,m.cls+" (multiclass)");ad("weapons",g.weapons,m.cls+" (multiclass)");ad("tools",tp(g.tools,g.toolPick,"m"+mi+":tool"),m.cls+" (multiclass)")});
 XT.forEach((q) =>{ad("tools",q[0],q[1])});__R.gfx().forEach((e) =>{["armor","weapons","tools"].forEach((k) =>{(e[k]||[]).forEach((n) =>{ad(k,n,e.lbl)})})});/* fx engine v2 */
 (B.ch.spwep||[]).forEach((n) =>{ad("weapons",n,"Masterful")});if(pactW)ad("weapons",__R.baseOf(pactW).b,"Pact of the Blade");
  __R.gxPicks().forEach((o) =>{if(!o.gxw)return;(B.ch[o.key]||[]).forEach((n) =>{ad("weapons",n,o.src);if(("," +C.profs.weapons+",").replace(/, /g,",").indexOf(","+n+",")<0)C.profs.weapons+=(C.profs.weapons?", ":"")+n})});/* fx engine v2: weapon proficiency picks */
 C.profSrc=PS;
 /* attacks */
 const wmSet=wmAll();C.attacks=[];/* v32 RL49: multiclass and Weapon Master too */
 let ud="1",udSrc="Unarmed Strike ("+SRC+")";
 if(maOn){ud=maDie;udSrc="Martial Arts ("+SRC+", Monk)"}
 feats.forEach((f) =>{if(f.n==="Unarmed Fighting"){/* m2 (RL18): d8 when no weapon and no Shield is active, else d6. The larger of this and Martial Arts is used */const uf=(EW.length||ESH)?"1d6":"1d8";if(dieAvg(uf)>dieAvg(ud)){ud=uf;udSrc="Unarmed Fighting ("+f.s+")"+(uf==="1d8"?": d8, no weapon or Shield held":": d6 while holding a weapon or Shield")}}else if(f.n==="Tavern Brawler"&&ud==="1"){ud="1d4";udSrc="Tavern Brawler ("+f.s+")"}});
 const SG2=__R.subGrant(B.sub);if(SG2&&SG2.unarmed){SG2.unarmed.forEach((q) =>{if(L>=q[0]){ud=ESH?q[2]:q[1];udSrc=B.sub+" "+q[0]+(ESH?" (holding a Shield)":"")}})}
 /* RL35 3a: Unarmed Fighting d8 on a Monk keeps Dexterous Attacks (Dex). RL35 4b (RL34): Grapple and Shove DC may use Dex too, written as C.dcAb */
 if(maOn&&a.sc.DEX>a.sc.STR){C.dcAb="DEX";C.dcSrc="Martial Arts: Dexterous Attacks ("+SRC+", Monk)"}
 const maOff=umOn&&!maOn?EW.filter((n) =>{const w=WEAPONS[__R.baseOf(n).b];return w&&!monkW(w,__R.baseOf(n).b)}):[];/* RL35 1b: say why Martial Arts is off */
 C.attacks.push({n:"Unarmed Strike",sub:"",ab:maOn&&a.sc.DEX>a.sc.STR?"DEX":"STR",prof:true,die:ud,dieSrc:udSrc,type:"Bludgeoning",range:"5 ft",m:"",note:(maOff.length?"Martial Arts is off while "+maOff.join(" and ")+(maOff.length>1?" are":" is")+" active (not a Monk weapon). Unequip "+(maOff.length>1?"them":"it")+" to use Martial Arts. ":"")+"Damage, Grapple, or Shove."});
 /* C3: Fighting Style bonuses come from FEATS fields (Archery rngHit, Dueling meleeDmg1h, Thrown Weapon Fighting thrownDmg), PHB 2024 p. 209-210.
    They are written as named sources in misc/miscSrc/dmgBonus; the sheet adds them up. Dueling auto rule: exactly one active weapon, melee, not Two-Handed
    (a Shield is allowed). B.duelMode "on" applies Dueling to every one-handed melee weapon, "off" never; missing or "auto" = the rule (toggle for UI/UX later). */
 const FSB={},FSS={},FSseen={};feats.forEach((f) =>{const F=FEATS[f.n];if(!F||FSseen[f.n])return;FSseen[f.n]=1;["rngHit","meleeDmg1h","thrownDmg"].forEach((k) =>{if(F[k]){FSB[k]=(FSB[k]||0)+F[k];FSS[k]=(FSS[k]?FSS[k]+"; ":"")+"Fighting Style: "+f.n+" ("+f.s+")"}})});
 const duelW=WEAPONS[__R.baseOf(EW[0]||"").b],duelAuto=EW.length===1&&!!duelW&&duelW.k==="M"&&!/Two-Handed/.test(duelW.p);
 const duelOn=!!FSB.meleeDmg1h&&(B.duelMode==="on"||(B.duelMode!=="off"&&duelAuto));
 const hasGWF=feats.some((f) =>{return f.n==="Great Weapon Fighting"}),hasTWF=feats.some((f) =>{return f.n==="Two-Weapon Fighting"});
 EW.forEach((n) =>{const BO=__R.baseOf(n),w=WEAPONS[BO.b];if(!w)return;let ab="STR";
  if(w.k==="R")ab="DEX";else if(/Finesse/.test(w.p)||(maOn&&(w.cat==="S"||/Light/.test(w.p))))ab=a.sc.DEX>a.sc.STR?"DEX":"STR";
  const isPact=!!pactW&&n===pactW;if(isPact&&a.sc.CHA>=a.sc[ab])ab="CHA";/* M13: only the bonded weapon, Charisma when it is at least as high */
  const pr=isPact||weapons.indexOf(BO.b+" (Masterful)")>=0||__R.wpNamed(weapons,BO.b)||/Simple/.test(weapons)&&w.cat==="S"||/Martial(?! with)/.test(weapons)&&w.cat==="M"||(/Finesse or Light/.test(weapons)&&w.cat==="M"&&/Finesse|Light/.test(w.p))||(/Light property/.test(weapons)&&/Light/.test(w.p));
  const m=wmSet.indexOf(BO.b)>=0?w.m:"";
  let flow=!!(SG2&&L>=3&&(SG2.flowing||[]).indexOf(BO.b)>=0),die=flow?ud:w.d,dieSrc=flow?B.sub+", Flowing Blades (base "+w.d+")":BO.b+" ("+SRC+")";
  /* M7 (RL7): Monk weapon (Simple Melee, Martial Melee with Light) uses the Martial Arts die when it is larger (owner decision) */
  if(maOn&&!flow&&w.k==="M"&&(w.cat==="S"||/Light/.test(w.p))&&dieAvg(maDie)>dieAvg(die)){dieSrc="Martial Arts die ("+SRC+", Monk "+monkLv+"), base "+BO.b+" "+die;die=maDie}
  let hit=BO.p,dmg=BO.mw?0:BO.p,srcs=BO.p?[n+(BO.mw?" (Masterwork, attack rolls only)":" (magic weapon)")]:[],note=(BO.p&&!BO.mw?"Add +"+BO.p+" to damage rolls. ":"")+(m?MASTERY[m]:""),thrown=/Thrown/.test(w.p),oneH=w.k==="M"&&!/Two-Handed/.test(w.p);
  {const XD=typeof DMAP!=="undefined"&&DMAP[n]&&DMAP[n][5]&&DMAP[n][5].xd;if(XD&&XD.length)note+=(note?" ":"")+"Extra damage: "+XD.join("; ")+"."}/* tp: riders of named weapons */
  if(w.k==="R"&&FSB.rngHit){hit+=FSB.rngHit;srcs.push(FSS.rngHit+": +"+FSB.rngHit+" to hit with Ranged weapons")}
  if(w.k==="R"&&thrown&&FSB.thrownDmg){dmg+=FSB.thrownDmg;srcs.push(FSS.thrownDmg+": +"+FSB.thrownDmg+" damage, Thrown weapon")}
  if(oneH&&duelOn){dmg+=FSB.meleeDmg1h;srcs.push(FSS.meleeDmg1h+": +"+FSB.meleeDmg1h+" damage, one melee weapon and no other weapon");note="Dueling: +"+FSB.meleeDmg1h+" damage while this is your only weapon (a Shield is fine). "+note}
  else if(oneH&&FSB.meleeDmg1h&&B.duelMode!=="off")note="Dueling not applied: another weapon is active. To apply it anyway, set Dueling bonus to Always on under your Dueling choice in the builder. "+note;/* RL30 */
  if(hasGWF&&w.k==="M"&&/Two-Handed|Versatile/.test(w.p))note+=(note?" ":"")+"Great Weapon Fighting: with two hands, treat a 1 or 2 on a damage die as a 3.";
  if(hasTWF&&/Light/.test(w.p))note+=(note?" ":"")+"Two-Weapon Fighting: add your ability modifier to the damage of the extra Light weapon attack.";
  if(isPact)note="Pact of the Blade: "+(ab==="CHA"?"uses Charisma":"you can use Charisma")+"; can deal Necrotic, Psychic, or Radiant damage. "+note;
  C.attacks.push({n:n,sub:isPact?(w.p?w.p+" \u2022 ":"")+"Pact Weapon":w.p,ab:ab,prof:!!pr,die:die,dieSrc:dieSrc,misc:hit,miscSrc:srcs.join("; "),dmgBonus:dmg,type:w.t,range:w.r?(w.k==="M"?"5 ft, "+w.r+" ft":w.r+" ft"):(/Reach \(20/.test(w.p)?"20 ft":/Reach/.test(w.p)?"10 ft":"5 ft"),m:m,note:note});
  /* Thrown Weapon Fighting: a melee weapon with Thrown gets a second row for the throw. Same ability (PHB 2024, Thrown property). The melee row keeps no thrown bonus */
  if(w.k==="M"&&thrown&&FSB.thrownDmg){const ts=BO.p?[n+(BO.mw?" (Masterwork)":" (magic weapon)")]:[];ts.push(FSS.thrownDmg+": +"+FSB.thrownDmg+" damage, Thrown weapon");
   C.attacks.push({n:n+" (thrown)",sub:w.p+" \u2022 ranged attack",ab:ab,prof:!!pr,die:die,dieSrc:dieSrc,misc:BO.p,miscSrc:ts.join("; "),dmgBonus:(BO.mw?0:BO.p)+FSB.thrownDmg,type:w.t,range:w.r+" ft",m:m,note:"Thrown Weapon Fighting: +"+FSB.thrownDmg+" damage when you throw it. "+(BO.p&&!BO.mw?"Add +"+BO.p+" to damage rolls. ":"")+(m?MASTERY[m]:"")})}
 });
 /* inventory */
 __set_ATKC(C.attacks);/* RL31 */
 try{ if(C.profs)__R.PROFC=C.profs; C.inv=__R.ensureInv().map((x) =>{const it={n:kitTool(x)||x.n,key:x.n,q:__R.qOf(x),w:__R.itemW(kitTool(x)||x.n)/* v32 p21 */,eq:!!x.eq},west=__R.itemWEst(x.n)?(it.west=1):0/* v27 RD20 */,bn=__R.baseOf(x.n).b,rr=__R.rarityOf(x),dm=DMAP[x.n];if(dm&&dm[3]){it.att=1}if(x.mw)it.mw=true;/* Masterwork flag of the row (cond mwArmor) */if(rr)it.rar=rr;if(__R.equippable(x.n))it.gear="equip";if(x.in)it.in=x.in;/* RU35 no. 8 */if(ARMOR[bn]){const A=ARMOR[bn];it.d="AC "+A.ac+(A.dex==="max2"?" + Dex (max 2)":A.dex==="full"?" + Dex":"")+(A.str?". Requires Str "+A.str:"")+(A.dis?". Disadvantage on Stealth.":".")}else if(bn==="Shield")it.d="+"+(2+__R.baseOf(x.n).p)+" AC.";else if(x.desc)it.d=x.desc;else if(x.src&&!WEAPONS[bn])it.d="From "+x.src;if(rr)it.d=rr+" magic item. "+(it.d||"");try{it.type=__R.itemType(x.n,x);it.cost=PRICE[x.n]!=null?PRICE[x.n]:__R.itemCost(__R.baseOf(kitTool(x)||x.n).b);/* v20 M1 */if(!window.__inTS){window.__inTS=1;try{it.html=__R.itemDetail(x.n,x)}finally{window.__inTS=0}}it.equippable=__R.equippable(x.n)||!!(DMAP[x.n]&&DMAP[x.n][1]!=="Potion")}catch(e){}return it});
 }finally{ __set_ATKC(null); }/* RL36 b */
 C.gp=__R.gpNow();
 /* m4 (RL20): "none" = no starting package (items set by hand or imported from the sheet), not option A or 50 GP */
 C.equipNote=(B.eqC==="none"?B.cls+" starting equipment: none (items added by hand)":B.cls+" option "+"ABC"[__R.eqIdx()]+": "+__R.clsKitText())+". "+(B.eqB==="none"?B.bg+" starting equipment: none (items added by hand)":B.bg+" option "+B.eqB+": "+(B.eqB==="A"&&bg?bg.eq:"50 GP"))+".";
 /* resources */
 C.res=[];const rs=(c.res||[]).concat((c.resSub&&c.resSub[B.sub])||[]);
 rs.forEach((r) =>{const m=resMax(r,a);if(m>0){const o={k:resKey("r-",r.n,C.res),n:r.n,tag:r.tag,max:m,reset:(r.short5&&L>=5)?"short":r.reset};if(r.pool)o.pool=1;/* m6: a pool of points (Lay on Hands) */C.res.push(o)}});
 feats.forEach((f) =>{const F=FEATS[f.n];if(F&&(F.res==="luck"||F.luckN))C.res.push({k:"luck",n:"Luck Points",tag:f.n,max:F.luckN||pb,reset:"long",f:f.n})});
 luRows(C,a,pb,feats);/* RU40 *//* M17: FEATS.res */
 /* N4 (RL39): Hit Dice per die type (PHB 2024 p. 44). One class: as before. Multiclass: one row per die, main class die keeps key "hd" */
 if(!__R.MCL().length)C.res.push({k:"hd",n:"Hit Dice",tag:"",max:0,reset:"long",auto:"level"});
 else{const hdc={},hdo=[];clsParts().forEach((q) =>{const d=CLASSES[q.cls].hd;if(hdc[d]==null){hdc[d]=0;hdo.push(d)}hdc[d]+=q.lv});
  hdo.forEach((d,i) =>{C.res.push({k:i?"hd-d"+d:"hd",n:"Hit Dice",tag:"",max:hdc[d],reset:"long",die:d})})}
 __R.MCL().forEach((m,mi) =>{const mc=CLASSES[m.cls];(mc.res||[]).concat((mc.resSub&&mc.resSub[m.sub])||[]).forEach((r) =>{const mx=__R.mcResMax(r,a,m.lv);if(mx>0){const o={k:resKey("m-"+slugK(m.cls)+"-",r.n,C.res),n:r.n,tag:r.tag+" ("+m.cls+")",max:mx,reset:(r.short5&&m.lv>=5)?"short":r.reset};if(r.pool)o.pool=1;C.res.push(o)}})});
 const RESF={"Ki Points":"Ki","Sorcery Points":"Font of Magic","Focus Points":"Monk's Focus","Superiority Dice":"Combat Superiority","Psionic Energy Dice":"Psionic Power"};C.res.forEach((r) =>{if(!r.f&&RESF[r.n])r.f=RESF[r.n]});/* V17-8: also multiclass rows */
 var SA=__R.slotsAll();
 if(SA.pact)C.res.push({k:"pact",n:"Pact Slots (level "+SA.pact.lvl+")",tag:"Short Rest",max:SA.pact.n,reset:"short"});
 if(SA.slots)SA.slots.forEach((n,i) =>{C.res.push({k:"s"+(i+1),n:"Spell Slots, level "+(i+1),tag:"Long Rest",max:n,reset:"long"})});
 keepResKeys(C);
 /* actions */
 C.actions=[{c:"Actions",n:"Attack",t:"Weapon or Unarmed",d:"Make one attack"+(clsParts().some((q) =>{return q.lv>=5&&/Fighter|Barbarian|Monk|Paladin|Ranger/.test(q.cls)})?" per Extra Attack":"")+". With an [[Unarmed Strike]], choose Damage, [[Grapple]] (DC {dc}), or [[Shove]] (DC {dc})."},
  {c:"Actions",n:"Dash, Disengage, Dodge, Help, Hide, Influence, Magic, Ready, Search, Study, Utilize",t:"Standard",d:"Available to every creature."},
  {c:"Reactions",n:"Opportunity Attack",t:"Reaction",d:"When a creature you can see leaves your reach, make one melee attack against it."}];
 clsParts().forEach((q) =>{featsOf(q.cls,q.lv).forEach((x) =>{if(/^Bonus Action/.test(x[2]))C.actions.push({c:"Bonus Actions",n:x[1],t:q.cls+" "+x[0],d:x[2]});else if(/^Reaction/.test(x[2]))C.actions.push({c:"Reactions",n:x[1],t:q.cls+" "+x[0],d:x[2]})})});/* M10: multiclass too */
 (B.inv||[]).forEach((x) =>{const m=/^(Arrow|Bolt|Firearm Bullet|Needle|Sling Bullet), \+(\d)$/.exec(x.n);if(!m||!x.eq||!DMAP[x.n])return;const use={Arrow:/bow$/i,Bolt:/Crossbow/,"Firearm Bullet":/Musket|Pistol/,Needle:/Blowgun/,"Sling Bullet":/^Sling/}[m[1]];
  C.attacks.forEach((t) =>{const bn=__R.baseOf(t.n).b;if(WEAPONS[bn]&&WEAPONS[bn].k==="R"&&use.test(bn))t.note="With "+x.n+": +"+m[2]+" to attack and damage rolls. "+(t.note||"")})});/* v16: magic ammunition */
 activeFx().forEach((q) =>{if(/^(Wraps of Unarmed Power|Wraps of Dyamak)/.test(q.n)&&(q.fx.atk||q.fx.dmg)){const u=C.attacks.filter((t) =>{return t.n==="Unarmed Strike"})[0];if(u){u.misc=(u.misc||0)+(q.fx.atk||0);u.miscSrc=(u.miscSrc?u.miscSrc+", ":"")+q.n;u.dmgBonus=(u.dmgBonus||0)+(q.fx.dmg||0)}}});/* M18 */
 const sno=saveNotes(feats);if(sno.length)C.saveNotes=sno;const xd=xdmgRows(a,pb);if(xd.length)C.xdmg=xd;/* RU35 no. 5, 6 */
 /* features */
 C.features=[];
 const spItems=custom?[{n:"Homebrew species",s:"Homebrew",d:"Fill in the traits from your setting."}]:sp.traits.map((t) =>{return {n:t[0],s:(sp.hb||SRC)+", "+B.species,d:spTraitText(sp,t)}});
 if(!custom&&/or/.test(sp.size))spItems.push({n:"Size",s:(sp.hb||SRC)+", "+B.species,d:"You can be Medium or Small, chosen when you create the character. **Your choice.** "+(B.size||"Medium")+(htText(B.species,B.size||"Medium")?", "+htText(B.species,B.size||"Medium"):"")+"."});/* RU34 */
 if(B.ch.lin&&!(sp&&sp.lin&&(spLinTrait(sp)||sp.traits.some((t) =>{return /ancestr|lineage|legacy/i.test(t[1])}))))spItems.push({n:"Chosen: "+B.ch.lin,s:(sp&&sp.hb||SRC)+", "+B.species,d:(sp&&sp.hb&&sp.linText&&sp.linText[B.ch.lin])||"Your lineage or ancestry choice."});/* v36 p21 */
 spItems.forEach((it) =>{it.d+=__R.calcNote(it.n,B.cls,TLv,a)});C.features.push({g:"Species: "+spName,items:spItems});
 C.defenses=__R.defenses(a);
 /* RU35 no. 7: Resistances and Immunities from magic items in use, and extra speeds */
 C.itemAdv=[];activeFx().forEach((q) =>{(q.fx.adv||[]).forEach((k) =>{if(!/sav(e|ing)|Concentration/i.test(k))C.itemAdv.push({k:k,s:q.n});else{C.saveNotes=C.saveNotes||[];C.saveNotes.push({t:"Advantage on "+(/^advantage/i.test(k)?k.replace(/^advantage\s*(on\s*)?/i,""):k),s:q.n})}})});/* v65: Advantage from items on Initiative and skills, read by cfx */
 activeFx().forEach((q) =>{const f=q.fx;if(f.dark){const dv=+f.dark||0;/* v101: item darkvision. Robe of Eyes sets 120. Goggles of Night and the Axe of the Dwarvish Lords give the range, or add it to Darkvision you already have */if(/^Robe of Eyes/.test(q.n))C.darkvision=Math.max(C.darkvision||0,dv);else C.darkvision=(C.darkvision||0)+dv;C.darkSrc=(C.darkSrc?C.darkSrc+", ":"")+q.n}(f.res||[]).forEach((t) =>{C.defenses.push({t:"Resistance",v:t,s:q.n})});(f.imm||[]).forEach((t) =>{C.defenses.push({t:"Immunity",v:t,s:q.n})});(f.condImm||[]).forEach((t) =>{C.defenses.push({t:"Immunity",v:t+" (condition)",s:q.n})});(f.vul||[]).forEach((t) =>{C.defenses.push({t:"Vulnerability",v:t,s:q.n})});/* v76 */
  ["fly","swim","climb","burrow"].forEach((k) =>{if(f[k]){C.speeds=C.speeds||{};const v=f[k]==="walk"?"walk":+f[k];C.speeds[k]={v:v,s:q.n}}})});
 (function(){const sp=function(k,s){C.speeds=C.speeds||{};if(!C.speeds[k])C.speeds[k]={v:"walk",s:s}};/* V17-4: speeds from class features */
  if(clsLv("Ranger")>=6&&!R14()){sp("climb","Roving (Ranger 6)");sp("swim","Roving (Ranger 6)")}
  if(subAt("Rogue","Thief")>=3)sp("climb","Second-Story Work (Thief 3)");
  if(invList().indexOf("Gift of the Depths")>=0)sp("swim","Gift of the Depths");
  if(subAt("Druid","Circle of the Sea")>=6)sp("swim","Aquatic Affinity (Circle of the Sea 6)");
  if(subAt("Druid","Circle of the Sea")>=10)sp("fly","Stormborn, while Wrath of the Sea is active");
  if(subAt("Barbarian","Path of the Wild Heart")>=6){const aw=chOf("Barbarian","p6opt");if(aw==="Panther")sp("climb","Aspect of the Wilds (Panther)");else if(aw==="Salmon")sp("swim","Aspect of the Wilds (Salmon)");else if(!aw){sp("climb","Aspect of the Wilds, if you chose Panther");sp("swim","Aspect of the Wilds, if you chose Salmon")}}/* v32 RL49 no. 31 */
  if(spX()&&B.species==="Aasimar"&&__R.TL()>=3)sp("fly","Celestial Revelation, Heavenly Wings, while transformed")})();
 const cf=classFeatures().filter((x) =>{return !(R14()&&x[1]==="Weapon Mastery")}).map((x) =>{let d=x[2];
  const fsv=B.ch["fs"+c.fs],FSF=fsv?FEATS[fsv]:null;if(x[1]==="Fighting Style"&&fsv)d="You chose **"+fsv+"**. "+(FSF?FSF.d:"This Fighting Style is not in your active sources. Pick it again in the builder.");const fx=(x[1]==="Fighting Style"&&FSF)?FSF.full:"";
  if(x[1]==="Weapon Mastery"&&wmSet.length)d="Masteries: "+wmSet.map((n) =>{return n+" ("+WEAPONS[n].m+")"}).join(", ")+". Swap one on a Long Rest.";
  if(x[1]==="Divine Order"&&B.ch.p1opt||x[1]==="Primal Order"&&B.ch.p1opt)d="You chose **"+B.ch.p1opt+"**. "+d;
  if(x[1]==="Blessed Strikes"&&B.ch.p7opt||x[1]==="Elemental Fury"&&B.ch.p7opt)d="You chose **"+B.ch.p7opt+"**. "+d;
  if(x[1]==="Eldritch Invocations"){let iv=[];Object.keys(B.ch).forEach((k) =>{if(/invocation$/.test(k))iv=iv.concat(B.ch[k]||[])});if(iv.length)d="Known: "+iv.join(", ")+". "+d}
  if(x[1]==="Metamagic"){let mm=[];Object.keys(B.ch).forEach((k) =>{if(/metamagic$/.test(k))mm=mm.concat(B.ch[k]||[])});if(mm.length)d="Known: "+mm.join(", ")+". "+d}
  d+=ycOf(CHT,x[1],undefined);/* v32 */d+=__R.calcNote(x[1],B.cls,L,a);return {n:x[1],s:(x[3]&&x[3].hb?x[3].hb:SRC)+", "+B.cls+" "+x[0],d:d,full:fx||(CF_FULL[B.cls+"|"+x[1]]?CF_FULL[B.cls+"|"+x[1]]+ycOf(CHT,x[1],undefined)+__R.calcNote(x[1],B.cls,L,a):"")}}).filter((x) =>{return !/Subclass$|Ability Score|Epic Boon/.test(x.n)});
 const tr=c.track;if(tr)Object.keys(tr).forEach((k) =>{if(tr[k][L-1])cf.push({n:k,s:SRC+", "+B.cls+" table",d:"At level "+L+": "+tr[k][L-1]+"."})});
 const sl=slotsFor();if(sl&&!__R.MCL().length)cf.push({n:"Spell Slots",s:SRC+", "+B.cls,d:sl.pact?sl.pact+" Pact slots at level "+sl.lvl+".":sl.map((n,i) =>{return "L"+(i+1)+": "+n}).join(", ")});
 C.features.push({g:B.cls,items:cf});
 if(B.sub&&B.sub!=="__custom"){const sf=c.subs[B.sub].filter((x) =>{return x[0]<=L}).map((x) =>{return {n:x[1],s:SRC+", "+B.sub+" "+x[0],d:x[2]+ycOf(CHT,x[1],undefined)+__R.calcNote(x[1],B.cls,L,a),full:SUB_FULL[B.sub+"|"+x[1]]?SUB_FULL[B.sub+"|"+x[1]]+ycOf(CHT,x[1],undefined)+__R.calcNote(x[1],B.cls,L,a):""}});
  let man=[];Object.keys(B.ch).forEach((k) =>{if(/maneuver$/.test(k))man=man.concat(B.ch[k]||[])});if(man.length)sf.push({n:"Maneuvers known",s:SRC+", Battle Master",d:man.map((n) =>{const m=MANEUVERS.filter((x) =>{return x[0]===n})[0];return "**"+n+".** "+(m?m[1]:"")}).join("\n\n")});
  const nx=c.subs[B.sub].filter((x) =>{return x[0]>L})[0];
  C.features.push({g:B.cls+" Subclass: "+B.sub,items:sf,next:nx?B.cls+" level "+nx[0]+" unlocks "+nx[1]+".":""})}
 else if(B.sub==="__custom")C.features.push({g:B.cls+" Subclass: "+subName,items:[{n:"Homebrew subclass",s:"Homebrew",d:"Add the subclass features from your setting."}]});
 /* M10: multiclass features get the level note (calcNote with the class level) and the full text, like the main class */
 __R.MCL().forEach((m,mi) =>{const mc=CLASSES[m.cls],seen={},it=[],mk=function(x,s,full){const cn=__R.calcNote(x[1],m.cls,m.lv,a);return {n:x[1],s:(x[3]&&x[3].hb?x[3].hb:SRC)+", "+s+" "+x[0],d:x[2]+ycOf(CHT,x[1],mi)+cn,full:full?full+ycOf(CHT,x[1],mi)+cn:""}};mc.f.forEach((x) =>{if(x[0]<=m.lv&&!/Subclass$|Ability Score|Epic Boon/.test(x[1])){const o=mk(x,m.cls,CF_FULL[m.cls+"|"+x[1]]);if(seen[x[1]]!=null&&x[1]!=="Expertise"){it[seen[x[1]]]=o;return}seen[x[1]]=it.length;it.push(o)}});
  if(m.sub&&mc.subs[m.sub])mc.subs[m.sub].forEach((x) =>{if(x[0]<=m.lv)it.push(mk(x,m.sub,SUB_FULL[m.sub+"|"+x[1]]))});
  C.features.push({g:m.cls+" (multiclass "+m.lv+")"+(m.sub?": "+m.sub:""),items:it})});
 if(__R.MCL().length){C.clsLabel=[B.cls+" "+L].concat(__R.MCL().map((m) =>{return m.cls+" "+m.lv})).join(" / ");C.cls=B.cls}
 C.features.push({g:"Feats",items:feats.map((f) =>{const F=FEATS[f.n]||{};let ex="";if(f.asi){const v=f.asi;if(F.asi2)ex=v.a1===v.a2?" "+v.a1+" +2.":" "+v.a1+" +1, "+v.a2+" +1.";else if(v.a1)ex=" "+v.a1+" +1.";if(F.dt&&v.dt)ex+=" Damage type: "+v.dt+"."}const fk2=f.key||f.s;CHT0.forEach((q) =>{const pv=B.ch[q.key];if(q.fk===fk2&&Array.isArray(pv)&&pv.length)ex+=" "+q.title.replace(/^.*?: /,"").replace(/^./,(ch) =>{return ch.toUpperCase()})+": "+pv.join(", ")+"."});/* v32 RL49 */return {n:f.n,s:f.s.indexOf(SRC)===0?f.s:SRC+", "+f.s/* m4 (RL20): no "PHB-2024, PHB-2024" */,d:(F.d||"")+ex,full:F.full?F.full+(ex?" **Your choice.**"+ex:""):""}})});/* v19: the chosen increase and damage type also under the full text */
 if(bg)C.features.push({g:"Background: "+B.bg,items:[{n:"Ability Scores",s:SRC+", "+B.bg,d:B.bgMode==="111"?bg.ab.join(" +1, ")+" +1.":(B.bg2||"?")+" +2, "+(B.bg1||"?")+" +1."},{n:"Proficiencies",s:SRC+", "+B.bg,d:"Skills: "+bg.sk.concat(Array.isArray(B.ch.bgsk)?B.ch.bgsk:[]).join(" and ")+(bg.skPick&&!(Array.isArray(B.ch.bgsk)&&B.ch.bgsk.length)?" (+"+bg.skPick.n+" of your choice, not chosen yet)":"")+". Tool: "+(bg.toolPick?((B.ch.bgTool||[]).join(", ")||"not chosen yet")+" ("+TOOL_ONE[bg.toolPick.cats[0]]+", your pick)":bg.tool)+"."},{n:"Equipment",s:SRC+", "+B.bg,d:"Option A: "+bg.eq+"."}].concat((bg.bf||[]).map((f) =>{return {n:f[0],s:SRC+", "+B.bg,d:f[1]}}))});
 {const SM={};SPELLS.forEach((x) =>{SM[x[0]]=x});
  let invs=[];Object.keys(B.ch).forEach((k) =>{if(/invocation$/.test(k))invs=invs.concat(B.ch[k]||[])});
  /* M9: every spell has a source key (class, "@species", "@spcan", "@mi:<key>") and that source's ability (spellAb). C.spellcasting keeps the main
     ability (first caster class, else Magic Initiate, else species). C.spellcasting.by and C.spells[].ab are written only when 2+ abilities differ */
  var SA=__R.slotsAll(),CPs=casterParts(),castAb=CPs.length?CPs[0].ab:null,SLs=spLists(),mis=__R.miFeats(),miK=Object.keys(B.pk||{}).filter((k) =>{return /^mi/.test(k)});
  var spl=(typeof __R.autoSpells==="function"?__R.autoSpells():[]),spAbE=spellAb("@species",a.sc);
  const ab=castAb||(miK.length?spellAb("@mi:"+miK[0],a.sc):null)||(spl.some((q) =>{return q.k==="@species"})?spAbE:null)||(spl.some((q) =>{return q.k==="@spcan"})?spellAb("@spcan",a.sc):null)||(spl.some((q) =>{return /^@sub:/.test(q.k)})?spellAb(spl.filter((q) =>{return /^@sub:/.test(q.k)})[0].k,a.sc):null)||"CHA",scm=mod(a.sc[ab]),mainSc=CPs.length?CPs[0].cls:"",sdc=8+pb+scm+spItemB("dc",mainSc),satk=pb+scm+spItemB("atk",mainSc);/* v19 RL42 */
  const list=[],seen={},bysrc=[];function addS(n,use,src,k){const x=SM[n],kk=k||"";if(!x||seen[n+use+"|"+kk])return;seen[n+use+"|"+kk]=1;const sab=k?spellAb(k,a.sc):ab;if(!bysrc.some((b) =>{return b.k===kk}))bysrc.push({k:kk,n:/^@/.test(kk)?src:kk,ab:sab});
   const o={n:n,l:x[1],sch:x[2],ct:x[4],r:x[5],cmp:x[6],dur:x[7],conc:x[8],rit:x[9],sv:x[10],sum:x[11]||"",full:SPELL_FULL[n]||"",cls:spClsJ(x),use:use,src:src,_ab:sab};spFxTo(o,kk,a);if(kk==="Warlock"&&x[1]&&!/Long Rest|At will/.test(use))o.pact=1;/* RU35 no. 2: cast with a Pact Magic slot */list.push(o)}
  CPs.forEach((p) =>{if(!bysrc.some((b) =>{return b.k===p.cls}))bysrc.push({k:p.cls,n:p.cls,ab:p.ab})});
  spl.forEach((q) =>{addS(q.n,"Always prepared",q.src,q.k);if(q.k==="@species"&&q.g>1){const o=list.filter((s) =>{return s.n===q.n})[0];if(o)o.gain=q.g}});/* v21 M1 */
  featSpells().forEach((q) =>{addS(q.n,"1/Long Rest free",q.f,q.k)});/* v21 i3 */
  dmSpells().forEach((q) =>{addS(q.n,q.use,q.f,q.k)});/* v58: Dragonmark feats */
  CHT0.forEach((q) =>{const v=B.ch[q.key];if(/^rc-/.test(q.key)&&Array.isArray(v))v.slice(0,q.n).forEach((n) =>{addS(n,"Always prepared",q.feature,"@ft:"+q.fk)})});/* v32 RL49 no. 16 */
  CPs.forEach((p) =>{(SLs[p.cls]||[]).forEach((n) =>{if(list.some((s) =>{return s.n===n&&s.use==="Always prepared"&&spl.some((q) =>{return q.n===n&&q.k===p.cls})}))return;/* v22: once, as Always prepared */addS(n,SM[n]&&!SM[n][1]?"Cantrip":"Prepared",p.cls,p.cls)})});
  const pk=B.pk||{};Object.keys(pk).forEach((k) =>{const mn=(mis.filter((m) =>{return m.key===k})[0]||{}).cls,ms="Magic Initiate"+(mn?" ("+mn+")":"");if(/^ma/.test(k)&&pk[k])addS(pk[k],"1/Long Rest","Mystic Arcanum","Warlock");if(/^mi/.test(k)){const mi0=list.length;(pk[k].c||[]).forEach((n) =>{addS(n,"Cantrip","Magic Initiate","@mi:"+k)});(pk[k].s||[]).forEach((n) =>{addS(n,"1/Long Rest free","Magic Initiate","@mi:"+k)});list.slice(mi0).forEach((o) =>{o.mi=ms});/* v23 M2: which Magic Initiate feat */bysrc.forEach((b) =>{if(b.k==="@mi:"+k)b.n=ms})}});
  invs.forEach((n) =>{const q=INV_SPELLS[n];if(q)addS(typeof q==="string"?q:q[0],typeof q==="string"?"At will":q[1],n,"Warlock")});
  __R.enabledPacks().forEach((p) =>{Object.keys(p.clsSpells||{}).forEach((c) =>{(p.clsSpells[c]||[]).forEach((q) =>{if(clsLv(c)>=q[0])addS(q[1],q[2],q[3],c)})});
   Object.keys(p.spellPick||{}).forEach((c) =>{const q=p.spellPick[c],v=B.ch[q.key];if(clsLv(c)>=q.l&&Array.isArray(v)&&v[0]&&hbPickOk(q.key,v[0]))addS(v[0],q.use,q.feature,c)})});/* v20 RD24 *//* M17: INV_SPELLS in db4.js */
  if(clsLv("Warlock")>=9&&!R14())addS("Contact Other Plane","1/Long Rest free","Contact Patron","Warlock");
  CHT.forEach((q) =>{const v=B.ch[q.key];if(!Array.isArray(v)||!/^(m\d+:)?p(18sm[12]|20sig)$/.test(q.key))return;v.forEach((n) =>{if(q.list.some((x) =>{return x[0]===n}))addS(n,/sig$/.test(q.key)?"1/Short Rest free":"At will",q.feature,"Wizard")})});/* v32 RL49 no. 36, 37 *//* M10: multiclass Warlock too */
  list.sort((p,q) =>{return p.l-q.l||(p.n<q.n?-1:1)});
  /* m14 (RL17): a caster class (castAb) writes C.spellcasting even with no spell chosen yet; C.spells is then [] */
  if(list.length||castAb){C.spells=list;C.spellcasting={ab:ab,dc:sdc,atk:satk,mod:scm,slots:SA.slots||[],pact:SA.pact||null};
   const abs=[];bysrc.forEach((b) =>{if(abs.indexOf(b.ab)<0)abs.push(b.ab)});
   const isrc=spItemSrc(mainSc);if(isrc.length)C.spellcasting.items=isrc;/* v19 RL42: names of the items in the numbers */
   if(abs.length>1){C.spellcasting.by=bysrc.map((b) =>{const m2=mod(a.sc[b.ab]);return {n:b.n,ab:b.ab,mod:m2,dc:8+pb+m2+spItemB("dc",b.k),atk:pb+m2+spItemB("atk",b.k)}});list.forEach((s) =>{s.ab=s._ab})}
   const bonusN=list.filter((s) =>{return /^Bonus Action/.test(s.ct)}).map((s) =>{return s.n}),reN=list.filter((s) =>{return /^Reaction/.test(s.ct)}).map((s) =>{return s.n});
   if(bonusN.length)C.actions.push({c:"Bonus Actions",n:"Spells",t:"Bonus Action casting time",d:bonusN.join(", ")+". See the Spells tab."});
   if(reN.length)C.actions.push({c:"Reactions",n:"Spells",t:"Reaction casting time",d:reN.join(", ")+". See the Spells tab."});
   const tier=TLv>=17?4:TLv>=11?3:TLv>=5?2:1;
   list.forEach((s) =>{if(s.l||s.sv!=="ATK")return;const P=s.fx&&s.fx.dmg&&s.fx.dmg[0],pm=P&&/^(\d+)d(\d+)$/.exec(P[0]),m=pm?[0,pm[1],pm[2],P[1].split("|").join(" or ")]:/(\d+)d(\d+)\s+([A-Z][a-z]+)/.exec(s.sum);if(!m)return;/* RD19 */const eb=s.n==="Eldritch Blast",cnt=eb?1:(+m[1])*tier,ag=agOn(s.n);
    C.attacks.push({n:s.n,sub:"Cantrip"+(eb?" \u2022 "+tier+" beam"+(tier>1?"s":""):""),ab:s._ab||ab,prof:true,die:cnt+"d"+m[2],dieSrc:s.n+(eb?"":" (scales with level)"),nomod:!(ag||(s.db&&s.db.length)),/* v15: Potent Spellcasting, Empowered Evocation add the modifier, as Agonizing Blast */type:m[3],range:(function(){const sp=(B.ch.invspear||[]).indexOf(s.n)>=0&&/^(\d+) ft$/.exec(s.r||"");return sp?(+sp[1]+30*clsLv("Warlock"))+" ft (Eldritch Spear)":s.r})(),m:"",misc:spItemB("atk",s.src)||undefined,miscSrc:spItemB("atk",s.src)?spItemSrc(s.src).join(", "):undefined,note:((B.ch.invrepel||[]).indexOf(s.n)>=0?"Repelling Blast: on a hit, push a Large or smaller target up to 10 ft away. ":"")+(ag?"Agonizing Blast adds your "+(s._ab||ab)+" modifier. ":(s.db||[]).map((b) =>{return b.s+" adds "+(b.v<0?"":"+")+b.v+". "}).join(""))+s.sum})});}
  (C.spells||[]).forEach((s) =>{delete s._ab});
  /* v58: spells that magic items let you cast (ITEM_SPELLS). use is "At will" when free, else "Item" and itc says what it costs */
  if(typeof ITEM_SPELLS!=="undefined"){const ISL=[];__R.ensureInv().forEach((x) =>{const it=ITEM_SPELLS[x.n],d=DMAP[x.n];if(!it||!d)return;if(d[3]&&!x.eq)return;
   it.sp.forEach((q) =>{const sp=SM[q[0]];if(!sp)return;const cost=q[1],vr=Array.isArray(cost),pl=q[3],src=x.n+(pl?" ("+pl+")":"");if(ISL.some((y) =>{return y.n===q[0]&&y.src===src}))return;
    const lv=typeof q[2]==="number"&&q[2]?q[2]:sp[1];
    const o={n:q[0],l:sp[1],sch:sp[2],ct:sp[4],r:sp[5],cmp:sp[6],dur:sp[7],conc:sp[8],rit:sp[9],sv:sp[10],sum:sp[11]||"",full:SPELL_FULL[q[0]]||"",cls:sp[3].join(", "),use:cost===0?"At will":"Item",src:src,itc:{it:x.n,c:cost,lv:lv}};
    if(it.dc!=null)o.itc.dc=it.dc;if(it.atk!=null)o.itc.atk=it.atk;spFxTo(o,"",a);ISL.push(o)})});
   if(ISL.length){C.spells=(C.spells||[]).concat(ISL);C.spells.sort((p,q) =>{return p.l-q.l||(p.n<q.n?-1:p.n>q.n?1:0)})}}
  /* v21 M2: Mystic Arcanum and Contact Patron, once per Long Rest without a slot. v23 m1-r3: the shared "Mystic Arcanum" row only counts the arcana that have no own row yet */
  const maN=(C.spells||[]).filter((s) =>{return s.src==="Mystic Arcanum"}).length;if(maN)C.res=C.res.filter((r) =>{if(r.n==="Mystic Arcanum"&&+r.max>=1){r.max=+r.max-maN;return r.max>0}return true});/* m1-r4: the arcana not chosen yet keep a shared row */
  (C.spells||[]).forEach((s) =>{const one=s.src==="Contact Patron"&&C.res.filter((r) =>{return r.n===s.src&&+r.max===1})[0];if(one){one.n=s.src+": "+s.n;one.f=one.f||s.src;return}/* v23 m3-r2: one counter, named after the spell */if(/^(Mystic Arcanum|Contact Patron)$/.test(s.src)&&!C.res.some((r) =>{return r.f===s.src&&r.n.indexOf(s.n)>=0}))C.res.push({k:resKey("x-",s.src+" "+s.n,C.res),n:s.src+": "+s.n,tag:"1/Long Rest spell",max:1,reset:"long",f:s.src})});
  let mmk=[];Object.keys(B.ch).forEach((k) =>{if(/metamagic$/.test(k))mmk=mmk.concat(B.ch[k]||[])});if(mmk.length)C.features.push({g:"Metamagic Options",items:mmk.map((n) =>{const o=METAMAGIC.filter((x) =>{return x[0]===n})[0];return {n:n,s:SRC+", Sorcerer",d:o?o[1]:""}})});/* RD18 */
  if(invs.length){let lfoN=0;C.features.push({g:"Eldritch Invocations",items:invs.map((n) =>{let o=INVOCATIONS.filter((x) =>{return x[0]===n})[0]||PACTB14.filter((x) =>{return x[0]===n})[0],q=typeof INV_PICK!=="undefined"&&INV_PICK[n],y="";
   if(q&&q.feat){lfoN++;y=B.ch[q.key+lfoN]||""}else if(q)y=(B.ch[q.key]||[]).join(", ");return {n:n,s:SRC+", Warlock",d:(o?o[1]:"")+(y?" **Your choice.** "+y+".":"")}})})}/* v32 RL49 */
  /* m3 (RL19): Devil's Sight is its own sense, not Darkvision (PHB 2024 p. 155). New optional field C.senses [{n, v (ft), s, d}] */
  if(invs.indexOf("Devil's Sight")>=0)C.senses=(C.senses||[]).concat([{n:"Devil's Sight",v:120,s:"Eldritch Invocation ("+SRC+", Warlock)",d:"You see normally in Dim Light and in Darkness, magical or not, out to 120 ft."}]);
  /* M13: Pact of the Blade is applied to the chosen weapon only, in the attack loop above (before the inventory, RL36 c) */
  if(invs.indexOf("Thirsting Blade")>=0||invs.indexOf("Devouring Blade")>=0)C.actions[0].d="Make "+(invs.indexOf("Devouring Blade")>=0?"three":"two")+" attacks with your pact weapon (Thirsting Blade), or one attack otherwise. "+C.actions[0].d;
 }
 /* v20 RD25: senses and Fly Speed from a species choice (Retromistika Mistikan ancestries) */
 /* v32 RL49 no. 28, 33: chosen Wild Shape forms and Primal Companion, read by Extras (optional fields) */
 CHT.forEach((q) =>{const v=B.ch[q.key];if(/^(m\d+:)?p2forms$/.test(q.key)&&Array.isArray(v)&&v.length)C.wsForms=v.slice();if(q.feature==="Primal Companion"&&typeof v==="string"&&v)C.companion=v});
 __R.gfx().forEach((e) =>{if(e.size){const SZ=["Tiny","Small","Medium","Large","Huge","Gargantuan"];if(SZ.indexOf(C.size)<SZ.indexOf(e.size))C.size=e.size}});/* fx: size "Large" = you become Large if smaller (Exo-Frame) */
 __R.gfx().forEach((e) =>{(e.sense||[]).forEach((x) =>{const o=(C.senses||[]).filter((y) =>{return y.n===x[0]})[0];if(o){if(o.v>=x[1])return;C.senses=C.senses.filter((y) =>{return y!==o})}C.senses=(C.senses||[]).concat([{n:x[0],v:x[1],s:e.lbl,d:x[2]||""}])})});/* fx engine v2: sense [[name, feet, text]] */__R.gfx().forEach((e) =>{(e.senseAdd||[]).forEach((x) =>{const o=(C.senses||[]).filter((y) =>{return y.n===x[0]})[0];if(o){o.v+=x[1];o.s=o.s+"; "+e.lbl;o.d=x[2]||o.d}else C.senses=(C.senses||[]).concat([{n:x[0],v:x[1],s:e.lbl,d:x[2]||""}])})});/* fx batch E: senseAdd [[name, feet, text]] grows an existing sense by that many feet, else grants it */
  const SFq=__R.spOptFx();(SFq.senses||[]).forEach((x) =>{C.senses=(C.senses||[]).filter((y) =>{return y.n!==x[0]});C.senses.push({n:x[0],v:x[1],s:x[2]+" ("+spName+")",d:x[3]||""})});
 XFX.senses(C);/* v62 */
 if(SFq.fly){C.speeds=C.speeds||{};C.speeds.fly={v:SFq.fly[0],s:SFq.fly[1]}}
 if(SFq.moves&&!custom&&sp){C.speeds=C.speeds||{};Object.keys(SFq.moves).forEach((k) =>{C.speeds[k]={v:SFq.moves[k],s:spName+" ("+(sp.hb||SRC)+")"+(SFq.movesNote&&k==="fly"?", "+SFq.movesNote:"")}})}/* v36 p21 */
 feats.forEach((f) =>{const F=FEATS[f.n];if(F&&F.attacks)F.attacks.forEach((q) =>{C.attacks.push({n:q.n,sub:"Natural weapon",ab:q.ab||"STR",prof:true,die:q.die,dieSrc:q.n+" ("+f.n+")",type:q.type,range:"5 ft",m:"",note:""})})});/* v69 */
 if(sp&&!custom&&sp.attacks)sp.attacks.forEach((q) =>{C.attacks.push({n:q.n,sub:"Natural weapon",ab:q.ab||"STR",prof:true,die:q.die,dieSrc:q.n+" ("+spName+", "+(sp.hb||SRC)+")",type:q.type,range:q.range||"5 ft",m:"",note:q.note||""})});/* v36 p21 */
 /* v20 RD25: Leyak Form Sharp Claws (The Leyak Queen 3): Simple melee, Finesse, Force. Grand Leyak (level 10) Deadly Claws: 1d10 */
 const lq=subAt("Warlock","The Leyak Queen");if(lq>=3){const dc=lq>=10&&((B.ch.scgrand||[]).indexOf("Deadly Claws")>=0||(__R.MCL().some((m,i) =>{return ((B.ch["m"+i+":scgrand"])||[]).indexOf("Deadly Claws")>=0}))),fab=a.sc.DEX>a.sc.STR?"DEX":"STR";
  C.attacks.push({n:"Sharp Claws",sub:"Leyak Form only \u2022 Finesse",ab:fab,prof:true,die:dc?"1d10":"1d8",dieSrc:dc?"Deadly Claws (Grand Leyak)":"Leyak Form (The Leyak Queen 3)",type:"Force",range:"5 ft",m:"",note:"Only while your Leyak Form is active. While it is, you can also make this attack as a Bonus Action."})}
 /* fx engine v3a late pass: resToImm, speedAddIf, atkAb, atkDice, text picks (SOURCE-NOTES.md, "fx schema", v3a) */
 (function(){const G=__R.gfx(),hasW=function(r){return !!WEAPONS[__R.baseOf(r.n).b]},isSp=function(r){return /^Cantrip/.test(r.sub||"")};
  const hit=function(r,k){return r.n===k||__R.baseOf(r.n).b===k||(r.n||"").replace(/ \(thrown\)$/,"")===k},
   pickRows=function(kind){return C.attacks.filter(function(r){return kind==="unarmed"?r.n==="Unarmed Strike":kind==="weapon"?hasW(r)&&r.n!=="Unarmed Strike":kind==="spell"?isSp(r):hit(r,kind)})};
  const spdTxt=function(k){return k.charAt(0).toUpperCase()+k.slice(1)+" Speed"};
  G.forEach(function(e){if(e.cond&&!__R.fxOk(e,ar,ESH,EA))return;
   /* resToImm: Resistance to each type, or Immunity when a Resistance to that type is already held from another source */
   (e.resToImm||[]).forEach(function(t){const def=C.defenses=C.defenses||[],ix=def.findIndex(function(x){return x.t==="Resistance"&&x.v===t});
    if(ix>=0){def.splice(ix,1);def.push({t:"Immunity",v:t,s:e.lbl+" (you already had Resistance to "+t+")"})}
    else if(def.some(function(x){return x.t==="Resistance"&&new RegExp("(^|, )"+t+"(,|$)").test(x.v)}))def.push({t:"Immunity",v:t,s:e.lbl+" (you already had Resistance to "+t+")"});
    else def.push({t:"Resistance",v:t,s:e.lbl})});
   /* speedAddIf {swim:10}: +10 ft to that Speed if you already have it from another source, else the entry's own mv grants it */
   Object.keys(e.speedAddIf||{}).forEach(function(k){const n=+e.speedAddIf[k],sk=C.speeds&&C.speeds[k],mv=(C.moves||[]).filter(function(x){return x.m===k&&x.s!==e.lbl})[0];
    if(sk){const cur=sk.v==="walk"?C.speed:+sk.v;C.speeds[k]={v:cur+n,s:sk.s+"; +"+n+" ft "+e.lbl}}
    else if(mv){mv.v+=n;mv.s=mv.s+"; "+e.lbl}
    else if(e.mv&&e.mv[k]!=null){const v=e.mv[k];C.speeds=C.speeds||{};C.speeds[k]={v:v==="speed"?"walk":+v,s:e.lbl};(C.moves=C.moves||[]).push({m:k,v:v==="speed"?C.speed:+v,s:e.lbl})}
    if(sk||mv)C.speedSrc+=", +"+n+" ft "+spdTxt(k)+" ("+e.lbl+", you already have it)";else if(e.mv&&e.mv[k]!=null)C.speedSrc+=", "+spdTxt(k)+" "+(e.mv[k]==="speed"?"equal to your Speed ("+C.speed+" ft)":e.mv[k]+" ft")+" ("+e.lbl+")"});
   /* atkAb {kind, ab, opt, note}: that ability for the attack and damage modifier when higher. opt:1 = only a note on the row (the text allows it for some strikes) */
   if(e.atkAb){const q=e.atkAb;pickRows(q.kind).forEach(function(r){if(!q.ab||a.sc[q.ab]==null)return;const bt=pb+mod(a.sc[q.ab]),dm=mod(a.sc[q.ab]);
     if(q.opt){r.note=(r.note?r.note+" ":"")+(q.note||e.n+": you can use "+ABN[q.ab]+" instead of "+ABN[r.ab]+" for the attack and damage of this attack")+" (attack +"+bt+", damage modifier "+(dm>=0?"+":"")+dm+")."}
     else if(mod(a.sc[q.ab])>mod(a.sc[r.ab])){r.note=(r.note?r.note+" ":"")+e.lbl+": "+ABN[q.ab]+" instead of "+ABN[r.ab]+" for attack and damage.";r.ab=q.ab;r.abSrc=e.lbl}})}
   /* atkDice [{when:"weapon|spell|unarmed|<name>", d:"1d10", t:"type", note}]: extra damage dice on matching attack rows, or a Note under Defenses when no row exists */
   (e.atkDice||[]).forEach(function(x){const rows=pickRows(x.when);
    if(rows.length)rows.forEach(function(r){(r.xdice=r.xdice||[]).push({d:x.d,t:x.t||"",s:e.lbl});r.note=(r.note?r.note+" ":"")+"Extra damage: +"+x.d+(x.t?" "+x.t:"")+" ("+e.lbl+")."});
    else{C.defenses=C.defenses||[];C.defenses.push({t:"Note",v:(x.note||"Extra damage on "+(/^(weapon|spell|unarmed)$/.test(x.when)?x.when+" attacks":x.when))+": +"+x.d+(x.t?" "+x.t:""),s:e.lbl})}})});
  /* text picks with defT: the typed text becomes a Defenses line */
  (__R.gxPicks?__R.gxPicks():[]).forEach(function(o){if(o.t!=="text"||!o.defT)return;const v=B.ch[o.key];if(typeof v==="string"&&v.trim()){C.defenses=C.defenses||[];C.defenses.push({t:o.defT,v:(o.dpre?o.dpre+": ":"")+v.trim(),s:o.src})}})})();
 /* v20 RD24: Variant Combat Rules (Aurvidya): Combat Maneuver Roll */
 if(__R.enabledPacks().some((p) =>{return p.cmr})&&clsParts().some((q) =>{return /^(Barbarian|Fighter|Monk|Paladin|Ranger|Rogue)$/.test(q.cls)})){const sm=mod(a.sc.STR),dm=mod(a.sc.DEX),rb=pb+Math.max(sm,dm);
  C.actions.push({c:"Actions",n:"Combat Maneuver Roll",hb:1,t:"Variant rule (Aurvidya)",d:"Instead of letting a target save against a nonmagical maneuver of a martial feature that calls for a Strength or Dexterity saving throw, roll d20 "+(rb<0?"\u2212"+(-rb):"+"+rb)+" (Proficiency Bonus plus your Strength or Dexterity modifier). It works if the total meets the target's DC: 8 + its Proficiency Bonus + its Strength modifier + its Dexterity modifier. Your own DC against such a roll is "+(8+pb+sm+dm)+"."})}
 /* v23 RU36 no. 2: entries D&D Beyond shows in Features: Core <Class> Traits, <Class> Subclass, Ability Score Improvement and Epic Boon with the feat taken,
    species Creature Type and Speed. The player's choice goes after "**Your choice.**" */
 (function(){const cg=C.features.filter((g) =>{return g.g===B.cls})[0];if(!cg||!c)return;
  const lvOfIt=function(it){const m=/ (\d+)$/.exec(it.s||"");return m?+m[1]:0},put=function(it,lv){let i=0;while(i<cg.items.length&&(lvOfIt(cg.items[i])||0)<=lv)i++;cg.items.splice(i,0,it)};
  const ck=C.skills.filter((s) =>{return s.p&&/^Class skills/.test(s.src||"")}).map((s) =>{return s.n});
  const arm=String(c.armor||"").split(/,\s*/).filter(Boolean).map((x) =>{return x==="Shields"?"Shields":x+" armor"}),wp=String(c.weapons||"").split(/,\s*/).filter(Boolean).map((x) =>{return /^(Simple|Martial)$/.test(x)?x+" weapons":x});
  const core="**Primary Ability:** "+String(c.prim||"").split("/").map((k) =>{return ABN[k]||k}).join(" or ")+". **Hit Point Die:** D"+c.hd+" per "+B.cls+" level. **Saving Throw Proficiencies:** "+(c.saves||[]).map((k) =>{return ABN[k]}).join(" and ")+". **Skill Proficiencies:** Choose "+(c.sk&&c.sk.n||0)+(c.sk&&c.sk.from==="any"?" skills.":" from "+((c.sk&&c.sk.from)||[]).join(", ")+".")+(wp.length?" **Weapon Proficiencies:** "+wp.join(" and ")+".":"")+(c.tools?" **Tool Proficiencies:** "+c.tools+".":"")+(arm.length?" **Armor Training:** "+arm.join(", ")+".":" **Armor Training:** None.")+(function(){const y=ck.concat(c.toolPick?(B.ch.clsTool||[]):[]);return y.length?" **Your choice.** "+y.join(", ")+".":""})();
  cg.items.unshift({n:"Core "+B.cls+" Traits",s:SRC+", "+B.cls+" 1",d:core});
  if(B.sub&&B.sub!=="__custom"&&L>=subLv(B.cls))put({n:R14()?subLbl(B.cls):B.cls+" Subclass",s:SRC+", "+B.cls+" "+subLv(B.cls),d:"You gain "+(/^[AEIOU]/.test(B.cls)?"an ":"a ")+B.cls+" subclass of your choice. Its features come at the levels it lists. **Your choice.** "+sdn(B.sub)+"."},subLv(B.cls));
  allFeats().forEach((f) =>{const m=new RegExp("\\("+B.cls+" (\\d+)\\)$").exec(f.s||"");if(!m)return;const F=FEATS[f.n]||{},lv=+m[1],ep=F.cat==="E",v=f.asi||{},ex=v.a1?(F.asi2?(v.a1===v.a2?v.a1+" +2":v.a1+" +1, "+v.a2+" +1"):v.a1+" +1"):"";
   put({n:ep?"Epic Boon":"Ability Score Improvement",s:SRC+", "+B.cls+" "+lv,d:ep?"You gain an Epic Boon feat or another feat of your choice for which you qualify. **Your choice.** "+f.n+(ex?" ("+ex+")":"")+".":"You gain the Ability Score Improvement feat or another feat of your choice for which you qualify. **Your choice.** "+f.n+(ex?" ("+ex+")":"")+"."},lv)});
  const sg0=C.features.filter((g) =>{return /^Species: /.test(g.g)})[0];
  if(sg0&&!custom&&sp){sg0.items.unshift({n:"Speed",s:(sp.hb||SRC)+", "+B.species,d:"Your Speed is "+(C.speed||sp.speed)+" feet."});sg0.items.unshift({n:"Creature Type",s:(sp.hb||SRC)+", "+B.species,d:"You are a "+(sp.type||"Humanoid")+"."})}
  const bgG=C.features.filter((g) =>{return /^Background: /.test(g.g)})[0];if(bgG&&R14())bgG.items=bgG.items.filter((i) =>{return i.n!=="Ability Scores"});if(bgG&&bg&&!R14()&&B.bgMode!=="111"&&B.bg2){const it=bgG.items[0];if(it&&it.n==="Ability Scores")it.d="The background raises one of "+bg.ab.join(", ")+" by 2 and another by 1, or all three by 1. **Your choice.** "+ABN[B.bg2]+" +2"+(B.bg1?", "+ABN[B.bg1]+" +1":"")+"."}
 })();
 /* v32 RL51: actions from feats, features, species, invocations, maneuvers and magic items (ACTS in db4.js), and the attack rows they give */
 C.acts=actsFor(C);if(!C.acts.length)delete C.acts;actAtk(C,a,feats);
 /* v23 RU36 no. 1: printed page in the Player's Handbook or Dungeon Master's Guide (2024), BOOKPG in db4.js. Only for core entries */
 if(typeof BOOKPG!=="undefined"){const P=BOOKPG.phb,clsMin=function(cl){const o=P["class"][cl]||{},v=Object.keys(o).map((k) =>{return o[k]});return v.length?Math.min.apply(null,v):null};
  C.features.forEach((g) =>{const gg=g.g,mm=/^(\w+) \(multiclass \d+\)(?:: (.+))?$/.exec(gg);(g.items||[]).forEach((it) =>{if(it.pg||!/^PHB-2024/.test(it.s||""))return;let n=it.n,pg=null;
   if(/^Species: /.test(gg)){const so=P.species[B.species];if(so)pg=so[n]||so._}
   else if(gg===B.cls||mm){const cl=mm?mm[1]:B.cls,co=P["class"][cl]||{},sb=mm&&mm[2]?P.subclass[cl+"|"+mm[2]]:null;pg=co[n]||co[n.split(":")[0]]||(sb&&sb[n])||(/^(Ability Score Improvement|Epic Boon)$/.test(n)?P.feat[n]:null)||((/^Core /.test(n)||n==="Spell Slots"||/ table$/.test(it.s||""))?clsMin(cl):null)}
   else if(gg.indexOf(B.cls+" Subclass: ")===0){const so2=P.subclass[B.cls+"|"+B.sub];if(so2)pg=so2[n]||so2._}
   else if(gg==="Feats")pg=P.feat[n];
   else if(/^Background: /.test(gg))pg=P.background[B.bg];
   else if(gg==="Eldritch Invocations")pg=P.invocation[n];
   else if(gg==="Metamagic Options")pg=(P["class"].Sorcerer||{}).Metamagic;
   if(pg)it.pg=pg})});
  (C.spells||[]).forEach((s) =>{const p=P.spell[s.n];if(p&&!s.hb)s.pg=p});
  (C.inv||[]).forEach((x) =>{const p=DMAP[x.n]&&BOOKPG.dmg.item[x.n];if(p)x.pg=p})}
 /* v33 p09: one entry per paragraph. A bold entry name that starts a sentence in the middle of a text starts a new paragraph (blank line). Your choice and Still open stay inline */
 (C.features||[]).forEach((g) =>{(g.items||[]).forEach((f) =>{if(typeof f.d==="string")f.d=fBlk(f.d);if(typeof f.full==="string")f.full=fBlk(f.full)})});
 if(R14())(function w(o){if(!o||typeof o!=="object")return;Object.keys(o).forEach((k) =>{const v=o[k];if(typeof v==="string"){if(v.indexOf("PHB-2024")>=0)o[k]=v.replace(/PHB-2024/g,"PHB-2014")}else w(v)})})(C);/* v85: the book of the 2014 rules */
 C.fxToggles=fxToggles();/* toggle fx available to this character; state is S.fxT on the sheet */
 return C}
function fBlk(t){return String(t).replace(/([.!?:)\]"]) \*\*(?!Your choice\.|Still open\.)([^*\n]{1,80}?\.)\*\* /g,"$1\n\n**$2** ")}
/* v32 RL51 actsFor */
/* C.acts: one entry per action a feature gives, from ACTS (audited to PHB 2024). k = action|bonus|reaction|other, n = label, f = feature name, g = group,
   u = Limited Use name, d = the part of the text named n ("**n.** ..."), it = magic item key. g.ak lists the feature names of a group the table covers
   (the sheet then uses only C.acts for them; other names keep the old text rule) */
function actsFor(C){const out=[],T=typeof ACTS!=="undefined"?ACTS:{},lin=String((B.ch||{}).lin||"");
 const esc=function(x){return String(x).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")};
 const sec=function(t,lab){const m=new RegExp("\\*\\*"+esc(lab)+"\\.\\*\\*\\s*([\\s\\S]*?)(?=\\s*\\*\\*[^*\\n]{1,80}?\\.\\*\\*|$)").exec(String(t||""));return m?m[1].trim():null};
 const keys=function(gg,n){const mm=/^(\w+) \(multiclass \d+\)(?:: (.+))?$/.exec(gg);
  if(gg==="Feats")return ["feat|"+n];if(/^Species: /.test(gg))return ["sp|"+B.species+"|"+n];if(gg===B.cls)return ["cls|"+B.cls+"|"+n];
  if(B.sub&&gg===B.cls+" Subclass: "+B.sub)return ["sub|"+B.sub+"|"+n];if(mm)return ["cls|"+mm[1]+"|"+n].concat(mm[2]?["sub|"+mm[2]+"|"+n]:[]);
  if(gg==="Eldritch Invocations")return ["inv|"+n];if(gg==="Metamagic Options")return ["meta|"+n];return []};
 const put=function(q,it,gg,lab0,txt){const k=q[0],lab=q[1]||lab0,e={k:k,n:lab,f:it.n,g:gg};if(q[3]&&lin.indexOf(q[3])!==0)return;if(q[2])e.u=q[2];
  if(txt!=null)e.d=txt;else if(q[1]&&q[1]!==it.n){const d=sec(it.full||it.d,q[1]);if(d)e.d=d}out.push(e)};
 (C.features||[]).forEach((g) =>{const gg=g.g,ak=[];(g.items||[]).forEach((it) =>{
   if(it.n==="Maneuvers known"){ak.push(it.n);let re=/\*\*([^*\n]{1,60}?)\.\*\*/g,m;while((m=re.exec(String(it.d||"")))){const L0=T["man|"+m[1]];if(L0)L0.forEach((q) =>{put(q,it,gg,m[1],sec(it.d,m[1]))})}return}
   let L=null;keys(gg,it.n).some((k) =>{if(T[k]){L=T[k];return true}return false});if(!L)return;ak.push(it.n);L.forEach((q) =>{put(q,it,gg,it.n)})});
  if(ak.length)g.ak=ak;else delete g.ak});
 /* magic items in use (attunement within the limit), from the item text: Magic action, Bonus Action, Reaction */
 let att=0,am=attMax();(B.inv||[]).forEach((x) =>{if(!x.eq)return;const d=DMAP[x.n];if(!d)return;if(d[3]){if(att>=am||!byOk(d[5]&&d[5].by))return;att++}
  const t=String(d[4]||""),ss=t.split(/(?<=[.!?])\s+/);[["action",/\b(Magic|Utilize) action\b/],["bonus",/\bBonus Action\b/],["reaction",/\bReaction\b/]].forEach((p) =>{const mine=ss.filter((z) =>{return p[1].test(z)&&!/\b(A|The) (hag|creature|target|monster)\b(?:(?!\byou\b)[^.])*\b(can take|takes)\b/.test(z)});if(!mine.length)return;/* v32 p39 */
   out.push({k:p[0],n:x.n,it:x.n,d:mine.join(" ")})})});
 return out}
/* Attack rows a feature gives: Polearm Master Pole Strike (PHB 2024 p. 205), Soulknife Psychic Blades (p. 136), Circle of the Stars Archer (p. 89) */
function actAtk(C,a,feats){const L=C.attacks||(C.attacks=[]),add=[];
 if(feats.some((f) =>{return f.n==="Polearm Master"}))L.forEach((r) =>{if(r.act||/ \(thrown\)$/.test(r.n)||r.n==="Unarmed Strike")return;const b=__R.baseOf(r.n).b,w=WEAPONS[b];
  if(!w||w.k!=="M"||!(b==="Quarterstaff"||b==="Spear"||(/Heavy/.test(w.p)&&/Reach/.test(w.p))))return;
  add.push({n:"Pole Strike",sub:r.n+" • Bonus Action",ab:r.ab,prof:r.prof,die:"1d4",dieSrc:"Polearm Master: Pole Strike ("+SRC+"), the other end of the "+b,misc:r.misc,miscSrc:r.miscSrc,dmgBonus:r.dmgBonus,
   type:"Bludgeoning",range:/Reach/.test(w.p)?"10 ft":"5 ft",m:r.m,note:"Bonus Action, right after you take the Attack action and attack with this weapon.",act:"bonus",of:r.n})});
 const pn=add.filter((r) =>{return r.n==="Pole Strike"});if(pn.length>1)pn.forEach((r) =>{r.n="Pole Strike ("+r.of+")"});/* one name per row when two weapons carry it */
 const sk=subAt("Rogue","Soulknife");if(sk>=3){const fab=a.sc.DEX>a.sc.STR?"DEX":"STR",src="Psychic Blades ("+SRC+", Soulknife 3)";
  add.push({n:"Psychic Blade",sub:"Finesse, Thrown (60/120) • Soulknife",ab:fab,prof:true,die:"1d6",dieSrc:src,type:"Psychic",range:"5 ft, 60/120 ft",m:"Vex",note:"Formed in a free hand when you take the Attack action or make an Opportunity Attack. It vanishes after the attack."});
  add.push({n:"Psychic Blade (Bonus Action)",sub:"Bonus Action • Finesse, Thrown (60/120)",ab:fab,prof:true,die:"1d4",dieSrc:src,type:"Psychic",range:"5 ft, 60/120 ft",m:"Vex",note:"After you attack with a Psychic Blade on your turn, if your other hand is free.",act:"bonus"})}
 const st=subAt("Druid","Circle of the Stars");if(st>=3){const sb=spItemB("atk","Druid");
  add.push({n:"Starry Form: Archer",sub:"Bonus Action • Archer form • ranged spell attack",ab:"WIS",prof:true,die:st>=10?"2d8":"1d8",dieSrc:"Starry Form: Archer ("+SRC+", Circle of the Stars 3"+(st>=10?"; Twinkling Constellations, level 10":"")+")",misc:sb||undefined,miscSrc:sb?spItemSrc("Druid").join(", "):undefined,
   type:"Radiant",range:"60 ft",m:"",note:"While the Archer form lasts: when you take the form, and as a Bonus Action on later turns.",act:"bonus"})}
 if(C.xdmg){C.xdmg=C.xdmg.filter((x) =>{return !(x.n==="Psychic Blades"&&sk>=3)&&!(x.n==="Starry Form: Archer"&&st>=3)});if(!C.xdmg.length)delete C.xdmg}
 add.forEach((r) =>{L.push(r)})}
