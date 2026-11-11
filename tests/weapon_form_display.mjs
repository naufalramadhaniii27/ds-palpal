import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {weaponFormMetadata,weaponFormUsable} from '../src/data/lib/weapon-form.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8').replace(/^import .*$/gm,'').replace(/export (function|var|const) /g,'$1 ');
const weapons={Longsword:{k:'M',cat:'M',p:'Versatile',t:'Slashing',d:'1d8',w:3,m:''},Warhammer:{k:'M',cat:'M',p:'Versatile',t:'Bludgeoning',d:'1d8',w:2,m:''}};
const nativeBefore=JSON.stringify(weapons),builder={document:{addEventListener(){}},B:{rs:'2024'},WEAPONS:weapons,weaponFormMetadata,bindLive(){},bindLate(){},provideQueries(){},genv:{},wmAll:()=>[],mod:v=>Math.floor((v-10)/2),esc:String,DMAP:{},POTIONS:[],ARMOR:{},scrollOf:()=>false,baseOf:n=>({b:n}),atkRowFor:()=>null};
vm.createContext(builder);vm.runInContext(read('src/builder/20-ui-steps-equipment-next.js'),builder);builder.isProf=()=>true;
const abilities={sc:{STR:10,DEX:18,CHA:16}};
for(const name of ['Sun Blade','Sunsword','Dawnbringer','Duskcrusher']){
 const base=name==='Duskcrusher'?'Warhammer':'Longsword';builder.atkRowFor=()=>null;
 let html=builder.idWeapon(base,name,{p:2},null,abilities);assert.match(html,/<dt>Damage Type<\/dt><dd>Radiant<\/dd>/);
 if(base==='Longsword'){assert.match(html,/<dt>Damage<\/dt><dd>1d8\+6<\/dd>/);assert.match(html,/Versatile, Finesse/)}else{assert.match(html,/<dt>Damage<\/dt><dd>1d8\+2<\/dd>/);assert.doesNotMatch(html,/Finesse/)}
 builder.atkRowFor=()=>({type:'Psychic',ab:'CHA',die:'1d8',dmgBonus:2});html=builder.idWeapon(base,name,{p:2},null,abilities);assert.match(html,/<dt>Damage Type<\/dt><dd>Psychic<\/dd>/);assert.match(html,/<dt>Damage<\/dt><dd>1d8\+5<\/dd>/);
}
builder.atkRowFor=()=>({type:'Cold',ab:'STR',die:'1d8',dmgBonus:0});assert.match(builder.idWeapon('Longsword','Ordinary Magic Sword',{p:0},null,abilities),/<dt>Damage Type<\/dt><dd>Slashing<\/dd>/);assert.equal(JSON.stringify(weapons),nativeBefore);
let derived={atk:[{dmg:'1d8+6'}]};const app={C:{rs:'2024'},env:{},weaponFormMetadata,weaponFormUsable,bindLive(){},lateGet:()=>derived};vm.createContext(app);vm.runInContext(read('src/app/05-logic-helpers.js'),app);
const staleHtml='<dl><dt>Damage</dt><dd>1d8</dd><dt>Damage Type</dt><dd>Slashing</dd><dt>Proficient</dt><dd>No</dd></dl>';
for(const name of ['Sun Blade','Sunsword','Dawnbringer','Duskcrusher']){
 const it={n:name,html:staleHtml};app.C.attacks=[{n:name,type:'Radiant',prof:true}];assert.match(app.itemHtml(it),/<dt>Damage Type<\/dt><dd>Radiant<\/dd>/);
 app.C.attacks[0].type='Psychic';assert.match(app.itemHtml(it),/<dt>Damage Type<\/dt><dd>Psychic<\/dd>/);assert.equal(it.html,staleHtml);
 derived={atk:[]};assert.match(app.itemHtml(it),/<dt>Damage Type<\/dt><dd>Psychic<\/dd>/);derived={atk:[{dmg:'1d8+6'}]};
}
app.C.attacks=[{n:'Ordinary Magic Sword',type:'Cold',prof:true}];assert.match(app.itemHtml({n:'Ordinary Magic Sword',html:staleHtml}),/<dt>Damage Type<\/dt><dd>Slashing<\/dd>/);
app.C.attacks=[];assert.equal(app.itemHtml({n:'Sun Blade',html:staleHtml}),staleHtml);
console.log('weapon form display: four native potential profiles, actual Pact types, cached sheet overlays and canonical isolation passed');
