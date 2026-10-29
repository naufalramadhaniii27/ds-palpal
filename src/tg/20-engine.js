/* G7 TG0 Training Ground engine, without any screen. Pure rules: the same seed and the same list of commands always give the same fight.
   Plan: claude/rencana-kerja-training-ground.md parts 5 and 6 (tier A: attacks, damage types, saves, basic conditions, movement on a grid,
   Dash, Disengage, Dodge, opportunity attacks, End Turn, Hit Points, death saves, Recharge). No enemy AI: the player gives every command.
   Rules checked against the 2024 Player's Handbook (Combat chapter and Rules Glossary): Advantage and Disadvantage cancel out, a natural 20
   always hits and doubles the damage dice, a natural 1 always misses, Resistance halves (round down), Vulnerability doubles, Immunity is 0,
   a Dodge gives Disadvantage to attacks against you and Advantage on Dexterity saves, a ranged attack within 5 feet of a foe that can see you
   has Disadvantage, long range has Disadvantage, Prone gives Advantage to melee within 5 feet and Disadvantage to ranged, diagonal squares cost 5 feet.
   Works in the browser (window.TGE) and in Node (module.exports) for the headless tests (tests/tg_engine.js).
   State is plain JSON: it can be saved, sent and replayed. Every change goes through step(state, command) and lands in state.log. */
(function(root){
"use strict";
/* ---------- seeded dice (mulberry32). The 3D dice only show the values the log already holds ---------- */
function rnd(st){ var t=(st.rng=(st.rng+0x6D2B79F5)>>>0); t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }
function die(st,f){ return 1+Math.floor(rnd(st)*f); }
/* "2d6+3", "1d10+8", "17d6", "5": rolled with this fight's dice. crit doubles the number of dice */
function parse(expr){ var e=String(expr).replace(/\s+/g,""), out=[], m, re=/([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/g;
  while((m=re.exec(e))){ if(m[3]) out.push({s:m[1]==="-"?-1:1,n:+(m[2]||1),f:+m[3]}); else if(m[5]) out.push({s:m[4]==="-"?-1:1,k:+m[5]}); } return out; }
function rollExpr(st,expr,crit){ var t=0, dice=[]; parse(expr).forEach(function(q){ if(q.f){ var n=q.n*(crit?2:1); for(var i=0;i<n;i++){ var v=die(st,q.f); dice.push(v); t+=q.s*v; } } else t+=q.s*q.k; });
  return {t:Math.max(0,t),dice:dice}; }

/* ---------- units ---------- */
var ABL=["str","dex","con","int","wis","cha"];
function mod(v){ return Math.floor((v-10)/2); }
function sizeSq(sz){ return {T:1,S:1,M:1,L:2,H:3,G:4}[sz]||1; }
function lc(a){ return (a||[]).map(function(x){ return String(x).toLowerCase(); }).join(" | "); }
/* a creature from the Training Ground data (TG_CREATURES). side "foe" (default), "ally" (fights with the player) */
function fromCreature(c,id,pos,side){ side=side||"foe"; var sv={}; ABL.forEach(function(k,i){ sv[k]=(c.sv&&c.sv[k]!=null)?c.sv[k]:mod(c.ab[i]); });
  var acts=[].concat(c.act||[]).map(function(a){ return Object.assign({},a); });
  return {id:id,side:side,name:c.n,ref:c.id,kind:"creature",ac:c.ac,hp:c.hp,max:c.hp,tmp:0,sp:Object.assign({},c.sp),ini:c.ini||mod(c.ab[1]),sv:sv,size:sizeSq(c.sz),
    pos:pos?pos.slice():[0,0],res:lc(c.res),imm:lc(c.imm),vul:lc(c.vul),ci:lc(c.ci),acts:acts,bonus:(c.bo||[]).map(function(a){ return Object.assign({},a); }),
    reacts:(c.re||[]).map(function(a){ return Object.assign({},a); }),cond:{},used:{},dead:false,down:false,ds:{s:0,f:0},turn:fresh(),
    /* TG4 legendary actions: used right after another creature's turn, back at the start of its own turn */
    lg:(c.lg||[]).map(function(a){ return Object.assign({},a); }),lgn:c.lg?(c.lgn||3):0,lgLeft:c.lg?(c.lgn||3):0}; }
/* a player character: {name, ac, hp, max, speed, ini, saves:{dex:2...}, attacks:[{n, hit, reach, rng, dmg:[[avg,"1d8+3","Slashing"]]}]} */
function fromSheet(p,id,pos){ var sv={}; ABL.forEach(function(k){ sv[k]=p.saves&&p.saves[k]!=null?p.saves[k]:0; });
  return {id:id,side:"pc",name:p.name||"Hero",kind:"pc",ac:p.ac||10,hp:p.hp!=null?p.hp:p.max,max:p.max||p.hp||1,tmp:p.tmp||0,sp:{walk:p.speed||30},ini:p.ini||0,sv:sv,size:1,
    pos:pos?pos.slice():[0,0],res:lc(p.res),imm:lc(p.imm),vul:lc(p.vul),ci:"",acts:(p.attacks||[]).map(function(a){ return Object.assign({k:"atk",mr:a.rng?(a.reach?"mr":"r"):"m"},a); }),
    bonus:[],reacts:[],cond:{},used:{},dead:false,down:false,ds:{s:0,f:0},turn:fresh(),
    /* TG5 spells of tier B: {n, l, k "atk"|"save"|"heal"|"auto", time "a"|"b", c concentration, rng feet, sv, half, n rays or darts, by:{slot level:[[avg,dice,type],...]}, heal:{lvl:dice}} */
    spells:(p.spells||[]).map(function(x){ return JSON.parse(JSON.stringify(x)); }),slots:(p.slots||[]).slice(),satk:p.satk||0,sdc:p.sdc||10}; }
function fresh(){ return {a:1,b:1,r:1,move:0,dash:0,dis:0,dodge:0,ma:null,oaLeft:[],leveled:0}; }

/* ---------- the fight ---------- */
function create(o){ var st={v:1,seed:o.seed>>>0,rng:o.seed>>>0,w:o.w||16,h:o.h||12,block:o.block||{},rough:o.rough||{},units:{},order:[],cur:-1,round:0,log:[],over:"",n:0};
  (o.units||[]).forEach(function(u){ st.units[u.id]=u; }); return st; }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function U(st,id){ var u=st.units[id]; if(!u) throw new Error("no unit "+id); return u; }
function now(st){ return st.order[st.cur]; }
function alive(u){ return !u.dead; }
function active(u){ return !u.dead&&!u.down; }
function ev(st,o){ o.i=st.log.length; o.r=st.round; st.log.push(o); return o; }
function sideOf(u){ return u.side==="foe"?"foe":"pc"; }/* allies fight with the player characters */
function foes(st,u){ return Object.keys(st.units).map(function(k){ return st.units[k]; }).filter(function(x){ return alive(x)&&sideOf(x)!==sideOf(u); }); }
function checkOver(st){ var pcs=0, fs=0; Object.keys(st.units).forEach(function(k){ var u=st.units[k]; if(!active(u)) return; if(sideOf(u)==="foe") fs++; else pcs++; });
  if(!fs){ st.over="won"; ev(st,{t:"over",w:"pc"}); } else if(!pcs&&!Object.keys(st.units).some(function(k){ var u=st.units[k]; return sideOf(u)==="pc"&&u.down&&!u.dead; })){ st.over="lost"; ev(st,{t:"over",w:"foe"}); } }

/* ---------- the grid: squares of 5 feet, diagonals 5 feet, Difficult Terrain costs double, a foe's space blocks ---------- */
function key(x,y){ return x+","+y; }
function dist(a,b){ return 5*Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1])); }
/* distance between two units, edge to edge for big creatures */
function udist(a,b){ var dx=Math.max(0,a.pos[0]-(b.pos[0]+b.size-1),b.pos[0]-(a.pos[0]+a.size-1)), dy=Math.max(0,a.pos[1]-(b.pos[1]+b.size-1),b.pos[1]-(a.pos[1]+a.size-1)); return 5*Math.max(dx,dy); }
function occ(st,skip){ var o={}; Object.keys(st.units).forEach(function(k){ var u=st.units[k]; if(u.dead||k===skip) return; for(var i=0;i<u.size;i++) for(var j=0;j<u.size;j++) o[key(u.pos[0]+i,u.pos[1]+j)]=u; }); return o; }
/* every square this unit can reach with the feet it has left: {"x,y":{c:cost, p:"prev"}} (Dijkstra, small grid) */
function reach(st,id){ var u=U(st,id), left=speedLeft(u), o=occ(st,id), best={}, q=[[u.pos[0],u.pos[1],0,null]];
  best[key(u.pos[0],u.pos[1])]={c:0,p:null};
  while(q.length){ q.sort(function(a,b){ return a[2]-b[2]; }); var c=q.shift();
    for(var dx=-1;dx<=1;dx++) for(var dy=-1;dy<=1;dy++){ if(!dx&&!dy) continue; var x=c[0]+dx, y=c[1]+dy; if(x<0||y<0||x+u.size>st.w||y+u.size>st.h) continue;
      var ok=true, cost=5; for(var i=0;i<u.size&&ok;i++) for(var j=0;j<u.size;j++){ var k=key(x+i,y+j); if(st.block[k]){ ok=false; break; } var w=o[k]; if(w&&sideOf(w)!==sideOf(u)&&active(w)){ ok=false; break; } if(st.rough[k]) cost=10; }
      if(!ok) continue; var nc=c[2]+cost; if(nc>left) continue; var kk=key(x,y); if(best[kk]&&best[kk].c<=nc) continue; best[kk]={c:nc,p:key(c[0],c[1])}; q.push([x,y,nc]); } }
  /* a square a friend stands in can be crossed but not ended in */
  Object.keys(best).forEach(function(k){ if(k===key(u.pos[0],u.pos[1])) return; var p=k.split(","), x=+p[0], y=+p[1]; for(var i=0;i<u.size;i++) for(var j=0;j<u.size;j++) if(o[key(x+i,y+j)]) best[k].pass=1; });
  return best; }
function speedLeft(u){ var sp=u.sp.walk||0; if(u.cond.grappled||u.cond.restrained||u.down) sp=0; if(u.cond.prone) sp=Math.floor(sp/2); return Math.max(0,sp*(1+u.turn.dash)-u.turn.move); }
function pathTo(best,to){ var out=[], k=key(to[0],to[1]); while(k){ out.unshift(k.split(",").map(Number)); k=best[k]&&best[k].p; } return out; }

/* ---------- checks ---------- */
function advOf(st,att,tgt,ranged){ var a=0, d=0, c=att.cond, t=tgt.cond, near=udist(att,tgt)<=5;
  if(c.poisoned||c.blinded||c.frightened||c.restrained||c.prone&&ranged) d++; if(c.prone&&!ranged) d++;
  if(c.invisible) a++; if(t.invisible) d++; if(t.blinded||t.restrained||t.stunned||t.paralyzed||t.unconscious||tgt.down) a++;
  if(t.prone){ if(near&&!ranged) a++; else d++; }
  if(tgt.turn.dodge&&!t.incapacitated&&!tgt.down) d++;
  if(ranged&&foes(st,att).some(function(f){ return active(f)&&udist(att,f)<=5&&!f.cond.incapacitated; })) d++;
  if(att.help){ a++; }
  return a&&d?0:a?1:d?-1:0; }
function d20(st,adv){ var a=die(st,20), b=adv?die(st,20):null; return {v:adv>0?Math.max(a,b):adv<0?Math.min(a,b):a,rolls:b==null?[a]:[a,b]}; }
/* damage after Resistance, Vulnerability and Immunity (2024: Resistance and Vulnerability each apply once, Resistance first) */
function adjust(u,amt,type){ var t=String(type||"").toLowerCase(); if(!t||t==="choice") return amt; var has=function(s){ return s&&s.split(" | ").some(function(x){ return x.indexOf(t)===0; }); };
  if(has(u.imm)) return 0; if(has(u.res)) amt=Math.floor(amt/2); if(has(u.vul)) amt*=2; return amt; }
function hurt(st,u,amt,type,crit,why){ amt=adjust(u,amt,type); var took=amt;
  if(u.tmp){ var z=Math.min(u.tmp,amt); u.tmp-=z; amt-=z; }
  var before=u.hp; u.hp=Math.max(0,u.hp-amt); ev(st,{t:"dmg",u:u.id,amt:took,type:type||"",hp:u.hp,why:why||""});
  if(u.hp===0){
    if(u.kind==="pc"){ if(u.down){ u.ds.f+=crit?2:1; ev(st,{t:"dsf",u:u.id,f:u.ds.f}); if(u.ds.f>=3){ u.dead=true; ev(st,{t:"dead",u:u.id}); } }
      else if(amt-before>=u.max){ u.dead=true; ev(st,{t:"dead",u:u.id,why:"massive"}); }
      else { u.down=true; u.cond.unconscious=1; u.cond.prone=1; u.ds={s:0,f:0}; ev(st,{t:"down",u:u.id}); } }
    else if(!u.dead){ u.dead=true; ev(st,{t:"dead",u:u.id}); } }
  if(u.cond.concentrating&&took>0&&!u.dead){ var dc=Math.min(30,Math.max(10,Math.floor(took/2))), r=d20(st,0), ok=r.v+u.sv.con>=dc; ev(st,{t:"conc",u:u.id,dc:dc,roll:r.v,ok:ok}); if(!ok) delete u.cond.concentrating; } }

/* ---------- commands ---------- */
function fail(st,msg){ st.err=msg; return st; }
var CMD={
  /* initiative for everyone: d20 + Initiative, ties by Dexterity bonus then by order of entry */
  start:function(st){ if(st.round) return fail(st,"already started"); var ids=Object.keys(st.units), roll={};
    ids.forEach(function(id){ var u=st.units[id]; roll[id]=die(st,20)+u.ini; ev(st,{t:"init",u:id,v:roll[id]}); });
    st.order=ids.slice().sort(function(a,b){ return roll[b]-roll[a]||st.units[b].ini-st.units[a].ini||ids.indexOf(a)-ids.indexOf(b); });
    st.round=1; st.cur=-1; return CMD.end(st,{first:1}); },
  move:function(st,c){ var u=U(st,now(st)); if(!active(u)) return fail(st,"cannot move"); var best=reach(st,u.id), k=key(c.to[0],c.to[1]), b=best[k];
    if(!b) return fail(st,"out of reach"); if(b.pass) return fail(st,"square taken");
    var path=pathTo(best,c.to), from=u.pos.slice(), was=foes(st,u).filter(function(f){ return active(f)&&!f.cond.incapacitated&&f.turn.r&&inReach(f,u); }).map(function(f){ return f.id; });
    u.turn.move+=b.c; u.pos=c.to.slice(); ev(st,{t:"move",u:u.id,from:from,to:u.pos,ft:b.c,path:path});
    /* leaving a foe's reach without Disengage: that foe may take an Opportunity Attack (the player decides, command "oa") */
    if(!u.turn.dis) was.forEach(function(fid){ var f=st.units[fid]; if(!inReach(f,u)){ u.turn.oaLeft.push(fid); ev(st,{t:"oa-open",by:fid,u:u.id}); } });
    return st; },
  /* one attack: from the action list, inside a Multiattack, or as an Opportunity Attack (c.oa) */
  attack:function(st,c){ var att=U(st,(c.oa||c.lg)?c.by:now(st)), tgt=U(st,c.target), a=findAct(att,c.act);
    if(!a||a.k!=="atk") return fail(st,"not an attack"); if(tgt.dead) return fail(st,"target is dead"); if(!active(att)) return fail(st,"cannot act"); if(att.cond.incapacitated||att.cond.stunned||att.cond.paralyzed) return fail(st,"incapacitated");
    if(c.oa){ if(!att.turn.r) return fail(st,"no reaction"); var i=st.units[c.target].turn.oaLeft.indexOf(att.id); if(i<0) return fail(st,"no opportunity"); st.units[c.target].turn.oaLeft.splice(i,1); att.turn.r=0; }
    else if(c.lg){ var lr=lgUse(st,att,c.lg); if(lr) return fail(st,lr); }
    else if(!useAttack(att,a.n)) return fail(st,"no action left");
    var d=udist(att,tgt), ranged=false;
    if(c.oa||a.mr==="m"||(a.mr==="mr"&&d<=(a.reach||5))){ if(!c.oa&&d>(a.reach||5)) return fail(st,"out of reach"); }/* an Opportunity Attack hits as the target leaves the reach */
    else { ranged=true; var r=a.rng||[a.reach||5,a.reach||5]; if(d>r[1]) return fail(st,"out of range"); }
    var adv=advOf(st,att,tgt,ranged); if(ranged&&a.rng&&d>a.rng[0]) adv=adv>0?0:-1;
    var r20=d20(st,adv), crit=r20.v===20, hit=crit||(r20.v!==1&&r20.v+a.hit>=tgt.ac);
    if(tgt.cond.paralyzed||tgt.cond.unconscious||tgt.down) if(hit&&d<=5&&!ranged) crit=true;/* Paralyzed and Unconscious: a hit from within 5 feet is a Critical Hit */
    ev(st,{t:"atk",u:att.id,tg:tgt.id,act:a.n,roll:r20.rolls,adv:adv,bon:a.hit,tot:r20.v+a.hit,ac:tgt.ac,hit:hit,crit:crit,oa:!!c.oa});
    att.help=0;
    if(hit) (a.dmg||[]).forEach(function(q){ var x=rollExpr(st,q[1],crit); hurt(st,tgt,x.t,q[2],crit,a.n); });
    checkOver(st); return st; },
  /* Multiattack: uses the action, then lists the attacks it allows (picked one by one with "attack") */
  multi:function(st,c){ var u=U(st,now(st)), a=findAct(u,c.act||"Multiattack"); if(!a||a.k!=="multi") return fail(st,"no Multiattack"); if(!u.turn.a) return fail(st,"no action left");
    u.turn.a=0; u.turn.ma=[]; (a.ma||[]).forEach(function(p){ for(var i=0;i<p[1];i++) u.turn.ma.push(p[0]); }); ev(st,{t:"multi",u:u.id,list:u.turn.ma.slice()}); return st; },
  /* a save effect from the stat block: every target rolls, Failure takes the damage, Success takes half when the text says so */
  save:function(st,c){ var u=U(st,c.lg?c.by:now(st)), a=c.lg?lgAct(u,c.lg):findAct(u,c.act); if(!a||a.k!=="save") return fail(st,"not a save"); if(!active(u)) return fail(st,"cannot act");
    if(c.lg){ var lr2=lgUse(st,u,c.lg); if(lr2) return fail(st,lr2); }
    else { var slot=c.bonus?"b":"a"; if(!u.turn[slot]) return fail(st,"no action left"); if(a.rc&&u.used[a.n]) return fail(st,"recharging"); u.turn[slot]=0; }
    if(a.rc) u.used[a.n]=1; ev(st,{t:"save-use",u:u.id,act:a.n,dc:a.dc,sv:a.sv});
    var dm=(a.dmg||[]).map(function(q){ return {x:rollExpr(st,q[1],false).t,type:q[2]}; });
    (c.targets||[]).forEach(function(tid){ var t=U(st,tid); if(t.dead) return; var adv=(a.sv==="dex"&&t.turn.dodge)?1:0; if((t.cond.paralyzed||t.cond.stunned||t.cond.unconscious||t.down)&&(a.sv==="str"||a.sv==="dex")){ ev(st,{t:"save",u:tid,act:a.n,auto:"fail",ok:false}); dm.forEach(function(q){ hurt(st,t,q.x,q.type,false,a.n); }); return; }
      if(t.cond.restrained&&a.sv==="dex") adv=adv>0?0:-1; var r=d20(st,adv), ok=r.v+t.sv[a.sv]>=a.dc; ev(st,{t:"save",u:tid,act:a.n,roll:r.rolls,tot:r.v+t.sv[a.sv],dc:a.dc,ok:ok});
      dm.forEach(function(q){ var amt=ok?(a.half?Math.floor(q.x/2):0):q.x; if(amt) hurt(st,t,amt,q.type,false,a.n); }); });
    checkOver(st); return st; },
  /* TG5: a spell of tier B. Leveled spells spend a slot of the chosen level (default: the lowest free one at or above the spell's level).
     atk: one spell attack per target (rays and beams are listed targets). save: damage rolled once, each target saves, half on a success when
     the spell says so. heal: dice + modifier per target. auto: Magic Missile style darts that always hit. Concentration ends the old one */
  cast:function(st,c){ var u=U(st,now(st)), sp=null; (u.spells||[]).forEach(function(x){ if(x.n===c.sp) sp=x; }); if(!sp) return fail(st,"no such spell"); if(!active(u)) return fail(st,"cannot act");
    var slot=sp.time==="b"?"b":"a"; if(!u.turn[slot]) return fail(st,"no action left");
    if(sp.l>0&&u.turn.leveled) return fail(st,"one spell slot per turn");/* PHB 2024: only one spell slot can be spent on a turn */
    var lv=sp.l; if(sp.l>0){ lv=c.lvl||0; if(!lv){ for(var L=sp.l;L<=9;L++) if((u.slots[L-1]||0)>0){ lv=L; break; } } if(!lv||lv<sp.l||!(u.slots[lv-1]>0)) return fail(st,"no spell slot"); }
    var tg=(c.targets||[]).map(function(id){ return U(st,id); }); if(!tg.length) return fail(st,"no target");
    for(var i=0;i<tg.length;i++){ if(sp.rng&&sp.k!=="heal"&&udist(u,tg[i])>sp.rng) return fail(st,"out of range"); if(sp.k==="heal"&&sp.rng&&udist(u,tg[i])>sp.rng) return fail(st,"out of range"); }
    if(sp.l>0) u.slots[lv-1]--; u.turn[slot]=0; if(sp.l>0) u.turn.leveled=1;
    if(sp.c){ if(u.cond.concentrating) ev(st,{t:"conc-end",u:u.id,sp:u.conc||""}); u.cond.concentrating=1; u.conc=sp.n; }
    ev(st,{t:"cast",u:u.id,sp:sp.n,lvl:lv,tg:tg.map(function(t){ return t.id; })});
    var dm=(sp.by&&(sp.by[lv]||sp.by[sp.l]))||[];
    if(sp.k==="atk"||sp.k==="auto") tg.forEach(function(t){ if(t.dead) return; var hit=true, crit=false;
        if(sp.k==="atk"){ var ranged=(sp.rng||5)>5, adv=advOf(st,u,t,ranged), r20=d20(st,adv); crit=r20.v===20; hit=crit||(r20.v!==1&&r20.v+u.satk>=t.ac); ev(st,{t:"atk",u:u.id,tg:t.id,act:sp.n,roll:r20.rolls,adv:adv,bon:u.satk,tot:r20.v+u.satk,ac:t.ac,hit:hit,crit:crit}); }
        if(hit) dm.forEach(function(q){ hurt(st,t,rollExpr(st,q[1],crit).t,q[2],crit,sp.n); }); });
    else if(sp.k==="save"){ var rolled=dm.map(function(q){ return {x:rollExpr(st,q[1],false).t,type:q[2]}; });
      tg.forEach(function(t){ if(t.dead) return; var b=t.sv[sp.sv]||0, adv=(sp.sv==="dex"&&t.turn.dodge)?1:0, auto=(t.cond.paralyzed||t.cond.stunned||t.cond.unconscious||t.down)&&(sp.sv==="str"||sp.sv==="dex");
        var ok=false; if(auto) ev(st,{t:"save",u:t.id,act:sp.n,auto:"fail",ok:false}); else { var r=d20(st,adv); ok=r.v+b>=u.sdc; ev(st,{t:"save",u:t.id,act:sp.n,roll:r.rolls,tot:r.v+b,dc:u.sdc,ok:ok}); }
        rolled.forEach(function(q){ var amt=ok?(sp.half?Math.floor(q.x/2):0):q.x; if(amt) hurt(st,t,amt,q.type,false,sp.n); }); }); }
    else if(sp.k==="heal"){ var hd=(sp.heal&&(sp.heal[lv]||sp.heal[sp.l]))||"0"; tg.forEach(function(t){ if(t.dead) return; var v=rollExpr(st,hd,false).t; t.hp=Math.min(t.max,t.hp+v); if(t.down&&t.hp>0){ t.down=false; delete t.cond.unconscious; t.ds={s:0,f:0}; } ev(st,{t:"heal",u:t.id,amt:v,hp:t.hp,why:sp.n}); }); }
    checkOver(st); return st; },
  dash:function(st){ var u=U(st,now(st)); if(!u.turn.a) return fail(st,"no action left"); u.turn.a=0; u.turn.dash++; ev(st,{t:"dash",u:u.id}); return st; },
  disengage:function(st){ var u=U(st,now(st)); if(!u.turn.a) return fail(st,"no action left"); u.turn.a=0; u.turn.dis=1; ev(st,{t:"disengage",u:u.id}); return st; },
  dodge:function(st){ var u=U(st,now(st)); if(!u.turn.a) return fail(st,"no action left"); u.turn.a=0; u.turn.dodge=1; ev(st,{t:"dodge",u:u.id}); return st; },
  help:function(st,c){ var u=U(st,now(st)), f=U(st,c.ally); if(!u.turn.a) return fail(st,"no action left"); u.turn.a=0; f.help=1; ev(st,{t:"help",u:u.id,ally:f.id}); return st; },
  /* an action the board cannot do by itself: the player resolved it and says so (tier C) */
  manual:function(st,c){ if(c.lg){ var lu=U(st,c.by), lr3=lgUse(st,lu,c.lg); if(lr3) return fail(st,lr3); ev(st,{t:"manual",u:lu.id,act:c.lg,note:"legendary"}); return st; }
    var u=U(st,now(st)), slot=c.slot||"a"; if(!u.turn[slot]) return fail(st,"no "+slot+" left"); u.turn[slot]=0; ev(st,{t:"manual",u:u.id,act:c.act||"",note:c.note||""}); return st; },
  /* by hand: damage, healing, temporary HP, conditions (for spells and effects the engine does not run) */
  damage:function(st,c){ hurt(st,U(st,c.u),Math.max(0,c.amt|0),c.type,false,"by hand"); checkOver(st); return st; },
  heal:function(st,c){ var u=U(st,c.u); if(u.dead) return fail(st,"dead"); u.hp=Math.min(u.max,u.hp+Math.max(0,c.amt|0)); if(u.down&&u.hp>0){ u.down=false; delete u.cond.unconscious; u.ds={s:0,f:0}; } ev(st,{t:"heal",u:u.id,amt:c.amt,hp:u.hp}); return st; },
  cond:function(st,c){ var u=U(st,c.u), k=String(c.c).toLowerCase(); if(c.on){ if(u.ci.indexOf(k)>=0) return fail(st,"immune"); u.cond[k]=1; if(k==="paralyzed"||k==="stunned"||k==="unconscious"||k==="petrified") u.cond.incapacitated=1; } else { delete u.cond[k]; if(!u.cond.paralyzed&&!u.cond.stunned&&!u.cond.unconscious&&!u.cond.petrified&&k!=="incapacitated") delete u.cond.incapacitated; }
    ev(st,{t:"cond",u:u.id,c:k,on:!!c.on}); return st; },
  /* standing up from Prone costs half the Speed */
  stand:function(st){ var u=U(st,now(st)); if(!u.cond.prone||u.down) return fail(st,"not prone"); var cost=Math.floor((u.sp.walk||0)/2); if(speedLeft(u)<cost) return fail(st,"not enough movement"); u.turn.move+=cost; delete u.cond.prone; ev(st,{t:"stand",u:u.id}); return st; },
  /* the next turn: death save for a character at 0 HP, Recharge rolls, the per-turn budget is fresh */
  end:function(st,c){ if(st.over) return fail(st,"over"); var n=st.order.length, guard=0;
    if(!(c&&c.first)){ var me=st.units[now(st)]; if(me){ me.turn.oaLeft=[]; ev(st,{t:"end",u:me.id}); } }
    do { st.cur++; if(st.cur>=n){ st.cur=0; st.round++; ev(st,{t:"round",n:st.round}); } guard++; } while(st.units[now(st)].dead&&guard<=n);
    var u=st.units[now(st)]; u.turn=fresh(); if(u.lgn) u.lgLeft=u.lgn;
    ev(st,{t:"turn",u:u.id});
    Object.keys(u.used).forEach(function(k){ var a=findAct(u,k); if(a&&a.rc){ var v=die(st,6), ok=v>=a.rc; ev(st,{t:"recharge",u:u.id,act:k,v:v,ok:ok}); if(ok) delete u.used[k]; } });
    if(u.down&&!u.dead){ var s=die(st,20); if(s===20){ u.hp=1; u.down=false; delete u.cond.unconscious; u.ds={s:0,f:0}; ev(st,{t:"ds",u:u.id,v:s,res:"up"}); ev(st,{t:"heal",u:u.id,amt:1,hp:1}); }
      else if(s===1){ u.ds.f+=2; ev(st,{t:"ds",u:u.id,v:s,res:"f2"}); } else if(s>=10){ u.ds.s++; ev(st,{t:"ds",u:u.id,v:s,res:"s"}); } else { u.ds.f++; ev(st,{t:"ds",u:u.id,v:s,res:"f"}); }
      if(u.ds.f>=3){ u.dead=true; ev(st,{t:"dead",u:u.id}); checkOver(st); } else if(u.ds.s>=3){ u.ds={s:0,f:0}; u.stable=1; ev(st,{t:"stable",u:u.id}); } }
    return st; }
};
/* a legendary action: only on another creature's turn, one use each (2024 stat blocks have no costs above 1) */
function lgAct(u,n){ var a=null; (u.lg||[]).forEach(function(x){ if(x.n===n) a=x; }); if(a&&a.ref){ var r=findAct(u,a.ref); if(r) return r; } return a; }
function lgUse(st,u,n){ if(!u.lgn) return "no legendary actions"; if(now(st)===u.id) return "not on its own turn"; if(u.dead||u.down||u.cond.incapacitated) return "cannot act"; if(!(u.lgLeft>0)) return "no legendary actions left";
  if(!(u.lg||[]).some(function(x){ return x.n===n; })) return "no such legendary action"; u.lgLeft--; ev(st,{t:"lg",u:u.id,act:n,left:u.lgLeft}); return ""; }
function inReach(f,u){ var r=5; (f.acts||[]).forEach(function(a){ if(a.k==="atk"&&a.mr!=="r") r=Math.max(r,a.reach||5); }); return udist(f,u)<=r; }
function findAct(u,n){ var all=(u.acts||[]).concat(u.bonus||[]); for(var i=0;i<all.length;i++) if(all[i].n===n) return all[i]; return null; }
/* an attack uses the action, or one entry of the Multiattack started this turn */
function useAttack(u,n){ var m=u.turn.ma; if(m&&m.length){ for(var i=0;i<m.length;i++){ if(m[i].split("|").indexOf(n)>=0){ m.splice(i,1); return true; } } return false; }
  if(!u.turn.a) return false; u.turn.a=0; return true; }

/* one command in, a new state out. The old state is never changed, so undo is "keep the previous state" */
function step(st,c){ var s=clone(st); delete s.err; if(s.over&&c.t!=="heal"&&c.t!=="damage") return fail(s,"the fight is over"); var f=CMD[c.t]; if(!f) return fail(s,"unknown command "+c.t);
  try{ f(s,c); }catch(e){ return fail(clone(st),String(e.message||e)); }
  if(s.err){ var o=clone(st); o.err=s.err; return o; }/* a refused command changes nothing */
  s.n++; return s; }
/* the same seed and commands give the same fight */
function replay(start,cmds){ var s=start; cmds.forEach(function(c){ s=step(s,c); }); return s; }
function hash(st){ var t=JSON.stringify(st), h=2166136261>>>0; for(var i=0;i<t.length;i++){ h^=t.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h.toString(36); }

var TGE={lgAct:lgAct,create:create,step:step,replay:replay,hash:hash,fromCreature:fromCreature,fromSheet:fromSheet,reach:reach,dist:dist,udist:udist,adjust:adjust,parse:parse,rollExpr:rollExpr,now:now,foes:foes,active:active,speedLeft:speedLeft,inReach:inReach,findAct:findAct};
if(typeof module!=="undefined"&&module.exports) module.exports=TGE; else root.TGE=TGE;
})(typeof window!=="undefined"?window:this);
