/* --- v55: ambience for every condition and for Concentration, Rage and the other modes, low Hit Points, and dying --- */
/* Ambience of conditions, Concentration, Rage, low Hit Points and dying (SOLID stage 13C): the data table and the builders of the layers are plain top-level names (FXAMB_*, fxAmb*) so that the IIFE below keeps only the box, the change detector and the observers.
   e: side edges, t/b: top or bottom edge, v: vignette, f: frame, h: hatching; a: strength; t: pulse seconds;
   p: [particle, count, colour]; m: extra motion; beat: heartbeat timing */
const FXAMB_DATA={
    Poisoned:{e:"76,194,122",a:.22,t:3.6,p:["bubble",8,"123,211,137"]},
    Blinded:{v:"0,0,0",a:.72,t:5.5,e2:"0,0,0",p:["wisp",7,"40,40,46"]},
    Charmed:{e:"255,110,185",a:.24,t:3.2,p:["heart",9,"255,143,199"]},
    Deafened:{e:"140,160,175",a:.22,t:4.5,p:["wave",4,"185,200,210"]},
    Exhaustion:{v:"45,22,8",a:.32,t:6.5,e2:"200,120,60",p:["ash",9,"150,140,130"]},
    Frightened:{e:"120,70,200",a:.26,t:2.6,m:"shiver",v2:"25,10,45",p:["wisp",7,"120,80,190"]},
    Grappled:{e:"175,120,65",a:.26,t:3,m:"squeeze",p:["dust",7,"200,160,110"]},
    Restrained:{e:"175,120,65",a:.26,t:3,m:"squeeze",h:"160,110,60",p:["link",7,"190,140,85"]},
    Incapacitated:{e:"150,150,160",a:.24,t:5,v2:"20,20,25",p:["mote",9,"190,190,200"]},
    Invisible:{e:"160,210,255",a:.22,t:2.8,p:["mote",14,"200,230,255"]},
    Paralyzed:{e:"255,215,80",a:.22,t:1.8,p:["bolt",8,"255,230,120"]},
    Petrified:{e:"150,150,150",a:.28,t:7,h:"125,125,125",p:["ash",8,"165,165,165"]},
    Prone:{b:"175,130,85",a:.34,t:4,p:["dust",12,"200,165,120"]},
    Stunned:{t2:"255,215,80",a:.28,t:2.4,e2:"255,215,80",p:["star",10,"255,224,102"]},
    Unconscious:{v:"10,15,45",a:.62,t:6,p:["z",6,"170,190,235"]},
    conc:{f:"110,170,255",a:.7,t:3.2,p:["mote",8,"150,195,255"]},
    rage:{e:"255,85,35",a:.28,t:1.6,p:["ember",14,"255,140,60"]},
    sacred:{f:"255,215,120",a:.6,t:3,p:["mote",8,"255,225,150"]},
    radiance:{e:"255,240,200",a:.22,t:3,p:["mote",12,"255,240,200"]},
    wings:{e:"255,240,200",a:.22,t:3,p:["mote",12,"255,240,200"]},
    shroud:{v:"30,0,40",a:.5,t:4,p:["wisp",8,"150,90,190"]},
    insp:{e:"255,200,70",a:.12,t:4.2,p:["star",6,"255,214,102"],r:1},
    tmp:{f:"90,160,230",a:.45,t:4,r:1},
    combat:{f:"230,70,50",a:.42,t:2.2,e2:"230,70,50"},/* no particles: they would sit over the Combat View content */
    wildshape:{e:"90,160,70",a:.2,t:4,p:["leaf",10,"120,170,70"]},
    noslots:{e:"120,80,170",a:.16,t:5,p:["wisp",6,"130,100,170"]},
    stable:{v:"40,140,90",a:.38,t:5,p:["mote",9,"150,230,180"]},
    dead:{v:"12,12,15",a:.78,t:8,p:["ash",8,"150,150,155"]},
    low:{e:"229,83,75",a:.22,t:1.05,beat:1},
    dying:{v:"130,0,0",a:.5,t:1.05,beat:1}
  };
const FXAMB_HEART='<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.3 5 6.8 5c2 0 3.6 1.1 5.2 3 1.6-1.9 3.2-3 5.2-3 3.5 0 5.6 3.6 4.3 6.8C19.5 16.4 12 21 12 21z"/></svg>';
function fxAmbSeeded(k,i){ const x=Math.sin((k.length*31+i*97.3))*43758.5453; return x-Math.floor(x); }
function fxAmbParts(k,P){ let type=P[0], n=P[1], pc=P[2], h="";
    for(let i=0;i<n;i++){ let r1=fxAmbSeeded(k,i), r2=fxAmbSeeded(k,i+50), side=i%2===0, edge=6+Math.round(r1*38), pos=(side?"left":"right")+":"+edge+"px", st="--pc:"+pc+";", cls="p "+type+(side?" sl":" sr"), inner="";
      if(type==="ash"){ cls+=" fall"; st+=pos+";--s:"+(3+Math.round(r2*4))+"px;--d:"+(11+r2*7).toFixed(1)+"s;--dl:-"+(r1*14).toFixed(1)+"s;--w:"+(side?8:-8)+"px"; }
      else if(type==="leaf"){ st+=pos+";--s:"+(12+Math.round(r2*8))+"px;--d:"+(10+r2*6).toFixed(1)+"s;--dl:-"+(r1*14).toFixed(1)+"s;--w:"+(side?6:-6)+"px"; }
      else if(type==="bubble"||type==="ember"||type==="heart"||type==="z"||type==="wisp"||type==="link"||(type==="star"&&FXAMB_DATA[k].r)){ cls+=" rise"; if(type==="star") cls=cls.replace("p star","p star rise"); const s=type==="z"?12+Math.round(r2*8):type==="ember"?4+Math.round(r2*4):type==="heart"?12+Math.round(r2*8):type==="link"?12+Math.round(r2*6):type==="star"?7+Math.round(r2*5):type==="wisp"?10+Math.round(r2*8):6+Math.round(r2*6);
        st+=pos+";--s:"+s+"px;--d:"+(type==="ember"?4.5+r2*3:9+r2*6).toFixed(1)+"s;--dl:-"+(r1*10).toFixed(1)+"s;--w:"+(side?6:-6)+"px";
        if(type==="heart") inner=FXAMB_HEART; if(type==="z") inner="z"; }
      else if(type==="mote"||type==="star"){ cls+=" tw"; st+=(type==="star"?"left:"+(4+r1*92).toFixed(1)+"%;top:"+(6+r2*34).toFixed(0)+"px":pos+";top:"+(8+r2*84).toFixed(1)+"%")+";--s:"+(type==="star"?8+Math.round(r2*6):5+Math.round(r2*5))+"px;--d:"+(2.4+r2*2.6).toFixed(1)+"s;--dl:-"+(r1*4).toFixed(1)+"s"; }
      else if(type==="bolt"){ cls="p spark bolt "+(side?"sl":"sr"); st+=pos+";top:"+(6+r2*84).toFixed(1)+"%;--d:"+(1.4+r2*2.2).toFixed(1)+"s;--dl:-"+(r1*3).toFixed(1)+"s;width:26px;height:44px;background:none;box-shadow:none;transform:rotate("+(Math.round(r2*50)-25)+"deg)";
        inner='<svg viewBox="0 0 26 44" width="26" height="44" style="display:block;overflow:visible"><path d="M15 1 4 22h8L8 43l14-26h-8z" fill="rgba('+pc+',.85)" stroke="#fff" stroke-width="1" stroke-linejoin="round" style="filter:drop-shadow(0 0 4px rgba('+pc+',.9))"/></svg>'; }
      else if(type==="spark"){ st+=pos+";top:"+(8+r2*84).toFixed(1)+"%;--s:"+(10+Math.round(r1*10))+"px;--d:"+(1.6+r2*2.4).toFixed(1)+"s;--dl:-"+(r1*3).toFixed(1)+"s;transform:rotate("+(Math.round(r2*60)-30)+"deg)"; }
      else if(type==="dust"){ st+="left:"+(4+r1*92).toFixed(1)+"%;--s:"+(3+Math.round(r2*4))+"px;--d:"+(2.5+r2*2.5).toFixed(1)+"s;--dl:-"+(r1*4).toFixed(1)+"s;--w:"+(Math.round(r2*30)-15)+"px"; }
      else if(type==="wave"){ st+=(side?"left:0":"right:0")+";--d:3.8s;--dl:-"+(i*1.9).toFixed(1)+"s"; }
      h+='<i class="'+cls+'" style="'+st+'">'+inner+'</i>'; }
    return h; }
function fxAmbLayer(box,k){ let c=FXAMB_DATA[k], h="", m=c.m?" "+c.m:"", bt=c.beat?" beat":"";
    if(c.e) h+='<i class="e l'+m+bt+'"></i><i class="e r'+m+bt+'"></i>';
    if(c.h) h+='<i class="e l h" style="--hc:'+c.h+'"></i><i class="e r h" style="--hc:'+c.h+'"></i>';
    if(c.t2) h+='<i class="e t'+bt+'" style="--c:'+c.t2+'"></i>';
    if(c.b) h+='<i class="e b'+bt+'" style="--c:'+c.b+'"></i>';
    if(c.v) h+='<i class="v'+bt+'"></i>';
    if(c.v2) h+='<i class="v" style="--c:'+c.v2+';--a:.3"></i>';
    if(c.e2) h+='<i class="e l" style="--c:'+c.e2+';--a:.12"></i><i class="e r" style="--c:'+c.e2+';--a:.12"></i>';
    if(c.f) h+='<i class="f"></i>';
    if(c.p) h+=fxAmbParts(k,c.p);
    const d=document.createElement("div"); d.className="ma"; d.setAttribute("data-k",k);
    d.style.cssText="--c:"+(c.e||c.v||c.f||c.t2||c.b)+";--a:"+c.a+";--t:"+c.t+"s"; d.innerHTML=h; box.appendChild(d); void d.offsetWidth; return d; }
function fxAmbState(){ const st={}, cd=document.getElementById("conds");
    if(cd) Array.prototype.forEach.call(cd.querySelectorAll(".chip.on"),(c) =>{ const di=(c.getAttribute("data-info")||"").replace(/^g:/,""), md=c.getAttribute("data-mode");
      if(c.classList.contains("exh-c")){ const n=/(\d+)/.exec(c.textContent); st.Exhaustion=n?+n[1]:1; }
      else if(c.classList.contains("conc")) st.conc=1;
      else if(md){ if(FXAMB_DATA[md]) st[md]=1; else if(/rage/i.test(md)) st.rage=1; }
      else if(FXAMB_DATA[di]) st[di]=1; });
    const ip=document.getElementById("insp")||document.getElementById("vbInsp"); if(ip&&ip.getAttribute("aria-pressed")==="true") st.insp=1;
    const tm=document.getElementById("hpTmp"); if(tm&&tm.classList.contains("on")) st.tmp=1;
    const hb=document.getElementById("hpBox"), bar=document.getElementById("hpBar");
    if(hb&&hb.classList.contains("hp0")){ const vt=document.querySelector(".vitals"), ok=document.querySelectorAll('#dsS .pip[aria-pressed="true"]').length;
        if(vt&&vt.classList.contains("dead")) st.dead=1; else if(ok>=3) st.stable=1; else st.dying=1; }
    else if(bar&&bar.getAttribute("data-lv")==="low") st.low=1;
    if(document.querySelector("#sheet.on #cbv")) st.combat=1;
    const sl=document.querySelectorAll("#p-spells .spsl .bx"); if(sl.length&&!document.querySelector('#p-spells .spsl .bx[aria-pressed="false"]')) st.noslots=1;
    return st; }
(function(){
  let box=null, last="";
  FXENV.__miAmb=function(force){ const st=MI.rm()?{}:fxAmbState(), key=JSON.stringify(st); if(key===last&&!force) return; last=key;
    if(!box){ if(key==="{}") return; box=document.createElement("div"); box.id="miAmb"; box.setAttribute("aria-hidden","true"); document.body.appendChild(box); }
    Object.keys(FXAMB_DATA).forEach((k) =>{ let el=box.querySelector('.ma[data-k="'+k+'"]'), on=!!st[k];
      if(on&&!el) el=fxAmbLayer(box,k);
      if(el){ el.classList.toggle("on",on); if(k==="Exhaustion"&&on) el.style.setProperty("--a",(0.18+Math.min(6,st[k])*0.07).toFixed(2)); } }); };
  requestAnimationFrame(FXENV.__miAmb);
  let sh=document.getElementById("sheet"), sbd=document.getElementById("sheetBody"), q=0, kick=function(){ if(!q){ q=1; requestAnimationFrame(() =>{ q=0; FXENV.__miAmb(); }); } };
  if(sh) new MutationObserver(kick).observe(sh,{attributes:true,attributeFilter:["class"]});
  if(sbd) new MutationObserver(kick).observe(sbd,{childList:true});
})();
