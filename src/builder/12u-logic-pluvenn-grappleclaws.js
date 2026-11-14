import {genv} from './00-env.js';
import {registerSheetGroup} from './12a-logic-sheet-registry.js';
import {pluvennGrappleclawsCapability} from '../data/lib/pluvenn-grappleclaws.js';
function nativePluvennTrait(species,name){return Array.isArray(species.traits)&&species.traits.filter(row=>Array.isArray(row)&&row[0]===name&&typeof row[1]==='string'&&row[1].trim()).length===1}
export function nativePluvennSpecies(build,species,custom){const native=genv.WXSP&&genv.WXSP.tsdd&&genv.WXSP.tsdd.Pluvenn;return !!(!custom&&build&&build.species==='Pluvenn'&&build.src&&build.src.tsdd===true&&native&&species===native&&native.hb==='DDD24'&&nativePluvennTrait(native,'Grappleclaws')&&nativePluvennTrait(native,'Razormaw'))}
/* Derived source evidence is rebuilt by native Build/Apply, never inferred from a saved display label. */
registerSheetGroup({id:'pluvenn-grappleclaws-source',group:'species',phase:'base',order:25,reads:['i.B','i.sp','i.custom'],writes:['C.pluvennGrappleclaws'],run:function(ctx){if(!nativePluvennSpecies(ctx.i.B,ctx.i.sp,ctx.i.custom))return null;ctx.C.pluvennGrappleclaws=pluvennGrappleclawsCapability();return ctx.patch()}});
