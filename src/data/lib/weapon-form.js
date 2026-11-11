/* Physical form, inventory eligibility and independent item properties
   are separate. No helper edits equipment, attunement, quantities or counters. */
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const copy=x=>structuredClone(x);
export const INVENTORY_FORM_VERSION=1;
const variableLight=Object.freeze({default:15,min:10,max:30,step:5,adjustable:true});
const fixedLight=Object.freeze({default:15,min:15,max:15,step:0,adjustable:false});
export function weaponFormMetadata(name,edition='2024'){
 if(!['2014','2024'].includes(edition))return null;
 if(name==='Duskcrusher')return {off:'rod',offKind:'rod',base:'Warhammer',finesse:false,damageType:'Radiant',activateAction:'Bonus Action',dismissAction:'Action',light:fixedLight,formSpell:'Sunbeam'};
 if(!['Sun Blade','Sunsword','Dawnbringer'].includes(name))return null;
 return {off:'hilt',offKind:'hilt',base:'Longsword',finesse:true,proficiencyAny:['Longsword','Shortsword'],damageType:'Radiant',activateAction:'Bonus Action',dismissAction:'Bonus Action',adjustAction:name==='Sun Blade'&&edition==='2024'?'Magic action':'Action',light:variableLight,...(name==='Dawnbringer'?{formSpell:'Lesser Restoration'}:{})};
}
export const getMeta=weaponFormMetadata;
function supportedGlobal(version){return version===undefined||version===0||version===1}
function supportedState(raw){return object(raw)&&raw.v===1}
function radiusOf(value,formDefinition){const light=formDefinition.light;if(!light.adjustable)return light.default;return Number.isInteger(value)&&value>=light.min&&value<=light.max&&(value-light.min)%light.step===0?value:light.default}
export function normalizeWeaponForm(raw,formDefinition){
 if(!formDefinition)return copy(raw);
 if(object(raw)&&own(raw,'v')&&raw.v!==1)return copy(raw);
 const state=object(raw)?copy(raw):{};
 return {...state,v:1,active:state.active===true,radius:radiusOf(state.radius,formDefinition)};
}
export function migrateInventoryForms(rows,version,metadataFn,legacyActiveFn=(_row)=>false){
 if(!Array.isArray(rows))return {rows:copy(rows),version:supportedGlobal(version)?1:copy(version)};
 if(!supportedGlobal(version))return {rows:copy(rows),version:copy(version)};
 const legacy=version!==1;
 return {version:1,rows:rows.map(row=>{
  if(!object(row))return copy(row);
  const formDefinition=metadataFn(copy(row));if(!formDefinition)return copy(row);
  const out=copy(row);
  if(!own(row,'form'))out.form=normalizeWeaponForm({v:1,active:legacy&&legacyActiveFn(copy(row))===true},formDefinition);
  else out.form=normalizeWeaponForm(row.form,formDefinition);
  return out;
 })};
}
export function setWeaponFormActive(raw,formDefinition,active,version=1){
 if(!formDefinition||!supportedGlobal(version)||typeof active!=='boolean')return copy(raw);
 const state=normalizeWeaponForm(raw,formDefinition);if(!supportedState(state))return state;
 if(state.active===active)return state;
 // Reignition radius is not settled by the source: retain saved radius rather
 // than invent a reset. A new state still starts at the native 15-foot radius.
 return {...state,active};
}
export function adjustWeaponFormRadius(raw,formDefinition,direction,version=1){
 if(!formDefinition||!supportedGlobal(version)||!formDefinition.light.adjustable||![-1,1].includes(direction))return copy(raw);
 const state=normalizeWeaponForm(raw,formDefinition);if(!supportedState(state)||!state.active)return state;
 return {...state,radius:Math.max(formDefinition.light.min,Math.min(formDefinition.light.max,state.radius+direction*formDefinition.light.step))};
}
export function weaponFormActive(raw,version=1){return supportedGlobal(version)&&supportedState(raw)&&raw.active===true}
export function weaponFormLight(raw,formDefinition,version=1){return formDefinition&&weaponFormActive(raw,version)?{bright:radiusOf(raw.radius,formDefinition),dimBeyond:radiusOf(raw.radius,formDefinition),sunlight:true}:null}
export function weaponFormUsable(row,formDefinition,eligibility,version=1){return !!(formDefinition&&object(row)&&weaponFormActive(row.form,version)&&eligibility&&eligibility.equipped===true&&Number.isFinite(eligibility.quantity)&&eligibility.quantity>0&&eligibility.attuned===true)}
