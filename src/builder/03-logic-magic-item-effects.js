import {casterParts,clsLv,lateGet,subAt} from "./01b-logic-late-ports.js";import {clone} from "./01-logic-core-helpers.js";

import {baseOf,fxListBase,miFeats} from "./01b-logic-late-ports.js";
import {gx,fxo} from "./00-env.js";
import {allocateAttunement,itemInUse,itemQuantity,migrateItems,migrateAttunement,itemOverrideProblems} from "../data/lib/attunement.js";
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
 if(/Belt of Dwarvenkind/.test(s)&&beltAttuned(attunedKeys))return true;
 if(cls.length)return cls.some((c) =>{return clsLv(c)>0});if(/Spellcaster/i.test(s))return casterParts().length>0||miFeats().length>0;
 const sp=Object.keys(SPECIES).filter((n) =>{return new RegExp("\\b"+n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b","i").test(s)});if(sp.length)return sp.indexOf(lateGet("B").species)>=0;return true}
export function attunementMeta(n){const d=DMAP[n];return d?{key:d[0],requires:!!d[3],by:d[5]&&d[5].by}:{requires:false,key:n}}
export function migrateItemAttunement(x){return migrateAttunement(x,attunementMeta(x.n))}
export function migrateInventory(b){if(b&&Array.isArray(b.inv))b.inv=migrateItems(b.inv,attunementMeta);return b}
export function attunementState(){return allocateAttunement(lateGet("B").inv||[],attMax(),attunementMeta,(m,x,keys)=>byOk(m.by,keys))}
function beltAttuned(keys){return (keys||new Set(attunementState().keys)).has("Belt of Dwarvenkind")}
export function itemBases(d){const o=itemOverride(d),b=o&&Object.prototype.hasOwnProperty.call(o,"base")?o.base:d&&d[5]&&d[5].base;return Array.isArray(b)?b:null}
export function itemWeaponInUse(row,status){const o=itemOverride(DMAP[row.n]);return !!row.eq&&itemQuantity(row)>0&&(!(o&&o.requiresAttunedWeapon)||!!(status&&status.attuned))}
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
export function cleanCh(b){try{const ch=b&&b.ch;if(ch)Object.keys(ch).forEach((k) =>{const m=/^feat(\d+)$/.exec(k);if(m&&+m[1]<4)delete ch[k]})}catch(e){}return migrateInventory(b)}

/* Records a completed attunement, independently of wearing/holding the item. */
export function setItemAttuned(index,on){const b=migrateInventory(lateGet("B")),it=(b.inv||[])[index];if(!it)return {ok:false,reason:"missing"};
 if(!attunementMeta(it.n).requires)return {ok:false,reason:"not-required"};const was=it.attuned;it.attuned=!!on;
 if(on){const st=attunementState(),row=st.rows[index];if(!row||!row.attuned){it.attuned=was;return {ok:false,reason:row&&row.reason||"requirements",limit:st.limit}}}return {ok:true}}
