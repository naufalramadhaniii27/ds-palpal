/* ================= PORTRAIT ================= */
function syncPortrait(){ var p=$("#photo"), pc=$("#phCls"); if(pc){ var ck=icoCls(C.clsLabel||C.cls||""); pc.innerHTML=(ck&&typeof ICO==="object"&&ICO&&ICO[ck])?ico(ck):""; pc.hidden=!pc.innerHTML; }/* v30 B4 */ if(S.portrait&&/^(data:image\/|blob:|https?:)/.test(S.portrait)){ p.style.backgroundImage='url("'+S.portrait+'")'; p.classList.add("has"); p.setAttribute("aria-label","Change portrait"); } else { p.style.backgroundImage=""; p.classList.remove("has"); p.setAttribute("aria-label","Add portrait"); } }
/* Portrait picker: upload your own picture or pick one of the art portraits. Art portraits are stored the same way as an uploaded photo (a small JPEG in S.portrait), so saves, backups and exports need no change. */
function ppList(){ var A=window.__ART&&window.__ART.portrait; if(!A||!A.length) return []; var sp=String(C.species||"").toLowerCase(), mine=A.filter(function(id){ return sp.indexOf(id.replace(/-[ab]$/,""))>=0; }); return mine.concat(A.filter(function(id){ return mine.indexOf(id)<0; })); }
function ppOpen(){ var L=ppList(); if(!L.length){ $("#avFile").click(); return; }
  var nm=function(id){ var b=id.replace(/-[ab]$/,""); return b.charAt(0).toUpperCase()+b.slice(1)+" "+id.slice(-1).toUpperCase(); };
  var h='<div class="pp-act"><button type="button" class="btn press" data-pp-up="1">'+ico("ui-camera")+'Upload a photo</button>'+(S.portrait?'<button type="button" class="btn press" data-pp-rm="1">Remove portrait</button>':'')+'</div><div class="info-h">Art portraits</div><div class="pp-g">'+L.map(function(id){ return '<button type="button" class="pp-i" data-pp="'+id+'" aria-label="Use portrait '+nm(id)+'"><img src="img/portrait/'+id+'.avif" alt="" width="96" height="120" loading="lazy" decoding="async"><span>'+nm(id)+'</span></button>'; }).join("")+'</div>';
  navStack=[]; openSheet("Portrait",h,"portrait"); }
function ppUse(id){ var img=new Image(); img.onload=function(){ var W=320,H=400,c=document.createElement("canvas"); c.width=W; c.height=H; c.getContext("2d").drawImage(img,0,0,img.width,img.height,0,0,W,H); try{ S.portrait=c.toDataURL("image/jpeg",.86); }catch(e){ S.portrait=""; } save(); syncPortrait(); closeSheet(); toast("Portrait updated"); }; img.onerror=function(){ toast("This portrait could not be loaded. Check your connection."); }; img.src="img/portrait/"+id+".avif"; }
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("#sheetBody [data-pp],#sheetBody [data-pp-up],#sheetBody [data-pp-rm]"); if(!t) return;
  if(t.hasAttribute("data-pp")) ppUse(t.getAttribute("data-pp")); else if(t.hasAttribute("data-pp-up")){ closeSheet(); setTimeout(function(){ $("#avFile").click(); },60); } else { S.portrait=""; save(); syncPortrait(); closeSheet(); toast("Portrait removed"); } });
$("#photo").addEventListener("click",ppOpen);
$("#avFile").addEventListener("change",function(){
  var f=this.files&&this.files[0]; if(!f) return;
  var r=new FileReader();
  r.onload=function(){ var img=new Image();
    img.onload=function(){ var W=320,H=400, c=document.createElement("canvas"); c.width=W; c.height=H; var ratio=W/H, sw=img.width, sh=img.height, sx=0, sy=0;
      if(sw/sh>ratio){ sw=sh*ratio; sx=(img.width-sw)/2; } else { sh=sw/ratio; sy=(img.height-sh)/4; }
      c.getContext("2d").drawImage(img,sx,sy,sw,sh,0,0,W,H); try{ S.portrait=c.toDataURL("image/jpeg",.86); }catch(e){ S.portrait=""; } save(); syncPortrait(); toast("Portrait updated"); };
    img.onerror=function(){ toast("This image can't be read. Choose a JPG or PNG file."); }; img.src=r.result; };
  r.readAsDataURL(f); this.value="";
});

