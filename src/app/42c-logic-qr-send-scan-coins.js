/* QR send and scan, coins, builder pending dot (split from 42, SOLID stage 12) */
import {C,S} from "./04-logic-storage.js";import {ask,num,sg,toast} from "./05-logic-helpers.js";import {D,derive} from "./06-logic-derivation.js";import {REDUCE} from "./07-ui-theme-contrast-spring.js";import {renderInv} from "./08c-ui-render-inventory-features-notes.js";import {chFile,chName,chSave} from "./15d-logic-snapshots-character-files.js";import {zPack} from "./15c-logic-file-state-compress.js";import {impText} from "./16-logic-import-chat-text-and-build-files.js";import {moveTabInd,onMode} from "./21-ui-tabs-pager.js";import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {COINS,coinCp,coinList,coinPay,coinRefresh,coinSet,coinTotal,coinsNow,priceTxt} from "./23c-ui-coins.js";import {toastU,undoMark} from "./32-logic-play-undo-actions.js";import {__set_bldDot,bldDot} from "./35-ui-combo.js";import {cuNumList} from "./41-ui-edit-mode.js";import {__R} from "./00-reg.js";import {html,raw,render} from "./lib/html.js";import {env} from "./00-env.js";import {QRG} from "./42b-logic-qr-generator.js";
Object.defineProperty(__R,"coinsClean",{get:function(){return coinsClean;},set:function(v){coinsClean=v;},configurable:true});
Object.defineProperty(__R,"qrCan",{get:function(){return qrCan;},set:function(v){qrCan=v;},configurable:true});
Object.defineProperty(__R,"qrScanOpen",{get:function(){return qrScanOpen;},set:function(v){qrScanOpen=v;},configurable:true});
Object.defineProperty(__R,"qrSendOpen",{get:function(){return qrSendOpen;},set:function(v){qrSendOpen=v;},configurable:true});
const QR_ONE=QRG.cap(20,"L"), QR_CH=QRG.cap(15,"L")-20, QR_MAX=40;
function qrHash(s){ let h=0x811c9dc5; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,0x01000193)>>>0; } return h.toString(36); }
/* one code when it fits, else parts "DQ1:<i>/<n>:<hash>:<text>". null: too many parts */
function qrFrames(txt){ if(txt.length<=QR_ONE) return [txt]; const n=Math.ceil(txt.length/QR_CH), h=qrHash(txt), out=[]; if(n>QR_MAX) return null;
  for(let i=0;i<n;i++) out.push("DQ1:"+(i+1)+"/"+n+":"+h+":"+txt.slice(i*QR_CH,(i+1)*QR_CH)); return out; }
env.__qrFrames=qrFrames; env.__qrMake=function(t,e,v){ const q=QRG.make(t,e||"L",v||40); return q?{v:q.v,size:q.size,mask:q.mask,svg:QRG.svg(q)}:null; };
let QRS=null;
function qrStop(){ if(QRS&&QRS.t){ clearInterval(QRS.t); QRS.t=0; } }
function qrSendOpen(id){
 qrSendOpenStep1(id); }
function qrSendOpenStep1(id){
const o=chFile(id), raw=JSON.stringify(o), nm=chName(o);
  const show=function(txt){
 const {w}=showStep1(txt, nm);
    showStep2(w, id); };
  zPack(raw).then(show,() =>{ show(raw); });
}
function showStep1(txt, nm){
const old=document.getElementById("qrSend"); if(old) old.remove(); qrStop();
    const fr=qrFrames(txt), w=document.createElement("div"); w.id="qrSend"; w.className="bkp qrd"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","qrT");
    QRS={fr:fr||[], i:0, t:0, cache:{}, txt:txt, nm:nm, play:true}; env.__qrSent=QRS.fr.slice();
    w.innerHTML='<div class="bkpb"><div class="bkph"><b id="qrT">'+ico("ui-qr")+'Send to Another Device</b><button type="button" class="bkpx" data-qrs="close" aria-label="Close">×</button></div>'+
      (fr?'<p>On the other device, open <b>My Characters</b>, <b>Open Character</b>, then <b>Scan Code</b>. Hold this screen in front of its camera'+(fr.length>1?' until it has read all '+fr.length+' parts. They change by themselves.':'.')+'</p>'+
        '<div class="qr-box" id="qrBox"></div>'+(fr.length>1?'<p class="qr-n" id="qrN" aria-live="polite"></p><div class="bkpr qr-ctl"><button type="button" class="btn press" data-qrs="prev" aria-label="Previous part">'+ico("ui-chev-l")+'</button><button type="button" class="btn press" data-qrs="play" id="qrPlay" aria-label="Pause">'+ico("ui-pause")+'<span>Pause</span></button><button type="button" class="btn press" data-qrs="next" aria-label="Next part">'+ico("ui-chev-r")+'</button></div>':'')
        :'<p class="hbkl warn">'+ico("toast-warn")+'This character is too large to send with codes. Share or save the file instead.</p>')+
      '<h4 class="chfh">Or Send the File</h4><p class="muted">A file works on every device: send it in a chat or by mail, then use Open Character on the other device.</p><div class="bkpr">'+
      (navigator.share?'<button type="button" class="btn pri press" data-qrs="share">'+ico("ui-share")+'<span>Share File</span></button>':'')+'<button type="button" class="btn press" data-qrs="save">'+ico("ui-save")+'<span>Save File</span></button></div></div>';
    document.body.appendChild(w); if(fr) qrDraw(); if(fr&&fr.length>1) QRS.t=setInterval(() =>{ if(!document.getElementById("qrSend")){ qrStop(); return; } QRS.i=(QRS.i+1)%QRS.fr.length; qrDraw(); },REDUCE?1400:750);
    const esc1=function(e){ if(e.key==="Escape"&&!document.querySelector(".ask")){ qrStop(); w.remove(); document.removeEventListener("keydown",esc1,true); } }; document.addEventListener("keydown",esc1,true);
  return /** @type {any} */ ({w});
}
function showStep2(w, id){
    w.addEventListener("click",(e) =>{ if(e.target===w){ qrStop(); w.remove(); return; } const b=e.target.closest("[data-qrs]"); if(!b) return; const a=b.getAttribute("data-qrs");
      if(a==="close"){ qrStop(); w.remove(); return; }
      if(a==="prev"||a==="next"){ qrStop(); QRS.play=false; qrPlayBtn(); QRS.i=(QRS.i+(a==="next"?1:QRS.fr.length-1))%QRS.fr.length; qrDraw(); return; }
      if(a==="play"){ QRS.play=!QRS.play; qrPlayBtn(); if(QRS.play){ QRS.t=setInterval(() =>{ if(!document.getElementById("qrSend")){ qrStop(); return; } QRS.i=(QRS.i+1)%QRS.fr.length; qrDraw(); },REDUCE?1400:750); } else qrStop(); return; }
      if(a==="save"){ chSave(id); return; }
      if(a==="share"){ qrShare(QRS.txt,QRS.nm); } });
}
function qrPlayBtn(){ const b=document.getElementById("qrPlay"); if(b){ render(html`${raw(ico(QRS.play?"ui-pause":"ui-play"))}<span>${QRS.play?"Pause":"Play"}</span>`,b); b.setAttribute("aria-label",QRS.play?"Pause":"Play"); } }
function qrDraw(){ const box=document.getElementById("qrBox"); if(!box||!QRS) return; let i=QRS.i, s=QRS.cache[i]; if(!s){ const q=QRG.make(QRS.fr[i],"L",40); s=QRS.cache[i]=q?QRG.svg(q,"Code "+(i+1)+" of "+QRS.fr.length):""; }
  box.innerHTML=s; box.setAttribute("data-i",String(i)); const n=document.getElementById("qrN"); if(n) n.textContent="Part "+(i+1)+" of "+QRS.fr.length; }
function qrShare(txt,nm){ let f=null, f2=null, d=null; try{ f=new File([txt],nm,{type:"application/octet-stream"}); f2=new File([txt],nm.replace(/\.bs$/,"")+".txt",{type:"text/plain"}); }catch(e){}
  if(f&&navigator.canShare&&navigator.canShare({files:[f]})) d={files:[f],title:nm}; else if(f2&&navigator.canShare&&navigator.canShare({files:[f2]})) d={files:[f2],title:nm}; else d={title:nm,text:txt};
  navigator.share(d).then(() =>{ toast("Shared: "+nm); },(e) =>{ if(e&&e.name==="AbortError") return; toast("Sharing did not work here. Use Save Character."); }); }
/* receive: camera + BarcodeDetector (Chrome on Android and Mac, Safari 17 on Mac). Elsewhere paste the text */
function qrCan(){ return typeof env.BarcodeDetector==="function"&&!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia); }
let QRR=null;
function qrScanStop(){ if(!QRR) return; clearInterval(QRR.t); try{ (QRR.st&&QRR.st.getTracks()||[]).forEach((t) =>{ t.stop(); }); }catch(e){} env.__qrStream=QRR.st; QRR=null; const w=document.getElementById("qrScan"); if(w) w.remove(); }
function qrScanOpen(){ if(!qrCan()){ toast("This browser cannot read codes. Paste the text instead."); return; } qrScanStop();
  const w=document.createElement("div"); w.id="qrScan"; w.className="bkp qrd"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","qrST");
  w.innerHTML='<div class="bkpb"><div class="bkph"><b id="qrST">'+ico("ui-camera")+'Scan Code</b><button type="button" class="bkpx" data-qrr="close" aria-label="Close">×</button></div><div class="qr-cam"><video id="qrVid" playsinline muted autoplay></video></div><p class="qr-n" id="qrRN" aria-live="polite">Starting the camera...</p><div class="qr-pg" id="qrPg"></div><div class="bkpr"><button type="button" class="btn press" data-qrr="close">'+ico("ui-close")+'<span>Cancel</span></button></div></div>';
  document.body.appendChild(w); QRR={parts:{}, n:0, h:"", t:0, st:null, busy:false};
  const R=QRR, msg=function(t){ const e=document.getElementById("qrRN"); if(e) e.textContent=t; };
  w.addEventListener("click",(e) =>{ if(e.target===w||e.target.closest("[data-qrr]")) qrScanStop(); });
  const esc1=function(e){ if(e.key==="Escape"&&document.getElementById("qrScan")){ e.stopPropagation(); qrScanStop(); document.removeEventListener("keydown",esc1,true); } }; document.addEventListener("keydown",esc1,true);
  let det=null; try{ det=new env.BarcodeDetector({formats:["qr_code"]}); }catch(e){ msg("This browser cannot read codes. Paste the text instead."); return; }
  navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false}).then((st) =>{ if(QRR!==R){ st.getTracks().forEach((t) =>{ t.stop(); }); return; } R.st=st; env.__qrStream=st; const v=document.getElementById("qrVid"); v.srcObject=st; try{ v.play(); }catch(e){} msg("Point the camera at the code on the other device.");
    R.t=setInterval(() =>{ if(QRR!==R||R.busy) return; R.busy=true; det.detect(v).then((L) =>{ R.busy=false; (L||[]).forEach((c) =>{ qrGot(R,String(c.rawValue||"")); }); },() =>{ R.busy=false; }); },150);
  },(e) =>{ msg(e&&e.name==="NotAllowedError"?"The camera is blocked. Allow it in the browser, or paste the text instead.":"No camera found. Paste the text instead."); }); }
function qrGot(R,raw){ if(!raw||QRR!==R) return; const msg=function(t){ const e=document.getElementById("qrRN"); if(e) e.textContent=t; };
  if(/^DND24Z1:|^\s*\{/.test(raw)){ qrDone(raw); return; }
  const m=/^DQ1:(\d+)\/(\d+):([a-z0-9]+):([\s\S]*)$/.exec(raw); if(!m){ msg("This code is not a character from this app."); return; }
  const i=+m[1], n=+m[2]; if(!n||i<1||i>n||n>QR_MAX) return; if(R.h!==m[3]){ R.h=m[3]; R.n=n; R.parts={}; }
  R.parts[i]=m[4]; const got=Object.keys(R.parts).length; msg("Parts read: "+got+" of "+n+". Keep the camera on the code.");
  const pg=document.getElementById("qrPg"); if(pg) render(html`${Array.from({length:n},(_,i) => html`<i class="${R.parts[i+1]!=null?"on":""}"></i>`)}`,pg);
  if(got===n){ let t=""; for(let k=1;k<=n;k++) t+=R.parts[k]; if(qrHash(t)!==R.h){ R.parts={}; msg("The parts did not match. Scan again from the first part."); return; } qrDone(t); } }
function qrDone(t){ qrScanStop(); const b=document.getElementById("bkp"); if(b) b.remove(); toast("Code read. Opening the character..."); impText(t); }
env.__qrScanOpen=qrScanOpen;
/* ===== v34 p06: one wallet for the sheet and the builder ===== */
function coinsClean(c){ const o={}; COINS.forEach((k) =>{ const v=Math.floor(num(c&&c[k[0]],0)); o[k[0]]=v>0?v:0; }); return o; }
function coinsSame(a,b){ return COINS.every((k) =>{ return num(a[k[0]],0)===num(b[k[0]],0); }); }
env.__coinsGet=function(){ return coinsNow(); };
env.__coinsGp=function(){ return num(C.gp,0); };
env.__coinPay=function(c,cp){ return coinPay(c,cp); }; env.__coinCp=function(c){ return coinCp(c); }; env.__coinList=function(o){ return coinList(o); }; env.__priceTxt=function(g){ return priceTxt(g); };
env.__coinsPut=function(c,why){ const o=coinsClean(c); if(coinsSame(o,coinsNow())) return coinsNow(); undoMark(why||"Coins"); coinSet(o); try{ renderInv(); coinRefresh(); }catch(e){} return coinsNow(); };
/* coins a build brought (new character, build file): to the sheet after Apply. The sheet already has other coins: ask */
env.__coinsPending=function(c){ const o=coinsClean(c), cur=coinsNow(), f=function(k){ return COINS.map((x) =>{ return num(k[x[0]],0)+" "+x[0]; }).filter((s) =>{ return !/^0 /.test(s); }).join(", ")||"no coins"; };
  if(!S.coins||coinsSame(o,cur)||coinTotal(cur)===num(C.gp,0)&&!cur.pp&&!cur.ep&&!cur.sp&&!cur.cp){ coinSet(o); try{ renderInv(); }catch(e){} return true; }
  ask("The builder has coins for this character ("+f(o)+") and the sheet has other coins ("+f(cur)+"). Use the coins from the builder? Cancel keeps the sheet's coins.","Use Builder Coins",() =>{ undoMark("Coins from the builder"); coinSet(o); try{ renderInv(); }catch(e){} toastU("Coins set from the builder."); }); return false; };
env.__sheetOwnNums=function(){ const L=[]; try{ derive(); }catch(e){} if(typeof cuNumList==="function"&&cuNumList().length) L.push(cuNumList().length+" number"+(cuNumList().length>1?"s":"")+" set in Edit mode"); if(num(S.hpMod,0)) L.push("Max HP modifier "+sg(num(S.hpMod,0))); return L.length?{ac:D.ac,hp:D.hpmax,what:L}:null; };
let BPD_T=0;
function bldPend(){ clearTimeout(BPD_T); BPD_T=setTimeout(() =>{ const b=document.getElementById("bldBtn"); if(!b) return; let L=[]; try{ L=env.__bldDiff?(env.__bldDiff(C)||[]):[]; }catch(e){ L=[]; }
  let on=L.length>0, m=b.querySelector(".bpend"); b.classList.toggle("pend",on); env.__bldPendList=L;
  if(on&&!m){ m=document.createElement("i"); m.className="bpend"; m.setAttribute("aria-hidden","true"); b.appendChild(m); } else if(!on&&m) m.remove();
  if(on){ b.setAttribute("aria-description","The builder and the sheet differ"); b.title="The builder and the sheet differ: "+L.slice(0,3).join(". ")+(L.length>3?"...":""); } else if(b.hasAttribute("aria-description")) b.removeAttribute("aria-description"); },250); }
__set_bldDot((function(f){ return function(){ const r=f.apply(this,arguments); bldPend(); return r; }; })(bldDot)); if(env.__bldDot) env.__bldDot=bldDot;
document.addEventListener("bldready",() =>{ bldPend(); if(env.__sp14Set&&C&&C.rs==="2014"&&(document.getElementById("bld")||{hidden:true}).hidden)env.__sp14Set(true);/* v92 */ });
onMode();
if(document.fonts && document.fonts.ready) document.fonts.ready.then(() =>{ moveTabInd(true); });
