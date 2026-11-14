import {genv,fxo,gx} from './00-env.js';
import {DM14S} from './09c-logic-edition-overlays.js';
import {baseOf} from './14-logic-multiclass-hp-shop.js';
import {borrowedBound,borrowedProjection,withB} from './25-logic-hooks-for-the-sheet.js';
import {bracersSourceProfile,canonicalBracersInventory} from '../data/lib/bracers-source.js';
const item='Bracers of Archery',tokens=new WeakMap(),views=new Map();let sequence=0;
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),key=row=>own(row,'key')?row.key:row?.n;
const guidance='Open and Apply this character’s matching Build before using this bow’s recorded Bracers bonuses.';
function fail(reason){return {ok:false,reason,guidance}}
function bytes(value){return canonicalBracersInventory(value)}
function actorBytes(value){const copy=value&&typeof value==='object'?Object.fromEntries(Reflect.ownKeys(value).map(key=>[key,value[key]])):value,version=genv.__appVer;if(copy&&typeof genv.__lsSave==='function'&&Number.isSafeInteger(version)&&version>=0)copy._app=Math.max(+copy._app||0,version);return bytes(copy)}
function bound(owner){const live=genv.__sheetState?.(),cid=genv.__sheetId?.();if(!live||live.readOnly!==false||live.C?.name!==owner||!live.state||!cid)return null;const matching=borrowedBound(owner);return {C:live.C,S:live.state,B:matching?.B||null,cid,owner}}
function suspected(C,index){const row=C.attacks?.[index];if(!row)return false;const attributed=String(row.miscSrc||'').includes(item);const bow=['Longbow','Shortbow'].includes(baseOf(row.of||row.n||'').b);return attributed||bow&&((C.inv||[]).some(v=>key(v)===item)||(C.profSrc?.weapons||[]).some(v=>v?.[1]?.includes?.(item)))}
function source(b){return bracersSourceProfile(DM14S||DMGI,item,{customItems:b.B?.custLib,fxOverrides:fxo(),gxItems:gx().item})}
function frame(b){try{const character=actorBytes(b.C),build=actorBytes(b.B);return character&&build?bytes([character,build,b.cid,source(b),fxo()?.[item],gx().item?.[item]]):null}catch(error){return null}}
function consistent(b,index){if(!b.B||!source(b))return false;try{const next=withB(structuredClone(b.B),()=>borrowedProjection({}));const left=bytes([b.C.inv,b.C.attacks?.[index],b.C.profs?.weapons,b.C.profSrc?.weapons]),right=bytes([next.inv,next.attacks?.[index],next.profs?.weapons,next.profSrc?.weapons]);return typeof left==='string'&&left===right}catch(error){return false}}
function info(owner,index){const b=bound(owner);if(!b)return fail('current-actor-required');if(!Number.isInteger(index)||!b.C.attacks?.[index])return fail('current-attack-required');if(!suspected(b.C,index))return null;const before=frame(b);if(typeof before!=='string'||!consistent(b,index)||before!==frame(b))return fail('bracers-native-source-review-required');const signature=String(++sequence);views.set(signature,{bound:b,index,frame:before});if(views.size>128)views.delete(views.keys().next().value);return {ok:true,signature}}
function same(proof){const b=bound(proof.bound.owner);return !!(b&&b.C===proof.bound.C&&b.S===proof.bound.S&&b.B===proof.bound.B&&b.cid===proof.bound.cid&&typeof proof.frame==='string'&&frame(b)===proof.frame)}
function capture(owner,input){const proof=views.get(input?.signature);if(!proof||proof.bound.owner!==owner||proof.index!==input.index||!same(proof))return null;const token={};tokens.set(token,proof);return token}
function current(token){const proof=tokens.get(token);return !!proof&&same(proof)}
genv.__bldBracersAttackInfo=info;genv.__bldBracersAttackCapture=capture;genv.__bldBracersAttackCurrent=current;
