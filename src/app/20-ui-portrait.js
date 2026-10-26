/* ================= PORTRAIT ================= */
function syncPortrait(){ var p=$("#photo"), pc=$("#phCls"); if(pc){ var ck=icoCls(C.clsLabel||C.cls||""); pc.innerHTML=(ck&&typeof ICO==="object"&&ICO&&ICO[ck])?ico(ck):""; pc.hidden=!pc.innerHTML; }/* v30 B4 */ if(S.portrait){ p.style.backgroundImage='url("'+S.portrait+'")'; p.classList.add("has"); } else { p.style.backgroundImage=""; p.classList.remove("has"); } }
$("#photo").addEventListener("click",function(){ $("#avFile").click(); });
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

