import {registerSheetGroup} from './12a-logic-sheet-registry.js';
import {createGemCheckBonuses} from './01-logic-core-helpers.js';
registerSheetGroup({id:'gem-generic-ability-check-bonuses',group:'spells',phase:'spells',order:50,reads:['C.castingSources','i.G','i.r14','i.pb','q.clsLv','q.fxv'],writes:['C.castingSources'],run:function(ctx){if(!ctx.C.castingSources)return null;const bonuses=createGemCheckBonuses(ctx.i.G,ctx.i.r14?'2014':'2024',ctx.q.clsLv('Bard'),ctx.i.pb,ctx.q.fxv);if(bonuses)ctx.C.castingSources={...ctx.C.castingSources,checkBonuses:bonuses};return ctx.patch()}});
