import {registerSheetGroup} from './12a-logic-sheet-registry.js';
import {clericPowerSource,discipleOfLifeProfile,discipleOfLifeDescriptorProblems} from './01-logic-core-helpers.js';
/* The existing clericPower enum must include disciple-of-life before this producer is installed. */
registerSheetGroup({id:'cleric-disciple-of-life',group:'cleric-powers',phase:'post',order:81,reads:['i.B','i.G','i.r14'],writes:['C.discipleOfLife'],run:function(ctx){
 const edition=ctx.i.r14?'2014':'2024',candidates=(ctx.i.G||[]).filter(entry=>entry&&entry.clericPower&&entry.clericPower.profile==='disciple-of-life').map(entry=>clericPowerSource(entry,ctx.i.B,edition)).filter(Boolean);if(!candidates.length)return null;const source=candidates[0];if(!candidates.every(candidate=>JSON.stringify(candidate)===JSON.stringify(source)))return null;const rule=discipleOfLifeProfile(source),descriptor=rule&&{rule,source};if(descriptor&&!discipleOfLifeDescriptorProblems(descriptor).length)ctx.C.discipleOfLife=descriptor;return ctx.patch();
}});
