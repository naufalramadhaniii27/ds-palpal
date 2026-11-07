import {packStrict} from "./00-env.js";
/* ==========================================================================================================================================
   applyPacks() pipeline, SOLID stage 5: registry of pack steps (same shape as the sheet registry in 12a, smaller).

   applyPacks() (13-logic-sources-and-packs.js) rebuilds the rule tables (species, backgrounds, feats, subclasses, class features, prices, always
   prepared spells, magic items) from the base snapshot and the sources that are on. Each rebuild is a STEP:
       { id, phase, order, about, uses:["T.SPECIES","T.B","q.dmapAlias"], writes:["T.SPECIES"], run:function(ctx){...} }
   phase "reset"  runs once, restores one table from the base snapshot.
   phase "pack"   runs once for every enabled pack, in pack order (all steps of pack 1, then all steps of pack 2 ...), ctx.p is the pack.
   phase "post"   runs once, the gates of the optional books, the 2014 switch and the fallbacks for a choice that no longer exists.
   CONTRACT (tests/solid_contract.py checks every item):
     L  1. A step changes the tables it lists in `writes`, in place (the table object stays the same object and keeps its type, PACK_TABLES). It returns nothing.
        2. Steps of a phase run sorted by (order, registration). A step sees what the earlier steps did.
     I  3. A step gets only the keys in `uses` (writes count as used): ctx.T.<table> and ctx.q.<service>. The test gives it a Proxy that throws on any other key.
     D  4. A step imports only this registry. Tables come through ctx.T (00-env.js packTables() and the model B), services through ctx.q.
        No window, document, bare global name or __R.
     O  5. Adding a rebuild = one registerPackStep() call. applyPacks() and runPackSteps() are not edited.
   ========================================================================================================================================== */
export const PACK_PHASES=["reset","pack","post"];
/* the schema of the tables a step may use (L): the type each one keeps */
export const PACK_TABLES={SPECIES:"object",BACKGROUNDS:"object",FEATS:"object",CLASSES:"object",PRICE:"object",AUTO:"object",CF_FULL:"object",DMGI:"array",DMAP:"object",PACK_CF:"array",B:"object",BASE:"object"};
const LIST=[];let SEQ=0,CACHE={};
const OWN=function(o,k){return Object.prototype.hasOwnProperty.call(o,k)};
function checkUses(h){const r=[];
 h.uses.forEach((s) =>{const m=/^(T|q)\.([\w$]+)$/.exec(s);if(!m)throw new Error("pack registry: bad key "+s+" in "+h.id);if(m[1]==="T"&&!OWN(PACK_TABLES,m[2]))throw new Error("pack registry: unknown table "+s+" in "+h.id);r.push([m[1],m[2]])});
 h.writes.forEach((s) =>{if(!/^T\./.test(s)||h.uses.indexOf(s)<0)throw new Error("pack registry: "+h.id+" writes "+s+" (only a T.* table it also lists in uses)")});return r}
export function registerPackStep(h){
 if(!h||typeof h.id!=="string"||typeof h.about!=="string"||typeof h.run!=="function"||!Array.isArray(h.uses)||!Array.isArray(h.writes))throw new Error("pack registry: a step needs id, about, uses[], writes[] and run()");
 if(PACK_PHASES.indexOf(h.phase)<0)throw new Error("pack registry: phase "+h.phase+" of "+h.id);
 if(typeof h.order!=="number"||!isFinite(h.order))throw new Error("pack registry: order of "+h.id+" must be a number");
 if(LIST.some((x) =>{return x.id===h.id}))throw new Error("pack registry: duplicate step "+h.id);
 h._u=checkUses(h);h._seq=SEQ++;LIST.push(h);CACHE={};return h}
export function packSteps(phase){if(!CACHE[phase])CACHE[phase]=LIST.filter((h) =>{return h.phase===phase}).sort((a,b) =>{return (a.order-b.order)||(a._seq-b._seq)});return CACHE[phase]}
export function allPackSteps(){return LIST.slice()}
function typeOk(v,t){return t==="array"?Array.isArray(v):!!v&&typeof v==="object"&&!Array.isArray(v)}
/* strict mode (tests): a read of a table or service the step did not declare throws */
function sliceGuard(o,h,ns){const ok={};h._u.forEach((x) =>{if(x[0]===ns)ok[x[1]]=1});
 return new Proxy(o,{get:function(t,k,r){if(typeof k==="string"&&!OWN(ok,k))throw new Error("pack step "+h.id+" read "+ns+"."+k+" outside its slice");return Reflect.get(t,k,r)}})}
function makeCtx(st,h,p){const ctx={T:{},q:{},p:p};
 h._u.forEach((x) =>{ctx[x[0]][x[1]]=st[x[0]][x[1]]});
 if(packStrict()){ctx.T=sliceGuard(ctx.T,h,"T");ctx.q=sliceGuard(ctx.q,h,"q")}
 return ctx}
function checkWrites(st,h,ctx){h.writes.forEach((s) =>{const k=s.slice(2);
 if(ctx.T[k]!==st.T[k])throw new Error("pack step "+h.id+" replaced "+k+" (a step changes its tables in place)");
 if(!typeOk(st.T[k],PACK_TABLES[k]))throw new Error("pack step "+h.id+" left "+k+" with the wrong type")})}
function step(st,h,p){const ctx=makeCtx(st,h,p);h.run(ctx);if(packStrict())checkWrites(st,h,ctx)}
function runPhase(st,phase,p){packSteps(phase).forEach((h) =>{step(st,h,p)})}
/* the enabled packs are read after the reset steps: a reset step can turn a source on (a character that uses a MoM species keeps it) */
/* solid:orchestrator runPackSteps */
export function runPackSteps(st){runPhase(st,"reset");st.q.enabledPacks().forEach((p) =>{runPhase(st,"pack",p)});runPhase(st,"post")}
