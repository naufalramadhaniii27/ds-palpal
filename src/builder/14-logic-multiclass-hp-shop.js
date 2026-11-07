import {bindLive} from "./01b-logic-late-ports.js";import {SRC,esc,mod,pbOf} from "./01-logic-core-helpers.js";
import {DMAP,bgX,kitGP,un,ovFx} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {CL,R14} from "./05-logic-choice-model-ruleset.js";
import {pEff,subLbl,subLv} from "./08-logic-2014-rules.js";
import {allFeats,gxPicks} from "./09-logic-feats-and-choices.js";
import {luMax,pk} from "./10-logic-v17-additions.js";
import {abil,fxList,fxVal,isThird3} from "./11-logic-derivation.js";
import {subChoicesFor} from "./13-logic-sources-and-packs.js";

import {bindLate} from "./01b-logic-late-ports.js";
import {gx} from "./00-env.js";
import {provideQueries} from "./01a-logic-query-registry.js";

bindLive("mcChoices",{get:function(){return mcChoices;}});
bindLate({MCL,TL,baseOf,ensureInv,itemW,slotsAll,syncPickItems,hpCalc,effArmor,effShield,effWeps});/* the late ports of this file (01b-logic-late-ports.js) */
provideQueries({MCL,TL,baseOf,clsKitText,effArmor,effShield,effWeps,ensureInv,eqIdx,equippable,gpNow,hpBonusList,hpCalc,itemCost,itemW,itemWEst,langKeys,mcResMax,monkRule,qOf,rarityOf,slotsAll,syncPickItems,wpNamed});
/* ---------- multiclass, HP, shop ---------- */
export function MCL(){return (B.mc||[]).filter((m) =>{return CLASSES[m.cls]})}
export function TL(){return B.level+MCL().reduce((t,m) =>{return t+m.lv},0)}
/* M10: every B.ch key that holds languages: lang, langRogue, langRanger, and m<i>:langRogue / m<i>:langRanger for a multiclass */
export function langKeys(){return ["lang","langRogue","langRanger"].concat(Object.keys(B.ch||{}).filter((k) =>{return /^m\d+:lang(Rogue|Ranger)$/.test(k)||/^(m\d+:)?p\d+(lang|slang)\w*$/.test(k)}))}/* v63: subclass language picks */
export function mcReqFail(cls){const a=abil().sc;return (MC_REQ[cls]||[]).filter((g) =>{return !g.some((k) =>{return a[k]>=13})}).map((g) =>{return g.join(" or ")+" 13"}).join(", ")}
function mcChoices(){const out=[];MCL().forEach((m,i) =>{const c=CLASSES[m.cls],p="m"+i+":",src=function(l){return SRC+", "+m.cls+" "+l+" (multiclass)"};
 const g=MC_GRANT[m.cls]||{};/* a class without an mcg entry (Warmage, Necromancer, Investigator) grants nothing */if(g.sk)out.push({key:p+"sk",mc:i,lvl:1,t:"skills",n:1,from:g.skFrom==="any"?ALLSK:c.sk.from,title:m.cls+" multiclass skill",src:src(1)});
 if(g.toolPick)out.push({key:p+"tool",mc:i,lvl:1,t:"tool",n:g.toolPick.n,cats:g.toolPick.cats,title:m.cls+" multiclass tool",src:src(1),feature:"Multiclass Proficiencies"});/* v32 RL49 */
 if(c.wm&&!R14())out.push({key:p+"wm",mc:i,lvl:1,t:"wm",n:c.wm[m.lv-1],melee:m.cls==="Barbarian"?1:0,title:m.cls+" Weapon Mastery",src:src(1),feature:"Weapon Mastery"});/* v32 RL49 no. 39 */
 if(c.fs&&m.lv>=c.fs){out.push({key:p+"fs",mc:i,lvl:c.fs,t:"fs",cls:m.cls,xopt:1,title:"Fighting Style",src:src(c.fs),feature:"Fighting Style"});
  const fv=B.ch[p+"fs"];if(fv==="Blessed Warrior"||fv==="Druidic Warrior"){const cl2=fv==="Blessed Warrior"?"Cleric":"Druid";out.push({key:p+"bwc",mc:i,lvl:c.fs,t:"multi",n:2,list:SPELLS.filter((x) =>{return !x[1]&&x[3].indexOf(cl2)>=0}).map((x) =>{return [x[0],x[11]]}),title:fv+" cantrips",src:src(c.fs),feature:"Fighting Style"})}}/* v32 RL49 no. 42 */
 (c.pick||[]).forEach((q) =>{if(m.lv>=q.l){const o=pk(q,m.cls+" "+q.l,m.cls,undefined,p);if(!o)return;o.key=p+o.key;o.mc=i;if(o.list===INVOCATIONS)o.lvCap=m.lv;/* v32: level of this class */if(o.t==="skills"||o.t==="exp")o.src=src(q.l);out.push(o)}});/* v32 RL49 no. 40: Primal Knowledge too */
 /* M10: Rogue 1 (Thieves' Cant: one more language) and Ranger 2 (Deft Explorer: two languages) also as a multiclass */
 if(m.cls==="Rogue"&&!R14())out.push({key:p+"langRogue",mc:i,lvl:1,t:"lang",n:1,from:LANGS,title:"Extra language",src:src(1),feature:"Thieves' Cant"});
 if(m.cls==="Ranger"&&m.lv>=2&&!R14())out.push({key:p+"langRanger",mc:i,lvl:2,t:"lang",n:2,from:LANGS,title:"Languages",src:src(2),feature:"Deft Explorer"}); if(m.lv>=subLv(m.cls))out.push({key:p+"sub",mc:i,lvl:subLv(m.cls),t:"mcsub",title:subLbl(m.cls),src:src(subLv(m.cls))});
 const ps=c.pickSub&&c.pickSub[m.sub];(ps||[]).forEach((q) =>{const el=pEff(m.cls,m.sub,q);if(m.lv>=el){const o=pk(q,m.sub+" "+el,m.cls,m.sub);if(!o)return;o.lvl=el;o.key=p+o.key;o.mc=i;out.push(o)}});
 if(m.sub)subChoicesFor(m.sub).forEach((q) =>{if(m.lv>=q.l)out.push(q.kind==="opt"?{key:p+"sc"+q.k,mc:i,lvl:q.l,t:"multi",n:q.n,list:q.list,title:q.title,src:m.sub+" "+q.l,feature:q.feature}:{key:p+"sc"+q.k,mc:i,lvl:q.l,t:"skills",n:q.n,from:q.from,title:q.title,src:m.sub+" "+q.l,feature:q.feature})});/* v20 M2 */
 /* fx engine: fsPick on a subclass of a multiclass part, key "m<i>:sfs<l>" (same as the main class "sfs<l>") */if(m.sub&&gx().sub)(gx().sub[m.sub]||[]).forEach((e) =>{if(e.fsPick&&m.lv>=(e.l||1))out.push({key:p+"sfs"+(e.l||1),mc:i,lvl:e.l||1,t:"fs",cls:m.cls,xopt:1,title:"Fighting Style",src:m.sub+" "+(e.l||1),feature:e.n||"Fighting Style"})});
 [4,8,12,16].concat(c.asiX||[]).forEach((l) =>{if(m.lv>=l)out.push({key:p+"feat"+l,mc:i,lvl:l,t:"feat",cat:"G",title:"Ability Score Improvement or feat",src:SRC+", General Feat ("+m.cls+" "+l+")"})});
 if(m.lv>=19)out.push({key:p+"feat19",mc:i,lvl:19,t:"feat",cat:"E",title:"Epic Boon",src:SRC+", Epic Boon ("+m.cls+" 19)"})});
 return out}
function rollAvg(hd){return hd/2+1}
export function hpCalc(){const a=abil(),cm=mod(a.sc.CON),c=CL(),list=[],L=B.level;B.hpr=B.hpr||{};
 function push(cls,hd,lv){const key=cls+lv,r=B.hpMode==="roll"?+B.hpr[key]:0;const v=(r>=1&&r<=hd)?r:rollAvg(hd);list.push({c:cls+" "+lv,v:v,r:B.hpMode==="roll"&&r>=1&&r<=hd?1:0,n:"d"+hd,key:key,hd:hd})}
 for(let l=2;l<=L;l++)push(B.cls,c.hd,l);
 MCL().forEach((m) =>{for(let l=1;l<=m.lv;l++)push(m.cls,CLASSES[m.cls].hd,l)});
 const tl=TL(),bonus=toSheetHpBonus(),max=c.hd+list.reduce((t,e) =>{return t+e.v},0)+cm*tl+bonus;
 return {max:Math.max(1,max),list:list}}
/* M4 (RL10): one list of HP bonuses, read by hpCalc() (total) and toSheet() (C.hpBonus). Draconic Resilience counts the Sorcerer level in any
   class: +3 at Sorcerer 3 and +1 for each later Sorcerer level, so the bonus equals the Sorcerer level (PHB 2024 p. 148) */
/* M17: read from data. SPECIES.hpPerLevel (+hpName), CLASSES.*.hpSub[sub] {v per class level, from level l}, FEATS.hp (per level) and hpFlat */
function hpBonusList(){const o=[],L=TL(),spx=SPECIES[B.species];if(spx&&spx.hpPerLevel)o.push({s:(spx.hpName||B.species)+" ("+(spx.hb||SRC)+")",v:spx.hpPerLevel*L});
 [[B.cls,B.sub,B.level,0]].concat(MCL().map((m) =>{return [m.cls,m.sub,m.lv,1]})).forEach((q) =>{const h=(CLASSES[q[0]].hpSub||{})[q[1]];if(h&&q[2]>=h.l)o.push({s:h.n+" ("+SRC+(q[3]?", "+q[0]+" "+q[2]+", multiclass":"")+")",v:h.v*q[2]})});
 fxList().forEach((e) =>{if(e.hp==="con+lvl")o.push({s:e.lbl,v:mod(abil().sc.CON)+e.lv});if(e.hpLvl!=null){const v=fxVal(e.hpLvl,e)*e.lv;if(v)o.push({s:e.lbl,v:v})}if(e.hpFlat!=null){const v=fxVal(e.hpFlat,e);if(v)o.push({s:e.lbl,v:v})}});/* generic: fx.hp "con+lvl", hpLvl per level of the source (class level for cls and sub, character level for the rest), hpFlat */
 allFeats().forEach((f) =>{const F=FEATS[f.n];if(F&&F.hp)o.push({s:f.n+" feat ("+f.s+")",v:F.hp*L});if(F&&F.hpFlat)o.push({s:f.n,v:F.hpFlat})});return o}
function toSheetHpBonus(){return hpBonusList().reduce((t,x) =>{return t+x.v},0)}
function casterLv(cls,sub,lv){const c=CLASSES[cls];if(c.caster==="full")return lv;if(c.caster==="half")return R14()&&!c.a14?Math.floor(lv/2):Math.ceil(lv/2);/* v92: 2014 Paladin and Ranger count half their levels rounded down */if(isThird3(sub))return Math.floor(lv/3);return 0}
export function slotsAll(){const parts=[{cls:B.cls,sub:B.sub,lv:B.level}].concat(MCL().map((m) =>{return {cls:m.cls,sub:m.sub,lv:m.lv}}));
 let pact=null,cast=parts.filter((p) =>{return p.cls!=="Warlock"&&casterLv(p.cls,p.sub,p.lv)>0});
 parts.forEach((p) =>{if(p.cls==="Warlock"){const q=PACT[p.lv-1];pact={n:q[0],lvl:q[1]}}});
 let slots=null;
 if(cast.length===1){const p=cast[0],c=CLASSES[p.cls];slots=c.caster==="full"?SLOTS_FULL[p.lv-1]:c.caster==="half"?SLOTS_FULL[Math.ceil(p.lv/2)-1]:p.lv>=3?SLOTS_FULL[Math.ceil(p.lv/3)-1]:null}
 else if(cast.length>1){const s=cast.reduce((t,p) =>{return t+casterLv(p.cls,p.sub,p.lv)},0);slots=s>0?SLOTS_FULL[Math.min(20,s)-1]:null}
 return {slots:slots,pact:pact}}
/* fx engine v6: slotAdd [{lvl,n,ifHave,max}] of the active entries applied to a slot array (the sheet does the same on C.spellcasting.slots). Returns a new array, the input is not changed. Used by the builder spell step */
export function slotAddApply(slots){if(!slots)return slots;let sl=slots.slice(),add=[];fxList().forEach((e) =>{if(e.cond)return;(Array.isArray(e.slotAdd)?e.slotAdd:e.slotAdd?[e.slotAdd]:[]).forEach((q) =>{let lv=q.lvl;if(lv==="high"){lv=0;sl.forEach((n,i) =>{if(n>0&&(!q.max||i+1<=q.max))lv=i+1})}if(!lv||lv>9)return;if(q.ifHave&&!(sl[lv-1]>0))return;while(sl.length<lv)sl.push(0);sl[lv-1]+=q.n||1;add.push([lv,q.n||1,e.lbl])})});sl.fxAdd=add;return sl}
export function mcResMax(r,a,L){if(Array.isArray(r.max))return r.max[L-1];if(r.max&&r.max.f)return luMax(r.max,L,a,pbOf(TL()));if(r.max==="lvl")return L<2&&r.min2?0:L;if(r.max==="lvl5")return L*5;/* m6 */if(typeof r.max==="string"&&r.max.indexOf("mod:")===0)return Math.max(1,mod(a.sc[r.max.slice(4)]));return r.max}
/* shop: gp prices */
export function gpBase(){const bg=bgX(),t=clsKitText();return (B.eqC==="none"||un("eqC")||un("cls")?0:/^\d+ GP$/.test(t)?parseInt(t):kitGP(t))+(bg&&B.eqB!=="none"&&!un("eqB")?(B.eqB==="A"?bg.gp:50):0)}/* V14-5: nothing before it is chosen */
function spent(){return (B.buy||[]).reduce((t,x) =>{return t+(x.p||0)*(x.q||1)},0)}

export function eqIdx(){const o=CLASSES[B.cls].eq,i="ABC".indexOf(B.eqC||"A");return i>=0&&i<o.length?i:0}
function clsKitText(){const c=CLASSES[B.cls];return R14()&&c.eqg&&eqIdx()===0?eq14Text():c.eq[eqIdx()]}
/* v93: the 2014 class kit is a set of "(a) or (b)" lines. B.eqG holds the letter of each line (first by default), B.eqP the weapon or instrument picked for "any martial weapon" and the like */
function eq14Pick(it,gi,ii,j){const lst=EQ14D.l[it[0].slice(1)],v=(B.eqP||{})[gi+"_"+ii+"_"+j];return lst.indexOf(v)>=0?v:lst[0]}
function eq14Key(grp,gi){const k=(B.eqG||[])[gi];return grp._?"_":(k&&grp[k]?k:"a")}
function eq14Text(){const c=CLASSES[B.cls],g=c&&c.eqg;if(!g)return c.eq[0];const agg=[];
 g.g.forEach((grp,gi) =>{grp[eq14Key(grp,gi)].forEach((it,ii) =>{for(let j=0;j<(it[0].charAt(0)==="@"?it[1]:1);j++){var n=it[0].charAt(0)==="@"?eq14Pick(it,gi,ii,j):it[0],q=it[0].charAt(0)==="@"?1:it[1],f=agg.filter((a) =>{return a[0]===n})[0];if(f)f[1]+=q;else agg.push([n,q])}})});
 return agg.map((a) =>{return a[1]>1?a[1]+" "+a[0]:a[0]}).join(", ")}
const EQ14W={wm:"martial weapon",ws:"simple weapon",wmm:"martial melee weapon",wsm:"simple melee weapon",im:"musical instrument"};
function eq14Lbl(items){return items.map((it) =>{const n=it[0];if(n.charAt(0)==="@"){const w=EQ14W[n.slice(1)];return it[1]>1?"two "+w+"s":"any "+w}return it[1]>1?it[1]+" "+n+"s":n}).join(", ")}
export function clsKitText0(){const i=B.eqC;B.eqC="A";const t=clsKitText();B.eqC=i;return t}
export function eq14UI(){const c=B.cls&&CLASSES[B.cls],g=c&&c.eqg;if(!R14()||!g||un("cls")||B.eqC==="none"||B.eqC==="B")return "";
 let h='<h3 class="eqh">Your Kit, Line by Line</h3><div class="eqbox eqg14">';
 g.g.forEach((grp,gi) =>{const cur=eq14Key(grp,gi),ks=["a","b","c"].filter((k) =>{return grp[k]});
  if(grp._)h+='<p class="fd">'+esc(eq14Lbl(grp._))+'</p>';
  else h+='<div class="eqln">'+ks.map((k,i) =>{return (i?'<p class="or">OR</p>':'')+'<button type="button" class="eqo'+(cur===k?" on":"")+'" data-eqg="'+gi+'" data-v="'+k+'"><span class="bcb"></span>('+k+') '+esc(eq14Lbl(grp[k])+(grp[k+"n"]?" ("+grp[k+"n"]+")":""))+'</button>'}).join("")+'</div>';
  grp[cur].forEach((it,ii) =>{if(it[0].charAt(0)!=="@")return;for(let j=0;j<it[1];j++){var lst=EQ14D.l[it[0].slice(1)],v=eq14Pick(it,gi,ii,j);h+='<label class="eqp"><span>'+esc(EQ14W[it[0].slice(1)].replace(/^./,(x) =>{return x.toUpperCase()}))+(it[1]>1?" "+(j+1):"")+'</span><select class="dd" data-eqp="'+gi+"_"+ii+"_"+j+'" aria-label="'+esc(EQ14W[it[0].slice(1)])+'">'+lst.map((n) =>{return '<option'+(n===v?" selected":"")+'>'+esc(n)+'</option>'}).join("")+'</select></label>'}})});
 return h+'</div>'}

const SING={"Daggers":"Dagger","Javelins":"Javelin","Handaxes":"Handaxe","Arrows":"Arrows","Bolts":"Bolts","Pouches":"Pouch","Costumes":"Costume","Flasks":"Flask","Torches":"Torch","Ink Pens":"Ink Pen","Vials":"Vial","Candles":"Candle","Glass Bottles":"Glass Bottle"};
function parseKit(t,src){const out=[];if(!t||/^\d+ GP$/.test(t))return out;t.split(/,\s*/).forEach((p) =>{p=p.trim();if(!p||/^\d+ GP$/.test(p))return;
 let m=/^(\d+)\s+(.+)$/.exec(p),q=1,n=p;if(m&&!/^\d+ Arrows|^\d+ Bolts/.test(p)){q=+m[1];n=m[2]}
 if(/^20 Arrows$/.test(p)){n="Arrows (20)";q=1}if(/^20 Bolts$/.test(p)){n="Bolts (20)";q=1}
 n=SING[n]||n;out.push({n:n,q:q,src:src})});return out}
function kitItems(){let bg=BACKGROUNDS[B.bg],k=B.eqC==="none"||un("eqC")||un("cls")?[]:parseKit(clsKitText(),B.cls+" kit");/* RU30: no kit before it is chosen */if(bg&&B.eqB==="A"&&!un("eqB")&&!un("bg"))k=k.concat(parseKit(bg.eq,B.bg+" kit"));return k}
/* v32 p21: a kit name read as a GEAR item and a count: "Parchment (10 sheets)" [Parchment, 10], "Book (prayers)" [Book, 1], "Hooded Lantern" [Lantern, Hooded, 1]. null: not gear */
const GEAR_AL={"Hooded Lantern":"Lantern, Hooded","Bullseye Lantern":"Lantern, Bullseye","Iron Pot":"Pot, Iron","Iron Spikes":"Spikes, Iron","Glass Bottle":"Bottle, Glass","Portable Ram":"Ram, Portable"};
function gearKey(n){const g=function(k){return GEAR.filter((x) =>{return x[0]===k})[0]};if(GEAR_AL[n])return [g(GEAR_AL[n]),1];const m=/^(.+?) \((\d+) (?:sheets|flasks|days?)\)$/.exec(n);if(m){const b=m[1]==="Oil"?"Oil (flask)":m[1]==="Rations"?"Rations (1 day)":m[1];if(g(b))return [g(b),+m[2]]}
 const f=/^(Book|Arcane Focus|Druidic Focus|Holy Symbol|Costume) \(([^()]+)\)$/.exec(n);if(f&&!WEAPONS[f[2]]&&g(f[1]))return [g(f[1]),1];return null}
export function itemW(n){const n0=n;n=baseOf(n).b;if(WEAPONS[n])return WEAPONS[n].w;if(ARMOR[n])return ARMOR[n].w;if(n==="Shield")return 6;const g=GEAR.filter((x) =>{return x[0]===n})[0];if(g)return g[2];const gk=gearKey(n);if(gk)return gk[0][2]*gk[1];/* v32 p21 */const m=DMAP[n0]||DMAP[n];return m?magicW(m):0}
function itemWEst(n){const b=baseOf(n).b;if(WEAPONS[b]||ARMOR[b]||b==="Shield"||GEAR.some((x) =>{return x[0]===b})||gearKey(b))return false;const m=DMAP[n]||DMAP[b];return !!m&&magicW(m,1)===1}
/* v27 RD20: magic item weight. The text of the item ("weighs 5 pounds"), else the name, else the type (MAGIC_WN, MAGIC_WT in db4.js). est: not from the DMG */
function magicW(m,est){const x=/\bweighs (\d+(?:\.\d+)?) pounds?\b/.exec(String(m[4]||""));if(x)return est?0:+x[1];if(typeof MAGIC_WN==="undefined")return 0;const e=MAGIC_WN.filter((r) =>{return new RegExp(r[0],"i").test(m[0])})[0];if(est)return 1;return e?e[1]:(MAGIC_WT[m[1]]!=null?MAGIC_WT[m[1]]:0)}
export function itemCost(n){if(PRICE[n]!=null)return PRICE[n];const g=GEAR.filter((x) =>{return x[0]===n})[0];if(!g){const gk=gearKey(n);return gk?Math.round(gk[0][1]*gk[1]*100)/100:null}/* v32 p21 */return g[1]}
export function equippable(n){n=baseOf(n).b;return !!(WEAPONS[n]||ARMOR[n]||n==="Shield")}
/* D1: Monk weapon (PHB Martial Arts): Simple Melee, or Martial Melee with the Light property */
/* v89: 2014 weapon lists name the weapons (Longswords, Hand Crossbows). A token matches a weapon by its singular name */
export function wpNamed(list,n){return String(list||"").split(/,\s*/).some((t) =>{t=t.replace(/\s*\(.*$/,"");return t===n||t.replace(/s$/,"")===n||(t==="Quarterstaffs"&&n==="Quarterstaff")})}
function monkRule(w,nm){if(!w||w.k!=="M")return false;if(R14())return nm==="Shortsword"||(w.cat==="S"&&!/Two-Handed|Heavy/.test(w.p||""));return w.cat==="S"||/Light/.test(w.p)}
function monkWep(n){const w=WEAPONS[baseOf(n).b];return !!w&&monkRule(w,baseOf(n).b)}
/* v32 RU134: the items of one pack. The container is named after the pack ("Backpack (Explorer's Pack)"), with a number when that name is taken in L */
export function packOut(p,L){const P=PACKS[p];if(!P)return [];let nm=P[0]+" ("+p+")",k=2,has=function(n){return (L||[]).some((y) =>{return y.n===n})};while(has(nm))nm=P[0]+" ("+p+" "+(k++)+")";
 return [{n:nm,q:1,eq:false}].concat(P[1].map((x) =>{return {n:x[0],q:x[1],eq:false,in:nm}}))}
export function rebuildKit(unpack){B.inv=(B.inv||[]).filter((x) =>{return !x.kit});let hasArmor=B.inv.some((x) =>{return ARMOR[x.n]&&x.eq});
 kitItems().forEach((x) =>{if(unpack&&PACKS[x.n]){for(let pk2=0;pk2<(x.q||1);pk2++)packOut(x.n,B.inv).forEach((y) =>{y.src=x.src;y.kit=1;B.inv.push(y)});return}/* v32 RU134 */let eq=equippable(x.n);if(ARMOR[x.n]){eq=!hasArmor;hasArmor=true}/* D1: a Monk does not start holding a non-Monk weapon */if(eq&&B.cls==="Monk"&&WEAPONS[baseOf(x.n).b]&&!monkWep(x.n))eq=false;B.inv.push({n:x.n,q:x.q,eq:eq,src:x.src,kit:1})})}
function normInv(){(B.inv||[]).forEach((x) =>{if(x.alias&&/^Spell Scroll \(/.test(x.alias)){x.n=x.alias;delete x.alias;x.eq=false;return}if(x.alias||/^Spell Scroll \(/.test(x.n))return;const bn=baseOf(x.n).b;if(WEAPONS[bn]||ARMOR[bn]||bn==="Shield"||DMAP[x.n]||itemCost(bn)!=null)return;const pm=/\(([^)]+)\)/.exec(x.n);if(pm&&(WEAPONS[pm[1]]||ARMOR[pm[1]]||itemCost(pm[1])!=null)){x.alias=x.n;x.n=pm[1];if(WEAPONS[pm[1]])x.eq=true}})}
export function ensureInv(){normInv();if(!B.inv){B.inv=[];if(B.armor)B.inv.push({n:B.armor,q:1,eq:true});if(B.shield)B.inv.push({n:"Shield",q:1,eq:true});(B.weps||[]).forEach((n) =>{B.inv.push({n:n,q:1,eq:true})});(B.buy||[]).forEach((x) =>{if(!B.inv.some((y) =>{return y.n===x.n}))B.inv.push({n:x.n,q:x.q||1,eq:equippable(x.n)})});rebuildKit()}return B.inv}
/* fx pick t:"item": the chosen items join B.inv (row tag px = pick key) when the pick is made and leave when the pick changes. B.px[key] lists the names already added, so an item the player deleted by hand does not come back. Names without item data stay record-only */
let pxBusy=false;
export function syncPickItems(){if(pxBusy)return;pxBusy=true;try{ensureInv();const want={};gxPicks().forEach((o) =>{if(!o.gxi)return;const v=B.ch[o.key];want[o.key]=(Array.isArray(v)?v:(v?[v]:[]))});
 /* fx engine v6: grantItem [{n,q}] on an active entry puts the item in B.inv (row tag px = "fx:kind:owner:idx:i") and takes it out when the entry stops counting (item unequipped, level, toggle). A copy the player owns without the px tag is never touched */const gq={};fxList().forEach((e) =>{(Array.isArray(e.grantItem)?e.grantItem:e.grantItem?[e.grantItem]:[]).forEach((g,i) =>{if(!g||!g.n)return;const k="fx:"+e.kind+":"+e.okey+":"+e.idx+":"+i;want[k]=[g.n];gq[k]=g.q||1})});
 const px=B.px||(B.px={});Object.keys(px).forEach((k) =>{px[k]=px[k].filter((n) =>{if((want[k]||[]).indexOf(n)>=0)return true;B.inv=B.inv.filter((x) =>{return !(x.px===k&&x.n===n)});return false});if(!px[k].length&&!want[k])delete px[k]});
 Object.keys(want).forEach((k) =>{want[k].forEach((n) =>{if((px[k]||[]).indexOf(n)>=0)return;if(!DMAP[n]&&itemCost(baseOf(n).b)==null&&!WEAPONS[baseOf(n).b])return;const d=DMAP[n],has=!!(d&&(ovFx(d)||(d[5]&&d[5].gx)||(gx().item&&gx().item[n])));(px[k]||(px[k]=[])).push(n);if(B.inv.some((x) =>{return x.n===n}))return;B.inv.push({n:n,q:gq[k]||1,eq:has||equippable(n),px:k})})});
 if(!Object.keys(px).length)delete B.px}finally{pxBusy=false}}

function effArmor(){const a=ensureInv().filter((x) =>{return ARMOR[baseOf(x.n).b]&&x.eq})[0];return a?a.n:""}
function effShield(){const s=ensureInv().filter((x) =>{return baseOf(x.n).b==="Shield"&&x.eq})[0];return s?s.n:""}
function effWeps(){const w=[];ensureInv().forEach((x) =>{if(WEAPONS[baseOf(x.n).b]&&x.eq&&w.indexOf(x.n)<0)w.push(x.n)});return w}
export function gpNow(){return B.gpOverride!=null&&B.gpOverride!==""?+B.gpOverride:gpBase()}

/* Item quantity. Missing = 1. 0 is kept (used-up ammunition stays in the inventory). */
export function qOf(x){const n=parseFloat(x&&x.q);return isNaN(n)?1:Math.max(0,n)}
/* V16-1: a named magic weapon or armor (DMGI[5].base) resolves to its base item and its bonus (fx.ac for armor and shields, fx.atk for weapons) */
export function baseOf(n){const pq=/^(Backpack|Chest) \(([^()]+'s Pack)(?: \d+)?\)$/.exec(n);if(pq&&typeof PACKS!=="undefined"&&PACKS[pq[2]])return {b:pq[1],p:0};/* v32 RU134 */const m=/^(.+), \+(\d)$/.exec(n);if(m)return {b:m[1],p:+m[2]};const mw=/^(.+), Masterwork(?: \(\d+\))?$/.exec(n);if(mw&&!(typeof DMAP!=="undefined"&&DMAP[n])&&(WEAPONS[mw[1]]||ARMOR[mw[1]]))return {b:mw[1],p:0};/* v20 M6 */const d=typeof DMAP!=="undefined"&&DMAP[n],mb=d&&d[5]&&d[5].base;if(mb){const o=n!==d[0]&&/^(.*) \(([^()]+)\)$/.exec(n),b=o&&mb.indexOf(o[2])>=0?o[2]:mb[0],f=ovFx(d)||{};return {b:b,p:(ARMOR[b]||b==="Shield")?(f.ac||0):(f.atk||0),mi:d[0],mw:!!f.mw}}/* v20 RD24: mw = Masterwork, attack only */return {b:n,p:0}}
export function rarityOf(x){if(x.rar)return x.rar;const dm=DMAP[x.n];if(dm)return dm[2]==="Varies"||dm[2]==="Not magic"?"":dm[2];const o=baseOf(x.n);if(o.p){if(WEAPONS[o.b])return RAR_W[o.p];if(ARMOR[o.b])return RAR_A[o.p];if(o.b==="Shield")return RAR_S[o.p]}const p=POTIONS.filter((q) =>{return q[0]===x.n})[0];if(p)return p[1];const sc=scrollOf(x.n);if(sc)return sc.rar;return ""}
export function rarCls(r){return r?"r-"+r.toLowerCase().replace(/\s+/g,""):""}

export function scrollOf(n){const m=/^Spell Scroll \((.+)\)$/.exec(n);if(!m)return null;const s=SPELLS.filter((x) =>{return x[0]===m[1]})[0];if(!s)return null;const t=SCROLL_T[s[1]];return {sp:s,rar:t[1],dc:t[2],atk:t[3]}}
export var dbCat="Classes",dbQ="";
export function dbItems(){const o=[],keep=dbCat;if(dbQ){let all=[];["Classes","Subclasses","Species","Backgrounds","Feats","Weapons","Armor","Options"].forEach((c) =>{dbCat=c;all=all.concat(dbItems0())});dbCat=keep;const q=dbQ.toLowerCase();return all.filter((i) =>{return (i.t+" "+i.m+" "+i.d+" "+i.x.join(" ")).toLowerCase().indexOf(q)>=0})}return dbItems0()}
function dbItems0(){const o=[];
 if(dbCat==="Classes")Object.keys(CLASSES).forEach((n) =>{const c=CLASSES[n];o.push({t:n,m:"d"+c.hd+" \u00b7 "+c.prim+" \u00b7 Saves "+c.saves.join(", "),d:"Armor: "+(c.armor||"none")+". Weapons: "+c.weapons+". Skills: choose "+c.sk.n+(c.caster?". Caster: "+c.caster+" ("+c.cast+")":"")+".",x:c.f.map((f) =>{return "L"+f[0]+" "+f[1]+": "+f[2]})})});
 if(dbCat==="Subclasses")Object.keys(CLASSES).forEach((n) =>{Object.keys(CLASSES[n].subs).forEach((s) =>{o.push({t:s,m:n,d:"",x:CLASSES[n].subs[s].map((f) =>{return "L"+f[0]+" "+f[1]+": "+f[2]})})})});
 if(dbCat==="Species")Object.keys(SPECIES).forEach((n) =>{const s=SPECIES[n];o.push({t:n,m:s.size+" \u00b7 "+s.speed+" ft"+(s.dark?" \u00b7 Darkvision "+s.dark:""),d:s.lin?s.lin.label+": "+s.lin.opts.join("; ")+".":"",x:s.traits.map((t) =>{return t[0]+": "+t[1]})})});
 if(dbCat==="Backgrounds")Object.keys(BACKGROUNDS).forEach((n) =>{const b=BACKGROUNDS[n];o.push({t:n,m:b.ab.join(", ")+" \u00b7 "+b.feat,d:"Skills: "+b.sk.join(", ")+". Tool: "+b.tool+". Gear: "+b.eq+".",x:[]})});
 if(dbCat==="Feats")Object.keys(FEATS).forEach((n) =>{const f=FEATS[n];o.push({t:n,m:({O:"Origin",G:"General",F:"Fighting Style",E:"Epic Boon",X:"Fighting Style option"}[f.cat]||"Feat")+(f.pre?" \u00b7 "+f.pre:"")+(f.asi?" \u00b7 +1 "+f.asi.join("/"):""),d:(f.full||f.d).replace(/\*\*/g,""),x:[]})});
 if(dbCat==="Weapons")wpKeys().forEach((n) =>{const w=WEAPONS[n];o.push({t:n,m:(w.cat==="S"?"Simple":"Martial")+" "+(w.k==="M"?"Melee":"Ranged")+" \u00b7 "+w.d+" "+w.t,d:(w.p||"No properties")+(w.r?". Range "+w.r:"")+((w.nm||!w.m)?"":". Mastery: "+w.m+", "+MASTERY[w.m]),x:[]})});
 if(dbCat==="Armor")Object.keys(ARMOR).forEach((n) =>{const r=ARMOR[n];o.push({t:n,m:r.cat+" \u00b7 AC "+r.ac+(r.dex==="full"?" + Dex":r.dex==="max2"?" + Dex (max 2)":""),d:(r.str?"Str "+r.str+". ":"")+(r.dis?"Stealth Disadvantage. ":"")+r.w+" lb.",x:[]})});
 if(dbCat==="Options"){MANEUVERS.forEach((m) =>{o.push({t:m[0],m:"Battle Master Maneuver",d:m[1].replace(/\*\*/g,""),x:[]})});METAMAGIC.forEach((m) =>{o.push({t:m[0],m:"Metamagic",d:m[1].replace(/\*\*/g,""),x:[]})});INVOCATIONS.forEach((m) =>{o.push({t:m[0],m:"Eldritch Invocation"+(m[2]>1?" \u00b7 Warlock "+m[2]+"+":"")+(m[3]?" \u00b7 "+m[3]:""),d:m[1].replace(/\*\*/g,""),x:[]})});Object.keys(OPTS).forEach((k) =>{OPTS[k].forEach((m) =>{o.push({t:m[0],m:k,d:m[1],x:[]})})})}
 return o}

export function __set_dbCat(v){ return dbCat=v; }
export function __set_dbQ(v){ return dbQ=v; }
