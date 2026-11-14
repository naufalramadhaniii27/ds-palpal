import {storedSpellProfile} from "./01-logic-core-helpers.js";
import {nativeCantripDefinition} from "../data/lib/temporary-cantrip-projection.js";
import {invList,bindLive,lateGet,__set_openCards,__set_pickCls,__set_pickSp,__set_step,__set_clsTab,choiceStep,ruleIssues,spInfo,spInfoPart,spellCounts,itemDetail,itemType,ctFree,invFind,qbBook,qbFill,qbMI,qbSpells,quickBuild,unpackAt,copyOf,go,own,render,stamp} from "./01b-logic-late-ports.js";import {genv,weaponDef,spellRows} from "./00-env.js";
import {ABK,clone,toast} from "./01-logic-core-helpers.js";
import {BLANK,DMAP,NEWB,cleanCh,itemFx,un,getBorrowedCantripInfo,prepareAllPurposeSources,splitBorrowedCantrip,reviewBorrowedCantrip,getRiddenVehicleInfo,changeRiddenVehicle,splitRiddenVehicleRow} from "./03-logic-magic-item-effects.js";
import {B,__set_B,loadB,save,saveBak,savedRaw} from "./04-logic-storage.js";
import {R14,rsLoad} from "./05-logic-choice-model-ruleset.js";
import {RL14,subLv} from "./08-logic-2014-rules.js";import {CLS14} from "./06-data-2014-classes.js";import {long14,long24,full14 as full14Of} from "./06b-data-2014-long-text.js";
import {choices} from "./09-logic-feats-and-choices.js";
import {bookNeed,bookOf,bookOwn,isDone,pactWeapon} from "./10-logic-v17-additions.js";
import {fxtSet,casterParts,manualLost,spLists,spToggle,fxList,fxListBase} from "./11-logic-derivation.js";
import {FX_FIELDS,fxEntryProblems} from "./10e-logic-fx-schema.js";
import {allFxHandlers,fxPhases,fxSources,registerFxHandler,fxRuleTables} from "./10a-logic-fx-registry.js";
import {allSheetHandlers,SHEET_PHASES,registerSheetGroup,registerSheetRule,makeCtx,applyPatch} from "./12a-logic-sheet-registry.js";
import {SHEET_C,SHEET_L,patchProblems} from "./12b-logic-sheet-schema.js";
import {toSheet} from "./12-logic-export-to-sheet.js";
import {BASE,applyPacks,autoSpellList,snap} from "./13-logic-sources-and-packs.js";
import {allPackSteps,registerPackStep,PACK_PHASES,PACK_TABLES} from "./13a-logic-pack-registry.js";
import {queryNames} from "./01a-logic-query-registry.js";
import {baseOf,ensureInv,equippable,itemCost,itemW,rebuildKit} from "./14-logic-multiclass-hp-shop.js";
import {fromSheet} from "./15-logic-import-from-sheet.js";





import {blankC,unList} from "./23-logic-level-up-and-build-files.js";

bindLive("bldMine",{get:function(){return bldMine;}});
bindLive("choiceList",{get:function(){return choiceList;}});
bindLive("withB",{get:function(){return withB;}});
/* v32 RU134: open a pack of the build into its container and items. soft: rebuild the sheet from the build. false: not this character, not a pack, or Qty 0 */
genv.__bldUnpack=function(name,owner,occ,soft){ensureInv();if(!own(owner))return false;const i=invFind(name,occ);if(i<0||!unpackAt(i))return false;save();if(soft&&genv.__sheetSoft)genv.__sheetSoft(toSheet());if(!document.getElementById("bld").hidden)render();return true};
genv.__itemMeta=function(n){const c=[n],pm=/\(([^)]+)\)/.exec(n);if(pm)c.push(pm[1]);for(let k=0;k<c.length;k++){const b=baseOf(c[k]).b;if(WEAPONS[b]||ARMOR[b]||b==="Shield"||DMAP[c[k]]||itemCost(b)!=null){let html="";genv.__inTS=1;try{html=itemDetail(c[k],{n:c[k]})}catch(e){}genv.__inTS=0;return {txt:DMAP[c[k]]&&typeof DMAP[c[k]][4]==="string"?DMAP[c[k]][4]:"",type:itemType(c[k]),cost:itemCost(b),w:itemW(c[k]),equippable:equippable(c[k])||!!(DMAP[c[k]]&&DMAP[c[k]][1]!=="Potion"),html:html,cost:PRICE[c[k]]!=null?PRICE[c[k]]:itemCost(b),/* v20 M1 */att:!!(DMAP[c[k]]&&DMAP[c[k]][3])}}}return null};
/* N2: keep the saved build in step with a hand-filled sheet of the same character, without replacing the sheet (no __sheetSoft).
   ch: {eq:true|false} | {q:n} | {del:1}. Item by name, then by alias ("Celurit (Sickle)"). Other owner or unknown item: nothing, false */
function physicalSyncAllowed(it,name,occ){for(const [field,port]of [['timedDefenses','__timedDefensesInventoryWriteAllowed'],['magicRopes','__magicRopesInventoryWriteAllowed'],['birdToken','__birdTokenInventoryWriteAllowed'],['defender','__defenderInventoryWriteAllowed'],['hornValhalla','__hornValhallaInventoryWriteAllowed'],['bagTricks','__bagTricksInventoryWriteAllowed'],['studyBook','__studyBookInventoryWriteAllowed'],['slotRecovery','__slotRecoveryInventoryWriteAllowed']])if(Object.prototype.hasOwnProperty.call(it,field)&&(!genv[port]||!genv[port](name,occ)))return false;return true}
function recoverySyncAllowed(it,name,ch){if(!ch.del&&ch.q==null)return true;if(!physicalSyncAllowed(it,name,ch.occ))return false;return !(storedSpellProfile(it.key||it.n)||Object.prototype.hasOwnProperty.call(it,"storedSpells"))||!!(genv.__storedInventoryWriteAllowed&&genv.__storedInventoryWriteAllowed(name,ch.occ))}
genv.__bldSync=function(name,owner,ch){ensureInv();if(!ch||!own(owner))return false;const i=invFind(name,ch.occ);if(i<0)return false;const it=B.inv[i];if(!recoverySyncAllowed(it,name,ch))return false;if(ch.del){ctFree(it);B.inv.splice(i,1)}else if(ch.q!=null)it.q=Math.max(0,Math.floor(+ch.q)||0);else if(ch.in!==undefined){if(ch.in)it.in=ch.in;else delete it.in}/* RU35 no. 8 */else if(ch.eq!=null){it.eq=!!ch.eq;if(it.eq&&ARMOR[baseOf(it.n).b])B.inv.forEach((y,k) =>{if(k!==i&&ARMOR[baseOf(y.n).b])y.eq=false})}else return false;save();return true};
/* N1: what a builder-made sheet P has that toSheet() would not produce now: named attacks and resources the builder does not make (Logic manualLost),
   then other sections whose values differ (Edit changes, or builder changes not applied yet). [] if P matches, or P is another character */
const DIFFL={name:"Name",species:"Species",size:"Size",cls:"Class",clsLabel:"Class",sub:"Subclass",bg:"Background",level:"Level",hitDie:"Hit Points",hpPerLevel:"Hit Points",hpBonus:"Hit Points",office:"Campaign",cardNo:"Record number",rolledNote:"Roll record",abilities:"Ability scores",saves:"Saving throws",skills:"Skills",initBonus:"Initiative",ac:"Armor Class",speed:"Speed",speedSrc:"Speed",darkvision:"Darkvision",darkSrc:"Darkvision",senses:"Senses",profs:"Proficiencies",attacks:"Attacks",inv:"Inventory",gp:"Gold",equipNote:"Equipment note",res:"Limited Use",actions:"Actions",features:"Features",defenses:"Defenses",spellcasting:"Spells",spells:"Spells",lang:"Languages",grappler:"Grappler",dcAb:"Grapple DC",dcSrc:"Grapple DC"};
/* __bldDiff steps (SOLID s16) */
function bdJ(x){return JSON.stringify(x===undefined?null:x)}
function bdJf(x){return bdJ((x||[]).filter((g) =>{return !/^Species/.test(g.g)}))}
function bdField(k,P,N,lost,oth){if(k==="v"||k==="_app"||k==="bv")return;/* v27 RU28: C.bv is the builder version */if((+P._app||0)>(genv.__appVer||0)&&!(k in N))return;/* v18 RL47: fields of a newer version stay on Apply */const l=DIFFL[k]||k;if(oth.indexOf(l)>=0)return;if((k==="attacks"&&lost.attacks.length)||(k==="res"&&lost.res.length))return;if(k==="features"?bdJf(P[k])!==bdJf(N[k]):bdJ(P[k])!==bdJ(N[k]))oth.push(l)}
genv.__bldDiff=function(P){if(!P||!own(P.name))return [];const N=toSheet(),lost=manualLost(P,N),out=[],oth=[];/* V14-8 */if(lost.attacks.length)out.push("Attacks: "+lost.attacks.join(", "));if(lost.res.length)out.push("Limited Use: "+lost.res.join(", "));Object.keys(P).concat(Object.keys(N)).forEach((k) =>{bdField(k,P,N,lost,oth)});if(oth.length)out.push("Other changes: "+oth.join(", "));return out};
/* Reproject only a builder-owned, otherwise unchanged sheet after Customize crosses a wield threshold. */
function wieldRefreshOwner(owner,P){const id=genv.__sheetId&&genv.__sheetId();return !!(P&&owner===P.name&&B.name===owner&&B.cid&&id&&B.cid===id&&own(owner)&&genv.__sheetSoft)}
function wieldPreviousInfo(P,row,index){const prev=(P.inv||[])[index],info=prev&&prev.wieldInfo;if(!row.key||!prev||prev.key!==row.key||!info||bdJ(info.rule)!==bdJ(row.wieldInfo.rule)||!Array.isArray(info.checks)||!info.checks.length)return null;return info}
function wieldPreviousChecks(oldScores,row,info){for(const check of row.wieldInfo.checks||[]){const before=info.checks.find(x=>x.ability===check.ability&&x.minimum===check.minimum);if(!before||!Number.isFinite(before.actual)||Object.prototype.hasOwnProperty.call(oldScores,check.ability)&&oldScores[check.ability]!==before.actual)return false;oldScores[check.ability]=before.actual}return true}
function wieldPreviousScores(P,N){const oldScores={},restricted=(N.inv||[]).map((row,index)=>({row,index})).filter(x=>x.row.wieldInfo&&x.row.wieldInfo.rule);if(!restricted.length)return null;for(const {row,index} of restricted){const info=wieldPreviousInfo(P,row,index);if(!info||!wieldPreviousChecks(oldScores,row,info))return null}return oldScores}
function wieldProjectionChanged(P,O){if(bdJ(P.features)!==bdJ(O.features))return true;const lost=manualLost(P,O),other=[];Object.keys(P).concat(Object.keys(O)).forEach(k=>{bdField(k,P,O,lost,other);if(k!=="v"&&k!=="_app"&&k!=="bv"&&!(k in O)&&bdJ(P[k])!==bdJ(O[k])&&other.indexOf(k)<0)other.push(k)});return !!(lost.attacks.length||lost.res.length||other.length)}
genv.__bldRefreshWield=function(owner){
 const st=genv.__sheetState&&genv.__sheetState(),P=st&&st.C;
 if(!wieldRefreshOwner(owner,P))return {ok:false,reason:"owner"};
 const N=toSheet(),oldScores=wieldPreviousScores(P,N);
 if(!oldScores)return {ok:false,reason:"metadata"};
 if(wieldProjectionChanged(P,toSheet({wieldScores:oldScores})))return {ok:false,reason:"manual"};
 genv.__sheetSoft(N);return {ok:true};
};
function toolFormWriteGuard(owner){const st=genv.__sheetState&&genv.__sheetState(),P=st&&st.C;if(!wieldRefreshOwner(owner,P))return {ok:false,reason:"owner"};applyPacks();const project=()=>toSheet(),candidate=genv.__xl&&typeof genv.__xl.withSelf==="function"?genv.__xl.withSelf("",project):project();if(wieldProjectionChanged(P,candidate))return {ok:false,reason:"manual"};return {ok:true}}
bindLive("toolFormWriteGuard",{get:function(){return toolFormWriteGuard;}});
bindLive("inventoryWriteGuard",{get:function(){return toolFormWriteGuard;}});
/* v18 RU74: the build was saved in another tab: load it here */
genv.__bldReload=function(){__set_B(loadB());applyPacks();if(!document.getElementById("bld").hidden)render()};
/* v25 RU38 no. 3: Manage Spells on the sheet. The caster parts of the build that belongs to the open character (null: no such build) */
function bldMine(){const st=genv.__sheetState&&genv.__sheetState();return !!(st&&st.C&&savedRaw()!=null&&own(st.C.name))}
/* fx engine v6 test hook: the slot table the builder spell step shows (with slotAdd), for the build that is set with __bldTestSet */genv.__bldSpellSlots=function(){const I=spInfo();return I&&I.SA&&I.SA.slots?{slots:I.SA.slots.slice(),add:(I.SA.slots.fxAdd||[]).map((x) =>{return [x[0],x[1],x[2]]})}:null};
genv.__bldSpInfo=function(){if(!bldMine())return null;const CP=casterParts();if(!CP.length)return null;const SLs=spLists();
 return {parts:CP.map((p) =>{const K=spInfoPart(p)||{ct:0,pr:0,max:0,lists:[p.list]},o={cls:p.cls,ct:K.ct,pr:K.pr,kn:K.kn||0,max:K.max,lists:K.lists,taken:(SLs[p.cls]||[]).slice()};if(p.cls==="Wizard"){o.book=bookOf();o.bookO=bookOwn().length;o.bookN=bookNeed()}return o}),/* v32: Wizard spellbook */auto:autoSpellList().map((a) =>{return a.n})}};
/* on: the spell is chosen for that class. soft: rebuild the sheet from the build (only when the sheet matches the build) */
genv.__bldSpSet=function(n,cls,on,soft){if(!bldMine())return false;const L=spLists();if(((L[cls]||[]).indexOf(n)>=0)!==!!on)spToggle(n,cls);save();if(soft&&genv.__sheetSoft)genv.__sheetSoft(toSheet());if(!document.getElementById("bld").hidden)render();return true};
/* v25 RU38 no. 6: Hit Points fixed (average) or rolled, from Settings. m null: read */
genv.__bldRs=function(){return R14()};genv.__bldXl=function(){return casterParts().map((q) =>{return {cls:q.cls,list:q.list,ab:q.ab,xl:q.xl}})};/* fx engine v4 test hook: caster parts with their spell lists */genv.__bldSpCnt=function(){return casterParts().map((q) =>{const K=spInfoPart(q);return K&&{cls:q.cls,ct:K.ct,pr:K.pr,kn:K.kn,max:K.max}}).filter(Boolean)};genv.__bldSpMsgs=function(){return spellCounts().map((m) =>{return m.m})};/* v92: test hooks */genv.__rl14=function(){return RL14};genv.__bldSpTest=function(n,o){snap();const s=JSON.parse(BASE.sp);if(o)s[n]=o;else delete s[n];BASE.sp=JSON.stringify(s);applyPacks()};/* v82 test hook */genv.__bldMine=bldMine;/* v27 RU28 */
/* v32 RL49: every choice of the build with its state. Spell picks of the Spells tab come from spellCounts (key "spell:...") */
function choiceList(){const cs=choices().map((c) =>{return {key:c.key,t:c.t,n:c.n||1,title:c.title,src:c.src,feature:c.feature||"",lvl:c.lvl,mc:c.mc,fk:c.fk||"",cats:c.cats||null,from:c.from&&c.from.length?(typeof c.from[0]==="string"?c.from:c.from.map((x) =>{return x[0]})):null,list:c.list&&typeof c.list!=="string"?c.list.map((x) =>{return Array.isArray(x)?x[0]:x}):c.list?(OPTS[c.list]||[]).map((x) =>{return x[0]}):null,done:isDone(c),step:choiceStep(c)}});
 spellCounts().forEach((x) =>{if(x.open)cs.push({key:"spell:"+(x.key||x.m),t:"spell",n:x.n||1,title:x.m,feature:x.f||"",done:false,step:"class"})});
 casterParts().forEach((p) =>{if(p.xl&&p.xl.length)cs.push({key:"lists:"+p.cls,t:"lists",n:p.xl.length,list:p.xl,title:p.cls+" extra spell lists",feature:"Magical Secrets",done:true,step:"class"})});/* tests only: Magical Secrets */
 return cs}
function withB(b,fn){const keep=B;if(!b)return fn();try{const x=structuredClone(b);for(const k in BLANK)if(x[k]==null)x[k]=clone(BLANK)[k];__set_B(cleanCh(x));applyPacks();return fn()}finally{__set_B(keep);applyPacks()}}
genv.__bldChoiceList=function(b){return withB(b,choiceList)};genv.__bldHasSpell=function(n){return !!lateGet("SMAP")[n]&&!!SPELL_FULL[n]};genv.__bldItems=function(b){return withB(b,() =>{return DMGI.map((r) =>{return r[0]})})};genv.__bldQLive=function(b){return withB(b,() =>{const o={};Object.keys(genv.QLIVE||{}).forEach((c) =>{o[c]=genv.QLIVE[c].map((r) =>{return r.n})});return o})};/* test hooks: magic item names and Library reference rows while build b is open */
genv.__bldFeats=function(b){return withB(b,() =>{return Object.keys(FEATS)})};/* test hook: the feat names while build b is open (third party feats follow their source) */
/* v32 RL49 no. 10d, tests only: show build b in the open builder without saving it (null: back to the saved build), and go to a step */
let TKEEP=null;genv.__bldTestSet=function(b){if(b){if(!TKEEP)TKEEP=B;const x=structuredClone(b);for(const k in BLANK)if(x[k]==null)x[k]=clone(BLANK)[k];__set_B(cleanCh(x))}else if(TKEEP){__set_B(TKEEP);TKEEP=null}applyPacks();__set_openCards({});render()};
genv.__bldTestB=function(){return structuredClone(B)};genv.__bldTestItems=function(){return {dmgi:DMGI.map((x) =>{return x[0]}),gear:GEAR.map((x) =>{return x[0]}),weapons:Object.keys(WEAPONS),armor:Object.keys(ARMOR),price:typeof PRICE!=="undefined"?Object.keys(PRICE):[],spells:SPELLS.map((x) =>{return x[0]})}};/* v100: test hook for the audits *//* v95: test hook */genv.__bldTestGo=function(s){__set_step(s);__set_pickCls(false);__set_pickSp(false);__set_clsTab("feat");render()};
/* v32 RU137: open choices of the build that belongs to the open character, same number as "Still to choose" in What's Next. 0 = none or no build */
function openCount(){if(unList())return [["cls"],["species"],["bg"]].filter((x) =>{return un(x[0])}).length;
 return choices().filter((x) =>{return !isDone(x)}).length+ruleIssues().filter((x) =>{return x.open}).length}
let OCC={k:null,v:0};
genv.__bldOpenCount=function(b){try{if(b)return withB(b,openCount);if(!bldMine())return 0;const k=JSON.stringify(B);if(OCC.k!==k)OCC={k:k,v:openCount()};return OCC.v}catch(e){return 0}};
genv.__bldHpMode=function(m,soft){if(!bldMine())return null;if(m==null)return B.hpMode==="roll"?"roll":"avg";B.hpMode=m==="roll"?"roll":"avg";save();if(soft&&genv.__sheetSoft)genv.__sheetSoft(toSheet());return B.hpMode};
genv.__bldHas=function(name,owner){ensureInv();return own(owner)&&B.inv.some((x) =>{return x.n===name})};
/* RL40: the sheet name was edited (Edit form). The saved build of the same character takes the new name */
genv.__bldRename=function(from,to){if(!to||B.name===to||!own(from)||savedRaw()==null)return false;B.name=to;save();return true};
/* fx engine v3b: toggle fx. The sheet keeps the state in S.fxT {id:bool} and exposes it as window.__sheetState().fxT. This hook rebuilds the sheet of the saved build after a toggle changed. (id,on) may be given when S.fxT is not written yet. Returns false: not a builder-made sheet */
genv.__bldFxToggle=function(id,on){const st=genv.__sheetState&&genv.__sheetState();if(!st||!st.C||!own(st.C.name))return false;const m=Object.assign({},st.fxT||{});if(id!=null)m[id]=!!on;fxtSet(m);try{if(genv.__sheetSoft)genv.__sheetSoft(toSheet())}finally{fxtSet(null)}return true};
/* Masterwork flag of an inventory row (B.inv[].mw, copied to C.inv[].mw). Counts for cond mwArmor while the armor is worn */
/* Pact of the Blade on the sheet: which melee weapons can be bonded, which one is, and a setter that keeps the builder choice (B.ch.pactWep) in step */
genv.__bldPactInfo=function(){if(invList().indexOf("Pact of the Blade")<0)return null;return {cur:pactWeapon(),melee:ensureInv().filter((x) =>{const w=weaponDef(baseOf(x.n).b);return !!w&&w.k==="M"}).map((x) =>{return x.n})}};
genv.__bldSetPact=function(name){if(!genv.__bldPactInfo()||genv.__bldPactInfo().melee.indexOf(name)<0)return false;B.ch=B.ch||{};B.ch.pactWep=[name];save();if(genv.__sheetSoft)genv.__sheetSoft(toSheet());return true};
genv.__bldSetMw=function(name,occ,on){ensureInv();const i=invFind(name,occ);if(i<0)return false;if(on)B.inv[i].mw=1;else delete B.inv[i].mw;save();if(genv.__sheetSoft)genv.__sheetSoft(toSheet());return true};
genv.__bldEquip=function(){genv.__bldOpen();go("equip")};
/* v23 RU38 no. 4: Manage Proficiencies and Manage Feats open the builder at a step */
genv.__bldGo=function(s){genv.__bldOpen();if(document.querySelector("#bld > .exp:not(#exp)"))return;if(lateGet("STEPS").some((x) =>{return x[0]===s}))go(s)};
/* RU29: armor or Shield equipped or unequipped on a hand-filled sheet (items without key). st = sheet state before the change.
   Saved build of the same character: it takes the change (as __bldSync). No saved build yet: a copy imported from the sheet is used, not saved.
   Returns {b0,b1,off}: AC, Speed, Stealth of the build before and after, and other armor taken off. null: not armor, not in the build, or another character */
/* __bldArmor steps (SOLID s16) */
function baPick(){const c=toSheet(),s=(c.skills||[]).filter((k) =>{return k.n==="Stealth"})[0];return {ac:c.ac,speed:c.speed,speedSrc:c.speedSrc,stealth:s&&s.dis||"",sb:c.saveBonus||[],ab:c.abilities}}
function baIndex(name,keep){ensureInv();let i=B.inv.findIndex((x) =>{return x.n===name});if(i<0)i=B.inv.findIndex((x) =>{return x.alias===name});
  /* RU31: armor typed into the Edit form after the build was saved: it joins the build too (as N2), so a later Apply keeps it */
  if(i<0&&!keep){B.inv.push({n:name,q:1,eq:false});i=B.inv.length-1}/* V14-1: full name, so "Shield, +1" keeps its +1 */return i}
function baWear(i,eq){const b0=baPick(),it=B.inv[i],off=[];it.eq=!!eq;if(it.eq&&ARMOR[baseOf(it.n).b])B.inv.forEach((y,k) =>{if(k!==i&&ARMOR[baseOf(y.n).b]&&y.eq){y.eq=false;off.push(y.n);if(y.alias)off.push(y.alias)}});
   return {b0:b0,b1:baPick(),off:off}}
genv.__bldArmor=function(st,name,eq){const bn=baseOf(name).b;if(!st||!st.C||!(ARMOR[bn]||bn==="Shield"||itemFx(name)))return null;/* M18: magic items with numbers too */let raw=savedRaw(),keep=null,out=null;
 if(raw==null){keep=B;fromSheet(st)}else if(!own(st.C.name))return null;
 try{const i=baIndex(name,keep);
  if(i>=0)out=baWear(i,eq);
 }finally{if(keep){__set_B(keep);applyPacks()}else if(out)save()}
 return out};
if(genv.__sheetRerender)setTimeout(genv.__sheetRerender,0);
if(genv.__publicFresh&&!__store.getItem("cs-new")){genv.__publicFresh=0;__set_B(NEWB());stamp();save();applyPacks();if(genv.__sheetApply)genv.__sheetApply(blankC(),false)}/* v24 p08 */
if(__store.getItem("cs-new")){__store.removeItem("cs-new");__set_B(NEWB());stamp();save();applyPacks();if(genv.__sheetApply)genv.__sheetApply(blankC());setTimeout(() =>{genv.__bldOpen();go("home");/* T11 Learn F3: Forge Your Hero asked for a Quick Build of this new character */let fg=null;try{fg=JSON.parse(sessionStorage.getItem("cs-forge")||"null");sessionStorage.removeItem("cs-forge")}catch(e){}if(fg&&fg.cls&&QUICK[fg.cls]){if(fg.name)B.name=fg.name;quickBuild(fg.cls,fg.sp)}},50)}
applyPacks();render();

/* T11 N6: rules fuzzer hooks. __bldLists gives the 2024 classes, species, backgrounds and subclasses. __bldFuzz builds one character from the given picks
   (class, species, background, standard array order, level, subclass), fills the remaining choices the Quick Build way, and returns the build, the sheet
   object, the rule issues and the unfinished list. The open build is put back afterwards, nothing is saved */
genv.__bldLists=function(rs){if(rs==="2014")return bldLists14();const subs={};Object.keys(CLASSES).forEach((c) =>{subs[c]=Object.keys(CLASSES[c].subs||{})});return {cls:Object.keys(QUICK).filter((c) =>{return CLASSES[c]}),sp:Object.keys(SPECIES).filter((s) =>{return !/\(2014\)$/.test(s)&&s!=="Custom"&&!SPECIES[s].hb}),bg:Object.keys(BACKGROUNDS).filter((b) =>{return !/\(2014\)$/.test(b)&&(BACKGROUNDS[b].ab||[]).length===3&&!BACKGROUNDS[b].hb}),subs:subs,arr:QUICK[Object.keys(QUICK)[0]].arr.slice().sort((a,b) =>{return b-a})}};
/* tests/pdfx_sweep.py: the 2014 lists, the same as the PHB 2014 and DMG 2014 entries of the Sources step */
function bldLists14(){const P=(genv.WX?WX.src:[]).filter((q) =>{return q.id==="phb14"||q.id==="dmg14"}), pick=(k) =>{let o=[];P.forEach((q) =>{o=o.concat(q[k]||[])});return o};
 const S14=pick("subs"),w={},subs={};(genv.WXS||[]).forEach((x) =>{w[x.name]=x.cls});Object.keys(CLS14).forEach((c) =>{Object.keys(CLS14[c].subs||{}).forEach((n) =>{w[n]=w[n]||c})});
 S14.forEach((n) =>{const c=w[n];if(c)(subs[c]=subs[c]||[]).push(n)});
 return {cls:Object.keys(QUICK).filter((c) =>{return CLASSES[c]&&CLS14[c]&&c!=="Artificer"}),sp:pick("species"),bg:pick("backgrounds"),subs:subs,src:{phb14:true,dmg14:true},arr:QUICK[Object.keys(QUICK)[0]].arr.slice().sort((a,b) =>{return b-a})}}
/* test hook (tests/mech_scan.py, tests/audit_logic.py): every rules table with all sources on, as plain JSON. Read only, the open build is put back */
genv.__bldData=function(){const b=structuredClone(BLANK);b.name="Data";b.cls="Fighter";b.level=1;b.src={core:true,dmg:true,efa:true};(genv.WX&&genv.WX.src||[]).forEach((x) =>{b.src[x.id]=true});
 return withB(b,() =>{const J=function(o){return JSON.parse(JSON.stringify(o===undefined?null:o))};return {classes:J(CLASSES),cf:J(typeof CF_FULL!=="undefined"?CF_FULL:{}),sub:J(typeof SUB_FULL!=="undefined"?SUB_FULL:{}),feats:J(FEATS),species:J(SPECIES),bgs:J(BACKGROUNDS),dmgi:J(DMGI),wxi:J(genv.WXI||{}),auto:J(typeof AUTO!=="undefined"?AUTO:{}),lu:J(typeof LU_X!=="undefined"?LU_X:[]),acts:J(typeof ACTS!=="undefined"?ACTS:{}),saveNotes:J(typeof SAVE_NOTES!=="undefined"?SAVE_NOTES:[]),clsAuto:J(typeof CLS_AUTO!=="undefined"?CLS_AUTO:{}),spAuto:J(typeof SP_AUTO!=="undefined"?SP_AUTO:{}),subGrant:J(typeof SUB_GRANT!=="undefined"?SUB_GRANT:{}),wxs:J(genv.WXS||[]).map(function(x){delete x.arr;delete x.full;return x}),srcOf:(function(){const o={species:{},feats:{},items:{},cls:{}};(genv.WX&&genv.WX.src||[]).forEach((x) =>{(x.species||[]).forEach((n) =>{o.species[n]=x.id});(x.feats||[]).forEach((n) =>{o.feats[n]=x.id});(x.items||[]).forEach((n) =>{o.items[n]=x.id})});Object.keys(genv.WXC||{}).forEach((n) =>{o.cls[n]=genv.WXC[n].book});return o})()}})};
genv.__bldFull14=full14Of;genv.__bldLong14=(g,n,rs)=>rs==="2024"?long24(g,n):long14(g,n);/* the PDF export reads it for sheets made before the builder stored `full` */
genv.__bldFuzz=function(o){let keep=B,out=null;try{__set_B(NEWB());if(o.rs==="2014"){B.rs="2014";rsLoad("2014");}/* tests/pdfx_sweep.py: the 2014 rules, the way the edition switch sets them */B.name="Fuzz";B.cls=o.cls;B.sub="";B.level=1;B.mc=[];if(o.src)B.src=Object.assign({},B.src,o.src);/* tests/invariants.py: extra sources */applyPacks();B.species=o.sp;B.method="array";B.arr={};ABK.forEach((k,i) =>{B.base[k]=o.arr[i];B.arr[k]=String(o.arr[i])});
  const bg=BACKGROUNDS[o.bg],ab=bg.ab||[];B.bg=o.bg;B.bgMode=o.rs==="2014"?"111":"21";if(o.rs!=="2014"){B.bg2=ab[o.b2%3];B.bg1=ab[(o.b2+1+(o.b1%2))%3];}/* 2014: no background ability scores */B.eqC="A";B.eqB="A";B.ch={};delete B.unset;rebuildKit(1);
  B.level=o.lv;if(o.sub&&(o.lv>=subLv(o.cls)||o.anySub))B.sub=o.sub;/* 2014: some subclasses start at level 1 or 2 */applyPacks();qbFill();qbSpells();qbMI();qbBook();qbFill();
  out={b:structuredClone(B),c:toSheet({customization:{}}),ri:ruleIssues().map((x) =>{return typeof x==="string"?x:JSON.stringify(x)}),un:unList()||""}}catch(e){out={err:String(e&&e.stack||e)}}__set_B(keep);return out};
/* test hook (tests/zero_miss_measure.py): fills the open choices of a given build the Quick Build way (picks, spells, magic item, book) on a copy. Nothing saved, the open build is put back */
genv.__bldFillFor=function(b){let keep=B,out=null;try{__set_B(structuredClone(b));applyPacks();qbFill();qbSpells();qbMI();qbBook();qbFill();out=structuredClone(B)}catch(e){out=null}finally{__set_B(keep);applyPacks()}return out};
genv.__bldToast=toast;/* T11 N11: messages from the sheet code while the builder is open */
/* T11 G4 N1 Reverse Builder: the lists it may try (the rules set of this build only), and a way to take a found build into the builder */
/* the build of the open character without opening the builder: the saved one when it is this character's, otherwise made from the sheet (like Build does) */
function bldForSheet(){const st=genv.__sheetState&&genv.__sheetState();if(!st||!st.C)return null;let raw=savedRaw(),keep=B,out=null;
 try{if(raw!=null){const b=JSON.parse(raw);__set_B(b);if(own(st.C.name)||copyOf(st.C.name)){out=b}}if(!out){fromSheet(st);out=structuredClone(B)}}catch(e){out=null}finally{__set_B(keep);applyPacks()}return out}
genv.__bldForSheet=bldForSheet;
genv.__bldOpts=function(){const r14=B.rs==="2014",ok=function(k){return r14?/\(2014\)/.test(k):!/\(2014\)/.test(k)};const bg={};Object.keys(BACKGROUNDS).filter(ok).forEach((k) =>{bg[k]={ab:(BACKGROUNDS[k].ab||[]).slice(),sk:(BACKGROUNDS[k].sk||[]).slice()}});
 const b0=bldForSheet()||structuredClone(B);return {b:b0,species:Object.keys(SPECIES).filter(ok),bg:bg,armor:structuredClone(ARMOR),r14:r14}};
genv.__bldUse=function(nb,why){const now=JSON.stringify(B);saveBak(now);const b=structuredClone(nb);for(const k in BLANK)if(b[k]==null)b[k]=clone(BLANK)[k];__set_B(cleanCh(b));stamp();save();applyPacks();genv.__bldOpen();go("abil");toast((why||"Build changed")+". The old build is kept as the backup build.")};
/* G7 TG1 Try a class: the Quick Build of a class at a level, made on a copy (nothing saved, the open build is put back). Spells, choices and
   the kit are filled the way Quick Build fills them, so a caster has its spells */
genv.__bldQuickFor=function(cls,lv){const Q=QUICK[cls];if(!Q)return null;let keep=B,out=null;
 try{__set_B(NEWB());B.cls=cls;B.sub="";B.level=1;B.mc=[];applyPacks();B.species=SPECIES.Human?"Human":B.species;B.method="array";B.arr={};ABK.forEach((k,i) =>{B.base[k]=Q.arr[i];B.arr[k]=String(Q.arr[i])});
  B.bg=BACKGROUNDS[Q.bg]?Q.bg:B.bg;B.bgMode="21";B.bg2=Q.b2;B.bg1=Q.b1;B.eqC="A";B.eqB="A";B.ch={};delete B.unset;rebuildKit(1);B.level=Math.max(1,Math.min(20,lv|0||1));applyPacks();qbFill();qbSpells();qbMI();qbBook();out=structuredClone(B)}
 catch(e){out=null}finally{__set_B(keep);applyPacks()}return out};
/* SOLID stage 1 test hook (tests/solid_contract.py): the handler registries, the sources, the phase names and the effect list of the build set with __bldTestSet. Read only, no stored data */
genv.__fxRegistry=function(){return {handlers:{entry:allFxHandlers("entry"),ability:allFxHandlers("ability"),"sheet":allFxHandlers("sheet")},phases:{entry:fxPhases("entry"),ability:fxPhases("ability"),"sheet":fxPhases("sheet")},sources:fxSources(),rules:fxRuleTables(),register:registerFxHandler,gfx:function(noItem){return noItem?fxListBase():fxList()},"sheet":{groups:allSheetHandlers("group"),rules:allSheetHandlers("rule"),phases:SHEET_PHASES.slice(),registerGroup:registerSheetGroup,registerRule:registerSheetRule,makeCtx:makeCtx,applyPatch:applyPatch,schema:{C:SHEET_C,l:SHEET_L},patchProblems:patchProblems},entrySchema:{fields:FX_FIELDS,problems:fxEntryProblems},pack:{steps:allPackSteps(),phases:PACK_PHASES.slice(),tables:PACK_TABLES,register:registerPackStep},queries:queryNames()}};

/* Drink one available item. The sheet commits the same boolean switch after this
   succeeds. Rebuilding with the override keeps the effect after the last bottle. */
genv.__bldConsume=function(id){const st=genv.__sheetState&&genv.__sheetState();
 if(!st||!st.C||!own(st.C.name)||(st.fxT||{})[id])return false;
 const e=fxList().find((x) =>x.consume&&x.toggle&&x.toggle.id===id);if(!e)return false;
 const it=(B.inv||[]).find((x) =>x.n===e.owner&&+x.q>0);if(!it)return false;
 it.q=Math.max(0,Math.floor(+it.q)-1);save();
 fxtSet(Object.assign({},st.fxT||{},{[id]:true}));try{if(genv.__sheetSoft)genv.__sheetSoft(toSheet())}finally{fxtSet(null)}return true};

/* Source adoption uses an exact legacy projection; manual sheets never get replaced. */
function borrowedBound(owner){const st=genv.__sheetState&&genv.__sheetState();return st&&wieldRefreshOwner(owner,st.C)&&st.state&&st.state.used&&typeof st.state.used==="object"&&!Array.isArray(st.state.used)?{st,C:st.C,S:st.state,B}:null}
function borrowedSignature(bound){return JSON.stringify([bound.B,bound.C,bound.S])}
function borrowedCurrent(owner,bound,signature){const current=borrowedBound(owner);return !!(current&&current.B===bound.B&&current.C===bound.C&&current.S===bound.S&&borrowedSignature(current)===signature)}
function borrowedProjection(options={}){const project=()=>toSheet(options);return genv.__xl&&typeof genv.__xl.withSelf==="function"?genv.__xl.withSelf("",project):project()}
function borrowedOccupied(bound){return Array.from(new Set((bound.C.res||[]).map(row=>row.k).concat(Object.keys(bound.S.used)).filter(key=>typeof key==="string"&&key.length>0&&key.trim()===key)))}
function borrowedProof(bound){const inv=bound.C.inv||[],rows=bound.B.inv||[];return rows.flatMap((row,index)=>{const old=inv[index],name=row.n;if(!old||(old.key||old.n)!==name||(row.q==null?1:row.q)!==1||rows.filter(x=>x.n===name).length!==1)return [];const pools=(bound.C.res||[]).filter(pool=>pool.item&&pool.invIndex===index&&pool.f===name&&pool.max===1&&pool.k===old.chargeKey);return pools.length===1?[{index,name,chargeKey:pools[0].k}]:[]})}
function borrowedBefore(owner,bound,signature,beforeCommit){if(!borrowedCurrent(owner,bound,signature))return false;if(typeof beforeCommit==="function"){const result=beforeCommit();if(result===false||result&&typeof result.then==="function")return false}return borrowedCurrent(owner,bound,signature)}
function borrowedPlan(rows,registry){const next=clone(B);next.inv=rows;next.allPurposeSources=registry;return {build:next,projection:withB(next,()=>borrowedProjection())}}
genv.__bldAdoptBorrowedCantrips=function(owner,beforeCommit=undefined){const bound=borrowedBound(owner);if(!bound)return {ok:false,reason:"owner"};applyPacks();const candidate=borrowedProjection({allPurposeLegacy:!Object.prototype.hasOwnProperty.call(B,"allPurposeSources")});if(wieldProjectionChanged(bound.C,candidate))return {ok:false,reason:"manual"};const signature=borrowedSignature(bound),result=prepareAllPurposeSources(borrowedProof(bound),borrowedOccupied(bound));if(!result.ok)return result;const plan=borrowedPlan(result.rows,result.registry);if(!borrowedBefore(owner,bound,signature,beforeCommit))return {ok:false,reason:"stale"};__set_B(plan.build);save();genv.__sheetSoft(plan.projection);return {ok:true}};
function borrowedExpected(name,owner,occ,expected){const bound=borrowedBound(owner);if(!bound)return {ok:false,reason:"owner"};const guard=toolFormWriteGuard(owner);if(!guard.ok)return guard;const index=invFind(name,occ),info=getBorrowedCantripInfo(index);if(!expected||expected.index!==index||expected.signature!==info.signature)return {ok:false,reason:"stale"};return {ok:true,bound,index,info,signature:borrowedSignature(bound)}}
genv.__bldBorrowedCantripInfo=function(name,owner,occ){const bound=borrowedBound(owner);if(!bound)return {bound:false,available:false,reason:"owner"};ensureInv();const index=invFind(name,occ),info=getBorrowedCantripInfo(index),guard=toolFormWriteGuard(owner);return Object.assign({},info,{index,bound:guard.ok},guard.ok?{}:{available:false,reason:guard.reason})};
genv.__bldSplitBorrowedCantrip=function(name,owner,occ,expected,beforeCommit=undefined){const current=borrowedExpected(name,owner,occ,expected);if(!current.ok)return current;const result=splitBorrowedCantrip(current.index,borrowedOccupied(current.bound));if(!result.ok)return result;const plan=borrowedPlan(result.rows,result.registry);if(!borrowedBefore(owner,current.bound,current.signature,beforeCommit))return {ok:false,reason:"stale"};__set_B(plan.build);save();genv.__sheetSoft(plan.projection);return {ok:true,index:result.index,splitIndex:result.splitIndex}};
// Both the review flag and the native daily-use counter commit in this synchronous transaction.
genv.__bldReviewBorrowedCantrip=function(name,owner,declaration,occ,expected,beforeCommit=undefined){const current=borrowedExpected(name,owner,occ,expected);if(!current.ok)return current;const result=reviewBorrowedCantrip(current.index,declaration);if(!result.ok)return result;if(typeof genv.__temporaryCantripSave!=="function")return {ok:false,reason:"storage"};const rows=B.inv.slice();rows[current.index]=result.row;const plan=borrowedPlan(rows,B.allPurposeSources);if(!borrowedBefore(owner,current.bound,current.signature,beforeCommit))return {ok:false,reason:"stale"};__set_B(plan.build);current.bound.S.used[result.chargeKey]=result.usedValue;save();genv.__temporaryCantripSave(current.bound.S);genv.__sheetSoft(plan.projection);return {ok:true,chargeKey:result.chargeKey,usedValue:result.usedValue}};

const TEMPORARY_REFRESH_TOKENS=new WeakSet();
genv.__bldPrepareTemporaryRefresh=function(){const owner=genv.__sheetName&&genv.__sheetName(),bound=borrowedBound(owner);if(!bound||!toolFormWriteGuard(owner).ok)return null;const token={owner,B:bound.B,C:bound.C,S:bound.S,cid:B.cid,buildSignature:JSON.stringify(B)};TEMPORARY_REFRESH_TOKENS.add(token);return token};
genv.__bldRefreshTemporaryCantrips=function(token){if(!token||!TEMPORARY_REFRESH_TOKENS.has(token))return {ok:false,reason:"token"};TEMPORARY_REFRESH_TOKENS.delete(token);const bound=borrowedBound(token.owner);if(!bound||bound.B!==token.B||bound.C!==token.C||bound.S!==token.S||B.cid!==token.cid||JSON.stringify(B)!==token.buildSignature)return {ok:false,reason:"stale"};genv.__sheetSoft(borrowedProjection());return {ok:true}};

// Explicit class and Magic Initiate selections establish known cantrips; other uncertain origins need the UI declaration.
function borrowedKnownNames(){const known=new Set(),lists=spLists();Object.keys(lists).forEach(key=>(lists[key]||[]).forEach(name=>known.add(name)));Object.keys(B.pk||{}).filter(key=>/^mi/.test(key)).forEach(key=>((B.pk[key]||{}).c||[]).forEach(name=>known.add(name)));return known}
genv.__bldTemporaryCantripChoices=function(){const owner=genv.__sheetName&&genv.__sheetName(),bound=borrowedBound(owner);if(!bound||!toolFormWriteGuard(owner).ok)return [];const rows=spellRows(),classKeys=Object.keys(CLASSES),known=borrowedKnownNames();return rows.flatMap(row=>{const definition=nativeCantripDefinition(rows,row[0],classKeys);return definition?[Object.assign({spell:definition.n,cantripOnClassList:true,definitelyKnown:known.has(definition.n)},definition)]:[]})};

function riddenVehicleIndex(name,occ){if(typeof name!=="string"||!name||occ!==undefined&&(!Number.isInteger(occ)||occ<0))return -1;let left=occ||0;return (B.inv||[]).findIndex(row=>row.n===name&&left--===0)}
function riddenVehicleExpected(name,owner,occ,expected){const bound=borrowedBound(owner);if(!bound)return {ok:false,reason:"owner"};const guard=toolFormWriteGuard(owner);if(!guard.ok)return guard;ensureInv();const index=riddenVehicleIndex(name,occ),info=getRiddenVehicleInfo(index);if(!expected||expected.index!==index||expected.signature!==info.signature)return {ok:false,reason:"stale"};return {ok:true,bound,index,info,signature:borrowedSignature(bound)}}
function riddenVehiclePlan(rows){const next=clone(B);next.inv=rows;return {build:next,projection:withB(next,()=>borrowedProjection())}}
genv.__bldRiddenVehicleInfo=function(name,owner,occ){const bound=borrowedBound(owner);if(!bound)return {bound:false,available:false,reason:"owner"};ensureInv();const index=riddenVehicleIndex(name,occ),info=getRiddenVehicleInfo(index),guard=toolFormWriteGuard(owner);return Object.assign({},info,{index,bound:guard.ok},guard.ok?{}:{available:false,activationAvailable:false,endAvailable:false,splitAvailable:false,reason:guard.reason})};
function mutateRiddenVehicle(name,owner,change,occ,expected,beforeCommit,split){const current=riddenVehicleExpected(name,owner,occ,expected);if(!current.ok)return current;const result=split?splitRiddenVehicleRow(current.index,change):changeRiddenVehicle(current.index,change);if(!result.ok)return result;const rows=split?result.rows:B.inv.map((row,index)=>index===current.index?result.row:row),plan=riddenVehiclePlan(rows);if(!borrowedBefore(owner,current.bound,current.signature,beforeCommit))return {ok:false,reason:"stale"};__set_B(plan.build);save();genv.__sheetSoft(plan.projection);return {ok:true,index:current.index,splitIndex:result.splitIndex}}
genv.__bldSetRiddenVehicle=function(name,owner,change,occ,expected,beforeCommit=undefined){return mutateRiddenVehicle(name,owner,change,occ,expected,beforeCommit,false)};
genv.__bldSplitRiddenVehicle=function(name,owner,change,occ,expected,beforeCommit=undefined){return mutateRiddenVehicle(name,owner,change,occ,expected,beforeCommit,true)};
// Shared strict physical-source transaction primitives; callers must revalidate before every write.
export {borrowedBound,borrowedSignature,borrowedCurrent,borrowedBefore,borrowedProjection,toolFormWriteGuard,withB,wieldProjectionChanged};
