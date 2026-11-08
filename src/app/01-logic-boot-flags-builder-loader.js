import {env} from "./00-env.js";
/* v24 p08: true only in the public file (no sample character on a first visit) */
export var PUBLIC_BUILD=true;
export var PWA_BUILD=true;
/* v34 p04: the builder loads after the sheet is on screen. Any click, input, or key that may need it finishes loading first.
   Tabs, View on Home, the More menu, and scrolling do not wait */
(function(){ function need(e){ return anonFn1(e); }
  logicBootFlagsBuilderLoaderAnonStep1(need); })();/* v34 RU82: true in the public build with manifest and sw.js */
function anonFn1(e){ if(env.__deferDone) return;
 const {t}=anonFn1Step1(e);
    if(anonFn1Part1(e)) return;
    if(anonFn1Part2(e)) return;
    if(anonFn1Part3(e, t)) return;
    /* T1: a tap before the loader script has been read (slow phone, page still loading) waits for it, then goes the usual way. Before, the tap was lost */
    if(!env.__bldNeed){ bldTapWait(e, t); return; }
    if(anonFn1Part4(e, t)){ bldTapOpen(e, t); return; }
    anonFn1Step2(); }
function bldTapWait(e, t){ if(!t||!t.click) return; e.preventDefault(); e.stopImmediatePropagation();
      const bz0=document.getElementById("busy"), sp0=bz0&&bz0.querySelector("div span:last-child"), old0=sp0?sp0.textContent:"";
      if(sp0) sp0.textContent="Opening the builder"; if(bz0){ bz0.style.transition="none"; bz0.classList.add("on"); }
      let n0=0, again=function(){ if(!env.__bldNeed&&document.readyState==="loading"&&n0++<600){ setTimeout(again,30); return; }
        if(bz0){ bz0.classList.remove("on"); bz0.style.transition=""; } if(sp0) sp0.textContent=old0; try{ t.click(); }catch(x){} };
      setTimeout(again,30); }
/* v100: the first tap that needs the builder shows "Opening the builder" at once, then loads it and repeats the tap. Before, the screen stood still until the load ended */
function bldTapOpen(e, t){
      e.preventDefault(); e.stopImmediatePropagation();
      const bz=document.getElementById("busy"), sp=bz&&bz.querySelector("div span:last-child"), old=sp?sp.textContent:"";
      if(sp) sp.textContent="Opening the builder"; if(bz){ bz.style.transition="none"; bz.classList.add("on"); }
      const run=function(){ return needFn1(bz, sp, old, t); };/* M7: __bldNeed() gives a Promise */
      if(env.requestAnimationFrame) requestAnimationFrame(() =>{ setTimeout(run,0); }); else setTimeout(run,30); }
function anonFn1Part1(e){ return (!env.__bldNeed&&(document.readyState!=="loading"||e.type!=="click")); }
function anonFn1Part2(e){ return (e.type==="keydown"&&/^(Tab|Shift|Control|Alt|Meta|Arrow|Page|Home|End)/.test(e.key||"")); }
function anonFn1Part3(e, t){ return (e.type==="click"&&t&&t.closest&&t.closest("#tabs .tab,#bnav button,#homeV [data-hview],#moreBtn,[data-close],#sheetBack")); }
function anonFn1Part4(e, t){ return (e.type==="click"&&t&&t.click); }
function anonFn1Step1(e){
 const {t}=needStep1(e);
  return /** @type {any} */ ({t});
}
function anonFn1Step2(){
    needStep2();
}
function needFn1(bz, sp, old, t){ let p; try{ p=env.__bldNeed(); }catch(x){ p=null; } Promise.resolve(p).catch(() =>{}).then(() =>{ if(bz){ bz.classList.remove("on"); bz.style.transition=""; } if(sp) sp.textContent=old; try{ t.click(); }catch(x){} }); }
function logicBootFlagsBuilderLoaderAnonStep1(need){
  ["click","input","change","keydown","submit"].forEach((n) =>{ document.addEventListener(n,need,true); });
}
function needStep1(e){
const t=e.target;
  return /** @type {any} */ ({t});
}
function needStep2(){
    env.__bldNeed();
}
export var LOGO_IMG="data:image/webp;base64,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";/* v35 p12 *//* v34 RU83 */
