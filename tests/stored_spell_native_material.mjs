import assert from 'node:assert/strict';
import {storedSpellMaterialRequirement,validateStoredSpellMaterials} from '../src/app/lib/stored-spell-native-material.js';
let n=0;const eq=(a,b)=>{assert.deepEqual(a,b);n++},facts={componentsComplete:true,equipmentComplete:true,castingTimeComplete:true,consumedMaterialProvided:true,materialValueGP:200};
const glyph={cmp:'V, S, M',school:'Abjuration',consumesMaterial:true,fx:{mat:'powdered diamond worth 200+ GP, consumed by the spell'}};
eq(storedSpellMaterialRequirement(glyph).minimumValueGP,200);eq(validateStoredSpellMaterials(glyph,{...facts,materialValueGP:100}).reason,'material-value-too-low');eq(validateStoredSpellMaterials(glyph,facts).ok,true);
for(const mat of ['a diamond worth 1,000 GP and vessel worth 2,000 GP','a likeness worth at least 500 GP per Hit Die']){const def={cmp:'M',fx:{mat}};eq(storedSpellMaterialRequirement(def).minimumValueGP,null);eq(validateStoredSpellMaterials(def,facts).ok,false);eq(validateStoredSpellMaterials(def,{...facts,materialCostReviewDeclared:true,nativeMaterialCostsAccounted:true}).ok,true)}
eq(validateStoredSpellMaterials(glyph,{...facts,castingTimeComplete:false}).ok,false);console.log(`${n} stored-spell native material assertions PASS`);
