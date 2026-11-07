import {ABK} from "./01-logic-core-helpers.js";
import {registerFxHandler,abOfPick} from "./10a-logic-fx-registry.js";
/* Ability score handlers (registry "ability", contract in 10a). ctx = {sc:{AB:score}, src:{AB:[{s,v}]} (the state so far, read only),
   val:function(value,e) (the engine value rule: numbers, "pb", "rage", ability keys ...), pick:function(e,k) (the stored pick k of the entry)}.
   Patch {adj:[{k,s,v,to?}]} is applied by applyAbilityPatch(). A handler that changes several rows works on its own copy of ctx.sc, so a later
   row sees the earlier ones exactly as the old inline loops did. */
export function applyAbilityPatch(ctx,p){(p.adj||[]).forEach((a) =>{const o={s:a.s,v:a.v};if(a.cap)o.cap=1;ctx.src[a.k].push(o);if(a.to!=null)ctx.sc[a.k]=a.to})}
/* feat entry abCut {total,each} (Worthless). Applies to the scores built so far (base, species, background), before later feat increases. Lowers the highest score by 1 until the total is at most total, then lowers every score by each. A tie goes to the first ability in STR to CHA order */
registerFxHandler("ability",{id:"ab-cut",group:"abilityScores",phase:"pre-asi",once:true,fields:["abCut"],uses:["sc", "src"],run:function(e,ctx){if(!e||!e.abCut)return null;const t={},c=e.abCut,adj=[];let tot=0;ABK.forEach((k) =>{t[k]=ctx.sc[k]+ctx.src[k].reduce((n,b) =>{return n+b.v},0);tot+=t[k]});
 let g=0;while(tot>c.total&&g++<200){let m=ABK[0];ABK.forEach((k) =>{if(t[k]>t[m])m=k});t[m]--;tot--;adj.push({k:m,s:"Worthless (feat): total lowered to "+c.total,v:-1})}
 ABK.forEach((k) =>{if(c.each&&t[k]>1)adj.push({k:k,s:"Worthless (feat): every score lowered by "+c.each,v:-c.each})});return {adj:adj}}});
/* magic item row fx abil [ability, +N or -N, maximum] (Ioun Stones and similar) */
registerFxHandler("ability",{id:"item-abil",group:"abilityScores",phase:"item-raise",fields:["abil"],uses:["sc", "src", "val"],eKeys:["fx"],run:function(q,ctx){const f=q.fx;if(!f||!f.abil)return null;const sc=ctx.sc;let k=f.abil[0],nv=Math.min(f.abil[2]||30,sc[k]+f.abil[1]);
 if(f.abil[1]<0){nv=Math.max(1,sc[k]+f.abil[1]);if(nv<sc[k])return {adj:[{k:k,s:q.n+" (magic item, "+f.abil[1]+")",v:nv-sc[k],to:nv}]}}else if(nv>sc[k])return {adj:[{k:k,s:q.n+" (magic item, +"+f.abil[1]+", maximum "+(f.abil[2]||30)+")",v:nv-sc[k],to:nv}]};return null}});
/* raise one score of the local copy cur by row r=[ability, value, maximum], push the adjustment (maximum default 20) */
function up(r,e,ctx,cur,adj){const k=r[0];if(!ctx.src[k])return;const nv=Math.min(r[2]||20,cur[k]+ctx.val(r[1],e));if(nv>cur[k]){adj.push({k:k,s:e.lbl+" (maximum "+(r[2]||20)+")",v:nv-cur[k],to:nv});cur[k]=nv}}
function setTo(k,v,e,ctx,cur,adj){if(ctx.src[k]&&cur[k]<v){adj.push({k:k,s:e.lbl+" (sets score to "+v+")",v:v-cur[k],to:v});cur[k]=v}}
/* abUp [[ability, +N, maximum]] */
registerFxHandler("ability",{id:"ab-up",group:"abilityScores",phase:"raise",fields:["abUp"],uses:["sc", "src", "val"],eKeys:["lbl"],run:function(e,ctx){if(!e.abUp||!e.abUp.length)return null;const cur=Object.assign({},ctx.sc),adj=[];e.abUp.forEach((r) =>{up(r,e,ctx,cur,adj)});return {adj:adj}}});
/* fx engine v4: abDown [[ability, -N, minimum]] (curses; minimum default 1) */
registerFxHandler("ability",{id:"ab-down",group:"abilityScores",phase:"raise",fields:["abDown"],uses:["sc", "src", "val"],run:function(e,ctx){if(!e.abDown||!e.abDown.length)return null;const cur=Object.assign({},ctx.sc),adj=[];
 e.abDown.forEach((r) =>{const k=r[0];if(!ctx.src[k])return;const nv=Math.max(r[2]!=null?r[2]:1,cur[k]+ctx.val(r[1],e));if(nv<cur[k]){adj.push({k:k,s:e.lbl+" (minimum "+(r[2]!=null?r[2]:1)+")",v:nv-cur[k],to:nv});cur[k]=nv}});return {adj:adj}}});
/* abPick {up,max}: the picked ability goes up by up, not above max (default 20) */
registerFxHandler("ability",{id:"ab-pick-up",group:"abilityScores",phase:"raise",fields:["abPick"],uses:["pick","sc","src","val"],run:function(e,ctx){if(!(e.abPick&&e.abPick.up))return null;const cur=Object.assign({},ctx.sc),adj=[];
 abOfPick(ctx.pick(e,e.abPick.k)).slice(0,e.abPick.n||1).forEach((k) =>{up([k,e.abPick.up,e.abPick.max],e,ctx,cur,adj)});return {adj:adj}}});
/* abUpPick {max}: each pickLv pick of the entry holds text like "STR +2" or "STR +1, DEX +1"; every part raises that score (not above max). Levels in pickLv order */
registerFxHandler("ability",{id:"ab-up-pick",group:"abilityScores",phase:"raise",fields:["abUpPick","pickLv","lv"],uses:["pick","sc","src","val"],run:function(e,ctx){if(!e.abUpPick)return null;const cur=Object.assign({},ctx.sc),adj=[];
 (e.pickLv||[]).forEach((q) =>{if(e.lv<q.lv)return;const v=ctx.pick(e,q.k),t=Array.isArray(v)?v.join(" "):(v||""),re=/\b(STR|DEX|CON|INT|WIS|CHA)\s*\+(\d+)/g;let m;while((m=re.exec(t)))up([m[1],+m[2],e.abUpPick.max],e,ctx,cur,adj)});return {adj:adj}}});
/* magic item row fx setsc [ability, value]: the score becomes value when it is lower (after the increases, V16-4) */
registerFxHandler("ability",{id:"item-setsc",group:"abilityScores",phase:"item-set",fields:["setsc"],uses:["sc","src"],eKeys:["fx", "n"],run:function(q,ctx){const s=q.fx&&q.fx.setsc;if(!s||!(ctx.sc[s[0]]<s[1]))return null;return {adj:[{k:s[0],s:q.n+" (magic item, sets score to "+s[1]+")",v:s[1]-ctx.sc[s[0]],to:s[1]}]}}});
/* fx engine v4: abSet [[ability, value]] and abPick {set}: the score becomes value when it is lower (after every increase, like setsc). Works for every source */
registerFxHandler("ability",{id:"ab-set",group:"abilityScores",phase:"set",fields:["abSet"],uses:["sc", "src"],eKeys:["lbl"],run:function(e,ctx){if(!e.abSet||!e.abSet.length)return null;const cur=Object.assign({},ctx.sc),adj=[];e.abSet.forEach((r) =>{setTo(r[0],r[1],e,ctx,cur,adj)});return {adj:adj}}});
registerFxHandler("ability",{id:"ab-pick-set",group:"abilityScores",phase:"set",fields:["abPick"],uses:["pick", "sc", "src"],eKeys:["kind", "lbl", "okey", "pre"],run:function(e,ctx){if(!(e.abPick&&e.abPick.set))return null;const cur=Object.assign({},ctx.sc),adj=[];
 abOfPick(ctx.pick(e,e.abPick.k)).slice(0,e.abPick.n||1).forEach((k) =>{setTo(k,e.abPick.set,e,ctx,cur,adj)});return {adj:adj}}});
