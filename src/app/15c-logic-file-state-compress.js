import {bindLive,lateGet,uiGet,rGet} from "./00a-reg-late-ports.js";/* Responsibility: unsaved marks, file reminders, compression, storage info and the Home info card. Split out of the former single file 15 in SOLID stage 9 (S); runs in the same order as before. */
import {APP_VER,C,FROZEN,S,lsGet} from "./04-logic-storage.js";import {esc} from "./05-logic-helpers.js";import {env} from "./00-env.js";import {BIN_OPEN,FH,chSave,snGet} from "./15d-logic-snapshots-character-files.js";
bindLive("fmtT",{get:function(){return fmtT;}});
bindLive("uiSet",{get:function(){return uiSet;}});
bindLive("updUnsaved",{get:function(){return updUnsaved;}});
export function hashS(s){ let h=2166136261; s=String(s||""); for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0).toString(36)+s.length.toString(36); }
export function rawHash(x){ return hashS((x.B||"")+"\u0001"+(x.C||"")+"\u0001"+(x.S||"")); }
/* the open character as it will be saved (memory is newer than storage for up to 200 ms) */
export function curRaw(){ [C,S].forEach((o) =>{ o._app=Math.max(+o._app||0,APP_VER); }); return {B:lsGet(lateGet("BKEY")),C:JSON.stringify(C),S:JSON.stringify(S)}; }
export function chRaw(id,r){ r=r||rGet()||{chars:{}}; if(id===r.active&&!FROZEN) return curRaw(); const c=(r.chars||{})[id]||{}; return {B:c.B==null?null:c.B,C:c.C==null?null:c.C,S:c.S==null?null:c.S}; }

export function uiSet(k,o){ try{ __store.setItem(k,JSON.stringify(o)); }catch(e){} }
export function fileMark(id){ return uiGet("cs-ui-files")[id]||null; }
/* v33 p10: the file mark is a reminder, not a duty. Days 0 = off */
export function remindCfg(){ const o=uiGet("cs-ui-remind"); return {days:o.days==null?7:+o.days, auto:!!o.auto}; }
export function fileStale(fm,changed){ const c=remindCfg(); return !!fm&&changed&&c.days>0&&(Date.now()-fm.t)>c.days*864e5; }
export function fileAgo(fm){ const d=Math.floor((Date.now()-fm.t)/864e5); return d<1?"today":d===1?"1 day ago":d+" days ago"; }
let autoFT=null;
export function updUnsaved(){ const r=rGet(); if(!r||!r.chars||!r.active) return; const fm=fileMark(r.active), ch=!!fm&&fm.h!==rawHash(curRaw()), on=fileStale(fm,ch), b=document.getElementById("rosterBtn");
  if(ch&&remindCfg().auto&&typeof FH!=="undefined"&&FH[r.active]){ const aid=r.active; clearTimeout(autoFT); autoFT=setTimeout(() =>{ if(FH[aid]) chSave(aid); },2500); }/* v33 p10 */
  if(b){ b.classList.toggle("unsv",on); b.setAttribute("aria-label",on?"My characters. The character file is out of date":"My characters"); if(on) b.title="Changed since the last Save Character. Saved on this device"; else b.removeAttribute("title"); } }
export function fmtT(t){ const d=new Date(t), p=function(x){return (x<10?"0":"")+x}; return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+" "+p(d.getHours())+":"+p(d.getMinutes()); }
export function dlFile(txt,nm,cb){ try{ const bl=new Blob([txt],{type:/\.bs$/.test(nm)?"application/octet-stream":"application/json"}), u=URL.createObjectURL(bl), l=document.createElement("a"); l.href=u; l.download=nm; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() =>{ URL.revokeObjectURL(u); },4000); cb(true); }catch(e){ cb(false); } }
export function newId(r){ let id; do{ id="c"+Date.now()+Math.floor(Math.random()*1000); }while(r.chars[id]); return id; }
export function fixCid(b,id){ if(b==null) return null; try{ const o=JSON.parse(b); if(o&&typeof o==="object"&&o.cid&&o.cid!==id){ o.cid=id; return JSON.stringify(o); } }catch(e){} return b; }
export function cOf(raw){ try{ return JSON.parse(raw)||{}; }catch(e){ return {}; } }
/* (e) packed text: gzip + base64 with a prefix. Plain JSON stays accepted everywhere */
export function zPack(s){ if(!env.CompressionStream) return Promise.reject(new Error("no CompressionStream"));
  return new Response(new Blob([s]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer().then((b) =>{ let u=new Uint8Array(b), t="", i; for(i=0;i<u.length;i+=32768) t+=String.fromCharCode.apply(null,u.subarray(i,i+32768)); return "DND24Z1:"+btoa(t); }); }
export function zUnpack(s){ s=String(s||"").trim(); if(s.indexOf("DND24Z1:")!==0) return Promise.resolve(s); if(!env.DecompressionStream) return Promise.reject(new Error("This browser cannot unpack packed text. Use the file instead."));
  try{ var b=atob(s.slice(8).replace(/\s+/g,"")), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i); }catch(e){ return Promise.reject(new Error("This packed text is damaged.")); }
  return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"))).text().catch(() =>{ throw new Error("This packed text is damaged."); }); }
/* (c) ask the browser to keep the app's storage (no prompt in most browsers) */
export function askPersist(){ try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persisted().then((p) =>{ return p||navigator.storage.persist(); }).then(() =>{ persistShow(); },() =>{}); }catch(e){} }
export function persistShow(){ const e=document.getElementById("hpers"); if(!e) return; try{ if(!navigator.storage||!navigator.storage.persisted){ e.innerHTML="not available in this browser"; return; } navigator.storage.persisted().then((p) =>{ e.innerHTML=p?"<b>Yes</b>":'No <button type="button" class="hlink" data-hpers="1">Ask the browser</button>'; },() =>{}); }catch(er){} }
/* (b) last backup on this device (cs-ui-bkp, not part of the backup itself) */
function allHash(r){ r=r||rGet()||{chars:{}}; return hashS(Object.keys(r.chars||{}).sort().map((id) =>{ return rawHash(chRaw(id,r)); }).join(",")); }
export function bkMark(){ uiSet("cs-ui-bkp",{t:Date.now(),h:allHash()}); const hi=document.getElementById("hinfo"); if(hi) hi.innerHTML=homeInfo(), persistShow(); }
function lsUse(){ let n=0, por=0; try{ for(let i=0;i<__store.length;i++){ const k=__store.key(i), v=__store.getItem(k)||""; n+=k.length+v.length; } const r=rGet(); if(r&&r.chars) Object.keys(r.chars).forEach((id) =>{ por+=(cOf(id===r.active?JSON.stringify(S):r.chars[id].S).portrait||"").length; }); }catch(e){} return {n:n,por:por}; }
function bkState(){ const bk=uiGet("cs-ui-bkp"), r=rGet()||{chars:{}}, now=Date.now(), days=bk.t?Math.floor((now-bk.t)/864e5):0, ch=bk.t&&bk.h!==allHash(r);
  const old=Object.keys(r.chars||{}).some((id) =>{ return now-(r.chars[id].created||now)>3*864e5; }), warn=bk.t?(ch&&days>=7):old;
  /* T7: on IndexedDB the limit is the space the browser gives this site (navigator.storage.estimate), not about 5 MB */
  const u=lsUse(), idb=__store.mode&&__store.mode()==="idb", es=idb?__store.estimate:null, cap=es&&es.quota?es.quota:idb?0:5e6, used=es&&es.usage?Math.max(es.usage,u.n):u.n; u.cap=es&&es.quota?cap:0; u.idb=idb; u.used=used;
  if(idb&&!cap){ return {bk:bk,r:r,days:days,ch:ch,warn:warn,u:u,pct:0,full:false}; }/* the browser has not answered yet: no meter warning */
  const pct=Math.min(100,Math.round(used*100/cap)); return {bk:bk,r:r,days:days,ch:ch,warn:warn,u:u,pct:pct,full:pct>=80}; }
/* T3: backup and storage details live in the Settings dialog (bkpOpen "info"). Home shows only a short warning when the backup is old or storage is almost full */
export function techInfo(){ const q=bkState(), bk=q.bk, u=q.u, pct=q.pct, full=q.full, mb=function(x){ return (x/1e6).toFixed(2)+" MB"; };
  return '<div class="hbkl'+(q.warn?' warn':'')+'"><span>Last backup: <b>'+(bk.t?fmtT(bk.t).slice(0,10)+' ('+(q.days?q.days+' day'+(q.days===1?'':'s')+' ago':'today')+')':'never')+'</b>'+(q.ch?' \u2022 changes since then':'')+'</span>'+
    (q.warn?'<span class="hbkw">'+(bk.t?'Back up again so the latest changes are safe.':'Back up your characters so they are safe if this browser\'s data is cleared.')+'</span>':'')+'</div>'+
    '<div class="hstor'+(full?' warn':'')+'"><span class="hmeter" aria-hidden="true"><span style="width:'+pct+'%"></span></span><span>Storage used on this device: <b>'+mb(u.used)+'</b> of '+(u.cap?'about '+(u.cap>=1e9?(u.cap/1e9).toFixed(1)+' GB':Math.round(u.cap/1e6)+' MB'):u.idb?'the space this browser allows':'about 5 MB')+' ('+pct+'%)'+(u.por>2e4?'. Portraits: '+mb(u.por):'')+'. Protected from automatic cleanup: <span id="hpers">...</span></span>'+
    (full?'<span class="hbkw">Storage is almost full. Back up, then remove portraits or characters you no longer need.</span>':'')+'</div>'+pwaNote(); }
/* T4 item 27: how to install the app. Hidden once it runs as an installed app */
function pwaNote(){ let st=false; try{ st=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true; }catch(er){} if(st) return '<div class="hbkl"><span>This app is installed on your device.</span></div>';
  return '<div class="hbkl"><span>Install: '+((typeof lateGet("PWA_EV")!=="undefined"&&lateGet("PWA_EV"))?'press Install App on the Home screen, or use the Install command in the search.':'in Chrome or Edge use the install icon in the address bar. In Safari use Share, then Add to Home Screen.')+' An installed app opens faster and works offline.</span></div>'; }
export function homeInfo(){ let q=bkState(), r=q.r, warnH="";
  if(q.warn||q.full) warnH='<div class="hbkl warn" role="status">'+(q.full&&env.__artVig?env.__artVig("state","storage-full",44):"")+'<span class="hbkw">'+(q.full?'Storage is almost full. Back up, then remove portraits or characters you no longer need.':(q.bk.t?'Your last backup is '+q.days+' days old and there are changes since then.':'You have no backup yet. Back up your characters so they are safe if this browser\'s data is cleared.'))+'</span><button type="button" class="hlink" data-hbk="out">Back Up</button><button type="button" class="hlink" data-hbk="info">Details</button></div>';
  return warnH+
    (function(){ const sn=snGet().chars, del=Object.keys(sn).filter((id) =>{ return !r.chars[id]&&sn[id]&&sn[id].length; }); if(!del.length) return "";
      del.sort((a,b) =>{ return (sn[b][0].t||0)-(sn[a][0].t||0); });
      const row=function(id){ const x=sn[id][0], c=cOf(x.C), sub=((c.species||"")+" "+(c.clsLabel||"")).trim();
        return '<li><span class="hdn"><b>'+esc(x.name||c.name||"Character")+'</b><small>'+(sub?esc(sub)+' \u2022 ':'')+'Deleted '+esc(fmtT(x.t).slice(0,10))+'</small></span><button type="button" class="hlink" data-hback="'+id+'">Bring Back</button></li>'; };
      return '<div class="hbin"><button type="button" class="hbinb press" data-hbin="1" aria-expanded="'+(BIN_OPEN?'true':'false')+'" aria-label="Recycle bin, '+del.length+' deleted character'+(del.length===1?'':'s')+'"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/><path d="M10 10v6M14 10v6"/></svg><span class="hbinn">'+del.length+'</span></button>'+
        (BIN_OPEN?'<div class="hbkl hdel"><span class="hdelh">Deleted characters you can bring back:</span><ul>'+del.slice(0,5).map(row).join("")+'</ul>'+(del.length>5?'<details><summary>Show '+(del.length-5)+' older</summary><ul>'+del.slice(5).map(row).join("")+'</ul></details>':'')+'</div>':'')+'</div>'; })(); }
