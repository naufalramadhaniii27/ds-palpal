import {bindLive,clsLv,clsParts,featsOf,resKey,spLists,spRec} from "./01b-logic-late-ports.js";import {genv} from "./00-env.js";
import {SRC,mod} from "./01-logic-core-helpers.js";
import {DMAP,activeFx,spX,un} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {CL} from "./05-logic-choice-model-ruleset.js";
import {PACTB14} from "./08-logic-2014-rules.js";
import {subAt} from "./09-logic-feats-and-choices.js";

import {MCL,TL,baseOf,ensureInv,fxList,itemType,slotsAll} from "./01b-logic-late-ports.js";
bindLive("agOn",{get:function(){return agOn;}});
bindLive("invList",{get:function(){return invList;}});
bindLive("invLvl",{get:function(){return invLvl;}});
bindLive("invPicks",{get:function(){return invPicks;}});
bindLive("pactList",{get:function(){return pactList;}});
bindLive("pk",{get:function(){return pk;}});
bindLive("wlMc",{get:function(){return wlMc;}});
/* ---------- v17 ---------- */
/* RU40: class level that unlocks a subclass feature (subclass of the main class or a multiclass) */
function subClsOf(sub){let o=null;Object.keys(CLASSES).forEach((c) =>{if(CLASSES[c].subs&&CLASSES[c].subs[sub])o=c});return o}
export function luMax(m,lv,a,pb){if(typeof m==="number")return m;if(Array.isArray(m))return +m[lv-1]||0;if(m==="pb")return pb;if(m==="pb2")return 2*pb;if(m==="lvl")return lv;if(m==="half")return Math.floor(lv/2);
 if(typeof m==="string"&&m.indexOf("mod:")===0)return Math.max(1,mod(a.sc[m.slice(4)]));
 if(m&&m.f){let f=String(m.f).replace(/mod:([A-Z]{3})/g,(_,k) =>{return "("+mod(a.sc[k])+")"}).replace(/lvl/g,lv).replace(/pb/g,pb),v=0;if(/^[0-9+*\-\/() ]+$/.test(f)){try{v=Function("return ("+f+")")()}catch(e){v=0}}return Math.max(m.min||0,Math.floor(v))}return 0}
/* RU40: one Limited Use row per LU_X entry the character has, plus magic item charges. f = the feature or item that grants it (boxes show under it too) */
/* luRows() in parts (SOLID stage 13C): LU_OWNER finds the level of the owner of a table row, then one function per row source (table, fx entry, item) and one for Arcane Recovery */
const LU_OWNER={
 feat:function(e,c,R){const ff=c.feats.filter((f) =>{return f.n===e.owner})[0];if(!ff)return 0;if(R.mx==="mod:@asi")R.mx="mod:"+((ff.asi&&ff.asi.a1)||"CHA");else if(R.mx==="mod:@ab")R.mx="mod:"+(((B.ch["gx-ab-feat-"+(ff.key||ff.s)]||[])[0])||"INT");return c.TLv},/* mod:@asi = the ability the feat raised, mod:@ab = the ability picked (pick k "ab") */
 species:function(e,c){const sp=spX();if(!sp||B.species!==e.owner)return 0;if(/Speak with Animals/.test(e.n)&&(B.ch.lin||"").indexOf("Forest")!==0)return 0;if(e.opt&&(B.ch.spopt||[]).indexOf(e.opt)<0)return 0;return c.TLv},/* v74: e.opt, only when that species option is chosen */
 bg:function(e,c){if(B.bg!==e.owner)return 0;return c.TLv},/* tp: a background that tracks a use */
 class:function(e,c){const lv=clsLv(e.owner);if(e.feature==="Eldritch Invocations"){const inv=e.n.split(":")[0];if(c.iv.indexOf(inv)<0)return 0}return lv},
 sub:function(e){const sc=subClsOf(e.owner);return sc?subAt(sc,e.owner):0},
 hbcls:function(e){if(!(B.src||{})[e.pack])return 0;return clsLv(e.owner)}/* v20 RD24: a pack's class feature */};
function luTableRow(C,e,a,pb,c){const R={mx:e.max},lv=Object.prototype.hasOwnProperty.call(LU_OWNER,e.src)?LU_OWNER[e.src](e,c,R):0,mx=R.mx;
  if(!lv||lv<e.lvl)return;const m=luMax(mx,lv,a,pb);if(!(m>0))return;
  let rs=e.reset==="dawn"?"long":e.reset==="init"?"short":e.reset;if(e.short6&&lv>=6)rs="short";
  const o={k:resKey("x-",e.n,C.res),n:e.n,tag:e.tag||"",max:m,reset:rs,f:e.feature};if(e.pool)o.pool=1;if((e.src==="species"||e.src==="feat")&&e.owner)o.own=e.owner;/* v21 RU49 */if(e.reset==="init")o.tag=(o.tag?o.tag+", ":"")+"also regained when you roll Initiative";if(e.die)o.tag=(o.tag?o.tag+", ":"")+e.die;C.res.push(o)}
function luFxRow(C,e,q,a,pb){const lv=e.lv;let mx=q.max;if(typeof mx==="string"&&/^mod:@/.test(mx))mx="mod:"+((e.spCls&&/^@sub:/.test(e.spCls)?e.spCls.slice(5):"")||"CHA");const m=luMax(mx,lv,a,pb);if(!(m>0))return;let rs=q.reset==="dawn"||q.reset==="dusk"?"long":q.reset==="init"?"short":(q.reset||"long");if(q.short6&&lv>=6)rs="short";
  const o={k:resKey("x-",q.n||e.n,C.res),n:q.n||e.n,tag:q.tag||"",max:m,reset:rs,f:q.f||e.n};if(q.pool)o.pool=1;if(e.kind==="species"||e.kind==="feat")o.own=e.owner;luFxTags(o,q);C.res.push(o)}
function luFxTags(o,q){if(q.reset==="init")o.tag=(o.tag?o.tag+", ":"")+"also regained when you roll Initiative";if(q.reset==="dusk"||q.reset==="dawn")o.tag=(o.tag?o.tag+", ":"")+"back at "+q.reset;if(q.die)o.tag=(o.tag?o.tag+", ":"")+q.die}
function luItemRow(C,x){const d=DMAP[x.n],ch=d&&d[5]&&d[5].ch;if(!ch)return;if(d[3]&&!x.eq)return;let mx=+ch[0],dm=null;if(!(mx>0)){dm=diceTop(ch[0]);if(!(dm>0))return;mx=dm}/* v21 RU44: a starting number rolled on dice */const nev=ch[2]==="never"||String(ch[1])==="0",full=String(ch[1])==="all"||+ch[1]===mx,dym=/^([\dd]+) (days?|hours?)$/.exec(ch[2]);
  if(dym){C.res.push({k:resKey("i-",x.n,C.res),n:x.n,tag:"Each use is back after "+dym[1]+" "+dym[2]+". Tick it back when the time has passed."+(ch[3]?" "+ch[3]+".":""),max:mx,reset:"none",f:x.n,item:1});return}/* v56: Figurine of Wondrous Power and other items with a wait in days */
  luItemCharges(C,x,ch,mx,dm,nev,full)}
function luItemCharges(C,x,ch,mx,dm,nev,full){const when={dawn:"at dawn",dusk:"at dusk",long:"on a Long Rest",short:"on a Short Rest"}[ch[2]]||ch[2];
  C.res.push({k:resKey("i-",x.n,C.res),n:x.n,tag:(nev?"Charges, not regained":full?"Charges, all back "+when:"Charges, regains "+ch[1]+" "+when+" (type the roll in the rest dialog)")+(ch[3]?". "+ch[3]:""),max:mx,reset:nev?"none":full?(ch[2]==="short"?"short":"long"):"none",f:x.n,item:1,rg:!nev&&!full?String(ch[1]):undefined,when:!nev&&!full?ch[2]:undefined,dmax:dm?String(ch[0]):undefined})}
export function luRows(C,a,pb,feats){const TLv=TL(),iv=invList(),c={TLv:TLv,iv:iv,feats:feats};
 (typeof LU_X!=="undefined"?LU_X:[]).forEach((e) =>{luTableRow(C,e,a,pb,c)});
 /* fx engine v4: lu on any gfx entry = limited-use rows. lu:{n,max,reset,tag?,pool?,die?,f?,short6?} or an array of them. max: number, array by level (index = source level - 1), "pb", "pb2", "lvl", "half", "mod:WIS" (at least 1), or {f:"formula"} (see luMax); the level is the source level (class level for class and subclass, character level otherwise). reset: long, short, dawn, dusk, none, init */
 fxList().forEach((e) =>{if(!e.lu)return;(Array.isArray(e.lu)?e.lu:[e.lu]).forEach((q) =>{luFxRow(C,e,q,a,pb)})});
 ensureInv().forEach((x) =>{luItemRow(C,x)});
 luArc(C)}
function luArc(C){
 activeFx().forEach((q) =>{const n=q.fx&&q.fx.arcRec;if(n)C.res.forEach((r) =>{if(r.n==='Arcane Recovery'&&r.max<n){r.max=n;r.tag=(r.tag?r.tag+'. ':'')+q.n+': '+n+' uses between Long Rests'}})})/* v100: Grimoire Infinitus (Exalted) */}
/* v21 RU44: highest result of a dice expression such as "1d6+3" or "2d8+4" (0 when it is not one) */
function diceTop(t){const m=/^\s*(\d+)d(\d+)\s*(?:([+-])\s*(\d+))?\s*$/.exec(String(t||""));if(!m)return 0;return (+m[1])*(+m[2])+(m[3]==="-"?-1:1)*(+(m[4]||0))}
/* RU35 no. 5: features that add damage, as rows in Actions (C.xdmg [{n, sub, dmg, type, note, save, dc, src}]) */
export function xdmgRows(a,pb){const out=[],TLv=TL(),iv=invList(),SA=slotsAll();
 (typeof FDMG!=="undefined"?FDMG:[]).forEach((r) =>{let kind=r[0],own=r[1],lv=0;
  if(kind==="inv"){if(iv.indexOf(own)<0)return;lv=clsLv("Warlock")}
  else if(kind==="cls")lv=clsLv(own);
  else if(kind==="sub"){const sc=subClsOf(own);lv=sc?subAt(sc,own):0}
  else if(kind==="sp"){if(un("species")||B.species!==own)return;lv=TLv}
  if(!lv||lv<r[3])return;const g=r[10];if(g){const gp=g.split(":");if(/^p\d+opt$/.test(gp[0])&&B.ch[gp[0]]!==gp[1])return;if(gp[0]==="lin"&&(B.ch.lin||"").indexOf(gp[1])!==0)return}
  let dice=r[4]==="smite"?(SA.pact?(1+SA.pact.lvl)+"d8":""):r[4][lv-1]||"";if(!dice)return;
  dice=dice.replace(/^([A-Z]{3})d(\d+)/,(_,k,dd) =>{return Math.max(1,mod(a.sc[k]))+"d"+dd});if(r[9])dice+=(mod(a.sc[r[9]])<0?"":"+")+mod(a.sc[r[9]]);
  let ty=r[5];if(ty==="lin"){const mm=/\(([A-Za-z]+)\)/.exec(B.ch.lin||"");ty=mm?mm[1]:"ancestry type"}else if(ty==="weapon")ty="Weapon type";
  out.push({n:r[2],sub:kind==="inv"?"Eldritch Invocation":kind==="sp"?B.species:own,dmg:dice,type:ty.split("|").join(" or "),note:r[6],save:r[7]||"",dc:r[7]?8+mod(a.sc[r[8]])+pb:null,lv:lv})});
 return out}
/* RU35 no. 6: notes under Saving Throws (Advantage and bonuses from features, feats, species, items) */
export function saveNotes(feats){const o=[],seen={},fn=feats.map((f) =>{return f.n}),iv=invList(),sp=spX(),tr=sp?sp.traits.map((t) =>{return t[0]}):[],cf=[],cfo={};
 clsParts().forEach((q) =>{featsOf(q.cls,q.lv).forEach((x) =>{cf.push(x[1]);(cfo[x[1]]=cfo[x[1]]||[]).push(q.cls)});const s=q.sub||(q.cls===B.cls?B.sub:"");if(s&&CLASSES[q.cls].subs[s])CLASSES[q.cls].subs[s].forEach((x) =>{if(x[0]<=q.lv){cf.push(x[1]);(cfo[x[1]]=cfo[x[1]]||[]).push(s,q.cls)}})});
 /* fx engine v4: a SAVE_NOTES row may carry a 4th item, the owner (species name for a trait, class or subclass name for a class feature, feat name for a feat). With it the row counts only for that owner; without it the old match by name alone stays. Two sources with a feature of the same name (Kalashtar and Githzerai "Mental Discipline") no longer share a note */
 (typeof SAVE_NOTES!=="undefined"?SAVE_NOTES:[]).forEach((s) =>{if(!s[2]||seen[s[1]+s[2]+(s[3]||"")])return;let has=s[0]==="feat"?fn.indexOf(s[1])>=0:s[0]==="inv"?iv.indexOf(s[1])>=0:s[0]==="trait"?tr.indexOf(s[1])>=0:cf.indexOf(s[1])>=0;if(has&&s[3]){const w=s[3];has=s[0]==="trait"?B.species===w:s[0]==="feat"?fn.indexOf(w)>=0:s[0]==="inv"?true:(cfo[s[1]]||[]).indexOf(w)>=0}if(has){seen[s[1]+s[2]+(s[3]||"")]=1;o.push({t:s[2],s:s[1]})}});
 activeFx().forEach((q) =>{(q.fx.adv||[]).forEach((k) =>{if(/save|Concentration/i.test(k))o.push({t:"Advantage: "+k,s:q.n})})});
 return o}
export function invList(){let iv=[];Object.keys(B.ch||{}).forEach((k) =>{if(/invocation$/.test(k))iv=iv.concat(B.ch[k]||[])});return iv}
/* v32 RL49: every weapon with its mastery unlocked: class Weapon Mastery (main and multiclass), Masterful (species), Weapon Master feat */
export function wmAll(){const o=[],ks=Object.keys(B.ch||{}).filter((k) =>{return /^(m\d+:)?wm$|^spwep$|^wmf-/.test(k)&&Array.isArray(B.ch[k])});
 ks.sort((a,b) =>{const r=function(k){return k==="wm"?0:k==="spwep"?1:2};return r(a)-r(b)});ks.forEach((k) =>{B.ch[k].forEach((n) =>{if(o.indexOf(n)<0)o.push(n)})});return o}
/* v32: a Divine Order or Primal Order option of any Cleric or Druid part */
export function optAny(v){if(B.ch.p1opt===v)return true;return MCL().some((m,i) =>{return B.ch["m"+i+":p1opt"]===v})}
export function pactWeapon(){return invList().indexOf("Pact of the Blade")>=0?((B.ch.pactWep||[])[0]||""):""}
function pactList(){const o=[],seen={};ensureInv().forEach((x) =>{const w=WEAPONS[baseOf(x.n).b];if(w&&w.k==="M"&&!seen[x.n]){seen[x.n]=1;o.push([x.n,"In your inventory"+(x.eq?"":" (not active)")+": "+w.d+" "+w.t])}});
 Object.keys(WEAPONS).forEach((n) =>{const w=WEAPONS[n];if(w.k==="M"&&!seen[n]){seen[n]=1;o.push([n,"Conjured in your hand: "+w.d+" "+w.t])}});return o}
/* v32: cls = the class that owns the choice (its skill list), sub = its subclass. p.key replaces the key "p"+level+kind, p.feature names the feature card */
/* v35 p19: options already chosen at another level of the same kind (maneuver, metamagic) leave this list; this key's own picks stay */
function pkOthers(key,re){const mine=B.ch[key]||[],o={};Object.keys(B.ch||{}).forEach((k) =>{if(k!==key&&re.test(k)&&Array.isArray(B.ch[k]))B.ch[k].forEach((n) =>{if(mine.indexOf(n)<0)o[n]=1})});return o}
/* pk(): the pick builders by kind (p.k). Each gets (o,p,cls,plv) and returns the finished pick */
const PK_KINDS={
 lang:function(o,p,cls,plv){return Object.assign(o,{t:"lang",n:p.n||1,from:LANGS,title:p.title||"Language"});/* v63 */},
 cantrip:function(o,p,cls,plv){return Object.assign(o,{t:"multi",n:p.n||1,list:SPELLS.filter((x) =>{if(x[1])return false;if(p.only)return p.only.indexOf(x[0])>=0;return x[3].indexOf(p.list)>=0&&(p.incl||x[0]!=="Minor Illusion")}).map((x) =>{return [x[0],x[11]]}),title:p.title});/* v63: only = a fixed list, incl = Minor Illusion allowed *//* Iron Mind: a choice only when Wisdom saves come from elsewhere */},
 opts:function(o,p,cls,plv){return Object.assign(o,{t:"multi",n:p.n||1,list:p.list||[],title:p.title});/* tp P3e: a fixed list of named options */},
 tool:function(o,p,cls,plv){return Object.assign(o,{t:"tool",n:p.n,cats:p.cats,title:p.title||"Tool"});},
 plans:function(o,p,cls,plv){/* v58: Replicate Magic Item plans (EFotA). A plan table opens at its Artificer level, so a level 6 pick reads tables 2 and 6 */
  const pt=genv.EFA_PLANS||{},pm=pkOthers(o.key,/plans$/),pl=[];Object.keys(pt).map(Number).sort((a,b) =>{return a-b}).forEach((tl) =>{if(tl>p.l)return;pt[tl].forEach((r) =>{if(pm[r[0]])return;pl.push([r[0],"Plan from the level "+tl+" table."+(r[1]===1?" Needs attunement.":r[1]===2?" Choose the item with your DM.":"")])})});
  return Object.assign(o,{t:"multi",n:p.n,list:pl,title:p.title||"Magic item plans"})},
 spells:function(o,p,cls,plv){const smx=slotMaxOf(cls,plv);return Object.assign(o,{t:"multi",n:p.n,list:SPELLS.filter((x) =>{return x[1]<=smx&&p.lists.some((l) =>{return x[3].indexOf(l)>=0})}).map((x) =>{return [x[0],(x[1]?"Level "+x[1]:"Cantrip")+" ("+x[3].filter((l) =>{return p.lists.indexOf(l)>=0}).join(", ")+"). "+x[11]]}),title:p.title})},
 forms:function(o,p,cls,plv){const fl=wsList(plv);return Object.assign(o,{t:"multi",n:plv>=8?8:plv>=4?6:4,list:fl,title:p.title})},
 sav:function(o,p,cls,plv){const smx2=Math.max(2,slotMaxOf(cls,plv));return Object.assign(o,{t:"multi",n:2+Math.max(0,smx2-2),list:SPELLS.filter((x) =>{return x[1]>=1&&x[1]<=smx2&&x[2]===p.school&&x[3].indexOf("Wizard")>=0}).map((x) =>{return [x[0],"Level "+x[1]+". "+x[11]]}),title:p.title})},
 book:function(o,p,cls,plv){const bl=bookOf().filter((n) =>{const x=spRec(n);return x&&x[1]===p.lv&&(!p.act||/^Action/.test(x[4]))});return Object.assign(o,{t:"multi",n:p.n,list:bl.map((n) =>{return [n,spRec(n)[11]]}),title:p.title+(bl.length?"":" (add a fitting spell to your spellbook first)")})},
 bond:function(o,p,cls,plv){const bw=[];(B.inv||[]).forEach((x) =>{const b=baseOf(x.n).b;if(WEAPONS[b]&&!bw.some((y) =>{return y[0]===x.n}))bw.push([x.n,"In your inventory. "+itemType(b)+", "+WEAPONS[b].d+" "+WEAPONS[b].t+"."])});Object.keys(WEAPONS).forEach((n) =>{if(!bw.some((y) =>{return y[0]===n}))bw.push([n,itemType(n)+", "+WEAPONS[n].d+" "+WEAPONS[n].t+"."])});return Object.assign(o,{t:"multi",n:p.n,opt:1,list:bw,title:p.title})}/* v32 War Bond */,
 mlist:function(o,p,cls,plv){const ex=pkOthers(o.key,new RegExp(p.excl+"$"));return Object.assign(o,{t:"multi",n:p.n,list:(OPTS[p.list]||[]).filter((x) =>{return !ex[x[0]]&&(!x[2]||x[2]<=plv)}).map((x) =>{return [x[0],x[1]]}),title:p.title})}/* v64: pick from an OPTS list, no repeats across levels. v81: x[2] is the class level an option needs */,
 opt:function(o,p,cls,plv){return Object.assign(o,{t:"opt",list:p.list,title:p.title||p.list});},
 fs:function(o,p,cls,plv){return Object.assign(o,{t:"fs",title:"Additional Fighting Style"});},
 maneuver:function(o,p,cls,plv){const mx=pkOthers(o.key,/maneuver$/);return Object.assign(o,{t:"multi",n:p.n,list:MANEUVERS.filter((x) =>{return !mx[x[0]]}),title:"Maneuvers",feature:"Combat Superiority"})},
 metamagic:function(o,p,cls,plv){const mm=pkOthers(o.key,/metamagic$/);return Object.assign(o,{t:"multi",n:p.n,list:METAMAGIC.filter((x) =>{return !mm[x[0]]}),title:"Metamagic",feature:"Metamagic"})},
 invocation:function(o,p,cls,plv){const iv=pkOthers(o.key,/invocation$/);/* one invocation is not taken in two slots unless it says Repeatable */return Object.assign(o,{t:"multi",n:p.n,list:INVOCATIONS.filter((x) =>{return !iv[x[0]]||/Repeatable/i.test(x[1])}),title:"Eldritch Invocations",minLvl:1})},
 pact:function(o,p,cls,plv){return Object.assign(o,{t:"multi",n:1,list:PACTB14,title:"Pact Boon",feature:"Pact Boon"});/* v90 */}};
export function pk(p,src,cls,sub,pre){if(p.when){/* generic: the pick shows only while another pick holds the value (when:{key,val}), e.g. Warden Stalwart Spirit */const wv=B.ch[(pre||"")+p.when.key],wa=Array.isArray(wv)?wv:(wv?[wv]:[]);if(wa.indexOf(p.when.val)<0)return null}const o={key:p.key||("p"+p.l+p.k),lvl:p.l,src:SRC+", "+src};if(p.feature)o.feature=p.feature;
 if(p.k==="skill")return Object.assign(o,{t:"skills",n:p.n,from:p.from==="all"?ALLSK:p.from||(CLASSES[cls]||CL()).sk.from,title:p.title||"Extra class skill",ex:p.ex?1:0});
 if(p.k==="expertise")return Object.assign(o,{t:"exp",n:p.n,from:p.from,title:"Expertise",feature:p.feature||"Expertise"});
 if(p.yc)o.yc=1;if(p.ytx)o.ytx=1;const plv=clsLv(cls||B.cls)||B.level;
 if(p.cond==="wis"&&!wisElse())return null;
 if(p.cond==="minill"&&((spLists()[cls||B.cls])||[]).indexOf("Minor Illusion")<0)return null;/* Improved Illusions: only when Minor Illusion is known already */
 if(Object.prototype.hasOwnProperty.call(PK_KINDS,p.k))return PK_KINDS[p.k](o,p,cls,plv);
 return o}
/* v32 RL49: helpers of the new choices */
function slotMaxOf(cls,lv){const t=(CLASSES[cls]||{}).caster;if(t==="full")return SLOTS_FULL[lv-1].length;if(t==="half")return (lv>=2||(CLASSES[cls]||{}).efa||(CLASSES[cls]||{}).a14)?SLOTS_FULL[Math.ceil(lv/2)-1].length:0;if(t==="pact")return PACT[lv-1][1];return 0}
/* Wisdom saving throw proficiency from anything but Iron Mind (main class, Monk 14, Rogue 15, Resilient). Reads B only (no choices(), no recursion) */
export function wisElse(){if((CL().saves||[]).indexOf("WIS")>=0)return true;if(clsParts().some((q) =>{return (q.cls==="Monk"&&q.lv>=14)||(q.cls==="Rogue"&&q.lv>=15)}))return true;
 return Object.keys(B.ch||{}).some((k) =>{const v=B.ch[k];return v&&typeof v==="object"&&v.feat==="Resilient"&&v.a1==="WIS"})}
/* Wild Shape: Beast forms the Druid can learn at this Druid level (Circle of the Moon: its own levels), from CREATURES */
function wsList(lv){const moon=subAt("Druid","Circle of the Moon")>=3;return ((typeof CREATURES!=="undefined"&&CREATURES.creatures)||[]).filter((x) =>{const w=x.ws;if(!w)return false;return (w.lv!=null&&lv>=w.lv)||(moon&&w.moonLv!=null&&lv>=w.moonLv)}).map((x) =>{return [x.n,"CR "+x.cr+". Speed "+x.speed+"."]})}
/* Wizard spellbook: B.pk.book (level 1+ spells added by the player) plus prepared Wizard spells (a prepared spell is always in the book) and Savant spells */
export function wizLv(){return clsLv("Wizard")}
export function savVals(){let o=[];clsParts().forEach((q,i) =>{if(q.cls!=="Wizard")return;const v=B.ch[(q.mc?"m"+(i-1)+":":"")+"p3sav"];if(Array.isArray(v))o=o.concat(v)});return o}
export function bookOwn(){if(!wizLv())return [];const o=[],sv=savVals(),ad=function(n){const x=spRec(n);if(x&&x[1]&&o.indexOf(n)<0&&sv.indexOf(n)<0)o.push(n)};((B.pk||{}).book||[]).forEach(ad);(spLists().Wizard||[]).forEach(ad);return o}
export function bookOf(){const o=bookOwn().slice();savVals().forEach((n) =>{if(o.indexOf(n)<0)o.push(n)});return o}
export function bookNeed(){const l=wizLv();return l?6+2*(l-1):0}
/* invocations that hold a choice. mc: the multiclass index of the Warlock part (RL50), lvl: the Warlock level the invocation was taken at */
function wlMc(){if(B.cls==="Warlock")return undefined;let i;MCL().forEach((m,j) =>{if(m.cls==="Warlock")i=j});return i}
function invLvl(n){let lv=99;Object.keys(B.ch||{}).forEach((k) =>{const m=/^(?:m\d+:)?p(\d+)invocation$/.exec(k);if(m&&(B.ch[k]||[]).indexOf(n)>=0)lv=Math.min(lv,+m[1])});return lv===99?1:lv}
function wlCantrips(){const o=[];((spLists().Warlock)||[]).concat(B.ch.tomeC||[]).forEach((n) =>{const x=spRec(n);if(x&&!x[1]&&o.indexOf(n)<0)o.push(n)});return o}
function invPicks(){const out=[],iv=invList(),wl=clsLv("Warlock");if(!wl||typeof INV_PICK==="undefined")return out;const mc=wlMc(),can=wlCantrips(),src=function(n){return SRC+", "+n+" (Warlock "+invLvl(n)+(mc!=null?", multiclass":"")+")"};
 Object.keys(INV_PICK).forEach((n) =>{const q=INV_PICK[n],cnt=iv.filter((x) =>{return x===n}).length;if(!cnt)return;
  if(q.feat){for(let j=1;j<=cnt;j++){const o=Object.assign({key:q.key+j,lvl:invLvl(n),t:"ofeat",title:n+": Origin feat"+(cnt>1?" "+j:""),src:src(n),feature:"Eldritch Invocations",inv:n},mc!=null?{mc:mc}:{});out.push(o)}return}
  const L2=can.filter((c) =>{const x=spRec(c),fx=typeof SPELL_FX!=="undefined"&&SPELL_FX[c];if(q.dmg&&!(fx&&fx.dmg))return false;if(q.atk&&x[10]!=="ATK")return false;if(q.rng){const r=/(\d+) f/.exec(x[5]||"");if(!r||+r[1]<q.rng)return false}return true});
  out.push(Object.assign({key:q.key,lvl:invLvl(n),t:"multi",n:cnt,list:L2.map((c) =>{return [c,spRec(c)[11]]}),title:n+": cantrip"+(cnt>1?"s":"")+(L2.length?"":" (learn a fitting Warlock cantrip first)"),src:src(n),feature:"Eldritch Invocations",inv:n},mc!=null?{mc:mc}:{}))});return out}
/* Agonizing Blast: the chosen cantrips. Not chosen yet: Eldritch Blast, as before v32 (the choice stays marked as open) */
export function agOn(n){const v=B.ch.invab;if(Array.isArray(v)&&v.length)return v.indexOf(n)>=0;return n==="Eldritch Blast"&&invList().indexOf("Agonizing Blast")>=0}
/* the values of choices with yc (shown as "Your choice." under the feature on the sheet). mc: multiclass index or undefined */
export function ycOf(CH,feature,mc){let o=[],tx=[];CH.forEach((c) =>{if(!c.yc||c.feature!==feature||c.mc!==mc)return;const v=B.ch[c.key];if(Array.isArray(v)){o=o.concat(v);if(c.ytx&&Array.isArray(c.list))v.forEach((n) =>{const r=c.list.filter((x) =>{return x[0]===n})[0];if(r&&r[1])tx.push("**"+n+".** "+r[1])})}else if(v&&typeof v==="string")o.push(v)});/* v81: ytx adds the text of each chosen option before the choice line */return o.length?(tx.length?" "+tx.join(" "):"")+" **Your choice.** "+o.join(", ")+".":""}
export function isDone(c){const v=B.ch[c.key];if(c.def&&v==null)return true;if(c.opt)return v==null||v===""||(Array.isArray(v)&&v.length<=c.n)||c.t==="text";/* v32: optional choice (War Bond) *//* v32: a default counts as chosen */
 if(c.t==="skills"||c.t==="exp"||c.t==="multi"||c.t==="wm"||c.t==="lang"||c.t==="tool"||c.t==="pe")return Array.isArray(v)&&v.length===c.n;
 if(c.t==="sub")return !!B.sub;
 if(c.t==="mcsub")return !!(B.mc[c.mc]&&B.mc[c.mc].sub);
 if(c.t==="feat"){if(!v||!v.feat)return false;const F=FEATS[v.feat];if(!F)return false;/* M12: feat missing from FEATS (pack off, renamed) */if(F.dt&&!v.dt)return false;/* v19 RL46 (4) */if(F.asi2)return !!(v.a1&&v.a2);if(F.asi)return !!v.a1;return true}
 if((c.t==="fs"||c.t==="ofeat")&&!FEATS[v])return false;/* RL28: saved feat missing from FEATS, card shows "(not available)" */
 return !!v}

