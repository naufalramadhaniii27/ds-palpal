import {sheetTrace,sheetStrict} from "./00-env.js";
/* ==========================================================================================================================================
   toSheet() pipeline, SOLID stage 2: handler contract and registries (field groups and class rules).

   toSheet() (12-logic-export-to-sheet.js) builds a STATE and runs the pipeline. The state has four parts:
       i  inputs   data read once at the start (the model B, the class, the level, the active effect entries G ...). Never written.
       q  queries  pure read functions the old code reached through __R (fxv, fxOk, subAt, baseOf ...). Never written.
       C  the sheet being built (the object toSheet() returns)
       l  locals   values that the old code kept in local variables between its sections (prof, exp, EA, spd ...)
   A HANDLER owns one field group (kind "group": skills, ac, senses ...) or one class rule (kind "rule": Monk 14 saves, Fast Movement ...).
       { id, group, phase, order, reads:["i.B","q.subAt","C.saves"], writes:["C.saves"], run:function(ctx){...} }
   Rules also carry  about:"Monk 14"  and may carry  scope:"part", loop:"saves"  or  scope:"each", over:"l.EW", loop:"weapon-rows"  (see 4 below).
   CONTRACT (tests/solid_contract.py checks every item):
     1. run(ctx) returns a PATCH or null for "nothing to do". Patch = {C:{key:value}, l:{key:value}}. A key holds the NEW value of that whole key
        (undefined deletes the key). Every key is in `writes` and its value has the type the state schema allows (12b-logic-sheet-schema.js).
        ctx.patch() builds it: a handler works on ctx.C.<key> and ctx.l.<key> of its `writes`, which are private copies, and returns ctx.patch().
     2. PURE: same input gives the same patch. The input (ctx.i, ctx.q, ctx.C and ctx.l keys that are not in `writes`) is never changed
        (the test deep freezes it). No window, document, storage, clock, random, module state. Static rule tables come through 00-env.js.
     3. NARROW: the handler gets only the keys in `reads` (and `writes`, which count as read). The test gives it a Proxy that throws when
        any other key is read.
     4. The pipeline owns order. Handlers of a phase run sorted by (order, registration). A patch is applied before the next handler runs.
        scope:"part": the handlers of one loop run for every class part in turn (part 1: all of them, part 2: all of them ...), ctx.p is the
        part {cls, sub, lv, mc}. That keeps "first one wins" rules in the order the old per-part loop had. scope:"each" does the same over the list
        named by `over` (i.key or l.key, read when the loop starts), ctx.p is the element (the active weapons of the attack rows).
     5. Adding a field group or a class rule = one registerSheetGroup() or registerSheetRule() call. toSheet() and this loop are not edited.
   ========================================================================================================================================== */
export const SHEET_PHASES=["base","saves","skills","lang","gear","ac","savebonus","acbonus","speed","senses","init","profs","attacks","inventory","resources","actions","features","spells","late","post"];
const LIST=[];let SEQ=0,CACHE={};
const OWN=function(o,k){return Object.prototype.hasOwnProperty.call(o,k)};
function reg(kind,h){
 if(!h||typeof h.id!=="string"||typeof h.group!=="string"||typeof h.run!=="function"||!Array.isArray(h.reads)||!Array.isArray(h.writes))throw new Error("sheet registry: a handler needs id, group, reads[], writes[] and run()");
 if(SHEET_PHASES.indexOf(h.phase)<0)throw new Error("sheet registry: phase "+h.phase+" of "+h.id);
 if(typeof h.order!=="number"||!isFinite(h.order))throw new Error("sheet registry: order of "+h.id+" must be a number");
 if(LIST.some((x) =>{return x.id===h.id}))throw new Error("sheet registry: duplicate handler "+h.id);
 if(kind==="rule"&&typeof h.about!=="string")throw new Error("sheet registry: a class rule needs about (the rule it implements), "+h.id);
 const w={},r=[];h.reads.concat(h.writes).forEach((s) =>{const m=/^(i|q|C|l)\.([\w$]+)$/.exec(s);if(!m)throw new Error("sheet registry: bad key "+s+" in "+h.id);if(OWN(w,s))return;w[s]=1;r.push([m[1],m[2]])});
 h.writes.forEach((s) =>{if(!/^(C|l)\./.test(s))throw new Error("sheet registry: "+h.id+" writes "+s+" (only C.* and l.* can be written)")});
 h.kind=kind;h._r=r;h._w={};h.writes.forEach((s) =>{h._w[s]=1});h._seq=SEQ++;h.scope=h.scope||"build";
 if(h.scope!=="build"&&h.scope!=="part"&&h.scope!=="each")throw new Error("sheet registry: scope of "+h.id);
 if(h.scope!=="build"&&typeof h.loop!=="string")throw new Error("sheet registry: a looping handler needs loop, "+h.id);
 if(h.scope==="each"&&!/^(i|l)\.\w+$/.test(h.over||""))throw new Error("sheet registry: scope each needs over (i.key or l.key), "+h.id);
 LIST.push(h);CACHE={};return h}
export function registerSheetGroup(h){return reg("group",h)}
export function registerSheetRule(h){return reg("rule",h)}
export function sheetHandlers(phase){if(!CACHE[phase])CACHE[phase]=LIST.filter((h) =>{return h.phase===phase}).sort((a,b) =>{return (a.order-b.order)||(a._seq-b._seq)});return CACHE[phase]}
export function allSheetHandlers(kind){return LIST.filter((h) =>{return !kind||h.kind===kind})}
/* a private copy of a value a handler may change */
export function copyOf(v){return v&&typeof v==="object"?structuredClone(v):v}
function lazy(o,k,src,t){const own=function(v){Object.defineProperty(o,k,{value:v,writable:true,configurable:true,enumerable:true});t[k]=1;return v};
 Object.defineProperty(o,k,{configurable:true,enumerable:true,get:function(){return own(copyOf(src[k]))},set:function(v){own(v)}})}
/* strict mode (tests): a read of a key the handler did not declare throws */
function guard(o,h,ns){const ok={};h._r.forEach((x) =>{if(x[0]===ns)ok[x[1]]=1});
 return new Proxy(o,{get:function(t,k,r){if(typeof k==="string"&&!OWN(ok,k))throw new Error("sheet handler "+h.id+" read "+ns+"."+k+" outside its slice");return Reflect.get(t,k,r)}})}
/* the slice of the state one handler gets. `writes` keys are lazy private copies, the rest are the state's own values */
export function makeCtx(st,h,part){const ctx={i:{},q:{},C:{},l:{},p:part},t={C:{},l:{}};
 h._r.forEach((x) =>{const ns=x[0],k=x[1];if((ns==="C"||ns==="l")&&h._w[ns+"."+k])lazy(ctx[ns],k,st[ns],t[ns]);else ctx[ns][k]=st[ns][k]});
 if(sheetStrict())["i","q","C","l"].forEach((ns) =>{ctx[ns]=guard(ctx[ns],h,ns)});
 ctx.patch=function(){const p={C:{},l:{}};let any=false;
  ["C","l"].forEach((ns) =>{Object.keys(t[ns]).forEach((k) =>{const d=Object.getOwnPropertyDescriptor(ctx[ns],k);p[ns][k]=d&&OWN(d,"value")?d.value:undefined;any=true})});
  return any?p:null};
 return ctx}
export function applyPatch(st,p){["C","l"].forEach((ns) =>{const o=p[ns];if(!o)return;Object.keys(o).forEach((k) =>{if(o[k]===undefined)delete st[ns][k];else st[ns][k]=o[k]})})}
function step(st,h,part){const ctx=makeCtx(st,h,part),p=h.run(ctx),tr=sheetTrace();if(tr)tr(h,st,part,p);if(p)applyPatch(st,p)}
/* the loop of toSheet(): phases in order, handlers of a phase in order, a "part" loop runs its handlers once per class part */
/* what a looping handler goes over: scope "part" = the class parts, scope "each" = the list at `over` ("i.key" or "l.key", read when the loop starts) */
function overList(st,h){if(h.scope==="part")return st.parts;const m=/^(i|l)\.(\w+)$/.exec(h.over||"");return m?(st[m[1]][m[2]]||[]):[]}
export function runPhases(st,phases){phases.forEach((ph) =>{const hs=sheetHandlers(ph);let n=0;
 while(n<hs.length){const h=hs[n];
  if(h.scope!=="build"){let m=n;while(m<hs.length&&hs[m].scope===h.scope&&hs[m].loop===h.loop&&hs[m].over===h.over)m++;const grp=hs.slice(n,m),list=overList(st,h);list.forEach((q) =>{grp.forEach((g) =>{step(st,g,q)})});n=m}
  else{step(st,h);n++}}})}
export function runSheet(st){runPhases(st,SHEET_PHASES)}
