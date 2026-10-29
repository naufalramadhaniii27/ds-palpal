/* G5: the app on Cloudflare Workers (static assets + the same API as the Pages Functions in functions/api).
   /api/* runs the API code (functions/api/[[path]].js, unchanged), everything else is served from the static assets (dist/, made by
   tools/pages_dist.sh). A Cron Trigger runs the daily cycle (trim versions, empty the recycle bin, set the day's mode), which on Pages
   waits for the first request of the day. Deployed with: npx wrangler deploy -c workers/wrangler.jsonc */
import { onRequest, dailyRun } from "../functions/api/[[path]].js";
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      return onRequest({ request, env, params: {}, waitUntil: (p) => ctx.waitUntil(p), passThroughOnException: () => {}, next: () => env.ASSETS.fetch(request), data: {} });
    }
    return env.ASSETS.fetch(request);
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(dailyRun(env)); }
};
