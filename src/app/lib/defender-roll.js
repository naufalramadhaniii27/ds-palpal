/* Bind a certified physical attack to one actual native roll completion. */
export function createDefenderRollRuntime(host){
 let generation=0;
 function decorate(key,spec){
  const match=/^(ah|ad)-(\d+)$/.exec(key);if(!match||!spec)return spec;
  const request={index:Number(match[2]),kind:match[1]==='ah'?'attack':'damage'},prepared=host.prepare(request);
  if(prepared===null||prepared===undefined)return spec;
  const previous=spec.sourceGuard,record={request,prepared,phase:'pending',result:null,generation};
  const current=()=>{try{return record.generation===generation&&record.phase!=='cancelled'&&(typeof previous!=='function'||previous()===true)&&host.current(prepared,record.phase)==true}catch(error){return false}};
  const out={...spec,sourceGuard:current};
  if(!prepared.ok){out.sourceGuard=()=>false;return out}
  if(request.kind==='attack'){
   out.bon=prepared.total;
   out.beforeCommit=result=>{
    if(record.phase!=='pending'||!current()||!validAttackResult(result))return false;
    const committed=host.commit(prepared,result,current);
    if(committed!==true){record.phase='cancelled';return false}
    record.phase='committed';record.result=result;return true;
   };
  }
  return out;
 }
 function invalidate(){generation++}
 return {decorate,invalidate};
}
function validAttackResult(result){return !!result&&Number.isInteger(result.nat)&&result.nat>=1&&result.nat<=20&&Number.isFinite(result.v)}
