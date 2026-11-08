// @ts-check
/* T11 N22 build duel: many headless fights with fixed seeds, to compare builds. Only this simulation has a simple pilot (walk to the
   nearest foe, use the best attack in reach, Multiattack first, a save action when nothing reaches). The Training Ground itself keeps
   no enemy AI: there the player gives every command (user decision 2026-10-29). Same seeds give the same result. */
import {TGE as TGE0} from "./20-engine.js";
const TGE=/** @type {any} */(TGE0);/* the engine is plain JSON in, plain JSON out: the type check does not follow its loose unit objects */
/* the pilot keeps its state in one object P: st (the fight, replaced by every command that works), cmds, id, u (the unit as it was when the turn began), tg (the target), atks */
function go(P,c){ const s=TGE.step(P.st,c); if(s.err) return false; P.st=s; P.cmds.push(c); return true; }
function me(P){ return P.st.units[P.id]; }
function inR(P,a){ const d=TGE.udist(me(P),P.st.units[P.tg.id]); return a.mr==="r"?(a.rng&&d<=a.rng[1]):(d<=(a.reach||5)||(a.mr==="mr"&&a.rng&&d<=a.rng[1])); }
function pickTarget(P){ const fs=TGE.foes(P.st,P.u).filter((f) =>{ return !f.dead; }); if(!fs.length) return false;
  fs.sort((a,b) =>{ return TGE.udist(P.u,a)-TGE.udist(P.u,b)||(a.id<b.id?-1:1); }); P.tg=fs[0];
  P.atks=P.u.acts.filter((a) =>{ return a.k==="atk"&&(a.dmg||[]).length; }); return true; }
/* the square, among those the hero can reach, that is nearest to the target */
function walkTarget(P){ const best=TGE.reach(P.st,P.id), keys=Object.keys(best).filter((k) =>{ return !best[k].pass; });
  keys.sort((a,b) =>{ const pa=a.split(",").map(Number), pb=b.split(",").map(Number); return TGE.udist(Object.assign({},me(P),{pos:pa}),P.st.units[P.tg.id])-TGE.udist(Object.assign({},me(P),{pos:pb}),P.st.units[P.tg.id])||best[a].c-best[b].c||(a<b?-1:1); });
  return keys[0]&&keys[0].split(",").map(Number); }
/* a foe that may take an Opportunity Attack when the hero walked away does so */
function pilotOa(P,e){ if(e.t==="oa-open"&&e.u===P.id&&!P.st.over){ const f=P.st.units[e.by], m=(f.acts||[]).filter((a) =>{ return a.k==="atk"&&a.mr!=="r"&&(a.dmg||[]).length; })[0]; if(m&&TGE.active(me(P))) go(P,{t:"attack",oa:1,by:f.id,target:P.id,act:m.n}); } }
function pilotWalk(P){ if(P.atks.some((a) =>{ return inR(P,a); })||!(TGE.speedLeft(P.u)>0)) return;
  const to=walkTarget(P); if(to&&(to[0]!==P.u.pos[0]||to[1]!==P.u.pos[1])){ go(P,{t:"move",to:to}); P.st.log.slice(-3).forEach((e) =>{ pilotOa(P,e); }); } }
/* Multiattack: the listed attacks one by one, on the next foe when the target fell */
function pilotMulti(P){ let g=0;
  while(me(P).turn.ma&&me(P).turn.ma.length&&g++<8&&!P.st.over){ if(P.st.units[P.tg.id].dead){ const nf=TGE.foes(P.st,me(P)).filter((x) =>{ return !x.dead; }); if(!nf.length) break; nf.sort((a,b) =>{ return TGE.udist(me(P),a)-TGE.udist(me(P),b); }); P.tg=nf[0]; }
    var want=me(P).turn.ma[0].split("|"), a=P.atks.filter((x) =>{ return want.indexOf(x.n)>=0&&inR(P,x); })[0]; if(!a||!go(P,{t:"attack",target:P.tg.id,act:a.n})) break; } }
function pilotSingle(P,spell,save){ const id=P.id, a2=P.atks.filter((a) =>{ return inR(P,a); }).sort((x,y) =>{ return (TGE.odds(P.st,id,P.tg.id,y.n)||{avg:0}).avg-(TGE.odds(P.st,id,P.tg.id,x.n)||{avg:0}).avg; })[0];
  if(!(a2&&go(P,{t:"attack",target:P.tg.id,act:a2.n}))){ if(spell) go(P,{t:"cast",sp:spell.n,targets:[P.tg.id]}); else if(save&&TGE.udist(me(P),P.st.units[P.tg.id])<=30) go(P,{t:"save",act:save.n,targets:[P.tg.id]}); else go(P,{t:"dodge"}); } }
function pilotStrike(P){ const u=P.u;
  const multi=u.acts.filter((a) =>{ return a.k==="multi"&&a.ma&&a.ma.length; })[0], save=u.acts.filter((a) =>{ return a.k==="save"&&!u.used[a.n]; })[0];
  const spell=(u.spells||[]).filter((x) =>{ return (x.k==="atk"||x.k==="save")&&x.l===0&&(!x.rng||TGE.udist(me(P),P.st.units[P.tg.id])<=x.rng); })[0];
  if(multi&&P.atks.some((a) =>{ return inR(P,a); })&&go(P,{t:"multi",act:multi.n})) pilotMulti(P); else pilotSingle(P,spell,save); }
function pilot(st,id){ const P={st:st,cmds:[],id:id,u:st.units[id],tg:null,atks:[]};
  if(!TGE.active(P.u)){ go(P,{t:"end"}); return P.st; }
  if(P.u.cond.prone) go(P,{t:"stand"});
  if(!pickTarget(P)){ go(P,{t:"end"}); return P.st; }
  pilotWalk(P);
  if(P.st.over||!TGE.active(me(P))){ if(!P.st.over) go(P,{t:"end"}); return P.st; }
  pilotStrike(P);
  if(!P.st.over) go(P,{t:"end"}); return P.st; }
/* one fight to the end (at most 40 rounds). Returns the result and the hero's Hit Points left */
function fight(units,seed,w,h){ let st=TGE.step(TGE.create({seed:seed,w:w||14,h:h||10,units:structuredClone(units)}),{t:"start"}), g=0;
  while(!st.over&&st.round<=40&&g++<3000){ const id=TGE.now(st), before=st.n; st=pilot(st,id); if(st.n===before) st=TGE.step(st,{t:"end"}); }
  const pc=st.units.pc; return {won:st.over==="won",rounds:st.round,hp:pc?pc.hp:0,max:pc?pc.max:1}; }
/* n fights of one hero against the same group, seeds seed0..seed0+n-1. Runs in slices so the screen stays usable; onDone gets the totals */
function duel(pc,foes,n,seed0,onDone,onStep){ const units=[TGE.fromSheet(pc,"pc",[1,5])], k=0; foes.forEach((c,i) =>{ units.push(TGE.fromCreature(c,"f"+i,[11+(i%2)*2,1+Math.floor(i/2)*3],"foe")); });
  let won=0, rounds=0, hp=0, i=0; (function slice(){ const end=Date.now()+12; while(i<n&&Date.now()<end){ const r=fight(units,seed0+i); if(r.won){ won++; hp+=r.hp/r.max; } rounds+=r.rounds; i++; }
    if(onStep) onStep(i,n); if(i<n){ if(globalThis.scheduler&&typeof globalThis.scheduler.postTask==="function") globalThis.scheduler.postTask(slice,{priority:"user-visible"}); else setTimeout(slice,0); return; } onDone({n:n,won:won,rate:won/n,rounds:rounds/n,hpLeft:won?hp/won:0}); })(); }
/* N30 quick estimate, no fights: the hero's best average damage per turn (exact odds, N20) against one foe, the foes' average per turn
   (Multiattack summed), foes fall one after another, so the hero takes F x (foe HP / D) x (k + k-1 + ... + 1). The margin
   (HP left as a share of HP) goes through a logistic curve fitted to 72 simulated groups (4 heroes, levels 3 and 4, 60 fights each):
   mean gap to the simulation 11 points. Used to pick the group and shown at once, the fights confirm it */
function est(pc,c,k){ const st=TGE.create({seed:1,w:6,h:4,units:[TGE.fromSheet(pc,"pc",[1,1]),TGE.fromCreature(c,"f0",[2,1],"foe")]});
  const best=function(id,tid,names){ let m=0; st.units[id].acts.forEach((a) =>{ if(a.k!=="atk"||(names&&names.indexOf(a.n)<0)) return; const o=TGE.odds(st,id,tid,a.n); if(o&&o.avg>m) m=o.avg; }); return m; };
  const D=best("pc","f0"), u=st.units.f0, multi=u.acts.filter((a) =>{ return a.k==="multi"&&a.ma&&a.ma.length; })[0];
  const F=multi?multi.ma.reduce((t,e) =>{ return t+e[1]*best("f0","pc",String(e[0]).split("|")); },0):best("f0","pc");
  const taken=D>0?F*(c.hp/D)*k*(k+1)/2:1e9, r=(pc.hp-taken)/Math.max(1,pc.hp); return {p:1/(1+Math.exp(-4.5*(r-0.25))),D:D,F:F,taken:taken}; }
const sim={pilot:pilot,fight:fight,duel:duel,est:est}; TGE.sim=sim;
export {sim as "module.exports"};/* Node: require() of this file gives the simulation (tests/tg_engine.js) */
