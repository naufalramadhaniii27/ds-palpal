/* Stored containers have no Gem-specific material discount. */
const storedMaterialFail=reason=>({ok:false,reason});
export function storedSpellMaterialRequirement(definition){
 if(!definition||!definition.fx||typeof definition.fx!=='object')return storedMaterialFail('native-material-unavailable');
 const description=typeof definition.fx.mat==='string'?definition.fx.mat:'',hasMaterial=String(definition.cmp||'').split(',').some(value=>value.trim()==='M'),consumed=definition.consumesMaterial===true||/consum/i.test(description);
 const reviewed=()=>({ok:true,description,consumed,minimumValueGP:null,reviewRequired:true,multiplier:1});
 if(hasMaterial&&!description)return reviewed();
 const prices=[...description.matchAll(/[\d,]+\+?\s*(?:gp|gold pieces)/gi)];
 if(/\bper\b|\bfor each\b|\beach\b/i.test(description)||prices.length>1)return reviewed();
 const match=/worth(?: at least)?\s+([\d,]+)\+?\s*(?:gp|gold pieces)/i.exec(description);
 if(/worth|\b(?:gp|sp|cp|ep|pp)\b|gold pieces/i.test(description)&&!match)return reviewed();
 const minimumValueGP=match?Number(match[1].replaceAll(',','')):0;
 return Number.isSafeInteger(minimumValueGP)&&minimumValueGP>=0?{ok:true,description,consumed,minimumValueGP,reviewRequired:false,multiplier:1}:reviewed();
}
export function validateStoredSpellMaterials(definition,facts){
 const cost=storedSpellMaterialRequirement(definition);if(!cost.ok)return cost;
 if(!facts||facts.componentsComplete!==true||facts.equipmentComplete!==true||facts.castingTimeComplete!==true)return storedMaterialFail('native-casting-declarations-required');
 if(cost.reviewRequired)return facts.materialCostReviewDeclared===true&&facts.nativeMaterialCostsAccounted===true?{...cost,costsAccounted:true}:storedMaterialFail('native-material-cost-review-required');
 if(cost.consumed&&facts.consumedMaterialProvided!==true)return storedMaterialFail('consumed-material-required');
 if(cost.minimumValueGP>0&&(!Number.isFinite(facts.materialValueGP)||facts.materialValueGP<cost.minimumValueGP))return storedMaterialFail('material-value-too-low');
 return {...cost,costsAccounted:true};
}
