(function(){
"use strict";
/* T11 Learn: one closure for 45 to 47. The app helpers come from window.__app (src/app/45-learn-bridge.js) */
var A=window.__app||{}, esc=A.esc, ico=A.ico, lsGet=A.lsGet, lsSet=A.lsSet, ask=A.ask, libOpen=A.libOpen, buzz=A.buzz;
function ovQueue(){ if(A.ovQueue) A.ovQueue(); }
function homeInert(){ if(A.homeInert) A.homeInert(); }
function showHome(){ if(A.showHome) A.showHome(); }
