/* Factual physical graft history; no resources, equipment inference or death mutation. */
import {genv} from './00-env.js';
import {B,__set_B,save} from './04-logic-storage.js';
import {borrowedBound,borrowedProjection,withB} from './25-logic-hooks-for-the-sheet.js';
import {createVecnaGraftsController} from '../data/lib/vecna-graft-controller.js';
import {canonical} from '../data/lib/vecna-graft-profiles.js';
import {vecnaGraftMarker} from '../data/lib/vecna-grafts.js';
import {vecnaGraftCatalog,vecnaGraftSourceForRow,withVecnaGraftsProjection,vecnaGraftSourceStamp,vecnaGraftSourcesSupported,vecnaGraftsRetainedProjection} from './10w-logic-vecna-grafts.js';
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k);
function stamp(value){const version=genv.__appVer;if(value&&typeof genv.__lsSave==='function'&&Number.isSafeInteger(version)&&version>=0)value._app=Math.max(+value._app||0,version)}
function actorBytes(value){if(!value||typeof value!=='object')return canonical(value);if(canonical(value)===null)return null;const next=Object.fromEntries(Reflect.ownKeys(value).map(key=>[key,value[key]]));stamp(next);return canonical(next)}
function actor(){const live=genv.__sheetState?.();return live?{C:live.C,S:live.state,readOnly:live.readOnly}:null}
function project(build,state){const next=withB(build,()=>withVecnaGraftsProjection(state,()=>borrowedProjection({}))),current=actor()?.C;for(const k of ['cid','id'])if(current&&own(current,k)&&!own(next,k))next[k]=structuredClone(current[k]);stamp(next);if(current?._app>next._app)next._app=current._app;return next}
function setBuild(build){stamp(build);__set_B(build)}
function saveBuild(){save();return true}
function peerPublication(previous,candidate,S){for(const name of ['__bldRodAbsorptionInventoryOwner','__bldTravelGoatInventoryOwner','__bldInstrumentSpellsInventoryOwner'])try{if(typeof genv[name]==='function'&&genv[name](previous,candidate,S,candidate,true)?.ok===true)return true}catch{}return false}
const controller=createVecnaGraftsController({actor,build:()=>B,matchingBuild:C=>borrowedBound(C.name)?.B||null,sourceStamp:vecnaGraftSourceStamp,catalog:vecnaGraftCatalog,marker:vecnaGraftMarker,sourceForRow:vecnaGraftSourceForRow,sourcesSupported:vecnaGraftSourcesSupported,actorBytes,project,retainedProject:vecnaGraftsRetainedProjection,peerPublication,setBuild,saveBuild,saveState:S=>typeof genv.__vecnaGraftsSave==='function'?genv.__vecnaGraftsSave(S):false,publish:next=>genv.__sheetSoft(next)});
genv.__bldVecnaGraftsInfo=controller.info;
genv.__bldVecnaGraftsCapture=controller.capture;
genv.__bldVecnaGraftsTokenCurrent=controller.current;
genv.__bldVecnaGraftsCommand=controller.command;
genv.__bldVecnaGraftsAcceptReceipt=controller.acceptReceipt;
genv.__bldVecnaGraftsInventoryOwner=(previous,next,state,candidate=next,publicationOnly=false)=>controller.inventoryOwner(previous,candidate,state,publicationOnly);

genv.__vecnaGraftsInventoryWriteAllowed=controller.inventoryWriteAllowed;
