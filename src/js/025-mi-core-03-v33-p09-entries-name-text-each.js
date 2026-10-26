/* v33 p09: entries "**Name.** text" each in its own block (name on its own line, text below, space between). Also splits old saved text joined with spaces */
function fBlkT(t){ return String(t==null?"":t).replace(/([.!?:)\]"]) \*\*(?!Your choice\.|Still open\.)([^*\n]{1,80}?\.)\*\* /g,"$1\n\n**$2** "); }
function richB(t){ var parts=fBlkT(t).split(/\n\s*\n/).filter(function(p){ return p.trim(); }); if(parts.length<2) return rich(t).replace(/ <strong>([^<]{1,60}:)<\/strong>/g,"<br><strong>$1</strong>");
  return parts.map(function(p){ var h=rich(p.trim()).replace(/ <strong>([^<]{1,60}:)<\/strong>/g,"<br><strong>$1</strong>"), m=/^<strong>([^<]{1,80}\.)<\/strong>\s*/.exec(h); return '<span class="fblk'+(m&&!/^(Your choice|Still open)\.$/.test(m[1])?" nm":"")+'">'+h+'</span>'; }).join(""); }
function richP(t){ var b=richB(t); return /class="fblk/.test(b)?b:rich(t).replace(/ <strong>/g,"<br><strong>"); }
function fill(t){ return String(t||"").replace(/\{dc\}/g,D.dc).replace(/\{level\}/g,D.level).replace(/\{pb\}/g,sg(D.pb)).replace(/\{unarmed\}/g, (D.atk[0]?D.atk[0].dmg:"")); }

/* ================= THEME ================= */
function applyTheme(){ if(S.theme==="light"||S.theme==="dark") document.documentElement.setAttribute("data-theme",S.theme); else document.documentElement.removeAttribute("data-theme"); }
function currentDark(){ if(S.theme) return S.theme==="dark"; return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; }
var SYMS={star:["Star",'<path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.2l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"/>'],
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
var PALS={forest:["Forest","#264b40","#1c3a31","#a9c2b6","#55389a","#e9e3f5","#142c25","#0f231d","#86a698","#a990f2","#262039"],
 crimson:["Crimson","#6b1f2a","#531620","#e3b3b9","#b0742a","#f6ead8","#3a1218","#2a0c11","#c98f97","#e0a35a","#3a2a17"],
 ocean:["Ocean","#1d4e6e","#163c55","#a8c9dd","#d06a3c","#f9e4da","#10283a","#0b1e2c","#86aac2","#ee9670","#3b2219"],
 royal:["Royal","#3c2a6e","#2e2056","#c3b6e6","#c79a2b","#f6efd9","#1f1638","#160f29","#a495d1","#e7c162","#3a3016"],
 ember:["Ember","#7a3a14","#5e2c0e","#ecc6a7","#2f6f73","#dbeeee","#3d1d0a","#2c1507","#d1a481","#6fb8bc","#16302f"],
 slate:["Slate","#2f3842","#232a32","#b9c2cc","#3b74c4","#e1ebf8","#181d23","#111519","#97a3af","#7ea8e6","#1c2a3c"],
 gold:["Gold","#6e5418","#544010","#e7d6a6","#7a2f6b","#f3e2ef","#33270b","#251c07","#cdb978","#c97bb8","#33182e"],
 grove:["Grove","#3d5a1e","#2e4516","#c8dbab","#8a4a1c","#f3e6da","#1f2e0f","#16210a","#a9c287","#d2915d","#33200e"]};
function svgOf(k,sw){var sy=SYMS[k]||SYMS.star;return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(sw||1.6)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+sy[1]+'</svg>'}
function dataUri(k,col,sw,size){var sy=SYMS[k]||SYMS.star;var x='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(size||24)+' '+(size||24)+'"><g fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"'+(size?' transform="translate('+((size-24)/2)+','+((size-24)/2)+')"':'')+'>'+sy[1]+'</g></svg>';return 'url("data:image/svg+xml,'+encodeURIComponent(x)+'")'}
function applyLook(){document.documentElement.setAttribute("data-skin",S.skin||"ddb");var p=PALS[S.color]||PALS.forest,st=document.getElementById("lookCss");if(!st){st=document.createElement("style");st.id="lookCss";document.head.appendChild(st)}
 var L=":root{--dinas:"+p[1]+";--dinas-2:"+p[2]+";--on-dinas-2:"+p[3]+";--stamp:"+p[4]+";--stamp-soft:"+p[5]+";--pat:"+dataUri(S.sym,"#ffffff",1,36)+";--wm:"+dataUri(S.sym,"#000000",.8)+"}";
 var Dk="--dinas:"+p[6]+";--dinas-2:"+p[7]+";--on-dinas-2:"+p[8]+";--stamp:"+p[9]+";--stamp-soft:"+p[10]+";--wm:"+dataUri(S.sym,"#ffffff",.8);
 var acc=p[8];st.textContent=":root{--acc:"+acc+";--acc2:"+p[9]+"}"+L+"@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]){"+Dk+"}}:root[data-theme=\"dark\"]{"+Dk+"}";
 var bs=document.getElementById("bandSym");if(bs)bs.innerHTML=svgOf(S.sym,1.6);renderStamp();applyLook2()}
function renderStamp(){var el=document.getElementById("stampSvg");if(!el)return;var txt=((C.name||"")+"  \u2726  "+clsLv()+"  \u2726").toUpperCase();var sy=SYMS[S.sym]||SYMS.star;
 el.innerHTML='<defs><path id="ring" d="M50 50 m-35 0 a35 35 0 1 1 70 0 a35 35 0 1 1 -70 0"/><filter id="ink" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.25"/><feComposite in="SourceGraphic" operator="in"/></filter></defs><g filter="url(#ink)" fill="none" stroke="currentColor"><circle cx="50" cy="50" r="46" stroke-width="3"/><circle cx="50" cy="50" r="27" stroke-width="1.6"/><text font-family="Archivo Narrow, Arial Narrow, sans-serif" font-weight="700" font-size="'+(txt.length>34?8.5:10.5)+'" letter-spacing="1.4" fill="currentColor" stroke="none"><textPath href="#ring">'+esc(txt)+'</textPath></text><g transform="translate(36 36) scale(1.17)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+sy[1]+'</g></g>'}
function skinMock(k){ return k==="ddb"?'<svg class="skm" viewBox="0 0 120 70" aria-hidden="true"><rect width="120" height="70" fill="#0f1417"/><rect width="120" height="15" fill="#1d2328"/><rect y="15" width="120" height="2" fill="#d6453b"/><rect x="8" y="5" width="44" height="5" rx="2.5" fill="#e8ecef"/><rect x="8" y="24" width="31" height="18" rx="3" fill="#232a30" stroke="#56626b"/><rect x="44.5" y="24" width="31" height="18" rx="3" fill="#232a30" stroke="#56626b"/><rect x="81" y="24" width="31" height="18" rx="3" fill="#232a30" stroke="#56626b"/><rect x="8" y="50" width="50" height="10" rx="3" fill="#24804a"/><rect x="62" y="50" width="50" height="10" rx="3" fill="#d6453b"/></svg>':'<svg class="skm" viewBox="0 0 120 70" aria-hidden="true"><rect width="120" height="70" fill="#efe9dc"/><rect width="120" height="17" style="fill:var(--dinas,#142c25)"/><rect x="8" y="6" width="44" height="5" rx="2.5" fill="#f3efe4"/><circle cx="106" cy="8.5" r="5.5" fill="none" stroke-width="1.8" style="stroke:var(--stamp,#7a2f6b)"/><rect x="8" y="24" width="31" height="18" rx="3" fill="#fbf8f1" stroke="#cfc6b2"/><rect x="44.5" y="24" width="31" height="18" rx="3" fill="#fbf8f1" stroke="#cfc6b2"/><rect x="81" y="24" width="31" height="18" rx="3" fill="#fbf8f1" stroke="#cfc6b2"/><rect x="8" y="50" width="104" height="4" rx="2" fill="#b8ae97"/><rect x="8" y="58" width="60" height="4" rx="2" fill="#b8ae97"/></svg>'; }/* v32 p27 C14 */
function themeHTML(){var h='<div class="info-h">Style</div><div class="thg skg">'+[["record","Character Record","Paper sheet with a stamp"],["ddb","D&D Beyond","Dark panels, red buttons"]].map(function(m){var on=(S.skin||"ddb")===m[0];return '<button type="button" class="thb skinp'+(on?" on":"")+'" data-thk="'+m[0]+'" aria-pressed="'+on+'">'+skinMock(m[0])+'<span class="skn"><b>'+m[1]+'</b><small>'+m[2]+'</small></span></button>'}).join("")+'</div><div class="info-h">Mode</div><div class="thg">'+[["","Auto"],["light","Light"],["dark","Dark"]].map(function(m){return '<button type="button" class="thb'+((S.theme||"")===m[0]?" on":"")+'" data-thm="'+m[0]+'">'+m[1]+'</button>'}).join("")+'</div>';
 h+='<div class="info-h">Color</div><div class="thg">'+Object.keys(PALS).map(function(k){var p=PALS[k];return '<button type="button" class="thb thcol'+(S.color===k?" on":"")+'" data-thc="'+k+'" aria-pressed="'+(S.color===k)+'"><span class="sw" style="background:linear-gradient(180deg,'+p[1]+' 0 64%,'+p[4]+' 64%)"><i style="background:'+p[3]+'"></i></span>'+p[0]+'</button>'}).join("")+'</div>';
 h+='<div class="info-h">Symbol</div><div class="thg">'+Object.keys(SYMS).map(function(k){return '<button type="button" class="thb'+(S.sym===k?" on":"")+'" data-ths="'+k+'">'+svgOf(k,1.7)+SYMS[k][0]+'</button>'}).join("")+'</div><p class="info-d">Pick any color and symbol. They are not tied to class, species, or background.</p>';
 return h}
$("#themeBtn").addEventListener("click",function(){ navStack=[]; openSheet("Settings", settingsHTML(), "theme"); });/* v25 RU38 no. 6, no. 7 */
applyTheme();
/* v35 p01: high contrast. A device setting in cs-ui-hc {m:"auto"|"on"|"off"}, the same for every character. Auto follows the system
   (prefers-contrast: more, forced-colors: active). On sets data-hc on <html>; the colors live in sheet.css (v35 p01). */
var HC_MQ=window.matchMedia?[window.matchMedia("(prefers-contrast: more)"),window.matchMedia("(forced-colors: active)")]:[];
function hcMode(){ var m=uiGet("cs-ui-hc").m; return m==="on"||m==="off"?m:"auto"; }
function hcSys(){ return HC_MQ.some(function(q){ return q.matches; }); }
function hcOn(){ var m=hcMode(); return m==="on"||(m==="auto"&&hcSys()); }
function hcApply(){ var R=document.documentElement; if(hcOn()) R.setAttribute("data-hc","1"); else R.removeAttribute("data-hc"); if(HC_MQ[1]&&HC_MQ[1].matches) R.setAttribute("data-fc","1"); else R.removeAttribute("data-fc"); }
function hcSet(m){ uiSet("cs-ui-hc",{m:m==="on"||m==="off"?m:"auto"}); hcApply(); }
function hcNote(){ return 'Stronger text and lines for low vision or bright light. Auto follows the contrast setting of your device (it is '+(hcSys()?"on":"off")+' now). This setting is for this device and every character on it.'; }
function miSetH(){ var g=function(k,d){ try{ return localStorage.getItem(k)||d; }catch(e){ return d; } }, fx=g("mi-fx","full"), bz=g("mi-bz","on"), b=function(a,v,cur,label,ik){ var on=cur===v; return '<button type="button" class="thb thbi'+(on?" on":"")+'" '+a+'="'+v+'" aria-pressed="'+on+'">'+ico(ik)+label+'</button>'; };
  return '<div class="info-h">Immersive Effects</div><div class="thg">'+b("data-mifx","full",fx,"Full","ui-check")+b("data-mifx","lite",fx,"Lite","ui-minus")+b("data-mifx","off",fx,"Off","ui-close")+'</div><p class="info-d">Full: every effect, condition ambience and celebrations. Lite: transitions and feedback only. Off: no motion effects.</p>'+
    '<div class="info-h">Vibration</div><div class="thg">'+b("data-mibz","on",bz,"On","ui-check")+b("data-mibz","off",bz,"Off","ui-close")+'</div>'+
    '<div class="info-h">Sound</div><div class="thg">'+b("data-misnd","on",g("mi-snd","on"),"On","ui-check")+b("data-misnd","off",g("mi-snd","on"),"Off","ui-close")+'</div><p class="info-d">Dice, healing, damage, level up and rests make a short sound.</p>'+(window.__miLookH?window.__miLookH():'')+(window.__miPrefH?window.__miPrefH():'')+(window.__miMusicH?window.__miMusicH():''); }/* v55 */
function hcBtn(v,label,ik){ var on=hcMode()===v; return '<button type="button" class="thb thbi'+(on?" on":"")+'" data-hc="'+v+'" aria-pressed="'+on+'">'+ico(ik)+label+'</button>'; }
HC_MQ.forEach(function(q){ var f=function(){ hcApply(); try{ if(sheetMode==="theme"){ var n=document.getElementById("hcNote"); if(n) n.textContent=hcNote(); } }catch(er){} };
  try{ q.addEventListener("change",f); }catch(er){ try{ q.addListener(f); }catch(er2){} } });
hcApply();
window.__hc=function(){ return {mode:hcMode(), sys:hcSys(), on:hcOn(), attr:document.documentElement.getAttribute("data-hc")}; };
window.__ask=function(m,o,c,a){ return ask(m,o,c,a); };

/* ================= SPRING ================= */
var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var SPR = {};
function spring(key, target, apply, opt){
  opt = opt || {};
  var k = opt.k || 260, c = 2*Math.sqrt(k)*(opt.zeta || 1);
  var s = SPR[key];
  if(!s){ s = SPR[key] = {x:target, v:0, t:target, raf:0}; }
  s.t = target; s.apply = apply; s.k = k; s.c = c;
  if(REDUCE || opt.instant){ s.x = target; s.v = 0; if(s.raf){cancelAnimationFrame(s.raf); s.raf=0;} apply(target); return; }
  if(s.raf) return;
  var last = performance.now();
  function step(now){
    var dt = Math.min(.032, (now-last)/1000); last = now;
    var f = -s.k*(s.x - s.t) - s.c*s.v;
    s.v += f*dt; s.x += s.v*dt;
    var eps=.002*Math.max(1,Math.abs(s.t));
    if(Math.abs(s.v) < eps && Math.abs(s.x - s.t) < eps){ s.x = s.t; s.v = 0; s.apply(s.x); s.raf = 0; return; }
    s.apply(s.x); s.raf = requestAnimationFrame(step);
  }
  s.raf = requestAnimationFrame(step);
}

/* ================= RENDER ================= */
function campName(){ var v=(S&&typeof S.camp==="string")?S.camp:((C&&C.office)||""); return String(v).trim(); }/* v30 RU133 */
function renderIdentity(){
  document.title = C.name+" | "+C.species+" "+clsLv();
  var cpn=campName(), mcp=$("#miniCamp"), icp=$("#idCamp"); if(mcp) mcp.textContent=cpn; if(icp){ icp.hidden=!cpn; icp.innerHTML=cpn?ico("ui-flag")+'<span>'+esc(cpn)+'</span>':""; }
  $("#officeName").textContent = cpn || C.office || "Character Record"; $("#officeSub").textContent = C.name+" \u2022 "+clsLv(); renderStamp();
  $("#miniName").textContent = C.name;
  $("#miniSub").textContent = C.species+" "+clsLv();
  $("#idTop").innerHTML = '<b>'+esc((C.office||"Character Record").toUpperCase())+'</b><span>'+(C.cardNo?'No. '+esc(C.cardNo):'Level '+D.level)+'</span>';
  $("#idName").textContent = C.name;
  var f=[["Species",C.species,grpSpec("species")],["Class",clsLv(),grpSpec("class")],[(x14()&&SL14[String(C.cls||"").split(/[\s/,]/)[0]])||"Subclass",C.sub,grpSpec("sub")],["Background",C.bg,grpSpec("bg")],["Size",C.size,"g:Size"]];
  $("#idF").innerHTML = f.filter(function(x){return x[1]}).map(function(x){return '<dt>'+x[0]+'</dt><dd>'+(x[2]?'<button type="button" class="tx" data-info="'+esc(x[2])+'">'+esc(x[1])+'</button>':esc(x[1]))+'</dd>'}).join("");
  $("#pbAside").innerHTML = '<button type="button" class="bd" data-bd="pb" style="border-radius:6px;padding:0 4px">Proficiency '+sg(D.pb)+'</button>';
  xpBox();/* v22 RU63 */
}
function renderAbilities(){
  var SC=setOf("ab")==="score";/* v25 RU38 no. 6: score on top */
  $("#abil").innerHTML = ABK.map(function(k){
    var key = !!(C.saves && C.saves[k]);
    return '<button type="button" class="ab bd'+(key?' key':'')+'" data-bd="ab-'+k+'" title="'+ABN[k]+'"><span class="k">'+ABN[k]+'</span><span class="ks" aria-hidden="true">'+k+'</span><span class="m">'+(SC?D.score[k]:sg(D.mod[k]))+'</span><span class="s">'+(SC?sg(D.mod[k]):D.score[k])+'</span><span class="sv">Save '+sg(D.save[k])+(key?' \u2022':'')+'</span></button>';
  }).join("");
}
function renderTiles(){
  var shield = '<svg viewBox="0 0 76 84" fill="none" aria-hidden="true"><path d="M38 3 71 14v25c0 21-14 36-33 42C19 75 5 60 5 39V14z" stroke="currentColor" stroke-width="2"/><path d="M38 9 65 18v21c0 17-11 30-27 35C22 69 11 56 11 39V18z" stroke="currentColor" stroke-width="1" opacity=".5"/></svg>';
  setTimeout(function(){ var tl=$("#tiles"); if(!tl) return; var pe=document.getElementById("pinsBox"); if(!pe){ pe=document.createElement("div"); pe.id="pinsBox"; tl.parentNode.insertBefore(pe,tl.nextSibling); } pe.innerHTML=pinnedH();
    var on=document.getElementById("oldNote"), pm=document.getElementById("p-main"); if(!on&&pm){ on=document.createElement("div"); on.id="oldNote"; pm.insertBefore(on,pm.firstChild); } if(on) on.innerHTML=oldNoteH(); },0);/* v27 RU35 no. 9, RU28 */
  $("#tiles").innerHTML =
    '<button type="button" class="tile ac bd" data-bd="ac">'+shield+'<span class="k">Armor Class</span><span class="v">'+D.ac+'</span></button>'+
    '<button type="button" class="tile bd" data-bd="init"><span class="k">Initiative</span><span class="v">'+sg(D.init)+'</span><span class="n">Dexterity'+cfFlags((CF0().chk||[]).concat(CF0().init||[]))+'</span></button>'+
    '<button type="button" class="tile bd" data-bd="speed"><span class="k">Speed</span><span class="v">'+D.speed+'<small>ft</small></span><span class="n">Walking</span></button>'+
    '<button type="button" class="tile bd" data-bd="pb"><span class="k">Proficiency</span><span class="v">'+sg(D.pb)+'</span><span class="n">Bonus</span></button>'+    (x14()&&athI()>=0?'<button type="button" class="tile bd" data-bd="sk-'+athI()+'"><span class="k">Grapple</span><span class="v">'+sg(D.skill[athI()])+'</span><span class="n">Athletics, contested</span></button>':'<button type="button" class="tile bd" data-bd="dc"><span class="k">Grapple DC</span><span class="v">'+D.dc+'</span><span class="n">Strength or Dexterity save</span></button>')+
    '<button type="button" class="tile insp press" id="insp" aria-pressed="'+S.insp+'"><span class="ib" role="button" aria-label="About Heroic Inspiration" data-info="g:Heroic Inspiration">i</span><span class="k">Heroic Inspiration</span><span class="gem"></span><span class="n" id="inspN">'+(S.insp?"Ready":"None")+'</span></button>';
}
function renderSkillsPage(){
  $("#saves").innerHTML = ABK.map(function(k){
    var on=!!(C.saves&&C.saves[k]);
    return '<div class="row'+(on?' pr':'')+'"><span class="dot'+(on?' on':'')+'"></span><span class="nm"><button type="button" class="tx" data-info="g:'+ABN[k]+'">'+k+'</button>'+cfFlags(cfSave(k))+'</span><button type="button" class="bonus bd" data-bd="save-'+k+'">'+sg(D.save[k])+'</button></div>';
  }).join("")+saveNotesH();
  renderSpeedDef();/* RU35 no. 7 */
  $("#senses").innerHTML =
    '<div class="sense"><button type="button" class="bonus bd" data-bd="pas-per">'+D.pas_per+'</button><button type="button" class="tx" data-info="g:Passive Perception">Passive Perception</button></div>'+
    '<div class="sense"><button type="button" class="bonus bd" data-bd="pas-ins">'+D.pas_ins+'</button><button type="button" class="tx" data-info="g:Insight">Passive Insight</button></div>'+
    '<div class="sense"><button type="button" class="bonus bd" data-bd="pas-inv">'+D.pas_inv+'</button><button type="button" class="tx" data-info="g:Investigation">Passive Investigation</button></div>'+
    (num(C.darkvision,0)?'<div class="sense"><button type="button" class="bonus bd" data-bd="dark">'+num(C.darkvision)+'</button><button type="button" class="tx" data-info="g:Darkvision">Darkvision, ft</button></div>':'')+
    senseList().map(function(x){ var s=x[0]; return '<div class="sense"><button type="button" class="bonus bd" data-bd="sense-'+x[1]+'">'+num(s.v,0)+'</button><button type="button" class="tx" data-bd="sense-'+x[1]+'">'+esc(s.n)+', ft</button></div>'; }).join(""); /* RU19 */
  $("#profs").innerHTML = profsH();/* v23 RU36 no. 7 */
  $("#skills").innerHTML = C.skills.map(function(s,i){
    var p=num(s.p,0);
    var flag = cfFlags(cfSkill(s))+(s.dis ? '<span class="flag" title="Disadvantage">DIS</span>' : (s.hb ? '<span class="flag hb" title="Retromistika Playtest, Skills">HB</span>' : ""));
    return '<div class="row'+(p?' pr':'')+'"><button type="button" class="pinb'+(pinOn(s.n)?' on':'')+'" data-pin="'+esc(s.n)+'" aria-pressed="'+pinOn(s.n)+'" aria-label="Pin '+esc(s.n)+' to the Main tab"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6l-1 6 4 3v2H6v-2l4-3z"/><path d="M12 14v7"/></svg></button><span class="dot'+(p?' on':'')+'"'+(p===2?' style="box-shadow:0 0 0 2px var(--panel),0 0 0 3.5px var(--stamp)"':'')+'></span><span class="ab3">'+s.ab+'</span><span class="nm">'+(GLOSS[s.n]?'<button type="button" class="tx" data-info="g:'+esc(s.n)+'">'+esc(s.n)+'</button>':esc(s.n))+flag+'</span><button type="button" class="bonus bd" data-bd="sk-'+i+'">'+sg(D.skill[i])+'</button></div>';
  }).join("");
  syncLang();
}
function langList(){ return S.lang.filter(function(x){return x && x.trim()}); }
function langText(){ var l = langList(); return l.length? l.map(esc).join(", ") : "Common"; }
function syncLang(){ var el=$("#langLine"); if(el) el.innerHTML = langText() + (langList().length<3 ? ' <span style="color:var(--faint)">('+(3-langList().length)+' open)</span>' : ""); }

/* m6: a pool resource (Lay on Hands, max 5 x level) shows the points left with - and + instead of one box per point */
function boxes(used,max,key,lbl,pool){ if(pool) return '<span class="pool"><button type="button" class="plb" data-k="'+key+'" data-pd="-1" aria-label="'+esc(lbl)+': spend 1">\u2212</button><input class="pli" type="number" inputmode="numeric" min="0" max="'+max+'" step="1" value="'+(max-used)+'" data-k="'+key+'" aria-label="'+esc(lbl)+': points left"><button type="button" class="plb" data-k="'+key+'" data-pd="1" aria-label="'+esc(lbl)+': restore 1">+</button><small>of '+max+'</small></span>';
  var h=""; for(var i=0;i<max;i++) h+='<button type="button" class="bx" aria-pressed="'+(i<used)+'" data-k="'+key+'" data-i="'+i+'" aria-label="'+esc(lbl)+' '+(i+1)+'"></button>'; return h; }
function used(k,max){ var u=num(S.used[k],0); return clamp(u,0,max); }
function luSub(r){
  var left=r.max-used(r.k,r.max);
  /* RU27: Hit Dice rows always count, also with one die */
  if(r.max===1&&!/^hd(-d\d+)?$/.test(r.k)) return left ? "Ready" : r.reset==="none" ? "Expended" : "Expended until a "+(r.reset==="long"?"Long Rest":"Short or Long Rest");
  return left+" of "+r.max+" left";
}
var actF="all";
function shortX(n,g){ return (/^(Maneuvers known|Eldritch Invocations|Metamagic Options)$/.test(g||"")||n==="Paladin's Smite")&&MAN_SUM[n]?MAN_SUM[n]:""; }/* v41 p10 */
function featAll(){ var o=[]; (C.features||[]).forEach(function(g,gi){ (g.items||[]).forEach(function(f,fi){ o.push({g:g.g,gi:gi,fi:fi,f:f,t:f.full||f.d||""}); }); }); return o; }
/* v35 p15 (RU129): card text is the short version, the popup has the full text. "At your level" is its own line */
/* v35 p15: numbers in short texts. "(DC 8 + PB + STR)", "(spell save DC)", "(DC 8 + PB + the ability you raised)" and "+ Fighter level" become the character's numbers */
function sumNums(t,cl){ var sc=scCls(cl), lv=clsLvls(), M=D.mod||{}, S0=t;
  t=t.replace(/\(DC 8 \+ PB \+ (STR|DEX|CON|INT|WIS|CHA)(?: or (STR|DEX|CON|INT|WIS|CHA))?\)/g,function(m,a,b){ return "DC "+(8+D.pb+Math.max(M[a]||0,b?(M[b]||0):-99)); });
  t=t.replace(/\(DC 8 \+ PB \+ the ability you raised\)/g,function(m){ var r=/\b(STR|DEX|CON|INT|WIS|CHA) \+[12]\b/.exec(S0); return r?"DC "+(8+D.pb+(M[r[1]]||0)):m; });
  t=t.replace(/\(spell save DC\)/g,function(m){ return sc&&sc.dc?"DC "+sc.dc:m; });
  t=t.replace(/\(Superiority Die\)/g,function(){ var f=lv.Fighter||D.level; return "1d"+(f>=18?12:f>=10?10:8); });/* v35 p18 */
  return t.replace(/\+ (Barbarian|Bard|Cleric|Druid|Fighter|Monk|Paladin|Ranger|Rogue|Sorcerer|Warlock|Wizard) level\b/g,function(m,c){ return lv[c]?"+ "+lv[c]:m; }); }
function aylSplit(t,cl){ t=sumNums(String(t||""),cl); var m=/\s*\*\*At your level:\*\*\s*([^]*?)\s*$/.exec(t); return m?{t:t.slice(0,m.index).replace(/\s+$/,""),a:m[1].replace(/\.$/,"")}:{t:t,a:""}; }
/* v35 p17 (RU129, card design): short text becomes number blocks. Label on top, big number below, Fail and Success chips, footer.
   Numbers come from the computed short text (sumNums) and from spCalc for spells. Classes .sum, .sum-p, .sum-ks, .sum-k, .sum-l, .sum-n, .sum-o, .sum-m stay stable for later skins */
var SUM_PILL={"Action":"time-action","Bonus Action":"time-bonus","Reaction":"time-reaction","On hit":"ui-target"};
var SUM_COND=["Blinded","Charmed","Deafened","Frightened","Grappled","Incapacitated","Invisible","Paralyzed","Petrified","Poisoned","Prone","Restrained","Stunned","Unconscious"];
var SUM_DT="Acid|Bludgeoning|Cold|Fire|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder";
function sumParse(t){ var s=String(t||""), o={p:"",k:[],o:[],m:[],yc:"",rest:""}, m;
  var yi=s.search(/\s*\*\*Your choice\.\*\*/); if(yi>=0){ o.yc=s.slice(yi).trim(); s=s.slice(0,yi); } var s0=s;
  m=/(^|\.\s+)(Bonus Action|Reaction|Magic action|Action)\b(:?)\s*/.exec(s); if(m){ o.p=m[2]==="Magic action"?"Action":m[2]; if(m[3]) s=s.slice(0,m.index+m[1].length)+s.slice(m.index+m[0].length); }
  if(!o.p&&/\bhit\b[^.]*\b(spend|Target)\b|\bafter a melee hit\b|\bSneak Attack hit\b|\bon a [^.]*\bhit\b/i.test(s)) o.p="On hit";
  m=new RegExp("Target (STR|DEX|CON|INT|WIS|CHA) save DC (\\d+)\\. Fail: ([^.]*)\\.(?: Success: ([^.]*)\\.)?").exec(s);
  if(m){ var fail=m[3], dm=new RegExp("^(\\d+d\\d+(?: ?\\+ ?\\d+)?) (?:damage of your ancestry type|("+SUM_DT+")(?: damage)?)(.*)$").exec(fail);
    if(dm){ o.k.push({l:"Damage",n:dm[1].replace(/ /g,""),t:dm[2]||"ancestry type"}); fail="full damage"+dm[3]; }
    o.k.unshift({l:"Save",n:m[1]+" "+m[2],ab:m[1]}); o.o.push({f:1,t:fail}); if(m[4]) o.o.push({f:0,t:m[4]}); s=s.replace(m[0],""); }
  m=/\bheal (\d+d\d+(?: ?\+ ?\d+)?)\.?/i.exec(s); if(m){ o.k.push({l:"Heal",n:m[1].replace(/ /g,"")}); s=s.replace(m[0],""); }
  o.s0=s0;
  var sen=s.split(/(?<=\.)\s+/).map(function(x){ return x.trim(); }).filter(function(x){ return x&&x!=="."; }), keep=[];
  sen.forEach(function(x){ var dm=/^Damage (\+?\d+d\d+)\s*(.*)$/.exec(x);
    if(dm){ o.k.unshift({l:"Damage",n:dm[1]}); var tl=dm[2].replace(/\.$/,"").replace(/^[,;:]\s*/,"").trim(); if(tl) keep.push(tl.replace(/^./,function(c){ return c.toUpperCase(); })+"."); return; }
    if(/^(Short Rest|Long Rest|Once per (Long|Short)|Uses equal|Large or smaller|Medium or smaller|Huge or smaller|Weapon or Unarmed Strike|Melee, weapon)/.test(x)) o.m.push(x.replace(/\.$/,"")); else keep.push(x); });
  if(!o.k.length) return null;
  o.rest=keep.join(" ").replace(/^[,:;]\s*/,"").replace(/^./,function(c){ return c.toUpperCase(); });
  if(!/[A-Za-z]{3}/.test(o.rest)) o.rest=s0.split(/(?<=\.)\s+/).filter(function(x){ return !/^(Short Rest|Long Rest|Once per (Long|Short)|Uses equal)/.test(x.trim()); }).join(" ").trim();/* the short sentence is never empty */
  return o; }
/* card short sentence: 14 px, main text color, up to 3 lines, no Show more (the popup has the full text). Your choice stays visible under it */
function sumText(t,cl){ var s=String(t||""), yi=s.search(/\s*\*\*Your choice\.\*\*/), yc=yi>=0?s.slice(yi).trim():""; if(yi>=0) s=s.slice(0,yi);
  return '<p class="sum-d sum-c">'+featNums(richP(fill(s)),cl)+'</p>'+(yc?'<p class="sum-d">'+fch(richP(fill(yc)))+'</p>':''); }
function sumPill(p){ return p?'<span class="sum-p">'+ico(SUM_PILL[p]||"act-action","sum-i")+'<span>'+esc(p)+'</span></span>':""; }
function sumLab(k){ var i=k.l==="Damage"?(k.t&&DT_ICON[k.t]?dtIcon(k.t):ico("ui-dice","sum-i")):k.l==="Save"?ico("ab-"+String(k.ab||"str").toLowerCase(),"sum-i"):k.l==="Heal"?ico("hp-heal","sum-i sum-heal"):k.l==="To hit"?ico("ui-target","sum-i"):ico("ui-range","sum-i");
  return '<small class="sum-l">'+i+'<span>'+esc(k.l)+'</span></small>'; }
function sumFoot(x){ var k=/Short Rest/.test(x)?"rest-short":/Long Rest/.test(x)?"rest-long":/Mastery/.test(x)?"item-weapon":/\barea\b|Sphere|Cone|Cube|Line|Cylinder|Emanation/.test(x)?"ui-area":/smaller|larger/.test(x)?"ui-users":/Weapon|weapon|Unarmed/.test(x)?"item-weapon":/\bft\b|feet|Touch|Self|mile/.test(x)?"ui-range":"ui-info"; return '<span>'+ico(k,"sum-i")+'<span>'+esc(x)+'</span></span>'; }
function sumChip(c){ var cd=SUM_COND.filter(function(n){ return new RegExp("\\b"+n+"\\b").test(c.t); })[0];
  return '<span class="sum-'+(c.f?'f':'s')+'">'+ico(c.f?(cd?"cond-"+cd.toLowerCase():"hp-damage"):"ui-shield","sum-i")+'<b>'+(c.f?"Fail":"Success")+'</b> '+esc(c.t)+'</span>'; }
