import {bindLive,ico,icoCls,lateGet} from "./00a-reg-late-ports.js";import {C,S,save} from "./04-logic-storage.js";
import {$,toast} from "./05-logic-helpers.js";
import {__set_navStack,navStack,openSheet} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet} from "./13b-ui-detail-spell-targets-render.js";
import {env} from "./00-env.js";
bindLive("syncPortrait",{get:function(){return syncPortrait;}});
/* ================= PORTRAIT ================= */
export function syncPortrait(){ const p=$("#photo"), pc=$("#phCls"); if(pc){ const ck=icoCls(C.clsLabel||C.cls||""); pc.innerHTML=(ck&&typeof lateGet("ICO")==="object"&&lateGet("ICO")&&lateGet("ICO")[ck])?ico(ck):""; pc.hidden=!pc.innerHTML; }/* v30 B4 */ if(S.portrait&&/^(data:image\/|blob:|https?:)/.test(S.portrait)){ p.style.backgroundImage='url("'+S.portrait+'")'; p.classList.add("has"); p.setAttribute("aria-label","Change portrait"); } else { p.style.backgroundImage=""; p.classList.remove("has"); p.setAttribute("aria-label","Add portrait"); } }
/* Portrait picker: upload your own picture or pick one of the art portraits. Art portraits are stored the same way as an uploaded photo (a small JPEG in S.portrait), so saves, backups and exports need no change. */
/* Portrait picker (owner 2026-11-08: many portraits, searchable, no lag). The search data img/portrait/index.js
   ([id, species, role, gender, age]) loads on first open, so it adds nothing to app start. The grid shows 128x160 thumbs
   (img/portrait/t) and renders in pages of 48 as the list scrolls, so a thousand portraits stay smooth. */
let PPQ="", PPN=48, PPIO=null;
function ppIdx(){ const X=env.__PPIDX; if(X&&X.length) return X; const A=env.__ART&&env.__ART.portrait||[]; return A.map((id) =>{ return [id,id.replace(/-[ab]$|-\d+$/,""),"","",""]; }); }
function ppLoad(cb){ if(env.__PPIDX){ cb(); return; } const s=document.createElement("script"); s.src="img/portrait/index.js"; s.async=true; s.onload=s.onerror=function(){ cb(); }; document.head.appendChild(s); }
function ppName(r){ const t=function(x){ return String(x||"").replace(/-/g," ").replace(/\b\w/g,(c) =>{ return c.toUpperCase(); }); }; return t(r[1])+(r[2]?" "+t(r[2]):"")+(/-\d+$|-[ab]$/.test(r[0])?" "+r[0].replace(/^.*-/,"").toUpperCase():""); }
function ppList(){ const X=ppIdx(), sp=String(C.species||"").toLowerCase(), q=PPQ.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hit=function(r){ const hay=(r[1]+" "+r[1].replace(/-/g," ")+" "+r[2]+" "+r[3]+" "+r[4]).toLowerCase(); return q.every((w) =>{ return hay.indexOf(w)>=0; }); };
  const L=X.filter(hit), mine=function(r){ return sp&&(sp.indexOf(r[1].replace(/-/g," "))>=0||sp.indexOf(r[1])>=0)?0:1; };
  return L.sort((a,b) =>{ return mine(a)-mine(b); }); }
/* Hosted build: tools/dist_pack.py packs the thumbs into img/portrait/tp/N.bin and appends window.__PPTP to img/portrait/index.js
   ([[id, bytes, id, bytes, ...] per pack], 4 thumbs of one species per pack), so the site stays under the host's file limit. A tile shows
   the same AVIF bytes through a blob URL; its pack is fetched when the tile comes near the view (the margin of native lazy loading).
   Without __PPTP (source tree) the tile reads img/portrait/t/<id>.avif as before. */
let PPTM=null, PPTO=null; const PPTB={}, PPTU={};
function pptMap(){ if(PPTM) return PPTM; const P=env.__PPTP; if(!Array.isArray(P)) return {}; PPTM={}; P.forEach((L,i) =>{ let o=0; for(let j=0;j<L.length;j+=2){ PPTM[L[j]]=[i,o,L[j+1]]; o+=L[j+1]; } }); return PPTM; }
function pptUrl(id){ if(PPTU[id]) return Promise.resolve(PPTU[id]); const m=pptMap()[id]; if(!m) return Promise.reject(new Error("no pack"));
  const p=PPTB[m[0]]=PPTB[m[0]]||fetch("img/portrait/tp/"+m[0]+".bin").then((r) =>{ if(!r.ok) throw new Error("pack "+r.status); return r.arrayBuffer(); }).catch((e) =>{ delete PPTB[m[0]]; throw e; });
  return p.then((b) =>{ return PPTU[id]=PPTU[id]||URL.createObjectURL(new Blob([b.slice(m[1],m[1]+m[2])],{type:"image/avif"})); }); }
function pptGo(im){ const id=im.getAttribute("data-ppt"); im.removeAttribute("data-ppt"); pptUrl(id).then((u) =>{ im.src=u; },() =>{ im.src="img/portrait/t/"+id+".avif"; }); }
function pptWatch(g){ const L=g.querySelectorAll("img[data-ppt]"); if(!L.length) return; if(typeof IntersectionObserver==="undefined"){ L.forEach(pptGo); return; }
  if(!PPTO) PPTO=new IntersectionObserver((es) =>{ es.forEach((e) =>{ if(e.isIntersecting){ PPTO.unobserve(e.target); pptGo(e.target); } }); },{root:$("#sheetBody")||null,rootMargin:"1250px"});
  L.forEach((im) =>{ PPTO.observe(im); }); }
function ppSrc(id){ const u=PPTU[id]; return u?'src="'+u+'"':pptMap()[id]?'data-ppt="'+id+'"':'src="img/portrait/t/'+id+'.avif"'; }
function ppTile(r){ return '<button type="button" class="pp-i" data-pp="'+r[0]+'" aria-label="Use portrait '+ppName(r)+'"><img '+ppSrc(r[0])+' alt="" width="128" height="160" loading="lazy" decoding="async"><span>'+ppName(r)+'</span></button>'; }
function ppFill(reset){ const g=$("#ppG"); if(!g) return; const L=ppList(); if(reset){ g.innerHTML=""; g.dataset.n="0"; if(PPTO){ PPTO.disconnect(); PPTO=null; } }
  let n=+g.dataset.n||0; const end=Math.min(L.length,n+PPN); g.insertAdjacentHTML("beforeend",L.slice(n,end).map(ppTile).join("")); g.dataset.n=String(end); pptWatch(g);
  const c=$("#ppC"); if(c){ c.textContent=String(L.length); c.title=L.length+" portraits"; }
  const more=$("#ppMore"); if(more) more.hidden=end>=L.length; }
function ppOpen(){ ppLoad(() =>{ const X=ppIdx(); if(!X.length){ $("#avFile").click(); return; } PPQ="";
  const sps=Array.from(new Set(X.map((r) =>{ return r[1]; }))).sort();
  const h='<div class="pp-act"><button type="button" class="btn press" data-pp-up="1">'+ico("ui-camera")+'Upload a photo</button>'+(S.portrait?'<button type="button" class="btn press" data-pp-rm="1">Remove portrait</button>':'')+'</div>'+
    '<div class="pp-s"><input id="ppQ" type="search" placeholder="Search species or class" aria-label="Search portraits" autocomplete="off" list="ppSp"><datalist id="ppSp">'+sps.map((x) =>{ return '<option value="'+x.replace(/-/g," ")+'">'; }).join("")+'</datalist><span id="ppC" class="pp-c"></span></div>'+
    '<div class="pp-g" id="ppG"></div><div id="ppMore" class="pp-more" aria-hidden="true"></div>';
  __set_navStack([]); openSheet("Portrait",h,"portrait"); ppFill(true);
  const q=$("#ppQ"); let tm=0; if(q) q.addEventListener("input",() =>{ clearTimeout(tm); tm=setTimeout(() =>{ PPQ=q.value; ppFill(true); },120); });
  if(PPIO) PPIO.disconnect(); const m=$("#ppMore"); if(m&&typeof IntersectionObserver!=="undefined"){ PPIO=new IntersectionObserver((es) =>{ if(es.some((e) =>{ return e.isIntersecting; })) ppFill(false); },{root:$("#sheetBody")||null,rootMargin:"400px"}); PPIO.observe(m); } }); }
function ppUse(id){ const img=new Image(); img.onload=function(){ const W=320,H=400,c=document.createElement("canvas"); c.width=W; c.height=H; c.getContext("2d").drawImage(img,0,0,img.width,img.height,0,0,W,H); try{ S.portrait=c.toDataURL("image/jpeg",.86); }catch(e){ S.portrait=""; } save(); syncPortrait(); closeSheet(); toast("Portrait updated"); }; img.onerror=function(){ toast("This portrait could not be loaded. Check your connection."); }; img.src="img/portrait/"+id+".avif"; }
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("#sheetBody [data-pp],#sheetBody [data-pp-up],#sheetBody [data-pp-rm]"); if(!t) return;
  if(t.hasAttribute("data-pp")) ppUse(t.getAttribute("data-pp")); else if(t.hasAttribute("data-pp-up")){ closeSheet(); setTimeout(() =>{ $("#avFile").click(); },60); } else { S.portrait=""; save(); syncPortrait(); closeSheet(); toast("Portrait removed"); } });
$("#photo").addEventListener("click",ppOpen);
$("#avFile").addEventListener("change",function(){
  const f=this.files&&this.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=function(){ const img=new Image();
    img.onload=function(){ const W=320,H=400, c=document.createElement("canvas"); c.width=W; c.height=H; let ratio=W/H, sw=img.width, sh=img.height, sx=0, sy=0;
      if(sw/sh>ratio){ sw=sh*ratio; sx=(img.width-sw)/2; } else { sh=sw/ratio; sy=(img.height-sh)/4; }
      c.getContext("2d").drawImage(img,sx,sy,sw,sh,0,0,W,H); try{ S.portrait=c.toDataURL("image/jpeg",.86); }catch(e){ S.portrait=""; } save(); syncPortrait(); toast("Portrait updated"); };
    img.onerror=function(){ toast("This image can't be read. Choose a JPG or PNG file."); }; img.src=r.result; };
  r.readAsDataURL(f); this.value="";
});

