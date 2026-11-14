import assert from'node:assert/strict';
import{legacyPactRodNativeBonus as bonus}from'../src/data/lib/pact-rod-source.js';
import{LEGACY_PACT_ROD_ROWS as rows}from'../src/data/lib/pact-rod-profiles.js';
import{initializeSlotRecovery}from'../src/data/lib/slot-recovery.js';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;},clone=structuredClone;
function frame(item){return{inventoryRow:{n:item,q:1,eq:true,attuned:true},allocatedStatus:{requires:true,attuned:true},legacyBookRows:clone(Object.values(rows)),resolvedRow:clone(rows[item]),customItems:[],fxOverrides:{},gxItems:{}};}
for(const [item,row]of Object.entries(rows)){
 const f=frame(item),n=row[5].fx.spellDc,before=clone(f);
 eq(bonus(f,'dc','Warlock').bonus,n);eq(bonus(f,'dc','Wizard').bonus,0);eq(bonus(f,'atk','Wizard').bonus,n);eq(bonus(f,'atk','Warlock').bonus,n);eq(f,before);
 for(const change of [x=>x.legacyBookRows=[],x=>x.legacyBookRows.push(clone(row)),x=>x.resolvedRow[4]='Wrong book prose',x=>x.resolvedRow[5].fx.spellDc=99,x=>x.inventoryRow.eq=false,x=>x.inventoryRow.q=0,x=>x.allocatedStatus.attuned=false,x=>x.allocatedStatus.requires=false,x=>x.customItems.push({n:item}),x=>x.fxOverrides[item]=undefined,x=>x.gxItems[item]=undefined,x=>x.inventoryRow.iounOrbit=undefined,x=>x.inventoryRow.slotRecovery=undefined,x=>x.inventoryRow.slotRecovery={v:99},x=>{x.actorRS='2014';x.legacyBookRows=[]},x=>Object.defineProperty(x.resolvedRow[5].fx,'future',{value:undefined})]){
  const bad=frame(item);change(bad);eq(bonus(bad,'dc','Warlock').certified,false);
 }
 const adopted=initializeSlotRecovery([f.inventoryRow],undefined,{used:{}},[{index:0,nativeProfile:'dmg2014'}]);eq(adopted.ok,true);const g=frame(item);g.inventoryRow=adopted.rows[0];g.slotRecoverySources=adopted.authority;eq(bonus(g,'dc','Warlock').bonus,n);eq(bonus(g,'dc','Wizard').bonus,0);eq(bonus(g,'atk','Wizard').bonus,n);const snap=clone(g);bonus(g,'dc','Warlock');eq(g,snap);
}
for(const item of Object.keys(rows)){const f=frame(item);f.fxOverrides[item]={};eq(bonus(f,'dc','Warlock').certified,false);eq(bonus(f,'dc','Warlock').bonus,0);}
eq(bonus(frame('+1 Rod of the Pact Keeper'),'wrong','Warlock').certified,false);
console.log(checks+' original-book Pact Rod source / kind scope checks PASS');
