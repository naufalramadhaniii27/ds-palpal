/* SOLID stage 14: continuation of fx/16-z-pack-dice-sound-hover.js (state shared through the FXS16 objects). */
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  if(FXS16A.FINE.matches){
    const SEL='#app .sp-r[data-info],#app .iname[data-info],#app .fitem .tx[data-info^="f:"],#abil .ab[data-bd],#app .abox[data-bd]';
    MI.on("pointerover",(e) =>{ if(e.pointerType!=="mouse") return; const t=e.target.closest&&e.target.closest(SEL); if(!t||t===FXS16A.hcCur) return; FXS16A.hcHide(); FXS16A.hcCur=t;
      FXS16A.hcTm=setTimeout(() =>{ if(FXS16A.hcCur!==t||!t.isConnected||e.buttons) return; const h=FXS16A.hcBuild(t); if(!h) return; if(!FXS16A.hcCard){ FXS16A.hcCard=FXS16A.D.createElement("div"); FXS16A.hcCard.className="mi-hc"; FXS16A.hcCard.setAttribute("aria-hidden","true"); FXS16A.D.body.appendChild(FXS16A.hcCard); }
        FXS16A.hcCard.innerHTML=h; let r=t.getBoundingClientRect(), w=FXS16A.hcCard.offsetWidth, ch=FXS16A.hcCard.offsetHeight, x=r.right+12, y=Math.max(8,Math.min(innerHeight-ch-8,r.top));
        if(x+w>innerWidth-8){ x=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2)); y=r.bottom+10; if(y+ch>innerHeight-8) y=Math.max(8,r.top-ch-10); }
        FXS16A.hcCard.style.left=x+"px"; FXS16A.hcCard.style.top=y+"px"; FXS16A.hcCard.classList.add("on"); },420); },true);
    MI.on("pointerout",(e) =>{ if(FXS16A.hcCur&&(!e.relatedTarget||!FXS16A.hcCur.contains(e.relatedTarget))) FXS16A.hcHide(); },true);
    addEventListener("pointerdown",FXS16A.hcHide,true); addEventListener("scroll",() =>{ if(FXS16A.hcCur) FXS16A.hcHide(); },{passive:true,capture:true}); }
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  /* M13 after a level up: what grew shows a green +N, once */
  function snap(){ const s=st(); if(!s||!s.C) return null; function num(sel){ const e=FXS16A.D.querySelector(sel); return e?parseInt((e.textContent||"").replace(/[^\d-]/g,""),10):null; }
    return {n:s.C.name, lv:s.C.level, hp:num("#hpMax"), pb:num('.tile[data-bd="pb"] .v'), ac:num(".tile.ac .v"), sl:FXS16A.D.querySelectorAll(".spsl .bx").length}; }
  function gains(){ const now=snap(); if(!now||!now.n) return; let key="mi-snap-"+now.n, old=null; try{ old=JSON.parse(ls(key)||"null"); }catch(e){}
    ls(key,JSON.stringify(now)); if(!old||!(now.lv>old.lv)||FXS16A.calm()) return;
    [["#hpMax","hp"],['.tile[data-bd="pb"] .v',"pb"],[".tile.ac .v","ac"]].forEach((q,i) =>{ const el=FXS16A.D.querySelector(q[0]), dv=(now[q[1]]||0)-(old[q[1]]||0); if(!vis(el)||!(dv>0)) return; const r=el.getBoundingClientRect();
      const g=fx("mi-gain","+"+dv,2000); g.style.left=(r.left+r.width/2)+"px"; g.style.top=r.top+"px";
      g.animate([{transform:"translate(-50%,0) scale(.6)",opacity:0},{transform:"translate(-50%,-26px) scale(1.15)",opacity:1,offset:.3},{transform:"translate(-50%,-34px)",opacity:1,offset:.75},{transform:"translate(-50%,-46px)",opacity:0}],{duration:1600,delay:600+i*160,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}).onfinish=function(){ rm(g); }; }); }
  function boot(){ setTimeout(gains,500); }
  if(FXS16A.D.readyState==="complete") boot(); else addEventListener("load",boot,{once:true});
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  /* M14 a Hit Die result typed in: the die lands on that number */
  addEventListener("change",(e) =>{ const t=e.target; if(!t||!t.matches||!t.matches("input[data-hdv]")||FXS16A.calm()) return; const v=parseInt(t.value,10); if(!(v>0)) return; const r=t.getBoundingClientRect();
    const g=fx("mi-hdr",'<b>'+v+'</b>',1600); g.style.left=(r.right-24)+"px"; g.style.top=(r.top+r.height/2)+"px"; FXS16A.play("dice");
    g.animate([{transform:"translate(-50%,-50%) translateY(-60px) rotate(-360deg) scale(.5)",opacity:0},{transform:"translate(-50%,-50%) rotate(10deg) scale(1.1)",opacity:1,offset:.55},{transform:"translate(-50%,-50%) rotate(-4deg)",opacity:1,offset:.7},{transform:"translate(-50%,-50%)",opacity:1,offset:.85},{transform:"translate(-50%,-50%) scale(.9)",opacity:0}],{duration:1300,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(g); }; },true);

  /* M15 builder: a step that becomes complete gets a stamp. M16 picking a class sweeps its colour across */
  let steps=FXS16A.D.getElementById("steps"), okSet=null;
  function oks(){ const o={}; if(steps) Array.prototype.forEach.call(steps.querySelectorAll(".st[data-step]"),(s) =>{ if(s.querySelector(".sprog.ok")) o[s.getAttribute("data-step")]=1; }); return o; }
  if(steps){ okSet=oks(); let oq=0; new MutationObserver(() =>{ if(oq) return; oq=1; nf(() =>{ oq=0; const n=oks(); for(const k in n) if(!okSet[k]&&FXS16A.full()){ const s=steps.querySelector('.st[data-step="'+CSS.escape(k)+'"]'); if(vis(s)){ var r=s.getBoundingClientRect(), g=fx("mi-bstamp",'<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>',1500);
        g.style.left=(r.left+r.width/2)+"px"; g.style.top=(r.top+r.height/2)+"px"; g.animate([{transform:"translate(-50%,-50%) scale(2.4) rotate(-20deg)",opacity:0},{transform:"translate(-50%,-50%) scale(.9) rotate(0)",opacity:1,offset:.35},{transform:"translate(-50%,-50%) scale(1)",opacity:1,offset:.7},{transform:"translate(-50%,-50%) scale(1)",opacity:0}],{duration:1100,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(g); }; MI.buzz("success"); FXS16A.play("click"); } } okSet=n; }); }).observe(steps,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]}); }
  let CL=["Artificer","Barbarian","Bard","Cleric","Druid","Fighter","Monk","Paladin","Ranger","Rogue","Sorcerer","Warlock","Wizard"]; FXS16A.bCls=null;
  FXS16A.bldCls=function bldCls(){ const b=FXS16A.D.getElementById("bld"); if(!vis(b)) return null; let f=null; Array.prototype.some.call(b.querySelectorAll("h1,h2,h3,b,strong"),(e) =>{ const t=(e.textContent||"").trim(); if(CL.indexOf(t)>=0){ f=t; return true; } }); return f; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  function clsCheck(){ const c=FXS16A.bldCls(); if(!c) return; if(FXS16A.bCls&&c!==FXS16A.bCls){ FXS16A.D.documentElement.setAttribute("data-mi-cls",c.toLowerCase()); if(FXS16A.full()){ const s=fx("mi-csw","",1400); s.animate([{transform:"translateX(-110%) skewX(-12deg)",opacity:.9},{transform:"translateX(110%) skewX(-12deg)",opacity:.9}],{duration:900,easing:"cubic-bezier(.4,0,.2,1)"}).onfinish=function(){ rm(s); }; FXS16A.play("cast"); } } FXS16A.bCls=c; }
  addEventListener("change",(e) =>{ if(e.target&&e.target.closest&&e.target.closest("#bld")) setTimeout(clsCheck,120); },true);
  addEventListener("click",(e) =>{ if(e.target&&e.target.closest&&e.target.closest("#bld")) setTimeout(clsCheck,160); },true);
  setTimeout(() =>{ FXS16A.bCls=FXS16A.bldCls(); },600);

  /* X5 share card: a picture of the character drawn on a canvas, then shared or saved */
  function shareBtn(){ const card=FXS16A.D.querySelector("#app .idcard"); if(!card||card.querySelector(".mi-share")) return; const row=card.querySelector(".xpbtns"); const b=FXS16A.D.createElement("button"); b.type="button"; b.className="mi-share"; b.setAttribute("aria-label","Share character card"); b.setAttribute("data-mi-tip","Share character card");
    b.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/></svg>'; (row||card).appendChild(b); if(row) b.classList.add("in-row"); }
  let sq=0, so=new MutationObserver(() =>{ if(!sq){ sq=1; nf(() =>{ sq=0; shareBtn(); }); } }); const ap=FXS16A.D.getElementById("app"); if(ap){ const ic=FXS16A.D.querySelector("#app .idcard"); if(ic&&ic.parentNode) so.observe(ic.parentNode,{childList:true,subtree:true}); shareBtn(); }
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest(".mi-share"); if(!b) return; e.preventDefault(); e.stopPropagation(); FXS16A.makeCard(); },true);
})();


/* Structured extra damage: a mixed hit keeps a total for convenience and one
   result per damage type for resistance/immunity at the table. Old logs stay valid. */
(function(){
 if(!FXS16A.parseDmg)return;
 FXS16A.withAttackData=function(el,spec){if(!el||!el.getAttribute)return spec;
  const c=+el.getAttribute("data-crit-at");if(Number.isInteger(c)&&c>=2&&c<=20)spec.critAt=c;
  try{const p=JSON.parse(el.getAttribute("data-damage-parts")||"null");if(Array.isArray(p)&&p.length&&p.every((x) =>x&&typeof x.expr==="string"&&typeof x.type==="string")){spec.damageParts=p;spec.dmg=p.map((x) =>x.expr).join("+");spec.dtype=p.map((x) =>x.type).join(" + ")}}catch(e){}
  return spec};
 FXS16A.packetExpression=function(g,mode){return mode==="crit"&&g.critExpr?g.critExpr:g.expr};
 FXS16A.packetResult=function(groups,mode,vals){let vi=0;const out=[];
  groups.forEach((g) =>{let total=0;const dice=[],expression=FXS16A.packetExpression(g,mode);FXS16A.parseDmg(expression).forEach((q) =>{
   if(q.f){const n=q.n*(mode==="crit"?2:1);for(let i=0;i<n;i++){const v=vals[vi++];dice.push(v);total+=q.s*v}}else total+=q.s*q.k});
   out.push({type:g.type,value:Math.max(0,total),expr:mode==="crit"?expression.replace(/(\d+)d(\d+)/gi,(_,n,f)=>(+n*2)+"d"+f):expression,dice:dice,sources:g.sources||[]})});
  return {v:out.reduce((n,p) =>n+p.value,0),damageParts:out,dt:out.map((p) =>p.type).join(" + "),d:out.map((p) =>p.type+": ["+p.dice.join(", ")+"] "+p.expr+" = "+p.value).join("; ")}};
})();

FXS16A.decorateAttack=function(el,spec){return spec&&FXS16A.withAttackData?FXS16A.withAttackData(el,spec):spec};
FXS16A.markCritical=function(r,spec,use){if(spec.critAt&&use>=spec.critAt){r.critical=true;r.d+=" (critical hit)";}};
FXS16A.finishD20=function(r,spec,mode,vals){const a=vals[0], b=vals[1]||vals[0], use=mode==="adv"?Math.max(a,b):mode==="dis"?Math.min(a,b):a; r.nat=use; r.v=use+spec.bon; r.d=(mode?("["+a+", "+b+"] "+(mode==="adv"?"advantage":"disadvantage")+" "):"")+use+(spec.bon<0?" − "+(-spec.bon):" + "+spec.bon); r.k=use===20?"nat20":use===1?"nat1":"d20";FXS16A.markCritical(r,spec,use);};

FXS16A.damageExpressionFor=function(spec,mode){return spec.damageParts?spec.damageParts.map(g=>FXS16A.packetExpression(g,mode)).join("+"):spec.dmg};
