import {PUBLIC_BUILD} from "./01-logic-boot-flags-builder-loader.js";
import {APP_VER,C,CKEY,DEF,FROZEN,KEY,S,SPEND,S_BASE,S_RAW,__set_C,__set_FROZEN,__set_S,__set_S_BASE,__set_S_RAW,__set_cSaveT,__set_saveT,cSaveT,loadC,loadS,lsGet,mergeS,newerApp,save,saveC,saveT} from "./04-logic-storage.js";
import {$,ask,clamp,num,toast} from "./05-logic-helpers.js";
import {D,__set_D,derive} from "./06-logic-derivation.js";
import {applyLook} from "./07-ui-theme-contrast-spring.js";
import {__set_actF,actF,campName,renderActions,renderNotes} from "./08-ui-render-sheet-and-actions.js";
import {refreshEntry,sheet} from "./12-ui-bottom-sheet-modal.js";
import {BKEY,RKEY,rEnsure,rGet,rSave} from "./14-ui-editor.js";
import {bkpKeyOk,homeCards,rLoad,rSnap,showHome,snGet,snTake,updUnsaved} from "./15-logic-roster-backup-files-snapshots.js";
import {wnBanner} from "./16-logic-import-chat-text-and-build-files.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"MYID",{get:function(){return MYID;},set:function(v){MYID=v;},configurable:true});
Object.defineProperty(__R,"PUBLIC_FRESH",{get:function(){return PUBLIC_FRESH;},set:function(v){PUBLIC_FRESH=v;},configurable:true});
Object.defineProperty(__R,"WN_FROM",{get:function(){return WN_FROM;},set:function(v){WN_FROM=v;},configurable:true});
Object.defineProperty(__R,"WN_SHOW",{get:function(){return WN_SHOW;},set:function(v){WN_SHOW=v;},configurable:true});
Object.defineProperty(__R,"bcPost",{get:function(){return bcPost;},set:function(v){bcPost=v;},configurable:true});
/* v18 RU74: the same app open in two tabs. A change saved in the other tab is loaded here at once, so a later save here does not undo it.
   If the other tab opened a different character, the shared slots now hold that character: this tab pauses (FROZEN "stale") and asks for a reload */
export var MYID=(function(){ let r=null; try{ r=JSON.parse(lsGet(RKEY)||"null"); }catch(e){} return r&&r.active||""; })();
var HAD_ROSTER=lsGet("cs-roster-v1")!=null, WN_SHOW=false, WN_FROM=0;
var PUBLIC_FRESH=PUBLIC_BUILD&&!HAD_ROSTER&&lsGet(CKEY)==null;/* v24 p08: a blank sheet instead of the sample */ if(PUBLIC_FRESH) window.__publicFresh=1;
function startup(r){ const wv=+lsGet("cs-ui-ver")||0;
  /* v18 RU59: "What's new" once after an update. A first visit (no characters saved yet) starts at this version without it */
  if(!wv&&!HAD_ROSTER){ try{ __store.setItem("cs-ui-ver",String(APP_VER)); }catch(e){} } else { WN_SHOW=wv<APP_VER; WN_FROM=wv||APP_VER-1; if(WN_SHOW) try{ __store.setItem("cs-ui-ver",String(APP_VER)); }catch(e){} }
  if(WN_SHOW){ const w=document.getElementById("homeV"); if(w&&!w.hidden){ const p=w.querySelector(".hslots"); if(p&&!document.getElementById("hwnB")) p.insertAdjacentHTML("afterend",wnBanner()); } }
  /* RL47: data written by a newer version */
  if(newerApp(C)||newerApp(S)||newerApp(r)) toast("Some data was saved by a newer version of this app. This version keeps the parts it does not know.");
  /* v18 RU48 (d): a daily copy of the open character */
  if(lsGet(CKEY)!=null){ const L=(snGet().chars[r.active]||[]); if(!L.length||Date.now()-L[0].t>864e5) snTake(r.active,"Daily copy",r); }
  updUnsaved(); }
function stale(){ if(FROZEN) return; __set_FROZEN("stale"); clearTimeout(saveT); clearTimeout(cSaveT); const w=document.createElement("div"); w.id="staleV"; w.className="bkp"; w.setAttribute("role","alertdialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","staleT");
  w.innerHTML='<div class="bkpb"><div class="bkph"><b id="staleT">Paused: open in another tab</b></div><p>This app is open in another tab, and that tab switched to a different character. To keep that character safe, this tab saves nothing until you reload it.</p><div class="bkpr"><button type="button" class="btn pri press" data-stale="1">Reload</button></div></div>';
  w.addEventListener("click",(e) =>{ if(e.target.closest("[data-stale]")){ sessionStorage.setItem("cs-skip","1"); __miReload(); } }); document.body.appendChild(w); }
/* v32 p32 RU131: BroadcastChannel next to the storage event */
let TABID=Math.random().toString(36).slice(2), BC=null, EXT_LAST={};
try{ if(typeof BroadcastChannel==="function"){ BC=new BroadcastChannel("cs-sync"); BC.onmessage=function(m){ const d=m&&m.data; if(!d||d.from===TABID||!d.k) return; extChange(d.k,"bc"); }; } }catch(e){ BC=null; }
function bcPost(k){ if(!BC) return; try{ if(bkpKeyOk(k)) BC.postMessage({k:k,from:TABID}); }catch(e){} }
window.__bcOn=function(){ return !!BC; };
window.addEventListener("storage",(e) =>{ extChange(e.key,"st"); });
function extChange(key,via){ if(FROZEN||!key||!bkpKeyOk(key)) return; const raw=lsGet(key); if(EXT_LAST[key]===raw) return; EXT_LAST[key]=raw; const e={key:key};
  if(key===CKEY||key===KEY){ EXT_LAST[key===KEY?CKEY:KEY]=lsGet(key===KEY?CKEY:KEY); }
  let r=null; try{ r=JSON.parse(lsGet(RKEY)||"null"); }catch(er){} if(r&&r.active&&MYID&&r.active!==MYID){ stale(); return; }
  if(e.key===CKEY||e.key===KEY){ let c2=loadC(true), s2=loadS(true); if(!c2||!s2) return; const pend=!!saveT||SPEND, pendC=!!cSaveT; clearTimeout(saveT); clearTimeout(cSaveT); __set_saveT(null); __set_cSaveT(null);
    /* V18-2: a change made here in the last 150 ms is not thrown away: fields changed here since the last save are laid over the other tab's data */
    const remoteN=JSON.stringify(s2); if(pend) s2=mergeS(s2);
    if(pendC) c2=C; __set_C(c2); __set_S(s2); __set_S_BASE(remoteN); __set_S_RAW(lsGet(KEY)); if(pend) save(); if(pendC) saveC();
    try{ applyLook(); __R.renderAll(true); renderNotes(); __R.syncPortrait(); }catch(er){} if(sheet&&sheet.classList&&sheet.classList.contains("on")){ try{ refreshEntry(); }catch(er){} } return; }
  if(e.key===BKEY&&window.__bldReload){ window.__bldReload(); return; }
  if(e.key===RKEY){ const w=document.getElementById("homeV"); if(w&&!w.hidden){ const g=document.getElementById("hgrid"); if(g) g.innerHTML=homeCards(true); } } }
document.getElementById("rosterBtn").addEventListener("click",showHome);
setTimeout(() =>{if(FROZEN)return;const r=rEnsure();Object.keys(r.chars).forEach((id) =>{if(!r.chars[id].created)r.chars[id].created=r.chars[id].t||Date.now()});rSave(r);MYID=r.active;startup(r);if(sessionStorage.getItem("cs-skip")==="1"){sessionStorage.removeItem("cs-skip");const ce=__store.getItem("cs-edit"),cn=__store.getItem("cs-new");if(ce)__store.removeItem("cs-edit");if(ce||cn){let tries=0,st=function(){(function go(){if(!window.__bldOpen&&window.__bldNeed)window.__bldNeed();if(cn&&!ce)return;if(window.__bldOpen)window.__bldOpen();else if(tries++<100)setTimeout(go,50)})()};/* v100: one frame first, so the message is on screen before the builder loads */if(window.requestAnimationFrame)requestAnimationFrame(() =>{setTimeout(st,0)});else setTimeout(st,30)}return}/* V18-7: the builder script may load after this timer */showHome()},0);
/* V14-4: Apply keeps the game state (HANDOFF section 6). Damage taken stays the same when Hit Point maximum changes, used boxes stay (used() clamps to the new maximum) */
/* v18 RL47: a sheet written by a newer version keeps the fields this version does not produce */
function keepNewer(p){ if(newerApp(C)) Object.keys(C).forEach((k) =>{ if(!(k in p)) p[k]=C[k]; }); return p; }
window.__idNoArt=function(){ try{ return __store.getItem("mi-clsart")==="off"; }catch(e){ return false; } };/* T10 */
window.__sheetCamp=function(){ return campName(); };
/* T11 G6 B6: the builder edits Identity and Appearance of the open character. Same fields as the Description tab (S.align, S.notes) */
window.__sheetIdent=function(){ const n=(S&&S.notes)||{}, o={align:(S&&S.align)||""}; ["personality","ideal","bond","flaw","backstory","appearance","ch_gender","ch_age","ch_height","ch_weight","ch_eyes","ch_hair","ch_skin","ch_faith"].forEach((k) =>{ o[k]=n[k]||""; }); return o; };
window.__sheetPortrait=function(){ return (S&&S.portrait)||""; };/* T11 G6 B7: the builder makes a round token from it */
window.__sheetIdentSet=function(k,v){ if(FROZEN||!S) return false; if(k==="align") S.align=String(v||""); else if(/^(personality|ideal|bond|flaw|backstory|appearance|ch_(gender|age|height|weight|eyes|hair|skin|faith))$/.test(k)){ S.notes=S.notes||{}; S.notes[k]=String(v||""); } else return false; save(); return true; };/* T10: the builder shows the sheet's campaign */
window.__sheetApply=function(p,note){ if(!p||!p.abilities) return; if(lsGet(CKEY)!=null) snTake(MYID||(rGet()||{}).active,"Before Apply from the builder");/* v18 RU48 (d) */ const om=(D&&D.hpmax)||0, oh=S.hp; __set_C(keepNewer(p)); if(Array.isArray(p.lang)&&p.lang.length){ S.lang=p.lang.slice(); save(); } if(typeof p.camp==="string"&&p.camp.trim()){ S.camp=p.camp.trim(); save(); }/* T10: campaign typed in the builder */
  if(oh!=null&&om){ try{ derive(); S.hp=clamp(oh+(D.hpmax-om),0,D.hpmax); }catch(er){ S.hp=null; } } else S.hp=null; if(!S.used) S.used={}; save(); saveC(); __R.renderAll(); renderNotes(); const gq=S.coins?num(S.coins.gp,0)+num(C.gp,0)-num(S.coinBase,num(C.gp,0)):0; if(note!==false) toast(gq<0?"Sheet updated. Starting gold is now lower than the gold you spent, so Gold shows 0.":note||"Sheet updated from builder"); };/* v24 p08: quiet for the blank first sheet */
window.__sheetName=function(){ return C&&C.name; };window.__ask=ask;/* T10: test hook, opens the confirm dialog with any text */
window.__sheetRerender=function(){ __R.renderAll(); };
window.__sheetSoft=function(p){ if(!p||!p.abilities) return; __set_C(keepNewer(p)); saveC(); __R.renderAll(); };
window.__sheetState=function(){ return {C:C, lang:S.lang, camp:campName()}; };
window.__D=function(){ return D; };/* T11 N6: derive a sheet object without saving. The open character and its state come back afterwards */
window.__deriveFor=function(c){ let C0=C, S0=S, D0=D, out=null; try{ __set_C(JSON.parse(JSON.stringify(c))); __set_S(JSON.parse(JSON.stringify(DEF))); derive(); out=JSON.parse(JSON.stringify({level:D.level,pb:D.pb,ac:D.ac,hpmax:D.hpmax,init:D.init,dc:D.dc,speed:D.speed,score:D.score,mod:D.mod,save:D.save,skill:D.skill,atk:D.atk,res:D.res,carry:D.carry})); }catch(e){ out={err:String(e&&e.stack||e)}; } __set_C(C0); __set_S(S0); __set_D(D0); try{ derive(); }catch(e){} return out; };/* v35 p05 */
/* v32 RL51 test hook: the Actions tab of another C (from __bldSheetFor) without saving it: entries per category and attack rows. The sheet is restored */
window.__actProbe=function(C2){ let C0=C, S0=JSON.stringify(S), F0=actF, out=null; try{ __set_C(C2); __set_S(JSON.parse(S0)); __set_actF("all"); derive(); renderActions();
  let b=document.getElementById("actBody"), cat="", res={action:[],onhit:[],bonus:[],reaction:[],other:[],rows:[]};
  Array.prototype.forEach.call(b.children,(el) =>{ if(el.matches("h3.fcat")){ const t=el.textContent; cat=/^On Hit/.test(t)?"onhit":/^Bonus/.test(t)?"bonus":/^Reactions/.test(t)?"reaction":/^Other/.test(t)?"other":/^Actions/.test(t)?"action":"limited"; return; }
    const its=el.matches(".aonhit")?Array.prototype.slice.call(el.querySelectorAll(":scope > .aitem")):[el];/* v35 p18: On Hit cards sit in a wrapper */
    its.forEach((el) =>{ if(el.matches(".aitem")&&res[cat]){ const h=el.querySelector("h4"), tx=h.querySelector(".tx"), mu=h.querySelector(".muted"); res[cat].push({n:(tx||h).textContent, s:mu?mu.textContent:"", bx:!!el.querySelector(".bx,.pool,.supd,.hpips"), t:(el.querySelector("p")||{}).textContent||""}); } });
    if(el.matches(".arow")){ const bx=el.querySelectorAll(".abox"), nm=el.querySelector(".an .tx"); res.rows.push({c:cat, n:nm?nm.textContent:"", hit:bx[0]?bx[0].textContent:"", dmg:bx[1]?bx[1].textContent:""}); } });
  out=res; } finally { __set_C(C0); __set_S(JSON.parse(S0)); __set_actF(F0); derive(); renderActions(); } return out; };
/* RL40: id of the open character in My Characters. The builder keeps it in B.cid, so the Build button always opens this character's build */
window.__sheetId=function(){ let r=rGet(); if(!r||!r.chars||!r.chars[r.active]){ r=rEnsure(); rSave(r); } return r.active; };
/* RL40: "Start a new character" in the builder makes a new character in My Characters (as Create a Character). The open one keeps its build */
window.__sheetNew=function(){ const r=rEnsure(); rSnap(r); const nid="c"+Date.now(); r.chars[nid]={name:"New Character",created:Date.now(),t:Date.now()}; sessionStorage.setItem("cs-skip","1"); rLoad(r,nid,true); };
document.getElementById("bldBtn").addEventListener("click",() =>{ if(window.__bldOpen) window.__bldOpen(); });
$("#editBtn").addEventListener("click",() =>{ __R.edmSet(!__R.EDM); });/* v34 RU85: Edit mode. The old form is in the bar (Details) */
