/* ================= STORAGE ================= */
function clsLv(){ return C.clsLabel||(C.cls+" "+D.level); }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
var CKEY = "yudhi-kelapa-build-v3", KEY = "yudhi-kelapa-sheet-v1";
/* v18 RU78: data that cannot be read is listed in BAD. The app then shows the recovery screen and writes nothing, instead of replacing it with the default sheet */
var BAD=[];
function loadC(sync){ try{ var r=__store.getItem(CKEY); if(r){ var p=JSON.parse(r); if(p && p.v===3 && p.abilities) return p; throw new Error("the saved sheet has a shape this version does not know"); } }
  catch(e){ if(sync) return null; BAD.push("Sheet: "+((e&&e.message)||e)); } return clone(DEFAULT); }
var C = loadC();
var cSaveT=null;
function saveC(){ clearTimeout(cSaveT); cSaveT=setTimeout(function(){ cSaveT=null; lsSave(CKEY, C); },200); }

var DEF = {hp:null, tmp:0, used:{}, insp:false, ds:[0,0], cond:{}, exh:0, burn:1, jinx:"", notes:{}, lang:["Common","",""], portrait:"", theme:"", align:"", color:"forest", sym:"star", skin:"ddb", coins:null, coinBase:null, lifestyle:""};/* V17-1: RU37 fields */
function loadS(sync){
  var o = clone(DEF);
  try{ var raw = __store.getItem(KEY); if(raw){ var p = JSON.parse(raw); if(!p||typeof p!=="object"||Array.isArray(p)) throw new Error("the saved play state has a shape this version does not know");
    var old=!p.used && (p.sw!=null||p.as!=null);
    /* RL47: every field is kept, also fields written by a newer version of the app (only the four counters of the first format are converted) */
    for(var k in p){ if(Object.prototype.hasOwnProperty.call(p,k)&&!(old&&/^(sw|as|hd|kit)$/.test(k))) o[k]=p[k]; }
    if(old){ o.used={sw:p.sw||0, as:p.as||0, hd:p.hd||0, kit:p.kit||0}; } } }catch(e){ if(sync) return null; BAD.push("Play state: "+((e&&e.message)||e)); }
  if(!Array.isArray(o.ds)||o.ds.length!==2) o.ds=[0,0];
  if(!Array.isArray(o.lang)) o.lang=["Common","",""];
  ["cond","notes","used"].forEach(function(k){ if(typeof o[k]!=="object"||!o[k]) o[k]={}; });
  return o;
}
var S = loadS();
var saveT=null;
var S_BASE=JSON.stringify(S), S_RAW=lsGet(KEY);
/* V18-2, V18-5: lay the fields changed here since S_BASE (the last stored copy this tab knows) over the data of another tab */
function mergeS(s2){ var base={}; try{ base=JSON.parse(S_BASE)||{}; }catch(er){} var J1=function(x){ return JSON.stringify(x===undefined?null:x); };
  Object.keys(S).concat(Object.keys(base)).forEach(function(k){ if(k==="_app"||J1(S[k])===J1(base[k])) return; var a=S[k], b0=base[k]||{};
    if(a&&typeof a==="object"&&!Array.isArray(a)&&s2[k]&&typeof s2[k]==="object"&&!Array.isArray(s2[k])){ Object.keys(a).forEach(function(j){ if(J1(a[j])!==J1(b0[j])) s2[k][j]=a[j]; }); Object.keys(b0).forEach(function(j){ if(!(j in a)) delete s2[k][j]; }); }
    else if(k in S) s2[k]=a; else delete s2[k]; }); return s2; }
/* V18-8: with the Web Locks API, the read, merge, write below runs in one tab at a time, so two tabs saving in the same millisecond keep both changes */
var SPEND=false;/* v19 V19-1: a save is waiting (timer or Web Lock) until saveNow() writes */
function save(){ SPEND=true; clearTimeout(saveT); saveT=setTimeout(function(){ saveT=null; if(navigator.locks&&navigator.locks.request){ try{ navigator.locks.request("cs-sheet-state",function(){ saveNow(); }); return; }catch(er){} } saveNow(); },150); }
function saveNow(){ var cur=lsGet(KEY);
  if(cur!=null&&cur!==S_RAW&&!FROZEN){ var s2=loadS(true); if(s2){ S=mergeS(s2); setTimeout(function(){ try{ renderAll(true); }catch(er){} },0); } }
  if(lsSave(KEY, S)) S_RAW=S_BASE=JSON.stringify(S); SPEND=false; snAutoSoon();/* v32 p33 */ }
var SN_AUTO_T=0, SN_HOUR=36e5, SN_T0=Date.now();
function snAutoSoon(){ var n=Date.now(); if(FROZEN||n-SN_AUTO_T<6e4) return; SN_AUTO_T=n; setTimeout(snAuto,0); }
function snAuto(){ try{ var r=rGet(), id=r&&r.active; if(!id||(MYID&&id!==MYID)) return; var L=snGet().chars[id]||[]; if(Date.now()-(L.length?Math.max(L[0].t,0):SN_T0)<SN_HOUR) return; snTake(id,"Automatic copy",r);/* the first copy after an hour of play, then one an hour */ }catch(e){} }
function fmtAgo(t){ var s=Math.max(0,Math.round((Date.now()-t)/1000)), m=Math.round(s/60), h=Math.round(s/3600), d=Math.round(s/86400); return s<60?"just now":m<60?m+" min ago":h<24?h+" hour"+(h>1?"s":"")+" ago":d+" day"+(d>1?"s":"")+" ago"; }
function snSetH(){ var id=MYID||(rGet()||{}).active, L=(snGet().chars[id]||[]);
  return '<h3 class="set-h" data-ico="1">Backup History</h3><p class="info-d">Up to 5 copies of this character stay on this device: one after each hour of play, one a day, and one before Apply from the builder, Restore, and Open Character. Restore goes back to that point. The character as it is now is kept as a copy first, so you can return.</p>'+
   (SN_BAD?'<p class="caution">The backup history on this device is damaged, so new copies are not saved. Back Up your characters to keep a safe copy.</p>':'')+
   (L.length?'<div class="snh">'+L.map(function(x,i){ return '<div class="snhr"><span class="snh-i">'+ico("ui-undo")+'</span><span class="snh-t"><b>'+esc(fmtT(x.t))+'</b><small>'+esc(fmtAgo(x.t))+' \u2022 '+esc(x.why)+'</small></span><button type="button" class="btn press snh-b" data-snrs="'+i+'">'+ico("home-restore")+'Restore</button></div>'; }).join("")+'</div>':'<p class="muted">No copies yet. The first one is made after an hour of play, or now with the button below.</p>')+
   '<div class="thg thgw"><button type="button" class="thb thbi" data-snnow="1">'+ico("ui-save")+'Take Snapshot Now</button></div>'; }

/* ================= v18 STORAGE CORE =================
   RL47: every saved key carries _app, the highest app version that wrote it. Fields this version does not know are kept as they are.
   RU61: lsSet() reports a write that fails (storage full) with a caution bar, instead of losing it silently.
   RU74/RU78: FROZEN pauses all writes: "recover" while the recovery screen is open, "stale" when another tab switched the character. */
/* APP_VER is the internal number stamped on saved data (always goes up). APP_LABEL is the version people see. 0.0.1 starts the public numbering (T7) */
var APP_VER=105, APP_LABEL="0.0.3", APP_DATE="2026-10-29", FROZEN="", SAVE_FAIL=0, SNKEY="cs-snap-v1";
function lsGet(k){ try{ return __store.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ if(FROZEN) return false; try{ __store.setItem(k,v); if(SAVE_FAIL){ SAVE_FAIL=0; saveWarn(); } unsavedSoon(k); bcPost(k); return true; }catch(e){ SAVE_FAIL=1; saveWarn(); return false; } }
function lsSave(k,o){ if(o&&typeof o==="object"&&!Array.isArray(o)) o._app=Math.max(+o._app||0,APP_VER); return lsSet(k,JSON.stringify(o)); }
function newerApp(o){ return !!o&&typeof o==="object"&&(+o._app||0)>APP_VER; }
/* v18 RU67: "Unsaved changes" = the open character differs from what Save Character last wrote. Marks live in cs-ui-files (this device only) */
var unsT=null;
function unsavedSoon(k){ if(k!==CKEY&&k!==KEY&&k!==BKEY) return; clearTimeout(unsT); unsT=setTimeout(updUnsaved,400); }
window.__lsSet=lsSet; window.__lsSave=lsSave; window.__appVer=APP_VER; window.__appLabel=APP_LABEL;
/* T7: with IndexedDB a write that fails is known only after the transaction ends. The store reports it here, the same caution bar shows */
window.addEventListener("cs-store-fail",function(){ SAVE_FAIL=1; saveWarn(); });
window.addEventListener("cs-store-ok",function(){ if(SAVE_FAIL){ SAVE_FAIL=0; saveWarn(); } });
/* RU61: caution bar while writes fail. Hidden again by the next write that works */
function saveWarn(){ var w=document.getElementById("saveWarn"); if(!SAVE_FAIL){ if(w) w.remove(); return; } if(w) return;
  w=document.createElement("div"); w.id="saveWarn"; w.className="savew"; w.setAttribute("role","alert");
  w.innerHTML='<p><b>Changes are not being saved.</b> This browser has no storage space left for the app. Back up your characters now, then make room by removing portraits or characters you no longer need.</p><div class="savewr"><button type="button" class="btn press" data-sw="bk">Back Up</button><button type="button" class="btn press" data-sw="home">My Characters</button><button type="button" class="btn press" data-sw="x" aria-label="Hide this message">Hide</button></div>';
  w.addEventListener("click",function(e){ var b=e.target.closest("[data-sw]"); if(!b) return; var a=b.getAttribute("data-sw"); if(a==="x"){ w.remove(); return; } if(a==="bk"){ bkpOpen("out"); return; } if(a==="home"){ showHome(); } });
  document.body.appendChild(w); toast("Could not save: storage is full"); }
/* RU78: recovery screen. Shown when saved data cannot be read or the sheet cannot be drawn. Nothing is written while it is open */
function rawAll(){ var d={}; try{ for(var i=0;i<__store.length;i++){ var k=__store.key(i); if(bkpKeyOk(k)) d[k]=__store.getItem(k); } }catch(e){} return d; }
function rawBackup(){ var d=rawAll(), n=0; try{ n=Object.keys(JSON.parse(d["cs-roster-v1"]).chars).length; }catch(e){ n=d["yudhi-kelapa-build-v3"]?1:0; }
  return {app:"dnd2024-sheet-builder",kind:"backup",version:1,appVer:APP_VER,created:new Date().toISOString(),characters:n,keys:d}; }
function recover(why,err){ var msg=String((err&&err.message)||err||why); var w=document.getElementById("recov");
  if(w){ var p=w.querySelector(".recm"); if(p&&p.textContent.indexOf(msg)<0) p.textContent+=" | "+msg; return; }
  FROZEN="recover"; clearTimeout(saveT); clearTimeout(cSaveT);
  w=document.createElement("div"); w.id="recov"; w.className="bkp recov"; w.setAttribute("role","alertdialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","recovT");
  w.innerHTML='<div class="bkpb"><div class="bkph"><b id="recovT">This character could not be shown</b></div><p>Part of the saved data does not fit what this version of the app expects. <b>Nothing has been deleted</b>, and the app saves nothing while this message is open. Download a backup first, then choose what to do.</p><p class="muted recm">'+esc(why)+': '+esc(msg)+'</p>'+
   '<div class="bkpr"><button type="button" class="btn pri press" data-rec="dl">Download Backup</button><button type="button" class="btn press" data-rec="txt">Show as Text</button></div>'+
   '<div class="bkpr"><button type="button" class="btn press" data-rec="view">Reset View</button><button type="button" class="btn press" data-rec="go">Continue Anyway</button></div>'+
   '<p class="muted">Reset View clears only screen settings (open tab, dialogs) and loads the app again. Continue Anyway opens the app as it is. Parts that could not be read may then be replaced when you make changes.</p><textarea id="recTxt" readonly spellcheck="false" hidden></textarea></div>';
  document.body.appendChild(w);
  w.addEventListener("click",function(e){ var b=e.target.closest("[data-rec]"); if(!b) return; var a=b.getAttribute("data-rec"), txt=JSON.stringify(rawBackup());
    if(a==="dl"){ try{ var bl=new Blob([txt],{type:"application/json"}), u=URL.createObjectURL(bl), l=document.createElement("a"); l.href=u; l.download=bkpName().replace(/\.bs$/,"-recovery.json"); document.body.appendChild(l); l.click(); l.remove(); setTimeout(function(){ URL.revokeObjectURL(u); },4000); toast("Download started. No file? Use Show as Text."); }catch(er){ toast("Download is blocked here. Use Show as Text."); } return; }
    if(a==="txt"){ var ta=document.getElementById("recTxt"); ta.value=txt; ta.hidden=false; ta.focus(); ta.select(); return; }
    if(a==="view"){ try{ sessionStorage.clear(); ["cs-new","cs-edit"].forEach(function(k){ __store.removeItem(k); }); }catch(er){} sessionStorage.setItem("cs-skip","0"); __miReload(); return; }
    if(a==="go"){ ask("Open the app with the data as it is? Parts that could not be read may be replaced when you make changes. Download a backup first if you have not.","Continue",function(){ FROZEN=""; w.remove(); BAD=[]; try{ applyLook(); renderAll(true); renderNotes(); syncPortrait(); }catch(er){ recover("render",er); } }); } }); }
window.__recover=recover;

