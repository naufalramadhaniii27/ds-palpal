import {genv} from "./00-env.js";
import {ABK,clone} from "./01-logic-core-helpers.js";
import {BLANK,DMAP} from "./03-logic-magic-item-effects.js";
import {B,__set_B} from "./04-logic-storage.js";
import {CL} from "./05-logic-choice-model-ruleset.js";
import {asiLevels,choices} from "./09-logic-feats-and-choices.js";import {wxGate} from "./09d-logic-wotc-source-gate.js";
import {SPX,__set_SPX,casterParts,spRec} from "./11-logic-derivation.js";
import {allPacks,applyPacks} from "./13-logic-sources-and-packs.js";
import {baseOf,itemCost,qOf} from "./14-logic-multiclass-hp-shop.js";
/* ---------- import current sheet into builder ---------- */
/* L4: multiclass from the sheet label ("Fighter 4 / Rogue 1") and the "<Class> (multiclass N): <Subclass>" feature groups */
function mcFromSheet(C,main){const parts=String(C.clsLabel||"").split(" / ").map((p) =>{const m=/^([A-Za-z]+)\s+(\d+)$/.exec(p.trim());return m?{cls:m[1],lv:+m[2]}:null});
 if(parts.length<2||!parts[0]||parts[0].cls!==main)return [];
 const subs={};(C.features||[]).forEach((g) =>{const m=/^([A-Za-z]+) \(multiclass \d+\)(?:: (.+))?$/.exec(g.g||"");if(m)subs[m[1]]=m[2]||""});
 const out=[];parts.slice(1).forEach((p) =>{if(!p||!CLASSES[p.cls]||p.cls===main||out.some((x) =>{return x.cls===p.cls}))return;out.push({cls:p.cls,lv:Math.max(1,Math.min(20,p.lv)),sub:subs[p.cls]||""})});
 return out}
function fsBestSpecies(spFull){let best="";function chk(k){if(k&&k.length>best.length&&(spFull===k||spFull.indexOf(k+" (")===0))best=k}
  Object.keys(SPECIES).forEach(chk);if(genv.WXSP)Object.keys(WXSP).forEach((id) =>{Object.keys(WXSP[id]).forEach(chk)});allPacks().forEach((pk) =>{if(pk.species)Object.keys(pk.species).forEach(chk)});
 return best}
function fsSrcSpecies(nb,C,sp){if(genv.WXSP)Object.keys(WXSP).forEach((id) =>{if(WXSP[id][sp])nb.src[id]=true});if(genv.WXBG)Object.keys(WXBG).forEach((id) =>{if(WXBG[id][C.bg])nb.src[id]=true});if(genv.WXS)WXS.forEach((x) =>{if(x.name===C.sub&&x.cls===C.cls)nb.src[x.src]=true});}
function fsSrcOptions(nb,C){/* v81: an option of the WotC class lists that the sheet shows keeps its source on */if(genv.WXO){const fj=JSON.stringify(C.features||[]);Object.keys(WXO).forEach((id) =>{const g=WXO[id];[].concat(g.inv||[],g.man||[],g.rn||[]).forEach((r) =>{if(fj.indexOf('"n":"'+r[0]+'"')>=0||fj.indexOf("**"+r[0]+".**")>=0)nb.src[id]=true})})}/* v81: an instrument proficiency of the sheet keeps its source on */if(genv.WXG)Object.keys(WXG).forEach((id) =>{WXG[id].forEach((r) =>{if(r[3]==="Musical Instrument"&&((C.profSrc||{}).tools||[]).some((q) =>{return q[0]===r[0]}))nb.src[id]=true})});}
function fsSpOpts(sp,C){if(SPECIES[sp].opts){const so=[];(C.features||[]).forEach((g) =>{(g.items||[]).forEach((f) =>{SPECIES[sp].opts.list.forEach((o) =>{if(f.n===o[0]&&so.indexOf(o[0])<0)so.push(o[0])})})});if(so.length)B.ch.spopt=so.slice(0,SPECIES[sp].opts.n)}}
function fsSpLin(sp,spRest){const lm=/\(([^)]+)\)/.exec(spRest);if(lm&&SPECIES[sp].lin){const o=SPECIES[sp].lin.opts.filter((x) =>{return x.indexOf(lm[1])===0})[0];if(o)B.ch.lin=o}}
function fsSpAsiFlex(sp,C){/* v82: 2014 race ability picks come back from the race bonus on the sheet */if(C.rs==="2014"&&SPECIES[sp].asiFlex&&C.abilities){const f2=[],f1=[];Object.keys(C.abilities).forEach((k) =>{let a=C.abilities[k],t=0;((a&&a.bonus)||[]).forEach((x) =>{if(x.s===sp+" (race)")t+=x.v});if(t===2)f2.push(k);else if(t===1)f1.push(k)});if(f2.length===1&&f1.length===1){B.ch.rasi=f2;B.ch.rasi1=f1}else if(f1.length===3){B.ch.rasim="+1, +1, +1";B.ch.rasi=f1}}}
function fsSpAsiPick(sp,C){if(C.rs==="2014"&&SPECIES[sp].asiPick&&C.abilities){const rp=[];Object.keys(C.abilities).forEach((k) =>{const a=C.abilities[k];if(a&&(a.bonus||[]).some((x) =>{return x.s===sp+" (race)"})&&!(SPECIES[sp].asi&&SPECIES[sp].asi[k])&&rp.indexOf(k)<0)rp.push(k)});if(rp.length)B.ch.rasi=rp.slice(0,SPECIES[sp].asiPick.n)}}
function fsBgPicks(C){const bx=BACKGROUNDS[B.bg];if(!bx)return;if(bx.skPick){const bs=[];(C.skills||[]).forEach((q) =>{if(q.p&&String(q.src||"").indexOf(B.bg+" skill")===0)bs.push(q.n)});if(bs.length)B.ch.bgsk=bs.slice(0,bx.skPick.n)}
  if(bx.toolPick){let all=[];bx.toolPick.cats.forEach((k) =>{all=all.concat(TOOLS[k]||[])});const fx=(bx.toolFix||"").split(/,\s*/),bt=[];((C.profSrc||{}).tools||[]).forEach((q) =>{if(q[1]===B.bg&&all.indexOf(q[0])>=0&&fx.indexOf(q[0])<0)bt.push(q[0])});if(bt.length)B.ch.bgTool=bt.slice(0,bx.toolPick.n)}}
function fsClassTool(C){const tp=CL().toolPick;if(!tp)return;let all=[];tp.cats.forEach((k) =>{all=all.concat(TOOLS[k]||[])});const ct=[];((C.profSrc||{}).tools||[]).forEach((q) =>{if(q[1]===B.cls&&all.indexOf(q[0])>=0&&ct.indexOf(q[0])<0)ct.push(q[0])});if(ct.length)B.ch.clsTool=ct.slice(0,tp.n)}
function fsInvRow(x){let n=x.n,al=null;if(!(WEAPONS[baseOf(n).b]||ARMOR[baseOf(n).b]||n==="Shield"||DMAP[n]||itemCost(n)!=null||itemCost(baseOf(n).b)!=null)){/* v32 RU134 */const pm=/\(([^)]+)\)/.exec(n);if(pm&&(WEAPONS[pm[1]]||ARMOR[pm[1]]||itemCost(pm[1])!=null)){al=n;n=pm[1]}}const o={n:n,q:qOf(x),eq:!!x.eq||!!WEAPONS[baseOf(n).b]};if(al)o.alias=al;if(x.in)o.in=x.in;/* v32 RU134 */if(x.mw)o.mw=1;if(x.px)o.px=x.px;return o}
/* v79: the choices of the subclass (Hunter's Prey, Land Type, maneuvers, War Bond, Evocation Savant and so on) come back from the sheet. The feature text holds them after "Your choice." One function per pick type (tool, skills, named list, resistance) and one per step */
function fsRd(f){const d=f.d||"",m=/\*\*Your choice\.\*\*\s*([^\n]*?)\.(?:\s|$)/.exec(d);/* the names end at the first full stop. Text such as "At your level" may follow */return m?m[1].split(/,\s*/).map((x) =>{return x.replace(/\.$/,"").trim()}).filter(Boolean):[]}
/* Eldritch Invocations: the names of the group "Eldritch Invocations" fill the invocation picks in order */
function fsInvPicks(C,cs){const iv=[];(C.features||[]).forEach((g) =>{if(g.g==="Eldritch Invocations")(g.items||[]).forEach((f) =>{if(iv.indexOf(f.n)<0&&INVOCATIONS.some((r) =>{return r[0]===f.n}))iv.push(f.n)})});if(!iv.length)return;let i=0;
 cs.forEach((c) =>{if(c.t!=="multi"||c.list!==INVOCATIONS||c.mc!=null)return;const part=iv.slice(i,i+(c.n||1));i+=part.length;if(part.length)B.ch[c.key]=part})}
function fsToolPool(c){let al=[];(c.cats||[]).forEach((k) =>{al=al.concat(TOOLS[k]||[])});return al}
function fsPool(c){let pool=c.list&&typeof c.list!=="string"?c.list.map((x) =>{return Array.isArray(x)?x[0]:x}):c.list?(OPTS[c.list]||[]).map((x) =>{return x[0]}):(c.from||[]).map((x) =>{return Array.isArray(x)?x[0]:x});if(c.t==="tool")pool=fsToolPool(c);return pool}
function fsGotTool(C,c){const got=[],al=fsToolPool(c);((C.profSrc||{}).tools||[]).forEach((q) =>{if((q[1]===c.feature||q[1]===c.title)&&al.indexOf(q[0])>=0&&got.indexOf(q[0])<0)got.push(q[0])});return got}
function fsGotSkills(C,c,sb,pool){const got=[],tg=sb+" "+c.lvl;(C.skills||[]).forEach((k) =>{if(k.p&&(k.src||"").indexOf(tg)>=0&&pool.indexOf(k.n)>=0)got.push(k.n)});return got}
/* named list: the feature text of the subclass. Returns null when the feature row is missing (skip the pick) */
function fsGotNamed(c,sb,pool,fs){let fk=/maneuver$/.test(c.key)?"Maneuvers known":c.feature,f=fs.filter((x) =>{return x.n===fk&&x.s.indexOf(sb)>=0})[0];if(!f&&c.t!=="opt")return null;if(!f)f={d:""};
 if(fk==="Maneuvers known"){let mm=[],re=/\*\*([^*]+?)\.\*\*/g,q;while((q=re.exec(f.d||"")))mm.push(q[1]);return mm.filter((n) =>{return pool.indexOf(n)>=0})}return fsRd(f).filter((n) =>{return pool.indexOf(n)>=0})}
/* the pick shows only as a resistance (Elemental Affinity) */
function fsGotDefense(C,c,sb,pool,got){const tg2=sb+" "+c.lvl;(C.defenses||[]).forEach((d) =>{if((d.s||"").indexOf(tg2)>=0)(d.v||[]).forEach((v) =>{if(pool.indexOf(v)>=0&&got.indexOf(v)<0)got.push(v)})})}
function fsGot(C,c,sb,pool,fs){let got;
 if(c.t==="tool")got=fsGotTool(C,c);
 else if(c.t==="skills")got=fsGotSkills(C,c,sb,pool);
 else{got=fsGotNamed(c,sb,pool,fs);if(got===null)return null}
 if(!got.length&&c.t==="opt")fsGotDefense(C,c,sb,pool,got);
 return got}
function fsSeen(c){let seen=[];Object.keys(B.ch).forEach((k) =>{if(k!==c.key&&/maneuver$/.test(k)===/maneuver$/.test(c.key)&&Array.isArray(B.ch[k]))seen=seen.concat(B.ch[k])});return seen}
function fsSubOf(c){return c.mc!=null?(B.mc&&B.mc[c.mc]||{}).sub:B.sub}
function fsSubFits(c,sb){if(!sb||sb==="__custom"||!c.src||c.src.indexOf(sb)<0||/^(m\d+:)?sc/.test(c.key))return false;return c.t==="multi"||c.t==="opt"||c.t==="skills"||c.t==="tool"}
function fsSubPick(C,c,fs,by){const sb=fsSubOf(c);if(!fsSubFits(c,sb))return;
 const pool=fsPool(c);if(!pool.length)return;
 const got=fsGot(C,c,sb,pool,fs);if(got===null)return;
 const tk=c.t+":"+(c.mc!=null?c.mc+":":"")+(c.feature||c.key);by[tk]=by[tk]||{g:got,i:0};let part=c.t==="skills"?got:by[tk].g.slice(by[tk].i,by[tk].i+(c.n||1));by[tk].i+=part.length;
 const seen=fsSeen(c);part=part.filter((n) =>{return seen.indexOf(n)<0});if(part.length)B.ch[c.key]=part.slice(0,c.n||1)}
function fsSubPicks(C){let cs=[];try{cs=choices()}catch(e){return}
 const by={},fs=[];(C.features||[]).forEach((g) =>{(g.items||[]).forEach((f) =>{if(f.s)fs.push(f)})});
 fsInvPicks(C,cs);
 cs.forEach((c) =>{fsSubPick(C,c,fs,by)})}
function fsSpellPicks(C){let cp=[];try{cp=casterParts()}catch(e){}if(!cp.length)return;const first=cp[0].cls,have={};B.sp=[];delete B.spm;
  (C.spells||[]).forEach((x) =>{if(!/^(Prepared|Cantrip)$/.test(x.use||""))return;const cl=x.src;if(!cp.some((p) =>{return p.cls===cl}))return;const k=cl+"|"+x.n;if(have[k])return;have[k]=1;
   if(cl===first)B.sp.push(x.n);else{B.spm=B.spm||{};(B.spm[cl]=B.spm[cl]||[]).push(x.n)}});
  /* the source of a picked spell must be on before its row can be found */
  try{wxGate()}catch(e){}__set_SPX(null);
  B.sp=B.sp.filter((n) =>{return !!spRec(n)});if(B.spm)Object.keys(B.spm).forEach((c) =>{B.spm[c]=B.spm[c].filter((n) =>{return !!spRec(n)});if(!B.spm[c].length)delete B.spm[c]})}
/* fromSheet steps (SOLID s16). C is the sheet data, miss the parts it could not read */
function fsHead(st,C){const nb=clone(BLANK);nb.name=C.name||"Character";nb.camp=String((typeof st.camp==="string")?st.camp:(C.camp||C.office||"")).trim();if(C.rs==="2014"){nb.rs="2014";nb.bgMode="111"}/* v82 */nb.src=clone(B.src||{core:true,dmg:true});if((B.duelMode==="on"||B.duelMode==="off")&&B.name===C.name)nb.duelMode=B.duelMode;/* RL29: C does not store it. RL36 a: only for the same character */return nb}
function fsSpName(C,nb){let spFull=String(C.species||""),sp=spFull.split(" (")[0],spRest=spFull.slice(sp.length);
 /* v74: species names may hold brackets ("Dragonborn (2014)", "Aasimar (Protector)"). Take the longest known name, the rest is the lineage */
 const spBest=fsBestSpecies(spFull);if(spBest){sp=spBest;spRest=spFull.slice(spBest.length)}
 if(!SPECIES[sp]){allPacks().forEach((p) =>{if(p.species&&p.species[sp])nb.src[p.id]=true})}
 return {sp:sp,spRest:spRest}}
function fsSpecies(sp,spRest,C,miss){
 if(SPECIES[sp]){B.species=sp;fsSpOpts(sp,C);fsSpLin(sp,spRest);fsSpAsiFlex(sp,C);fsSpAsiPick(sp,C)}
 else{B.species="Custom";B.cSpecies={name:sp||"Custom",speed:+C.speed||30,dark:+C.darkvision||0,size:C.size||"Medium"};miss.push("species")}}
/* L4: C.level is the total level. Split it with the sheet label "Fighter 4 / Rogue 1". The total stays authoritative */
function fsLevel(C){const tot=Math.max(1,Math.min(20,+C.level||1)),mcl=mcFromSheet(C,B.cls),ml=mcl.reduce((t,m) =>{return t+m.lv},0);
 if(mcl.length&&tot-ml>=1){B.level=tot-ml;B.mc=mcl}else B.level=tot}
function fsSub(C){if(C.sub){if(!CL().subs[C.sub])allPacks().forEach((p) =>{if(p.subclasses&&p.subclasses[B.cls]&&p.subclasses[B.cls][C.sub]){B.src[p.id]=true}});applyPacks();if(CL().subs[C.sub])B.sub=C.sub;else{B.sub="__custom";B.cSub=C.sub}}}
function fsMcSub(miss){if(B.mc){B.mc.forEach((m) =>{if(m.sub&&!CLASSES[m.cls].subs[m.sub])allPacks().forEach((p) =>{if(p.subclasses&&p.subclasses[m.cls]&&p.subclasses[m.cls][m.sub])B.src[p.id]=true})});
  applyPacks();B.mc.forEach((m) =>{if(m.sub&&!CLASSES[m.cls].subs[m.sub]){m.sub="";miss.push("multiclass subclass")}})}}
function fsBg(C,miss){
 if(!BACKGROUNDS[C.bg]&&genv.WXBG)Object.keys(WXBG).forEach((id) =>{if(WXBG[id][C.bg]){B.src[id]=true;BACKGROUNDS[C.bg]=WXBG[id][C.bg]}});/* v67 */
 if(BACKGROUNDS[C.bg])B.bg=C.bg;else miss.push("background")}
function fsScores(C){
 ABK.forEach((k) =>{const a=(C.abilities||{})[k];if(a)B.base[k]=+a.base||10});
 const bgb=[];ABK.forEach((k) =>{((C.abilities[k]||{}).bonus||[]).forEach((b) =>{if(B.bg&&b.s.indexOf(B.bg)===0)bgb.push([k,+b.v])})});
 if(C.rs==="2014")B.bgMode="111";else if(bgb.length===3)B.bgMode="111";else{B.bgMode="21";bgb.forEach((x) =>{if(x[1]===2)B.bg2=x[0];if(x[1]===1)B.bg1=x[0]})}}
function fsFeatRows(C){const feats=[];(C.features||[]).forEach((g) =>{(g.items||[]).forEach((f) =>{feats.push({g:g.g,n:f.n,s:f.s||"",d:f.d||""})})});return feats}
function fsStyleMastery(f){const fs=/^Fighting Style:\s*(.+)$/.exec(f.n);if(fs&&FEATS[fs[1].trim()])B.ch["fs"+(CL().fs||1)]=fs[1].trim();const yc=/You chose \*\*([^*]+)\*\*/.exec(f.d);if(f.n==="Fighting Style"&&yc&&FEATS[yc[1]])B.ch["fs"+(CL().fs||1)]=yc[1];
  if(f.n==="Weapon Mastery"){const w=[];Object.keys(WEAPONS).forEach((n) =>{if(new RegExp("\\b"+n.replace(/[-]/g,"\\-")+"\\b").test(f.d))w.push(n)});if(w.length)B.ch.wm=w.slice(0,(CL().wm||[])[B.level-1]||w.length)}}
function fsFeatAsi(C,f,lv){const o={feat:f.n};ABK.forEach((k) =>{((C.abilities[k]||{}).bonus||[]).forEach((b) =>{if(b.s.indexOf(f.n)===0){if(!o.a1)o.a1=k;else o.a2=k;if(+b.v===2){o.a1=k;o.a2=k}}})});if(FEATS[f.n].asi&&!FEATS[f.n].asi2&&o.a2)delete o.a2;B.ch["feat"+lv[1]]=o}
function fsFeatSlot(C,f,okLv){const FD=FEATS[f.n];if(!FD)return;const lv=/(?:Fighter|Barbarian|Bard|Cleric|Druid|Monk|Paladin|Ranger|Rogue|Sorcerer|Warlock|Wizard)\s+(\d+)/.exec(f.s);
  /* L5: the Fighting Style row (cat F/X) has source "<Class> <fs>" (level 1 or 2). That is not an ASI slot. Only levels in asiLevels() or 19 may become a featN key. A category F feat taken in an ASI slot (Fighter 4: Archery) is still read */
  if(lv&&(FD.cat==="F"||FD.cat==="X")&&okLv.indexOf(+lv[1])<0)return;
  if(/Origin/i.test(f.s)&&BACKGROUNDS[B.bg]&&(BACKGROUNDS[B.bg].feat===f.n||((BACKGROUNDS[B.bg].featOpts||[]).indexOf(f.n)>=0&&f.s.indexOf(B.bg)>=0))){if(BACKGROUNDS[B.bg].feat!==f.n)B.ch.bgfeatc=f.n;return}/* v67 */
  if(/Origin/i.test(f.s)){B.ch.spfeat=f.n;return}
  if(lv)fsFeatAsi(C,f,lv)}
function fsSkillPicks(C){
 (C.skills||[]).forEach((s) =>{if(s.p&&/Cunning Eye/i.test(s.src||""))B.ch.sccunning=[s.n]});
 const ck=[];(C.skills||[]).forEach((s) =>{if(s.p&&/class skill/i.test(s.src||""))ck.push(s.n)});if(ck.length)B.ch.clsk=ck}
function fsLang(st,C){const lg=(st.lang||C.lang||[]).filter((x) =>{return x&&x!=="Common"&&x!=="Druidic"&&x!=="Thieves' Cant"});if(lg.length)B.ch.lang=lg.slice(0,C.rs==="2014"?9:2)}
function fsLang14(C){if(C.rs==="2014"&&B.ch.lang){const sx=SPECIES[B.species],bx=BACKGROUNDS[B.bg],fxl=((sx&&sx.lgf)||[]).concat((bx&&bx.lgf)||[]),nn=((sx&&sx.lgn)||0)+((bx&&bx.lgn)||0);B.ch.lang=B.ch.lang.filter((x) =>{return fxl.indexOf(x)<0}).slice(0,nn);if(!B.ch.lang.length)delete B.ch.lang}/* v84 */}
export function fromSheet(st){const C=st.C,nb=fsHead(st,C),miss=[];
 const spn=fsSpName(C,nb),sp=spn.sp,spRest=spn.spRest;
 /* v67: a species, background or subclass of a WotC source keeps its source on when the sheet is read back */
 fsSrcSpecies(nb,C,sp);fsSrcOptions(nb,C);
 __set_B(nb);applyPacks();
 fsSpecies(sp,spRest,C,miss);
 if(C.size)B.size=C.size;
 const cls=(C.cls||"").split(" ")[0];if(CLASSES[cls])B.cls=cls;else miss.push("class");
 fsLevel(C);
 fsSub(C);
 fsMcSub(miss);
 fsBg(C,miss);
 fsScores(C);
 const feats=fsFeatRows(C);
 feats.forEach((f) =>{fsStyleMastery(f)});
 const okLv=asiLevels().concat([19]);feats.filter((f) =>{return /^Feats/.test(f.g)}).forEach((f) =>{fsFeatSlot(C,f,okLv)});
 fsSkillPicks(C);
 /* v70: the skill and tool picks of a 2014 background are read back from the sheet */
 fsBgPicks(C);
 /* v81: the tool pick of the class (Bard instruments, Monk tool) comes back from the proficiency sources of the sheet */
  fsClassTool(C);
  B.inv=(C.inv||[]).map((x) =>{return fsInvRow(x)});B.eqC="none";B.eqB="none";B.gpOverride=C.gp!=null?C.gp:null;
 fsLang(st,C);
 applyPacks();fsLang14(C);
 /* v79: the choices of the subclass (Hunter's Prey, Land Type, maneuvers, War Bond, Evocation Savant and so on) come back from the sheet. The feature text holds them after "Your choice." */
 fsSubPicks(C);
 /* v79: the spells chosen in Manage Spells (use Prepared or Cantrip, source = the class) come back as builder picks, so Apply keeps them */
 fsSpellPicks(C);
 return miss}
