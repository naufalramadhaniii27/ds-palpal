#!/usr/bin/env python3
"""API rules for profiles, follow, block, sharing, copy requests, feed, portraits, settings and admin, on a local Pages server with D1.
Three test people (x-dev-user header works only when ACCESS_TEAM is empty).

  wrangler pages dev --port 8788 --binding DEV_USER=a@test.dev --binding ACCESS_TEAM=
  BASE=http://localhost:8788 python3 tests/api_social.py"""
import json, os, sys, time, urllib.request, urllib.error
BASE = os.environ.get("BASE", "http://localhost:8788").rstrip("/")
RES = []
TAG = str(int(time.time()))
A, B, C = "a%s@test.dev" % TAG, "b%s@test.dev" % TAG, "c%s@test.dev" % TAG
def check(n, ok, info=""): RES.append((n, bool(ok))); print(("ok   " if ok else "FAIL ") + n + ("  " + str(info)[:300] if not ok else ""))
def call(who, method, path, body=None, raw=None, headers=None):
    h = {"x-dev-user": who}; h.update(headers or {})
    data = raw.encode() if raw is not None else (json.dumps(body).encode() if body is not None else None)
    rq = urllib.request.Request(BASE + "/api/" + path, data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(rq, timeout=20) as r: return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        try: return e.code, json.loads(e.read() or b"{}")
        except Exception: return e.code, {}
def put_char(who, cid, name, base=0):
    return call(who, "PUT", "chars/%s?base=%d" % (cid, base), raw=json.dumps({"name": name, "C": "{}"}), headers={"x-name": name, "x-sum": "%7B%22lv%22%3A3%7D"})

st, a = call(A, "GET", "me"); st, b = call(B, "GET", "me"); st, c = call(C, "GET", "me")
check("me gives a friend code", a.get("code") and "-" in a["code"], a)
check("first person is admin only once", call(B, "GET", "admin")[0] == 404)
st, x = call(A, "PUT", "me", {"username": "ann" + TAG[-6:], "bio": "Hi", "name": "Ann"})
check("set username", st == 200 and x["username"] == "ann" + TAG[-6:], x)
check("username taken", call(B, "PUT", "me", {"username": "ann" + TAG[-6:]})[0] == 409)
check("bad username", call(B, "PUT", "me", {"username": "a b"})[0] == 400)
st, p = call(B, "GET", "users/" + a["code"])
check("find by code", st == 200 and p["user"]["name"] == "Ann" and not p["rel"]["mutual"] and p["chars"] == [], p)
check("find by @username", call(B, "GET", "users/@ann" + TAG[-6:])[0] == 200)
put_char(A, "ca1", "Aria"); put_char(A, "ca2", "Bran"); put_char(A, "ca3", "Cleo")
call(A, "PUT", "chars/ca1/meta", {"vis": "profile", "pin": True}); call(A, "PUT", "chars/ca2/meta", {"vis": "profile"})
# one-way follow: nothing visible yet
call(B, "POST", "follow/" + a["id"])
st, p = call(B, "GET", "users/" + a["id"])
check("one-way follow shows no grid", p["rel"]["following"] and not p["rel"]["mutual"] and p["chars"] == [], p["rel"])
check("view blocked without mutual", call(B, "GET", "view/%s/ca1" % a["id"])[0] == 404)
check("share to a non-mutual is ignored", call(A, "PUT", "chars/ca3/meta", {"vis": "shared", "share": [b["id"]]})[0] == 200 and call(A, "GET", "chars/ca3/meta")[1]["share"] == [])
call(A, "POST", "follow/" + b["id"])
st, p = call(B, "GET", "users/" + a["id"])
check("mutual: grid with profile characters, pinned first", p["rel"]["mutual"] and [x["name"] for x in p["chars"]] == ["Aria", "Bran"], p)
st, v = call(B, "GET", "view/%s/ca1" % a["id"])
check("mutual: read-only view", st == 200 and v["name"] == "Aria" and v["by"]["name"] == "Ann", v)
check("private character stays hidden", call(B, "GET", "view/%s/ca3" % a["id"])[0] == 404)
call(A, "PUT", "chars/ca3/meta", {"vis": "shared", "share": [b["id"]]})
check("shared with B", call(B, "GET", "view/%s/ca3" % a["id"])[0] == 200 and any(x["id"] == "ca3" for x in call(B, "GET", "shared")[1]["chars"]))
call(A, "POST", "follow/" + c["id"]); call(C, "POST", "follow/" + a["id"])
check("shared only with B, not C", call(C, "GET", "view/%s/ca3" % a["id"])[0] == 404 and call(C, "GET", "view/%s/ca1" % a["id"])[0] == 200)
st, f = call(B, "GET", "feed")
check("feed lists what B may see", sorted(x["name"] for x in f["chars"]) == ["Aria", "Bran", "Cleo"], f)
# portraits
pic = "data:image/jpeg;base64," + "A" * 2000
check("portrait upload", call(A, "PUT", "pic/ca1?h=h1", raw=pic)[0] == 200)
st, pp = call(B, "GET", "pic/%s/ca1" % a["id"])
check("friend sees portrait", st == 200 and pp["data"] == pic and pp["h"] == "h1")
check("portrait of private character hidden", call(A, "PUT", "pic/ca2?h=h2", raw=pic)[0] == 200 and call(C, "GET", "pic/%s/ca3" % a["id"])[0] == 404)
check("not an image is refused", call(A, "PUT", "pic/ca1?h=x", raw="hello")[0] == 400)
# copy requests
st, r = call(B, "POST", "copy/%s/ca1" % a["id"], {"message": "Can I play this one?"})
check("request a copy", st == 200, r)
check("one open request per character", call(B, "POST", "copy/%s/ca1" % a["id"], {})[0] == 409)
call(A, "PUT", "chars/ca2/meta", {"copyOk": False})
check("copy turned off", call(B, "POST", "copy/%s/ca2" % a["id"], {})[1].get("error") == "copy-off")
st, fr = call(A, "GET", "friends")
inc = [x for x in fr["requestsIn"] if x["from"]["id"] == b["id"]]
check("owner sees the request", len(inc) == 1 and inc[0]["message"] == "Can I play this one?" and inc[0]["charName"] == "Aria", fr["requestsIn"])
check("only the owner approves", call(B, "POST", "requests/%s/approve" % r["id"])[0] == 404)
st, ap = call(A, "POST", "requests/%s/approve" % r["id"])
check("approve makes a copy for B", st == 200 and ap.get("id"), ap)
st, bl = call(B, "GET", "chars")
cp = [x for x in bl["chars"] if x["id"] == ap.get("id")]
check("B has the copy, private, marked copied from Ann", cp and cp[0]["vis"] == "private" and cp[0]["fromUser"] == "Ann" and cp[0]["name"] == "Aria", bl)
check("copy brings the portrait", call(B, "GET", "pic/%s/%s" % (b["id"], ap.get("id")))[1].get("h") == "h1")
st, r2 = call(C, "POST", "copy/%s/ca1" % a["id"], {})
call(A, "POST", "requests/%s/decline" % r2["id"])
check("decline", [x["status"] for x in call(C, "GET", "friends")[1]["requestsOut"] if x["id"] == r2["id"]] == ["declined"])
# unfollow removes shares and open requests
st, r3 = call(B, "POST", "copy/%s/ca3" % a["id"], {})
call(A, "DELETE", "follow/" + b["id"])
check("unfollow: share gone", call(B, "GET", "view/%s/ca3" % a["id"])[0] == 404 and call(A, "GET", "chars/ca3/meta")[1]["share"] == [])
check("unfollow: open request cancelled", [x["status"] for x in call(B, "GET", "friends")[1]["requestsOut"] if x["id"] == r3["id"]] == ["cancelled"])
# block
call(C, "POST", "block/" + a["id"])
check("block: no profile, no view", call(C, "GET", "users/" + a["id"])[0] == 404 and call(A, "GET", "users/" + c["id"])[0] == 404)
check("block: cannot follow back", call(A, "POST", "follow/" + c["id"])[0] == 404)
call(C, "DELETE", "block/" + a["id"])
check("unblock: profile visible again, follows stay removed", call(A, "GET", "users/" + c["id"])[0] == 200 and not call(A, "GET", "users/" + c["id"])[1]["rel"]["following"])
# settings
check("prefs save", call(A, "PUT", "prefs?t=100", raw='{"mi-snd":"off"}')[0] == 200)
check("older prefs do not overwrite", call(A, "PUT", "prefs?t=50", raw='{"mi-snd":"on"}')[0] == 200 and call(A, "GET", "prefs")[1]["data"] == '{"mi-snd":"off"}')
# dots
st, me = call(A, "GET", "me")
check("me counts", me["social"]["followers"] >= 0 and "requests" in me["social"], me)
print("%d checks, %d failed" % (len(RES), len([r for r in RES if not r[1]])))
sys.exit(1 if any(not r[1] for r in RES) else 0)
