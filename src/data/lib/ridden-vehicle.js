// Native ridden vehicles: own movement profiles, never actor speed grants.
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const own=(x,key)=>Object.prototype.hasOwnProperty.call(x,key);
export function riddenVehicleMetadata(name,edition='2024'){
 if(!['2014','2024'].includes(edition))return null;
 if(name==='Broom of Flying')return {activation:edition==='2014'?'Command word':'Magic',normalCapacityLb:200,maxCapacityLb:400,flyFeet:50,loadedFlyFeet:30,requiresAttunement:edition!=='2014',spokenDirections:false,endsOnGetOff:edition!=='2014'};
 if(name==='Bobbing Lily Pad')return {activation:null,normalCapacityLb:300,maxCapacityLb:600,walkFeet:20,flyFeet:20,swimFeet:20,loadedFlyFeet:10,requiresAttunement:true,spokenDirections:true,swimSurfaceOnly:true};
 return null;
}
export function normalizeRiddenVehicleState(state){
 return object(state)&&state.v===1&&typeof state.active==='boolean'&&state.size===null?{...state}:null;
}
export function migrateRiddenVehicles(rows){
 if(!Array.isArray(rows))return rows;
 let changed=false;const next=rows.map(row=>{if(!row||(row.key||row.n)!=='Broom of Flying'||own(row,'vehicle'))return row;changed=true;return {...row,vehicle:{v:1,active:false,size:null}}});return changed?next:rows;
}
function physicalSource(row,edition){
 const definition=row&&riddenVehicleMetadata(row.key||row.n,edition);if(!definition)return {ok:false,reason:'unsupported-vehicle'};
 const q=row.q==null?1:row.q;
 if(!Number.isSafeInteger(q)||q<=0)return {ok:false,reason:q===0?'source-unavailable':'invalid-quantity'};
 if(q!==1)return {ok:false,reason:'split-required'};
 const state=definition.activation?normalizeRiddenVehicleState(row.vehicle):null;
 if(definition.activation&&!state)return {ok:false,reason:'unsupported-state'};
 return {ok:true,definition,state};
}
export function riddenVehicleSourceStatus(row,edition='2024'){
 const source=physicalSource(row,edition);if(!source.ok)return source;
 if(source.definition.requiresAttunement&&(row.attuned!==true||row.attunedActive===false))return {ok:false,reason:'attunement'};
 return source;
}
export function activateRiddenVehicle(row,declarations,edition='2024'){
 const source=riddenVehicleSourceStatus(row,edition);
 if(!source.ok||!source.definition.activation||!object(declarations)||declarations.astride!==true)return null;
 const legacy=source.definition.activation==='Command word',keys=legacy?['astride','commandWord']:['astride','action','actionComplete'];
 if(Object.keys(declarations).some(k=>!keys.includes(k))||(legacy?declarations.commandWord!==true:declarations.action!=='Magic'||declarations.actionComplete!==true))return null;
 return {...source.state,active:true};
}
export function endRiddenVehicle(row,declarations,edition='2024'){
 const source=physicalSource(row,edition);
 if(!source.ok||!source.definition.activation||!object(declarations)||Object.keys(declarations).some(k=>!['landed','gotOff'].includes(k))||own(declarations,'landed')&&typeof declarations.landed!=='boolean'||own(declarations,'gotOff')&&typeof declarations.gotOff!=='boolean'||declarations.landed!==true&&(!source.definition.endsOnGetOff||declarations.gotOff!==true))return null;
 return {...source.state,active:false};
}
export function evaluateRiddenVehicle(row,declarations,edition='2024'){
 const source=riddenVehicleSourceStatus(row,edition);if(!source.ok)return source;
 if(!object(declarations)||Object.keys(declarations).some(k=>!['loadDeclared','loadLb','riding','spokenDirections'].includes(k))||declarations.loadDeclared!==true||!Number.isFinite(declarations.loadLb)||declarations.loadLb<0||typeof declarations.riding!=='boolean'||own(declarations,'spokenDirections')&&typeof declarations.spokenDirections!=='boolean')return {ok:false,reason:'invalid-declarations'};
 const d=source.definition,load=declarations.loadLb,canCarry=load<=d.maxCapacityLb,loaded=load>d.normalCapacityLb,broom=!!d.activation,recordedActive=broom?source.state.active:null,vehicleActive=broom?recordedActive&&(!d.endsOnGetOff||declarations.riding):true;
 const flyFeet=canCarry?(loaded?d.loadedFlyFeet:d.flyFeet):null,commandAllowed=canCarry&&vehicleActive&&declarations.riding&&(!d.spokenDirections||declarations.spokenDirections===true);
 const result={ok:true,loadLb:load,normalCapacityLb:d.normalCapacityLb,maxCapacityLb:d.maxCapacityLb,canCarry,flyFeet,vehicleActive,recordedActive,needsEndingRecord:broom&&d.endsOnGetOff&&recordedActive&&!declarations.riding,hover:canCarry&&vehicleActive,commandAllowed,commandReason:!canCarry?'over-capacity':broom&&!vehicleActive?'inactive':!declarations.riding?'rider-required':d.spokenDirections&&declarations.spokenDirections!==true?'spoken-directions-required':''};
 if(d.walkFeet!==undefined){result.walkFeet=canCarry?(loaded?d.walkFeet/2:d.walkFeet):null;result.swimFeet=canCarry?(loaded?d.swimFeet/2:d.swimFeet):null;result.swimSurfaceOnly=true}
 return result;
}
export function splitRiddenVehicle(rows,index,change={},edition='2024'){
 if(!Array.isArray(rows)||!Number.isInteger(index)||index<0||index>=rows.length)return {ok:false,reason:'source-unavailable'};
 const row=rows[index],definition=row&&riddenVehicleMetadata(row.key||row.n,edition);if(!definition)return {ok:false,reason:'unsupported-vehicle'};
 if(!Number.isSafeInteger(row.q)||row.q<=1)return {ok:false,reason:'split-required'};
 if(!object(change)||Object.keys(change).some(key=>key!=='keepRecordedWith')||change.keepRecordedWith!==undefined&&!['original','split'].includes(change.keepRecordedWith))return {ok:false,reason:'keep-choice'};
 const broom=!!definition.activation,state=broom?normalizeRiddenVehicleState(row.vehicle):null;
 if(broom&&!state||!broom&&own(row,'vehicle'))return {ok:false,reason:'unsupported-state'};
 const recorded=row.attuned===true||broom&&(state.active||Object.keys(state).some(key=>!['v','active','size'].includes(key)));
 if(recorded&&!change.keepRecordedWith)return {ok:false,reason:'keep-choice'};
 let original,split;try{original=structuredClone(row);split=structuredClone(row)}catch(error){return {ok:false,reason:'unsupported-state'}}
 original.q=row.q-1;split.q=1;const cleared=change.keepRecordedWith==='split'?original:split;
 cleared.attuned=false;if(own(cleared,'attunedActive'))cleared.attunedActive=false;if(broom)cleared.vehicle={v:1,active:false,size:null};
 const next=rows.slice();next.splice(index,1,original,split);return {ok:true,rows:next,index,splitIndex:index+1};
}
export function riddenVehicleProfile(row,edition='2024'){
 const definition=row&&riddenVehicleMetadata(row.key||row.n,edition);if(!definition)return null;
 const source=riddenVehicleSourceStatus(row,edition),q=row.q==null?1:row.q,broom=!!definition.activation,state=broom?normalizeRiddenVehicleState(row.vehicle):null,validState=broom?!!state:!own(row,'vehicle');
 return {vehicleMeta:definition,nativeEdition:edition,available:source.ok,reason:source.ok?'':source.reason,activationAvailable:source.ok&&broom&&!state.active,endAvailable:broom&&q===1&&!!state&&state.active,splitAvailable:Number.isSafeInteger(q)&&q>1&&validState,requiresKeepChoice:row.attuned===true||broom&&!!state&&(state.active||Object.keys(state).some(key=>!['v','active','size'].includes(key)))};
}
