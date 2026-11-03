import {S,save} from "./04-logic-storage.js";
import {$,clamp,esc,num} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {REDUCE,spring} from "./07-ui-theme-contrast-spring.js";
import {__R} from "./00-reg.js";
import { html, raw, render, render as drawHtml, raw as rawHtml } from "./lib/html.js";
/* ================= HIT POINTS ================= */
let flashT=null;
export function buzz(ms){ try{ if(__store.getItem("mi-bz")==="off") return; }catch(e){} try{ if(navigator.vibrate&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)) navigator.vibrate(ms||8); }catch(e){} }/* v29: short haptic tap on phones */
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("#healBtn,#dmgBtn,.pip,.slot,.lu-box,.box,.ifb,.tab,#bnav button"); if(t) buzz(t.id==="dmgBtn"?[12,30,12]:8); },true);
export function flash(cls){ const el=$("#hpCur"), vc=cls==="hit"?"m-hit":"m-heal", xs=[document.querySelector(".vitals"),document.getElementById("vbHp"),document.getElementById("hpBox")];/* v29 RU120, v30 */
  const again=el.classList.contains("hit")||el.classList.contains("healed")||xs.some((x) =>{ return x&&(x.classList.contains("m-hit")||x.classList.contains("m-heal")); });
  el.classList.remove("hit","healed"); xs.forEach((x) =>{ if(x) x.classList.remove("m-hit","m-heal"); }); if(again) void el.offsetWidth;/* v30 p13: one forced layout, only to restart a running animation */
  el.classList.add(cls); xs.forEach((x) =>{ if(x) x.classList.add(vc); });
  clearTimeout(flashT); flashT=setTimeout(() =>{ el.classList.remove(cls); xs.forEach((x) =>{ if(x) x.classList.remove("m-hit","m-heal"); }); },700); }
/* v50: a number rises from the Hit Points and fades. The sign stays, so the meaning does not rest on colour alone */
export function hpFloat(txt,kind){ if(REDUCE||!document.body.animate) return; let el=$("#hpCur"); if(!el||!el.offsetParent) el=document.getElementById("vbHpV"); if(!el||!el.getBoundingClientRect) return; const r=el.getBoundingClientRect(); if((!r.width&&!r.height)||r.bottom<0||r.top>innerHeight) return;
  const f=document.createElement("i"); f.className="hpf hpf-"+kind; f.textContent=txt; f.setAttribute("aria-hidden","true"); f.style.left=Math.round(r.left+r.width/2)+"px"; f.style.top=Math.round(r.top)+"px"; document.body.appendChild(f); setTimeout(() =>{ if(window.__miEcho) window.__miEcho(f); },0);/* v55 echo */
  const a=f.animate([{transform:"translate(-50%,0) scale(.7)",opacity:0},{transform:"translate(-50%,-14px) scale(1.08)",opacity:1,offset:.25},{transform:"translate(-50%,-44px) scale(1)",opacity:0}],{duration:1000,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
  a.onfinish=a.oncancel=function(){ if(f.parentNode) f.parentNode.removeChild(f); }; setTimeout(() =>{ if(f.parentNode) f.parentNode.removeChild(f); },1500); }
export function barColor(p){ return p>.5 ? "var(--good)" : (p>.25 ? "var(--warn)" : "var(--bad)"); }
function hpLv(p){ return p>.5?"ok":p>.25?"mid":"low"; }/* v32 p27 RU113: the level as a pattern too */
export function syncHP(instant){
  S.hp = clamp(S.hp,0,D.hpmax); S.tmp = Math.max(0,S.tmp);
  const cur=$("#hpCur"), bar=$("#hpBar"), tb=$("#tmpBar");
  if(window.__miOdo&&window.__MI&&!window.__MI.rm()) window.__miOdo(cur,S.hp); else spring("hpNum", S.hp, (x) =>{ const r=String(Math.round(x)); if(cur.textContent!==r) cur.textContent=r; }, {k:140, instant:instant});/* v55: odometer *//* v30 p13: write only what changed */
  __R.barTo(bar, clamp(S.hp/D.hpmax,0,1), instant, barColor(S.hp/D.hpmax));/* v31 p21: compositor spring */ bar.setAttribute("data-lv",hpLv(S.hp/D.hpmax));/* v32 p27 RU113 */
  (function(){ let g=document.getElementById("hpGhost"); if(!g&&bar.parentNode){ g=document.createElement("i"); g.id="hpGhost"; bar.parentNode.insertBefore(g,bar); } if(!g) return; const to=clamp(S.hp/D.hpmax,0,1), was=+(g.getAttribute("data-v")||to);
    g.style.transition=(instant||to>was)?"none":""; g.style.transform="scaleX("+to+")"; g.setAttribute("data-v",to); })();/* v29 RU120: the red trail follows the bar down a moment later */
  __R.barTo(tb, clamp(S.tmp/D.hpmax,0,1), instant);/* v31 p21 */
  const hmx=$("#hpMax"); if(hmx.getAttribute("data-v")!==String(D.hpmax)||!hmx.firstElementChild){ hmx.setAttribute("data-v",D.hpmax); render(html`<button type="button" class="bd" data-bd="hp" style="border-radius:6px;padding:0 4px">${D.hpmax}</button>`,hmx); }/* v30 p13 */
  $("#hpChipV").textContent = S.hp + (S.tmp?"+"+S.tmp:"");
  (function(){ const tv=$("#tmpV"); if(!tv) return; if(tv.tagName==="INPUT"){ if(document.activeElement!==tv) tv.value=S.tmp; } else tv.textContent=S.tmp; })();/* v31 p96 */
  const ht=$("#hpTmp"); ht.textContent="+"+S.tmp+" temp"; ht.classList.toggle("on",S.tmp>0);
  $("#death").classList.toggle("on", S.hp===0);
  Array.prototype.forEach.call(document.querySelectorAll(".vitals,#hpBox,#vbHp"),(x) =>{ x.classList.toggle("hp0",S.hp===0); });/* v50: a slow red pulse at 0 */
  if(S.hp>0) S.ds=[0,0];
  syncDeath(); vbSync();
}
/* v30 RU87, RU84: play bar on phones (HP, Temp HP, AC, conditions with Exhaustion, Concentration, Heroic Inspiration) */
export function vbSync(){ if(__R.PIP) try{ __R.pipSync(); }catch(er){} __R.ohSync(); const vb=document.getElementById("vbar"); if(!vb||!D||!D.hpmax) return;
  try{ const hp=clamp(num(S.hp,0),0,D.hpmax), tp=Math.max(0,num(S.tmp,0)), p=clamp(hp/D.hpmax,0,1);
  const hasI=typeof __R.ICO==="object"&&!!__R.ICO; if(hasI&&!vb.getAttribute("data-ico")){ vb.setAttribute("data-ico","1"); render(raw(__R.ico("hp-heal","vb-hi")),$("#vbHpI")); render(raw(__R.ico("tag-concentration")),$("#vbConc")); render(raw(__R.ico("ui-star","vb-star")),$("#vbInsp")); }
  if(window.__miOdo&&window.__MI&&!window.__MI.rm()) window.__miOdo($("#vbHpV"),hp); else $("#vbHpV").textContent=hp; $("#vbHpM").textContent=D.hpmax; const t=$("#vbTmp"); t.hidden=!tp; t.textContent="+"+tp;
  const b=$("#vbBar"); b.style.transform="scaleX("+p+")"; b.style.backgroundColor=barColor(p); b.setAttribute("data-lv",hpLv(p)); $("#vbTbar").style.transform="scaleX("+clamp(tp/D.hpmax,0,1)+")";
  $("#vbHp").setAttribute("aria-label","Hit Points "+hp+"/"+D.hpmax+(tp?" +"+tp+" temporary":"")+". Heal or take damage"); $("#vbHp").classList.toggle("zero",hp===0);
  $("#vbAcV").textContent=D.ac; $("#vbAc").setAttribute("aria-label","Armor Class "+D.ac);
  const L=__R.activeConds().map((c) =>{ return c.k+(c.extra||""); }); if(S.exh) L.unshift("Exhaustion "+S.exh);
  const cb=$("#vbCond"), k0=S.exh?"exhaustion":(__R.activeConds()[0]||{}).k; cb.classList.toggle("on",L.length>0);
  if(hasI) render(raw(L.length?(__R.ico("cond-"+String(k0).toLowerCase())||__R.ico("cond-exhaustion")):__R.ico("ui-plus")),$("#vbCondI"));
  $("#vbCondT").textContent=L.length?L[0]+(L.length>1?" +"+(L.length-1):""):"Conditions";
  cb.classList.toggle("vb-none",!L.length);
  cb.setAttribute("aria-label",L.length?"Conditions: "+L.join(", ")+". Change conditions":"No conditions. Add a condition");
  const o=__R.concOf(), cc=$("#vbConc"); cc.hidden=!o; if(o){ const i=__R.spIx(o.n); if(i>=0) cc.setAttribute("data-info","sp:"+i); else cc.removeAttribute("data-info"); cc.setAttribute("aria-label","Concentrating on "+o.n+". Open the spell"); cc.title="Concentrating on "+o.n; }
  $("#vbInsp").setAttribute("aria-pressed",S.insp?"true":"false"); }catch(er){}
}
/* Hit Points from any page: Main scrolls to the card, other pages open the same controls in a bottom sheet */
export function hpDockBack(){ const s=document.getElementById("hpSlot"), h=document.getElementById("hpBox"), b=document.getElementById("sheetBody"); if(b) b.classList.remove("hpdock"); if(s&&h&&s.nextElementSibling!==h) s.parentNode.insertBefore(h,s.nextSibling); }
export function hpOpen(){ const h=document.getElementById("hpBox"); if(!h) return;
  if(!__R.mq.matches||__R.curPage===0){ const v=document.querySelector(".vitals"), pm=$("#p-main"); if(v&&pm&&__R.mq.matches) pm.scrollTo({top:Math.max(0,v.getBoundingClientRect().top-pm.getBoundingClientRect().top+pm.scrollTop-8),behavior:REDUCE?"auto":"smooth"}); return; }
  let slot=document.getElementById("hpSlot"); if(!slot){ slot=document.createElement("i"); slot.id="hpSlot"; slot.hidden=true; h.parentNode.insertBefore(slot,h); }
  __R.navStack=[]; __R.openSheet("Hit Points","","hp"); const b=$("#sheetBody"); b.classList.add("hpdock"); b.appendChild(h); }
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("#vbHp,#vbCond,#vbInsp"); if(!t) return;
  if(t.id==="vbCond"){ __R.showEntry({type:"cond"},false); return; }
  if(t.id==="vbInsp"){ const ib=$("#insp"); if(ib) ib.click(); vbSync(); return; }
  hpOpen(); });
const pips=(n,max,lbl) => html`${Array.from({length:max},(_,i) => html`<button type="button" class="pip" aria-pressed="${i<n}" data-i="${i}" aria-label="${lbl+" "+(i+1)}"></button>`)}`;
export function syncDeath(){ render(pips(S.ds[0],3,"Success"),$("#dsS")); render(pips(S.ds[1],3,"Failure"),$("#dsF"));
  let dead=S.hp===0&&S.ds[1]>=3, v=document.querySelector(".vitals"), n=document.getElementById("deadNote"); if(v) v.classList.toggle("dead",dead);/* v29 RU127 */
  if(!n){ n=document.createElement("div"); n.id="deadNote"; n.className="dead-note"; const di=document.querySelector(".death-in"); if(di) di.insertBefore(n,di.firstChild); }
  drawHtml(dead ? html`<b>Dead</b><span>${rawHtml(S.exh>=6?'Exhaustion level 6':'Three failed death saves')}. Heal or lower Exhaustion to undo.</span>` : html``, n); n.hidden=!dead; if(S.hp!==0) DS_OVER=0; dsGuideSync();/* v32 p26 */ }
/* v32 p26 RU130: guide for Death Saving Throws (rules: PHB 2024, Death Saving Throws) */
export var DS_OVER=0;
function dsGuideH(){ const s=S.ds||[0,0], st=s[0]>=3, dead=s[1]>=3; if(S.hp!==0||dead) return "";
  const ic=function(k,c){ return (typeof __R.ICO==="object"&&__R.ICO)?__R.ico(k,c):""; }, b=function(k,ik,t,sm){ return '<button type="button" class="btn press dsb dsb-'+k+'" data-dsr="'+k+'">'+ic(ik,"dsb-i")+'<span><b>'+t+'</b>'+(sm?'<small>'+sm+'</small>':'')+'</span></button>'; };
  let h='<div class="dsg" id="dsGuide">';
  if(DS_OVER>0) h+='<div class="caution dsg-mass"><span>Massive damage: '+DS_OVER+' damage was left over after you dropped to 0, which is at least your Hit Point maximum ('+D.hpmax+'). By the rules your character dies.</span><button type="button" class="btn press dsb" data-dsr="dead">'+ic("death-fail","dsb-i")+'<span><b>Mark as Dead</b></span></button></div>';
  if(st) h+='<p class="dsg-t">'+(window.__artVig?window.__artVig("moment","stabilized",72):"")+'<b>Stable.</b> You stop making Death Saving Throws but stay Unconscious. Without healing you regain 1 Hit Point after 1d4 hours.</p>';
  else h+='<p class="dsg-t"><b>Death Saving Throw.</b> At the start of each of your turns, roll a d20 and tap the result. Three successes: Stable. Three failures: you die.'+((D.cf&&D.cf.ds||[]).length?' '+__R.cfFlags(D.cf.ds)+(function(){ const L=D.cf.ds, a=L.filter((x) =>{ return x.t==="ADV"; }), d=L.filter((x) =>{ return x.t==="DIS"; }); return ' '+(a.length&&d.length?'Advantage and Disadvantage cancel out, so you roll normally':'You roll with '+(a.length?'Advantage':'Disadvantage'))+' ('+esc(L.map((x) =>{ return x.s; }).join(", "))+').'; })():'')+'</p><div class="dsg-b">'+b("s","death-success","10 or higher","Success")+b("f","death-fail","9 or lower","Failure")+b("1","death-fail","Rolled a 1","Two failures")+b("20","hp-heal","Rolled a 20","Regain 1 Hit Point")+'</div>'+(window.__miRoll&&window.__miRoll.roll?'<p><button type="button" class="btn pri press dsb-roll" data-dsroll="1">Roll the death save for me</button></p>':'');
  h+='<p class="dsg-t2">Hit while at 0 Hit Points?</p><div class="dsg-b">'+b("d","hp-damage","Damage","One failure")+b("c","hp-damage","Critical Hit","Two failures")+'</div></div>';
  return h; }
function dsGuideSync(){ const di=document.querySelector(".death-in"); if(!di) return; const g=document.getElementById("dsGuide"), h=dsGuideH();
  if(!h){ if(g) g.remove(); return; } if(g&&g.getAttribute("data-k")===h.length+":"+(S.ds||[]).join()) return; if(g) g.remove(); di.insertAdjacentHTML("beforeend",h); const n=document.getElementById("dsGuide"); if(n) n.setAttribute("data-k",h.length+":"+(S.ds||[]).join()); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-dsr]"); if(!b||S.hp!==0) return; e.preventDefault(); let k=b.getAttribute("data-dsr"), s=(S.ds||[0,0]).slice(), msg="";
  __R.undoMark("Death Saving Throw");
  if(k==="20"){ S.hp=1; S.ds=[0,0]; DS_OVER=0; flash("healed"); save(); syncHP(); __R.renderConds(); __R.toastU("Rolled a 20: you regain 1 Hit Point and wake up."); return; }
  if(k==="dead"){ S.ds=[0,3]; DS_OVER=0; save(); syncHP(); __R.toastU("Marked as dead. Undo if your DM rules otherwise."); return; }
  if(k==="s") s[0]=Math.min(3,s[0]+1); else { if(s[0]>=3&&(k==="d"||k==="c")) s[0]=0; s[1]=Math.min(3,s[1]+(k==="1"||k==="c"?2:1)); }
  S.ds=s; save(); syncHP();
  msg=s[1]>=3?"Three failures. Your character dies.":s[0]>=3?"Three successes. You are Stable.":(k==="s"?"Success":k==="d"?"Damage at 0 Hit Points: one failure":k==="c"?"Critical Hit at 0 Hit Points: two failures":k==="1"?"Rolled a 1: two failures":"Failure")+". Successes "+s[0]+" of 3, failures "+s[1]+" of 3.";
  __R.toastU(msg); });


export function __set_syncHP(v){ return syncHP=v; }
export function __set_DS_OVER(v){ return DS_OVER=v; }
