import {classDef} from "./00-env.js";
import {registerSheetRule} from "./12a-logic-sheet-registry.js";
/* Native 2014 Tool Expertise also applies to proficiency supplied by the tool being used. */
registerSheetRule({id:"artificer-2014-tool-expertise",group:"proficiencies",about:"2014 Artificer 6: double PB for checks using a proficient tool",phase:"profs",order:110,reads:["i.r14","q.clsLv"],writes:["C.toolCheckRules"],
 run:function(ctx){const definition=classDef("Artificer");if(!ctx.i.r14||!definition||definition.a14!==1||ctx.q.clsLv("Artificer")<6)return null;ctx.C.toolCheckRules=[{kind:"proficient-tool-expertise",source:"Artificer: Tool Expertise",edition:"2014"}];return ctx.patch()}});
