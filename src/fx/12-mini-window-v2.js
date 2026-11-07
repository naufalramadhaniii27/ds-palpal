/* === Mini window v2: a cleaner, card-based layout and its own small motion. Only styling and grouping; the app keeps every id and button === */
(function(){
  const CSS=[
  'body{padding:12px;gap:10px;background:radial-gradient(130% 55% at 50% -12%,color-mix(in srgb,var(--acc) 16%,transparent),transparent 62%),var(--paper);min-height:100vh}',
  '::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--ink) 22%,transparent);border-radius:9px}::-webkit-scrollbar-track{background:transparent}',
  '.pp-hero,.pp-ctrl,#ppCond,#ppCmb{position:relative;border-radius:16px;background:linear-gradient(165deg,color-mix(in srgb,var(--panel) 90%,#fff 10%),var(--panel) 55%);border:1px solid color-mix(in srgb,var(--line-2) 80%,transparent);box-shadow:0 10px 28px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.06)}',
  '.pp-hero{padding:12px 14px 14px;overflow:hidden}',
  '.pp-fl{position:absolute;inset:0;pointer-events:none;opacity:0;border-radius:inherit}',
  '.pp-hp{gap:6px}.pp-hp svg{width:20px;height:20px}.pp-hp b{font:800 54px/.9 var(--f-nar);letter-spacing:-.02em;display:inline-block;transform-origin:50% 80%}.pp-hp>span{font:700 18px/1 var(--f-nar)}',
  '.pp-tmp{padding:3px 8px;border-radius:999px;background:color-mix(in srgb,#7fb2ff 18%,transparent);font-size:13px}.pp-tmp:empty{display:none}',
  '.pp-ac{flex-direction:column;gap:2px;padding:6px 12px 7px;border-radius:12px;background:color-mix(in srgb,var(--panel-2) 85%,transparent);border-color:color-mix(in srgb,var(--line-2) 70%,transparent);font-size:24px;line-height:1}.pp-ac svg{width:14px;height:14px}.pp-ac::after{content:"AC";font:700 9px/1 var(--f-nar);letter-spacing:.12em;color:var(--muted)}',
  '.pp-bar{height:10px;margin-top:12px;border-radius:999px;background:color-mix(in srgb,var(--ink) 10%,transparent)}.pp-bar i{border-radius:999px;transition:transform .45s cubic-bezier(.2,.8,.2,1),background-color .3s}.pp-bar i::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.38),rgba(255,255,255,0) 65%)}',
  '.pp-ctrl{display:flex;flex-direction:column;gap:8px;padding:10px}',
  'input{height:48px;border-radius:12px;font-size:24px;background:color-mix(in srgb,var(--paper) 80%,transparent);border-color:color-mix(in srgb,var(--line-2) 70%,transparent)}input::placeholder{color:var(--faint);font-size:18px}',
  'button{border-radius:12px;transition:transform .12s ease,box-shadow .2s;-webkit-tap-highlight-color:transparent}button:active{transform:scale(.95)}button:hover{box-shadow:0 0 0 1px color-mix(in srgb,var(--ink) 18%,transparent) inset}',
  '.pp-sq{width:48px;border-radius:12px}',
  '.pp-heal{background:linear-gradient(180deg,#38b06b,#23804b)!important;border-color:transparent!important;box-shadow:0 6px 16px rgba(56,176,107,.32)}',
  '.pp-dmg{background:linear-gradient(180deg,#e2554a,#a92f26)!important;border-color:transparent!important;box-shadow:0 6px 16px rgba(226,85,74,.32)}',
  '.pp-tb{background:linear-gradient(180deg,color-mix(in srgb,#7fb2ff 26%,var(--panel-2)),var(--panel-2));border-color:color-mix(in srgb,#7fb2ff 40%,transparent)}',
  '#ppCond,#ppCmb{padding:10px 12px;gap:8px}',
  '.pp-k{flex-basis:100%;font-size:10.5px;letter-spacing:.14em;margin:0 0 -2px}',
  '.pp-c button{border-radius:999px;min-height:34px}.pp-c .on{box-shadow:0 0 0 1px color-mix(in srgb,var(--warn,#e2aa4c) 60%,transparent) inset}',
  '.pp-ct{border-radius:10px!important;min-width:36px;min-height:34px!important}.pp-ct.on{background:linear-gradient(180deg,#ffc24a,#e09a12)!important;border-color:transparent!important;color:#2b1a00!important;box-shadow:0 4px 12px rgba(255,176,32,.35)}',
  '[data-ppcturn]{margin-left:auto;border-radius:999px!important;padding:0 14px!important}',
  '.pp-cl{gap:6px;margin-top:2px}',
  '.pp-cr{padding:8px 8px 8px 10px;border:0!important;border-radius:12px;background:color-mix(in srgb,var(--panel-2) 80%,transparent);box-shadow:inset 3px 0 0 #ffb020}.pp-cr.emp{box-shadow:inset 3px 0 0 color-mix(in srgb,var(--ink) 20%,transparent)}',
  '.pp-cs{width:48px}.pp-cn{font-size:14.5px}',
  '.pp-cu{border-radius:999px!important;padding:0 14px!important;background:color-mix(in srgb,var(--acc) 22%,var(--panel-2));border-color:color-mix(in srgb,var(--acc) 45%,transparent)}.pp-cu[aria-pressed="true"]{background:var(--panel-2);color:var(--muted);border-color:var(--line-2)}',
  ':root[data-theme="light"] .pp-hero,:root[data-theme="light"] .pp-ctrl,:root[data-theme="light"] #ppCond,:root[data-theme="light"] #ppCmb{box-shadow:0 6px 18px rgba(0,0,0,.08)}',
  '@media (prefers-reduced-motion:reduce){button{transition:none}.pp-bar i{transition:none}}'].join("");
  FXENV.__miPip=function(w){ const d=w.document; if(!d||!d.body) return;
    const st=d.createElement("style"); st.id="miPip"; st.textContent=CSS; d.head.appendChild(st);
    const top=d.querySelector(".pp-top"), bar=d.querySelector(".pp-bar"), rows=d.querySelectorAll(".pp-row");
    if(top&&bar){ const h=d.createElement("div"); h.className="pp-hero"; top.parentNode.insertBefore(h,top); h.appendChild(top); h.appendChild(bar); const fl=d.createElement("i"); fl.className="pp-fl"; h.appendChild(fl); }
    if(rows.length){ const c=d.createElement("div"); c.className="pp-ctrl"; rows[0].parentNode.insertBefore(c,rows[0]); Array.prototype.forEach.call(rows,(r) =>{ c.appendChild(r); }); }
    /* motion: the number pops and the card flashes when Hit Points change */
    let hp=d.getElementById("ppHp"), prev=null, MI=FXENV.__MI;
    if(hp&&hp.animate) new w.MutationObserver(() =>{ const v=+hp.textContent; if(prev===null||isNaN(v)){ prev=v; return; } if(v===prev) return; const down=v<prev; prev=v; if(MI&&MI.rm()) return;
      hp.animate(down?[{transform:"none"},{transform:"translateX(-5px) scale(1.08)"},{transform:"translateX(4px)"},{transform:"translateX(-2px)"},{transform:"none"}]:[{transform:"scale(1)"},{transform:"scale(1.18)",offset:.35},{transform:"none"}],{duration:down?380:420,easing:"ease-out"});
      const f=d.querySelector(".pp-fl"); if(f){ f.style.background=down?"radial-gradient(120% 90% at 20% 30%,rgba(229,57,53,.42),transparent 70%)":"radial-gradient(120% 90% at 20% 30%,rgba(76,194,122,.42),transparent 70%)"; f.animate([{opacity:0},{opacity:1,offset:.2},{opacity:0}],{duration:650,easing:"ease-out"}); } }).observe(hp,{childList:true,characterData:true,subtree:true});
    if(hp) prev=+hp.textContent; };
})();

