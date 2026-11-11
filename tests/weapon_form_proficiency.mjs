import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {weaponFormMetadata} from '../src/data/lib/weapon-form.js';
const filename=fileURLToPath(new URL('../src/builder/20-ui-steps-equipment-next.js',import.meta.url));
const source=fs.readFileSync(filename,'utf8').replace(/^import .*$/gm,'').replace(/export (function|var|const) /g,'$1 ');
const WEAPONS={Longsword:{cat:'M',k:'M',p:'Versatile',d:'1d8',t:'Slashing',w:3},Shortsword:{cat:'M',k:'M',p:'Finesse, Light',d:'1d6',t:'Piercing',w:2},Warhammer:{cat:'M',k:'M',p:'Versatile',d:'1d8',t:'Bludgeoning',w:2}};
const before=JSON.stringify(WEAPONS);let profs={weapons:'',armor:''},row=null;
const ctx={document:{addEventListener(){}},weaponFormMetadata,WEAPONS,B:{rs:'2024'},genv:{},bindLive(){},bindLate(){},provideQueries(){},DMAP:{},POTIONS:[],ARMOR:{},scrollOf:()=>false,baseOf:n=>({b:n}),toSheet:()=>({profs}),wpNamed:(list,name)=>list.split(', ').includes(name),wmAll:()=>[],mod:v=>Math.floor((v-10)/2),esc:String,atkRowFor:()=>row};
vm.createContext(ctx);vm.runInContext(source,ctx);let checks=0;
const check=(got,want)=>{assert.equal(got,want);checks++};
const shown=(base,name)=>ctx.idWeapon(base,name,{p:2},null,{sc:{STR:10,DEX:18,CHA:16}}).match(/<dt>Proficient<\/dt><dd>(Yes|No)<\/dd>/)[1];
for(const edition of ['2014','2024']){
 ctx.B.rs=edition;
 for(const name of ['Sun Blade','Sunsword','Dawnbringer']){
  for(const [weapons,want] of [['Shortsword','Yes'],['Longsword','Yes'],['Martial','Yes'],['Martial Finesse or Light','Yes'],['Finesse or Light','Yes'],['Light property','Yes'],['Simple','No'],['','No']]){
   profs={weapons,armor:''};row=null;check(shown('Longsword',name),want);
  }
  profs={weapons:'',armor:''};row={prof:true,type:'Radiant',die:'1d8',ab:'DEX',dmgBonus:2};check(shown('Longsword',name),'Yes');
  profs={weapons:'Martial',armor:''};row={...row,prof:false};check(shown('Longsword',name),'No');
 }
 row=null;profs={weapons:'Shortsword',armor:''};check(shown('Warhammer','Duskcrusher'),'No');profs={weapons:'Warhammer',armor:''};check(shown('Warhammer','Duskcrusher'),'Yes');
 row={prof:true,type:'Radiant',die:'1d8',ab:'STR',dmgBonus:2};profs={weapons:'',armor:''};check(shown('Warhammer','Duskcrusher'),'Yes');
 // Keep the preexisting unrelated-item label semantics; this is not a global fix.
 profs={weapons:'Shortsword',armor:''};check(shown('Longsword','Ordinary Magic Sword'),'No');
}
check(JSON.stringify(WEAPONS),before);console.log(checks+' weapon-form proficiency display checks passed ('+filename+')');
