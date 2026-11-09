import {ABK} from "./01-logic-core-helpers.js";
/* ==========================================================================================================================================
   fx engine, SOLID stage 1: handler contract and registries.

   An effect entry (schema: SOURCE-NOTES.md, "fx schema") carries fields. One HANDLER owns one field group (abUp, abDown, toggle, ...).
   A handler is a plain object registered in a registry:
       { id:"ab-raise", group:"abilityScores", phase:"raise", fields:["abUp"], uses:["sc","src"], once:false, run:function(e,ctx){...} }
   CONTRACT (tests/solid_contract.py checks every item):
     1. run(e, ctx) returns a PATCH (a fresh object) or null for "nothing to do". It never returns or reuses e or ctx.
     2. PURE: the same (e, ctx) gives the same patch. It does not change e or ctx (both can be deep frozen). It does not touch window,
        document, storage or any module state. Everything it needs comes in through e and ctx (ctx holds data and, where a rule needs a
        value that depends on the model, a small function such as ctx.val or ctx.pick, which are themselves pure reads).
     3. NARROW: a handler reads only the entry fields it lists in `fields` (plus the structural keys in `eKeys`, "*" = the whole entry, for a handler that copies it) and only the context keys it lists in `uses`.
        The orchestrator passes it a context holding just those keys; tests/solid_contract.py runs it behind Proxies that throw on any other read.
     4. The orchestrator owns ordering and merging: it loops entries, calls handlers of one phase in registration order (then `order`),
        applies each patch before the next handler runs (so ctx shows the updated state), and never branches on the kind of an entry or
        on a field name. A new field group = a new handler registered here, no orchestrator edit.
     5. `once:true` = the handler applies to the first entry of the phase that gives a patch and is skipped afterwards.
   PATCH FORMS (one interpreter per registry):
     "entry"   {skip:true} drop the entry | {set:{field:value}} copy of the entry with these fields | {replace:object} use this object
     "ability" {adj:[{k, s, v, to?}]}  push {s,v} on the source list of ability k; when `to` is given the score becomes `to`
     "sheet"   {spd:number, srcAdd:string} Speed becomes spd, text added to the speed source | {dark:{vision,src}} | {initBonus:[{s,v}]}
   REGISTRIES AND PHASES:
     "entry"   gate (may skip) -> prepare (may set fields on the source entry) -> post (may replace the built entry)
     "ability" pre-asi -> item-raise -> raise -> item-set -> set      (see 11-logic-derivation.js abil())
     "sheet"   speed -> speed-mul -> darkvision -> init               (see 12-logic-export-to-sheet.js toSheet(); stage 1 moved four groups, the rest of toSheet() is still inline, see reports/solid-s1-analysis.md)
   ========================================================================================================================================== */
export const ABFULL={STR:"Strength",DEX:"Dexterity",CON:"Constitution",INT:"Intelligence",WIS:"Wisdom",CHA:"Charisma"};
/* abilities named in a stored pick value (array of names, or text): "Strength", "STR", "WIS +1" */
export function abOfPick(v){const t=Array.isArray(v)?v.join(" "):String(v||""),o=[];ABK.forEach((k) =>{if(new RegExp("\\b"+k+"\\b|\\b"+ABFULL[k]+"\\b","i").test(t))o.push(k)});return o}
/* fxCh: the stored pick "key" for an entry, read from the pick map ch. A feat entry also finds its own picks: gx pick (gx-key-feat-slot) or native FEATS pick (key-slot) */
export function chPick(ch,key,pre,kind,okey,any){let v=ch[pre+key];if(v==null&&kind==="feat"){v=ch["gx-"+key+"-feat-"+okey];if(v==null)v=ch[key+"-"+okey];if(v==null&&any){const k0=key+"-";Object.keys(ch).some((k) =>{if(k.indexOf(k0)===0&&ch[k]!=null){v=ch[k];return true}return false})}}return v}/* fx batch H: when.any = also read the pick from another feat slot (Fey Stage 4 reads the Court of the Stage 1 feat) */
const PHASES={entry:["gate","prepare","post"],ability:["pre-asi","item-raise","raise","item-set","set"],"sheet":["speed","speed-mul","darkvision","init"]};
const REG={};
function reg(name){if(!PHASES[name])throw new Error("fx registry: unknown registry "+name);return REG[name]||(REG[name]={name:name,list:[],cache:{}})}
export function registerFxHandler(name,h){const r=reg(name);
 if(!h||typeof h.id!=="string"||typeof h.run!=="function"||typeof h.group!=="string"||!Array.isArray(h.fields)||!Array.isArray(h.uses))throw new Error("fx registry: a handler needs id, group, fields[], uses[] and run()");
 if(h.eKeys&&!Array.isArray(h.eKeys))throw new Error("fx registry: eKeys of "+h.id+" must be a list");
 if(PHASES[name].indexOf(h.phase)<0)throw new Error("fx registry: phase "+h.phase+" is not in "+name);
 if(r.list.some((x) =>{return x.id===h.id}))throw new Error("fx registry: duplicate handler "+h.id);
 r.list.push(h);r.cache={};return h}
/* handlers of one phase in run order (registration order, `order` number first when given) */
export function fxHandlers(name,phase){const r=reg(name);if(!r.cache[phase])r.cache[phase]=r.list.map((h,i) =>{return {h:h,i:i}}).filter((x) =>{return x.h.phase===phase}).sort((a,b) =>{return ((a.h.order||0)-(b.h.order||0))||(a.i-b.i)}).map((x) =>{return x.h});return r.cache[phase]}
export function allFxHandlers(name){return reg(name).list.slice()}
export function fxPhases(name){return PHASES[name].slice()}
/* the slice of the context one handler gets: only the keys it lists in `uses` (I: a handler is given what it declares and nothing else) */
export function sliceCtx(h,ctx){const s={};for(let i=0;i<h.uses.length;i++){const k=h.uses[i];s[k]=ctx[k]}return s}
/* generic loop of the orchestrators: every entry of `list` goes through the handlers of `phase`; apply(patch) merges a patch into the state ctx shows */
export function runFxPhase(name,phase,list,ctx,apply){const hs=fxHandlers(name,phase),done={};
 list.forEach((e) =>{hs.forEach((h) =>{if(h.once&&done[h.id])return;const p=h.run(e,sliceCtx(h,ctx));if(p){if(h.once)done[h.id]=1;apply(p)}})})}
/* SOURCES: where entries come from. A source is {id, items, collect(ctx)}; collect returns descriptors
   {list, kind, owner, lv, pre, lblOf, okey, ocls, alias} (list = raw entries, the rest is what the "entry" handlers and the built entry need).
   items:true marks a source that is skipped when the caller asks for the list without magic items. Run order = registration order. */
const SRC=[];
export function registerFxSource(s){if(!s||typeof s.id!=="string"||typeof s.collect!=="function")throw new Error("fx registry: a source needs id and collect()");
 if(SRC.some((x) =>{return x.id===s.id}))throw new Error("fx registry: duplicate source "+s.id);SRC.push(s);return s}
export function fxSources(){return SRC.slice()}
/* "entry" orchestration step: run the handlers of one phase over ONE entry, folding their patches. Returns the entry (maybe a new object) or null when a handler said skip.
   Interprets only the generic patch forms {skip}, {replace}, {set}; it knows no entry field and no entry kind. */
export function foldFxPhase(name,phase,cur,ctx){const hs=fxHandlers(name,phase);for(let i=0;i<hs.length&&cur!==null;i++){const p=hs[i].run(cur,sliceCtx(hs[i],ctx));if(!p)continue;if(p.skip)cur=null;else if(p.replace)cur=p.replace;else if(p.set)cur=Object.assign({},cur,p.set)}return cur}
/* RULE TABLES (same contract: pure, no window, no module state). A condition rule is  function(ar, hasShield, armorName, inv) -> boolean  (ar = armor row or undefined,
   inv = the character's inventory list). A value rule is  function(e, env) -> number  (env = {L: character level, pb: Proficiency Bonus, rageLv: function() -> Barbarian levels}).
   fxOk() and fxv() in 11-logic-derivation.js look the name up here, so a new cond or a new value word is one registration, no edit of those functions. */
const CONDS={},VALS={};
function own(t,k){return Object.prototype.hasOwnProperty.call(t,k)}
export function registerFxCond(name,fn){if(own(CONDS,name)||typeof fn!=="function")throw new Error("fx registry: bad or duplicate cond "+name);CONDS[name]=fn;return fn}
export function registerFxValue(name,fn){if(own(VALS,name)||typeof fn!=="function")throw new Error("fx registry: bad or duplicate value rule "+name);VALS[name]=fn;return fn}
export function fxCondRule(name){return typeof name==="string"&&own(CONDS,name)?CONDS[name]:null}
export function fxValueRule(name){return typeof name==="string"&&own(VALS,name)?VALS[name]:null}
export function fxRuleTables(){return {conds:Object.assign({},CONDS),values:Object.assign({},VALS)}}
