import {ABK,ABN,SRC,chJoin,dieAvg,getPbAdd,mod,pbOf} from "./01-logic-core-helpers.js";
import {DMAP,activeFx,attMax,bgX,byOk,htText,spX} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {CL,R14} from "./05-logic-choice-model-ruleset.js";
import {PACTB14,sdn,subLbl,subLv} from "./08-logic-2014-rules.js";
import {XFX,allFeats,bgTl,chOf,choices,dmSpells,featSpells,grantTools,hbPickOk,kitTool,sbWx,spClsJ,spFxTo,spItemB,spItemSrc,spLinTrait,spTraitText,subAt,toolChoices} from "./09-logic-feats-and-choices.js";
import {agOn,invList,luRows,optAny,pactWeapon,saveNotes,wisElse,wmAll,xdmgRows,ycOf} from "./10-logic-v17-additions.js";
import {fxToggles,ATKC,__set_ATKC,abil,casterParts,classFeatures,clsLv,clsParts,featsOf,keepResKeys,resKey,resMax,slotsFor,slugK,spLists,spellAb} from "./11-logic-derivation.js";
import {__R} from "./00-reg.js";
import {runFxPhase} from "./10a-logic-fx-registry.js";
import {runPhases} from "./12a-logic-sheet-registry.js";
import "./12c-logic-sheet-handlers-core.js";
import "./12d-logic-sheet-handlers-skills.js";
import "./12e-logic-sheet-handlers-defense.js";
import "./12f-logic-sheet-handlers-movement.js";
import "./12g-logic-sheet-handlers-profs.js";
import "./12h-logic-sheet-handlers-attacks.js";
import "./12i-logic-sheet-handlers-gear-resources.js";
import "./12j-logic-sheet-handlers-features.js";
import "./12k-logic-sheet-handlers-spells.js";
import "./11c-logic-fx-handlers-sheet.js";
import {spellRows,appVer,xsk,setInTS,inTS,speciesDef,bgDef,armorDef} from "./00-env.js";
Object.defineProperty(__R,"toSheet",{get:function(){return toSheet;},set:function(v){toSheet=v;},configurable:true});
/* ---------- export to sheet (v3) ---------- */
export var ACM=[];/* v27 i2: AC methods of the last toSheet, for the builder */
/* the pure reads a handler may ask for (state.q): the old code reached them through __R and the helpers of 01 to 11 */
const QRY={spellAb:spellAb,spFxTo:spFxTo,spClsJ:spClsJ,spLists:spLists,miFeats:function(){return __R.miFeats()},autoSpells:function(){return typeof __R.autoSpells==="function"?__R.autoSpells():[]},spItemB:spItemB,spItemSrc:spItemSrc,featSpells:featSpells,dmSpells:dmSpells,enabledPacks:function(){return __R.enabledPacks()},hbPickOk:hbPickOk,agOn:agOn,pactInvocation:function(n){return PACTB14.filter((x) =>{return x[0]===n})[0]},spTraitText:spTraitText,htText:htText,spLinTrait:spLinTrait,calcNote:function(n,c,l,a){return __R.calcNote(n,c,l,a)},defenses:function(a){return __R.defenses(a)},ycOf:ycOf,invList:invList,withItemContext:function(attacks,profs,fn){try{__set_ATKC(attacks);if(profs)__R.PROFC=profs;return fn()}finally{__set_ATKC(null)}},/* RL31, RL36 b: item texts read the attack rows built so far */
 itemHtml:function(n,x){if(inTS())return null;setInTS(1);try{return {html:__R.itemDetail(n,x)}}finally{setInTS(0)}},
 kitTool:kitTool,qOf:function(x){return __R.qOf(x)},itemW:function(n){return __R.itemW(n)},itemWEst:function(n){return __R.itemWEst(n)},rarityOf:function(x){return __R.rarityOf(x)},equippable:function(n){return __R.equippable(n)},itemType:function(n,x){return __R.itemType(n,x)},itemCost:function(b){return __R.itemCost(b)},
 gpNow:function(){return __R.gpNow()},eqIdx:function(){return __R.eqIdx()},clsKitText:function(){return __R.clsKitText()},resMax:resMax,resKey:resKey,luRows:luRows,mcResMax:function(r,a,l){return __R.mcResMax(r,a,l)},slugK:slugK,slotsAll:function(){return __R.slotsAll()},keepResKeys:keepResKeys,featsOf:featsOf,saveNotesOf:function(f){return saveNotes(f)},xdmgRows:xdmgRows,
 wpNamed:function(w,b){return __R.wpNamed(w,b)},bgTl:bgTl,optAny:optAny,gxPicks:function(){return __R.gxPicks()},hpBonusList:function(){return __R.hpBonusList()},fxCh:function(k,pre,kind,okey,any){return __R.fxCh(k,pre,kind,okey,any)},fxv:function(v,e){return __R.fxv(v,e)},subAt:subAt,chOf:chOf,wisElse:wisElse,clsLv:clsLv,spX:spX,bgX:bgX,langKeys:function(){return __R.langKeys()},
 xfxSkills:function(feats,p,prof,exp){XFX.skills(feats,p,prof,exp)},xfxPost:function(C,a){XFX.post(C,a)},xfxLang:function(lg){XFX.lang(lg)},
 baseOf:function(n){return __R.baseOf(n)},pactWeapon:pactWeapon,ensureInv:function(){return __R.ensureInv()},monkRule:function(w,nm){return __R.monkRule(w,nm)},fxOk:function(e,ar,ESH,EA){return __R.fxOk(e,ar,ESH,EA)},casterParts:casterParts,dmapRow:function(n){return DMAP[n]},sbWx:function(sub,cls){return typeof sbWx==="function"?sbWx(sub,cls):null}};
/* the inputs of a build: read once, in the order the old code read them (abil() settles pbAdd before pb is taken) */
function sheetInputs(){
 __R.syncPickItems();/* fx pick t:"item": chosen items join the inventory before anything reads it */
 const c=CL(),L=B.level,TLv=__R.TL(),a=abil(),pb=pbOf(TLv),sp=speciesDef(B.species),custom=B.species==="Custom";
 const spName=custom?(B.cSpecies.name||"Custom species"):B.species;
 const subName=B.sub==="__custom"?(B.cSub||"Homebrew subclass"):B.sub;
 const bg=bgDef(B.bg),feats=allFeats();
 const hpList=__R.hpCalc().list.map((e) =>{return {v:e.v,c:e.c,r:e.r,n:e.n}});
 const G=__R.gfx(),CH=choices(),SG=__R.subGrant(B.sub),parts=clsParts();
 const EA=__R.effArmor(),ESH=__R.effShield(),EW0=__R.effWeps(),BO=__R.baseOf(EA),EAp=BO.p,ar=armorDef(BO.b),mcl=__R.MCL(),AFX=activeFx(),SFX=__R.spOptFx(),XT=toolChoices(CH).concat(grantTools(feats)),wmSet=wmAll(),cfList=classFeatures().filter((x) =>{return !(R14()&&x[1]==="Weapon Mastery")}),slotsForNow=slotsFor();
 const SM={};spellRows().forEach((x) =>{SM[x[0]]=x});
 return {i:{SM:SM,invs:chJoin(B.ch,/invocation$/),B:B,c:c,L:L,TLv:TLv,a:a,pb:pb,sp:sp,custom:custom,spName:spName,subName:subName,bg:bg,feats:feats,hpList:hpList,appVer:appVer(),SRC:SRC,r14:R14(),G:G,CH:CH,SG:SG,parts:parts,packSkills:__R.packSkills(),xsk:xsk(),EA:EA,ESH:ESH,EW0:EW0,EAp:EAp,ar:ar,mcl:mcl,AFX:AFX,SFX:SFX,attMax:attMax(),XT:XT,wmSet:wmSet,cfList:cfList,slotsFor:slotsForNow},q:QRY,C:{},l:{},parts:parts}}
export function toSheet(){
 const T=sheetInputs();
 runPhases(T,["base","saves","skills","lang","gear","ac","savebonus","acbonus","speed","senses","init","profs","attacks","inventory","resources","actions","features","spells"]);
 const C=T.C,{c,L,TLv,a,pb,sp,custom,spName,subName,bg,feats}=T.i;
 const CHT0=T.i.CH,SG=T.i.SG;
 const {EA,ESH,ar}=T.i;
 ACM=T.l.acm;/* v27 i2 */
 const CHT=T.i.CH,weapons=T.l.weapons;
 const wmSet=T.i.wmSet;
 /* v20 RD25: senses and Fly Speed from a species choice (Retromistika Mistikan ancestries) */
 /* v32 RL49 no. 28, 33: chosen Wild Shape forms and Primal Companion, read by Extras (optional fields) */
 CHT.forEach((q) =>{const v=B.ch[q.key];if(/^(m\d+:)?p2forms$/.test(q.key)&&Array.isArray(v)&&v.length)C.wsForms=v.slice();if(q.feature==="Primal Companion"&&typeof v==="string"&&v)C.companion=v});
 {const SZ=["Tiny","Small","Medium","Large","Huge","Gargantuan"];const sz=__R.gfx();sz.forEach((e) =>{if(e.size&&SZ.indexOf(C.size)<SZ.indexOf(e.size))C.size=e.size});sz.forEach((e) =>{if(e.sizeSet&&SZ.indexOf(e.sizeSet)>=0)C.size=e.sizeSet/* fx engine v6: sizeSet "Tiny" = the size becomes exactly this, also smaller (Lilliputian), after the raising sizes */})}__R.gfx().forEach((e) =>{if(e.carryBump)C.carryBump=true/* fx engine v4: carryBump true = count as one size larger for carrying capacity (Powerful Build style) without changing the size. The sheet reads C.carryBump */});/* fx: size "Large" = you become Large if smaller (Exo-Frame) */
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
 (function(){const G=__R.gfx(),hasW=function(r){return !!WEAPONS[__R.baseOf(r.n).b]||!!r.gk},isSp=function(r){return /^Cantrip/.test(r.sub||"")};
  const hit=function(r,k){return r.n===k||__R.baseOf(r.n).b===k||(r.n||"").replace(/ \(thrown\)$/,"")===k},
   pickRows=function(kind){/* fx engine v4: kind may also be "melee", "ranged", "natural" (natural weapon rows), "any" (every row), or an array of kinds */if(Array.isArray(kind)){const out=[];kind.forEach(function(k){pickRows(k).forEach(function(r){if(out.indexOf(r)<0)out.push(r)})});return out}const wk=function(r){const w=WEAPONS[__R.baseOf(r.n).b];return w?w.k:(r.gk||"")};return C.attacks.filter(function(r){return kind==="unarmed"?r.n==="Unarmed Strike":kind==="weapon"?hasW(r)&&r.n!=="Unarmed Strike":kind==="spell"?isSp(r):kind==="melee"?hasW(r)&&r.n!=="Unarmed Strike"&&wk(r)==="M":kind==="ranged"?hasW(r)&&wk(r)==="R":kind==="natural"?r.sub==="Natural weapon":kind==="any"?true:hit(r,kind)})};
  const pushSN=function(t,s){C.saveNotes=C.saveNotes||[];if(!C.saveNotes.some(function(y){return y.t===t&&y.s===s}))C.saveNotes.push({t:t,s:s})};
  const spdTxt=function(k){return k.charAt(0).toUpperCase()+k.slice(1)+" Speed"};
  /* fx engine v5: attackRow [{n,ab,die,type,range,prof,bonus,atk,dmg,sub,k,natural,note}] = a new attack row granted by an item or feature. ab: ability key, "best" (Strength or Dexterity) or "cast". prof: true, false, or a weapon name or category that must be in the weapon proficiencies. bonus: flat to hit and damage (number, "pb", ability, or level steps); atk and dmg override one side. k "M" or "R" lets melee/ranged filters see the row. natural:true = Natural weapon row. A row with the same name is added once */
  G.forEach(function(e){if(e.cond&&!__R.fxOk(e,ar,ESH,EA))return;(e.attackRow?(Array.isArray(e.attackRow)?e.attackRow:[e.attackRow]):[]).forEach(function(x){if(C.attacks.some(function(r){return r.n===x.n}))return;
    let ab=x.ab||"STR";if(ab==="best")ab=a.sc.DEX>a.sc.STR?"DEX":"STR";else if(ab==="cast")ab=(C.spellcasting&&C.spellcasting.ab)||"CHA";
    const wps=String(C.profs.weapons||""),pr=x.prof===true||(typeof x.prof==="string"&&/^armor:/.test(x.prof)&&(" "+C.profs.armor+",").replace(/,/g," ,").indexOf(" "+x.prof.slice(6)+" ")>=0)||(typeof x.prof==="string"&&(__R.wpNamed(wps,x.prof)||(" "+wps+",").replace(/,/g," ,").indexOf(" "+x.prof+" ")>=0||(x.prof==="Simple"&&/Simple/.test(wps))||(x.prof==="Martial"&&/Martial(?! with)/.test(wps)))),
     bn=x.bonus!=null?__R.fxv(x.bonus,e):0,av=x.atk!=null?__R.fxv(x.atk,e):bn,dv=x.dmg!=null?__R.fxv(x.dmg,e):bn,sg2=function(v){return (v>0?"+":"")+v};
    C.attacks.push({n:x.n,sub:x.natural?"Natural weapon":(x.sub||"Granted attack"),ab:ab,prof:!!pr,die:x.die,dieSrc:x.n+" ("+e.lbl+")",misc:av,miscSrc:av?e.lbl+": "+sg2(av)+" to hit"+(dv===av?" and damage":""):"",dmgBonus:dv,type:x.type||"",range:x.range||"5 ft",m:"",note:x.note||"",gk:x.k||(/ft, \d|\d\/\d/.test(x.range||"")?"R":"M")});
    if(x.xd){const rw=C.attacks[C.attacks.length-1];rw.xdice=x.xd.map(function(q){return {d:q.d,t:q.t||"",s:e.lbl}});rw.note=(rw.note?rw.note+" ":"")+"Extra damage: "+x.xd.map(function(q){return "+"+q.d+(q.t?" "+q.t:"")}).join(", ")+" ("+e.lbl+")."}})});
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
    else{C.defenses=C.defenses||[];C.defenses.push({t:"Note",v:(x.note||"Extra damage on "+(/^(weapon|spell|unarmed)$/.test(x.when)?x.when+" attacks":x.when))+": +"+x.d+(x.t?" "+x.t:""),s:e.lbl})}});
   /* fx engine v4: saveNote [text] = a line under Saving Throws (death save bonus, "Advantage on saves against being Frightened"); advOn texts that mention saves are copied there too, next to the Defenses note */
   (e.saveNote||[]).forEach(function(t){pushSN(t,e.lbl)});(e.advOn||[]).forEach(function(t){if(/sav(e|ing)/i.test(t))pushSN("Advantage on "+t,e.lbl)});
   /* atkBonus [{when,atk,dmg,crit,note}]: a flat bonus to the attack roll and/or damage of the matching attack rows (when as for atkDice: weapon, spell, unarmed, melee, ranged, natural, any, a name, or an array). atk and dmg take a number, "pb", an ability key, or [[level, value]] steps (level = the source level). crit N = note "Critical hit on N-20" */
   (e.atkBonus?(Array.isArray(e.atkBonus)?e.atkBonus:[e.atkBonus]):[]).forEach(function(x){pickRows(x.when||"weapon").forEach(function(r){const av=x.atk!=null?__R.fxv(x.atk,e):0,dv=x.dmg!=null?__R.fxv(x.dmg,e):0,sg=function(v){return (v>0?"+":"")+v};
     if(av){r.misc=(r.misc||0)+av;r.miscSrc=(r.miscSrc?r.miscSrc+"; ":"")+e.lbl+": "+sg(av)+" to hit"}if(dv){r.dmgBonus=(r.dmgBonus||0)+dv;r.miscSrc=(r.miscSrc?r.miscSrc+"; ":"")+e.lbl+": "+sg(dv)+" damage"}
     if(x.crit)r.note=(r.note?r.note+" ":"")+"Critical hit on "+x.crit+"-20 ("+e.lbl+").";if(x.note)r.note=(r.note?r.note+" ":"")+x.note})});
   /* unarmed {die, t, magic}: the Unarmed Strike row. die: "1d6" or [[level, "1d6"], ...] steps; used when larger than the current die (die force:1 always). t: damage type. magic: note that it counts as magical */
   if(e.unarmed){const q=e.unarmed;pickRows("unarmed").forEach(function(r){let d=q.die;if(Array.isArray(d)){let v=null;d.forEach(function(s){if(e.lv>=s[0])v=s[1]});d=v}
     if(d&&(q.force||dieAvg(d)>dieAvg(r.die))){r.dieSrc=e.lbl+(r.die&&r.die!=="1"?" (instead of "+r.die+")":"");r.die=d}
     if(q.t)r.type=q.t;if(q.magic)r.note=(r.note?r.note+" ":"")+"Counts as magical ("+e.lbl+")."})}
   /* fx engine v5: dieReplace [{when,d,t,from,up,finesse,note}]: the damage dice (d), the damage type (t) or the Finesse property of the matching rows are replaced. from: only rows with exactly this die. up:1 = only when d is larger. when as for atkDice */
   (e.dieReplace?(Array.isArray(e.dieReplace)?e.dieReplace:[e.dieReplace]):[]).forEach(function(x){pickRows(x.when||"weapon").forEach(function(r){if(x.from&&r.die!==x.from)return;if(x.cat){const w0=WEAPONS[__R.baseOf(r.n).b];if(!w0||w0.cat!==x.cat)return}
     if(x.d&&(!x.up||dieAvg(x.d)>dieAvg(r.die))){r.dieSrc=e.lbl+(r.die&&r.die!=="1"?" (instead of "+r.die+")":"");r.die=x.d}
     if(x.t){r.typeSrc=e.lbl+(r.type?" (instead of "+r.type+")":"");r.type=x.t}
     if(x.finesse&&(r.ab==="STR"||r.ab==="DEX")&&!/Finesse/.test(r.sub||"")){r.sub=(r.sub?r.sub+" \u2022 ":"")+"Finesse";if(a.sc.DEX>a.sc.STR&&r.ab==="STR"){r.ab="DEX";r.abSrc=e.lbl}}
     if(x.note)r.note=(r.note?r.note+" ":"")+x.note})});
   /* fx engine v5: reach [{when,add,mul}] changes the melee reach of the matching rows ("5 ft" becomes N*mul+add), rangeMul [{when,mul}] multiplies the normal and long range (80/320) */
   (e.reach?(Array.isArray(e.reach)?e.reach:[e.reach]):[]).forEach(function(x){pickRows(x.when||"melee").forEach(function(r){const m=/^(\d+) ft/.exec(r.range||"");if(!m)return;const n=(+m[1])*(x.mul||1)+(x.add||0);r.range=n+" ft"+r.range.slice(m[0].length);r.note=(r.note?r.note+" ":"")+"Reach "+n+" ft ("+e.lbl+")."})});
   (e.rangeMul?(Array.isArray(e.rangeMul)?e.rangeMul:[e.rangeMul]):[]).forEach(function(x){pickRows(x.when||"ranged").forEach(function(r){if(!/(\d+)\/(\d+)/.test(r.range||""))return;r.range=r.range.replace(/(\d+)\/(\d+)/,function(s,p1,p2){return (+p1*x.mul)+"/"+(+p2*x.mul)});r.note=(r.note?r.note+" ":"")+"Range multiplied by "+x.mul+" ("+e.lbl+")."})});
   /* fx engine v5: toolExpert [tool] = Expertise (double Proficiency Bonus) with a tool you are proficient with; toolPE [tool] = proficiency, or Expertise when you already have it. C.toolExp [{n,s,v}] lists them, the tool source in C.profSrc.tools gets "Expertise", and a Defenses note repeats it */
   ["toolExpert","toolPE"].forEach(function(f){(e[f]||[]).forEach(function(n){const T=C.profSrc.tools,ix=T.findIndex(function(x){return x[0]===n});C.toolExp=C.toolExp||[];
     if(ix<0){if(f==="toolExpert")return;T.push([n,e.lbl]);C.profs.tools=(C.profs.tools&&C.profs.tools!=="None"?C.profs.tools+", ":"")+n;return}
     if(C.toolExp.some(function(x){return x.n===n}))return;T[ix][1]=T[ix][1]+"; Expertise ("+e.lbl+")";C.toolExp.push({n:n,s:e.lbl,v:2*pb});C.defenses=C.defenses||[];C.defenses.push({t:"Note",v:"Expertise with "+n+": add double your Proficiency Bonus (+"+(2*pb)+") to its ability checks",s:e.lbl})})});
   /* fx engine v5: slotAdd [{lvl,n,ifHave,max}] adds spell slots to a character who casts with slots. lvl "high" = the highest slot level held (at most max). ifHave:1 = only when you already have slots of that level */
   if(C.spellcasting&&C.spellcasting.slots&&e.slotAdd)(Array.isArray(e.slotAdd)?e.slotAdd:[e.slotAdd]).forEach(function(q){const sl=C.spellcasting.slots.slice();let lv=q.lvl;if(lv==="high"){lv=0;sl.forEach(function(n,i){if(n>0&&(!q.max||i+1<=q.max))lv=i+1})}if(!lv||lv>9)return;if(q.ifHave&&!(sl[lv-1]>0))return;while(sl.length<lv)sl.push(0);sl[lv-1]+=q.n||1;C.spellcasting.slots=sl;C.defenses=C.defenses||[];C.defenses.push({t:"Note",v:"Extra spell slot: "+(q.n||1)+" of level "+lv,s:e.lbl})});
   /* fx engine v5: exhLock N = Exhaustion that cannot be removed (a curse): the sheet keeps Exhaustion at N or more. C.exhMin */
   if(e.exhLock){C.exhMin=Math.max(C.exhMin||0,e.exhLock);C.defenses=C.defenses||[];C.defenses.push({t:"Note",v:"Exhaustion level "+e.exhLock+" cannot be removed until the effect ends",s:e.lbl})}
   /* fx engine v6: dieStep [{when,n}] moves the weapon die n steps on the ladder d4 d6 d8 d10 d12 (n -1 = one step down, 2d6 counts as d12, minimum d4). Other dice are not changed */
   (e.dieStep?(Array.isArray(e.dieStep)?e.dieStep:[e.dieStep]):[]).forEach(function(x){const LD=["1d4","1d6","1d8","1d10","1d12"];pickRows(x.when||"weapon").forEach(function(r){if(r.n==="Unarmed Strike"&&!x.unarmed)return;const d0=r.die==="2d6"?"1d12":r.die,i=LD.indexOf(d0);if(i<0)return;const j=Math.max(0,Math.min(4,i+(x.n||-1)));if(j===i&&d0===r.die)return;r.dieSrc=e.lbl+" ("+(x.n<0||x.n==null?"one step down":"steps "+x.n)+" from "+r.die+")";r.die=LD[j]})});
   /* fx engine v6: offHand:true = a row "(off-hand)" for each Light melee weapon row. The off-hand attack adds the ability modifier to its damage (Two-Weapon Fighting). C.attacks gets the extra rows, rows already named so are not doubled */
   if(e.offHand){pickRows("melee").filter(function(r){return /Light/.test(r.sub||"")&&!/off-hand/.test(r.n)}).forEach(function(r){const nm=r.n+" (off-hand)";if(C.attacks.some(function(y){return y.n===nm}))return;const c2=Object.assign({},r,{n:nm,sub:(r.sub?r.sub+" \u2022 ":"")+"Off-hand",note:(r.note?r.note+" ":"")+"Off-hand attack (Bonus Action, second Light weapon). "+e.lbl+": the ability modifier is added to its damage.",m:r.m});delete c2.nomod;C.attacks.splice(C.attacks.indexOf(r)+1,0,c2)})}
   /* fx engine v6: luBump [{match,add}] = +add to the maximum of every class resource row whose name is match (or starts with match); cdAdd N = luBump of "Channel Divinity" (each Channel Divinity feature one more time). The row tag says where the extra use comes from */
   (e.luBump?(Array.isArray(e.luBump)?e.luBump:[e.luBump]):[]).concat(e.cdAdd?[{match:"Channel Divinity",add:e.cdAdd}]:[]).forEach(function(x){C.res.forEach(function(r){if(!(r.n===x.match||r.n.indexOf(x.match)===0)||!(+r.max>0))return;r.max=+r.max+(x.add||1);r.tag=(r.tag?r.tag+". ":"")+e.lbl+": +"+(x.add||1)+" use"})});
  });
  /* extraAttack N (any entry): the Attack action text shows N attacks when no class Extra Attack text is there already */
  {let ea=0,es="";G.forEach(function(e){if(e.extraAttack>ea&&(!e.cond||__R.fxOk(e,ar,ESH,EA))){ea=e.extraAttack;es=e.lbl}});const at=C.actions&&C.actions[0];if(ea>=2&&at&&at.n==="Attack"&&at.d.indexOf("per Extra Attack")<0)at.d=at.d.replace(/^Make one attack/,"Make "+(["","one","two","three","four"][ea]||ea)+" attacks ("+es+")")}
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
  if(sg0&&!custom&&sp){const had=(n) =>{return sg0.items.some((i) =>{return i.n===n})};/* a species that lists its own Creature Type or Speed keeps that card only */if(!had("Speed"))sg0.items.unshift({n:"Speed",s:(sp.hb||SRC)+", "+B.species,d:"Your Speed is "+(C.speed||sp.speed)+" feet."});if(!had("Creature Type"))sg0.items.unshift({n:"Creature Type",s:(sp.hb||SRC)+", "+B.species,d:"You are a "+(sp.type||"Humanoid")+"."})}
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
 if(getPbAdd())C.pbAdd=getPbAdd();/* fx engine v5: Proficiency Bonus added by pbAdd entries */
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
