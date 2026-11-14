import {timedDefensesControl} from './21u-ui-timed-defenses.js';
import {swimClimbGlovesControl} from './21t-ui-swim-climb-gloves.js';
import {magicRopesControl} from './21s-ui-magic-ropes.js';
import {birdTokenControl} from './21r-ui-bird-token.js';
import {defenderControl} from './21q-ui-defender.js';
import {hornValhallaControl} from './21p-ui-horn-valhalla.js';
import {bagTricksControl} from './21o-ui-bag-tricks.js';
import {studyBooksControl} from './21n-ui-study-books.js';
import {necronomiconReadingControl} from './21l-ui-necronomicon-reading.js';
import {slotRecoveryControl} from './21k-ui-slot-recovery.js';
import {storedSpellPhysicalControl} from './21j-ui-stored-spells.js';
import {spellGemPhysicalControl} from './21i-ui-spell-gem.js';
import {spellwroughtNeedleControl} from './21h-ui-spellwrought-needle.js';
import {turnDamageControls} from './08f-ui-turn-damage.js';
import {supremeHealingControls} from './08g-ui-supreme-healing.js';
import {divineInterventionControls} from './08h-ui-divine-intervention.js';
import {ordersWrathControls} from './08i-ui-orders-wrath.js';
import {riddenVehicleControl} from './21g-ui-ridden-vehicles.js';
import {temporaryCantripControl} from './21f-ui-temporary-cantrip.js';
import {spellSourceRollControls} from "./23f-ui-spell-source-rolls.js";
import {carpetVehicleControl} from "./21e-ui-carpet-vehicles.js";
import {toolFormControl} from "./29c-ui-tool-forms.js";
import {objectRepairSummary} from "./32c-ui-object-repair.js";
import {weaponWieldControl,weaponWieldAttackControl} from "./21c-ui-wield-minimum.js";
import {weaponFormControl} from "./21b-ui-weapon-forms.js";
import {attunementControl} from "./21a-ui-attunement.js";
/* Detail cards, part b: spell targets, info card renderers, close and sheet width (split from 13, SOLID stage 12) */
import {ammoFor,ammoH,ammoPickH,bindLive,clsOfG,crBlock,crOf,ctH,dockOff,fch,featNums,featSpL,hpSpellNote,ico,itemRes,lateGet,libDetail,morphStop,moveCtl,occOf,ordL,packH,pgGuess,pinSpBtn,renderAll,resOf,scOf,shClosed,shDragEnd,spCastH,spFx,spFxBlock,spRowLv,spnHTML,spxBody,srcPg,svgI,tmpFeatH,tmpSpellH,tyIcon,undoMark,useH} from "./00a-reg-late-ports.js";import {ABK,ABN,HB_CONDS,STD_CONDS} from "./02-data-default-character.js";import {GLOSS,gName} from "./03-data-glossary.js";import {C,S,saveC} from "./04-logic-storage.js";import {$,atkOn,eqOn,esc,fmtW,invAt,itemHtml,num,qtyCtl,rich,sg,toast} from "./05-logic-helpers.js";import {B,D,fill,richB,richP} from "./06-logic-derivation.js";import {aylH,aylSplit,spSum} from "./08b-ui-render-summaries-actions.js";import {used} from "./08-ui-render-sheet-and-actions.js";import {hpDockBack} from "./09-ui-hit-points-playbar-death-saves.js";import {__set_SWP,__set_navStack,__set_sheetMode,lastFocus,sheet,sheetMode} from "./12-ui-bottom-sheet-modal.js";import {env} from "./00-env.js";import {DETAIL} from "./06a-logic-ui-registry.js";import {NUM_MAP,XL_SELF,__set_XL_SELF,dcFoot,dcHead,dcItem,dcStrip,fKind,fKindIco,kwChips,linkify,meta,miHTML,tileBd,tileH,tileS,wCell,xlink} from "./13-ui-detail-cards.js";
import {martyrActH} from "./32e-logic-martyr-actions.js";
bindLive("closeSheet",{get:function(){return closeSheet;}});bindLive("closeSheetIfOn",{get:function(){return closeSheetIfOn;}});
bindLive("infoHTML",{get:function(){return infoHTML;}});
const SP_TGT_OVR={"Scorching Ray":"Multiple","Animate Dead":"Multiple","Create Undead":"Multiple","Speak with Dead":"Single","Find Traps":"Special","Dancing Lights":"Special","Prestidigitation":"Special","Thaumaturgy":"Special","Illusory Script":"Object","Create Food and Water":"Special","Teleportation Circle":"Special","Arcane Eye":"Special","Leomund's Secret Chest":"Object","Project Image":"Special","Arcane Gate":"Special","Gate":"Summon","Planar Ally":"Summon","Find Familiar":"Summon","Unseen Servant":"Summon","Phantom Steed":"Summon","Tenser's Floating Disk":"Summon","Mordenkainen's Faithful Hound":"Summon","Tasha's Bubbling Cauldron":"Object","Animate Objects":"Multiple","Passwall":"Special","Move Earth":"Special","Earthquake":"Special","Tsunami":"Special","Mirage Arcane":"Special","Guards and Wards":"Special","Forbiddance":"Special","Guardian of Faith":"Summon"};
/* spTgt: what a spell hits. k = Sphere, Cube, Cone, Line, Cylinder, Emanation (area, n = size in feet), Single, Multiple, Self, Touch, Object, Wall, Summon, Special */
function spTgt(x){
 const _spTgtStep1=spTgtStep1(x);
 const {rng, nm, t, a, SH}=_spTgtStep1;
 let {m}=_spTgtStep1;
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
function spTgtStep1(x){
let rng=String(x.r||""), nm=x.n||"", t=String(x.full||x.sum||""), fx=x.fx||(typeof SPELL_FX!=="undefined"&&SPELL_FX[x.n])||null, a=fx&&fx.area, m, SH={sphere:"Sphere",cube:"Cube",cone:"Cone",line:"Line",cylinder:"Cylinder",emanation:"Emanation",hemisphere:"Sphere",square:"Cube"};
  return /** @type {any} */ ({rng, nm, t, a, SH, m});
}
const TGT_LAB={Sphere:["Area","Sphere"],Cube:["Area","Cube"],Cone:["Area","Cone"],Line:["Area","Line"],Cylinder:["Area","Cylinder"],Emanation:["Area","Emanation"],Single:["Target","Single target"],Multiple:["Target","Multiple targets"],Self:["Target","Self"],Object:["Target","Object"],Wall:["Area","Wall"],Summon:["Effect","Summons a creature"],Special:["Effect","Special"]};
const TGT_SIZE={Sphere:" ft radius",Cube:" ft cube",Cone:" ft cone",Line:" ft long",Cylinder:" ft radius",Emanation:" ft from you"};
function spTgtCell(x){ const o=spTgt(x), L=TGT_LAB[o.k]||["Target",o.k], big=/^(Sphere|Cube|Cone|Line|Cylinder|Emanation)$/.test(o.k), ik=big?"tgt-"+o.k.toLowerCase():"tgt-"+(o.k==="Single"?"single":o.k==="Multiple"?"multi":o.k.toLowerCase());
  return [ik,L[0],esc(L[1])+(o.n?'<span class="dc-sz">'+o.n+(TGT_SIZE[o.k]||" ft")+'</span>':'')]; }
function spEffCell(x){ const sv=x.sv,sc=sv?scOf(x):null; if(sv==="ATK") return ["fx-attack","Effect","Spell attack"+(Number.isFinite(sc.atk)?" "+sg(sc.atk):"")]; if(sv) return ["fx-save","Effect",esc(String(sv).toUpperCase())+" save"+(Number.isFinite(sc.dc)?", DC "+esc(sc.dc):"")]; return ["fx-auto","Effect","No roll"]; }
export function infoHTML(spec){
  let i0=spec.indexOf(":"), t0=spec.slice(0,i0), k0=spec.slice(i0+1), prev=XL_SELF, me="";/* a name in its own dialog is not linked to itself */
  try{ const d0=DETAIL.get(t0); if(d0&&d0.self) me=d0.self(k0); }catch(e){ me=""; }
  __set_XL_SELF(me); try{ return infoHTML0(spec); } finally{ __set_XL_SELF(prev); }
}
DETAIL.add("spn", {
  render:function(key){ let h="";
  return spnHTML(key);
  },
  self:function(k){ return ((k) =>k)(k); }
});
DETAIL.add("mi", {
  render:function(key){ let h="";
  return miHTML(key);
  },
  self:function(k){ return ((k) =>k)(k); }
});
DETAIL.add("lib", {
  render:function(key){ let h="";
  const bar=key.indexOf("|"), ld=typeof lateGet("libDetail")==="function"&&libDetail(key.slice(0,bar),key.slice(bar+1)); return ld?{t:ld.t,h:ld.h}:{t:key.slice(bar+1),h:'<p class="info-d">Not found.</p>'};
  },
  self:function(k){ return ((k) =>k.slice(k.lastIndexOf("|")+1))(k); }
});
DETAIL.add("g", {
  render:function(key){ let h="";
  const g=GLOSS[key]; if(!g) return {t:key, h:'<p class="info-d">No details yet.</p>'};
    const _render3Step1=render3Step1(h, g, key);
    const {fl}=_render3Step1;
    h=_render3Step1.h;
 ({h}=render3Step2(fl, h, key));
    return {t:key, h:h};
  },
  self:function(k){ return ((k) =>k)(k); }
});
function render3Step1(h, g, key){
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
    const fl=[];
  return /** @type {any} */ ({fl, h});
}
function render3Step2(fl, h, key){
(C.features||[]).forEach((gr,gi) =>{ (gr.items||[]).forEach((f,fi) =>{ if(String(f.d).indexOf("[["+key+"]]")>=0 || String(f.d).indexOf("[["+key+"|")>=0) fl.push([gi,fi]); }); });
    if(fl.length) h+='<div class="info-h">Your features that mention this</div><div class="info-l">'+fl.map((x) =>{ const f=C.features[x[0]].items[x[1]]; return '<button type="button" data-info="f:'+x[0]+'.'+x[1]+'">'+esc(f.n)+'<span>'+esc(f.s)+'</span></button>'; }).join("")+'</div>';
  return /** @type {any} */ ({h});
}
DETAIL.add("cr", {
  render:function(key){ let h="";
  const cp=key.split("|"), cc=crOf(cp[0]); if(!cc) return {t:"Creature", h:'<p class="info-d">Not found.</p>'}; return {t:cc.n, h:crBlock(cc,cp.slice(1).join("|"))};
  },
  self:function(k){ return ((k) =>k.split("|")[0])(k); }
});
DETAIL.add("xd", {
  render:function(key){ let h="";
  const xd=(C.xdmg||[])[+key]; if(!xd) return {t:"Feature", h:""}; return {t:xd.n, h:meta(xd.sub,"")+'<div class="info-k">'+tileH("Damage",esc(xd.dmg)+tyIcon(xd.type))+tileS("Type",xd.type)+(xd.save?tileS("Save",xd.save+" DC "+xd.dc):"")+'</div><p class="info-d">'+esc(xd.note)+'</p>'};
  }
});
function typedTattooSpellGuide(key){const row=(C.spells||[])[+key];if(!row||!['fixedSpellSource','tattooSource','gemSpellcasting','storedSpellcasting','storedSpellSlotLevel'].some(field=>Object.prototype.hasOwnProperty.call(row,field)))return null;if(row.fixedSpellSource&&row.fixedSpellSource.kind==='stored-spell'||['storedSpellcasting','storedSpellSlotLevel'].some(field=>Object.prototype.hasOwnProperty.call(row,field)))return {t:row.n||'Stored spell',h:'<section class="jform" data-roll-controls="own"><p>Use the physical ring or Reserve stone’s inventory controls to cast a stored spell. Resolve its original effects from recorded release history. This saved spell entry cannot cast or roll; its data is preserved.</p><button type="button" class="btn press" data-stored-receipts-open>Review original stored spell releases</button></section>'};if(row.fixedSpellSource&&row.fixedSpellSource.kind==='spell-gem'||Object.prototype.hasOwnProperty.call(row,'gemSpellcasting'))return {t:row.n||'Gem spell',h:'<section class="jform" data-roll-controls="own"><p>Use the physical Spell Gem’s inventory controls to release or imbue it. Resolve an original release from its recorded history. This saved spell entry cannot cast or roll; its data is preserved.</p><button type="button" class="btn press" data-gem-receipts-open>Review original Gem releases</button></section>'};return {t:row.n||'Tattoo spell',h:'<section class="jform" data-roll-controls="own"><p>Review this character’s body tattoos to use an applied tattoo or resolve its original spell effects. This saved spell entry cannot cast or roll. Its data is preserved.</p><button type="button" class="btn press" data-tattoo-body-open>Review body tattoos</button></section>'}}
DETAIL.add("sp", {
  render:function(key){
 const tattooGuide=typedTattooSpellGuide(key);if(tattooGuide)return tattooGuide;
 const _render4Step1=render4Step1(key);
 const {x}=_render4Step1;
 let {h}=_render4Step1; if(!x) return {t:"Spell", h:"<p class=\"info-d\">Not found.</p>"};
    const {sch, fxb}=render4Step2(x, key);
    h=objectRepairSummary(+key)+renderPart1(x, sch)+spellSourceRollControls(x,+key)+(fxb?'<div class="dc-ayl">'+fxb+'</div>':'')+hpSpellNote(x)+tmpSpellH(x,lateGet("spLvSel")[x.n]!=null?lateGet("spLvSel")[x.n]:spRowLv(x))+'<div class="dc-use">'+spCastH(x,+key)+pinSpBtn(x)+'</div>'+
      dcFoot(esc(x.sch)+' \u2022 '+esc(x.cls||""),esc(x.pg?srcPg("PHB-2024",x.pg):String(x.src||"")))+'</div>';/* v36 p14, was v23 RU36 no. 11 */
    return {t:x.n, h:h};
  },
  self:function(k){ return ((k) =>((C.spells||[])[+k]||{}).n||"")(k); }
});
function renderPart1(x, sch){ return ('<div class="dc dc-sp" data-roll-controls="own">'+dcHead(x.l?'<b>'+x.l+'</b><small>LVL</small>':ico("school-"+sch,"isch"),ico("school-"+sch,"isch")+'<i>'+(x.l?ordL(x.l)+" ":"")+esc(x.sch)+(x.l?"":" cantrip")+'</i> \u2022 '+esc(x.use)+' ('+esc(x.src||"")+')')+
      dcStrip([[/^Bonus/.test(x.ct)?"time-bonus":/^Reaction/.test(x.ct)?"time-reaction":/^Action/.test(x.ct)?"time-action":"time-long","Time",esc(x.ct)+(x.rit?' <i class="sp-c rit">R</i>':'')],["fx-reach","Range",esc(String(x.r||"").replace(/ ft$/," ft."))],spTgtCell(x),[/^V/.test(x.cmp)?"comp-v":"comp-s","Components",esc(x.cmp)],[x.conc?"tag-concentration":"ui-moon","Duration",esc(x.dur)+(x.conc?' <i class="sp-c">C</i>':'')],spEffCell(x)],"dc-s6")+
      spSum(x)+'<div class="dc-body"><p class="info-d">'+kwChips(richP(x.full||x.sum))+'</p>'+((x.mat||(spFx(x)||{}).mat)&&/M/.test(x.cmp)?'<p class="info-d dc-mat"><b>Material:</b> '+esc(x.mat||spFx(x).mat)+'</p>':'')+'</div>'); }
function render4Step1(key){
 const _render2Step1=render2Step1(key);
 const {x}=_render2Step1;
 let {h}=_render2Step1;
  return /** @type {any} */ ({x, h});
}
function render4Step2(x, key){
    const {sch, fxb}=render2Step2(x, key);
  return /** @type {any} */ ({sch, fxb});
}
function render2Step1(key){
let h="";
  const x=(C.spells||[])[+key], sc=scOf(x);
  return /** @type {any} */ ({h, x});
}
function render2Step2(x, key){
    const sch=String(x.sch||"").toLowerCase(), fxb=spFxBlock(x,key);
  return /** @type {any} */ ({sch, fxb});
}
DETAIL.add("spx", {
  render:function(key){ let h="";
  return {t:"Spells cast on you", h:spxBody()};
  }
});
function clericFeatureControlHTML(name){if(name==="Supreme Healing"||name==="Channel Divinity")return supremeHealingControls();if(name==="Divine Intervention"||name==="Greater Divine Intervention")return divineInterventionControls();return name==="Order's Wrath"?ordersWrathControls():""}
DETAIL.add("f", {
  render:function(key){ let h="";
  const ix=key.split("."), gr=(C.features||[])[+ix[0]], f=gr&&(gr.items||[])[+ix[1]];
    if(!f) return {t:"Feature", h:'<p class="info-d">This feature was removed.</p>'};
    const cl0=clsOfG(gr.g), sd=aylSplit(f.d,cl0), sf=aylSplit(f.full,cl0), ay=sf.a||sd.a;/* v35 p15 (RU129): full text, then the summary, then At your level */
    const fk=fKind(f), rl0=resOf(f.n), r0=rl0[0];
    h='<div class="dc dc-f">'+dcHead(ico(fKindIco(fk),"isch"),esc(gName(gr.g)))+dcStrip([[fKindIco(fk),"Time",esc(fk)],["ui-uses","Uses",r0?esc((r0.max-used(r0.k,r0.max))+" of "+r0.max):"At will"],[r0&&/short/.test(r0.reset)?"rest-short":r0&&r0.reset==="none"?"ui-reset":"rest-long","Resets",r0?esc({short:"Short or Long Rest",short1:"1 per Short Rest",long:"Long Rest",none:"Never"}[r0.reset]||"\u2014"):"\u2014"],["ui-book","Source",esc(srcPg(f.s,pgGuess(gr,f)))]])+'<div class="dc-body">'+kwChips(f.full?'<p class="info-d info-full">'+fch(featNums(richP(fill(sf.t)),cl0))+'</p>'+(sd.t?'<p class="info-sum">'+featNums(richB(fill(sd.t.split(/\s*\*\*Your choice\.\*\*/)[0])),cl0)+'</p>':''):'<p class="info-d">'+fch(featNums(richB(fill(sd.t)),cl0))+'</p>')+'</div>'+aylH(ay,cl0)+featSpL(gr,f);
    if(r0){ const lf0=r0.max-used(r0.k,r0.max); h+='<div class="dc-use"><div class="spcast"><button type="button" class="btn pri press'+(lf0?'':' off')+'" data-usef="'+esc(r0.k)+'|-1"'+(lf0?'':' disabled')+'>Use '+esc(f.n)+' <small>'+lf0+' left</small></button>'+(lf0<r0.max?'<button type="button" class="btn press" data-usef="'+esc(r0.k)+'|1">Give back one use <small>undo</small></button>':'')+'</div>'+(lf0?'':'<p class="muted spcn">No uses left. '+esc({short:"A Short or Long Rest restores them.",short1:"A Short Rest restores one use.",long:"A Long Rest restores them.",none:"They do not come back."}[r0.reset]||"")+'</p>')+'</div>'; }/* v36 p17 */
    h+=tmpFeatH(f)+clericFeatureControlHTML(f.n);/* v21 RU55 */ h+=martyrActH(f);
    h+='<p class="bk-f"><button type="button" class="lk" data-info="grp:'+ix[0]+'">See everything from '+esc(gName(gr.g))+'</button></p></div>';
    return {t:f.n, h:h};
  },
  self:function(k){ return ((k) =>{ const q=k.split("."), g_=(C.features||[])[+q[0]]; return ((g_&&g_.items||[])[+q[1]]||{}).n||""; })(k); }
});
DETAIL.add("grp", {
  render:function(key){ let h="";
  const G=(C.features||[])[+key]; if(!G) return {t:"Group", h:""};
    h=meta("Features",'')+'<div class="info-l">'+(G.items||[]).map((f,fi) =>{ return '<button type="button" data-info="f:'+key+'.'+fi+'">'+esc(f.n)+'<span>'+esc(f.s)+'</span></button>'; }).join("")+'</div>'+(G.next?'<p class="bk-f">'+esc(G.next)+'</p>':'');
    return {t:G.g, h:h};
  }
});
DETAIL.add("w", {
  render:function(key){ let h="";
  const a=(C.attacks||[])[+key], d=D.atk[+key]; if(!a) return {t:"Attack", h:""};
    const wieldBlocked=weaponWieldAttackControl(a);if(wieldBlocked)return {t:a.n,h:wieldBlocked};
    h='<div class="dc dc-w">'+dcHead(ico("time-action","isch"),esc(a.dieSrc||"Attack"))+'<div class="dc-strip dc-s4 info-k">'+wCell("fx-attack","To hit",sg(d.hit),"ah-"+key)+wCell("hp-damage","Damage",esc(d.dmg),"ad-"+key)+wCell("fx-reach","Range",esc(a.range||"\u2014"))+wCell("item-weapon","Type",esc(a.type||"\u2014"),"",lateGet("DT_ICON")[String(a.type||"").split(/[ ,]/)[0]]?svgI(lateGet("DT_ICON")[String(a.type||"").split(/[ ,]/)[0]],"ico dc-ci",""):"")+'</div>';
    if(a.sub) h+='<div class="info-h">Properties</div><p class="info-d">'+linkify(a.sub)+'</p>';
    if(a.m) h+='<div class="info-h">Mastery: '+(GLOSS[a.m]?'<button type="button" class="lk" data-info="g:'+esc(a.m)+'">'+esc(a.m)+'</button>':esc(a.m))+'</div>'+(GLOSS[a.m]?'<p class="info-d">'+rich(GLOSS[a.m].d)+'</p>':'');
    if(a.note) h+='<div class="info-h">Notes</div><p class="info-d">'+esc(a.note)+'</p>';
    h+=ammoPickH(a)+ammoH(ammoFor(a));/* v21 RU51, v102 magic ammunition */
    if(GLOSS[a.n]) h+='<div class="info-h">Base weapon</div><p class="info-d">'+rich(GLOSS[a.n].d)+'</p>';
    return {t:a.n, h:h+turnDamageControls(a,+key)+'</div>'};
  }
});
DETAIL.add("it", {
  render:function(key){ let h="";
  const it=(C.inv||[])[+key]; if(!it) return {t:"Item", h:""};
    if(it.html){ const dci=dcItem(itemHtml(it)); return {t:it.n, h:'<div class="dc dc-i">'+dci.h+'</div><div class="idetail">'+xlink(dci.rest,it.n)+(it.pg?'<p class="info-d" style="color:var(--faint)">Source: '+esc(srcPg("DMG-2024",it.pg))+'.</p>':'')+(it.west?'<p class="info-d" style="color:var(--faint)">Weight '+fmtW(num(it.w,0))+' lb is an estimate: the DMG gives none for this item.</p>':'')+'</div>'+packH(it,+key)+ctH(it,+key)+useH(it,+key)+qtyCtl(it,+key)+weaponWieldControl(it)+attunementControl(it,+key)+weaponFormControl(it,+key)+toolFormControl(it,+key)+carpetVehicleControl(it,+key)+riddenVehicleControl(it,+key)+temporaryCantripControl(it,+key)+spellwroughtNeedleControl(it,+key)+spellGemPhysicalControl(it,+key)+storedSpellPhysicalControl(it,+key)+slotRecoveryControl(it,+key)+timedDefensesControl(it,+key)+swimClimbGlovesControl(it,+key)+magicRopesControl(it,+key)+birdTokenControl(it,+key)+defenderControl(it,+key)+hornValhallaControl(it,+key)+bagTricksControl(it,+key)+studyBooksControl(it,+key)+necronomiconReadingControl(it,+key)+mwH(it,+key)+itemRes(it)+moveCtl(it,+key)+'<div class="iacts">'+(it.equippable?'<button type="button" class="btn press" data-ieqs="'+esc(it.key||it.n)+'" data-iix="'+(+key)+'">'+(eqOn(it)?"Unequip":"Equip")+'</button>':'')+'<button type="button" class="idel" data-idel="'+esc(it.key||it.n)+'" data-iix="'+(+key)+'">DELETE</button></div>'}; }
    ({h}=renderStep1(it, h, key));
    return {t:it.n, h:h};
  },
  self:function(k){ return ((k) =>((C.inv||[])[+k]||{}).n||"")(k); }
});
function renderStep1(it, h, key){
    const base=GLOSS[it.n], q=num(it.q,1), w=num(it.w,0);
    h=meta(base?base.c:"Item", base?base.s:"")+'<div class="info-k">'+tileS("Quantity",q)+tileS("Weight",w?fmtW(q*w)+" lb":"\u2014")+(eqOn(it)?tileS("Status","Worn"):"")+'</div>';
    if(base) h+='<p class="info-d">'+rich(base.d)+'</p>';
    if(it.d) h+='<div class="info-h">Your note</div><p class="info-d">'+esc(it.d)+'</p>';
    const wl2=[]; (C.attacks||[]).forEach((a,ix) =>{ if((a.n===it.n||a.n===it.n+" (thrown)")&&atkOn(a)) wl2.push(ix); }); /* RU15 */
    if(wl2.length) h+='<div class="info-l">'+wl2.map((ix) =>{ return '<button type="button" data-info="w:'+ix+'">Attack with '+esc(C.attacks[ix].n)+'<span>'+sg(D.atk[ix].hit)+' to hit, '+esc(D.atk[ix].dmg)+'</span></button>'; }).join("")+'</div>';
    h+=packH(it,+key)+ctH(it,+key)+useH(it,+key)+qtyCtl(it,+key)+weaponWieldControl(it)+attunementControl(it,+key)+weaponFormControl(it,+key)+toolFormControl(it,+key)+carpetVehicleControl(it,+key)+riddenVehicleControl(it,+key)+temporaryCantripControl(it,+key)+spellwroughtNeedleControl(it,+key)+spellGemPhysicalControl(it,+key)+storedSpellPhysicalControl(it,+key)+slotRecoveryControl(it,+key)+timedDefensesControl(it,+key)+swimClimbGlovesControl(it,+key)+magicRopesControl(it,+key)+birdTokenControl(it,+key)+defenderControl(it,+key)+hornValhallaControl(it,+key)+bagTricksControl(it,+key)+studyBooksControl(it,+key)+necronomiconReadingControl(it,+key)+mwH(it,+key)+itemRes(it)+moveCtl(it,+key);
  return /** @type {any} */ ({h});
}
/* solid:orchestrator renderDetail */
function infoHTML0(spec){
  const i=spec.indexOf(":"), d=DETAIL.get(spec.slice(0,i));
  return d?d.render(spec.slice(i+1)):{t:"", h:""};
}
export function closeSheetIfOn(){ if(sheet.classList.contains("on")) closeSheet(); }
export function closeSheet(){ __set_SWP(null);/* v36 p18 */ __set_SWP(null);/* v36 p18 */
  hpDockBack();/* v30 */ morphStop();/* v31 p12 */
  $("#scrim").classList.remove("on"); sheet.classList.remove("on"); dockOff(); shClosed();/* v31 p14, p16 */
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
    if(!lateGet("mq").matches || e.target.closest("button")) return;
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
  function end(){ if(!dragging) return; dragging=false; sheet.classList.remove("drag"); const projected=dy+vel*180; shDragEnd(dy,vel,projected > sheet.offsetHeight*.35); }/* v31 p14: the finger speed goes into the spring */
  head.addEventListener("pointerup",end); head.addEventListener("pointercancel",end);
})();
/* v33 p08: pull down from the content to close, on phones, when the content is at its top */
(function(){ let body=$("#sheetBody"), y0=0, x0=0, dy=0, lastY=0, lastT=0, vel=0, st=0;/* st: 0 idle, 1 armed, 2 pulling, -1 scrolling */
  if(!body) return;
  const {scroller}=uiDetailCardsAnonStep1(body);
  body.addEventListener("touchstart",(e) =>{ st=-1; if(!lateGet("mq").matches||e.touches.length!==1||!sheet.classList.contains("on")) return; const t=e.target;
    if(t.closest&&t.closest("input,textarea,select,[contenteditable=true],.dragh")) return; const sc=scroller(t); if(sc.scrollTop>0||body.scrollTop>0) return;
    y0=lastY=e.touches[0].clientY; x0=e.touches[0].clientX; lastT=performance.now(); dy=0; vel=0; st=1; },{passive:true});
  body.addEventListener("touchmove",(e) =>{ if(st<1) return; const t=e.touches[0], ddy=t.clientY-y0, ddx=t.clientX-x0;
    if(st===1){ if(Math.abs(ddx)>8&&Math.abs(ddx)>Math.abs(ddy)){ st=-1; return; } if(ddy<-4){ st=-1; return; } if(ddy<10) return; st=2; sheet.classList.add("drag"); y0=t.clientY; }
    if(e.cancelable) e.preventDefault(); const now=performance.now(); dy=Math.max(0,t.clientY-y0); vel=(t.clientY-lastY)/Math.max(1,now-lastT); lastY=t.clientY; lastT=now; sheet.style.transform="translateY("+dy+"px)"; },{passive:false});
  function end(){ if(st===2){ sheet.classList.remove("drag"); shDragEnd(dy,vel,dy+vel*180>sheet.offsetHeight*.35); } st=0; }
  body.addEventListener("touchend",end); body.addEventListener("touchcancel",end);
})();
function uiDetailCardsAnonStep1(body){
  function scroller(t){ for(let e=t; e&&e!==body; e=e.parentElement){ if(e.scrollHeight>e.clientHeight+1){ const o=getComputedStyle(e).overflowY; if(o==="auto"||o==="scroll") return e; } } return body; }
  return /** @type {any} */ ({scroller});
}

/* FX toggles UI: Masterwork switch for armor and weapons (inventory flag "mw", missing = off) */
function mwBase(n){ return String(n||"").replace(/, (?:\+\d|Masterwork(?: \(\d+\))?)$/,"").replace(/ \([^()]*\)$/,""); }
export function mwEligible(it){ if(!it) return false; if(it.mw!=null) return true; const b=mwBase(it.n);
  try{ return (typeof ARMOR!=="undefined"&&!!ARMOR[b]&&b!=="Shield")||(typeof WEAPONS!=="undefined"&&!!WEAPONS[b]); }catch(er){ return false; } }
export function mwH(it,ix){ if(!mwEligible(it)) return ""; const on=!!it.mw;
  return '<div class="mwsw"><div class="mwsw-t"><b>Masterwork</b><small>Counts this '+(typeof ARMOR!=="undefined"&&ARMOR[mwBase(it.n)]?'armor':'weapon')+' as Masterwork for the rules that ask for it.</small></div><button type="button" role="switch" class="fxsw press'+(on?' on':'')+'" aria-checked="'+on+'" aria-label="Masterwork" data-imw="'+esc(it.key||it.n)+'" data-iix="'+ix+'"><i></i></button></div>'; }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-imw]"); if(!b) return; e.preventDefault(); e.stopPropagation();
  const it=invAt(b.getAttribute("data-imw"),b.getAttribute("data-iix")); if(!it) return; undoMark((it.mw?"Remove":"Add")+" Masterwork");
  it.mw=!it.mw; b.setAttribute("aria-checked",!!it.mw); b.classList.toggle("on",!!it.mw); saveC(); try{ if(env.__bldSetMw&&it.n) env.__bldSetMw(it.n,occOf(it),!!it.mw); }catch(_){ } renderAll(); },true);
