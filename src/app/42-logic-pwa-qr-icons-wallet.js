import {PWA_BUILD} from "./01-logic-boot-flags-builder-loader.js";import {saveNow} from "./04-logic-storage.js";import {$$,toast,toastPic} from "./05-logic-helpers.js";import {rGet,rSave} from "./14-ui-editor.js";import {impText} from "./16-logic-import-chat-text-and-build-files.js";import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {ICO} from "./29c-data-ddb-icons.js";import {__R} from "./00-reg.js";import {html,raw,render} from "./lib/html.js";import {env} from "./00-env.js";
Object.defineProperty(__R,"PWA_EV",{get:function(){return PWA_EV;},set:function(v){PWA_EV=v;},configurable:true});
Object.defineProperty(__R,"pwaInstH",{get:function(){return pwaInstH;},set:function(v){pwaInstH=v;},configurable:true});
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
