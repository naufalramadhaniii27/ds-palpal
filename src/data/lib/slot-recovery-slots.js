// Actual native slot capacity and spent counters; item rules supply the allowed level and scope.
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k),plain=o=>!!o&&typeof o==='object'&&!Array.isArray(o),dense=a=>Array.isArray(a)&&Reflect.ownKeys(a).length===a.length+1&&Object.keys(a).every((k,i)=>k===String(i)),fail=reason=>({ok:false,reason});
export function slotRecoverySpentSlots(character,state,policy={maxSlotLevel:3,slotScope:'any'}){
 if(!plain(character)||!plain(state)||!plain(state.used)||!Array.isArray(character.res)||!plain(character.spellcasting)||!dense(character.spellcasting.slots)||character.spellcasting.slots.length>9||character.spellcasting.slots.some(value=>!Number.isSafeInteger(value)||value<0))return fail('slot-provenance-unavailable');
 if(!policy||![3,9].includes(policy.maxSlotLevel)||!['any','pact'].includes(policy.slotScope))return fail('unsupported-slot-policy');
 const rows=[],sc=character.spellcasting;if(sc.pact!=null&&(!plain(sc.pact)||!Number.isSafeInteger(sc.pact.lvl)||sc.pact.lvl<1||sc.pact.lvl>5||!Number.isSafeInteger(sc.pact.n)||sc.pact.n<1))return fail('invalid-native-pact');
 for(const [key,level,max,reset] of [...Array.from({length:9},(_,i)=>i+1).map(level=>['s'+level,level,sc.slots[level-1]??0,'long']),...(sc.pact?[['pact',sc.pact.lvl,sc.pact.n,'short']]:[])]){
  if(!Number.isSafeInteger(max)||max<0)return fail('invalid-native-capacity');
  const found=character.res.filter(row=>row&&row.k===key);
  if(!max){if(found.some(row=>row.max>0))return fail('slot-capacity-mismatch');continue}
  if(found.length!==1||found[0].max!==max||found[0].reset!==reset||own(found[0],'item'))return fail('slot-resource-mismatch');
  const spent=own(state.used,key)?state.used[key]:0;
  if(!Number.isSafeInteger(spent)||spent<0||spent>max)return fail('invalid-spent-slot-counter');
  if(Number.isSafeInteger(level)&&level>=1&&level<=policy.maxSlotLevel&&spent>0&&(policy.slotScope==='any'||key==='pact'))rows.push({key,level,max,spent});
 }
 return {ok:true,slots:rows};
}
