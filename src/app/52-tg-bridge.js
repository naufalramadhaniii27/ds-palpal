import {C,FROZEN,S,__set_C} from "./04-logic-storage.js";
import {num,toast} from "./05-logic-helpers.js";
import {B,D,__set_B,__set_D,derive} from "./06-logic-derivation.js";
import {uiGet} from "./07-ui-theme-contrast-spring.js";
import {rGet} from "./14-ui-editor.js";
import {uiSet} from "./15c-logic-file-state-compress.js";
import {spCalc,spFx} from "./22-ui-spell-data-and-slots.js";
import {scAdj} from "./23e-ui-spells-dc.js";
import {CU0,__set_CU0} from "./41-ui-edit-mode.js";
import {__R} from "./00-reg.js";import {env} from "./00-env.js";
Object.defineProperty(__R,"tgPcFor",{get:function(){return tgPcFor;},set:function(v){tgPcFor=v;},configurable:true});
Object.defineProperty(__R,"tgPcNow",{get:function(){return tgPcNow;},set:function(v){tgPcNow=v;},configurable:true});
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
function tgSpells(){ const out=[], man=[]; if(typeof SPELLS==="undefined") return {list:out,manual:man}; const row={}; SPELLS.forEach((r) =>{ row[r[0]]=r; });
  const sc0=C.spellcasting?(typeof scAdj==="function"?scAdj(C.spellcasting):C.spellcasting):{}, smod=sc0.mod!=null?+sc0.mod:(D.mod&&C.dcAb?D.mod[C.dcAb]:null), top=(sc0.slots||[]).length;
  (C.spells||[]).forEach((x) =>{ if(!x||!x.n) return; const r=row[x.n], f=spFx(x); if(!r){ return; } const L=+x.l||0;
    const kind=r[10]==="ATK"?"atk":/^[A-Z]{3}$/.test(r[10])&&f&&f.dmg?"save":f&&f.heal?"heal":f&&f.cnt&&f.dmg?"auto":"";
    if(!kind){ if(L===0||top>=L) man.push({n:x.n,l:L,t:r[11]||""}); return; }
    const by={}, heal={}, rng=/^(\d+)\s*ft/.exec(r[5]||""), touch=/Touch/i.test(r[5]||""), self=/^Self/i.test(r[5]||"");
    for(let lv=L;lv<=(L?Math.max(L,top):0);lv++){ const cc=spCalc(x,lv,D.level,smod); if(!cc) continue; if(kind==="heal") heal[lv]=String(cc.heal||"0").replace(/\u2212/g,"-"); else by[lv]=cc.parts.map((q) =>{ return [0,String(q.d).replace(/\u2212/g,"-").replace(/\s+/g,""),String(q.t||"").split("|")[0]]; }); }
    const area=f&&f.area;
    out.push({n:x.n,l:L,k:kind,time:/^Bonus/.test(r[4]||"")?"b":"a",c:+r[8]?1:0,rng:touch?5:rng?+rng[1]:self&&area?+area[1]:null,sv:/^[A-Z]{3}$/.test(r[10])?r[10].toLowerCase():"",half:L>0&&!!area,cnt:f&&(f.cnt||f.beam)?1:0,by:by,heal:heal,t:r[11]||"",area:area?area[0]+" "+area[1]+" ft":""}); });
  return {list:out,manual:man}; }
function tgPcNow(){ const at=[]; (C.attacks||[]).forEach((a,i) =>{ const d=D.atk&&D.atk[i]; if(!d||!isFinite(d.hit)) return; const dm=String(d.dmg||"").replace(/−/g,"-").replace(/\s+/g,""); if(!/\d*d\d+|^\d+/.test(dm)) return;
    const r=tgRange(a.range), dice=(/^[\d+d-]+$/.test(dm)?dm:dm.replace(/[^\dd+-]/g,""));
    at.push({n:a.n,hit:d.hit,reach:r.reach||undefined,rng:r.rng||undefined,dmg:[[0,dice,String(a.type||"").split(/[ ,]/)[0]||""]]}); });
  const sv={}; ["STR","DEX","CON","INT","WIS","CHA"].forEach((k) =>{ if(D.save&&D.save[k]!=null) sv[k.toLowerCase()]=D.save[k]; });
  const sp=tgSpells(), sl=((C.spellcasting||{}).slots||[]).map((n) =>{ return +n||0; }), sca=C.spellcasting?(typeof scAdj==="function"?scAdj(C.spellcasting):C.spellcasting):{};
  return {name:C.name||"Hero",ac:D.ac,hp:D.hpmax,max:D.hpmax,speed:num(D.speed,30)||30,ini:D.init,saves:sv,attacks:at,level:D.level,spells:sp.list,slots:sl,satk:sca.atk!=null?+sca.atk:D.dc-8,sdc:sca.dc!=null?+sca.dc:D.dc,manual:sp.manual,cls:C.clsLabel||C.cls||"",species:String(C.species||"").split(" (")[0],por:typeof S.portrait==="string"&&/^data:image\//.test(S.portrait)?S.portrait:""}; }
/* c: a character object (C). Swaps it in, derives, reads, puts the open one back */
function tgPcFor(c){ if(!c||!c.abilities) return null; let kC=C, kD=D, kB=B, kCU=CU0, out=null; try{ __set_C(c); derive(); out=tgPcNow(); out.por=""; } catch(e){ out=null; } finally{ __set_C(kC); __set_D(kD); __set_B(kB); __set_CU0(kCU); } return out; }
function tgRoster(){ const r=rGet(), out=[]; if(!r||!r.chars) return out; Object.keys(r.chars).forEach((id) =>{ const e=r.chars[id]; if(!e||e.ph) return;
    if(id===r.active&&!FROZEN){ const p=tgPcNow(); p.id=id; out.push(p); return; }
    let c=null; try{ c=JSON.parse(e.C||"null"); }catch(x){ c=null; } const p2=tgPcFor(c); if(p2){ p2.id=id; out.push(p2); } });
  return out; }
/* a class to try: the builder makes a level N character with its first choices (Human, Soldier, standard scores) */
function tgTry(cls,level,sub){ if(!env.__bldSheetFor) return null; const lv=Math.max(1,Math.min(20,level|0||1)), nb=(env.__bldQuickFor&&env.__bldQuickFor(cls,lv))||{cls:cls,level:lv,sub:sub||"",species:"Human",bg:"Soldier",unset:[]}; nb.name="Trial "+cls;
  let c2=null; try{ c2=env.__bldSheetFor(nb); }catch(e){ c2=null; } const p=tgPcFor(c2); if(p){ p.name=cls+" "+nb.level; p.trial=1; } return p; }
env.__app.tgRoster=tgRoster; env.__app.tgTry=tgTry; env.__app.uiGet=uiGet; env.__app.uiSet=uiSet; env.__app.toast=toast;
