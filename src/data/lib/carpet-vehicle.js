// Native Carpet vehicle profile. Never modifies actor speeds or claims an inventory weighing system.
export const CARPET_SIZES=[
 {size:'3x5',widthFeet:3,lengthFeet:5,capacityLb:200,flyFeet:80},
 {size:'4x6',widthFeet:4,lengthFeet:6,capacityLb:400,flyFeet:60},
 {size:'5x7',widthFeet:5,lengthFeet:7,capacityLb:600,flyFeet:40},
 {size:'6x9',widthFeet:6,lengthFeet:9,capacityLb:800,flyFeet:30}
];
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
export function carpetMetadata(name){
 if(name==='Carpet of Flying')return {size:null,activation:'Magic',direction:'directionsGiven',commandFeet:30};
 for(const [i,label] of ['3 ft. × 5 ft.','4 ft. × 6 ft.','5 ft. × 7 ft.','6 ft. × 9 ft.'].entries())if(name==='Carpet of Flying, '+label)return {size:CARPET_SIZES[i].size,activation:'Action',direction:'spokenDirections',commandFeet:30};
 return null;
}
export function normalizeVehicleState(state){
 if(!object(state)||state.v!==1||typeof state.active!=='boolean'||state.size!==null&&!CARPET_SIZES.some(x=>x.size===state.size))return null;
 return {...state};
}
export function migrateVehicles(rows){
 if(!Array.isArray(rows))return rows;
 let changed=false;const next=rows.map(row=>{const definition=row&&carpetMetadata(row.key||row.n);if(!definition||Object.prototype.hasOwnProperty.call(row,'vehicle'))return row;changed=true;return {...row,vehicle:{v:1,active:false,size:definition.size}}});
 return changed?next:rows;
}
export function chooseCarpetSize(state,size){
 const old=normalizeVehicleState(state);if(!old||!CARPET_SIZES.some(x=>x.size===size))return null;
 return {...old,size};
}
export function carpetSourceStatus(row){
 const definition=row&&carpetMetadata(row.key||row.n),state=row&&normalizeVehicleState(row.vehicle);
 if(!definition||!state)return {ok:false,reason:'unsupported-state'};
 const quantity=row.q==null?1:Number(row.q);
 if(!Number.isFinite(quantity)||quantity<=0)return {ok:false,reason:'source-unavailable'};
 if(!Number.isInteger(quantity))return {ok:false,reason:'invalid-quantity'};
 if(quantity!==1)return {ok:false,reason:'split-required'};
 if(definition.size&&definition.size!==state.size)return {ok:false,reason:'size-mismatch'};
 return {ok:true,definition,state};
}
export function activateCarpet(row,declarations){
 const source=carpetSourceStatus(row);
 if(!source.ok||!object(declarations)||Object.keys(declarations).some(k=>!['commandWord','actionComplete','action'].includes(k))||declarations.commandWord!==true||declarations.actionComplete!==true||declarations.action!==source.definition.activation)return null;
 return {...source.state,active:true};
}
export function evaluateCarpet(row,declarations){
 const source=carpetSourceStatus(row);if(!source.ok)return source;
 const definition=source.definition,state=source.state;
 const size=CARPET_SIZES.find(x=>x.size===state.size);if(!size)return {ok:false,reason:'size-required'};
 if(!object(declarations)||Object.keys(declarations).some(k=>!['loadDeclared','loadLb','distanceDeclared','distanceFeet','directionsGiven','spokenDirections'].includes(k))||declarations.loadDeclared!==true||!Number.isFinite(declarations.loadLb)||declarations.loadLb<0)return {ok:false,reason:'load-required'};
 const canCarry=declarations.loadLb<=2*size.capacityLb,flyFeet=canCarry?(declarations.loadLb>size.capacityLb?size.flyFeet/2:size.flyFeet):null;
 const distance=declarations.distanceFeet,withinRange=declarations.distanceDeclared===true&&Number.isFinite(distance)&&distance>=0&&distance<=definition.commandFeet;
 return {ok:true,vehicleActive:state.active,size:size.size,loadLb:declarations.loadLb,normalCapacityLb:size.capacityLb,maxCapacityLb:2*size.capacityLb,canCarry,flyFeet,widthFeet:size.widthFeet,lengthFeet:size.lengthFeet,directionsGiven:declarations[definition.direction]===true,commandAllowed:state.active&&canCarry&&withinRange&&declarations[definition.direction]===true,commandReason:!state.active?'inactive':!canCarry?'over-capacity':!withinRange?'command-range':declarations[definition.direction]!==true?'directions-required':''};
}
