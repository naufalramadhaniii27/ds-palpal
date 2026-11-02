// @ts-check
/* T11 N22 build duel: many headless fights with fixed seeds, to compare builds. Only this simulation has a simple pilot (walk to the
   nearest foe, use the best attack in reach, Multiattack first, a save action when nothing reaches). The Training Ground itself keeps
   no enemy AI: there the player gives every command (user decision 2026-10-29). Same seeds give the same result. */
(function(root){
const TGE=root.TGE||(typeof require==="function"?require("./20-engine.js"):null);
function pilot(st,id){ const cmds=[];
  function go(c){ const s=TGE.step(st,c); if(s.err) return false; st=s; cmds.push(c); return true; }
  const u=st.units[id]; if(!TGE.active(u)){ go({t:"end"}); return st; }
  if(u.cond.prone) go({t:"stand"});
  const fs=TGE.foes(st,u).filter((f) =>{ return !f.dead; }); if(!fs.length){ go({t:"end"}); return st; }
  const me=function(){ return st.units[id]; };
  fs.sort((a,b) =>{ return TGE.udist(u,a)-TGE.udist(u,b)||(a.id<b.id?-1:1); }); let tg=fs[0];
  const atks=u.acts.filter((a) =>{ return a.k==="atk"&&(a.dmg||[]).length; });
  function inR(a){ const d=TGE.udist(me(),st.units[tg.id]); return a.mr==="r"?(a.rng&&d<=a.rng[1]):(d<=(a.reach||5)||(a.mr==="mr"&&a.rng&&d<=a.rng[1])); }
  if(!atks.some(inR)&&TGE.speedLeft(u)>0){ const best=TGE.reach(st,id), keys=Object.keys(best).filter((k) =>{ return !best[k].pass; });
    keys.sort((a,b) =>{ const pa=a.split(",").map(Number), pb=b.split(",").map(Number); return TGE.udist(Object.assign({},me(),{pos:pa}),st.units[tg.id])-TGE.udist(Object.assign({},me(),{pos:pb}),st.units[tg.id])||best[a].c-best[b].c||(a<b?-1:1); });
    const to=keys[0]&&keys[0].split(",").map(Number); if(to&&(to[0]!==u.pos[0]||to[1]!==u.pos[1])){ go({t:"move",to:to});
      st.log.slice(-3).forEach((e) =>{ if(e.t==="oa-open"&&e.u===id&&!st.over){ const f=st.units[e.by], m=(f.acts||[]).filter((a) =>{ return a.k==="atk"&&a.mr!=="r"&&(a.dmg||[]).length; })[0]; if(m&&TGE.active(me())) go({t:"attack",oa:1,by:f.id,target:id,act:m.n}); } }); } }
  if(st.over||!TGE.active(me())){ if(!st.over) go({t:"end"}); return st; }
  const multi=u.acts.filter((a) =>{ return a.k==="multi"&&a.ma&&a.ma.length; })[0], save=u.acts.filter((a) =>{ return a.k==="save"&&!u.used[a.n]; })[0];
  const spell=(u.spells||[]).filter((x) =>{ return (x.k==="atk"||x.k==="save")&&x.l===0&&(!x.rng||TGE.udist(me(),st.units[tg.id])<=x.rng); })[0];
  if(multi&&atks.some(inR)&&go({t:"multi",act:multi.n})){ let g=0; while(me().turn.ma&&me().turn.ma.length&&g++<8&&!st.over){ if(st.units[tg.id].dead){ const nf=TGE.foes(st,me()).filter((x) =>{ return !x.dead; }); if(!nf.length) break; nf.sort((a,b) =>{ return TGE.udist(me(),a)-TGE.udist(me(),b); }); tg=nf[0]; }
      var want=me().turn.ma[0].split("|"), a=atks.filter((x) =>{ return want.indexOf(x.n)>=0&&inR(x); })[0]; if(!a||!go({t:"attack",target:tg.id,act:a.n})) break; } }
  else { const a2=atks.filter(inR).sort((x,y) =>{ return (TGE.odds(st,id,tg.id,y.n)||{avg:0}).avg-(TGE.odds(st,id,tg.id,x.n)||{avg:0}).avg; })[0];
    if(!(a2&&go({t:"attack",target:tg.id,act:a2.n}))){ if(spell) go({t:"cast",sp:spell.n,targets:[tg.id]}); else if(save&&TGE.udist(me(),st.units[tg.id])<=30) go({t:"save",act:save.n,targets:[tg.id]}); else go({t:"dodge"}); } }
  if(!st.over) go({t:"end"}); return st; }
/* one fight to the end (at most 40 rounds). Returns the result and the hero's Hit Points left */
function fight(units,seed,w,h){ let st=TGE.step(TGE.create({seed:seed,w:w||14,h:h||10,units:JSON.parse(JSON.stringify(units))}),{t:"start"}), g=0;
  while(!st.over&&st.round<=40&&g++<3000){ const id=TGE.now(st), before=st.n; st=pilot(st,id); if(st.n===before) st=TGE.step(st,{t:"end"}); }
  const pc=st.units.pc; return {won:st.over==="won",rounds:st.round,hp:pc?pc.hp:0,max:pc?pc.max:1}; }
/* n fights of one hero against the same group, seeds seed0..seed0+n-1. Runs in slices so the screen stays usable; onDone gets the totals */
function duel(pc,foes,n,seed0,onDone,onStep){ const units=[TGE.fromSheet(pc,"pc",[1,5])], k=0; foes.forEach((c,i) =>{ units.push(TGE.fromCreature(c,"f"+i,[11+(i%2)*2,1+Math.floor(i/2)*3],"foe")); });
  let won=0, rounds=0, hp=0, i=0; (function slice(){ const end=Date.now()+30; while(i<n&&Date.now()<end){ const r=fight(units,seed0+i); if(r.won){ won++; hp+=r.hp/r.max; } rounds+=r.rounds; i++; }
    if(onStep) onStep(i,n); if(i<n){ setTimeout(slice,0); return; } onDone({n:n,won:won,rate:won/n,rounds:rounds/n,hpLeft:won?hp/won:0}); })(); }
/* N30 quick estimate, no fights: the hero's best average damage per turn (exact odds, N20) against one foe, the foes' average per turn
   (Multiattack summed), foes fall one after another, so the hero takes F x (foe HP / D) x (k + k-1 + ... + 1). The margin
   (HP left as a share of HP) goes through a logistic curve fitted to 72 simulated groups (4 heroes, levels 3 and 4, 60 fights each):
   mean gap to the simulation 11 points. Used to pick the group and shown at once, the fights confirm it */
function est(pc,c,k){ const st=TGE.create({seed:1,w:6,h:4,units:[TGE.fromSheet(pc,"pc",[1,1]),TGE.fromCreature(c,"f0",[2,1],"foe")]});
  const best=function(id,tid,names){ let m=0; st.units[id].acts.forEach((a) =>{ if(a.k!=="atk"||(names&&names.indexOf(a.n)<0)) return; const o=TGE.odds(st,id,tid,a.n); if(o&&o.avg>m) m=o.avg; }); return m; };
  const D=best("pc","f0"), u=st.units.f0, multi=u.acts.filter((a) =>{ return a.k==="multi"&&a.ma&&a.ma.length; })[0];
  const F=multi?multi.ma.reduce((t,e) =>{ return t+e[1]*best("f0","pc",String(e[0]).split("|")); },0):best("f0","pc");
  const taken=D>0?F*(c.hp/D)*k*(k+1)/2:1e9, r=(pc.hp-taken)/Math.max(1,pc.hp); return {p:1/(1+Math.exp(-4.5*(r-0.25))),D:D,F:F,taken:taken}; }
// @ts-ignore the node export of this file and of 20-engine.js refer to each other
TGE.sim={pilot:pilot,fight:fight,duel:duel,est:est}; if(typeof module!=="undefined"&&module.exports&&!root.TGE) module.exports=TGE.sim;
})(typeof window!=="undefined"?window:this);
