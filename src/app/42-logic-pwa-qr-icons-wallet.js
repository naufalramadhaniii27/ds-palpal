import {PWA_BUILD} from "./01-logic-boot-flags-builder-loader.js";
import {C,S,saveNow} from "./04-logic-storage.js";
import {$$,ask,esc,num,sg,toast,toastPic} from "./05-logic-helpers.js";
import {D,derive} from "./06-logic-derivation.js";
import {REDUCE} from "./07-ui-theme-contrast-spring.js";
import {renderInv} from "./08c-ui-render-inventory-features-notes.js";
import {rGet,rSave} from "./14-ui-editor.js";
import {chFile,chName,chSave,zPack} from "./15-logic-roster-backup-files-snapshots.js";
import {impText} from "./16-logic-import-chat-text-and-build-files.js";
import {moveTabInd,onMode} from "./21-ui-tabs-pager.js";
import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {COINS,coinCp,coinList,coinPay,coinRefresh,coinSet,coinTotal,coinsNow,priceTxt} from "./23c-ui-coins.js";
import {ICO} from "./29-ui-ddb-look.js";
import {toastU,undoMark} from "./32-logic-play-undo-actions.js";
import {__set_bldDot,bldDot} from "./35-ui-combo.js";
import {cuNumList} from "./41-ui-edit-mode.js";
import {__R} from "./00-reg.js";
import {html,raw,render} from "./lib/html.js";import {env} from "./00-env.js";
Object.defineProperty(__R,"PWA_EV",{get:function(){return PWA_EV;},set:function(v){PWA_EV=v;},configurable:true});
Object.defineProperty(__R,"coinsClean",{get:function(){return coinsClean;},set:function(v){coinsClean=v;},configurable:true});
Object.defineProperty(__R,"pwaInstH",{get:function(){return pwaInstH;},set:function(v){pwaInstH=v;},configurable:true});
Object.defineProperty(__R,"qrCan",{get:function(){return qrCan;},set:function(v){qrCan=v;},configurable:true});
Object.defineProperty(__R,"qrScanOpen",{get:function(){return qrScanOpen;},set:function(v){qrScanOpen=v;},configurable:true});
Object.defineProperty(__R,"qrSendOpen",{get:function(){return qrSendOpen;},set:function(v){qrSendOpen=v;},configurable:true});
/* ===== v34 p03 RU82: installable app (manifest, service worker), update toast, open .bs files from the file manager ===== */
let PWA_REG=null, PWA_GO=false;
function pwaUpdToast(w){ let t=document.getElementById("pwaUpd"); if(!t){ t=document.createElement("div"); t.id="pwaUpd"; t.className="toast pwa-upd"; t.setAttribute("role","status"); t.setAttribute("aria-live","polite"); document.body.appendChild(t);
    t.addEventListener("click",(e) =>{ if(e.target.closest("[data-pwalater]")){ t.classList.remove("on"); return; } if(!e.target.closest("[data-pwareload]")) return;
      PWA_GO=true; try{ saveNow(); }catch(er){} try{ const h=document.getElementById("homeV"); if(!h||h.hidden) sessionStorage.setItem("cs-skip","1"); }catch(er){}
      const ww=t.__w||(PWA_REG&&PWA_REG.waiting); if(ww) ww.postMessage({type:"SKIP_WAITING"}); setTimeout(() =>{ __miReload(); },3000); }); }
  t.__w=w; render(html`${raw(toastPic("New version ready.")||ico("ui-redo","tico"))}<span>New version ready.</span><button type="button" class="tundo" data-pwareload="1">${raw(ico("ui-redo"))}Reload</button><button type="button" class="tundo pwa-x" data-pwalater="1" aria-label="Later">${raw(ico("ui-close"))}</button>`,t); t.classList.add("on","act"); }
function pwaInit(){ if(!PWA_BUILD||!/^https?:$/.test(location.protocol)||!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.addEventListener("controllerchange",() =>{ if(PWA_GO) __miReload(); });
  navigator.serviceWorker.register("sw.js").then((reg) =>{ PWA_REG=reg; env.__pwaReg=reg;
    const ready=function(w){ if(w&&navigator.serviceWorker.controller) pwaUpdToast(w); };
    if(reg.waiting) ready(reg.waiting);
    reg.addEventListener("updatefound",() =>{ const w=reg.installing; if(w) w.addEventListener("statechange",() =>{ if(w.state==="installed") ready(w); }); });
    document.addEventListener("visibilitychange",() =>{ if(document.visibilityState==="visible") reg.update().catch(() =>{}); });
    setInterval(() =>{ reg.update().catch(() =>{}); },36e5);
  }).catch((e) =>{ env.__pwaErr=String(e&&e.message||e); }); }
pwaInit();
/* item 6: a .bs file opened from the file manager (installed app, file_handlers) */
if(env.launchQueue&&typeof env.launchQueue.setConsumer==="function"){ env.launchQueue.setConsumer((p) =>{ const fs=p&&p.files||[]; if(!fs.length) return;
  Promise.all(fs.slice(0,1).map((h) =>{ return h.getFile().then((f) =>{ return f.text(); }); })).then((t) =>{ if(t[0]) impText(t[0]); }).catch(() =>{ toast("This file could not be read."); }); }); }
/* v34 temuan: the hidden empty place of a first public visit (ph, v24 p08) is removed when another character opens. After Apply it holds a real
   character, so it stops being a placeholder */
(function(f){ if(typeof f!=="function") return; env.__sheetApply=function(p,note){ const r=f.apply(this,arguments); if(note===false) return r;/* the blank first sheet itself */ try{ const g=rGet(); if(g&&g.chars&&g.chars[g.active]&&g.chars[g.active].ph){ delete g.chars[g.active].ph; rSave(g); } }catch(er){} return r; }; })(env.__sheetApply);
/* install button on Home when the browser offers it (Chrome, Edge). Safari: Share, Add to Home Screen (or File, Add to Dock on a Mac) */
var PWA_EV=null;
function pwaInstH(){ return PWA_EV?'<button type="button" class="btn press pwa-inst" data-pwainst="1">'+ico("ui-plus")+'<span>Install App</span></button>':''; }
function pwaInstSync(){ $$(".happ").forEach((a) =>{ const b=a.querySelector("[data-pwainst]"); if(PWA_EV&&!b) a.insertAdjacentHTML("beforeend",pwaInstH()); else if(!PWA_EV&&b) b.remove(); }); }
env.addEventListener("beforeinstallprompt",(e) =>{ e.preventDefault(); PWA_EV=e; pwaInstSync(); });
env.addEventListener("appinstalled",() =>{ PWA_EV=null; pwaInstSync(); toast("D&D Sheet is installed. Open it from your home screen or app list."); });
document.addEventListener("click",(e) =>{ if(!e.target.closest||!e.target.closest("[data-pwainst]")||!PWA_EV) return; const ev=PWA_EV; try{ ev.prompt(); }catch(er){}
  Promise.resolve(ev.userChoice).then((c) =>{ if(c&&c.outcome==="accepted"){ PWA_EV=null; pwaInstSync(); } else toast("Not installed. You can install it later from here."); },() =>{}); });
env.__pwa=function(){ return {build:PWA_BUILD, reg:!!PWA_REG, ctl:!!(navigator.serviceWorker&&navigator.serviceWorker.controller)}; };
/* ===== v34 p05: QR codes. Send a character to another device without a server ===== */
ICO["ui-qr"]="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM20 14v.01M20 20h.01M17 20h.01M14 20v.01M20 17v.01";
ICO["ui-share"]="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7";
/* v38 p10 icons */
Object.assign(ICO,{"sp-aarakocra":"M20 4C10 4 5 10 5 19M5 19c4-1 8-3 11-8M8 15l5-1M10 11l5-1M13 8l4-.5M5 19l-2 2","sp-bugbear":"M5 9a2.5 2.5 0 1 1 3-3M19 9a2.5 2.5 0 1 0-3-3M5 9c0 7 3 11 7 11s7-4 7-11c-2-3-4-4-7-4S7 6 5 9zM9.5 12v1M14.5 12v1M10 16c1 1 3 1 4 0","sp-centaur":"M17 3.5a1.5 1.5 0 1 0 .01 0M17 6v5M6 13c0-2 2-3 5-3h6c2 0 3 1 3 3v2H8c-1 0-2-1-2-2zM8 15l-1 6M11.5 15v6M15 15v6M18.5 15l.5 6M6 13c-2 0-3 2-3 5","sp-changeling":"M4 8c4-2 12-2 16 0v4c0 4-3 8-8 8s-8-4-8-8zM8 11.5h2M14 11.5h2M9 16c2 1.5 4 1.5 6 0M12 3v3","sp-deep gnome":"M12 2l5 10H7zM5 12h14M9 15h6l-3 6z","sp-duergar":"M4 9h12c0 3 2 4 4 4h-3v3l1 2H8l1-2v-3C6 13 4 11 4 9z","sp-eladrin":"M12 3c5 2 8 7 5 12-2 3-5 4-5 6 0-2-3-3-5-6-3-5 0-10 5-12zM12 6v14M12 11l-2-2M12 14l3-3","sp-fairy":"M12 12C6 12 3 8 4 4c5 0 8 3 8 8zM12 12c6 0 9-4 8-8-5 0-8 3-8 8zM12 12c-5 1-7 5-6 8 4 0 6-3 6-8zM12 12c5 1 7 5 6 8-4 0-6-3-6-8z","sp-firbolg":"M12 21v-7M12 14c-4 0-6-3-5-6 0-3 3-5 5-5s5 2 5 5c1 3-1 6-5 6zM9 11l3 2 3-2","sp-air genasi":"M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3M3 19h7","sp-earth genasi":"M2 20l7-13 4 7 3-4 6 10zM9 7l-2.5 4.5","sp-fire genasi":"M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 1 1 1 3 3 3 0-3-1-5 0-7z","sp-water genasi":"M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13zM9 15a3 3 0 0 0 3 3","sp-githyanki":"M12 2l2 6-2 12-2-12zM7 11h10M12 20v2","sp-githzerai":"M12 3a9 9 0 1 0 .01 0M12 7v5M9 10h6M12 12l-3 5M12 12l3 5","sp-goblin":"M3 8l5 2M21 8l-5 2M7 8c1-2 3-3 5-3s4 1 5 3v5c0 4-2 7-5 7s-5-3-5-7zM9.5 12v1M14.5 12v1M10 16.5h4","sp-harengon":"M9 3c-2 0-3 3-2 7M15 3c2 0 3 3 2 7M7 10c0-2 2-3 5-3s5 1 5 3v4c0 4-2 6-5 6s-5-2-5-6zM10 13v.01M14 13v.01M11 16h2","sp-hobgoblin":"M5 14a7 7 0 0 1 14 0v3H5zM12 3v4M9 17v4M15 17v4M5 14h14","sp-kenku":"M6 19c0-6 2-13 8-14 3 0 5 2 5 5l3 2-3 1c0 5-3 8-8 8zM14 9v.01","sp-kobold":"M7 3l2 6M17 3l-2 6M5 12c0-3 3-4 7-4s7 1 7 4c0 4-3 8-7 8s-7-4-7-8zM9 12.5v.01M15 12.5v.01M10 17h4","sp-lizardfolk":"M12 3c2 0 3 2 3 4l-1 4 1 5c0 2-1 3-1 5M12 3c-2 0-3 2-3 4l1 4-1 5c0 2 1 3 1 5M9 8L5 6M15 8l4-2M9.5 14l-4 2M14.5 14l4 2","sp-minotaur":"M3 4c0 5 3 7 5 7M21 4c0 5-3 7-5 7M8 11h8v4c0 3-2 6-4 6s-4-3-4-6zM10 14v.01M14 14v.01M10.5 18h3","sp-satyr":"M5 8v8M8.5 6v12M12 4v16M15.5 6v12M19 8v8M5 16h14","sp-sea elf":"M12 3v18M6 3v5a6 6 0 0 0 12 0V3M9 21h6","sp-shadar-kai":"M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10zM17 4l.8 1.7 1.7.8-1.7.8L17 9l-.8-1.7-1.7-.8 1.7-.8z","sp-shifter":"M6 4c2 6 2 10 0 16M12 3c2 6 2 12 0 18M18 4c2 6 2 10 0 16","sp-tabaxi":"M5 4l3 4M19 4l-3 4M5 4v8c0 5 3 8 7 8s7-3 7-8V4l-3 4h-8zM9 12v.01M15 12v.01M12 14v2M10 17c1 1 3 1 4 0M2 14h4M18 14h4","sp-tortle":"M12 4a8 8 0 1 0 .01 0M12 8l3.5 2v4L12 16l-3.5-2v-4zM12 4v4M12 16v4M4.5 8.5l4 1.5M19.5 8.5l-4 1.5M4.5 15.5l4-1.5M19.5 15.5l-4-1.5","sp-triton":"M5 15c0-5 4-9 9-9 3 0 5 2 5 5s-2 5-5 5c-2 0-3-1-3-3s1-3 3-3M5 15c0 3 2 5 5 5h5","sp-verdan":"M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 14c0-3 2-5 6-5 0 3-2 5-6 5z","sp-yuan-ti":"M18 5c0 3-8 3-8 7s8 4 8 7M18 5l2-1M18 19h-5l-2 2"});
Object.assign(ICO,{
 "tgt-single":"M12 8a4 4 0 1 0 0.01 0M12 2v3M12 19v3M2 12h3M19 12h3",
 "tgt-multi":"M8 8a3 3 0 1 0 0.01 0M16.5 9a2.5 2.5 0 1 0 0.01 0M2.5 20c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6M14.5 14.5c3-.5 6 1.5 6 5.5",
 "tgt-self":"M12 4a3.5 3.5 0 1 0 0.01 0M5 21c0-4.5 3-7.5 7-7.5s7 3 7 7.5",
 "tgt-touch":"M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4a1.5 1.5 0 0 1 3 0v7M14 10a1.5 1.5 0 0 1 3 0v3.5a6.5 6.5 0 0 1-6.5 6.5H10a6 6 0 0 1-5-3l-1.5-3a1.5 1.5 0 0 1 2.5-1.5L8 14",
 "tgt-point":"M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.5 12 21 12 21zM12 8a2.5 2.5 0 1 0 0.01 0",
 "tgt-object":"M12 3l8 4v10l-8 4-8-4V7zM4 7l8 4 8-4M12 11v10",
 "tgt-wall":"M3 5h18v14H3zM3 9.7h18M3 14.3h18M9 5v4.7M15 9.7v4.6M9 14.3V19",
 "tgt-summon":"M12 3a9 9 0 1 0 0.01 0M12 7l1.5 3.5 3.5 1.5-3.5 1.5L12 17l-1.5-3.5L7 12l3.5-1.5z",
 "tgt-special":"M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z",
 "tgt-sphere":"M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM3 12c3 3.5 15 3.5 18 0",
 "tgt-cube":"M12 2l9 5v10l-9 5-9-5V7zM12 12l9-5M12 12v10M12 12L3 7",
 "tgt-cone":"M3 12l18-9v18zM21 3c-2 3-2 15 0 18",
 "tgt-line":"M2 12h20M2 9v6M22 9v6",
 "tgt-cylinder":"M5 6c0-2.7 14-2.7 14 0v12c0 2.7-14 2.7-14 0zM5 6c0 2.7 14 2.7 14 0",
 "tgt-emanation":"M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18",
 "comp-v":"M4 5h16v11h-8.5L6 20v-4H4zM8 10h8",
 "comp-s":"M7 11V7a2 2 0 0 1 4 0v4M11 9V6a2 2 0 0 1 4 0v5M15 9a2 2 0 0 1 4 0v4a7 7 0 0 1-7 7h-1a6 6 0 0 1-6-6v-2a2 2 0 0 1 4 0",
 "comp-m":"M9 3h6l-1 3h-4zM10 6c-4 2-6 6-6 10a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5c0-4-2-8-6-10",
 "fx-save":"M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6zM8.5 12l2.5 2.5 4.5-5",
 "fx-attack":"M12 3a9 9 0 1 0 0.01 0M12 8a4 4 0 1 0 0.01 0M12 1v3M12 20v3M1 12h3M20 12h3",
 "fx-auto":"M4 12h14M13 6l6 6-6 6",
 "fx-reach":"M3 12h14M13 7l5 5-5 5M21 6v12",
 "ui-uses":"M6 12a2 2 0 1 0 0.01 0M12 12a2 2 0 1 0 0.01 0M18 12a2 2 0 1 0 0.01 0",
 "ui-reset":"M4 12a8 8 0 1 0 3-6.2M4 4v4h4",
 "ui-stealth":"M3 12c3-4.5 6.5-7 9-7s6 2.5 9 7c-3 4.5-6.5 7-9 7s-6-2.5-9-7zM4 4l16 16",
 "ui-cost":"M12 3a9 9 0 1 0 0.01 0M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.2 0-2.2-.6-2.7-1.7M12 6v2M12 16v2",
 "ui-prof":"M12 3l2.5 5 5.5.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.5-.8z"});

ICO["ui-play"]="M8 5v14l11-7z"; ICO["ui-pause"]="M8 5v14M16 5v14";
/* QR generator: byte mode, error correction L or M, versions 1 to 40 (ISO/IEC 18004 tables) */
export var QRG=(function(){
  const ECW={L:[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
           M:[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28]};
  const NB={L:[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],
          M:[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49]};
  const FB={L:1,M:0};
  function rawMods(v){ let r=(16*v+128)*v+64; if(v>=2){ const n=Math.floor(v/7)+2; r-=(25*n-10)*n-55; if(v>=7) r-=36; } return r; }
  function dataCw(v,e){ return Math.floor(rawMods(v)/8)-ECW[e][v]*NB[e][v]; }
  function cap(v,e){ return Math.floor((dataCw(v,e)*8-4-(v<10?8:16))/8); }
  function mul(x,y){ let z=0; for(let i=7;i>=0;i--){ z=((z<<1)^((z>>>7)*0x11D))&255; z^=((y>>>i)&1)*x; } return z; }
  function rsDiv(n){ let r=[],i,j,root=1; for(i=0;i<n-1;i++) r.push(0); r.push(1); for(i=0;i<n;i++){ for(j=0;j<n;j++){ r[j]=mul(r[j],root); if(j+1<n) r[j]^=r[j+1]; } root=mul(root,2); } return r; }
  function rsRem(d,div){ const r=div.map(() =>{ return 0; }); d.forEach((b) =>{ const f=b^r.shift(); r.push(0); for(let i=0;i<div.length;i++) r[i]^=mul(div[i],f); }); return r; }
  function bytesOf(s){ if(typeof TextEncoder!=="undefined") return Array.prototype.slice.call(new TextEncoder().encode(s)); return unescape(encodeURIComponent(s)).split("").map((c) =>{ return c.charCodeAt(0); }); }
  function make(text,e,maxV){ e=e||"M"; maxV=maxV||40; let by=bytesOf(text), v=1; while(v<=maxV&&by.length>cap(v,e)) v++; if(v>maxV) return null;
    let bb=[], i, j; function put(val,len){ for(let q=len-1;q>=0;q--) bb.push((val>>>q)&1); }
    put(4,4); put(by.length,v<10?8:16); by.forEach((b) =>{ put(b,8); });
    const capB=dataCw(v,e)*8; put(0,Math.min(4,capB-bb.length)); put(0,(8-bb.length%8)%8); for(let pad=0xEC; bb.length<capB; pad^=0xEC^0x11) put(pad,8);
    const data=[]; for(i=0;i<bb.length;i+=8){ let x=0; for(j=0;j<8;j++) x=(x<<1)|bb[i+j]; data.push(x); }
    let nb=NB[e][v], el=ECW[e][v], raw=Math.floor(rawMods(v)/8), nShort=nb-raw%nb, sLen=Math.floor(raw/nb), div=rsDiv(el), blocks=[], k=0;
    for(i=0;i<nb;i++){ const dat=data.slice(k,k+sLen-el+(i<nShort?0:1)); k+=dat.length; const ecc=rsRem(dat,div); if(i<nShort) dat.push(0); blocks.push(dat.concat(ecc)); }
    const cw=[]; for(i=0;i<blocks[0].length;i++) for(j=0;j<nb;j++) if(i!==sLen-el||j>=nShort) cw.push(blocks[j][i]);
    const size=v*4+17, M=[], F=[]; for(i=0;i<size;i++){ const a1=[],a2=[]; for(j=0;j<size;j++){ a1.push(false); a2.push(false); } M.push(a1); F.push(a2); }
    function set(x,y,d){ M[y][x]=d; F[y][x]=true; }
    for(i=0;i<size;i++){ set(6,i,i%2===0); set(i,6,i%2===0); }
    function finder(cx,cy){ for(let dy=-4;dy<=4;dy++) for(let dx=-4;dx<=4;dx++){ const d=Math.max(Math.abs(dx),Math.abs(dy)), x=cx+dx, y=cy+dy; if(x>=0&&x<size&&y>=0&&y<size) set(x,y,d!==2&&d!==4); } }
    finder(3,3); finder(size-4,3); finder(3,size-4);
    let al=[]; if(v>1){ const na=Math.floor(v/7)+2, st=v===32?26:Math.ceil((v*4+4)/(na*2-2))*2; al=[6]; for(let p=size-7; al.length<na; p-=st) al.splice(1,0,p); }
    for(i=0;i<al.length;i++) for(j=0;j<al.length;j++){ if((i===0&&j===0)||(i===0&&j===al.length-1)||(i===al.length-1&&j===0)) continue; for(let ay=-2;ay<=2;ay++) for(let ax=-2;ax<=2;ax++) set(al[i]+ax,al[j]+ay,Math.max(Math.abs(ax),Math.abs(ay))!==1); }
    function fmt(m){ let d=FB[e]<<3|m, r=d, q; for(q=0;q<10;q++) r=(r<<1)^((r>>>9)*0x537); const b=(d<<10|r)^0x5412, g=function(t){ return ((b>>>t)&1)!==0; };
      for(q=0;q<=5;q++) set(8,q,g(q)); set(8,7,g(6)); set(8,8,g(7)); set(7,8,g(8)); for(q=9;q<15;q++) set(14-q,8,g(q));
      for(q=0;q<8;q++) set(size-1-q,8,g(q)); for(q=8;q<15;q++) set(8,size-15+q,g(q)); set(8,size-8,true); }
    fmt(0);
    if(v>=7){ let r2=v; for(i=0;i<12;i++) r2=(r2<<1)^((r2>>>11)*0x1F25); const vb=v<<12|r2; for(i=0;i<18;i++){ const bit=((vb>>>i)&1)!==0, va=size-11+i%3, vc=Math.floor(i/3); set(va,vc,bit); set(vc,va,bit); } }
    let bi=0; for(let right=size-1; right>=1; right-=2){ if(right===6) right=5; for(let vert=0; vert<size; vert++) for(j=0;j<2;j++){ const x2=right-j, up=((right+1)&2)===0, y2=up?size-1-vert:vert; if(!F[y2][x2]&&bi<cw.length*8){ M[y2][x2]=((cw[bi>>>3]>>>(7-(bi&7)))&1)!==0; bi++; } } }
    function mk(m,x,y){ switch(m){ case 0: return (x+y)%2===0; case 1: return y%2===0; case 2: return x%3===0; case 3: return (x+y)%3===0; case 4: return (Math.floor(x/3)+Math.floor(y/2))%2===0; case 5: return x*y%2+x*y%3===0; case 6: return (x*y%2+x*y%3)%2===0; default: return ((x+y)%2+x*y%3)%2===0; } }
    function flip(m){ for(let y=0;y<size;y++) for(let x=0;x<size;x++) if(!F[y][x]&&mk(m,x,y)) M[y][x]=!M[y][x]; }
    function lineP(g){ let s=0, run=1, prev=g(0), str="0000", q; for(q=0;q<size;q++){ const c=g(q); str+=c?"1":"0"; if(q>0){ if(c===prev) run++; else { if(run>=5) s+=run-2; run=1; prev=c; } } } if(run>=5) s+=run-2; str+="0000";
      for(let at=str.indexOf("1011101"); at>=0; at=str.indexOf("1011101",at+1)){ if(str.substr(at-4,4)==="0000"||str.substr(at+7,4)==="0000") s+=40; } return s; }
    function pen(){ let s=0, x, y, dark=0; for(y=0;y<size;y++) s+=lineP((q) =>{ return M[y][q]; }); for(x=0;x<size;x++) s+=lineP((q) =>{ return M[q][x]; });
      for(y=0;y<size-1;y++) for(x=0;x<size-1;x++){ const c=M[y][x]; if(c===M[y][x+1]&&c===M[y+1][x]&&c===M[y+1][x+1]) s+=3; }
      for(y=0;y<size;y++) for(x=0;x<size;x++) if(M[y][x]) dark++; s+=10*Math.floor(Math.abs(dark*100/(size*size)-50)/5); return s; }
    let best=0, bp=1e9; for(let m=0;m<8;m++){ flip(m); fmt(m); const pp=pen(); if(pp<bp){ bp=pp; best=m; } flip(m); } flip(best); fmt(best);
    return {size:size, v:v, mask:best, m:M}; }
  function svg(q,label){ let n=q.size+8, d=""; for(let y=0;y<q.size;y++){ let x=0; while(x<q.size){ if(!q.m[y][x]){ x++; continue; } const s=x; while(x<q.size&&q.m[y][x]) x++; d+="M"+(s+4)+" "+(y+4)+"h"+(x-s)+"v1h-"+(x-s)+"z"; } }
    return '<svg class="qr-svg" viewBox="0 0 '+n+' '+n+'" shape-rendering="crispEdges" role="img" aria-label="'+esc(label||"QR code")+'"><rect width="'+n+'" height="'+n+'" fill="#fff"/><path d="'+d+'" fill="#000"/></svg>'; }
  return {make:make, svg:svg, cap:cap};
})();
const QR_ONE=QRG.cap(20,"L"), QR_CH=QRG.cap(15,"L")-20, QR_MAX=40;
function qrHash(s){ let h=0x811c9dc5; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,0x01000193)>>>0; } return h.toString(36); }
/* one code when it fits, else parts "DQ1:<i>/<n>:<hash>:<text>". null: too many parts */
function qrFrames(txt){ if(txt.length<=QR_ONE) return [txt]; const n=Math.ceil(txt.length/QR_CH), h=qrHash(txt), out=[]; if(n>QR_MAX) return null;
  for(let i=0;i<n;i++) out.push("DQ1:"+(i+1)+"/"+n+":"+h+":"+txt.slice(i*QR_CH,(i+1)*QR_CH)); return out; }
env.__qrFrames=qrFrames; env.__qrMake=function(t,e,v){ const q=QRG.make(t,e||"L",v||40); return q?{v:q.v,size:q.size,mask:q.mask,svg:QRG.svg(q)}:null; };
let QRS=null;
function qrStop(){ if(QRS&&QRS.t){ clearInterval(QRS.t); QRS.t=0; } }
function qrSendOpen(id){ const o=chFile(id), raw=JSON.stringify(o), nm=chName(o);
  const show=function(txt){ const old=document.getElementById("qrSend"); if(old) old.remove(); qrStop();
    const fr=qrFrames(txt), w=document.createElement("div"); w.id="qrSend"; w.className="bkp qrd"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","qrT");
    QRS={fr:fr||[], i:0, t:0, cache:{}, txt:txt, nm:nm, play:true}; env.__qrSent=QRS.fr.slice();
    w.innerHTML='<div class="bkpb"><div class="bkph"><b id="qrT">'+ico("ui-qr")+'Send to Another Device</b><button type="button" class="bkpx" data-qrs="close" aria-label="Close">×</button></div>'+
      (fr?'<p>On the other device, open <b>My Characters</b>, <b>Open Character</b>, then <b>Scan Code</b>. Hold this screen in front of its camera'+(fr.length>1?' until it has read all '+fr.length+' parts. They change by themselves.':'.')+'</p>'+
        '<div class="qr-box" id="qrBox"></div>'+(fr.length>1?'<p class="qr-n" id="qrN" aria-live="polite"></p><div class="bkpr qr-ctl"><button type="button" class="btn press" data-qrs="prev" aria-label="Previous part">'+ico("ui-chev-l")+'</button><button type="button" class="btn press" data-qrs="play" id="qrPlay" aria-label="Pause">'+ico("ui-pause")+'<span>Pause</span></button><button type="button" class="btn press" data-qrs="next" aria-label="Next part">'+ico("ui-chev-r")+'</button></div>':'')
        :'<p class="hbkl warn">'+ico("toast-warn")+'This character is too large to send with codes. Share or save the file instead.</p>')+
      '<h4 class="chfh">Or Send the File</h4><p class="muted">A file works on every device: send it in a chat or by mail, then use Open Character on the other device.</p><div class="bkpr">'+
      (navigator.share?'<button type="button" class="btn pri press" data-qrs="share">'+ico("ui-share")+'<span>Share File</span></button>':'')+'<button type="button" class="btn press" data-qrs="save">'+ico("ui-save")+'<span>Save File</span></button></div></div>';
    document.body.appendChild(w); if(fr) qrDraw(); if(fr&&fr.length>1) QRS.t=setInterval(() =>{ if(!document.getElementById("qrSend")){ qrStop(); return; } QRS.i=(QRS.i+1)%QRS.fr.length; qrDraw(); },REDUCE?1400:750);
    const esc1=function(e){ if(e.key==="Escape"&&!document.querySelector(".ask")){ qrStop(); w.remove(); document.removeEventListener("keydown",esc1,true); } }; document.addEventListener("keydown",esc1,true);
    w.addEventListener("click",(e) =>{ if(e.target===w){ qrStop(); w.remove(); return; } const b=e.target.closest("[data-qrs]"); if(!b) return; const a=b.getAttribute("data-qrs");
      if(a==="close"){ qrStop(); w.remove(); return; }
      if(a==="prev"||a==="next"){ qrStop(); QRS.play=false; qrPlayBtn(); QRS.i=(QRS.i+(a==="next"?1:QRS.fr.length-1))%QRS.fr.length; qrDraw(); return; }
      if(a==="play"){ QRS.play=!QRS.play; qrPlayBtn(); if(QRS.play){ QRS.t=setInterval(() =>{ if(!document.getElementById("qrSend")){ qrStop(); return; } QRS.i=(QRS.i+1)%QRS.fr.length; qrDraw(); },REDUCE?1400:750); } else qrStop(); return; }
      if(a==="save"){ chSave(id); return; }
      if(a==="share"){ qrShare(QRS.txt,QRS.nm); } }); };
  zPack(raw).then(show,() =>{ show(raw); }); }
function qrPlayBtn(){ const b=document.getElementById("qrPlay"); if(b){ render(html`${raw(ico(QRS.play?"ui-pause":"ui-play"))}<span>${QRS.play?"Pause":"Play"}</span>`,b); b.setAttribute("aria-label",QRS.play?"Pause":"Play"); } }
function qrDraw(){ const box=document.getElementById("qrBox"); if(!box||!QRS) return; let i=QRS.i, s=QRS.cache[i]; if(!s){ const q=QRG.make(QRS.fr[i],"L",40); s=QRS.cache[i]=q?QRG.svg(q,"Code "+(i+1)+" of "+QRS.fr.length):""; }
  box.innerHTML=s; box.setAttribute("data-i",String(i)); const n=document.getElementById("qrN"); if(n) n.textContent="Part "+(i+1)+" of "+QRS.fr.length; }
function qrShare(txt,nm){ let f=null, f2=null, d=null; try{ f=new File([txt],nm,{type:"application/octet-stream"}); f2=new File([txt],nm.replace(/\.bs$/,"")+".txt",{type:"text/plain"}); }catch(e){}
  if(f&&navigator.canShare&&navigator.canShare({files:[f]})) d={files:[f],title:nm}; else if(f2&&navigator.canShare&&navigator.canShare({files:[f2]})) d={files:[f2],title:nm}; else d={title:nm,text:txt};
  navigator.share(d).then(() =>{ toast("Shared: "+nm); },(e) =>{ if(e&&e.name==="AbortError") return; toast("Sharing did not work here. Use Save Character."); }); }
/* receive: camera + BarcodeDetector (Chrome on Android and Mac, Safari 17 on Mac). Elsewhere paste the text */
function qrCan(){ return typeof env.BarcodeDetector==="function"&&!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia); }
let QRR=null;
function qrScanStop(){ if(!QRR) return; clearInterval(QRR.t); try{ (QRR.st&&QRR.st.getTracks()||[]).forEach((t) =>{ t.stop(); }); }catch(e){} env.__qrStream=QRR.st; QRR=null; const w=document.getElementById("qrScan"); if(w) w.remove(); }
function qrScanOpen(){ if(!qrCan()){ toast("This browser cannot read codes. Paste the text instead."); return; } qrScanStop();
  const w=document.createElement("div"); w.id="qrScan"; w.className="bkp qrd"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","qrST");
  w.innerHTML='<div class="bkpb"><div class="bkph"><b id="qrST">'+ico("ui-camera")+'Scan Code</b><button type="button" class="bkpx" data-qrr="close" aria-label="Close">×</button></div><div class="qr-cam"><video id="qrVid" playsinline muted autoplay></video></div><p class="qr-n" id="qrRN" aria-live="polite">Starting the camera...</p><div class="qr-pg" id="qrPg"></div><div class="bkpr"><button type="button" class="btn press" data-qrr="close">'+ico("ui-close")+'<span>Cancel</span></button></div></div>';
  document.body.appendChild(w); QRR={parts:{}, n:0, h:"", t:0, st:null, busy:false};
  const R=QRR, msg=function(t){ const e=document.getElementById("qrRN"); if(e) e.textContent=t; };
  w.addEventListener("click",(e) =>{ if(e.target===w||e.target.closest("[data-qrr]")) qrScanStop(); });
  const esc1=function(e){ if(e.key==="Escape"&&document.getElementById("qrScan")){ e.stopPropagation(); qrScanStop(); document.removeEventListener("keydown",esc1,true); } }; document.addEventListener("keydown",esc1,true);
  let det=null; try{ det=new env.BarcodeDetector({formats:["qr_code"]}); }catch(e){ msg("This browser cannot read codes. Paste the text instead."); return; }
  navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false}).then((st) =>{ if(QRR!==R){ st.getTracks().forEach((t) =>{ t.stop(); }); return; } R.st=st; env.__qrStream=st; const v=document.getElementById("qrVid"); v.srcObject=st; try{ v.play(); }catch(e){} msg("Point the camera at the code on the other device.");
    R.t=setInterval(() =>{ if(QRR!==R||R.busy) return; R.busy=true; det.detect(v).then((L) =>{ R.busy=false; (L||[]).forEach((c) =>{ qrGot(R,String(c.rawValue||"")); }); },() =>{ R.busy=false; }); },150);
  },(e) =>{ msg(e&&e.name==="NotAllowedError"?"The camera is blocked. Allow it in the browser, or paste the text instead.":"No camera found. Paste the text instead."); }); }
function qrGot(R,raw){ if(!raw||QRR!==R) return; const msg=function(t){ const e=document.getElementById("qrRN"); if(e) e.textContent=t; };
  if(/^DND24Z1:|^\s*\{/.test(raw)){ qrDone(raw); return; }
  const m=/^DQ1:(\d+)\/(\d+):([a-z0-9]+):([\s\S]*)$/.exec(raw); if(!m){ msg("This code is not a character from this app."); return; }
  const i=+m[1], n=+m[2]; if(!n||i<1||i>n||n>QR_MAX) return; if(R.h!==m[3]){ R.h=m[3]; R.n=n; R.parts={}; }
  R.parts[i]=m[4]; const got=Object.keys(R.parts).length; msg("Parts read: "+got+" of "+n+". Keep the camera on the code.");
  const pg=document.getElementById("qrPg"); if(pg) render(html`${Array.from({length:n},(_,i) => html`<i class="${R.parts[i+1]!=null?"on":""}"></i>`)}`,pg);
  if(got===n){ let t=""; for(let k=1;k<=n;k++) t+=R.parts[k]; if(qrHash(t)!==R.h){ R.parts={}; msg("The parts did not match. Scan again from the first part."); return; } qrDone(t); } }
function qrDone(t){ qrScanStop(); const b=document.getElementById("bkp"); if(b) b.remove(); toast("Code read. Opening the character..."); impText(t); }
env.__qrScanOpen=qrScanOpen;
/* ===== v34 p06: one wallet for the sheet and the builder ===== */
function coinsClean(c){ const o={}; COINS.forEach((k) =>{ const v=Math.floor(num(c&&c[k[0]],0)); o[k[0]]=v>0?v:0; }); return o; }
function coinsSame(a,b){ return COINS.every((k) =>{ return num(a[k[0]],0)===num(b[k[0]],0); }); }
env.__coinsGet=function(){ return coinsNow(); };
env.__coinsGp=function(){ return num(C.gp,0); };
env.__coinPay=function(c,cp){ return coinPay(c,cp); }; env.__coinCp=function(c){ return coinCp(c); }; env.__coinList=function(o){ return coinList(o); }; env.__priceTxt=function(g){ return priceTxt(g); };
env.__coinsPut=function(c,why){ const o=coinsClean(c); if(coinsSame(o,coinsNow())) return coinsNow(); undoMark(why||"Coins"); coinSet(o); try{ renderInv(); coinRefresh(); }catch(e){} return coinsNow(); };
/* coins a build brought (new character, build file): to the sheet after Apply. The sheet already has other coins: ask */
env.__coinsPending=function(c){ const o=coinsClean(c), cur=coinsNow(), f=function(k){ return COINS.map((x) =>{ return num(k[x[0]],0)+" "+x[0]; }).filter((s) =>{ return !/^0 /.test(s); }).join(", ")||"no coins"; };
  if(!S.coins||coinsSame(o,cur)||coinTotal(cur)===num(C.gp,0)&&!cur.pp&&!cur.ep&&!cur.sp&&!cur.cp){ coinSet(o); try{ renderInv(); }catch(e){} return true; }
  ask("The builder has coins for this character ("+f(o)+") and the sheet has other coins ("+f(cur)+"). Use the coins from the builder? Cancel keeps the sheet's coins.","Use Builder Coins",() =>{ undoMark("Coins from the builder"); coinSet(o); try{ renderInv(); }catch(e){} toastU("Coins set from the builder."); }); return false; };
env.__sheetOwnNums=function(){ const L=[]; try{ derive(); }catch(e){} if(typeof cuNumList==="function"&&cuNumList().length) L.push(cuNumList().length+" number"+(cuNumList().length>1?"s":"")+" set in Edit mode"); if(num(S.hpMod,0)) L.push("Max HP modifier "+sg(num(S.hpMod,0))); return L.length?{ac:D.ac,hp:D.hpmax,what:L}:null; };
let BPD_T=0;
function bldPend(){ clearTimeout(BPD_T); BPD_T=setTimeout(() =>{ const b=document.getElementById("bldBtn"); if(!b) return; let L=[]; try{ L=env.__bldDiff?(env.__bldDiff(C)||[]):[]; }catch(e){ L=[]; }
  let on=L.length>0, m=b.querySelector(".bpend"); b.classList.toggle("pend",on); env.__bldPendList=L;
  if(on&&!m){ m=document.createElement("i"); m.className="bpend"; m.setAttribute("aria-hidden","true"); b.appendChild(m); } else if(!on&&m) m.remove();
  if(on){ b.setAttribute("aria-description","The builder and the sheet differ"); b.title="The builder and the sheet differ: "+L.slice(0,3).join(". ")+(L.length>3?"...":""); } else if(b.hasAttribute("aria-description")) b.removeAttribute("aria-description"); },250); }
__set_bldDot((function(f){ return function(){ const r=f.apply(this,arguments); bldPend(); return r; }; })(bldDot)); if(env.__bldDot) env.__bldDot=bldDot;
document.addEventListener("bldready",() =>{ bldPend(); if(env.__sp14Set&&C&&C.rs==="2014"&&(document.getElementById("bld")||{hidden:true}).hidden)env.__sp14Set(true);/* v92 */ });
onMode();
if(document.fonts && document.fonts.ready) document.fonts.ready.then(() =>{ moveTabInd(true); });
