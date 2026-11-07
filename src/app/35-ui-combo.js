import {GLOSS,gl14,x14,x14n} from "./03-data-glossary.js";
import {C,FROZEN,S,recover,save} from "./04-logic-storage.js";
import {$,$$,ask,atkOn,esc,num,rich,sg,toast} from "./05-logic-helpers.js";
import {D,derive,fill} from "./06-logic-derivation.js";
import {actOne,actSplit,featAll,renderActions,spellsBy,syncLU} from "./08b-ui-render-summaries-actions.js";import {renderAbilities,renderIdentity,renderSkillsPage,renderTiles,used} from "./08-ui-render-sheet-and-actions.js";import {renderFeat,renderInv} from "./08c-ui-render-inventory-features-notes.js";
import {syncHP} from "./09-ui-hit-points-playbar-death-saves.js";
import {renderConds} from "./10-ui-conditions.js";
import {__set_navStack,navStack,openSheet,sheet,sheetMode,showEntry} from "./12-ui-bottom-sheet-modal.js";
import {mq,setTab} from "./21-ui-tabs-pager.js";
import {ico,resOf} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {openRest} from "./23d-ui-rest.js";import {renderSpells} from "./23e-ui-spells-dc.js";
import {openSearch} from "./27-ui-party-search-commands-library.js";import {libOpen} from "./27d-ui-library-search-open.js";
import {renderExtras} from "./29b-ui-creatures-extras.js";
import {castDo,ckOf,qOk,quickCast,spAtWill,spCastOpts} from "./32b-logic-play-concentration-casting.js";import {undoMark,undoNow} from "./32-logic-play-undo-actions.js";
import {modeFix} from "./33-logic-play-rage-conditions.js";
import {combatHTML} from "./34c-ui-experience-journal-combat-view.js";import {sitReset} from "./34-ui-situations.js";
import {__R} from "./00-reg.js";import {env} from "./00-env.js";
Object.defineProperty(__R,"CF0",{get:function(){return CF0;},set:function(v){CF0=v;},configurable:true});
Object.defineProperty(__R,"cmbCast",{get:function(){return cmbCast;},set:function(v){cmbCast=v;},configurable:true});
Object.defineProperty(__R,"cmbHTML",{get:function(){return cmbHTML;},set:function(v){cmbHTML=v;},configurable:true});
Object.defineProperty(__R,"cmbRe",{get:function(){return cmbRe;},set:function(v){cmbRe=v;},configurable:true});
Object.defineProperty(__R,"goTab",{get:function(){return goTab;},set:function(v){goTab=v;},configurable:true});
Object.defineProperty(__R,"keysOpen",{get:function(){return keysOpen;},set:function(v){keysOpen=v;},configurable:true});
Object.defineProperty(__R,"renderAll",{get:function(){return renderAll;},set:function(v){renderAll=v;},configurable:true});
/* v42 Combo: three shortcut lists of one Action, one Bonus Action, one Reaction. Options come from what the character has */
const CMB_MOVE=["Move","Stand Up","Climb or Swim","Jump"], CMB_FREE=["Interact with an Object","Speak","Drop Prone"], CMB_DESC={"Move":"Spend up to your Speed to move on your turn. You can split it before and after your action.","Stand Up":"Standing up from Prone costs movement equal to half your Speed.","Climb or Swim":"Each foot of climbing or swimming costs 1 extra foot of movement, unless you have a Climb or Swim Speed.","Jump":"A running long jump covers feet equal to your Strength score. A high jump covers 3 plus your Strength modifier in feet. Both need a 10 foot run first.","Interact with an Object":"You get one free object interaction on your turn, such as drawing or stowing a weapon. A second one costs the Utilize action.","Speak":"You can say a few short phrases on your turn without using any action.","Drop Prone":"You can fall Prone on your turn. It costs no action and none of your Speed.","Two-Weapon Fighting":"When you take the Attack action and hit with a Light weapon, you can make one extra attack as a Bonus Action with a different Light weapon. Leave out your ability modifier on its damage unless the modifier is negative.","Hasted Action":"With Haste you get one extra action on each of your turns. It can only be used for one weapon attack, Dash, Disengage, Hide, or Utilize."};
let CMB_SL=[["m","Movement","move"],["a","Action","action"],["x","Extra Action","extra"],["h","On Hit","onhit"],["b","Bonus Action","bonus"],["r","Reaction","reaction"],["f","Free","free"]], CMB_STD=["Dodge","Dash","Disengage","Help","Hide","Search","Ready","Grapple","Shove","Utilize","Influence","Study","Magic","Improvise"], cmbEdit=false;
function cmbPool(sl){
 const {out, add, kk, kinds}=cmbPoolStep1(sl);
  const {re}=cmbPoolStep2(sl, add, kinds, kk); if(re) spellsBy(re).forEach((p) =>{ add({k:"sp:"+p[0].n,n:p[0].n,g:"Spells",i:p[1]}); });
  return out; }
function cmbPoolStep1(sl){
const out=[], seen={}, add=function(o){ if(seen[o.k]) return; seen[o.k]=1; out.push(o); }, kk={a:"action",h:"onhit",b:"bonus",r:"reaction"}[sl], kinds=actSplit(featAll());
  if(sl==="a") CMB_STD.forEach((n) =>{ if(x14()&&(n==="Influence"||n==="Study")) return; add({k:"std:"+n,n:x14n(n),g:"Standard actions"}); });/* v94 */
  if(sl==="r") add({k:"std:Opportunity Attack",n:"Opportunity Attack",g:"Standard actions"});
  if(sl==="m") CMB_MOVE.forEach((n) =>{ add({k:"std:"+n,n:n,g:"Movement"}); });
  if(sl==="f") CMB_FREE.forEach((n) =>{ add({k:"std:"+n,n:n,g:"Free"}); });
  if(sl==="x"){ kinds.other.concat(kinds.action,kinds.bonus).forEach((o) =>{ const n=o.e?o.e.n:o.x.f.n; if(n==="Action Surge") add({k:"ft:"+n+"|"+(o.e?(o.e.it?"item":o.e.f):o.x.g),n:n,g:"Features",o:o}); }); if((C.spells||[]).some((s) =>{ return s.n==="Haste"; })) add({k:"std:Hasted Action",n:"Hasted Action",g:"Spells"}); }
  return /** @type {any} */ ({out, add, kk, kinds});
}
function cmbPoolStep2(sl, add, kinds, kk){
  (C.attacks||[]).forEach((a,i) =>{ if(!atkOn(a)) return; const act=a.act||""; if((sl==="a"&&act==="")||(sl==="b"&&act==="bonus")||(sl==="r"&&act==="reaction")) add({k:"atk:"+a.n,n:(act===""?"Attack \u00b7 ":"")+a.n,g:"Attacks",i:i}); });
  if(sl==="b"&&(C.attacks||[]).some((a) =>{ return atkOn(a)&&/Light/.test(a.sub||""); })) add({k:"std:Two-Weapon Fighting",n:"Two-Weapon Fighting",g:"Standard actions"});
  (kinds[kk]||[]).forEach((o) =>{ const n=o.e?o.e.n:o.x.f.n; add({k:"ft:"+n+"|"+(o.e?(o.e.it?"item":o.e.f):o.x.g),n:n,g:"Features",o:o}); });
  const re={a:/^Action/,b:/^Bonus/,r:/^Reaction/}[sl];
  return /** @type {any} */ ({re});
}
function cmbScrollOn(){ try{ const t=document.querySelector('.cmb-tab.on'), w=t&&t.parentNode; if(w&&w.scrollWidth>w.clientWidth) w.scrollLeft=Math.max(0,t.offsetLeft-(w.clientWidth-t.offsetWidth)/2); }catch(er){} }
function cmbN(){ const n=Math.floor(+S.cmbn||0), m=Array.isArray(S.combos)?S.combos.length:0; return Math.max(1,n||Math.max(3,m)); }/* v54: no fixed limit of three */
function cmbCI(){ const c=+S.ccur; return c>=0&&c<cmbN()?c:0; }
function cmbPick(ci,sl){ const c=Array.isArray(S.combos)?S.combos[ci]:null; return (c&&c[sl])||""; }
function cmbDone(sl){ return !!(S.cdn&&S.cdn[sl]); }
let cmbFoc="", CMB_SH={m:"Move",a:"Action",x:"Extra",h:"On Hit",b:"Bonus",r:"React",f:"Free"};
function cmbSteps(ci){ return CMB_SL.map((s) =>{ const key=cmbPick(ci,s[0]), it=key?cmbPool(s[0]).filter((o) =>{ return o.k===key; })[0]:null; return {sl:s[0],lab:s[1],key:key,it:it,dn:cmbDone(s[0])}; }); }
function cmbFocus(st){ const f=st.filter((x) =>{ return x.sl===cmbFoc&&x.it; })[0]; return f||st.filter((x) =>{ return x.it&&!x.dn; })[0]||st.filter((x) =>{ return x.it; })[0]||null; }
function cmbRes(it){ let rl=[]; if(it.o){ const e=it.o.e, x=it.o.x; rl=resOf(e?(e.it?e.n:e.f):x.f.n).slice(); if(e&&e.u) resOf(e.u).forEach((r) =>{ if(!rl.some((q) =>{ return q.k===r.k; })) rl.push(r); }); } return rl; }
function cmbPills(a){ let L=(D.cf||{}).atk||[], by=function(t){ return L.filter((x) =>{ return x.t===t; }).map((x) =>{ return x.s; }).join(", "); }, adv=by("ADV"), dis=by("DIS"), fl=by("FAIL"), o="";
  if(fl) o+='<span class="cmbp bad"><b>Fail</b> '+esc(fl)+'</span>'; else if(adv&&dis) o+='<span class="cmbp"><b>Hit</b> Advantage and Disadvantage cancel out</span>'; else if(adv) o+='<span class="cmbp good"><b>Hit</b> Advantage: '+esc(adv)+'</span>'; else if(dis) o+='<span class="cmbp bad"><b>Hit</b> Disadvantage: '+esc(dis)+'</span>';
  if(a&&a.note) o+='<p class="muted cmbp-n">'+esc(a.note)+'</p>'; return o?'<div class="cmbf-pl">'+o+'</div>':""; }
function cmbSlotLk(x,i){ if(spAtWill(x)) return ""; const av=spCastOpts(x).filter((q) =>{ return q.left>0; }); return av.length>1?'<button type="button" class="cmbf-lk press" data-cmbslot="'+i+'">Choose slot level</button>':""; }
function cmbPct(st,f){ const v=st.filter((x) =>{ return x.key||"abr".indexOf(x.sl)>=0; }), i=f?v.map((x) =>{ return x.sl; }).indexOf(f.sl):v.length-1; return v.length>1?Math.round(100*Math.max(0,i)/(v.length-1))+"%":"0%"; }
let cmbLast="";
function cmbApa(){ let a=1; featAll().forEach((x) =>{ const n=x.f.n; if(n==="Extra Attack") a=Math.max(a,2); if(n==="Two Extra Attacks") a=Math.max(a,3); if(n==="Three Extra Attacks") a=Math.max(a,4); if(n==="Extra Attack (2)") a=Math.max(a,3); if(n==="Extra Attack (3)") a=Math.max(a,4); if(n==="Thirsting Blade") a=Math.max(a,2); if(n==="Devouring Blade") a=Math.max(a,3); }); return a; }
function cmbName(i){ const c=Array.isArray(S.combos)?S.combos[i]:null; return (c&&c.n)||"Combo "+(i+1); }
function cmbBody(it){ if(it.o) return actOne(it.o,"");
  if(it.k.indexOf("atk:")===0){ const a=(C.attacks||[])[it.i], d=D.atk[it.i]; if(!a||!d) return ""; const ch=String(a.sub||"").split(/\s*[,•]\s*/).filter(Boolean); if(a.type) ch.unshift(a.type); if(a.range) ch.push(a.range); if(a.m) ch.push("Mastery: "+a.m);
    const nA=cmbApa(); return '<div class="cmbf-t">'+(!a.act?'Attack \u00b7 ':'')+'<button type="button" class="tx" data-info="w:'+it.i+'">'+esc(a.n)+'</button></div>'+(!a.act?'<p>'+(nA>1?'Make '+nA+' attacks':'Make one attack')+' with your weapon. Roll to hit, then damage.</p>':'')+'<div class="cmbf-st"><span><small>To hit</small><b>'+sg(d.hit)+'</b></span><span><small>Damage</small><b>'+esc(d.dmg)+'</b></span></div><div class="cmbf-ch">'+ch.map((c) =>{ return '<span>'+esc(c)+'</span>'; }).join("")+'</div>'+cmbPills(a); }
  if(it.k.indexOf("sp:")===0){ const x=(C.spells||[])[it.i]; if(!x) return ""; const ch2=[x.l?"Level "+x.l:"Cantrip",x.r,x.dur,x.sv?"Save: "+x.sv:"",x.conc?"Concentration":""].filter(Boolean);
    return '<div class="cmbf-t"><button type="button" class="tx" data-info="sp:'+it.i+'">'+esc(x.n)+'</button></div><div class="cmbf-ch">'+ch2.map((c) =>{ return '<span>'+esc(c)+'</span>'; }).join("")+'</div>'+(x.sum?'<p>'+rich(x.sum)+'</p>':'')+cmbSlotLk(x,it.i); }
  const {t}=cmbBodyStep1(it);
  return '<div class="cmbf-t">'+esc(it.n)+'</div>'+(t?'<p>'+rich(fill(t))+'</p>':''); }
function cmbBodyStep1(it){
  const g=GLOSS[it.n], t=CMB_DESC[it.n]||(g?g.d:(it.n==="Opportunity Attack"?"When a creature you can see leaves your reach, use your Reaction to make one melee attack against it with a weapon or an Unarmed Strike.":""));
  return /** @type {any} */ ({t});
}
function cmbHTML(){ try{ setTimeout(cmbScrollOn,30); let ci=cmbCI(), st=cmbSteps(ci), h='<div class="cmb"><div class="cmb-top"><div class="cmb-tabs" role="tablist">';
  for(let i=0;i<cmbN();i++) h+='<button type="button" role="tab" aria-selected="'+(i===ci)+'" class="cmb-tab'+(i===ci?' on':'')+'" data-cmbtab="'+i+'">'+esc(cmbName(i))+'</button>';
  h+='</div><button type="button" class="cmb-add noico press" data-cmbadd="1" aria-label="Add a combo">+</button><button type="button" class="cmb-pen press'+(cmbEdit?' on':'')+'" data-cmbedit="1" aria-pressed="'+cmbEdit+'" aria-label="'+(cmbEdit?'Finish editing':'Edit combo')+'">'+(cmbEdit?'Done':'Edit')+'</button></div>';
  if(cmbEdit){ h+='<p class="cmb-hint">Pick one for each step. Only what this character can do is listed. Move, Extra Action, On Hit, and Free are optional.</p><label class="cmbe"><span>Name</span><input class="cmb-nm" data-cmbnm="1" maxlength="14" placeholder="Combo '+(ci+1)+'" value="'+esc(cmbName(ci)==="Combo "+(ci+1)?"":cmbName(ci))+'" aria-label="Combo name"></label>'+(cmbN()>1?'<button type="button" class="cmb-del noico press" data-cmbdel="1">Delete '+esc(cmbName(ci))+'</button>':'');
    st.forEach((x) =>{ const pool=cmbPool(x.sl), gs=[], by={}; pool.forEach((o) =>{ if(!by[o.g]){ by[o.g]=[]; gs.push(o.g); } by[o.g].push(o); });
      h+='<label class="cmbe"><span>'+x.lab+'</span><select class="cmb-sel" data-cmbsel="'+x.sl+'" aria-label="'+x.lab+' for Combo '+(ci+1)+'"><option value="">None</option>'+(x.key&&!x.it?'<option value="'+esc(x.key)+'" selected>(no longer available)</option>':'')+gs.map((g) =>{ return '<optgroup label="'+esc(g)+'">'+by[g].map((o) =>{ return '<option value="'+esc(o.k)+'"'+(o.k===x.key?' selected':'')+'>'+esc(o.n)+'</option>'; }).join("")+'</optgroup>'; }).join("")+'</select></label>'; });
    return h+'</div>'; }
  const f=cmbFocus(st);
  h+='<div class="cmb-chips">'+st.filter((x) =>{ return "abr".indexOf(x.sl)>=0; }).map((x) =>{ return '<button type="button" class="noico cmb-chip'+(f&&f.sl===x.sl?' on':'')+(x.dn?' dn':'')+'" data-cmbfoc="'+x.sl+'"><i></i>'+CMB_SH[x.sl]+'</button>'; }).join("")+'</div><div class="cmb-rail" style="--cmb-p:@@P@@">';
  st.forEach((x) =>{ if(!x.key&&"mxhf".indexOf(x.sl)>=0) return; const rl=x.it?cmbRes(x.it):[];
    if(f&&f.sl===x.sl){ const isNew=cmbLast!==x.sl+x.key; cmbLast=x.sl+x.key; const left=rl.length===1?rl[0].max-used(rl[0].k,rl[0].max):-1, nm=x.it.k.indexOf("sp:")===0?"Cast "+x.it.n:/^Attack \u00b7 /.test(x.it.n)?"Use Attack":"Use "+x.it.n;
      h+='<section class="cmbf'+(x.dn?' dn':'')+(isNew?' in':'')+'" data-sl="'+x.sl+'"><div class="cmbf-k">'+x.lab+(x.dn?' · Used':' · Now')+'</div><div class="cmbf-b">'+cmbBody(x.it)+'</div><div class="cmbf-ac"><button type="button" class="cmbf-use press" data-cmbuse="'+x.sl+'"'+(x.dn||left===0?' disabled':'')+'>'+(x.dn?'Used':left===0?'No uses left':esc(nm))+'</button><button type="button" class="cmbf-sk press" data-cmbdone="'+x.sl+'" aria-label="'+(x.dn?'Reset this step':'Skip this step')+'" title="'+(x.dn?'Reset':'Skip')+'">'+ico(x.dn?'ui-undo':'ui-redo')+'</button></div></section>'; return; }
    if(!x.it){ h+='<button type="button" class="cmbr emp" data-cmbedit="1"><span class="k">'+x.lab+'</span><span class="n">'+(x.key?'No longer available':'Not set')+'</span></button>'; return; }
    const r=x.dn?"Used":rl.length===1?(rl[0].max-used(rl[0].k,rl[0].max))+"/"+rl[0].max:"";
    h+='<button type="button" class="cmbr'+(x.dn?' dn':'')+'" data-cmbfoc="'+x.sl+'"><span class="k">'+x.lab+'</span><span class="n">'+esc(x.it.n)+'</span><span class="r">'+r+'</span></button>'; });
  h=h.replace("@@P@@",cmbPct(st,f)); return h+'</div><div class="cmb-bot"><button type="button" class="press" data-cmbundo="1">Undo</button><button type="button" class="press" data-cmbturn="1">End Turn</button></div></div>'; }catch(er){ return ""; } }
function cmbUse(sl){ const st=cmbSteps(cmbCI()).filter((x) =>{ return x.sl===sl; })[0]; if(!st||!st.it||st.dn) return; const it=st.it;
  if(it.k.indexOf("sp:")===0){ cmbQuick(it.i); return; }
  let rl=cmbRes(it), spent=""; if(rl.length>1){ const ex=rl.filter((q) =>{ return q.n===it.n; }); if(ex.length===1) rl=ex; }
  if(rl.length===1){ const r=rl[0]; if(used(r.k,r.max)>=r.max){ toast("No uses left of "+r.n+". A rest restores them."); return; } undoMark("Combo: "+it.n); S.used[r.k]=num(S.used[r.k],0)+1; spent=" "+(r.max-S.used[r.k])+" left"; }
  else undoMark("Combo: "+it.n);
  cmbSetDone(sl,true); cmbFoc=""; save(); try{ syncLU(); }catch(er){} toast("Used "+it.n+"."+spent); cmbRe(); }
function cmbQuick(i){ const x=(C.spells||[])[i]; if(!x) return; if(spAtWill(x)){ castDo(i,"",0); return; } const o=spCastOpts(x), av=o.filter(qOk);
  if(av.length>=1&&!x.rit&&(av.length===1||!av.some((q) =>{ return q.free; }))){ castDo(i,ckOf(av[0]),av[0].lv); return; } if(!av.length&&!x.rit){ toast("Nothing left to cast "+x.n+" with. A rest restores slots and uses."); return; } showEntry({type:"info",spec:"sp:"+i},true); }
function cmbRe(){ try{ const b=$("#sheetBody"); if(sheetMode==="combat"&&b){ const st=b.scrollTop, a=$("#cbAmt"), keep=a&&document.activeElement===a?a.value:null; b.innerHTML=combatHTML(); b.scrollTop=st; if(keep!=null){ const a2=$("#cbAmt"); if(a2){ a2.value=keep; } } } }catch(er){} try{ __R.pipSync(); }catch(er){} }
function cmbSetDone(sl,v){ S.cdn=S.cdn&&typeof S.cdn==="object"&&!Array.isArray(S.cdn)?S.cdn:{}; if(v) S.cdn[sl]=1; else delete S.cdn[sl]; if(!Object.keys(S.cdn).length) delete S.cdn; }
function cmbCast(nm){ const ci=cmbCI(); CMB_SL.forEach((s) =>{ if(cmbPick(ci,s[0])==="sp:"+nm){ cmbSetDone(s[0],true); cmbFoc=""; } }); }
function cmbAct(a,v){ try{ if(a==="tab"){ S.ccur=+v; save(); }
  else if(a==="add"){ undoMark("Add combo"); const n=cmbN(); S.cmbn=n+1; S.ccur=n; cmbEdit=true; save(); }
  else if(a==="del"){ const ci0=cmbCI(), nm0=cmbName(ci0); ask("Delete "+nm0+"? Its steps are removed. Undo can bring it back right after.","Delete",() =>{ undoMark("Delete combo"); const n=cmbN(); S.combos=Array.isArray(S.combos)?S.combos:[]; if(ci0<S.combos.length) S.combos.splice(ci0,1); S.cmbn=Math.max(1,n-1); S.ccur=Math.min(ci0,S.cmbn-1); delete S.cdn; save(); cmbRe(); }); return; }
  else if(a==="edit"){ cmbEdit=!cmbEdit; }
  else if(a==="turn"){ undoMark("New turn"); delete S.cdn; sitReset("turn"); save(); toast("New turn. Combo steps cleared."); }
  else if(a==="done"){ undoMark("Combo step"); cmbSetDone(v,!cmbDone(v)); save(); }
  else if(a==="sel"){ const sl=v[0], k=v[1], ci=cmbCI(); undoMark("Combo"); S.combos=Array.isArray(S.combos)?S.combos:[]; while(S.combos.length<=ci) S.combos.push({}); S.combos[ci]=S.combos[ci]&&typeof S.combos[ci]==="object"?S.combos[ci]:{}; if(k) S.combos[ci][sl]=k; else delete S.combos[ci][sl]; cmbSetDone(sl,false); save(); }
  }catch(er){} cmbRe(); }
document.addEventListener("click",(e) =>{ const t=e.target, b=t.closest&&t.closest("[data-cmbtab],[data-cmbadd],[data-cmbdel],[data-cmbedit],[data-cmbturn],[data-cmbdone],[data-cmbuse],[data-cmbfoc],[data-cmbundo],[data-cmbslot]"); if(!b) return;
  if(b.hasAttribute("data-cmbslot")){ showEntry({type:"info",spec:"sp:"+b.getAttribute("data-cmbslot")},true); return; }
  if(b.hasAttribute("data-cmbuse")){ cmbUse(b.getAttribute("data-cmbuse")); return; }
  if(b.hasAttribute("data-cmbfoc")){ cmbFoc=b.getAttribute("data-cmbfoc"); cmbRe(); return; }
  if(b.hasAttribute("data-cmbundo")){ const wc=sheetMode==="combat"; try{ undoNow(); }catch(er){} if(wc) openCombat(); else cmbRe(); return; }
  if(b.hasAttribute("data-cmbadd")){ cmbAct("add"); return; }
  if(b.hasAttribute("data-cmbdel")){ cmbAct("del"); return; }
  if(b.hasAttribute("data-cmbtab")) cmbAct("tab",b.getAttribute("data-cmbtab")); else if(b.hasAttribute("data-cmbedit")) cmbAct("edit"); else if(b.hasAttribute("data-cmbturn")) cmbAct("turn"); else cmbAct("done",b.getAttribute("data-cmbdone")); });
document.addEventListener("change",(e) =>{ const n=e.target.closest&&e.target.closest("[data-cmbnm]"); if(n){ const ci=cmbCI(), v=String(n.value||"").trim().slice(0,14); undoMark("Combo name"); S.combos=Array.isArray(S.combos)?S.combos:[]; while(S.combos.length<=ci) S.combos.push({}); S.combos[ci]=S.combos[ci]&&typeof S.combos[ci]==="object"?S.combos[ci]:{}; if(v&&v!=="Combo "+(ci+1)) S.combos[ci].n=v; else delete S.combos[ci].n; save(); cmbRe(); return; }
  const s=e.target.closest&&e.target.closest("[data-cmbsel]"); if(s) cmbAct("sel",[s.getAttribute("data-cmbsel"),s.value]); });
/* mini window: compact rows */
export function cmbPipH(){ try{ let ci=cmbCI(), h='<span class="pp-k">Combo</span>'; for(let i=0;i<cmbN();i++) h+='<button type="button" class="pp-ct'+(i===ci?' on':'')+'" data-ppct="'+i+'">'+(i+1)+'</button>'; h+='<button type="button" class="pp-ct" data-ppcturn="1" title="New turn">New turn</button><div class="pp-cl">';
  CMB_SL.forEach((s) =>{ const key=cmbPick(ci,s[0]); if(!key){ if("mxhf".indexOf(s[0])>=0) return; h+='<div class="pp-cr emp"><span class="pp-cs">'+s[1]+'</span><span class="pp-cn">Not set</span></div>'; return; }
    const it=cmbPool(s[0]).filter((o) =>{ return o.k===key; })[0], dn=cmbDone(s[0]); if(!it){ h+='<div class="pp-cr emp"><span class="pp-cs">'+s[1]+'</span><span class="pp-cn">No longer available</span></div>'; return; }
    let sub="", a=it.k.indexOf("atk:")===0?(C.attacks||[])[it.i]:null, d=a?D.atk[it.i]:null, x=it.k.indexOf("sp:")===0?(C.spells||[])[it.i]:null;
    if(a&&d) sub=sg(d.hit)+" • "+d.dmg; else if(x) sub=(x.l?"Level "+x.l:"Cantrip")+" • "+(x.r||"");
    h+='<div class="pp-cr'+(dn?' dn':'')+'"><span class="pp-cs">'+s[1]+'</span><span class="pp-cn">'+esc(it.n)+(sub?'<small>'+esc(sub)+'</small>':'')+'</span>'+(x?'<button type="button" class="pp-cu" data-ppcast="'+it.i+'">Cast</button>':'')+'<button type="button" class="pp-cu" data-ppcdone="'+s[0]+'" aria-pressed="'+dn+'">'+(dn?'Used':'Use')+'</button></div>'; });
  return h+'</div>'; }catch(er){ return ""; } }
export function cmbPipClick(e){ const b=e.target.closest&&e.target.closest("button"); if(!b) return;
  if(b.hasAttribute("data-ppct")){ cmbAct("tab",b.getAttribute("data-ppct")); return; }
  if(b.hasAttribute("data-ppcturn")){ cmbAct("turn"); return; }
  if(b.hasAttribute("data-ppcdone")){ const q=b.getAttribute("data-ppcdone"); if(cmbDone(q)) cmbAct("done",q); else cmbUse(q); return; }
  if(b.hasAttribute("data-ppcast")){ try{ env.focus(); }catch(er){} quickCast(+b.getAttribute("data-ppcast")); } }
function openCombat(){ showEntry({type:"combat"},false); }
document.addEventListener("click",(e) =>{ const t=e.target;
  const cb=t.closest&&t.closest("[data-cbhp]"); if(cb){ e.preventDefault(); const v=$("#cbAmt"); $("#hpAmt").value=v?v.value:""; (cb.getAttribute("data-cbhp")==="heal"?$("#healBtn"):$("#dmgBtn")).click(); }
  const co=t.closest&&t.closest("[data-condopen]"); if(co){ e.preventDefault(); showEntry({type:"cond"},true); return; }
  if(t.closest&&t.closest("#cbOpen")){ openCombat(); return; }
  if(sheetMode==="combat"&&t.closest&&t.closest("#sheetBody")&&!t.closest("input,select")) setTimeout(() =>{ if(sheetMode==="combat"){ const b=$("#sheetBody"), st=b.scrollTop, a=$("#cbAmt"), keep=a&&document.activeElement===a?a.value:null; b.innerHTML=combatHTML(); b.scrollTop=st; if(keep!=null){ const a2=$("#cbAmt"); a2.value=keep; a2.focus(); } } },30); });
document.addEventListener("keydown",(e) =>{ if(e.key==="Enter"&&e.target&&e.target.matches&&e.target.matches("[data-xpamt]")){ e.preventDefault(); const b=$('#sheetBody [data-xpadd="1"]'); if(b) b.click(); return; } });/* v22 i1 */
document.addEventListener("keydown",(e) =>{ if(e.key==="Enter"&&e.target&&e.target.id==="cbAmt"){ e.preventDefault(); const b=$(e.shiftKey?'#sheetBody [data-cbhp="heal"]':'#sheetBody [data-cbhp="dmg"]'); if(b) b.click(); } });
(function(){ const h=$(".hp-h"); if(h&&!$("#cbOpen")){ const b=document.createElement("button"); b.type="button"; b.id="cbOpen"; b.className="cbopen press"; b.textContent="Combat View"; h.appendChild(b); } })();

/* ---------- RU77 keyboard shortcuts ---------- */
const KEYS=[["Home: / N B S","On the character list: / searches, N creates a character, B backs up, S opens Settings. Ctrl+K also searches. Type a command word such as back or party, Enter runs it"],["1 to 7","Switch tabs: Actions, Spells, Inventory, Features, Description, Notes, Extras (in a narrow window, 1 to 9 follow the page buttons)"],["H","Heal the amount typed, or type an amount"],["D","Damage the amount typed, or type an amount"],["R","Rest"],["C","Conditions"],["K","Combat view"],["M","Main"],["S","Skills"],["A","Actions"],["P","Spells"],["I","Inventory"],["F","Features"],["B","Description"],["N","Notes"],["X","Extras"],["/","Search the sheet"],["L","Library: search every spell, item, feat, class and rule"],["Ctrl+K","Search and commands (Cmd+K on a Mac)"],["Ctrl+Z","Undo"],["Ctrl+Shift+Z","Redo (also Ctrl+Y)"],["?","This list"]];
function keysOpen(){ __set_navStack([]); openSheet("Keyboard Shortcuts",'<div class="keys">'+KEYS.map((x) =>{ return '<div><kbd>'+esc(x[0])+'</kbd><span>'+esc(x[1])+'</span></div>'; }).join("")+'</div><p class="muted">Shortcuts work when no text box is in use. In the amount box, Enter is Damage and Shift+Enter is Heal.</p>',"keys"); }
function goTab(i,id){ if(mq.matches){ const b=$('#bnav [data-go="'+i+'"]'); if(b) b.click(); } else if(id) setTab(id); else env.scrollTo({top:0}); }
document.addEventListener("keydown",(e) =>{ if(e.ctrlKey||e.metaKey||e.altKey||e.defaultPrevented) return; const t=e.target, tg=(t&&t.tagName)||"";
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(tg)||(t&&t.isContentEditable)) return; if(document.querySelector(".ask, #recov, #homeV:not([hidden]), #bkp:not([hidden])")) return; const bld=$("#bld"); if(bld&&!bld.hidden) return;
  const k=e.key.length===1?e.key.toUpperCase():e.key, open=sheet.classList.contains("on");
  if(e.key==="/"&&!open){ e.preventDefault(); openSearch(); return; }
  if(k==="L"&&!open){ e.preventDefault(); libOpen(); return; }/* v27 RU66 */
  if(k==="?"){ e.preventDefault(); keysOpen(); return; }
  if(open&&!/^(K|C)$/.test(k)) return;
  const amt=$("#hpAmt");
  if(/^[1-9]$/.test(k)){ const tl=mq.matches?$$("#bnav button[data-go]"):$$("#tabs .tab"), tb=tl[+k-1]; if(tb){ e.preventDefault(); if(mq.matches) tb.click(); else setTab(tb.getAttribute("data-tab"),true); } return; }/* v32 p31 */
  if(k==="H"||k==="D"){ e.preventDefault(); goTab(0); if(amt&&amt.value) (k==="H"?$("#healBtn"):$("#dmgBtn")).click(); else if(amt) amt.focus(); return; }
  if(k==="R"){ e.preventDefault(); openRest("menu"); return; }
  if(k==="C"){ e.preventDefault(); showEntry({type:"cond"},false); return; }
  if(k==="K"){ e.preventDefault(); openCombat(); return; }
  const map={M:[0,null],S:[1,null],A:[2,"p-actions"],P:[3,"p-spells"],I:[4,"p-inv"],F:[5,"p-feat"],B:[6,"p-desc"],N:[7,"p-notes"],X:[8,"p-ext"]}; if(map[k]){ e.preventDefault(); goTab(map[k][0],map[k][1]); } });

function CF0(){ return D.cf||{}; }
/* v32 RU137: a blue dot on the Build button while the build of this character has open choices (same number as Still to choose) */
export function bldDot(){ const b=document.getElementById("bldBtn"); if(!b) return; let n=0; try{ n=env.__bldOpenCount?(+env.__bldOpenCount()||0):0; }catch(e){ n=0; }
  let d=b.querySelector(".bdot"); if(n>0&&!d){ d=document.createElement("i"); d.className="bdot"; d.setAttribute("aria-hidden","true"); b.appendChild(d); } else if(!n&&d) d.remove();
  b.setAttribute("aria-label", n>0?"Build, "+n+" choice"+(n===1?"":"s")+" left":"Build, open character builder"); b.title=n>0?n+" choice"+(n===1?"":"s")+" left in the builder":""; }
env.__bldDot=bldDot;
export function renderAll(instant){
  try{ if((document.getElementById("bld")||{hidden:true}).hidden)gl14(x14());/* v94 */ if((document.getElementById("bld")||{hidden:true}).hidden&&env.__sp14Set)env.__sp14Set(!!(C&&C.rs==="2014"),false);/* v92: the sheet shows the spells of its own rules edition */ derive(); document.documentElement.setAttribute("data-rs",C&&C.rs==="2014"?"2014":"2024");/* v82: the sheet words follow the rules edition */ if(modeFix()) derive();/* v22 N1 */ renderIdentity(); renderAbilities(); renderTiles(); renderSkillsPage(); renderActions(); renderSpells(); renderInv(); renderFeat(); renderExtras(); syncHP(instant); renderConds(); bldDot(); }
  catch(e){ if(FROZEN!=="recover"){ recover("Drawing the sheet",e); setTimeout(() =>{ throw e; },0); } }/* v18 RU78 */
}


export function __set_bldDot(v){ return bldDot=v; }
export function __set_renderAll(v){ return renderAll=v; }
