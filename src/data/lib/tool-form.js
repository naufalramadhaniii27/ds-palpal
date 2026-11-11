const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
export const ARTISAN_TOOLS=["Alchemist's Supplies", "Brewer's Supplies", "Calligrapher's Supplies", "Carpenter's Tools", "Cartographer's Tools", "Cobbler's Tools", "Cook's Utensils", "Glassblower's Tools", "Jeweler's Tools", "Leatherworker's Tools", "Mason's Tools", "Painter's Supplies", "Potter's Tools", "Smith's Tools", "Tinker's Tools", "Weaver's Tools", "Woodcarver's Tools"];
export function toolFormMetadata(name){
 if(name==='Manifold Tool')return {action:'Magic',requiresAttunement:true};
 if(['+1 All-Purpose Tool','+2 All-Purpose Tool','+3 All-Purpose Tool'].includes(name))return {action:'Action',requiresAttunement:true};
 return null;
}
export function normalizeToolForm(state){
 if(!object(state)||state.v!==1)return null;
 if(state.tool!==null&&!ARTISAN_TOOLS.includes(state.tool))return null;
 return {...state};
}
export function migrateToolForms(rows,version=undefined){
 if(!Array.isArray(rows)||version!==undefined&&version!==null&&version!==1)return {rows,version};
 let changed=false;const next=rows.map(row=>{
  if(!row||!toolFormMetadata(row.key||row.n)||Object.prototype.hasOwnProperty.call(row,'toolForm'))return row;
  changed=true;return {...row,toolForm:{v:1,tool:null}};
 });return {rows:changed?next:rows,version:1};
}
export function selectToolForm(state,tool,declaration){
 if(!declaration||declaration.touch!==true)return null;
 if(!ARTISAN_TOOLS.includes(tool))return null;
 const old=normalizeToolForm(state);if(!old)return null;
 return {...old,tool};
}
export function toolFormCheck(row,tool,abilityModifier,pb,character,declaration){
 const definition=row&&toolFormMetadata(row.key||row.n),form=row&&normalizeToolForm(row.toolForm);
 const q=row&&row.q==null?1:Number(row&&row.q);
 const active=!!definition&&!!form&&form.tool===tool&&!!declaration&&declaration.usingThisItem===true&&Number.isFinite(q)&&q>0&&(!definition.requiresAttunement||row.attuned===true&&row.attunedActive!==false);
 if(tool!==null&&!ARTISAN_TOOLS.includes(tool)||!Number.isFinite(abilityModifier)||!Number.isSafeInteger(pb)||pb<0)return null;
 const base=toolBaseMultiplier(character,tool),reviewRequired=toolProficiencyReviewRequired(character,tool);
 const generic=Array.isArray(character&&character.toolCheckRules)&&character.toolCheckRules.some(rule=>object(rule)&&Object.keys(rule).length===3&&Object.keys(rule).every(key=>['kind','source','edition'].includes(key))&&rule.kind==='proficient-tool-expertise'&&rule.source==='Artificer: Tool Expertise'&&rule.edition==='2014');
 const multiplier=Math.min(2,Math.max(base,active?1:0)*(generic?2:1));
 return {active,reviewRequired,reason:reviewRequired?'proficiency-review-required':'',proficiencyMultiplier:multiplier,total:reviewRequired?null:abilityModifier+pb*multiplier};
}

// Use existing computed typed source tables, never a request-supplied PB multiplier.
export function toolBaseMultiplier(character,tool){
 if(!ARTISAN_TOOLS.includes(tool))return 0;
 const sources=character&&character.profSrc&&character.profSrc.tools;
 const proficient=Array.isArray(sources)&&sources.some(row=>Array.isArray(row)&&row[0]===tool&&typeof row[1]==='string');
 const names=character&&character.profs&&character.profs.tools;
 if(!proficient||typeof names!=='string'||!names.split(',').map(n=>n.trim()).includes(tool))return 0;
 const expertise=Array.isArray(character.toolExp)&&character.toolExp.some(row=>row&&row.n===tool);
 return expertise?2:1;
}

export function toolProficiencyReviewRequired(character,tool){
 if(tool===null||!ARTISAN_TOOLS.includes(tool))return false;
 const typed=character&&character.profSrc&&character.profSrc.tools;
 const named=Array.isArray(typed)&&typed.some(row=>Array.isArray(row)&&row[0]===tool&&typeof row[1]==='string');
 const text=character&&character.profs&&character.profs.tools;
 const displayed=typeof text==='string'&&text.split(',').map(n=>n.trim()).includes(tool);
 return named!==displayed;
}
