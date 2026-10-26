/* ================= STORAGE ================= */
function clsLv(){ return C.clsLabel||(C.cls+" "+D.level); }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
var CKEY = "yudhi-kelapa-build-v3", KEY = "yudhi-kelapa-sheet-v1";
/* v18 RU78: data that cannot be read is listed in BAD. The app then shows the recovery screen and writes nothing, instead of replacing it with the default sheet */
var BAD=[];
function loadC(sync){ try{ var r=localStorage.getItem(CKEY); if(r){ var p=JSON.parse(r); if(p && p.v===3 && p.abilities) return p; throw new Error("the saved sheet has a shape this version does not know"); } }
  catch(e){ if(sync) return null; BAD.push("Sheet: "+((e&&e.message)||e)); } return clone(DEFAULT); }
var C = loadC();
var cSaveT=null;
function saveC(){ clearTimeout(cSaveT); cSaveT=setTimeout(function(){ cSaveT=null; lsSave(CKEY, C); },200); }

var DEF = {hp:null, tmp:0, used:{}, insp:false, ds:[0,0], cond:{}, exh:0, burn:1, jinx:"", notes:{}, lang:["Common","",""], portrait:"", theme:"", align:"", color:"forest", sym:"star", skin:"ddb", coins:null, coinBase:null, lifestyle:""};/* V17-1: RU37 fields */
function loadS(sync){
  var o = clone(DEF);
  try{ var raw = localStorage.getItem(KEY); if(raw){ var p = JSON.parse(raw); if(!p||typeof p!=="object"||Array.isArray(p)) throw new Error("the saved play state has a shape this version does not know");
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
var APP_VER=102, APP_DATE="2026-10-26", FROZEN="", SAVE_FAIL=0, SNKEY="cs-snap-v1";
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ if(FROZEN) return false; try{ localStorage.setItem(k,v); if(SAVE_FAIL){ SAVE_FAIL=0; saveWarn(); } unsavedSoon(k); bcPost(k); return true; }catch(e){ SAVE_FAIL=1; saveWarn(); return false; } }
function lsSave(k,o){ if(o&&typeof o==="object"&&!Array.isArray(o)) o._app=Math.max(+o._app||0,APP_VER); return lsSet(k,JSON.stringify(o)); }
function newerApp(o){ return !!o&&typeof o==="object"&&(+o._app||0)>APP_VER; }
/* v18 RU67: "Unsaved changes" = the open character differs from what Save Character last wrote. Marks live in cs-ui-files (this device only) */
var unsT=null;
function unsavedSoon(k){ if(k!==CKEY&&k!==KEY&&k!==BKEY) return; clearTimeout(unsT); unsT=setTimeout(updUnsaved,400); }
window.__lsSet=lsSet; window.__lsSave=lsSave; window.__appVer=APP_VER;
/* RU61: caution bar while writes fail. Hidden again by the next write that works */
function saveWarn(){ var w=document.getElementById("saveWarn"); if(!SAVE_FAIL){ if(w) w.remove(); return; } if(w) return;
  w=document.createElement("div"); w.id="saveWarn"; w.className="savew"; w.setAttribute("role","alert");
  w.innerHTML='<p><b>Changes are not being saved.</b> This browser has no storage space left for the app. Back up your characters now, then make room by removing portraits or characters you no longer need.</p><div class="savewr"><button type="button" class="btn press" data-sw="bk">Back Up</button><button type="button" class="btn press" data-sw="home">My Characters</button><button type="button" class="btn press" data-sw="x" aria-label="Hide this message">Hide</button></div>';
  w.addEventListener("click",function(e){ var b=e.target.closest("[data-sw]"); if(!b) return; var a=b.getAttribute("data-sw"); if(a==="x"){ w.remove(); return; } if(a==="bk"){ bkpOpen("out"); return; } if(a==="home"){ showHome(); } });
  document.body.appendChild(w); toast("Could not save: storage is full"); }
/* RU78: recovery screen. Shown when saved data cannot be read or the sheet cannot be drawn. Nothing is written while it is open */
function rawAll(){ var d={}; try{ for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(bkpKeyOk(k)) d[k]=localStorage.getItem(k); } }catch(e){} return d; }
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
    if(a==="view"){ try{ sessionStorage.clear(); ["cs-new","cs-edit"].forEach(function(k){ localStorage.removeItem(k); }); }catch(er){} sessionStorage.setItem("cs-skip","0"); __miReload(); return; }
    if(a==="go"){ ask("Open the app with the data as it is? Parts that could not be read may be replaced when you make changes. Download a backup first if you have not.","Continue",function(){ FROZEN=""; w.remove(); BAD=[]; try{ applyLook(); renderAll(true); renderNotes(); syncPortrait(); }catch(er){ recover("render",er); } }); } }); }
window.__recover=recover;

/* ================= HELPERS ================= */
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(t){return String(t==null?"":t).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function rich(t){ return esc(t).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,function(m,k,l){ var key=k.replace(/&#39;/g,"'").replace(/&amp;/g,"&"); if(GLOSS[key]||(LIBR&&LIB_RULES[key])) return '<button type="button" class="lk" data-info="g:'+esc(key)+'">'+(l||k)+'</button>'; var fsp=featSpec(key); return fsp?'<button type="button" class="lk" data-info="'+fsp+'">'+(l||k)+'</button>':(l||k); }); }
function sg(n){return (n>=0?"+":"\u2212")+Math.abs(n)}
function num(v,d){ var n=parseFloat(v); return isNaN(n)?(d||0):n; }
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function fmtW(n){return (Math.round(n*10)/10).toString()}
function mod(s){return Math.floor((s-10)/2)}
var toastT=null;
function toast(msg){ var t=$("#toast"); t.classList.remove("act"); var tk=typeof toastKind==="function"?toastKind(msg):"ok"; t.innerHTML=(typeof ico==="function"?ico("toast-"+tk,"tico"):"")+'<span>'+esc(msg)+'</span>'; t.setAttribute("data-kind",tk);/* v24 RU73 q */ t.classList.add("on"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("on")},2400); }
/* ask(): dialog konfirmasi DOM versi sheet. Pengganti confirm(), yang diblokir di artifact. Tanda tangan sama dengan ask() di builder: ask(pesan, labelOk, cb). Cancel, klik di luar kotak, atau Escape menutup tanpa memanggil cb. */
function ask(msg,ok,cb,alt){ var w=document.createElement("div"); w.className="ask"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true");/* v18: alt = [label, callback] adds a third choice */
  w.innerHTML='<div class="askb"><p'+(/\n/.test(msg)?' class="askl"':'')+'>'+esc(msg)+'</p><div class="askr'+(alt?' ask3':'')+'"><button type="button" class="btn press" data-no="1">Cancel</button>'+(alt?'<button type="button" class="btn press" data-alt="1">'+esc(alt[0])+'</button>':'')+'<button type="button" class="btn pri press" data-yes="1">'+esc(ok)+'</button></div></div>';
  var prev=document.activeElement;
  function close(){ w.remove(); document.removeEventListener("keydown",onKey,true); if(prev&&prev.focus) try{prev.focus({preventScroll:true})}catch(e){} }
  function onKey(e){ if(e.key==="Escape"){ e.stopPropagation(); close(); } }
  w.addEventListener("click",function(e){ var b=e.target.closest("button"); if(e.target===w||(b&&b.dataset.no)){ close(); return; } if(b&&b.dataset.yes){ close(); cb(); } if(b&&b.dataset.alt&&alt){ close(); alt[1](); } });
  document.addEventListener("keydown",onKey,true);
  document.body.appendChild(w); var y=w.querySelector("[data-yes]"); if(y) y.focus({preventScroll:true}); }

/* Equip link: an inventory item and the attack rows named "<item>" or "<item> (thrown)" share one equip state.
   A linked item with no saved eq (hand-filled sheets) counts as equipped. An unequipped item hides its attack rows. */
function eqInvOf(n){ n=String(n||""); var inv=C.inv||[], f=function(b){ return inv.filter(function(i){ return (i.key||i.n)===b||i.n===b; })[0]||null; }; return f(n)||(/ \(thrown\)$/.test(n)?f(n.replace(/ \(thrown\)$/,"")):null); }
function eqLinked(i){ var ks=[i.key||i.n,i.n]; return (C.attacks||[]).some(function(a){ return ks.some(function(k){ return a.n===k||a.n===k+" (thrown)"; }); }); }
function eqOn(i){ return i.eq==null?eqLinked(i):!!i.eq; }
/* Qty control in the item popup, like D&D Beyond: - and + change the box, Apply saves. 0 keeps the item. */
function qtyCtl(it,ix){ var q=num(it.q,1); return '<div class="iqty"><small>Qty</small><div class="iqty-r"><button type="button" class="iqb btn press" data-iqd="-1" aria-label="Decrease quantity">\u2212</button><input class="iqi" type="number" inputmode="numeric" min="0" step="1" value="'+q+'" data-iqv="'+q+'" aria-label="Quantity"><button type="button" class="iqb btn press" data-iqd="1" aria-label="Increase quantity">+</button><button type="button" class="iqa btn press" data-iqa="'+esc(it.key||it.n)+'"'+(ix!=null?' data-iix="'+ix+'"':'')+' disabled>Apply</button></div></div>'; }
function atkOn(a){ if(a&&a.of){ var o=eqInvOf(a.of); if(o&&!eqOn(o)) return false; } var i=eqInvOf(a.n); return !i||eqOn(i); }/* v32 RL51: a row a weapon carries (Pole Strike) follows that weapon */
/* RU22: index of the attack row named like the item ("Dagger", "Celurit (Sickle)", "Longsword, +1"), or -1. The "(thrown)" row is not used */
/* RU17/RU18: an inventory action goes through the builder hooks only for items the builder made (toSheet() writes "key" on every item; the sheet never does).
   A hand-filled sheet whose character also has a builder save keeps its own C: the hooks would replace the whole sheet with toSheet() and drop
   hand-written attacks, resources and actions without the Apply warning. */
/* RU29: copy the armor result of the builder to a hand-filled sheet. Only when the build agreed with the sheet before the change (same AC).
   Speed and Stealth disadvantage follow the same rule, each on its own. Returns true if AC was copied */
/* M18: attuned magic items on this sheet */
function attMaxC(){ return +C.attMax||3; }/* v19 RL43 */
function attCount(){ return (C.inv||[]).filter(function(i){ return i.att&&eqOn(i); }).length; }
function armorFx(fx,it){ var j=JSON.stringify; if(!fx||j(C.ac)!==j(fx.b0.ac)) return false;
  C.ac=JSON.parse(j(fx.b1.ac));
  /* M18: saving throw bonus and ability scores from magic items follow too, when the sheet still has the builder's values */
  if(fx.b0.sb&&j(C.saveBonus||[])===j(fx.b0.sb)){ if(fx.b1.sb.length) C.saveBonus=JSON.parse(j(fx.b1.sb)); else delete C.saveBonus; }
  if(fx.b0.ab&&C.abilities) ABK.forEach(function(k){ if(j(C.abilities[k])===j(fx.b0.ab[k])) C.abilities[k]=JSON.parse(j(fx.b1.ab[k])); });
  /* V13-2: keep the hand-written Speed source while armor changes Speed, put it back when Speed returns to that value */
  if(C.speed===fx.b0.speed&&fx.b1.speed!==fx.b0.speed){ if(!C.speedSrc0) C.speedSrc0={v:C.speed,s:C.speedSrc||""}; C.speed=fx.b1.speed;
    if(C.speedSrc0.v===C.speed){ C.speedSrc=C.speedSrc0.s; delete C.speedSrc0; } else C.speedSrc=fx.b1.speedSrc; }
  var sk=(C.skills||[]).filter(function(k){return k.n==="Stealth"})[0]; if(sk&&(sk.dis||"")===fx.b0.stealth){ if(fx.b1.stealth) sk.dis=fx.b1.stealth; else delete sk.dis; }
  (C.inv||[]).forEach(function(x){ if(x!==it&&fx.off.indexOf(x.key||x.n)>=0) x.eq=false; });
  return true; }
function viaBld(nm){ var it=(C.inv||[]).filter(function(x){return (x.key||x.n)===nm})[0]; return !!(it&&it.key&&window.__bldHas&&window.__bldHas(nm,C.name)); }
/* N2: hand-filled sheet path also updates the saved build of the same character (B.inv only), so a later Apply keeps the change */
function bldSync(nm,ch){ try{ if(window.__bldSync) window.__bldSync(nm,C.name,ch); }catch(e){} }
/* N1: a builder-made sheet that differs from the builder (Edit changes, or builder changes not applied yet) asks before an Inventory action rebuilds it.
   No difference (sheet just applied): no dialog. Cancel: nothing changes */
function bldGuard(go){ var d=[]; try{ if(window.__bldDiff) d=window.__bldDiff(C)||[]; }catch(e){ d=[]; } if(!d.length){ go(); return; }
  ask("The sheet and the builder differ. "+d.join(". ")+". Changing this item rebuilds the sheet from the builder, so these sheet entries are replaced. Cancel keeps the sheet as it is.","Continue",go); }
/* RU17-3: the item an Inventory button points at. data-iix (index in C.inv) wins when that item still has the name, else the first item with the name */
function invAt(nm,ix){ var L=C.inv||[], it=(ix!=null&&ix!==""&&L[+ix]&&(L[+ix].key||L[+ix].n)===nm)?L[+ix]:null; return it||L.filter(function(x){return (x.key||x.n)===nm})[0]||null; }
function itemAtkIx(it){ var ks=[it.key||it.n,it.n], L=C.attacks||[]; for(var i=0;i<L.length;i++){ if(ks.indexOf(L[i].n)>=0) return i; } return -1; }
/* RU22: item detail html with Damage and Proficient taken from the sheet attack row, so the popup matches the Actions tab.
   Hand-filled sheets get this html from the builder (__itemMeta), which knows nothing about the sheet. Display only, C.inv is not changed */
function itemHtml(it){ var h=String(it.html||""), ix=itemAtkIx(it), d=ix>=0?D.atk[ix]:null; if(!d||h.indexOf("<dt>Damage</dt>")<0) return h;
  return h.replace(/(<dt>Damage<\/dt><dd>)[^<]*(<\/dd>)/, function(m,a,b){ return a+esc(d.dmg)+b; }).replace(/(<dt>Proficient<\/dt><dd>)[^<]*(<\/dd>)/, function(m,a,b){ return a+(C.attacks[ix].prof?"Yes":"No")+b; })
    /* N5: chosen mastery follows the sheet attack row (m is set only for a chosen mastery) */
    .replace(/<p class="mst">(?:\u2605 )?(<b>Mastery: [^<]*<\/b>)(?: <small>\(not one of your chosen masteries\)<\/small>)?/, function(m,b){ var on=!!C.attacks[ix].m; return '<p class="mst">'+(on?"\u2605 ":"")+b+(on?"":' <small>(not one of your chosen masteries)</small>'); }); }
/* Hand-written "Attack with X and Y" actions hide when a linked weapon they name is unequipped ("Celurit (Sickle)" also matches "Celurit"). */
/* RU17-2: the action names are split on "," and "and", and an item matches a whole name (or its short form without the parentheses) */
function actOn(a){ var m=/^Attack with (.+)$/.exec(a.n||""); if(!m) return true; var ns=m[1].split(/\s*,\s*|\s+and\s+/).map(function(s){return s.trim()}).filter(Boolean), sh=function(s){return s.replace(/\s*\(.*\)$/,"")};
  return !(C.inv||[]).some(function(i){ if(!eqLinked(i)||eqOn(i)) return false; var nm=i.key||i.n; return ns.some(function(x){ return x===nm||x===i.n||sh(x)===sh(nm)||(sh(nm)&&x===sh(nm)); }); }); }
/* RU19: [[sense, index in C.senses]] for entries with a name. C.senses is optional (sheets made before v9 have none) */
function senseList(){ return (Array.isArray(C.senses)?C.senses:[]).map(function(s,i){return [s,i]}).filter(function(x){return x[0]&&x[0].n}); }
/* ================= DERIVATION WITH SOURCES ================= */
var D = {}, B = {};
function part(l,v,note){ return {l:l, v:v, note:note||""}; }
function derive(){
  D = {}; B = {}; CU0 = {};/* v34 RU85 */
  var lvl = clamp(Math.round(num(C.level,1)),1,20);
  var pb = 2 + Math.floor((lvl-1)/4);
  D.level = lvl; D.pb = pb;
  /* v19 RL44: Exhaustion (PHB 2024 Rules Glossary): each level takes 2 from every D20 Test (ability checks, saving throws, attack rolls, Initiative)
     and 5 feet from Speed. Passive scores are not D20 Tests and stay the same */
  var exh=clamp(Math.round(num(S.exh,0)),0,6); D.exh=exh; var xr=x14(), exhN=xr?0:exh; D.exhN=exhN;/* v94: 2014 Exhaustion has no number on D20 Tests */
  function exP(){ return part("Exhaustion level "+exh, -2*exh, "Every D20 Test is 2 lower for each Exhaustion level"); }
  B.pb = {t:"Proficiency Bonus", parts:[part("Character level "+lvl, pb, "Levels 1 to 4 give +2, 5 to 8 give +3, 9 to 12 give +4, 13 to 16 give +5, 17 to 20 give +6")], total:sg(pb), f:"Set by total character level (PHB-2024, Character Advancement)."};

  D.score={}; D.mod={};
  ABK.forEach(function(k){
    var a=C.abilities[k]||{base:10,bonus:[]};
    var parts=[part("Rolled score", num(a.base,10), k==="STR"&&C.rolledNote?C.rolledNote:"Base score before bonuses")]; parts[0].raw=true;
    (a.bonus||[]).forEach(function(b){ parts.push(part(b.s||"Bonus", num(b.v))); });
    var sc = parts.reduce(function(t,p){return t+p.v},0); sc=cuApply("ab-"+k,parts,sc);/* v34 RU85 */
    D.score[k]=sc; D.mod[k]=mod(sc);
    B["ab-"+k]={t:ABN[k]+" "+sc+" ("+sg(mod(sc))+")", parts:parts, total:String(sc), totalLabel:"Score",
      f:"Modifier: <code>("+sc+" \u2212 10) \u00f7 2</code>, rounded down = <b>"+sg(mod(sc))+"</b>"+(sc>20?". Scores above 20 need a feature that raises the cap.":"")};
  });
  function abPart(k){ return part(ABN[k]+" modifier", D.mod[k], ABN[k]+" score "+D.score[k]); }

  D.save={};
  ABK.forEach(function(k){
    var src=C.saves&&C.saves[k], parts=[abPart(k)];
    if(src) parts.push(part("Proficiency Bonus", pb, "Proficient from "+src));    (C.saveBonus||[]).forEach(function(b){ parts.push(part(b.s||"Bonus", num(b.v))); });/* M18 */
    if(exhN) parts.push(exP());
    var t=parts.reduce(function(a,p){return a+p.v},0); t=cuApply("save-"+k,parts,t);/* v26 RU38 no. 2 */
    D.save[k]=t; B["save-"+k]={t:ABN[k]+" saving throw", parts:parts, total:sg(t), f:src?"":(C.saveBonus&&C.saveBonus.length?"Not proficient: the modifier and the bonuses above apply.":"Not proficient, so only the modifier applies.")};
  });

  D.skill={};
  C.skills.forEach(function(s,i){
    var parts=[abPart(s.ab)], p=num(s.p,0);
    if(p>=1) parts.push(part(p===2?"Expertise (double Proficiency Bonus)":"Proficiency Bonus", pb*(p===2?2:1), s.src?("From "+s.src):"Source not set"));    if(num(s.misc,0)) parts.push(part(s.miscSrc||"Other bonus", num(s.misc)));
    if(exhN) parts.push(exP());
    var t=parts.reduce(function(a,q){return a+q.v},0); t=cuApply("sk:"+s.n,parts,t);/* v26 RU38 no. 2 */
    D.skill[i]=t;
    var f=[]; if(s.dis) f.push("Disadvantage on this check while wearing "+esc(s.dis)+".");
    if(s.hb) f.push(s.hbd?esc(s.hbd)+" (Retromistika Playtest, Skills.)":"Homebrew skill from Retromistika Playtest, Skills.");
    if(!p) f.push("Not proficient, so only the modifier applies.");
    B["sk-"+i]={t:s.n+" ("+s.ab+")", parts:parts, total:sg(t), f:f.join(" ")};
  });
  function skillByName(n){ for(var i=0;i<C.skills.length;i++){ if(C.skills[i].n===n) return i; } return -1; }
  [["Perception","per"],["Insight","ins"],["Investigation","inv"]].forEach(function(x){
    var i=skillByName(x[0]); var v=i>=0?D.skill[i]+2*exhN:D.mod[x[0]==="Investigation"?"INT":"WIS"];
    var pp=[{l:"Base",v:10,note:"Every passive check starts at 10",raw:true},part(x[0]+" bonus",v,"Tap the skill to see where this comes from")], pbn=0; (C.pasBon||[]).forEach(function(b){if(b.k===x[1]){pp.push(part(b.s,b.v,"Passive bonus"));pbn+=b.v}}); var xdis=(xr&&exh>=1)?-5:0; if(xdis) pp.push(part("Disadvantage on ability checks (Exhaustion level "+exh+")",-5,"A passive check with Disadvantage is 5 lower")); var pv=cuApply("pas-"+x[1],pp,10+v+pbn+xdis);/* v69 *//* v26 RU38 no. 2 */
    D["pas_"+x[1]]=pv;
    B["pas-"+x[1]]={t:"Passive "+x[0], parts:pp, total:String(pv), f:""};
  });

  var dexPart=null, dm=D.mod.DEX, mode=C.ac.dex||"none";
  var acParts=[part(C.ac.baseSrc||"Base AC", num(C.ac.base,10))]; acParts[0].raw=true;
  if(mode==="full") acParts.push(part("Dexterity modifier", dm, "Light armor or no armor"));
  else if(mode==="max2") acParts.push(part("Dexterity modifier (max 2)", Math.min(2,dm), "Medium armor caps it at +2"));
  else if(mode==="max3") acParts.push(part("Dexterity modifier (max 3)", Math.min(3,dm), "Medium Armor Master raises the cap to +3"));/* v69 */
  (C.ac.bonus||[]).forEach(function(b){ acParts.push(part(b.s||"Bonus", num(b.v))); });
  sitNum("ac").forEach(function(b){ acParts.push(part(b.s,b.v)); });/* v103 */
  D.ac=acParts.reduce(function(a,p){return a+p.v},0); D.ac=cuApply("ac",acParts,D.ac);/* v26 RU38 no. 2 */
  B.ac={t:"Armor Class", parts:acParts, total:String(D.ac), f:mode==="none"?"Heavy armor ignores your Dexterity modifier.":""};

  var inParts=[abPart("DEX")]; (C.initBonus||[]).forEach(function(b){ inParts.push(part(b.s||"Bonus", num(b.v))); }); if(exhN) inParts.push(exP());
  D.init=inParts.reduce(function(a,p){return a+p.v},0); D.init=cuApply("init",inParts,D.init);/* v26 RU38 no. 2 */
  B.init={t:"Initiative", parts:inParts, total:sg(D.init), f:"In the 2024 rules, Initiative is a Dexterity check."};

  D.speed=xr?(exh>=5?0:exh>=2?Math.floor(num(C.speed,30)/2):num(C.speed,30)):Math.max(0,num(C.speed,30)-5*exh);
  B.speed={t:"Speed", parts:[{l:C.speedSrc||"Base walking Speed", v:num(C.speed,30)+" ft", note:"", raw:true}].concat(exh?[xr?{l:"Exhaustion level "+exh, v:exh>=5?"Speed 0":"Halved", note:exh>=5?"Level 5: your Speed is 0":"Level 2: your Speed is halved", raw:true}:{l:"Exhaustion level "+exh, v:"\u2212"+(5*exh)+" ft", note:"5 feet less for each level", raw:true}]:[]), total:D.speed+" ft", f:""};
  sitNum("spd").forEach(function(b){ D.speed+=b.v; B.speed.parts.push({l:b.s,v:"+"+b.v+" ft",note:"",raw:true}); });/* v103 */
  D.speed=cuSpeed(D.speed,B.speed.parts); B.speed.total=D.speed+" ft";/* v26 RU38 no. 2 */
  B.dark={t:"Darkvision", parts:[{l:C.darkSrc||"Source not recorded", v:num(C.darkvision,0)+" ft", note:"", raw:true}], total:num(C.darkvision,0)+" ft", f:"You see in Dim Light within this range as if it were Bright Light, and in Darkness as if it were Dim Light (shades of gray only)."};
  /* RU19: other senses from the builder (C.senses, e.g. Devil's Sight). Optional field: missing = none */
  senseList().forEach(function(x){ var s=x[0]; B["sense-"+x[1]]={t:s.n, parts:[{l:s.s||"Source not recorded", v:num(s.v,0)+" ft", note:"", raw:true}], total:num(s.v,0)+" ft", f:esc(s.d||"")}; });

  var hd=num(C.hitDie,10), cm=D.mod.CON, avg=hd/2+1;
  var hpParts=[part("Level 1: maximum of d"+hd, hd, C.cls+" level 1 (PHB-2024)")]; hpParts[0].raw=true;
  var hpl=Array.isArray(C.hpPerLevel)?C.hpPerLevel:[];
  if(lvl>1 && hpl.length===lvl-1){ hpl.forEach(function(e,i){ var v=typeof e==="object"?num(e.v):num(e); hpParts.push(part("Level "+(i+2)+(e&&e.c?" ("+e.c+")":"")+(e&&e.r?": rolled":": fixed"), v, e&&e.n?e.n:"")); }); }
  else if(lvl>1) hpParts.push(part("Levels 2 to "+lvl+": fixed "+avg+" each", avg*(lvl-1), (lvl-1)+" \u00d7 "+avg+" (average of d"+hd+", rounded up)"));
  hpParts.push(part("Constitution modifier \u00d7 "+lvl+" levels", cm*lvl, "Con "+D.score.CON+" gives "+sg(cm)+" per level"));
  (C.hpBonus||[]).forEach(function(b){ hpParts.push(part(b.s||"Bonus", num(b.v))); });  if(num(S.hpMod,0)) hpParts.push(part("Max HP modifier", Math.round(num(S.hpMod,0)), "Set on the sheet"));/* v21 RU45 */
  if(xr&&exh>=4){ var hs0=Math.max(1,hpParts.reduce(function(a,q){return a+q.v},0)); hpParts.push(part("Exhaustion level "+exh+": maximum halved",-Math.floor(hs0/2),"Level 4: your Hit Point maximum is half of "+hs0)); }/* v94 */
  D.hpmax=Math.max(1,hpParts.reduce(function(a,p){return a+p.v},0)); var hpOv=Math.round(num(S.hpOver,0)); CU0.hp=D.hpmax; if(hpOv>0){ hpParts.push({l:"Set by you",v:String(hpOv),note:"Calculated value: "+D.hpmax+". Your number replaces it.",raw:true}); D.hpmax=hpOv; }/* v34 RU85 */
  B.hp={t:"Hit Point Maximum", parts:hpParts, total:String(D.hpmax), f:"Uses the fixed-value option for every level after the first."+(hpOv>0?" Override set on the sheet: "+hpOv+".":"")};

  /* RL35 4b (RL34): C.dcAb from the builder (Monk Dexterous Attacks). Missing = Strength, as before */
  var dab=ABK.indexOf(C.dcAb)>=0?C.dcAb:"STR", dabP=abPart(dab); if(C.dcSrc) dabP.note=C.dcSrc;
  D.dc=8+D.mod[dab]+pb; var dcP=[]; D.dc=cuApply("dc",dcP,D.dc);/* v34 RU85 */
  B.dc={t:"Unarmed Strike: Grapple and Shove DC", parts:[{l:"Base",v:8,note:"",raw:true},dabP,part("Proficiency Bonus",pb,"Every creature is proficient with Unarmed Strike")].concat(dcP), total:String(D.dc), f:"The target makes a Strength or Dexterity saving throw (its choice) against this DC (PHB-2024, Unarmed Strike)."};

  var CY=carryOf(D.score.STR); D.carry=CY.v;/* v25: size and Powerful Build */
  B.carry={t:"Carrying Capacity", parts:[{l:"Strength score \u00d7 "+CY.m, v:D.carry+" lb", note:"Str "+D.score.STR+", "+CY.s+" creature"+(CY.pb?", Powerful Build (one size larger)":"")+(CY.bear?", Aspect of the Beast: Bear (doubled)":""), raw:true}], total:D.carry+" lb", f:"PHB-2024, Rules Glossary: Carrying Capacity."+(setOf("enc")==="off"?" Weight is not tracked (Settings).":"")};

  var CF=cfx(); D.cf=CF;/* v22 RU53, RU56 */
  if(B.init&&(CF.init||[]).length){ var ia=CF.init.filter(function(x){ return x.t==="ADV"; }).map(function(x){ return x.s; }); if(ia.length) B.init.f+=" Advantage: "+ia.join(", ")+"."; }/* v56 */
  if(CF.speed0.length){ D.speed=0; B.speed.parts.push({l:CF.speed0.join(", "), v:"Speed 0", note:"Condition", raw:true}); B.speed.total="0 ft"; }
  D.atk=[];
  (C.attacks||[]).forEach(function(a,i){
    var m=D.mod[a.ab]||0, hp=[part(ABN[a.ab]+" modifier", m, ABN[a.ab]+" score "+D.score[a.ab])];
    if(a.prof) hp.push(part("Proficiency Bonus", pb, "Proficient with this weapon"));
    if(num(a.misc,0)) hp.push(part(a.miscSrc||"Other bonus", num(a.misc)));
    var amB=ammoBonus(a), amN=amB&&amB.on?amB.on.n:0; if(amN) hp.push(part(amB.on.it.n, amN, "Magic ammunition fired from this weapon"));/* v102 */
    if(CF.atkW&&!/^Cantrip/.test(a.sub||"")&&a.n!=="Unarmed Strike"&&atkKind(a)==="melee") hp.push(part("Sacred Weapon", CF.atkW, "Charisma modifier, while it lasts"));/* v22 RU56 */    if(exhN) hp.push(exP());
    var cuA=cuK("a:"+a.n); if(cuA) CU0["a:"+a.n+"|ho"]=hp.reduce(function(t,p){return t+p.v},0); if(cuA&&cuNum(cuA.hb)) hp.push(part("Customize: bonus", cuNum(cuA.hb), cuA.note||"Set with Customize"));/* v26 RU38 no. 2 */
    var hit=hp.reduce(function(t,p){return t+p.v},0);
    if(cuA&&cuNum(cuA.ho)!=null){ hp.push({l:"Set by you", v:sg(cuNum(cuA.ho)), note:"Calculated value: "+sg(CU0["a:"+a.n+"|ho"])+". Your number replaces it.", raw:true}); hit=cuNum(cuA.ho); }
    var rgB=(CF.dmgStr&&a.ab==="STR"&&!/^Cantrip/.test(a.sub||""))?CF.dmgStr:0;/* v22 RU56 Rage */ var dm=(a.nomod?0:m)+num(a.dmgBonus,0)+amN+rgB+(cuA?cuNum(cuA.db)||0:0); var dmg=(a.die||"1")+(dm===0?"":(dm>0?"+"+dm:"\u2212"+Math.abs(dm)));
    var dmC=dm-(cuA?cuNum(cuA.db)||0:0), cDo=cuA&&cuA["do"]?String(cuA["do"]):""; if(cuA) CU0["a:"+a.n+"|do"]=(a.die||"1")+(dmC===0?"":(dmC>0?"+"+dmC:"\u2212"+Math.abs(dmC))); if(cDo) dmg=cDo;/* v34 RU85 */
    D.atk[i]={hit:hit, dmg:dmg, rg:rgB};
    if(amB&&!amB.on) hp.push({l:"Magic ammunition", v:"None selected", note:"You carry "+amB.L.map(function(x){ return x.it.n; }).join(" and ")+". Open this attack to pick one.", raw:true});/* v102 */
    B["ah-"+i]={t:a.n+": attack roll", parts:hp, total:sg(hit), f:""};
    B["ad-"+i]={t:a.n+": damage", parts:[{l:"Damage die", v:a.die||"\u2014", note:a.dieSrc||"", raw:true}, part(ABN[a.ab]+" modifier", a.nomod?0:m, a.nomod?"Not added to this damage":"Added to damage")].concat(num(a.dmgBonus,0)?[part(a.miscSrc||"Magic bonus", num(a.dmgBonus))]:[]).concat(amN?[part(amB.on.it.n, amN, "Magic ammunition fired from this weapon")]:[]).concat(cuA&&cuNum(cuA.db)?[part("Customize: damage bonus", cuNum(cuA.db), cuA.note||"Set with Customize")]:[]).concat(cDo?[{l:"Set by you", v:cDo, note:"Calculated value: "+CU0["a:"+a.n+"|do"]+". Your text replaces it.", raw:true}]:[]), total:dmg, f:a.type?("Damage type: "+esc(a.type)+"."):""};
  });
  (C.attacks||[]).forEach(function(a,i){ if(D.atk[i]&&D.atk[i].rg&&B["ad-"+i]){ B["ad-"+i].parts.push(part("Rage damage", D.atk[i].rg, "Rage is active, attack with Strength")); B["ad-"+i].total=D.atk[i].dmg; } });
  D.res=(C.res||[]).map(function(r){ var mx = r.auto==="level" ? lvl : Math.max(0,Math.round(num(r.max,0))), mx0=mx; if(r.dmax&&S.chMax&&S.chMax[r.k]!=null) mx=clamp(Math.round(num(S.chMax[r.k],mx)),0,mx);/* v21 RU44 */ return {k:r.k, n:r.n, tag:r.auto==="level" ? ("d"+hd+sg(cm)+" each") : r.die ? ("d"+num(r.die,hd)+sg(cm)+" each") /* N4 */ : (r.tag||""), max:mx, reset:r.reset||"none", pool:!!r.pool, f:r.f||"", die:r.auto==="level"?hd:(r.die?num(r.die,hd):null), own:r.own||"", item:!!r.item, rg:r.rg||"", when:r.when||"", dmax:r.dmax||"", max0:mx0}; });
  if(S.hp==null || S.hp>D.hpmax) S.hp=Math.min(S.hp==null?D.hpmax:S.hp, D.hpmax);
  if(C.spellcasting) try{ scAdj(C.spellcasting); }catch(er){}/* v34 RU85: Spell Attack and Save DC breakdown */
}
/* full texts: bold labels start a new line */
