import {env} from "./00-env.js";/* T11 Learn: the app helpers come from window.__app (src/app/45-learn-bridge.js). This module is the only place that reads it. */
export var A=env.__app||{}, esc=A.esc, ico=A.ico, lsGet=A.lsGet, lsSet=A.lsSet, ask=A.ask, libOpen=A.libOpen, buzz=A.buzz;
export function ovQueue(){ if(A.ovQueue) A.ovQueue(); }
export function homeInert(){ if(A.homeInert) A.homeInert(); }
export function showHome(){ if(A.showHome) A.showHome(); }
