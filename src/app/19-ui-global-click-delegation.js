import {hdPlan,x14} from "./03-data-glossary.js";
import {S,save} from "./04-logic-storage.js";
import {$,$$,clamp,esc,num,toast} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {REDUCE} from "./07-ui-theme-contrast-spring.js";
import {renderIdentity,renderTiles,syncLU,syncLang,used} from "./08-ui-render-sheet-and-actions.js";
import {DS_OVER,__set_DS_OVER,flash,hpFloat,hpOpen,syncDeath,syncHP,vbSync} from "./09-ui-hit-points-playbar-death-saves.js";
import {renderConds} from "./10-ui-conditions.js";
import {refreshEntry,sheet,sheetMode,showEntry,swpMove,swpSet} from "./12-ui-bottom-sheet-modal.js";
import {__R} from "./00-reg.js";
/* ================= GLOBAL CLICK DELEGATION ================= */
document.addEventListener("click",function(e){
  var inSheet=!!e.target.closest("#sheet");
  var ct=e.target.closest("[data-condtoggle]"); if(ct){ var ck=ct.getAttribute("data-condtoggle"); __R.undoMark((S.cond[ck]?"Remove ":"Add ")+ck); if(S.cond[ck]) delete S.cond[ck]; else S.cond[ck]=true; save(); __R.renderAll(); refreshEntry(); return; }
  var inf=e.target.closest("[data-info]"); if(inf && sheetMode!=="edit"){ e.preventDefault(); if(!inSheet) swpSet(inf); showEntry({type:"info",spec:inf.getAttribute("data-info")}, inSheet); return; }
  var bd=e.target.closest("[data-bd]"); if(bd && sheetMode!=="edit"){ showEntry({type:"bd",key:bd.getAttribute("data-bd")}, inSheet); return; }
  if(e.target.closest("#insp")){ __R.undoMark("Heroic Inspiration"); S.insp=!S.insp; save(); var b=$("#insp"); b.setAttribute("aria-pressed",S.insp); $("#inspN").textContent=S.insp?"Ready":"None"; vbSync(); return; }
  if(e.target.closest("#condOpen")){ showEntry({type:"cond"},false); return; }
  var off=e.target.closest("#conds [data-off]"); if(off){ __R.undoMark("Remove "+off.getAttribute("data-off")); delete S.cond[off.getAttribute("data-off")]; save(); __R.renderAll(); return; }
  var swb=e.target.closest("[data-swp]"); if(swb){ if(!swb.disabled) swpMove(+swb.getAttribute("data-swp")); return; }/* v36 p18 */
  var uf=e.target.closest("[data-usef]"); if(uf&&!uf.disabled){ var up=uf.getAttribute("data-usef").split("|"), ur=(D.res||[]).filter(function(q){return q.k===up[0]})[0]; if(ur){ __R.undoMark("Limited Use",1); var ulf=clamp(ur.max-used(up[0],ur.max)+(+up[1]),0,ur.max); S.used[up[0]]=ur.max-ulf; save(); syncLU(); refreshEntry(); toast((+up[1]<0?"Used ":"Gave back ")+esc(ur.n||"")+". "+ulf+" left"); } return; }/* v36 p17 */
  var plb=e.target.closest(".plb[data-k]"); if(plb){ var pk=plb.getAttribute("data-k"), pr=(D.res||[]).filter(function(q){return q.k===pk})[0]; if(pr){ __R.undoMark("Limited Use",1); var lf=clamp(pr.max-used(pk,pr.max)+(+plb.getAttribute("data-pd")),0,pr.max); S.used[pk]=pr.max-lf; save(); syncLU(); } return; }
  var bx=e.target.closest("#lu .bx, #featBody .bx, #actBody .bx, #spBody .bx, #sheetBody .bx[data-k]"); if(bx){ var k=bx.getAttribute("data-k"), i=+bx.getAttribute("data-i"); __R.undoMark(/^s\d$/.test(k)?"Spell slot":k==="hd"?"Hit Dice":"Limited Use"); S.used[k] = (num(S.used[k],0)===i+1) ? i : i+1; save(); syncLU(); return; }
  var rest=e.target.closest("[data-rest]"); if(rest){ __R.openRest(rest.getAttribute("data-rest")); return; }/* RU41 */
  var pip=e.target.closest("#dsS .pip, #dsF .pip"); if(pip){ __R.undoMark("Death Saving Throw"); var which=pip.parentNode.id==="dsS"?0:1, pi=+pip.getAttribute("data-i"); S.ds[which]=(S.ds[which]===pi+1)?pi:pi+1; save(); syncDeath(); if(S.ds[0]===3) toast("Stable at 0 Hit Points"); if(S.ds[1]===3) toast("Three failures. Your character dies"); return; }
});
export function doRest(kind,quiet){ __R.sitReset(kind==='short'?'short':'long'); var ex0=num(S.exh,0), hp14=(kind!=="short"&&x14())?hdPlan():null;/* v94 */ if(S.mode){ if(kind==="short"){ ["rage","sacred","wings","radiance","shroud"].forEach(function(k){ delete S.mode[k]; }); } else delete S.mode; }/* v22: Rage, Sacred Weapon, and Celestial Revelation last minutes, Wild Shape hours */
  D.res.forEach(function(r){
    var u=num(S.used[r.k],0);
    if(kind==="short"){ if(r.reset==="short") u=0; else if(r.reset==="short1") u=Math.max(0,u-1); }    else if(hp14&&hp14[r.k]!=null) u=Math.max(0,u-hp14[r.k]);/* v94: 2014, half of the Hit Dice come back */
    else { if(r.reset!=="none") u=0; }
    S.used[r.k]=u;
  });
  if(kind==="short"){ if(!quiet) toast("Short Rest: uses restored."); }
  else { var before=S.hp; S.hp=D.hpmax; S.tmp=0; S.ds=[0,0]; if(S.exh>0) S.exh--; if(S.hp>before) flash("healed"); if(__R.hasFeat("Resourceful")&&!S.insp){ S.insp=true; try{ renderTiles(); }catch(er){} }/* v21 RU54 */ if(!quiet) toast(x14()?"Long Rest: Hit Points, up to half of your Hit Dice, and every use restored.":"Long Rest: Hit Points, Hit Dice, and every use restored."); }  save(); syncHP(); syncLU(); renderConds();
  if(kind!=="short"&&ex0>0){ try{ __R.renderAll(); }catch(er){} }/* v94: a lower Exhaustion level changes Speed, checks, and (2014) the Hit Point maximum, so the sheet is worked out again */
}
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-campadd]"); if(!b) return; e.preventDefault(); var t=[].slice.call(document.querySelectorAll("[data-tab='p-desc'],[data-go='6']")).filter(function(x){ return x.offsetParent; })[0]; if(t) t.click(); setTimeout(function(){ var i=$("#n-camp"); if(i){ i.scrollIntoView({block:"center"}); i.focus(); } },450); });/* T10 */
["#notesBody","#descBody"].forEach(function(sel){ var nb=$(sel); if(nb) nb.addEventListener("input",function(e){/* v23: Description tab too */
  var t=e.target;
  if(t.hasAttribute("data-note")){ S.notes[t.getAttribute("data-note")]=t.value; save(); }
  else if(t.hasAttribute("data-lang")){ S.lang[+t.getAttribute("data-lang")]=t.value; save(); syncLang(); }
  else if(t.id==="n-align"){ S.align=t.value; save(); }
  else if(t.id==="n-camp"){ S.camp=t.value; save(); renderIdentity(); }/* v30 RU133 */
}); });
(function(){
  var inp=$("#hpAmt");
  function amt(){ var v=parseInt(inp.value,10); return isNaN(v)?0:Math.max(0,v); }
  function nudge(){ inp.focus(); inp.classList.remove("nudge"); void inp.offsetWidth; inp.classList.add("nudge"); clearTimeout(nudge.t); nudge.t=setTimeout(function(){ inp.classList.remove("nudge"); },900); }
  $("#healBtn").addEventListener("click",function(){ var a=amt(); if(!a){nudge();return;} __R.undoMark("Healing"); var wasZero=S.hp===0, before=S.hp; S.hp=Math.min(D.hpmax,S.hp+a); if(wasZero) S.ds=[0,0]; if(S.hp>before){ flash("healed"); hpFloat("+"+(S.hp-before),"heal"); } inp.value=""; save(); syncHP(); __R.toastU("Healed "+(S.hp-before)+" "+__R.hpWord(S.hp-before)+"."); });
  $("#dmgBtn").addEventListener("click",function(){ var a=amt(); if(!a){nudge();return;} __R.undoMark("Damage"); var a0=a, fromTmp=Math.min(S.tmp,a); S.tmp-=fromTmp; a-=fromTmp; var before=S.hp; S.hp=Math.max(0,S.hp-a); if(S.hp<before){ flash("hit"); hpFloat("\u2212"+(before-S.hp),"dmg"); } else if(fromTmp) hpFloat("\u2212"+fromTmp+" temp","tmp"); inp.value="";
    var cm="", z0=before===0&&a>0&&S.ds&&S.ds[1]<3&&!(S.exh>=6); if(z0){ S.ds=S.ds.slice(); if(S.ds[0]>=3) S.ds[0]=0; S.ds[1]=Math.min(3,S.ds[1]+1); }/* v32 p26: damage at 0 Hit Points is a failure */
    if(before>0&&S.hp===0) __set_DS_OVER(Math.max(0,a-before)>=D.hpmax?a-before:0);
    if(__R.concOf()&&S.hp===0) cm=" "+__R.concEnd("0 Hit Points"); save(); syncHP(); renderConds();
    if(before>0 && S.hp===0){ __R.toastU("0 Hit Points. Start making Death Saving Throws."+cm); if(__R.mq.matches&&__R.curPage!==0&&!sheet.classList.contains("on")) hpOpen(); else if(!sheet.classList.contains("on")) setTimeout(function(){ var g=document.getElementById("dsGuide"); if(g&&g.scrollIntoView) g.scrollIntoView({block:"nearest",behavior:REDUCE?"auto":"smooth"}); },480); }
    else if(z0) __R.toastU("Took "+a0+" damage at 0 Hit Points: one Death Saving Throw failure ("+S.ds[1]+" of 3)."+(S.ds[1]>=3?" Your character dies.":" A Critical Hit counts as two: use Critical Hit under Death Saves."));
    else __R.toastU("Took "+a0+" damage"+(fromTmp?" ("+fromTmp+" from Temporary Hit Points)":"")+".");
    if(__R.concOf()) __R.concCheck(a0); });/* v21 RU57, RU50 */
  inp.addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); (e.shiftKey?$("#healBtn"):$("#dmgBtn")).click(); } });
  $$("[data-tmp]").forEach(function(b){ b.addEventListener("click",function(){ __R.undoMark("Temporary Hit Points",1); S.tmp=Math.max(0,S.tmp+(+b.getAttribute("data-tmp"))); save(); syncHP(); }); });
  /* v30 B6: +1, +5, +10 add to the amount, the last button clears it. B7: Set puts the typed amount into Temporary HP */
  $$("[data-hpadd]").forEach(function(b){ b.addEventListener("click",function(){ var n=+b.getAttribute("data-hpadd"); inp.value=n?String(amt()+n):""; inp.classList.remove("pop"); void inp.offsetWidth; if(n) inp.classList.add("pop"); }); });
  (function(){ var tv=$("#tmpV"); if(!tv||tv.tagName!=="INPUT") return;/* v31 p96: type Temporary HP directly */
    function commit(){ var v=Math.max(0,Math.floor(+tv.value||0)); if(v===S.tmp){ tv.value=S.tmp; return; } __R.undoMark("Temporary Hit Points"); S.tmp=v; save(); syncHP(); __R.toastU("Temporary Hit Points: "+v+"."); }
    tv.addEventListener("change",commit); tv.addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); tv.blur(); } }); tv.addEventListener("focus",function(){ try{ tv.select(); }catch(er){} }); })();
  $$("[data-tmpset]").forEach(function(b){ b.addEventListener("click",function(){ var a=amt(); if(!a){ toast("Type an amount first, then press Set."); return; } __R.undoMark("Temporary Hit Points"); S.tmp=a; inp.value=""; save(); syncHP(); __R.toastU("Temporary Hit Points: "+a+"."); }); });
})();

