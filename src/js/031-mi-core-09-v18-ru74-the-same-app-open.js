/* v18 RU74: the same app open in two tabs. A change saved in the other tab is loaded here at once, so a later save here does not undo it.
   If the other tab opened a different character, the shared slots now hold that character: this tab pauses (FROZEN "stale") and asks for a reload */
var MYID=(function(){ var r=null; try{ r=JSON.parse(lsGet(RKEY)||"null"); }catch(e){} return r&&r.active||""; })();
var HAD_ROSTER=lsGet("cs-roster-v1")!=null, WN_SHOW=false, WN_FROM=0;
var PUBLIC_FRESH=PUBLIC_BUILD&&!HAD_ROSTER&&lsGet(CKEY)==null;/* v24 p08: a blank sheet instead of the sample */ if(PUBLIC_FRESH) window.__publicFresh=1;
function startup(r){ var wv=+lsGet("cs-ui-ver")||0;
  /* v18 RU59: "What's new" once after an update. A first visit (no characters saved yet) starts at this version without it */
  if(!wv&&!HAD_ROSTER){ try{ localStorage.setItem("cs-ui-ver",String(APP_VER)); }catch(e){} } else { WN_SHOW=wv<APP_VER; WN_FROM=wv||APP_VER-1; if(WN_SHOW) try{ localStorage.setItem("cs-ui-ver",String(APP_VER)); }catch(e){} }
  if(WN_SHOW){ var w=document.getElementById("homeV"); if(w&&!w.hidden){ var p=w.querySelector(".hslots"); if(p&&!document.getElementById("hwnB")) p.insertAdjacentHTML("afterend",wnBanner()); } }
  /* RL47: data written by a newer version */
  if(newerApp(C)||newerApp(S)||newerApp(r)) toast("Some data was saved by a newer version of this app. This version keeps the parts it does not know.");
  /* v18 RU48 (d): a daily copy of the open character */
  if(lsGet(CKEY)!=null){ var L=(snGet().chars[r.active]||[]); if(!L.length||Date.now()-L[0].t>864e5) snTake(r.active,"Daily copy",r); }
  updUnsaved(); }
function stale(){ if(FROZEN) return; FROZEN="stale"; clearTimeout(saveT); clearTimeout(cSaveT); var w=document.createElement("div"); w.id="staleV"; w.className="bkp"; w.setAttribute("role","alertdialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","staleT");
  w.innerHTML='<div class="bkpb"><div class="bkph"><b id="staleT">Paused: open in another tab</b></div><p>This app is open in another tab, and that tab switched to a different character. To keep that character safe, this tab saves nothing until you reload it.</p><div class="bkpr"><button type="button" class="btn pri press" data-stale="1">Reload</button></div></div>';
  w.addEventListener("click",function(e){ if(e.target.closest("[data-stale]")){ sessionStorage.setItem("cs-skip","1"); __miReload(); } }); document.body.appendChild(w); }
/* v32 p32 RU131: BroadcastChannel next to the storage event */
var TABID=Math.random().toString(36).slice(2), BC=null, EXT_LAST={};
try{ if(typeof BroadcastChannel==="function"){ BC=new BroadcastChannel("cs-sync"); BC.onmessage=function(m){ var d=m&&m.data; if(!d||d.from===TABID||!d.k) return; extChange(d.k,"bc"); }; } }catch(e){ BC=null; }
function bcPost(k){ if(!BC) return; try{ if(bkpKeyOk(k)) BC.postMessage({k:k,from:TABID}); }catch(e){} }
window.__bcOn=function(){ return !!BC; };
window.addEventListener("storage",function(e){ extChange(e.key,"st"); });
function extChange(key,via){ if(FROZEN||!key||!bkpKeyOk(key)) return; var raw=lsGet(key); if(EXT_LAST[key]===raw) return; EXT_LAST[key]=raw; var e={key:key};
  if(key===CKEY||key===KEY){ EXT_LAST[key===KEY?CKEY:KEY]=lsGet(key===KEY?CKEY:KEY); }
  var r=null; try{ r=JSON.parse(lsGet(RKEY)||"null"); }catch(er){} if(r&&r.active&&MYID&&r.active!==MYID){ stale(); return; }
  if(e.key===CKEY||e.key===KEY){ var c2=loadC(true), s2=loadS(true); if(!c2||!s2) return; var pend=!!saveT||SPEND, pendC=!!cSaveT; clearTimeout(saveT); clearTimeout(cSaveT); saveT=null; cSaveT=null;
    /* V18-2: a change made here in the last 150 ms is not thrown away: fields changed here since the last save are laid over the other tab's data */
    var remoteN=JSON.stringify(s2); if(pend) s2=mergeS(s2);
    if(pendC) c2=C; C=c2; S=s2; S_BASE=remoteN; S_RAW=lsGet(KEY); if(pend) save(); if(pendC) saveC();
    try{ applyLook(); renderAll(true); renderNotes(); syncPortrait(); }catch(er){} if(sheet&&sheet.classList&&sheet.classList.contains("on")){ try{ refreshEntry(); }catch(er){} } return; }
  if(e.key===BKEY&&window.__bldReload){ window.__bldReload(); return; }
  if(e.key===RKEY){ var w=document.getElementById("homeV"); if(w&&!w.hidden){ var g=document.getElementById("hgrid"); if(g) g.innerHTML=homeCards(true); } } }
document.getElementById("rosterBtn").addEventListener("click",showHome);
setTimeout(function(){if(FROZEN)return;var r=rEnsure();Object.keys(r.chars).forEach(function(id){if(!r.chars[id].created)r.chars[id].created=r.chars[id].t||Date.now()});rSave(r);MYID=r.active;startup(r);if(sessionStorage.getItem("cs-skip")==="1"){sessionStorage.removeItem("cs-skip");var ce=localStorage.getItem("cs-edit"),cn=localStorage.getItem("cs-new");if(ce)localStorage.removeItem("cs-edit");if(ce||cn){var tries=0,st=function(){(function go(){if(!window.__bldOpen&&window.__bldNeed)window.__bldNeed();if(cn&&!ce)return;if(window.__bldOpen)window.__bldOpen();else if(tries++<100)setTimeout(go,50)})()};/* v100: one frame first, so the message is on screen before the builder loads */if(window.requestAnimationFrame)requestAnimationFrame(function(){setTimeout(st,0)});else setTimeout(st,30)}return}/* V18-7: the builder script may load after this timer */showHome()},0);
/* V14-4: Apply keeps the game state (HANDOFF section 6). Damage taken stays the same when Hit Point maximum changes, used boxes stay (used() clamps to the new maximum) */
/* v18 RL47: a sheet written by a newer version keeps the fields this version does not produce */
function keepNewer(p){ if(newerApp(C)) Object.keys(C).forEach(function(k){ if(!(k in p)) p[k]=C[k]; }); return p; }
window.__sheetApply=function(p,note){ if(!p||!p.abilities) return; if(lsGet(CKEY)!=null) snTake(MYID||(rGet()||{}).active,"Before Apply from the builder");/* v18 RU48 (d) */ var om=(D&&D.hpmax)||0, oh=S.hp; C=keepNewer(p); if(Array.isArray(p.lang)&&p.lang.length){ S.lang=p.lang.slice(); save(); }
  if(oh!=null&&om){ try{ derive(); S.hp=clamp(oh+(D.hpmax-om),0,D.hpmax); }catch(er){ S.hp=null; } } else S.hp=null; if(!S.used) S.used={}; save(); saveC(); renderAll(); renderNotes(); var gq=S.coins?num(S.coins.gp,0)+num(C.gp,0)-num(S.coinBase,num(C.gp,0)):0; if(note!==false) toast(gq<0?"Sheet updated. Starting gold is now lower than the gold you spent, so Gold shows 0.":note||"Sheet updated from builder"); };/* v24 p08: quiet for the blank first sheet */
window.__sheetName=function(){ return C&&C.name; };
window.__sheetRerender=function(){ renderAll(); };
window.__sheetSoft=function(p){ if(!p||!p.abilities) return; C=keepNewer(p); saveC(); renderAll(); };
window.__sheetState=function(){ return {C:C, lang:S.lang}; };
window.__D=function(){ return D; };/* v35 p05 */
/* v32 RL51 test hook: the Actions tab of another C (from __bldSheetFor) without saving it: entries per category and attack rows. The sheet is restored */
window.__actProbe=function(C2){ var C0=C, S0=JSON.stringify(S), F0=actF, out=null; try{ C=C2; S=JSON.parse(S0); actF="all"; derive(); renderActions();
  var b=document.getElementById("actBody"), cat="", res={action:[],onhit:[],bonus:[],reaction:[],other:[],rows:[]};
  Array.prototype.forEach.call(b.children,function(el){ if(el.matches("h3.fcat")){ var t=el.textContent; cat=/^On Hit/.test(t)?"onhit":/^Bonus/.test(t)?"bonus":/^Reactions/.test(t)?"reaction":/^Other/.test(t)?"other":/^Actions/.test(t)?"action":"limited"; return; }
    var its=el.matches(".aonhit")?Array.prototype.slice.call(el.querySelectorAll(":scope > .aitem")):[el];/* v35 p18: On Hit cards sit in a wrapper */
    its.forEach(function(el){ if(el.matches(".aitem")&&res[cat]){ var h=el.querySelector("h4"), tx=h.querySelector(".tx"), mu=h.querySelector(".muted"); res[cat].push({n:(tx||h).textContent, s:mu?mu.textContent:"", bx:!!el.querySelector(".bx,.pool,.supd,.hpips"), t:(el.querySelector("p")||{}).textContent||""}); } });
    if(el.matches(".arow")){ var bx=el.querySelectorAll(".abox"), nm=el.querySelector(".an .tx"); res.rows.push({c:cat, n:nm?nm.textContent:"", hit:bx[0]?bx[0].textContent:"", dmg:bx[1]?bx[1].textContent:""}); } });
  out=res; } finally { C=C0; S=JSON.parse(S0); actF=F0; derive(); renderActions(); } return out; };
/* RL40: id of the open character in My Characters. The builder keeps it in B.cid, so the Build button always opens this character's build */
window.__sheetId=function(){ var r=rGet(); if(!r||!r.chars||!r.chars[r.active]){ r=rEnsure(); rSave(r); } return r.active; };
/* RL40: "Start a new character" in the builder makes a new character in My Characters (as Create a Character). The open one keeps its build */
window.__sheetNew=function(){ var r=rEnsure(); rSnap(r); var nid="c"+Date.now(); r.chars[nid]={name:"New Character",created:Date.now(),t:Date.now()}; sessionStorage.setItem("cs-skip","1"); rLoad(r,nid,true); };
document.getElementById("bldBtn").addEventListener("click",function(){ if(window.__bldOpen) window.__bldOpen(); });
$("#editBtn").addEventListener("click",function(){ edmSet(!EDM); });/* v34 RU85: Edit mode. The old form is in the bar (Details) */
/* v30 C1: phone header. My Characters, Edit, Settings, and PDF sit in the More menu (computer: the same buttons in the header row) */
/* v32 p36: full header only when it fits on one line, measured (phones keep their own header) */
function hdrFits(){ var A=document.querySelector(".band .acts"), of=document.querySelector(".band .office"); if(!A) return true;
  var vis=function(e){ var r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(e).display!=="none"; };
  var lines=function(el){ var tops={}, w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT), n, k=0; while((n=w.nextNode())){ if(!n.textContent.trim()) continue; var r=document.createRange(); r.selectNodeContents(n); Array.prototype.forEach.call(r.getClientRects(),function(q){ if(q.width>0&&!tops[Math.round(q.top)]){ tops[Math.round(q.top)]=1; k++; } }); } return k; };
  var txtOut=function(b){ var br=b.getBoundingClientRect(), w=document.createTreeWalker(b,NodeFilter.SHOW_TEXT), n, out=false; while((n=w.nextNode())){ if(!n.textContent.trim()) continue; var r=document.createRange(); r.selectNodeContents(n); Array.prototype.forEach.call(r.getClientRects(),function(q){ if(q.width>0&&(q.left<br.left-.5||q.right>br.right+.5||q.top<br.top-.5||q.bottom>br.bottom+.5)) out=true; }); } return out; };/* the label leaves its button (a dot drawn outside, like the Build dot, does not count) */
  if(A.scrollWidth>A.clientWidth+1) return false;
  var bs=Array.prototype.slice.call(A.querySelectorAll("button")).filter(vis);
  for(var i=0;i<bs.length;i++){ var b=bs[i]; if(lines(b)>1||txtOut(b)||b.getBoundingClientRect().right>innerWidth+.5) return false; }
  if(of&&vis(of)){ var ob=of.querySelector("b"); if(ob&&lines(ob)>1) return false; if(of.getBoundingClientRect().right>A.getBoundingClientRect().left-4) return false; }
  return true; }
var HDR_RAF=0;
function hdrFit(){ HDR_RAF=0; var R=document.documentElement; if(mq.matches){ R.removeAttribute("data-hdrc"); return; }
  var bd=document.querySelector(".band .band-in"); if(!bd||!bd.getBoundingClientRect().width) return;/* header not shown (builder open): measure when it shows */
  var was=R.hasAttribute("data-hdrc"); if(was) R.removeAttribute("data-hdrc"); var ok=hdrFits(); if(!ok){ R.setAttribute("data-hdrc","1"); } else if(was){ var mm=document.getElementById("moreMenu"); if(mm&&mm.classList.contains("open")&&window.__moreSet) window.__moreSet(false); } }
function hdrSoon(){ if(!HDR_RAF) HDR_RAF=requestAnimationFrame(hdrFit); }
window.__hdrFit=function(){ hdrFit(); return document.documentElement.hasAttribute("data-hdrc"); };
window.addEventListener("resize",hdrSoon); try{ mq.addEventListener("change",hdrSoon); }catch(e){}
try{ if(document.fonts&&document.fonts.ready) document.fonts.ready.then(hdrSoon); if(document.fonts&&document.fonts.addEventListener) document.fonts.addEventListener("loadingdone",hdrSoon); }catch(e){}
(function(){ var A=document.querySelector(".band .acts"), O=document.querySelector(".band .office"); try{ var mo=new MutationObserver(hdrSoon); if(A) mo.observe(A,{attributes:true,subtree:true,attributeFilter:["hidden"]}); if(O) mo.observe(O,{childList:true,subtree:true,characterData:true}); mo.observe(document.documentElement,{attributes:true,attributeFilter:["data-tsize","data-skin"]}); }catch(e){}
  try{ var bd=document.querySelector(".band .band-in"), lw=-1; if(bd&&window.ResizeObserver) new ResizeObserver(function(){ var w=Math.round(bd.getBoundingClientRect().width); if(w!==lw){ lw=w; hdrSoon(); } }).observe(bd); }catch(e){} })();
hdrSoon(); setTimeout(hdrSoon,400);
(function(){ var mb=$("#moreBtn"), mm=$("#moreMenu"); if(!mb||!mm) return;
  function set(on){ mm.classList.toggle("open",!!on); mb.setAttribute("aria-expanded",on?"true":"false"); }
  window.__moreSet=set;
  mb.addEventListener("click",function(){ var on=!mm.classList.contains("open"); set(on); });
  document.addEventListener("click",function(e){ if(!mm.classList.contains("open")||(e.target.closest&&e.target.closest("#moreBtn"))) return; set(false); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&mm.classList.contains("open")){ set(false); try{ mb.focus({preventScroll:true}); }catch(er){} } });
})();

/* sheet body delegation: breakdown, conditions, editor */
$("#sheetBody").addEventListener("click",function(e){
  if(sheetMode==="cust"){ var cb2=e.target.closest("[data-cusave],[data-cureset]"); if(cb2){ cuSave(cb2.dataset.cusave||cb2.dataset.cureset, !!cb2.dataset.cureset); } return; }/* v26 RU38 no. 2 */
  if(sheetMode==="spman"){ if(e.target.closest("[data-info]")) return; var sb=e.target.closest("button"); if(!sb) return; var sd=sb.dataset;/* v25 RU38 no. 3 */
    if(sd.spmt){ if(sb.disabled) return; spmToggle(sd.spmt,sd.spmc); return; } if(sd.spmcls){ spmCls=sd.spmcls; spmLv="all"; spmRefresh(); return; } if(sd.spml!=null){ spmLv=sd.spml; spmRefresh(); return; } return; }
  if(sheetMode==="theme"){ if(e.target.closest("[data-hpgo]")){ closeSheet(); if(window.__bldGo) window.__bldGo("class"); return; }
    if(e.target.closest("[data-keysopen]")){ keysOpen(); return; }/* v32 p27 */
    var snb=e.target.closest("[data-snrs],[data-snnow]"); if(snb){ var sid=MYID||(rGet()||{}).active; if(snb.hasAttribute("data-snrs")){ snRestore(sid,+snb.getAttribute("data-snrs")); return; }
      if(SN_BAD){ toast("Snapshots cannot be saved: the snapshot list on this device is damaged"); return; } var rr0=rSnap(rEnsure()), b0=(snGet().chars[sid]||[]), h0=b0[0]&&b0[0].h; snTake(sid,"Taken by hand",rr0); var b1=snGet().chars[sid]||[]; toast(b1[0]&&b1[0].h!==h0?"Snapshot taken":"No changes since the last snapshot");
      var sb3=$("#sheetBody"), st3=sb3.scrollTop; sb3.innerHTML=settingsHTML(); sb3.scrollTop=st3; return; }/* v32 p33 */
    var tb=e.target.closest(".thb"); if(!tb) return; var dd=tb.dataset;
    if(dd.hpm){ var df=[]; try{ df=window.__bldDiff?window.__bldDiff(C)||[]:[]; }catch(er){ df=[]; } undoMark("Hit Points setting"); var hm2=window.__bldHpMode&&window.__bldHpMode(dd.hpm,!df.length); if(!hm2){ UNDO=null; return; }
      renderAll(); toastU("Hit Points: "+(dd.hpm==="roll"?"rolled":"fixed (average)")+"."+(df.length?" The sheet has its own edits, so it keeps its numbers until you press Build, then Apply.":" Maximum HP is "+D.hpmax+".")); }/* v25 RU38 no. 6 */
    if(dd.hc){ hcSet(dd.hc); toast(dd.hc==="auto"?"High contrast follows your device. It is "+(hcOn()?"on":"off")+" now.":"High contrast is "+(hcOn()?"on":"off")+"."); var sb4=$("#sheetBody"), st4=sb4.scrollTop; sb4.innerHTML=settingsHTML(); sb4.scrollTop=st4; return; }/* v35 p01 */
    if(dd.thm!=null){ S.theme=dd.thm; if(document.startViewTransition&&!REDUCE){ var vde=document.documentElement; vde.style.setProperty("--vtx",(e.clientX||innerWidth/2)+"px"); vde.style.setProperty("--vty",(e.clientY||innerHeight/2)+"px"); vde.classList.add("mi-themevt"); try{ var tvt=document.startViewTransition(function(){ applyTheme(); }); var tve=function(){ vde.classList.remove("mi-themevt"); }; tvt.finished.then(tve,tve); }catch(er){ vde.classList.remove("mi-themevt"); applyTheme(); } } else applyTheme(); }/* v55: circular reveal */ if(dd.thc) S.color=dd.thc; if(dd.thk) S.skin=dd.thk; if(dd.ths) S.sym=dd.ths;
    if(dd.thf!=null){ if(dd.thf) S.frame=dd.thf; else delete S.frame; } if(dd.thd!=null){ if(dd.thd) S.bdrop=dd.thd; else delete S.bdrop; } if(dd.set){ var kv=dd.set.split(":"); setPut(kv[0],kv[1]); renderAll(); }/* v25 */
    save(); applyLook(); var sb2=$("#sheetBody"), st2=sb2.scrollTop; sb2.innerHTML=settingsHTML(); sb2.scrollTop=st2; return; }
  if(sheetMode==="cond"){
    var c=e.target.closest("[data-c]");
    if(c){ var k=c.getAttribute("data-c"); undoMark((S.cond[k]?"Remove ":"Add ")+k); if(S.cond[k]) delete S.cond[k]; else S.cond[k]=true; c.setAttribute("aria-pressed",!!S.cond[k]); if(c.classList.contains("chip")) c.classList.toggle("on",!!S.cond[k]); var cc=c.closest(".cc"); if(cc) cc.classList.toggle("on",!!S.cond[k]); save(); renderAll(); return; }/* v22 RU53 */
    var x=e.target.closest("[data-exh]");
    if(x){ undoMark("Exhaustion",1); exhTo(S.exh+(+x.getAttribute("data-exh"))); x.parentNode.querySelector("output").textContent=S.exh; return; }
    var bu=e.target.closest("[data-burn]");
    if(bu){ S.burn=clamp(S.burn+(+bu.getAttribute("data-burn")),1,20); bu.parentNode.querySelector("output").textContent=S.burn; save(); renderConds(); }
    return;
  }
  if(sheetMode==="edit"){
    var t=e.target.closest("[data-edtab]");
    if(t){ edTab=t.getAttribute("data-edtab"); $$("#sheetBody [data-edtab]").forEach(function(b){ b.classList.toggle("on",b===t); }); $$("#sheetBody .ed-sec").forEach(function(s){ s.classList.toggle("on", s.getAttribute("data-sec")===edTab); }); t.scrollIntoView({block:"nearest",inline:"center",behavior:REDUCE?"auto":"smooth"}); $("#sheetBody").scrollTop=0; return; }
    var a=e.target.closest("[data-act]"); if(!a) return;
    var act=a.getAttribute("data-act");
    if(act==="add"){ var list=getPath(C,a.getAttribute("data-list")); if(!Array.isArray(list)){ list=[]; setPath(C,a.getAttribute("data-list"),list); } list.push(TPL[a.getAttribute("data-tpl")]()); saveC(); renderAll(); rerenderEditor(); return; }
    if(act==="del"){ var l2=getPath(C,a.getAttribute("data-list")), di=+a.getAttribute("data-i"); if(a.getAttribute("data-list")==="inv"&&l2[di]) bldSync(l2[di].key||l2[di].n,{del:1});/* RU18-2 */ l2.splice(di,1); saveC(); renderAll(); rerenderEditor(); return; }
    if(act==="impApply"){ var raw=($("#impTxt")||{}).value||""; var p=null; try{ p=JSON.parse(raw.trim()); }catch(err){} if(!p||p.v!==3||!p.abilities||!Array.isArray(p.skills)){ toast("That text isn't a valid exported build"); return; } ask("Replace the current build with "+(p.name||"the imported character")+"? Notes, HP, and conditions stay.","Replace",function(){ C=p; if(Array.isArray(p.lang)&&p.lang.length){ S.lang=p.lang.slice(); save(); } saveC(); renderAll(); rerenderEditor(); toast("Imported "+(p.name||"build")); }); return; }
    if(act==="impCopy"){ var txt=JSON.stringify(C), ta=$("#impTxt"); if(ta){ ta.value=txt; ta.select(); } var done=function(){toast("Build copied")}; if(navigator.clipboard) navigator.clipboard.writeText(txt).then(done,function(){toast("Text placed in the box. Copy it manually")}); else toast("Text placed in the box. Copy it manually"); return; }
    if(act==="reset"){ ask("Reset every build value to the original Yudhi Kelapa build? Notes, HP, and conditions stay.","Reset",function(){ C=clone(DEFAULT); saveC(); renderAll(); rerenderEditor(); toast("Build reset to original"); }); return; }
  }
});
$("#sheetBody").addEventListener("change",function(e){
  if(sheetMode!=="edit") return;
  var a=e.target;
  if(a.getAttribute("data-act")==="save"){ var k=a.getAttribute("data-k"); if(!C.saves) C.saves={}; if(a.checked) C.saves[k]=C.cls+" class (PHB-2024)"; else delete C.saves[k]; saveC(); renderAll(); rerenderEditor(); return; }
  if(a.hasAttribute("data-p") && (a.tagName==="SELECT"||a.type==="checkbox")) editInput(a);
});
$("#sheetBody").addEventListener("input",function(e){
  var t=e.target;
  if(sheetMode==="cond" && t.id==="jinxN"){ var v=parseInt(t.value,10); S.jinx = isNaN(v)?"":String(clamp(v,1,20)); save(); renderConds(); return; }
  if(sheetMode==="edit" && t.hasAttribute("data-p") && t.tagName!=="SELECT" && t.type!=="checkbox") editInput(t);
});
function editInput(el){
  var path=el.getAttribute("data-p"), t=el.getAttribute("data-t"), v;
  if(t==="b") v=el.checked; else if(t==="n"){ v=num(el.value, NaN); if(isNaN(v)) return; } else v=el.value;
  if(path==="level") v=clamp(Math.round(v),1,20);
  if(path==="wallet.gp"){ var cw=coinsNow(); cw.gp=Math.max(0,Math.floor(v)); undoMark("Gold"); coinSet(cw); renderInv(); return; }/* v34 p06 */
  var oldNm=C.name;
  /* RU31: Worn ticked in the Edit form on armor or a Shield of a hand-filled sheet: AC as the Inventory checkbox (RU29) */
  var wm=/^inv\.(\d+)\.eq$/.exec(path), wi=wm&&(C.inv||[])[+wm[1]], wfx=null;
  if(wi&&wi.att&&v&&!eqOn(wi)&&attCount()>=attMaxC()){ toast("You can attune to at most "+attMaxC()+" magic items. Unattune one first."); rerenderEditor(); return; }/* M18 */
  if(wi&&!wi.key&&!eqLinked(wi)&&!!v!==eqOn(wi)&&window.__bldArmor){ try{ wfx=window.__bldArmor({C:JSON.parse(JSON.stringify(C)),lang:S.lang},wi.n,!!v); }catch(er){ wfx=null; } }
  /* V14-2: worn armor or Shield renamed in the Edit form: its AC bonus is taken off first (as unticking it), the item is no longer worn */
  var rn=/^inv\.(\d+)\.n$/.exec(path), ri=rn&&(C.inv||[])[+rn[1]], rOld=ri&&ri.n, rfx=null;
  if(ri&&!ri.key&&rOld!==v&&eqOn(ri)&&!eqLinked(ri)&&window.__bldArmor){ try{ rfx=window.__bldArmor({C:JSON.parse(JSON.stringify(C)),lang:S.lang},rOld,false); }catch(er){ rfx=null; } }
  setPath(C,path,v);
  /* RU31: an item renamed in the Edit form is looked up again in the item database (type, checkbox, details). Unknown names stay Gear */
  var nm=/^inv\.(\d+)\.n$/.exec(path), ni=nm&&(C.inv||[])[+nm[1]]; if(ni&&!ni.key){ ["type","html","equippable","att","gear","cost"].forEach(function(f){ delete ni[f]; }); var nmt=window.__itemMeta&&window.__itemMeta(v); if(nmt&&nmt.w) ni.w=nmt.w; }/* V14-9: weight from the tables */
  if(rfx){ var racd=armorFx(rfx,ri); ri.eq=false; bldSync(rOld,{del:1}); saveC(); scheduleRender(); toast(racd?"Unequipped "+rOld+". Armor Class is now "+(derive(),D.ac)+".":"Unequipped "+rOld+"."); return; }
  if(wfx&&armorFx(wfx,wi)){ saveC(); scheduleRender(); toast((wi.eq?"Equipped. ":"Unequipped. ")+"Armor Class is now "+(derive(),D.ac)+"."); return; }
  /* RL40: a new name typed here also renames the saved build of this character */
  if(path==="name"&&v&&oldNm!==v){ try{ if(window.__bldRename) window.__bldRename(oldNm,v); }catch(er){} }
  /* RU18-2: Qty and Worn of an item, edited here, also go to the saved build of the same character (as N2) */
  var im=/^inv\.(\d+)\.(q|eq)$/.exec(path), ii=im&&(C.inv||[])[+im[1]]; if(ii) bldSync(ii.key||ii.n, im[2]==="q"?{q:v,occ:occOf(ii)}:{eq:!!v,occ:occOf(ii)});
  saveC(); scheduleRender();
}

/* ================= GLOBAL CLICK DELEGATION ================= */
document.addEventListener("click",function(e){
  var inSheet=!!e.target.closest("#sheet");
  var ct=e.target.closest("[data-condtoggle]"); if(ct){ var ck=ct.getAttribute("data-condtoggle"); undoMark((S.cond[ck]?"Remove ":"Add ")+ck); if(S.cond[ck]) delete S.cond[ck]; else S.cond[ck]=true; save(); renderAll(); refreshEntry(); return; }
  var inf=e.target.closest("[data-info]"); if(inf && sheetMode!=="edit"){ e.preventDefault(); if(!inSheet) swpSet(inf); showEntry({type:"info",spec:inf.getAttribute("data-info")}, inSheet); return; }
  var bd=e.target.closest("[data-bd]"); if(bd && sheetMode!=="edit"){ showEntry({type:"bd",key:bd.getAttribute("data-bd")}, inSheet); return; }
  if(e.target.closest("#insp")){ undoMark("Heroic Inspiration"); S.insp=!S.insp; save(); var b=$("#insp"); b.setAttribute("aria-pressed",S.insp); $("#inspN").textContent=S.insp?"Ready":"None"; vbSync(); return; }
  if(e.target.closest("#condOpen")){ showEntry({type:"cond"},false); return; }
  var off=e.target.closest("#conds [data-off]"); if(off){ undoMark("Remove "+off.getAttribute("data-off")); delete S.cond[off.getAttribute("data-off")]; save(); renderAll(); return; }
  var swb=e.target.closest("[data-swp]"); if(swb){ if(!swb.disabled) swpMove(+swb.getAttribute("data-swp")); return; }/* v36 p18 */
  var uf=e.target.closest("[data-usef]"); if(uf&&!uf.disabled){ var up=uf.getAttribute("data-usef").split("|"), ur=(D.res||[]).filter(function(q){return q.k===up[0]})[0]; if(ur){ undoMark("Limited Use",1); var ulf=clamp(ur.max-used(up[0],ur.max)+(+up[1]),0,ur.max); S.used[up[0]]=ur.max-ulf; save(); syncLU(); refreshEntry(); toast((+up[1]<0?"Used ":"Gave back ")+esc(ur.n||"")+". "+ulf+" left"); } return; }/* v36 p17 */
  var plb=e.target.closest(".plb[data-k]"); if(plb){ var pk=plb.getAttribute("data-k"), pr=(D.res||[]).filter(function(q){return q.k===pk})[0]; if(pr){ undoMark("Limited Use",1); var lf=clamp(pr.max-used(pk,pr.max)+(+plb.getAttribute("data-pd")),0,pr.max); S.used[pk]=pr.max-lf; save(); syncLU(); } return; }
  var bx=e.target.closest("#lu .bx, #featBody .bx, #actBody .bx, #spBody .bx, #sheetBody .bx[data-k]"); if(bx){ var k=bx.getAttribute("data-k"), i=+bx.getAttribute("data-i"); undoMark(/^s\d$/.test(k)?"Spell slot":k==="hd"?"Hit Dice":"Limited Use"); S.used[k] = (num(S.used[k],0)===i+1) ? i : i+1; save(); syncLU(); return; }
  var rest=e.target.closest("[data-rest]"); if(rest){ openRest(rest.getAttribute("data-rest")); return; }/* RU41 */
  var pip=e.target.closest("#dsS .pip, #dsF .pip"); if(pip){ undoMark("Death Saving Throw"); var which=pip.parentNode.id==="dsS"?0:1, pi=+pip.getAttribute("data-i"); S.ds[which]=(S.ds[which]===pi+1)?pi:pi+1; save(); syncDeath(); if(S.ds[0]===3) toast("Stable at 0 Hit Points"); if(S.ds[1]===3) toast("Three failures. Your character dies"); return; }
});
function doRest(kind,quiet){ sitReset(kind==='short'?'short':'long'); var ex0=num(S.exh,0), hp14=(kind!=="short"&&x14())?hdPlan():null;/* v94 */ if(S.mode){ if(kind==="short"){ ["rage","sacred","wings","radiance","shroud"].forEach(function(k){ delete S.mode[k]; }); } else delete S.mode; }/* v22: Rage, Sacred Weapon, and Celestial Revelation last minutes, Wild Shape hours */
  D.res.forEach(function(r){
    var u=num(S.used[r.k],0);
    if(kind==="short"){ if(r.reset==="short") u=0; else if(r.reset==="short1") u=Math.max(0,u-1); }    else if(hp14&&hp14[r.k]!=null) u=Math.max(0,u-hp14[r.k]);/* v94: 2014, half of the Hit Dice come back */
    else { if(r.reset!=="none") u=0; }
    S.used[r.k]=u;
  });
  if(kind==="short"){ if(!quiet) toast("Short Rest: uses restored."); }
  else { var before=S.hp; S.hp=D.hpmax; S.tmp=0; S.ds=[0,0]; if(S.exh>0) S.exh--; if(S.hp>before) flash("healed"); if(hasFeat("Resourceful")&&!S.insp){ S.insp=true; try{ renderTiles(); }catch(er){} }/* v21 RU54 */ if(!quiet) toast(x14()?"Long Rest: Hit Points, up to half of your Hit Dice, and every use restored.":"Long Rest: Hit Points, Hit Dice, and every use restored."); }  save(); syncHP(); syncLU(); renderConds();
  if(kind!=="short"&&ex0>0){ try{ renderAll(); }catch(er){} }/* v94: a lower Exhaustion level changes Speed, checks, and (2014) the Hit Point maximum, so the sheet is worked out again */
}
["#notesBody","#descBody"].forEach(function(sel){ var nb=$(sel); if(nb) nb.addEventListener("input",function(e){/* v23: Description tab too */
  var t=e.target;
  if(t.hasAttribute("data-note")){ S.notes[t.getAttribute("data-note")]=t.value; save(); }
  else if(t.hasAttribute("data-lang")){ S.lang[+t.getAttribute("data-lang")]=t.value; save(); syncLang(); }
  else if(t.id==="n-align"){ S.align=t.value; save(); }
  else if(t.id==="n-camp"){ S.camp=t.value; save(); renderIdentity(); }/* v30 RU133 */
}); });
(function(){
  var inp=$("#hpAmt");
  function amt(){ var v=parseInt(inp.value,10); return isNaN(v)?0:Math.max(0,v); }
  function nudge(){ inp.focus(); inp.classList.remove("nudge"); void inp.offsetWidth; inp.classList.add("nudge"); clearTimeout(nudge.t); nudge.t=setTimeout(function(){ inp.classList.remove("nudge"); },900); }
  $("#healBtn").addEventListener("click",function(){ var a=amt(); if(!a){nudge();return;} undoMark("Healing"); var wasZero=S.hp===0, before=S.hp; S.hp=Math.min(D.hpmax,S.hp+a); if(wasZero) S.ds=[0,0]; if(S.hp>before){ flash("healed"); hpFloat("+"+(S.hp-before),"heal"); } inp.value=""; save(); syncHP(); toastU("Healed "+(S.hp-before)+" "+hpWord(S.hp-before)+"."); });
  $("#dmgBtn").addEventListener("click",function(){ var a=amt(); if(!a){nudge();return;} undoMark("Damage"); var a0=a, fromTmp=Math.min(S.tmp,a); S.tmp-=fromTmp; a-=fromTmp; var before=S.hp; S.hp=Math.max(0,S.hp-a); if(S.hp<before){ flash("hit"); hpFloat("\u2212"+(before-S.hp),"dmg"); } else if(fromTmp) hpFloat("\u2212"+fromTmp+" temp","tmp"); inp.value="";
    var cm="", z0=before===0&&a>0&&S.ds&&S.ds[1]<3&&!(S.exh>=6); if(z0){ S.ds=S.ds.slice(); if(S.ds[0]>=3) S.ds[0]=0; S.ds[1]=Math.min(3,S.ds[1]+1); }/* v32 p26: damage at 0 Hit Points is a failure */
    if(before>0&&S.hp===0) DS_OVER=Math.max(0,a-before)>=D.hpmax?a-before:0;
    if(concOf()&&S.hp===0) cm=" "+concEnd("0 Hit Points"); save(); syncHP(); renderConds();
    if(before>0 && S.hp===0){ toastU("0 Hit Points. Start making Death Saving Throws."+cm); if(mq.matches&&curPage!==0&&!sheet.classList.contains("on")) hpOpen(); else if(!sheet.classList.contains("on")) setTimeout(function(){ var g=document.getElementById("dsGuide"); if(g&&g.scrollIntoView) g.scrollIntoView({block:"nearest",behavior:REDUCE?"auto":"smooth"}); },480); }
    else if(z0) toastU("Took "+a0+" damage at 0 Hit Points: one Death Saving Throw failure ("+S.ds[1]+" of 3)."+(S.ds[1]>=3?" Your character dies.":" A Critical Hit counts as two: use Critical Hit under Death Saves."));
    else toastU("Took "+a0+" damage"+(fromTmp?" ("+fromTmp+" from Temporary Hit Points)":"")+".");
    if(concOf()) concCheck(a0); });/* v21 RU57, RU50 */
  inp.addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); (e.shiftKey?$("#healBtn"):$("#dmgBtn")).click(); } });
  $$("[data-tmp]").forEach(function(b){ b.addEventListener("click",function(){ undoMark("Temporary Hit Points",1); S.tmp=Math.max(0,S.tmp+(+b.getAttribute("data-tmp"))); save(); syncHP(); }); });
  /* v30 B6: +1, +5, +10 add to the amount, the last button clears it. B7: Set puts the typed amount into Temporary HP */
  $$("[data-hpadd]").forEach(function(b){ b.addEventListener("click",function(){ var n=+b.getAttribute("data-hpadd"); inp.value=n?String(amt()+n):""; inp.classList.remove("pop"); void inp.offsetWidth; if(n) inp.classList.add("pop"); }); });
  (function(){ var tv=$("#tmpV"); if(!tv||tv.tagName!=="INPUT") return;/* v31 p96: type Temporary HP directly */
    function commit(){ var v=Math.max(0,Math.floor(+tv.value||0)); if(v===S.tmp){ tv.value=S.tmp; return; } undoMark("Temporary Hit Points"); S.tmp=v; save(); syncHP(); toastU("Temporary Hit Points: "+v+"."); }
    tv.addEventListener("change",commit); tv.addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); tv.blur(); } }); tv.addEventListener("focus",function(){ try{ tv.select(); }catch(er){} }); })();
  $$("[data-tmpset]").forEach(function(b){ b.addEventListener("click",function(){ var a=amt(); if(!a){ toast("Type an amount first, then press Set."); return; } undoMark("Temporary Hit Points"); S.tmp=a; inp.value=""; save(); syncHP(); toastU("Temporary Hit Points: "+a+"."); }); });
})();

