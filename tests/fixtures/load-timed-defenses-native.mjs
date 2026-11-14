/* Actual producer dependencies for older isolated source fixtures, never a fake resource adapter. */
import fs from'node:fs';import vm from'node:vm';import*as model from'../../src/data/lib/timed-defenses.js';import*as source from'../../src/data/lib/timed-defenses-source.js';
const text=fs.readFileSync(new URL('../../src/builder/10n-logic-timed-defenses.js',import.meta.url),'utf8'),exports=[...text.matchAll(/export function (\w+)/g)].map(m=>m[1]),code=text.replace(/^import [^\n]*\n/gm,'').replace(/export /g,'');
export function loadTimedDefensesNative(context){Object.assign(context,model,source);vm.runInContext('(function(){'+code+';Object.assign(globalThis,{'+exports.join(',')+'})})()',context)}
