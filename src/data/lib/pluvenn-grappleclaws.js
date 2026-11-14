/* Pluvenn's native Grappleclaws modifies two qualified d20 rolls. The host
   derives the capability and row origins from the admitted species producers.
   No state, resource, grapple permission, hit requirement or target save is added. */
const own=(value,key)=>value!=null&&Object.prototype.hasOwnProperty.call(value,key),obj=value=>!!value&&typeof value==='object'&&!Array.isArray(value),exact=(value,keys)=>obj(value)&&Reflect.ownKeys(value).length===keys.length&&keys.every(key=>own(value,key)),dense=value=>Array.isArray(value)&&Reflect.ownKeys(value).length===value.length+1&&Object.keys(value).every((key,index)=>key===String(index));
const PROFILE=Object.freeze({v:1,species:'Pluvenn',feature:'Grappleclaws',profile:'DrDhrolins24'}),ORIGINS=['unarmed-strike','pluvenn-razormaw'];
export function pluvennGrappleclawsCapability(){return {...PROFILE}}
export function pluvennGrappleclawsProblems(raw){return exact(raw,Object.keys(PROFILE))&&Object.keys(PROFILE).every(key=>raw[key]===PROFILE[key])?[]:['unsupported-grappleclaws-source']}
export function pluvennUnarmedRole(origin){return ORIGINS.includes(origin)?{v:1,origin}:null}
export function pluvennUnarmedAttack(row){
 if(!obj(row)||!own(row,'pluvennUnarmed')||!exact(row.pluvennUnarmed,['v','origin'])||row.pluvennUnarmed.v!==1||!ORIGINS.includes(row.pluvennUnarmed.origin))return false;
 const canonical=row.pluvennUnarmed.origin==='unarmed-strike'?'Unarmed Strike':'Razormaw';return row.n===canonical&&(!own(row,'attackKind')||row.attackKind==='unarmed');
}
function hintValid(hint){return hint===null||exact(hint,['adv','dis','fail','mode'])&&['adv','dis','fail'].every(key=>dense(hint[key])&&hint[key].every(label=>typeof label==='string'&&!!label.trim()))&&['','adv','dis'].includes(hint.mode)}
function qualifiedAttack(input){return input.kind==='attack'&&input.rollType==='attack-roll'&&pluvennUnarmedAttack(input.row)&&input.followingGrappleAttempt===true}
function qualifiedClimb(input){return input.kind==='skill'&&input.skill==='Athletics'&&input.purpose==='climbing'}
export function pluvennGrappleclawsRoll(raw,input,hint=null){
 if(pluvennGrappleclawsProblems(raw).length)return {ok:false,reason:'grappleclaws-source-unavailable'};
 if(!obj(input)||!own(input,'bonus')||!Number.isFinite(input.bonus)||!hintValid(hint))return {ok:false,reason:'roll-context-unavailable'};
 if(!qualifiedAttack(input)&&!qualifiedClimb(input))return {ok:false,reason:'qualified-context-required'};
 const adv=[...(hint?.adv||[]),PROFILE.feature],dis=(hint?.dis||[]).slice(),fail=(hint?.fail||[]).slice();
 if(fail.length)return {ok:false,reason:'automatic-failure',adv,dis,fail};const mode=adv.length&&!dis.length?'adv':dis.length&&!adv.length?'dis':'';
 return {ok:true,spec:{bon:input.bonus},adv,dis,fail,mode,dice:mode?2:1};
}
