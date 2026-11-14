import {bagTricksResourceManaged} from "./32n-logic-bag-tricks.js";
import {CF0,bindLive,cfFlags,cfSave,cfSkill,grpSpec,ico,oldNoteH,pinOn,pinnedH,profsH,renderSpeedDef,saveNotesH,setOf,xpBox} from "./00a-reg-late-ports.js";import {ABK,ABN} from "./02-data-default-character.js";import {GLOSS,SL14,athI,x14} from "./03-data-glossary.js";import {C,S,clsLv} from "./04-logic-storage.js";import {$,clamp,esc,num,senseList,sg} from "./05-logic-helpers.js";import {D} from "./06-logic-derivation.js";import {renderStamp} from "./07-ui-theme-contrast-spring.js";import {env} from "./00-env.js";bindLive("campName",{get:function(){return campName;}});bindLive("renderTiles",{get:function(){return renderTiles;}});
bindLive("used",{get:function(){return used;}});
/* ================= RENDER ================= */
export function campName(){ const v=(S&&typeof S.camp==="string")?S.camp:((C&&C.office)||""); return String(v).trim(); }/* v30 RU133 */
/* T1: the hidden empty place of a first public visit (ph) holds the sample build, so the tab keeps the page title until a real character is open */
const TITLE0=document.title;
function phOpen(){ try{ const r=JSON.parse(__store.getItem("cs-roster-v1")); if(!r||!r.chars) return !!env.__publicFresh; const a=r.chars[r.active]; return !!(a&&a.ph); }catch(e){ return false; } }
export function renderIdentity(){
  document.title = phOpen() ? TITLE0 : C.name+" | "+C.species+" "+clsLv();
  const cpn=campName(), mcp=$("#miniCamp"), icp=$("#idCamp"); if(mcp) mcp.textContent=cpn; if(icp){ icp.hidden=false; icp.innerHTML=cpn?ico("ui-flag")+'<span>'+esc(cpn)+'</span>':'<button type="button" class="camp-add" data-campadd="1">'+ico("ui-flag")+'<span>Add campaign</span></button>';/* T10: an empty campaign offers itself */ }
  $("#officeName").textContent = cpn || C.office || "Character Record"; $("#officeSub").textContent = C.name+" \u2022 "+clsLv(); renderStamp();
  $("#miniName").textContent = C.name;
  $("#miniSub").textContent = C.species+" "+clsLv();
  $("#idTop").innerHTML = '<b>'+esc((C.office||"Character Record").toUpperCase())+'</b><span>'+(C.cardNo?'No. '+esc(C.cardNo):'Level '+D.level)+'</span>';
  $("#idName").textContent = C.name;
  const f=[["Species",C.species,grpSpec("species")],["Class",clsLv(),grpSpec("class")],[(x14()&&SL14[String(C.cls||"").split(/[\s/,]/)[0]])||"Subclass",C.sub,grpSpec("sub")],["Background",C.bg,grpSpec("bg")],["Size",C.size,"g:Size"]];
  $("#idF").innerHTML = f.filter((x) =>{return x[1]}).map((x) =>{const em=idArt(x[0],x[1]);/* every chip gets a Codex picture, or none does */ return '<dt>'+x[0]+'</dt><dd'+(em?' data-ico="1"':'')+'>'+em+(x[2]?'<button type="button" class="tx" data-info="'+esc(x[2])+'">'+esc(x[1])+'</button>':esc(x[1]))+'</dd>'}).join("");
  $("#pbAside").innerHTML = '<button type="button" class="bd" data-bd="pb" style="border-radius:6px;padding:0 4px">Proficiency '+sg(D.pb)+'</button>';
  xpBox();/* v22 RU63 */
}
function idArt(lbl,val){
 const {A}=idArtStep1(); if(!A||!A.icon||(env.__idNoArt&&env.__idNoArt())) return "";
 const {sl, cls, im, has}=idArtStep2(A);
  if(lbl==="Class"){ const ck=cls.toLowerCase(); if(A.emblem&&A.emblem[ck]) return im("img/emblem/"+ck); return has("cat","class")?im("img/icon/cat/class"):""; }
  if(lbl==="Species"){ const k=sl(val); return has("species",k)?im("img/icon/species/"+k):im5(A,"species",k)||(has("species","custom")?im("img/icon/species/custom"):""); }
  if(lbl==="Background"){ const b=sl(val); return has("background",b)?im("img/icon/background/"+b):im5(A,"background",b)||(has("background","custom")?im("img/icon/background/custom"):""); }
  if(lbl==="Size"){ const z=sl(val); return has("size",z)?im("img/icon/size/"+z):""; }
  const {e}=idArtStep3(cls, val); return e||(has("cat","subclass")?im("img/icon/cat/subclass"):""); }
/* the 5etools picture of a species or background whose Codex icon was dropped (manifest icon5), cropped to the chip */
function im5(A,c,k){ const m=A.icon5&&A.icon5[c]; return m&&m[k]?'<img class="art-sub art-5e" src="data/img/'+encodeURI(m[k])+'.webp" width="24" height="24" alt="" decoding="async">':""; }
function idArtStep1(){
const A=env.__ART;
  return /** @type {any} */ ({A});
}
function idArtStep2(A){
const sl=function(n){ return String(n||"").toLowerCase().replace(/['\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }, cls=String(C.cls||"").split(/[\s\/,]/)[0];
  const im=function(u){ return '<img class="art-sub" src="'+u+'.avif" width="24" height="24" alt="" decoding="async">'; }, has=function(c,k){ return A.icon[c]&&A.icon[c].indexOf(k)>=0; };
  return /** @type {any} */ ({sl, cls, im, has});
}
function idArtStep3(cls, val){
  const e=env.__artSub?env.__artSub(cls,val,24):"";
  return /** @type {any} */ ({e});
}
export function renderAbilities(){
  const SC=setOf("ab")==="score";/* v25 RU38 no. 6: score on top */
  $("#abil").innerHTML = ABK.map((k) =>{
    const key = !!(C.saves && C.saves[k]);
    return '<button type="button" class="ab bd'+(key?' key':'')+'" data-bd="ab-'+k+'" title="'+ABN[k]+'"><span class="k">'+ABN[k]+'</span><span class="ks" aria-hidden="true">'+k+'</span><span class="m">'+(SC?D.score[k]:sg(D.mod[k]))+'</span><span class="s">'+(SC?sg(D.mod[k]):D.score[k])+'</span><span class="sv">Save '+sg(D.save[k])+(key?' \u2022':'')+'</span></button>';
  }).join("");
}
export function renderTiles(){
  const shield = '<svg viewBox="0 0 76 84" fill="none" aria-hidden="true"><path d="M38 3 71 14v25c0 21-14 36-33 42C19 75 5 60 5 39V14z" stroke="currentColor" stroke-width="2"/><path d="M38 9 65 18v21c0 17-11 30-27 35C22 69 11 56 11 39V18z" stroke="currentColor" stroke-width="1" opacity=".5"/></svg>';
  setTimeout(() =>{ const tl=$("#tiles"); if(!tl) return; let pe=document.getElementById("pinsBox"); if(!pe){ pe=document.createElement("div"); pe.id="pinsBox"; tl.parentNode.insertBefore(pe,tl.nextSibling); } pe.innerHTML=pinnedH();
    let on=document.getElementById("oldNote"), pm=document.getElementById("p-main"); if(!on&&pm){ on=document.createElement("div"); on.id="oldNote"; pm.insertBefore(on,pm.firstChild); } if(on) on.innerHTML=oldNoteH(); },0);/* v27 RU35 no. 9, RU28 */
  $("#tiles").innerHTML =
    '<button type="button" class="tile ac bd" data-bd="ac">'+shield+'<span class="k">Armor Class</span><span class="v">'+D.ac+'</span></button>'+
    '<button type="button" class="tile bd" data-bd="init"><span class="k">Initiative</span><span class="v">'+sg(D.init)+'</span><span class="n">Dexterity'+cfFlags((CF0().chk||[]).concat(CF0().init||[]))+'</span></button>'+
    '<button type="button" class="tile bd" data-bd="speed"><span class="k">Speed</span><span class="v">'+D.speed+'<small>ft</small></span><span class="n">Walking</span></button>'+
    '<button type="button" class="tile bd" data-bd="pb"><span class="k">Proficiency</span><span class="v">'+sg(D.pb)+'</span><span class="n">Bonus</span></button>'+    (x14()&&athI()>=0?'<button type="button" class="tile bd" data-bd="sk-'+athI()+'"><span class="k">Grapple</span><span class="v">'+sg(D.skill[athI()])+'</span><span class="n">Athletics, contested</span></button>':'<button type="button" class="tile bd" data-bd="dc"><span class="k">Grapple DC</span><span class="v">'+D.dc+'</span><span class="n">Strength or Dexterity save</span></button>')+
    '<button type="button" class="tile insp press" id="insp" aria-pressed="'+S.insp+'"><span class="ib" role="button" aria-label="About Heroic Inspiration" data-info="g:Heroic Inspiration">i</span><span class="k">Heroic Inspiration</span><span class="gem"></span><span class="n" id="inspN">'+(S.insp?"Ready":"None")+'</span></button>';
}
export function renderSkillsPage(){
  $("#saves").innerHTML = ABK.map((k) =>{
    const on=!!(C.saves&&C.saves[k]);
    return '<div class="row'+(on?' pr':'')+'"><span class="dot'+(on?' on':'')+'"></span><span class="nm"><button type="button" class="tx" data-info="g:'+ABN[k]+'">'+k+'</button>'+cfFlags(cfSave(k))+'</span><button type="button" class="bonus bd" data-bd="save-'+k+'">'+sg(D.save[k])+'</button></div>';
  }).join("")+saveNotesH();
  renderSpeedDef();/* RU35 no. 7 */
  $("#senses").innerHTML =
    '<div class="sense"><button type="button" class="bonus bd" data-bd="pas-per">'+D.pas_per+'</button><button type="button" class="tx" data-info="g:Passive Perception">Passive Perception</button></div>'+
    '<div class="sense"><button type="button" class="bonus bd" data-bd="pas-ins">'+D.pas_ins+'</button><button type="button" class="tx" data-info="g:Insight">Passive Insight</button></div>'+
    '<div class="sense"><button type="button" class="bonus bd" data-bd="pas-inv">'+D.pas_inv+'</button><button type="button" class="tx" data-info="g:Investigation">Passive Investigation</button></div>'+
    (num(C.darkvision,0)?'<div class="sense"><button type="button" class="bonus bd" data-bd="dark">'+num(C.darkvision)+'</button><button type="button" class="tx" data-info="g:Darkvision">Darkvision, ft</button></div>':'')+
    senseList().map((x) =>{ const s=x[0]; return '<div class="sense"><button type="button" class="bonus bd" data-bd="sense-'+x[1]+'">'+num(s.v,0)+'</button><button type="button" class="tx" data-bd="sense-'+x[1]+'">'+esc(s.n)+', ft</button></div>'; }).join(""); /* RU19 */
  $("#profs").innerHTML = profsH();/* v23 RU36 no. 7 */
  $("#skills").innerHTML = C.skills.map((s,i) =>{
    const p=num(s.p,0);
    const flag = cfFlags(cfSkill(s))+(s.dis ? '<span class="flag" title="Disadvantage">DIS</span>' : (s.hb ? '<span class="flag hb" title="Retromistika Playtest, Skills">HB</span>' : ""));
    return '<div class="row'+(p?' pr':'')+'"><button type="button" class="pinb'+(pinOn(s.n)?' on':'')+'" data-pin="'+esc(s.n)+'" aria-pressed="'+pinOn(s.n)+'" aria-label="Pin '+esc(s.n)+' to the Main tab"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6l-1 6 4 3v2H6v-2l4-3z"/><path d="M12 14v7"/></svg></button><span class="dot'+(p?' on':'')+'"'+(p===2?' style="box-shadow:0 0 0 2px var(--panel),0 0 0 3.5px var(--stamp)"':'')+'></span><span class="ab3">'+s.ab+'</span><span class="nm">'+(GLOSS[s.n]?'<button type="button" class="tx" data-info="g:'+esc(s.n)+'">'+esc(s.n)+'</button>':esc(s.n))+flag+'</span><button type="button" class="bonus bd" data-bd="sk-'+i+'">'+sg(D.skill[i])+'</button></div>';
  }).join("");
  syncLang();
}
function langList(){ return S.lang.filter((x) =>{return x && x.trim()}); }
export function langText(){ const l = langList(); return l.length? l.map(esc).join(", ") : "Common"; }
export function syncLang(){ const el=$("#langLine"); if(el) el.innerHTML = langText() + (langList().length<3 ? ' <span style="color:var(--faint)">('+(3-langList().length)+' open)</span>' : ""); }

/* m6: a pool resource (Lay on Hands, max 5 x level) shows the points left with - and + instead of one box per point */
export function boxes(used,max,key,lbl,pool){if(bagTricksResourceManaged(key))return '<span class="muted" role="status" aria-label="'+esc(lbl)+': '+used+' of '+max+' used">'+used+' / '+max+' — resolve draws and dawn in the Bag of Tricks panel.</span>'; if(pool) return '<span class="pool"><button type="button" class="plb" data-k="'+key+'" data-pd="-1" aria-label="'+esc(lbl)+': spend 1">\u2212</button><input class="pli" type="number" inputmode="numeric" min="0" max="'+max+'" step="1" value="'+(max-used)+'" data-k="'+key+'" aria-label="'+esc(lbl)+': points left"><button type="button" class="plb" data-k="'+key+'" data-pd="1" aria-label="'+esc(lbl)+': restore 1">+</button><small>of '+max+'</small></span>';
  let h=""; for(let i=0;i<max;i++) h+='<button type="button" class="bx" aria-pressed="'+(i<used)+'" data-k="'+key+'" data-i="'+i+'" aria-label="'+esc(lbl)+' '+(i+1)+'"></button>'; return h; }
export function used(k,max){ const u=num(S.used[k],0); return clamp(u,0,max); }
export function __set_renderAbilities(v){ return renderAbilities=v; }
export function __set_renderTiles(v){ return renderTiles=v; }
export function __set_renderSkillsPage(v){ return renderSkillsPage=v; }
