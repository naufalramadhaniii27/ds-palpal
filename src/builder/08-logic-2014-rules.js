import {lateGet} from "./01b-logic-late-ports.js";import {genv} from "./00-env.js";
import {SRC,__set_SRC} from "./01-logic-core-helpers.js";
import {B} from "./04-logic-storage.js";
import {R14,SRC14,SUBLBL14,SUBLV14} from "./05-logic-choice-model-ruleset.js";
import {CLS14} from "./06-data-2014-classes.js";

export var RL14={"Cleric|Knowledge Domain (2014)":[1,1,2,6,8,17],"Cleric|Life Domain (2014)":[1,1,1,2,6,8,17],"Cleric|Light Domain (2014)":[1,1,1,2,6,8,17],"Cleric|Nature Domain":[1,1,1,2,6,8,17],"Cleric|Tempest Domain":[1,1,1,2,6,8,17],"Cleric|Trickery Domain (2014)":[1,1,2,6,8,17],"Cleric|War Domain (2014)":[1,1,1,2,6,8,17],"Cleric|Death Domain":[1,1,1,2,6,8,17],"Paladin|Oathbreaker":[3,3,3,7,15,20],"Barbarian|Path of the Battlerager":[3,6,10,14],"Cleric|Arcana Domain (2014)":[1,1,2,6,8,17],"Fighter|Purple Dragon Knight (Banneret)":[3,7,10,15],"Monk|Way of the Long Death":[3,6,11,17],"Paladin|Oath of the Crown":[3,3,3,3,7,15,20],"Warlock|The Undying":[1,1,6,10,14],"Bard|College of Spirits (2014)":[3,3,3,6,14],"Warlock|The Undead":[1,1,6,10,14],"Fighter|Echo Knight":[3,3,7,10,15,18],"Wizard|Chronurgy Magic":[2,2,6,10,14],"Wizard|Graviturgy Magic":[2,6,10,14],"Monk|Way of the Ascendant Dragon":[3,3,6,11,17],"Ranger|Drakewarden":[3,3,7,11,15],"Cleric|Ambition Domain (PSA)":[1,1,2,6,8,17],"Cleric|Knowledge Domain (PSA)":[1,1,2,6,8,17],"Cleric|Solidarity Domain (PSA)":[1,1,1,2,6,8,17],"Cleric|Strength Domain (PSA)":[1,1,1,2,6,8,17],"Cleric|Zeal Domain (PSA)":[1,1,1,2,6,8,17],"Sorcerer|Pyromancer (PSK)":[1,6,14,18],"Sorcerer|Lunar Sorcery":[1,1,6,6,14,18],"Barbarian|Path of the Berserker (2014)":[3,6,10,14],"Barbarian|Path of the Totem Warrior":[3,3,6,10,14],"Bard|College of Lore (2014)":[3,3,6,14],"Bard|College of Valor (2014)":[3,3,6,14],"Druid|Circle of the Land (2014)":[2,2,2,6,10,14],"Druid|Circle of the Moon (2014)":[2,2,6,10,14],"Fighter|Battle Master (2014)":[3,3,7,10,15,18],"Fighter|Champion (2014)":[3,7,10,15,18],"Fighter|Eldritch Knight (2014)":[3,3,7,10,15,18],"Monk|Way of Shadow":[3,6,11,17],"Monk|Way of the Four Elements":[3,3,6,11,17],"Monk|Way of the Open Hand":[3,6,11,17],"Paladin|Oath of Devotion (2014)":[3,3,3,3,7,15,20],"Paladin|Oath of the Ancients (2014)":[3,3,3,3,7,15,20],"Paladin|Oath of Vengeance (2014)":[3,3,3,3,7,15,20],"Ranger|Beast Master (2014)":[3,7,11,15],"Ranger|Hunter (2014)":[3,7,11,15],"Rogue|Arcane Trickster (2014)":[3,3,9,13,17],"Rogue|Assassin (2014)":[3,3,9,13,17],"Rogue|Thief (2014)":[3,3,9,13,17],"Sorcerer|Draconic Bloodline":[1,1,6,14,18],"Sorcerer|Wild Magic":[1,1,6,14,18],"Warlock|The Archfey (2014)":[1,1,6,10,14],"Warlock|The Fiend (2014)":[1,1,6,10,14],"Warlock|The Great Old One (2014)":[1,1,6,10,14],"Wizard|School of Abjuration":[2,2,6,10,14],"Wizard|School of Conjuration":[2,2,6,10,14],"Wizard|School of Divination":[2,2,6,10,14],"Wizard|School of Enchantment":[2,2,6,10,14],"Wizard|School of Evocation":[2,2,6,10,14],"Wizard|School of Illusion":[2,2,6,10,14],"Wizard|School of Necromancy":[2,2,6,10,14],"Wizard|School of Transmutation":[2,2,6,10,14],"Barbarian|Path of the Beast":[3,6,10,14],"Barbarian|Path of Wild Magic":[3,3,6,10,14],"Bard|College of Creation":[3,3,6,14],"Bard|College of Eloquence":[3,3,6,6,14],"Cleric|Order Domain":[1,1,1,2,6,8,17],"Cleric|Peace Domain":[1,1,1,2,6,8,17],"Cleric|Twilight Domain":[1,1,1,1,2,6,8,17],"Druid|Circle of Spores":[2,2,2,6,10,14],"Druid|Circle of Stars":[2,2,6,10,14],"Druid|Circle of Wildfire":[2,2,6,10,14],"Fighter|Psi Warrior (2014)":[3,3,3,3,7,10,15,18],"Fighter|Rune Knight":[3,3,3,7,10,15,18],"Monk|Way of Mercy":[3,3,3,6,11,17],"Monk|Way of the Astral Self":[3,6,11,17],"Paladin|Oath of Glory (2014)":[3,3,3,7,15,20],"Paladin|Oath of the Watchers":[3,3,3,7,15,20],"Ranger|Fey Wanderer (2014)":[3,3,3,7,11,15],"Ranger|Swarmkeeper":[3,3,7,11,15],"Rogue|Phantom (2014)":[3,3,9,13,17],"Rogue|Soulknife (2014)":[3,3,3,3,9,13,17],"Sorcerer|Aberrant Mind":[1,1,6,6,14,18],"Sorcerer|Clockwork Soul":[1,1,6,14,18],"Warlock|The Fathomless":[1,1,1,6,6,10,14],"Warlock|The Genie":[1,1,6,10,14],"Wizard|Bladesinging":[2,2,6,10,14],"Wizard|Order of Scribes":[2,2,6,10,14],"Barbarian|Path of the Ancestral Guardian":[3,6,10,14],"Barbarian|Path of the Storm Herald":[3,6,10,14],"Barbarian|Path of the Zealot (2014)":[3,3,6,10,14],"Barbarian|Path of the Giant":[3,3,6,10,14],"Bard|College of Glamour (2014)":[3,3,6,14],"Bard|College of Swords":[3,3,3,6,14],"Bard|College of Whispers":[3,3,6,14],"Cleric|Forge Domain":[1,1,1,2,6,8,17],"Cleric|Grave Domain (2014)":[1,1,1,2,6,8,17],"Druid|Circle of Dreams":[2,6,10,14],"Druid|Circle of the Shepherd":[2,2,6,10,14],"Fighter|Arcane Archer (2014)":[3,3,7,7,15],"Fighter|Cavalier":[3,3,3,7,10,15,18],"Fighter|Samurai":[3,3,7,10,15,18],"Monk|Way of the Drunken Master":[3,3,6,11,17],"Monk|Way of the Kensei":[3,3,3,6,11,17],"Monk|Way of the Sun Soul":[3,6,11,17],"Paladin|Oath of Conquest":[3,3,3,7,15,20],"Paladin|Oath of Redemption":[3,3,3,7,15,20],"Ranger|Gloom Stalker (2014)":[3,3,3,7,11,15],"Ranger|Horizon Walker":[3,3,3,7,11,15],"Ranger|Monster Slayer":[3,3,3,7,11,15],"Rogue|Inquisitive":[3,3,3,9,13,17],"Rogue|Mastermind":[3,3,9,13,17],"Rogue|Scout":[3,3,9,13,17],"Rogue|Swashbuckler":[3,3,9,13,17],"Sorcerer|Divine Soul":[1,1,6,14,18],"Sorcerer|Shadow Magic":[1,1,6,14,18],"Sorcerer|Storm Sorcery":[1,1,6,6,14,18],"Warlock|The Celestial":[1,1,1,6,10,14],"Warlock|The Hexblade":[1,1,1,6,10,14],"Wizard|War Magic":[2,2,6,10,14]},RLN=null;
export function subLv(cls){return R14()?(SUBLV14[cls]||3):3}
export function subLbl(cls){return R14()?(SUBLBL14[cls]||SUBLABEL[cls]):SUBLABEL[cls]}
export function sdn(n){return R14()?String(n).replace(/ \(2014\)$/,""):n}
function rln(){if(RLN)return RLN;RLN={};(genv.WXS||[]).forEach((x) =>{const k=x.cls+"|"+x.name,l=RL14[k];if(!l)return;const m=RLN[k]=RLN[k]||{};x.arr.forEach((a,i) =>{const n=a[1].toLowerCase();if(m[n]==null)m[n]=l[i]})});return RLN}
/* effective level of a subclass pick: the level of the feature it belongs to in the 2014 book */
export function pEff(cn,sn,p){if(!R14()||!p.feature)return p.l;const m=rln()[cn+"|"+sn],v=m&&m[String(p.feature).toLowerCase()];return v!=null&&v<p.l&&p.l<=3?v:p.l}/* v91: only a pick of the subclass level moves with its feature. A later pick (maneuvers at 7) keeps its level */
export var BASE14={},CF14SAVED={},KEYS14=["res","track","pick","asiX","fs","armor","weapons","tools","sk","eq","eqg"],MM14SAVED=null,LU14SAVED=null,ACT14SAVED=null,CA14SAVED=null,SN14O=null,INV14S=null,ISP14S=null,IPK14S=null,PACTB14=[],OPT14S={},AU14S={},SF14S={},SG14S={},FD14S=null,SN14={"Indomitable":"Reroll a failed save (Limited Use)","Diamond Soul":"Proficient in all saves. Spend 1 ki point to reroll a failed one"};
function ov14(st,ob,k,v){if(!(k in st))st[k]=(k in ob)?ob[k]:undefined;if(v===undefined)delete ob[k];else ob[k]=v}
function ov14undo(st,ob){Object.keys(st).forEach((k) =>{if(st[k]===undefined)delete ob[k];else ob[k]=st[k]})}
/* cls14Tabs steps (SOLID s16): put the 2024 tables back, then lay the 2014 tables over them. cl = the 2014 class names */
function c14Undo(){ PACTB14=[];ov14undo(OPT14S,OPTS);OPT14S={};ov14undo(AU14S,AUTO);AU14S={};ov14undo(SF14S,SUB_FULL);SF14S={};ov14undo(SG14S,SUB_GRANT);SG14S={};if(FD14S){FDMG.length=0;FD14S.forEach((r) =>{FDMG.push(r)});FD14S=null}if(INV14S){INVOCATIONS.length=0;INV14S.forEach((x) =>{INVOCATIONS.push(x)});INV14S=null}
 if(ISP14S){Object.keys(INV_SPELLS).forEach((k) =>{delete INV_SPELLS[k]});Object.assign(INV_SPELLS,ISP14S);ISP14S=null}
 if(IPK14S){Object.keys(INV_PICK).forEach((k) =>{delete INV_PICK[k]});Object.assign(INV_PICK,IPK14S);IPK14S=null}
 if(MM14SAVED){METAMAGIC.length=0;MM14SAVED.forEach((x) =>{METAMAGIC.push(x)});MM14SAVED=null}
 if(SN14O){SN14O.forEach((r) =>{r[0][2]=r[1]});SN14O=null}
 if(LU14SAVED){LU_X.length=0;LU14SAVED.forEach((e) =>{LU_X.push(e)});LU14SAVED=null}
 if(ACT14SAVED){Object.keys(ACT14SAVED).forEach((k) =>{if(ACT14SAVED[k]===undefined)delete ACTS[k];else ACTS[k]=ACT14SAVED[k]});ACT14SAVED=null}
 if(CA14SAVED){Object.keys(CLS_AUTO).forEach((k) =>{delete CLS_AUTO[k]});Object.assign(CLS_AUTO,CA14SAVED);CA14SAVED=null}}
function c14Notes(){
 SN14O=[];if(typeof SAVE_NOTES!=="undefined")SAVE_NOTES.forEach((x) =>{if(x[0]==="cf"&&SN14[x[1]]!=null){SN14O.push([x,x[2]]);x[2]=SN14[x[1]]}});}
function c14Opts(cl){
 if(typeof OPTS!=="undefined")cl.forEach((cn) =>{Object.keys(CLS14[cn].opts||{}).forEach((k) =>{ov14(OPT14S,OPTS,k,CLS14[cn].opts[k])})});}
function c14Mm(cl){
 cl.forEach((cn) =>{const mm=CLS14[cn].mm;if(mm&&typeof METAMAGIC!=="undefined"){MM14SAVED=METAMAGIC.slice();METAMAGIC.length=0;mm.forEach((x) =>{if(!x[2]||(B.src&&B.src[x[2]]))METAMAGIC.push([x[0],x[1]])})}});}
function c14Wl(){
 const wl14=CLS14.Warlock;if(wl14&&wl14.inv&&typeof INVOCATIONS!=="undefined"){const on14=function(s){return !s||(B.src&&B.src[s])};INV14S=INVOCATIONS.slice();INVOCATIONS.length=0;wl14.inv.forEach((x) =>{if(on14(x[4])){const r=[x[0],x[1],x[2]];if(x[3])r.push(x[3]);INVOCATIONS.push(r)}});
  ISP14S=Object.assign({},INV_SPELLS);Object.keys(INV_SPELLS).forEach((k) =>{delete INV_SPELLS[k]});Object.assign(INV_SPELLS,wl14.invSp||{});
  IPK14S=Object.assign({},INV_PICK);Object.keys(INV_PICK).forEach((k) =>{delete INV_PICK[k]});PACTB14=(wl14.pact||[]).filter((x) =>{return on14(x[2])}).map((x) =>{return [x[0],x[1]]})}}
function c14Lu(cl,subN){
 LU14SAVED=LU_X.slice();const keep=LU_X.filter((e) =>{return !((e.src==="class"&&cl.indexOf(e.owner)>=0)||(e.src==="sub"&&subN.indexOf(e.owner)>=0))});LU_X.length=0;keep.forEach((e) =>{LU_X.push(e)});}
function c14Acts(cl){
 ACT14SAVED={};cl.forEach((cn) =>{Object.keys(ACTS).forEach((k) =>{if((k.indexOf("cls|"+cn+"|")===0||Object.keys(CLS14[cn].subs||{}).some((s) =>{return k.indexOf("sub|"+s+"|")===0}))&&!(k in ACT14SAVED)){ACT14SAVED[k]=ACTS[k];delete ACTS[k]}})});}
function c14SubFull(d){
  if(d.subs){Object.keys(SUB_FULL).forEach((k) =>{if(Object.keys(d.subs).indexOf(k.split("|")[0])>=0)ov14(SF14S,SUB_FULL,k,undefined)});Object.keys(d.subFull||{}).forEach((k) =>{ov14(SF14S,SUB_FULL,k,d.subFull[k])})}}
function c14Fdmg(d){
  if(d.fdmg&&typeof FDMG!=="undefined"){if(!FD14S)FD14S=FDMG.slice();for(let fi=FDMG.length-1;fi>=0;fi--){if(FDMG[fi][0]==="sub"&&Object.keys(d.subs||{}).indexOf(FDMG[fi][1])>=0)FDMG.splice(fi,1)}d.fdmg.forEach((r) =>{FDMG.push(r)})}}
function c14Class(cn){const d=CLS14[cn];Object.keys(d.acts||{}).forEach((n) =>{const k="cls|"+cn+"|"+n;if(!(k in ACT14SAVED))ACT14SAVED[k]=undefined;ACTS[k]=d.acts[n]});
  (d.lu||[]).forEach((e) =>{LU_X.push(Object.assign({src:"class",owner:cn},e))});(d.subLU||[]).forEach((e) =>{LU_X.push(e)});
  Object.keys(d.subActs||{}).forEach((k) =>{if(!(k in ACT14SAVED))ACT14SAVED[k]=undefined;ACTS[k]=d.subActs[k]});
  Object.keys(d.subAuto||{}).forEach((s) =>{ov14(AU14S,AUTO,s,d.subAuto[s])});Object.keys(d.subGrant||{}).forEach((s) =>{ov14(SG14S,SUB_GRANT,s,d.subGrant[s])});
  c14SubFull(d);
  c14Fdmg(d)}
function cls14Tabs(on){ c14Undo(); if(!on)return;
 c14Notes(); const cl=Object.keys(CLS14);
 c14Opts(cl);
 const subN=[];cl.forEach((cn) =>{Object.keys(CLS14[cn].subs||{}).forEach((s) =>{subN.push(s)})});
 c14Mm(cl);c14Wl();
 c14Lu(cl,subN);
 c14Acts(cl);
 cl.forEach((cn) =>{c14Class(cn)});
 CA14SAVED=Object.assign({},CLS_AUTO);Object.keys(CLS_AUTO).forEach((k) =>{delete CLS_AUTO[k]});}
const FS14={PHB:["Archery","Defense","Dueling","Great Weapon Fighting","Protection","Two-Weapon Fighting"],
 TCE:{Fighter:["Blind Fighting","Interception","Superior Technique","Thrown Weapon Fighting","Unarmed Fighting"],Paladin:["Blessed Warrior","Blind Fighting","Interception"],Ranger:["Blind Fighting","Druidic Warrior","Thrown Weapon Fighting"]},
 PHBC:{Fighter:1,Paladin:1,Ranger:1}};
export function fs14List(cls){const o=[];const cc=CLASSES[cls];if(cc&&cc.fs14)return cc.fs14.filter((n) =>{return FEATS[n]});/* a class of a 2014 third party book lists its own styles (Warden, Valda 2014) */if(!FS14.PHBC[cls])return o;FS14.PHB.forEach((n) =>{const ok=cls==="Fighter"||(cls==="Paladin"&&["Defense","Dueling","Great Weapon Fighting","Protection"].indexOf(n)>=0)||(cls==="Ranger"&&["Archery","Defense","Dueling","Two-Weapon Fighting"].indexOf(n)>=0);if(ok)o.push(n)});
 if(B.src&&B.src.tce)(FS14.TCE[cls]||[]).forEach((n) =>{o.push(n)});return o.filter((n) =>{return FEATS[n]})}
function cls14Feats(){if(!R14())return;
 FEATS["Great Weapon Fighting"]=Object.assign({},FEATS["Great Weapon Fighting"],{d:"When you roll a 1 or 2 on a damage die for an attack made with a Two-Handed or Versatile melee weapon held in two hands, you reroll the die and must use the new roll."});
 FEATS["Protection"]=Object.assign({},FEATS["Protection"],{d:"Reaction while wielding a Shield: impose Disadvantage on an attack roll against a creature other than you that is within 5 ft of you, if you can see the attacker."});
 FEATS["Superior Technique"]={cat:"F",d:"Learn one Battle Master maneuver. You gain one d6 superiority die, which returns on a Short or Long Rest."}}
/* v95: what multiclassing gives, 2014 Player's Handbook (Multiclassing, Proficiencies table) and Tasha's for the Artificer */
let MCG14={Barbarian:{armor:"Shields",weapons:"Simple, Martial"},Bard:{armor:"Light",sk:1,skFrom:"any",tools:"One Musical Instrument",toolPick:{n:1,cats:["music"]}},Cleric:{armor:"Light, Medium, Shields"},Druid:{armor:"Light, Medium, Shields"},Fighter:{armor:"Light, Medium, Shields",weapons:"Simple, Martial"},Monk:{weapons:"Simple, Shortsword"},Paladin:{armor:"Light, Medium, Shields",weapons:"Simple, Martial"},Ranger:{armor:"Light, Medium, Shields",weapons:"Simple, Martial",sk:1},Rogue:{armor:"Light",sk:1,tools:"Thieves' Tools"},Sorcerer:{},Warlock:{armor:"Light",weapons:"Simple"},Wizard:{},Artificer:{armor:"Light, Medium, Shields",tools:"Thieves' Tools, Tinker's Tools"}}, MCG14S=null;
function mcg14(on){if(MCG14S){Object.keys(MCG14S).forEach((k) =>{if(MCG14S[k]===null)delete MC_GRANT[k];else MC_GRANT[k]=MCG14S[k]});MCG14S=null}
 if(!on)return;MCG14S={};Object.keys(MCG14).forEach((k) =>{MCG14S[k]=MC_GRANT[k]||null;MC_GRANT[k]=structuredClone(MCG14[k])})}
function cls14Restore(){mcg14(false);if(CLASSES.Artificer&&CLASSES.Artificer.a14)delete CLASSES.Artificer;Object.keys(BASE14).forEach((cn) =>{const c=CLASSES[cn],o=BASE14[cn];if(!c)return;KEYS14.forEach((k) =>{if(o[k]===undefined)delete c[k];else c[k]=o[k]})});BASE14={};Object.keys(CF14SAVED).forEach((k) =>{if(CF14SAVED[k]===undefined)delete CF_FULL[k];else CF_FULL[k]=CF14SAVED[k]});CF14SAVED={}}
export function cls14Inject(n,o){const all=Object.keys(CLASSES).map((k) =>{return [k,CLASSES[k]]});all.push([n,o]);all.sort((a,b) =>{return a[0]<b[0]?-1:1});Object.keys(CLASSES).forEach((k) =>{delete CLASSES[k]});all.forEach((r) =>{CLASSES[r[0]]=r[1]})}
/* cls14Apply steps (SOLID s16): the 2014 Artificer, the 2014 numbers of class cn, its subclasses (level table rl, or removed when not 2014) */
function c14Art(){
 const ad=CLS14.Artificer;if(ad&&ad.base){if(B.cls==="Artificer"||(B.mc||[]).some((m) =>{return m.cls==="Artificer"}))B.src.tce=true;if(B.src&&B.src.tce&&!CLASSES.Artificer){const ao=Object.assign({},ad.base);ao.subs=structuredClone(ad.subs||{});ao.pickSub=structuredClone(ad.pickSub||{});cls14Inject("Artificer",ao)}}/* v90: the 2014 Artificer comes from Tasha's Cauldron of Everything */}
function c14Base(cn,c,d){const o=BASE14[cn]={};KEYS14.forEach((k) =>{o[k]=c[k]});
   const keep=(c.f||[]).filter((x) =>{return x[3]&&x[3].hb}),names={};d.f.forEach((x) =>{names[x[1]]=1});
   c.f=d.f.map((x) =>{return x.slice()}).concat(keep.filter((x) =>{return !names[x[1]]})).sort((x,y) =>{return x[0]-y[0]});
   KEYS14.forEach((k) =>{if(d[k]!==undefined)c[k]=structuredClone(d[k]);else if(k==="pick"||k==="asiX"||k==="fs")delete c[k]});
   Object.keys(CF_FULL).forEach((k) =>{if(k.indexOf(cn+"|")===0&&CF14SAVED[k]===undefined)CF14SAVED[k]=CF_FULL[k]});
   Object.keys(CF14SAVED).forEach((k) =>{if(k.indexOf(cn+"|")===0)delete CF_FULL[k]});
   Object.keys(d.full||{}).forEach((n) =>{const k=cn+"|"+n;if(!(k in CF14SAVED))CF14SAVED[k]=CF_FULL[k];CF_FULL[k]=d.full[n]})}
function c14SubRl(cn,c,sn,rl){c.subs[sn]=c.subs[sn].map((a,i) =>{const b=a.slice();if(rl[i]!=null)b[0]=rl[i];return b});
    LU_X.forEach((e,i) =>{if(e.src==="sub"&&e.owner===sn&&e.lvl===3){let f=null;c.subs[sn].forEach((a) =>{if(f==null&&a[1]===e.feature)f=a[0]});if(f!=null&&f<3)LU_X[i]=Object.assign({},e,{lvl:f})}});/* v91: a counter starts at the level of its feature */
    if(cn==="Cleric"&&AUTO[sn]&&AUTO[sn][0]&&AUTO[sn][0][0]===3){const sp=String(AUTO[sn][0][1]).split(",");if(sp.length>=4)AUTO[sn]=[[1,sp.slice(0,sp.length-2).join(",")],[3,sp.slice(sp.length-2).join(",")]].concat(AUTO[sn].slice(1))}}
/* Selected Cleric subclasses from registered 2014 third-party sources keep their printed native levels. */
function c14NativeSource(cn,x){const books=genv.WX&&genv.WX.src;return cn==="Cleric"&&!!x&&!!(B.src&&B.src[x.src])&&Array.isArray(books)&&books.some(book=>book&&book.id===x.src&&book.tp===1&&book.ed==="2014")}
function c14Sub(cn,c,sn,nb,xs){const key=cn+"|"+sn,rl=RL14[key],x=xs[key];
   if(c14NativeSource(cn,x))return;
   if(rl){c14SubRl(cn,c,sn,rl);return}
   if(nb[sn]||(x&&SRC14.indexOf(x.src)<0))delete c.subs[sn]}
function c14ApplyCls(cn,b0,xs){const c=CLASSES[cn],d=CLS14[cn];
  if(d)c14Base(cn,c,d);
  if(!c.subs)return;const nb=c.a14?{}:(b0[cn]||{});
  Object.keys(c.subs).forEach((sn) =>{c14Sub(cn,c,sn,nb,xs)})}
export function cls14Apply(){cls14Restore();cls14Tabs(R14());__set_SRC(R14()?"PHB-2014":"PHB-2024");if(!R14())return;mcg14(true);cls14Feats();
 c14Art();
let b0=null;try{b0=JSON.parse(lateGet("BASE").subs)}catch(e){b0={}}
 const xs={};(genv.WXS||[]).forEach((x) =>{xs[x.cls+"|"+x.name]=x});
 Object.keys(CLASSES).forEach((cn) =>{c14ApplyCls(cn,b0,xs)})}
