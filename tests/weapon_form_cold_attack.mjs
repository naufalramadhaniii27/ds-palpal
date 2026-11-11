import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {weaponFormMetadata,weaponFormUsable,migrateInventoryForms} from '../src/data/lib/weapon-form.js';
import {nativeWieldMinimum,evaluateWieldMinimum,explainWieldMinimum} from '../src/data/lib/wield-minimum.js';
const source=fs.readFileSync(new URL('../src/app/05-logic-helpers.js',import.meta.url),'utf8').replace(/^import .*$/gm,'').replace(/export (function|var|const) /g,'$1 ');
const ctx={C:{rs:'2024'},env:{},bindLive(){},weaponFormMetadata,weaponFormUsable,nativeWieldMinimum,evaluateWieldMinimum,explainWieldMinimum};vm.createContext(ctx);vm.runInContext(source,ctx);
let checks=0;const check=(actual,want)=>{assert.equal(actual,want);checks++};
for(const name of ['Sun Blade','Sunsword','Dawnbringer','Duskcrusher']){
 const cached={n:name,die:'1d8',type:'Radiant'},dependent={n:'Pole Strike',of:name};
 const raw={n:name,key:name,eq:true,q:1,att:1,attuned:true,attunedActive:true,form:{v:1,active:false,radius:15}};
 ctx.C={rs:'2024',inventoryFormV:1,inv:[raw],attacks:[cached,dependent]};const before=JSON.stringify(ctx.C);
 check(ctx.atkOn(cached),false);check(ctx.atkOn(dependent),false);check(JSON.stringify(ctx.C),before);
 raw.form.active=true;check(ctx.atkOn(cached),true);check(ctx.atkOn(dependent),true);
 for(const [key,value] of [['eq',false],['q',0],['attunedActive',false]]){const previous=raw[key];raw[key]=value;check(ctx.atkOn(cached),false);raw[key]=previous;}
 // Derived export metadata is stale: raw form and global version must win.
 raw.formUsable=true;raw.form={v:2,active:true,radius:15};check(ctx.atkOn(cached),false);raw.form={v:1,active:true,radius:15};ctx.C.inventoryFormV=99;check(ctx.atkOn(cached),false);ctx.C.inventoryFormV=1;
 // A first off/stowed copy must not suppress the deduplicated active copy.
 const second=structuredClone(raw);raw.form.active=false;raw.eq=false;ctx.C.inv.push(second);check(ctx.atkOn(cached),true);check(ctx.atkOn(dependent),true);second.form.active=false;check(ctx.atkOn(cached),false);
 // Old saves migrate inventory, but retain their cached attacks until rebuild.
 const legacy={...second};delete legacy.form;ctx.C.inventoryFormV=undefined;
 const migrated=migrateInventoryForms([legacy],undefined,r=>weaponFormMetadata(r.key||r.n),r=>r.eq&&r.q>0&&r.attuned===true);ctx.C.inv=migrated.rows;ctx.C.inventoryFormV=migrated.version;check(ctx.atkOn(cached),true);
 // New format with no form normalizes inactive and cannot roll a cached row.
 const modern=migrateInventoryForms([legacy],1,r=>weaponFormMetadata(r.key||r.n));ctx.C.inv=modern.rows;check(ctx.atkOn(cached),false);
}
ctx.C={inv:[],attacks:[{n:'Sun Blade'},{n:'Custom Radiant Blade'}]};check(ctx.atkOn(ctx.C.attacks[0]),true);check(ctx.atkOn(ctx.C.attacks[1]),true);
ctx.C={inventoryFormV:99,inv:[{n:'Longsword',eq:true}],attacks:[{n:'Longsword'}]};check(ctx.atkOn(ctx.C.attacks[0]),true);ctx.C.inv[0].eq=false;check(ctx.atkOn(ctx.C.attacks[0]),false);
console.log(checks+' cold cached weapon-form attack checks passed');
