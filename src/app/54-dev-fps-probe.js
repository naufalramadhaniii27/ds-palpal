import {S,save} from "./04-logic-storage.js";
import {mq} from "./21-ui-tabs-pager.js";
import {renderAll} from "./35-ui-combo.js";
import { html, render as drawHtml } from "./lib/html.js";
/* ===== fps probe: open the app with #fps at the end of the address to measure frame times on this device =====
   Runs only when the address has #fps. It opens the first character, switches every page, and (if you tick the box) deals 3 damage
   and heals 3, four times. Hit Points and temporary Hit Points are put back after the test. Nothing is sent anywhere. */
(function(){
  if(!/(^|[#&])fps($|&)/.test(location.hash)) return;
  const box=document.createElement("div"); box.id="fpsProbe"; box.setAttribute("role","dialog"); box.setAttribute("aria-label","Frame rate test");
  box.style.cssText="position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483000;background:rgba(10,14,16,.94);color:#e8eef0;font:12px/1.45 ui-monospace,Menlo,Consolas,monospace;padding:10px 12px;border:1px solid #3a4a52;border-radius:12px;max-height:46vh;overflow:auto;white-space:pre-wrap";
  drawHtml(html`<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b>Frame rate test</b><button id="fpsGo" style="padding:6px 12px;border-radius:8px">Start</button><button id="fpsCopy" style="padding:6px 12px;border-radius:8px" hidden>Copy result</button><label style="display:flex;gap:4px;align-items:center"><input type="checkbox" id="fpsDmg" checked> include damage and heal (HP restored after)</label><label style="display:flex;gap:4px;align-items:center"><input type="checkbox" id="fpsWarm"> quick warm-up first (pager nearly transparent)</label></div><pre id="fpsOut" style="margin:8px 0 0;white-space:pre-wrap">Press Start. Keep this tab in front and do not touch the screen until it says Done.</pre>`, box);
  box.setAttribute("popover","manual"); box.style.top="auto"; box.style.margin="0"; box.style.width="auto"; box.style.height="auto";/* top layer, so the Home screen cannot cover it */
  document.documentElement.appendChild(box); try{ box.showPopover(); }catch(er){}/* outside body: body is inert while a dialog or the Home screen is open */
  let out=box.querySelector("#fpsOut"), go=box.querySelector("#fpsGo"), cp=box.querySelector("#fpsCopy"), busy=false, rec=null, lines=[];
  function wait(ms){ return new Promise((r) =>{ setTimeout(r,ms); }); }
  function visible(el){ return !!el&&!!el.getClientRects().length; }
  function waitFor(fn,ms){ const t0=performance.now(); return new Promise((res) =>{ (function p(){ const v=fn(); if(v||performance.now()-t0>ms) return res(v); setTimeout(p,100); })(); }); }
  (function loop(t){ if(rec) rec.push(t); requestAnimationFrame(loop); })(0);
  let loaf=[], gather=false, wins=[];
  function tabOf(t){ let r="?"; wins.forEach((w) =>{ if(t>=w[1]) r=w[0]; }); return r; } try{ new PerformanceObserver((l) =>{ l.getEntries().forEach((e) =>{ if(gather) loaf.push(e); }); }).observe({type:"long-animation-frame",buffered:false}); }catch(er){}
  function loafTxt(){ if(!loaf.length) return ""; const t=loaf.slice().sort((a,b) =>{ return b.duration-a.duration; }).slice(0,3).map((e) =>{ const sc=(e.scripts||[]).slice().sort((a,b) =>{ return b.duration-a.duration; })[0];
      return "   slow frame "+Math.round(e.duration)+" ms at "+tabOf(e.startTime)+" (round,tab)"+"  (script "+Math.round((e.renderStart||e.startTime)-e.startTime)+", style+layout "+Math.round(e.styleAndLayoutStart?(e.startTime+e.duration-e.styleAndLayoutStart):0)+")"+(sc?" top script "+Math.round(sc.duration)+" ms "+(sc.invoker||"")+" "+(sc.sourceFunctionName||"")+" "+(sc.sourceURL?sc.sourceURL.split("/").pop():"")+":"+(sc.sourceCharPosition||""):" no script"); }).join("\n"); return "\n"+t; }
  function stat(fr){ if(fr.length<3) return null; let d=[], i; for(i=1;i<fr.length;i++) d.push(fr[i]-fr[i-1]); const s=d.slice().sort((a,b) =>{ return a-b; }), n=d.length, over=function(x){ return Math.round(100*d.filter((v) =>{ return v>x; }).length/n); };
    return {fps:Math.round(10*n/((fr[fr.length-1]-fr[0])/1000))/10, med:Math.round(10*s[n>>1])/10, p95:Math.round(10*s[Math.max(0,Math.ceil(n*.95)-1)])/10, worst:Math.round(s[n-1]), o17:over(17.7), o33:over(34.4), n:n}; }
  async function phase(name,fn){ rec=[]; loaf=[]; wins=[]; gather=true; await fn(); const st=stat(rec); rec=null; await wait(300); gather=false; lines.push(name+": "+(st?st.fps+" fps, median "+st.med+" ms, p95 "+st.p95+" ms, worst "+st.worst+" ms, over 16.7 ms: "+st.o17+"%, over 33 ms: "+st.o33+"%":"no frames")+loafTxt()); out.textContent=lines.join("\n"); return st; }
  async function run(){ if(busy) return; busy=true; go.disabled=true; cp.hidden=true; lines=[]; let withDmg=box.querySelector("#fpsDmg").checked, h0=null, t0=null;
    try{
      lines.push("Screen "+innerWidth+" x "+innerHeight+", pixel ratio "+(window.devicePixelRatio||1)+", cores "+(navigator.hardwareConcurrency||"?")+", memory "+(navigator.deviceMemory||"?")+" GB");
      lines.push("Browser "+navigator.userAgent.replace(/^Mozilla\/5.0 /,"").slice(0,110));
      const hv=document.querySelector("[data-hview]"); if(visible(hv)){ hv.click(); }
      const ok=await waitFor(() =>{ return visible(document.getElementById("dmgBtn")); },8000); if(!ok){ lines.push("Open a character first, then press Start again."); out.textContent=lines.join("\n"); return; }
      await wait(1500);
      if(box.querySelector("#fpsWarm").checked&&mq.matches){ const wb=[].slice.call(document.querySelectorAll("#bnav button")).filter(visible), pgr=document.getElementById("pager"), t0w=performance.now();
        const fr=function(){ return new Promise((r) =>{ requestAnimationFrame(() =>{ requestAnimationFrame(r); }); }); };
        const imgs=[].slice.call(document.querySelectorAll("#pager img")); imgs.forEach((im) =>{ try{ im.loading="eager"; if(im.decode) im.decode().catch(() =>{}); }catch(er){} });
        pgr.style.opacity=".01"; pgr.style.transition="none"; for(let w=0;w<wb.length;w++){ wb[w].click(); await fr(); } wb[0].click(); await fr(); pgr.style.opacity=""; pgr.style.transition="";
        lines.push("Quick warm-up done in "+Math.round(performance.now()-t0w)+" ms ("+imgs.length+" images decoded, pager nearly transparent meanwhile)."); out.textContent=lines.join("\n"); await wait(800); }
      const idle=await phase("1 idle 3 s",() =>{ return wait(3000); });
      const btns=[].slice.call(document.querySelectorAll(mq.matches?"#bnav button":"#tabs .tab")).filter(visible);
      await phase("2 switch pages ("+btns.length+" x2)",async () =>{ for(let r=0;r<2;r++){ for(let i=0;i<btns.length;i++){ wins.push([(r+1)+","+i+" "+(btns[i].textContent||"").trim().slice(0,10),performance.now()]); btns[i].click(); await wait(320); } } });
      if(withDmg){ const inp=document.getElementById("hpAmt"), d=document.getElementById("dmgBtn"), h=document.getElementById("healBtn");
        if(visible(d)&&visible(h)&&inp&&typeof S==="object"){ h0=S.hp; t0=S.tmp;
          await phase("3 damage and heal (4 rounds)",async () =>{ for(let k=0;k<4;k++){ inp.value="3"; inp.dispatchEvent(new Event("input",{bubbles:true})); d.click(); await wait(520); h.click(); await wait(520); } });
        } else lines.push("3 damage and heal: skipped (the Hit Points card is not on this page)"); }
      lines.push("Done. A smooth run shows 'over 16.7 ms' under 5% and 'worst' under 100 ms. On a 120 Hz screen the 16.7 ms line is a stricter test.");
    }catch(er){ lines.push("Error: "+(er&&er.message||er)); }
    finally{ if(h0!=null){ try{ S.hp=h0; S.tmp=t0; save(); renderAll(true); lines.push("Hit Points put back to "+h0+(t0?" + "+t0+" temporary":"")+"."); }catch(er2){} } out.textContent=lines.join("\n"); busy=false; go.disabled=false; cp.hidden=false; }
  }
  go.addEventListener("click",run);
  cp.addEventListener("click",() =>{ const t=lines.join("\n"); if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(() =>{ cp.textContent="Copied"; },() =>{ cp.textContent="Select the text and copy"; }); } else cp.textContent="Select the text and copy"; });
})();
