/* Real native Ioun producer for isolated older source fixtures; no substitute permission. */
import fs from 'node:fs';
import vm from 'node:vm';
import * as model from '../../src/data/lib/ioun-orbit.js';
import * as source from '../../src/data/lib/ioun-orbit-source.js';
const text=fs.readFileSync(new URL('../../src/builder/10o-logic-ioun-orbit.js',import.meta.url),'utf8');
const names=[...text.matchAll(/export function (\w+)/g)].map(m=>m[1]);
const code=text.replace(/^import [^\n]*\n/gm,'').replace(/^export \{[^\n]*\};?\n?/gm,'').replace(/export /g,'');
export function loadIounOrbitNative(context){
 Object.assign(context,model,source);
 vm.runInContext('(function(){'+code+';Object.assign(globalThis,{'+names.join(',')+'})})()',context);
}
