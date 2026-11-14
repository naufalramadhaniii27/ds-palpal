import {withHornValhallaProjection,hornValhallaProjectionMirror} from './10i-logic-horn-valhalla.js';
import {withBagTricksProjection,bagTricksProjectionMirror} from './10h-logic-bag-tricks.js';
import {withStudyBooksProjection,studyBooksProjectionMirror,withStudyBooksLegacy} from './10g-logic-study-books.js';
import {withNecronomiconProjection,necronomiconProjectionMirror,withNecronomiconLegacy} from "./10f-logic-necronomicon-reading.js";
import {bindLive} from "./01b-logic-late-ports.js";import {ABK,ABN,SRC,chJoin,dieAvg,getPbAdd,mod,pbOf,applyWieldScoreCustomization,projectTemporaryCantrips,tattooBodyProblems,spellGemCastsProblems,storedSpellCastsProblems} from "./01-logic-core-helpers.js";
import {spellGemCatalogForRuleset} from "./09c-logic-edition-overlays.js";
import {withAllPurposeLegacy,DMAP,activeFx,attMax,bgX,byOk,htText,spX,attunementState,itemInUse,itemMagicBonus} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {CL,R14} from "./05-logic-choice-model-ruleset.js";
import {PACTB14,sdn,subLbl,subLv} from "./08-logic-2014-rules.js";
import {XFX,collectItemSpellDamageFeatures,wxProvenAbility,allFeats,gxPicks,bgTl,chOf,choices,dmSpells,featSpells,grantTools,hbPickOk,kitTool,sbWx,spClsJ,spFxTo,spItemB,spItemSrc,spLinTrait,spTraitText,subAt,toolChoices} from "./09-logic-feats-and-choices.js";
import {agOn,invList,luRows,historicalInterventionWishBinding,optAny,pactWeapon,saveNoteRows,wisElse,wmAll,xdmgRows,ycOf} from "./10-logic-v17-additions.js";
import {fxTargets,fxToggles,ATKC,__set_ATKC,fxCh,fxList,fxOk,fxVal,abilScores,casterParts,classFeatures,clsLv,clsParts,featsOf,keepResKeys,resKey,resMax,slotsFor,slugK,spLists,spellAb} from "./11-logic-derivation.js";

import {MCL,TL,baseOf,effArmor,effShield,effWeps,hpCalc,packSkills,spOptFx,subGrant,syncPickItems} from "./01b-logic-late-ports.js";
import {QRY,provideQueries} from "./01a-logic-query-registry.js";
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
import "./12m-logic-sheet-handlers-tools.js";
import "./12n-logic-sheet-handlers-turn-damage.js";
import "./12o-logic-sheet-handlers-cleric-powers.js";
import "./12p-logic-sheet-handlers-disciple.js";
import "./12q-logic-sheet-handlers-casting-sources.js";
import "./12r-logic-sheet-handlers-gem-checks.js";
import "./12s-logic-sheet-handlers-item-spell-damage.js";
import "./12t-logic-necronomicon-reading.js";
import "./11c-logic-fx-handlers-sheet.js";
import {spellRows,classDef,appVer,xsk,setInTS,inTS,speciesDef,bgDef,armorDef,sheetState,genv} from "./00-env.js";
bindLive("toSheet",{get:function(){return toSheet;}});
/* ---------- export to sheet (v3) ---------- */
export var ACM=[];/* v27 i2: AC methods of the last toSheet, for the builder */
/* the pure reads a handler may ask for (state.q): the old code reached them through __R. Functions of 09 and 11 are imported; the modules that load later (13, 14, 16, 20) provide theirs with provideQueries (01a-logic-query-registry.js) */
provideQueries({hornValhalla:hornValhallaProjectionMirror,bagTricks:bagTricksProjectionMirror,studyBooks:studyBooksProjectionMirror,necronomiconReading:necronomiconProjectionMirror,"itemSpellDamageFeatures":collectItemSpellDamageFeatures,itemSpellCatalog:spellGemCatalogForRuleset,wxProvenAbility:wxProvenAbility,classDef:classDef,itemInUse:itemInUse,itemMagicBonus:itemMagicBonus,byOk:byOk,subLv:subLv,subLbl:subLbl,sdn:sdn,allFeats:allFeats,getPbAdd:getPbAdd,fxToggles:fxToggles,fxTargets:fxTargets,xfxSenses:function(C){XFX.senses(C)},setProfc:function(C){if(C.profs)QRY.profcSet(C.profs)},spellAb:spellAb,spFxTo:spFxTo,spClsJ:spClsJ,spLists:spLists,spItemB:spItemB,spItemSrc:spItemSrc,featSpells:featSpells,dmSpells:dmSpells,hbPickOk:hbPickOk,agOn:agOn,pactInvocation:function(n){return PACTB14.filter((x) =>{return x[0]===n})[0]},spTraitText:spTraitText,htText:htText,spLinTrait:spLinTrait,ycOf:ycOf,invList:invList,withItemContext:function(attacks,profs,fn){try{__set_ATKC(attacks);if(profs)QRY.profcSet(profs);return fn()}finally{__set_ATKC(null)}},/* RL31, RL36 b: item texts read the attack rows built so far */
 itemHtml:function(n,x){if(inTS())return null;setInTS(1);try{return {html:QRY.itemDetail(n,x)}}finally{setInTS(0)}},
 kitTool:kitTool,
 resMax:resMax,resKey:resKey,luRows:luRows,historicalInterventionWishBinding:historicalInterventionWishBinding,slugK:slugK,keepResKeys:keepResKeys,featsOf:featsOf,saveNotesOf:function(f){return saveNoteRows(f)},xdmgRows:xdmgRows,
 bgTl:bgTl,optAny:optAny,gxPicks:gxPicks,fxCh:fxCh,fxv:fxVal,subAt:subAt,chOf:chOf,wisElse:wisElse,clsLv:clsLv,spX:spX,bgX:bgX,
 xfxSkills:function(feats,p,prof,exp){XFX.skills(feats,p,prof,exp)},xfxPost:function(C,a){XFX.post(C,a)},xfxLang:function(lg){XFX.lang(lg)},
 pactWeapon:pactWeapon,fxOk:fxOk,casterParts:casterParts,dmapRow:function(n){return DMAP[n]},sbWx:function(sub,cls){return typeof sbWx==="function"?sbWx(sub,cls):null}});
/* the inputs of a build: read once, in the order the old code read them (abilScores() settles pbAdd before pb is taken) */
function ownedWieldCustomization(){const st=sheetState();if(!st||!st.C||st.C.name!==B.name)return {};const id=genv.__sheetId&&genv.__sheetId();if(!B.cid||!id||B.cid!==id)return {};return st.cust||{}}
function ownedTemporaryCantrips(){const st=sheetState(),id=genv.__sheetId&&genv.__sheetId();return st&&st.C&&st.C.name===B.name&&B.cid&&id===B.cid?st.temporaryCantrips:undefined}
function stagedTattooBodyValid(staged,current){return !!(staged&&Object.keys(staged).length===3&&staged.character===current.C&&staged.state===current.state&&!tattooBodyProblems(staged.body).length)}
function ownedLegacyItemSpellHistory(current,body){return !!((body&&!tattooBodyProblems(body).length&&body.tattoos.length)||(current.state&&current.state.spellGemCasts&&!spellGemCastsProblems(current.state.spellGemCasts).length&&current.state.spellGemCasts.casts.length))}
function ownedStoredSpellHistory(options,current){if(options&&options.storedSpellLegacy===true)return false;const planned=options&&Object.prototype.hasOwnProperty.call(options,'storedSpellProjection'),value=planned&&options.storedSpellProjection;if(planned&&(!value||Object.keys(value).length!==3||value.character!==current.C||value.state!==current.state))return false;const casts=planned?value.casts:current.state&&current.state.storedSpellCasts;return !!(casts&&!storedSpellCastsProblems(casts).length&&casts.casts.length)}
function ownedItemSpellBodyPresent(options){const st=sheetState(),id=genv.__sheetId&&genv.__sheetId();if(!st||!st.C||st.C.name!==B.name||!B.cid||id!==B.cid)return false;const planned=options&&Object.prototype.hasOwnProperty.call(options,'tattooBodyProjection'),staged=planned&&options.tattooBodyProjection;if(planned&&!stagedTattooBodyValid(staged,st))return false;const body=planned?staged.body:st.state&&st.state.spellwroughtTattoos;return ownedLegacyItemSpellHistory(st,body)||ownedStoredSpellHistory(options,st)}
function sheetInputs(options){
 syncPickItems();/* fx pick t:"item": chosen items join the inventory before anything reads it */
 const c=CL(),L=B.level,TLv=TL(),a=abilScores(),pb=pbOf(TLv),sp=speciesDef(B.species),custom=B.species==="Custom";
 const spName=custom?(B.cSpecies.name||"Custom species"):B.species;
 const subName=B.sub==="__custom"?(B.cSub||"Homebrew subclass"):B.sub;
 const bg=bgDef(B.bg),feats=allFeats();
 const hpList=hpCalc().list.map((e) =>{return {v:e.v,c:e.c,r:e.r,n:e.n}});
 const G=fxList(),CH=choices(),SG=subGrant(B.sub),parts=clsParts();
 const wieldScores=options&&Object.prototype.hasOwnProperty.call(options,"wieldScores")?options.wieldScores:applyWieldScoreCustomization(a.sc,options&&Object.prototype.hasOwnProperty.call(options,"customization")?options.customization:ownedWieldCustomization());
 const EA=effArmor(),ESH=effShield(),EW0=effWeps(wieldScores),BO=baseOf(EA),ar=armorDef(BO.b),mcl=MCL(),ATT=attunementState(),AFX=activeFx(ATT),EAp=itemMagicBonus(EA,BO,AFX),SFX=spOptFx(),XT=toolChoices(CH).concat(grantTools(feats)),wmSet=wmAll(),cfList=classFeatures().filter((x) =>{return !(R14()&&x[1]==="Weapon Mastery")}),slotsForNow=slotsFor();
 const SM={};spellRows().forEach((x) =>{SM[x[0]]=x});
 const temporalState=options&&Object.prototype.hasOwnProperty.call(options,"temporaryCantrips")?options.temporaryCantrips:ownedTemporaryCantrips(),nativeClasses=[...new Set(spellRows().flatMap(x=>x[3]||[]).filter(k=>classDef(k)))],temporaryCantrips=projectTemporaryCantrips(temporalState,spellRows(),nativeClasses,"Artificer");
 return {i:{storedSpellLegacy:!!(options&&options.storedSpellLegacy===true),itemSpellBodyPresent:ownedItemSpellBodyPresent(options),temporaryCantrips:temporaryCantrips,SM:SM,invs:chJoin(B.ch,/invocation$/),B:B,c:c,L:L,TLv:TLv,a:a,wieldScores:wieldScores,pb:pb,sp:sp,custom:custom,spName:spName,subName:subName,bg:bg,feats:feats,hpList:hpList,appVer:appVer(),SRC:SRC,r14:R14(),G:G,CH:CH,SG:SG,parts:parts,packSkills:packSkills(),xsk:xsk(),EA:EA,ESH:ESH,EW0:EW0,EAp:EAp,ar:ar,mcl:mcl,ATT:ATT,AFX:AFX,SFX:SFX,attMax:attMax(),XT:XT,wmSet:wmSet,cfList:cfList,slotsFor:slotsForNow},q:QRY,C:{},l:{},parts:parts}}
/* solid:orchestrator toSheet */
export function toSheet(options={}){
 /* every field group and class rule is a handler registered in 12c-12l (contract in 12a-logic-sheet-registry.js); this function only builds the inputs and runs the phases */
 const render=function(){const T=sheetInputs(options);
 runSheet(T);
 ACM=T.l.acm;/* v27 i2 */
 QRY.setProfc(T.C);/* the profs object of the finished sheet (item texts read it) */
 return T.C};const legacy=()=>options.necronomiconLegacy===true?withNecronomiconLegacy(render):render(),studyLegacy=()=>options.studyBooksLegacy===true?withStudyBooksLegacy(legacy):legacy(),project=()=>options&&options.allPurposeLegacy?withAllPurposeLegacy(studyLegacy):studyLegacy(),reading=()=>Object.prototype.hasOwnProperty.call(options,'necronomiconReading')?withNecronomiconProjection(options.necronomiconReading,project):project();const study=()=>Object.prototype.hasOwnProperty.call(options,'studyBooks')?withStudyBooksProjection(options.studyBooks,reading):reading();const bag=()=>Object.prototype.hasOwnProperty.call(options,'bagTricks')?withBagTricksProjection(options.bagTricks,study):study();return Object.prototype.hasOwnProperty.call(options,'hornValhalla')?withHornValhallaProjection(options.hornValhalla,bag):bag()}
