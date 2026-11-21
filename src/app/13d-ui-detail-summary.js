/* Detail card summary block (dcSum): one line, big number row, chips, bullets from the bold sub-headings. Used by spell, feat and feature cards.
   Rule: the summary never repeats itself. Chips only add what the number row and the line do not say; the detail text starts after the line when the line is its first sentence */
import {esc} from "./05-logic-helpers.js";
import {bindLive} from "./00a-reg-late-ports.js";
bindLive("featLine",{get:function(){return featLine;}});
export function sumPlain(t){ return String(t||"").replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,k,l) =>l||k).replace(/<[^>]*>/g,"").replace(/\{@\w+ ([^|}]*)[^}]*\}/g,"$1").replace(/\*+/g,"").replace(/\s+/g," ").trim(); }
/* cut at a clause boundary (comma, semicolon, or a joining word) inside n chars, else at a word boundary. Never mid-word */
function sumCut(s,n){ s=String(s||""); if(s.length<=n) return s; const c=s.slice(0,n+1), lo=n*.45; let k=-1;
  const re=/[,;:]\s| (?:or|and|but|after|when|if|until|while|unless|which|who|then) /g; let m; while((m=re.exec(c))) if(m.index>lo&&m.index<=n) k=m.index;
  if(k<0){ k=c.lastIndexOf(" "); if(k<lo) k=n; }
  return s.slice(0,k).replace(/[\s,;:]+$/,"")+"…"; }
const SENT=/(?<=[.!?])\s+(?=[A-Z])/;
export function sumFirst(t,n){ const s=sumPlain(t).split(SENT)[0]||""; return sumCut(s,n||150); }
const AB={Strength:"STR",Dexterity:"DEX",Constitution:"CON",Intelligence:"INT",Wisdom:"WIS",Charisma:"CHA"};
/* "Pick Strength or Dexterity and raise it by 1" -> "+1 STR or DEX"; "one ability score of your choice" -> "+1 any ability" */
export function sumAsi(t){ const s=sumPlain(t), n=(/\bby (\d)\b/.exec(s)||[0,1])[1], ab=[]; s.replace(/\b(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\b/g,(m) =>{ if(ab.indexOf(AB[m])<0) ab.push(AB[m]); return m; });
  return "+"+n+" "+(ab.length&&ab.length<6?ab.join(" or "):"any ability"); }
/* {pts:[[heading, first clause]], asi:[chip text]} from "**Heading.** text" blocks, at most 4 bullets. Ability Score Increase blocks become a chip */
export function sumPts(t){ const pts=[], asi=[], re=/\*\*([^*]{2,40}?)\.?\*\*\s*([^]*?)(?=\*\*[^*]{2,40}?\*\*|$)/g; let m;
  while((m=re.exec(String(t||"")))&&pts.length<4){ const h=sumPlain(m[1]).replace(/[.:]$/,""); if(/Ability Score/i.test(h)){ asi.push(sumAsi(m[2])); continue; } const b=sumFirst(m[2],110); if(b) pts.push([h,b]); }
  return {pts:pts,asi:asi}; }
/* the line when the data has no short summary: the first sentence that is not the Ability Score Increase block */
export function sumLine(t){ const s=String(t||""), parts=s.split(/\*\*[^*]{2,40}?\*\*/), heads=s.match(/\*\*[^*]{2,40}?\*\*/g)||[];
  for(let i=0;i<parts.length;i++){ if(i>0&&/Ability Score/i.test(heads[i-1]||"")) continue; const f=sumFirst(parts[i]); if(f) return f; } return ""; }
const norm=(s) =>String(s||"").toLowerCase().replace(/…$/,"").replace(/[^a-z0-9]+/g," ").trim();
/* the raw detail text without its first sentence when that sentence is the line. "" when nothing would be left (the line says it all) */
export function sumRest(raw,line){ raw=String(raw||""); const m=/^\s*([^]*?[.!?])(?:\s+|$)/.exec(raw); if(!line||!m||norm(sumPlain(m[1]))!==norm(line)) return raw; return raw.slice(m[0].length).trim(); }
/* spell chips that add to the number row: ritual, reaction trigger, costly material, area, half on a save, upcast or cantrip scaling */
export function spChips(o){ const full=sumPlain(o.full), out=[], mat=sumPlain(o.mat), ct=String(o.ct||"");
  if(o.rit) out.push(["Ritual","t-rit"]);
  const tr=/^1? ?Reaction,? (?:which you take )?(when .+)$/i.exec(ct); if(tr) out.push([sumCut(tr[1],60),"t-time"]);
  const gp=/([\d,]+\+?)\s*GP/i.exec(mat); if(gp) out.push([gp[1]+" GP"+(/consume/i.test(mat)?", consumed":" focus"),"t-mat"]);
  const ar=/(\d+)-foot(?:[- ](?:radius|long|wide|tall|high|square))?,? (?:[\w-]+ ){0,2}?(Sphere|Cone|Cube|Line|Cylinder|Emanation|Wall)\b/i.exec(full); if(ar) out.push([ar[1]+"-ft "+ar[2][0].toUpperCase()+ar[2].slice(1).toLowerCase(),"t-area"]);
  if(o.sv&&o.sv!=="ATK"&&/half as much damage|half damage|half as much on a success/i.test(full)) out.push(["Half on success","t-save"]);
  const up=/(?:slot level above \d+|each (?:spell )?slot level above)[^.]*?(\d+d\d+)/i.exec(full)||/(\d+d\d+)[^.]*?for each (?:spell )?slot level above/i.exec(full);
  if(up) out.push(["+"+up[1]+" per slot","t-up"]); else if(/Cantrip Upgrade|at level 5 \(|reaches 5th level/i.test(full)) out.push(["Scales with level","t-up"]);
  return out; }
/* the Duration tile: the duration, and a CONC badge when the spell needs Concentration */
export function durH(dur,conc){ return esc(dur)+(conc?' <span class="dsum-b"><span aria-hidden="true">Conc</span><span class="vh">Concentration</span></span>':''); }
/* the Damage tile: dice in the damage-type colour, the type word small under it */
export function dmgH(d,t){ const ty=String(t||"").split("|"), cl="dt-"+String(ty[0]||"").toLowerCase().split(/[ ,]/)[0];
  return '<span class="'+cl+'">'+esc(d)+'</span>'+(ty[0]?'<small class="dsum-u '+cl+'">'+esc(ty.map((x) =>x.charAt(0).toUpperCase()+x.slice(1)).join(" or "))+'</small>':''); }
/* dice in the line become the dice the number row shows for that damage type (Fire Bolt at level 5: 1d10 Fire -> 2d10 Fire) */
export function sumDice(line,parts){ let s=String(line||""); (parts||[]).forEach((p) =>{ String(p[1]||"").split("|").forEach((t) =>{ if(t) s=s.replace(new RegExp("\\b\\d+d\\d+(\\s*(?:\\+\\s*\\d+\\s*)?"+t+")","gi"),p[0]+"$1"); }); }); return s; }
export const DSUM_DH='<h3 class="info-h dsum-dh">Detail</h3>';
/* the detail under a summary: folded behind "Full text" when the bullets above already show its sub-headed paragraphs; with no detail left, the Detail heading goes too */
export function sumDetail(sumH,raw,html){ if(!html) return sumH.replace(DSUM_DH,""); return sumH+(sumPts(raw).pts.length>=2?'<details class="dsum-full"><summary>Full text</summary>'+html+'</details>':html); }
/* a search box folded behind a 44 px icon button; it stays open while it has text or focus */
export function qFold(id,label,ph,val,icon){ const op=!!val||(typeof document!=="undefined"&&document.activeElement&&document.activeElement.id===id);
  return '<details class="qd"'+(op?' open':'')+'><summary aria-label="'+esc(label)+'" title="'+esc(label)+'">'+icon+'</summary><input id="'+id+'" type="search" aria-label="'+esc(label)+'" placeholder="'+esc(ph)+'" value="'+esc(val)+'"></details>'; }
/* nums: [[label, html, extra class]]; chips: [[text, class]]; pts: [[head, text]] */
export function dcSum(line,nums,chips,pts){ nums=(nums||[]).filter((c) =>{ return c&&c[1]&&c[1]!=="—"; }); pts=pts||[];
  const ln=norm(line), seen={}; chips=(chips||[]).filter((c) =>{ const k=c&&norm(c[0]); if(!k||seen[k]||(ln&&ln.indexOf(k)>=0)) return false; seen[k]=1; return true; });/* a chip the line already says, or a duplicate, adds nothing */
  if(!line&&!nums.length&&!chips.length&&!pts.length) return "";
  return '<section class="dsum" aria-label="Summary">'+(line?'<p class="dsum-l">'+esc(line)+'</p>':'')+
    (nums.length?'<dl class="dsum-n">'+nums.map((c) =>{ return '<div class="dsum-c'+(c[2]?' '+c[2]:'')+'"><dt>'+esc(c[0])+'</dt><dd data-xl-off>'+c[1]+'</dd></div>'; }).join("")+'</dl>':'')+
    (chips.length?'<ul class="dsum-ch" aria-label="Tags">'+chips.map((c) =>{ return '<li class="dsum-t'+(c[1]?' '+c[1]:'')+'">'+esc(c[0])+'</li>'; }).join("")+'</ul>':'')+
    (pts.length?'<ul class="dsum-p">'+pts.map((p) =>{ return '<li><b>'+esc(p[0])+':</b> '+esc(p[1])+'</li>'; }).join("")+'</ul>':'')+
    '</section>'+DSUM_DH; }
/* feats and features: the line (data summary or first sentence) and the bullets */
export function featLine(full,d){ return d?sumCut(sumPlain(d),180):sumLine(full); }
export function featSumH(full,d,chips,nums){ const p=sumPts(full); return dcSum(featLine(full,d),nums||[],(chips||[]).concat(p.asi.map((a) =>[a,"t-asi"])),p.pts); }
/* a sheet feature: the data summary when there is full text, else the first sentence */
export function fSumH(f,nums,chips){ return featSumH(f.full||f.d,f.full?f.d:"",chips,nums); }
