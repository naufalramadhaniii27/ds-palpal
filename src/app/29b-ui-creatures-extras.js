import {bindLive,clsLvls,undoMark} from "./00a-reg-late-ports.js";/* Responsibility: creature stat blocks (manual and spell lists) and the Extras page. Split out of the former single file 29 in SOLID stage 9 (S); runs in the same order as before. */
import {ABK} from "./02-data-default-character.js";import {C,S,__set_C,save} from "./04-logic-storage.js";import {$,clamp,esc,rich,sg,toast} from "./05-logic-helpers.js";import {D} from "./06-logic-derivation.js";import {REDUCE} from "./07-ui-theme-contrast-spring.js";import {esArt} from "./08c-ui-render-inventory-features-notes.js";import {navStack,refreshEntry} from "./12-ui-bottom-sheet-modal.js";import {dcHead,dcStrip} from "./13-ui-detail-cards.js";import {spRowLv} from "./22-ui-spell-data-and-slots.js";import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {scOf} from "./23e-ui-spells-dc.js";import {bastionH} from "./28-ui-bastion.js";import {env as PGE} from "./00-env.js";import {scCls,srcPg} from "./29-ui-ddb-look.js";
bindLive("crBlock",{get:function(){return crBlock;}});
bindLive("crOf",{get:function(){return crOf;}});
bindLive("renderExtras",{get:function(){return renderExtras;}});
let crSel={}, crF="all", crQ="";
function crEval(e){ e=String(e).replace(/floor\(([^()]*)\)/g,(m,x) =>{ return Math.floor(crEval(x)); }).replace(/(min|max)\(([^(),]*),([^()]*)\)/g,(m,f,a,b) =>{ return Math[f](crEval(a),crEval(b)); }); if(!/^[\d+\-*/().\s]+$/.test(e)) return NaN; try{ return Function('"use strict";return ('+e+')')(); }catch(er){ return NaN; } }
function crExpr(s,env){ s=String(s==null?"":s); const only=s.trim();
  if(/^ATK$/.test(only)) return sg(env.ATK);
  let t=s.replace(/(?<![A-Za-z])(SL|LV|PB|MOD|DC|ATK)/g,(m) =>{ return "("+env[m]+")"; }).replace(/\((-?\d+)\)/g,"$1");
  t=t.replace(/floor\(([^()]*)\)/g,(m,x) =>{ return Math.floor(crEval(x)); }).replace(/(min|max)\(([^(),]*),([^()]*)\)/g,(m,f,a,b) =>{ return String(Math[f](crEval(a),crEval(b))); }).replace(/\(([^()]*)\)d(\d+)/g,(m,x,f) =>{ return crEval(x)+"d"+f; });
  if(!/d\d/.test(t)){ const v=crEval(t); return isNaN(v)?s:String(Math.round(v)); }
  let dice=[], n=0; t.replace(/\s+/g,"").replace(/^(?=[^+-])/,"+").replace(/([+-])((?:\d+)d\d+|[\d*/().]+)/g,(m,sgn,x) =>{ if(/d/.test(x)) dice.push((sgn==="-"?"- ":dice.length?"+ ":"")+x); else n+=(sgn==="-"?-1:1)*crEval(x); return ""; });
  return dice.join(" ")+(n?(n>0?" + ":" - ")+Math.abs(n):""); }
function crText(s,env){ return String(s||"").replace(/\{([^{}]+)\}/g,(m,x) =>{ return crExpr(x,env); }).replace(/\b1 ([A-Z][A-Za-z' ]*?) attacks\b/g,"1 $1 attack"); }
function crOf(n){ return (typeof CREATURES!=="undefined"?CREATURES.creatures:[]).filter((c) =>{ return c.n===n; })[0]; }
function crCrNum(v){ v=String(v); return /\//.test(v)?(+v.split("/")[0])/(+v.split("/")[1]):+v; }
function crSpell(n){ return (C.spells||[]).filter((x) =>{ return x.n===n; })[0]; }
/* v88: 2014 Beast Shapes table: max CR by Druid level (Moon: CR 1, then level / 3), no flying below 8, no swimming below 4 */
function ws14List(L,moon){let cr=L>=8?1:L>=4?0.5:0.25;if(moon)cr=L>=6?Math.max(1,Math.floor(L/3)):1;
 return (typeof CREATURES!=="undefined"?CREATURES.creatures:[]).filter((c) =>{if(c.type!=="Beast"||!(c.tags||[]).some((t) =>{return /wild-shape/.test(t)}))return false;if(crCrNum(c.cr)>cr)return false;const sp=String(c.speed||"");if(L<8&&/Fly/i.test(sp))return false;if(L<4&&/Swim/i.test(sp))return false;return true}).map((c) =>{return c.n})}
/* the creatures this character can have: [{n, why, ctx}] */
function crList(){ if(typeof CREATURES==="undefined") return [];
 const {R, SPL, out, lv, add, fam, chain, wild, wildC}=crListStep1();
crListStep2(chain, wildC, fam, R, add);
  crListStep3(wild, R, lv, add);
  crListStep4(R, add, SPL);
  return out; }
function crListStep1(){
const R=CREATURES.rules||{}, SPL=CREATURES.spells||{}, out=[], lv=clsLvls(), seen={};
  const add=function(n,why,ctx,grp){ const k=n+"|"+ctx; if(seen[k]||!crOf(n)) return; seen[k]=1; out.push({n:n,why:why,ctx:ctx,grp:grp}); };
  const invs=[]; (C.features||[]).forEach((g) =>{ if(g.g==="Eldritch Invocations") (g.items||[]).forEach((i) =>{ invs.push(i.n); }); });
  const fam=R.familiar||{}, chain=invs.indexOf("Pact of the Chain")>=0, wild=(lv.Druid||0)>=2;
  const wildC=wild&&C.rs!=="2014";
  return /** @type {any} */ ({R, SPL, out, lv, add, fam, chain, wild, wildC});
}
function crListStep2(chain, wildC, fam, R, add){
if(crSpell("Find Familiar")||chain||wildC){ (fam.forms||[]).forEach((n) =>{ add(n,chain?"Find Familiar (Pact of the Chain)":wildC&&!crSpell("Find Familiar")?"Find Familiar (Wild Companion)":"Find Familiar","fam","fam"); });
    if(chain) ((R.pactChain||{}).forms||[]).forEach((n) =>{ add(n,"Pact of the Chain","fam","fam"); }); }
}
function crListStep3(wild, R, lv, add){
  if(wild){ const ws=R.wildShape||{}, el=ws.eligible||{}, ky=Object.keys(el).map(Number).filter((k) =>{ return k<=lv.Druid; }).sort((a,b) =>{return b-a})[0], moon=/Circle of the Moon/.test(C.clsLabel+" "+(C.features||[]).map((g) =>{return g.g}).join(" "))&&lv.Druid>=3, mo=(ws.moon||{}).eligible||{};
    let list=ky!=null?(el[ky]||[]):[];if(C.rs==="2014")list=ws14List(lv.Druid,moon); const known=(C.wsForms||[]).length?C.wsForms.slice():null;/* v32 RL49 no. 33: the known forms chosen in the builder */ if(moon&&C.rs!=="2014"){ const mk=Object.keys(mo).map(Number).filter((k) =>{ return k<=lv.Druid; }).sort((a,b) =>{return b-a})[0]; if(mk!=null) list=list.concat(mo[mk]||[]); }
    (known||list).forEach((n) =>{ add(n,"Wild Shape"+(moon?" (Circle of the Moon)":"")+(known?", known form":""),"ws","ws"); }); }
}
function crListStep4(R, add, SPL){
  if((C.features||[]).some((g) =>{ return /Subclass: Beast Master|Ranger \(multiclass \d+\): Beast Master/.test(g.g); })) ((R.primalCompanion||{}).forms||[]).filter((n) =>{ return !C.companion||n===C.companion; }).forEach((n) =>{ add(n,"Primal Companion (Beast Master)","bm","comp"); });/* v32 RL49 no. 28 */
  const fg=(C.features||[]).map((g) =>{ return g.g; }).join("|");/* v58: Artificer companions (EFotA) */
  if(/Subclass: Battle Smith|Artificer \(multiclass \d+\): Battle Smith/.test(fg)) add("Steel Defender","Steel Defender (Battle Smith)","sd","comp");
  if(/Subclass: Vestige Patron|Warlock \(multiclass \d+\): Vestige Patron/.test(fg)) add("Vestige Companion","Vestige Companion (Vestige Patron)","vp","comp");/* v64 */
  if(/Subclass: Reanimator|Artificer \(multiclass \d+\): Reanimator/.test(fg)) add("Reanimated Companion","Reanimated Companion (Reanimator)","rc","comp");
  if(/Subclass: Artillerist|Artificer \(multiclass \d+\): Artillerist/.test(fg)) add("Eldritch Cannon","Eldritch Cannon (Artillerist)","ec","comp");
  Object.keys(SPL).forEach((sn) =>{ const x=crSpell(sn); if(!x) return; const o=SPL[sn]; if(sn==="Find Familiar") return; [].concat(o.creature||[],o.creatures||[]).forEach((n) =>{ add(n,sn,"sp:"+sn,"sum"); }); });
  const IT=CREATURES.items||{}; (C.inv||[]).forEach((i) =>{ const o=IT[i.n]; if(!o) return; o.creatures.forEach((n) =>{ add(n,i.n,"it:"+i.n,"sum"); }); });/* v56: magic items that call a creature */
}
PGE.__crFor=function(c){ const o=C; __set_C(c); try{ return crList().map((e) =>{ const h=crBlock(crOf(e.n),e.ctx); return {n:e.n,ctx:e.ctx,len:h.length,ac:/Armor Class|AC/.test(h)}; }); } finally{ __set_C(o); } };/* test hook */
function crEnv(ctx,c){
 const {lv, env}=crEnv2Step1();
  if(ctx==="bm"){ const s=scCls("Ranger"); env.LV=lv.Ranger||D.level; env.MOD=D.mod.WIS; env.DC=s.dc||(8+D.pb+D.mod.WIS); env.ATK=s.atk!=null?s.atk:(D.pb+D.mod.WIS); }
  else if(ctx==="vp"){ const sw=scCls("Warlock"); env.LV=lv.Warlock||D.level; env.MOD=D.mod.CHA; env.DC=sw.dc||(8+D.pb+D.mod.CHA); env.ATK=sw.atk!=null?sw.atk:(D.pb+D.mod.CHA); }/* v64 */
  else if(crEnvPart1(ctx)){ const sa=scCls("Artificer"); env.LV=lv.Artificer||D.level; env.MOD=D.mod.INT; env.DC=sa.dc||(8+D.pb+D.mod.INT); env.ATK=sa.atk!=null?sa.atk:(D.pb+D.mod.INT); }
  else if(/^it:/.test(ctx)){ const cfg=crEnvPart2(ctx); if(cfg){ env.SL=cfg.sl||0; env.DC=cfg.dc||0; env.ATK=cfg.atk||0; env.MOD=(cfg.atk||0)-D.pb; env.top=env.SL; env.base=env.SL; } }
  else if(/^sp:/.test(ctx)){ const x=crSpell(ctx.slice(3)), sc=scOf(x), base=crEnvPart3(ctx, x), dft=x?Math.max(base,spRowLv(x)):base; env.SL=crEnvPart4(base, c, dft);/* Pact Magic casts at the slot level */ let top=0; (crEnvPart5()).forEach((n,k) =>{ if(n>0) top=k+1; }); if((C.spellcasting||{}).pact) top=Math.max(top,+C.spellcasting.pact.lvl||0); env.top=Math.max(base,top||9); env.SL=Math.min(env.SL,env.top); env.MOD=sc.mod||0; env.DC=sc.dc||0; env.ATK=sc.atk||0; env.base=base; }
  return env; }
function crEnvPart1(ctx){ return (ctx==="sd"||ctx==="ec"||ctx==="rc"); }
function crEnvPart2(ctx){ return (((CREATURES.items||{})[ctx.slice(3)]||{}).env); }
function crEnvPart3(ctx, x){ return (Math.max((CREATURES.spells[ctx.slice(3)]||{}).minLevel||0,x?x.l:0)); }
function crEnvPart4(base, c, dft){ return (Math.max(base,(crSel[c.n]||{}).sl||dft)); }
function crEnvPart5(){ return ((C.spellcasting||{}).slots||[]); }
function crEnv2Step1(){
 const {lv, env}=crEnvStep1();
  return /** @type {any} */ ({lv, env});
}
function crEnvStep1(){
const lv=clsLvls(), env={SL:0,LV:0,PB:D.pb,MOD:0,DC:0,ATK:0};
  return /** @type {any} */ ({lv, env});
}
function crStat(c,ctx){ const sel=crSel[c.n]||{}, v=(c.variants||[]).filter((q) =>{ return q.v===sel.v; })[0]||null, o={}; Object.keys(c).forEach((k) =>{ o[k]=c[k]; });
  if(v) Object.keys(v).forEach((k) =>{ if(k==="v") return; if(Array.isArray(v[k])&&Array.isArray(o[k])) o[k]=o[k].concat(v[k]); else o[k]=v[k]; });
  const sp=ctx&&/^sp:/.test(ctx)&&(CREATURES.spells||{})[ctx.slice(3)]; if(sp&&sp.override) Object.keys(sp.override).forEach((k) =>{ o[k]=sp.override[k]; });
  const it=ctx&&/^it:/.test(ctx)&&((CREATURES.items||{})[ctx.slice(3)]||{}).override; if(it&&it[c.n]) Object.keys(it[c.n]).forEach((k) =>{ o[k]=it[c.n][k]; });/* v56 */
  return o; }
function crRowH(e){ const c=crOf(e.n), env=crEnv(e.ctx,c), o=crStat(c,e.ctx);
  return '<button type="button" class="crr" data-info="cr:'+esc(e.n)+'|'+esc(e.ctx)+'"><span class="crn"><b>'+(PGE.__artIc?PGE.__artIc("creature",String(o.type||"").split(/[\s(,]/)[0]):"")+esc(e.n)+'</b><small>'+esc(o.size+" "+o.type)+' • '+esc(e.why)+'</small></span><span><small>AC</small>'+esc(crExpr(o.ac,env))+'</span><span><small>HP</small>'+esc((function(){ const m=crHpMax(o,env); if(m==null||(S.crhp||{})[e.n+"|"+e.ctx]==null) return crExpr(o.hp,env); return crHpCur(e.n+"|"+e.ctx,m)+"/"+m; })())+'</span><span><small>CR</small>'+esc(o.cr||"—")+'</span></button>'; }
export function renderExtras(){ renderExtras0(); const el=$("#extBody"); if(!el) return; let bh=""; try{ bh=bastionH(); }catch(er){ bh='<h3 class="fcat">Bastion</h3><p class="caution">The Bastion data on this sheet could not be shown. It is kept as it is. Use Report a problem on My Characters.</p>'; } el.innerHTML='<section class="xcard" id="xCr">'+el.innerHTML+'</section>'; if(bh)el.insertAdjacentHTML("beforeend",'<section class="xcard" id="xBs">'+bh+'</section>'); }/* v99: no empty card under Creatures when the rules have no Bastion (2014) *//* v31 C9: one card each *//* v28 I1 *//* v28 RD22 */
function renderExtras0(){
 const {el}=renderExtras02Step1(); if(!el) return;
 const _renderExtras02Step2=renderExtras02Step2();
 const {L, G}=_renderExtras02Step2;
 let {h}=_renderExtras02Step2;
  if(!L.length){ el.innerHTML=h+'<div class="empty-note empty-st xempty">'+esArt("paw")+'<b>No creatures yet</b><span>Your creatures will appear here. Find Familiar, Pact of the Chain, Wild Shape, a Beast Master companion, spells that summon a creature, and magic items that call one add them.</span></div>'; return; }/* v31 C9 */
  const _renderExtras02Step3=renderExtras02Step3(L, h, G);
  const {R}=_renderExtras02Step3;
  h=_renderExtras02Step3.h;
  if(renderExtras0Part1(L)){ const ws=R.wildShape||{}, lv=clsLvls().Druid||0, row=renderExtras0Part2(ws, lv);
    let moon=L.some((e) => renderExtras0Fn1(e)), mo=ws.moon||{}, cr=row.maxCr||"", mcr=Math.floor(lv/3);
    if(moon&&mcr>=crCrNum(cr)) cr=String(mcr);
    const w14=C.rs==="2014", hint=renderExtras0Part3(w14);
    if(w14){ let cr14=lv>=8?"1":lv>=4?"1/2":"1/4"; if(moon) cr14=lv>=6?String(Math.max(1,Math.floor(lv/3))):"1"; h+='<p class="crnote">Wild Shape (2014 rules): you can turn into any Beast you have seen, Challenge Rating up to '+cr14+(lv>=8?'':lv>=4?', no Fly Speed':', no Fly or Swim Speed')+'. There is no list of known forms. The list below shows the Beasts the app has stat blocks for. Source: PHB-2014.</p>'; }
    else h+=renderExtras0Part4(row, cr, moon, lv, ws, mo, hint); }
  ({h}=renderExtras02Step4(h, L, el)); }
function renderExtras0Part1(L){ return (L.some((e) =>{ return e.grp==="ws"; })&&(crF==="all"||crF==="ws")); }
function renderExtras0Part2(ws, lv){ return (((ws.shapes||{}).rows||[]).filter((r) =>{ return r.lv<=lv; }).pop()||{}); }
function renderExtras0Part3(w14){ return ((!w14&&!(C.wsForms||[]).length)?' You have not picked your known forms yet, so every eligible form is listed. Pick them in the Builder: Class, Wild Shape.':''); }
function renderExtras0Part4(row, cr, moon, lv, ws, mo, hint){ return ('<p class="crnote">Wild Shape: you know '+(row.known||"")+' Beast forms, Challenge Rating up to '+cr+(row.fly?'':', no Fly Speed')+'. When you shift you gain '+(moon?3*lv+' Temporary Hit Points (three times your Druid level)':lv+' Temporary Hit Points (your Druid level)')+'.'+(moon?' Your AC in the form is at least '+(13+D.mod.WIS)+' (13 plus your Wisdom modifier).':'')+' Source: '+esc(srcPg("PHB-2024",ws.pg))+(moon?', '+esc(srcPg("PHB-2024",mo.pg)).replace("PHB-2024, ",""):"")+'.'+hint+'</p>'); }
function renderExtras02Step1(){
 const {el}=renderExtras0Step1();
  return /** @type {any} */ ({el});
}
function renderExtras02Step2(){
 const _renderExtras0Step2=renderExtras0Step2();
 const {L, G}=_renderExtras0Step2;
 let {h}=_renderExtras0Step2;
  return /** @type {any} */ ({L, G, h});
}
function renderExtras02Step3(L, h, G){
  const _renderExtras0Step3=renderExtras0Step3(L, h, G);
  const {R}=_renderExtras0Step3;
  h=_renderExtras0Step3.h;
  return /** @type {any} */ ({R, h});
}
function renderExtras02Step4(h, L, el){
  ({h}=renderExtras0Step4(L, h, el));
  return /** @type {any} */ ({h});
}
function renderExtras0Fn1(e){ return e.grp==="ws"&&/Moon/.test(e.why); }
function renderExtras0Step1(){
const el=$("#extBody");
  return /** @type {any} */ ({el});
}
function renderExtras0Step2(){
const L=crList();
  const G=[["all","All"],["fam","Familiar"],["ws","Wild Shape"],["comp","Companion"],["sum","Summons"]].filter((g) =>{ return g[0]==="all"||L.some((e) =>{ return e.grp===g[0]; }); });
  if(!G.some((g) =>{ return g[0]===crF; })) crF="all";
  let h='<h3 class="fcat">Creatures</h3>';
  return /** @type {any} */ ({L, G, h});
}
function renderExtras0Step3(L, h, G){
if(L.length>5||crQ) h+='<div class="fsearch"><input id="crQ" type="search" placeholder="Search in Creatures" aria-label="Search in Creatures" value="'+esc(crQ)+'"></div>';/* v100: long lists (Wild Shape) need a search */
  h+='<div class="ifil">'+G.map((g) =>{ return '<button type="button" class="ifb'+(crF===g[0]?' on':'')+'" data-crf="'+g[0]+'">'+g[1]+'</button>'; }).join("")+'</div>';
  const R=(CREATURES.rules||{});
  return /** @type {any} */ ({R, h});
}
function renderExtras0Step4(L, h, el){
const qn=crQ.trim().toLowerCase(), LF=L.filter((e) =>{ if(!(crF==="all"||e.grp===crF)) return false; if(!qn) return true; const c=crOf(e.n)||{}; return (e.n+" "+(e.why||"")+" "+(c.type||"")+" "+(c.size||"")).toLowerCase().indexOf(qn)>=0; });
  h+='<div class="crl">'+(LF.length?LF.map(crRowH).join(""):'<p class="crnote">No creature matches "'+esc(crQ.trim())+'".</p>')+'</div>';
  el.innerHTML=h;
  return /** @type {any} */ ({h});
}
document.addEventListener("input",(e) =>{ const t=e.target; if(!t||t.id!=="crQ") return; crQ=t.value; const pos=t.selectionStart; renderExtras(); const qq=document.getElementById("crQ"); if(qq){ qq.focus(); try{ qq.setSelectionRange(pos,pos); }catch(er){} } });
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-crf]"); if(!b) return; crF=b.getAttribute("data-crf"); renderExtras(); });
function crHpMax(o,env){ const m=/^\s*(\d+)/.exec(crExpr(o.hp,env)); return m?+m[1]:null; }
function crHpCur(key,max){ const v=(S.crhp||{})[key]; return v==null?max:clamp(+v,0,max); }
/* v50: creature card effects. An overlay fades or sweeps, the card shakes on damage */
function crFx(key,kind){ if(REDUCE||!document.body.animate) return; let els=document.querySelectorAll(".crhp"), el=null; Array.prototype.forEach.call(els,(x) =>{ if(!el&&x.querySelector('[data-crk="'+String(key).replace(/"/g,'\\"')+'"]')) el=x; }); if(!el) return;
  const o=document.createElement("i"); o.className="crfx crfx-"+kind; o.setAttribute("aria-hidden","true"); el.appendChild(o); const done=function(){ if(o.parentNode) o.parentNode.removeChild(o); };
  const a=kind==="heal"?o.animate([{transform:"translateX(-110%)",opacity:.9},{transform:"translateX(110%)",opacity:0}],{duration:650,easing:"ease-out"}):o.animate([{opacity:0},{opacity:1,offset:.25},{opacity:0}],{duration:520,easing:"ease-out"});
  a.onfinish=a.oncancel=done; setTimeout(done,1200);
  if(kind==="dmg"||kind==="down") el.animate([{transform:"translateX(0)"},{transform:"translateX(-5px)",offset:.2},{transform:"translateX(5px)",offset:.45},{transform:"translateX(-3px)",offset:.7},{transform:"translateX(0)"}],{duration:320,easing:"ease-out"}); }
function crHpH(key,max){ const cur=crHpCur(key,max), pc=max?Math.round(100*cur/max):0, st=cur<=0?"down":pc<=25?"low":pc<=60?"mid":"ok", bt=function(k,l,cl){ return '<button type="button" class="btn press crhp-b '+cl+'" data-crhp="'+k+'" data-crk="'+esc(key)+'" data-crm="'+max+'">'+l+'</button>'; };
  return '<div class="crhp '+st+'"><div class="crhp-t"><span class="crhp-l">'+ico("hp-heal","dc-ci")+'Hit Points</span><b><span class="crhp-n">'+cur+'</span><i> / '+max+'</i></b></div><div class="crhp-bar"><i style="width:'+pc+'%"></i></div>'+(cur<=0?'<p class="crhp-d">0 Hit Points. This creature is down.</p>':'')+
   '<div class="crhp-c"><input class="crhp-in" type="number" inputmode="numeric" min="0" step="1" placeholder="HP" aria-label="Hit Points amount">'+bt("dmg","Damage","dmg")+bt("heal","Heal","heal")+bt("full","Full","full")+'</div></div>'; }
function crBlock(c,ctx){
 const _crBlockStep1=crBlockStep1(ctx, c);
 const {env, o, T}=_crBlockStep1;
 let {h}=_crBlockStep1;
  ({h}=crBlockStep2(h, o, env, T));
  return h+'</div>'; }
function crBlockStep1(ctx, c){
let env=crEnv(ctx,c), o=crStat(c,ctx), T=function(s){ return rich(crText(s,env)); }, h="";
  const sp=/^sp:/.test(ctx)?ctx.slice(3):"", sel=crSel[c.n]||{}, im=PGE.CRIMG&&PGE.CRIMG[c.n];
  if(im) h+='<img class="lib-im cr-im'+(im.indexOf("/tokens/")>0?' tok':'')+'" loading="lazy" decoding="async" alt="'+esc(c.n)+'" src="data/img/'+encodeURI(im)+'.webp">';/* picture first, large */
  h+='<div class="dc dc-c">'+dcHead(ico("creature","isch"),esc(o.size+" "+o.type+(o.al?", "+o.al:""))+' • '+esc(srcPg(o.src||"PHB-2024",o.pg)));
  if(sp) h+='<div class="crsp"><span class="crsp-l">Spell level <small>from '+esc(sp)+'</small></span><div class="crsp-s"><button type="button" class="btn press crsl" data-crsl="-1" data-crn="'+esc(c.n)+'" aria-label="Lower spell level">−</button><b>'+env.SL+'</b><button type="button" class="btn press crsl" data-crsl="1" data-crn="'+esc(c.n)+'" aria-label="Higher spell level">+</button></div></div>';
  if((c.variants||[]).length) h+='<div class="ifil crvar">'+c.variants.map((q) =>{ return '<button type="button" class="ifb'+(sel.v===q.v?' on':'')+'" data-crv="'+esc(q.v)+'" data-crn="'+esc(c.n)+'">'+esc(q.v)+'</button>'; }).join("")+'</div>';
  const cells=[["ui-shield","Armor Class",esc(crExpr(o.ac,env))],["speed-walk","Speed",esc(o.speed||"—")]]; if(o.init) cells.push(["time-action","Initiative",esc(o.init)]); if(o.cr&&o.cr!=="None") cells.push(["ui-xp","Challenge",esc(o.cr)+(o.xp?' <span class="dc-sz">XP '+esc(o.xp)+'</span>':'')]);
  h+=dcStrip(cells,"dc-s"+cells.length);
  const mx=crHpMax(o,env); if(mx!=null) h+=crHpH(c.n+"|"+ctx,mx)+(o.hd?'<p class="crhd">Hit Dice '+esc(crExpr(o.hd,env))+'</p>':''); else h+=dcStrip([["hp-heal","Hit Points",esc(crExpr(o.hp,env)+(o.hd?" ("+crExpr(o.hd,env)+")":""))]]);
  return /** @type {any} */ ({env, o, T, h});
}
function crBlockStep2(h, o, env, T){
  h+='<div class="crab">'+ABK.map((k) =>{ const s=o.ab&&o.ab[k]; return '<div><small>'+k+'</small><b>'+esc(s==null?"—":s)+'</b><span>'+(s==null?"":sg(Math.floor((s-10)/2)))+'</span></div>'; }).join("")+'</div>';
  const ln=function(k,v,ik){ return v?'<div class="crln">'+ico(ik||"ui-info","crln-i")+'<div><small>'+k+'</small><span>'+esc(crText(v,env))+'</span></div></div>':''; };
  const sv=o.saves&&Object.keys(o.saves).length?Object.keys(o.saves).map((k) =>{ return k+" "+crText(o.saves[k],env); }).join(", "):"";
  h+='<div class="crlns">'+ln("Saving Throws",sv,"fx-save")+ln("Skills",o.skills,"ui-star")+ln("Vulnerabilities",o.vuln,"def-vulnerability")+ln("Resistances",o.res,"def-resistance")+ln("Immunities",o.imm,"def-immunity")+ln("Gear",o.gear,"item-gear")+ln("Senses",o.senses,"sense-passive")+ln("Languages",o.lang,"ui-book")+(o.pb?ln("Proficiency Bonus",sg(+crExpr(o.pb,env)||0),"ui-prof"):"")+(o.initNote?ln("Turn",o.initNote,"time-action"):"")+'</div>';
  [["traits","Traits","ui-feature"],["actions","Actions","act-action"],["bonus","Bonus Actions","act-bonus"],["reactions","Reactions","act-reaction"]].forEach((p) =>{ const L=o[p[0]]||[]; if(!L.length) return; h+='<div class="crsec">'+ico(p[2],"crsec-i")+'<b>'+p[1]+'</b></div>'+L.map((a) =>{ return '<div class="crent"><b>'+esc(a[0])+'</b><p>'+T(a[1])+'</p></div>'; }).join(""); });
  return /** @type {any} */ ({h});
}
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-crhp]"); if(!b) return; e.preventDefault(); e.stopPropagation();
  const key=b.getAttribute("data-crk"), max=+b.getAttribute("data-crm"), k=b.getAttribute("data-crhp"), inp=b.closest(".crhp").querySelector(".crhp-in"), n=Math.floor(+(inp&&inp.value)||0);
  S.crhp=S.crhp&&typeof S.crhp==="object"&&!Array.isArray(S.crhp)?S.crhp:{}; const cur=crHpCur(key,max);
  if(k!=="full"&&!(n>0)){ toast("Enter an amount first."); if(inp) inp.focus(); return; }
  undoMark(k==="dmg"?"Creature damage":k==="heal"?"Creature healing":"Creature Hit Points",false);
  const nv=k==="full"?max:k==="dmg"?Math.max(0,cur-n):Math.min(max,cur+n); if(nv>=max) delete S.crhp[key]; else S.crhp[key]=nv;
  save(); refreshEntry(); renderExtras(); if(k==="dmg") crFx(key,"dmg"); else if(nv>cur) crFx(key,"heal"); },true);
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-crv],[data-crsl]"); if(!b) return; e.preventDefault(); e.stopPropagation(); const n=b.getAttribute("data-crn"), s=crSel[n]=crSel[n]||{};
  if(b.hasAttribute("data-crv")) s.v=s.v===b.getAttribute("data-crv")?null:b.getAttribute("data-crv");
  else { const en=navStack[navStack.length-1], ctx=en&&en.spec?String(en.spec).split("|")[1]:"", env=crEnv(ctx,crOf(n)); s.sl=clamp(env.SL+(+b.getAttribute("data-crsl")),env.base||1,env.top||9); }
  refreshEntry(); renderExtras(); },true);
export function __set_renderExtras(v){ return renderExtras=v; }
