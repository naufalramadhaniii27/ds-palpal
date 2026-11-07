import {DEFAULT} from "./02-data-default-character.js";
import {C,S,__set_C,clone,save,saveC} from "./04-logic-storage.js";
import {$,$$,armorFx,ask,attCount,attMaxC,bldSync,clamp,eqLinked,eqOn,num,toast} from "./05-logic-helpers.js";
import {D,derive} from "./06-logic-derivation.js";
import {REDUCE,applyLook,applyTheme,hcOn,hcSet} from "./07-ui-theme-contrast-spring.js";
import {renderInv} from "./08c-ui-render-inventory-features-notes.js";
import {renderConds} from "./10-ui-conditions.js";
import {sheetMode} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet} from "./13-ui-detail-cards.js";
import {TPL,__set_edTab,edTab,getPath,rEnsure,rGet,rerenderEditor,scheduleRender,setPath} from "./14-ui-editor.js";
import {SN_BAD,snGet,snRestore,snTake} from "./15d-logic-snapshots-character-files.js";import {rSnap} from "./15-logic-roster-backup-files-snapshots.js";
import {MYID} from "./17-logic-tab-sync-and-test-hooks.js";
import {__R} from "./00-reg.js";import {env} from "./00-env.js";
/* v30 C1: phone header. My Characters, Edit, Settings, and PDF sit in the More menu (computer: the same buttons in the header row) */
/* v32 p36: full header only when it fits on one line, measured (phones keep their own header) */
function hdrFits(){ const A=document.querySelector(".band .acts"), of=document.querySelector(".band .office"); if(!A) return true;
  const vis=function(e){ const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(e).display!=="none"; };
  const lines=function(el){ let tops={}, w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT), n, k=0; while((n=w.nextNode())){ if(!n.textContent.trim()) continue; const r=document.createRange(); r.selectNodeContents(n); Array.prototype.forEach.call(r.getClientRects(),(q) =>{ if(q.width>0&&!tops[Math.round(q.top)]){ tops[Math.round(q.top)]=1; k++; } }); } return k; };
  const txtOut=function(b){ let br=b.getBoundingClientRect(), w=document.createTreeWalker(b,NodeFilter.SHOW_TEXT), n, out=false; while((n=w.nextNode())){ if(!n.textContent.trim()) continue; const r=document.createRange(); r.selectNodeContents(n); Array.prototype.forEach.call(r.getClientRects(),(q) =>{ if(q.width>0&&(q.left<br.left-.5||q.right>br.right+.5||q.top<br.top-.5||q.bottom>br.bottom+.5)) out=true; }); } return out; };/* the label leaves its button (a dot drawn outside, like the Build dot, does not count) */
  if(A.scrollWidth>A.clientWidth+1) return false;
  const bs=Array.prototype.slice.call(A.querySelectorAll("button")).filter(vis);
  for(let i=0;i<bs.length;i++){ const b=bs[i]; if(lines(b)>1||txtOut(b)||b.getBoundingClientRect().right>innerWidth+.5) return false; }
  if(of&&vis(of)){ const ob=of.querySelector("b"); if(ob&&lines(ob)>1) return false; if(of.getBoundingClientRect().right>A.getBoundingClientRect().left-4) return false; }
  return true; }
let HDR_RAF=0;
function hdrFit(){ HDR_RAF=0; const R=document.documentElement; if(__R.mq.matches){ R.removeAttribute("data-hdrc"); return; }
  const bd=document.querySelector(".band .band-in"); if(!bd||!bd.getBoundingClientRect().width) return;/* header not shown (builder open): measure when it shows */
  const was=R.hasAttribute("data-hdrc"); if(was) R.removeAttribute("data-hdrc"); const ok=hdrFits(); if(!ok){ R.setAttribute("data-hdrc","1"); } else if(was){ const mm=document.getElementById("moreMenu"); if(mm&&mm.classList.contains("open")&&env.__moreSet) env.__moreSet(false); } }
function hdrSoon(){ if(!HDR_RAF) HDR_RAF=requestAnimationFrame(hdrFit); }
env.__hdrFit=function(){ hdrFit(); return document.documentElement.hasAttribute("data-hdrc"); };
env.addEventListener("resize",hdrSoon); try{ __R.mq.addEventListener("change",hdrSoon); }catch(e){}
try{ if(document.fonts&&document.fonts.ready) document.fonts.ready.then(hdrSoon); if(document.fonts&&document.fonts.addEventListener) document.fonts.addEventListener("loadingdone",hdrSoon); }catch(e){}
(function(){ const A=document.querySelector(".band .acts"), O=document.querySelector(".band .office"); try{ const mo=new MutationObserver(hdrSoon); if(A) mo.observe(A,{attributes:true,subtree:true,attributeFilter:["hidden"]}); if(O) mo.observe(O,{childList:true,subtree:true,characterData:true}); mo.observe(document.documentElement,{attributes:true,attributeFilter:["data-tsize","data-skin"]}); }catch(e){}
  try{ let bd=document.querySelector(".band .band-in"), lw=-1; if(bd&&env.ResizeObserver) new ResizeObserver(() =>{ const w=Math.round(bd.getBoundingClientRect().width); if(w!==lw){ lw=w; hdrSoon(); } }).observe(bd); }catch(e){} })();
hdrSoon(); setTimeout(hdrSoon,400);
(function(){ const mb=$("#moreBtn"), mm=$("#moreMenu"); if(!mb||!mm) return;
  function set(on){ mm.classList.toggle("open",!!on); mb.setAttribute("aria-expanded",on?"true":"false"); }
  env.__moreSet=set;
  mb.addEventListener("click",() =>{ const on=!mm.classList.contains("open"); set(on); });
  document.addEventListener("click",(e) =>{ if(!mm.classList.contains("open")||(e.target.closest&&e.target.closest("#moreBtn"))) return; set(false); });
  document.addEventListener("keydown",(e) =>{ if(e.key==="Escape"&&mm.classList.contains("open")){ set(false); try{ mb.focus({preventScroll:true}); }catch(er){} } });
})();

/* sheet body delegation: breakdown, conditions, editor */
$("#sheetBody").addEventListener("click",(e) =>{
  if(sheetMode==="cust"){ const cb2=e.target.closest("[data-cusave],[data-cureset]"); if(cb2){ __R.cuSave(cb2.dataset.cusave||cb2.dataset.cureset, !!cb2.dataset.cureset); } return; }/* v26 RU38 no. 2 */
  if(sheetMode==="spman"){ if(e.target.closest("[data-info]")) return; const sb=e.target.closest("button"); if(!sb) return; const sd=sb.dataset;/* v25 RU38 no. 3 */
    if(sd.spmt){ if(sb.disabled) return; __R.spmToggle(sd.spmt,sd.spmc); return; } if(sd.spmcls){ __R.spmCls=sd.spmcls; __R.spmLv="all"; __R.spmRefresh(); return; } if(sd.spml!=null){ __R.spmLv=sd.spml; __R.spmRefresh(); return; } return; }
  if(sheetMode==="theme"){ if(e.target.closest("[data-hpgo]")){ closeSheet(); if(env.__bldGo) env.__bldGo("class"); return; }
    if(e.target.closest("[data-keysopen]")){ __R.keysOpen(); return; }/* v32 p27 */
    const snb=e.target.closest("[data-snrs],[data-snnow]"); if(snb){ const sid=MYID||(rGet()||{}).active; if(snb.hasAttribute("data-snrs")){ snRestore(sid,+snb.getAttribute("data-snrs")); return; }
      if(SN_BAD){ toast("Snapshots cannot be saved: the snapshot list on this device is damaged"); return; } const rr0=rSnap(rEnsure()), b0=(snGet().chars[sid]||[]), h0=b0[0]&&b0[0].h; snTake(sid,"Taken by hand",rr0); const b1=snGet().chars[sid]||[]; toast(b1[0]&&b1[0].h!==h0?"Snapshot taken":"No changes since the last snapshot");
      const sb3=$("#sheetBody"), st3=sb3.scrollTop; sb3.innerHTML=__R.settingsHTML(); sb3.scrollTop=st3; return; }/* v32 p33 */
    const tb=e.target.closest(".thb"); if(!tb) return; const dd=tb.dataset;
    if(dd.hpm){ let df=[]; try{ df=env.__bldDiff?env.__bldDiff(C)||[]:[]; }catch(er){ df=[]; } __R.undoMark("Hit Points setting"); const hm2=env.__bldHpMode&&env.__bldHpMode(dd.hpm,!df.length); if(!hm2){ __R.UNDO=null; return; }
      __R.renderAll(); __R.toastU("Hit Points: "+(dd.hpm==="roll"?"rolled":"fixed (average)")+"."+(df.length?" The sheet has its own edits, so it keeps its numbers until you press Build, then Apply.":" Maximum HP is "+D.hpmax+".")); }/* v25 RU38 no. 6 */
    if(dd.hc){ hcSet(dd.hc); toast(dd.hc==="auto"?"High contrast follows your device. It is "+(hcOn()?"on":"off")+" now.":"High contrast is "+(hcOn()?"on":"off")+"."); const sb4=$("#sheetBody"), st4=sb4.scrollTop; sb4.innerHTML=__R.settingsHTML(); sb4.scrollTop=st4; return; }/* v35 p01 */
    if(dd.thm!=null){ S.theme=dd.thm; if(document.startViewTransition&&!REDUCE){ const vde=document.documentElement; vde.style.setProperty("--vtx",(e.clientX||innerWidth/2)+"px"); vde.style.setProperty("--vty",(e.clientY||innerHeight/2)+"px"); vde.classList.add("mi-themevt"); try{ const tvt=document.startViewTransition(() =>{ applyTheme(); }); const tve=function(){ vde.classList.remove("mi-themevt"); }; tvt.finished.then(tve,tve); }catch(er){ vde.classList.remove("mi-themevt"); applyTheme(); } } else applyTheme(); }/* v55: circular reveal */ if(dd.thc) S.color=dd.thc; if(dd.thk) S.skin=dd.thk; if(dd.ths) S.sym=dd.ths;
    if(dd.thf!=null){ if(dd.thf) S.frame=dd.thf; else delete S.frame; } if(dd.thd!=null){ if(dd.thd) S.bdrop=dd.thd; else delete S.bdrop; } if(dd.set){ const kv=dd.set.split(":"); __R.setPut(kv[0],kv[1]); __R.renderAll(); }/* v25 */
    save(); applyLook(); const sb2=$("#sheetBody"), st2=sb2.scrollTop; sb2.innerHTML=__R.settingsHTML(); sb2.scrollTop=st2; return; }
  if(sheetMode==="cond"){
    const c=e.target.closest("[data-c]");
    if(c){ const k=c.getAttribute("data-c"); __R.undoMark((S.cond[k]?"Remove ":"Add ")+k); if(S.cond[k]) delete S.cond[k]; else S.cond[k]=true; c.setAttribute("aria-pressed",!!S.cond[k]); if(c.classList.contains("chip")) c.classList.toggle("on",!!S.cond[k]); const cc=c.closest(".cc"); if(cc) cc.classList.toggle("on",!!S.cond[k]); save(); __R.renderAll(); return; }/* v22 RU53 */
    const x=e.target.closest("[data-exh]");
    if(x){ __R.undoMark("Exhaustion",1); __R.exhTo(S.exh+(+x.getAttribute("data-exh"))); x.parentNode.querySelector("output").textContent=S.exh; return; }
    const bu=e.target.closest("[data-burn]");
    if(bu){ S.burn=clamp(S.burn+(+bu.getAttribute("data-burn")),1,20); bu.parentNode.querySelector("output").textContent=S.burn; save(); renderConds(); }
    return;
  }
  if(sheetMode==="edit"){
    const t=e.target.closest("[data-edtab]");
    if(t){ __set_edTab(t.getAttribute("data-edtab")); $$("#sheetBody [data-edtab]").forEach((b) =>{ b.classList.toggle("on",b===t); }); $$("#sheetBody .ed-sec").forEach((s) =>{ s.classList.toggle("on", s.getAttribute("data-sec")===edTab); }); t.scrollIntoView({block:"nearest",inline:"center",behavior:REDUCE?"auto":"smooth"}); $("#sheetBody").scrollTop=0; return; }
    const a=e.target.closest("[data-act]"); if(!a) return;
    const act=a.getAttribute("data-act");
    if(act==="add"){ let list=getPath(C,a.getAttribute("data-list")); if(!Array.isArray(list)){ list=[]; setPath(C,a.getAttribute("data-list"),list); } list.push(TPL[a.getAttribute("data-tpl")]()); saveC(); __R.renderAll(); rerenderEditor(); return; }
    if(act==="del"){ const l2=getPath(C,a.getAttribute("data-list")), di=+a.getAttribute("data-i"); if(a.getAttribute("data-list")==="inv"&&l2[di]) bldSync(l2[di].key||l2[di].n,{del:1});/* RU18-2 */ l2.splice(di,1); saveC(); __R.renderAll(); rerenderEditor(); return; }
    if(act==="impApply"){ const raw=($("#impTxt")||{}).value||""; let p=null; try{ p=JSON.parse(raw.trim()); }catch(err){} if(!p||p.v!==3||!p.abilities||!Array.isArray(p.skills)){ toast("That text isn't a valid exported build"); return; } ask("Replace the current build with "+(p.name||"the imported character")+"? Notes, HP, and conditions stay.","Replace",() =>{ __set_C(p); if(Array.isArray(p.lang)&&p.lang.length){ S.lang=p.lang.slice(); save(); } saveC(); __R.renderAll(); rerenderEditor(); toast("Imported "+(p.name||"build")); }); return; }
    if(act==="impCopy"){ const txt=JSON.stringify(C), ta=$("#impTxt"); if(ta){ ta.value=txt; ta.select(); } const done=function(){toast("Build copied")}; if(navigator.clipboard) navigator.clipboard.writeText(txt).then(done,() =>{toast("Text placed in the box. Copy it manually")}); else toast("Text placed in the box. Copy it manually"); return; }
    if(act==="reset"){ ask("Clear every build value of this character? Notes, HP, and conditions stay. Use Build to set it up again.","Clear",() =>{ const nm=C.name; __set_C(clone(DEFAULT)); C.name=nm||C.name; saveC(); __R.renderAll(); rerenderEditor(); toast("Build cleared"); }); return; }
  }
});
$("#sheetBody").addEventListener("change",(e) =>{
  if(sheetMode!=="edit") return;
  const a=e.target;
  if(a.getAttribute("data-act")==="save"){ const k=a.getAttribute("data-k"); if(!C.saves) C.saves={}; if(a.checked) C.saves[k]=C.cls+" class (PHB-2024)"; else delete C.saves[k]; saveC(); __R.renderAll(); rerenderEditor(); return; }
  if(a.hasAttribute("data-p") && (a.tagName==="SELECT"||a.type==="checkbox")) editInput(a);
});
$("#sheetBody").addEventListener("input",(e) =>{
  const t=e.target;
  if(sheetMode==="cond" && t.id==="jinxN"){ const v=parseInt(t.value,10); S.jinx = isNaN(v)?"":String(clamp(v,1,20)); save(); renderConds(); return; }
  if(sheetMode==="edit" && t.hasAttribute("data-p") && t.tagName!=="SELECT" && t.type!=="checkbox") editInput(t);
});
function editInput(el){
  let path=el.getAttribute("data-p"), t=el.getAttribute("data-t"), v;
  if(t==="b") v=el.checked; else if(t==="n"){ v=num(el.value, NaN); if(isNaN(v)) return; } else v=el.value;
  if(path==="level") v=clamp(Math.round(v),1,20);
  if(path==="wallet.gp"){ const cw=__R.coinsNow(); cw.gp=Math.max(0,Math.floor(v)); __R.undoMark("Gold"); __R.coinSet(cw); renderInv(); return; }/* v34 p06 */
  const oldNm=C.name;
  /* RU31: Worn ticked in the Edit form on armor or a Shield of a hand-filled sheet: AC as the Inventory checkbox (RU29) */
  let wm=/^inv\.(\d+)\.eq$/.exec(path), wi=wm&&(C.inv||[])[+wm[1]], wfx=null;
  if(wi&&wi.att&&v&&!eqOn(wi)&&attCount()>=attMaxC()){ toast("You can attune to at most "+attMaxC()+" magic items. Unattune one first."); rerenderEditor(); return; }/* M18 */
  if(wi&&!wi.key&&!eqLinked(wi)&&!!v!==eqOn(wi)&&env.__bldArmor){ try{ wfx=env.__bldArmor({C:structuredClone(C),lang:S.lang},wi.n,!!v); }catch(er){ wfx=null; } }
  /* V14-2: worn armor or Shield renamed in the Edit form: its AC bonus is taken off first (as unticking it), the item is no longer worn */
  let rn=/^inv\.(\d+)\.n$/.exec(path), ri=rn&&(C.inv||[])[+rn[1]], rOld=ri&&ri.n, rfx=null;
  if(ri&&!ri.key&&rOld!==v&&eqOn(ri)&&!eqLinked(ri)&&env.__bldArmor){ try{ rfx=env.__bldArmor({C:structuredClone(C),lang:S.lang},rOld,false); }catch(er){ rfx=null; } }
  setPath(C,path,v);
  /* RU31: an item renamed in the Edit form is looked up again in the item database (type, checkbox, details). Unknown names stay Gear */
  const nm=/^inv\.(\d+)\.n$/.exec(path), ni=nm&&(C.inv||[])[+nm[1]]; if(ni&&!ni.key){ ["type","html","equippable","att","gear","cost"].forEach((f) =>{ delete ni[f]; }); const nmt=env.__itemMeta&&env.__itemMeta(v); if(nmt&&nmt.w) ni.w=nmt.w; }/* V14-9: weight from the tables */
  if(rfx){ const racd=armorFx(rfx,ri); ri.eq=false; bldSync(rOld,{del:1}); saveC(); scheduleRender(); toast(racd?"Unequipped "+rOld+". Armor Class is now "+(derive(),D.ac)+".":"Unequipped "+rOld+"."); return; }
  if(wfx&&armorFx(wfx,wi)){ saveC(); scheduleRender(); toast((wi.eq?"Equipped. ":"Unequipped. ")+"Armor Class is now "+(derive(),D.ac)+"."); return; }
  /* RL40: a new name typed here also renames the saved build of this character */
  if(path==="name"&&v&&oldNm!==v){ try{ if(env.__bldRename) env.__bldRename(oldNm,v); }catch(er){} }
  /* RU18-2: Qty and Worn of an item, edited here, also go to the saved build of the same character (as N2) */
  const im=/^inv\.(\d+)\.(q|eq)$/.exec(path), ii=im&&(C.inv||[])[+im[1]]; if(ii) bldSync(ii.key||ii.n, im[2]==="q"?{q:v,occ:__R.occOf(ii)}:{eq:!!v,occ:__R.occOf(ii)});
  saveC(); scheduleRender();
}

