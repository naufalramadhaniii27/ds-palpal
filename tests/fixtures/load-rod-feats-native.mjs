/* Real background/feat/choice producers for the native Rod fixture. No grants are synthesized. */
import fs from 'node:fs';import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../../src/'+p,import.meta.url),'utf8');
const strip=s=>s.replace(/^import [^\n]*\n/gm,'').replace(/^bindLive\([^\n]*\n/gm,'').replace(/\bexport /g,'');
const line=(s,n)=>{const found=s.split('\n').find(v=>new RegExp('(?:^|[;}])(?:export )?function '+n+'\\(').test(v));if(!found)throw Error('Missing native helper '+n);return found.replace(/\bexport /g,'');};
const between=(s,a,b)=>{const start=s.indexOf(a),end=s.indexOf(b,start);if(start<0||end<=start)throw Error('Missing native section '+a);return s.slice(start,end);};
const loaded=new WeakSet();
export function loadRodFeatsNative(c){
 if(loaded.has(c))return;loaded.add(c);
 const core=read('builder/01-logic-core-helpers.js'),rules=read('builder/05-logic-choice-model-ruleset.js'),magic=read('builder/03-logic-magic-item-effects.js'),choices=read('builder/09-logic-feats-and-choices.js'),picks=read('builder/10-logic-v17-additions.js'),packs=read('builder/13-logic-sources-and-packs.js'),equipment=read('builder/14-logic-multiclass-hp-shop.js'),legacy=read('builder/08-logic-2014-rules.js');
 vm.runInContext(core.split('\n').filter(s=>s.startsWith('export var ABK=')||s.startsWith('export var SRC=')).join('\n').replace(/export /g,'')+'\n'+line(rules,'CL')+'\n'+line(rules,'R14')+'\n'+line(magic,'bgX'),c);
 const featReview=magic.split('\n').filter(s=>s.startsWith('const VALDA_FEAT_SOURCES=')||s.startsWith('export function featSourceReview(')).join('\n');vm.runInContext('(function(){'+strip(featReview)+';globalThis.featSourceReview=featSourceReview;})()',c);
 if(typeof c.LU_X==='undefined')vm.runInContext(read('data/db4/02-limited-uses-damage-rows-save-notes.js'),c);
 vm.runInContext(read('data/hbpack-builtin-homebrew.js'),c);
 vm.runInContext(line(packs,'allPacks')+'\n'+line(packs,'enabledPacks')+'\n'+strip(between(packs,'export function subChoicesFor(','/* always-prepared spells.'))+'\n'+line(packs,'miFeats'),c);
 // Native lazy source initialization runs before readonly actor/signature capture.
 c.enabledPacks();
 vm.runInContext(rules.split('\n').filter(s=>/^export var (SUBLV14|SUBLBL14|SRC14)=/.test(s)).join('\n').replace(/export /g,''),c);
 vm.runInContext(line(legacy,'subLv')+'\n'+line(legacy,'subLbl')+'\n'+line(legacy,'pEff'),c);
 const pickNames=['invList','pactList','pk','slotMaxOf','wisElse','wsList','wizLv','savVals','bookOwn','bookOf','bookNeed','wlMc','invLvl','wlCantrips','invPicks'];
 vm.runInContext('(function(){'+strip(between(picks,'export function invList(','/* Agonizing Blast:'))+';Object.assign(globalThis,{'+pickNames.join(',')+'});})()',c);
 vm.runInContext('(function(){'+strip(between(equipment,'/* mcChoices steps','function rollAvg('))+';globalThis.mcChoices=mcChoices;})()',c);
 const names=[...choices.matchAll(/export function (\w+)/g)].map(m=>m[1]);vm.runInContext('(function(){'+strip(choices)+';Object.assign(globalThis,{'+names.join(',')+'});})()',c);
 const env=read('builder/00-env.js');vm.runInContext(['featDef','speciesDef','full14'].map(n=>line(env,n)).join('\n'),c);
 vm.runInContext('(function(){'+['builder/06a-data-2014-long-text-more.js','builder/06a2-data-2024-species-long-text.js','builder/06b-data-2014-long-text.js'].map(p=>strip(read(p))).join('\n')+';genv.__bldFull14=full14;})()',c);
 const stages=read('builder/09b-logic-choice-stages.js');vm.runInContext('(function(){'+strip(stages)+';globalThis.choicesBuild=choicesBuild;})()',c);
 Object.assign(c.QRY,{allFeats:c.allFeats,miFeats:c.miFeats,featSpells:c.featSpells,dmSpells:c.dmSpells});
}
