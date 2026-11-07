import {copyText} from "./lib/clipboard.js";
import {ABK} from "./02-data-default-character.js";
import {APP_DATE,APP_LABEL,APP_VER,C,DEF,S,__set_C,__set_S,clone,lsGet,save} from "./04-logic-storage.js";
import {eqOn,esc,num,sg,toast} from "./05-logic-helpers.js";
import {D,derive,richP} from "./06-logic-derivation.js";
import {featAll} from "./08-ui-render-sheet-and-actions.js";
import {BKEY,rEnsure} from "./14-ui-editor.js";
import {dlFile,rSnap} from "./15-logic-roster-backup-files-snapshots.js";
import {coinsNow} from "./23c-ui-coins.js";import {ordL,scOf} from "./23e-ui-spells-dc.js";
import {cuNm} from "./26-ui-customize.js";
import {__R} from "./00-reg.js";
import {env} from "./00-env.js";
import {rC,rS} from "./27-ui-party-search-commands-library.js";
import {libAddDo} from "./27b-ui-library.js";
Object.defineProperty(__R,"foundryOut",{get:function(){return foundryOut;},set:function(v){foundryOut=v;},configurable:true});
Object.defineProperty(__R,"oldNoteH",{get:function(){return oldNoteH;},set:function(v){oldNoteH=v;},configurable:true});
Object.defineProperty(__R,"pinOn",{get:function(){return pinOn;},set:function(v){pinOn=v;},configurable:true});
Object.defineProperty(__R,"pinSpBtn",{get:function(){return pinSpBtn;},set:function(v){pinSpBtn=v;},configurable:true});
Object.defineProperty(__R,"pinnedH",{get:function(){return pinnedH;},set:function(v){pinnedH=v;},configurable:true});
Object.defineProperty(__R,"reportOpen",{get:function(){return reportOpen;},set:function(v){reportOpen=v;},configurable:true});
/* v29 RU126: keep the input, swap only the results */

/* RU68: spell cards to print, several on an A4 page. Long rules text takes two card spaces */
function spCardH(x,i){ const xs=scOf(x), lv=x.l?ordL(x.l)+" "+x.sch:x.sch+" cantrip", full=x.full||x.sum||"", lg=full.length>650;
  const hd=x.sv==="ATK"?"Spell attack "+sg(xs.atk):x.sv?x.sv+" save, DC "+xs.dc:"";
  return '<div class="spc'+(lg?' long':'')+'"><div class="spc-h"><b>'+esc(cuNm("s:"+x.n,x.n))+'</b><small>'+esc(lv)+(x.conc?' • Concentration':'')+(x.rit?' • Ritual':'')+'</small></div>'+
    '<div class="spc-k"><span><small>Casting Time</small>'+esc(x.ct+(x.rit?" or Ritual":""))+'</span><span><small>Range</small>'+esc(x.r||"")+'</span><span><small>Components</small>'+esc(x.cmp||"")+(x.mat?' ('+esc(x.mat)+')':'')+'</span><span><small>Duration</small>'+esc((x.conc?"Concentration, ":"")+(x.dur||""))+'</span></div>'+
    (hd?'<p class="spc-sv">'+esc(hd)+'</p>':'')+'<div class="spc-t">'+richP(full)+'</div><p class="spc-f">'+esc((x.src||"")+(x.pg?" • PHB-2024, pg. "+x.pg:""))+'</p></div>'; }
export function printCards(){ const L=[],seen={}; (C.spells||[]).forEach((x) =>{ if(seen[x.n]) return; seen[x.n]=1; L.push(x); }); if(!L.length){ toast("No spells to print yet."); return; }
  L.sort((a,b) =>{ return (a.l||0)-(b.l||0)||(a.n<b.n?-1:1); }); const old=document.getElementById("spCards"); if(old) old.remove();
  const w=document.createElement("div"); w.id="spCards"; w.setAttribute("aria-hidden","true"); w.innerHTML=L.map(spCardH).join(""); document.body.appendChild(w);
  const R=document.documentElement; R.setAttribute("data-print","cards"); const done=function(){ R.removeAttribute("data-print"); const c=document.getElementById("spCards"); if(c) c.remove(); window.removeEventListener("afterprint",done); };
  window.addEventListener("afterprint",done); try{ window.print(); }catch(e){} setTimeout(() =>{ if(!window.matchMedia||!window.matchMedia("print").matches) done(); },1500); }
/* RU71: a report for the person who keeps the app. Nothing is sent from here: the text is copied, the player chooses where to paste it */
const ERRLOG=[];
window.addEventListener("error",(e) =>{ ERRLOG.push({t:new Date().toISOString(),m:String(e.message||"").slice(0,300),f:String(e.filename||"").slice(-60)+":"+(e.lineno||0)}); if(ERRLOG.length>20) ERRLOG.shift(); });
/* Reporting: a blocked script, style or connection (Content Security Policy) is listed in the problem report with the rule and the file, so it shows up without opening the console */
document.addEventListener("securitypolicyviolation",(e) =>{ ERRLOG.push({t:new Date().toISOString(),m:"CSP blocked "+String(e.effectiveDirective||e.violatedDirective||"").slice(0,40)+": "+String(e.blockedURI||"").slice(0,80),f:String(e.sourceFile||"").slice(-60)+":"+(e.lineNumber||0)}); if(ERRLOG.length>20) ERRLOG.shift(); });
window.addEventListener("unhandledrejection",(e) =>{ ERRLOG.push({t:new Date().toISOString(),m:String(e.reason&&e.reason.message||e.reason||"").slice(0,300)}); if(ERRLOG.length>20) ERRLOG.shift(); });
let REP_NOTES=false;
/* v28 I2: notes and journal only when ticked */
function reportText(){ const s2=clone(S); if(s2.portrait) s2.portrait="(portrait left out)"; if(!REP_NOTES){ if(s2.notes) s2.notes="(notes left out)"; if(s2.journal) s2.journal="(journal left out)"; } let b=null; try{ b=JSON.parse(lsGet(BKEY)||"null"); }catch(e){ b=null; }
  return JSON.stringify({kind:"problem-report",app:"dnd2024-sheet-builder",appVer:APP_VER,appLabel:APP_LABEL,appDate:APP_DATE,made:new Date().toISOString(),browser:navigator.userAgent,screen:window.innerWidth+"x"+window.innerHeight,
    storage:(function(){ let n=0; try{ for(let i=0;i<__store.length;i++){ const k=__store.key(i); n+=k.length+String(__store.getItem(k)||"").length; } }catch(e){} return Math.round(n/1024)+" KB"; })(),
    errors:ERRLOG, perf:PERF, sheet:C, state:s2, build:b, trail:repTrail()},null,1); }
/* T11 N18: the last actions (from the undo list) with the state before the first one and after each one, so tests/replay_report.py can play them back.
   Portrait, notes and journal are left out the same way as in the state above */
function repTrail(){ try{ if(typeof __R.undoTidy==="function") __R.undoTidy(); const L=(typeof __R.UST!=="undefined"?__R.UST:[]).slice(-10); if(!L.length) return null;
  const cut=function(js){ if(!js) return null; let o; try{ o=JSON.parse(js); }catch(e){ return null; } if(o&&typeof o==="object"){ if(o.portrait) o.portrait="(portrait left out)"; if(!REP_NOTES){ if(o.notes) o.notes="(notes left out)"; if(o.journal) o.journal="(journal left out)"; } } return o; };
  L.forEach((e) =>{ if(typeof __R.undoFix==="function") __R.undoFix(e); });
  return {start:{state:cut(L[0].S), sheet:cut(L[0].C), build:cut(L[0].B)}, steps:L.map((e) =>{ return {l:e.l, t:new Date(e.t).toISOString(), state:cut(e.A), sheet:e.CA!==e.C?cut(e.CA):undefined, build:e.BA!==e.B?cut(e.BA):undefined}; })};
  }catch(err){ return {error:String(err)}; } }
env.__reportText=function(){ return reportText(); };
/* T11 N18: test hook */
/* T11 A10: field timing on this device, kept in memory only. Long Animation Frames (Chromium) and Event Timing (slow taps), the 10 worst of each.
   They go into the problem report, nothing is sent anywhere */
var PERF={loaf:[],ev:[]};
(function(){ const keep=function(L,x){ L.push(x); L.sort((a,b) =>{ return b.d-a.d; }); if(L.length>10) L.length=10; };
  try{ if(window.PerformanceObserver&&(PerformanceObserver.supportedEntryTypes||[]).indexOf("long-animation-frame")>=0) new PerformanceObserver((l) =>{ l.getEntries().forEach((e) =>{ const sc=(e.scripts||[])[0]; keep(PERF.loaf,{d:Math.round(e.duration),blk:Math.round(e.blockingDuration||0),at:Math.round(e.startTime),src:sc?String(sc.sourceFunctionName||sc.invoker||"").slice(0,60):""}); }); }).observe({type:"long-animation-frame",buffered:true}); }catch(e){}
  try{ if(window.PerformanceObserver&&(PerformanceObserver.supportedEntryTypes||[]).indexOf("event")>=0) new PerformanceObserver((l) =>{ l.getEntries().forEach((e) =>{ if(e.duration>=100){ const t=e.target, id=t?(t.id||t.getAttribute&&(t.getAttribute("data-tab")||t.getAttribute("aria-label"))||t.className||t.tagName):""; keep(PERF.ev,{d:Math.round(e.duration),type:e.name,on:String(id||"").slice(0,60),at:Math.round(e.startTime)}); } }); }).observe({type:"event",buffered:true,durationThreshold:100}); }catch(e){}
})();
function reportOpen(){ const old=document.getElementById("rep"); if(old) old.remove(); const w=document.createElement("div"); w.id="rep"; w.className="bkp"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","repT");
  let txt=reportText();
  w.innerHTML='<div class="bkpb"><div class="bkph"><b id="repT">Report a Problem</b><button type="button" class="bkpx" data-rep="close" aria-label="Close">×</button></div>'+
    '<p>Write what you did and what went wrong, then paste this report after it in a message to the person who keeps the app.</p><p class="muted">The report holds the app version, your browser, the screen size, recent errors, and the open character ('+esc(C.name||"Character")+': build, sheet, and play state, without the portrait), your last 10 actions with the state after each (so the problem can be played back), and the slowest moments on this device. Nothing is sent from here.</p><label class="repn"><input type="checkbox" id="repNotes"'+(REP_NOTES?' checked':'')+'> Include my notes and journal (personal text)</label>'+
    '<div class="bkpr"><button type="button" class="btn pri press" data-rep="copy">Copy Report</button></div><textarea id="repTxt" readonly spellcheck="false">'+esc(txt)+'</textarea></div>';
  document.body.appendChild(w);
  const esc1=function(e){ if(e.key==="Escape"&&!document.querySelector(".ask")){ w.remove(); document.removeEventListener("keydown",esc1,true); } }; document.addEventListener("keydown",esc1,true);
  const rn=w.querySelector("#repNotes"); if(rn) rn.addEventListener("change",() =>{ REP_NOTES=rn.checked; txt=reportText(); const ta=w.querySelector("#repTxt"); if(ta) ta.value=txt; });/* v28 I2 */
  w.addEventListener("click",(e) =>{ if(e.target===w){ w.remove(); return; } const b=e.target.closest("[data-rep]"); if(!b) return; if(b.dataset.rep==="close"){ w.remove(); return; }
    const ta=document.getElementById("repTxt"); copyText(txt,ta).then((ok) =>{ toast(ok?"Report copied. Paste it in your message.":"Select the text and copy it."); }); }); }
/* RU75: a basic actor file for Foundry VTT (dnd5e system). Numbers come from this sheet; Foundry fills item and spell details only when they are dragged in from its own compendiums */
const FVTT_SK={"Acrobatics":"acr","Animal Handling":"ani","Arcana":"arc","Athletics":"ath","Deception":"dec","History":"his","Insight":"ins","Intimidation":"itm","Investigation":"inv","Medicine":"med","Nature":"nat","Perception":"prc","Performance":"prf","Persuasion":"per","Religion":"rel","Sleight of Hand":"slt","Stealth":"ste","Survival":"sur"};
function foundryOf(Cc,Ss){ let c0=C,s0=S,out=null; try{ __set_C(Cc); __set_S(Object.assign(clone(DEF),Ss||{})); ["cond","notes","used"].forEach((k) =>{ if(typeof S[k]!=="object"||!S[k]) S[k]={}; }); derive();
  const ab={}; ABK.forEach((k) =>{ ab[k.toLowerCase()]={value:D.score[k],proficient:C.saves&&C.saves[k]?1:0}; });
  const sk={}; (C.skills||[]).forEach((s) =>{ const k=FVTT_SK[s.n]; if(k) sk[k]={value:num(s.p,0),ability:String(s.ab||"").toLowerCase()}; });
  const cz=coinsNow(), lv=__R.clsLvls(), items=[];
  Object.keys(lv).forEach((cl) =>{ items.push({name:cl,type:"class",system:{levels:lv[cl],identifier:cl.toLowerCase()}}); });
  (C.inv||[]).forEach((x) =>{ const w=WEAPONS_T(x); items.push({name:x.n,type:w?"weapon":/Armor|Shield/.test(x.type||"")?"equipment":"loot",system:{quantity:num(x.q,1),weight:{value:num(x.w,0),units:"lb"},equipped:!!eqOn(x),attuned:!!x.att&&!!eqOn(x)}}); });
  (C.spells||[]).forEach((x) =>{ items.push({name:x.n,type:"spell",system:{level:num(x.l,0),preparation:{mode:/Always/.test(x.use||"")?"always":"prepared",prepared:true}}}); });
  featAll().forEach((x) =>{ items.push({name:x.f.n,type:"feat",system:{description:{value:'<p>'+esc(x.t).slice(0,4000)+'</p>'}}}); });
  out={name:C.name||"Character",type:"character",img:"icons/svg/mystery-man.svg",system:{abilities:ab,skills:sk,
    attributes:{hp:{value:S.hp==null?D.hpmax:num(S.hp,D.hpmax),max:D.hpmax,temp:num(S.tmp,0)},ac:{calc:"flat",flat:D.ac},movement:{walk:D.speed,units:"ft"},senses:{darkvision:num(C.darkvision,0),units:"ft"}},
    details:{alignment:S.align||"",biography:{value:'<p>'+esc((S.notes&&S.notes.backstory)||"")+'</p>'},xp:{value:num(S.xp,0)}},
    currency:{pp:num(cz.pp,0),gp:num(cz.gp,0),ep:num(cz.ep,0),sp:num(cz.sp,0),cp:num(cz.cp,0)},traits:{languages:{custom:(C.lang||[]).join("; ")}}},
    items:items,flags:{"dnd2024-sheet-builder":{appVer:APP_VER,note:"Basic export. Ability scores, saves, skills, Hit Points, Armor Class, Speed, coins, class levels, and the names of items, spells, and features."}}}; }
  catch(e){ out=null; } __set_C(c0); __set_S(s0); try{ derive(); }catch(e){} return out; }
function WEAPONS_T(x){ return /Weapon/.test(x.type||"")||(C.attacks||[]).some((a) =>{ return a.n===x.n; }); }
function foundryOut(id){ const r=rSnap(rEnsure()), o=foundryOf(rC(id,r),rS(id,r)||{}); if(!o){ toast("This character could not be exported."); return; }
  const nm=String(o.name).replace(/[^A-Za-z0-9 _-]+/g,"").trim().replace(/\s+/g,"-")||"character"; dlFile(JSON.stringify(o,null,1),"fvtt-"+nm+".json",(ok) =>{ toast(ok?"Download started: fvtt-"+nm+".json. In Foundry, right-click a character and choose Import Data.":"Download is blocked here."); }); }
/* RU35 no. 9: pinned skills (S.pin, optional) show at the top of the Main tab and in Combat view */
function pinOn(n){ return Array.isArray(S.pin)&&S.pin.indexOf(n)>=0; }
export function pinToggle(n){ const a=Array.isArray(S.pin)?S.pin.slice():[], i=a.indexOf(n); if(i>=0) a.splice(i,1); else a.push(n); if(a.length) S.pin=a; else delete S.pin; save(); __R.renderAll();
  Array.prototype.forEach.call(document.querySelectorAll(".pinfav[data-pin]"),(b) =>{ const on=pinOn(b.getAttribute("data-pin")); b.classList.toggle("on",on); b.setAttribute("aria-pressed",on?"true":"false"); const t=b.querySelector(".hbt"); if(t) t.textContent=on?"In your favorites bar":"Add to favorites bar"; }); }
function pinSpBtn(x){ const k="sp:"+x.n, on=pinOn(k); return '<button type="button" class="btn sm press pinfav'+(on?' on':'')+'" data-pin="'+esc(k)+'" aria-pressed="'+on+'"><span class="hbt">'+(on?"In your favorites bar":"Add to favorites bar")+'</span></button>'; }
export function pinnedH(){ if(!Array.isArray(S.pin)||!S.pin.length) return ""; const SP=S.pin.map((n) =>{ if(String(n).indexOf("sp:")!==0) return null; let nm=n.slice(3), i=-1; (C.spells||[]).forEach((x,ix) =>{ if(i<0&&x.n===nm) i=ix; }); return i>=0?[nm,i,(C.spells[i].l||0)]:null; }).filter(Boolean), L=S.pin.map((n) =>{ let i=-1; (C.skills||[]).forEach((s,ix) =>{ if(s.n===n) i=ix; }); return i>=0?[n,i]:null; }).filter(Boolean); if(!L.length&&!SP.length) return "";
  return '<div class="pins" aria-label="Favorites">'+L.map((p) =>{ return '<button type="button" class="pinc bd" data-bd="sk-'+p[1]+'">'+esc(p[0])+' <b>'+sg(D.skill[p[1]])+'</b></button>'; }).join("")+SP.map((p) =>{ return '<button type="button" class="pinc pinsp" data-info="sp:'+p[1]+'">'+esc(p[0])+' <b>'+(p[2]?"L"+p[2]:"C")+'</b></button>'; }).join("")+'</div>'; }
/* RU28: a sheet made by the builder of an older version (no C.bv) that the builder now makes differently. Shown once per app version, until dismissed or applied */
function oldNoteH(){ if(C.bv||S.updSeen===APP_VER||!env.__bldMine||!env.__bldMine()) return ""; let d=[]; try{ d=env.__bldDiff?env.__bldDiff(C)||[]:[]; }catch(e){ d=[]; } if(!d.length) return "";
  return '<div class="oldnote" role="note"><p><b>This sheet was made by an older version of the builder.</b> Rules in the builder were updated since. Press Build, then Apply to refresh the sheet. The Apply dialog lists what would change: '+esc(d.join(". "))+'.</p><div class="bkpr"><button type="button" class="btn press" data-oldn="bld">Open Builder</button><button type="button" class="btn press" data-oldn="ok">Dismiss</button></div></div>'; }
/* T4: press and hold a library row (item, gear or spell), drag it onto the drop zone to add it to the sheet. Same as the Add button */
(function(){ let timer=0, sx=0, sy=0, cur=null, ghost=null, zone=null, hold=0;
  function pick(r){ const s=r.getAttribute("data-lib-open")||"", i=s.indexOf("|"), c=s.slice(0,i); return (c==="spell"||c==="item"||c==="gear")?{c:c,k:s.slice(i+1),t:(r.querySelector("b")||r).textContent}:null; }
  function over(x,y){ if(!zone) return false; const r=zone.getBoundingClientRect(); return x>=r.left-8&&x<=r.right+8&&y>=r.top-8&&y<=r.bottom+8; }
  function end(){ clearTimeout(timer); timer=0; if(ghost){ ghost.remove(); ghost=null; } if(zone){ zone.remove(); zone=null; } if(cur){ cur=null; hold=Date.now(); } }
  function begin(r,t,x,y){ cur=t; const w=document.getElementById("lib"); if(!w) { cur=null; return; }
    ghost=document.createElement("div"); ghost.className="lib-ghost"; ghost.textContent=t.t; ghost.style.left=x+"px"; ghost.style.top=y+"px"; w.appendChild(ghost);
    zone=document.createElement("div"); zone.className="lib-dz"; zone.setAttribute("role","status"); zone.textContent=(t.c==="spell"?"Drop here to add to your spells":"Drop here to add to your inventory"); w.appendChild(zone);
    try{ if(navigator.vibrate) navigator.vibrate(10); }catch(er){} }
  document.addEventListener("pointerdown",(e) =>{ const r=e.target.closest&&e.target.closest("#lib .lib-r[data-lib-open]"); if(!r||(e.pointerType==="mouse"&&e.button!==0)) return; const t=pick(r); if(!t) return; sx=e.clientX; sy=e.clientY; clearTimeout(timer); timer=setTimeout(() =>{ timer=0; begin(r,t,sx,sy); },e.pointerType==="mouse"?200:380); },true);
  document.addEventListener("pointermove",(e) =>{ if(timer&&(Math.abs(e.clientX-sx)>10||Math.abs(e.clientY-sy)>10)){ clearTimeout(timer); timer=0; }
    if(!cur) return; if(ghost){ ghost.style.left=e.clientX+"px"; ghost.style.top=e.clientY+"px"; } if(zone) zone.classList.toggle("on",over(e.clientX,e.clientY)); },true);
  document.addEventListener("touchmove",(e) =>{ if(cur&&e.cancelable) e.preventDefault(); },{passive:false,capture:true});
  document.addEventListener("pointerup",(e) =>{ clearTimeout(timer); timer=0; if(!cur) return; const t=cur, hit=over(e.clientX,e.clientY); end(); if(hit) libAddDo(t.c,t.k); else toast("Dropped outside. Nothing added."); },true);
  document.addEventListener("pointercancel",() =>{ end(); },true);
  document.addEventListener("keydown",(e) =>{ if(cur&&e.key==="Escape"){ e.stopPropagation(); end(); } },true);
  document.addEventListener("click",(e) =>{ if(hold&&Date.now()-hold<400){ const r=e.target.closest&&e.target.closest("#lib .lib-r"); if(r){ e.preventDefault(); e.stopPropagation(); } hold=0; } },true);
  document.addEventListener("contextmenu",(e) =>{ if(cur||timer) e.preventDefault(); },true);
})();
