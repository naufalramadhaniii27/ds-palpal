/* ================= BREAKDOWN ================= */
function bdAbout(key){
  var m=key.match(/^(ab|save|sk|ah|ad)-(.+)$/), spec=null, label="";
  if(m){ if(m[1]==="ab"){ spec="g:"+ABN[m[2]]; label=ABN[m[2]]; } else if(m[1]==="save"){ spec="g:Saving Throw"; label="a saving throw"; }
    else if(m[1]==="sk"){ var sk=C.skills[+m[2]]; if(sk&&GLOSS[sk.n]){ spec="g:"+sk.n; label=sk.n; } }
    else { spec="w:"+m[2]; label="this attack"; } }
  else { var map={ac:"Armor Class",init:"Initiative",speed:"Speed",pb:"Proficiency Bonus",hp:"Hit Points",carry:"Carrying Capacity",dc:"Grapple",dark:"Darkvision","pas-per":"Passive Perception","pas-ins":"Insight","pas-inv":"Investigation"}; if(map[key]){ spec="g:"+map[key]; label=map[key]; } }
  return spec ? '<p class="bk-about"><button type="button" class="lk" data-info="'+esc(spec)+'">What is '+esc(label)+'?</button></p>' : '';
}
window.__miInfo=function(s){ try{ return infoHTML(s); }catch(e){ return null; } }; window.__miBd=function(k){ try{ return B[k]||null; }catch(e){ return null; } };
function bdHTML(key){
  var b=B[key]; if(!b) return "";
  var rows=b.parts.map(function(p){
    var v = p.raw ? esc(p.v) : sg(p.v);
    var cls = p.raw ? "" : (p.v<0?" neg":(p.v===0?" zero":""));
    return '<div class="bk-r"><b>'+esc(p.l)+'</b>'+(p.note?'<small>'+esc(p.note)+'</small>':'')+'<span class="v'+cls+'">'+v+'</span></div>';
  }).join("");
  return '<div class="bk">'+rows+'</div><div class="bk-t"><span>'+(b.totalLabel||"Total")+'</span><b>'+esc(b.total)+'</b></div>'+(b.f?'<p class="bk-f">'+b.f+'</p>':'')+(key==="hp"?hpModH():'')+bdAbout(key)+
    (/^sense-/.test(key)?'<p class="bk-f" style="color:var(--faint)">Set by the builder. Change it there, then Apply.</p>':(cuqOf(key)?'<p class="bk-f" style="color:var(--faint)">To set your own number, turn on Edit mode and tap it.</p>':'<p class="bk-f" style="color:var(--faint)">Change any of these in Edit.</p>'));
}
function showBD(key){ if(!B[key]) return; showEntry({type:"bd",key:key},false); }

