import {agOn,bindLive,choicesBuild,casterParts,clsLv,clsParts,invList,lateGet,pk,preFail,spHasFeat,spLists,spellAb} from "./01b-logic-late-ports.js";import {ABK,clone,mod,pbOf} from "./01-logic-core-helpers.js";

import {activeFx,bgX,spX} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {CL,R14} from "./05-logic-choice-model-ruleset.js";

import {fs14List} from "./08-logic-2014-rules.js";

import {MCL,TL,enabledPacks,fxCh,fxList,fxListBase,fxVal,miFeats,slotsAll} from "./01b-logic-late-ports.js";
import {gx,genv} from "./00-env.js";
bindLive("subAt",{get:function(){return subAt;}});
/* 2014: the ability scores come from the race. sp.asi is fixed ({STR:2}), sp.asiPick {n,v,ex} lets the player choose n scores (choice key rasi) */
export function raceBonus(){const o={};if(!R14())return o;const sp=spX();if(!sp)return o;function ad(k,v){if(k&&ABK.indexOf(k)>=0)o[k]=(o[k]||0)+v}if(sp.asi)Object.keys(sp.asi).forEach((k) =>{ad(k,sp.asi[k])});const ch=B.ch||{};if(sp.asiPick)(ch.rasi||[]).slice(0,sp.asiPick.n).forEach((k) =>{if((sp.asiPick.ex||[]).indexOf(k)<0)ad(k,sp.asiPick.v||1)});if(sp.asiFlex){if(ch.rasim==="+1, +1, +1")(ch.rasi||[]).slice(0,3).forEach((k) =>{ad(k,1)});else{const t2=(ch.rasi||[])[0];ad(t2,2);(ch.rasi1||[]).slice(0,1).forEach((k) =>{if(k!==t2)ad(k,1)})}}return o}
export function asiLevels(){const c=CL(),a=R14()?[4,8,12,16,19].concat(c.asiX||[]):[4,8,12,16].concat(c.asiX||[]);/* 2014: level 19 is a normal improvement, no Epic Boon */return a.filter((x,i) =>{return a.indexOf(x)===i}).sort((x,y) =>{return x-y})}
export function featChosen(exceptKey){const out=[];Object.keys(B.ch).forEach((k) =>{if(k===exceptKey)return;const v=B.ch[k];if(v&&typeof v==="object"&&v.feat)out.push(v.feat);if(k==="spfeat"&&v)out.push(v)});const bg=bgX();if(bg&&!R14())out.push(bgFeatN(bg));return out}
/* allFeats(raw): every feat the build holds. Without raw, a second copy of a feat that cannot be repeated (FEATS.rep missing: two Fighting Style picks of Defense from two classes) is dropped, so the sheet counts it once; the first pick, in level order, stays. raw=true keeps all (featViol, scoreAt, saveTaken report the duplicate) */
/* allFeats step (SOLID s16): the feat of one choice c */function afChoice(f,c){const v=B.ch[c.key];if(c.t==="feat"&&v&&v.feat)f.push({n:v.feat,s:c.src,asi:v,key:c.key});if(c.t==="fs"&&v)f.push({n:v,s:c.src});if(c.t==="ofeat"&&c.inv&&v)f.push({n:v,s:"Origin feat (Lessons of the First Ones)",key:c.key})}export function allFeats(raw){const f=[];const bg=bgX();if(bg&&!R14())f.push({n:bgFeatN(bg),s:"Origin feat ("+B.bg+")"});if(!R14()&&B.ch.spfeat&&spHasFeat())f.push({n:B.ch.spfeat,s:"Origin feat ("+B.species+", Versatile)"});
choices(true).forEach((c) =>{afChoice(f,c)});
 f.slice().forEach((x) =>{const F=FEATS[x.n];if(F&&F.fi){const v=B.ch[F.fi+"-"+(x.key||x.s)];if(Array.isArray(v)&&v[0]&&FEATS[v[0]])f.push({n:v[0],s:x.n})}});/* v69: Fighting Initiate (2014) */
 if(raw)return f;const seen={};return f.filter((x) =>{const F=FEATS[x.n];if(!F||F.rep)return true;if(seen[x.n])return false;seen[x.n]=1;return true})}
/* v19 RL46: feat rules (PHB 2024, Feats chapter). choiceLvl(): level of each choice key. scoreAt(lvl,key): scores before the feat at that level is taken
   (base, background, increases from feats of lower levels, each score at most 20). asiOf(f,F): the increases a chosen feat really gives (only abilities on
   the feat's list, so old data or a typo cannot raise another score). featViol(): every rule the chosen feats break [{k (choice key or source), m}] */
/* v19 RL42: spell attack and save DC bonuses of active items. cls: only that class's spells (Rod of the Pact Keeper: Warlock) */
/* fx engine v2: gfx entries add spAtk and spDc (number, "pb", ability key) for the class named in spCls, or for every class when spCls is missing */
function gxSp(k,cls){return fxList().filter((e) =>{const v=k==="atk"?e.spAtk:e.spDc;return v!=null&&(!e.spCls||e.spCls===cls)})}
export function spItemB(k,cls){return activeFx().reduce((t,q) =>{const f=q.fx,v=k==="atk"?f.spellAtk:f.spellDc;if(!v||(f.spellCls&&f.spellCls!==cls))return t;return t+v},0)+gxSp(k,cls).reduce((t,e) =>{return t+fxVal(k==="atk"?e.spAtk:e.spDc,e)},0)}
export function spItemSrc(cls){return activeFx().filter((q) =>{return (q.fx.spellAtk||q.fx.spellDc)&&(!q.fx.spellCls||q.fx.spellCls===cls)}).map((q) =>{return q.n}).concat(gxSp("atk",cls).concat(gxSp("dc",cls)).map((e) =>{return e.lbl}).filter((x,i,a) =>{return a.indexOf(x)===i}))}
/* v19 RL41: chosen Elemental Affinity type ("" without Draconic Sorcery 6) */
export function chOf(cls,key){if(B.cls===cls)return B.ch[key];let i=-1;MCL().forEach((m,j) =>{if(m.cls===cls)i=j});return i<0?undefined:B.ch["m"+i+":"+key]}
export function eaType(){return subAt("Sorcerer","Draconic Sorcery")>=6?(chOf("Sorcerer","p6opt")||""):""}
/* v20 RD24: spell choices of a pack's class feature. List: level lv (or 1 to the class's highest slot level), class list, components */
/* hbSpellPicks steps (SOLID s16): the spell list of one pick q, the pick of class c in pack p */function hsList(q,prep,mx,comp){return SPELLS.filter((x) =>{return x[1]>=1&&(!prep||prep.indexOf(x[0])>=0)&&(q.slots?x[1]<=mx:x[1]===q.lv)&&(!q.list||x[3].indexOf(q.list)>=0)&&comp.every((k) =>{return new RegExp("(^|, )"+k+"(,|$| )").test(x[6])})}).map((x) =>{return [x[0],x[11]]})}function hsPick(p,c,out){const q=p.spellPick[c],lv=clsLv(c);if(lv<q.l)return;
  const sa=q.slots?slotsAll():null,mx=q.slots?Math.max(sa.slots?sa.slots.length:0,sa.pact?sa.pact.lvl:0):q.lv;
  const prep=q.prep?((casterParts().length>1&&typeof lateGet("spLists")==="function")?(spLists()[c]||[]):(B.sp||[])):null;/* v20 I1 */
  const comp=q.comp.split(","),list=hsList(q,prep,mx,comp);
  out.push({key:q.key,mc:c===B.cls?undefined:MCL().map((m) =>{return m.cls}).indexOf(c),lvl:q.l,t:"multi",n:1,list:list,title:q.title+(list.length?"":q.prep?" (prepare a fitting spell first)":" (no spell fits yet)"),src:p.name+", "+c+" "+q.l,feature:q.feature})}export function hbSpellPicks(){const out=[];enabledPacks().forEach((p) =>{Object.keys(p.spellPick||{}).forEach((c) =>{hsPick(p,c,out)})});return out}/* v20 N2 */
/* v20 N1: a saved pick still fits the current list */
export function hbPickOk(key,n){return hbSpellPicks().some((o) =>{return o.key===key&&o.list.some((x) =>{return x[0]===n})})}
/* v21 i3: Fey Touched and Shadow Touched (PHB 2024): a fixed spell plus one level 1 spell of two schools */
const FT_SP={"Fey Touched":["Misty Step",["Divination","Enchantment"]],"Shadow Touched":["Invisibility",["Illusion","Necromancy"]]};
export function featSpellPicks(){const out=[];allFeats().forEach((f) =>{const q=FT_SP[f.n];if(!q||!f.key)return;const lv=+((/feat(\d+)$/.exec(f.key)||[0,1])[1]);
  out.push({key:"ft:"+f.key,lvl:lv,t:"multi",n:1,list:SPELLS.filter((x) =>{return x[1]===1&&q[1].indexOf(x[2])>=0}).map((x) =>{return [x[0],x[11]]}),title:f.n+": level 1 "+q[1].join(" or ")+" spell",src:f.s,feature:f.n})});return out.concat(wxPicks())}/* v62 */
export function spClsJ(x){ return x[3].filter((c) =>{ return !/^(Mark of |Aberrant Dragonmark)/.test(c); }).join(", "); }
/* v58: Dragonmark feats (EFotA): free spells of the mark, known cantrip, Aberrant Dragonmark picks. Ability: the one chosen with the feat (Aberrant: Constitution) */
export function dmSpells(){const out=[],D0=genv.DM_SP;if(!D0)return out;const lvl=TL();allFeats().forEach((f) =>{const d=D0[f.n];if(!d)return;const fk=f.key||f.s;
 if(d.siberys){const bs=B.ch["bsp-"+fk];if(Array.isArray(bs)&&bs[0])out.push({n:bs[0],use:"1/Short or Long Rest free",f:f.n,k:"@dm:"+fk});return}/* v60 */
 if(d.aberrant){const c=B.ch["abc-"+fk],l=B.ch["abl-"+fk];if(Array.isArray(c)&&c[0])out.push({n:c[0],use:"Cantrip",f:f.n,k:"@dmcon"});if(Array.isArray(l)&&l[0])out.push({n:l[0],use:"1/Long Rest free",f:f.n,k:"@dmcon"});return}
 const k="@dm:"+fk;(d.free||[]).forEach((r) =>{if(lvl>=r[0])out.push({n:r[1],use:"1/Long Rest free",f:f.n,k:k})});(d.can||[]).forEach((n) =>{out.push({n:n,use:"Cantrip",f:f.n,k:k})});(d.will||[]).forEach((n) =>{out.push({n:n,use:"At will",f:f.n,k:k})});(d.ritual||[]).forEach((n) =>{out.push({n:n,use:"Ritual only",f:f.n,k:k})});wxDm(out,f,d,fk)});/* v69 */return sbFree(out)}
/* v62: WotC sources (Heroes of Faerun, Astarion, Ravenloft, Lorwyn, Arcana Unleashed, D&D Beyond drops). Data is in the wotc1 block (window.WX) */
function wxCls(){return [B.cls].concat((B.mc||[]).map((m) =>{return m.cls}))}
function wxMaxSlot(){let s=slotsAll(),m=s.slots?s.slots.length:0;if(s.pact&&s.pact.lvl>m)m=s.pact.lvl;return m}
function wxFeat(fk){return allFeats().filter((f) =>{return (f.key||f.s)===fk})[0]}
/* wxAb step (SOLID s16): the ability from the class pick or from another feat */function wxAbMore(d,fk){ if(d.ab==="cp"){const cv=(B.ch["cp-"+fk]||[])[0];return {Bard:"CHA",Cleric:"WIS",Druid:"WIS",Sorcerer:"CHA",Warlock:"CHA",Wizard:"INT"}[cv]||"INT"}
 if(d.abFrom){const g=allFeats().filter((x) =>{return x.n===d.abFrom})[0],av=g&&B.ch["dab-"+(g.key||g.s)];return (Array.isArray(av)&&av[0])||"INT"}
 return ""}export function wxAb(fk){const f=wxFeat(fk),d=f&&genv.DM_SP&&DM_SP[f.n];if(!d)return "";
 if(d.ab==="mi"){const m=miFeats()[0],v=m&&(B.pk||{})[m.key];return (v&&v.ab)||"INT"}
 if(d.ab==="asi")return (f.asi&&f.asi.a1)||"INT";
 if(/^(STR|DEX|CON|INT|WIS|CHA)$/.test(d.ab||""))return d.ab;/* v69 */
 return wxAbMore(d,fk)}
/* Ability evidence for a selected native spell source, without display fallbacks for unfinished choices. */
function wxProvenInheritedAbility(name){const source=allFeats().find(value=>value.n===name),choice=source&&B.ch['dab-'+(('key' in source&&source.key)||source.s)];return Array.isArray(choice)&&choice.length===1&&ABK.includes(choice[0])?choice[0]:null}
export function wxProvenAbility(fk){const feat=wxFeat(fk),rule=feat&&genv.DM_SP&&DM_SP[feat.n];if(!rule)return null;const valid=value=>ABK.includes(value)?value:null;if(valid(rule.ab))return rule.ab;if(rule.ab==='asi')return valid('asi' in feat&&feat.asi&&typeof feat.asi==='object'&&'a1' in feat.asi&&feat.asi.a1);if(rule.ab==='mi'){const first=miFeats()[0],record=first&&(B.pk||{})[first.key];return valid(record&&record.ab)}if(rule.ab==='cp'){const selected=(B.ch['cp-'+fk]||[])[0];return {Bard:'CHA',Cleric:'WIS',Druid:'WIS',Sorcerer:'CHA',Warlock:'CHA',Wizard:'INT'}[selected]||null}if(rule.abFrom)return wxProvenInheritedAbility(rule.abFrom);const choice=B.ch['dab-'+fk];return valid(Array.isArray(choice)&&choice.length===1?choice[0]:null)}
/* wxList step (SOLID s16): spell row x fits the pick p (cls = the class lists) */function wlFits(x,p,cls){const l=p.lv;if(l==="7"){if(x[1]<1||x[1]>7)return false}else if(x[1]!==l)return false;
  if(p.nm&&p.nm.indexOf(x[0])<0)return false;if(p.rit&&!x[9])return false;if(p.atk&&!/spell attack/i.test((typeof SPELL_FULL!=="undefined"&&SPELL_FULL[x[0]])||""))return false;/* v69 */
  if(cls&&!cls.some((c) =>{return x[3].indexOf(c)>=0}))return false;if(p.sch&&p.sch.indexOf(x[2])<0)return false;if(p.time&&x[4]!==p.time)return false;return true}function wxList(p,fn){let cls=p.cls||(p.dyn?wxCls():null);if(fn==="Magic Connoisseur"){const mi=miFeats().map((m) =>{return m.cls});if(mi.length)cls=mi}
 return SPELLS.filter((x) =>{return wlFits(x,p,cls)}).map((x) =>{return [x[0],x[11]]})}
/* wxPicks step (SOLID s16): the spell pick p of feat f (fk = its choice key, lv = its level) */function wxpPick(p,f,fk,lv,out){let q=p,bv="";if(p.by){bv=(B.ch[p.by+"-"+fk]||[])[0]||"";q=Object.assign({},p);if(p.names)q.nm=p.names[bv]||["__none"];else if(p.clsBy)q.cls=p.clsBy[bv]||["__none"];else q.cls=bv?[bv]:["__none"]}/* v69 */
   out.push({key:"pk"+p.k+"-"+fk,fk:fk,lvl:lv,t:"multi",n:1,list:wxList(q,f.n),title:f.n+": "+p.title+(p.by&&!bv?" (make the choice above first)":""),src:f.s,feature:f.n})}function wxPicks(){const out=[],D0=genv.DM_SP;if(!D0||!genv.WX)return out;
 allFeats().forEach((f) =>{const d=D0[f.n];if(!d||!(d.pk||d.dyn))return;let fk=f.key||f.s,lv=+((/feat(\d+)$/.exec(fk)||[0,1])[1]),pl=(d.pk||[]).slice();
  if(d.dyn){const sc=B.ch["sch-"+fk];if(Array.isArray(sc)&&sc[0])pl=pl.concat(d.dyn.map((p) =>{return Object.assign({},p,{sch:[sc[0]],dyn:1})}))}
  pl.forEach((p) =>{wxpPick(p,f,fk,lv,out)})});return out}
function wxDm(out,f,d,fk){const k="@dm:"+fk,pick=function(p){const v=B.ch["pk"+p.k+"-"+fk];if(Array.isArray(v)&&v[0])out.push({n:v[0],use:p.use,f:f.n,k:k})};
 (d.prep||[]).forEach((r) =>{out.push({n:r[1],use:"Always prepared",f:f.n,k:k})});
 if(d.prepS){const mx=wxMaxSlot();d.prepS.forEach((r) =>{if(mx>=r[0])out.push({n:r[1],use:"Always prepared",f:f.n,k:k})})}
 (d.pk||[]).forEach(pick);
 if(d.dyn&&(B.ch["sch-"+fk]||[])[0])d.dyn.forEach(pick);
 if(d.runes){const rv=B.ch["rn-"+fk];if(Array.isArray(rv))rv.forEach((r) =>{const sn=d.runes[r];if(sn)out.push({n:sn,use:"Rune: 1/Long Rest free",f:f.n,k:k})})}/* v69 */}
export var XFX={
 skills:function(feats,p,prof,exp){feats.forEach((f) =>{const F=FEATS[f.n],x=F&&F.fx;if(!x)return;(x.skills||[]).forEach((n) =>{p(n,f.n+" ("+f.s+")")});(x.exp||[]).forEach((n) =>{if(prof[n])exp[n]=f.n+" ("+f.s+")"})})},
 lang:function(lg){fxList().forEach((e) =>{(e.langs||[]).forEach((n) =>{if(lg.indexOf(n)<0)lg.push(n)})});gxPicks().forEach((o) =>{if(o.t!=="lang")return;const v=B.ch[o.key];if(Array.isArray(v))v.forEach((n) =>{if(lg.indexOf(n)<0)lg.push(n)})});allFeats().forEach((f) =>{const F=FEATS[f.n];if(!F)return;((F.fx||{}).langs||[]).forEach((n) =>{if(lg.indexOf(n)<0)lg.push(n)});
  (F.pick||[]).forEach((q) =>{if(q.t!=="lang")return;const v=B.ch[q.k+"-"+(f.key||f.s)];if(Array.isArray(v))v.forEach((n) =>{if(lg.indexOf(n)<0)lg.push(n)})})})},
 senses:function(C){allFeats().forEach((f) =>{const F=FEATS[f.n],x=F&&F.fx;if(!x||!x.senses)return;x.senses.forEach((r) =>{
  if(r[0]==="Darkvision"){if(C.darkvision>0&&r[3])C.darkvision+=r[3];else C.darkvision=Math.max(C.darkvision||0,r[1]);C.darkSrc=(C.darkSrc?C.darkSrc+", ":"")+f.n;return}
  C.senses=(C.senses||[]).filter((y) =>{return y.n!==r[0]||y.v>r[1]});if(!C.senses.some((y) =>{return y.n===r[0]}))C.senses.push({n:r[0],v:r[1],s:f.n+" ("+f.s+")",d:r[2]||""})})})},
 def:function(add){allFeats().forEach((f) =>{const F=FEATS[f.n];if(!F)return;const x=F.fx||{};
  (x.res||[]).forEach((t) =>{add("Resistance",t,f.n)});(x.imm||[]).forEach((t) =>{add("Immunity",t,f.n)});(x.cimm||[]).forEach((t) =>{add("Immunity",t,f.n)});
  (x.notes||[]).forEach((r) =>{add(r[0],r[1],f.n)});
  if(F.resK){const v=B.ch[F.resK+"-"+(f.key||f.s)];if(Array.isArray(v)&&v[0])add("Resistance",v[0],f.n)}
  if(F.resBy){const rv=B.ch[F.resBy.k+"-"+(f.key||f.s)];if(Array.isArray(rv)&&rv[0]&&F.resBy.map[rv[0]])add("Resistance",F.resBy.map[rv[0]],f.n)}})}};/* v69 */
/* v63: WotC subclasses. window.WXS holds each subclass's extra rules (fx, cantrip picks, optfx, skb, sfree) */
export function sbWx(sub,cls){return (genv.WXS||[]).filter((s) =>{return s.name===sub&&(!cls||s.cls===cls)})[0]}
function sbEach(cb){clsParts().forEach((q,i) =>{if(!q.sub)return;const x=sbWx(q.sub,q.cls);if(x)cb(x,q,q.mc?"m"+(i-1)+":":"")})}
function sbFx(cb){sbEach((x,q) =>{x.fx.forEach((r) =>{if(q.lv>=r[0])cb(r[2],r[1],q.sub)})})}
export function sbAuto(add){sbEach((x,q,pre) =>{
 (x.cantrips||[]).forEach((c) =>{if(q.lv>=c[2])(B.ch[pre+c[0]]||[]).forEach((n) =>{add([[1,n]],c[1],q.lv,CLASSES[q.cls].caster?q.cls:"@sub:"+(x.spab||""))})});
 if(x.optfx&&q.lv>=3){const v=B.ch[pre+x.optfx.key],o=v&&x.optfx.map[v];if(o){(o.can||[]).forEach((n) =>{add([[1,n]],x.optlist+" ("+v+")",q.lv,"@sub:"+(x.optfx.ab||""))});if(o.spells)add(o.spells,x.optlist+" ("+v+")",q.lv,q.cls)}}})}
function sbFree(out){sbEach((x,q) =>{(x.sfree||[]).forEach((r) =>{if(q.lv>=r[0])out.push({n:r[1],use:r[3]||"1/Short or Long Rest free",f:x.name,k:"@sub:"+r[2]})})});return out}
/* XFX steps (SOLID s16): one sense row r of a subclass, the resistance of a subclass option, the skill bonus of a subclass pick */function xfSense(C,r,n,sub){  if(r[0]==="Darkvision"){if(C.darkvision>0&&r[3])C.darkvision+=r[3];else C.darkvision=Math.max(C.darkvision||0,r[1]);C.darkSrc=(C.darkSrc?C.darkSrc+", ":"")+n;return}
  C.senses=(C.senses||[]).filter((y) =>{return y.n!==r[0]||y.v>r[1]});if(!C.senses.some((y) =>{return y.n===r[0]}))C.senses.push({n:r[0],v:r[1],s:n+" ("+sub+")",d:r[2]||""})}function xfDefOpt(add,x,q,pre){const o=x.optfx&&q.lv>=(x.optfx.rlv||3)&&x.optfx.map[B.ch[pre+x.optfx.key]];if(o&&o.res)o.res.forEach((t) =>{add("Resistance",t,x.optlist+" ("+B.ch[pre+x.optfx.key]+")")})}function xfPost(C,a,x,q,pre){const b=x.skb;if(!b||q.lv<b.lvl)return;const v=B.ch[pre+b.key];if(!Array.isArray(v)||!v[0])return;const m=Math.max(b.min1||0,mod(a.sc[b.ab]));
  C.skills.forEach((s) =>{if(s.n===v[0]&&m){s.misc=(s.misc||0)+m;s.miscSrc=(s.miscSrc?s.miscSrc+"; ":"")+b.feature+" ("+q.sub+")"}})}(function(){const s0=XFX.skills,l0=XFX.lang,n0=XFX.senses,d0=XFX.def;
 XFX.skills=function(feats,p,prof,exp){s0(feats,p,prof,exp);sbFx((x,n,sub) =>{(x.skills||[]).forEach((k) =>{p(k,n+" ("+sub+")")});(x.exp||[]).forEach((k) =>{if(prof[k])exp[k]=n+" ("+sub+")"})})};
 XFX.lang=function(lg){l0(lg);const bq=bgX();if(bq&&bq.langs)bq.langs.forEach((n) =>{if(lg.indexOf(n)<0)lg.push(n)});sbFx((x) =>{(x.langs||[]).forEach((n) =>{if(lg.indexOf(n)<0)lg.push(n)})})};
 XFX.senses=function(C){n0(C);sbFx((x,n,sub) =>{(x.senses||[]).forEach((r) =>{xfSense(C,r,n,sub)})})};
 XFX.def=function(add){d0(add);sbFx((x,n) =>{(x.res||[]).forEach((t) =>{add("Resistance",t,n)});(x.imm||[]).forEach((t) =>{add("Immunity",t,n)});(x.notes||[]).forEach((r) =>{add(r[0],r[1],n)})});
  sbEach((x,q,pre) =>{xfDefOpt(add,x,q,pre)})};
 XFX.post=function(C,a){sbEach((x,q,pre) =>{xfPost(C,a,x,q,pre)})}})();

/* v67: the Origin feat of a background. A background with featOpts lets you pick it (B.ch.bgfeatc), else bg.feat */
export function bgTl(bg,tp){const t=tp(bg.tool,bg.toolPick,"bgTool");return bg.toolFix?(t?t+", ":"")+bg.toolFix:t}/* v70: a 2014 background can add fixed tools to its pick */
export function bgFeatN(bg){bg=bg||bgX();if(!bg)return "";const v=B.ch.bgfeatc;return bg.featOpts&&typeof v==="string"&&bg.featOpts.indexOf(v)>=0?v:bg.feat}
/* extra spell lists from chosen Dragonmark feats (Spells of the Mark). Reads B only, so it is safe inside casterParts */
/* fx engine v4: spListAdd {cls?, spells:[names] | from:"Wizard", school?, lvl?} (or an array of them) on any entry: the spells join the class spell list of the character (cls given: only that class). Not always prepared (use spells for that). Each entry gets a pseudo list "fx:..." added to the SPELLS rows once, and dmXl returns the names of the active ones, like a Dragonmark list */
function fxListName(e,q,i){return "fx:"+e.kind+":"+e.owner+":"+e.idx+":"+i+(q.from?":"+q.from+(q.school?":"+q.school:""):"")}
function fxListEnsure(nm,q){const names=q.spells?q.spells.reduce((a,s) =>{return a.concat(String(s).split(","))},[]).map((s) =>{return s.trim()}):null;SPELLS.forEach((x) =>{if(x[3].indexOf(nm)>=0)return;if(names?names.indexOf(x[0])>=0:(q.from&&x[3].indexOf(q.from)>=0&&(!q.school||x[2]===q.school)&&(q.lvl==null||x[1]===q.lvl)))x[3].push(nm)})}
let DMX_BUSY=false;const DMX_LAST={};
export function dmXl(cls){const o=[],L=genv.DM_LIST;
 if(DMX_BUSY)(DMX_LAST[cls||""]||[]).forEach((x) =>{o.push(x)});/* re-entered (gfx reads choices, which read casterParts): use the result of the last finished call */else try{DMX_BUSY=true;fxListBase().forEach((e) =>{if(!e.spListAdd)return;/* gfx(true) = without item entries: casterParts runs inside activeFx (byOk), so reading items here would loop */(Array.isArray(e.spListAdd)?e.spListAdd:[e.spListAdd]).forEach((q,i) =>{if(q.cls&&cls&&q.cls!==cls)return;const nm=fxListName(e,q,i);fxListEnsure(nm,q);if(o.indexOf(nm)<0)o.push(nm)})});DMX_LAST[cls||""]=o.slice()}catch(er){}finally{DMX_BUSY=false}
 if(!L)return o;Object.keys(B.ch||{}).forEach((k) =>{const v=B.ch[k],n=v&&typeof v==="object"&&!Array.isArray(v)?v.feat:(k==="spfeat"?v:null);if(n&&L[n]&&o.indexOf(n)<0)o.push(n)});return o}
export function featSpells(){const out=[];allFeats().forEach((f) =>{const q=FT_SP[f.n];if(!q||!f.key)return;out.push({n:q[0],f:f.n,k:"@ft:"+f.key});const v=B.ch["ft:"+f.key];if(Array.isArray(v)&&v[0])out.push({n:v[0],f:f.n,k:"@ft:"+f.key})});return out}
/* v32 RL49: choices inside a feat. FEATS[n].skills (Skilled, skTools: tools too) and FEATS[n].pick [{k, t, n ("pb" = Proficiency Bonus), title, cats, from, list}].
   fk = the feat's own choice key (feat4, m0:feat8, lfo1) or its source ("Origin feat (Soldier)"). The builder shows these in the feat's card */
export function toolAll(){const o=[];["art","music","game","other"].forEach((k) =>{TOOLS[k].forEach((n) =>{if(o.indexOf(n)<0)o.push(n)})});return o}
function featList(q){if(Array.isArray(q.list))return q.list;
 if(q.list==="maneuvers")return MANEUVERS.map((x) =>{return [x[0],(genv.__MANSUM||{})[x[0]]||""]});/* v69 */
 if(q.list==="metamagic")return METAMAGIC.map((x) =>{return [x[0],""]});
 if(q.list==="invocations"){const wl=wxCls().indexOf("Warlock")>=0;return INVOCATIONS.filter((x) =>{return wl||!/\*\*Prerequisite\.\*\*/.test(x[1])}).map((x) =>{return [x[0],""]})} if(q.list==="fstyle"&&R14())return fs14List(B.cls).map((n) =>{return [n,""]});
 if(q.list==="fstyle")return ["Archery","Blind Fighting","Defense","Dueling","Great Weapon Fighting","Interception","Protection","Thrown Weapon Fighting","Two-Weapon Fighting","Unarmed Fighting"].filter((n) =>{return FEATS[n]}).map((n) =>{return [n,""]});
 if(q.list==="weapons")return wmKeys().map((n) =>{return [n,""]});if(q.list==="ritual1")return SPELLS.filter((x) =>{return x[1]===1&&x[9]}).map((x) =>{return [x[0],x[11]]});return []}
/* fx engine v2: entry.pick = [{k, t: skills|tool|lang|multi|cantrip, n ("pb" allowed), title, from|list|cats, cls, school}]. Stored in B.ch["gx-"+k+"-"+kind+"-"+owner(+mc)].
   skills become proficiencies, tool goes to tool proficiencies (toolChoices), lang to languages (XFX.lang), cantrip to the spell list (autoSpells), multi is only stored */
/* one row of the choice list per fx pick of an active entry (gxPicks below): the picks of an entry, the base row, and the option list of a spell or weapon pick */
function gxEntryPicks(e){return (e.pick||[]).concat((e.pickLv||[]).filter((q) =>{return e.lv>=q.lv}).map((q) =>{return Object.assign({},q,{_lv:q.lv})}))}/* pickLv: one pick per listed level (lv <= entry level), each with its own k; item: stored like multi, the chosen items join the inventory (syncPickItems) */
function gxPickFrom(o,q){if(q.from)o.from=q.from==="all"?ALLSK:q.from==="LANGS"?LANGS:q.from;if(q.t==="skills"&&!o.from)o.from=ALLSK;if(q.t==="lang"&&!o.from)o.from=LANGS}
function gxPickCount(e,q){if(q.n==="pb")return pbOf(TL());if(!Array.isArray(q.n))return q.n;let n=0;q.n.forEach((r) =>{if(e.lv>=r[0])n=r[1]});return n}
function gxPickBase(e,q,mcm){const o={key:"gx-"+q.k+"-"+e.kind+"-"+e.okey+(mcm?"-m"+mcm[1]:""),lvl:q._lv||e.l||1,t:q.t==="cantrip"||q.t==="weapon"||q.t==="item"?"multi":q.t,n:gxPickCount(e,q),title:e.owner+": "+q.title,src:e.lbl,feature:e.n};if(mcm)o.mc=+mcm[1];if(q.t==="item")o.gxi=1;if(q.opt)o.opt=1;if(q.defT){o.defT=q.defT;if(q.dpre)o.dpre=q.dpre}/* fx v3a: text pick becomes a Defenses line *//* optional pick (isDone accepts none) */if(q.yc)o.yc=1;/* shown as "Your choice." under the feature on the sheet (ycOf) */if(q.cats)o.cats=q.cats;gxPickFrom(o,q);return o}
/* spell filters: lvMin/lvMax ("half" = half the character level rounded up, at most 9) when lvl/slv is not given, cls as a name, a list of names or "@pick:k" (the class chosen in pick k of the same entry), rit:1 (Ritual tag), schools:[..], rx (regex on the summary), names:[..] (only these), bk (source key of the book) */
function gxCantripClasses(e,q){let cl=q.cls;if(typeof cl==="string"&&/^@pick:/.test(cl)){const pv=fxCh(cl.slice(6),e.pre,e.kind,e.okey);cl=pv&&pv[0]?pv[0]:(q.clsAll||null)}return Array.isArray(cl)?cl:cl?[cl]:null}
function gxSpellFilterA(q,x,ranged,lo,hi,cls1){return (ranged?x[1]===(q.lvl??q.slv):(q.lvMin!=null||q.lvMax!=null?x[1]>=lo&&x[1]<=hi:x[1]===0))&&(!cls1||cls1.some((c) =>{return x[3].indexOf(c)>=0}))&&(!q.school||x[2]===q.school)&&(!q.schools||q.schools.indexOf(x[2])>=0)}
function gxSpellFilterB(q,x,rxq){return (!q.rit||x[9])&&(!q.names||q.names.indexOf(x[0])>=0)&&(!q.bk||x[12]===q.bk)&&(!rxq||rxq.test(x[11]))&&(!q.ct||new RegExp(q.ct).test(x[4]))&&(!q.nodmg||!/\d+d\d+|damage/i.test(x[11]))}
function gxCantripList(e,q){const lvA=(v) =>{return v==="half"?Math.min(9,Math.ceil(TL()/2)):v},ranged=q.lvl!=null||q.slv!=null,lo=lvA(q.lvMin??0),hi=lvA(q.lvMax??9);const cls1=gxCantripClasses(e,q);const rxq=q.rx?new RegExp(q.rx,"i"):null;return SPELLS.filter((x) =>{return gxSpellFilterA(q,x,ranged,lo,hi,cls1)&&gxSpellFilterB(q,x,rxq)}).map((x) =>{return [x[0],x[11]]})}
function gxWeaponList(q){return Object.keys(WEAPONS).filter((n) =>{return (q.wcats||["S","M"]).indexOf(WEAPONS[n].cat)>=0&&!WEAPONS[n].xw&&!WEAPONS[n].nm}).map((n) =>{return [n,WEAPONS[n].m+": "+MASTERY[WEAPONS[n].m]]})}
function gxPickRow(e,q){if(q.t==="spell")q=Object.assign({},q,{t:"cantrip"});/* fx engine v6: t "spell" = t "cantrip" with the spell filters (any level) */const mcm=e.pre?/^m(\d+):/.exec(e.pre):null;const o=gxPickBase(e,q,mcm);if(q.t==="cantrip")o.list=gxCantripList(e,q);else if(q.t==="weapon"){o.t="multi";o.gxw=1;o.list=gxWeaponList(q)}else if(Array.isArray(q.list))o.list=q.list;o.gxc=q.t==="cantrip"?e.spCls||e.ocls||e.cls||"@species":"";if(/^@pick:/.test(o.gxc)){const pv=fxCh(o.gxc.slice(6),e.pre,e.kind,e.okey);o.gxc=pv&&pv[0]?pv[0]:"@species"}/* fx engine v6: spCls "@pick:k" = the class chosen in pick k */return o}
export function gxPicks(){const out=[];fxList().forEach((e) =>{gxEntryPicks(e).forEach((q) =>{out.push(gxPickRow(e,q))})});return out}
export function featPicks(){const out=[];allFeats().forEach((f) =>{const F=FEATS[f.n];if(!F)return;const fk=f.key||f.s,m=/^m(\d+):/.exec(fk),mc=m?+m[1]:undefined,lv=+((/feat(\d+)$/.exec(fk)||[0,1])[1]);
  if(F.skills){const o0={key:"skl-"+fk,fk:fk,lvl:1,t:"skills",n:F.skills,from:ALLSK,title:f.n+" feat: "+F.skills+(F.skTools?" skills or tools":" skills"),src:f.s,feature:f.n};if(F.skTools)o0.tools=1;if(mc!=null)o0.mc=mc;out.push(o0)}
  (F.pick||[]).forEach((q) =>{const o={key:q.k+"-"+fk,fk:fk,lvl:lv,t:q.t,n:q.n==="pb"?pbOf(TL()):q.n==="pb2"?Math.floor(pbOf(TL())/2):q.n,title:f.n+": "+q.title,src:f.s,feature:f.n};if(mc!=null)o.mc=mc;
   ["cats","dres"].forEach((k) =>{if(q[k]!=null)o[k]=q[k]});if(q.from)o.from=q.from==="all"?ALLSK:q.from==="LANGS"?LANGS:q.from;if(q.list)o.list=featList(q);out.push(o)})});return out}
/* v32 RL49: tools from choices, other than the class, background, and multiclass tool (those replace the book text): [[name, source]] */
export function toolChoices(CH){const o=[];(CH||choices()).forEach((c) =>{const v=B.ch[c.key];if(!Array.isArray(v)||/^(clsTool|bgTool|m\d+:tool)$/.test(c.key))return;
  if(c.t==="tool")v.forEach((n) =>{o.push([n,c.feature||c.title])});else if(c.t==="skills"&&c.tools)v.forEach((n) =>{if(!SKILLS[n])o.push([n,c.feature||c.title])})});return o}
/* v32 RL49: fixed tools of subclasses (SUB_GRANT) and feats (FEATS.tools): [[name, source]] */
export function grantTools(feats){const o=[];clsParts().forEach((q) =>{const g=typeof SUB_GRANT!=="undefined"&&SUB_GRANT[q.sub];if(g&&g.tools)g.tools.forEach((s) =>{if(q.lv>=s[0])o.push([s[1],g.f])})});
 (feats||allFeats()).forEach((f) =>{const F=FEATS[f.n];if(F&&F.tools)o.push([F.tools,f.n])});return o}
/* v32: a starting-kit item with a generic tool name shows the tool chosen for that background or class ("Gaming Set" -> "Dice Set"). "" = none */
export function kitTool(x){if(!x||!x.kit)return "";const g={"Gaming Set":["game"],"Musical Instrument":["music"],"Artisan's Tools":["art"],"Artisan's Tools or Musical Instrument":["art","music"]}[x.n];if(!g)return "";
 const v=x.src===B.bg+" kit"?B.ch.bgTool:x.src===B.cls+" kit"?B.ch.clsTool:null;return (v||[]).filter((n) =>{return g.some((k) =>{return TOOLS[k].indexOf(n)>=0})})[0]||""}
export function choiceLvl(){const m={};choices(true).forEach((c) =>{m[c.key]=c.lvl});return m}
export function asiOf(f,F){const v=f.asi||{},o=[];if(!F)return o;if(F.asi2){if(v.a1&&A6.indexOf(v.a1)>=0)o.push([v.a1,v.a1===v.a2?2:1]);if(v.a2&&v.a2!==v.a1&&A6.indexOf(v.a2)>=0)o.push([v.a2,1])}else if(F.asi&&v.a1&&F.asi.indexOf(v.a1)>=0)o.push([v.a1,1]);return o}
export function scoreAt(lvl,key){const sc={},lv=choiceLvl(),bg=bgX(),AF=allFeats(true),me=AF.findIndex((f) =>{return f.key===key});ABK.forEach((k) =>{sc[k]=+B.base[k]||10});  const rb0=raceBonus();Object.keys(rb0).forEach((k) =>{if(sc[k]!=null)sc[k]+=rb0[k]});if(bg&&!R14()){if(B.bgMode==="111")bg.ab.forEach((k) =>{sc[k]++});else{if(B.bg2&&bg.ab.indexOf(B.bg2)>=0)sc[B.bg2]+=2;if(B.bg1&&B.bg1!==B.bg2&&bg.ab.indexOf(B.bg1)>=0)sc[B.bg1]++}}
 AF.forEach((f,i) =>{if(!f.asi||!f.key||f.key===key||/^Boon of/.test(f.n))return;const l=lv[f.key]||1;if(l>lvl||(l===lvl&&(me<0||i>me)))return;/* v19 V19-2 */asiOf(f,FEATS[f.n]).forEach((p) =>{sc[p[0]]=Math.min(20,sc[p[0]]+p[1])})});
 return sc}
/* saving throws a Resilient pick may not take: the main class's saves, and abilities other Resilient picks already took */
export function saveTaken(key){const o=CL().saves.slice();allFeats(true).forEach((f) =>{const F=FEATS[f.n];if(F&&F.saveFromAsi&&f.key!==key&&f.asi&&f.asi.a1&&o.indexOf(f.asi.a1)<0)o.push(f.asi.a1)});return o}
/* featViol steps (SOLID s16): a feat taken twice, an increase or prerequisite the feat does not allow. k = the choice key, v = the pick */function fvTwice(f,F,k,v,s0,out){  if(s0&&!F.rep)out.push({k:k,m:/^Magic Initiate/.test(f.n)?f.n+" is taken twice. Magic Initiate can repeat only with a different spell list":f.n+" is taken twice, but it can be taken only once"});
  if(F.dt&&v.dt&&s0&&s0.indexOf(v.dt)>=0)out.push({k:k,m:f.n+" needs a different damage type each time. "+v.dt+" is taken already"});}function fvAsi(f,F,k,v,lvl,out){  if(F.asi&&!F.asi2&&v.a1&&F.asi.indexOf(v.a1)<0)out.push({k:k,m:f.n+" can raise only "+F.asi.join(", ")+", not "+v.a1+". The increase is not counted"});
  if(F.saveFromAsi&&v.a1&&saveTaken(f.key).indexOf(v.a1)>=0)out.push({k:k,m:f.n+" must use an ability without saving throw proficiency, and you already have it for "+v.a1});
  if(f.key&&!/^Boon of/.test(f.n)){const sc=scoreAt(lvl,f.key);asiOf(f,F).forEach((q) =>{if(sc[q[0]]+q[1]>20)out.push({k:k,m:f.n+": "+q[0]+" is "+sc[q[0]]+" at level "+lvl+", so +"+q[1]+" would go past 20, the maximum"})})}
  if(f.key&&typeof lateGet("preFail")==="function"){const why=preFail(f.n,lvl,f.key);if(why)out.push({k:k,m:f.n+": its prerequisite is not met at level "+lvl+" (needs "+why+")"})}}function fvFeat(f,lv,seen,out){const F=FEATS[f.n];if(!F)return;const k=f.key||f.s,lvl=lv[f.key]||1,v=f.asi||{},s0=seen[f.n];
  fvTwice(f,F,k,v,s0,out);
  seen[f.n]=(s0||[]).concat(v.dt?[v.dt]:[]);
  fvAsi(f,F,k,v,lvl,out)}export function featViol(){const out=[],seen={},lv=choiceLvl();
 allFeats(true).forEach((f) =>{fvFeat(f,lv,seen,out)});
 return out}
/* choices(): built in builder/09b-logic-choice-stages.js (one function per stage). This wrapper keeps the old name and signature */
export function choices(noFeat){return choicesBuild(noFeat)}
/* M13: weapon bonded by Pact of the Blade (any Warlock part), "" when the invocation is not taken or no weapon is chosen yet */
/* RU34: a species trait that holds a choice shows the chosen option (name and effect) under "Your choice", not only the list of options.
   Trait with several options (Retron Domesticated Ancestry): the text becomes the chosen options with their effects. No choice yet: book text */
function spL(a){return (a||[]).join(", ")}/* spTraitText helpers: the chosen options of a trait with an option list, the "Your choice" lines in two groups, and the "Still open" test in two halves */
function spOptsText(sp,ch){const r=(ch.spopt||[]).map((k) =>{const x=sp.opts.list.filter((y) =>{return y[0]===k})[0];if(!x)return "";let fx=x[2]||{},p="";if(fx.skills&&(ch.spsk2||[]).length)p="Skills: "+spL(ch.spsk2)+".";if(fx.cantrip&&(ch.spcan||[]).length)p="Cantrip: "+spL(ch.spcan)+".";if(fx.weapon&&(ch.spwep||[]).length)p="Weapon: "+spL(ch.spwep)+".";if(fx.feat&&ch.spfeat)p="Origin feat: "+ch.spfeat+".";
   return "\n\n**"+k+".** "+x[1]+(p?" "+p:"")}).join("");return "You chose "+(ch.spopt.length>1?ch.spopt.length+" options":"one option")+" from this trait."+r+(ch.spopt.length<sp.opts.n?" **Still open.** Choose "+(sp.opts.n-ch.spopt.length)+" more in the builder.":"")}
function spPicksA(sp,n,ch,o){if(sp.skillPick&&n===sp.skillPick.label&&(ch.spsk||[]).length)o.push("Skill: "+spL(ch.spsk)+".");if(sp.featPick&&n==="Versatile"&&ch.spfeat)o.push("Origin feat: "+ch.spfeat+".");if(sp.toolPick&&n===sp.toolPick.label&&(ch.sptool||[]).length)o.push("Tool: "+spL(ch.sptool)+".")}/* v74 */
function spPicksB(sp,n,d,ch,o){if(sp.wpPick&&n===sp.wpPick.label&&(ch.spwp||[]).length)o.push("Weapons: "+spL(ch.spwp)+".");if(sp.fx&&sp.fx.cantripTrait===n&&(ch.spcan||[]).length)o.push("Cantrip: "+spL(ch.spcan)+".");if(sp.lin&&n===sp.lin.label&&ch.lin){o.push(ch.lin+".");if(sp.spAb==="choose"&&ch.spab)o.push("Spellcasting ability: "+ch.spab+".")}if(sp.lin&&ch.lin&&!spLinTrait(sp)&&/ancestr|lineage|legacy/i.test(d))o.push(sp.lin.label+": "+ch.lin+".")}/* V14-6: Dragonborn Breath Weapon, Damage Resistance */
function spOpenA(sp,n,ch){return (sp.skillPick&&n===sp.skillPick.label&&!(ch.spsk||[]).length)||(sp.featPick&&n==="Versatile"&&!ch.spfeat)||(sp.lin&&n===sp.lin.label&&!ch.lin)}
function spOpenB(sp,n,ch){return (sp.opts&&n===sp.opts.label&&!(ch.spopt||[]).length)||(sp.toolPick&&n===sp.toolPick.label&&!(ch.sptool||[]).length)||(sp.wpPick&&n===sp.wpPick.label&&(ch.spwp||[]).length<sp.wpPick.n)||(sp.fx&&sp.fx.cantripTrait===n&&!(ch.spcan||[]).length)}
export function spTraitText(sp,t){const n=t[0],d=t[1],ch=B.ch||{},o=[];
 if(sp.linText&&sp.lin&&n===sp.lin.label&&ch.lin&&sp.linText[ch.lin])return sp.linText[ch.lin]+" **Your choice.** "+ch.lin+".";/* v20 RD25: only the chosen ancestry */
 if(sp.opts&&n===sp.opts.label&&(ch.spopt||[]).length)return spOptsText(sp,ch);spPicksA(sp,n,ch,o);spPicksB(sp,n,d,ch,o);const open=spOpenA(sp,n,ch)||spOpenB(sp,n,ch);
 return o.length?d+" **Your choice.** "+o.join(" "):open?d+" **Still open.** Choose this in the builder.":d}
export function linNote(sp){const sn=B.species;if(sn!=="Dragonborn"&&sn!=="Dragonborn (2014)")return "";const v=B.ch.lin||"",m=/^(\w+) \((\w+)\)$/.exec(v);
 if(!m)return '<p class="fd bhint">The dragon type sets the damage type of your Breath Weapon and of your Damage Resistance.</p>';
 let col=m[1],dt=m[2],r14=sn==="Dragonborn (2014)",line=["Black","Blue","Brass","Bronze","Copper"].indexOf(col)>=0,con=["Green","Silver","White"].indexOf(col)>=0,t;
 if(r14)t='<b>Breath Weapon:</b> '+(line?'5 by 30 ft line':'15 ft cone')+', '+(con?'Constitution':'Dexterity')+' save, '+dt+' damage. <b>Damage Resistance:</b> '+dt+'.';
 else t='<b>Breath Weapon:</b> 15 ft cone or 30 ft line, Dexterity save, '+dt+' damage. <b>Damage Resistance:</b> '+dt+'.';
 return '<p class="fd" id="linNote">'+t+' The sheet applies both for you.</p>';}/* v100: the ancestry choice showed no effect */
export function spLinTrait(sp){return sp.traits.some((t) =>{return t[0]===sp.lin.label})}
/* RD19: structured spell data on each C.spells entry (optional fields): fx (SPELL_FX without mat), mat (material text), db [{v,s}] flat damage
   bonus from features, tx alternative damage type from a feature. The sheet computes the dice at the chosen slot and character level */
export function subAt(cls,sub){if(B.cls===cls&&B.sub===sub)return B.level;const m=MCL().filter((q) =>{return q.cls===cls&&q.sub===sub})[0];return m?m.lv:0}
/* spFxTo steps (SOLID s16): the damage bonuses of spell o for class k. ab(x) = the modifier of ability x */function sfDmgA(o,k,a,f,ab,ty,db,record){ if(f.dmg&&agOn(o.n)){db.push({v:ab(spellAb(k||"Warlock",a.sc)||"CHA"),s:"Agonizing Blast"});if(record)record("agonizing-blast",o.n)}
 const eat=eaType();if(f.dmg&&eat&&ty.split("|").indexOf(eat)>=0)db.push({v:ab("CHA"),s:"Elemental Affinity ("+eat+")"});if(record&&f.dmg&&eat&&ty.split("|").indexOf(eat)>=0)record("elemental-affinity",eat);/* v19 RL41 */}function sfDmgB(o,k,f,ab,ty,db){ if(f.dmg&&!o.l&&(k==="Cleric"||k==="Druid")&&clsLv(k)>=7&&(k===B.cls?B.ch.p7opt:B.ch["m"+MCL().map((m) =>{return m.cls}).indexOf(k)+":p7opt"])==="Potent Spellcasting")db.push({v:ab("WIS"),s:"Potent Spellcasting"});
 if(f.dmg&&k==="Wizard"&&o.sch==="Evocation"&&subAt("Wizard","Evoker")>=10)db.push({v:ab("INT"),s:"Empowered Evocation, one damage roll"});
 if(f.dmg&&k==="Warlock"&&subAt("Warlock","Celestial Patron")>=6&&/Radiant|Fire/.test(ty))db.push({v:ab("CHA"),s:"Radiant Soul, one Radiant or Fire damage roll"});}export function spFxTo(o,k,a){const F=typeof SPELL_FX!=="undefined"&&SPELL_FX[o.n];if(!F)return;const f=clone(F);if(f.mat){o.mat=f.mat;delete f.mat}if(Object.keys(f).length)o.fx=f;
 const db=[],hb=[],ab=function(x){return mod(a.sc[x])},iv=invList(),ty=(f.dmg||[]).map((p) =>{return p[1]}).join("|");
 sfDmgA(o,k,a,f,ab,ty,db);
 sfDmgB(o,k,f,ab,ty,db);
 if(f.heal&&o.l&&subAt("Cleric","Life Domain")>=3)hb.push({v:2,lv:1,s:"Disciple of Life"});
 if(db.length)o.db=db;if(hb.length)o.hb=hb;if(f.dmg&&k==="Warlock"&&subAt("Warlock","Great Old One Patron")>=3)o.tx="Psychic"}


/* Reuse the ordinary item-spell admission path; only typed provenance is returned. */
function itemDamageSource(cls,kind,owner){const parts=clsParts(),index=parts.findIndex(part=>part.cls===cls);if(index<0)return null;return {kind,owner,classKey:cls,level:parts[index].lv,pre:index?'m'+(index-1)+':':'',edition:R14()?'2014':'2024'}}
function legacyAffinityType(){if(subAt('Sorcerer','Draconic Bloodline')<6)return null;const native=sbWx('Draconic Bloodline','Sorcerer'),choice=chOf('Sorcerer','p3opt'),types={'Black (Acid)':'Acid','Blue (Lightning)':'Lightning','Brass (Fire)':'Fire','Bronze (Lightning)':'Lightning','Copper (Acid)':'Acid','Gold (Fire)':'Fire','Green (Poison)':'Poison','Red (Fire)':'Fire','Silver (Cold)':'Cold','White (Cold)':'Cold'};return native&&native.opts&&native.opts.some(option=>option[0]===choice)?types[choice]||null:null}
function legacyAgonizingFeat(source){if(!R14()||!source||source.level<1)return null;const native=FEATS['Eldritch Adept'];if(!native||!(native.pick||[]).some(pick=>pick.k==='ei'&&pick.list==='invocations'))return null;const selected=allFeats().some(feat=>{if(feat.n!=='Eldritch Adept')return false;const key=('key' in feat&&feat.key)||feat.s,choice=B.ch['ei-'+key];return Array.isArray(choice)&&choice.length===1&&choice[0]==='Agonizing Blast'});return selected?{...source,kind:'feat',owner:'Eldritch Adept'}:null}
function itemInitiateWarlockCantrips(rows){const name='Magic Initiate (2014)',native=FEATS[name],rule=genv.DM_SP&&DM_SP[name];if(!native||!rule||!(native.pick||[]).some(pick=>pick.k==='cp'&&pick.list.some(option=>option[0]==='Warlock')))return [];const known=[];allFeats().filter(feat=>feat.n===name).forEach(feat=>{const key=('key' in feat&&feat.key)||feat.s,choice=B.ch['cp-'+key];if(!Array.isArray(choice)||choice.length!==1||choice[0]!=='Warlock')return;(rule.pk||[]).filter(pick=>pick.lv===0&&pick.by==='cp'&&pick.use==='Cantrip').forEach(pick=>{const selected=B.ch['pk'+pick.k+'-'+key];if(Array.isArray(selected)&&selected.length===1&&rows.some(row=>row.l===0&&row.n===selected[0]&&row._sourceKey==='@dm:'+key))known.push(selected[0])})});return known}
function itemWarlockCantrip(definition,name){return definition&&definition.l===0&&(definition.classList.includes('Warlock')||invList().includes('Pact of the Tome')&&Array.isArray(B.ch.tomeC)&&B.ch.tomeC.includes(name))}
function itemAgonizingSpell(source,definition,known,name){return !!(source&&source.level>=2&&(!R14()||name==='Eldritch Blast')&&invList().includes('Agonizing Blast')&&(R14()||Array.isArray(B.ch.invab)&&B.ch.invab.includes(name))&&known.includes(name)&&itemWarlockCantrip(definition,name))}
function includeLegacyBlast(definitions,known,source,selected){if(source&&known.includes('Eldritch Blast')&&definitions.some(definition=>definition.n==='Eldritch Blast'&&definition.fx&&definition.fx.dmg))selected.add('Eldritch Blast')}
function itemAgonizingSource(source,feat){return source&&source.level>=2&&invList().includes('Agonizing Blast')?source:feat}
export function collectItemSpellDamageFeatures(definitions,a,known,legacyKnown=known,knownRows=[]){const warlockKnown=known.concat(itemInitiateWarlockCantrips(knownRows)),features=[],selected=new Set(),legacy=legacyAffinityType(),warlock=itemDamageSource('Warlock','cls','Warlock'),featSource=legacyAgonizingFeat(warlock);let affinity=null;const record=(kind,value)=>{if(kind==='agonizing-blast'){const definition=definitions.find(row=>row.n===value);if(itemAgonizingSpell(warlock,definition,R14()?legacyKnown:warlockKnown,value))selected.add(value)}else if(typeof value==='string'&&['Acid','Cold','Fire','Lightning','Poison'].includes(value))affinity=value};definitions.forEach(definition=>{const fx=definition.fx||{},type=(fx.dmg||[]).map(packet=>packet[1]).join('|');sfDmgA(definition,'',a,fx,key=>mod(a.sc[key]),type,[],record);if(legacy&&fx.dmg&&type.split('|').includes(legacy))record('elemental-affinity',legacy)});includeLegacyBlast(definitions,legacyKnown,R14()?itemAgonizingSource(warlock,featSource):null,selected);if(selected.size)features.push({kind:'agonizing-blast',source:itemAgonizingSource(warlock,featSource),spells:[...selected].sort()});if(affinity){const owner=legacy?'Draconic Bloodline':'Draconic Sorcery',source=itemDamageSource('Sorcerer','sub',owner);if(source&&source.level>=6)features.push({kind:'elemental-affinity',source,type:affinity})}return {v:1,features}}
