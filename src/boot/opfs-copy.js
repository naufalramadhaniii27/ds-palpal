/* N48: a second copy of every stored key in the origin private file system (OPFS), for the case that the browser clears IndexedDB and
   localStorage but leaves other site data. The copy is one JSON file ("cs-copy.json") with the same keys the store holds.
   - Written after the store has flushed, at most once per 30 s (first write after 2 s). A browser without createWritable does nothing.
   - When the app starts with no character data and a copy exists, the app offers to restore it (window.__ask). Until the person answers,
     nothing is written, so the copy is not replaced by an empty start. A declined copy is kept as "cs-copy-prev.json".
   - Clearing all site data removes the OPFS copy too. The file backup and the cloud copy cover that case. */
(function(){
  const FILE="cs-copy.json", PREV="cs-copy-prev.json", MARK="cs-store-v1", GAP=3e4;
  let HOLD=false, LAST=0, TM=0, BUSY=null, OK=false;
  const can=()=>{ try{ return !!(navigator.storage&&navigator.storage.getDirectory&&window.FileSystemFileHandle&&FileSystemFileHandle.prototype.createWritable); }catch(e){ return false; } };
  const dir=()=>navigator.storage.getDirectory();
  async function put(name,text){ const h=await (await dir()).getFileHandle(name,{create:true}), w=await h.createWritable(); await w.write(text); await w.close(); }
  async function get(name){ try{ const h=await (await dir()).getFileHandle(name), f=await h.getFile(); return await f.text(); }catch(e){ return null; } }
  function snap(){ const keys={}, s=window.__store; if(!s) return null; for(let i=0;i<s.length;i++){ const k=s.key(i); if(k!=null&&k!==MARK){ const v=s.getItem(k); if(typeof v==="string") keys[k]=v; } }
    return {v:1,app:"dnd-sheet",t:Date.now(),keys:keys}; }
  const hasChars=(k)=>!!(k&&(k["cs-roster-v1"]||k["yudhi-kelapa-sheet-v1"]||k["yudhi-kelapa-build-v3"]));
  async function write(){ if(!OK||HOLD) return false; const o=snap(); if(!o||!hasChars(o.keys)) return false; LAST=Date.now();
    try{ await put(FILE,JSON.stringify(o)); return true; }catch(e){ return false; } }
  async function read(){ const t=await get(FILE); if(!t) return null; try{ const o=JSON.parse(t); return o&&o.v===1&&o.keys&&hasChars(o.keys)?o:null; }catch(e){ return null; } }
  function plan(){ if(!OK||HOLD||TM) return; const wait=Math.max(2000,LAST+GAP-Date.now()); TM=setTimeout(()=>{ TM=0; BUSY=write(); },wait); }
  window.addEventListener("cs-store-flushed",plan);
  async function offer(copy){
    let n=0; try{ n=Object.keys(JSON.parse(copy.keys["cs-roster-v1"]||"{}").chars||{}).length; }catch(e){}
    const when=new Date(copy.t).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
    const msg="Your saved characters are missing from this browser, but a copy from "+when+" was found on this device"+(n?" ("+n+(n===1?" character":" characters")+")":"")+". Restore it?";
    let done=false; const decline=async()=>{ if(done) return; done=true; try{ const t=await get(FILE); if(t) await put(PREV,t); }catch(e){} HOLD=false; plan(); };
    window.__ask(msg,"Restore Copy",()=>{ done=true;
      const s=window.__store; Object.keys(copy.keys).forEach((k)=>{ try{ s.setItem(k,copy.keys[k]); }catch(e){} });
      const go=()=>{ try{ sessionStorage.setItem("cs-skip","1"); }catch(e){} location.reload(); }; s.flush?s.flush().then(go,go):go(); },
      ["Not Now",decline]);
    const iv=setInterval(()=>{ if(!document.querySelector(".ask")){ clearInterval(iv); setTimeout(()=>{ if(!done) decline(); },300); } },400); }
  function whenAsk(copy,tries){ if(typeof window.__ask==="function"){ offer(copy); return; } if(tries>200){ HOLD=false; return; } setTimeout(()=>whenAsk(copy,tries+1),100); }
  OK=can();
  window.__opfs={can:()=>OK,write:()=>{ const was=HOLD; HOLD=false; return write().finally(()=>{ HOLD=was; }); },read:read,hold:()=>HOLD,prev:()=>get(PREV)};
  if(!OK||!window.__store) return;
  window.__store.ready(async()=>{
    const s=window.__store; let wiped=true; for(let i=0;i<s.length;i++){ const k=s.key(i); if(k==="cs-roster-v1"||k==="yudhi-kelapa-sheet-v1"||k==="yudhi-kelapa-build-v3"){ wiped=false; break; } }
    if(!wiped) return;
    const copy=await read(); if(!copy) return;
    HOLD=true; window.addEventListener("cs-gate-done",()=>whenAsk(copy,0),{once:true}); if(window.__gateDone) whenAsk(copy,0); });
})();
