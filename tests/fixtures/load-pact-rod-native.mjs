/* Actual source adapter dependencies for native Ioun comparison fixtures. */
import fs from 'node:fs';
import vm from 'node:vm';
import *as model from '../../src/data/lib/pact-rod-source.js';
import *as profiles from '../../src/data/lib/pact-rod-profiles.js';
const text=fs.readFileSync(new URL('../../src/builder/10p-logic-pact-rod.js',import.meta.url),'utf8');
const names=[...text.matchAll(/export function (\w+)/g)].map(m=>m[1]);
const code=text.replace(/^import [^\n]*\n/gm,'').replace(/export /g,'');
export function loadPactRodNative(context){Object.assign(context,model,profiles);vm.runInContext('(function(){'+code+';Object.assign(globalThis,{'+names.join(',')+'})})()',context);}
