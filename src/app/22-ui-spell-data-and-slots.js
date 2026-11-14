import {bindLive,lateGet,scOf} from "./00a-reg-late-ports.js";import {C} from "./04-logic-storage.js";
import {clamp,esc,sg} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {refreshEntry} from "./12-ui-bottom-sheet-modal.js";
import {spEffect} from "./21-ui-tabs-pager.js";
import {env} from "./00-env.js";bindLive("spPactLv",{get:function(){return spPactLv;}});
bindLive("DT_ICON",{get:function(){return DT_ICON;},set:function(v){DT_ICON=v;}});
bindLive("dTxt",{get:function(){return dTxt;}});
bindLive("dtIcon",{get:function(){return dtIcon;}});
bindLive("spAreaTxt",{get:function(){return spAreaTxt;}});
bindLive("spCalc",{get:function(){return spCalc;}});
bindLive("spFx",{get:function(){return spFx;}});
bindLive("spFxBlock",{get:function(){return spFxBlock;}});
bindLive("spLvRange",{get:function(){return spLvRange;}});
bindLive("spLvSel",{get:function(){return spLvSel;},set:function(v){spLvSel=v;}});
bindLive("spRowLv",{get:function(){return spRowLv;}});
bindLive("svgI",{get:function(){return svgI;}});
/* ================= RD19 SPELL DATA (damage, area, material) ================= */
/* Icons: damage types and area shapes, drawn as small inline SVG (D3: like D&D Beyond) */
var DT_ICON={Fire:"M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 1 1 1 3 3 3 0-3-1-5 0-7z",Cold:"M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17M9 4l3 2 3-2M9 20l3-2 3 2",
 Lightning:"M13 2L4 14h7l-1 8 9-12h-7z",Acid:"M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z",Poison:"M12 3a6 6 0 1 0 0 12a6 6 0 0 0 0-12zM6 18a2 2 0 1 0 0 4a2 2 0 0 0 0-4zM17 17a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5z",
 Necrotic:"M12 3a7 7 0 0 0-7 7v4l2 2v4h10v-4l2-2v-4a7 7 0 0 0-7-7zM9 10.5h1M14 10.5h1M10 20v-3M14 20v-3",Radiant:"M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM12 1v4M12 19v4M1 12h4M19 12h4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M4.2 19.8L7 17M17 7l2.8-2.8",
 Psychic:"M12 12a2 2 0 1 1 2-2a4 4 0 1 1-4-4a6 6 0 1 1-6 6",Force:"M12 2l2.5 7 7.5 3-7.5 3-2.5 7-2.5-7L2 12l7.5-3z",Thunder:"M3 10v4M7 7v10M11 4v16M15 7v10M19 10v4",
 Bludgeoning:"M3 7h11v6H3zM14 9h3M17 6v8M8 13v8",Piercing:"M4 20L20 4M20 4h-7M20 4v7",Slashing:"M4 20L18 6l2-2-1 5-1 1M4 20l-1-3M4 20l3 1",Healing:"M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"};
const AR_ICON={Sphere:"M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM3 12c3 3.5 15 3.5 18 0",Cube:"M12 2l9 5v10l-9 5-9-5V7zM12 12l9-5M12 12v10M12 12L3 7",Cone:"M3 12l18-9v18zM21 3c-2 3-2 15 0 18",
 Cylinder:"M5 6c0-2.7 14-2.7 14 0v12c0 2.7-14 2.7-14 0zM5 6c0 2.7 14 2.7 14 0",Line:"M2 12h20M2 9v6M22 9v6",Emanation:"M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18",Square:"M4 4h16v16H4zM4 12h16M12 4v16"};/* v19 RD21 */
export function svgI(d,cls,title){ const m=/\bdt-([a-z]+)/.exec(cls||""); return '<svg class="'+cls+'"'+(m?' data-ic="'+m[1]+'"':'')+' viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="'+esc(title)+'"><title>'+esc(title)+'</title><path d="'+d+'"/></svg>'; }
export function dtIcon(t){ const L=String(t||"").split("|"); return (L.length>2&&typeof lateGet("ICO")!=="undefined"?svgI(lateGet("ICO")["dmg-choice"],"dti dt-choice","Choice of damage type: "+L.join(", ")):"")+L.map((x) =>{ return DT_ICON[x]?svgI(DT_ICON[x],"dti dt-"+x.toLowerCase(),x):""; }).join(""); }/* v24 RU73 s */
function arIcon(s){ return AR_ICON[s]?svgI(AR_ICON[s],"ari",s):""; }
export function dTxt(t){ const a=String(t||"").split("|"); return a.length>2?a.slice(0,-1).join(", ")+", or "+a[a.length-1]:a.join(" or "); }
/* dice helpers: "8d6" + 2 x "1d6" = "10d6"; different dice are added as a second term */
function dAdd(a,b,k){ if(!k||!b) return a; const ma=/^(\d+)d(\d+)([+-]\d+)?$/.exec(a), mb=/^(\d+)d(\d+)$/.exec(b);
  if(ma&&mb&&ma[2]===mb[2]) return (+ma[1]+(+mb[1])*k)+"d"+ma[2]+(ma[3]||""); if(/^\d+$/.test(a)&&/^\d+$/.test(b)) return String(+a+(+b)*k);
  return a+" + "+(mb?(+mb[1])*k+"d"+mb[2]:(+b)*k); }
function dMul(a,t){ const m=/^(\d+)d(\d+)([+-]\d+)?$/.exec(a); return m&&t>1?(m[1]*t)+"d"+m[2]+(m[3]||""):a; }
function dPlus(a,v){ if(!v) return a; const m=/^(.*?)([+-]\d+)$/.exec(a); if(m&&/d/.test(m[1])) return m[1]+sg(+m[2]+v); return a+sg(v); }
/* spCalc: numbers of one spell at slot level lv (default: the spell level) and character level cl. fx from C.spells[] (builder) or SPELL_FX by name */
export function spFx(x){ return x&&(x.fx||(typeof SPELL_FX!=="undefined"&&SPELL_FX[x.n])||null); }
export function spCalc(x,lv,cl,smod){ const f=spFx(x); if(!f) return null;
 const _spCalcStep1=spCalcStep1(x, lv, f, cl);
 const {L, ex, tier, bon}=_spCalcStep1;
 lv=_spCalcStep1.lv;
  const _spCalcStep2=spCalcStep2(f, ex, L, tier, smod, bon, x);
  const {parts}=_spCalcStep2;
  let {heal}=_spCalcStep2;
 const _spCalcStep3=spCalcStep3(f, tier, ex, L, heal, smod, x, lv);
 const {n, unit, up}=_spCalcStep3;
 heal=_spCalcStep3.heal;
  return {parts:parts,heal:heal,n:n,unit:unit,lv:lv,up:!!up,area:f.area||null,bon:spDb(x).concat((x.hb||[]).map((b) =>{ return {v:(+b.v||0)+(b.lv?lv:0),s:b.s+" (healing)"}; }))}; }
function spCalcStep1(x, lv, f, cl){
const L=x.l||0; lv=Math.max(L,lv||L); const ex=L?Math.max(0,lv-(f.upAt||L)):0, tier=cl>=17?4:cl>=11?3:cl>=5?2:1;
  const bon=(spDb(x)).reduce((s,b) =>{ return s+(+b.v||0); },0);
  return /** @type {any} */ ({L, ex, tier, bon, lv});
}
function spCalcStep2(f, ex, L, tier, smod, bon, x){
  const parts=(f.dmg||[]).map((p,i) =>{ let d=p[0]; if(f.cs&&!L) d=dMul(d,tier); if(p[2]&&ex) d=dAdd(d,p[2],ex); if(p[4]&&smod!=null) d=dPlus(d,smod); if(i===0&&bon) d=dPlus(d,bon);
    let t=p[1]; if(x.tx&&String(t).split("|").indexOf(x.tx)<0) t=t+"|"+x.tx; return {d:d,t:t,lab:p[3]||""}; });
  if(f.upx&&ex){ const um=/^(\d+)d(\d+)$/.exec(f.upx[0]); if(um) parts.push({d:(um[1]*ex)+"d"+um[2],t:f.upx[1],lab:f.upx[2]||""}); }/* v19 RD21 */
  let heal=null;
  return /** @type {any} */ ({parts, heal});
}
function spCalcStep3(f, tier, ex, L, heal, smod, x, lv){
if(f.heal){ heal=dAdd(f.heal[0],f.heal[2],ex); if(f.heal[1]&&smod!=null) heal=dPlus(heal,smod); (x.hb||[]).forEach((b) =>{ heal=dPlus(heal,(+b.v||0)+(b.lv?lv:0)); }); }
  const n=f.beam?tier:f.cnt?(+f.cnt[0]+(+f.cnt[2]||0)*ex):0, unit=f.beam?"beam":f.cnt?f.cnt[1]:"";
  const up=L&&(!!f.upx||(f.dmg||[]).some((p) =>{return p[2];})||(f.cnt&&f.cnt[2])||(f.heal&&f.heal[2]));
  return /** @type {any} */ ({n, unit, up, heal});
}
/* sheets applied before v15 have no db: Eldritch Blast takes the modifier its Actions row already adds (Agonizing Blast) */
function spDb(x){ if(x.db) return x.db; if(x.fx||x.n!=="Eldritch Blast"||typeof C==="undefined") return []; const a=(C.attacks||[]).filter((q) =>{return q.n===x.n&&!q.nomod;})[0]; return a&&D.mod?[{v:D.mod[a.ab]||0,s:"Agonizing Blast"}]:[]; }
function spAreaTxt(a){ if(!a) return ""; return a[1]+" ft."+(a[0]==="Line"&&a[2]?" x "+a[2]+" ft.":a[0]==="Cylinder"&&a[2]?" x "+a[2]+" ft.":""); }
export function spRangeH(r,x){ const f=spFx(x), a=f&&f.area; return esc(String(r||"").replace(/ ft$/," ft."))+(a?'<span class="spar">/'+esc(spAreaTxt(a))+arIcon(a[0])+'</span>':''); }
export function spCompH(cmp,x){ const f=spFx(x), m=(x&&x.mat)||(f&&f.mat); return esc(cmp)+(m&&/M/.test(cmp)?' <span class="spmat">('+esc(m)+')</span>':''); }
/* Effect cell: count x first damage part with icon, or healing, or the old text summary */
export function spEffH(x,lv){ const c=spCalc(x,lv,D.level,scOf(x).mod); if(c&&c.parts.length){ const p=c.parts[0]; return '<span class="speff">'+(c.n>1?c.n+'× ':'')+esc(p.d)+dtIcon(p.t)+'</span>'; }
  if(c&&c.heal) return '<span class="speff">'+esc(c.heal)+dtIcon("Healing")+'</span>'; return esc(spEffect(x)); }
/* RU35 no. 2: a Warlock spell is cast with a Pact Magic slot, so its row uses the Pact slot level (Mystic Arcanum keeps its own level) */
export function spPact(x){ const sc=C.spellcasting||{}; if(!x.l||!sc.pact) return false; if(x.pact!=null) return !!x.pact; if(/Long Rest|At will/.test(x.use||"")) return false; if(C.cls==="Warlock"&&!/\//.test(C.clsLabel||"")) return true; return /^(Warlock|.* Patron)$/.test(String(x.src||""))&&/Warlock/.test(C.clsLabel||""); }/* v31 p95 */
/* v22: the group a spell is shown in. Pact Magic only: spells cast with a Pact slot sit at the Pact slot level */
export function spGrpLv(x){ const sc=C.spellcasting||{}; if(x.itc&&x.itc.lv&&!Array.isArray(x.itc.c)) return x.itc.lv; if(!x.l||!sc.pact) return x.l; return spPact(x)?spRowLv(x):x.l; }/* v36 p01: pact spells sit at the Pact level also with other slots */
export function spPactLv(){ const p=(C.spellcasting||{}).pact; if(!p) return 0; if(+p.lvl) return +p.lvl; const r=(D.res||[]).filter((q) =>{return q.k==="pact"})[0], m=r&&/level (\d)/.exec(r.n||""); return m?+m[1]:0; }/* v36 p01 */
export function spRowLv(x){ if(x.itc&&x.itc.lv&&!Array.isArray(x.itc.c)) return x.itc.lv; return spPact(x)?Math.max(x.l,spPactLv()||x.l):x.l; }
/* v15 Checker: the Lvl control stays inside the slots the character can use. Pact Magic: the Pact level only. Mystic Arcanum and once-per-rest casts: the spell level */
function spLvRange(x){ const sc=C.spellcasting||{}; if(!x.l) return [0,0]; if(spPact(x)){ const p=Math.max(x.l,spPactLv()||x.l); return [p,p]; } if(/Long Rest|At will/.test(x.use||"")) return [x.l,x.l]; const mx=(sc.slots||[]).length; return [x.l,Math.max(x.l,mx||9)]; }
export var spLvSel={};
/* roll panel for healing spells (32e) */
function spHealPanel(c,x){ const m=env.__martyr; return m&&m.healH?m.healH(c.heal,x.n,x.dur):""; }
function spFxBlock(x,key){ const sc=scOf(x), rg=spLvRange(x), lv=clamp(spLvSel[x.n]!=null?spLvSel[x.n]:spRowLv(x),rg[0],rg[1]), c=spCalc(x,lv,D.level,sc.mod); if(!c||(!c.parts.length&&!c.heal&&!c.n)) return "";
  let h='<div class="info-h">'+(c.parts.length?"Damage":"Effect")+'</div><div class="spfx">';
  if(c.up&&rg[1]>rg[0]) h+='<div class="splv"><button type="button" class="btn press" data-splv="-1" data-spn="'+esc(x.n)+'" data-spb="'+rg[0]+'" data-spt="'+rg[1]+'" aria-label="Lower spell level"'+(c.lv<=rg[0]?' disabled':'')+'>−</button><span>Lvl <b>'+c.lv+'</b></span><button type="button" class="btn press" data-splv="1" data-spn="'+esc(x.n)+'" data-spb="'+rg[0]+'" data-spt="'+rg[1]+'" aria-label="Higher spell level"'+(c.lv>=rg[1]?' disabled':'')+'>+</button></div>';
  else if(x.l) h+='<p class="spfl splvs">Slot level <b>'+c.lv+'</b>'+(spPact(x)?' (Pact Magic)':'')+'</p>';
  if(c.n) h+='<p class="spfl"><b>'+c.n+' '+esc(c.unit)+(c.n>1?'s':'')+'</b>'+(x.l?'':' at character level '+D.level)+', each:</p>';
  c.parts.forEach((p) =>{ h+='<p class="spfl">'+dtIcon(p.t)+'<b>'+esc(p.d)+'</b> '+esc(dTxt(p.t))+' damage'+(p.lab?' <span class="muted">('+esc(p.lab)+')</span>':'')+'</p>'; });
  if(c.heal) h+='<p class="spfl">'+dtIcon("Healing")+'<b>'+esc(c.heal)+'</b> Hit Points regained</p>'+spHealPanel(c,x);
  if(c.bon.length) h+='<p class="spfl muted">Includes '+c.bon.map((b) =>{ return sg(b.v)+" from "+esc(b.s); }).join(", ")+'.</p>';
  if(!x.l&&spFx(x).cs) h+='<p class="spfl muted">Cantrip dice at character level '+D.level+'.</p>';
  return h+'</div>'; }
document.addEventListener("click",(e) =>{ const b=e.target.closest("[data-splv]"); if(!b) return; e.stopPropagation(); e.preventDefault();
  const n=b.getAttribute("data-spn"), base=+b.getAttribute("data-spb"), x=(C.spells||[]).filter((q) =>{return q.n===n})[0]; if(!x) return;
  const cur=spLvSel[n]!=null?spLvSel[n]:spRowLv(x); spLvSel[n]=clamp(cur+(+b.getAttribute("data-splv")),base,+b.getAttribute("data-spt")||9); refreshEntry(); },true);
env.__spCalc=spCalc; env.__spRangeH=spRangeH; env.__spCompH=spCompH; env.__dtIcon=dtIcon; env.__dTxt=dTxt;
