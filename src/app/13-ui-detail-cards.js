/* ================= DETAIL (info) BUILDERS ================= */
function meta(c,s){ return '<div class="info-meta">'+(c?'<span class="info-cat">'+esc(c)+'</span>':'')+(s?'<span class="src">'+esc(s)+'</span>':'')+'</div>'; }
function tileBd(label,val,bd){ return '<button type="button" class="tile bd" data-bd="'+bd+'"><span class="k">'+label+'</span><span class="v" style="font-size:24px">'+val+'</span></button>'; }
function tileH(label,html){ return '<div class="tile"><span class="k">'+label+'</span><span class="v" style="font-size:15px">'+html+'</span></div>'; }
function tileS(label,val){ return '<div class="tile"><span class="k">'+label+'</span><span class="v" style="font-size:'+(String(val).length>8?'15px':'24px')+'">'+esc(val)+'</span></div>'; }
function featSpec(name){ var fs=C.features||[]; for(var g=0;g<fs.length;g++){ var it=fs[g].items||[]; for(var f=0;f<it.length;f++){ if(it[f].n===name) return "f:"+g+"."+f; } } return null; }
function grpSpec(kind){
  var fs=C.features||[], want={species:/species/i, bg:/background/i}[kind];
  for(var g=0;g<fs.length;g++){ var n=fs[g].g||"";
    if(want && want.test(n)) return "grp:"+g;
    if(kind==="class" && C.cls && n.trim().toLowerCase()===C.cls.trim().toLowerCase()) return "grp:"+g;
    if(kind==="sub" && C.sub && n.toLowerCase().indexOf(C.sub.toLowerCase())>=0) return "grp:"+g; }
  return null;
}
function resSpec(r){ if(r.k==="hd"||r.n==="Hit Dice") return "g:Hit Point Dice"; if(GLOSS[r.n]) return "g:"+r.n; return featSpec(r.f||r.n)||featSpec(r.n); }
function linkify(text){
  return esc(text).split(/(,\s*)/).map(function(part){
    var raw=part.replace(/&#39;/g,"'"), base=raw.replace(/\s*\(.*\)\s*$/,"").trim();
    return GLOSS[base] ? '<button type="button" class="lk" data-info="g:'+esc(base)+'">'+part+'</button>' : part;
  }).join("");
}
var NUM_MAP={"Armor Class":"ac","Initiative":"init","Speed":"speed","Proficiency Bonus":"pb","Hit Points":"hp","Carrying Capacity":"carry","Grapple":"dc","Shove":"dc","Passive Perception":"pas-per"};
/* v36 p14: one detail-card template (head, 4-cell strip, number blocks, body, At your level, use buttons, foot) */
var KW_LIST=["Temporary Hit Points","Opportunity Attack","Heroic Inspiration","Bonus Action","Hit Points","Short Rest","Long Rest","Saving Throw","Reaction","Advantage","Disadvantage","Concentration"].concat(STD_CONDS);
function kwChips(html){ var seen={}, depth=0;
  return String(html).split(/(<[^>]+>)/).map(function(p){
    if(p.charAt(0)==="<"){ if(/^<(button|a)[\s>]/i.test(p)) depth++; else if(/^<\/(button|a)>/i.test(p)) depth=Math.max(0,depth-1); return p; }
    if(depth||!p) return p;
    KW_LIST.forEach(function(k){ if(seen[k]||!GLOSS[k]) return; var re=new RegExp("\\b"+k+"\\b"); if(re.test(p)){ seen[k]=1; p=p.replace(re,'\u0001'+k+'\u0002'); } });
    return p.replace(/\u0001([^\u0002]+)\u0002/g,function(m,k){ return '<button type="button" class="lk kw" data-info="g:'+esc(k)+'">'+esc(k)+'</button>'; }); }).join(""); }
function fKind(f){ var k=Object.keys(ACTS).filter(function(q){ return q.split("|").pop()===f.n; })[0], a=k&&ACTS[k][0]; return a?({action:"Action",bonus:"Bonus Action",reaction:"Reaction",other:"Special"}[a[0]]||"Special"):"Passive"; }
function fKindIco(t){ return /^Bonus/.test(t)?"time-bonus":/^Reaction/.test(t)?"time-reaction":t==="Action"?"time-action":"time-long"; }
function dcItem(html){ var P={}, h=String(html||"");
  h=h.replace(/<dt>([^<]+)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g,function(m,k,v){ P[k]=v; return m; });
  var pick=P["Armor Class"]!=null?[["Armor Class","AC","ui-shield"],["Strength","Strength","ab-str"],["Stealth","Stealth","ui-stealth"],["Cost","Cost","ui-cost"]]:P["Damage"]!=null?[["Damage","Damage","hp-damage"],["Damage Type","Type","item-weapon"],["Proficient","Proficient","ui-prof"],["Cost","Cost","ui-cost"]]:[["Weight","Weight","ui-weight"],["Cost","Cost","ui-cost"]];
  var cells=[], rest=h; pick.forEach(function(q){ if(P[q[0]]==null) return; cells.push([q[2],q[1],P[q[0]],q[0]==="Damage Type"&&DT_ICON[String(P[q[0]]).replace(/<[^>]*>/g,"").trim().split(/[ ,]/)[0]]?svgI(DT_ICON[String(P[q[0]]).replace(/<[^>]*>/g,"").trim().split(/[ ,]/)[0]],"ico dc-ci",""):""]); var re=new RegExp("<dt>"+q[0]+"</dt>\\s*<dd>[\\s\\S]*?</dd>"); rest=rest.replace(re,""); });
  var kind=(/<i>([^<]{2,40})<\/i>/.exec(h)||[])[1]||"Item";
  rest=rest.replace(/<p>\s*<i>[^<]+<\/i>\s*<\/p>/,"");
  return {h:dcHead(ico(P["Armor Class"]!=null?"ui-shield":"ui-hand","isch"),esc(kind))+(cells.length?dcStrip(cells):""), rest:rest}; }
function dcHead(badge,sub){ return '<div class="dc-head"><span class="dc-badge">'+badge+'</span><div class="dc-sub">'+sub+'</div></div>'; }
function dcStrip(a,cls){ return '<div class="dc-strip'+(cls?' '+cls:'')+'">'+a.map(function(c){ return '<div class="dc-cell"><span class="dc-ico">'+(c[3]||ico(c[0],"dc-ci"))+'</span><div class="dc-tx"><small>'+esc(c[1])+'</small><b>'+c[2]+'</b></div></div>'; }).join("")+'</div>'; }/* v38 p11 */
function wCell(ik,lab,val,bd,raw){ var inner='<span class="dc-ico">'+(raw||ico(ik,"dc-ci"))+'</span><div class="dc-tx"><small>'+esc(lab)+'</small><b>'+val+'</b></div>'; return bd?'<button type="button" class="dc-cell bd" data-bd="'+bd+'">'+inner+'</button>':'<div class="dc-cell">'+inner+'</div>'; }/* v38 p14 */
function dcFoot(l,r){ return '<div class="dc-foot"><b>'+l+'</b><span>'+r+'</span></div>'; }

/* v38 p10: spTgt */
var SP_TGT_OVR={"Scorching Ray":"Multiple","Animate Dead":"Multiple","Create Undead":"Multiple","Speak with Dead":"Single","Find Traps":"Special","Dancing Lights":"Special","Prestidigitation":"Special","Thaumaturgy":"Special","Illusory Script":"Object","Create Food and Water":"Special","Teleportation Circle":"Special","Arcane Eye":"Special","Leomund's Secret Chest":"Object","Project Image":"Special","Arcane Gate":"Special","Gate":"Summon","Planar Ally":"Summon","Find Familiar":"Summon","Unseen Servant":"Summon","Phantom Steed":"Summon","Tenser's Floating Disk":"Summon","Mordenkainen's Faithful Hound":"Summon","Tasha's Bubbling Cauldron":"Object","Animate Objects":"Multiple","Passwall":"Special","Move Earth":"Special","Earthquake":"Special","Tsunami":"Special","Mirage Arcane":"Special","Guards and Wards":"Special","Forbiddance":"Special","Guardian of Faith":"Summon"};
/* spTgt: what a spell hits. k = Sphere, Cube, Cone, Line, Cylinder, Emanation (area, n = size in feet), Single, Multiple, Self, Touch, Object, Wall, Summon, Special */
function spTgt(x){ var rng=String(x.r||""), nm=x.n||"", t=String(x.full||x.sum||""), fx=x.fx||(typeof SPELL_FX!=="undefined"&&SPELL_FX[x.n])||null, a=fx&&fx.area, m, SH={sphere:"Sphere",cube:"Cube",cone:"Cone",line:"Line",cylinder:"Cylinder",emanation:"Emanation",hemisphere:"Sphere",square:"Cube"};
  if(SP_TGT_OVR[nm]) return {k:SP_TGT_OVR[nm]};
  if(/^(Wall of|Prismatic Wall|Blade Barrier|Wind Wall)/.test(nm)) return {k:"Wall"};
  if(/^(Summon|Conjure)\b/.test(nm)) return {k:"Summon"};
  if(a&&a[0]) return {k:a[0]==="Square"?"Cube":a[0],n:a[1]};
  m=/(\d+)[- ]foot(?:-radius|-high|-wide| radius)?[ -]*(Sphere|Cube|Cone|Line|Cylinder|Emanation|Hemisphere)/i.exec(rng+" . "+t); if(m) return {k:SH[m[2].toLowerCase()],n:+m[1]};
  m=/(Sphere|Cube|Cone|Line|Cylinder|Emanation)\b/.exec(rng); if(m) return {k:m[1]};
  var s=t.split(/(?<=[.!?])\s+/).slice(0,3).join(" ");
  if(/^Self\b/.test(rng)&&!/\b(creature|target|object)s?\b.{0,40}\b(you|of your choice|within|that you can see)/i.test(s)) return {k:"Self"};
  if(/\b(?:up to (?:\w+) |two |three |four |five |six |eight |ten |all |each |any number of )(?:willing |other |Humanoid |Beast |Undead )?(?:creatures|targets|Humanoids|allies|objects|Beasts)/i.test(s)||/\beach creature|\bcreatures? of your choice|\bone or two creatures|\btwo creatures/i.test(s)) return {k:"Multiple"};
  if(/\b(?:a|one|the|target) (?:willing |Medium or smaller |Large or smaller |Humanoid |Beast |Undead |Fey |Celestial |dead |living |unconscious |incapacitated )?(?:creature|target|Humanoid|Beast|Undead|ally)\b|\byou touch|\bone creature|\bone target|\bthe target|\ba target/i.test(s)) return {k:"Single"};
  if(/\b(?:an? |one |the )(?:\w+ )?(?:nonmagical |unattended |Tiny |Small |Medium |Large |Huge )*(?:object|weapon|item|door|container|rope|vessel)\b/i.test(s)) return {k:"Object"};
  if(/^Self/.test(rng)) return {k:"Self"};
  return {k:"Special"}; }
var TGT_LAB={Sphere:["Area","Sphere"],Cube:["Area","Cube"],Cone:["Area","Cone"],Line:["Area","Line"],Cylinder:["Area","Cylinder"],Emanation:["Area","Emanation"],Single:["Target","Single target"],Multiple:["Target","Multiple targets"],Self:["Target","Self"],Object:["Target","Object"],Wall:["Area","Wall"],Summon:["Effect","Summons a creature"],Special:["Effect","Special"]};
var TGT_SIZE={Sphere:" ft radius",Cube:" ft cube",Cone:" ft cone",Line:" ft long",Cylinder:" ft radius",Emanation:" ft from you"};
function spTgtCell(x){ var o=spTgt(x), L=TGT_LAB[o.k]||["Target",o.k], big=/^(Sphere|Cube|Cone|Line|Cylinder|Emanation)$/.test(o.k), ik=big?"tgt-"+o.k.toLowerCase():"tgt-"+(o.k==="Single"?"single":o.k==="Multiple"?"multi":o.k.toLowerCase());
  return [ik,L[0],esc(L[1])+(o.n?'<span class="dc-sz">'+o.n+(TGT_SIZE[o.k]||" ft")+'</span>':'')]; }
function spEffCell(x){ var sv=x.sv; if(sv==="ATK") return ["fx-attack","Effect","Spell attack"]; if(sv) return ["fx-save","Effect",esc(String(sv).toUpperCase())+" save"]; return ["fx-auto","Effect","No roll"]; }
function infoHTML(spec){
  var i=spec.indexOf(":"), type=spec.slice(0,i), key=spec.slice(i+1), h="";
  if(type==="spn") return spnHTML(key);/* v25 RU38 no. 3 */
  if(type==="g"){
    var g=GLOSS[key]; if(!g) return {t:key, h:'<p class="info-d">No details yet.</p>'};
    h=meta(g.c,g.s)+'<p class="info-d">'+rich(g.d)+'</p>';
    var ak=ABK.filter(function(k){return ABN[k]===key})[0];
    if(ak) h+='<div class="info-h">Your numbers</div><div class="info-k">'+tileBd("Score",D.score[ak],"ab-"+ak)+tileBd("Modifier",sg(D.mod[ak]),"ab-"+ak)+tileBd("Saving throw",sg(D.save[ak]),"save-"+ak)+'</div>';
    var si=-1; C.skills.forEach(function(sk,ix){ if(sk.n===key) si=ix; });
    if(si>=0){ var sk=C.skills[si]; h+='<div class="info-h">Your numbers</div><div class="info-k">'+tileBd("Your bonus",sg(D.skill[si]),"sk-"+si)+tileS("Proficiency",["None","Proficient","Expertise"][num(sk.p,0)])+(sk.dis?tileS("Disadvantage",sk.dis):"")+'</div>'+(sk.src?'<p class="bk-f">Proficient from '+esc(sk.src)+'.</p>':'')+(num(sk.misc,0)?'<p class="bk-f">Also '+sg(num(sk.misc,0))+' from '+esc(sk.miscSrc||"another bonus")+'.</p>':''); }/* v35 p08 */
    if(NUM_MAP[key]){ var bk=NUM_MAP[key], b=B[bk]; if(b) h+='<div class="info-h">Your numbers</div><div class="info-k">'+tileBd(b.t.split(":")[0],esc(b.total),bk)+'</div>'; }
    if(STD_CONDS.indexOf(key)>=0 || HB_CONDS.some(function(c){return c.k===key})){
      var on=!!S.cond[key]; h+='<div class="info-act"><button type="button" class="btn press" data-condtoggle="'+esc(key)+'">'+(on?'Remove '+esc(key):'Apply '+esc(key))+'</button></div>';
    }
    var wl=[]; (C.attacks||[]).forEach(function(a,ix){ if((a.n===key||a.n===key+" (thrown)")&&atkOn(a)) wl.push(ix); }); /* RU15: Thrown Weapon Fighting adds a "<weapon> (thrown)" row */
    if(wl.length) h+='<div class="info-h">On your sheet</div><div class="info-l">'+wl.map(function(ix){ return '<button type="button" data-info="w:'+ix+'">'+esc(C.attacks[ix].n)+' attack<span>'+sg(D.atk[ix].hit)+' to hit, '+esc(D.atk[ix].dmg)+'</span></button>'; }).join("")+'</div>';
    var fl=[]; (C.features||[]).forEach(function(gr,gi){ (gr.items||[]).forEach(function(f,fi){ if(String(f.d).indexOf("[["+key+"]]")>=0 || String(f.d).indexOf("[["+key+"|")>=0) fl.push([gi,fi]); }); });
    if(fl.length) h+='<div class="info-h">Your features that mention this</div><div class="info-l">'+fl.map(function(x){ var f=C.features[x[0]].items[x[1]]; return '<button type="button" data-info="f:'+x[0]+'.'+x[1]+'">'+esc(f.n)+'<span>'+esc(f.s)+'</span></button>'; }).join("")+'</div>';
    return {t:key, h:h};
  }
  if(type==="cr"){ var cp=key.split("|"), cc=crOf(cp[0]); if(!cc) return {t:"Creature", h:'<p class="info-d">Not found.</p>'}; return {t:cc.n, h:crBlock(cc,cp.slice(1).join("|"))}; }/* v23 RU36 no. 10 */
  if(type==="xd"){ var xd=(C.xdmg||[])[+key]; if(!xd) return {t:"Feature", h:""}; return {t:xd.n, h:meta(xd.sub,"")+'<div class="info-k">'+tileH("Damage",esc(xd.dmg)+tyIcon(xd.type))+tileS("Type",xd.type)+(xd.save?tileS("Save",xd.save+" DC "+xd.dc):"")+'</div><p class="info-d">'+esc(xd.note)+'</p>'}; }
  if(type==="sp"){ var x=(C.spells||[])[+key], sc=scOf(x); if(!x) return {t:"Spell", h:"<p class=\"info-d\">Not found.</p>"};
    var sch=String(x.sch||"").toLowerCase(), fxb=spFxBlock(x,key);
    h='<div class="dc dc-sp">'+dcHead(x.l?'<b>'+x.l+'</b><small>LVL</small>':ico("school-"+sch,"isch"),ico("school-"+sch,"isch")+'<i>'+(x.l?ordL(x.l)+" ":"")+esc(x.sch)+(x.l?"":" cantrip")+'</i> \u2022 '+esc(x.use)+' ('+esc(x.src||"")+')')+
      dcStrip([[/^Bonus/.test(x.ct)?"time-bonus":/^Reaction/.test(x.ct)?"time-reaction":/^Action/.test(x.ct)?"time-action":"time-long","Time",esc(x.ct)+(x.rit?' <i class="sp-c rit">R</i>':'')],["fx-reach","Range",esc(String(x.r||"").replace(/ ft$/," ft."))],spTgtCell(x),[/^V/.test(x.cmp)?"comp-v":"comp-s","Components",esc(x.cmp)],[x.conc?"tag-concentration":"ui-moon","Duration",esc(x.dur)+(x.conc?' <i class="sp-c">C</i>':'')],spEffCell(x)],"dc-s6")+
      spSum(x)+'<div class="dc-body"><p class="info-d">'+kwChips(richP(x.full||x.sum))+'</p>'+((x.mat||(spFx(x)||{}).mat)&&/M/.test(x.cmp)?'<p class="info-d dc-mat"><b>Material:</b> '+esc(x.mat||spFx(x).mat)+'</p>':'')+'</div>'+(fxb?'<div class="dc-ayl">'+fxb+'</div>':'')+hpSpellNote(x)+tmpSpellH(x,spLvSel[x.n]!=null?spLvSel[x.n]:spRowLv(x))+'<div class="dc-use">'+spCastH(x,+key)+pinSpBtn(x)+'</div>'+
      dcFoot(esc(x.sch)+' \u2022 '+esc(x.cls||""),esc(x.pg?srcPg("PHB-2024",x.pg):String(x.src||"")))+'</div>';/* v36 p14, was v23 RU36 no. 11 */
    return {t:x.n, h:h}; }
  if(type==="spx") return {t:"Spells cast on you", h:spxBody()};
  if(type==="f"){
    var ix=key.split("."), gr=(C.features||[])[+ix[0]], f=gr&&(gr.items||[])[+ix[1]];
    if(!f) return {t:"Feature", h:'<p class="info-d">This feature was removed.</p>'};
    var cl0=clsOfG(gr.g), sd=aylSplit(f.d,cl0), sf=aylSplit(f.full,cl0), ay=sf.a||sd.a;/* v35 p15 (RU129): full text, then the summary, then At your level */
    var fk=fKind(f), rl0=resOf(f.n), r0=rl0[0];
    h='<div class="dc dc-f">'+dcHead(ico(fKindIco(fk),"isch"),esc(gName(gr.g)))+dcStrip([[fKindIco(fk),"Time",esc(fk)],["ui-uses","Uses",r0?esc((r0.max-used(r0.k,r0.max))+" of "+r0.max):"At will"],[r0&&/short/.test(r0.reset)?"rest-short":r0&&r0.reset==="none"?"ui-reset":"rest-long","Resets",r0?esc({short:"Short or Long Rest",short1:"1 per Short Rest",long:"Long Rest",none:"Never"}[r0.reset]||"\u2014"):"\u2014"],["ui-book","Source",esc(srcPg(f.s,pgGuess(gr,f)))]])+'<div class="dc-body">'+kwChips(f.full?'<p class="info-d info-full">'+fch(featNums(richP(fill(sf.t)),cl0))+'</p>'+(sd.t?'<p class="info-sum">'+featNums(richB(fill(sd.t.split(/\s*\*\*Your choice\.\*\*/)[0])),cl0)+'</p>':''):'<p class="info-d">'+fch(featNums(richB(fill(sd.t)),cl0))+'</p>')+'</div>'+aylH(ay,cl0)+featSpL(gr,f);
    if(r0){ var lf0=r0.max-used(r0.k,r0.max); h+='<div class="dc-use"><div class="spcast"><button type="button" class="btn pri press'+(lf0?'':' off')+'" data-usef="'+esc(r0.k)+'|-1"'+(lf0?'':' disabled')+'>Use '+esc(f.n)+' <small>'+lf0+' left</small></button>'+(lf0<r0.max?'<button type="button" class="btn press" data-usef="'+esc(r0.k)+'|1">Give back one use <small>undo</small></button>':'')+'</div>'+(lf0?'':'<p class="muted spcn">No uses left. '+esc({short:"A Short or Long Rest restores them.",short1:"A Short Rest restores one use.",long:"A Long Rest restores them.",none:"They do not come back."}[r0.reset]||"")+'</p>')+'</div>'; }/* v36 p17 */
    h+=tmpFeatH(f);/* v21 RU55 */
    h+='<p class="bk-f"><button type="button" class="lk" data-info="grp:'+ix[0]+'">See everything from '+esc(gName(gr.g))+'</button></p></div>';
    return {t:f.n, h:h};
  }
  if(type==="grp"){
    var G=(C.features||[])[+key]; if(!G) return {t:"Group", h:""};
    h=meta("Features",'')+'<div class="info-l">'+(G.items||[]).map(function(f,fi){ return '<button type="button" data-info="f:'+key+'.'+fi+'">'+esc(f.n)+'<span>'+esc(f.s)+'</span></button>'; }).join("")+'</div>'+(G.next?'<p class="bk-f">'+esc(G.next)+'</p>':'');
    return {t:G.g, h:h};
  }
  if(type==="w"){
    var a=(C.attacks||[])[+key], d=D.atk[+key]; if(!a) return {t:"Attack", h:""};
    h='<div class="dc dc-w">'+dcHead(ico("time-action","isch"),esc(a.dieSrc||"Attack"))+'<div class="dc-strip dc-s4 info-k">'+wCell("fx-attack","To hit",sg(d.hit),"ah-"+key)+wCell("hp-damage","Damage",esc(d.dmg),"ad-"+key)+wCell("fx-reach","Range",esc(a.range||"\u2014"))+wCell("item-weapon","Type",esc(a.type||"\u2014"),"",DT_ICON[String(a.type||"").split(/[ ,]/)[0]]?svgI(DT_ICON[String(a.type||"").split(/[ ,]/)[0]],"ico dc-ci",""):"")+'</div>';
    if(a.sub) h+='<div class="info-h">Properties</div><p class="info-d">'+linkify(a.sub)+'</p>';
    if(a.m) h+='<div class="info-h">Mastery: '+(GLOSS[a.m]?'<button type="button" class="lk" data-info="g:'+esc(a.m)+'">'+esc(a.m)+'</button>':esc(a.m))+'</div>'+(GLOSS[a.m]?'<p class="info-d">'+rich(GLOSS[a.m].d)+'</p>':'');
    if(a.note) h+='<div class="info-h">Notes</div><p class="info-d">'+esc(a.note)+'</p>';
    h+=ammoPickH(a)+ammoH(ammoFor(a));/* v21 RU51, v102 magic ammunition */
    if(GLOSS[a.n]) h+='<div class="info-h">Base weapon</div><p class="info-d">'+rich(GLOSS[a.n].d)+'</p>';
    return {t:a.n, h:h+'</div>'};
  }
  if(type==="it"){
    var it=(C.inv||[])[+key]; if(!it) return {t:"Item", h:""};
    if(it.html){ var dci=dcItem(itemHtml(it)); return {t:it.n, h:'<div class="dc dc-i">'+dci.h+'</div><div class="idetail">'+dci.rest+(it.pg?'<p class="info-d" style="color:var(--faint)">Source: '+esc(srcPg("DMG-2024",it.pg))+'.</p>':'')+(it.west?'<p class="info-d" style="color:var(--faint)">Weight '+fmtW(num(it.w,0))+' lb is an estimate: the DMG gives none for this item.</p>':'')+'</div>'+packH(it,+key)+ctH(it,+key)+useH(it,+key)+qtyCtl(it,+key)+itemRes(it)+moveCtl(it,+key)+'<div class="iacts">'+(it.equippable?'<button type="button" class="btn press" data-ieqs="'+esc(it.key||it.n)+'" data-iix="'+(+key)+'">'+(eqOn(it)?(it.att?"Unattune":"Unequip"):(it.att?"Attune":"Equip"))+'</button>':'')+'<button type="button" class="idel" data-idel="'+esc(it.key||it.n)+'" data-iix="'+(+key)+'">DELETE</button></div>'}; }
    var base=GLOSS[it.n], q=num(it.q,1), w=num(it.w,0);
    h=meta(base?base.c:"Item", base?base.s:"")+'<div class="info-k">'+tileS("Quantity",q)+tileS("Weight",w?fmtW(q*w)+" lb":"\u2014")+(eqOn(it)?tileS("Status","Worn"):"")+'</div>';
    if(base) h+='<p class="info-d">'+rich(base.d)+'</p>';
    if(it.d) h+='<div class="info-h">Your note</div><p class="info-d">'+esc(it.d)+'</p>';
    var wl2=[]; (C.attacks||[]).forEach(function(a,ix){ if((a.n===it.n||a.n===it.n+" (thrown)")&&atkOn(a)) wl2.push(ix); }); /* RU15 */
    if(wl2.length) h+='<div class="info-l">'+wl2.map(function(ix){ return '<button type="button" data-info="w:'+ix+'">Attack with '+esc(C.attacks[ix].n)+'<span>'+sg(D.atk[ix].hit)+' to hit, '+esc(D.atk[ix].dmg)+'</span></button>'; }).join("")+'</div>';
    h+=packH(it,+key)+ctH(it,+key)+useH(it,+key)+qtyCtl(it,+key)+itemRes(it)+moveCtl(it,+key);
    return {t:it.n, h:h};
  }
  return {t:"", h:""};
}
function closeSheet(){ SWP=null;/* v36 p18 */ SWP=null;/* v36 p18 */
  hpDockBack();/* v30 */ morphStop();/* v31 p12 */
  $("#scrim").classList.remove("on"); sheet.classList.remove("on"); dockOff(); shClosed();/* v31 p14, p16 */
  if(sheetMode==="edit") toast("Changes saved");
  sheetMode=""; navStack=[]; $("#sheetBack").hidden=true;
  if(lastFocus&&lastFocus.focus) lastFocus.focus({preventScroll:true});
}
$("#scrim").addEventListener("click",closeSheet);
$("#sheet [data-close]").addEventListener("click",closeSheet);
document.addEventListener("keydown",function(e){ if(e.key==="Escape" && sheet.classList.contains("on")) closeSheet(); });
(function(){
  var head=$("#sheetHead"), startY=0, dy=0, lastY=0, lastT=0, vel=0, dragging=false;
  head.addEventListener("pointerdown",function(e){
    if(!mq.matches || e.target.closest("button")) return;
    dragging=true; head.setPointerCapture(e.pointerId);
    startY=lastY=e.clientY; lastT=performance.now(); dy=0; vel=0; sheet.classList.add("drag");
  });
  head.addEventListener("pointermove",function(e){
    if(!dragging) return;
    var now=performance.now(), raw=e.clientY-startY;
    dy = raw<0 ? -Math.pow(-raw,.6) : raw;
    vel = (e.clientY-lastY)/Math.max(1,now-lastT); lastY=e.clientY; lastT=now;
    sheet.style.transform="translateY("+dy+"px)";
  });
  function end(){ if(!dragging) return; dragging=false; sheet.classList.remove("drag"); var projected=dy+vel*180; shDragEnd(dy,vel,projected > sheet.offsetHeight*.35); }/* v31 p14: the finger speed goes into the spring */
  head.addEventListener("pointerup",end); head.addEventListener("pointercancel",end);
})();
/* v33 p08: pull down from the content to close, on phones, when the content is at its top */
(function(){ var body=$("#sheetBody"), y0=0, x0=0, dy=0, lastY=0, lastT=0, vel=0, st=0;/* st: 0 idle, 1 armed, 2 pulling, -1 scrolling */
  if(!body) return;
  function scroller(t){ for(var e=t; e&&e!==body; e=e.parentElement){ if(e.scrollHeight>e.clientHeight+1){ var o=getComputedStyle(e).overflowY; if(o==="auto"||o==="scroll") return e; } } return body; }
  body.addEventListener("touchstart",function(e){ st=-1; if(!mq.matches||e.touches.length!==1||!sheet.classList.contains("on")) return; var t=e.target;
    if(t.closest&&t.closest("input,textarea,select,[contenteditable=true],.dragh")) return; var sc=scroller(t); if(sc.scrollTop>0||body.scrollTop>0) return;
    y0=lastY=e.touches[0].clientY; x0=e.touches[0].clientX; lastT=performance.now(); dy=0; vel=0; st=1; },{passive:true});
  body.addEventListener("touchmove",function(e){ if(st<1) return; var t=e.touches[0], ddy=t.clientY-y0, ddx=t.clientX-x0;
    if(st===1){ if(Math.abs(ddx)>8&&Math.abs(ddx)>Math.abs(ddy)){ st=-1; return; } if(ddy<-4){ st=-1; return; } if(ddy<10) return; st=2; sheet.classList.add("drag"); y0=t.clientY; }
    if(e.cancelable) e.preventDefault(); var now=performance.now(); dy=Math.max(0,t.clientY-y0); vel=(t.clientY-lastY)/Math.max(1,now-lastT); lastY=t.clientY; lastT=now; sheet.style.transform="translateY("+dy+"px)"; },{passive:false});
  function end(){ if(st===2){ sheet.classList.remove("drag"); shDragEnd(dy,vel,dy+vel*180>sheet.offsetHeight*.35); } st=0; }
  body.addEventListener("touchend",end); body.addEventListener("touchcancel",end);
})();

