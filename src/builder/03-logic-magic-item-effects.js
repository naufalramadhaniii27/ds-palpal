import {clone} from "./01-logic-core-helpers.js";
import {__R} from "./00-reg.js";
export var DMAP={};DMGI.forEach((x) =>{DMAP[x[0]]=x});
/* M18 (v16): constant numbers of a magic item (DMGI[5].fx) while it is used, and attuned when it needs attunement. Only 3 attuned items count
   (a creature can be attuned to at most 3 magic items). Armor and Shield bonuses (+N) come from the item name as before */
/* V16-1: a named magic weapon or armor has its base items in DMGI[5].base (first = default). "Holy Avenger (Greatsword)" picks another base: alias rows in DMAP */
export function dmapAlias(){DMGI.forEach((x) =>{const b=x[5]&&x[5].base;if(b&&b.length>1)b.forEach((o) =>{const k=x[0]+" ("+o+")";if(!DMAP[k])DMAP[k]=x})})}dmapAlias();
/* FXO (src/data/fx-D-item.js): window.FXO[item name] = {fx:{...}|null, gx:[...]|null} replaces the fx (or gx) of the DMGI row without editing the source data. fx:null drops a wrongly counted effect */
export function ovFx(d){const o=typeof window!=="undefined"&&window.FXO&&d&&window.FXO[d[0]];return o&&("fx" in o)?(o.fx||null):(d&&d[5]&&d[5].fx||null)}
export function itemFx(n){const d=DMAP[n];return d?ovFx(d):null}
/* v19 RL43: Thief 13 Use Magic Device: four attuned items. RL42: an item that needs attunement by a class, species, or spellcaster the character is not
   gives nothing (byOk). "a Dwarf, or anyone attuned to a Belt of Dwarvenkind" also counts the belt */
let ATT_BUSY=false,ATT_LAST=0;
export function attMax(){let m=__R.subAt("Rogue","Thief")>=13?4:3,al=__R.clsLv("Artificer");if(al>=18)m=Math.max(m,6);else if(al>=14)m=Math.max(m,5);else if(al>=10)m=Math.max(m,4);/* fx engine v4: attune:N on a class, subclass, species, background or feat entry (gfx without items, so no loop with activeFx), or on an equipped item entry (GX.item) raises the limit to N */if(ATT_BUSY)return Math.max(m,ATT_LAST);/* re-entered through gfx: use the last finished value */ATT_BUSY=true;try{__R.gfx(true).forEach((e) =>{if(e.attune>m)m=e.attune});const GI=(typeof window!=="undefined"&&window.GX&&window.GX.item)||{};(__R.B.inv||[]).forEach((x) =>{if(x.eq)(GI[x.n]||[]).forEach((e) =>{if(e&&e.attune>m)m=e.attune})});ATT_LAST=m}catch(er){}finally{ATT_BUSY=false}return m}/* v90: Magic Item Adept, Savant and Master */
export function byOk(by){if(!by)return true;const s=String(by),cls=Object.keys(CLASSES).filter((c) =>{return s.indexOf(c)>=0});
 if(/Belt of Dwarvenkind/.test(s)&&(__R.B.inv||[]).some((x) =>{return x.eq&&x.n==="Belt of Dwarvenkind"}))return true;
 if(cls.length)return cls.some((c) =>{return __R.clsLv(c)>0});if(/Spellcaster/i.test(s))return __R.casterParts().length>0||__R.miFeats().length>0;
 const sp=Object.keys(SPECIES).filter((n) =>{return new RegExp("\\b"+n+"\\b").test(s)});if(sp.length)return sp.indexOf(__R.B.species)>=0;return true}
export function activeFx(){let out=[],att=0,am=attMax();(__R.B.inv||[]).forEach((x) =>{if(!x.eq)return;const d=DMAP[x.n];if(!d)return;if(d[3]){if(att>=am||!byOk(d[5]&&d[5].by))return;att++}const f=ovFx(d),g=(d[5]&&d[5].gx)||null,bb=__R.baseOf(x.n).b,gi=typeof window!=="undefined"&&window.GX&&window.GX.item&&window.GX.item[x.n];if(f||g||gi)out.push({n:x.n,fx:f||{},gx:g,att:!!d[3],arm:!!(ARMOR[bb]||bb==="Shield"),t:d[1]})});return out}
export function htText(sp,size){const h=HEIGHT[sp]&&HEIGHT[sp][size];if(!h)return "";return "about "+h[0]+"\u2013"+h[1]+" ft tall (\u2248"+Math.round(h[0]*30.48)+"\u2013"+Math.round(h[1]*30.48)+" cm)"}
export var BLANK={name:"New Hero",camp:"",species:"Human",cSpecies:{name:"",speed:30,dark:0,size:"Medium"},bg:"Soldier",bgMode:"21",bg2:"",bg1:"",cls:"Fighter",sub:"",cSub:"",level:1,
 base:{STR:15,DEX:14,CON:13,INT:12,WIS:10,CHA:8},armor:"",shield:false,weps:[],ch:{},method:"manual",eqC:"A",eqB:"A",size:""};
/* RU30: a new character starts with nothing chosen. B.unset lists what the player has not chosen yet (cls, species, bg, abil, eqC, eqB).
   The values behind it stay as in BLANK, so every rule still computes, but the builder shows the choice lists and the sheet stays empty
   until the first Apply. Builds saved before v13 have no unset: nothing changes for them */
export function un(k){return !!(__R.B.unset&&__R.B.unset[k])}
/* RU32: background and species of the build, null while not chosen yet (the BLANK defaults Soldier and Human are placeholders only) */
export function bgX(){return un("bg")?null:BACKGROUNDS[__R.B.bg]}
export function spX(){return un("species")?null:SPECIES[__R.B.species]}
export function unDone(k){if(__R.B.unset){delete __R.B.unset[k];if(!Object.keys(__R.B.unset).length)delete __R.B.unset}}
export function NEWB(){const b=clone(BLANK);b.name="New Character";b.method="";b.base={STR:10,DEX:10,CON:10,INT:10,WIS:10,CHA:10};b.unset={cls:1,species:1,bg:1,abil:1,eqC:1,eqB:1};return b}
export function kitGP(t){const m=/(\d+) GP$/.exec(t||"");return m?+m[1]:0}
/* L5: fromSheet v1 to v3 wrote B.ch.feat1 (Fighter) or feat2 (Paladin, Ranger) from the Fighting Style row. No class has an ASI below level 4,
   so a featN key with N < 4 is always junk and is dropped on load. Other keys are left alone. Persisted by the next save(). */
export function cleanCh(b){try{const ch=b&&b.ch;if(ch)Object.keys(ch).forEach((k) =>{const m=/^feat(\d+)$/.exec(k);if(m&&+m[1]<4)delete ch[k]})}catch(e){}return b}
