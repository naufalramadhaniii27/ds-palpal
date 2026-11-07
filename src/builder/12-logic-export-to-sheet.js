import {ABK,ABN,SRC,chJoin,dieAvg,getPbAdd,mod,pbOf} from "./01-logic-core-helpers.js";
import {DMAP,activeFx,attMax,bgX,byOk,htText,spX} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {CL,R14} from "./05-logic-choice-model-ruleset.js";
import {PACTB14,sdn,subLbl,subLv} from "./08-logic-2014-rules.js";
import {XFX,allFeats,bgTl,chOf,choices,dmSpells,featSpells,grantTools,hbPickOk,kitTool,sbWx,spClsJ,spFxTo,spItemB,spItemSrc,spLinTrait,spTraitText,subAt,toolChoices} from "./09-logic-feats-and-choices.js";
import {agOn,invList,luRows,optAny,pactWeapon,saveNotes,wisElse,wmAll,xdmgRows,ycOf} from "./10-logic-v17-additions.js";
import {fxToggles,ATKC,__set_ATKC,abil,casterParts,classFeatures,clsLv,clsParts,featsOf,keepResKeys,resKey,resMax,slotsFor,slugK,spLists,spellAb} from "./11-logic-derivation.js";
import {__R} from "./00-reg.js";
import {runSheet} from "./12a-logic-sheet-registry.js";
import "./12c-logic-sheet-handlers-core.js";
import "./12d-logic-sheet-handlers-skills.js";
import "./12e-logic-sheet-handlers-defense.js";
import "./12f-logic-sheet-handlers-movement.js";
import "./12g-logic-sheet-handlers-profs.js";
import "./12h-logic-sheet-handlers-attacks.js";
import "./12i-logic-sheet-handlers-gear-resources.js";
import "./12j-logic-sheet-handlers-features.js";
import "./12k-logic-sheet-handlers-spells.js";
import "./12l-logic-sheet-handlers-late.js";
import "./11c-logic-fx-handlers-sheet.js";
import {spellRows,appVer,xsk,setInTS,inTS,speciesDef,bgDef,armorDef} from "./00-env.js";
Object.defineProperty(__R,"toSheet",{get:function(){return toSheet;},set:function(v){toSheet=v;},configurable:true});
/* ---------- export to sheet (v3) ---------- */
export var ACM=[];/* v27 i2: AC methods of the last toSheet, for the builder */
/* the pure reads a handler may ask for (state.q): the old code reached them through __R and the helpers of 01 to 11 */
const QRY={byOk:byOk,subLv:subLv,subLbl:subLbl,sdn:sdn,allFeats:allFeats,getPbAdd:getPbAdd,fxToggles:fxToggles,xfxSenses:function(C){XFX.senses(C)},setProfc:function(C){if(C.profs)__R.PROFC=C.profs},spellAb:spellAb,spFxTo:spFxTo,spClsJ:spClsJ,spLists:spLists,miFeats:function(){return __R.miFeats()},autoSpells:function(){return typeof __R.autoSpells==="function"?__R.autoSpells():[]},spItemB:spItemB,spItemSrc:spItemSrc,featSpells:featSpells,dmSpells:dmSpells,enabledPacks:function(){return __R.enabledPacks()},hbPickOk:hbPickOk,agOn:agOn,pactInvocation:function(n){return PACTB14.filter((x) =>{return x[0]===n})[0]},spTraitText:spTraitText,htText:htText,spLinTrait:spLinTrait,calcNote:function(n,c,l,a){return __R.calcNote(n,c,l,a)},defenses:function(a){return __R.defenses(a)},ycOf:ycOf,invList:invList,withItemContext:function(attacks,profs,fn){try{__set_ATKC(attacks);if(profs)__R.PROFC=profs;return fn()}finally{__set_ATKC(null)}},/* RL31, RL36 b: item texts read the attack rows built so far */
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
/* solid:orchestrator toSheet */
export function toSheet(){
 /* every field group and class rule is a handler registered in 12c-12l (contract in 12a-logic-sheet-registry.js); this function only builds the inputs and runs the phases */
 const T=sheetInputs();
 runSheet(T);
 ACM=T.l.acm;/* v27 i2 */
 QRY.setProfc(T.C);/* the profs object of the finished sheet (item texts read it) */
 return T.C}
