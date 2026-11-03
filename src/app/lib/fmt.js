/* M9: numbers and times through Intl. The app text stays English. */
const NF = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const RT = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });
/** A whole number with thousands separators: 12345 gives "12,345". */
export const fmtInt = (n) => NF.format(Math.round(n));
/** How long ago a time was: "just now" under a minute, then "5 min. ago", "2 hr. ago", "yesterday", "3 days ago". */
export function fmtAgo(t) {
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60), h = Math.round(s / 3600), d = Math.round(s / 86400);
  return m < 60 ? RT.format(-m, "minute") : h < 24 ? RT.format(-h, "hour") : RT.format(-d, "day");
}
