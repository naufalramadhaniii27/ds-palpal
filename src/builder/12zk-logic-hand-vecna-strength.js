/* Seal actual native STR and its baked dependent rows after all producers. */
import {registerSheetGroup} from './12a-logic-sheet-registry.js';
import {projectHandVecnaStrength} from './10x-logic-hand-vecna-strength.js';
registerSheetGroup({id:'hand-vecna-strength-source',group:'hand-vecna-strength',phase:'post',order:131,reads:['i.AFX','C.abilities','C.inv','C.attacks','C.speed','C.vecnaGrafts','C.skills','C.saves','C.speedSrc','C.dcAb','C.dcSrc','C.spellcasting','C.spells','C.res','C.actions'],writes:['C.handVecnaStrength'],run:function(ctx){projectHandVecnaStrength(ctx.C,ctx.i.AFX);return ctx.patch();}});
