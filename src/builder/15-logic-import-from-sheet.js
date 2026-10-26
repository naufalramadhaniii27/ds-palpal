/* ---------- import current sheet into builder ---------- */
/* L4: multiclass from the sheet label ("Fighter 4 / Rogue 1") and the "<Class> (multiclass N): <Subclass>" feature groups */
function mcFromSheet(C,main){var parts=String(C.clsLabel||"").split(" / ").map(function(p){var m=/^([A-Za-z]+)\s+(\d+)$/.exec(p.trim());return m?{cls:m[1],lv:+m[2]}:null});
 if(parts.length<2||!parts[0]||parts[0].cls!==main)return [];
 var subs={};(C.features||[]).forEach(function(g){var m=/^([A-Za-z]+) \(multiclass \d+\)(?:: (.+))?$/.exec(g.g||"");if(m)subs[m[1]]=m[2]||""});
 var out=[];parts.slice(1).forEach(function(p){if(!p||!CLASSES[p.cls]||p.cls===main||out.some(function(x){return x.cls===p.cls}))return;out.push({cls:p.cls,lv:Math.max(1,Math.min(20,p.lv)),sub:subs[p.cls]||""})});
 return out}
function fromSheet(st){var C=st.C,nb=clone(BLANK),miss=[];nb.name=C.name||"Character";if(C.rs==="2014"){nb.rs="2014";nb.bgMode="111"}/* v82 */nb.src=clone(B.src||{core:true,dmg:true});if((B.duelMode==="on"||B.duelMode==="off")&&B.name===C.name)nb.duelMode=B.duelMode;/* RL29: C does not store it. RL36 a: only for the same character */
 var spFull=String(C.species||""),sp=spFull.split(" (")[0],spRest=spFull.slice(sp.length);
 /* v74: species names may hold brackets ("Dragonborn (2014)", "Aasimar (Protector)"). Take the longest known name, the rest is the lineage */
 (function(){var best="";function chk(k){if(k&&k.length>best.length&&(spFull===k||spFull.indexOf(k+" (")===0))best=k}
  Object.keys(SPECIES).forEach(chk);if(window.WXSP)Object.keys(WXSP).forEach(function(id){Object.keys(WXSP[id]).forEach(chk)});allPacks().forEach(function(pk){if(pk.species)Object.keys(pk.species).forEach(chk)});
  if(best){sp=best;spRest=spFull.slice(best.length)}})();
 if(!SPECIES[sp]){allPacks().forEach(function(p){if(p.species&&p.species[sp])nb.src[p.id]=true})}
 /* v67: a species, background or subclass of a WotC source keeps its source on when the sheet is read back */
 if(window.WXSP)Object.keys(WXSP).forEach(function(id){if(WXSP[id][sp])nb.src[id]=true});if(window.WXBG)Object.keys(WXBG).forEach(function(id){if(WXBG[id][C.bg])nb.src[id]=true});if(window.WXS)WXS.forEach(function(x){if(x.name===C.sub&&x.cls===C.cls)nb.src[x.src]=true});/* v81: an option of the WotC class lists that the sheet shows keeps its source on */if(window.WXO){var fj=JSON.stringify(C.features||[]);Object.keys(WXO).forEach(function(id){var g=WXO[id];[].concat(g.inv||[],g.man||[],g.rn||[]).forEach(function(r){if(fj.indexOf('"n":"'+r[0]+'"')>=0||fj.indexOf("**"+r[0]+".**")>=0)nb.src[id]=true})})}/* v81: an instrument proficiency of the sheet keeps its source on */if(window.WXG)Object.keys(WXG).forEach(function(id){WXG[id].forEach(function(r){if(r[3]==="Musical Instrument"&&((C.profSrc||{}).tools||[]).some(function(q){return q[0]===r[0]}))nb.src[id]=true})});
 B=nb;applyPacks();
 if(SPECIES[sp]){B.species=sp;if(SPECIES[sp].opts){var so=[];(C.features||[]).forEach(function(g){(g.items||[]).forEach(function(f){SPECIES[sp].opts.list.forEach(function(o){if(f.n===o[0]&&so.indexOf(o[0])<0)so.push(o[0])})})});if(so.length)B.ch.spopt=so.slice(0,SPECIES[sp].opts.n)}var lm=/\(([^)]+)\)/.exec(spRest);if(lm&&SPECIES[sp].lin){var o=SPECIES[sp].lin.opts.filter(function(x){return x.indexOf(lm[1])===0})[0];if(o)B.ch.lin=o}/* v82: 2014 race ability picks come back from the race bonus on the sheet */if(C.rs==="2014"&&SPECIES[sp].asiFlex&&C.abilities){var f2=[],f1=[];Object.keys(C.abilities).forEach(function(k){var a=C.abilities[k],t=0;((a&&a.bonus)||[]).forEach(function(x){if(x.s===sp+" (race)")t+=x.v});if(t===2)f2.push(k);else if(t===1)f1.push(k)});if(f2.length===1&&f1.length===1){B.ch.rasi=f2;B.ch.rasi1=f1}else if(f1.length===3){B.ch.rasim="+1, +1, +1";B.ch.rasi=f1}}if(C.rs==="2014"&&SPECIES[sp].asiPick&&C.abilities){var rp=[];Object.keys(C.abilities).forEach(function(k){var a=C.abilities[k];if(a&&(a.bonus||[]).some(function(x){return x.s===sp+" (race)"})&&!(SPECIES[sp].asi&&SPECIES[sp].asi[k])&&rp.indexOf(k)<0)rp.push(k)});if(rp.length)B.ch.rasi=rp.slice(0,SPECIES[sp].asiPick.n)}}
 else{B.species="Custom";B.cSpecies={name:sp||"Custom",speed:+C.speed||30,dark:+C.darkvision||0,size:C.size||"Medium"};miss.push("species")}
 if(C.size)B.size=C.size;
 var cls=(C.cls||"").split(" ")[0];if(CLASSES[cls])B.cls=cls;else miss.push("class");
 /* L4: C.level is the total level. Split it with the sheet label "Fighter 4 / Rogue 1". The total stays authoritative */
 var tot=Math.max(1,Math.min(20,+C.level||1)),mcl=mcFromSheet(C,B.cls),ml=mcl.reduce(function(t,m){return t+m.lv},0);
 if(mcl.length&&tot-ml>=1){B.level=tot-ml;B.mc=mcl}else B.level=tot;
 if(C.sub){if(!CL().subs[C.sub])allPacks().forEach(function(p){if(p.subclasses&&p.subclasses[B.cls]&&p.subclasses[B.cls][C.sub]){B.src[p.id]=true}});applyPacks();if(CL().subs[C.sub])B.sub=C.sub;else{B.sub="__custom";B.cSub=C.sub}}
 if(B.mc){B.mc.forEach(function(m){if(m.sub&&!CLASSES[m.cls].subs[m.sub])allPacks().forEach(function(p){if(p.subclasses&&p.subclasses[m.cls]&&p.subclasses[m.cls][m.sub])B.src[p.id]=true})});
  applyPacks();B.mc.forEach(function(m){if(m.sub&&!CLASSES[m.cls].subs[m.sub]){m.sub="";miss.push("multiclass subclass")}})}
 if(!BACKGROUNDS[C.bg]&&window.WXBG)Object.keys(WXBG).forEach(function(id){if(WXBG[id][C.bg]){B.src[id]=true;BACKGROUNDS[C.bg]=WXBG[id][C.bg]}});/* v67 */
 if(BACKGROUNDS[C.bg])B.bg=C.bg;else miss.push("background");
 ABK.forEach(function(k){var a=(C.abilities||{})[k];if(a)B.base[k]=+a.base||10});
 var bgb=[];ABK.forEach(function(k){((C.abilities[k]||{}).bonus||[]).forEach(function(b){if(B.bg&&b.s.indexOf(B.bg)===0)bgb.push([k,+b.v])})});
 if(C.rs==="2014")B.bgMode="111";else if(bgb.length===3)B.bgMode="111";else{B.bgMode="21";bgb.forEach(function(x){if(x[1]===2)B.bg2=x[0];if(x[1]===1)B.bg1=x[0]})}
 var feats=[];(C.features||[]).forEach(function(g){(g.items||[]).forEach(function(f){feats.push({g:g.g,n:f.n,s:f.s||"",d:f.d||""})})});
 feats.forEach(function(f){var fs=/^Fighting Style:\s*(.+)$/.exec(f.n);if(fs&&FEATS[fs[1].trim()])B.ch["fs"+(CL().fs||1)]=fs[1].trim();var yc=/You chose \*\*([^*]+)\*\*/.exec(f.d);if(f.n==="Fighting Style"&&yc&&FEATS[yc[1]])B.ch["fs"+(CL().fs||1)]=yc[1];
  if(f.n==="Weapon Mastery"){var w=[];Object.keys(WEAPONS).forEach(function(n){if(new RegExp("\\b"+n.replace(/[-]/g,"\\-")+"\\b").test(f.d))w.push(n)});if(w.length)B.ch.wm=w.slice(0,(CL().wm||[])[B.level-1]||w.length)}});
 var okLv=asiLevels().concat([19]);feats.filter(function(f){return /^Feats/.test(f.g)}).forEach(function(f){var FD=FEATS[f.n];if(!FD)return;var lv=/(?:Fighter|Barbarian|Bard|Cleric|Druid|Monk|Paladin|Ranger|Rogue|Sorcerer|Warlock|Wizard)\s+(\d+)/.exec(f.s);
  /* L5: the Fighting Style row (cat F/X) has source "<Class> <fs>" (level 1 or 2). That is not an ASI slot. Only levels in asiLevels() or 19 may become a featN key. A category F feat taken in an ASI slot (Fighter 4: Archery) is still read */
  if(lv&&(FD.cat==="F"||FD.cat==="X")&&okLv.indexOf(+lv[1])<0)return;
  if(/Origin/i.test(f.s)&&BACKGROUNDS[B.bg]&&(BACKGROUNDS[B.bg].feat===f.n||((BACKGROUNDS[B.bg].featOpts||[]).indexOf(f.n)>=0&&f.s.indexOf(B.bg)>=0))){if(BACKGROUNDS[B.bg].feat!==f.n)B.ch.bgfeatc=f.n;return}/* v67 */
  if(/Origin/i.test(f.s)){B.ch.spfeat=f.n;return}
  if(lv){var o={feat:f.n};ABK.forEach(function(k){((C.abilities[k]||{}).bonus||[]).forEach(function(b){if(b.s.indexOf(f.n)===0){if(!o.a1)o.a1=k;else o.a2=k;if(+b.v===2){o.a1=k;o.a2=k}}})});if(FEATS[f.n].asi&&!FEATS[f.n].asi2&&o.a2)delete o.a2;B.ch["feat"+lv[1]]=o}});
 (C.skills||[]).forEach(function(s){if(s.p&&/Cunning Eye/i.test(s.src||""))B.ch.sccunning=[s.n]});
 var ck=[];(C.skills||[]).forEach(function(s){if(s.p&&/class skill/i.test(s.src||""))ck.push(s.n)});if(ck.length)B.ch.clsk=ck;
 /* v70: the skill and tool picks of a 2014 background are read back from the sheet */
 (function(){var bx=BACKGROUNDS[B.bg];if(!bx)return;if(bx.skPick){var bs=[];(C.skills||[]).forEach(function(q){if(q.p&&String(q.src||"").indexOf(B.bg+" skill")===0)bs.push(q.n)});if(bs.length)B.ch.bgsk=bs.slice(0,bx.skPick.n)}
  if(bx.toolPick){var all=[];bx.toolPick.cats.forEach(function(k){all=all.concat(TOOLS[k]||[])});var fx=(bx.toolFix||"").split(/,\s*/),bt=[];((C.profSrc||{}).tools||[]).forEach(function(q){if(q[1]===B.bg&&all.indexOf(q[0])>=0&&fx.indexOf(q[0])<0)bt.push(q[0])});if(bt.length)B.ch.bgTool=bt.slice(0,bx.toolPick.n)}})();
 /* v81: the tool pick of the class (Bard instruments, Monk tool) comes back from the proficiency sources of the sheet */
  (function(){var tp=CL().toolPick;if(!tp)return;var all=[];tp.cats.forEach(function(k){all=all.concat(TOOLS[k]||[])});var ct=[];((C.profSrc||{}).tools||[]).forEach(function(q){if(q[1]===B.cls&&all.indexOf(q[0])>=0&&ct.indexOf(q[0])<0)ct.push(q[0])});if(ct.length)B.ch.clsTool=ct.slice(0,tp.n)})();
  B.inv=(C.inv||[]).map(function(x){var n=x.n,al=null;if(!(WEAPONS[baseOf(n).b]||ARMOR[baseOf(n).b]||n==="Shield"||DMAP[n]||itemCost(n)!=null||itemCost(baseOf(n).b)!=null)){/* v32 RU134 */var pm=/\(([^)]+)\)/.exec(n);if(pm&&(WEAPONS[pm[1]]||ARMOR[pm[1]]||itemCost(pm[1])!=null)){al=n;n=pm[1]}}var o={n:n,q:qOf(x),eq:!!x.eq||!!WEAPONS[baseOf(n).b]};if(al)o.alias=al;if(x.in)o.in=x.in;/* v32 RU134 */return o});B.eqC="none";B.eqB="none";B.gpOverride=C.gp!=null?C.gp:null;
 var lg=(st.lang||C.lang||[]).filter(function(x){return x&&x!=="Common"&&x!=="Druidic"&&x!=="Thieves' Cant"});if(lg.length)B.ch.lang=lg.slice(0,C.rs==="2014"?9:2);
 applyPacks();if(C.rs==="2014"&&B.ch.lang){var sx=SPECIES[B.species],bx=BACKGROUNDS[B.bg],fxl=((sx&&sx.lgf)||[]).concat((bx&&bx.lgf)||[]),nn=((sx&&sx.lgn)||0)+((bx&&bx.lgn)||0);B.ch.lang=B.ch.lang.filter(function(x){return fxl.indexOf(x)<0}).slice(0,nn);if(!B.ch.lang.length)delete B.ch.lang}/* v84 */
 /* v79: the choices of the subclass (Hunter's Prey, Land Type, maneuvers, War Bond, Evocation Savant and so on) come back from the sheet. The feature text holds them after "Your choice." */
 (function(){var cs=[];try{cs=choices()}catch(e){return}
  var by={},rd=function(f){var d=f.d||"",m=/\*\*Your choice\.\*\*\s*([^\n]*?)\.(?:\s|$)/.exec(d);/* the names end at the first full stop. Text such as "At your level" may follow */return m?m[1].split(/,\s*/).map(function(x){return x.replace(/\.$/,"").trim()}).filter(Boolean):[]};
  var fs=[];(C.features||[]).forEach(function(g){(g.items||[]).forEach(function(f){if(f.s)fs.push(f)})});
  /* Eldritch Invocations: the names of the group "Eldritch Invocations" fill the invocation picks in order */
  (function(){var iv=[];(C.features||[]).forEach(function(g){if(g.g==="Eldritch Invocations")(g.items||[]).forEach(function(f){if(iv.indexOf(f.n)<0&&INVOCATIONS.some(function(r){return r[0]===f.n}))iv.push(f.n)})});if(!iv.length)return;var i=0;
   cs.forEach(function(c){if(c.t!=="multi"||c.list!==INVOCATIONS||c.mc!=null)return;var part=iv.slice(i,i+(c.n||1));i+=part.length;if(part.length)B.ch[c.key]=part})})();
  cs.forEach(function(c){var sb=c.mc!=null?(B.mc&&B.mc[c.mc]||{}).sub:B.sub;if(!sb||sb==="__custom"||!c.src||c.src.indexOf(sb)<0||/^(m\d+:)?sc/.test(c.key))return;if(c.t!=="multi"&&c.t!=="opt"&&c.t!=="skills"&&c.t!=="tool")return;
   var pool=c.list&&typeof c.list!=="string"?c.list.map(function(x){return Array.isArray(x)?x[0]:x}):c.list?(OPTS[c.list]||[]).map(function(x){return x[0]}):(c.from||[]).map(function(x){return Array.isArray(x)?x[0]:x});if(c.t==="tool"){pool=[];(c.cats||[]).forEach(function(k){pool=pool.concat(TOOLS[k]||[])})}if(!pool.length)return;
   var got=[];
   if(c.t==="tool"){var al=[];(c.cats||[]).forEach(function(k){al=al.concat(TOOLS[k]||[])});((C.profSrc||{}).tools||[]).forEach(function(q){if((q[1]===c.feature||q[1]===c.title)&&al.indexOf(q[0])>=0&&got.indexOf(q[0])<0)got.push(q[0])})}
   else if(c.t==="skills"){var tg=sb+" "+c.lvl;(C.skills||[]).forEach(function(k){if(k.p&&(k.src||"").indexOf(tg)>=0&&pool.indexOf(k.n)>=0)got.push(k.n)})}
   else{var fk=/maneuver$/.test(c.key)?"Maneuvers known":c.feature,f=fs.filter(function(x){return x.n===fk&&x.s.indexOf(sb)>=0})[0];if(!f&&c.t!=="opt")return;if(!f)f={d:""};
    if(fk==="Maneuvers known"){var mm=[],re=/\*\*([^*]+?)\.\*\*/g,q;while((q=re.exec(f.d||"")))mm.push(q[1]);got=mm.filter(function(n){return pool.indexOf(n)>=0})}else got=rd(f).filter(function(n){return pool.indexOf(n)>=0})}
   if(!got.length&&c.t==="opt"){var tg2=sb+" "+c.lvl;(C.defenses||[]).forEach(function(d){if((d.s||"").indexOf(tg2)>=0)(d.v||[]).forEach(function(v){if(pool.indexOf(v)>=0&&got.indexOf(v)<0)got.push(v)})})}/* the pick shows only as a resistance (Elemental Affinity) */
   var tk=c.t+":"+(c.mc!=null?c.mc+":":"")+(c.feature||c.key);by[tk]=by[tk]||{g:got,i:0};var part=c.t==="skills"?got:by[tk].g.slice(by[tk].i,by[tk].i+(c.n||1));by[tk].i+=part.length;
   var seen=[];Object.keys(B.ch).forEach(function(k){if(k!==c.key&&/maneuver$/.test(k)===/maneuver$/.test(c.key)&&Array.isArray(B.ch[k]))seen=seen.concat(B.ch[k])});
   part=part.filter(function(n){return seen.indexOf(n)<0});if(part.length)B.ch[c.key]=part.slice(0,c.n||1)})})();
 /* v79: the spells chosen in Manage Spells (use Prepared or Cantrip, source = the class) come back as builder picks, so Apply keeps them */
 (function(){var cp=[];try{cp=casterParts()}catch(e){}if(!cp.length)return;var first=cp[0].cls,have={};B.sp=[];delete B.spm;
  (C.spells||[]).forEach(function(x){if(!/^(Prepared|Cantrip)$/.test(x.use||""))return;var cl=x.src;if(!cp.some(function(p){return p.cls===cl}))return;var k=cl+"|"+x.n;if(have[k])return;have[k]=1;
   if(cl===first)B.sp.push(x.n);else{B.spm=B.spm||{};(B.spm[cl]=B.spm[cl]||[]).push(x.n)}});
  /* the source of a picked spell must be on before its row can be found */
  try{wxGate()}catch(e){}SPX=null;
  B.sp=B.sp.filter(function(n){return !!spRec(n)});if(B.spm)Object.keys(B.spm).forEach(function(c){B.spm[c]=B.spm[c].filter(function(n){return !!spRec(n)});if(!B.spm[c].length)delete B.spm[c]})})();
 return miss}
