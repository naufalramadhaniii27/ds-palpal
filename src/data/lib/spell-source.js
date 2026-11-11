import {tattooFixedSourceStats} from './spellwrought-tattoo.js';
// Derived source-key spellcasting channels. Never infers class identity from display text.
const ABILITIES=['STR','DEX','CON','INT','WIS','CHA'];
const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
export function spellChannel(source,scores,pb,bonus={atk:0,dc:0}){
 if(!object(source)||typeof source.k!=='string'||typeof source.n!=='string'||!ABILITIES.includes(source.ab)||!scores||!Number.isFinite(scores[source.ab])||!Number.isFinite(pb)||!object(bonus))return null;
 const atk=bonus.atk==null?0:bonus.atk,dc=bonus.dc==null?0:bonus.dc;
 if(!Number.isFinite(atk)||!Number.isFinite(dc))return null;
 const mod=Math.floor((scores[source.ab]-10)/2);
 return {k:source.k,n:source.n,ab:source.ab,mod,atk:pb+mod+atk,dc:8+pb+mod+dc};
}
export function spellChannelsDiffer(channels){
 if(!Array.isArray(channels)||channels.length<2)return false;
 const first=channels[0];
 return channels.some(channel=>!channel||!first||channel.ab!==first.ab||channel.atk!==first.atk||channel.dc!==first.dc);
}
function spellOverrideNumber(value){return value==null||value===''||!Number.isFinite(+value)?null:+value}
export function selectSpellSource(spellcasting,spell,overrides,adjustments=undefined){
 if(spell&&own(spell,'fixedSpellSource')){
  const tattoo=tattooFixedSourceStats(spell.fixedSpellSource,spell);if(!tattoo)return {};
  if(adjustments!==undefined){if(!object(adjustments)||Reflect.ownKeys(adjustments).length!==1||!own(adjustments,'attackAdjustment')||!Number.isFinite(adjustments.attackAdjustment))return {};tattoo.atk+=adjustments.attackAdjustment;if(!Number.isFinite(tattoo.atk))return {}}
  return selectSpellSource(tattoo,null,overrides);
 }
 const main=object(spellcasting)?spellcasting:{};
 let chosen=main;
 const fixed=spell&&object(spell.itc)&&(spell.itc.dc!=null||spell.itc.atk!=null);
 if(!fixed&&spell){
  const channels=Array.isArray(main.by)?main.by:[];
  const keyed=own(spell,'sourceKey');
  const channel=keyed?channels.find(row=>row&&typeof spell.sourceKey==='string'&&row.k===spell.sourceKey):spell.ab?channels.find(row=>row&&row.ab===spell.ab):null;
  if(channel)chosen=channel;else if(keyed)chosen={};
 }
 const result={...chosen};
 if(fixed){if(spell.itc.dc!=null)result.dc=spell.itc.dc;if(spell.itc.atk!=null)result.atk=spell.itc.atk}
 if(object(overrides)){const atk=spellOverrideNumber(overrides.atk),dc=spellOverrideNumber(overrides.dc);if(atk!==null)result.atk=atk;if(dc!==null)result.dc=dc}
 return result;
}
