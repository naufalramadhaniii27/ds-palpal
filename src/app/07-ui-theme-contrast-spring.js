import {C,S,clsLv} from "./04-logic-storage.js";
import {$,ask,esc} from "./05-logic-helpers.js";
import {__R} from "./00-reg.js";import {env} from "./00-env.js";
Object.defineProperty(__R,"applyLook",{get:function(){return applyLook;},set:function(v){applyLook=v;},configurable:true});
/* moved here from a later file: used while this file loads (a function declaration used to be hoisted across the closure) */
export function uiGet(k){ try{ return JSON.parse(__store.getItem(k)||"null")||{}; }catch(e){ return {}; } }
/* ================= THEME ================= */
export function applyTheme(){ if(S.theme==="light"||S.theme==="dark") document.documentElement.setAttribute("data-theme",S.theme); else document.documentElement.removeAttribute("data-theme"); }
function currentDark(){ if(S.theme) return S.theme==="dark"; return env.matchMedia && env.matchMedia("(prefers-color-scheme: dark)").matches; }
const SYMS={star:["Star",'<path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.2l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"/>'],
 sword:["Sword",'<path d="M14.5 3.5H20v5.5L9 20l-5-5z"/><path d="m6 13 5 5"/><path d="m3 21 3-3"/>'],
 roots:["Roots",'<path d="M12 2v7"/><path d="M12 9c-3 0-5 2-6 5s-3 4-4 4"/><path d="M12 9c3 0 5 2 6 5s3 4 4 4"/><path d="M12 9v6c0 3-2 5-4 7"/><path d="M12 15c0 3 2 5 4 7"/>'],
 leaf:["Leaf",'<path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16z"/><path d="M4 20 14 10"/>'],
 flame:["Flame",'<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 2 1 3 2 3 0-3 0-5 1-8z"/>'],
 moon:["Moon",'<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>'],
 sun:["Sun",'<circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>'],
 shield:["Shield",'<path d="M12 2.5 20 5.5v6c0 5-3.5 8.7-8 10-4.5-1.3-8-5-8-10v-6z"/>'],
 skull:["Skull",'<path d="M12 3a8 8 0 0 0-8 8c0 3 1.5 4.5 3 5.5V20h10v-3.5c1.5-1 3-2.5 3-5.5a8 8 0 0 0-8-8z"/><circle cx="9" cy="11.5" r="1.6"/><circle cx="15" cy="11.5" r="1.6"/><path d="M10 20v-2.5M14 20v-2.5"/>'],
 book:["Book",'<path d="M4 4.5h6a2 2 0 0 1 2 2V20a2 2 0 0 0-2-2H4z"/><path d="M20 4.5h-6a2 2 0 0 0-2 2V20a2 2 0 0 1 2-2h6z"/>'],
 eye:["Eye",'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'],
 wave:["Wave",'<path d="M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/><path d="M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/>'],
 crown:["Crown",'<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>'],
 flower:["Flower",'<ellipse cx="12" cy="6.5" rx="3.2" ry="5"/><ellipse cx="12" cy="17.5" rx="3.2" ry="5"/><ellipse cx="6.5" cy="12" rx="5" ry="3.2"/><ellipse cx="17.5" cy="12" rx="5" ry="3.2"/>'],
 dice:["D20",'<path d="M12 2 21 7v10l-9 5-9-5V7z"/><path d="M12 2 7.5 14h9z"/><path d="M3 7l4.5 7M21 7l-4.5 7M12 22v-8"/>']};
export var PALS={forest:["Forest","#264b40","#1c3a31","#a9c2b6","#55389a","#e9e3f5","#142c25","#0f231d","#86a698","#a990f2","#262039"],
 crimson:["Crimson","#6b1f2a","#531620","#e3b3b9","#b0742a","#f6ead8","#3a1218","#2a0c11","#c98f97","#e0a35a","#3a2a17"],
 ocean:["Ocean","#1d4e6e","#163c55","#a8c9dd","#d06a3c","#f9e4da","#10283a","#0b1e2c","#86aac2","#ee9670","#3b2219"],
 royal:["Royal","#3c2a6e","#2e2056","#c3b6e6","#c79a2b","#f6efd9","#1f1638","#160f29","#a495d1","#e7c162","#3a3016"],
 ember:["Ember","#7a3a14","#5e2c0e","#ecc6a7","#2f6f73","#dbeeee","#3d1d0a","#2c1507","#d1a481","#6fb8bc","#16302f"],
 slate:["Slate","#2f3842","#232a32","#b9c2cc","#3b74c4","#e1ebf8","#181d23","#111519","#97a3af","#7ea8e6","#1c2a3c"],
 gold:["Gold","#6e5418","#544010","#e7d6a6","#7a2f6b","#f3e2ef","#33270b","#251c07","#cdb978","#c97bb8","#33182e"],
 grove:["Grove","#3d5a1e","#2e4516","#c8dbab","#8a4a1c","#f3e6da","#1f2e0f","#16210a","#a9c287","#d2915d","#33200e"]};
function svgOf(k,sw){const sy=SYMS[k]||SYMS.star;return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(sw||1.6)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+sy[1]+'</svg>'}
export function dataUri(k,col,sw,size){const sy=SYMS[k]||SYMS.star;const x='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(size||24)+' '+(size||24)+'"><g fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"'+(size?' transform="translate('+((size-24)/2)+','+((size-24)/2)+')"':'')+'>'+sy[1]+'</g></svg>';return 'url("data:image/svg+xml,'+encodeURIComponent(x)+'")'}
export function applyLook(){document.documentElement.setAttribute("data-skin",S.skin||"ddb");document.documentElement.setAttribute("data-pal",S.color||"forest");let p=PALS[S.color]||PALS.forest,st=document.getElementById("lookCss");if(!st){st=document.createElement("style");
  st.id="lookCss";document.head.appendChild(st)}
 const L=":root{--dinas:"+p[1]+";--dinas-2:"+p[2]+";--on-dinas-2:"+p[3]+";--stamp:"+p[4]+";--stamp-soft:"+p[5]+";--pat:"+dataUri(S.sym,"#ffffff",1,36)+";--wm:"+dataUri(S.sym,"#000000",.8)+"}";
 const Dk="--dinas:"+p[6]+";--dinas-2:"+p[7]+";--on-dinas-2:"+p[8]+";--stamp:"+p[9]+";--stamp-soft:"+p[10]+";--wm:"+dataUri(S.sym,"#ffffff",.8);
 const acc=p[8];st.textContent="@layer app{:root{--acc:"+acc+";--acc2:"+p[9]+"}"+L+"@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]){"+Dk+"}}:root[data-theme=\"dark\"]{"+Dk+"}}";/* T11 A4: same cascade layer as the app CSS */
 const bs=document.getElementById("bandSym");if(bs)bs.innerHTML=svgOf(S.sym,1.6);renderStamp();__R.applyLook2()}
export function renderStamp(){const el=document.getElementById("stampSvg");if(!el)return;const txt=((C.name||"")+"  \u2726  "+clsLv()+"  \u2726").toUpperCase();const sy=SYMS[S.sym]||SYMS.star;
 el.innerHTML='<defs><path id="ring" d="M50 50 m-35 0 a35 35 0 1 1 70 0 a35 35 0 1 1 -70 0"/><filter id="ink" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.25"/><feComposite in="SourceGraphic" operator="in"/></filter></defs><g filter="url(#ink)" fill="none" stroke="currentColor"><circle cx="50" cy="50" r="46" stroke-width="3"/><circle cx="50" cy="50" r="27" stroke-width="1.6"/><text font-family="Archivo Narrow, Arial Narrow, sans-serif" font-weight="700" font-size="'+(txt.length>34?8.5:10.5)+'" letter-spacing="1.4" fill="currentColor" stroke="none"><textPath href="#ring">'+esc(txt)+'</textPath></text><g transform="translate(36 36) scale(1.17)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+sy[1]+'</g></g>'}
function skinMock(k){ return k==="ddb"?'<svg class="skm" viewBox="0 0 120 70" aria-hidden="true"><rect width="120" height="70" fill="#0f1417"/><rect width="120" height="15" fill="#1d2328"/><rect y="15" width="120" height="2" fill="#d6453b"/><rect x="8" y="5" width="44" height="5" rx="2.5" fill="#e8ecef"/><rect x="8" y="24" width="31" height="18" rx="3" fill="#232a30" stroke="#56626b"/><rect x="44.5" y="24" width="31" height="18" rx="3" fill="#232a30" stroke="#56626b"/><rect x="81" y="24" width="31" height="18" rx="3" fill="#232a30" stroke="#56626b"/><rect x="8" y="50" width="50" height="10" rx="3" fill="#24804a"/><rect x="62" y="50" width="50" height="10" rx="3" fill="#d6453b"/></svg>':'<svg class="skm" viewBox="0 0 120 70" aria-hidden="true"><rect width="120" height="70" fill="#efe9dc"/><rect width="120" height="17" style="fill:var(--dinas,#142c25)"/><rect x="8" y="6" width="44" height="5" rx="2.5" fill="#f3efe4"/><circle cx="106" cy="8.5" r="5.5" fill="none" stroke-width="1.8" style="stroke:var(--stamp,#7a2f6b)"/><rect x="8" y="24" width="31" height="18" rx="3" fill="#fbf8f1" stroke="#cfc6b2"/><rect x="44.5" y="24" width="31" height="18" rx="3" fill="#fbf8f1" stroke="#cfc6b2"/><rect x="81" y="24" width="31" height="18" rx="3" fill="#fbf8f1" stroke="#cfc6b2"/><rect x="8" y="50" width="104" height="4" rx="2" fill="#b8ae97"/><rect x="8" y="58" width="60" height="4" rx="2" fill="#b8ae97"/></svg>'; }/* v32 p27 C14 */
export function themeHTML(){let h='<div class="info-h">Style</div><div class="thg skg">'+[["record","Character Record","Paper sheet with a stamp"],["ddb","D&D Beyond","Dark panels, red buttons"]].map((m) =>{const on=(S.skin||"ddb")===m[0];return '<button type="button" class="thb skinp'+(on?" on":"")+'" data-thk="'+m[0]+'" aria-pressed="'+on+'">'+skinMock(m[0])+'<span class="skn"><b>'+m[1]+'</b><small>'+m[2]+'</small></span></button>'}).join("")+'</div><div class="info-h">Mode</div><div class="thg">'+[["","Auto"],["light","Light"],["dark","Dark"]].map((m) =>{return '<button type="button" class="thb'+((S.theme||"")===m[0]?" on":"")+'" data-thm="'+m[0]+'">'+m[1]+'</button>'}).join("")+'</div>';
 h+='<div class="info-h">Color</div><div class="thg">'+Object.keys(PALS).map((k) =>{const p=PALS[k];return '<button type="button" class="thb thcol'+(S.color===k?" on":"")+'" data-thc="'+k+'" aria-pressed="'+(S.color===k)+'"><span class="sw" style="background:linear-gradient(180deg,'+p[1]+' 0 64%,'+p[4]+' 64%)"><i style="background:'+p[3]+'"></i></span>'+p[0]+'</button>'}).join("")+'</div>';
 h+='<div class="info-h">Symbol</div><div class="thg">'+Object.keys(SYMS).map((k) =>{return '<button type="button" class="thb'+(S.sym===k?" on":"")+'" data-ths="'+k+'">'+svgOf(k,1.7)+SYMS[k][0]+'</button>'}).join("")+'</div><p class="info-d">Pick any color and symbol. They are not tied to class, species, or background.</p>';
 return h}
$("#themeBtn").addEventListener("click",() =>{ __R.navStack=[]; __R.openSheet("Settings", __R.settingsHTML(), "theme"); });/* v25 RU38 no. 6, no. 7 */
applyTheme();
/* v35 p01: high contrast. A device setting in cs-ui-hc {m:"auto"|"on"|"off"}, the same for every character. Auto follows the system
   (prefers-contrast: more, forced-colors: active). On sets data-hc on <html>; the colors live in sheet.css (v35 p01). */
const HC_MQ=env.matchMedia?[env.matchMedia("(prefers-contrast: more)"),env.matchMedia("(forced-colors: active)")]:[];
function hcMode(){ const m=uiGet("cs-ui-hc").m; return m==="on"||m==="off"?m:"auto"; }
function hcSys(){ return HC_MQ.some((q) =>{ return q.matches; }); }
export function hcOn(){ const m=hcMode(); return m==="on"||(m==="auto"&&hcSys()); }
function hcApply(){ const R=document.documentElement; if(hcOn()) R.setAttribute("data-hc","1"); else R.removeAttribute("data-hc"); if(HC_MQ[1]&&HC_MQ[1].matches) R.setAttribute("data-fc","1"); else R.removeAttribute("data-fc"); }
export function hcSet(m){ __R.uiSet("cs-ui-hc",{m:m==="on"||m==="off"?m:"auto"}); hcApply(); }
export function hcNote(){ return 'Stronger text and lines for low vision or bright light. Auto follows the contrast setting of your device (it is '+(hcSys()?"on":"off")+' now). This setting is for this device and every character on it.'; }
export function miSetH(){ const g=function(k,d){ try{ return __store.getItem(k)||d; }catch(e){ return d; } }, fx=g("mi-fx","full"), bz=g("mi-bz","on"), b=function(a,v,cur,label,ik){ const on=cur===v; return '<button type="button" class="thb thbi'+(on?" on":"")+'" '+a+'="'+v+'" aria-pressed="'+on+'">'+__R.ico(ik)+label+'</button>'; };
  return '<div class="info-h">Immersive Effects</div><div class="thg">'+b("data-mifx","full",fx,"Full","ui-check")+b("data-mifx","lite",fx,"Lite","ui-minus")+b("data-mifx","off",fx,"Off","ui-close")+'</div><p class="info-d">Full: every effect, condition ambience and celebrations. Lite: transitions and feedback only. Off: no motion effects.</p>'+
    '<div class="info-h">Vibration</div><div class="thg">'+b("data-mibz","on",bz,"On","ui-check")+b("data-mibz","off",bz,"Off","ui-close")+'</div>'+
    '<div class="info-h">Sound</div><div class="thg">'+b("data-misnd","on",g("mi-snd","on"),"On","ui-check")+b("data-misnd","off",g("mi-snd","on"),"Off","ui-close")+'</div><p class="info-d">Dice, healing, damage, level up and rests make a short sound.</p>'+(env.__miLookH?env.__miLookH():'')+(env.__miPrefH?env.__miPrefH():'')+(env.__miMusicH?env.__miMusicH():'')+(env.__miArtH?env.__miArtH():''); }/* v55 */
export function hcBtn(v,label,ik){ const on=hcMode()===v; return '<button type="button" class="thb thbi'+(on?" on":"")+'" data-hc="'+v+'" aria-pressed="'+on+'">'+__R.ico(ik)+label+'</button>'; }
HC_MQ.forEach((q) =>{ const f=function(){ hcApply(); try{ if(__R.sheetMode==="theme"){ const n=document.getElementById("hcNote"); if(n) n.textContent=hcNote(); } }catch(er){} };
  try{ q.addEventListener("change",f); }catch(er){ try{ q.addListener(f); }catch(er2){} } });
hcApply();
env.__hc=function(){ return {mode:hcMode(), sys:hcSys(), on:hcOn(), attr:document.documentElement.getAttribute("data-hc")}; };
env.__ask=function(m,o,c,a){ return ask(m,o,c,a); };

/* ================= SPRING ================= */
export var REDUCE = env.matchMedia && env.matchMedia("(prefers-reduced-motion: reduce)").matches;
export var SPR = {};
export function spring(key, target, apply, opt){
  opt = opt || {};
  const k = opt.k || 260, c = 2*Math.sqrt(k)*(opt.zeta || 1);
  let s = SPR[key];
  if(!s){ s = SPR[key] = {x:target, v:0, t:target, raf:0}; }
  s.t = target; s.apply = apply; s.k = k; s.c = c;
  if(REDUCE || opt.instant){ s.x = target; s.v = 0; if(s.raf){cancelAnimationFrame(s.raf); s.raf=0;} apply(target); return; }
  if(s.raf) return;
  let last = performance.now();
  function step(now){
    const dt = Math.min(.032, (now-last)/1000); last = now;
    const f = -s.k*(s.x - s.t) - s.c*s.v;
    s.v += f*dt; s.x += s.v*dt;
    const eps=.002*Math.max(1,Math.abs(s.t));
    if(Math.abs(s.v) < eps && Math.abs(s.x - s.t) < eps){ s.x = s.t; s.v = 0; s.apply(s.x); s.raf = 0; return; }
    s.apply(s.x); s.raf = requestAnimationFrame(step);
  }
  s.raf = requestAnimationFrame(step);
}

