import {C,DEF,FROZEN,S,__set_C,__set_FROZEN,__set_S,__set_cSaveT,__set_saveT,cSaveT,clone,saveT} from "./04-logic-storage.js";
import {ask,esc,toast} from "./05-logic-helpers.js";
import {applyLook} from "./07-ui-theme-contrast-spring.js";
import {renderNotes} from "./08-ui-render-sheet-and-actions.js";
import {syncPortrait} from "./20-ui-portrait.js";
import {renderAll} from "./35-ui-combo.js";
import {SY,__set_syIcon,syApi,syIcon,syPicIn} from "./43-logic-cloud-sync.js";
import { html, render as drawHtml, raw as rawHtml } from "./lib/html.js";
/* T8 stage 3b: Friends. Profile with name, @username and friend code, mutual follow, block, view-only sharing per character,
   copy requests, a simple feed of friends' characters, and an Admin tab for the owner of the app. Only when cloud backup is on.
   No popups for social events: a small dot on the Friends button marks new followers, requests and shares. */
const FR={me:null, tab:"profile", pics:{}, busy:false};
function frApi(path,opt){ if(opt&&opt.json){ opt.headers={"content-type":"application/json"}; opt.body=JSON.stringify(opt.json); delete opt.json; } return syApi(path,opt); }
function frErr(e){ e=e||{}; const m={"username-taken":"That username is taken.","bad-username":"Use 3 to 20 letters, digits or _ for the username.","limit":"Daily limit reached. Try again tomorrow.",
  "copy-off":"The owner does not take copy requests for this character.","already":"You already asked for a copy of this character.","full":"Your cloud space is full.",
  "their-space-full":"Their cloud space is full, so the copy cannot be made now.","not-found":"Not found. The person or character may not be shared with you.","not-allowed":"This character is no longer shared with them."}[e.error];
  toast(m||(e.signin?"Sign in again to use Friends.":"The cloud cannot be reached now.")); }
function frWhen(t){ try{ return new Date(t).toLocaleDateString(undefined,{day:"numeric",month:"short"}); }catch(e){ return ""; } }
function frInit(n){ return esc(String(n||"?").trim().slice(0,1).toUpperCase()||"?"); }
function frSum(x){ let s={}; try{ s=JSON.parse(x.sum||"{}")||{}; }catch(e){} return s; }
/* portraits of friends' characters, fetched once per page */
function frPic(owner,id,img){ const k=owner+"/"+id; if(FR.pics[k]){ if(FR.pics[k]!=="-") img.style.backgroundImage="url("+FR.pics[k]+")"; return; }
  FR.pics[k]="-"; syApi("pic/"+owner+"/"+encodeURIComponent(id)).then((p) =>{ FR.pics[k]=p.data; img.style.backgroundImage="url("+p.data+")"; img.classList.add("has"); },() =>{ img.textContent=img.textContent||"?"; }); }
function frCard(x,owner){ const s=frSum(x); return html`<button type="button" class="fr-card" data-frview="${owner}/${x.id}"><span class="fr-por" data-pic="${owner}/${x.id}" data-ph="${s.ph?1:0}" style="${s.por?'background-image:url('+esc(s.por)+')':''}">${rawHtml(s.por||s.ph?'':frInit(x.name))}</span><b>${x.name||"Unnamed"}</b><small>${s.cls||x.sub||""}${rawHtml(s.sp?' · '+esc(s.sp):'')}</small>${x.pin ? html`<i class="fr-pin" aria-label="Pinned">★</i>` : ''}${x.by ? html`<small class="fr-by">${x.by.name} · ${frWhen(x.t)}</small>` : ''}</button>`; }
function frPicsIn(box){ box.querySelectorAll('.fr-por[data-ph="1"]').forEach((el) =>{ const p=el.getAttribute("data-pic").split("/"); frPic(p[0],p[1],el); }); }
function frPerson(p,extra){ return html`<div class="fr-row"><button type="button" class="fr-who" data-frprof="${p.id}"><span class="fr-av">${rawHtml(frInit(p.name))}</span><span><b>${p.name||""}</b><small>${rawHtml(p.username?'@'+esc(p.username):'')}</small></span></button>${rawHtml(extra||'')}</div>`; }

function frOpen(tab){ if(!SY.on){ toast("Friends needs cloud backup. Open the app online first."); return; }
  const old=document.getElementById("bkp"); if(old) old.remove(); const w=document.createElement("div"); w.id="bkp"; w.className="bkp fr-dlg"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","bkpT");
  const tabs=[["profile","Profile"],["friends","Friends"],["sharing","Sharing"],["requests","Requests"],["shared","Shared"],["feed","Feed"]];
  if(SY.me&&SY.me.admin) tabs.push(["admin","Admin"]);
  drawHtml(html`<div class="bkpb"><div class="bkph"><b id="bkpT">Friends</b><button type="button" class="bkpx" data-frx="1" aria-label="Close">×</button></div><div class="fr-tabs" role="tablist">${rawHtml(tabs.map((t) =>{ return html`<button type="button" role="tab" data-frtab="${t[0]}">${rawHtml(t[1])}<i class="fr-dot" data-dot="${t[0]}" hidden></i></button>`; }).join(""))}</div><div class="fr-body"></div></div>`, w);
  document.body.appendChild(w); FR.w=w; frDots(); frTab(tab||FR.tab);
  w.addEventListener("click",frClick); w.addEventListener("submit",frSubmit); w.addEventListener("change",frChange); }
function frTab(t){ FR.tab=t; const w=FR.w; if(!w) return; w.querySelectorAll("[data-frtab]").forEach((b) =>{ b.setAttribute("aria-selected",b.getAttribute("data-frtab")===t?"true":"false"); });
  const box=w.querySelector(".fr-body"); drawHtml(html`<p class="sy-note">Loading…</p>`, box); ({profile:frProfile,friends:frFriends,sharing:frSharing,requests:frRequests,shared:frShared,feed:frFeed,admin:frAdmin}[t]||frProfile)(box);
  if(t==="friends"||t==="requests"||t==="shared") frApi("seen",{method:"POST"}).then(() =>{ const s=(SY.me||{}).social; if(s){ s.newFollowers=0; s.newRequests=0; s.newShares=0; } frDots(); },() =>{}); }
function frMe(){ return frApi("me").then((m) =>{ SY.me=m; return m; }); }

function frProfile(box){ frMe().then((m) =>{
  box.innerHTML='<div class="fr-head"><span class="fr-av fr-big">'+frInit(m.name)+'</span><div><b class="fr-name">'+esc(m.name)+'</b><small>'+(m.username?'@'+esc(m.username)+' · ':'')+'Friend code <b class="fr-code">'+esc(m.code)+'</b> <button type="button" class="btn press fr-sm" data-frcopy="'+esc(m.code)+'">Copy</button></small>'+
    '<small>'+esc((m.social||{}).followers||0)+' followers · '+esc((m.social||{}).following||0)+' following</small></div></div>'+(m.bio?'<p class="fr-bio">'+esc(m.bio)+'</p>':'')+
    '<form class="fr-form" data-frform="me"><label>Display name<input name="name" maxlength="40" value="'+esc(m.name)+'"></label><label>Username<input name="username" maxlength="20" placeholder="3 to 20 letters, digits or _" value="'+esc(m.username)+'"></label>'+
    '<label>Bio<textarea name="bio" maxlength="160" rows="2">'+esc(m.bio)+'</textarea></label><button type="submit" class="btn pri press">Save profile</button></form>'+
    '<p class="sy-note">Friends find you by username or friend code. There is no public list of people. Your email is never shown.</p>'+
    '<b class="sy-h">As friends see it</b><div class="fr-grid" data-frgrid="me"><p class="sy-note">Loading…</p></div>';
  frApi("users/"+m.id).then((p) =>{ const g=box.querySelector("[data-frgrid]"); drawHtml(p.chars.length ? rawHtml(p.chars.map((x) =>{ return frCard(x,m.id); }).join("")) : html`<p class="sy-note">No characters on your profile yet. Choose them in Sharing.</p>`, g); frPicsIn(g); },() =>{}); },
  (e) =>{ drawHtml(html`<p class="sy-note">The cloud cannot be reached now.</p>`, box); }); }

function frFriends(box){ frApi("friends").then((f) =>{ FR.f=f;
  const mut=f.following.filter((x) =>{ return x.mutual; }), wait=f.following.filter((x) =>{ return !x.mutual; }), back=f.followers.filter((x) =>{ return !x.mutual; });
  drawHtml(html`<form class="fr-find" data-frform="find"><input name="q" placeholder="Username or friend code" aria-label="Username or friend code" autocomplete="off"><button type="submit" class="btn pri press">Find</button></form><div class="fr-found"></div>${rawHtml(back.length?'<b class="sy-h">Follow back</b>'+back.map((p) =>{ return frPerson(p,'<button type="button" class="btn pri press fr-sm" data-frfollow="'+esc(p.id)+'">Follow back</button>'); }).join(""):'')}<b class="sy-h">Friends (${rawHtml(mut.length)})</b>${rawHtml(mut.length?mut.map((p) =>{ return frPerson(p,'<button type="button" class="btn press fr-sm" data-frunf="'+esc(p.id)+'" data-name="'+esc(p.name)+'">Unfollow</button>'); }).join(""):'<p class="sy-note">Friends follow each other. Share your username or friend code with them.</p>')}${rawHtml(wait.length?'<b class="sy-h">Waiting for them to follow back</b>'+wait.map((p) =>{ return frPerson(p,'<button type="button" class="btn press fr-sm" data-frunf="'+esc(p.id)+'" data-name="'+esc(p.name)+'">Cancel</button>'); }).join(""):'')}${rawHtml(f.blocked.length?'<b class="sy-h">Blocked</b>'+f.blocked.map((p) =>{ return frPerson(p,'<button type="button" class="btn press fr-sm" data-frunb="'+esc(p.id)+'">Unblock</button>'); }).join(""):'')}`, box); },
  () =>{ drawHtml(html`<p class="sy-note">The cloud cannot be reached now.</p>`, box); }); }

/* one person's profile: header for anyone with the name or code, the grid for mutual friends */
function frProf(h,box){ box=box||FR.w.querySelector(".fr-body"); drawHtml(html`<p class="sy-note">Loading…</p>`, box);
  frApi("users/"+encodeURIComponent(h)).then((p) =>{ const u=p.user, r=p.rel, me=SY.me||{};
    const act=r.self?'':(r.mutual?'<button type="button" class="btn press" data-frunf="'+esc(u.id)+'" data-name="'+esc(u.name)+'">Unfollow</button>':r.following?'<button type="button" class="btn press" data-frunf="'+esc(u.id)+'" data-name="'+esc(u.name)+'">Cancel follow</button>':'<button type="button" class="btn pri press" data-frfollow="'+esc(u.id)+'">'+(r.followsYou?'Follow back':'Follow')+'</button>')+
      (r.self?'':'<button type="button" class="btn press" data-frblock="'+esc(u.id)+'" data-name="'+esc(u.name)+'">Block</button>');
    drawHtml(html`<button type="button" class="btn press fr-sm" data-frtab="${FR.tab}">← Back</button><div class="fr-head"><span class="fr-av fr-big">${rawHtml(frInit(u.name))}</span><div><b class="fr-name">${u.name}</b><small>${rawHtml(u.username?'@'+esc(u.username):'')}</small><small>${p.counts.followers} followers · ${p.counts.following} following · ${p.counts.chars} characters</small></div></div>${rawHtml(u.bio?'<p class="fr-bio">'+esc(u.bio)+'</p>':'')}<div class="fr-acts">${rawHtml(act)}</div>${rawHtml(r.mutual?'<div class="fr-grid">'+(p.chars.length?p.chars.map((x) =>{ return frCard(x,u.id); }).join(""):'<p class="sy-note">No characters shared with you yet.</p>')+'</div>':'<p class="sy-note">'+(r.following?'You follow '+esc(u.name)+'. Their characters appear here when they follow you back.':'Follow each other to see characters.')+'</p>')}`, box);
    frPicsIn(box); },(e) =>{ drawHtml(html`<button type="button" class="btn press fr-sm" data-frtab="friends">← Back</button><p class="sy-note">No one found with that username or friend code.</p>`, box); }); }

/* my characters: who may see each one */
function frSharing(box){ frApi("chars").then((j) =>{ const a=(j.chars||[]).filter((c) =>{ return !c.deleted; });
  const lab={"private":"Only me","profile":"All friends","shared":"Chosen friends"};
  drawHtml(html`<p class="sy-note">Friends only see a character, they cannot change it. Copies are made only when you approve a request.</p>${rawHtml(a.length?a.map((c) =>{ return html`<div class="sy-row"><span><b>${c.name||"Unnamed"}${rawHtml(c.pin?' ★':'')}</b><small>${lab[c.vis]||"Only me"}${rawHtml(c.fromUser?' · copied from '+esc(c.fromUser):'')}</small></span><button type="button" class="btn press" data-frshare="${c.id}">Change</button></div>`; }).join(""):'<p class="sy-note">No characters in the cloud yet.</p>')}`, box); },
  () =>{ drawHtml(html`<p class="sy-note">The cloud cannot be reached now.</p>`, box); }); }
function frShareEdit(id,box){ drawHtml(html`<p class="sy-note">Loading…</p>`, box);
  Promise.all([frApi("chars/"+encodeURIComponent(id)+"/meta"),frApi("friends"),frApi("chars")]).then((v) =>{ const mt=v[0], mut=v[1].following.filter((x) =>{ return x.mutual; }), c=(v[2].chars||[]).filter((x) =>{ return x.id===id; })[0]||{}, on={};
    (mt.share||[]).forEach((p) =>{ on[p.id]=1; });
    const r=function(val,t,d){ return '<label class="fr-opt"><input type="radio" name="vis" value="'+val+'"'+(mt.vis===val?' checked':'')+'><span><b>'+t+'</b><small>'+d+'</small></span></label>'; };
    drawHtml(html`<button type="button" class="btn press fr-sm" data-frtab="sharing">← Back</button><b class="sy-h">${c.name||"Character"}</b><form class="fr-form" data-frform="share" data-id="${id}">${rawHtml(r("private","Only me","Not shown to anyone."))}${rawHtml(r("profile","All friends","On your profile for every mutual friend."))}${rawHtml(r("shared","Chosen friends","Only the friends you tick below."))}<div class="fr-pick"${rawHtml(mt.vis==="shared"?'':' hidden')}>${rawHtml(mut.length?mut.map((p) =>{ return html`<label class="fr-chk"><input type="checkbox" name="to" value="${p.id}"${on[p.id]?' checked':''}> ${p.name}${p.username ? html` <small>@${p.username}</small>` : ''}</label>`; }).join(""):'<p class="sy-note">No mutual friends yet.</p>')}</div><label class="fr-chk"><input type="checkbox" name="pin"${rawHtml(mt.pin?' checked':'')}> Pin to the top of my profile</label><label class="fr-chk"><input type="checkbox" name="copyOk"${rawHtml(mt.copyOk?' checked':'')}> Friends may ask for a copy</label><button type="submit" class="btn pri press">Save</button></form>`, box); },(e) =>{ frErr(e); frTab("sharing"); }); }

function frRequests(box){ frApi("friends").then((f) =>{ const st={pending:"Waiting",approved:"Approved, the copy is in your characters",declined:"Declined",expired:"No answer in 7 days",cancelled:"Cancelled"};
  drawHtml(html`<b class="sy-h">Asking for a copy of yours</b>${rawHtml(f.requestsIn.length?f.requestsIn.map((r) =>{ return html`<div class="fr-req"><div><b>${(r.from||{}).name||"Someone"}</b> asks for a copy of <b>${r.charName||"a character"}</b><small>${frWhen(r.created)}</small>${r.message ? html`<p class="fr-msg">${r.message}</p>` : ''}</div><div class="fr-acts"><button type="button" class="btn pri press fr-sm" data-frok="${r.id}">Approve</button><button type="button" class="btn press fr-sm" data-frno="${r.id}">Decline</button></div></div>`; }).join(""):'<p class="sy-note">No requests.</p>')}<b class="sy-h">Your requests</b>${rawHtml(f.requestsOut.length?f.requestsOut.map((r) =>{ return html`<div class="sy-row"><span><b>${r.charName||"A character"}</b><small>${((r.to||{}).name||"")+" · "+(st[r.status]||r.status)}</small></span>${r.status==="pending" ? html`<button type="button" class="btn press fr-sm" data-frcancel="${r.id}">Cancel</button>` : ''}</div>`; }).join(""):'<p class="sy-note">You have not asked for any copies.</p>')}`, box); },
  () =>{ drawHtml(html`<p class="sy-note">The cloud cannot be reached now.</p>`, box); }); }
function frShared(box){ frApi("shared").then((j) =>{ drawHtml(j.chars.length ? html`<div class="fr-grid">${rawHtml(j.chars.map((x) =>{ return frCard(x,x.owner); }).join(""))}</div>` : html`<p class="sy-note">Nothing shared with you yet.</p>`, box); frPicsIn(box); },() =>{ drawHtml(html`<p class="sy-note">The cloud cannot be reached now.</p>`, box); }); }
function frFeed(box){ frApi("feed").then((j) =>{ drawHtml(j.chars.length ? html`<p class="sy-note">Newest changes from your friends’ characters.</p><div class="fr-grid">${rawHtml(j.chars.map((x) =>{ return frCard(x,x.owner); }).join(""))}</div>` : html`<p class="sy-note">When friends share characters, the newest ones appear here.</p>`, box); frPicsIn(box); },() =>{ drawHtml(html`<p class="sy-note">The cloud cannot be reached now.</p>`, box); }); }
function frErrors(a){ const e=a.errors; if(!e) return ""; if(!e.perVersion.length) return html`<h3 class="set-h">Errors</h3><p class="sy-note">No errors reported in the last 7 days.</p>`;
  return '<h3 class="set-h">Errors, last 7 days</h3><table class="fr-tab"><tr><th>Version</th><th>Reports</th><th>Different</th></tr>'+e.perVersion.map((r) =>{ return html`<tr><td>${r.ver}</td><td>${rawHtml(r.n)}</td><td>${rawHtml(r.kinds)}</td></tr>`; }).join("")+'</table>'+
    '<table class="fr-tab"><tr><th>Version</th><th>Kind</th><th>Message</th><th>Count</th></tr>'+e.top.map((r) =>{ return html`<tr><td>${r.ver}</td><td>${r.kind}</td><td>${r.msg}${r.src ? html` <small>${r.src}</small>` : ''}</td><td>${rawHtml(r.n)}</td></tr>`; }).join("")+'</table>'; }
function frAdmin(box){ frApi("admin").then((a) =>{ const g=a.global, mb=function(b){ return (b/1048576).toFixed(1)+" MB"; }, pc=function(x,y){ return Math.round(x/y*100)+"%"; }, y=a.yesterday||{};
  drawHtml(html`<p class="sy-note">Only you see this page. Free plan limits reset at 07:00.</p><table class="fr-tab"><tr><th></th><th>Today</th><th>Free limit</th></tr><tr><td>Requests</td><td>${rawHtml(a.today.req)}</td><td>${rawHtml(pc(a.today.req,g.req))} of ${rawHtml(g.req)}</td></tr><tr><td>Rows written</td><td>${rawHtml(a.today.wr)}</td><td>${rawHtml(pc(a.today.wr,g.wr))} of ${rawHtml(g.wr)}</td></tr><tr><td>Rows read</td><td>${rawHtml(a.today.rd)}</td><td>${rawHtml(pc(a.today.rd,g.rd))} of ${rawHtml(g.rd)}</td></tr></table><p>Mode today: <b>${{normal:"Normal",save:"Saving (backup every minute)",pause:"Paused until 07:00"}[a.mode]||a.mode}</b>${rawHtml(y.day?' · Yesterday '+esc(y.pct)+'% of the free limit':'')}</p><p>People: <b>${rawHtml(a.totals.users)}</b> · active today ${rawHtml(a.totals.activeToday)} · characters ${rawHtml(a.totals.chars)}</p><p>Storage: <b>${rawHtml(mb(a.totals.charBytes+a.totals.versionBytes+a.totals.picBytes))}</b> of 5 GB (characters ${rawHtml(mb(a.totals.charBytes))}, versions ${rawHtml(mb(a.totals.versionBytes))}, portraits ${rawHtml(mb(a.totals.picBytes))})</p><table class="fr-tab"><tr><th>Person</th><th>Characters</th><th>Space</th><th>Last day</th></tr>${rawHtml(a.people.map((p) =>{ return html`<tr><td>${p.name}${p.username ? html` <small>@${p.username}</small>` : ''}</td><td>${rawHtml(p.chars)}</td><td>${rawHtml(mb(p.bytes))}</td><td>${p.active||""}</td></tr>`; }).join(""))}</table>${rawHtml(frErrors(a))}${rawHtml(frLearn(a))}`, box); },
  () =>{ drawHtml(html`<p class="sy-note">The cloud cannot be reached now.</p>`, box); }); }

function frClick(e){ const t=e.target, w=FR.w, box=w.querySelector(".fr-body");
  if(t===w||t.closest("[data-frx]")){ w.remove(); FR.w=null; return; }
  const b=t.closest("[data-frtab],[data-frprof],[data-frfollow],[data-frunf],[data-frblock],[data-frunb],[data-frshare],[data-frok],[data-frno],[data-frcancel],[data-frview],[data-frcopy]"); if(!b) return;
  const d=function(k){ return b.getAttribute(k); };
  if(b.hasAttribute("data-frtab")){ frTab(d("data-frtab")); return; }
  if(b.hasAttribute("data-frprof")){ frProf(d("data-frprof")); return; }
  if(b.hasAttribute("data-frcopy")){ try{ navigator.clipboard.writeText(d("data-frcopy")).then(() =>{ toast("Friend code copied."); },() =>{ toast("Friend code: "+d("data-frcopy")); }); }catch(x){ toast("Friend code: "+d("data-frcopy")); } return; }
  if(b.hasAttribute("data-frfollow")){ frApi("follow/"+d("data-frfollow"),{method:"POST"}).then((r) =>{ toast(r.mutual?"You are now friends.":"Following. You become friends when they follow you back."); FR.tab==="friends"?frTab("friends"):frProf(d("data-frfollow")); },frErr); return; }
  if(b.hasAttribute("data-frunf")){ const id=d("data-frunf"); ask("Stop following "+(d("data-name")||"this person")+"? Characters you shared with each other and open copy requests between you are removed. Copies already made stay.","Unfollow",() =>{ frApi("follow/"+id,{method:"DELETE"}).then(() =>{ toast("Unfollowed."); frTab("friends"); },frErr); }); return; }
  if(b.hasAttribute("data-frblock")){ const bid=d("data-frblock"); ask("Block "+(d("data-name")||"this person")+"? You stop following each other, shares and open requests between you are removed, and they cannot find or follow you.","Block",() =>{ frApi("block/"+bid,{method:"POST"}).then(() =>{ toast("Blocked."); frTab("friends"); },frErr); }); return; }
  if(b.hasAttribute("data-frunb")){ frApi("block/"+d("data-frunb"),{method:"DELETE"}).then(() =>{ toast("Unblocked."); frTab("friends"); },frErr); return; }
  if(b.hasAttribute("data-frshare")){ frShareEdit(d("data-frshare"),box); return; }
  if(b.hasAttribute("data-frok")){ const rid=d("data-frok"); ask("Approve? They get their own copy of this character as it is now. Later changes on either side stay separate.","Approve",() =>{ frApi("requests/"+rid+"/approve",{method:"POST"}).then(() =>{ toast("Approved. They have the copy."); frTab("requests"); },frErr); }); return; }
  if(b.hasAttribute("data-frno")){ frApi("requests/"+d("data-frno")+"/decline",{method:"POST"}).then(() =>{ toast("Declined."); frTab("requests"); },frErr); return; }
  if(b.hasAttribute("data-frcancel")){ frApi("requests/"+d("data-frcancel"),{method:"DELETE"}).then(() =>{ frTab("requests"); },frErr); return; }
  if(b.hasAttribute("data-frview")){ const p=d("data-frview").split("/"); frView(p[0],p[1]); return; } }
function frSubmit(e){ const f=e.target; if(!f.getAttribute||!f.getAttribute("data-frform")) return; e.preventDefault(); const k=f.getAttribute("data-frform"), box=FR.w.querySelector(".fr-body");
  if(k==="me"){ frApi("me",{method:"PUT",json:{name:f.name.value,username:f.username.value,bio:f.bio.value}}).then(() =>{ toast("Profile saved."); frTab("profile"); },frErr); return; }
  if(k==="find"){ const q=f.q.value.trim(); if(q) frProf(q,box.querySelector(".fr-found")||box); return; }
  if(k==="share"){ const vis=(f.querySelector("[name=vis]:checked")||{}).value||"private", to=Array.prototype.map.call(f.querySelectorAll("[name=to]:checked"),(x) =>{ return x.value; });
    frApi("chars/"+encodeURIComponent(f.getAttribute("data-id"))+"/meta",{method:"PUT",json:{vis:vis,pin:f.pin.checked,copyOk:f.copyOk.checked,share:vis==="shared"?to:[]}}).then(() =>{ toast("Sharing saved."); frTab("sharing"); },frErr); } }
function frChange(e){ const t=e.target; if(t.name==="vis"){ const p=FR.w.querySelector(".fr-pick"); if(p) p.hidden=t.value!=="shared"; } }

/* read-only view of a friend's character: the sheet shows it, nothing is saved, Close reloads your own */
function frView(owner,id){ frApi("view/"+owner+"/"+encodeURIComponent(id)).then((v) =>{ return syPicIn(owner,id,v.data).then((text) =>{ let e,c2,s2;
    try{ e=JSON.parse(text); c2=JSON.parse(e.C); s2=JSON.parse(e.S||"null")||{}; if(!c2||!c2.abilities) throw 0; }catch(x){ toast("This character could not be read."); return; }
    clearTimeout(saveT); clearTimeout(cSaveT); __set_saveT(null); __set_cSaveT(null); __set_FROZEN("view"); FR.view={owner:owner,id:id,v:v};
    const o=clone(DEF); for(const k in s2) if(Object.prototype.hasOwnProperty.call(s2,k)) o[k]=s2[k]; if(!Array.isArray(o.ds)||o.ds.length!==2) o.ds=[0,0]; ["cond","notes","used"].forEach((k) =>{ if(typeof o[k]!=="object"||!o[k]) o[k]={}; });
    __set_C(c2); __set_S(o); document.documentElement.classList.add("fr-viewing"); if(FR.w){ FR.w.remove(); FR.w=null; } const hv=document.getElementById("homeV"); if(hv) hv.hidden=true; document.body.style.overflow="";
    try{ applyLook(); renderAll(true); renderNotes(); syncPortrait(); }catch(x){}
    const bar=document.createElement("div"); bar.id="frBar"; bar.className="fr-bar"; bar.setAttribute("role","status");
    drawHtml(html`<span><b>${v.name}</b> by ${(v.by||{}).name||"a friend"} · view only, changes are not kept</span>${rawHtml(owner!==(SY.me||{}).id&&v.copyOk?'<button type="button" class="btn press" data-frask="1"'+(v.requested?' disabled':'')+'>'+(v.requested?'Copy requested':'Request a copy')+'</button>':'')}<button type="button" class="btn pri press" data-frclose="1">Close</button>`, bar);
    document.body.appendChild(bar);
    bar.addEventListener("click",(ev) =>{ if(ev.target.closest("[data-frclose]")){ try{ __miReload(); }catch(x){ location.reload(); } return; }
      const a=ev.target.closest("[data-frask]"); if(!a||a.disabled) return; frAsk(owner,id,v.name,a); }); }); },frErr); }
function frAsk(owner,id,name,btn){ const w=document.createElement("div"); w.className="ask fr-askd"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true");
  drawHtml(html`<div class="askb"><p>Ask for your own copy of <b>${name}</b>? The owner decides. If they approve, it appears in your characters.</p><textarea maxlength="140" rows="2" placeholder="Message (optional)"></textarea><div class="askr"><button type="button" class="btn press" data-n="1">Cancel</button><button type="button" class="btn pri press" data-y="1">Send request</button></div></div>`, w);
  document.body.appendChild(w); w.addEventListener("click",(e) =>{ if(e.target===w||e.target.closest("[data-n]")){ w.remove(); return; }
    if(e.target.closest("[data-y]")){ frApi("copy/"+owner+"/"+encodeURIComponent(id),{method:"POST",json:{message:w.querySelector("textarea").value}}).then(() =>{ w.remove(); btn.disabled=true; btn.textContent="Copy requested"; toast("Request sent."); },(er) =>{ w.remove(); frErr(er); }); } }); }

/* Friends button on Home with a small dot for new followers, requests and shares */
function frDots(){ const s=(SY.me||{}).social||{}, any=(s.newFollowers||0)+(s.newRequests||0)+(s.newShares||0)>0;
  document.querySelectorAll(".fr-b .fr-dot").forEach((d) =>{ d.hidden=!any; });
  if(FR.w){ const set=function(k,on){ const d=FR.w.querySelector('[data-dot="'+k+'"]'); if(d) d.hidden=!on; }; set("friends",(s.newFollowers||0)>0); set("requests",(s.newRequests||0)>0); set("shared",(s.newShares||0)>0); } }
function frButton(){ const on=SY.on&&SY.st!=="off", hb=document.querySelector("#homeV .hbtns"); if(!hb) return; let b=hb.querySelector(".fr-b");
  if(!on){ if(b) b.remove(); return; } if(b) return;
  b=document.createElement("button"); b.type="button"; b.className="hbk fr-b"; b.setAttribute("data-friends","1");
  drawHtml(html`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20c.6-3.4 3-5.3 6-5.3s5.4 1.9 6 5.3"/><path d="M16 11h6M19 8v6"/></svg><span class="hbt">Friends</span><i class="fr-dot" hidden></i>`, b);
  const party=hb.querySelector("[data-hparty]"); if(party) party.insertAdjacentElement("afterend",b); else hb.appendChild(b); frDots(); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-friends]"); if(!b) return; e.preventDefault(); frOpen(); });
(function(){ const _icon=syIcon; __set_syIcon(() =>{ _icon(); try{ frButton(); }catch(x){} }); })();
window.__friends=FR; window.__frOpen=frOpen;
/* T11 Learn U12: the Learn funnel for the admin. Totals only, never a list of people (U30) */
function frLearn(a){ const L=a.learn; if(!L||!L.started) return html`<p class="sy-note">Learn: nobody with synced settings has started yet.</p>`;
  const nm={apptour:"App Tour",tavern:"Tavern",rooftops:"Rooftops",forest:"Forest",campsite:"Campsite",market:"Market",forge:"Forge Your Hero",bridge:"Crumbling Bridge"};
  return '<h3 class="set-h">Learn</h3><table class="fr-tab"><tr><th>Stop</th><th>Finished</th><th>Of those who started</th></tr>'+(a.learnStops||[]).map((k) =>{ const n=+L[k]||0; return html`<tr><td>${nm[k]||k}</td><td>${rawHtml(n)}</td><td>${rawHtml(Math.round(n/L.started*100))}%</td></tr>`; }).join("")+'<tr><td>Final check</td><td>'+(+L.quiz||0)+'</td><td>'+Math.round((+L.quiz||0)/L.started*100)+'%</td></tr></table><p class="sy-note">'+L.started+' people opened Learn on a synced account.</p>'; }
