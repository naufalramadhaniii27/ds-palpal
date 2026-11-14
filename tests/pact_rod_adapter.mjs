import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {legacyPactRodNativeBonus} from '../src/data/lib/pact-rod-source.js';
import {LEGACY_PACT_ROD_ROWS} from '../src/data/lib/pact-rod-profiles.js';
import {allocateAttunement,itemInUse} from '../src/data/lib/attunement.js';
import {initializeSlotRecovery} from '../src/data/lib/slot-recovery.js';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8'),data=vm.createContext({DataEnv:{slot:{}}});vm.runInContext(read('data/wotc11-magic-items-2014.js'),data);
const book=structuredClone(data.DataEnv.slot.WXI.dmg14);let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
function engine(item){const row=structuredClone(book.find(r=>r[0]===item)),B={rs:'2024',inv:[{n:item,q:1,eq:true,attuned:true}],custLib:[]},frame={B,DM14S:[row],DMAP:{[item]:row}},overrides={},GX={item:{}};frame.attunementState=()=>allocateAttunement(B.inv,3,n=>({requires:!!frame.DMAP[n]?.[3]}),()=>true);const c=vm.createContext({legacyPactRodNativeBonus,LEGACY_PACT_ROD_ROWS,itemInUse,lateGet:k=>frame[k],genv:{WXI:{dmg14:book}},fxo:()=>overrides,gx:()=>GX});vm.runInContext(read('builder/10p-logic-pact-rod.js').replace(/^import [^\n]*\n/gm,'').replace(/export /g,''),c);return {c,frame,B,overrides,GX,entry:{n:item,mi:item},bonus:(kind,cls)=>c.legacyPactRodBonus({n:item,mi:item},kind,cls)}}
for(const [item,row]of Object.entries(LEGACY_PACT_ROD_ROWS)){
 const n=row[5].fx.spellDc,e=engine(item);eq(e.bonus('dc','Warlock'),n);eq(e.bonus('dc','Wizard'),0);eq(e.bonus('atk','Wizard'),n);
 for(const mutate of [x=>x.B.inv[0].eq=false,x=>x.B.inv[0].q=0,x=>x.B.inv[0].attuned=false,x=>x.B.inv[0].iounOrbit=undefined,x=>x.B.inv[0].storedSpells={v:99},x=>x.B.custLib.push({n:item}),x=>x.overrides[item]={},x=>x.overrides[item]=undefined,x=>x.GX.item[item]=undefined,x=>x.frame.DM14S.push(structuredClone(row)),x=>x.frame.DMAP[item][4]='Changed original',x=>x.c.genv.WXI={dmg14:[]}]){const bad=engine(item);mutate(bad);eq(bad.bonus('dc','Warlock'),0);eq(bad.bonus('atk','Wizard'),0)}
 {const custom=engine(item);custom.overrides[item]={fx:{spellDc:7,spellAtk:6}};eq(custom.bonus('dc','Wizard'),null);eq(custom.bonus('atk','Wizard'),null)}
 {const old=engine(item),r=initializeSlotRecovery(old.B.inv,undefined,{used:{}},[{index:0,nativeProfile:'dmg2014'}]);assert.equal(r.ok,true);old.B.inv=r.rows;old.B.slotRecoverySources=r.authority;const before=JSON.stringify([old.B,r.state]);eq(old.bonus('dc','Warlock'),n);eq(old.bonus('dc','Wizard'),0);eq(JSON.stringify([old.B,r.state]),before)}
}
eq(engine('+1 Rod of the Pact Keeper').c.legacyPactRodBonus({n:'Rod of the Pact Keeper, +1'},'dc','Wizard'),null);
console.log(checks+' actual WXI/late adapter/allocated ATT/original owner checks PASS');
