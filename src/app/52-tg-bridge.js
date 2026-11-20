import {bindLive} from "./00a-reg-late-ports.js";import {C,FROZEN,S,__set_C} from "./04-logic-storage.js";
import {num,toast} from "./05-logic-helpers.js";
import {B,D,__set_B,__set_D,derive} from "./06-logic-derivation.js";
import {uiGet} from "./07-ui-theme-contrast-spring.js";
import {rGet} from "./14-ui-editor.js";
import {uiSet} from "./15c-logic-file-state-compress.js";
import {spCalc,spFx} from "./22-ui-spell-data-and-slots.js";
import {scAdj} from "./23e-ui-spells-dc.js";
import {CU0,__set_CU0} from "./41-ui-edit-mode.js";
import {env} from "./00-env.js";
import {apaOf} from "./08b-ui-render-summaries-actions.js";
import {modeOn,modesAvail,rageDmg} from "./33-logic-play-rage-conditions.js";
bindLive("tgPcFor",{get:function(){return tgPcFor;}});
bindLive("tgPcNow",{get:function(){return tgPcNow;}});
/* T11 G7 TG1: what the Training Ground needs from the sheet, through window.__app (the Training Ground is a deferred part, src/tg).
   A player character for the engine (src/tg/20-engine.js fromSheet): Armor Class, Hit Point maximum, Speed, Initiative, saves and attacks,
   from the same derivation as the sheet. The open character is read as it is. Another character of the roster, or a class to try
   (built by the builder with its first choices), is derived on a copy and the open character is put back at once. Nothing is saved. */
function tgRange(t){ t=String(t||""); let reach=null, rng=null, m;
  if((m=/(\d+)\s*\/\s*(\d+)\s*ft/.exec(t))) rng=[+m[1],+m[2]]; else if((m=/range\s*(\d+)/i.exec(t))) rng=[+m[1],+m[1]];
  const rest=t.replace(/\d+\s*\/\s*\d+\s*ft/g,""); if((m=/(\d+)\s*ft/.exec(rest))) reach=+m[1];
  if(reach==null&&!rng) reach=5; return {reach:reach,rng:rng}; }
/* TG5 tier B spells: from the sheet's spells with numbers (SPELL_FX) and the spell list row (save or attack, casting time, range, Concentration).
   Dice per slot level come from spCalc, the same as the spell cards on the sheet. Spells without numbers stay on the manual list (tier C) */
function tgSpells(){
 const {out, man}=tgSpellsStep1(); if(typeof SPELLS==="undefined") return {list:out,manual:man};
 const {row, smod, top}=tgSpellsStep2();
  (C.spells||[]).forEach((x) => tgSpellsFn1(row, top, man, smod, out, x));
  return {list:out,manual:man}; }
function tgSpellsFn1(row, top, man, smod, out, x){ if(!x||!x.n) return; const r=row[x.n], f=spFx(x); if(!r){ return; }
 const {L, kind}=tgSpellsFn1Step1(x, r, f);
    if(!kind){ if(L===0||top>=L) man.push({n:x.n,l:L,t:r[11]||""}); return; }
    const {by, heal, rng, touch, self, area}=tgSpellsFn1Step2(r, f, L, top, x, smod, kind);
    tgSpellsFn1Step3(out, x, L, kind, r, touch, rng, self, area, f, by, heal); }
function tgSpellsFn1Step1(x, r, f){
const L=+x.l||0;
    const kind=r[10]==="ATK"?"atk":/^[A-Z]{3}$/.test(r[10])&&f&&f.dmg?"save":f&&f.heal?"heal":f&&f.cnt&&f.dmg?"auto":"";
  return /** @type {any} */ ({L, kind});
}
function tgSpellsFn1Step2(r, f, L, top, x, smod, kind){
    const by={}, heal={}, rng=/^(\d+)\s*ft/.exec(r[5]||""), touch=/Touch/i.test(r[5]||""), self=/^Self/i.test(r[5]||"");
    for(let lv=L;lv<=(L?Math.max(L,top):0);lv++){ const cc=spCalc(x,lv,D.level,smod); if(!cc) continue; if(kind==="heal") heal[lv]=String(cc.heal||"0").replace(/\u2212/g,"-"); else by[lv]=cc.parts.map((q) =>{ return [0,String(q.d).replace(/\u2212/g,"-").replace(/\s+/g,""),String(q.t||"").split("|")[0]]; }); }
    const area=f&&f.area;
  return /** @type {any} */ ({by, heal, rng, touch, self, area});
}
function tgSpellsFn1Step3(out, x, L, kind, r, touch, rng, self, area, f, by, heal){
    out.push({n:x.n,l:L,k:kind,time:/^Bonus/.test(r[4]||"")?"b":"a",c:+r[8]?1:0,rng:touch?5:rng?+rng[1]:self&&area?+area[1]:null,sv:/^[A-Z]{3}$/.test(r[10])?r[10].toLowerCase():"",half:L>0&&!!area,cnt:f&&(f.cnt||f.beam)?1:0,by:by,heal:heal,t:r[11]||"",area:area?area[0]+" "+area[1]+" ft":""});
}
function tgSpellsStep1(){
const out=[], man=[];
  return /** @type {any} */ ({out, man});
}
function tgSpellsStep2(){
const row={}; SPELLS.forEach((r) =>{ row[r[0]]=r; });
  const sc0=C.spellcasting?(typeof scAdj==="function"?scAdj(C.spellcasting):C.spellcasting):{}, smod=sc0.mod!=null?+sc0.mod:(D.mod&&C.dcAb?D.mod[C.dcAb]:null), top=(sc0.slots||[]).length;
  return /** @type {any} */ ({row, smod, top});
}
function tgPcNow(){
 const {at, sv, sp, sl, sca}=tgPcNowStep1();
  const dt=tgDefs(); tgActs(at);
  return {name:C.name||"Hero",riders:tgRiders(),rage:tgRage(),res:dt.Resistance,imm:dt.Immunity,vul:dt.Vulnerability,ac:D.ac,hp:D.hpmax,max:D.hpmax,speed:num(D.speed,30)||30,ini:D.init,saves:sv,attacks:at,level:D.level,spells:sp.list,slots:sl,satk:sca.atk!=null?+sca.atk:D.dc-8,sdc:sca.dc!=null?+sca.dc:D.dc,manual:sp.manual,cls:C.clsLabel||C.cls||"",species:String(C.species||"").split(" (")[0],por:typeof S.portrait==="string"&&/^data:image\//.test(S.portrait)?S.portrait:""}; }
function tgRow(a,d,at,beams){ if(!d||!isFinite(d.hit)) return; const dm=String(d.dmg||"").replace(/−/g,"-").replace(/\s+/g,""); if(!/\d*d\d+|^\d+/.test(dm)) return;
    const r=tgRange(a.range), dice=(/^[\d+d-]+/.exec(dm)||[""])[0].replace(/[+-]+$/,"");/* the dice in front; letters ("cold") never leak in */
    at.push({n:a.n,hit:d.hit,reach:r.reach||undefined,rng:r.rng||undefined,dmg:[[0,dice,String(a.type||"").split(/[ ,]/)[0]||""]],xd:tgXd(a),str:a.ab==="STR"?1:undefined,fin:/Finesse|Ammunition/.test(a.sub||"")?1:undefined,cantrip:/^Cantrip/.test(a.sub||"")?1:undefined});
    const bm=/(\d+) beams/.exec(a.sub||""); if(bm&&+bm[1]>1) beams.push({k:"multi",n:a.n+" ("+bm[1]+" beams)",ma:[[a.n,+bm[1]]]});/* Eldritch Blast: one action, one attack roll per beam */ }
/* the Attack action (Extra Attack) and save actions such as Breath Weapon, after the attack rows */
function tgActs(at){
  const apa=apaOf(), names=at.filter((a) =>{ return !a.k&&!a.cantrip; }).map((a) =>{ return a.n; }).join("|");
  if(apa>1&&names) at.push({k:"multi",n:"Attack ("+apa+" attacks)",ma:[[names,apa]]});/* Extra Attack: one Attack action, apa weapon attacks */
  (C.xdmg||[]).forEach((x) =>{ const dc=+x.dc, d=String(x.dmg||"").replace(/\s+/g,""); if(!x.save||!dc||!/^Action/.test(x.note||"")||!/^\d*d\d+([+-]\d+)?$/.test(d)) return;
    at.push({k:"save",n:x.n,dc:dc,sv:String(x.save).toLowerCase(),dmg:[[0,d,x.type||""]],half:/half/i.test(x.note||""),once:1}); });/* Breath Weapon and the like: an action with a save, one use in the fight */
}
function tgPcNowStep1(){
const at=[], beams=[]; (C.attacks||[]).forEach((a,i) =>{ tgRow(a,D.atk&&D.atk[i],at,beams); });
  const sv={}; ["STR","DEX","CON","INT","WIS","CHA"].forEach((k) =>{ if(D.save&&D.save[k]!=null) sv[k.toLowerCase()]=D.save[k]; });
  const sp=tgSpells(), sl=((C.spellcasting||{}).slots||[]).map((n) =>{ return +n||0; }), sca=C.spellcasting?(typeof scAdj==="function"?scAdj(C.spellcasting):C.spellcasting):{};
  return /** @type {any} */ ({at:at.concat(beams), sv, sp, sl, sca});
}
/* damage types the sheet lists under Defenses ("Bludgeoning, Piercing, and Slashing" is three); conditions stay out */
const DTYPES=/^(acid|bludgeoning|cold|fire|force|lightning|necrotic|piercing|poison|psychic|radiant|slashing|thunder)$/i;
function tgDefs(){ const o={Resistance:[],Immunity:[],Vulnerability:[]}; (C.defenses||[]).forEach((x) =>{ if(!o[x.t]||/while raging/i.test(x.v)) return; String(x.v||"").split(/\s*,\s*(?:and\s+)?|\s+and\s+|\s+or\s+/).forEach((v) =>{ if(DTYPES.test(v)&&o[x.t].indexOf(v)<0) o[x.t].push(v); }); }); return o; }
/* TG6 damage riders from the sheet rows: weapon extra dice (attack row xdice, such as Flame Tongue +2d6 Fire), once-per-turn riders of C.xdmg
   (Sneak Attack), spell-slot smites (C.xdmg 2014, the Defenses note of Paladin's Smite 2024, a Bonus Action), Rage (damage, "(while raging)" Resistances) */
function tgXd(a){ const o=(a.xdice||[]).map((x) =>{ return [0,String(x.d||"").replace(/\s+/g,""),String(x.t||"").split(" ")[0]]; }).filter((q) =>{ return /^\d*d\d+$/.test(q[1])&&DTYPES.test(q[2]); }); return o.length?o:undefined; }
function tgRiders(){ const out=[], ty=function(t){ return DTYPES.test(t)?t:""; };
  (C.xdmg||[]).forEach((x) =>{ const d=String(x.dmg||"").replace(/\s+/g,""), note=String(x.note||""); if(x.save||!/^\d*d\d+$/.test(d)) return;
    if(/expend a spell slot/i.test(note)){ const mx=/max (\d+)d/i.exec(note); out.push({n:x.n,dmg:d,type:ty(x.type),slot:1,max:mx?+mx[1]:0}); }
    else if(/^Once per turn/i.test(note)) out.push({n:x.n,dmg:d,type:ty(x.type),once:1}); });
  (C.defenses||[]).forEach((x) =>{ const m=/(\d+d\d+) (\w+) damage/.exec(String(x.v||"")); if(x.t!=="Note"||!m||!/spell slot/i.test(x.v)||out.some((r) =>{ return r.slot; })) return;
    const mx=/\((\d+)d\d+ at most\)/.exec(x.v); out.push({n:String(x.v).split(",")[0],dmg:m[1],type:ty(m[2]),slot:1,b:/Bonus Action/.test(x.v)?1:0,max:mx?+mx[1]:0}); });
  return out; }
/* shortcut: with Rage already on in the sheet its damage sits in the rows, so the Training Ground offers no second Rage then */
function tgRage(){ if(!modesAvail().some((m) =>{ return m.k==="rage"; })||modeOn("rage")) return null; const res=[];
  (C.defenses||[]).forEach((x) =>{ if(x.t==="Resistance"&&/while raging/i.test(x.v)) String(x.v).replace(/\s*\(.*\)/,"").split(/\s*,\s*(?:and\s+)?|\s+and\s+/).forEach((v) =>{ if(DTYPES.test(v)) res.push(v); }); });
  return {dmg:rageDmg(),res:res}; }
/* c: a character object (C). Swaps it in, derives, reads, puts the open one back */
function tgPcFor(c){ if(!c||!c.abilities) return null; let kC=C, kD=D, kB=B, kCU=CU0, out=null; try{ __set_C(c); derive(); out=tgPcNow(); out.por=""; } catch(e){ out=null; } finally{ __set_C(kC); __set_D(kD); __set_B(kB); __set_CU0(kCU); } return out; }
function tgRoster(){ const r=rGet(), out=[]; if(!r||!r.chars) return out; Object.keys(r.chars).forEach((id) =>{ const e=r.chars[id]; if(!e||e.ph) return;
    if(id===r.active&&!FROZEN){ const p=tgPcNow(); p.id=id; out.push(p); return; }
    let c=null; try{ c=JSON.parse(e.C||"null"); }catch(x){ c=null; } const p2=tgPcFor(c); if(p2){ p2.id=id; out.push(p2); } });
  return out; }
/* a class to try: the builder makes a level N character with its first choices (Human, Soldier, standard scores) */
function tgTry(cls,level,sub){ if(!env.__bldSheetFor) return null; const lv=Math.max(1,Math.min(20,level|0||1)), nb=(env.__bldQuickFor&&env.__bldQuickFor(cls,lv))||{cls:cls,level:lv,sub:sub||"",species:"Human",bg:"Soldier",unset:[]}; nb.name="Trial "+cls;
  let c2=null; try{ c2=env.__bldSheetFor(nb); }catch(e){ c2=null; } const p=tgPcFor(c2); if(p){ p.name=cls+" "+nb.level; p.trial=1; } return p; }
env.__app.tgPcFor=tgPcFor;/* tests/tg_numbers.py */ env.__app.tgRoster=tgRoster; env.__app.tgTry=tgTry; env.__app.uiGet=uiGet; env.__app.uiSet=uiSet; env.__app.toast=toast;
