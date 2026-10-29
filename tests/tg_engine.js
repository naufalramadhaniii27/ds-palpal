#!/usr/bin/env node
/* G7 TG0 and TG0b headless tests: node tests/tg_engine.js [fights=1000]
   1. Data: 503 creatures, srd 330 and 173, every required field present, numbers are numbers, every attack has a bonus and damage dice.
   2. Rules units: advantage and disadvantage, natural 20 doubles dice, Resistance, Immunity, Vulnerability, death saves, Disengage, Opportunity Attack,
      Multiattack budget, Recharge, Difficult Terrain, a refused command changes nothing.
   3. Fights: N fights with a fixed seed each (player characters and allies against random creatures). A test pilot gives the commands
      (it lives only here: the app has no enemy AI). Each fight must end, hold no NaN, keep HP between 0 and the maximum, match the damage log,
      and give the same result when replayed from its seed and commands. */
var fs=require("fs"), path=require("path"), ROOT=path.join(__dirname,"..");
var TGE=require(path.join(ROOT,"src/tg/20-engine.js"));
var TG_CREATURES=JSON.parse(fs.readFileSync(path.join(ROOT,"data/tg-creatures.json"),"utf8")).creatures;
var N=+process.argv[2]||1000, bad=[], ok=function(c,m){ if(!c) bad.push(m); };

/* ---------- 1. data ---------- */
ok(TG_CREATURES.length===503,"creatures "+TG_CREATURES.length);
var srd=TG_CREATURES.filter(function(c){ return c.srd===1; }).length; ok(srd===330&&TG_CREATURES.length-srd===173,"srd split "+srd);
TG_CREATURES.forEach(function(c){ ["id","n","src","pg","sz","ty","ac","hp","ab","cr","crn","pb","ini"].forEach(function(k){ ok(c[k]!==undefined&&c[k]!=="","missing "+k+" in "+c.n); });
  ok(c.ab.length===6&&c.ab.every(Number.isFinite),"abilities "+c.n); ok(Number.isFinite(c.ac)&&Number.isFinite(c.hp)&&c.hp>0,"ac hp "+c.n);
  (c.act||[]).concat(c.bo||[],c.re||[],c.lg||[]).forEach(function(a){ ok(!/\{@/.test(a.t),"tag left in "+c.n+" "+a.n);
    if(a.k==="atk"){ ok(Number.isFinite(a.hit),"hit "+c.n+" "+a.n); (a.dmg||[]).forEach(function(q){ ok(/^\d*d\d+([+-]\d+)?$|^\d+$/.test(q[1]),"dice "+c.n+" "+a.n+" "+q[1]); var lo=TGE.parse(q[1]); ok(lo.length>0,"parse "+q[1]); }); }
    if(a.k==="save"){ ok(Number.isFinite(a.dc)&&/^(str|dex|con|int|wis|cha)$/.test(a.sv),"save "+c.n+" "+a.n); } }); });
var kinds={}; TG_CREATURES.forEach(function(c){ (c.act||[]).forEach(function(a){ kinds[a.k]=(kinds[a.k]||0)+1; }); });

/* ---------- 2. rules ---------- */
function C(n){ return TG_CREATURES.filter(function(c){ return c.n===n; })[0]; }
var HERO={name:"Test Fighter",ac:16,hp:30,max:30,speed:30,ini:2,saves:{str:5,con:4,dex:2,wis:1,int:0,cha:0},attacks:[{n:"Longsword",hit:5,reach:5,dmg:[[7,"1d8+3","Slashing"]]},{n:"Longbow",hit:4,rng:[150,600],dmg:[[5,"1d8+2","Piercing"]]}]};
function fight(seed,units){ return TGE.create({seed:seed,w:16,h:12,units:units}); }
function turnOf(st,id){ var g=0; while(TGE.now(st)!==id&&g++<20) st=TGE.step(st,{t:"end"}); return st; }
(function(){
  var gw=C("Goblin Warrior"), st=fight(7,[TGE.fromSheet(HERO,"h",[2,2]),TGE.fromCreature(gw,"g",[3,2])]); st=TGE.step(st,{t:"start"}); ok(!st.err&&st.order.length===2,"start "+st.err);
  /* Resistance, Immunity, Vulnerability */
  var u={res:"fire",imm:"poison",vul:"cold"}; ok(TGE.adjust(u,9,"Fire")===4&&TGE.adjust(u,9,"Poison")===0&&TGE.adjust(u,9,"Cold")===18&&TGE.adjust(u,9,"Slashing")===9,"damage types");
  /* a refused command changes nothing */
  st=turnOf(st,"h"); var h0=TGE.hash(st), s2=TGE.step(st,{t:"attack",target:"g",act:"Nope"}); ok(s2.err&&TGE.hash(Object.assign({},s2,{err:undefined}))!==""&&s2.n===st.n,"refused command");
  /* one action: the second attack is refused */
  var a1=TGE.step(st,{t:"attack",target:"g",act:"Longsword"}); ok(!a1.err,"first attack "+a1.err); var a2=TGE.step(a1,{t:"attack",target:"g",act:"Longsword"}); ok(a2.err==="no action left"||a1.over,"second attack "+a2.err);
  /* a natural 20 doubles the dice: find a seed whose first attack roll is 20 and count the dice */
  for(var sd=1;sd<4000;sd++){ var t=turnOf(TGE.step(fight(sd,[TGE.fromSheet(HERO,"h",[2,2]),TGE.fromCreature(gw,"g",[3,2])]),{t:"start"}),"h"); var r=TGE.step(t,{t:"attack",target:"g",act:"Longsword"}); var e=r.log.filter(function(x){ return x.t==="atk"; })[0];
    if(e&&e.crit&&e.roll.length===1){ var d=r.log.filter(function(x){ return x.t==="dmg"; })[0]; ok(d&&d.amt>=5,"crit damage "+JSON.stringify(d)); break; } }
  ok(sd<4000,"no natural 20 found");
  /* Opportunity Attack: walking out of reach opens it, Disengage does not */
  var b=turnOf(TGE.step(fight(11,[TGE.fromSheet(HERO,"h",[2,2]),TGE.fromCreature(gw,"g",[3,2])]),{t:"start"}),"h");
  var m=TGE.step(b,{t:"move",to:[0,2]}); ok(!m.err&&m.log.some(function(x){ return x.t==="oa-open"&&x.by==="g"; }),"opportunity opens "+m.err);
  var oa=TGE.step(m,{t:"attack",oa:1,by:"g",target:"h",act:"Scimitar"}); ok(!oa.err&&oa.units.g.turn.r===0,"opportunity attack "+oa.err);
  var oa2=TGE.step(oa,{t:"attack",oa:1,by:"g",target:"h",act:"Scimitar"}); ok(!!oa2.err,"only one reaction");
  var dz=TGE.step(TGE.step(b,{t:"disengage"}),{t:"move",to:[0,2]}); ok(!dz.err&&!dz.log.some(function(x){ return x.t==="oa-open"&&x.i>b.log.length; }),"disengage "+dz.err);
  /* movement: 30 feet, Difficult Terrain doubles the cost */
  var mv=TGE.step(b,{t:"move",to:[2,9]}); ok(!!mv.err,"7 squares is too far"); ok(!TGE.step(b,{t:"move",to:[2,8]}).err,"6 squares fit in 30 feet");
  var rough=fight(3,[TGE.fromSheet(HERO,"h",[2,2]),TGE.fromCreature(gw,"g",[12,10])]); rough.rough={"3,2":1,"4,2":1,"5,2":1}; rough=turnOf(TGE.step(rough,{t:"start"}),"h");
  var mr=TGE.step(rough,{t:"move",to:[5,2]}); ok(!mr.err&&mr.units.h.turn.move===20,"rough costs double "+(mr.err||mr.units.h.turn.move));
  /* Multiattack: three Rend attacks, a fourth is refused */
  var drg=C("Adult Red Dragon"), dd=turnOf(TGE.step(fight(5,[TGE.fromSheet(Object.assign({},HERO,{hp:400,max:400}),"h",[2,2]),TGE.fromCreature(drg,"d",[3,2])]),{t:"start"}),"d");
  dd=TGE.step(dd,{t:"multi"}); ok(!dd.err&&dd.units.d.turn.ma.length===3,"multi list "+dd.err);
  for(var i=0;i<3;i++){ dd=TGE.step(dd,{t:"attack",target:"h",act:"Rend"}); ok(!dd.err,"rend "+i+" "+dd.err); }
  ok(!!TGE.step(dd,{t:"attack",target:"h",act:"Rend"}).err,"fourth Rend refused");
  /* Recharge: Fire Breath once, then refused until the d6 says so */
  var fb=turnOf(TGE.step(fight(9,[TGE.fromSheet(Object.assign({},HERO,{hp:400,max:400}),"h",[2,2]),TGE.fromCreature(drg,"d",[3,2])]),{t:"start"}),"d");
  fb=TGE.step(fb,{t:"save",act:"Fire Breath",targets:["h"]}); ok(!fb.err&&fb.units.d.used["Fire Breath"]===1,"breath "+fb.err);
  var sv=fb.log.filter(function(x){ return x.t==="save"; })[0], dm=fb.log.filter(function(x){ return x.t==="dmg"; })[0]; ok(sv&&dm&&(sv.ok?dm.amt<=51:dm.amt>=17),"breath damage "+JSON.stringify([sv,dm]));
  /* death saves: a character at 0 HP rolls at the start of the turn, three failures end it */
  var dsx=turnOf(TGE.step(fight(21,[TGE.fromSheet(HERO,"h",[2,2]),TGE.fromCreature(gw,"g",[3,2])]),{t:"start"}),"g"); dsx=TGE.step(dsx,{t:"damage",u:"h",amt:30}); ok(dsx.units.h.down&&!dsx.units.h.dead,"down at 0");
  for(var k=0;k<12&&!dsx.units.h.dead&&!dsx.units.h.stable&&dsx.units.h.down;k++) dsx=TGE.step(dsx,{t:"end"});
  ok(dsx.log.some(function(x){ return x.t==="ds"; }),"death save rolled");
  var mass=TGE.step(TGE.step(fight(2,[TGE.fromSheet(HERO,"h",[2,2]),TGE.fromCreature(gw,"g",[3,2])]),{t:"start"}),{t:"damage",u:"h",amt:60}); ok(mass.units.h.dead,"massive damage");
  /* TG4 legendary actions: on another creature's turn only, three per round, back at the start of its own turn */
  var lgd=TGE.fromCreature(drg,"d",[3,2]); ok(lgd.lgn===3&&lgd.lg.some(function(a){ return a.ref==="Rend"; }),"legendary data "+JSON.stringify(lgd.lg.map(function(a){ return [a.n,a.k,a.ref]; })));
  var lgf=turnOf(TGE.step(fight(17,[TGE.fromSheet(Object.assign({},HERO,{hp:400,max:400}),"h",[2,2]),lgd]),{t:"start"}),"h");
  for(var q=0;q<3;q++){ lgf=TGE.step(lgf,{t:"attack",lg:"Pounce",by:"d",target:"h",act:"Rend"}); ok(!lgf.err,"legendary "+q+" "+lgf.err); }
  ok(TGE.step(lgf,{t:"attack",lg:"Pounce",by:"d",target:"h",act:"Rend"}).err==="no legendary actions left","fourth legendary refused");
  var own=turnOf(lgf,"d"); ok(own.units.d.lgLeft===3&&TGE.step(own,{t:"attack",lg:"Pounce",by:"d",target:"h",act:"Rend"}).err==="not on its own turn","legendary reset and own turn");
  /* TG5 spells: attack, save with half, healing, slots, one slot per turn, range */
  var MAGE=Object.assign({},HERO,{name:"Test Mage",satk:6,sdc:14,slots:[2,1],spells:[{n:"Fire Bolt",l:0,k:"atk",time:"a",rng:120,by:{0:[[0,"2d10","Fire"]]}},
    {n:"Burning Hands",l:1,k:"save",time:"a",rng:15,sv:"dex",half:1,by:{1:[[0,"3d6","Fire"]],2:[[0,"4d6","Fire"]]}},{n:"Healing Word",l:1,k:"heal",time:"b",rng:60,heal:{1:"2d4+3",2:"4d4+3"}}]});
  var sp=turnOf(TGE.step(fight(31,[TGE.fromSheet(MAGE,"m",[2,2]),TGE.fromCreature(C("Ogre"),"o",[3,2]),TGE.fromSheet(Object.assign({},HERO,{hp:5}),"h",[2,4])]),{t:"start"}),"m");
  var fb=TGE.step(sp,{t:"cast",sp:"Fire Bolt",targets:["o"]}); ok(!fb.err&&fb.log.some(function(e){ return e.t==="atk"&&e.act==="Fire Bolt"&&e.bon===6; }),"fire bolt "+fb.err);
  var bh=TGE.step(sp,{t:"cast",sp:"Burning Hands",targets:["o"],lvl:2}); ok(!bh.err&&bh.units.m.slots[1]===0&&bh.units.m.slots[0]===2,"upcast slot "+(bh.err||JSON.stringify(bh.units.m.slots)));
  var sv2=bh.log.filter(function(e){ return e.t==="save"; })[0], dm2=bh.log.filter(function(e){ return e.t==="dmg"; })[0]; ok(sv2&&sv2.dc===14&&(!sv2.ok||!dm2||dm2.amt<=12),"burning hands half "+JSON.stringify([sv2,dm2]));
  var two=TGE.step(bh,{t:"cast",sp:"Healing Word",targets:["h"]}); ok(two.err==="one spell slot per turn","one slot per turn "+two.err);
  var far=TGE.step(TGE.step(sp,{t:"move",to:[2,8]}),{t:"cast",sp:"Burning Hands",targets:["o"]}); ok(far.err==="out of range"||far.err==="out of reach","burning hands range "+far.err);
  var hw=TGE.step(sp,{t:"cast",sp:"Healing Word",targets:["h"]}); ok(!hw.err&&hw.units.m.turn.b===0&&hw.units.m.turn.a===1&&hw.units.h.hp>5,"healing word bonus action "+hw.err);
})();

/* ---------- 3. fights with a test pilot ---------- */
function pick(st,list){ var r=(st.rng=(Math.imul(st.rng^0x5bd1e995,1103515245)+12345)>>>0)/4294967296; return list[Math.floor(r*list.length)]; }
function pilot(st,u){ var cmds=[];
  function go(c){ var s=TGE.step(st,c); if(s.err) return false; st=s; cmds.push(c); return true; }
  if(!TGE.active(u)) { go({t:"end"}); return {st:st,cmds:cmds}; }
  if(u.cond.prone) go({t:"stand"});
  var fs=TGE.foes(st,u).filter(TGE.active); if(!fs.length) fs=TGE.foes(st,u);
  if(!fs.length){ go({t:"end"}); return {st:st,cmds:cmds}; }
  fs.sort(function(a,b){ return TGE.udist(u,a)-TGE.udist(u,b)||(a.id<b.id?-1:1); }); var tg=fs[0];
  var atks=u.acts.filter(function(a){ return a.k==="atk"&&(a.dmg||[]).length; });
  function inR(a){ var d=TGE.udist(st.units[u.id],st.units[tg.id]); return a.mr==="r"?(a.rng&&d<=a.rng[1]):(d<=(a.reach||5)||(a.mr==="mr"&&a.rng&&d<=a.rng[1])); }
  function closer(){ var best=TGE.reach(st,u.id), keys=Object.keys(best).filter(function(k){ return !best[k].pass; }); var me=st.units[u.id];
    keys.sort(function(a,b){ var pa=a.split(",").map(Number), pb=b.split(",").map(Number); var ua=Object.assign({},me,{pos:pa}), ub=Object.assign({},me,{pos:pb});
      return TGE.udist(ua,st.units[tg.id])-TGE.udist(ub,st.units[tg.id])||best[a].c-best[b].c||(a<b?-1:1); });
    if(keys[0]){ var to=keys[0].split(",").map(Number); if(to[0]!==me.pos[0]||to[1]!==me.pos[1]) { go({t:"move",to:to}); /* foes take the Opportunity Attacks they are offered */
        var last=st.log.filter(function(x){ return x.t==="oa-open"&&x.u===u.id; }); last.forEach(function(e){ var f=st.units[e.by]; var m=(f.acts||[]).filter(function(a){ return a.k==="atk"&&a.mr!=="r"&&(a.dmg||[]).length; })[0]; if(m&&!st.over&&TGE.active(st.units[u.id])) go({t:"attack",oa:1,by:f.id,target:u.id,act:m.n}); }); } } }
  var multi=u.acts.filter(function(a){ return a.k==="multi"&&a.ma&&a.ma.length; })[0], save=u.acts.filter(function(a){ return a.k==="save"&&!u.used[a.n]; })[0];
  if(!atks.some(inR)) closer();
  if(st.over||!TGE.active(st.units[u.id])){ if(!st.over) go({t:"end"}); return {st:st,cmds:cmds}; }
  if(multi&&atks.length&&go({t:"multi",act:multi.n})){
    var guard=0; while(st.units[u.id].turn.ma&&st.units[u.id].turn.ma.length&&guard++<8&&!st.over){ var tgt=st.units[tg.id]; if(tgt.dead){ var nf=TGE.foes(st,u).filter(function(x){ return !x.dead; }); if(!nf.length) break; nf.sort(function(a,b){ return TGE.udist(u,a)-TGE.udist(u,b); }); tg=nf[0]; }
      var want=st.units[u.id].turn.ma[0].split("|"), a=atks.filter(function(x){ return want.indexOf(x.n)>=0&&inR(x); })[0];
      if(!a||!go({t:"attack",target:tg.id,act:a.n})) break; } }
  else if(atks.length){ var a=atks.filter(inR)[0]; if(!(a&&go({t:"attack",target:tg.id,act:a.n}))) { if(save&&TGE.udist(u,tg)<=30) go({t:"save",act:save.n,targets:[tg.id]}); else go({t:"dodge"}); } }
  else if(save) go({t:"save",act:save.n,targets:[tg.id]}); else go({t:"dodge"});
  if(!st.over) go({t:"end"}); return {st:st,cmds:cmds}; }
var pool=TG_CREATURES.filter(function(c){ return c.crn<=5; }), stats={won:0,lost:0,rounds:0,maxr:0,refused:0};
for(var f=1;f<=N;f++){
  var s0={rng:f*2654435761>>>0}, units=[TGE.fromSheet(HERO,"h1",[1,5]),TGE.fromSheet(Object.assign({},HERO,{name:"Test Cleric",attacks:[{n:"Mace",hit:4,reach:5,dmg:[[5,"1d6+2","Bludgeoning"]]}]}),"h2",[1,7])];
  units.push(TGE.fromCreature(pick(s0,pool.filter(function(c){ return c.crn<=1; })),"a1",[2,9]));
  var nf=1+(f%4); for(var j=0;j<nf;j++) units.push(TGE.fromCreature(pick(s0,pool),"f"+j,[12+(j%2)*2,1+j*3])); units.forEach(function(u){ if(u.id.charAt(0)==="f") u.side="foe"; else if(u.id.charAt(0)==="a") u.side="ally"; });
  var start=TGE.create({seed:f,w:18,h:14,units:units}), st=TGE.step(start,{t:"start"}), all=[{t:"start"}], turns=0;
  while(!st.over&&st.round<=60&&turns<2000){ var r=pilot(st,st.units[TGE.now(st)]); if(!r.cmds.length){ st=TGE.step(st,{t:"end"}); all.push({t:"end"}); } else { st=r.st; all=all.concat(r.cmds); } turns++; }
  if(!st.over){ if(st.round>60) stats.long=(stats.long||0)+1; else bad.push("fight "+f+" did not end ("+turns+" turns, round "+st.round+")"); }
  if(st.over==="won") stats.won++; else if(st.over==="lost") stats.lost++; stats.rounds+=st.round; stats.maxr=Math.max(stats.maxr,st.round);
  var txt=JSON.stringify(st); ok(txt.indexOf("NaN")<0&&txt.indexOf("null,\"tmp\"")<0,"NaN in fight "+f);
  Object.keys(st.units).forEach(function(k){ var u=st.units[k]; ok(Number.isInteger(u.hp)&&u.hp>=0&&u.hp<=u.max,"hp range "+f+" "+k+" "+u.hp);
    var dmg=st.log.filter(function(e){ return e.t==="dmg"&&e.u===k; }).reduce(function(a,e){ return a+e.amt; },0), heal=st.log.filter(function(e){ return e.t==="heal"&&e.u===k; }).reduce(function(a,e){ return a+e.amt; },0);
    var lost=u.max-u.hp, wasDown=st.log.some(function(e){ return e.t==="down"&&e.u===k; }); ok(u.hp>0&&!wasDown?lost===dmg-heal:dmg>=lost,"hp log "+f+" "+k+" lost "+lost+" log "+dmg+" heal "+heal); });
  var again=TGE.replay(start,all); ok(TGE.hash(again)===TGE.hash(st),"replay differs in fight "+f);
}
console.log("data: 503 creatures, srd "+srd+", actions "+JSON.stringify(kinds));
console.log("fights "+N+": players won "+stats.won+", lost "+stats.lost+", still going at round 60: "+(stats.long||0)+", average rounds "+(stats.rounds/N).toFixed(1)+", longest "+stats.maxr);
bad.slice(0,30).forEach(function(x){ console.log("FAIL",x); });
console.log("tg_engine:",bad.length?bad.length+" problems":"ok"); process.exit(bad.length?1:0);
