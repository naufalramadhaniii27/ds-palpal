/* M8: copy text with the Clipboard API. When the browser refuses (no permission, not a secure page), the text in the box is selected so the person can copy it by hand, and the answer is false. */
export function copyText(t, el) {
  const pick = () => { if (el) { try { el.focus(); el.select(); } catch (e) { /* hidden or detached box */ } } };
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    return navigator.clipboard.writeText(String(t)).then(() => true, () => { pick(); return false; });
  }
  pick();
  return Promise.resolve(false);
}
