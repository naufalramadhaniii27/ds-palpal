/* Source capability shape is distinct from the host's live native source certificate. */
import {vecnaGraftProfile,vecnaGraftNativeGx,canonical} from './vecna-graft-profiles.js';
import {vecnaGraftsProblems,vecnaGraftsProjection,vecnaGraftMarker} from './vecna-grafts.js';
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export const VECNA_GRAFT_LABEL='Eye and Hand of Vecna';
function data(v,k){const d=Object.getOwnPropertyDescriptor(v,k);return !!d&&d.enumerable===true&&own(d,'value')}
function exact(v,keys){return obj(v)&&Reflect.ownKeys(v).length===keys.length&&keys.every(k=>data(v,k))}
function dense(v){return Array.isArray(v)&&Reflect.ownKeys(v).length===v.length+1&&Object.keys(v).every((k,i)=>k===String(i)&&data(v,k))}
function quantity(row){return !own(row,'q')||data(row,'q')&&['string','number'].includes(typeof row.q)&&Number(row.q)===1}
function bindingSources(cap){return cap.bindings.map(b=>({id:b.id,profile:b.profile,itemFingerprint:b.itemFingerprint,attuned:true,originalCurrentSource:true}))}
function target(row){return obj(row)&&data(row,'k')&&row.k==='Initiative'&&(data(row,'s')&&row.s===VECNA_GRAFT_LABEL||own(row,'vecnaGraft')||own(row,'vecnaGrafts'))}
export function vecnaGraftSourcesProblems(cap){try{
 if(!exact(cap,['v','inventoryFingerprint','authorityFingerprint','bindings'])||cap.v!==1||typeof cap.inventoryFingerprint!=='string'||typeof cap.authorityFingerprint!=='string'||!dense(cap.bindings))return ['unsupported-vecna-source-capability'];
 const ids=new Set(),indices=new Set();for(const b of cap.bindings){if(!exact(b,['id','profile','index','itemFingerprint','inventoryName','inventoryKey']))return ['unsupported-vecna-source-binding'];const p=vecnaGraftProfile(b.profile),marker=vecnaGraftMarker({vecnaGraft:{v:1,id:b.id}});if(!p||!marker.ok||b.itemFingerprint!==p.itemFingerprint||!Number.isSafeInteger(b.index)||b.index<0||typeof b.inventoryName!=='string'||!b.inventoryName||b.inventoryKey!==null&&typeof b.inventoryKey!=='string'||ids.has(b.id)||indices.has(b.index))return ['unsupported-vecna-source-binding'];ids.add(b.id);indices.add(b.index)}return [];
 }catch{return ['unsupported-vecna-source-capability']}}
export function vecnaGraftSourcesSupported(C,S=null){try{
 if(!obj(C)||!data(C,'vecnaGraftSources')||!data(C,'vecnaGrafts')||!data(C,'inv')||!dense(C.inv))return false;const cap=C.vecnaGraftSources;if(vecnaGraftSourcesProblems(cap).length||vecnaGraftsProblems(C.vecnaGrafts).length||cap.inventoryFingerprint!==canonical(C.inv)||cap.authorityFingerprint!==canonical(C.vecnaGrafts))return false;
 if(S!==null&&(!obj(S)||!data(S,'vecnaGrafts')||canonical(S.vecnaGrafts)!==cap.authorityFingerprint))return false;
 return cap.bindings.every(b=>{const row=C.inv[b.index];return obj(row)&&data(row,'n')&&row.n===b.inventoryName&&(!own(row,'key')||data(row,'key'))&&(own(row,'key')?row.key:null)===b.inventoryKey&&data(row,'attunedActive')&&row.attunedActive===true&&quantity(row)&&vecnaGraftMarker(row).id===b.id&&C.vecnaGrafts.physical.some(p=>p.id===b.id&&p.profile===b.profile&&p.itemFingerprint===b.itemFingerprint)});
 }catch{return false}}
function initiative(C){const result=vecnaGraftsProjection(C.vecnaGrafts,bindingSources(C.vecnaGraftSources));return result.ok&&result.initiativeAdvantage===true}
export function vecnaGraftSourceStatus(C,S=null){try{const flags=obj(C)&&data(C,'itemAdv')&&dense(C.itemAdv)?C.itemAdv:[],relevant=own(C,'vecnaGrafts')||own(C,'vecnaGraftSources')||own(S,'vecnaGrafts')||flags.some(target),verified=vecnaGraftSourcesSupported(C,S);return {relevant,reviewRequired:relevant&&!verified,verified,initiativeAdvantage:verified&&initiative(C)}}catch{return {relevant:true,reviewRequired:true,verified:false,initiativeAdvantage:false}}}
export function vecnaGraftFlag(C,row,S=null){try{if(!target(row))return row;return exact(row,['k','s'])&&row.s===VECNA_GRAFT_LABEL&&vecnaGraftSourcesSupported(C,S)&&initiative(C)?row:null}catch{return null}}
function original(rows,p){if(!dense(rows))return false;const found=rows.filter(row=>Array.isArray(row)&&data(row,'0')&&row[0]===p.item);return found.length===1&&canonical(found[0])===p.itemFingerprint}
export function vecnaGraftCertificateCurrent(C,S,frame={}){try{
 if(!obj(S)||!data(S,'vecnaGrafts')||!vecnaGraftSourcesSupported(C,S))return {current:false,stamp:null};const cap=C.vecnaGraftSources,names=cap.bindings.flatMap(b=>[vecnaGraftProfile(b.profile).item,b.inventoryName,b.inventoryKey].filter(n=>typeof n==='string'));
 const stamp=canonical({cap,inventory:C.inv,authority:C.vecnaGrafts,catalog:(frame.originalCatalogRows||[]).filter(row=>Array.isArray(row)&&data(row,'0')&&names.includes(row[0])),fx:frame.fxOverrides,gx:frame.gxItems,resolved:frame.resolvedRows,custom:frame.customItems});if(stamp===null)return {current:false,stamp:null};
 const current=cap.bindings.every(b=>{const p=vecnaGraftProfile(b.profile),aliases=[p.item,b.inventoryName,b.inventoryKey].filter(n=>typeof n==='string');if(!original(frame.originalCatalogRows,p)||aliases.some(name=>own(frame.fxOverrides,name)||own(frame.gxItems,name)&&!vecnaGraftNativeGx(name,frame.gxItems[name])))return false;
 if(frame.resolvedRows!==undefined){if(!obj(frame.resolvedRows))return false;const name=own(frame.resolvedRows,b.inventoryName)?b.inventoryName:p.item;if(!data(frame.resolvedRows,name)||canonical(frame.resolvedRows[name])!==p.itemFingerprint)return false;}
 if(frame.customItems!==undefined&&(!dense(frame.customItems)||canonical(frame.customItems)===null||frame.customItems.some(row=>aliases.includes(Array.isArray(row)?row[0]:row?.n))))return false;return true});return {current,stamp};
 }catch{return {current:false,stamp:null}}}
