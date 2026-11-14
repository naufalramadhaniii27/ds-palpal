export {magicRopesItemName} from '../../data/lib/magic-ropes-source.js';
export const MAGIC_ROPE_DAMAGE_TYPES=['Acid','Bludgeoning','Cold','Fire','Force','Lightning','Necrotic','Piercing','Poison','Psychic','Radiant','Slashing','Thunder'];
export function magicRopePackets(value){const lines=String(value??'').trim().split(/\n/);if(!lines[0]||lines.length>30)return null;const out=[];for(const line of lines){const m=/^\s*([a-z]+)\s+(\d+)\s*$/i.exec(line),type=m&&MAGIC_ROPE_DAMAGE_TYPES.find(type=>type.toLowerCase()===m[1].toLowerCase()),amount=m&&Number(m[2]);if(!type||!Number.isSafeInteger(amount)||amount<1)return null;out.push({type,amount})}return out}
export function magicRopeNumber(value,min=0){const text=String(value??'').trim();if(!/^-?\d+$/.test(text))return null;const n=Number(text);return Number.isSafeInteger(n)&&n>=min?n:null}
export function magicRopeDecimal(value,min=0){const text=String(value??'').trim();if(!/^-?\d+(?:\.\d+)?$/.test(text))return null;const n=Number(text);return Number.isFinite(n)&&n>=min?n:null}
export function magicRopeFact(key,label){return '<label class="cu-f"><input type="checkbox" data-rope-fact="'+key+'"> '+label+'</label>'}
export function magicRopeButton(kind,label){return '<button type="button" class="btn press" data-rope-command="'+kind+'">'+label+'</button>'}
export function magicRopeField(key,label){return '<label class="cu-f"><span>'+label+'</span><input data-rope-number="'+key+'" type="text" inputmode="numeric" autocomplete="off"></label>'}
