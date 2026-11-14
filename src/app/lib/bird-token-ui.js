/* Decimal table measurements convert exactly into the transport ledger's integer units. */
export function birdTokenMeasurement(value,scale){const text=String(value??'').trim(),match=/^(\d+)(?:\.(\d{1,8}))?$/.exec(text);if(!match||!Number.isSafeInteger(scale)||scale<1)return null;const decimals=match[2]||'',denominator=10n**BigInt(decimals.length),numerator=BigInt(match[1]+decimals)*BigInt(scale);if(numerator%denominator!==0n)return null;const result=Number(numerator/denominator);return Number.isSafeInteger(result)?result:null}
export {birdTokenItemName} from '../../data/lib/bird-token-source.js';
export function birdTokenFact(key,label){return '<label class="cu-f"><input type="checkbox" data-bird-fact="'+key+'"> '+label+'</label>'}
export function birdTokenButton(kind,label){return '<button type="button" class="btn press" data-bird-command="'+kind+'">'+label+'</button>'}
export function birdTokenNumber(key,label){return '<label class="cu-f"><span>'+label+'</span><input data-bird-number="'+key+'" type="text" inputmode="decimal" autocomplete="off"></label>'}
