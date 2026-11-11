import {ABN,dieAvg,mod} from "./01-logic-core-helpers.js";
import {actsTable,bookPages,featDef,weaponDef} from "./00-env.js";
import {registerSheetGroup,registerSheetRule} from "./12a-logic-sheet-registry.js";
import {defineLocals} from "./12b-logic-sheet-schema.js";
defineLocals({itemWeaponEffects:"object"});
/* Sheet handlers, part 10 (contract in 12a-logic-sheet-registry.js): the late pass (phase "late") and the closing steps (phase "post").
   The field groups of the fx engine run in one element loop over the active effect entries (loop "late-fx"), one handler per field group,
   so the groups still interleave entry by entry as in the old single loop. */
/* an attack row named k: the row, its base weapon, its thrown copy, or (zero-miss-1) the magic item of a variant row ("Flame Tongue (Rapier)" for "Flame Tongue") */
function rowHit(Q,r,k){const nn=(r.n||"").replace(/ \(thrown\)$/,"");return r.n===k||Q.baseOf(r.n).b===k||nn===k||Q.baseOf(nn).mi===k}
function pickRowsOf(C,Q,kind){const hasW=function(r){return !!weaponDef(Q.baseOf(r.n).b)||!!r.gk},isSp=function(r){return /^Cantrip/.test(r.sub||"")};
  const hit=function(r,k){return rowHit(Q,r,k)},
   rowsPick=function(kind){/* fx engine v4: kind may also be "melee", "ranged", "natural" (natural weapon rows), "any" (every row), or an array of kinds */if(Array.isArray(kind)){const out=[];kind.forEach(function(k){rowsPick(k).forEach(function(r){if(out.indexOf(r)<0)out.push(r)})});return out}const wk=function(r){const w=weaponDef(Q.baseOf(r.n).b);return w?w.k:(r.gk||"")};return C.attacks.filter(function(r){return kind==="unarmed"?r.n==="Unarmed Strike":kind==="weapon"?hasW(r)&&r.n!=="Unarmed Strike":kind==="spell"?isSp(r):kind==="melee"?hasW(r)&&r.n!=="Unarmed Strike"&&wk(r)==="M":kind==="ranged"?hasW(r)&&wk(r)==="R":kind==="natural"?r.sub==="Natural weapon":kind==="any"?true:hit(r,kind)})};
 return rowsPick(kind)}
function spdTxt(k){return k.charAt(0).toUpperCase()+k.slice(1)+" Speed"}
function fBlk(t){return String(t).replace(/([.!?:)\]"]) \*\*(?!Your choice\.|Still open\.)([^*\n]{1,80}?\.)\*\* /g,"$1\n\n**$2** ")}
/* v32 RL51 actsFor */
/* C.acts: one entry per action a feature gives, from ACTS (audited to PHB 2024). k = action|bonus|reaction|other, n = label, f = feature name, g = group,
   u = Limited Use name, d = the part of the text named n ("**n.** ..."), it = magic item key. g.ak lists the feature names of a group the table covers
   (the sheet then uses only C.acts for them; other names keep the old text rule) */
function actEsc(x){return String(x).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function actSec(t,lab){const m=new RegExp("\\*\\*"+actEsc(lab)+"\\.\\*\\*\\s*([\\s\\S]*?)(?=\\s*\\*\\*[^*\\n]{1,80}?\\.\\*\\*|$)").exec(String(t||""));return m?m[1].trim():null}
function actKeys(B,gg,n){const mm=/^(\w+) \(multiclass \d+\)(?:: (.+))?$/.exec(gg);
  if(gg==="Feats")return ["feat|"+n];if(/^Species: /.test(gg))return ["sp|"+B.species+"|"+n];if(gg===B.cls)return ["cls|"+B.cls+"|"+n];
  if(B.sub&&gg===B.cls+" Subclass: "+B.sub)return ["sub|"+B.sub+"|"+n];if(mm)return ["cls|"+mm[1]+"|"+n].concat(mm[2]?["sub|"+mm[2]+"|"+n]:[]);
  if(gg==="Eldritch Invocations")return ["inv|"+n];if(gg==="Metamagic Options")return ["meta|"+n];return []}
function actPut(out,lin,q,it,gg,lab0,txt){const k=q[0],lab=q[1]||lab0,e={k:k,n:lab,f:it.n,g:gg};if(q[3]&&lin.indexOf(q[3])!==0)return;if(q[2])e.u=q[2];
  if(txt!=null)e.d=txt;else if(q[1]&&q[1]!==it.n){const d=actSec(it.full||it.d,q[1]);if(d)e.d=d}out.push(e)}
function actFeat(C,B,T,lin,out){(C.features||[]).forEach((g) =>{const gg=g.g,ak=[];(g.items||[]).forEach((it) =>{
   if(it.n==="Maneuvers known"){ak.push(it.n);let re=/\*\*([^*\n]{1,60}?)\.\*\*/g,m;while((m=re.exec(String(it.d||"")))){const L0=T["man|"+m[1]];if(L0)L0.forEach((q) =>{actPut(out,lin,q,it,gg,m[1],actSec(it.d,m[1]))})}return}
   let L=null;actKeys(B,gg,it.n).some((k) =>{if(T[k]){L=T[k];return true}return false});if(!L)return;ak.push(it.n);L.forEach((q) =>{actPut(out,lin,q,it,gg,it.n)})});
  if(ak.length)g.ak=ak;else delete g.ak});}
function actItems(B,I,Q,out){/* magic items in use (attunement within the limit), from the item text: Magic action, Bonus Action, Reaction */
(B.inv||[]).forEach((x,ix) =>{if(!Q.itemInUse(x,I.ATT.rows[ix]))return;const d=Q.dmapRow(x.n);if(!d)return;
  const t=String(d[4]||""),ss=t.split(/(?<=[.!?])\s+/);[["action",/\b(Magic|Utilize) action\b/],["bonus",/\bBonus Action\b/],["reaction",/\bReaction\b/]].forEach((p) =>{const mine=ss.filter((z) =>{return p[1].test(z)&&!/\b(A|The) (hag|creature|target|monster)\b(?:(?!\byou\b)[^.])*\b(can take|takes)\b/.test(z)});if(!mine.length)return;/* v32 p39 */
   out.push({k:p[0],n:x.n,it:x.n,d:mine.join(" ")})})});}
function actsFor(C,I,Q){const B=I.B;const out=[],T=(actsTable()||{}),lin=String((B.ch||{}).lin||"");
 actFeat(C,B,T,lin,out);actItems(B,I,Q,out);
 return out}
/* Attack rows a feature gives: Polearm Master Pole Strike (PHB 2024 p. 205), Soulknife Psychic Blades (p. 136), Circle of the Stars Archer (p. 89) */
function atkPole(L,add,I,Q){const feats=I.feats;
 if(feats.some((f) =>{return f.n==="Polearm Master"}))L.forEach((r) =>{if(r.act||/ \(thrown\)$/.test(r.n)||r.n==="Unarmed Strike")return;const b=Q.baseOf(r.n).b,w=weaponDef(b);
  if(!w||w.k!=="M"||!(b==="Quarterstaff"||b==="Spear"||(/Heavy/.test(w.p)&&/Reach/.test(w.p))))return;
  add.push({n:"Pole Strike",sub:r.n+" • Bonus Action",ab:r.ab,prof:r.prof,die:"1d4",dieSrc:"Polearm Master: Pole Strike ("+I.SRC+"), the other end of the "+b,misc:r.misc,miscSrc:r.miscSrc,dmgBonus:r.dmgBonus,
   type:"Bludgeoning",range:/Reach/.test(w.p)?"10 ft":"5 ft",m:r.m,note:"Bonus Action, right after you take the Attack action and attack with this weapon.",act:"bonus",of:r.n})});
 const pn=add.filter((r) =>{return r.n==="Pole Strike"});if(pn.length>1)pn.forEach((r) =>{r.n="Pole Strike ("+r.of+")"});/* one name per row when two weapons carry it */}
function atkSoul(add,I,a,sk){if(sk>=3){const fab=a.sc.DEX>a.sc.STR?"DEX":"STR",src="Psychic Blades ("+I.SRC+", Soulknife 3)";
  add.push({n:"Psychic Blade",sub:"Finesse, Thrown (60/120) • Soulknife",ab:fab,prof:true,die:"1d6",dieSrc:src,type:"Psychic",range:"5 ft, 60/120 ft",m:"Vex",note:"Formed in a free hand when you take the Attack action or make an Opportunity Attack. It vanishes after the attack."});
  add.push({n:"Psychic Blade (Bonus Action)",sub:"Bonus Action • Finesse, Thrown (60/120)",ab:fab,prof:true,die:"1d4",dieSrc:src,type:"Psychic",range:"5 ft, 60/120 ft",m:"Vex",note:"After you attack with a Psychic Blade on your turn, if your other hand is free.",act:"bonus"})}}
function atkStar(add,I,Q,st){if(st>=3){const sb=Q.spItemB("atk","Druid");
  add.push({n:"Starry Form: Archer",sub:"Bonus Action • Archer form • ranged spell attack",ab:"WIS",prof:true,die:st>=10?"2d8":"1d8",dieSrc:"Starry Form: Archer ("+I.SRC+", Circle of the Stars 3"+(st>=10?"; Twinkling Constellations, level 10":"")+")",misc:sb||undefined,miscSrc:sb?Q.spItemSrc("Druid").join(", "):undefined,
   type:"Radiant",range:"60 ft",m:"",note:"While the Archer form lasts: when you take the form, and as a Bonus Action on later turns.",act:"bonus"})}}
function actAtk(C,I,Q){const a=I.a;const L=C.attacks||(C.attacks=[]),add=[];
 atkPole(L,add,I,Q);
 const sk=Q.subAt("Rogue","Soulknife");atkSoul(add,I,a,sk);
 const st=Q.subAt("Druid","Circle of the Stars");atkStar(add,I,Q,st);
 if(C.xdmg){C.xdmg=C.xdmg.filter((x) =>{return !(x.n==="Psychic Blades"&&sk>=3)&&!(x.n==="Starry Form: Archer"&&st>=3)});if(!C.xdmg.length)delete C.xdmg}
 add.forEach((r) =>{L.push(r)})}
registerSheetGroup({id:"late-ws-forms",group:"late",phase:"late",order:10,reads:["i.B", "i.CH", "C.companion", "C.wsForms"],writes:["C.wsForms", "C.companion"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const {B,CH}=I; CH.forEach((q) =>{const v=B.ch[q.key];if(/^(m\d+:)?p2forms$/.test(q.key)&&Array.isArray(v)&&v.length)C.wsForms=v.slice();if(q.feature==="Primal Companion"&&typeof v==="string"&&v)C.companion=v});
  return ctx.patch()}});
registerSheetGroup({id:"late-size",group:"late",phase:"late",order:20,reads:["i.G", "C.carryBump", "C.size"],writes:["C.size", "C.carryBump"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const {G}=I; {const SZ=["Tiny","Small","Medium","Large","Huge","Gargantuan"];const sz=I.G;sz.forEach((e) =>{if(e.size&&SZ.indexOf(C.size)<SZ.indexOf(e.size))C.size=e.size});sz.forEach((e) =>{if(e.sizeSet&&SZ.indexOf(e.sizeSet)>=0)C.size=e.sizeSet/* fx engine v6: sizeSet "Tiny" = the size becomes exactly this, also smaller (Lilliputian), after the raising sizes */})}I.G.forEach((e) =>{if(e.carryBump)C.carryBump=true/* fx engine v4: carryBump true = count as one size larger for carrying capacity (Powerful Build style) without changing the size. The sheet reads C.carryBump */});/* fx: size "Large" = you become Large if smaller (Exo-Frame) */
  return ctx.patch()}});
registerSheetGroup({id:"late-senses-fx",group:"late",phase:"late",order:30,reads:["i.G", "C.senses"],writes:["C.senses"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const {G}=I; I.G.forEach((e) =>{(e.sense||[]).forEach((x) =>{const o=(C.senses||[]).filter((y) =>{return y.n===x[0]})[0];if(o){if(o.v>=x[1])return;C.senses=C.senses.filter((y) =>{return y!==o})}C.senses=(C.senses||[]).concat([{n:x[0],v:x[1],s:e.lbl,d:x[2]||""}])})});/* fx engine v2: sense [[name, feet, text]] */I.G.forEach((e) =>{(e.senseAdd||[]).forEach((x) =>{const o=(C.senses||[]).filter((y) =>{return y.n===x[0]})[0];if(o){o.v+=x[1];o.s=o.s+"; "+e.lbl;o.d=x[2]||o.d}else C.senses=(C.senses||[]).concat([{n:x[0],v:x[1],s:e.lbl,d:x[2]||""}])})});/* fx batch E: senseAdd [[name, feet, text]] grows an existing sense by that many feet, else grants it */
  return ctx.patch()}});
registerSheetGroup({id:"late-senses-option",group:"late",phase:"late",order:40,reads:["i.SFX", "i.spName", "q.xfxSenses", "C.darkSrc", "C.darkvision", "C.senses"],writes:["C.senses", "C.darkvision", "C.darkSrc"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const {SFX,spName}=I;  const SFq=I.SFX;(SFq.senses||[]).forEach((x) =>{C.senses=(C.senses||[]).filter((y) =>{return y.n!==x[0]});C.senses.push({n:x[0],v:x[1],s:x[2]+" ("+spName+")",d:x[3]||""})});
 Q.xfxSenses(C);/* v62 */
  return ctx.patch()}});
registerSheetGroup({id:"late-fly-moves",group:"late",phase:"late",order:50,reads:["i.SFX", "i.custom", "i.sp", "i.spName", "i.SRC", "C.speeds"],writes:["C.speeds"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const {SFX,custom,sp,spName,SRC}=I;const SFq=I.SFX; if(SFq.fly){C.speeds=C.speeds||{};C.speeds.fly={v:SFq.fly[0],s:SFq.fly[1]}}
 if(SFq.moves&&!custom&&sp){C.speeds=C.speeds||{};Object.keys(SFq.moves).forEach((k) =>{C.speeds[k]={v:SFq.moves[k],s:spName+" ("+(sp.hb||I.SRC)+")"+(SFq.movesNote&&k==="fly"?", "+SFq.movesNote:"")}})}/* v36 p21 */
  return ctx.patch()}});
registerSheetGroup({id:"late-natural-feat",group:"late",phase:"late",order:60,reads:["i.feats", "C.attacks"],writes:["C.attacks"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const {feats}=I; feats.forEach((f) =>{const F=featDef(f.n);if(F&&F.attacks)F.attacks.forEach((q) =>{C.attacks.push({n:q.n,sub:"Natural weapon",ab:q.ab||"STR",prof:true,die:q.die,dieSrc:q.n+" ("+f.n+")",type:q.type,range:"5 ft",m:"",note:""})})});/* v69 */
  return ctx.patch()}});
registerSheetGroup({id:"late-natural-species",group:"late",phase:"late",order:70,reads:["i.sp", "i.custom", "i.spName", "i.SRC", "C.attacks"],writes:["C.attacks"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const {sp,custom,spName,SRC}=I; if(sp&&!custom&&sp.attacks)sp.attacks.forEach((q) =>{C.attacks.push({n:q.n,sub:"Natural weapon",ab:q.ab||"STR",prof:true,die:q.die,dieSrc:q.n+" ("+spName+", "+(sp.hb||I.SRC)+")",type:q.type,range:q.range||"5 ft",m:"",note:q.note||""})});/* v36 p21 */
  return ctx.patch()}});
registerSheetRule({id:"leyak-queen-3-sharp-claws",group:"late",about:"Warlock, The Leyak Queen 3: the Sharp Claws attack of Leyak Form",phase:"late",order:80,reads:["i.B", "i.a", "i.mcl", "q.subAt", "C.attacks"],writes:["C.attacks"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const {B,a,mcl}=I; const lq=Q.subAt("Warlock","The Leyak Queen");if(lq>=3){const dc=lq>=10&&((B.ch.scgrand||[]).indexOf("Deadly Claws")>=0||(I.mcl.some((m,i) =>{return ((B.ch["m"+i+":scgrand"])||[]).indexOf("Deadly Claws")>=0}))),fab=a.sc.DEX>a.sc.STR?"DEX":"STR";
  C.attacks.push({n:"Sharp Claws",sub:"Leyak Form only \u2022 Finesse",ab:fab,prof:true,die:dc?"1d10":"1d8",dieSrc:dc?"Deadly Claws (Grand Leyak)":"Leyak Form (The Leyak Queen 3)",type:"Force",range:"5 ft",m:"",note:"Only while your Leyak Form is active. While it is, you can also make this attack as a Bonus Action."})}
  return ctx.patch()}});
function arAb(a,C,x){let ab=x.ab||"STR";if(ab==="best")ab=a.sc.DEX>a.sc.STR?"DEX":"STR";else if(ab==="cast")ab=(C.spellcasting&&C.spellcasting.ab)||"CHA";return ab}
function arProf(C,Q,x){const wps=String(C.profs.weapons||"");return x.prof===true||(typeof x.prof==="string"&&/^armor:/.test(x.prof)&&(" "+C.profs.armor+",").replace(/,/g," ,").indexOf(" "+x.prof.slice(6)+" ")>=0)||(typeof x.prof==="string"&&(Q.wpNamed(wps,x.prof)||(" "+wps+",").replace(/,/g," ,").indexOf(" "+x.prof+" ")>=0||(x.prof==="Simple"&&/Simple/.test(wps))||(x.prof==="Martial"&&/Martial(?! with)/.test(wps))))}
function arAdd(C,Q,I,e,x){if(C.attacks.some(function(r){return r.n===x.n}))return;
    const ab=arAb(I.a,C,x);
    const pr=arProf(C,Q,x),
     bn=x.bonus!=null?Q.fxv(x.bonus,e):0,av=x.atk!=null?Q.fxv(x.atk,e):bn,dv=x.dmg!=null?Q.fxv(x.dmg,e):bn,sg2=function(v){return (v>0?"+":"")+v};
    C.attacks.push({n:x.n,sub:x.natural?"Natural weapon":(x.sub||"Granted attack"),ab:ab,prof:!!pr,die:x.die,dieSrc:x.n+" ("+e.lbl+")",misc:av,miscSrc:av?e.lbl+": "+sg2(av)+" to hit"+(dv===av?" and damage":""):"",dmgBonus:dv,type:x.type||"",range:x.range||"5 ft",m:"",note:x.note||"",gk:x.k||(/ft, \d|\d\/\d/.test(x.range||"")?"R":"M")});
    if(x.xd){const rw=C.attacks[C.attacks.length-1];rw.xdice=x.xd.map(function(q){return {d:q.d,t:q.t||"",s:e.lbl}});rw.note=(rw.note?rw.note+" ":"")+"Extra damage: "+x.xd.map(function(q){return "+"+q.d+(q.t?" "+q.t:"")}).join(", ")+" ("+e.lbl+")."}}
registerSheetGroup({id:"late-attack-rows",group:"late",phase:"late",order:100,scope:"each",over:"i.G",loop:"late-attack-rows",reads:["i.a", "i.ar", "i.ESH", "i.EA", "q.fxv", "q.wpNamed", "C.attacks", "C.profs", "C.spellcasting", "q.fxOk"],writes:["C.attacks"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {a,ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;(e.attackRow?(Array.isArray(e.attackRow)?e.attackRow:[e.attackRow]):[]).forEach(function(x){arAdd(C,Q,I,e,x)});
  return ctx.patch()}});
registerSheetGroup({id:"fx-res-to-immunity",group:"late",phase:"late",order:110,scope:"each",over:"i.G",loop:"late-fx",reads:["i.ar", "i.ESH", "i.EA", "C.defenses", "q.fxOk"],writes:["C.defenses"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;   /* resToImm: Resistance to each type, or Immunity when a Resistance to that type is already held from another source */
   (e.resToImm||[]).forEach(function(t){const def=C.defenses=C.defenses||[],ix=def.findIndex(function(x){return x.t==="Resistance"&&x.v===t});
    if(ix>=0){def.splice(ix,1);def.push({t:"Immunity",v:t,s:e.lbl+" (you already had Resistance to "+t+")"})}
    else if(def.some(function(x){return x.t==="Resistance"&&new RegExp("(^|, )"+t+"(,|$)").test(x.v)}))def.push({t:"Immunity",v:t,s:e.lbl+" (you already had Resistance to "+t+")"});
    else def.push({t:"Resistance",v:t,s:e.lbl})});
  return ctx.patch()}});
registerSheetGroup({id:"fx-speed-add-if",group:"late",phase:"late",order:120,scope:"each",over:"i.G",loop:"late-fx",reads:["i.ar", "i.ESH", "i.EA", "C.moves", "C.speed", "C.speedSrc", "C.speeds", "q.fxOk"],writes:["C.speeds", "C.moves", "C.speedSrc"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;   /* speedAddIf {swim:10}: +10 ft to that Speed if you already have it from another source, else the entry's own mv grants it */
   Object.keys(e.speedAddIf||{}).forEach(function(k){const n=+e.speedAddIf[k],sk=C.speeds&&C.speeds[k],mv=(C.moves||[]).filter(function(x){return x.m===k&&x.s!==e.lbl})[0];
    if(sk){const cur=sk.v==="walk"?C.speed:+sk.v;C.speeds[k]={v:cur+n,s:sk.s+"; +"+n+" ft "+e.lbl}}
    else if(mv){mv.v+=n;mv.s=mv.s+"; "+e.lbl}
    else if(e.mv&&e.mv[k]!=null){const v=e.mv[k];C.speeds=C.speeds||{};C.speeds[k]={v:v==="speed"?"walk":+v,s:e.lbl};(C.moves=C.moves||[]).push({m:k,v:v==="speed"?C.speed:+v,s:e.lbl})}
    if(sk||mv)C.speedSrc+=", +"+n+" ft "+spdTxt(k)+" ("+e.lbl+", you already have it)";else if(e.mv&&e.mv[k]!=null)C.speedSrc+=", "+spdTxt(k)+" "+(e.mv[k]==="speed"?"equal to your Speed ("+C.speed+" ft)":e.mv[k]+" ft")+" ("+e.lbl+")"});
  return ctx.patch()}});
registerSheetGroup({id:"fx-atk-ability",group:"late",phase:"late",order:130,scope:"each",over:"i.G",loop:"late-fx",reads:["i.a", "i.pb", "i.ar", "i.ESH", "i.EA", "C.attacks", "q.baseOf", "q.fxOk"],writes:["C.attacks"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {a,pb,ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;const rowsPick=function(k){return pickRowsOf(C,Q,k)};   /* atkAb {kind, ab, opt, note}: that ability for the attack and damage modifier when higher. opt:1 = only a note on the row (the text allows it for some strikes) */
   if(e.atkAb){const q=e.atkAb;rowsPick(q.kind).forEach(function(r){if(!q.ab||a.sc[q.ab]==null)return;const bt=pb+mod(a.sc[q.ab]),dm=mod(a.sc[q.ab]);
     if(q.opt){r.note=(r.note?r.note+" ":"")+(q.note||e.n+": you can use "+ABN[q.ab]+" instead of "+ABN[r.ab]+" for the attack and damage of this attack")+" (attack +"+bt+", damage modifier "+(dm>=0?"+":"")+dm+")."}
     else if(mod(a.sc[q.ab])>mod(a.sc[r.ab])){r.note=(r.note?r.note+" ":"")+e.lbl+": "+ABN[q.ab]+" instead of "+ABN[r.ab]+" for attack and damage.";r.ab=q.ab;r.abSrc=e.lbl}})}
  return ctx.patch()}});
registerSheetGroup({id:"fx-atk-dice",group:"late",phase:"late",order:140,scope:"each",over:"i.G",loop:"late-fx",reads:["i.ar", "i.ESH", "i.EA", "C.attacks", "C.defenses", "q.baseOf", "q.fxOk", "l.itemWeaponEffects"],writes:["C.attacks", "C.defenses", "l.itemWeaponEffects"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;const rowsPick=function(k){return pickRowsOf(C,Q,k)};   /* atkDice [{when:"weapon|spell|unarmed|<name>", d:"1d10", t:"type", note}]: extra damage dice on matching attack rows, or a Note under Defenses when no row exists */
   (e.atkDice||[]).forEach(function(x,xi){const rows=rowsPick(x.when);
    if(rows.length)rows.forEach(function(r){if(x.roll!==true||acceptItemWeaponEffect(ctx,Q,e,x,xi,r,"dice"))appendAttackRider(r,x,e.lbl)});
    else{C.defenses=C.defenses||[];C.defenses.push({t:"Note",v:(x.note||"Extra damage on "+(/^(weapon|spell|unarmed)$/.test(x.when)?x.when+" attacks":x.when))+": +"+x.d+(x.t?" "+x.t:""),s:e.lbl})}});
  return ctx.patch()}});
registerSheetGroup({id:"fx-attack-self-damage",group:"late",phase:"late",order:145,scope:"each",over:"i.G",loop:"late-fx",reads:["i.ar","i.ESH","i.EA","q.fxOk","q.baseOf","C.attacks","l.itemWeaponEffects"],writes:["C.attacks","l.itemWeaponEffects"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C,e=ctx.p;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;
  (e.atkSelfDamage||[]).forEach(function(x,xi){pickRowsOf(C,Q,x.when).forEach(function(r){if(!acceptItemWeaponEffect(ctx,Q,e,x,xi,r,"self"))return;const spec={normal:x.normal,critical:x.critical,type:x.type,bypassDefenses:x.bypassDefenses,s:e.lbl};if(e.kind==="item"){spec.item=e.owner;spec.unattuned=e.itemState==="unattuned"}(r.selfDamage=r.selfDamage||[]).push(spec)})});return ctx.patch()}});
registerSheetGroup({id:"fx-save-notes",group:"late",phase:"late",order:150,scope:"each",over:"i.G",loop:"late-fx",reads:["i.ar", "i.ESH", "i.EA", "C.saveNotes", "q.fxOk"],writes:["C.saveNotes"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;const pushSN=function(t,s){C.saveNotes=C.saveNotes||[];if(!C.saveNotes.some(function(y){return y.t===t&&y.s===s}))C.saveNotes.push({t:t,s:s})};   /* fx engine v4: saveNote [text] = a line under Saving Throws (death save bonus, "Advantage on saves against being Frightened"); advOn texts that mention saves are copied there too, next to the Defenses note */
   (e.saveNote||[]).forEach(function(t){pushSN(t,e.lbl)});(e.advOn||[]).forEach(function(t){if(/sav(e|ing)/i.test(t))pushSN("Advantage on "+t,e.lbl)});
  return ctx.patch()}});
registerSheetGroup({id:"fx-atk-bonus",group:"late",phase:"late",order:160,scope:"each",over:"i.G",loop:"late-fx",reads:["i.ar", "i.ESH", "i.EA", "q.fxv", "C.attacks", "q.baseOf", "q.fxOk", "l.itemWeaponEffects"],writes:["C.attacks", "l.itemWeaponEffects"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;const rowsPick=function(k){return pickRowsOf(C,Q,k)};   /* atkBonus [{when,atk,dmg,crit,note}]: a flat bonus to the attack roll and/or damage of the matching attack rows (when as for atkDice: weapon, spell, unarmed, melee, ranged, natural, any, a name, or an array). atk and dmg take a number, "pb", an ability key, or [[level, value]] steps (level = the source level). crit N = note "Critical hit on N-20" */
   (e.atkBonus?(Array.isArray(e.atkBonus)?e.atkBonus:[e.atkBonus]):[]).forEach(function(x,xi){rowsPick(x.when||"weapon").forEach(function(r){if(!acceptItemWeaponEffect(ctx,Q,e,x,xi,r,"bonus"))return;const av=x.atk!=null?Q.fxv(x.atk,e):0,dv=x.dmg!=null?Q.fxv(x.dmg,e):0,sg=function(v){return (v>0?"+":"")+v};
     if(av){r.misc=(r.misc||0)+av;r.miscSrc=(r.miscSrc?r.miscSrc+"; ":"")+e.lbl+": "+sg(av)+" to hit"}if(dv){r.dmgBonus=(r.dmgBonus||0)+dv;r.miscSrc=(r.miscSrc?r.miscSrc+"; ":"")+e.lbl+": "+sg(dv)+" damage"}
     setAttackCriticalRange(r,x.crit);if(x.crit)r.note=(r.note?r.note+" ":"")+"Critical hit on "+x.crit+"-20 ("+e.lbl+").";if(x.note)r.note=(r.note?r.note+" ":"")+x.note})});
  return ctx.patch()}});
registerSheetGroup({id:"fx-unarmed",group:"late",phase:"late",order:170,scope:"each",over:"i.G",loop:"late-fx",reads:["i.ar", "i.ESH", "i.EA", "C.attacks", "q.baseOf", "q.fxOk"],writes:["C.attacks"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;const rowsPick=function(k){return pickRowsOf(C,Q,k)};   /* unarmed {die, t, magic}: the Unarmed Strike row. die: "1d6" or [[level, "1d6"], ...] steps; used when larger than the current die (die force:1 always). t: damage type. magic: note that it counts as magical */
   if(e.unarmed){const q=e.unarmed;rowsPick("unarmed").forEach(function(r){let d=q.die;if(Array.isArray(d)){let v=null;d.forEach(function(s){if(e.lv>=s[0])v=s[1]});d=v}
     if(d&&(q.force||dieAvg(d)>dieAvg(r.die))){r.dieSrc=e.lbl+(r.die&&r.die!=="1"?" (instead of "+r.die+")":"");r.die=d}
     if(q.t)r.type=q.t;if(q.magic)r.note=(r.note?r.note+" ":"")+"Counts as magical ("+e.lbl+")."})}
  return ctx.patch()}});
function drDice(e,x,r){if(x.d&&(!x.up||dieAvg(x.d)>dieAvg(r.die))){r.dieSrc=e.lbl+(r.die&&r.die!=="1"?" (instead of "+r.die+")":"");r.die=x.d;if(x.critD)r.critDie=x.critD;else delete r.critDie}
     if(x.t){r.typeSrc=e.lbl+(r.type?" (instead of "+r.type+")":"");r.type=x.t}}
function drFinesse(a,e,x,r){if(x.finesse&&(r.ab==="STR"||r.ab==="DEX")&&!/Finesse/.test(r.sub||"")){r.sub=(r.sub?r.sub+" \u2022 ":"")+"Finesse";if(a.sc.DEX>a.sc.STR&&r.ab==="STR"){r.ab="DEX";r.abSrc=e.lbl}}}
function drRow(a,Q,e,x,r){if(x.from&&r.die!==x.from)return;if(x.cat){const w0=weaponDef(Q.baseOf(r.n).b);if(!w0||w0.cat!==x.cat)return}
  drDice(e,x,r);drFinesse(a,e,x,r);if(x.note)r.note=(r.note?r.note+" ":"")+x.note}
registerSheetGroup({id:"fx-die-replace",group:"late",phase:"late",order:180,scope:"each",over:"i.G",loop:"late-fx",reads:["i.a", "i.ar", "i.ESH", "i.EA", "q.baseOf", "C.attacks", "q.fxOk"],writes:["C.attacks"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {a,ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;const rowsPick=function(k){return pickRowsOf(C,Q,k)};   /* fx engine v5: dieReplace [{when,d,t,from,up,finesse,note}]: the damage dice (d), the damage type (t) or the Finesse property of the matching rows are replaced. from: only rows with exactly this die. up:1 = only when d is larger. when as for atkDice */
   (e.dieReplace?(Array.isArray(e.dieReplace)?e.dieReplace:[e.dieReplace]):[]).forEach(function(x){rowsPick(x.when||"weapon").forEach(function(r){drRow(a,Q,e,x,r)})});
  return ctx.patch()}});
registerSheetGroup({id:"fx-reach-range",group:"late",phase:"late",order:190,scope:"each",over:"i.G",loop:"late-fx",reads:["i.ar", "i.ESH", "i.EA", "C.attacks", "q.baseOf", "q.fxOk"],writes:["C.attacks"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;const rowsPick=function(k){return pickRowsOf(C,Q,k)};   /* fx engine v5: reach [{when,add,mul}] changes the melee reach of the matching rows ("5 ft" becomes N*mul+add), rangeMul [{when,mul}] multiplies the normal and long range (80/320) */
   (e.reach?(Array.isArray(e.reach)?e.reach:[e.reach]):[]).forEach(function(x){rowsPick(x.when||"melee").forEach(function(r){const m=/^(\d+) ft/.exec(r.range||"");if(!m)return;const n=(+m[1])*(x.mul||1)+(x.add||0);r.range=n+" ft"+r.range.slice(m[0].length);r.note=(r.note?r.note+" ":"")+"Reach "+n+" ft ("+e.lbl+")."})});
   (e.rangeMul?(Array.isArray(e.rangeMul)?e.rangeMul:[e.rangeMul]):[]).forEach(function(x){rowsPick(x.when||"ranged").forEach(function(r){if(!/(\d+)\/(\d+)/.test(r.range||""))return;r.range=r.range.replace(/(\d+)\/(\d+)/,function(s,p1,p2){return (+p1*x.mul)+"/"+(+p2*x.mul)});r.note=(r.note?r.note+" ":"")+"Range multiplied by "+x.mul+" ("+e.lbl+")."})});
  return ctx.patch()}});
registerSheetGroup({id:"fx-tool-expertise",group:"late",phase:"late",order:200,scope:"each",over:"i.G",loop:"late-fx",reads:["i.pb", "i.ar", "i.ESH", "i.EA", "C.defenses", "C.profSrc", "C.profs", "C.toolExp", "q.fxOk"],writes:["C.profSrc", "C.toolExp", "C.profs", "C.defenses"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {pb,ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;   /* fx engine v5: toolExpert [tool] = Expertise (double Proficiency Bonus) with a tool you are proficient with; toolPE [tool] = proficiency, or Expertise when you already have it. C.toolExp [{n,s,v}] lists them, the tool source in C.profSrc.tools gets "Expertise", and a Defenses note repeats it */
   ["toolExpert","toolPE"].forEach(function(f){(e[f]||[]).forEach(function(n){const T=C.profSrc.tools,ix=T.findIndex(function(x){return x[0]===n});C.toolExp=C.toolExp||[];
     if(ix<0){if(f==="toolExpert")return;T.push([n,e.lbl]);C.profs.tools=(C.profs.tools&&C.profs.tools!=="None"?C.profs.tools+", ":"")+n;return}
     if(C.toolExp.some(function(x){return x.n===n}))return;T[ix][1]=T[ix][1]+"; Expertise ("+e.lbl+")";C.toolExp.push({n:n,s:e.lbl,v:2*pb});C.defenses=C.defenses||[];C.defenses.push({t:"Note",v:"Expertise with "+n+": add double your Proficiency Bonus (+"+(2*pb)+") to its ability checks",s:e.lbl})})});
  return ctx.patch()}});
registerSheetGroup({id:"fx-slot-add",group:"late",phase:"late",order:210,scope:"each",over:"i.G",loop:"late-fx",reads:["i.ar", "i.ESH", "i.EA", "C.defenses", "C.spellcasting", "q.fxOk"],writes:["C.spellcasting", "C.defenses"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;   /* fx engine v5: slotAdd [{lvl,n,ifHave,max}] adds spell slots to a character who casts with slots. lvl "high" = the highest slot level held (at most max). ifHave:1 = only when you already have slots of that level */
   if(C.spellcasting&&C.spellcasting.slots&&e.slotAdd)(Array.isArray(e.slotAdd)?e.slotAdd:[e.slotAdd]).forEach(function(q){const sl=C.spellcasting.slots.slice();let lv=q.lvl;if(lv==="high"){lv=0;sl.forEach(function(n,i){if(n>0&&(!q.max||i+1<=q.max))lv=i+1})}if(!lv||lv>9)return;if(q.ifHave&&!(sl[lv-1]>0))return;while(sl.length<lv)sl.push(0);sl[lv-1]+=q.n||1;C.spellcasting.slots=sl;C.defenses=C.defenses||[];C.defenses.push({t:"Note",v:"Extra spell slot: "+(q.n||1)+" of level "+lv,s:e.lbl})});
  return ctx.patch()}});
registerSheetGroup({id:"fx-exhaustion-lock",group:"late",phase:"late",order:220,scope:"each",over:"i.G",loop:"late-fx",reads:["i.ar", "i.ESH", "i.EA", "C.defenses", "C.exhMin", "q.fxOk"],writes:["C.exhMin", "C.defenses"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;   /* fx engine v5: exhLock N = Exhaustion that cannot be removed (a curse): the sheet keeps Exhaustion at N or more. C.exhMin */
   if(e.exhLock){C.exhMin=Math.max(C.exhMin||0,e.exhLock);C.defenses=C.defenses||[];C.defenses.push({t:"Note",v:"Exhaustion level "+e.exhLock+" cannot be removed until the effect ends",s:e.lbl})}
  return ctx.patch()}});
registerSheetGroup({id:"fx-die-step",group:"late",phase:"late",order:230,scope:"each",over:"i.G",loop:"late-fx",reads:["i.ar", "i.ESH", "i.EA", "C.attacks", "q.baseOf", "q.fxOk"],writes:["C.attacks"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;const rowsPick=function(k){return pickRowsOf(C,Q,k)};   /* fx engine v6: dieStep [{when,n}] moves the weapon die n steps on the ladder d4 d6 d8 d10 d12 (n -1 = one step down, 2d6 counts as d12, minimum d4). Other dice are not changed */
   (e.dieStep?(Array.isArray(e.dieStep)?e.dieStep:[e.dieStep]):[]).forEach(function(x){const LD=["1d4","1d6","1d8","1d10","1d12"];rowsPick(x.when||"weapon").forEach(function(r){if(r.n==="Unarmed Strike"&&!x.unarmed)return;const d0=r.die==="2d6"?"1d12":r.die,i=LD.indexOf(d0);if(i<0)return;const j=Math.max(0,Math.min(4,i+(x.n||-1)));if(j===i&&d0===r.die)return;r.dieSrc=e.lbl+" ("+(x.n<0||x.n==null?"one step down":"steps "+x.n)+" from "+r.die+")";r.die=LD[j]})});
  return ctx.patch()}});
registerSheetGroup({id:"fx-off-hand",group:"late",phase:"late",order:240,scope:"each",over:"i.G",loop:"late-fx",reads:["i.ar", "i.ESH", "i.EA", "C.attacks", "q.baseOf", "q.fxOk"],writes:["C.attacks"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;const rowsPick=function(k){return pickRowsOf(C,Q,k)};   /* fx engine v6: offHand:true = a row "(off-hand)" for each Light melee weapon row. The off-hand attack adds the ability modifier to its damage (Two-Weapon Fighting). C.attacks gets the extra rows, rows already named so are not doubled */
   if(e.offHand){rowsPick("melee").filter(function(r){return /Light/.test(r.sub||"")&&!/off-hand/.test(r.n)}).forEach(function(r){const nm=r.n+" (off-hand)";if(C.attacks.some(function(y){return y.n===nm}))return;const c2=Object.assign({},r,{n:nm,sub:(r.sub?r.sub+" \u2022 ":"")+"Off-hand",note:(r.note?r.note+" ":"")+"Off-hand attack (Bonus Action, second Light weapon). "+e.lbl+": the ability modifier is added to its damage.",m:r.m});delete c2.nomod;C.attacks.splice(C.attacks.indexOf(r)+1,0,c2)})}
  return ctx.patch()}});
registerSheetGroup({id:"fx-limited-use-bump",group:"late",phase:"late",order:250,scope:"each",over:"i.G",loop:"late-fx",reads:["i.ar", "i.ESH", "i.EA", "C.res", "q.fxOk"],writes:["C.res"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const e=ctx.p;const {ar,ESH,EA}=I;if(e.cond&&!Q.fxOk(e,I.ar,I.ESH,I.EA))return null;   /* fx engine v6: luBump [{match,add}] = +add to the maximum of every class resource row whose name is match (or starts with match); cdAdd N = luBump of "Channel Divinity" (each Channel Divinity feature one more time). The row tag says where the extra use comes from */
   (e.luBump?(Array.isArray(e.luBump)?e.luBump:[e.luBump]):[]).concat(e.cdAdd?[{match:"Channel Divinity",add:e.cdAdd}]:[]).forEach(function(x){C.res.forEach(function(r){if(!(r.n===x.match||r.n.indexOf(x.match)===0)||!(+r.max>0))return;r.max=+r.max+(x.add||1);r.tag=(r.tag?r.tag+". ":"")+e.lbl+": +"+(x.add||1)+" use"})});
  return ctx.patch()}});
registerSheetGroup({id:"fx-extra-attack",group:"late",phase:"late",order:300,reads:["i.G", "i.ar", "i.ESH", "i.EA", "q.fxOk", "C.actions"],writes:["C.actions"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const {G,ar,ESH,EA}=I;  {let ea=0,es="";G.forEach(function(e){if(e.extraAttack>ea&&(!e.cond||Q.fxOk(e,ar,ESH,EA))){ea=e.extraAttack;es=e.lbl}});const at=C.actions&&C.actions[0];if(ea>=2&&at&&at.n==="Attack"&&at.d.indexOf("per Extra Attack")<0)at.d=at.d.replace(/^Make one attack/,"Make "+(["","one","two","three","four"][ea]||ea)+" attacks ("+es+")")}
  return ctx.patch()}});
registerSheetGroup({id:"fx-text-picks",group:"late",phase:"late",order:310,reads:["i.B", "q.gxPicks", "C.defenses"],writes:["C.defenses"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const {B}=I;  Q.gxPicks().forEach(function(o){if(o.t!=="text"||!o.defT)return;const v=B.ch[o.key];if(typeof v==="string"&&v.trim()){C.defenses=C.defenses||[];C.defenses.push({t:o.defT,v:(o.dpre?o.dpre+": ":"")+v.trim(),s:o.src})}})
  return ctx.patch()}});
registerSheetGroup({id:"combat-maneuver-roll",group:"late",phase:"late",order:320,reads:["i.a", "i.pb", "i.parts", "q.enabledPacks", "C.actions"],writes:["C.actions"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const {a,pb,parts}=I; if(Q.enabledPacks().some((p) =>{return p.cmr})&&I.parts.some((q) =>{return /^(Barbarian|Fighter|Monk|Paladin|Ranger|Rogue)$/.test(q.cls)})){const sm=mod(a.sc.STR),dm=mod(a.sc.DEX),rb=pb+Math.max(sm,dm);
  C.actions.push({c:"Actions",n:"Combat Maneuver Roll",hb:1,t:"Variant rule (Aurvidya)",d:"Instead of letting a target save against a nonmagical maneuver of a martial feature that calls for a Strength or Dexterity saving throw, roll d20 "+(rb<0?"\u2212"+(-rb):"+"+rb)+" (Proficiency Bonus plus your Strength or Dexterity modifier). It works if the total meets the target's DC: 8 + its Proficiency Bonus + its Strength modifier + its Dexterity modifier. Your own DC against such a roll is "+(8+pb+sm+dm)+"."})}
  return ctx.patch()}});
function ctLv(it){const m=/ (\d+)$/.exec(it.s||"");return m?+m[1]:0}
function ctPut(cg,it,lv){let i=0;while(i<cg.items.length&&(ctLv(cg.items[i])||0)<=lv)i++;cg.items.splice(i,0,it)}
function ctCoreA(B,c){return "**Primary Ability:** "+String(c.prim||"").split("/").map((k) =>{return ABN[k]||k}).join(" or ")+". **Hit Point Die:** D"+c.hd+" per "+B.cls+" level. **Saving Throw Proficiencies:** "+(c.saves||[]).map((k) =>{return ABN[k]}).join(" and ")+". **Skill Proficiencies:** Choose "+(c.sk&&c.sk.n||0)+(c.sk&&c.sk.from==="any"?" skills.":" from "+((c.sk&&c.sk.from)||[]).join(", ")+".")}
function ctCoreB(B,c,ck,wp,arm){return (wp.length?" **Weapon Proficiencies:** "+wp.join(" and ")+".":"")+(c.tools?" **Tool Proficiencies:** "+c.tools+".":"")+(arm.length?" **Armor Training:** "+arm.join(", ")+".":" **Armor Training:** None.")+(function(){const y=ck.concat(c.toolPick?(B.ch.clsTool||[]):[]);return y.length?" **Your choice.** "+y.join(", ")+".":""})()}
function ctCoreCard(C,I,c,cg){const B=I.B;
  const ck=C.skills.filter((s) =>{return s.p&&/^Class skills/.test(s.src||"")}).map((s) =>{return s.n});
  const arm=String(c.armor||"").split(/,\s*/).filter(Boolean).map((x) =>{return x==="Shields"?"Shields":x+" armor"}),wp=String(c.weapons||"").split(/,\s*/).filter(Boolean).map((x) =>{return /^(Simple|Martial)$/.test(x)?x+" weapons":x});
  const core=ctCoreA(B,c)+ctCoreB(B,c,ck,wp,arm);
  cg.items.unshift({n:"Core "+B.cls+" Traits",s:I.SRC+", "+B.cls+" 1",d:core});}
function ctSubCard(cg,I,Q){const B=I.B,L=I.L;
  if(B.sub&&B.sub!=="__custom"&&L>=Q.subLv(B.cls))ctPut(cg,{n:I.r14?Q.subLbl(B.cls):B.cls+" Subclass",s:I.SRC+", "+B.cls+" "+Q.subLv(B.cls),d:"You gain "+(/^[AEIOU]/.test(B.cls)?"an ":"a ")+B.cls+" subclass of your choice. Its features come at the levels it lists. **Your choice.** "+Q.sdn(B.sub)+"."},Q.subLv(B.cls));}
function ctAsiCards(cg,I,Q){const B=I.B;
  Q.allFeats().forEach((f) =>{const m=new RegExp("\\("+B.cls+" (\\d+)\\)$").exec(f.s||"");if(!m)return;const F=featDef(f.n)||{},lv=+m[1],ep=F.cat==="E",v=f.asi||{},ex=v.a1?(F.asi2?(v.a1===v.a2?v.a1+" +2":v.a1+" +1, "+v.a2+" +1"):v.a1+" +1"):"";
   ctPut(cg,{n:ep?"Epic Boon":"Ability Score Improvement",s:I.SRC+", "+B.cls+" "+lv,d:ep?"You gain an Epic Boon feat or another feat of your choice for which you qualify. **Your choice.** "+f.n+(ex?" ("+ex+")":"")+".":"You gain the Ability Score Improvement feat or another feat of your choice for which you qualify. **Your choice.** "+f.n+(ex?" ("+ex+")":"")+"."},lv)});}
function ctSpeciesCards(C,I){const B=I.B,custom=I.custom,sp=I.sp;
  const sg0=C.features.filter((g) =>{return /^Species: /.test(g.g)})[0];
  if(sg0&&!custom&&sp){const had=(n) =>{return sg0.items.some((i) =>{return i.n===n})};/* a species that lists its own Creature Type or Speed keeps that card only */if(!had("Speed"))sg0.items.unshift({n:"Speed",s:(sp.hb||I.SRC)+", "+B.species,d:"Your Speed is "+(C.speed||sp.speed)+" feet."});if(!had("Creature Type"))sg0.items.unshift({n:"Creature Type",s:(sp.hb||I.SRC)+", "+B.species,d:"You are a "+(sp.type||"Humanoid")+"."})}}
function ctBgCard(C,I){const B=I.B,bg=I.bg;
  const bgG=C.features.filter((g) =>{return /^Background: /.test(g.g)})[0];if(bgG&&I.r14)bgG.items=bgG.items.filter((i) =>{return i.n!=="Ability Scores"});if(bgG&&bg&&!I.r14&&B.bgMode!=="111"&&B.bg2){const it=bgG.items[0];if(it&&it.n==="Ability Scores")it.d="The background raises one of "+bg.ab.join(", ")+" by 2 and another by 1, or all three by 1. **Your choice.** "+ABN[B.bg2]+" +2"+(B.bg1?", "+ABN[B.bg1]+" +1":"")+"."}}
function coreTraits(C,I,Q){const B=I.B,c=I.c;const cg=C.features.filter((g) =>{return g.g===B.cls})[0];if(!cg||!c)return;
  ctCoreCard(C,I,c,cg);ctSubCard(cg,I,Q);ctAsiCards(cg,I,Q);ctSpeciesCards(C,I);ctBgCard(C,I)}
registerSheetGroup({id:"core-traits",group:"late",phase:"post",order:10,reads:["i.B", "i.c", "i.L", "i.custom", "i.sp", "i.bg", "i.SRC", "i.r14", "q.allFeats", "q.sdn", "q.subLbl", "q.subLv", "C.features", "C.skills", "C.speed"],writes:["C.features"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;coreTraits(C,I,Q);
  return ctx.patch()}});
registerSheetGroup({id:"acts",group:"late",phase:"post",order:20,reads:["i.B", "i.a", "i.feats", "i.attMax", "i.SRC", "C.acts", "C.attacks", "C.features", "C.xdmg", "q.dmapRow", "q.byOk", "i.ATT", "q.itemInUse", "q.subAt", "q.spItemB", "q.spItemSrc", "q.baseOf"],writes:["C.acts", "C.features", "C.attacks", "C.xdmg"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const {B,a,feats,attMax,SRC}=I;C.acts=actsFor(C,I,Q);if(!C.acts.length)delete C.acts;actAtk(C,I,Q);
  return ctx.patch()}});
function bkClsMin(P,cl){const o=P["class"][cl]||{},v=Object.keys(o).map((k) =>{return o[k]});return v.length?Math.min.apply(null,v):null}
function bkClass(P,B,mm,n,it){const cl=mm?mm[1]:B.cls,co=P["class"][cl]||{},sb=mm&&mm[2]?P.subclass[cl+"|"+mm[2]]:null;return co[n]||co[n.split(":")[0]]||(sb&&sb[n])||(/^(Ability Score Improvement|Epic Boon)$/.test(n)?P.feat[n]:null)||((/^Core /.test(n)||n==="Spell Slots"||/ table$/.test(it.s||""))?bkClsMin(P,cl):null)}
function bkPage(P,B,gg,mm,it){const n=it.n;let pg=null;
   if(/^Species: /.test(gg)){const so=P.species[B.species];if(so)pg=so[n]||so._}
   else if(gg===B.cls||mm)pg=bkClass(P,B,mm,n,it)
   else if(gg.indexOf(B.cls+" Subclass: ")===0){const so2=P.subclass[B.cls+"|"+B.sub];if(so2)pg=so2[n]||so2._}
   else if(gg==="Feats")pg=P.feat[n];
   else if(/^Background: /.test(gg))pg=P.background[B.bg];
   else if(gg==="Eldritch Invocations")pg=P.invocation[n];
   else if(gg==="Metamagic Options")pg=(P["class"].Sorcerer||{}).Metamagic;
   return pg}
function bkFeatures(P,B,C){C.features.forEach((g) =>{const gg=g.g,mm=/^(\w+) \(multiclass \d+\)(?:: (.+))?$/.exec(gg);(g.items||[]).forEach((it) =>{if(it.pg||!/^PHB-2024/.test(it.s||""))return;const pg=bkPage(P,B,gg,mm,it);if(pg)it.pg=pg})})}
registerSheetGroup({id:"book-pages",group:"late",phase:"post",order:30,reads:["i.B", "q.dmapRow", "C.features", "C.inv", "C.spells"],writes:["C.features", "C.spells", "C.inv"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const {B}=I; const BP=bookPages();if(BP){const P=BP.phb;bkFeatures(P,B,C);
  (C.spells||[]).forEach((s) =>{const p=P.spell[s.n];if(p&&!s.hb)s.pg=p});
  (C.inv||[]).forEach((x) =>{const p=Q.dmapRow(x.n)&&BP.dmg.item[x.n];if(p)x.pg=p})}
 /* v33 p09: one entry per paragraph. A bold entry name that starts a sentence in the middle of a text starts a new paragraph (blank line). Your choice and Still open stay inline */
  return ctx.patch()}});
registerSheetGroup({id:"paragraph-breaks",group:"late",phase:"post",order:40,reads:["C.features"],writes:["C.features"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C; (C.features||[]).forEach((g) =>{(g.items||[]).forEach((f) =>{if(typeof f.d==="string")f.d=fBlk(f.d);if(typeof f.full==="string")f.full=fBlk(f.full)})});
  return ctx.patch()}});
registerSheetGroup({id:"edition-2014-book-names",group:"late",phase:"post",order:50,reads:["i.r14", "C.abilities", "C.ac", "C.actions", "C.acts", "C.attMax", "C.attacks", "C.bg", "C.bv", "C.camp", "C.cardNo", "C.carryBump", "C.cls", "C.clsLabel", "C.companion", "C.darkSrc", "C.darkvision", "C.dcAb", "C.dcSrc", "C.defenses", "C.equipNote", "C.exhMin", "C.features", "C.fxToggles", "C.gp", "C.grappler", "C.hitDie", "C.hpBonus", "C.hpPerLevel", "C.initBonus", "C.inv", "C.itemAdv", "C.lang", "C.level", "C.moves", "C.name", "C.office", "C.pasBon", "C.pbAdd", "C.profSrc", "C.profs", "C.res", "C.rolledNote", "C.rs", "C.saveBonus", "C.saveNotes", "C.saves", "C.senses", "C.size", "C.skills", "C.species", "C.speed", "C.speedSrc", "C.speeds", "C.spellcasting", "C.spells", "C.sub", "C.toolExp", "C.v", "C.wsForms", "C.xdmg"],writes:["C.v", "C.bv", "C.name", "C.species", "C.cls", "C.sub", "C.bg", "C.size", "C.office", "C.camp", "C.cardNo", "C.level", "C.hitDie", "C.hpPerLevel", "C.abilities", "C.rolledNote", "C.saves", "C.skills", "C.initBonus", "C.hpBonus", "C.grappler", "C.lang", "C.ac", "C.saveBonus", "C.attMax", "C.speed", "C.speedSrc", "C.rs", "C.darkvision", "C.darkSrc", "C.profs", "C.profSrc", "C.attacks", "C.inv", "C.gp", "C.equipNote", "C.res", "C.actions", "C.features", "C.defenses", "C.itemAdv", "C.speeds", "C.senses", "C.moves", "C.xdmg", "C.saveNotes", "C.wsForms", "C.companion", "C.spells", "C.spellcasting", "C.carryBump", "C.toolExp", "C.exhMin", "C.acts", "C.pasBon", "C.dcAb", "C.dcSrc", "C.clsLabel", "C.pbAdd", "C.fxToggles"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;const {r14}=I; if(I.r14)(function w(o){if(!o||typeof o!=="object")return;Object.keys(o).forEach((k) =>{const v=o[k];if(typeof v==="string"){if(v.indexOf("PHB-2024")>=0)o[k]=v.replace(/PHB-2024/g,"PHB-2014")}else w(v)})})(C);/* v85: the book of the 2014 rules */
  return ctx.patch()}});
registerSheetGroup({id:"pb-add",group:"late",phase:"post",order:60,reads:["q.getPbAdd", "C.pbAdd"],writes:["C.pbAdd"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C; if(Q.getPbAdd())C.pbAdd=Q.getPbAdd();/* fx engine v5: Proficiency Bonus added by pbAdd entries */
  return ctx.patch()}});
registerSheetGroup({id:"fx-toggles",group:"late",phase:"post",order:70,reads:["q.fxToggles", "C.fxToggles"],writes:["C.fxToggles"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C; C.fxToggles=Q.fxToggles();/* toggle fx available to this character; state is S.fxT on the sheet */
  return ctx.patch()}});

registerSheetGroup({id:"fx-target-controls",group:"late",phase:"post",order:71,reads:["q.fxTargets"],writes:["C.fxTargets"],
 run:function(ctx){const rows=ctx.q.fxTargets();if(rows.length)ctx.C.fxTargets=rows;return ctx.patch()}});

function appendAttackRider(r,x,source){const packet={d:x.d,t:x.t||"",s:source};if(x.roll===true)packet.roll=true;if(x.critD)packet.critD=x.critD;if(x.typeFrom==="weapon")packet.typeFrom="weapon";(r.xdice=r.xdice||[]).push(packet);const typeLabel=x.typeFrom==="weapon"?"of the weapon’s damage type":x.t;r.note=(r.note?r.note+" ":"")+"Extra damage: +"+x.d+(typeLabel?" "+typeLabel:"")+" ("+source+")."+(x.note?" "+x.note:"")}

function setAttackCriticalRange(row,value){const n=+value;if(Number.isInteger(n)&&n>=2&&n<=20)row.critRange=Math.min(row.critRange||20,n)}

/* A named weapon grants its rider to its own rows. Distinct weapon variants do
   not grant one another a second copy, and duplicate inventory rows do not stack
   one source entry. Separate entries/dice and thrown rows remain independent. */
function acceptItemWeaponEffect(ctx,Q,e,x,xi,row,field){if(e.kind!=="item")return true;
 const owner=e.owner,base=Q.baseOf(owner),when=Array.isArray(x.when)?x.when:[x.when];
 if(!weaponDef(base.b)||(!when.includes(owner)&&!when.includes(base.mi)))return true;
 if(row.n!==owner&&row.n!==owner+" (thrown)")return false;
 const keys=ctx.l.itemWeaponEffects||(ctx.l.itemWeaponEffects={}),key=JSON.stringify([owner,e.itemState||"used",e.idx,field,xi,ctx.C.attacks.indexOf(row)]);
 if(keys[key])return false;keys[key]=true;return true}
