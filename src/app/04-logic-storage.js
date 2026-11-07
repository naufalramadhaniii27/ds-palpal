import { fmtAgo } from "./lib/fmt.js";
import {DEFAULT} from "./02-data-default-character.js";
import {__R} from "./00-reg.js";import {env} from "./00-env.js";
Object.defineProperty(__R,"C",{get:function(){return C;},set:function(v){C=v;},configurable:true});
/* ================= STORAGE ================= */
export function clsLv(){ return C.clsLabel||(C.cls+" "+__R.D.level); }
export function clone(o){ return structuredClone(o); }
export var CKEY = "yudhi-kelapa-build-v3", KEY = "yudhi-kelapa-sheet-v1";
/* v18 RU78: data that cannot be read is listed in BAD. The app then shows the recovery screen and writes nothing, instead of replacing it with the default sheet */
export var BAD=[];
export function loadC(sync){ try{ const r=__store.getItem(CKEY); if(r){ const p=JSON.parse(r); if(p && p.v===3 && p.abilities) return p; throw new Error("the saved sheet has a shape this version does not know"); } }
  catch(e){ if(sync) return null; BAD.push("Sheet: "+((e&&e.message)||e)); } return clone(DEFAULT); }
export var C = loadC();
export var cSaveT=null;
export function saveC(){ clearTimeout(cSaveT); cSaveT=setTimeout(() =>{ cSaveT=null; lsSave(CKEY, C); },200); }

export var DEF = {hp:null, tmp:0, used:{}, insp:false, ds:[0,0], cond:{}, exh:0, burn:1, jinx:"", notes:{}, lang:["Common","",""], portrait:"", theme:"", align:"", color:"forest", sym:"star", skin:"ddb", coins:null, coinBase:null, lifestyle:""};/* V17-1: RU37 fields */
export function loadS(sync){
  const {o}=loadSStep1();
  try{ const raw = __store.getItem(KEY); if(raw){ const p = JSON.parse(raw); if(!p||typeof p!=="object"||Array.isArray(p)) throw new Error("the saved play state has a shape this version does not know");
    const old=!p.used && (p.sw!=null||p.as!=null);
    /* RL47: every field is kept, also fields written by a newer version of the app (only the four counters of the first format are converted) */
    for(const k in p){ if(Object.prototype.hasOwnProperty.call(p,k)&&!(old&&/^(sw|as|hd|kit)$/.test(k))) o[k]=p[k]; }
    if(old){ o.used={sw:p.sw||0, as:p.as||0, hd:p.hd||0, kit:p.kit||0}; } } }catch(e){ if(sync) return null; BAD.push("Play state: "+((e&&e.message)||e)); }
  loadSStep2(o);
  return o;
}
function loadSStep1(){
  const o = clone(DEF);
  return /** @type {any} */ ({o});
}
function loadSStep2(o){
  if(!Array.isArray(o.ds)||o.ds.length!==2) o.ds=[0,0];
  if(!Array.isArray(o.lang)) o.lang=["Common","",""];
  ["cond","notes","used"].forEach((k) =>{ if(typeof o[k]!=="object"||!o[k]) o[k]={}; });
}
export var S = loadS();
export var saveT=null;
export var S_BASE=JSON.stringify(S), S_RAW=lsGet(KEY);
/* V18-2, V18-5: lay the fields changed here since S_BASE (the last stored copy this tab knows) over the data of another tab */
export function mergeS(s2){ let base={}; try{ base=JSON.parse(S_BASE)||{}; }catch(er){} const J1=function(x){ return JSON.stringify(x===undefined?null:x); };
  Object.keys(S).concat(Object.keys(base)).forEach((k) =>{ if(k==="_app"||J1(S[k])===J1(base[k])) return; const a=S[k], b0=base[k]||{};
    if(a&&typeof a==="object"&&!Array.isArray(a)&&s2[k]&&typeof s2[k]==="object"&&!Array.isArray(s2[k])){ Object.keys(a).forEach((j) =>{ if(J1(a[j])!==J1(b0[j])) s2[k][j]=a[j]; }); Object.keys(b0).forEach((j) =>{ if(!(j in a)) delete s2[k][j]; }); }
    else if(k in S) s2[k]=a; else delete s2[k]; }); return s2; }
/* V18-8: with the Web Locks API, the read, merge, write below runs in one tab at a time, so two tabs saving in the same millisecond keep both changes */
export var SPEND=false;/* v19 V19-1: a save is waiting (timer or Web Lock) until saveNow() writes */
export function save(){ SPEND=true; clearTimeout(saveT); saveT=setTimeout(() =>{ saveT=null; if(navigator.locks&&navigator.locks.request){ try{ navigator.locks.request("cs-sheet-state",() =>{ saveNow(); }); return; }catch(er){} } saveNow(); },150); }
export function saveNow(){ const cur=lsGet(KEY);
  if(cur!=null&&cur!==S_RAW&&!FROZEN){ const s2=loadS(true); if(s2){ S=mergeS(s2); setTimeout(() =>{ try{ __R.renderAll(true); }catch(er){} },0); } }
  if(lsSave(KEY, S)) S_RAW=S_BASE=JSON.stringify(S); SPEND=false; snAutoSoon();/* v32 p33 */ }
let SN_AUTO_T=0, SN_HOUR=36e5, SN_T0=Date.now();
function snAutoSoon(){ const n=Date.now(); if(FROZEN||n-SN_AUTO_T<6e4) return; SN_AUTO_T=n; setTimeout(snAuto,0); }
function snAuto(){ try{ const r=__R.rGet(), id=r&&r.active; if(!id||(__R.MYID&&id!==__R.MYID)) return; const L=__R.snGet().chars[id]||[]; if(Date.now()-(L.length?Math.max(L[0].t,0):SN_T0)<SN_HOUR) return; __R.snTake(id,"Automatic copy",r);/* the first copy after an hour of play, then one an hour */ }catch(e){} }
export { fmtAgo };
export function snSetH(){ const id=__R.MYID||(__R.rGet()||{}).active, L=(__R.snGet().chars[id]||[]);
  return '<h3 class="set-h" data-ico="1">Backup History</h3><p class="info-d">Up to 5 copies of this character stay on this device: one after each hour of play, one a day, and one before Apply from the builder, Restore, and Open Character. Restore goes back to that point. The character as it is now is kept as a copy first, so you can return.</p>'+
   (__R.SN_BAD?'<p class="caution">The backup history on this device is damaged, so new copies are not saved. Back Up your characters to keep a safe copy.</p>':'')+
   (L.length?'<div class="snh">'+L.map((x,i) =>{ return '<div class="snhr"><span class="snh-i">'+__R.ico("ui-undo")+'</span><span class="snh-t"><b>'+__R.esc(__R.fmtT(x.t))+'</b><small>'+__R.esc(fmtAgo(x.t))+' \u2022 '+__R.esc(x.why)+'</small></span><button type="button" class="btn press snh-b" data-snrs="'+i+'">'+__R.ico("home-restore")+'Restore</button></div>'; }).join("")+'</div>':'<p class="muted">No copies yet. The first one is made after an hour of play, or now with the button below.</p>')+
   '<div class="thg thgw"><button type="button" class="thb thbi" data-snnow="1">'+__R.ico("ui-save")+'Take Snapshot Now</button></div>'; }

/* ================= v18 STORAGE CORE =================
   RL47: every saved key carries _app, the highest app version that wrote it. Fields this version does not know are kept as they are.
   RU61: lsSet() reports a write that fails (storage full) with a caution bar, instead of losing it silently.
   RU74/RU78: FROZEN pauses all writes: "recover" while the recovery screen is open, "stale" when another tab switched the character. */
/* APP_VER is the internal number stamped on saved data (always goes up). APP_LABEL is the version people see. 0.0.1 starts the public numbering (T7) */
export var APP_VER=116, APP_LABEL="0.0.14", APP_DATE="2026-11-06", FROZEN="", SAVE_FAIL=0, SNKEY="cs-snap-v1";
export function lsGet(k){ try{ return __store.getItem(k); }catch(e){ return null; } }
export function lsSet(k,v){ if(FROZEN) return false; try{ __store.setItem(k,v); if(SAVE_FAIL){ SAVE_FAIL=0; saveWarn(); } unsavedSoon(k); __R.bcPost(k); return true; }catch(e){ SAVE_FAIL=1; saveWarn(); return false; } }
export function lsSave(k,o){ if(o&&typeof o==="object"&&!Array.isArray(o)) o._app=Math.max(+o._app||0,APP_VER); return lsSet(k,JSON.stringify(o)); }
export function newerApp(o){ return !!o&&typeof o==="object"&&(+o._app||0)>APP_VER; }
/* v18 RU67: "Unsaved changes" = the open character differs from what Save Character last wrote. Marks live in cs-ui-files (this device only) */
let unsT=null;
function unsavedSoon(k){ if(k!==CKEY&&k!==KEY&&k!==__R.BKEY) return; clearTimeout(unsT); unsT=setTimeout(__R.updUnsaved,400); }
env.__lsSet=lsSet; env.__lsSave=lsSave; env.__appVer=APP_VER; env.__appLabel=APP_LABEL;
/* T7: with IndexedDB a write that fails is known only after the transaction ends. The store reports it here, the same caution bar shows */
env.addEventListener("cs-store-fail",() =>{ SAVE_FAIL=1; saveWarn(); });
env.addEventListener("cs-store-ok",() =>{ if(SAVE_FAIL){ SAVE_FAIL=0; saveWarn(); } });
/* RU61: caution bar while writes fail. Hidden again by the next write that works */
function saveWarn(){ let w=document.getElementById("saveWarn"); if(!SAVE_FAIL){ if(w) w.remove(); return; } if(w) return;
  w=document.createElement("div"); w.id="saveWarn"; w.className="savew"; w.setAttribute("role","alert");
  w.innerHTML='<p><b>Changes are not being saved.</b> This browser has no storage space left for the app. Back up your characters now, then make room by removing portraits or characters you no longer need.</p><div class="savewr"><button type="button" class="btn press" data-sw="bk">Back Up</button><button type="button" class="btn press" data-sw="home">My Characters</button><button type="button" class="btn press" data-sw="x" aria-label="Hide this message">Hide</button></div>';
  w.addEventListener("click",(e) =>{ const b=e.target.closest("[data-sw]"); if(!b) return; const a=b.getAttribute("data-sw"); if(a==="x"){ w.remove(); return; } if(a==="bk"){ __R.bkpOpen("out"); return; } if(a==="home"){ __R.showHome(); } });
  document.body.appendChild(w); __R.toast("Could not save: storage is full"); }
/* RU78: recovery screen. Shown when saved data cannot be read or the sheet cannot be drawn. Nothing is written while it is open */
function rawAll(){ const d={}; try{ for(let i=0;i<__store.length;i++){ const k=__store.key(i); if(__R.bkpKeyOk(k)) d[k]=__store.getItem(k); } }catch(e){} return d; }
function rawBackup(){ let d=rawAll(), n=0; try{ n=Object.keys(JSON.parse(d["cs-roster-v1"]).chars).length; }catch(e){ n=d["yudhi-kelapa-build-v3"]?1:0; }
  return {app:"dnd2024-sheet-builder",kind:"backup",version:1,appVer:APP_VER,created:new Date().toISOString(),characters:n,keys:d}; }
export function recover(why,err){ const msg=String((err&&err.message)||err||why); let w=document.getElementById("recov");
  if(w){ const p=w.querySelector(".recm"); if(p&&p.textContent.indexOf(msg)<0) p.textContent+=" | "+msg; return; }
  FROZEN="recover"; clearTimeout(saveT); clearTimeout(cSaveT);
  w=document.createElement("div"); w.id="recov"; w.className="bkp recov"; w.setAttribute("role","alertdialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","recovT");
  w.innerHTML='<div class="bkpb"><div class="bkph"><b id="recovT">This character could not be shown</b></div><p>Part of the saved data does not fit what this version of the app expects. <b>Nothing has been deleted</b>, and the app saves nothing while this message is open. Download a backup first, then choose what to do.</p><p class="muted recm">'+__R.esc(why)+': '+__R.esc(msg)+'</p>'+(typeof __R.healHTML==="function"?__R.healHTML():"")+
   '<div class="bkpr"><button type="button" class="btn pri press" data-rec="dl">Download Backup</button><button type="button" class="btn press" data-rec="txt">Show as Text</button></div>'+
   '<div class="bkpr"><button type="button" class="btn press" data-rec="view">Reset View</button><button type="button" class="btn press" data-rec="go">Continue Anyway</button></div>'+
   '<p class="muted">Reset View clears only screen settings (open tab, dialogs) and loads the app again. Continue Anyway opens the app as it is. Parts that could not be read may then be replaced when you make changes.</p><textarea id="recTxt" readonly spellcheck="false" hidden></textarea></div>';
  document.body.appendChild(w);
  w.addEventListener("click",(e) =>{ const b=e.target.closest("[data-rec]"); if(!b) return; const a=b.getAttribute("data-rec"), txt=JSON.stringify(rawBackup());
    if(a==="dl"){ try{ const bl=new Blob([txt],{type:"application/json"}), u=URL.createObjectURL(bl), l=document.createElement("a"); l.href=u; l.download=__R.bkpName().replace(/\.bs$/,"-recovery.json"); document.body.appendChild(l); l.click(); l.remove(); setTimeout(() =>{ URL.revokeObjectURL(u); },4000); __R.toast("Download started. No file? Use Show as Text."); }catch(er){ __R.toast("Download is blocked here. Use Show as Text."); } return; }
    if(a==="heal"){ __R.healUse(); return; }
    if(a==="txt"){ const ta=document.getElementById("recTxt"); ta.value=txt; ta.hidden=false; ta.focus(); ta.select(); return; }
    if(a==="view"){ try{ sessionStorage.clear(); ["cs-new","cs-edit"].forEach((k) =>{ __store.removeItem(k); }); }catch(er){} sessionStorage.setItem("cs-skip","0"); __miReload(); return; }
    if(a==="go"){ __R.ask("Open the app with the data as it is? Parts that could not be read may be replaced when you make changes. Download a backup first if you have not.","Continue",() =>{ FROZEN=""; w.remove(); BAD=[]; try{ __R.applyLook(); __R.renderAll(true); __R.renderNotes(); __R.syncPortrait(); }catch(er){ recover("render",er); } }); } }); }
env.__recover=recover;


export function __set_C(v){ return C=v; }
export function __set_cSaveT(v){ return cSaveT=v; }
export function __set_S(v){ return S=v; }
export function __set_saveT(v){ return saveT=v; }
export function __set_S_BASE(v){ return S_BASE=v; }
export function __set_S_RAW(v){ return S_RAW=v; }
export function __set_FROZEN(v){ return FROZEN=v; }
