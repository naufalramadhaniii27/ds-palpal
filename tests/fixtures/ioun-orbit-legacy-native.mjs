import fs from 'node:fs';import vm from 'node:vm';import {createHash} from 'node:crypto';import {createIounOrbitEngine} from './ioun-orbit-native.mjs';
export const iounPreU54Source=JSON.parse(fs.readFileSync(new URL('./ioun-orbit-pre-u54-activefx.json',import.meta.url),'utf8'));
if(createHash('sha256').update(iounPreU54Source.source).digest('hex')!==iounPreU54Source.provenance.sha256)throw Error('Historical native source changed');
/* Replays the actual prior native item source through native11/12 math. It does
   not admit/toss, forge receipts, or infer numeric deltas. Prospective operations
   always return to the current native producer before the fixture is exposed. */
export function createLegacyIounEngine(options={}){
 const engine=createIounOrbitEngine(options),currentProducer=engine.c.activeFx;
 try{vm.runInContext(iounPreU54Source.source.replace(/export /g,''),engine.c);const historical=engine.project();delete historical.iounOrbit;delete historical.iounOrbitSources;engine.setC(historical);}finally{engine.c.activeFx=currentProducer;}
 return engine;
}
