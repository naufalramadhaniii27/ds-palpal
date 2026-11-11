/* Optional inventory-attunement v1 migration and pure slot allocation.
   Legacy rows inherit eq once; explicit attunement then survives putting an item away. */
export function itemQuantity(row){const n=parseFloat(row&&row.q);return isNaN(n)?1:Math.max(0,n)}
export function migrateAttunement(row,itemRule,legacyUse){if(!row||typeof row!=="object")return row;
 return itemRule&&itemRule.requires&&typeof row.attuned!=="boolean"?Object.assign({},row,{attuned:legacyUse==null?!!row.eq:!!legacyUse}):row}
export function migrateItems(items,resolve,legacyUse){if(!Array.isArray(items))return items;let changed=false;
 const out=items.map((row)=>{if(!row||typeof row!=="object")return row;const next=migrateAttunement(row,resolve(row.n),legacyUse?legacyUse(row):null);if(next!==row)changed=true;return next});return changed?out:items}
export function allocateAttunement(items,limit,resolve,eligible){const seen=new Set(),cap=Number.isFinite(+limit)?Math.max(0,Math.floor(+limit)):3;let used=0;
 const data=items.map((row,index)=>{const itemRule=resolve(row.n)||{},requires=!!itemRule.requires,requested=requires&&(typeof row.attuned==='boolean'?row.attuned:!!row.eq);return {row,itemRule,status:{index,requires,requested,attuned:false,reason:''}}});
 let changed=true,rounds=0;
 while(changed&&used<cap&&rounds++<items.length){changed=false;
  data.forEach(({row,itemRule,status})=>{if(status.attuned||!status.requires||!status.requested||itemQuantity(row)<=0)return;
   const key=itemRule.key||row.n;if(seen.has(key)||!eligible(itemRule,row,seen)||used>=cap)return;
   seen.add(key);used++;status.attuned=true;changed=true})}
 data.forEach(({row,itemRule,status})=>{if(!status.requires||status.attuned)return;
  if(itemQuantity(row)<=0)status.reason='no-item';else if(!status.requested)status.reason='off';
  else if(seen.has(itemRule.key||row.n))status.reason='duplicate';else if(!eligible(itemRule,row,seen))status.reason='requirements';else status.reason='limit'});
 return {rows:data.map(x=>x.status),used,limit:cap,keys:Array.from(seen)}}
export function itemInUse(row,status){if(!row||!status)return false;return !!row.eq&&itemQuantity(row)>0&&(!status.requires||status.attuned)}

function legacySheetUse(c,it){if(it.eq!=null)return !!it.eq;const key=it.key||it.n;return (c.attacks||[]).some((a)=>a.n===key||a.n===key+" (thrown)")}
export function migrateSheetAttunement(c){if(!c||!Array.isArray(c.inv))return c;
 const inv=migrateItems(c.inv,(n)=>({requires:c.inv.some((it)=>it&&it.n===n&&it.att)}),(it)=>legacySheetUse(c,it));return inv===c.inv?c:Object.assign({},c,{inv:inv})}

/* Static item overrides, distinct from per-feature FX entries. A flat weapon
   bonus applies to attack and damage together, as the existing base-item model. */
export const ITEM_OVERRIDE_FIELDS={fx:"object?",base:"array?",unattunedBonus:"number",requiresAttunedWeapon:"boolean"};
export function itemOverrideProblems(o){if(!o||typeof o!=="object"||Array.isArray(o))return ["item override must be an object"];
 const out=[];Object.keys(o).forEach((k)=>{if(!Object.prototype.hasOwnProperty.call(ITEM_OVERRIDE_FIELDS,k))out.push("unknown item override field "+k)});
 if("fx" in o&&o.fx!==null&&(!o.fx||typeof o.fx!=="object"||Array.isArray(o.fx)))out.push("item fx must be an object or null");
 if("base" in o&&o.base!==null&&(!Array.isArray(o.base)||!o.base.length||o.base.some((n)=>typeof n!=="string"||!n.trim())))out.push("item base needs weapon or armor names");
 if("unattunedBonus" in o&&(!Number.isInteger(o.unattunedBonus)||o.unattunedBonus<0))out.push("unattuned bonus must be a nonnegative integer");if("requiresAttunedWeapon" in o&&typeof o.requiresAttunedWeapon!=="boolean")out.push("weapon attunement policy must be boolean");return out}
