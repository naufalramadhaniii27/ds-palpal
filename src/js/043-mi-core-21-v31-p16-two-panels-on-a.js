/* ===== v31 p16 two panels on a computer (RU131) ===== */
var DOCKW=400;
function dockFits(){ var tz=(+document.documentElement.getAttribute("data-tsize")||100)/100; return !mq.matches&&window.innerWidth>=1100&&window.innerWidth-DOCKW>=Math.max(700,760*tz); }/* v35 p13: with Text Size 115 or 130 the side panel docks only when the sheet keeps room, else it floats over */
function dockable(mode){ return mode==="info"||mode==="bd"; }
function dockAnchor(){ var a=lastFocus&&lastFocus.isConnected&&lastFocus.closest&&lastFocus.closest("#pager")?lastFocus:null; if(!a){ var e=document.elementFromPoint(Math.max(10,(window.innerWidth-DOCKW)/3),window.innerHeight/2); a=e&&e.closest&&e.closest("#pager")?e:null; } return a; }
function dockLayout(on){ var root=document.documentElement; if(root.classList.contains("dk")===on) return; var a=dockAnchor(), y0=a?a.getBoundingClientRect().top:0;
  root.classList.toggle("dk",on); root.classList.toggle("dkn",on&&window.innerWidth-DOCKW<1000); if(on) root.style.setProperty("--dockw",DOCKW+"px");
  if(a&&a.isConnected){ var y1=a.getBoundingClientRect().top; if(Math.abs(y1-y0)>1) window.scrollBy(0,y1-y0); } moveTabInd(true); }
function dockApply(mode,wide){ var on=dockable(mode)&&!wide&&dockFits(); sheet.classList.toggle("dock",on); sheet.setAttribute("aria-modal",on?"false":"true"); if(on) $("#scrim").classList.remove("on"); dockLayout(on); }
function dockOff(){ dockLayout(false); }
window.addEventListener("resize",function(){ if(!sheet.classList.contains("on")||!sheet.classList.contains("dock")) return; if(!dockFits()){ sheet.classList.remove("dock"); sheet.setAttribute("aria-modal","true"); $("#scrim").classList.add("on"); dockLayout(false); } else { document.documentElement.classList.toggle("dkn",window.innerWidth-DOCKW<1000); } });
/* ===== v31 p17 drag to reorder (RU131) ===== */
ICO_TXT.unshift([/^On Hit$/i,"ui-target"]);ICO_FCAT["On Hit"]="ui-target";ICO["ui-target"]="M12 3a9 9 0 1 0 0.01 0M12 8.5a3.5 3.5 0 1 0 0.01 0M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4";ICO["ui-range"]="M3 12h18M6.5 8.5 3 12l3.5 3.5M17.5 8.5 21 12l-3.5 3.5";ICO["ui-area"]="M12 3a9 9 0 1 0 0.01 0M12 7.5a4.5 4.5 0 1 0 0.01 0M12 11.2a.8.8 0 1 0 0.01 0";/* v35 p17 */ICO["ui-contrast"]="M12 3a9 9 0 1 0 0.01 0M12 3v18M12 7h5.5M12 11h8.5M12 15h8M12 19h4.5";/* v35 p01 */ICO["ui-eye"]="M2 12c2.5-4.2 6-6.5 10-6.5s7.5 2.3 10 6.5c-2.5 4.2-6 6.5-10 6.5S4.5 16.2 2 12zM12 9.2a2.8 2.8 0 1 0 0 5.6a2.8 2.8 0 1 0 0-5.6";ICO["ui-keys"]="M3 7h18v10H3zM6.5 10h1M10 10h1M13.5 10h1M17 10h.5M7 14h10";/* v32 p27 */
ICO["ui-grip"]="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01";
/* v33 p03: builder icons */
ICO["step-home"]="M3 11.5L12 4l9 7.5M5.5 9.5V20h4.5v-5.5h4V20h4.5V9.5";
ICO["ui-box"]="M5 3.5h14a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5z";
ICO["ui-radio-on"]="M12 3a9 9 0 1 0 0.01 0M12 8.5a3.5 3.5 0 1 0 0.01 0";
ICO["item-pack"]="M8 6V4.5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 4.5V6M5 9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v10.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5zM8.5 13.5h7v4h-7zM5 11h14";
var ORD_ON={inv:0,feat:0}, DRG=null;
function ordLive(t){ var l=document.getElementById("v31live"); if(!l){ l=document.createElement("div"); l.id="v31live"; l.className="sr"; l.setAttribute("aria-live","polite"); document.body.appendChild(l); } l.textContent=""; setTimeout(function(){ l.textContent=t; },30); }
function ordKeyInv(row){ var b=row.querySelector(".iname[data-info]"), ix=b?+b.getAttribute("data-info").slice(3):-1, L=C.inv||[], it=L[ix]; if(!it) return null; var k=invKey(it), n=0; for(var j=0;j<ix;j++){ if(invKey(L[j])===k) n++; } return "i:"+k+"#"+n; }
function ordKeyFeat(card){ var b=card.querySelector("h4 .tx[data-info^='f:']"); if(!b) return null; var p=b.getAttribute("data-info").slice(2).split("."), g=(C.features||[])[+p[0]], f=g&&(g.items||[])[+p[1]]; return f?"f:"+g.g+"|"+f.n:null; }
var ORDL={inv:{body:"invBody",sel:".irow",key:ordKeyInv,name:function(r){ var b=r.querySelector(".iname b"); return b?b.textContent:"Item"; }},
          feat:{body:"featBody",sel:".fitem",key:ordKeyFeat,name:function(r){ var b=r.querySelector("h4 .tx"); return b?b.textContent:"Feature"; }}};
function ordRuns(list){ var o=ORDL[list], root=document.getElementById(o.body), out=[]; if(!root) return out;
  [root].concat([].slice.call(root.querySelectorAll(".fnest"))).forEach(function(par){ var cur=null; [].forEach.call(par.children,function(el){ if(el.matches(o.sel)){ if(!cur){ cur=[]; out.push(cur); } cur.push(el); } else cur=null; }); }); return out; }
function ordApply(list){ var O=(S.order&&S.order[list])||[]; if(!O.length) return; var rank={}, o=ORDL[list]; O.forEach(function(k,i){ rank[k]=i; });
  ordRuns(list).forEach(function(run){ if(run.length<2) return; var ks=run.map(o.key), ix=run.map(function(_,i){ return i; }), par=run[0].parentNode, after=run[run.length-1].nextSibling;
    ix.sort(function(a,b){ var ra=rank[ks[a]], rb=rank[ks[b]]; return (ra==null?1e6+a:ra)-(rb==null?1e6+b:rb); }); ix.forEach(function(i){ par.insertBefore(run[i],after); }); }); }
function ordOk(list){ if(list==="inv") return invF==="all"&&(C.inv||[]).length>1; return !featQ&&(C.features||[]).length>0; }
function ordUI(list){ var o=ORDL[list], root=document.getElementById(o.body); if(!root) return; var ok=ordOk(list), on=ok&&!!ORD_ON[list];
  root.classList.toggle("ord-on",on); if(!ok) return;
  var bar=document.createElement("div"); bar.className="ordbar"; bar.innerHTML='<span class="muted">'+(on?'Drag a handle, or focus it and use the arrow keys.':'')+'</span><button type="button" class="btn press ordb" data-ord="'+list+'" aria-pressed="'+on+'">'+ico(on?"ui-check":"ui-sort","ibt")+(on?'Done':'Reorder')+'</button>';
  var fil=root.querySelector(".ifil"); if(fil) fil.parentNode.insertBefore(bar,fil.nextSibling); else root.insertBefore(bar,root.firstChild);
  if(!on) return; ordRuns(list).forEach(function(run){ if(run.length<2) return; run.forEach(function(r,i){ var h=document.createElement("button"); h.type="button"; h.className="dragh press"; h.setAttribute("data-ordl",list);
    h.setAttribute("aria-label","Move "+o.name(r)+", "+(i+1)+" of "+run.length+". Drag, or use the up and down arrow keys"); h.innerHTML=ico("ui-grip","dgi"); r.appendChild(h); r.classList.add("ordr"); }); }); }
renderInv=(function(f){ return function(){ var r=f.apply(this,arguments); ordApply("inv"); ordUI("inv"); return r; }; })(renderInv);
renderFeat=(function(f){ return function(){ var r=f.apply(this,arguments); ordApply("feat"); ordUI("feat"); return r; }; })(renderFeat);
function ordRender(list){ if(list==="inv") renderInv(); else renderFeat(); }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-ord]"); if(!b) return; var l=b.getAttribute("data-ord"); ORD_ON[l]=ORD_ON[l]?0:1; ordRender(l);
  var nb=document.querySelector('[data-ord="'+l+'"]'); if(nb) nb.focus({preventScroll:true}); if(ORD_ON[l]) ordLive("Reorder on. Drag a handle, or focus it and use the arrow keys."); });
/* FLIP: rows slide from where they were to where they now are, on a spring */
function ordFlip(list,before){ ordRuns(list).forEach(function(run){ run.forEach(function(r){ var k=ORDL[list].key(r), y0=before[k]; if(y0==null) return; var d=y0-r.getBoundingClientRect().top; if(Math.abs(d)<1) return;
  var sk="ord|"+k, s=SPR[sk]; if(s&&s.raf) cancelAnimationFrame(s.raf); SPR[sk]={x:d,v:0,t:d,raf:0}; r.style.transform="translateY("+d+"px)"; r.classList.add("ord-fly");
  spring(sk,0,function(v){ if(!r.isConnected) return; r.style.transform=Math.abs(v)<.3?"":"translateY("+v.toFixed(1)+"px)"; if(Math.abs(v)<.3) r.classList.remove("ord-fly"); },{k:360,zeta:.82}); }); }); }
function ordTops(list){ var m={}; ordRuns(list).forEach(function(run){ run.forEach(function(r){ var k=ORDL[list].key(r); if(k) m[k]=r.getBoundingClientRect().top; }); }); return m; }
function ordCommit(list,run,newOrder,focusKey){ var o=ORDL[list], before=ordTops(list), ks=newOrder.map(o.key); if(DRG&&DRG.row){ before[o.key(DRG.row)]=DRG.row.getBoundingClientRect().top; }
  if(!S.order||typeof S.order!=="object") S.order={}; var O=(S.order[list]||[]).filter(function(k){ return ks.indexOf(k)<0; }); S.order[list]=O.concat(ks); save();
  ordRender(list); ordFlip(list,before);
  if(focusKey){ var row=null; ordRuns(list).forEach(function(rr){ rr.forEach(function(r){ if(o.key(r)===focusKey) row=r; }); }); var h=row&&row.querySelector(".dragh"); if(h) h.focus({preventScroll:true}); } }
function ordScroller(el){ return mq.matches?el.closest("#pager>section,.panel"):null; }
document.addEventListener("pointerdown",function(e){ var h=e.target.closest&&e.target.closest(".dragh"); if(!h||e.button>0) return; var list=h.getAttribute("data-ordl"), row=h.parentNode, run=null;
  ordRuns(list).forEach(function(r){ if(r.indexOf(row)>=0) run=r; }); if(!run||run.length<2) return; e.preventDefault(); try{ h.setPointerCapture(e.pointerId); }catch(er){}
  var sc=ordScroller(row), from=run.indexOf(row), rects=run.map(function(r){ return r.getBoundingClientRect(); });
  DRG={h:h,list:list,row:row,run:run,from:from,to:from,y0:e.clientY,st0:sc?sc.scrollTop:window.scrollY,sc:sc,tops:rects.map(function(b){ return b.top; }),hs:rects.map(function(b){ return b.height; }),y:e.clientY,raf:0};
  row.classList.add("dragging"); });
function ordShift(i,v){ var r=DRG.run[i]; spring("ordm|"+i,v,function(x){ r.style.transform=Math.abs(x)<.3?"":"translateY("+x.toFixed(1)+"px)"; },{k:420,zeta:.8}); }
function ordMove(){ if(!DRG) return; var D2=DRG, st=D2.sc?D2.sc.scrollTop:window.scrollY, dy=D2.y-D2.y0+(st-D2.st0), f=D2.from, hf=D2.hs[f];
  D2.row.style.transform="translateY("+dy.toFixed(1)+"px)";
  var c=D2.tops[f]+hf/2+dy, to=f; for(var i=0;i<D2.run.length;i++){ var mid=D2.tops[i]+D2.hs[i]/2; if(i>f&&c>mid) to=i; if(i<f&&c<mid&&to===f) to=i; }
  if(to!==D2.to){ D2.to=to; var step=(f<D2.run.length-1?D2.tops[f+1]-D2.tops[f]:hf+(D2.tops[f]-(f?D2.tops[f-1]+D2.hs[f-1]:D2.tops[f]))); var gap=Math.max(0,(f<D2.run.length-1?D2.tops[f+1]-(D2.tops[f]+hf):0)), sh=hf+gap;
    for(var j=0;j<D2.run.length;j++){ if(j===f) continue; ordShift(j,(f<to&&j>f&&j<=to)?-sh:(f>to&&j>=to&&j<f)?sh:0); } }
  /* near the edge of the scrolling area: scroll on */
  var top=D2.sc?D2.sc.getBoundingClientRect().top+(mq.matches?parseFloat(getComputedStyle(D2.sc).scrollPaddingTop)||0:0):72, bot=D2.sc?D2.sc.getBoundingClientRect().bottom:window.innerHeight, sp=D2.y<top+48?-10:D2.y>bot-48?10:0;
  if(sp){ if(D2.sc) D2.sc.scrollTop+=sp; else window.scrollBy(0,sp); D2.raf=requestAnimationFrame(ordMove); } else D2.raf=0; }
document.addEventListener("pointermove",function(e){ if(!DRG) return; if(!DRG.row.isConnected){ DRG=null; return; } DRG.y=e.clientY; if(!DRG.raf) DRG.raf=requestAnimationFrame(ordMove); });
function ordEnd(cancel){ var D2=DRG; if(!D2) return; if(D2.raf) cancelAnimationFrame(D2.raf); D2.row.classList.remove("dragging");
  D2.run.forEach(function(r,i){ var s=SPR["ordm|"+i]; if(s){ if(s.raf) cancelAnimationFrame(s.raf); delete SPR["ordm|"+i]; } });
  if(cancel||D2.to===D2.from||!D2.row.isConnected){ var before=ordTops(D2.list); D2.run.forEach(function(r){ r.style.transform=""; }); DRG=null; ordFlip(D2.list,before); return; }
  var arr=D2.run.slice(); arr.splice(D2.from,1); arr.splice(D2.to,0,D2.row); var nm=ORDL[D2.list].name(D2.row), k=ORDL[D2.list].key(D2.row);
  var before2=ordTops(D2.list); DRG=null; var o=ORDL[D2.list], ks=arr.map(o.key);
  if(!S.order||typeof S.order!=="object") S.order={}; S.order[D2.list]=(S.order[D2.list]||[]).filter(function(x){ return ks.indexOf(x)<0; }).concat(ks); save(); ordRender(D2.list); ordFlip(D2.list,before2);
  ordLive(nm+" moved to position "+(D2.to+1)+" of "+arr.length+"."); }
document.addEventListener("pointerup",function(){ if(DRG) ordEnd(false); });
document.addEventListener("pointercancel",function(){ if(DRG) ordEnd(true); });
document.addEventListener("keydown",function(e){ if(DRG&&e.key==="Escape"){ e.stopPropagation(); ordEnd(true); return; }
  var h=e.target.closest&&e.target.closest(".dragh"); if(!h) return; var k=e.key; if(k!=="ArrowUp"&&k!=="ArrowDown"&&k!=="Home"&&k!=="End") return; e.preventDefault();
  var list=h.getAttribute("data-ordl"), row=h.parentNode, run=null; ordRuns(list).forEach(function(r){ if(r.indexOf(row)>=0) run=r; }); if(!run) return;
  var i=run.indexOf(row), j=k==="ArrowUp"?i-1:k==="ArrowDown"?i+1:k==="Home"?0:run.length-1; if(j<0||j>=run.length||j===i) return;
  var arr=run.slice(); arr.splice(i,1); arr.splice(j,0,row); var nm=ORDL[list].name(row), key=ORDL[list].key(row); ordCommit(list,run,arr,key); ordLive(nm+" moved to position "+(j+1)+" of "+run.length+"."); },true);
/* ===== v31 p18 breakdown rows one by one (RU131) ===== */
showEntry=(function(f){ return function(en){ var r=f.apply(this,arguments), b=$("#sheetBody"); b.classList.remove("stag");
  if(en&&en.type==="bd"&&!REDUCE){ [].forEach.call(b.querySelectorAll(".bk-r,.bk-t"),function(x,i){ x.style.setProperty("--i",i); }); void b.offsetWidth; b.classList.add("stag"); } return r; }; })(showEntry);
refreshEntry=(function(f){ return function(){ var b=$("#sheetBody"); if(b) b.classList.remove("stag"); return f.apply(this,arguments); }; })(refreshEntry);
/* ===== v31 p19 scroll position per tab (RU132) ===== */
var TABY={};
function tabsTop(){ var d=document.querySelector(".detail"), t=$("#tabs"); if(!d||!t) return 0; var st=parseFloat(getComputedStyle(t).top)||0; return Math.max(0,Math.round(d.getBoundingClientRect().top+window.scrollY-st)); }
setTab=(function(f){ return function(id,focus,instant){ var from=activeTab, pc=!mq.matches&&id!==from; if(pc) TABY[from]=window.scrollY;
  var r=f.apply(this,arguments); if(pc){ var top=tabsTop(), y=TABY[id]; if(y!=null&&y>top){ window.scrollTo(0,y); var got=window.scrollY, again=function(){ if(activeTab===id&&window.scrollY===got&&Math.abs(got-y)>1){ window.scrollTo(0,y); got=window.scrollY; } }; requestAnimationFrame(again); setTimeout(again,120); setTimeout(again,300); } else if(window.scrollY>top) window.scrollTo(0,top); } return r; }; })(setTab);
/* ===== v31 p21 HP bars on the compositor ===== */
var SPRE=null;
/* the same spring as spring(), sampled once into a linear() easing, so the browser runs it off the main thread */
function springEase(k,zeta){ var c=2*Math.sqrt(k)*zeta, x=0, v=0, dt=1/240, t=0, pts=[0], step=0;
  while(t<3){ var f=-k*(x-1)-c*v; v+=f*dt; x+=v*dt; t+=dt; if(++step%6===0) pts.push(Math.round(x*1000)/1000); if(t>.2&&Math.abs(1-x)<.002&&Math.abs(v)<.02) break; }
  pts.push(1); var lin=window.CSS&&CSS.supports&&CSS.supports("animation-timing-function","linear(0, 1)");
  return {d:Math.round(t*1000), e:lin?"linear("+pts.join(",")+")":"cubic-bezier(.2,.8,.2,1)"}; }
function barTo(el,p,instant,bc){ if(!el) return; var t="scaleX("+(Math.round(p*1000)/1000)+")"; if(bc&&el.__bc!==bc){ el.__bc=bc; el.style.backgroundColor=bc; } if(el.__t===t) return;
  var from=null; if(!instant&&!REDUCE&&el.__t!=null&&el.animate){ from=(el.__a&&el.__a.playState==="running")?getComputedStyle(el).transform:el.__t; }
  if(el.__a){ try{ el.__a.cancel(); }catch(er){} el.__a=null; } el.__t=t; el.style.transform=t;
  if(from&&from!==t&&from!=="none"){ var e=SPRE||(SPRE=springEase(120,.9)); try{ el.__a=el.animate([{transform:from},{transform:t}],{duration:e.d,easing:e.e}); }catch(er){ el.__a=null; } } }
if(BAD.length) recover("Saved data",BAD.join(" | ")); else { applyLook();renderAll(true); renderNotes(); syncPortrait(); }
/* ===== v34 p01 RU85: Edit mode. Tap a number to set your own value (S.cust), Use calculated, Reset all, ask() after Apply ===== */
var CU0={}, EDM=false, cuMT=0;
/* the S.cust key and field behind a number on the sheet (data-bd key), with its label, kind, and limits */
function cuqOf(key){ var m, k=String(key||"");
  if((m=/^ab-([A-Z]{3})$/.exec(k))&&ABN[m[1]]) return {k:"n:"+k,f:"o",fb:"b",t:ABN[m[1]]+" score",kind:"int",min:1,max:30};
  if((m=/^save-([A-Z]{3})$/.exec(k))&&ABN[m[1]]) return {k:"n:"+k,f:"o",fb:"b",t:ABN[m[1]]+" save",kind:"sgn",min:-20,max:30};
  if((m=/^sk-(\d+)$/.exec(k))){ var s=(C.skills||[])[+m[1]]; return s?{k:"n:sk:"+s.n,f:"o",fb:"b",t:s.n,kind:"sgn",min:-20,max:30}:null; }
  if((m=/^pas-(per|ins|inv)$/.exec(k))) return {k:"n:"+k,f:"o",fb:"b",t:"Passive "+({per:"Perception",ins:"Insight",inv:"Investigation"})[m[1]],kind:"int",min:0,max:60};
  if(k==="ac") return {k:"n:ac",f:"o",fb:"b",t:"Armor Class",kind:"int",min:0,max:60};
  if(k==="init") return {k:"n:init",f:"o",fb:"b",t:"Initiative",kind:"sgn",min:-20,max:30};
  if(k==="speed") return {k:"n:speed",f:"o",fb:"b",t:"Speed",kind:"ft",min:0,max:999};
  if(k==="dc") return {k:"n:dc",f:"o",fb:"b",t:"Grapple DC",kind:"int",min:0,max:60};
  if(k==="hp") return {k:"hp",f:"hpOver",t:"Hit Point Maximum",kind:"int",min:1,max:9999};
  if((m=/^(ah|ad)-(\d+)$/.exec(k))){ var a=(C.attacks||[])[+m[2]]; if(!a) return null; return m[1]==="ah"?{k:"a:"+a.n,f:"ho",fb:"hb",t:a.n+" to hit",kind:"sgn",min:-20,max:40}:{k:"a:"+a.n,f:"do",fb:"db",t:a.n+" damage",kind:"dmg"}; }
  if((m=/^sp(atk|dc)(-[A-Z]{3})?$/.exec(k))&&C.spellcasting) return {k:"n:sp"+m[1]+(m[2]||""),f:"o",t:(m[1]==="atk"?"Spell Attack":"Spell Save DC")+(m[2]?" ("+m[2].slice(1)+")":""),kind:m[1]==="atk"?"sgn":"int",min:m[1]==="atk"?-20:0,max:m[1]==="atk"?40:60};
  return null; }
function cuqSet(q){ if(!q) return false; if(q.k==="hp") return num(S.hpOver,0)>0; var c=cuK(q.k); if(!c) return false; var e=function(f){ return f&&c[f]!=null&&c[f]!==""; }; return e(q.f)||e(q.fb); }
function cuqCur(key){ var b=B[key]; if(!b) return ""; var t=String(b.total).replace(/−/g,"-"); return t; }
function cuqCalc(q,key){ var c=q.k==="hp"?CU0.hp:CU0[q.k+"|"+q.f]; if(c==null||!cuqSet(q)) c=cuqCur(key); return c; }
function cuqFmt(q,v){ if(v===""||v==null) return "--"; if(q.kind==="dmg") return String(v); var n=Number(String(v).replace(/−/g,"-").replace(/[^0-9+-]/g,"")); if(isNaN(n)) return String(v); return q.kind==="sgn"?sg(n):q.kind==="ft"?n+" ft":String(n); }
function cuqHTML(key){ var q=cuqOf(key); if(!q) return '<p class="info-d">This number cannot be set here.</p>'; var set=cuqSet(q), cur=cuqCur(key), calc=cuqCalc(q,key), dmg=q.kind==="dmg";
  var val=dmg?String(cur).replace(/-/g,"−"):String(parseInt(String(cur).replace(/[^0-9+-]/g,""),10));
  return '<div class="cuq">'+(set?'<p class="cuq-st cu-on-t">'+ico("ui-pen")+'<span>Set by you. Calculated value: <b>'+esc(cuqFmt(q,calc))+'</b></span></p>':'<p class="cuq-st">'+ico("ui-info")+'<span>Calculated value: <b>'+esc(cuqFmt(q,calc))+'</b></span></p>')+
    '<label class="cu-f"><span>'+(dmg?"Damage shown":"Number shown")+(q.kind==="ft"?" (feet)":"")+'</span><input id="cuqIn" data-cuqk="'+esc(key)+'" type="'+(dmg?"text":"number")+'"'+(dmg?' maxlength="40" autocomplete="off" spellcheck="false"':' inputmode="numeric" step="1" min="'+q.min+'" max="'+q.max+'"')+' value="'+esc(val==="NaN"?"":val)+'">'+
    '<small>'+(dmg?"Dice and numbers, like 1d8+3.":"A whole number from "+q.min+" to "+q.max+".")+(q.kind==="sgn"?" Type 5 for +5.":"")+'</small></label><p class="cuq-err" id="cuqErr" role="alert" hidden></p>'+
    '<div class="cu-btns"><button type="button" class="btn press pri" data-cuqsave="'+esc(key)+'">'+ico("ui-check")+'<span>Save</span></button>'+(set?'<button type="button" class="btn press" data-cuqback="'+esc(key)+'">'+ico("ui-undo")+'<span>Use calculated</span></button>':'')+'</div>'+
    '<p class="bk-f"><button type="button" class="lk" data-bd="'+esc(key)+'">'+ico("ui-info")+'How it is calculated</button></p></div>'; }
function cuqBackH(key){ var q=cuqOf(key); if(!q||!cuqSet(q)) return ""; return '<div class="info-act cu-act"><button type="button" class="btn press" data-cuqback="'+esc(key)+'">'+ico("ui-undo")+'<span>Use calculated ('+esc(cuqFmt(q,cuqCalc(q,key)))+')</span></button></div>'; }
function cuqErr(m){ var e=$("#cuqErr"), i=$("#cuqIn"); if(e){ e.innerHTML=ico("toast-warn")+'<span>'+esc(m)+'</span>'; e.hidden=false; } if(i){ i.setAttribute("aria-invalid","true"); try{ i.focus({preventScroll:true}); }catch(er){} } }
function cuqSave(key){ var q=cuqOf(key); if(!q) return; var i=$("#cuqIn"), raw=String(i&&i.value||"").trim(), v;
  if(raw===""){ cuqErr(cuqSet(q)?"Type a number, or tap Use calculated.":"Type a number first."); return; }
  if(q.kind==="dmg"){ if(!/^[0-9dD+\-−\s]+$/.test(raw)||!/\d/.test(raw)){ cuqErr("Use dice and numbers only, like 2d6+3."); return; } v=raw.replace(/\s+/g,"").replace(/D/g,"d").replace(/-/g,"−"); }
  else { var n=Number(raw.replace(/−/g,"-")); if(!isFinite(n)||Math.round(n)!==n){ cuqErr("Type a whole number."); return; } if(n<q.min||n>q.max){ cuqErr("Use a number from "+q.min+" to "+q.max+"."); return; } v=n; }
  undoMark("Edit "+q.t);
  if(q.k==="hp"){ var om=D.hpmax; S.hpOver=v; derive(); if(S.hp!=null&&D.hpmax>om) S.hp=Math.min(D.hpmax,S.hp+(D.hpmax-om)); }
  else { S.cust=S.cust&&typeof S.cust==="object"?S.cust:{}; var o=S.cust[q.k]&&typeof S.cust[q.k]==="object"?S.cust[q.k]:{}; o[q.f]=v; S.cust[q.k]=o; }
  save(); renderAll(); closeSheet(); toastU(q.t+": "+cuqFmt(q,v)+", set by you."); }
function cuqBack(key){ var q=cuqOf(key); if(!q||!cuqSet(q)) return; undoMark("Calculated "+q.t);
  if(q.k==="hp") delete S.hpOver;
  else { var o=S.cust[q.k]; delete o[q.f]; if(q.fb) delete o[q.fb]; if(!Object.keys(o).length) delete S.cust[q.k]; if(!Object.keys(S.cust).length) delete S.cust; }
  save(); renderAll(); if(sheetMode==="cuq") closeSheet(); else refreshEntry(); toastU(q.t+" uses the calculated value again."); }
/* numbers set by you: [cust key, field] (names, notes, and item weights are not numbers on the sheet) */
function cuNumList(){ var L=[], F={n:["o","b"],a:["ho","hb","db","do"],s:["dc","atk"]}, c=S.cust&&typeof S.cust==="object"?S.cust:{};
  Object.keys(c).forEach(function(k){ var f=F[k.charAt(0)]; if(!f||!c[k]||typeof c[k]!=="object") return; f.forEach(function(x){ if(c[k][x]!=null&&c[k][x]!=="") L.push([k,x]); }); });
  if(num(S.hpOver,0)>0) L.push(["hp","hpOver"]); return L; }
function cuResetAll(){ var L=cuNumList(); if(!L.length){ toast("No numbers are set by you. Every number is calculated."); return; }
  ask("Set "+L.length+" number"+(L.length>1?"s":"")+" back to the calculated value"+(L.length>1?"s":"")+"? Names and notes you added stay.","Reset All",function(){ undoMark("Reset all numbers");
    L.forEach(function(p){ if(p[0]==="hp"){ delete S.hpOver; return; } var o=S.cust[p[0]]; if(!o) return; delete o[p[1]]; if(!Object.keys(o).length) delete S.cust[p[0]]; });
    if(S.cust&&!Object.keys(S.cust).length) delete S.cust; save(); renderAll(); toastU("Every number uses the calculated value again."); }); }
/* marks: cu-ed (can be set in Edit mode), cu-on (set by you), a small pen icon */
function cuMark(){ $$("[data-bd]").forEach(function(el){ if(el.closest("#sheet,#edmBar,.ps")) return; var q=cuqOf(el.getAttribute("data-bd")), on=!!(q&&cuqSet(q));
    el.classList.toggle("cu-ed",!!q); el.classList.toggle("cu-on",on);
    var p=el.querySelector(":scope > .cu-pen"); if(q&&!p) el.insertAdjacentHTML("beforeend",'<i class="cu-pen" aria-hidden="true">'+ico("ui-pen")+'</i>'); else if(!q&&p) p.remove();
    if(on) el.setAttribute("aria-describedby","cuSrTxt"); else if(el.getAttribute("aria-describedby")==="cuSrTxt") el.removeAttribute("aria-describedby"); });
  if(!document.getElementById("cuSrTxt")){ var sp=document.createElement("span"); sp.id="cuSrTxt"; sp.hidden=true; sp.textContent="Set by you"; document.body.appendChild(sp); }
  edmCount(); }
function cuMarkSoon(){ if(cuMT) return; cuMT=setTimeout(function(){ cuMT=0; try{ cuMark(); }catch(er){} },0); }
["renderAll","renderActions","renderSpells","renderSkillsPage","renderTiles","renderAbilities","syncHP"].forEach(function(n){ var f={renderAll:renderAll,renderActions:renderActions,renderSpells:renderSpells,renderSkillsPage:renderSkillsPage,renderTiles:renderTiles,renderAbilities:renderAbilities,syncHP:syncHP}[n];
  var w=function(){ var r=f.apply(this,arguments); cuMarkSoon(); return r; };
  if(n==="renderAll") renderAll=w; else if(n==="renderActions") renderActions=w; else if(n==="renderSpells") renderSpells=w; else if(n==="renderSkillsPage") renderSkillsPage=w; else if(n==="renderTiles") renderTiles=w; else if(n==="renderAbilities") renderAbilities=w; else syncHP=w; });
function edmBar(){ var w=document.getElementById("edmBar"); if(w) return w; w=document.createElement("div"); w.id="edmBar"; w.className="edm-bar"; w.setAttribute("role","region"); w.setAttribute("aria-label","Edit mode"); w.hidden=true;
  w.innerHTML='<div class="edm-t">'+ico("ui-pen","edm-i")+'<span><b>Edit mode</b><small id="edmN">Tap a number to change it.</small></span></div><div class="edm-b">'+
    '<button type="button" class="btn press" id="edFormBtn" aria-label="Edit details: names, lists, and text">'+ico("ui-file")+'<span>Details</span></button>'+
    '<button type="button" class="btn press" id="edmReset" aria-label="Reset all numbers to the calculated values">'+ico("ui-undo")+'<span>Reset all</span></button>'+
    '<button type="button" class="btn press pri" id="edmDone" aria-label="Done, leave Edit mode">'+ico("ui-check")+'<span>Done</span></button></div>';
  document.body.appendChild(w);
  w.addEventListener("click",function(e){ if(e.target.closest("#edFormBtn")){ edmSet(false,true); openEditor(); return; } if(e.target.closest("#edmReset")){ cuResetAll(); return; } if(e.target.closest("#edmDone")){ edmSet(false); } });
  return w; }
function edmCount(){ var n=document.getElementById("edmN"); if(!n) return; var c=cuNumList().length; n.textContent=c?c+" number"+(c>1?"s":"")+" set by you. Tap one to change it.":"Tap a number to change it."; }
function edmPos(){ var bar=document.getElementById("edmBar"); if(!bar||bar.hidden) return; var nb=document.getElementById("bnav"), off=12;
  if(nb&&nb.offsetParent){ var r=nb.getBoundingClientRect(); if(r.height&&r.top<window.innerHeight) off=Math.max(12,Math.round(window.innerHeight-r.top+8)); }
  bar.style.bottom="calc("+off+"px + env(safe-area-inset-bottom,0px)*"+(off>12?0:1)+")"; document.body.style.setProperty("--edmh",(bar.offsetHeight+off+12)+"px"); }
function edmSet(on,quiet){ EDM=!!on; document.body.classList.toggle("edm",EDM); var b=$("#editBtn"); if(b) b.setAttribute("aria-pressed",String(EDM));
  if(window.__moreSet) window.__moreSet(false);
  var bar=edmBar(); bar.hidden=!EDM; if(EDM){ cuMark(); edmPos(); } }
window.addEventListener("resize",function(){ if(EDM) edmPos(); });
/* in Edit mode a tap on a number opens its editor instead of the breakdown */
document.addEventListener("click",function(e){ if(!EDM) return; var t=e.target.closest&&e.target.closest("[data-bd]"); if(!t||t.closest("#sheet,#edmBar")) return; var k=t.getAttribute("data-bd"); if(!cuqOf(k)) return;
  e.preventDefault(); e.stopPropagation(); showEntry({type:"cuq",key:k},false); setTimeout(function(){ var i=$("#cuqIn"); if(i&&window.matchMedia&&window.matchMedia("(hover:hover)").matches) try{ i.focus({preventScroll:true}); i.select(); }catch(er){} },120); },true);
document.addEventListener("click",function(e){ var s=e.target.closest&&e.target.closest("[data-cuqsave]"); if(s){ cuqSave(s.getAttribute("data-cuqsave")); return; }
  var b=e.target.closest&&e.target.closest("[data-cuqback]"); if(b){ cuqBack(b.getAttribute("data-cuqback")); } });
document.addEventListener("keydown",function(e){ var t=e.target;
  if(e.key==="Enter"&&t&&t.id==="cuqIn"){ e.preventDefault(); cuqSave(t.getAttribute("data-cuqk")); return; }
  if((e.key==="Enter"||e.key===" ")&&t&&t.getAttribute&&t.getAttribute("role")==="button"&&t.hasAttribute("data-bd")&&t.tagName!=="BUTTON"){ e.preventDefault(); t.click(); return; }
  if(e.key==="Escape"&&EDM&&!sheet.classList.contains("on")&&!document.querySelector(".ask")) edmSet(false); });
document.addEventListener("input",function(e){ if(e.target&&e.target.id==="cuqIn"){ var er=$("#cuqErr"); if(er) er.hidden=true; e.target.removeAttribute("aria-invalid"); } });
/* Apply from the builder keeps S.cust. When the calculated value behind a number set by you changes, ask */
function cuSnap(){ var o={}; cuNumList().forEach(function(p){ var f=p[1]; if(f==="b"||f==="hb"||f==="db") return; var k=p[0]==="hp"?"hp":p[0]+"|"+f, v=p[0]==="hp"?CU0.hp:CU0[k]; if(v!=null) o[k]=v; }); return o; }
function cuLbl(k){ if(k==="hp") return "Hit Point Maximum"; var m=/^([nas]):(.*)\|(\w+)$/.exec(k); if(!m) return k; if(m[1]==="a") return m[2]+(m[3]==="do"?" damage":" to hit");
  var x=m[2], t={ac:"Armor Class",init:"Initiative",speed:"Speed",dc:"Grapple DC","pas-per":"Passive Perception","pas-ins":"Passive Insight","pas-inv":"Passive Investigation",spatk:"Spell Attack",spdc:"Spell Save DC"}[x];
  if(t) return t; if(/^ab-/.test(x)) return (ABN[x.slice(3)]||x)+" score"; if(/^save-/.test(x)) return (ABN[x.slice(5)]||x)+" save"; if(/^sk:/.test(x)) return x.slice(3); if(/^sp(atk|dc)-/.test(x)) return (/atk/.test(x)?"Spell Attack":"Spell Save DC")+" ("+x.slice(-3)+")"; return x; }
function cuAfterApply(before){ var after=cuSnap(), ch=[]; Object.keys(after).forEach(function(k){ if(k in before&&String(before[k])!==String(after[k])) ch.push(k); }); if(!ch.length) return;
  var fm=function(k,v){ return /init|save-|sk:|spatk|\|ho$/.test(k)&&typeof v==="number"?sg(v):String(v); };
  ask("Apply changed the calculated value behind "+(ch.length>1?ch.length+" numbers":"a number")+" you set:\n"+ch.map(function(k){ return cuLbl(k)+": calculated "+fm(k,before[k])+" is now "+fm(k,after[k]); }).join("\n")+"\nCancel keeps your numbers.","Use New",function(){
    undoMark("Use calculated values"); ch.forEach(function(k){ if(k==="hp"){ delete S.hpOver; return; } var i=k.lastIndexOf("|"), ck=k.slice(0,i), f=k.slice(i+1), o=S.cust&&S.cust[ck]; if(!o) return; delete o[f]; if(f==="o") delete o.b; if(f==="ho") delete o.hb; if(f==="do") delete o.db; if(!Object.keys(o).length) delete S.cust[ck]; });
    if(S.cust&&!Object.keys(S.cust).length) delete S.cust; save(); renderAll(); toastU("Those numbers use the calculated values again."); }); }
(function(f){ if(typeof f!=="function") return; window.__sheetApply=function(){ var before={}; try{ derive(); before=cuSnap(); }catch(er){} var r=f.apply(this,arguments); try{ cuAfterApply(before); }catch(er){} return r; }; })(window.__sheetApply);
window.__edm=function(on){ if(on!=null) edmSet(!!on,true); return EDM; }; window.__cuNum=function(){ return cuNumList(); };
