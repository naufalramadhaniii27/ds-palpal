import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {weaponFormMetadata,weaponFormUsable,weaponFormActive,weaponFormLight} from '../src/data/lib/weapon-form.js';
const code=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8').replace(/^import .*$/gm,'').replace(/export (function|var|const) /g,'$1 ');
let writes=0,undos=0,loads=0,pending=null;
const ctx={C:{},S:{},env:{},weaponFormMetadata,weaponFormUsable,weaponFormActive,weaponFormLight,bindLive(){},document:{addEventListener(){}},occOf:()=>0,undoMark(){undos++},refreshEntry(){}};
vm.createContext(ctx);vm.runInContext(code('src/app/05-logic-helpers.js'),ctx);vm.runInContext(code('src/app/21b-ui-weapon-forms.js'),ctx);
ctx.toast=()=>{};ctx.ask=(message,label,callback)=>{pending=callback};
const setForm=()=>{writes++;return {ok:true}};
function fixture(key='Sun Blade'){
 const it={n:'Sun Blade',eq:true,q:1,att:1,attuned:true,attunedActive:true,form:{v:1,active:false,radius:15}};if(key)it.key=key;
 ctx.C={name:'Same Owner',rs:'2024',inventoryFormV:1,inv:[it],attacks:[{n:'Hand-written attack',die:'9d9'}],manual:'preserve'};ctx.S={used:{daily:1}};
 const attrs={'data-if-index':'0','data-if-name':'Sun Blade'},root={isConnected:true,dataset:{},getAttribute:k=>attrs[k]};
 const button={disabled:false,closest:()=>root,getAttribute:()=> 'activate'};
 pending=null;ctx.env.__bldSetForm=setForm;ctx.env.__bldFormInfo=()=>({available:true});ctx.env.__bldHas=()=>true;ctx.env.__bldDiff=()=>[];return {it,root,button};
}
// Same owner and same-name item in B must never replace a manual C without key.
let f=fixture(null),before=JSON.stringify(ctx.C),w=writes,u=undos;
const html=ctx.weaponFormControl(f.it,0);assert.match(html,/Open Build and apply this item/);assert.match(html,/data-if-action="activate" disabled/);
await ctx.formClick(f.button);assert.equal(writes,w);assert.equal(undos,u);assert.equal(JSON.stringify(ctx.C),before);
// Keyed cold sheet can lazy-load B, then must prove provenance through viaBld.
f=fixture();delete ctx.env.__bldSetForm;ctx.env.__bldNeed=async()=>{loads++;ctx.env.__bldSetForm=setForm};ctx.env.__bldHas=()=>false;
await ctx.formClick(f.button);assert.equal(loads,1);assert.equal(writes,w);assert.equal(undos,u);
// Divergent bound sheets use the actual bldGuard; cancel performs no mutation.
f=fixture();ctx.env.__bldDiff=()=>['Manual attacks differ'];before=JSON.stringify(ctx.C);await ctx.formClick(f.button);assert.equal(typeof pending,'function');assert.equal(writes,w);assert.equal(undos,u);assert.equal(JSON.stringify(ctx.C),before);pending=null;
// Approval after the item changed or the owner switched must fail stale checks.
for(const invalidate of [()=>{f.it.form.active=true},()=>{ctx.C.name='Other Owner'},()=>{ctx.S={used:{}}},()=>{f.root.isConnected=false},()=>{ctx.env.__bldHas=()=>false}]){
 f=fixture();ctx.env.__bldDiff=()=>['Manual attacks differ'];await ctx.formClick(f.button);const approve=pending;invalidate();approve();assert.equal(writes,w);assert.equal(undos,u);
}
// Explicit approval while still current commits exactly once; clean bound C too.
f=fixture();ctx.env.__bldDiff=()=>['Manual attacks differ'];await ctx.formClick(f.button);pending();assert.equal(writes,++w);assert.equal(undos,++u);
f=fixture();await ctx.formClick(f.button);assert.equal(writes,++w);assert.equal(undos,++u);
console.log('weapon form provenance: manual same-owner preserved, lazy provenance, divergence/cancel and stale approvals passed');
