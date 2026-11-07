/* Responsibility: snapshots (take, restore, heal) and character files (copy, save, open). Split out of the former single file 15 in SOLID stage 9 (S); runs in the same order as before. */
import {copyText} from "./lib/clipboard.js";import {APP_VER,CKEY,FROZEN,KEY,SNKEY,cSaveT,fmtAgo,lsGet,lsSet,saveT} from "./04-logic-storage.js";import {ask,esc,toast} from "./05-logic-helpers.js";import {uiGet} from "./07-ui-theme-contrast-spring.js";import {BKEY,RKEY,rEnsure,rGet,rSave,setOrDel} from "./14-ui-editor.js";import {__R} from "./00-reg.js";import {env} from "./00-env.js";import {homeCards,rSnap,showHome} from "./15-logic-roster-backup-files-snapshots.js";import {packOut} from "./15b-logic-backup.js";import {askPersist,cOf,chRaw,dlFile,fileAgo,fileMark,fileStale,fixCid,fmtT,newId,rawHash,remindCfg,uiSet,updUnsaved,zPack} from "./15c-logic-file-state-compress.js";
Object.defineProperty(__R,"BIN_OPEN",{get:function(){return BIN_OPEN;},set:function(v){BIN_OPEN=v;},configurable:true});
Object.defineProperty(__R,"SN_BAD",{get:function(){return SN_BAD;},set:function(v){SN_BAD=v;},configurable:true});
Object.defineProperty(__R,"healHTML",{get:function(){return healHTML;},set:function(v){healHTML=v;},configurable:true});
Object.defineProperty(__R,"healUse",{get:function(){return healUse;},set:function(v){healUse=v;},configurable:true});
Object.defineProperty(__R,"snGet",{get:function(){return snGet;},set:function(v){snGet=v;},configurable:true});
Object.defineProperty(__R,"snTake",{get:function(){return snTake;},set:function(v){snTake=v;},configurable:true});
const SN_MAX=900000;
export var BIN_OPEN=false;
export var SN_BAD=false;
export function snGet(){ const raw=lsGet(SNKEY); try{ const o=JSON.parse(raw||"null"); if(o&&o.chars&&typeof o.chars==="object"){ SN_BAD=false; return o; } }catch(e){} SN_BAD=raw!=null; return {chars:{}}; }
function snDrop(o){ let best=null; Object.keys(o.chars).forEach((id) =>{ const L=o.chars[id]; if(L&&L.length){ const x=L[L.length-1]; if(!best||x.t<best.t) best={id:id,t:x.t}; } }); if(!best) return false; o.chars[best.id].pop(); if(!o.chars[best.id].length) delete o.chars[best.id]; return true; }
function snPut(o){ if(FROZEN||SN_BAD) return false;/* a damaged snapshot store is not overwritten */ o._app=Math.max(+o._app||0,APP_VER); for(let n=0;n<60;n++){ const s=JSON.stringify(o); if(s.length<=SN_MAX){ try{ __store.setItem(SNKEY,s); return true; }catch(e){} } if(!snDrop(o)) return false; } return false; }
/* T11 N25 self-healing storage: when the open character's sheet or play state cannot be read (BAD, recovery screen), the app looks for the
   newest copy that can: the localStorage mirror of IndexedDB (src/boot/store-gate.js), the roster's copy, then the snapshots (newest first).
   A copy counts when it reads as JSON of the known shape (sheet: v 3 with abilities, play state: an object). Writes are whole per key in both
   stores, so the shape test is the check that matters: no checksum is added and no stored data changes shape. Restoring asks first, keeps the
   unreadable text under cs-heal-v1, writes only the parts that were unreadable, and loads the app again */
function healOkC(raw){ try{ const p=JSON.parse(raw); return !!(p&&p.v===3&&p.abilities); }catch(e){ return false; } }
function healOkS(raw){ try{ const p=JSON.parse(raw); return !!(p&&typeof p==="object"&&!Array.isArray(p)); }catch(e){ return false; } }
function healFind(){ const curC=lsGet(CKEY), curS=lsGet(KEY), needC=curC!=null&&!healOkC(curC), needS=curS!=null&&!healOkS(curS); if(!needC&&!needS) return null;
  const L=[], add=function(src,t,c,st){ if(needC&&!healOkC(c)) return; if(!needC&&needS&&!healOkS(st)) return; L.push({src:src,t:t||0,C:needC?c:null,S:needS&&healOkS(st)?st:null}); };
  try{ add("the second copy on this device",0,localStorage.getItem(CKEY),localStorage.getItem(KEY)); }catch(e){}
  let r=null; try{ r=JSON.parse(lsGet(RKEY)||"null"); }catch(e){ r=null; } const e0=r&&r.chars&&r.active&&r.chars[r.active]; if(e0) add("the character list",e0.t,e0.C,e0.S);
  if(r&&r.active){ const o=snGet(); (o.chars[r.active]||[]).forEach((x) =>{ add("a snapshot ("+x.why+")",x.t,typeof x.C==="string"?x.C:JSON.stringify(x.C),x.S); }); }
  if(!L.length) return {needC:needC,needS:needS,none:1};
  const first=L[0].src.indexOf("second copy")===0?L[0]:null, rest=L.filter((x) =>{ return x!==first; }).sort((a,b) =>{ return b.t-a.t; });
  const pick=first||rest[0]; pick.needC=needC; pick.needS=needS; const c=cOf(pick.C||curC); pick.label=(c.name||"Character")+(c.cls?", "+(c.clsLabel||(c.cls+" "+(c.level||""))):"")+(pick.t?", saved "+fmtAgo(pick.t):""); return pick; }
function healHTML(){ let h=null; try{ h=healFind(); }catch(e){ h=null; } if(!h) return "";
  if(h.none) return '<p class="muted">No readable copy of this character was found on this device. Download a backup and keep it.</p>';
  return '<div class="rec-heal"><p><b>A readable copy was found</b> in '+esc(h.src)+': '+esc(h.label)+'.</p><div class="bkpr"><button type="button" class="btn pri press" data-rec="heal">Use This Copy</button></div></div>'; }
function healUse(){ const h=healFind(); if(!h||h.none){ toast("No readable copy was found"); return; }
  ask("Use the copy from "+h.src+" ("+h.label+")? The unreadable data is kept on this device (cs-heal-v1). Download Backup first if you want a file of it.","Use This Copy",() =>{
    try{ __store.setItem("cs-heal-v1",JSON.stringify({t:Date.now(),src:h.src,keys:(function(){ const k={}; k[CKEY]=lsGet(CKEY); k[KEY]=lsGet(KEY); return k; })()})); }catch(e){}
    try{ if(h.needC&&h.C) __store.setItem(CKEY,h.C); if(h.needS&&h.S) __store.setItem(KEY,h.S); else if(h.needS) __store.removeItem(KEY); }catch(e){ toast("Could not write the copy: storage is full"); return; }
    const go=function(){ sessionStorage.setItem("cs-skip","1"); __miReload(); }; if(__store.flush) __store.flush().then(go,go); else go(); }); }
env.__healFind=healFind;
export function snTake(id,why,r){ if(FROZEN||!id) return; r=r||rGet(); if(!r||!r.chars||!r.chars[id]) return; const x=chRaw(id,r); if(!x.C) return; let s=x.S;
  try{ const so=JSON.parse(s||"null"); if(so&&so.portrait){ so.portrait=""; s=JSON.stringify(so); } }catch(e){}
  const o=snGet(), L=o.chars[id]||[], h=rawHash({B:x.B,C:x.C,S:s}); if(L[0]&&L[0].h===h) return;
  L.unshift({t:Date.now(),why:why,cr:r.chars[id].created||null,name:cOf(x.C).name||r.chars[id].name||"",B:x.B,C:x.C,S:s,h:h}); o.chars[id]=L.slice(0,5); snPut(o); }
export function snRestore(id,i){ const o=snGet(), x=(o.chars[id]||[])[i]; if(!x) return;
  /* T11 G3 N13: for the open character, the numbers that the restore would change */
  let pv=""; try{ if(id===(rGet()||{}).active&&env.__rcptRestoreText) pv=env.__rcptRestoreText(typeof x.C==="string"?JSON.parse(x.C):x.C); }catch(er){ pv=""; }
  ask("Go back to the copy from "+fmtT(x.t)+" ("+x.why+")? The character as it is now is kept as a snapshot first, so you can undo this."+(pv?"\n\nNumbers that change:\n"+pv:""),"Restore Snapshot",() =>{ const r=rSnap(rEnsure()); snTake(id,"Before going back to a snapshot",r);
    let cur=chRaw(id,r), s=x.S; try{ const so=JSON.parse(s), co=cOf(cur.S); if(co.portrait){ so.portrait=co.portrait; s=JSON.stringify(so); } }catch(e){}
    const e=r.chars[id]; e.B=x.B; e.C=x.C; e.S=s; e.name=x.name||e.name; e.t=Date.now(); if(!rSave(r)) return;
    if(id===r.active){ clearTimeout(cSaveT); clearTimeout(saveT); setOrDel(BKEY,x.B); lsSet(CKEY,x.C); lsSet(KEY,s); sessionStorage.setItem("cs-skip","1"); __miReload(); return; }
    toast("Snapshot restored"); chfOpen(id); const g=document.getElementById("hgrid"); if(g) g.innerHTML=homeCards(); }); }
export function snBack(id){ const r=rSnap(rEnsure()), x=(snGet().chars[id]||[])[0]; if(!x||r.chars[id]) return; const nm=x.name||cOf(x.C).name||"Character";
  ask("Bring back "+nm+" from the snapshot of "+fmtT(x.t)+"?","Bring Back",() =>{ r.chars[id]={name:nm,sub:(cOf(x.C).species||"")+" "+(cOf(x.C).clsLabel||""),B:fixCid(x.B,id),C:x.C,S:x.S,created:x.cr||Date.now(),t:Date.now()}; if(!rSave(r)) return; showHome(); toast(nm+" is back"); }); }
function chCopy(id){ const r=rSnap(rEnsure()), src=r.chars[id]; if(!src) return; const did=newId(r), cp=structuredClone(src);
  try{ const cc=JSON.parse(cp.C); cc.name=(cc.name||"Character")+" (copy)"; cp.C=JSON.stringify(cc); cp.name=cc.name; const bb=JSON.parse(cp.B||"null"); if(bb){ bb.name=cc.name; bb.cid=did; cp.B=JSON.stringify(bb); } }catch(er){}
  cp.created=Date.now(); cp.t=Date.now(); r.chars[did]=cp; if(!rSave(r)) return; const g=document.getElementById("hgrid"); if(g) g.innerHTML=homeCards(true); const hs=document.querySelector("#homeV .hslots b"); if(hs) hs.textContent=Object.keys(r.chars).length; toast("Copied: "+cp.name); }
/* RU67: character file */
export function chFile(id){ const r=rSnap(rEnsure()), c=r.chars[id]||{}, x=chRaw(id,r);
  return {app:"dnd2024-sheet-builder",kind:"character",format:1,appVer:APP_VER,saved:new Date().toISOString(),id:id,name:c.name||cOf(x.C).name||"",B:x.B,C:x.C,S:x.S}; }
export function chName(o){ return (String(o.name||"character").replace(/[^A-Za-z0-9 _-]+/g,"").trim().replace(/\s+/g,"-")||"character")+".bs"; }
export var FH={};
export function chSave(id){ askPersist(); const o=chFile(id); packOut(JSON.stringify(o),(txt) =>{ chSave2(id,o,txt); }); }
function chSave2(id,o,txt){ const nm=chName(o);
  const mark=function(msg){ const f=uiGet("cs-ui-files"); f[id]={h:rawHash(o),t:Date.now()}; uiSet("cs-ui-files",f); updUnsaved(); toast(msg); if(document.getElementById("chf")) chfOpen(id); const g=document.getElementById("hgrid"); if(g) g.innerHTML=homeCards(true); };
  const dl=function(){ dlFile(txt,nm,(ok) =>{ if(ok) mark("Download started: "+nm); else { toast("Download is blocked here. Use Show as Text."); } }); };
  /* Chrome and Edge on a computer: write the same file again (File System Access API). Elsewhere every Save downloads a new file */
  if(env.showSaveFilePicker&&env.isSecureContext&&!/Mobi|Android/i.test(navigator.userAgent)){ const hp=FH[id]?Promise.resolve(FH[id]):env.showSaveFilePicker({suggestedName:nm,types:[{description:"Character file",accept:{"application/octet-stream":[".bs"]}}]});
    hp.then((h) =>{ FH[id]=h; return h.createWritable().then((w) =>{ return w.write(txt).then(() =>{ return w.close(); }); }).then(() =>{ mark("Saved to "+h.name); }); }).catch((e) =>{ if(e&&e.name==="AbortError") return; delete FH[id]; dl(); }); return; }
  dl(); }
export function chfOpen(id){ const r=rGet()||{chars:{}}, c=r.chars[id]; if(!c) return; const old=document.getElementById("chf"); if(old) old.remove(); const w=document.createElement("div"); w.id="chf"; w.className="bkp"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","chfT");
  const fm=fileMark(id), chg=!!fm&&fm.h!==rawHash(chRaw(id,r)), uns=fileStale(fm,chg), rc=remindCfg(), L=snGet().chars[id]||[];/* v33 p10 */
  w.innerHTML='<div class="bkpb"><div class="bkph"><b id="chfT">'+esc(c.name||"Character")+'</b><button type="button" class="bkpx" data-chf="close" aria-label="Close">×</button></div>'+
   '<p>Save this character in its own file (.bs). The text inside is packed, so other apps cannot open it directly. Open Character on any device adds it back, next to the characters already there.</p>'+
   '<p class="muted">Last saved to a file: <b>'+(fm?fmtT(fm.t):'never')+'</b>'+(uns?' <span class="hunsv">File out of date</span>':'')+'</p>'+(uns?'<p class="hunsv-x">Your last file backup was '+fileAgo(fm)+' and the character changed since. Your progress is kept on this device automatically. Press Save Character to refresh the backup file.</p>':(chg?'<p class="muted">Changed since the last file save. Your progress is kept on this device automatically, so this is only a backup reminder.</p>':''))+
   '<div class="chfopt"><label for="chfRem">Backup reminder</label><select id="chfRem" data-chfrem="1"><option value="7"'+(rc.days===7?' selected':'')+'>After 7 days</option><option value="30"'+(rc.days===30?' selected':'')+'>After 30 days</option><option value="0"'+(rc.days===0?' selected':'')+'>Off</option></select>'+
   ((env.showSaveFilePicker&&!/Mobi|Android/i.test(navigator.userAgent))?'<label class="chfauto"><input type="checkbox" data-chfauto="1"'+(rc.auto?' checked':'')+'> Keep this file updated automatically (after you save it once in this window)</label>':'')+'</div>'+
   '<div class="bkpr"><button type="button" class="btn pri press" data-chf="save">Save Character</button><button type="button" class="btn press" data-chf="text">Show as Text</button></div>'+
   '<div class="bkpr"><button type="button" class="btn press" data-chf="send">'+__R.ico("ui-qr")+'<span>Send to Another Device</span></button></div>'+
   '<div class="bkpt" hidden><textarea id="chfTxt" readonly spellcheck="false">Packing...</textarea><div class="bkpr"><button type="button" class="btn press" data-chf="copy">Copy Text</button></div></div>'+
   '<h4 class="chfh">Other Apps</h4><p class="muted">A basic file for Foundry VTT (dnd5e system): ability scores, saves, skills, Hit Points, Armor Class, Speed, coins, class levels, and the names of items, spells, and features. In Foundry, right-click a character and choose Import Data.</p><div class="bkpr"><button type="button" class="btn press" data-chf="foundry">Export for Foundry VTT</button></div>'+
   '<h4 class="chfh">Snapshots</h4><p class="muted">The last 5 versions of this character, kept on this device. One is taken after each hour of play, before Apply from the builder, Restore, and Open Character, and once a day.</p>'+
   (SN_BAD?'<p class="hbkl warn">The snapshot list on this device is damaged, so new snapshots are not saved. It is left as it is. Back Up your characters to keep a safe copy.</p>':'')+(L.length?'<div class="snl">'+L.map((x,i) =>{ return '<div class="snr"><span><b>'+fmtT(x.t)+'</b><small>'+esc(x.why)+(x.name?' • '+esc(x.name)+' '+esc(cOf(x.C).clsLabel||((cOf(x.C).cls||"")+" "+(cOf(x.C).level||""))):'')+'</small></span><button type="button" class="btn press" data-snr="'+i+'">Restore</button></div>'; }).join("")+'</div>':'<p class="muted">No snapshots yet.</p>')+
   '<div class="bkpr"><button type="button" class="btn press" data-chf="snap">Take Snapshot Now</button><button type="button" class="btn press" data-chf="dup">Make a Copy</button></div></div>';
  document.body.appendChild(w);
  const esc1=function(e){ if(e.key==="Escape"&&!document.querySelector(".ask")){ w.remove(); document.removeEventListener("keydown",esc1,true); } }; document.addEventListener("keydown",esc1,true);
  let txt=null;
  w.addEventListener("click",(e) =>{ if(e.target===w){ w.remove(); return; } const s=e.target.closest("[data-snr]"); if(s){ snRestore(id,+s.getAttribute("data-snr")); return; } const b=e.target.closest("[data-chf]"); if(!b) return; const a=b.getAttribute("data-chf");
    if(a==="close"){ w.remove(); return; }
    if(a==="save"){ chSave(id); return; }
    if(a==="dup"){ chCopy(id); w.remove(); return; }
    if(a==="foundry"){ __R.foundryOut(id); return; }/* v27 RU75 */
    if(a==="send"){ __R.qrSendOpen(id); return; }/* v34 item 5 */
    if(a==="text"){ const t=JSON.stringify(chFile(id)); w.querySelector(".bkpt").hidden=false; zPack(t).then((z) =>{ txt=z; },() =>{ txt=t; }).then(() =>{ const ta=document.getElementById("chfTxt"); if(ta){ ta.value=txt; ta.focus(); ta.select(); } }); return; }
    if(a==="copy"){ const ta=document.getElementById("chfTxt"); copyText(txt||ta.value,ta).then((ok) =>{ toast(ok?"Character text copied":"Select the text and copy it"); }); return; }
    if(a==="snap"&&SN_BAD){ toast("Snapshots cannot be saved: the snapshot list on this device is damaged"); return; }
    if(a==="snap"){ const rr=rSnap(rEnsure()), before=(snGet().chars[id]||[]).length; snTake(id,"Taken by hand",rr); toast((snGet().chars[id]||[]).length>before||before>=5?"Snapshot taken":"No changes since the last snapshot"); chfOpen(id); return; } }); }
/* import: backup or character file, plain or packed */
