import {bindLive} from "./00a-reg-late-ports.js";import {env} from "./00-env.js";/* Responsibility: scroll per tab and the HP bar spring. Split out of the former single file in SOLID stage 3 (S); runs in the same order as before.
   Touches page globals only through env (none used here). Shared names with other modules come from the imports below, late names through __R. */
import {BAD,recover} from "./04-logic-storage.js";
import {$} from "./05-logic-helpers.js";
import {REDUCE,applyLook} from "./07-ui-theme-contrast-spring.js";
import {renderNotes} from "./08c-ui-render-inventory-features-notes.js";
import {syncPortrait} from "./20-ui-portrait.js";
import {__set_setTab,activeTab,mq,setTab} from "./21-ui-tabs-pager.js";
import {renderAll} from "./35-ui-combo.js";

bindLive("barTo",{get:function(){return barTo;}});
/* ===== v31 p19 scroll position per tab (RU132) ===== */
const TABY={};
function tabsTop(){ const d=document.querySelector(".detail"), t=$("#tabs"); if(!d||!t) return 0; const st=parseFloat(getComputedStyle(t).top)||0; return Math.max(0,Math.round(d.getBoundingClientRect().top+env.scrollY-st)); }
__set_setTab((function(f){ return function(id,focus,instant){ const from=activeTab, pc=!mq.matches&&id!==from; if(pc) TABY[from]=env.scrollY;
  const r=f.apply(this,arguments); if(pc){ const top=tabsTop(), y=TABY[id]; if(y!=null&&y>top){ env.scrollTo(0,y); let got=env.scrollY, again=function(){ if(activeTab===id&&env.scrollY===got&&Math.abs(got-y)>1){ env.scrollTo(0,y); got=env.scrollY; } }; requestAnimationFrame(again); setTimeout(again,120); setTimeout(again,300); } else if(env.scrollY>top) env.scrollTo(0,top); } return r; }; })(setTab));
/* ===== v31 p21 HP bars on the compositor ===== */
let SPRE=null;
/* the same spring as spring(), sampled once into a linear() easing, so the browser runs it off the main thread */
bindLive("springEase",{get:function(){return springEase;}});
export function springEase(k,zeta){ let c=2*Math.sqrt(k)*zeta, x=0, v=0, dt=1/240, t=0, pts=[0], step=0;
  while(t<3){ const f=-k*(x-1)-c*v; v+=f*dt; x+=v*dt; t+=dt; if(++step%6===0) pts.push(Math.round(x*1000)/1000); if(t>.2&&Math.abs(1-x)<.002&&Math.abs(v)<.02) break; }
  pts.push(1); const lin=env.CSS&&CSS.supports&&CSS.supports("animation-timing-function","linear(0, 1)");
  return {d:Math.round(t*1000), e:lin?"linear("+pts.join(",")+")":"cubic-bezier(.2,.8,.2,1)"}; }
function barTo(el,p,instant,bc){ if(!el) return; const t="scaleX("+(Math.round(p*1000)/1000)+")"; if(bc&&el.__bc!==bc){ el.__bc=bc; el.style.backgroundColor=bc; } if(el.__t===t) return;
  let from=null; if(!instant&&!REDUCE&&el.__t!=null&&el.animate){ from=(el.__a&&el.__a.playState==="running")?getComputedStyle(el).transform:el.__t; }
  if(el.__a){ try{ el.__a.cancel(); }catch(er){} el.__a=null; } el.__t=t; el.style.transform=t;
  if(from&&from!==t&&from!=="none"){ const e=SPRE||(SPRE=springEase(120,.9)); try{ el.__a=el.animate([{transform:from},{transform:t}],{duration:e.d,easing:e.e}); }catch(er){ el.__a=null; } } }
if(BAD.length) recover("Saved data",BAD.join(" | ")); else { applyLook();renderAll(true); renderNotes(); syncPortrait(); }
