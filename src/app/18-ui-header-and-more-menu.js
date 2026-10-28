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
    if(act==="reset"){ ask("Clear every build value of this character? Notes, HP, and conditions stay. Use Build to set it up again.","Clear",function(){ var nm=C.name; C=clone(DEFAULT); C.name=nm||C.name; saveC(); renderAll(); rerenderEditor(); toast("Build cleared"); }); return; }
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

