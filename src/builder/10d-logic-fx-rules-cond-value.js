import {registerFxCond,registerFxValue} from "./10a-logic-fx-registry.js";
/* Condition and value rules of the effect engine (tables in 10a). Pure. */
/* cond: noHeavy (no Heavy armor), noArmor (no armor and no Shield), noBody (no armor, a Shield is fine), noShield, shield, armor (wearing armor) */
registerFxCond("noHeavy",function(ar){return !(ar&&ar.cat==="Heavy")});
registerFxCond("noArmor",function(ar,sh){return !(ar||sh)});
registerFxCond("noBody",function(ar){return !ar});
registerFxCond("noShield",function(ar,sh){return !sh});
registerFxCond("shield",function(ar,sh){return !!sh});
registerFxCond("armor",function(ar){return !!ar});
/* fx engine v4: heavy, medium, light (that armor is worn), lightNone (no armor or Light armor), noMedHeavy (same as lightNone) */
registerFxCond("heavy",function(ar){return !!ar&&ar.cat==="Heavy"});
registerFxCond("medium",function(ar){return !!ar&&ar.cat==="Medium"});
registerFxCond("light",function(ar){return !!ar&&ar.cat==="Light"});
registerFxCond("lightNone",function(ar){return !ar||ar.cat==="Light"});
registerFxCond("noMedHeavy",function(ar){return !ar||ar.cat==="Light"});
registerFxCond("mwArmor",function(ar,sh,EA,inv){return !!ar&&!!EA&&(/, Masterwork/.test(EA)||(inv||[]).some((x) =>{return x.eq&&x.mw&&x.n===EA}))});
/* value words. "pb" Proficiency Bonus. "rage" Rage Damage bonus of the Barbarian levels. "halfPb" half the Proficiency Bonus, rounded down, "halfPbUp" rounded up (Remarkable Athlete). "lvl" and "halfLvl" the entry level. Ability keys (STR...) are read from the scores in fxv() */
registerFxValue("pb",function(e,env){return env.pb});
registerFxValue("rage",function(e,env){const bl=env.rageLv();return bl>=16?4:bl>=9?3:2});
registerFxValue("halfPb",function(e,env){return Math.floor(env.pb/2)});
registerFxValue("halfPbUp",function(e,env){return Math.ceil(env.pb/2)});
registerFxValue("lvl",function(e,env){return e&&e.lv!=null?e.lv:env.L});
registerFxValue("halfLvl",function(e,env){return Math.floor((e&&e.lv!=null?e.lv:env.L)/2)});
