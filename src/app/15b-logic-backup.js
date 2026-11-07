import {bindLive,bkpCamp,ico,impText,lateGet,qrCan,qrScanOpen,rEnsure,rGet} from "./00a-reg-late-ports.js";/* Responsibility: backup of all characters (make, check, restore) and its screen. Split out of the former single file 15 in SOLID stage 9 (S); runs in the same order as before. */
import {copyText} from "./lib/clipboard.js";import {APP_VER,C,CKEY,FROZEN,KEY,S,cSaveT,saveT} from "./04-logic-storage.js";import {esc,toast} from "./05-logic-helpers.js";import {rSnap} from "./15-logic-roster-backup-files-snapshots.js";import {askPersist,bkMark,dlFile,persistShow,techInfo,zPack} from "./15c-logic-file-state-compress.js";import {snTake} from "./15d-logic-snapshots-character-files.js";
bindLive("bkpKeyOk",{get:function(){return bkpKeyOk;}});
bindLive("bkpName",{get:function(){return bkpName;}});
bindLive("bkpOpen",{get:function(){return bkpOpen;}});
const BKP_KEYS=["cs-roster-v1","phb24-builder-v1","phb24-builder-v1-bak","yudhi-kelapa-build-v3","yudhi-kelapa-sheet-v1"];
export function bkpKeyOk(k){ return BKP_KEYS.indexOf(k)>=0||/^(cs-roster-|cs-char-|phb24-|yudhi-kelapa-)/.test(k); }
function bkpKeys(){ const o=BKP_KEYS.slice(); try{ for(let i=0;i<__store.length;i++){ const k=__store.key(i); if(bkpKeyOk(k)&&o.indexOf(k)<0) o.push(k); } }catch(e){} return o; }
export function bkpMake(){ let rr=null; try{ rr=rSnap(rEnsure()); }catch(e){} let d={}; bkpKeys().forEach((k) =>{ let v=null; try{ v=__store.getItem(k); }catch(e){} d[k]=v; });
  /* v18 RU61: the open character comes from memory, so a backup made while storage is full still holds the latest changes */
  if(!FROZEN&&C&&S){ d[CKEY]=JSON.stringify(C); d[KEY]=JSON.stringify(S); if(rr&&rr.chars&&rr.chars[rr.active]){ const e=rr.chars[rr.active]; e.C=d[CKEY]; e.S=d[KEY]; e.B=d[lateGet("BKEY")]==null?null:d[lateGet("BKEY")]; d[lateGet("RKEY")]=JSON.stringify(rr); } }
  d=bkpCamp(d);/* v27 RU64: one campaign */ let r=rGet()||{chars:{}}; try{ r=JSON.parse(d[lateGet("RKEY")])||r; }catch(e){} return {app:"dnd2024-sheet-builder",kind:"backup",version:1,appVer:APP_VER,created:new Date().toISOString(),characters:Object.keys(r.chars||{}).length,keys:d}; }
export function bkpCheck(o){ if(!o||typeof o!=="object"||o.kind!=="backup"||!o.keys||typeof o.keys!=="object"||Array.isArray(o.keys)) return "This is not a character backup from this app.";
  const ks=Object.keys(o.keys); if(!ks.length) return "The backup is empty.";
  for(let i=0;i<ks.length;i++){ const k=ks[i], v=o.keys[k]; if(!bkpKeyOk(k)) return "The backup has an entry this app does not use: "+k+".";
    if(v!==null&&typeof v!=="string") return "The backup entry "+k+" is damaged."; if(v!==null){ try{ JSON.parse(v); }catch(e){ return "The backup entry "+k+" is damaged."; } } }
  let r=o.keys["cs-roster-v1"]; if(r){ try{ r=JSON.parse(r); }catch(e){ r=null; } if(!r||!r.chars||typeof r.chars!=="object"||Array.isArray(r.chars)) return "The character list in the backup is damaged.";
    const ids=Object.keys(r.chars); for(let j=0;j<ids.length;j++){ const ch=r.chars[ids[j]]; if(!ch||typeof ch!=="object") return "A character in the backup is damaged.";
      const fs=["B","C","S"]; for(let q=0;q<3;q++){ const x=ch[fs[q]]; if(x!=null){ if(typeof x!=="string") return "Character "+(ch.name||ids[j])+" in the backup is damaged."; try{ const y=JSON.parse(x); if(y!==null&&typeof y!=="object") throw 0; if(fs[q]==="C"&&y&&!y.abilities&&y.name==null) throw 0; }catch(e){ return "Character "+(ch.name||ids[j])+" in the backup is damaged."; } } } }
    if(r.active!=null&&!r.chars[r.active]) return "The character list in the backup is damaged."; }
  return ""; }
export function bkpCount(o){ try{ return Object.keys(JSON.parse(o.keys["cs-roster-v1"]).chars).length; }catch(e){ return o.keys["yudhi-kelapa-build-v3"]?1:0; } }
export function bkpRestore(o){ const r0=rGet(); if(r0&&r0.chars) Object.keys(r0.chars).forEach((id) =>{ snTake(id,"Before Restore",r0); });/* v18 RU48 (d) */ clearTimeout(cSaveT); clearTimeout(saveT); const keys=bkpKeys(), old={}; keys.forEach((k) =>{ try{ old[k]=__store.getItem(k); }catch(e){ old[k]=null; } });
  try{ keys.forEach((k) =>{ if(!(k in o.keys)) __store.removeItem(k); }); Object.keys(o.keys).forEach((k) =>{ if(o.keys[k]==null) __store.removeItem(k); else __store.setItem(k,o.keys[k]); }); }
  catch(e){ keys.forEach((k) =>{ try{ if(old[k]==null) __store.removeItem(k); else __store.setItem(k,old[k]); }catch(e2){} }); toast("Restore failed: this device is out of storage space. Nothing was changed."); return; }/* V14-10: all or nothing */
  sessionStorage.setItem("cs-skip","0"); __miReload(); }
function bkpRead(txt){ impText(txt); }
function bkpName(){ const d=new Date(), p=function(x){return (x<10?"0":"")+x}; return "dnd-characters-"+d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+".bs"; }
/* v22 RU79: files of this app (.bs) hold packed text. Without CompressionStream the plain text goes in */
export function packOut(txt,cb){ zPack(txt).then(cb,() =>{ cb(txt); }); }
/* v14 Backup/Restore dialog. v18: Open Character (mode "open"), packed text, backup date, persistent storage request */
export function bkpOpen(mode){ const old=document.getElementById("bkp"); if(old) old.remove(); const w=document.createElement("div"); w.id="bkp"; w.className="bkp"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true");
  const txt=mode==="out"?JSON.stringify(bkpMake()):"", n=mode==="out"?bkpCount(JSON.parse(txt)):0; if(mode==="out") askPersist();
  const ttl={out:"Back Up Characters","in":"Restore Characters",open:"Open Character",info:"Settings"}[mode]||"Restore Characters"; w.setAttribute("aria-labelledby","bkpT");
  w.innerHTML='<div class="bkpb"><div class="bkph"><b id="bkpT">'+ttl+'</b><button type="button" class="bkpx" data-bkp="close" aria-label="Close">×</button></div>'+
   (mode==="info"?'<h3 class="bkpsec">Backup and Storage</h3>'+techInfo()+'<div class="bkpr"><button type="button" class="btn pri press" data-bkp="goout">Back Up</button><button type="button" class="btn press" data-bkp="goin">Restore</button></div>':mode==="out"?'<p>Save '+(lateGet("homeCamp")?'the '+n+' character'+(n===1?'':'s')+(lateGet("homeCamp")==="-"?' with no campaign':' of the campaign '+esc(lateGet("homeCamp"))):(n===1?'your character':'all '+n+' characters'))+' on this device (builds, sheets, HP, notes, and themes) in one file. Keep it somewhere safe, then use Restore on any device to bring them back.</p>'+
     '<div class="bkpr"><button type="button" class="btn pri press" data-bkp="dl">Download File</button><button type="button" class="btn press" data-bkp="show">Show as Text</button></div>'+
     '<div class="bkpt" hidden><p class="muted">If the download does not start (some embedded viewers block files), copy this text and keep it in a note or chat. Restore accepts it as it is.</p><textarea id="bkpZ" readonly spellcheck="false">Packing...</textarea><div class="bkpr"><button type="button" class="btn press" data-bkp="copyz">Copy Packed Text</button></div>'+
     '<details class="bkpd"><summary>Plain text (longer, can be saved as a .json file)</summary><textarea id="bkpTxt" readonly spellcheck="false">'+esc(txt)+'</textarea><div class="bkpr"><button type="button" class="btn press" data-bkp="copy">Copy Text</button></div></details></div>'
   :(mode==="open"?'<p>Choose a character file (.bs, or an older .dnd24.json) made with Save Character, or a build file. The character is added to this device. The characters already here stay.</p>':'<p>Load a backup file made with Back Up, or a character file made with Save Character. You will choose whether to add the characters or replace the ones on this device.</p>')+
     '<div class="bkpr"><label class="btn pri press bkpf">Choose File<input type="file" id="bkpFile" hidden></label>'+(mode==="open"&&qrCan()?'<button type="button" class="btn press" data-bkp="scan">'+ico("ui-camera")+'<span>Scan Code</span></button>':'')+'</div>'+
     (mode==="open"&&!qrCan()?'<p class="muted qr-no">'+ico("ui-info")+'<span>Scanning a code from another device needs a browser that reads codes (Chrome on Android or a Mac). Here, paste the text instead: on the other device use File, Show as Text.</span></p>':'')+
     '<p class="muted">Or paste the text here (plain or packed):</p><textarea id="bkpIn" spellcheck="false" placeholder="Paste backup, character, or build text"></textarea><div class="bkpr"><button type="button" class="btn press" data-bkp="paste">'+(mode==="open"?'Open from Text':'Restore from Text')+'</button></div>')+'</div>';
  document.body.appendChild(w);
  const esc1=function(e){ if(e.key==="Escape"&&!document.querySelector(".ask")){ w.remove(); document.removeEventListener("keydown",esc1,true); } }; document.addEventListener("keydown",esc1,true);/* V14-11 */
  if(mode==="info") persistShow();
  let packed=null; if(mode==="out") zPack(txt).then((z) =>{ packed=z; const a=document.getElementById("bkpZ"); if(a) a.value=z; },() =>{ packed=txt; const a=document.getElementById("bkpZ"); if(a) a.value=txt; });
  const copy=function(t,el){ bkMark(); copyText(t,el).then((ok) =>{ toast(ok?"Backup text copied":"Select the text and copy it"); }); };
  w.addEventListener("click",(e) =>{ const b=e.target.closest("[data-bkp]"); if(e.target===w){ w.remove(); return; } if(!b) return; const a=b.getAttribute("data-bkp");
    if(a==="close"){ w.remove(); return; }
    if(a==="goout"||a==="goin"){ w.remove(); bkpOpen(a==="goout"?"out":"in"); return; }
    if(a==="dl"){ packOut(txt,(pt) =>{ dlFile(pt,bkpName(),(ok) =>{ if(ok){ bkMark(); toast("Download started: "+bkpName()+". No file? Use the text below."); } else toast("Download is blocked here. Use Show as Text."); }); }); w.querySelector(".bkpt").hidden=false; return; }
    if(a==="show"){ w.querySelector(".bkpt").hidden=false; bkMark(); const ta=document.getElementById("bkpZ"); ta.focus(); ta.select(); return; }
    if(a==="copy"){ copy(txt,document.getElementById("bkpTxt")); return; }
    if(a==="copyz"){ copy(packed||txt,document.getElementById("bkpZ")); return; }
    if(a==="scan"){ qrScanOpen(); return; }/* v34 item 5 */
    if(a==="paste"){ const v=document.getElementById("bkpIn").value.trim(); if(!v){ toast("Paste the backup text first."); return; } impText(v); return; } });
  const f=document.getElementById("bkpFile"); if(f) f.addEventListener("change",() =>{ const fl=f.files&&f.files[0]; if(!fl) return; const rd=new FileReader(); rd.onload=function(){ impText(String(rd.result||"")); f.value=""; }; rd.onerror=function(){ toast("This file could not be read."); }; rd.readAsText(fl); });
}
