import {ABK,ABN,HB_CONDS,STD_CONDS} from "./02-data-default-character.js";
import {GLOSS,gName} from "./03-data-glossary.js";
import {C,S,save,saveC} from "./04-logic-storage.js";
import {$,atkOn,eqOn,esc,fmtW,invAt,itemHtml,num,qtyCtl,rich,sg,toast} from "./05-logic-helpers.js";
import {B,D,fill,richB,richP} from "./06-logic-derivation.js";
import {aylH,aylSplit,spSum,used} from "./08-ui-render-sheet-and-actions.js";
import {hpDockBack} from "./09-ui-hit-points-playbar-death-saves.js";
import {SWP,__set_SWP,__set_navStack,__set_sheetMode,lastFocus,navStack,sheet,sheetMode} from "./12-ui-bottom-sheet-modal.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"featSpec",{get:function(){return featSpec;},set:function(v){featSpec=v;},configurable:true});
Object.defineProperty(__R,"grpSpec",{get:function(){return grpSpec;},set:function(v){grpSpec=v;},configurable:true});
Object.defineProperty(__R,"infoHTML",{get:function(){return infoHTML;},set:function(v){infoHTML=v;},configurable:true});
Object.defineProperty(__R,"resSpec",{get:function(){return resSpec;},set:function(v){resSpec=v;},configurable:true});
Object.defineProperty(__R,"xlink",{get:function(){return xlink;},set:function(v){xlink=v;},configurable:true});
/* ================= DETAIL (info) BUILDERS ================= */
export function meta(c,s){ return '<div class="info-meta">'+(c?'<span class="info-cat">'+esc(c)+'</span>':'')+(s?'<span class="src">'+esc(s)+'</span>':'')+'</div>'; }
function tileBd(label,val,bd){ return '<button type="button" class="tile bd" data-bd="'+bd+'"><span class="k">'+label+'</span><span class="v" style="font-size:24px">'+val+'</span></button>'; }
export function tileH(label,html){ return '<div class="tile"><span class="k">'+label+'</span><span class="v" style="font-size:15px">'+html+'</span></div>'; }
export function tileS(label,val){ return '<div class="tile"><span class="k">'+label+'</span><span class="v" style="font-size:'+(String(val).length>8?'15px':'24px')+'">'+esc(val)+'</span></div>'; }
function featSpec(name){ const fs=C.features||[]; for(let g=0;g<fs.length;g++){ const it=fs[g].items||[]; for(let f=0;f<it.length;f++){ if(it[f].n===name) return "f:"+g+"."+f; } } return null; }
function grpSpec(kind){
  const fs=C.features||[], want={species:/species/i, bg:/background/i}[kind];
  for(let g=0;g<fs.length;g++){ const n=fs[g].g||"";
    if(want && want.test(n)) return "grp:"+g;
    if(kind==="class" && C.cls && n.trim().toLowerCase()===C.cls.trim().toLowerCase()) return "grp:"+g;
    if(kind==="sub" && C.sub && n.toLowerCase().indexOf(C.sub.toLowerCase())>=0) return "grp:"+g; }
  return null;
}
function resSpec(r){ if(r.k==="hd"||r.n==="Hit Dice") return "g:Hit Point Dice"; if(GLOSS[r.n]) return "g:"+r.n; return featSpec(r.f||r.n)||featSpec(r.n); }
export function linkify(text){
  return esc(text).split(/(,\s*)/).map((part) =>{
    const raw=part.replace(/&#39;/g,"'"), base=raw.replace(/\s*\(.*\)\s*$/,"").trim();
    return GLOSS[base] ? '<button type="button" class="lk" data-info="g:'+esc(base)+'">'+part+'</button>' : part;
  }).join("");
}
/* x-link: names of spells, creatures and magic items in any rule text become links to their detail (spn:, cr:, mi:) */
let XL_IDX=null, XL_KEY="", XL_STOP={"The":1,"A":1,"An":1,"Each":1,"Any":1,"Your":1,"This":1,"That":1,"One":1,"If":1,"When":1,"While":1,"You":1,"It":1,"Its":1,"On":1,"In":1,"At":1,"As":1,"For":1,"With":1,"Once":1,"Until":1,"After":1,"Before":1,"Any":1,"No":1,"Choose":1,"Cast":1,"Casts":1,"Roll":1,"Both":1,"Either":1,"All":1,"Other":1,"Another":1,"Of":1};
function xlIdx(){
  const crs=(typeof CREATURES!=="undefined"&&CREATURES.creatures)||[], sp=(typeof SPELLS!=="undefined"&&SPELLS)||[], mi=(typeof DMGI!=="undefined"&&DMGI)||[], ftk=typeof FEATS!=="undefined"?Object.keys(FEATS):[], key=sp.length+"|"+mi.length+"|"+crs.length+"|"+ftk.length;
  if(XL_IDX&&key===XL_KEY) return XL_IDX;
  const m={}, put=function(n,k){ n=String(n||"").replace(/\s+/g," ").trim().replace(/'/g,"\u0001").replace(/’/g,"\u0001"); if(n.length>2&&/^[A-Z]/.test(n)) m[n]=k; };
  if(typeof WEAPONS!=="undefined") Object.keys(WEAPONS).forEach((n) =>{ if(n.indexOf(" ")>0) put(n,["lib","gear|"+n]); });
  if(typeof ARMOR!=="undefined") Object.keys(ARMOR).forEach((n) =>{ if(n.indexOf(" ")>0) put(n,["lib","gear|"+n]); });
  if(typeof __R.LIB_RULES!=="undefined") Object.keys(__R.LIB_RULES).forEach((n) =>{ if(n.indexOf(" ")>0) put(n,["lib","rule|"+n]); });
  ftk.forEach((n) =>{ put(n,["lib","feat|"+n]); });
  sp.forEach((x) =>{ put(x[0],["spn",x[0]]); });
  crs.forEach((c) =>{ put(c.n,["cr",c.n]); });
  mi.forEach((r) =>{ if(r&&r[0]) put(r[0],["mi",r[0]]); });
  XL_IDX=m; XL_KEY=key; return m;
}
let XL_SELF="";
function xlink(h,self,mode){
  self=self||XL_SELF; h=String(h==null?"":h); if(!h||h.indexOf("<")<0&&h.length<3) return h;
  let m=xlIdx(), depth=0, selfK=String(self||"").replace(/&#39;/g,"'").replace(/'/g,"\u0001");
  return h.split(/(<[^>]+>)/).map((p) =>{
    if(p.charAt(0)==="<"){ if(/^<(button|a)[\s>]/i.test(p)) depth++; else if(/^<\/(button|a)>/i.test(p)) depth=Math.max(0,depth-1); return p; }
    if(depth||p.length<3) return p;
    let t=p.replace(/&#39;/g,"\u0001"), tk=[], re=/[A-Za-z0-9+\u0001’-]+/g, q;
    while((q=re.exec(t))) tk.push([q.index,q.index+q[0].length]);
    let out="", pos=0, i=0;
    while(i<tk.length){
      let a=tk[i][0], ch=t.charAt(a), hit=null, len=0;
      if(ch>="A"&&ch<="Z"){
        for(let L=Math.min(6,tk.length-i);L>=1;L--){
          let ok=true; for(let j=i+1;j<i+L;j++){ if(t.slice(tk[j-1][1],tk[j][0])!==" "){ ok=false; break; } }
          if(!ok) continue;
          const ph=t.slice(a,tk[i+L-1][1]), k=m[ph]; if(!k) continue;
          if(ph===selfK) break;
          if(L===1||ph.indexOf(" ")<0){
            const pw=/([A-Za-z][A-Za-z\u0001-]*) $/.exec(t.slice(Math.max(0,a-30),a));
            if(pw&&/^[A-Z]/.test(pw[1])&&!XL_STOP[pw[1]]) break;/* part of a longer proper name, such as "Gamma Knight" */
            if(k[0]==="lib"&&k[1].indexOf("feat|")===0){ const sf=t.slice(0,a).split(/[.!?:]\s/).pop(); if(!/\bfeats?\b/i.test(sf)) break; }
            if(k[0]==="spn"){ const sent=t.slice(0,a).split(/[.!?:]\s/).pop(); if(!/\b(?:spells?|cast|casts|casting|cantrips?)\b/i.test(sent)) break; }
          }
          if(mode==="b"&&(k[0]==="spn"||k[1].indexOf("feat|")===0)) break;/* the builder links spells and feats itself */
          hit=k; len=L; break;
        }
      }
      if(hit){ const e=tk[i+len-1][1]; const nm_=hit[1].replace(/&/g,"&amp;").replace(/"/g,"&quot;"); out+=t.slice(pos,a)+(mode==="b"?'<button type="button" class="lnk" data-lnk="'+hit[0]+'|'+nm_+'">':'<button type="button" class="lk xl" data-info="'+hit[0]+':'+nm_+'">')+t.slice(a,e)+'</button>'; pos=e; i+=len; }
      else i++;
    }
    return (out+t.slice(pos)).replace(/\u0001/g,"&#39;");
  }).join("");
}
window.__xl={xlink:xlink,info:function(k){return infoHTML(k)},idx:xlIdx};/* test hook */
function miHTML(n){
  const r=(typeof DMGI!=="undefined"?DMGI:[]).filter((x) =>{ return x[0]===n; })[0];
  if(!r) return {t:n, h:'<p class="info-d">Not found.</p>'};
  const h='<div class="dc dc-i">'+dcHead(__R.ico("ui-hand","isch"),esc(r[1]+" • "+r[2]+(r[3]?" • Requires attunement":"")))+'</div><div class="idetail"><p class="info-d">'+kwChips(xlink(richP(r[4]),n))+'</p></div>';
  return {t:n, h:h};
}
const NUM_MAP={"Armor Class":"ac","Initiative":"init","Speed":"speed","Proficiency Bonus":"pb","Hit Points":"hp","Carrying Capacity":"carry","Grapple":"dc","Shove":"dc","Passive Perception":"pas-per"};
/* v36 p14: one detail-card template (head, 4-cell strip, number blocks, body, At your level, use buttons, foot) */
const KW_LIST=["Temporary Hit Points","Opportunity Attack","Heroic Inspiration","Bonus Action","Hit Points","Short Rest","Long Rest","Saving Throw","Reaction","Advantage","Disadvantage","Concentration"].concat(STD_CONDS);
function kwChips(html){ let seen={}, depth=0;
  return String(html).split(/(<[^>]+>)/).map((p) =>{
    if(p.charAt(0)==="<"){ if(/^<(button|a)[\s>]/i.test(p)) depth++; else if(/^<\/(button|a)>/i.test(p)) depth=Math.max(0,depth-1); return p; }
    if(depth||!p) return p;
    KW_LIST.forEach((k) =>{ if(seen[k]||!GLOSS[k]) return; const re=new RegExp("\\b"+k+"\\b"); if(re.test(p)){ seen[k]=1; p=p.replace(re,'\u0001'+k+'\u0002'); } });
    return p.replace(/\u0001([^\u0002]+)\u0002/g,(m,k) =>{ return '<button type="button" class="lk kw" data-info="g:'+esc(k)+'">'+esc(k)+'</button>'; }); }).join(""); }
function fKind(f){ const k=Object.keys(ACTS).filter((q) =>{ return q.split("|").pop()===f.n; })[0], a=k&&ACTS[k][0]; return a?({action:"Action",bonus:"Bonus Action",reaction:"Reaction",other:"Special"}[a[0]]||"Special"):"Passive"; }
function fKindIco(t){ return /^Bonus/.test(t)?"time-bonus":/^Reaction/.test(t)?"time-reaction":t==="Action"?"time-action":"time-long"; }
function dcItem(html){ let P={}, h=String(html||"");
  h=h.replace(/<dt>([^<]+)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g,(m,k,v) =>{ P[k]=v; return m; });
  const pick=P["Armor Class"]!=null?[["Armor Class","AC","ui-shield"],["Strength","Strength","ab-str"],["Stealth","Stealth","ui-stealth"],["Cost","Cost","ui-cost"]]:P["Damage"]!=null?[["Damage","Damage","hp-damage"],["Damage Type","Type","item-weapon"],["Proficient","Proficient","ui-prof"],["Cost","Cost","ui-cost"]]:[["Weight","Weight","ui-weight"],["Cost","Cost","ui-cost"]];
  let cells=[], rest=h; pick.forEach((q) =>{ if(P[q[0]]==null) return; cells.push([q[2],q[1],P[q[0]],q[0]==="Damage Type"&&__R.DT_ICON[String(P[q[0]]).replace(/<[^>]*>/g,"").trim().split(/[ ,]/)[0]]?__R.svgI(__R.DT_ICON[String(P[q[0]]).replace(/<[^>]*>/g,"").trim().split(/[ ,]/)[0]],"ico dc-ci",""):""]); const re=new RegExp("<dt>"+q[0]+"</dt>\\s*<dd>[\\s\\S]*?</dd>"); rest=rest.replace(re,""); });
  const kind=(/<i>([^<]{2,40})<\/i>/.exec(h)||[])[1]||"Item";
  rest=rest.replace(/<p>\s*<i>[^<]+<\/i>\s*<\/p>/,"");
  return {h:dcHead(__R.ico(P["Armor Class"]!=null?"ui-shield":"ui-hand","isch"),esc(kind))+(cells.length?dcStrip(cells):""), rest:rest}; }
export function dcHead(badge,sub){ return '<div class="dc-head"><span class="dc-badge">'+badge+'</span><div class="dc-sub">'+sub+'</div></div>'; }
export function dcStrip(a,cls){ return '<div class="dc-strip'+(cls?' '+cls:'')+'">'+a.map((c) =>{ return '<div class="dc-cell"><span class="dc-ico">'+(c[3]||__R.ico(c[0],"dc-ci"))+'</span><div class="dc-tx"><small>'+esc(c[1])+'</small><b>'+c[2]+'</b></div></div>'; }).join("")+'</div>'; }/* v38 p11 */
function wCell(ik,lab,val,bd,raw){ const inner='<span class="dc-ico">'+(raw||__R.ico(ik,"dc-ci"))+'</span><div class="dc-tx"><small>'+esc(lab)+'</small><b>'+val+'</b></div>'; return bd?'<button type="button" class="dc-cell bd" data-bd="'+bd+'">'+inner+'</button>':'<div class="dc-cell">'+inner+'</div>'; }/* v38 p14 */
function dcFoot(l,r){ return '<div class="dc-foot"><b>'+l+'</b><span>'+r+'</span></div>'; }

/* v38 p10: spTgt */
const SP_TGT_OVR={"Scorching Ray":"Multiple","Animate Dead":"Multiple","Create Undead":"Multiple","Speak with Dead":"Single","Find Traps":"Special","Dancing Lights":"Special","Prestidigitation":"Special","Thaumaturgy":"Special","Illusory Script":"Object","Create Food and Water":"Special","Teleportation Circle":"Special","Arcane Eye":"Special","Leomund's Secret Chest":"Object","Project Image":"Special","Arcane Gate":"Special","Gate":"Summon","Planar Ally":"Summon","Find Familiar":"Summon","Unseen Servant":"Summon","Phantom Steed":"Summon","Tenser's Floating Disk":"Summon","Mordenkainen's Faithful Hound":"Summon","Tasha's Bubbling Cauldron":"Object","Animate Objects":"Multiple","Passwall":"Special","Move Earth":"Special","Earthquake":"Special","Tsunami":"Special","Mirage Arcane":"Special","Guards and Wards":"Special","Forbiddance":"Special","Guardian of Faith":"Summon"};
/* spTgt: what a spell hits. k = Sphere, Cube, Cone, Line, Cylinder, Emanation (area, n = size in feet), Single, Multiple, Self, Touch, Object, Wall, Summon, Special */
function spTgt(x){ let rng=String(x.r||""), nm=x.n||"", t=String(x.full||x.sum||""), fx=x.fx||(typeof SPELL_FX!=="undefined"&&SPELL_FX[x.n])||null, a=fx&&fx.area, m, SH={sphere:"Sphere",cube:"Cube",cone:"Cone",line:"Line",cylinder:"Cylinder",emanation:"Emanation",hemisphere:"Sphere",square:"Cube"};
  if(SP_TGT_OVR[nm]) return {k:SP_TGT_OVR[nm]};
  if(/^(Wall of|Prismatic Wall|Blade Barrier|Wind Wall)/.test(nm)) return {k:"Wall"};
  if(/^(Summon|Conjure)\b/.test(nm)) return {k:"Summon"};
  if(a&&a[0]) return {k:a[0]==="Square"?"Cube":a[0],n:a[1]};
  m=/(\d+)[- ]foot(?:-radius|-high|-wide| radius)?[ -]*(Sphere|Cube|Cone|Line|Cylinder|Emanation|Hemisphere)/i.exec(rng+" . "+t); if(m) return {k:SH[m[2].toLowerCase()],n:+m[1]};
  m=/(Sphere|Cube|Cone|Line|Cylinder|Emanation)\b/.exec(rng); if(m) return {k:m[1]};
  const s=t.split(/(?<=[.!?])\s+/).slice(0,3).join(" ");
  if(/^Self\b/.test(rng)&&!/\b(creature|target|object)s?\b.{0,40}\b(you|of your choice|within|that you can see)/i.test(s)) return {k:"Self"};
  if(/\b(?:up to (?:\w+) |two |three |four |five |six |eight |ten |all |each |any number of )(?:willing |other |Humanoid |Beast |Undead )?(?:creatures|targets|Humanoids|allies|objects|Beasts)/i.test(s)||/\beach creature|\bcreatures? of your choice|\bone or two creatures|\btwo creatures/i.test(s)) return {k:"Multiple"};
  if(/\b(?:a|one|the|target) (?:willing |Medium or smaller |Large or smaller |Humanoid |Beast |Undead |Fey |Celestial |dead |living |unconscious |incapacitated )?(?:creature|target|Humanoid|Beast|Undead|ally)\b|\byou touch|\bone creature|\bone target|\bthe target|\ba target/i.test(s)) return {k:"Single"};
  if(/\b(?:an? |one |the )(?:\w+ )?(?:nonmagical |unattended |Tiny |Small |Medium |Large |Huge )*(?:object|weapon|item|door|container|rope|vessel)\b/i.test(s)) return {k:"Object"};
  if(/^Self/.test(rng)) return {k:"Self"};
  return {k:"Special"}; }
const TGT_LAB={Sphere:["Area","Sphere"],Cube:["Area","Cube"],Cone:["Area","Cone"],Line:["Area","Line"],Cylinder:["Area","Cylinder"],Emanation:["Area","Emanation"],Single:["Target","Single target"],Multiple:["Target","Multiple targets"],Self:["Target","Self"],Object:["Target","Object"],Wall:["Area","Wall"],Summon:["Effect","Summons a creature"],Special:["Effect","Special"]};
const TGT_SIZE={Sphere:" ft radius",Cube:" ft cube",Cone:" ft cone",Line:" ft long",Cylinder:" ft radius",Emanation:" ft from you"};
function spTgtCell(x){ const o=spTgt(x), L=TGT_LAB[o.k]||["Target",o.k], big=/^(Sphere|Cube|Cone|Line|Cylinder|Emanation)$/.test(o.k), ik=big?"tgt-"+o.k.toLowerCase():"tgt-"+(o.k==="Single"?"single":o.k==="Multiple"?"multi":o.k.toLowerCase());
  return [ik,L[0],esc(L[1])+(o.n?'<span class="dc-sz">'+o.n+(TGT_SIZE[o.k]||" ft")+'</span>':'')]; }
function spEffCell(x){ const sv=x.sv; if(sv==="ATK") return ["fx-attack","Effect","Spell attack"]; if(sv) return ["fx-save","Effect",esc(String(sv).toUpperCase())+" save"]; return ["fx-auto","Effect","No roll"]; }
export function infoHTML(spec){
  let i0=spec.indexOf(":"), t0=spec.slice(0,i0), k0=spec.slice(i0+1), prev=XL_SELF, me="";/* a name in its own dialog is not linked to itself */
  try{ if(t0==="spn"||t0==="mi") me=k0; else if(t0==="lib") me=k0.slice(k0.indexOf("|")+1); else if(t0==="cr") me=k0.split("|")[0]; else if(t0==="sp") me=((C.spells||[])[+k0]||{}).n||""; else if(t0==="it") me=((C.inv||[])[+k0]||{}).n||""; else if(t0==="f"){ const q=k0.split("."), g_=(C.features||[])[+q[0]]; me=((g_&&g_.items||[])[+q[1]]||{}).n||""; } }catch(e){ me=""; }
  XL_SELF=me; try{ return infoHTML0(spec); } finally{ XL_SELF=prev; }
}
function infoHTML0(spec){
  let i=spec.indexOf(":"), type=spec.slice(0,i), key=spec.slice(i+1), h="";
  if(type==="spn") return __R.spnHTML(key);/* v25 RU38 no. 3 */
  if(type==="mi") return miHTML(key);
  if(type==="lib"){ const bar=key.indexOf("|"), ld=typeof __R.libDetail==="function"&&__R.libDetail(key.slice(0,bar),key.slice(bar+1)); return ld?{t:ld.t,h:ld.h}:{t:key.slice(bar+1),h:'<p class="info-d">Not found.</p>'}; }
  if(type==="g"){
    const g=GLOSS[key]; if(!g) return {t:key, h:'<p class="info-d">No details yet.</p>'};
    h=meta(g.c,g.s)+'<p class="info-d">'+rich(g.d)+'</p>';
    const ak=ABK.filter((k) =>{return ABN[k]===key})[0];
    if(ak) h+='<div class="info-h">Your numbers</div><div class="info-k">'+tileBd("Score",D.score[ak],"ab-"+ak)+tileBd("Modifier",sg(D.mod[ak]),"ab-"+ak)+tileBd("Saving throw",sg(D.save[ak]),"save-"+ak)+'</div>';
    let si=-1; C.skills.forEach((sk,ix) =>{ if(sk.n===key) si=ix; });
    if(si>=0){ const sk=C.skills[si]; h+='<div class="info-h">Your numbers</div><div class="info-k">'+tileBd("Your bonus",sg(D.skill[si]),"sk-"+si)+tileS("Proficiency",["None","Proficient","Expertise"][num(sk.p,0)])+(sk.dis?tileS("Disadvantage",sk.dis):"")+'</div>'+(sk.src?'<p class="bk-f">Proficient from '+esc(sk.src)+'.</p>':'')+(num(sk.misc,0)?'<p class="bk-f">Also '+sg(num(sk.misc,0))+' from '+esc(sk.miscSrc||"another bonus")+'.</p>':''); }/* v35 p08 */
    if(NUM_MAP[key]){ const bk=NUM_MAP[key], b=B[bk]; if(b) h+='<div class="info-h">Your numbers</div><div class="info-k">'+tileBd(b.t.split(":")[0],esc(b.total),bk)+'</div>'; }
    if(STD_CONDS.indexOf(key)>=0 || HB_CONDS.some((c) =>{return c.k===key})){
      const on=!!S.cond[key]; h+='<div class="info-act"><button type="button" class="btn press" data-condtoggle="'+esc(key)+'">'+(on?'Remove '+esc(key):'Apply '+esc(key))+'</button></div>';
    }
    const wl=[]; (C.attacks||[]).forEach((a,ix) =>{ if((a.n===key||a.n===key+" (thrown)")&&atkOn(a)) wl.push(ix); }); /* RU15: Thrown Weapon Fighting adds a "<weapon> (thrown)" row */
    if(wl.length) h+='<div class="info-h">On your sheet</div><div class="info-l">'+wl.map((ix) =>{ return '<button type="button" data-info="w:'+ix+'">'+esc(C.attacks[ix].n)+' attack<span>'+sg(D.atk[ix].hit)+' to hit, '+esc(D.atk[ix].dmg)+'</span></button>'; }).join("")+'</div>';
    const fl=[]; (C.features||[]).forEach((gr,gi) =>{ (gr.items||[]).forEach((f,fi) =>{ if(String(f.d).indexOf("[["+key+"]]")>=0 || String(f.d).indexOf("[["+key+"|")>=0) fl.push([gi,fi]); }); });
    if(fl.length) h+='<div class="info-h">Your features that mention this</div><div class="info-l">'+fl.map((x) =>{ const f=C.features[x[0]].items[x[1]]; return '<button type="button" data-info="f:'+x[0]+'.'+x[1]+'">'+esc(f.n)+'<span>'+esc(f.s)+'</span></button>'; }).join("")+'</div>';
    return {t:key, h:h};
  }
  if(type==="cr"){ const cp=key.split("|"), cc=__R.crOf(cp[0]); if(!cc) return {t:"Creature", h:'<p class="info-d">Not found.</p>'}; return {t:cc.n, h:__R.crBlock(cc,cp.slice(1).join("|"))}; }/* v23 RU36 no. 10 */
  if(type==="xd"){ const xd=(C.xdmg||[])[+key]; if(!xd) return {t:"Feature", h:""}; return {t:xd.n, h:meta(xd.sub,"")+'<div class="info-k">'+tileH("Damage",esc(xd.dmg)+__R.tyIcon(xd.type))+tileS("Type",xd.type)+(xd.save?tileS("Save",xd.save+" DC "+xd.dc):"")+'</div><p class="info-d">'+esc(xd.note)+'</p>'}; }
  if(type==="sp"){ const x=(C.spells||[])[+key], sc=__R.scOf(x); if(!x) return {t:"Spell", h:"<p class=\"info-d\">Not found.</p>"};
    const sch=String(x.sch||"").toLowerCase(), fxb=__R.spFxBlock(x,key);
    h='<div class="dc dc-sp">'+dcHead(x.l?'<b>'+x.l+'</b><small>LVL</small>':__R.ico("school-"+sch,"isch"),__R.ico("school-"+sch,"isch")+'<i>'+(x.l?__R.ordL(x.l)+" ":"")+esc(x.sch)+(x.l?"":" cantrip")+'</i> \u2022 '+esc(x.use)+' ('+esc(x.src||"")+')')+
      dcStrip([[/^Bonus/.test(x.ct)?"time-bonus":/^Reaction/.test(x.ct)?"time-reaction":/^Action/.test(x.ct)?"time-action":"time-long","Time",esc(x.ct)+(x.rit?' <i class="sp-c rit">R</i>':'')],["fx-reach","Range",esc(String(x.r||"").replace(/ ft$/," ft."))],spTgtCell(x),[/^V/.test(x.cmp)?"comp-v":"comp-s","Components",esc(x.cmp)],[x.conc?"tag-concentration":"ui-moon","Duration",esc(x.dur)+(x.conc?' <i class="sp-c">C</i>':'')],spEffCell(x)],"dc-s6")+
      spSum(x)+'<div class="dc-body"><p class="info-d">'+kwChips(richP(x.full||x.sum))+'</p>'+((x.mat||(__R.spFx(x)||{}).mat)&&/M/.test(x.cmp)?'<p class="info-d dc-mat"><b>Material:</b> '+esc(x.mat||__R.spFx(x).mat)+'</p>':'')+'</div>'+(fxb?'<div class="dc-ayl">'+fxb+'</div>':'')+__R.hpSpellNote(x)+__R.tmpSpellH(x,__R.spLvSel[x.n]!=null?__R.spLvSel[x.n]:__R.spRowLv(x))+'<div class="dc-use">'+__R.spCastH(x,+key)+__R.pinSpBtn(x)+'</div>'+
      dcFoot(esc(x.sch)+' \u2022 '+esc(x.cls||""),esc(x.pg?__R.srcPg("PHB-2024",x.pg):String(x.src||"")))+'</div>';/* v36 p14, was v23 RU36 no. 11 */
    return {t:x.n, h:h}; }
  if(type==="spx") return {t:"Spells cast on you", h:__R.spxBody()};
  if(type==="f"){
    const ix=key.split("."), gr=(C.features||[])[+ix[0]], f=gr&&(gr.items||[])[+ix[1]];
    if(!f) return {t:"Feature", h:'<p class="info-d">This feature was removed.</p>'};
    const cl0=__R.clsOfG(gr.g), sd=aylSplit(f.d,cl0), sf=aylSplit(f.full,cl0), ay=sf.a||sd.a;/* v35 p15 (RU129): full text, then the summary, then At your level */
    const fk=fKind(f), rl0=__R.resOf(f.n), r0=rl0[0];
    h='<div class="dc dc-f">'+dcHead(__R.ico(fKindIco(fk),"isch"),esc(gName(gr.g)))+dcStrip([[fKindIco(fk),"Time",esc(fk)],["ui-uses","Uses",r0?esc((r0.max-used(r0.k,r0.max))+" of "+r0.max):"At will"],[r0&&/short/.test(r0.reset)?"rest-short":r0&&r0.reset==="none"?"ui-reset":"rest-long","Resets",r0?esc({short:"Short or Long Rest",short1:"1 per Short Rest",long:"Long Rest",none:"Never"}[r0.reset]||"\u2014"):"\u2014"],["ui-book","Source",esc(__R.srcPg(f.s,__R.pgGuess(gr,f)))]])+'<div class="dc-body">'+kwChips(f.full?'<p class="info-d info-full">'+__R.fch(__R.featNums(richP(fill(sf.t)),cl0))+'</p>'+(sd.t?'<p class="info-sum">'+__R.featNums(richB(fill(sd.t.split(/\s*\*\*Your choice\.\*\*/)[0])),cl0)+'</p>':''):'<p class="info-d">'+__R.fch(__R.featNums(richB(fill(sd.t)),cl0))+'</p>')+'</div>'+aylH(ay,cl0)+__R.featSpL(gr,f);
    if(r0){ const lf0=r0.max-used(r0.k,r0.max); h+='<div class="dc-use"><div class="spcast"><button type="button" class="btn pri press'+(lf0?'':' off')+'" data-usef="'+esc(r0.k)+'|-1"'+(lf0?'':' disabled')+'>Use '+esc(f.n)+' <small>'+lf0+' left</small></button>'+(lf0<r0.max?'<button type="button" class="btn press" data-usef="'+esc(r0.k)+'|1">Give back one use <small>undo</small></button>':'')+'</div>'+(lf0?'':'<p class="muted spcn">No uses left. '+esc({short:"A Short or Long Rest restores them.",short1:"A Short Rest restores one use.",long:"A Long Rest restores them.",none:"They do not come back."}[r0.reset]||"")+'</p>')+'</div>'; }/* v36 p17 */
    h+=__R.tmpFeatH(f);/* v21 RU55 */
    h+='<p class="bk-f"><button type="button" class="lk" data-info="grp:'+ix[0]+'">See everything from '+esc(gName(gr.g))+'</button></p></div>';
    return {t:f.n, h:h};
  }
  if(type==="grp"){
    const G=(C.features||[])[+key]; if(!G) return {t:"Group", h:""};
    h=meta("Features",'')+'<div class="info-l">'+(G.items||[]).map((f,fi) =>{ return '<button type="button" data-info="f:'+key+'.'+fi+'">'+esc(f.n)+'<span>'+esc(f.s)+'</span></button>'; }).join("")+'</div>'+(G.next?'<p class="bk-f">'+esc(G.next)+'</p>':'');
    return {t:G.g, h:h};
  }
  if(type==="w"){
    const a=(C.attacks||[])[+key], d=D.atk[+key]; if(!a) return {t:"Attack", h:""};
    h='<div class="dc dc-w">'+dcHead(__R.ico("time-action","isch"),esc(a.dieSrc||"Attack"))+'<div class="dc-strip dc-s4 info-k">'+wCell("fx-attack","To hit",sg(d.hit),"ah-"+key)+wCell("hp-damage","Damage",esc(d.dmg),"ad-"+key)+wCell("fx-reach","Range",esc(a.range||"\u2014"))+wCell("item-weapon","Type",esc(a.type||"\u2014"),"",__R.DT_ICON[String(a.type||"").split(/[ ,]/)[0]]?__R.svgI(__R.DT_ICON[String(a.type||"").split(/[ ,]/)[0]],"ico dc-ci",""):"")+'</div>';
    if(a.sub) h+='<div class="info-h">Properties</div><p class="info-d">'+linkify(a.sub)+'</p>';
    if(a.m) h+='<div class="info-h">Mastery: '+(GLOSS[a.m]?'<button type="button" class="lk" data-info="g:'+esc(a.m)+'">'+esc(a.m)+'</button>':esc(a.m))+'</div>'+(GLOSS[a.m]?'<p class="info-d">'+rich(GLOSS[a.m].d)+'</p>':'');
    if(a.note) h+='<div class="info-h">Notes</div><p class="info-d">'+esc(a.note)+'</p>';
    h+=__R.ammoPickH(a)+__R.ammoH(__R.ammoFor(a));/* v21 RU51, v102 magic ammunition */
    if(GLOSS[a.n]) h+='<div class="info-h">Base weapon</div><p class="info-d">'+rich(GLOSS[a.n].d)+'</p>';
    return {t:a.n, h:h+'</div>'};
  }
  if(type==="it"){
    const it=(C.inv||[])[+key]; if(!it) return {t:"Item", h:""};
    if(it.html){ const dci=dcItem(itemHtml(it)); return {t:it.n, h:'<div class="dc dc-i">'+dci.h+'</div><div class="idetail">'+xlink(dci.rest,it.n)+(it.pg?'<p class="info-d" style="color:var(--faint)">Source: '+esc(__R.srcPg("DMG-2024",it.pg))+'.</p>':'')+(it.west?'<p class="info-d" style="color:var(--faint)">Weight '+fmtW(num(it.w,0))+' lb is an estimate: the DMG gives none for this item.</p>':'')+'</div>'+__R.packH(it,+key)+__R.ctH(it,+key)+__R.useH(it,+key)+qtyCtl(it,+key)+mwH(it,+key)+__R.itemRes(it)+__R.moveCtl(it,+key)+'<div class="iacts">'+(it.equippable?'<button type="button" class="btn press" data-ieqs="'+esc(it.key||it.n)+'" data-iix="'+(+key)+'">'+(eqOn(it)?(it.att?"Unattune":"Unequip"):(it.att?"Attune":"Equip"))+'</button>':'')+'<button type="button" class="idel" data-idel="'+esc(it.key||it.n)+'" data-iix="'+(+key)+'">DELETE</button></div>'}; }
    const base=GLOSS[it.n], q=num(it.q,1), w=num(it.w,0);
    h=meta(base?base.c:"Item", base?base.s:"")+'<div class="info-k">'+tileS("Quantity",q)+tileS("Weight",w?fmtW(q*w)+" lb":"\u2014")+(eqOn(it)?tileS("Status","Worn"):"")+'</div>';
    if(base) h+='<p class="info-d">'+rich(base.d)+'</p>';
    if(it.d) h+='<div class="info-h">Your note</div><p class="info-d">'+esc(it.d)+'</p>';
    const wl2=[]; (C.attacks||[]).forEach((a,ix) =>{ if((a.n===it.n||a.n===it.n+" (thrown)")&&atkOn(a)) wl2.push(ix); }); /* RU15 */
    if(wl2.length) h+='<div class="info-l">'+wl2.map((ix) =>{ return '<button type="button" data-info="w:'+ix+'">Attack with '+esc(C.attacks[ix].n)+'<span>'+sg(D.atk[ix].hit)+' to hit, '+esc(D.atk[ix].dmg)+'</span></button>'; }).join("")+'</div>';
    h+=__R.packH(it,+key)+__R.ctH(it,+key)+__R.useH(it,+key)+qtyCtl(it,+key)+mwH(it,+key)+__R.itemRes(it)+__R.moveCtl(it,+key);
    return {t:it.n, h:h};
  }
  return {t:"", h:""};
}
export function closeSheet(){ __set_SWP(null);/* v36 p18 */ __set_SWP(null);/* v36 p18 */
  hpDockBack();/* v30 */ __R.morphStop();/* v31 p12 */
  $("#scrim").classList.remove("on"); sheet.classList.remove("on"); __R.dockOff(); __R.shClosed();/* v31 p14, p16 */
  if(sheetMode==="edit") toast("Changes saved");
  __set_sheetMode(""); __set_navStack([]); $("#sheetBack").hidden=true;
  if(lastFocus&&lastFocus.focus) lastFocus.focus({preventScroll:true});
}
$("#scrim").addEventListener("click",closeSheet);
$("#sheet [data-close]").addEventListener("click",closeSheet);
document.addEventListener("keydown",(e) =>{ if(e.key==="Escape" && sheet.classList.contains("on")) closeSheet(); });
(function(){
  let head=$("#sheetHead"), startY=0, dy=0, lastY=0, lastT=0, vel=0, dragging=false;
  head.addEventListener("pointerdown",(e) =>{
    if(!__R.mq.matches || e.target.closest("button")) return;
    dragging=true; head.setPointerCapture(e.pointerId);
    startY=lastY=e.clientY; lastT=performance.now(); dy=0; vel=0; sheet.classList.add("drag");
  });
  head.addEventListener("pointermove",(e) =>{
    if(!dragging) return;
    const now=performance.now(), raw=e.clientY-startY;
    dy = raw<0 ? -Math.pow(-raw,.6) : raw;
    vel = (e.clientY-lastY)/Math.max(1,now-lastT); lastY=e.clientY; lastT=now;
    sheet.style.transform="translateY("+dy+"px)";
  });
  function end(){ if(!dragging) return; dragging=false; sheet.classList.remove("drag"); const projected=dy+vel*180; __R.shDragEnd(dy,vel,projected > sheet.offsetHeight*.35); }/* v31 p14: the finger speed goes into the spring */
  head.addEventListener("pointerup",end); head.addEventListener("pointercancel",end);
})();
/* v33 p08: pull down from the content to close, on phones, when the content is at its top */
(function(){ let body=$("#sheetBody"), y0=0, x0=0, dy=0, lastY=0, lastT=0, vel=0, st=0;/* st: 0 idle, 1 armed, 2 pulling, -1 scrolling */
  if(!body) return;
  function scroller(t){ for(let e=t; e&&e!==body; e=e.parentElement){ if(e.scrollHeight>e.clientHeight+1){ const o=getComputedStyle(e).overflowY; if(o==="auto"||o==="scroll") return e; } } return body; }
  body.addEventListener("touchstart",(e) =>{ st=-1; if(!__R.mq.matches||e.touches.length!==1||!sheet.classList.contains("on")) return; const t=e.target;
    if(t.closest&&t.closest("input,textarea,select,[contenteditable=true],.dragh")) return; const sc=scroller(t); if(sc.scrollTop>0||body.scrollTop>0) return;
    y0=lastY=e.touches[0].clientY; x0=e.touches[0].clientX; lastT=performance.now(); dy=0; vel=0; st=1; },{passive:true});
  body.addEventListener("touchmove",(e) =>{ if(st<1) return; const t=e.touches[0], ddy=t.clientY-y0, ddx=t.clientX-x0;
    if(st===1){ if(Math.abs(ddx)>8&&Math.abs(ddx)>Math.abs(ddy)){ st=-1; return; } if(ddy<-4){ st=-1; return; } if(ddy<10) return; st=2; sheet.classList.add("drag"); y0=t.clientY; }
    if(e.cancelable) e.preventDefault(); const now=performance.now(); dy=Math.max(0,t.clientY-y0); vel=(t.clientY-lastY)/Math.max(1,now-lastT); lastY=t.clientY; lastT=now; sheet.style.transform="translateY("+dy+"px)"; },{passive:false});
  function end(){ if(st===2){ sheet.classList.remove("drag"); __R.shDragEnd(dy,vel,dy+vel*180>sheet.offsetHeight*.35); } st=0; }
  body.addEventListener("touchend",end); body.addEventListener("touchcancel",end);
})();

/* FX toggles UI: Masterwork switch for armor and weapons (inventory flag "mw", missing = off) */
function mwBase(n){ return String(n||"").replace(/, (?:\+\d|Masterwork(?: \(\d+\))?)$/,"").replace(/ \([^()]*\)$/,""); }
export function mwEligible(it){ if(!it) return false; if(it.mw!=null) return true; const b=mwBase(it.n);
  try{ return (typeof ARMOR!=="undefined"&&!!ARMOR[b]&&b!=="Shield")||(typeof WEAPONS!=="undefined"&&!!WEAPONS[b]); }catch(er){ return false; } }
export function mwH(it,ix){ if(!mwEligible(it)) return ""; const on=!!it.mw;
  return '<div class="mwsw"><div class="mwsw-t"><b>Masterwork</b><small>Counts this '+(typeof ARMOR!=="undefined"&&ARMOR[mwBase(it.n)]?'armor':'weapon')+' as Masterwork for the rules that ask for it.</small></div><button type="button" role="switch" class="fxsw press'+(on?' on':'')+'" aria-checked="'+on+'" aria-label="Masterwork" data-imw="'+esc(it.key||it.n)+'" data-iix="'+ix+'"><i></i></button></div>'; }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-imw]"); if(!b) return; e.preventDefault(); e.stopPropagation();
  const it=invAt(b.getAttribute("data-imw"),b.getAttribute("data-iix")); if(!it) return; __R.undoMark((it.mw?"Remove":"Add")+" Masterwork");
  it.mw=!it.mw; b.setAttribute("aria-checked",!!it.mw); b.classList.toggle("on",!!it.mw); saveC(); try{ if(window.__bldSetMw&&it.n) window.__bldSetMw(it.n,__R.occOf(it),!!it.mw); }catch(_){ } __R.renderAll(); },true);
