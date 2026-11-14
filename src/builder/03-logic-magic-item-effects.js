import {spellGemProfile} from "../data/lib/spell-gem.js";
import {casterParts,clsLv,lateGet,subAt} from "./01b-logic-late-ports.js";import {clone} from "./01-logic-core-helpers.js";

import {baseOf,fxListBase,miFeats} from "./01b-logic-late-ports.js";
import {gx,fxo} from "./00-env.js";
import {allocateAttunement,itemInUse,itemQuantity,migrateItems,migrateAttunement,itemOverrideProblems} from "../data/lib/attunement.js";
import {weaponFormMetadata,migrateInventoryForms,setWeaponFormActive,adjustWeaponFormRadius,weaponFormUsable,weaponFormLight} from "../data/lib/weapon-form.js";
import {carpetMetadata,normalizeVehicleState,migrateVehicles,chooseCarpetSize,activateCarpet,carpetSourceStatus} from "../data/lib/carpet-vehicle.js";
import {toolFormMetadata,normalizeToolForm,migrateToolForms,selectToolForm} from "../data/lib/tool-form.js";
import {allPurposeMetadata,normalizeAllPurposeSource,normalizeAllPurposeRegistry,migrateAllPurposeSources,allPurposeSourceStatus,reviewAllPurposeSource,splitAllPurposeSource} from "../data/lib/all-purpose-source.js";
import {riddenVehicleMetadata,riddenVehicleProfile,migrateRiddenVehicles,activateRiddenVehicle,endRiddenVehicle,splitRiddenVehicle} from "../data/lib/ridden-vehicle.js";
import {nativeWieldMinimum,evaluateWieldMinimum,explainWieldMinimum} from "../data/lib/wield-minimum.js";
export {itemInUse,itemQuantity};
export var DMAP={};DMGI.forEach((x) =>{DMAP[x[0]]=x});
/* M18 (v16): constant numbers of a magic item (DMGI[5].fx) while it is used, and attuned when it needs attunement. Only 3 attuned items count
   (a creature can be attuned to at most 3 magic items). Armor and Shield bonuses (+N) come from the item name as before */
/* V16-1: a named magic weapon or armor has its base items in DMGI[5].base (first = default). "Holy Avenger (Greatsword)" picks another base: alias rows in DMAP */
export function dmapAlias(){DMGI.forEach((x) =>{const b=itemBases(x);if(b&&b.length>1)b.forEach((o) =>{const k=x[0]+" ("+o+")";if(!DMAP[k])DMAP[k]=x})})}dmapAlias();
/* Item overrides replace fx or base metadata without changing source prose.
   unattunedBonus is a flat attack/damage bonus explicitly retained without attunement. */
function itemOverride(d){const F=fxo(),n=d&&d[0],o=F&&Object.prototype.hasOwnProperty.call(F,n)?F[n]:undefined;
 if(o!=null){const bad=itemOverrideProblems(o);if(bad.length)throw new Error(n+": "+bad.join("; "))}return o}
export function ovFx(d){const o=itemOverride(d);return o&&("fx" in o)?(o.fx||null):(d&&d[5]&&d[5].fx||null)}
export function itemFx(n){const d=DMAP[n];return d?ovFx(d):null}
/* v19 RL43: Thief 13 Use Magic Device: four attuned items. RL42: an item that needs attunement by a class, species, or spellcaster the character is not
   gives nothing (byOk). "a Dwarf, or anyone attuned to a Belt of Dwarvenkind" also counts the belt */
let ATT_BUSY=false,ATT_LAST=0;
export function attMax(){let m=subAt("Rogue","Thief")>=13?4:3,al=clsLv("Artificer");if(al>=18)m=Math.max(m,6);else if(al>=14)m=Math.max(m,5);else if(al>=10)m=Math.max(m,4);/* fx engine v4: attune:N on a class, subclass, species, background or feat entry (gfx without items, so no loop with activeFx), or on an equipped item entry (GX.item) raises the limit to N */if(ATT_BUSY)return Math.max(m,ATT_LAST);/* re-entered through gfx: use the last finished value */ATT_BUSY=true;try{fxListBase().forEach((e) =>{if(e.attune>m)m=e.attune});const GI=gx().item||{};(lateGet("B").inv||[]).forEach((x) =>{if(x.eq&&itemQuantity(x)>0)(GI[x.n]||[]).forEach((e) =>{if(e&&e.attune>m)m=e.attune})});ATT_LAST=m}catch(er){}finally{ATT_BUSY=false}return m}/* v90: Magic Item Adept, Savant and Master */
export function byOk(by,attunedKeys){if(!by)return true;const s=String(by),cls=Object.keys(CLASSES).filter((c) =>{return s.toLowerCase().indexOf(c.toLowerCase())>=0});/* case does not matter: the data rows write "warlock" and "Warlock" both */
 if(/^(?:an?\s+)?artificer\.?$/i.test(s.trim()))return clsLv("Artificer")>0;
 if(/Belt of Dwarvenkind/.test(s)&&beltAttuned(attunedKeys))return true;
 if(cls.length)return cls.some((c) =>{return clsLv(c)>0});if(/Spellcaster/i.test(s))return casterParts().length>0||miFeats().length>0;
 const sp=Object.keys(SPECIES).filter((n) =>{return new RegExp("\\b"+n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b","i").test(s)});if(sp.length)return sp.indexOf(lateGet("B").species)>=0;return true}
export function attunementMeta(n){const d=DMAP[n];return d?{key:d[0],requires:!!d[3],...(spellGemProfile(d[0])?{optional:true}:{}),by:d[5]&&d[5].by}:{requires:false,key:n,...(spellGemProfile(n)?{optional:true}:{})}}
export function migrateItemAttunement(x){return migrateAttunement(x,attunementMeta(x.n))}
function formMetadataFor(row,edition){const d=DMAP[row.n];return weaponFormMetadata(d?d[0]:row.n,edition)}
function canonicalForm(row,formMeta){const f=row.form;if(!f||typeof f!=="object"||Array.isArray(f))return false;if(Object.prototype.hasOwnProperty.call(f,"v")&&f.v!==1)return true;if(f.v!==1||typeof f.active!=="boolean")return false;const l=formMeta.light;return Number.isInteger(f.radius)&&f.radius>=l.min&&f.radius<=l.max&&(l.adjustable?(f.radius-l.min)%l.step===0:f.radius===l.default)}
/* Normalize only the passed character. A modern inventory keeps its row and array
   identities on repeated ensureInv calls; legacy form intent is seeded once. */
export function migrateInventory(b){if(!b||typeof b!=="object"||!Array.isArray(b.inv))return b;b.inv=migrateItems(b.inv,attunementMeta);b.inv=migrateToolForms(b.inv).rows;b.inv=migrateRiddenVehicles(migrateVehicles(b.inv));
 const version=b.inventoryFormV;if(version!==undefined&&version!==0&&version!==1)return b;
 const edition=b.rs==="2014"?"2014":"2024",items=b.inv;
 if(version===1&&(!Array.isArray(items)||items.every(row=>{if(!row||typeof row!=="object")return true;const formMeta=formMetadataFor(row,edition);return !formMeta||canonicalForm(row,formMeta)})))return b;
 const result=migrateInventoryForms(items,version,row=>formMetadataFor(row,edition),row=>!!row.eq&&itemQuantity(row)>0&&row.attuned===true);
 if(Array.isArray(items)&&Array.isArray(result.rows)){const next=result.rows.map((row,i)=>JSON.stringify(row)===JSON.stringify(items[i])?items[i]:row);if(next.some((row,i)=>row!==items[i]))b.inv=next}
 b.inventoryFormV=result.version;return b}
export function attunementState(){return allocateAttunement(lateGet("B").inv||[],attMax(),attunementMeta,(m,x,keys)=>byOk(m.by,keys))}
function beltAttuned(keys){return (keys||new Set(attunementState().keys)).has("Belt of Dwarvenkind")}
export function itemBases(d){const o=itemOverride(d),b=o&&Object.prototype.hasOwnProperty.call(o,"base")?o.base:d&&d[5]&&d[5].base;return Array.isArray(b)?b:null}
/* Scores are supplied by the current actor's completed ability calculation.
   This boundary never calls abilScores or changes independent item properties. */
/* Carpet records belong to one physical inventory item, independently of worn gear. */
function vehicleDefault(definition){return {v:1,active:false,size:definition.size}}
function vehicleKeepChoice(raw,definition){return Object.keys(raw).length!==3||raw.v!==1||raw.active!==false||raw.size!==definition.size}
export function itemVehicleInfoForRow(row){const name=row&&(row.n||row.key),d=DMAP[name],definition=carpetMetadata(d?d[0]:name);if(!definition)return {available:false,reason:"not-supported"};const state=normalizeVehicleState(row.vehicle),q=row.q==null?1:Number(row.q),valid=!!state&&(!definition.size||definition.size===state.size),split=valid&&Number.isSafeInteger(q)&&q>1,source=carpetSourceStatus(row);return {available:source.ok,reason:source.reason||"",vehicle:clone(row.vehicle),vehicleMeta:definition,action:definition.activation,signature:JSON.stringify(row),splitAvailable:split,requiresKeepChoice:!!state&&vehicleKeepChoice(row.vehicle,definition)}}
export function getVehicleInfo(index){const b=migrateInventory(lateGet("B"));if(!Number.isInteger(index)||index<0||!b.inv||!b.inv[index])return {available:false,reason:"missing"};return Object.assign({index:index},itemVehicleInfoForRow(b.inv[index]))}
function commitVehicle(index,next,beforeCommit){if(typeof beforeCommit==="function"&&beforeCommit()===false)return {ok:false,reason:"stale"};lateGet("B").inv[index].vehicle=next;return {ok:true,info:getVehicleInfo(index)}}
export function setDMsize(index,size,beforeCommit=undefined){const info=getVehicleInfo(index);if(!info.available)return {ok:false,reason:info.reason,info};if(info.vehicleMeta.size)return {ok:false,reason:"fixed-size",info};const next=chooseCarpetSize(info.vehicle,size);return next?commitVehicle(index,next,beforeCommit):{ok:false,reason:"size",info}}
export function activateVehicle(index,declarations,beforeCommit=undefined){const info=getVehicleInfo(index);if(!info.available)return {ok:false,reason:info.reason,info};const next=activateCarpet(lateGet("B").inv[index],declarations);return next?commitVehicle(index,next,beforeCommit):{ok:false,reason:"declaration",info}}
function splitVehicleChoice(info,change){if(!change||typeof change!=="object"||Array.isArray(change)||Object.keys(change).some(k=>k!=="keepRecordedWith"))return null;const choice=change.keepRecordedWith;if(choice!==undefined&&choice!=="original"&&choice!=="split")return null;if(info.requiresKeepChoice&&!choice)return null;return choice||"original"}
export function splitVehicleOne(index,change={},beforeCommit=undefined){const info=getVehicleInfo(index);if(!info.splitAvailable)return {ok:false,reason:info.reason||"split-required",info};const choice=splitVehicleChoice(info,change);if(!choice)return {ok:false,reason:"keep-choice",info};const b=lateGet("B"),row=b.inv[index],original=clone(row),split=clone(row);original.q=Number(row.q)-1;split.q=1;if(choice==="split")original.vehicle=vehicleDefault(info.vehicleMeta);else split.vehicle=vehicleDefault(info.vehicleMeta);if(typeof beforeCommit==="function"&&beforeCommit()===false)return {ok:false,reason:"stale",info};b.inv.splice(index,1,original,split);return {ok:true,index:index,splitIndex:index+1,info:getVehicleInfo(index)}}
/* Tool shape is independent of weapon form, equip state and other item properties. */
export function itemToolFormInfoForRow(row,state){const name=row&&(row.n||row.key),d=DMAP[name],definition=toolFormMetadata(d?d[0]:name);if(!definition)return {available:false,reason:"not-supported"};const raw=row.toolForm,form=normalizeToolForm(raw),reason=!form?"version":itemQuantity(row)<=0?"no-item":!(state&&state.attuned)?"attunement":"";return {available:!reason,reason:reason,toolForm:clone(raw),toolFormMeta:definition,toolFormUsable:!reason,action:definition.action,signature:JSON.stringify(row)}}
export function getItemToolFormInfo(index){const b=migrateInventory(lateGet("B"));if(!Number.isInteger(index)||index<0||!b.inv||!b.inv[index])return {available:false,reason:"missing"};return Object.assign({index:index},itemToolFormInfoForRow(b.inv[index],attunementState().rows[index]))}
export function setItemToolForm(index,change,beforeCommit=undefined){const info=getItemToolFormInfo(index);if(!info.available)return {ok:false,reason:info.reason,info:info};if(!change||typeof change!=="object"||Array.isArray(change)||Object.keys(change).length!==2||!Object.prototype.hasOwnProperty.call(change,"tool")||change.touch!==true)return {ok:false,reason:"change",info:info};const next=selectToolForm(info.toolForm,change.tool,{touch:true});if(!next)return {ok:false,reason:"change",info:info};if(typeof beforeCommit==="function"&&beforeCommit()===false)return {ok:false,reason:"stale",info:info};lateGet("B").inv[index].toolForm=next;return {ok:true,info:getItemToolFormInfo(index)}}
export function itemWieldInfoForRow(row,scores){const name=row&&(row.n||row.key),d=DMAP[name],rule=nativeWieldMinimum(d?d[0]:name),result=evaluateWieldMinimum(rule,scores);return {rule:rule,allowed:result.allowed,unmet:result.unmet,checks:result.checks,text:explainWieldMinimum(result)}}
export function getItemWieldInfo(index,currentScores){const items=lateGet("B").inv||[];if(!Number.isInteger(index)||index<0||!items[index])return {rule:null,allowed:false,unmet:[],text:"Item unavailable."};return itemWieldInfoForRow(items[index],currentScores)}
export function itemWeaponInUse(row,status,scores){if(!itemWieldInfoForRow(row,scores).allowed)return false;const b=lateGet("B"),formMeta=formMetadataFor(row,b.rs==="2014"?"2014":"2024"),o=itemOverride(DMAP[row.n]);if(formMeta)return weaponFormUsable(row,formMeta,{equipped:!!row.eq,quantity:itemQuantity(row),attuned:!!(status&&status.attuned)},b.inventoryFormV);return !!row.eq&&itemQuantity(row)>0&&(!(o&&o.requiresAttunedWeapon)||!!(status&&status.attuned))}
export function itemFormInfoForRow(row,status,version,edition){if(!row)return {available:false,reason:"missing"};const formMeta=formMetadataFor(row,edition==="2014"?"2014":"2024");if(!formMeta)return {available:false,reason:"not-supported"};const form=Object.prototype.hasOwnProperty.call(row,"form")?clone(row.form):undefined,validVersion=(version===undefined||version===0||version===1)&&!!form&&typeof form==="object"&&!Array.isArray(form)&&form.v===1;
 const reason=!validVersion?"version":itemQuantity(row)<=0?"no-item":!row.eq?"unequipped":!(status&&status.attuned)?"attunement":"";
 return {name:row.n,version:clone(version),form:form,formMeta:clone(formMeta),formUsable:weaponFormUsable(row,formMeta,{equipped:!!row.eq,quantity:itemQuantity(row),attuned:!!(status&&status.attuned)},version),formLight:weaponFormLight(form,formMeta,version),available:!reason,reason:reason}}
export function getItemFormInfo(index){const b=migrateInventory(lateGet("B"));if(!Number.isInteger(index)||index<0||!b.inv||!b.inv[index])return {available:false,reason:"missing"};if(!formMetadataFor(b.inv[index],b.rs==="2014"?"2014":"2024"))return {index:index,available:false,reason:"not-supported"};return Object.assign({index:index},itemFormInfoForRow(b.inv[index],attunementState().rows[index],b.inventoryFormV,b.rs))}
export function setItemForm(index,change){const info=getItemFormInfo(index);if(!info.available)return {ok:false,reason:info.reason,info:info};if(!change||typeof change!=="object"||Array.isArray(change)||Object.keys(change).length!==1)return {ok:false,reason:"change",info:info};let next;
 if(Object.prototype.hasOwnProperty.call(change,"active")&&typeof change.active==="boolean")next=setWeaponFormActive(info.form,info.formMeta,change.active,info.version);
 else if(Object.prototype.hasOwnProperty.call(change,"radiusDelta")&&[-1,1].includes(change.radiusDelta)){if(!info.form.active)return {ok:false,reason:"inactive",info:info};if(!info.formMeta.light.adjustable)return {ok:false,reason:"fixed-light",info:info};next=adjustWeaponFormRadius(info.form,info.formMeta,change.radiusDelta,info.version)}else return {ok:false,reason:"change",info:info};
 const it=lateGet("B").inv[index],changed=JSON.stringify(it.form)!==JSON.stringify(next);if(changed)it.form=next;return {ok:true,changed:changed,info:getItemFormInfo(index)}}
export function itemMagicBonus(n,bo,afx){const d=DMAP[n];if(!d||afx.some((q)=>q.n===n))return bo.p;
 const o=itemOverride(d);return o&&o.unattunedBonus||0}
export function activeFx(state){const out=[],seen=new Set(),st=state||attunementState();(lateGet("B").inv||[]).forEach((x,i)=>{
 if(!itemInUse(x,st.rows[i])||seen.has(x.n))return;const d=DMAP[x.n];if(!d)return;seen.add(x.n);
 const f=ovFx(d),g=d[5]&&d[5].gx||null,bb=baseOf(x.n).b,GXI=gx().item,gi=GXI&&(GXI[x.n]||GXI[d[0]]);
 if(f||g||gi)out.push({n:x.n,mi:d[0],fx:f||{},gx:g,att:!!d[3],arm:!!(ARMOR[bb]||bb==="Shield"),t:d[1]})});return out}
export function htText(sp,size){const h=HEIGHT[sp]&&HEIGHT[sp][size];if(!h)return "";return "about "+h[0]+"\u2013"+h[1]+" ft tall (\u2248"+Math.round(h[0]*30.48)+"\u2013"+Math.round(h[1]*30.48)+" cm)"}
export var BLANK={name:"New Hero",camp:"",species:"Human",cSpecies:{name:"",speed:30,dark:0,size:"Medium"},bg:"Soldier",bgMode:"21",bg2:"",bg1:"",cls:"Fighter",sub:"",cSub:"",level:1,
 base:{STR:15,DEX:14,CON:13,INT:12,WIS:10,CHA:8},armor:"",shield:false,weps:[],ch:{},method:"manual",eqC:"A",eqB:"A",size:""};
/* RU30: a new character starts with nothing chosen. B.unset lists what the player has not chosen yet (cls, species, bg, abil, eqC, eqB).
   The values behind it stay as in BLANK, so every rule still computes, but the builder shows the choice lists and the sheet stays empty
   until the first Apply. Builds saved before v13 have no unset: nothing changes for them */
export function un(k){return !!(lateGet("B").unset&&lateGet("B").unset[k])}
/* RU32: background and species of the build, null while not chosen yet (the BLANK defaults Soldier and Human are placeholders only) */
export function bgX(){return un("bg")?null:BACKGROUNDS[lateGet("B").bg]}
export function spX(){return un("species")?null:SPECIES[lateGet("B").species]}
export function unDone(k){if(lateGet("B").unset){delete lateGet("B").unset[k];if(!Object.keys(lateGet("B").unset).length)delete lateGet("B").unset}}
export function NEWB(){const b=clone(BLANK);b.name="New Character";b.method="";b.base={STR:10,DEX:10,CON:10,INT:10,WIS:10,CHA:10};b.unset={cls:1,species:1,bg:1,abil:1,eqC:1,eqB:1};return b}
export function kitGP(t){const m=/(\d+) GP$/.exec(t||"");return m?+m[1]:0}
/* L5: fromSheet v1 to v3 wrote B.ch.feat1 (Fighter) or feat2 (Paladin, Ranger) from the Fighting Style row. No class has an ASI below level 4,
   so a featN key with N < 4 is always junk and is dropped on load. Other keys are left alone. Persisted by the next save(). */
const VALDA_FEAT_SOURCES=Object.assign(Object.create(null),{"Gambler":{alias:"Gambler (Valda 2014)",source:"tdcg",label:"TalDorei Campaign Guide",memo:"feat-source-gambler"},"Aberrant Spawn":{alias:"Aberrant Spawn (Valda 2014)",source:"tsdm",label:"Dark Matter (2024)",memo:"feat-source-aberrant-spawn"},"Proto-Man":{alias:"Proto-Man (Valda 2014)",source:"tsdm",label:"Dark Matter (2024)",memo:"feat-source-proto-man"}});
export function featSourceReview(b,name){const row=VALDA_FEAT_SOURCES[name];if(!row||!b||b.rs!=="2014"||!b.src||b.src.tvss14!==true||!b.ch)return null;const memo=b.ch[row.memo],review=memo!==row.source&&memo!=="tvss14";return review&&(b.src[row.source]===true||Object.prototype.hasOwnProperty.call(b.ch,row.memo))?row:null}
export function rememberFeatSource(b,name){const row=VALDA_FEAT_SOURCES[name];if(row&&b&&b.ch&&b.rs==="2014"&&b.src&&b.src.tvss14===true)b.ch[row.memo]=row.source}
export function migrateFeatSources(b){if(!b||b.rs!=="2014"||!b.src||b.src.tvss14!==true||!b.ch)return b;Object.keys(b.ch).forEach(key=>{const value=b.ch[key],name=value&&typeof value==="object"&&!Array.isArray(value)?value.feat:null,row=VALDA_FEAT_SOURCES[name];if(!row)return;const memo=b.ch[row.memo];if(Object.prototype.hasOwnProperty.call(b.ch,row.memo)&&memo!==row.source&&memo!=="tvss14")return;if(memo==="tvss14"||b.src[row.source]!==true&&memo!==row.source)value.feat=row.alias});return b}
export function cleanCh(b){try{const ch=b&&b.ch;if(ch)Object.keys(ch).forEach((k) =>{const m=/^feat(\d+)$/.exec(k);if(m&&+m[1]<4)delete ch[k]})}catch(e){}return migrateInventory(migrateFeatSources(b))}

/* Records a completed attunement, independently of wearing/holding the item. */
export function setItemAttuned(index,on){const b=migrateInventory(lateGet("B")),it=(b.inv||[])[index];if(!it)return {ok:false,reason:"missing"};
 if(!attunementMeta(it.n).requires&&!attunementMeta(it.n).optional)return {ok:false,reason:"not-required"};const was=it.attuned;it.attuned=!!on;
 if(on){const st=attunementState(),row=st.rows[index];if(!row||!row.attuned){it.attuned=was;return {ok:false,reason:row&&row.reason||"requirements",limit:st.limit}}}return {ok:true}}

// Legacy projection is scoped to one synchronous derivation and always restored.
let ALL_PURPOSE_LEGACY=false;
export function withAllPurposeLegacy(fn){const previous=ALL_PURPOSE_LEGACY;ALL_PURPOSE_LEGACY=true;try{return fn()}finally{ALL_PURPOSE_LEGACY=previous}}
export function allPurposeLegacy(){return ALL_PURPOSE_LEGACY}
export function allPurposeRegistryValid(b){return !!normalizeAllPurposeRegistry(b&&b.allPurposeSources)&&!migrateAllPurposeSources(b.inv,b.allPurposeSources).problems.length}
export function allPurposeResource(row,index){const b=lateGet("B");if(ALL_PURPOSE_LEGACY||!Object.prototype.hasOwnProperty.call(b,"allPurposeSources"))return null;if(!allPurposeMetadata(row&&row.n))return null;const source=normalizeAllPurposeSource(row.borrowedCantripSource),state=attunementState().rows[index];return {managed:true,active:allPurposeRegistryValid(b)&&!!source&&Number.isSafeInteger(row.q==null?1:row.q)&&(row.q==null?1:row.q)===1&&!!(state&&state.attuned),source}}
function borrowedSourceReason(valid,source,q,attuned,status){if(!valid)return "registry";if(!source)return "uninitialized";if(!Number.isSafeInteger(q)||q<1)return "quantity";if(q!==1)return "split-required";if(!attuned)return "attunement";return status.ok?"":status.reason}
export function itemBorrowedCantripInfoForRow(row,state){const b=lateGet("B"),definition=allPurposeMetadata(row&&(row.key||row.n));if(!definition||ALL_PURPOSE_LEGACY||!Object.prototype.hasOwnProperty.call(b,"allPurposeSources"))return {};const source=row&&normalizeAllPurposeSource(row.borrowedCantripSource),status=allPurposeSourceStatus(row,b.allPurposeSources),valid=allPurposeRegistryValid(b),q=row.q==null?1:row.q,attuned=!!(state&&state.attuned),reason=borrowedSourceReason(valid,source,q,attuned,status);return {borrowedCantripMeta:definition,available:!reason,reason,signature:JSON.stringify(row),sourceId:source&&source.id,chargeKey:source&&source.chargeKey,reviewRequired:!!(source&&source.reviewRequired),initializationAvailable:valid&&!Object.prototype.hasOwnProperty.call(row,"borrowedCantripSource"),splitAvailable:valid&&!!source&&Number.isSafeInteger(q)&&q>1}}

export function getBorrowedCantripInfo(index){const b=lateGet("B"),row=(b.inv||[])[index];if(!row||!allPurposeMetadata(row.n))return {available:false,reason:"not-supported"};if(!Object.prototype.hasOwnProperty.call(b,"allPurposeSources"))return {available:false,reason:"uninitialized",initializationAvailable:true,signature:JSON.stringify(row)};return itemBorrowedCantripInfoForRow(row,attunementState().rows[index])}
export function prepareAllPurposeSources(legacyProof,occupiedKeys){const b=lateGet("B"),result=migrateAllPurposeSources(b.inv,b.allPurposeSources,legacyProof,occupiedKeys);return result.problems.length?{ok:false,reason:result.problems[0].reason}:!result.registry?{ok:false,reason:"not-supported"}:{ok:true,rows:result.rows,registry:result.registry}}
export function reviewBorrowedCantrip(index,declaration){const b=lateGet("B"),info=getBorrowedCantripInfo(index);if(!allPurposeRegistryValid(b))return {ok:false,reason:"registry"};if(!info.reviewRequired)return {ok:false,reason:info.reason||"review-not-required"};return reviewAllPurposeSource(b.inv[index],b.allPurposeSources,declaration)}
export function splitBorrowedCantrip(index,occupiedKeys){const b=lateGet("B");return splitAllPurposeSource(b.inv,index,b.allPurposeSources,occupiedKeys)}

export function allPurposeAllocatedKeys(){const b=lateGet("B");return !ALL_PURPOSE_LEGACY&&allPurposeRegistryValid(b)?b.allPurposeSources.allocatedKeys.slice():[]}

// Vehicle metadata has no raw-row signature, so sheet and builder can share the same cold migration.
export function itemRiddenVehicleInfoForRow(row,state,edition){const nativeEdition=edition==="2014"?"2014":"2024",profile=riddenVehicleProfile(Object.assign({},row,{attunedActive:!!(state&&state.attuned)}),nativeEdition);return profile||null}
export function getRiddenVehicleInfo(index){const b=migrateInventory(lateGet("B")),row=(b.inv||[])[index];if(!row||!riddenVehicleMetadata(row.n,b.rs))return {available:false,reason:"unsupported-vehicle",index};const profile=itemRiddenVehicleInfoForRow(row,attunementState().rows[index],b.rs);return Object.assign({},profile,{index,signature:JSON.stringify(row),vehicle:clone(row.vehicle)})}
export function changeRiddenVehicle(index,change){const b=lateGet("B"),info=getRiddenVehicleInfo(index),row=(b.inv||[])[index];if(!row||!change||typeof change!=="object"||Array.isArray(change))return {ok:false,reason:"invalid-declarations"};const declarations=Object.assign({},change);let next;if(change.activate===true){if(!info.activationAvailable)return {ok:false,reason:info.reason||"already-active"};delete declarations.activate;next=activateRiddenVehicle(Object.assign({},row,{attunedActive:attunementState().rows[index].attuned}),declarations,b.rs)}else if(change.end===true){if(!info.endAvailable)return {ok:false,reason:"inactive"};delete declarations.end;next=endRiddenVehicle(row,declarations,b.rs)}if(!next)return {ok:false,reason:"invalid-declarations"};return {ok:true,row:Object.assign({},row,{vehicle:next})}}
export function splitRiddenVehicleRow(index,change){const b=lateGet("B");return splitRiddenVehicle(b.inv,index,change,b.rs)}

// Absent metadata retains the legacy projection. Any own claim, including unsupported versions, suppresses the wrong charge path without granting permission.
export function suppressGemLegacyPool(row){return !!spellGemProfile(row&&row.n)&&Object.prototype.hasOwnProperty.call(lateGet("B"),"spellGemSources")}
