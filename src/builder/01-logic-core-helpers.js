export var KEY="phb24-builder-v1";
export function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
export function esc(t){return String(t==null?"":t).replace(/[&<>"']/g,(c) =>{return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]})}
export function mod(s){return Math.floor((s-10)/2)}
export function sg(n){return (n>=0?"+":"\u2212")+Math.abs(n)}
export function pbOf(l){return 2+Math.floor((l-1)/4)}
/* average of a damage die "1d8" (a flat "1" counts as 1). Used to pick the larger of two dice (B3, M7 and m2) */
export function dieAvg(d){const m=/^(\d+)d(\d+)$/.exec(d||"");return m?(+m[1])*(+m[2]+1)/2:(+d||0)}
export function clone(o){return structuredClone(o)}
export function toast(m){const t=$("#btoast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(() =>{t.classList.remove("on")},2200)}
export var ABK=["STR","DEX","CON","INT","WIS","CHA"],ABN={STR:"Strength",DEX:"Dexterity",CON:"Constitution",INT:"Intelligence",WIS:"Wisdom",CHA:"Charisma"};
export var SRC="PHB-2024";
/* m10: glue code that used to sit in the data files (db1.js, dmgi.js). Runs once, before the first applyPacks() snapshot */
Object.keys(FEAT_FULL).forEach((n) =>{if(FEATS[n])FEATS[n].full=FEAT_FULL[n]});
/* v32 RL49 no. 17, 18: choices of two Epic Boons (FEATS.pick), all skills from Boon of Skill (allSk) */
if(FEATS["Boon of Skill"]){FEATS["Boon of Skill"].pick=[{k:"bsk",t:"exp",n:1,from:"all",title:"Expertise"}];FEATS["Boon of Skill"].allSk=1}
if(FEATS["Boon of Energy Resistance"])FEATS["Boon of Energy Resistance"].pick=[{k:"ber",t:"multi",n:2,list:[["Acid","Resistance to Acid damage."],["Cold","Resistance to Cold damage."],["Fire","Resistance to Fire damage."],["Lightning","Resistance to Lightning damage."],["Necrotic","Resistance to Necrotic damage."],["Poison","Resistance to Poison damage."],["Psychic","Resistance to Psychic damage."],["Radiant","Resistance to Radiant damage."],["Thunder","Resistance to Thunder damage."]],dres:"Resistance",title:"2 damage types"}];

export function __set_SRC(v){ return SRC=v; }
