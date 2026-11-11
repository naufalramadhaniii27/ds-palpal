// Ephemeral declaration evaluation; no HP, spell slot or inventory mutation.
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
export function repairSpecProblems(spec){
 if(!object(spec))return ['spec'];
 const errors=Object.keys(spec).filter(k=>!['spell','maxBreakFeet'].includes(k));
 if(spec.spell!=='Mending')errors.push('spell');
 if(!Number.isFinite(spec.maxBreakFeet)||spec.maxBreakFeet<=0)errors.push('maxBreakFeet');
 return errors;
}
export function mendingRepairSpec(overrides=[]){
 let maxBreakFeet=1;
 if(!Array.isArray(overrides))return {spell:'Mending',maxBreakFeet};
 for(const spec of overrides)if(!repairSpecProblems(spec).length)maxBreakFeet=Math.max(maxBreakFeet,spec.maxBreakFeet);
 return {spell:'Mending',maxBreakFeet};
}
export function evaluateObjectRepair(spec,target,context){
 if(repairSpecProblems(spec).length)return {ok:false,reason:'invalid-spec'};
 if(!object(context)||context.currentKnownSpell!==true||context.castEligible!==true)return {ok:false,reason:'cast-ineligible'};
 if(!object(target)||Object.keys(target).some(k=>!['object','kind','singleBreak','touch','dimensionsFeet'].includes(k)))return {ok:false,reason:'invalid-target'};
 if(target.object!==true)return {ok:false,reason:'object-required'};
 if(target.kind!==undefined&&!['Object','MagicItem'].includes(target.kind))return {ok:false,reason:'object-required'};
 if(target.singleBreak!==true)return {ok:false,reason:'single-break-required'};
 if(target.touch!==true)return {ok:false,reason:'touch-required'};
 const dims=target.dimensionsFeet;
 if(!Array.isArray(dims)||dims.length!==3||dims.some(n=>!Number.isFinite(n)||n<0)||!dims.some(n=>n>0))return {ok:false,reason:'invalid-dimensions'};
 if(dims.some(n=>n>spec.maxBreakFeet))return {ok:false,reason:'oversize',maxBreakFeet:spec.maxBreakFeet};
 return {ok:true,physicalBreakRepaired:true,magicRestored:false,maxBreakFeet:spec.maxBreakFeet};
}
