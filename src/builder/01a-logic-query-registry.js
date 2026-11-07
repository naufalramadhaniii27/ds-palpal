/* Query registry (SOLID stage 5, D and I): the pure read functions a toSheet() handler may call through ctx.q (the "q" part of the state,
   see 12a-logic-sheet-registry.js). Before this file, 12-logic-export-to-sheet.js wrapped every function of a later module in an adapter
   (function(n){return __R.baseOf(n)}). Now the module that owns a function provides it here, once, under the name handlers read:
       provideQuery("baseOf",baseOf)
   QRY is the object toSheet() hands to the handlers as `q`. A name is provided once (a second provider throws), the value is a function.
   Modules that load before 12 export their functions and 12 imports them. Modules that load after 12 (13, 14, 16, 20) call provideQuery()
   at load time, which is before the first toSheet() runs. No window, no __R. */
export const QRY={};
const OWN=function(o,k){return Object.prototype.hasOwnProperty.call(o,k)};
export function provideQuery(name,fn){
 if(typeof name!=="string"||!/^[A-Za-z_$][\w$]*$/.test(name))throw new Error("query registry: bad name "+name);
 if(typeof fn!=="function")throw new Error("query registry: "+name+" must be a function");
 if(OWN(QRY,name))throw new Error("query registry: duplicate query "+name);
 QRY[name]=fn;return fn}
export function provideQueries(table){Object.keys(table).forEach(function(k){provideQuery(k,table[k])})}
export function queryNames(){return Object.keys(QRY)}
