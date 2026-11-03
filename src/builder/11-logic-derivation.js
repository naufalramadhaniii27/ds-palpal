import {ABK,SRC,mod,pbOf} from "./01-logic-core-helpers.js";
import {activeFx,bgX,un} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {CL,R14} from "./05-logic-choice-model-ruleset.js";
import {allFeats,asiOf,dmXl,raceBonus,wxAb} from "./09-logic-feats-and-choices.js";
import {luMax} from "./10-logic-v17-additions.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"casterParts",{get:function(){return casterParts;},set:function(v){casterParts=v;},configurable:true});
Object.defineProperty(__R,"clsLv",{get:function(){return clsLv;},set:function(v){clsLv=v;},configurable:true});
Object.defineProperty(__R,"clsParts",{get:function(){return clsParts;},set:function(v){clsParts=v;},configurable:true});
Object.defineProperty(__R,"featsOf",{get:function(){return featsOf;},set:function(v){featsOf=v;},configurable:true});
Object.defineProperty(__R,"resKey",{get:function(){return resKey;},set:function(v){resKey=v;},configurable:true});
Object.defineProperty(__R,"spLists",{get:function(){return spLists;},set:function(v){spLists=v;},configurable:true});
Object.defineProperty(__R,"spRec",{get:function(){return spRec;},set:function(v){spRec=v;},configurable:true});
Object.defineProperty(__R,"spellAb",{get:function(){return spellAb;},set:function(v){spellAb=v;},configurable:true});
/* ---------- derivation ---------- */
export function abil(){
 const sc={},src={};ABK.forEach((k) =>{sc[k]=+B.base[k]||10;src[k]=[]});
 const bg=bgX();  const rb=raceBonus();Object.keys(rb).forEach((k) =>{if(src[k])src[k].push({s:B.species+" (race)",v:rb[k]})});if(bg&&!R14()){if(B.bgMode==="111")bg.ab.forEach((k) =>{src[k].push({s:B.bg+" background ("+SRC+")",v:1})});
  else{if(B.bg2&&bg.ab.indexOf(B.bg2)>=0)src[B.bg2].push({s:B.bg+" background ("+SRC+")",v:2});if(B.bg1&&B.bg1!==B.bg2&&bg.ab.indexOf(B.bg1)>=0)src[B.bg1].push({s:B.bg+" background ("+SRC+")",v:1})}/* v22 P1: only the background's abilities (PHB 2024) */}
 /* fx batch E: abCut {total,each} on a feat entry (Worthless). Applies to the scores built so far (base, species, background), before later feat increases. Lowers the highest score by 1 until the total is at most total, then lowers every score by each. A tie goes to the first ability in STR to CHA order */
 {const G=(typeof window!=="undefined"&&window.GX)||{},cut=allFeats().map((f) =>{return ((G.feat&&G.feat[f.n])||[]).filter((e) =>{return e&&e.abCut})[0]}).filter(Boolean)[0];
  if(cut){const t={},c=cut.abCut;let tot=0;ABK.forEach((k) =>{t[k]=sc[k]+src[k].reduce((n,b) =>{return n+b.v},0);tot+=t[k]});
   let g=0;while(tot>c.total&&g++<200){let m=ABK[0];ABK.forEach((k) =>{if(t[k]>t[m])m=k});t[m]--;tot--;src[m].push({s:"Worthless (feat): total lowered to "+c.total,v:-1})}
   ABK.forEach((k) =>{if(c.each&&t[k]>1)src[k].push({s:"Worthless (feat): every score lowered by "+c.each,v:-c.each})})}}
 allFeats().forEach((f) =>{const v=f.asi;if(!v)return;const F=FEATS[f.n];if(!F)return;
  asiOf(f,F).forEach((q) =>{src[q[0]].push({s:f.n+(F.asi2?"":" feat")+", "+f.s,v:q[1]})})});/* v19 RL46 (9): only abilities on the feat's list */
 if(B.level>=20&&B.cls==="Barbarian"){src.STR.push({s:"Primal Champion ("+SRC+", Barbarian 20)",v:4});src.CON.push({s:"Primal Champion ("+SRC+", Barbarian 20)",v:4})} if(B.level>=20&&B.cls==="Monk"&&!R14()){src.DEX.push({s:"Body and Mind ("+SRC+", Monk 20)",v:4});src.WIS.push({s:"Body and Mind ("+SRC+", Monk 20)",v:4})}
 ABK.forEach((k) =>{let boon=0,cap=20;src[k].forEach((b) =>{if(/^Boon of/.test(b.s))boon+=b.v;else sc[k]+=b.v});
  if(B.level>=20&&((B.cls==="Barbarian"&&(k==="STR"||k==="CON"))||(B.cls==="Monk"&&!R14()&&(k==="DEX"||k==="WIS"))))cap=R14()?24:25;
  if(sc[k]>cap&&+B.base[k]<=cap){src[k].push({s:"Capped at "+cap+" (score maximum)",v:cap-sc[k],cap:1});sc[k]=cap}
  if(boon){sc[k]=Math.min(30,sc[k]+boon)}});
 const AFX=activeFx();AFX.forEach((q) =>{const f=q.fx;if(f.abil){let k=f.abil[0],nv=Math.min(f.abil[2]||30,sc[k]+f.abil[1]);if(f.abil[1]<0){nv=Math.max(1,sc[k]+f.abil[1]);if(nv<sc[k]){src[k].push({s:q.n+" (magic item, "+f.abil[1]+")",v:nv-sc[k]});sc[k]=nv}}else if(nv>sc[k]){src[k].push({s:q.n+" (magic item, +"+f.abil[1]+", maximum "+(f.abil[2]||30)+")",v:nv-sc[k]});sc[k]=nv}}});
 __R.gfx().forEach((e) =>{(e.abUp||[]).forEach((r) =>{const k=r[0];if(!src[k])return;const nv=Math.min(r[2]||20,sc[k]+r[1]);if(nv>sc[k]){src[k].push({s:e.lbl+" (maximum "+(r[2]||20)+")",v:nv-sc[k]});sc[k]=nv}})});/* fx engine v2: abUp [[ability, +N, maximum]] */
 AFX.forEach((q) =>{const f=q.fx;/* V16-4: increases first, then "becomes" */
  const s=f.setsc;if(s&&sc[s[0]]<s[1]){src[s[0]].push({s:q.n+" (magic item, sets score to "+s[1]+")",v:s[1]-sc[s[0]]});sc[s[0]]=s[1]}});/* M18: DMGI fx (setsc as the old SETSC table, abil for Ioun Stones and similar) */
 return {sc:sc,src:src}}
export function slotsFor(){const c=CL(),L=B.level,t=c.caster;
 if(t==="full")return SLOTS_FULL[L-1];if(t==="half")return SLOTS_FULL[Math.ceil(L/2)-1];
 if(t==="pact"){const p=PACT[L-1];return {pact:p[0],lvl:p[1]}}
 if(isThird3(B.sub)&&L>=3)return SLOTS_FULL[Math.ceil(L/3)-1];return null}
export function resMax(r,a){const L=B.level;if(Array.isArray(r.max))return r.max[L-1];if(r.max&&r.max.f)return luMax(r.max,L,a,pbOf(__R.TL()));if(r.max==="lvl")return L<2&&r.min2?0:L;if(r.max==="lvl5")return L*5;
 if(typeof r.max==="string"&&r.max.indexOf("mod:")===0)return Math.max(1,mod(a.sc[r.max.slice(4)]));return r.max}
/* M10: features of any class at its own level (classFeatures() = main class). clsParts(): main class first, then multiclass */
export function featsOf(cls,L){const c=CLASSES[cls],seen={},out=[];c.f.forEach((x) =>{if(x[0]<=L){const k=x[1];if(seen[k]!=null&&x[1]!=="Expertise"&&x[1]!=="Improved Brutal Strike"){out[seen[k]]=x;return}seen[k]=out.length;out.push(x)}});return out}
export function classFeatures(){return featsOf(B.cls,B.level)}
/* Generic effects (fx engine v2). One entry schema for every source: CLASSES[cls].fx, window.GX.{cls,sub,species,bg,feat,item}[name], inline gx arrays on
   FEATS[n], SPECIES[n], BACKGROUNDS[n] and the DMGI row ([5].gx). Full field table: SOURCE-NOTES.md, "fx schema". An entry counts from level l (class level for
   cls and sub, character level for the rest), only while the pick named in when holds the value, and for items only while equipped (and attuned when needed).
   gfx() returns every active entry with lbl (the source text shown on the sheet), kind, owner, lv, pre. classFx() is the same list (kept for old callers) */
function fxv(v,e){if(typeof v==="number")return v;const L=__R.TL();if(v==="pb")return pbOf(L);if(v==="halfPb")return Math.floor(pbOf(L)/2);if(v==="lvl")return e&&e.lv!=null?e.lv:L;if(v==="halfLvl")return Math.floor((e&&e.lv!=null?e.lv:L)/2);if(typeof v==="string"&&ABK.indexOf(v)>=0)return mod(abil().sc[v]);return 0}
function fxVal(v,e){let r=fxv(v,e);if(e&&e.min!=null&&r<e.min)r=e.min;return r}
/* cond: noHeavy (no Heavy armor), noArmor (no armor and no Shield), noBody (no armor, a Shield is fine), noShield, shield, armor (wearing armor) */
function fxOk(e,ar,ESH,EA){const c=e.cond;if(!c)return true;if(c==="noHeavy")return !(ar&&ar.cat==="Heavy");if(c==="noArmor")return !(ar||ESH);if(c==="noBody")return !ar;if(c==="noShield")return !ESH;if(c==="shield")return !!ESH;if(c==="armor")return !!ar;if(c==="mwArmor")return !!ar&&!!EA&&/, Masterwork/.test(EA);return true}
/* fxCh: the stored pick "key" for an entry. A feat entry also finds its own picks: gx pick (gx-key-feat-slot) or native FEATS pick (key-slot) */
function fxCh(key,pre,kind,okey){let v=B.ch[pre+key];if(v==null&&kind==="feat"){v=B.ch["gx-"+key+"-feat-"+okey];if(v==null)v=B.ch[key+"-"+okey]}return v}
function fxWhen(e,pre,kind,okey){if(!e.when)return true;const v=fxCh(e.when.key,pre,kind,okey),a=Array.isArray(v)?v:(v?[v]:[]);return a.indexOf(e.when.val)>=0}
export function gfx(){const out=[],G=(typeof window!=="undefined"&&window.GX)||{},TLv=__R.TL();
 function put(list,kind,owner,lv,pre,lblOf,okey){(list||[]).forEach((e,i) =>{if(!e||(e.l&&lv<e.l)||!fxWhen(e,pre,kind,okey||owner))return;const en=e.n||owner;out.push(Object.assign({},e,{n:en,kind:kind,owner:owner,lv:lv,pre:pre,okey:okey||owner,idx:i,lbl:lblOf(en)}))})}
 let mi=0;clsParts().forEach((q) =>{const pre=q.mc?"m"+(mi++)+":":"",c=CLASSES[q.cls];
  put(((c&&c.fx)||[]).concat((G.cls&&G.cls[q.cls])||[]),"cls",q.cls,q.lv,pre,(n) =>{return n+" ("+q.cls+" "+q.lv+")"});
  if(q.sub)put(((G.sub&&G.sub[q.sub])||[]),"sub",q.sub,q.lv,pre,(n) =>{return n+" ("+q.sub+" "+q.lv+")"})});
 const sp=un("species")?null:SPECIES[B.species];if(sp)put((sp.gx||[]).concat((G.species&&G.species[B.species])||[]),"species",B.species,TLv,"",(n) =>{return n+" ("+B.species+")"});
 const bg=bgX();if(bg)put((bg.gx||[]).concat((G.bg&&G.bg[B.bg])||[]),"bg",B.bg,TLv,"",(n) =>{return n+" ("+B.bg+" background)"});
 allFeats().forEach((f) =>{const F=FEATS[f.n],fok=f.key||f.s,fab=(f.asi&&f.asi.a1)||"CHA",fpa=(B.ch["gx-ab-feat-"+fok]||[])[0]||"INT";/* spCls "@asi": the ability the feat raised. "@abpick": the ability picked with pick k "ab" */put(((F&&F.gx)||[]).concat((G.feat&&G.feat[f.n])||[]).map((e) =>{return e&&e.spCls==="@asi"?Object.assign({},e,{spCls:"@sub:"+fab}):e&&e.spCls==="@abpick"?Object.assign({},e,{spCls:"@sub:"+fpa}):e}),"feat",f.n,TLv,"",(n) =>{return n+" ("+f.n+" feat)"},f.key||f.s)});
 activeFx().forEach((q) =>{put((q.gx||[]).concat((G.item&&G.item[q.n])||[]),"item",q.n,TLv,"",(n) =>{return (n===q.n?n:n+" ("+q.n+")")+" (magic item"+(q.att?", attuned":"")+")"})});
 return out}
export function classFx(){return gfx()}
export {fxv,fxVal,fxOk,fxCh};
Object.defineProperty(__R,"fxCh",{get:function(){return fxCh;},configurable:true});
Object.defineProperty(__R,"gfx",{get:function(){return gfx;},set:function(v){gfx=v;},configurable:true});
Object.defineProperty(__R,"fxv",{get:function(){return fxVal;},configurable:true});
Object.defineProperty(__R,"fxOk",{get:function(){return fxOk;},configurable:true});
Object.defineProperty(__R,"classFx",{get:function(){return classFx;},set:function(v){classFx=v;},configurable:true});
export function clsParts(){return [{cls:B.cls,sub:B.sub,lv:B.level,mc:0}].concat(__R.MCL().map((m) =>{return {cls:m.cls,sub:m.sub,lv:m.lv,mc:1}}))}
/* M9: spellcasting classes in order (main class first): {cls, sub, lv, mc, list (spell list class), ab} */
export function isThird3(x){return x==="Eldritch Knight"||x==="Arcane Trickster"||x==="Eldritch Knight (2014)"||x==="Arcane Trickster (2014)"}
export function casterParts(){return clsParts().map((q) =>{const c=CLASSES[q.cls],third=isThird3(q.sub)&&q.lv>=3;if(!c.caster&&!c.nslot&&!third)return null;return {cls:q.cls,sub:q.sub,lv:q.lv,mc:q.mc,list:c.caster?q.cls:"Wizard",ab:c.caster?c.cast:"INT",xl:(R14()&&q.cls==="Bard"?__R.xl14(q.sub,q.lv):(c.xlists&&q.lv>=c.xlists.l?c.xlists.lists:[])).concat(dmXl())/* v32: Magical Secrets */}}).filter(Boolean)}
/* M9: chosen spells per caster class. B.sp = first caster class (old builds), B.spm[cls] = other classes. A B.sp spell that is not on the first
   class list but is on another caster class list belongs to that class (read only, B is not changed) */
export var SPX=null;export function spRec(n){if(!SPX){SPX={};SPELLS.forEach((x) =>{SPX[x[0]]=x})}return SPX[n]}
export function spLists(){const cp=casterParts(),out={};cp.forEach((p) =>{out[p.cls]=[]});if(!cp.length)return out;
 (B.sp||[]).forEach((n) =>{let x=spRec(n),to=cp[0];if(x&&x[3].indexOf(to.list)<0&&!(to.xl||[]).some((l) =>{return x[3].indexOf(l)>=0})){const o=cp.filter((p) =>{return x[3].indexOf(p.list)>=0})[0];if(o)to=o}if(out[to.cls].indexOf(n)<0)out[to.cls].push(n)});
 Object.keys(B.spm||{}).forEach((k) =>{if(out[k])(B.spm[k]||[]).forEach((n) =>{if(out[k].indexOf(n)<0)out[k].push(n)})});return out}
/* M9: add or remove a spell for one caster class (UI calls this) */
export function spToggle(n,cls){const cp=casterParts(),first=cp.length?cp[0].cls:B.cls;B.sp=B.sp||[];cls=cls||first;const L=spLists();
 if((L[cls]||[]).indexOf(n)>=0){const a=(B.spm||{})[cls]||[],i=a.indexOf(n);if(i>=0){a.splice(i,1);if(!a.length)delete B.spm[cls]}else{const j=B.sp.indexOf(n);if(j>=0)B.sp.splice(j,1)}return}
 if(cls===first)B.sp.push(n);else{B.spm=B.spm||{};(B.spm[cls]=B.spm[cls]||[]).push(n)}}
/* RL35 2b: species spell ability. SPECIES.spAb "choose" = B.ch.spab (Intelligence, Wisdom, Charisma), or a fixed key ("CHA"). null = not chosen */
function spAbility(){const sp=SPECIES[B.species];if(!sp||!sp.spAb)return null;if(sp.spAb==="choose")return {Intelligence:"INT",Wisdom:"WIS",Charisma:"CHA"}[B.ch.spab]||null;return sp.spAb}
/* M9: ability for a spell source. key: class name, "@species", "@spcan" (Limited Spellcaster), "@mi:<B.pk key>" (Magic Initiate) */
export function spellAb(key,sc){const cp=casterParts(),cast=cp.length?cp[0].ab:null;sc=sc||abil().sc;
 if(key==="@species")return spAbility()||cast||["INT","WIS","CHA"].reduce((b,k) =>{return sc[k]>sc[b]?k:b},"INT");
 if(key==="@spcan")return __R.spOptFx().spAb||"CHA";if(/^@sub:/.test(key))return key.slice(5)||"CHA";/* v63 */
 if(key==="@dmcon")return "CON";if(/^@dm:/.test(key)){const dv=B.ch["dab-"+key.slice(4)],wa=wxAb(key.slice(4));if(wa)return wa;return (Array.isArray(dv)&&dv[0])||"INT"}/* v58 */
 if(/^@mi:/.test(key)){const v=(B.pk||{})[key.slice(4)];return (v&&v.ab)||"WIS"}
 if(/^@ft:/.test(key)){const ff=allFeats().filter((x) =>{return x.key===key.slice(4)})[0];return (ff&&ff.asi&&ff.asi.a1)||"CHA"}/* v21 i3: the ability the feat raised */
 const p=cp.filter((q) =>{return q.cls===key})[0];if(p)return p.ab;const c=CLASSES[key];if(c&&c.cast)return c.cast;return cast||"CHA"}
export function clsLv(cls){const p=clsParts().filter((q) =>{return q.cls===cls})[0];return p?p.lv:0}

/* ---------- resource keys (L2) ---------- */
/* Keys no longer depend on the order of CLASSES.*.res. New key = prefix + name slug, e.g. "r-second-wind",
   "m-cleric-channel-divinity". The sheet saves uses per key (S.used), so keepResKeys() reuses the key the sheet
   already has for the same resource (same name and tag first, then same name): old builds keep "r0", "m0r1", "sw". No stored data is migrated. */
export function slugK(t){return String(t||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")}
export function resKey(pre,n,list){let b=pre+slugK(n),k=b,i=2;while(list.some((x) =>{return x.k===k}))k=b+"-"+(i++);return k}
export function keepResKeys(C){try{const st=window.__sheetState&&window.__sheetState(),P=st&&st.C;
 if(!P||P.name!==C.name||!Array.isArray(P.res)||!Array.isArray(C.res))return;
 const mine=function(k){return /^[rm]-/.test(k)},fixed={},took={},inh=[],used={};
 C.res.forEach((r) =>{if(!mine(r.k))fixed[r.k]=1});
 [1,0].forEach((ex) =>{C.res.forEach((r,i) =>{if(!mine(r.k)||inh[i])return;
  const q=P.res.filter((q) =>{return q&&q.k&&q.n===r.n&&!took[q.k]&&!fixed[q.k]&&(!ex||q.tag===r.tag)})[0];if(q){took[q.k]=1;inh[i]=q.k}})});
 C.res.forEach((r,i) =>{if(inh[i])used[inh[i]]=1;else if(!mine(r.k))used[r.k]=1});
 const keep=[];C.res.forEach((r,i) =>{if(mine(r.k)&&!inh[i]&&!used[r.k]){used[r.k]=1;keep[i]=1}});
 C.res.forEach((r,i) =>{if(!mine(r.k)||keep[i])return;if(inh[i]){r.k=inh[i];return}let b=r.k,k=b,n=2;while(used[k])k=b+"-"+(n++);r.k=k;used[k]=1})}catch(e){}}

/* ---------- manual sheet entries (M3 / RL12) ---------- */
/* Apply replaces the whole C, so sheet entries the builder never produces are lost: manual attacks ("Improvised Weapon") and manual resources
   (a "Healer's Kit" added by hand). manualLost(P, C) lists them: entries of the current sheet C (P) that are not builder-made and have no same-name entry in the
   new C. Builder-made attack = Unarmed Strike, a WEAPONS row (also "Alias (Weapon)" and "Weapon (thrown)"), or a SPELLS cantrip. Builder-made resource =
   a name in any CLASSES res/resSub, Luck Points, Hit Dice, Pact Slots, Spell Slots. Read only. Errors are swallowed (empty lists). */
export function manualLost(P,C){const out={attacks:[],res:[]};try{if(!P||!C)return out;
 const SM={};SPELLS.forEach((x) =>{SM[x[0]]=1});
 const isWep=function(n){n=String(n||"");if(WEAPONS[__R.baseOf(n).b])return true;const t=/^(.+) \(thrown\)$/.exec(n);if(t&&WEAPONS[__R.baseOf(t[1]).b])return true;const pm=/\(([^)]+)\)/.exec(n);return !!(pm&&WEAPONS[pm[1]])};
 const newA={};(C.attacks||[]).forEach((a) =>{if(a&&a.n)newA[a.n]=1});
 (P.attacks||[]).forEach((a) =>{if(!a||!a.n||newA[a.n])return;if(a.n==="Unarmed Strike"||isWep(a.n)||SM[a.n])return;out.attacks.push(a.n)});
 const known={"Luck Points":1,"Hit Dice":1};Object.keys(CLASSES).forEach((c) =>{const k=CLASSES[c];(k.res||[]).forEach((r) =>{known[r.n]=1});Object.keys(k.resSub||{}).forEach((s) =>{(k.resSub[s]||[]).forEach((r) =>{known[r.n]=1})})});
 const newR={};(C.res||[]).forEach((r) =>{if(r&&r.n)newR[r.n]=1});
 (P.res||[]).forEach((r) =>{if(!r||!r.n||newR[r.n])return;if(known[r.n]||/^(Pact Slots|Spell Slots)/.test(r.n))return;out.res.push(r.n)})}catch(e){}return out}

/* RL31: attack row that the sheet shows for a weapon (same die, ability, bonuses). Inside toSheet() the rows built so far are used (ATKC, set
   before the inventory and cleared after it). Outside toSheet() a fresh toSheet() runs. Inside a __inTS guard without ATKC (__itemMeta for an
   old manual sheet): null, so the caller keeps its own numbers and toSheet() is never re-entered */
export var ATKC=null;
export function atkRowFor(n){let L=ATKC;if(!L){if(window.__inTS)return null;L=__R.toSheet().attacks}for(let i=0;i<L.length;i++)if(L[i].n===n)return L[i];return null}

export function __set_SPX(v){ return SPX=v; }
export function __set_ATKC(v){ return ATKC=v; }
