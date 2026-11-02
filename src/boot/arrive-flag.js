try{ if(sessionStorage.getItem("mi-sw")){ sessionStorage.removeItem("mi-sw"); document.documentElement.classList.add("mi-arrive"); } }catch(e){}
/* T1: arriving from a Home card with another character (fx/21-connected-home-sheet.js). The backdrop shows from the first paint */
try{ var mf=JSON.parse(sessionStorage.getItem("mi-cx")||"null"); if(mf&&Date.now()-mf.t<15000){ document.documentElement.classList.add("mi-cx"); if(mf.bg) document.documentElement.style.setProperty("--mi-cx-bg",mf.bg);
  if(mf.html){ var pre=document.createElement("div"); pre.className="mi-cx-pre"; pre.setAttribute("aria-hidden","true"); pre.innerHTML=mf.html; document.documentElement.appendChild(pre); setTimeout(() =>{ if(pre.parentNode) pre.parentNode.removeChild(pre); },5000); } } }catch(e){}
