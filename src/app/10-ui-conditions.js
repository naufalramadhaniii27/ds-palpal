import {HB_CONDS,HB_SRC,STD_CONDS} from "./02-data-default-character.js";
import {GLOSS,exHelp,exTxt,x14} from "./03-data-glossary.js";
import {S} from "./04-logic-storage.js";
import {$,esc} from "./05-logic-helpers.js";
import {vbSync} from "./09-ui-hit-points-playbar-death-saves.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"activeConds",{get:function(){return activeConds;},set:function(v){activeConds=v;},configurable:true});
Object.defineProperty(__R,"renderConds",{get:function(){return renderConds;},set:function(v){renderConds=v;},configurable:true});
/* ================= CONDITIONS ================= */
export function activeConds(){
  var list=[];
  STD_CONDS.forEach(function(c){ if(S.cond[c]) list.push({k:c}); });
  HB_CONDS.forEach(function(c){ if(S.cond[c.k]) list.push({k:c.k,hb:true,extra:c.stack?(" ×"+S.burn):(c.num&&S.jinx?" ("+esc(S.jinx)+")":"")}); });
  return list;
}
export function renderConds(){
  var list=activeConds();
  __R.concAuto();/* v21 RU50 */ __R.modeClean(); __R.modeAuto();/* v22 M2, m3 */
  var any=list.length||S.exh;/* v30 B3, RU84: a titled row; Exhaustion is a chip too; empty is a clear Add condition button */
  var h = '<span class="cond-l">Conditions</span>'+(typeof __R.lintChip==="function"?__R.lintChip():"")+__R.modeChips()+__R.concChip()+(S.exh?'<button type="button" class="chip on exh-c press" data-info="g:Exhaustion">Exhaustion '+S.exh+'</button>':'')+list.map(function(c){return '<button type="button" class="chip on cnd press'+(c.hb?' hb':'')+'" data-info="g:'+c.k+'">'+(window.__artIc?window.__artIc("condition",c.k):"")+c.k+(c.extra||"")+'</button>'}).join("");
  h += '<button type="button" class="chip add press" id="condOpen">'+(any?'Edit':'Add condition')+'</button>';
  if(S.exh) h += '<button type="button" class="exh-note tx" data-info="g:Exhaustion">Exhaustion '+S.exh+': '+exTxt(S.exh)+'</button>';
  $("#conds").innerHTML = h; __R.concHead(); vbSync();
}
export function condHTML(){
  var h = '<div class="exh"><div><b><button type="button" class="tx" data-info="g:Exhaustion">Exhaustion</button></b><small>'+exHelp()+'</small></div><span class="stepper"><button type="button" data-exh="-1" aria-label="Decrease">−</button><output>'+S.exh+'</output><button type="button" data-exh="1" aria-label="Increase">+</button></span></div>';
  /* v30 B12: icon cards that light up when active. The name toggles, the i button opens the rule */
  function card(k,d,hb,extra){ var on=!!S.cond[k]; return '<div class="cc'+(on?' on':'')+(extra?' wide':'')+'"><button type="button" class="tog cc-b press" data-c="'+k+'" aria-pressed="'+on+'">'+__R.ico("cond-"+k.toLowerCase())+'<span class="cc-n">'+k+'</span>'+(hb?'<span class="flag hb">HB</span>':'')+'<span class="cc-s" aria-hidden="true">'+__R.ico("ui-check")+'</span></button><button type="button" class="cc-i press" data-info="g:'+k+'" aria-label="About '+k+'" title="About '+k+'">'+__R.ico("ui-info")+'</button>'+(extra||'')+'</div>'; }
  h += '<span class="src" style="margin-bottom:8px">'+(x14()?"PHB-2014, Appendix A":"PHB-2024, Rules Glossary")+'</span><p class="cc-help">Tap a condition to turn it on or off. The i button shows its rules.</p>';
  h += '<div class="ccg">'+STD_CONDS.map(function(c){ return card(c,GLOSS[c].d,false); }).join("")+'</div>';
  h += '<span class="src" style="margin:12px 0 8px">'+HB_SRC+'</span>';
  h += '<div class="ccg">'+HB_CONDS.map(function(c){
    var ex="";
    if(c.stack) ex='<div class="hbx">Stacks <span class="stepper"><button type="button" data-burn="-1" aria-label="Remove a stack">−</button><output>'+S.burn+'</output><button type="button" data-burn="1" aria-label="Add a stack">+</button></span></div>';
    if(c.num) ex='<div class="hbx"><label for="jinxN">Recorded number</label><input id="jinxN" class="jin" type="number" min="1" max="20" inputmode="numeric" value="'+esc(S.jinx)+'"></div>';
    return card(c.k,c.d,true,ex);
  }).join("")+'</div>';
  return h;
}

