import {iounCharacterMathStatus} from '../src/data/lib/ioun-orbit-source.js';
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {resolveObjectRepairProfile,evaluateRepairRequest} from '../src/app/lib/object-repair-runtime.js';
import {evaluateObjectRepair} from '../src/data/lib/object-repair.js';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8'),strip=s=>s.replace(/^import .*$/gm,'').replace(/export (function|var|const) /g,'$1 ');let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
function harness(baseKnown=true,forge=true){let currentRoot,html='',title='',raging=false;const trace=[],events={};function makeRoot(){const nodes={};for(const key of ['kind','single','touch','components','equipment','time','result','submit','effective','sources'])nodes['[data-orp-'+key+']']={value:'',checked:false,textContent:'',disabled:false};for(let i=0;i<3;i++)nodes['[data-orp-axis="'+i+'"]']={value:''};return {nodes,isConnected:true,querySelector:k=>nodes[k],contains:e=>Object.values(nodes).includes(e)}}
 const item={n:"Forgemaster's Might",key:"Forgemaster's Might",q:1,attuned:true,attunedActive:true,eq:true},source={item:item.n,maxBreakFeet:5,requiresAttunement:true,itemState:'attuned',grantsKnowledge:true};
 const c={C:{name:'Current actor',inv:forge?[item]:[],spells:[{n:'Mending',l:0,ct:'1 minute',r:'Touch',cmp:'V, S, M',objectRepair:{spell:'Mending',baseKnown,sources:forge?[source]:[]}}]},S:{used:{creation:1,fabricate:1},hp:9},D:{res:[]},env:{},structuredClone,resolveObjectRepairProfile,evaluateRepairRequest,evaluateObjectRepair,bindLive(){},modeOn:()=>raging,lateGet:k=>k==='openObjectRepair'?c.openObjectRepair:{},document:{addEventListener:(k,f)=>(events[k]??=[]).push(f),querySelector:()=>currentRoot},esc:v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x])),openSheet:(t,h)=>{if(currentRoot)currentRoot.isConnected=false;title=t;html=h;if(h.includes('data-orp-root'))currentRoot=makeRoot()},undoMark:()=>trace.push('undo'),save:()=>trace.push('save'),syncLU(){},renderSpells(){},renderConds(){},refreshEntry:()=>{trace.push('refresh');currentRoot.isConnected=false},toastU(){},toast(){},cmbCast(){},cmbRe(){},ask:()=>trace.push('ask')};Object.assign(c,{iounCharacterMathStatus});vm.createContext(c);vm.runInContext(strip(read('src/app/32b-logic-play-concentration-casting.js'))+'\n'+strip(read('src/app/32c-ui-object-repair.js')),c);
 const active=()=>vm.runInContext('repairActive',c);return {c,item,trace,events,open:()=>{c.openObjectRepair(0,'',0);return currentRoot},root:()=>currentRoot,view:active,html:()=>html,title:()=>title,rage:v=>raging=v,ready(dims=[5,0,0],kind='Object'){const r=currentRoot;r.nodes['[data-orp-kind]'].value=kind;for(const k of ['single','touch','components','equipment','time'])r.nodes['[data-orp-'+k+']'].checked=true;dims.forEach((v,i)=>r.nodes['[data-orp-axis="'+i+'"]'].value=String(v));c.repairDraw(active());return r},submit:()=>c.repairSubmit(active())};}
{
 const h=harness();let r=h.open();eq(r.nodes['[data-orp-submit]'].disabled,true);eq(h.html().includes('1-minute'),true);eq(h.html().includes('Forge'),true);eq(h.c.objectRepairSummary(1),'');h.ready();eq(r.nodes['[data-orp-submit]'].disabled,false);const before=JSON.stringify(h.c.S);h.submit();eq(h.trace.filter(x=>x==='undo').length,1);eq(h.trace.includes('refresh'),true);eq(r.isConnected,false);eq(h.html().includes('data-orp-completed'),true);eq(h.html().includes('does not restore magic'),true);eq(h.html().includes('data-orp-submit'),false);eq(JSON.stringify(h.c.S),before);eq(h.view(),null);
}
for(const axis of [0,1,2]){const h=harness();h.open();const d=[1,1,1];d[axis]=5.01;const r=h.ready(d);eq(r.nodes['[data-orp-submit]'].disabled,true);h.submit();eq(h.trace,[])}
for(const field of ['single','touch','components','equipment','time']){const h=harness();const r=h.open();h.ready([1,0,0]);r.nodes['[data-orp-'+field+']'].checked=false;h.c.repairDraw(h.view());eq(r.nodes['[data-orp-submit]'].disabled,true);h.submit();eq(h.trace,[])}
{
 const h=harness(true,false);const r=h.open();h.ready([1,0,0],'MagicItem');eq(r.nodes['[data-orp-submit]'].disabled,false);h.submit();eq(h.html().includes('1 ft limit'),true);eq(h.html().includes('does not restore magic'),true);
}
for(const change of [h=>h.item.attuned=false,h=>h.c.C={...h.c.C},h=>h.c.S={...h.c.S},h=>h.c.C.name='Other',h=>h.c.C.spells[0].n='Light']){const h=harness();h.open();h.ready([4,0,0]);change(h);h.submit();eq(h.trace,[])}
{
 const h=harness();const r=h.open();h.ready([4,0,0]);h.item.attuned=false;h.c.repairDraw(h.view());eq(r.nodes['[data-orp-submit]'].disabled,true);eq(r.nodes['[data-orp-effective]'].textContent.includes('1 ft'),true);h.submit();eq(h.trace,[]);
}
{
 const h=harness();const r=h.open();h.ready([1,0,0]);h.rage(true);h.c.repairDraw(h.view());eq(r.nodes['[data-orp-submit]'].disabled,true);eq(r.nodes['[data-orp-result]'].textContent.includes('Raging'),true);h.submit();eq(h.trace,[]);
}
for(const x of [x=>x.itc={it:'Mallet',c:1},x=>x.ct='Action']){const h=harness();x(h.c.C.spells[0]);h.open();eq(h.html().includes('data-orp-time'),false);eq(h.root().nodes['[data-orp-submit]'].disabled,true);eq(h.trace,[])}
{
 const h=harness();const badge={closest:s=>s.includes('[data-qcast]')?{getAttribute:()=> '0'}:s.includes('[data-info]')?{}:null};const e={target:badge,preventDefault(){},stopPropagation(){}};for(const fn of h.events.click)fn(e);eq(h.view()!==null,true);h.ready([1,0,0]);eq(h.root().nodes['[data-orp-submit]'].disabled,false);h.submit();eq(h.html().includes('data-orp-completed'),true);
}
console.log(checks+' object repair UI + real native cast/refresh ownership checks PASS');
